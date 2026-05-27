import { ActivityEntry, Category, FeedMessage, Moderator, QueueMessage, VolumePoint } from '../models/sentinel.models';

export const CATEGORIES: Category[] = [
  { id: 'spam',      name: 'Promotional Spam',       color: '#6C63FF', count: 8420 },
  { id: 'hate',      name: 'Hate Speech',             color: '#FF4D6D', count: 1247 },
  { id: 'scam',      name: 'Phishing / Fraud',        color: '#FF4D6D', count: 982  },
  { id: 'political', name: 'Political Sensitivity',   color: '#FFB703', count: 643  },
  { id: 'violence',  name: 'Violent Threats',         color: '#FF4D6D', count: 412  },
  { id: 'sectarian', name: 'Sectarian Content',       color: '#FF4D6D', count: 318  },
  { id: 'adult',     name: 'Adult Content',           color: '#FFB703', count: 267  },
  { id: 'drugs',     name: 'Illicit Substances',      color: '#FF4D6D', count: 194  },
  { id: 'harass',    name: 'Harassment',              color: '#FFB703', count: 156  },
  { id: 'misinfo',   name: 'Health Misinformation',   color: '#FFB703', count: 89   },
];

export const SEV: Record<string, 'danger' | 'amber'> = {
  spam: 'amber', hate: 'danger', scam: 'danger', political: 'amber',
  violence: 'danger', sectarian: 'danger', adult: 'amber', drugs: 'danger',
  harass: 'amber', misinfo: 'amber',
};

export const MODERATORS: Moderator[] = [
  { id: 'rh', initials: 'RH', name: 'Rasha Haddad',   role: 'Senior Moderator' },
  { id: 'kn', initials: 'KN', name: 'Khaled Nasser',  role: 'Moderator' },
  { id: 'ma', initials: 'MA', name: 'Mona Al-Sayed',  role: 'Moderator' },
  { id: 'yt', initials: 'YT', name: 'Yousef Tarek',   role: 'Lead Reviewer' },
  { id: 'lz', initials: 'LZ', name: 'Layla Zaher',    role: 'Moderator' },
];

export const CURRENT_USER = { initials: 'RH', name: 'Rasha Haddad', role: 'Senior Moderator · Tier 2' };

