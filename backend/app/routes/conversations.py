"""Conversation management routes."""
import logging
from typing import List

from fastapi import APIRouter, HTTPException, Query, status

from app.database import is_connected
from app.schemas.conversation import (
    ConversationCreateRequest,
    ConversationDetail,
    ConversationSummary,
)
from app.services.conversation_service import get_conversation_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/conversations", tags=["Conversations"])


def _check_db():
    if not is_connected():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is temporarily unavailable. Please try again shortly.",
        )


@router.post("", response_model=ConversationDetail, status_code=status.HTTP_201_CREATED)
async def create_conversation(body: ConversationCreateRequest):
    """Create a new conversation."""
    _check_db()
    svc = get_conversation_service()
    try:
        conv = await svc.create_conversation(
            session_id=body.session_id,
            title=body.title or "New Conversation",
        )
        return ConversationDetail(
            conversation_id=conv.conversation_id,
            session_id=conv.session_id,
            title=conv.title,
            messages=[],
            created_at=conv.created_at,
            updated_at=conv.updated_at,
        )
    except Exception as exc:
        logger.error("Failed to create conversation: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to create conversation.")


@router.get("", response_model=List[ConversationSummary])
async def list_conversations(session_id: str = Query(..., description="User session ID")):
    """List all conversations for a session."""
    _check_db()
    svc = get_conversation_service()
    try:
        return await svc.get_conversations(session_id=session_id)
    except Exception as exc:
        logger.error("Failed to list conversations: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to retrieve conversations.")


@router.get("/{conversation_id}", response_model=ConversationDetail)
async def get_conversation(
    conversation_id: str,
    session_id: str = Query(..., description="User session ID"),
):
    """Get a specific conversation with full message history."""
    _check_db()
    svc = get_conversation_service()
    try:
        conv = await svc.get_conversation(
            conversation_id=conversation_id,
            session_id=session_id,
        )
        if not conv:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found.",
            )
        return conv
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to get conversation %s: %s", conversation_id, exc)
        raise HTTPException(status_code=500, detail="Failed to retrieve conversation.")


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: str,
    session_id: str = Query(..., description="User session ID"),
):
    """Delete a conversation."""
    _check_db()
    svc = get_conversation_service()
    try:
        deleted = await svc.delete_conversation(
            conversation_id=conversation_id,
            session_id=session_id,
        )
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found.",
            )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to delete conversation %s: %s", conversation_id, exc)
        raise HTTPException(status_code=500, detail="Failed to delete conversation.")
