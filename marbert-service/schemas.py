from pydantic import BaseModel
from typing import Dict


class InferRequest(BaseModel):
    message_id: str
    text: str  # raw original text — preprocessing happens internally


class InferResponse(BaseModel):
    message_id: str
    scores: Dict[str, float]     # {category: sigmoid_score}
    latency_ms: float
    preprocessed_text: str       # what MARBERT actually saw (for audit)
