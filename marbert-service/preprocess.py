import re


def anti_obfuscation(text: str) -> str:
    # Collapse repeated Arabic chars only: "هههههه" → "هه" (skip digits/latin)
    text = re.sub(r'([؀-ۿ])\1{3,}', r'\1\1', text)
    # Remove injected punctuation between Arabic letters: "ك.ر.ه" → "كره"
    text = re.sub(r'(?<=[؀-ۿ])[.\-_*]{1,2}(?=[؀-ۿ])', '', text)
    # Remove spaces injected between letters: "ك ر ه" → "كره"
    text = re.sub(r'(?<=[؀-ۿ]) (?=[؀-ۿ])', '', text)
    return text


def normalize_arabic(text: str) -> str:
    # Strip tashkeel (diacritics)
    text = re.sub(r'[ً-ٰٟ]', '', text)
    # Normalize alef variants → bare alef
    text = re.sub(r'[أإآ]', 'ا', text)
    # Normalize ya variants → dotless ya
    text = re.sub(r'ى', 'ي', text)
    # Normalize ta marbuta → ha
    text = re.sub(r'ة', 'ه', text)
    return text.strip()


def preprocess(text: str) -> str:
    text = anti_obfuscation(text)
    text = normalize_arabic(text)
    return text
