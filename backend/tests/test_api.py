"""Backend test suite for Giftly API."""
import uuid
from datetime import datetime
from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

# ── Fixtures ───────────────────────────────────────────────────────────────────

@pytest.fixture
def mock_db_connected():
    """Mock database as connected."""
    with patch("app.database.is_connected", return_value=True), \
         patch("app.routes.health.is_connected", return_value=True), \
         patch("app.routes.conversations.is_connected", return_value=True), \
         patch("app.routes.chat.is_connected", return_value=True):
        yield


@pytest.fixture
def mock_db_disconnected():
    """Mock database as disconnected."""
    with patch("app.database.is_connected", return_value=False), \
         patch("app.routes.health.is_connected", return_value=False), \
         patch("app.routes.conversations.is_connected", return_value=False), \
         patch("app.routes.chat.is_connected", return_value=False):
        yield


@pytest.fixture
def sample_conversation():
    return {
        "conversation_id": str(uuid.uuid4()),
        "session_id": "test-session-123",
        "title": "Birthday Gift for Sister",
        "messages": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }


@pytest.fixture
async def async_client():
    from app.main import app
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        yield client


# ── Health Tests ───────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_health_check(async_client):
    response = await async_client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_api_health_connected(async_client, mock_db_connected):
    response = await async_client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"


@pytest.mark.asyncio
async def test_api_health_disconnected(async_client, mock_db_disconnected):
    response = await async_client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["database"] == "disconnected"


@pytest.mark.asyncio
async def test_wake_endpoint(async_client):
    response = await async_client.get("/api/wake")
    assert response.status_code == 200
    assert response.json()["status"] == "awake"


# ── Conversation Tests ─────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_create_conversation_db_unavailable(async_client, mock_db_disconnected):
    response = await async_client.post(
        "/api/conversations",
        json={"session_id": "test-session", "title": "Test"},
    )
    assert response.status_code == 503


