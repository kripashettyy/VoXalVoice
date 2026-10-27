"""Voice analysis endpoint — POST /api/v1/analyze-voice."""
import logging

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel

from app.services.voice_analyzer import analyse_voice

logger = logging.getLogger(__name__)
router = APIRouter()

MAX_AUDIO_BYTES = 20 * 1024 * 1024   # 20 MB


class AnalyzeVoiceResponse(BaseModel):
    voice_id: str
    voice_name: str
    gender: str
    confidence: float

    # Suggested synthesis params — ready to POST to /synthesize
    pitch: float
    speed: float
    volume: float
    warmth: float
    clarity: float
    tone_preset: str

    # Raw measurements (for display in UI)
    measured_pitch_hz: float
    measured_energy_rms: float
    measured_speaking_rate: float


@router.post(
    "/analyze-voice",
    response_model=AnalyzeVoiceResponse,
    tags=["voice-lab"],
    summary="Analyse a voice recording and suggest matching TTS parameters",
)
async def analyze_voice_endpoint(file: UploadFile = File(...)):
    """
    Upload a WAV or WebM audio recording of the user's voice.
    Returns the closest-matching neural voice and suggested synthesis parameters.

    - Accepts: audio/wav, audio/webm, audio/ogg (browser MediaRecorder output)
    - Max size: 20 MB
    - Min duration: ~2 seconds of speech
    """
    data = await file.read()

    if len(data) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(data) > MAX_AUDIO_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Recording is too large ({len(data) // (1024*1024)} MB). Maximum is 20 MB.",
        )

    try:
        result = analyse_voice(data)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        logger.exception("Voice analysis runtime error")
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception:
        logger.exception("Unexpected voice analysis error")
        raise HTTPException(
            status_code=500,
            detail="Voice analysis failed. Please try again with a clearer recording.",
        )

    return AnalyzeVoiceResponse(
        voice_id=result.voice_id,
        voice_name=result.voice_name,
        gender=result.gender,
        confidence=result.confidence,
        pitch=result.pitch,
        speed=result.speed,
        volume=result.volume,
        warmth=result.warmth,
        clarity=result.clarity,
        tone_preset=result.tone_preset,
        measured_pitch_hz=result.measured_pitch_hz,
        measured_energy_rms=result.measured_energy_rms,
        measured_speaking_rate=result.measured_speaking_rate,
    )
