from openai import AsyncOpenAI
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


def _make_client() -> AsyncOpenAI:
    return AsyncOpenAI(
        api_key=settings.groq_api_key,
        base_url=settings.groq_base_url,
    )


async def stream_chat(
    messages: list[dict],
    model: str | None = None,
    temperature: float | None = None,
    max_tokens: int | None = None,
) -> AsyncGenerator[str, None]:
    """
    Async generator that yields text chunks from the Grok streaming API.
    Prepends the Python-only system prompt automatically.
    """
    client = _make_client()

    all_messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages

    stream = await client.chat.completions.create(
        model=model or settings.model,
        messages=all_messages,
        temperature=temperature if temperature is not None else settings.temperature,
        max_tokens=max_tokens or settings.max_tokens,
        stream=True,
    )

    async for chunk in stream:
        delta = chunk.choices[0].delta
        if delta.content:
            yield delta.content
