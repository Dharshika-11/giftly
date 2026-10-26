"""Async MongoDB database connection using Motor."""
import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING

from app.config import get_settings

logger = logging.getLogger(__name__)

_client: Optional[AsyncIOMotorClient] = None
_database: Optional[AsyncIOMotorDatabase] = None


def get_client() -> Optional[AsyncIOMotorClient]:
    return _client


def get_database() -> Optional[AsyncIOMotorDatabase]:
    return _database


async def connect_to_mongo() -> None:
    """Initialize MongoDB connection. Called on app startup."""
    global _client, _database
    settings = get_settings()

    if not settings.mongodb_uri:
        logger.warning("MONGODB_URI is not set. Database features will be unavailable.")
        return

    try:
        _client = AsyncIOMotorClient(
            settings.mongodb_uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=10000,
        )
        _database = _client[settings.mongodb_database_name]

        # Verify connection
        await _client.admin.command("ping")
        logger.info("Successfully connected to MongoDB Atlas.")

        # Create indexes
        await _create_indexes()
    except Exception as exc:
        logger.error("Failed to connect to MongoDB: %s", exc)
        if settings.environment == "development":
            try:
                from mongomock_motor import AsyncMongoMockClient
                logger.warning(
                    "Development mode: Falling back to in-memory MongoDB mock because Atlas was unreachable. "
                    "(To connect to Atlas, whitelist your IP in MongoDB Atlas Network Access)."
                )
                _client = AsyncMongoMockClient()
                _database = _client[settings.mongodb_database_name]
                await _create_indexes()
                return
            except Exception as mock_exc:
                logger.error("Failed to initialize in-memory fallback: %s", mock_exc)
        _client = None
        _database = None


async def close_mongo_connection() -> None:
    """Close MongoDB connection. Called on app shutdown."""
    global _client, _database
    if _client:
        _client.close()
        _client = None
        _database = None
        logger.info("MongoDB connection closed.")


async def _create_indexes() -> None:
    """Create necessary database indexes."""
    if _database is None:
        return
    try:
        conversations = _database["conversations"]
        await conversations.create_index([("session_id", ASCENDING)])
        await conversations.create_index([("updated_at", DESCENDING)])
        await conversations.create_index([("created_at", DESCENDING)])
        await conversations.create_index([("conversation_id", ASCENDING)], unique=True)
        logger.info("Database indexes created successfully.")
    except Exception as exc:
        logger.error("Failed to create indexes: %s", exc)


def is_connected() -> bool:
    """Check if database connection is active."""
    return _database is not None