const SAMPLE_MESSAGES = [
  { cats: [['hate', 0.91], ['sectarian', 0.74]] as [string, number][],
    ar: 'احنا لازم نوقف هدول الـ▓▓▓ قبل ما يخرّبوا البلد، كلّن نفس الشي',
    en: 'We have to stop these ▓▓▓ before they ruin the country, all of them are the same',
    ar_expl: 'تصنّف الرسالة كخطاب كراهية موجّه ضد فئة دينية، مع تعميمات سلبية وتحريض ضمني.',
    en_expl: 'Classified as hate speech targeting a religious group, with generalising language and implicit incitement.' },
  { cats: [['scam', 0.97]] as [string, number][],
    ar: 'تهانينا! ربحت 5,000,000 ليرة. اضغط الرابط لاستلام الجائزة: bit.ly/syr-▓▓',
    en: "Congratulations! You've won 5,000,000 SYP. Click the link to claim your prize: bit.ly/syr-▓▓",
    ar_expl: 'نمط احتيالي كلاسيكي: ادعاء جائزة + رابط مختصر + إلحاح. تطابق عالٍ مع قاعدة بيانات روابط التصيّد.',
    en_expl: 'Classic phishing pattern: prize claim + short URL + urgency. High match against known phishing URL database.' },
  { cats: [['political', 0.82], ['misinfo', 0.55]] as [string, number][],
    ar: 'الحكومة بتخبّي الحقيقة عن أحداث ▓▓▓ بس نحنا منعرف الواقع',
    en: 'The government is hiding the truth about ▓▓▓ events, but we know the reality',
    ar_expl: 'محتوى سياسي حسّاس مع ادّعاءات غير موثّقة. يُرجّى المراجعة وفق سياسة الحياد.',
    en_expl: 'Politically sensitive content with unverified claims. Please review under neutrality policy.' },
  { cats: [['violence', 0.88]] as [string, number][],
    ar: 'والله رح ▓▓▓▓ إذا شفته مرّة تانية، ما عاد في صبر',
    en: "I swear I'll ▓▓▓▓ him if I see him again, I've lost patience",
    ar_expl: 'تهديد مباشر بالعنف ضدّ فرد محدّد. مطابقة قوية لنمط النوايا العنيفة.',
    en_expl: 'Direct violent threat against a specific individual. Strong match for violent-intent pattern.' },
  { cats: [['spam', 0.79]] as [string, number][],
    ar: 'عرض حصري! خصم 50٪ على كل المنتجات لليوم فقط — اطلب الآن: shop.▓▓▓.sy',
    en: 'Exclusive offer! 50% off on all products today only — order now: shop.▓▓▓.sy',
    ar_expl: 'إعلان تجاري غير مصرّح به من جهة غير مسجّلة لدى الهيئة. لا يحتوي محتوى ضار.',
    en_expl: 'Unsolicited commercial promotion from unregistered sender. No harmful content detected.' },
  { cats: [['harass', 0.71]] as [string, number][],
    ar: 'ليش ما عم ترد؟ ما رح أتركك بحالك حتى ترد عليّ',
    en: "Why aren't you replying? I won't leave you alone until you respond to me",
    ar_expl: 'نمط مضايقة محتمل ضمن سلسلة رسائل متكررة لنفس الرقم. يستحق المراجعة اليدوية.',
    en_expl: 'Possible harassment pattern within a repeated thread to the same number. Warrants manual review.' },
  { cats: [['drugs', 0.84]] as [string, number][],
    ar: 'عندي بضاعة جديدة — تواصل خاص للجادين فقط',
    en: 'I have new goods — private contact for serious buyers only',
    ar_expl: 'صياغة مبهمة شائعة في الإعلان عن مواد ممنوعة. يلزم تحقق سياقي.',
    en_expl: 'Vague phrasing common in illicit substance ads. Contextual verification needed.' },
  { cats: [['misinfo', 0.66]] as [string, number][],
    ar: 'اشرب ▓▓▓ على الريق كل يوم وبتشفى من السكري نهائياً — أكدت دراسة',
    en: "Drink ▓▓▓ on an empty stomach every day and you'll be permanently cured of diabetes — a study confirmed",
    ar_expl: 'ادّعاء صحّي لا أساس له. لا يوجد مرجع علمي مطابق.',
    en_expl: 'Unfounded health claim. No matching scientific reference.' },
  { cats: [['spam', 0.62]] as [string, number][],
    ar: 'احصل على قرض فوري بدون فوائد — اتصل بنا الآن على ▓▓▓',
    en: 'Get an instant interest-free loan — call us now on ▓▓▓',
    ar_expl: 'إعلان مالي مشبوه. الجهة المرسلة غير مرخّصة من المصرف المركزي.',
    en_expl: 'Suspicious financial advertisement. Sender not licensed by the Central Bank.' },
  { cats: [['adult', 0.76]] as [string, number][],
    ar: 'صور خاصة جداً تواصل خاص رقم ▓▓▓',
    en: 'Very private photos, private contact at ▓▓▓',
    ar_expl: 'محتوى ذو إيحاءات غير لائقة. يطابق نمط الترويج للمحتوى البالغ.',
    en_expl: 'Suggestive content. Matches adult-content promotion pattern.' },
];

export function genQueue(n = 14): QueueMessage[] {
  const out: QueueMessage[] = [];
  const baseTs = Date.now() - 30 * 60 * 1000;
  for (let i = 0; i < n; i++) {
    const s = SAMPLE_MESSAGES[i % SAMPLE_MESSAGES.length];
    out.push({
      id: `MSG-${(421 + i).toString().padStart(5, '0')}`,
      ts: baseTs + i * 90000 + Math.floor(Math.random() * 60000),
      sender: `+963 9${Math.floor(10 + Math.random() * 89)} ${Math.floor(100 + Math.random() * 899)} ${Math.floor(100 + Math.random() * 899)}`,
      recipient: `+963 9${Math.floor(10 + Math.random() * 89)} ${Math.floor(100 + Math.random() * 899)} ${Math.floor(100 + Math.random() * 899)}`,
      cats: s.cats,
      ar: s.ar, en: s.en, ar_expl: s.ar_expl, en_expl: s.en_expl,
      conf: s.cats[0][1],
      status: 'pending',
    });
  }
  return out;
}

