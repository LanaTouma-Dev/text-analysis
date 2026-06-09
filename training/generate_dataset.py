"""
generate_dataset.py

Reads per-category CSV files (text, category, is_obfuscated)
and produces a unified training dataset CSV with multi-hot labels.

Usage:
    python generate_dataset.py --input_dir "C:/Users/Legion/Downloads/Telegram Desktop" --output dataset.csv
"""

import csv
import argparse
import os
import glob

CATEGORIES = ['spam', 'hate', 'scam', 'political', 'violence',
              'sectarian', 'adult', 'drugs', 'harass', 'misinfo']

SAFE_MESSAGES = [
    "كيفك؟ وين عم تكون هلق؟",
    "رح وصلك الطلب بكرا الصبح إن شاء الله",
    "الاجتماع الساعة 3 عند المدير، لا تتأخر",
    "ممكن تجيب معك خبز لما ترجع؟",
    "تمام، شفت الرسالة، رح كون هناك",
    "عيد ميلاد سعيد! كل عام وأنت بخير",
    "الدوام اليوم من الساعة 8 للساعة 4",
    "وين حطيت مفاتيح السيارة؟",
    "الأكل جاهز لما تجي",
    "تمام استلمت، شكراً كتير",
    "رح نتأخر شوي، ابدؤوا بدوننا",
    "هل حجزت الفندق؟ محتاج التفاصيل",
    "الطقس اليوم حلو، فكرة نطلع نتمشى؟",
    "باجتماع الساعة 2، حضور إلزامي",
    "صار معي حادث بسيط بالسيارة، كلنا بخير",
    "الحساب الشهري: 45,000 ليرة",
    "تذاكر الرحلة وصلت على الإيميل",
    "مبروك التخرج! فخورين فيك",
    "الإنترنت عم يقطع عندك؟ عندنا نفس المشكلة",
    "رح اشتري الدواء من الصيدلية هلق",
    "الولد وصل المدرسة بخير",
    "موعد الطبيب الأربعاء الساعة 11",
    "ممكن تحكيلي وين صيدلية قريبة؟",
    "الكهرباء قطعت عندكم؟",
    "تمام، شفنا الفيلم وكان حلو كتير",
    "رح يكون في دوام غداً؟",
    "الباص تأخر ساعة كاملة اليوم",
    "ممكن تبعتلي رقم الطبيب؟",
    "صور الرحلة وصلوني، شكراً",
    "الصف بكرا من الساعة 9 للساعة 12",
    "تمام، الاتفاق صار",
    "مرحبا، كيف أقدر أساعدك؟",
    "رح يكون في اجتماع غداً الساعة 10",
    "الراتب تحول على الحساب",
    "شكراً على مساعدتك امبارح",
    "وصلت على مشارف المدينة",
    "ممكن تنتظرني 10 دقائق؟",
    "العرض التقديمي جاهز",
    "تمام فهمت، رح أتصرف",
    "الجلسة القادمة الخميس",
    "كل شي ماشي تمام، لا تقلق",
    "اشتريت الهدية، شو رأيك؟",
    "موعد التسليم الأحد القادم",
    "الطلب وصلك؟",
    "الفاتورة مدفوعة",
    "رح أكون عندك بعد ربع ساعة",
    "أنا في الطريق",
    "تمام، شفت التقرير",
    "وين مكتب الاستعلامات؟",
    "رح يكون في دوام بكرا؟",
]


def load_category_csv(filepath: str) -> list[dict]:
    """Load a single category CSV (text, category, is_obfuscated)."""
    rows = []
    with open(filepath, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            text = row.get('text', '').strip().strip('"')
            category = row.get('category', '').strip()
            if text and category and category in CATEGORIES:
                rows.append({'text': text, 'category': category})
    return rows


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input_dir', default=r'C:\Users\Legion\Downloads\Telegram Desktop',
                        help='Directory containing category CSV files')
    parser.add_argument('--output', default='dataset.csv',
                        help='Output CSV file path')
    args = parser.parse_args()

    # Collect all rows grouped by category
    category_texts: dict[str, list[str]] = {cat: [] for cat in CATEGORIES}

    csv_files = glob.glob(os.path.join(args.input_dir, '*.csv'))
    print(f"Found {len(csv_files)} CSV files\n")

    for filepath in sorted(csv_files):
        rows = load_category_csv(filepath)
        if not rows:
            continue
        cat = rows[0]['category']
        texts = [r['text'] for r in rows]
        category_texts[cat].extend(texts)
        print(f"  {os.path.basename(filepath):30s} → [{cat}] {len(texts)} examples")

    print()

    # Deduplicate per category
    all_rows = []
    for cat in CATEGORIES:
        seen = set()
        unique = []
        for text in category_texts[cat]:
            if text not in seen:
                seen.add(text)
                unique.append(text)
        print(f"  [{cat:12s}] {len(unique)} unique examples")

        for text in unique:
            labels = {c: 0 for c in CATEGORIES}
            labels[cat] = 1
            all_rows.append({'text': text, **labels})

    # Add safe messages (all zeros)
    print(f"  [{'safe':12s}] {len(SAFE_MESSAGES)} clean examples")
    for text in SAFE_MESSAGES:
        labels = {c: 0 for c in CATEGORIES}
        all_rows.append({'text': text, **labels})

    # Write output
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), args.output)
    fieldnames = ['text'] + CATEGORIES
    with open(output_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_rows)

    print(f"\n✅ Total: {len(all_rows)} examples → {output_path}")


if __name__ == '__main__':
    main()
