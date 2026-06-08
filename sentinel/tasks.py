import httpx
from celery import chain
from config.celery import app

INFER_URL   = 'http://localhost:8001/infer'
EXPLAIN_URL = 'http://10.215.181.1:8003/v1/chat/completions'  # teammate's AceGPT (llama.cpp)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def get_thresholds() -> dict:
    import redis, json
    r = redis.Redis(host='localhost', port=6379, db=2, decode_responses=True)
    cached = r.get('thresholds')
    if cached:
        return json.loads(cached)
    from sentinel.models import CategoryThreshold
    thresholds = {t.category_id: t.threshold for t in CategoryThreshold.objects.all()}
    r.setex('thresholds', 60, json.dumps(thresholds))
    return thresholds


# ---------------------------------------------------------------------------
# Pipeline tasks
# ---------------------------------------------------------------------------

@app.task(bind=True, max_retries=3, default_retry_delay=5)
def ingest(self, payload: dict):
    for field in ['message_id', 'sender', 'body', 'timestamp']:
        if field not in payload:
            raise ValueError(f'Missing field: {field}')
    return payload


@app.task(bind=True, max_retries=3, default_retry_delay=2)
def call_infer(self, payload: dict):
    try:
        resp = httpx.post(INFER_URL, json={
            'message_id': payload['message_id'],
            'text': payload['body'],
        }, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        payload['scores'] = data['scores']
        payload['preprocessed_text'] = data['preprocessed_text']
        payload['infer_latency_ms'] = data['latency_ms']
        return payload
    except Exception as exc:
        raise self.retry(exc=exc)


@app.task
def threshold_check(payload: dict):
    thresholds = get_thresholds()
    flagged = [
        (cat, score)
        for cat, score in payload['scores'].items()
        if score >= thresholds.get(cat, 0.5)
    ]
    flagged.sort(key=lambda x: x[1], reverse=True)
    payload['flagged_cats'] = flagged
    payload['is_flagged'] = len(flagged) > 0
    return payload


CATEGORY_NAMES_AR = {
    'spam': 'البريد المزعج',
    'hate': 'خطاب الكراهية',
    'scam': 'الاحتيال والتصيد',
    'political': 'الحساسية السياسية',
    'violence': 'المحتوى العنيف',
    'sectarian': 'الإساءة الدينية',
    'adult': 'المحتوى الجنسي',
    'drugs': 'المخدرات',
    'harass': 'التشهير',
    'misinfo': 'أنماط الرسائل المزعجة',
}


@app.task(bind=True, max_retries=2, default_retry_delay=5)
def call_explain(self, payload: dict):
    if not payload['is_flagged']:
        payload['ar_expl'] = ''
        payload['en_expl'] = ''
        return payload
    try:
        top_cats = [c[0] for c in payload['flagged_cats'][:3]]
        cats_ar = '، '.join(CATEGORY_NAMES_AR.get(c, c) for c in top_cats)

        resp = httpx.post(EXPLAIN_URL, json={
            'model': 'acegpt',
            'messages': [
                {
                    'role': 'system',
                    'content': 'أنت محلل محتوى متخصص في مراجعة الرسائل النصية للاتصالات. مهمتك شرح سبب تصنيف الرسائل بناءً على الفئات المحددة. أجب فقط بالصيغة المطلوبة دون أي مقدمات.'
                },
                {
                    'role': 'user',
                    'content': (
                        f'الرسالة: "{payload["body"]}"\n'
                        f'الفئات المكتشفة: {cats_ar}\n\n'
                        'اشرح سبب تصنيف هذه الرسالة ضمن هذه الفئات في جملتين بالعربية وجملتين بالإنجليزية.\n'
                        'AR:\nEN:'
                    )
                }
            ],
            'max_tokens': 500,
            'temperature': 0.2,
            'stop': ['<|im_end|>'],
        }, timeout=120)
        resp.raise_for_status()

        raw = resp.json()
        print('ACEGPT RAW:', raw['choices'][0]['message']['content'][:200])
        content = raw['choices'][0]['message']['content']
        ar_expl, en_expl = '', ''
        for line in content.splitlines():
            if line.startswith('AR:'):
                ar_expl = line[3:].strip()
            elif line.startswith('EN:'):
                en_expl = line[3:].strip()

        # Fallback: model responded but ignored AR:/EN: format
        # Take the whole content as Arabic explanation
        if not ar_expl and content.strip():
            ar_expl = content.strip()

        payload['ar_expl'] = ar_expl
        payload['en_expl'] = en_expl
    except Exception as e:
        # Non-fatal — save without explanation, show "AI unavailable" in UI
        print(f'ACEGPT ERROR: {type(e).__name__}: {e}')
        payload['ar_expl'] = ''
        payload['en_expl'] = ''
    return payload


@app.task
def write_to_db(payload: dict):
    from django.utils import timezone
    from sentinel.models import Message, ModerationDecision

    msg = Message.objects.create(
        external_id=payload['message_id'],
        sender=payload['sender'],
        recipient=payload.get('recipient'),
        body=payload['body'],
        preprocessed_body=payload.get('preprocessed_text', ''),
        timestamp=payload['timestamp'],
    )
    ModerationDecision.objects.create(
        message=msg,
        is_flagged=payload['is_flagged'],
        category_scores=payload['scores'],
        flagged_categories=payload['flagged_cats'],
        ar_expl=payload.get('ar_expl', ''),
        en_expl=payload.get('en_expl', ''),
        status='pending' if payload['is_flagged'] else 'safe',
        infer_latency_ms=payload.get('infer_latency_ms'),
    )

    # Push to live feed WebSocket
    try:
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        layer = get_channel_layer()
        async_to_sync(layer.group_send)('feed', {
            'type': 'feed.message',
            'payload': {
                'id':     payload['message_id'],
                'status': 'flagged' if payload['is_flagged'] else 'safe',
                'text':   payload['body'],
                'cat':    payload['flagged_cats'][0][0] if payload['flagged_cats'] else None,
                'conf':   payload['flagged_cats'][0][1] if payload['flagged_cats'] else None,
                'lat':    payload.get('infer_latency_ms'),
                'ts':     timezone.now().isoformat(),
            }
        })
    except Exception as e:
        print(f'WS push failed: {e}')

    return msg.id


# ---------------------------------------------------------------------------
# Entry point — call this to kick off the pipeline
# ---------------------------------------------------------------------------

def dispatch(sms_payload: dict):
    pipeline = chain(
        ingest.s(sms_payload),
        call_infer.s(),
        threshold_check.s(),
        call_explain.s(),
        write_to_db.s(),
    )
    pipeline.apply_async()