export const RECENT_ACTIVITY: ActivityEntry[] = [
  { who: 'RH', name: 'Rasha Haddad',  act: 'blocked',   cat: 'Hate Speech',           msg: 'احنا لازم نوقف هدول الـ▓▓▓ قبل ما يخرّبوا', t: '12s ago' },
  { who: 'KN', name: 'Khaled Nasser', act: 'approved',  cat: 'Promotional Spam',      msg: 'عرض حصري! خصم 50٪ على كل المنتجات',      t: '47s ago' },
  { who: 'RH', name: 'Rasha Haddad',  act: 'blocked',   cat: 'Phishing',              msg: 'ربحت 5,000,000 ليرة، اضغط الرابط',         t: '1m ago'  },
  { who: 'MA', name: 'Mona Al-Sayed', act: 'escalated', cat: 'Political Sensitivity', msg: 'الحكومة بتخبّي الحقيقة عن أحداث',         t: '2m ago'  },
  { who: 'YT', name: 'Yousef Tarek',  act: 'blocked',   cat: 'Violent Threats',       msg: 'والله رح ▓▓▓▓ إذا شفته مرّة تانية',       t: '3m ago'  },
  { who: 'KN', name: 'Khaled Nasser', act: 'approved',  cat: 'Promotional',           msg: 'تخفيضات على الإلكترونيات لفترة محدودة',    t: '4m ago'  },
  { who: 'LZ', name: 'Layla Zaher',   act: 'blocked',   cat: 'Harassment',            msg: 'ليش ما عم ترد؟ ما رح أتركك بحالك',        t: '6m ago'  },
  { who: 'RH', name: 'Rasha Haddad',  act: 'approved',  cat: 'Customer Service',      msg: 'شكراً لاستخدامكم خدمة سيرياتيل',           t: '8m ago'  },
  { who: 'YT', name: 'Yousef Tarek',  act: 'blocked',   cat: 'Phishing',              msg: 'حسابك معلّق — حدّث بياناتك على الرابط',    t: '11m ago' },
  { who: 'MA', name: 'Mona Al-Sayed', act: 'approved',  cat: 'Personal',              msg: 'كيف الحال؟ متى رح نلتقي؟',                 t: '13m ago' },
  { who: 'RH', name: 'Rasha Haddad',  act: 'blocked',   cat: 'Drugs',                 msg: 'عندي بضاعة جديدة — تواصل خاص',            t: '15m ago' },
  { who: 'KN', name: 'Khaled Nasser', act: 'escalated', cat: 'Sectarian',             msg: 'محتوى يحرّض على فئة دينية',               t: '18m ago' },
  { who: 'LZ', name: 'Layla Zaher',   act: 'approved',  cat: 'Spam (low risk)',       msg: 'عرض على باقات الإنترنت من سيرياتيل',        t: '22m ago' },
  { who: 'RH', name: 'Rasha Haddad',  act: 'blocked',   cat: 'Misinformation',        msg: 'علاج فوري للسكري — اشرب يومياً',           t: '25m ago' },
  { who: 'YT', name: 'Yousef Tarek',  act: 'approved',  cat: 'Personal',              msg: 'تهانينا بمناسبة العيد',                    t: '28m ago' },
];

export function genVolume24h(): VolumePoint[] {
  const pts: VolumePoint[] = [];
  for (let i = 23; i >= 0; i--) {
    const h = (new Date().getHours() - i + 24) % 24;
    const dayFactor = 0.3 + 0.7 * Math.sin(((h - 4) / 24) * Math.PI);
    const safe = Math.max(2000, Math.floor(45000 * dayFactor + (Math.random() - 0.5) * 8000));
    const flagged = Math.max(50, Math.floor(safe * (0.014 + Math.random() * 0.01)));
    pts.push({ label: `${h.toString().padStart(2, '0')}:00`, safe, flagged });
  }
  return pts;
}

export function genVolume7d(): VolumePoint[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date().getDay();
  return Array.from({ length: 7 }, (_, i) => {
    const idx = (today - (6 - i) + 7) % 7;
    const base = 900000 + Math.floor(Math.random() * 250000);
    return { label: days[idx], safe: base, flagged: Math.floor(base * (0.014 + Math.random() * 0.008)) };
  });
}

export function genVolume30d(): VolumePoint[] {
  return Array.from({ length: 30 }, (_, i) => {
    const base = 850000 + Math.floor(Math.random() * 350000);
    return { label: `D-${29 - i}`, safe: base, flagged: Math.floor(base * (0.013 + Math.random() * 0.009)) };
  });
}

export function genVolume1h(): VolumePoint[] {
  return Array.from({ length: 12 }, (_, i) => {
    const m = new Date().getMinutes() - (11 - i) * 5;
    const safe = 3200 + Math.floor(Math.random() * 1200);
    return { label: `${((60 + m) % 60)}m`, safe, flagged: Math.floor(safe * (0.02 + Math.random() * 0.01)) };
  });
}

