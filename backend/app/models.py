from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ──────────────────────────────────────────────
# Chat
# ──────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str
    temperature: Optional[float] = Field(default=None, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(default=None, ge=1, le=32768)
    model: Optional[str] = None


class ChatResponse(BaseModel):
    conversation_id: str
    message: ChatMessage


# ──────────────────────────────────────────────
# History
# ──────────────────────────────────────────────

class ConversationSummary(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int


class ConversationDetail(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: list[ChatMessage]


class RenameRequest(BaseModel):
    title: str


# ──────────────────────────────────────────────
# Settings
# ──────────────────────────────────────────────

class UserSettings(BaseModel):
    model: str = "llama-3.3-70b-versatile"
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(default=4096, ge=1, le=32768)
    theme: str = "dark"
    font_size: str = "medium"
