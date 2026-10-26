"""Application configuration using pydantic-settings."""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # MongoDB
    mongodb_uri: str = ""
    mongodb_database_name: str = "giftly"

    # Gemini
    gemini_api_key: str = ""

    # CORS
    frontend_url: str = "http://localhost:3000"

    # App
    environment: str = "development"
    log_level: str = "INFO"

    # Rate limiting
    rate_limit_per_minute: int = 30

    # Message limits
    max_message_length: int = 2000
    max_context_messages: int = 20


@lru_cache()
def get_settings() -> Settings:
    return Settings()
