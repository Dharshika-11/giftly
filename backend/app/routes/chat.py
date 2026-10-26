"""Chat route — handles message sending with Gemini and idempotency."""
import logging
import uuid
from fastapi import APIRouter, HTTPException, status

from app.database import is_connected
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.conversation_service import get_conversation_service
from app.services.gemini_service import get_gemini_service
from app.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Chat"])


def _check_db():
    if not is_connected():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is temporarily unavailable. Please try again shortly.",
        )


@router.post("/chat", response_model=ChatResponse)
async def send_chat_message(body: ChatRequest):
    """
    Send a message to the gift assistant.

    Uses client_message_id for idempotency — duplicate requests will return
    the existing response without calling Gemini again.
    """
    _check_db()
    settings = get_settings()
    svc = get_conversation_service()

    # Validate message length
    if len(body.message.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Message cannot be empty.",
        )
    if len(body.message) > settings.max_message_length:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Message too long. Maximum {settings.max_message_length} characters.",
        )

    # ── Idempotency check ──────────────────────────────────────────────────────
    existing = await svc.find_idempotent_response(
        conversation_id=body.conversation_id,
        client_message_id=body.client_message_id,
    )
    if existing:
        logger.info(
            "Returning cached response for client_message_id=%s", body.client_message_id
        )
        return ChatResponse(
            conversation_id=body.conversation_id,
            message_id=existing["message_id"],
            content=existing["content"],
            recommendations=[],
            client_message_id=body.client_message_id,
        )

    # ── Save user message ──────────────────────────────────────────────────────
    try:
        await svc.add_message(
            conversation_id=body.conversation_id,
            session_id=body.session_id,
            role="user",
            content=body.message,
            message_id=body.client_message_id,
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )
    except Exception as exc:
        logger.error("Failed to save user message: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to save message.")

    # ── Fetch context for Gemini ───────────────────────────────────────────────
    history = await svc.get_messages_for_context(
        conversation_id=body.conversation_id,
        session_id=body.session_id,
        limit=settings.max_context_messages,
    )
    # Exclude the last user message from history (it's the current message)
    context_history = history[:-1] if history and history[-1]["role"] == "user" else history

    # ── Call Gemini ────────────────────────────────────────────────────────────
    gemini = get_gemini_service()
    try:
        response_text, recommendations = await gemini.generate_response(
            user_message=body.message,
            conversation_history=context_history,
        )
    except RuntimeError as exc:
        logger.error("Gemini error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Something went wrong while finding your gift. Please try again.",
        )

    # ── Save assistant response ────────────────────────────────────────────────
    assistant_message_id = str(uuid.uuid4())
    try:
        await svc.add_message(
            conversation_id=body.conversation_id,
            session_id=body.session_id,
            role="assistant",
            content=response_text,
            message_id=assistant_message_id,
        )
    except Exception as exc:
        logger.error("Failed to save assistant message: %s", exc)

    # ── Auto-update conversation title ─────────────────────────────────────────
    try:
        conv = await svc.get_conversation(
            conversation_id=body.conversation_id,
            session_id=body.session_id,
        )
        if conv and conv.title in ("New Conversation", "") and len(conv.messages) <= 2:
            # Generate a short title from first user message
            words = body.message.strip().split()
            title = " ".join(words[:6])
            if len(title) < len(body.message):
                title += "..."
            await svc.update_title(
                conversation_id=body.conversation_id,
                session_id=body.session_id,
                title=title[:60],
            )
    except Exception as exc:
        logger.warning("Could not auto-update conversation title: %s", exc)

    return ChatResponse(
        conversation_id=body.conversation_id,
        message_id=assistant_message_id,
        content=response_text,
        recommendations=recommendations,
        client_message_id=body.client_message_id,
    )


@router.post("/conversations/{conversation_id}/messages", response_model=ChatResponse)
async def send_message_to_conversation(conversation_id: str, body: ChatRequest):
    """Alias endpoint for sending messages to a specific conversation."""
    body_with_id = ChatRequest(
        session_id=body.session_id,
        conversation_id=conversation_id,
        message=body.message,
        client_message_id=body.client_message_id,
    )
    return await send_chat_message(body_with_id)
