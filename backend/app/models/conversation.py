"""Pydantic models for conversation documents."""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class MessageModel(BaseModel):
    message_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str  # "user" or "assistant"
    content: str
    recommendations: List[dict] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ConversationModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    conversation_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    title: str = "New Conversation"
    messages: List[MessageModel] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"populate_by_name": True}
