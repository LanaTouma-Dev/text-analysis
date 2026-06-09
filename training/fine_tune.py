"""
fine_tune.py

Fine-tunes MARBERT on the synthetic SMS dataset for 10-category
multi-label classification.

Usage:
    python fine_tune.py --dataset dataset.csv --model_path C:/models/marbert-finetuned --epochs 5

After training, the fine-tuned weights are saved back to --model_path.
Restart the MARBERT FastAPI service to pick up the new weights.
"""

import argparse
import csv
import os
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader, random_split
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from torch.optim import AdamW
from transformers import get_linear_schedule_with_warmup

CATEGORIES = ['spam', 'hate', 'scam', 'political', 'violence',
              'sectarian', 'adult', 'drugs', 'harass', 'misinfo']


# ---------------------------------------------------------------------------
# Dataset
# ---------------------------------------------------------------------------

class SMSDataset(Dataset):
    def __init__(self, texts: list[str], labels: list[list[float]], tokenizer, max_length=128):
        self.encodings = tokenizer(
            texts,
            truncation=True,
            padding=True,
            max_length=max_length,
            return_tensors='pt'
        )
        self.labels = torch.tensor(labels, dtype=torch.float32)

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        return {
            'input_ids':      self.encodings['input_ids'][idx],
            'attention_mask': self.encodings['attention_mask'][idx],
            'labels':         self.labels[idx],
        }


def load_dataset(csv_path: str):
    texts, labels = [], []
    with open(csv_path, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            texts.append(row['text'])
            labels.append([float(row[cat]) for cat in CATEGORIES])
    return texts, labels


# ---------------------------------------------------------------------------
# Metrics
# ---------------------------------------------------------------------------

def compute_metrics(preds: np.ndarray, targets: np.ndarray, threshold=0.3):
    pred_bin = (preds >= threshold).astype(int)
    tp = (pred_bin * targets).sum(axis=0)
    fp = (pred_bin * (1 - targets)).sum(axis=0)
    fn = ((1 - pred_bin) * targets).sum(axis=0)

    precision = np.where((tp + fp) > 0, tp / (tp + fp), 0)
    recall    = np.where((tp + fn) > 0, tp / (tp + fn), 0)
    f1        = np.where((precision + recall) > 0,
                         2 * precision * recall / (precision + recall), 0)

    print("\n--- Per-category metrics ---")
    for i, cat in enumerate(CATEGORIES):
        print(f"  {cat:12s}  P={precision[i]:.3f}  R={recall[i]:.3f}  F1={f1[i]:.3f}")
    print(f"\n  Macro F1: {f1.mean():.3f}")
    return f1.mean()


# ---------------------------------------------------------------------------
# Training
# ---------------------------------------------------------------------------

def train(args):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Device: {device}")

    # Load data
    print(f"\nLoading dataset from {args.dataset}...")
    texts, labels = load_dataset(args.dataset)
    print(f"Total examples: {len(texts)}")

    # Tokenizer
    print(f"\nLoading tokenizer from {args.model_path}...")
    tokenizer = AutoTokenizer.from_pretrained(args.model_path)

    # Split train/val (90/10)
    dataset = SMSDataset(texts, labels, tokenizer)
    val_size   = max(1, int(len(dataset) * 0.1))
    train_size = len(dataset) - val_size
    train_ds, val_ds = random_split(dataset, [train_size, val_size])
    print(f"Train: {train_size}  Val: {val_size}")

    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True)
    val_loader   = DataLoader(val_ds,   batch_size=args.batch_size, shuffle=False)

    # Model
    print(f"\nLoading MARBERT model...")
    model = AutoModelForSequenceClassification.from_pretrained(
        args.model_path,
        num_labels=10,
        problem_type='multi_label_classification',
        ignore_mismatched_sizes=True,   # classifier head will be re-initialized
    )
    model.to(device)

    # Optimizer + scheduler
    optimizer = AdamW(model.parameters(), lr=args.lr, weight_decay=0.01)
    total_steps = len(train_loader) * args.epochs
    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=int(total_steps * 0.1),
        num_training_steps=total_steps
    )

    loss_fn = torch.nn.BCEWithLogitsLoss()

    best_f1 = 0.0
    print(f"\n=== Starting training for {args.epochs} epochs ===\n")

    for epoch in range(1, args.epochs + 1):
        # Train
        model.train()
        total_loss = 0
        for batch in train_loader:
            optimizer.zero_grad()
            input_ids      = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            label_tensor   = batch['labels'].to(device)

            outputs = model(input_ids=input_ids, attention_mask=attention_mask)
            loss = loss_fn(outputs.logits, label_tensor)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            scheduler.step()
            total_loss += loss.item()

        avg_loss = total_loss / len(train_loader)

        # Validate
        model.eval()
        all_preds, all_targets = [], []
        with torch.no_grad():
            for batch in val_loader:
                input_ids      = batch['input_ids'].to(device)
                attention_mask = batch['attention_mask'].to(device)
                outputs = model(input_ids=input_ids, attention_mask=attention_mask)
                preds = torch.sigmoid(outputs.logits).cpu().numpy()
                all_preds.append(preds)
                all_targets.append(batch['labels'].numpy())

        all_preds   = np.vstack(all_preds)
        all_targets = np.vstack(all_targets)

        print(f"Epoch {epoch}/{args.epochs}  loss={avg_loss:.4f}")
        macro_f1 = compute_metrics(all_preds, all_targets)

        # Save best model
        if macro_f1 > best_f1:
            best_f1 = macro_f1
            print(f"  ✓ New best F1={best_f1:.3f} — saving model...")
            model.save_pretrained(args.model_path)
            tokenizer.save_pretrained(args.model_path)

    print(f"\n=== Training complete ===")
    print(f"Best Macro F1: {best_f1:.3f}")
    print(f"Model saved to: {args.model_path}")
    print(f"\nRestart the MARBERT FastAPI service to load the new weights:")
    print(f"  uvicorn main:app --host 0.0.0.0 --port 8001 --workers 1")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--dataset',    default='dataset.csv',
                        help='Path to the training CSV')
    parser.add_argument('--model_path', default=r'C:\models\marbert-finetuned',
                        help='Path to MARBERT model (also where fine-tuned weights are saved)')
    parser.add_argument('--epochs',     type=int,   default=5)
    parser.add_argument('--batch_size', type=int,   default=16)
    parser.add_argument('--lr',         type=float, default=2e-5)
    args = parser.parse_args()

    train(args)
