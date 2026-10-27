"""Multi-voice dialogue generation endpoint."""
import asyncio
import json
import logging
from typing import Literal

from fastapi import APIRouter, Form, HTTPException
from fastapi.responses import StreamingResponse

from app.services.tts_service import VoiceNotFoundError

logger = logging.getLogger(__name__)
router = APIRouter()

DIALOGUE_TIMEOUT_SECONDS = 600
MAX_SCRIPT_CHARS = 50_000


def _stream_bytes(data: bytes, chunk: int = 65536):
    for i in range(0, len(data), chunk):
        yield data[i : i + chunk]


def _parse_turns(raw: str) -> list[dict]:
    try:
        turns = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON in turns field: {exc}") from exc
    if not isinstance(turns, list):
        raise ValueError("turns must be a JSON array.")
    if len(turns) == 0:
        raise ValueError("turns array is empty.")
    for i, t in enumerate(turns):
        if not isinstance(t, dict):
            raise ValueError(f"Turn {i} is not an object.")
        if not t.get("text", "").strip():
            raise ValueError(f"Turn {i} has empty text.")
        if not t.get("voice_id", "").strip():
            raise ValueError(f"Turn {i} is missing voice_id.")
    return turns


@router.post(
    "/generate-dialogue",
    tags=["dialogue"],
    summary="Generate a multi-voice dialogue WAV from a script",
    response_description="WAV audio with each speaker synthesized in their assigned voice",
)
async def generate_dialogue_endpoint(
    turns: str = Form(..., description="JSON array of turn objects"),
    pause_ms: int = Form(default=400, ge=0, le=3000),
):
    try:
        turn_list = _parse_turns(turns)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    total_chars = sum(len(t.get("text", "")) for t in turn_list)
    if total_chars > MAX_SCRIPT_CHARS:
        raise HTTPException(
            status_code=413,
            detail=f"Total script length ({total_chars} chars) exceeds limit of {MAX_SCRIPT_CHARS}.",
        )

    from app.services.dialogue_processor import generate_dialogue  # noqa: PLC0415

    try:
        wav_bytes, duration = await asyncio.wait_for(
            asyncio.get_running_loop().run_in_executor(
                None, generate_dialogue, turn_list, pause_ms
            ),
            timeout=DIALOGUE_TIMEOUT_SECONDS,
        )
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Dialogue generation timed out. Try a shorter script.")
    except VoiceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception:
        logger.exception("Unexpected error during dialogue generation")
        raise HTTPException(status_code=500, detail="Dialogue generation failed. Please try again.")

    return StreamingResponse(
        _stream_bytes(wav_bytes),
        media_type="audio/wav",
        headers={
            "Content-Disposition": 'attachment; filename="dialogue.wav"',
            "X-Audio-Duration": f"{duration:.2f}",
            "X-Turn-Count": str(len(turn_list)),
            "Content-Length": str(len(wav_bytes)),
        },
    )
