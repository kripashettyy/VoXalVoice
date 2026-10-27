"""Voice listing endpoint."""
from fastapi import APIRouter
from typing import List
from app.models.responses import VoiceInfo
from app.services.voice_registry import get_voices

router = APIRouter()


@router.get("/voices", response_model=List[VoiceInfo], tags=["voices"])
async def list_voices() -> List[VoiceInfo]:
    """Return all available TTS voices."""
    return get_voices()
