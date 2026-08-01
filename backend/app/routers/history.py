from fastapi import APIRouter, HTTPException
from app.models import ConversationSummary, ConversationDetail, RenameRequest
from app.services import history as history_service

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("", response_model=list[ConversationSummary])
async def list_conversations():
    """Return all conversations ordered by most recent."""
    return await history_service.get_all_conversations()


@router.get("/{conv_id}", response_model=ConversationDetail)
async def get_conversation(conv_id: str):
    """Return a conversation with all its messages."""
    conv = await history_service.get_conversation(conv_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


@router.patch("/{conv_id}", response_model=dict)
async def rename_conversation(conv_id: str, body: RenameRequest):
    """Rename a conversation."""
    success = await history_service.rename_conversation(conv_id, body.title)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"ok": True}


@router.delete("/{conv_id}", response_model=dict)
async def delete_conversation(conv_id: str):
    """Delete a conversation and all its messages."""
    success = await history_service.delete_conversation(conv_id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"ok": True}
