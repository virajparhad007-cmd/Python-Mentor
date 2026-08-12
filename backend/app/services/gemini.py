import os
from google import genai
from google.genai import types
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

# Valid Gemini models supported by this API key
VALID_GEMINI_MODELS = {
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.5-pro",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-pro-latest",
}
DEFAULT_MODEL = "gemini-3.6-flash"


def _get_client() -> genai.Client:
    """Create a Gemini client with the API key from environment."""
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not set. "
            "Add it to your .env file locally, or set it as an environment variable on Render."
        )
    return genai.Client(api_key=api_key)


async def stream_chat(
    messages: list[dict],
    model: str | None = None,
    temperature: float | None = None,
    max_tokens: int | None = None,
) -> AsyncGenerator[str, None]:
    """
    Async generator that yields text chunks from the Gemini streaming API.
    Prepends the Python-only system prompt automatically.
    Uses the new google-genai SDK (v1 API endpoint).
    """
    client = _get_client()
    settings = get_settings()

    # Sanitize model — fall back to default if not a valid Gemini model
    raw_model = model or settings.model
    if raw_model not in VALID_GEMINI_MODELS:
        raw_model = DEFAULT_MODEL
    model_name = raw_model

    temp = temperature if temperature is not None else settings.temperature
    max_tok = max_tokens or settings.max_tokens

    # Build conversation history in google-genai format
    contents: list[types.Content] = []
    for msg in messages[:-1]:  # all but the last (current) user message
        role = "user" if msg["role"] == "user" else "model"
        contents.append(
            types.Content(role=role, parts=[types.Part(text=msg["content"])])
        )

    # Add the current user message
    current_message = messages[-1]["content"] if messages else ""
    contents.append(
        types.Content(role="user", parts=[types.Part(text=current_message)])
    )

    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        temperature=temp,
        max_output_tokens=max_tok,
    )

    async for chunk in await client.aio.models.generate_content_stream(
        model=model_name,
        contents=contents,
        config=config,
    ):
        if chunk.text:
            yield chunk.text
