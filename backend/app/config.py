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

    # CORS — set CORS_ORIGINS env var as a comma-separated list for production
    # e.g. CORS_ORIGINS=https://username.github.io,https://yourdomain.com
    cors_origins_str: Optional[str] = None

    @property
    def cors_origins(self) -> list[str]:
        if self.cors_origins_str:
            return [o.strip() for o in self.cors_origins_str.split(",") if o.strip()]
        return ["http://localhost:5173", "http://127.0.0.1:5173"]


@lru_cache
def get_settings() -> Settings:
    return Settings()

