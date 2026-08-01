import json
import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.models import ChatRequest
from app.services import grok as grok_service
from app.services import history as history_service

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("")
async def chat(request: ChatRequest):
    """
    Stream a Grok response as Server-Sent Events.
    Each SSE event contains one JSON object: {"token": "..."}.
    A final event {"done": true, "conversation_id": "..."} signals completion.
    """
    # Resolve or create conversation
    conv_id = request.conversation_id
    if not conv_id:
        conv_id = await history_service.create_conversation()

    # Auto-title from first message
    await history_service.update_conversation_title_from_message(conv_id, request.message)

    # Persist user message
    await history_service.add_message(conv_id, "user", request.message)

    # Load full history for context window
    history_messages = await history_service.get_messages(conv_id)
    messages_payload = [{"role": m.role, "content": m.content} for m in history_messages]

    async def event_generator():
        full_response: list[str] = []
        try:
            async for token in grok_service.stream_chat(
                messages=messages_payload,
                model=request.model,
                temperature=request.temperature,
                max_tokens=request.max_tokens,
            ):
                full_response.append(token)
                payload = json.dumps({"token": token})
                yield f"data: {payload}\n\n"

            # Persist assistant reply
            assistant_content = "".join(full_response)
            await history_service.add_message(conv_id, "assistant", assistant_content)

            # Send completion event
            done_payload = json.dumps({"done": True, "conversation_id": conv_id})
            yield f"data: {done_payload}\n\n"

        except Exception as e:
            err_payload = json.dumps({"error": str(e)})
            yield f"data: {err_payload}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