@pytest.mark.asyncio
async def test_create_conversation_success(async_client, mock_db_connected, sample_conversation):
    from app.models.conversation import ConversationModel
    mock_conv = ConversationModel(
        conversation_id=sample_conversation["conversation_id"],
        session_id="test-session",
        title="Gift for Sister",
    )
    with patch(
        "app.services.conversation_service.ConversationService.create_conversation",
        new_callable=AsyncMock,
        return_value=mock_conv,
    ):
        response = await async_client.post(
            "/api/conversations",
            json={"session_id": "test-session", "title": "Gift for Sister"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Gift for Sister"
        assert "conversation_id" in data


@pytest.mark.asyncio
async def test_list_conversations_db_unavailable(async_client, mock_db_disconnected):
    response = await async_client.get(
        "/api/conversations?session_id=test-session"
    )
    assert response.status_code == 503


@pytest.mark.asyncio
async def test_get_conversation_not_found(async_client, mock_db_connected):
    with patch(
        "app.services.conversation_service.ConversationService.get_conversation",
        new_callable=AsyncMock,
        return_value=None,
    ):
        response = await async_client.get(
            f"/api/conversations/{uuid.uuid4()}?session_id=test-session"
        )
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_conversation_not_found(async_client, mock_db_connected):
    with patch(
        "app.services.conversation_service.ConversationService.delete_conversation",
        new_callable=AsyncMock,
        return_value=False,
    ):
        response = await async_client.delete(
            f"/api/conversations/{uuid.uuid4()}?session_id=test-session"
        )
        assert response.status_code == 404


# ── Chat Tests ─────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_chat_empty_message(async_client, mock_db_connected):
    response = await async_client.post(
        "/api/chat",
        json={
            "session_id": "test-session",
            "conversation_id": str(uuid.uuid4()),
            "message": "  ",
            "client_message_id": str(uuid.uuid4()),
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_chat_message_too_long(async_client, mock_db_connected):
    response = await async_client.post(
        "/api/chat",
        json={
            "session_id": "test-session",
            "conversation_id": str(uuid.uuid4()),
            "message": "x" * 2001,
            "client_message_id": str(uuid.uuid4()),
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_chat_db_unavailable(async_client, mock_db_disconnected):
    response = await async_client.post(
        "/api/chat",
        json={
            "session_id": "test-session",
            "conversation_id": str(uuid.uuid4()),
            "message": "I need a gift",
            "client_message_id": str(uuid.uuid4()),
        },
    )
    assert response.status_code == 503


@pytest.mark.asyncio
async def test_chat_idempotency(async_client, mock_db_connected):
    """Same client_message_id should return cached response."""
    client_msg_id = str(uuid.uuid4())
    cached_response = {
        "message_id": str(uuid.uuid4()),
        "role": "assistant",
        "content": "Here are some gift ideas!",
        "timestamp": datetime.utcnow(),
    }
    with patch(
        "app.services.conversation_service.ConversationService.find_idempotent_response",
        new_callable=AsyncMock,
        return_value=cached_response,
    ):
        response = await async_client.post(
            "/api/chat",
            json={
                "session_id": "test-session",
                "conversation_id": str(uuid.uuid4()),
                "message": "I need a gift",
                "client_message_id": client_msg_id,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["content"] == "Here are some gift ideas!"
        assert data["client_message_id"] == client_msg_id


# ── Gemini Service Tests ───────────────────────────────────────────────────────

def test_gemini_parse_plain_response():
    """Gemini service should parse plain text correctly."""
    from app.services.gemini_service import GeminiService
    svc = GeminiService.__new__(GeminiService)
    svc._model = None
    message, recs = svc._parse_response("Tell me more about the recipient.")
    assert message == "Tell me more about the recipient."
    assert recs == []


def test_gemini_parse_json_response():
    """Gemini service should parse structured JSON correctly."""
    import json

    from app.services.gemini_service import GeminiService
    svc = GeminiService.__new__(GeminiService)

    payload = {
        "message": "Here are some great options!",
        "recommendations": [
            {
                "name": "Personalized Photo Book",
                "reason": "Great for memories",
                "price_range": "₹1,000 – ₹2,000",
                "category": "Personalized",
                "personalization": "Add family photos",
                "alternative": "Custom calendar",
            }
        ],
    }
    text = json.dumps(payload)
    message, recs = svc._parse_response(text)
    assert message == "Here are some great options!"
    assert len(recs) == 1
    assert recs[0].name == "Personalized Photo Book"
    assert recs[0].price_range == "₹1,000 – ₹2,000"


def test_gemini_parse_json_reversed_keys():
    """Gemini service should parse JSON when recommendations key precedes message key."""
    from app.services.gemini_service import GeminiService
    svc = GeminiService.__new__(GeminiService)

    text = """{
        "recommendations": [
            {
                "name": "Sony WH-CH720N Headphones",
                "reason": "Great noise cancellation",
                "price_range": "₹7,990",
                "category": "Electronics"
            }
        ],
        "message": "Here are top audio gifts for your brother!"
    }"""
    message, recs = svc._parse_response(text)
    assert message == "Here are top audio gifts for your brother!"
    assert len(recs) == 1
    assert recs[0].name == "Sony WH-CH720N Headphones"
    # Category "Electronics" should normalize to "Tech"
    assert recs[0].category == "Tech"


def test_gemini_parse_markdown_code_block_with_trailing_commas():
    """Gemini service should parse code-fenced JSON and sanitize trailing commas."""
    from app.services.gemini_service import GeminiService
    svc = GeminiService.__new__(GeminiService)

    text = """Here is what I found for you:
```json
{
    "message": "Curated picks for her birthday:",
    "recommendations": [
        {
            "name": "Scented Soy Candle Set",
            "reason": "Relaxing and aesthetic",
            "price_range": "₹1,200 – ₹1,800",
            "category": "Wellness",
            "personalization": "Choose lavender notes",
        },
    ],
}
```
Let me know if you would like more options!"""
    message, recs = svc._parse_response(text)
    assert message == "Curated picks for her birthday:"
    assert len(recs) == 1
    assert recs[0].name == "Scented Soy Candle Set"
    assert recs[0].category == "Wellness"


def test_gemini_category_normalization():
    """Gemini service should normalize known synonyms to supported categories."""
    from app.services.gemini_service import normalize_category
    assert normalize_category("electronics") == "Tech"
    assert normalize_category("gaming") == "Tech"
    assert normalize_category("fitness") == "Sports"
    assert normalize_category("kitchen") == "Home"
    assert normalize_category("decor") == "Home"
    assert normalize_category("clothing") == "Fashion"
    assert normalize_category("literature") == "Books"
    assert normalize_category("Unknown Category 123") == "Personalized"


def test_gemini_build_history_includes_recommendations():
    """History building should include previous recommendation details for conversational memory."""
    from app.services.gemini_service import GeminiService
    svc = GeminiService.__new__(GeminiService)
    messages = [
        {"role": "user", "content": "Gift for friend"},
        {
            "role": "assistant",
            "content": "Here is an idea:",
            "recommendations": [
                {
                    "name": "Leather Journal",
                    "category": "Personalized",
                    "price_range": "₹800",
                    "reason": "Great for thoughts",
                }
            ],
        },
    ]
    history = svc._build_history(messages)
    assert len(history) == 2
    assert history[0]["role"] == "user"
    assert history[1]["role"] == "model"
    assert "Leather Journal" in history[1]["parts"][0]["text"]
    assert "Personalized" in history[1]["parts"][0]["text"]


