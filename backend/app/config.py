from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Groq API (OpenAI-compatible)
    groq_api_key: str = ""
    groq_base_url: str = "https://api.groq.com/openai/v1"
    model: str = "llama-3.3-70b-versatile"

    # Generation defaults
    temperature: float = 0.7
    max_tokens: int = 4096

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


@lru_cache
def get_settings() -> Settings:
    return Settings()

