"""FastAPI application entry point."""
import logging
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import health, conversations, chat

# ── Logging Setup ──────────────────────────────────────────────────────────────
settings = get_settings()
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


# ── Lifespan ───────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Giftly API...")
    await connect_to_mongo()
    yield
    logger.info("Shutting down Giftly API...")
    await close_mongo_connection()


# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Giftly API",
    description="Smart gift recommendation assistant backend.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


# ── CORS ───────────────────────────────────────────────────────────────────────
origins = [
    settings.frontend_url,
    "http://localhost:3000",
    "http://localhost:3001",
]
# In production accept configured origin; in dev be permissive
if settings.environment == "development":
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request logging middleware ─────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    logger.info(
        "req_id=%s method=%s path=%s status=%s latency=%.1fms",
        request_id,
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    response.headers["X-Request-ID"] = request_id
    return response


# ── Global exception handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception on %s: %s", request.url.path, exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again."},
    )


# ── Routes ─────────────────────────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(conversations.router)
app.include_router(chat.router)


@app.get("/", include_in_schema=False)
async def root():
    return {"service": "Giftly API", "status": "running", "docs": "/docs"}
