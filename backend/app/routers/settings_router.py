from fastapi import APIRouter
from app.models import UserSettings
from app.services import history as history_service

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("", response_model=UserSettings)
async def get_settings():
    """Return the current user settings."""
    return await history_service.get_settings_from_db()


@router.post("", response_model=UserSettings)
async def update_settings(settings: UserSettings):
    """Update and persist user settings."""
    await history_service.save_settings_to_db(settings)
    return settings
