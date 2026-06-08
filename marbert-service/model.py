import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

CATEGORIES = [
    'spam', 'hate', 'scam', 'political', 'violence',
    'sectarian', 'adult', 'drugs', 'harass', 'misinfo'
]

# Update this path to wherever MARBERT was downloaded
MODEL_PATH = r'C:\models\marbert-finetuned'


class MARBERTModel:
    _instance = None

    @classmethod
    def get(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        print(f'Loading MARBERT from {MODEL_PATH} ...')
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
        self.model = AutoModelForSequenceClassification.from_pretrained(
            MODEL_PATH,
            num_labels=10,
            problem_type='multi_label_classification'
        )
        self.model.eval()
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model.to(self.device)
        print(f'MARBERT loaded on {self.device}')

    def infer(self, text: str) -> dict:
        inputs = self.tokenizer(
            text,
            return_tensors='pt',
            truncation=True,
            max_length=128,
            padding=True
        ).to(self.device)

        with torch.no_grad():
            logits = self.model(**inputs).logits
            scores = torch.sigmoid(logits).squeeze().tolist()

        # squeeze() returns a scalar when batch=1 and num_labels=1, guard for that
        if isinstance(scores, float):
            scores = [scores]

        return {cat: round(score, 4) for cat, score in zip(CATEGORIES, scores)}
