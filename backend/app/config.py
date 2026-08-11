from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Google Gemini API
    gemini_api_key: str = Field(default="", validation_alias="GEMINI_API_KEY")
    model: str = "gemini-3.6-flash"

    # Generation defaults
    temperature: float = 0.7
    max_tokens: int = 4096  # increased for fuller responses

    # DB
    db_path: str = "pymentor.db"

    # CORS — comma-separated list of allowed origins
    # Override with CORS_ORIGINS env var in production
    cors_origins_str: Optional[str] = None

    @property
    def cors_origins(self) -> list[str]:
        if self.cors_origins_str:
            return [o.strip() for o in self.cors_origins_str.split(",") if o.strip()]
        return [
            "https://python-mentor-chi.vercel.app",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]


def get_settings() -> Settings:
    """Always create a fresh Settings instance so env vars are always current."""
    return Settings()

