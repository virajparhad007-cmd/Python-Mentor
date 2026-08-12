import os
import google.generativeai as genai
from app.config import get_settings
from typing import AsyncGenerator

SYSTEM_PROMPT = (
    "You are PyMentor AI, an expert Python tutor. "
    "Answer ONLY Python-related questions (syntax, OOP, async, testing, FastAPI, Flask, Django, "
    "NumPy, Pandas, ML/DL, LangChain, web scraping, algorithms, data structures, etc.). "
    "For anything unrelated to Python, respond with exactly: "
    "'I'm a Python-only AI Assistant. Please ask a Python-related question.' "
    "Always wrap Python code in ```python blocks, bash in ```bash, SQL in ```sql, JSON in ```json. "
    "Be concise, educational, and provide working production-quality code."
)

# Valid Gemini models supported by the generateContent API
VALID_GEMINI_MODELS = {
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash-exp",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
}
DEFAULT_MODEL = "gemini-1.5-flash"


def _configure_genai() -> None:
    """Configure the Gemini client with the API key from environment."""
    # Read directly from os.environ to bypass any pydantic-settings caching issues
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not set. "
            "Add it to your .env file locally, or set it as an environment variable on Render."
        )
    genai.configure(api_key=api_key)



async def stream_chat(
    messages: list[dict],
    model: str | None = None,
    temperature: float | None = None,
    max_tokens: int | None = None,
) -> AsyncGenerator[str, None]:
    """
    Async generator that yields text chunks from the Gemini streaming API.
    Prepends the Python-only system prompt automatically.
    """
    _configure_genai()
    settings = get_settings()

    # Sanitize model — fall back to default if it's not a valid Gemini model
    raw_model = model or settings.model
    if raw_model not in VALID_GEMINI_MODELS:
        raw_model = DEFAULT_MODEL
    model_name = raw_model
    temp = temperature if temperature is not None else settings.temperature
    max_tok = max_tokens or settings.max_tokens

    # Build Gemini-format conversation history (exclude system prompt from history)
    gemini_history = []
    for msg in messages[:-1]:  # all but the last (current) user message
        role = "user" if msg["role"] == "user" else "model"
        gemini_history.append({"role": role, "parts": [msg["content"]]})

    # The last message is the current user turn
    current_message = messages[-1]["content"] if messages else ""

    gemini_model = genai.GenerativeModel(
        model_name=model_name,
        system_instruction=SYSTEM_PROMPT,
        generation_config=genai.GenerationConfig(
            temperature=temp,
            max_output_tokens=max_tok,
        ),
    )

    chat_session = gemini_model.start_chat(history=gemini_history)

    response = await chat_session.send_message_async(
        current_message, stream=True
    )

    async for chunk in response:
        if chunk.text:
            yield chunk.text
