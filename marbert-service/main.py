import time
from fastapi import FastAPI
from schemas import InferRequest, InferResponse
from model import MARBERTModel
from preprocess import preprocess

app = FastAPI(title='MARBERT Inference Service')


@app.on_event('startup')
def load_model():
    # Warm up at startup — not on first request
    MARBERTModel.get()


@app.post('/infer', response_model=InferResponse)
def infer(req: InferRequest):
    start = time.perf_counter()
    clean_text = preprocess(req.text)
    scores = MARBERTModel.get().infer(clean_text)
    latency = round((time.perf_counter() - start) * 1000, 2)
    return InferResponse(
        message_id=req.message_id,
        scores=scores,
        latency_ms=latency,
        preprocessed_text=clean_text
    )


@app.get('/health')
def health():
    import torch
    return {
        'status': 'ok',
        'device': str(MARBERTModel.get().device),
        'cuda_available': torch.cuda.is_available(),
    }
