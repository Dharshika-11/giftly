"""Conversation service — CRUD operations with MongoDB."""
import logging
import uuid
from datetime import datetime
from typing import List, Optional

from app.database import get_database
from app.models.conversation import ConversationModel, MessageModel
from app.schemas.conversation import ConversationDetail, ConversationSummary, MessageOut

logger = logging.getLogger(__name__)


def _serialize_conversation(doc: dict) -> ConversationModel:
    doc["_id"] = str(doc.get("_id", ""))
    return ConversationModel(**doc)


class ConversationService:
    @property
    def _collection(self):
        db = get_database()
        if db is None:
            raise RuntimeError("Database is not connected.")
        return db["conversations"]

    async def create_conversation(
        self,
        session_id: str,
        title: str = "New Conversation",
        conversation_id: Optional[str] = None,
    ) -> ConversationModel:
        conversation = ConversationModel(
            conversation_id=conversation_id or str(uuid.uuid4()),
            session_id=session_id,
            title=title,
        )
        doc = conversation.model_dump(exclude={"id"})
        await self._collection.insert_one(doc)
        return conversation

    async def get_conversations(self, session_id: str) -> List[ConversationSummary]:
        cursor = (
            self._collection.find(
                {"session_id": session_id},
                {
                    "conversation_id": 1,
                    "title": 1,
                    "created_at": 1,
                    "updated_at": 1,
                    "messages": {"$slice": -1},
                },
            )
            .sort("updated_at", -1)
            .limit(50)
        )
        summaries = []
        async for doc in cursor:
            msg_count = len(doc.get("messages", []))
            summaries.append(
                ConversationSummary(
                    conversation_id=doc["conversation_id"],
                    title=doc["title"],
                    created_at=doc["created_at"],
                    updated_at=doc["updated_at"],
                    message_count=msg_count,
                )
            )
        return summaries

    async def get_conversation(
        self, conversation_id: str, session_id: str
    ) -> Optional[ConversationDetail]:
        doc = await self._collection.find_one(
            {"conversation_id": conversation_id, "session_id": session_id}
        )
        if not doc:
            return None
        messages = [
            MessageOut(
                message_id=m["message_id"],
                role=m["role"],
                content=m["content"],
                timestamp=m["timestamp"],
            )
            for m in doc.get("messages", [])
        ]
        return ConversationDetail(
            conversation_id=doc["conversation_id"],
            session_id=doc["session_id"],
            title=doc["title"],
            messages=messages,
            created_at=doc["created_at"],
            updated_at=doc["updated_at"],
        )

    async def add_message(
        self,
        conversation_id: str,
        session_id: str,
        role: str,
        content: str,
        message_id: Optional[str] = None,
        recommendations: Optional[List[dict]] = None,
    ) -> MessageModel:
        message = MessageModel(
            message_id=message_id or str(uuid.uuid4()),
            role=role,
            content=content,
            recommendations=recommendations or [],
        )
        now = datetime.utcnow()
        result = await self._collection.update_one(
            {"conversation_id": conversation_id, "session_id": session_id},
            {
                "$push": {"messages": message.model_dump()},
                "$set": {"updated_at": now},
            },
        )
        if result.matched_count == 0:
            raise ValueError(f"Conversation {conversation_id} not found.")
        return message

    async def update_title(
        self, conversation_id: str, session_id: str, title: str
    ) -> None:
        await self._collection.update_one(
            {"conversation_id": conversation_id, "session_id": session_id},
            {"$set": {"title": title, "updated_at": datetime.utcnow()}},
        )

    async def delete_conversation(
        self, conversation_id: str, session_id: str
    ) -> bool:
        result = await self._collection.delete_one(
            {"conversation_id": conversation_id, "session_id": session_id}
        )
        return result.deleted_count > 0

    async def get_messages_for_context(
        self, conversation_id: str, session_id: str, limit: int = 20
    ) -> list:
        """Return recent messages as plain dicts for Gemini context."""
        doc = await self._collection.find_one(
            {"conversation_id": conversation_id, "session_id": session_id},
            {"messages": {"$slice": -limit}},
        )
        if not doc:
            return []
        return [
            {
                "role": m["role"],
                "content": m["content"],
                "recommendations": m.get("recommendations", []),
            }
            for m in doc.get("messages", [])
        ]

    async def find_idempotent_response(
        self, conversation_id: str, client_message_id: str
    ) -> Optional[dict]:
        """Check if a message with this client_message_id was already saved."""
        doc = await self._collection.find_one(
            {
                "conversation_id": conversation_id,
                "messages": {
                    "$elemMatch": {
                        "message_id": client_message_id,
                        "role": "user",
                    }
                },
            }
        )
        if not doc:
            return None
        # Find the assistant message that follows
        messages = doc.get("messages", [])
        for i, m in enumerate(messages):
            if m["message_id"] == client_message_id and m["role"] == "user":
                if i + 1 < len(messages) and messages[i + 1]["role"] == "assistant":
                    return messages[i + 1]
        return None


_conversation_service: Optional[ConversationService] = None


def get_conversation_service() -> ConversationService:
    global _conversation_service
    if _conversation_service is None:
        _conversation_service = ConversationService()
    return _conversation_service
