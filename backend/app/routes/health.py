"""Health check routes."""
import logging
from fastapi import APIRouter
from pydantic import BaseModel

from app.database import is_connected

logger = logging.getLogger(__name__)
router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    service: str = "giftly-api"
    database: str = "unknown"


@router.get("/health", tags=["Health"])
async def health_check():
    """Lightweight health check used by Render."""
    return {"status": "ok"}


@router.get("/api/health", response_model=HealthResponse, tags=["Health"])
async def api_health_check():
    """Detailed health check with service information."""
    db_status = "connected" if is_connected() else "disconnected"
    return HealthResponse(
        status="healthy",
        service="giftly-api",
        database=db_status,
    )


@router.get("/api/wake", tags=["Health"])
async def wake():
    """Warm-up endpoint to wake the backend from cold start."""
    return {"status": "awake", "message": "Gift assistant is ready."}
