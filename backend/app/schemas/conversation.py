"""Request/response schemas for the API."""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


# ── Message schemas ────────────────────────────────────────────────────────────

class MessageOut(BaseModel):
    message_id: str
    role: str
    content: str
    timestamp: datetime


# ── Conversation schemas ───────────────────────────────────────────────────────

class ConversationCreateRequest(BaseModel):
    session_id: str
    title: Optional[str] = "New Conversation"


class ConversationSummary(BaseModel):
    conversation_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0


class ConversationDetail(BaseModel):
    conversation_id: str
    session_id: str
    title: str
    messages: List[MessageOut]
    created_at: datetime
    updated_at: datetime
