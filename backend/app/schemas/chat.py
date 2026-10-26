"""Chat request/response schemas."""
from typing import List, Optional
from pydantic import BaseModel, Field


class GiftRecommendation(BaseModel):
    name: str
    reason: str
    price_range: str
    category: str
    personalization: Optional[str] = None
    alternative: Optional[str] = None


class ChatRequest(BaseModel):
    session_id: str
    conversation_id: str
    message: str = Field(..., min_length=1, max_length=2000)
    client_message_id: str  # Idempotency key from frontend


class ChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    content: str
    recommendations: List[GiftRecommendation] = []
    client_message_id: str
