import google.generativeai as genai
from app.config import get_settings
from typing import AsyncGenerator

settings = get_settings()

SYSTEM_PROMPT = (
    "You are PyMentor AI, an expert Python tutor. "
    "Answer ONLY Python-related questions (syntax, OOP, async, testing, FastAPI, Flask, Django, "
    "NumPy, Pandas, ML/DL, LangChain, web scraping, algorithms, data structures, etc.). "
    "For anything unrelated to Python, respond with exactly: "
    "'I'm a Python-only AI Assistant. Please ask a Python-related question.' "
    "Always wrap Python code in ```python blocks, bash in ```bash, SQL in ```sql, JSON in ```json. "
    "Be concise, educational, and provide working production-quality code."
)


def _configure_genai() -> None:
    """Configure the Gemini client with the API key."""
    genai.configure(api_key=settings.gemini_api_key)


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

    model_name = model or settings.model
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