const SAFE_AR = [
  'موعد طبيب الأسنان غدا الساعة العاشرة صباحاً',
  'وصلت البضاعة، تعال خذها من المستودع',
  'كل عام وأنتم بخير بمناسبة العيد',
  'رمز التحقق من سيرياتيل: 8472',
  'تم تجديد باقتك بنجاح. شكراً لاستخدامك سيرياتيل',
  'كيف الحال؟ ان شاء الله بخير',
  'ما رح اقدر اجي اليوم، عندي شغل',
  'تذكير: اجتماع الفريق غداً 9:00 صباحاً',
  'وصلت الطلبية بسلامة، شكراً جزيلاً',
  'اشتقتلك يا حبيبي، تصبح على خير',
  'رصيدك الحالي 3,200 ل.س',
  'تم استلام دفعتك بنجاح',
];

const FLAGGED_FEED = SAMPLE_MESSAGES.map(m => ({ text: m.ar, cat: m.cats[0][0], conf: m.cats[0][1] }));

export function makeFeedMessage(id: number): FeedMessage {
  const isFlagged = Math.random() < 0.06;
  if (isFlagged) {
    const f = FLAGGED_FEED[Math.floor(Math.random() * FLAGGED_FEED.length)];
    const wasBlocked = Math.random() < 0.4;
    const cat = CATEGORIES.find(c => c.id === f.cat);
    return { id: `MSG-${id.toString().padStart(5, '0')}`, status: wasBlocked ? 'blocked' : 'flagged',
      text: f.text, cat: cat?.name || 'Flagged', catKey: f.cat, conf: f.conf,
      lat: 8 + Math.floor(Math.random() * 18), ts: new Date() };
  }
  return { id: `MSG-${id.toString().padStart(5, '0')}`, status: 'safe',
    text: SAFE_AR[Math.floor(Math.random() * SAFE_AR.length)], cat: null, catKey: null, conf: null,
    lat: 6 + Math.floor(Math.random() * 14), ts: new Date() };
}

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find(c => c.id === id);
}

export function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return s + 's ago';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  return Math.floor(s / 3600) + 'h ago';
}

export function formatTs(d: Date): string {
  return d.toTimeString().slice(0, 8);
}

export const AUDIT_ENTRIES = [
  { t: '16:42:18', who: 'RH', act: 'BLOCK',    id: 'MSG-00423', cat: 'Hate Speech',      reason: 'Sectarian targeting confirmed', ip: '10.42.18.7' },
  { t: '16:41:55', who: 'KN', act: 'APPROVE',  id: 'MSG-00422', cat: 'Promotional Spam', reason: 'Low risk, registered sender',   ip: '10.42.18.12' },
  { t: '16:41:32', who: 'RH', act: 'BLOCK',    id: 'MSG-00421', cat: 'Phishing',         reason: 'Known scam URL pattern',        ip: '10.42.18.7' },
  { t: '16:40:48', who: 'MA', act: 'ESCALATE', id: 'MSG-00420', cat: 'Political',        reason: 'Requires senior review',        ip: '10.42.18.9' },
  { t: '16:40:11', who: 'YT', act: 'BLOCK',    id: 'MSG-00419', cat: 'Violent Threats',  reason: 'Direct threat to individual',   ip: '10.42.18.4' },
  { t: '16:39:50', who: 'RH', act: 'APPROVE',  id: 'MSG-00418', cat: 'Customer Svc',     reason: 'Standard service reply',        ip: '10.42.18.7' },
  { t: '16:39:22', who: 'LZ', act: 'BLOCK',    id: 'MSG-00417', cat: 'Harassment',       reason: 'Repeated unsolicited contact',  ip: '10.42.18.18' },
  { t: '16:38:55', who: 'KN', act: 'APPROVE',  id: 'MSG-00416', cat: 'Promotional',      reason: 'Approved commercial sender',    ip: '10.42.18.12' },
  { t: '16:38:12', who: 'MA', act: 'BLOCK',    id: 'MSG-00415', cat: 'Drugs',            reason: 'Illicit substance promotion',   ip: '10.42.18.9' },
  { t: '16:37:48', who: 'YT', act: 'BLOCK',    id: 'MSG-00414', cat: 'Misinformation',   reason: 'Health claim unsubstantiated',  ip: '10.42.18.4' },
];

export const MOD_PERFORMANCE = [
  { name: 'Rasha Haddad',  who: 'RH', reviewed: 1247, accuracy: 98, avg: '14s', on: true  },
  { name: 'Khaled Nasser', who: 'KN', reviewed: 982,  accuracy: 96, avg: '18s', on: true  },
  { name: 'Mona Al-Sayed', who: 'MA', reviewed: 891,  accuracy: 97, avg: '16s', on: true  },
  { name: 'Yousef Tarek',  who: 'YT', reviewed: 756,  accuracy: 99, avg: '12s', on: true  },
  { name: 'Layla Zaher',   who: 'LZ', reviewed: 612,  accuracy: 95, avg: '22s', on: false },
];
