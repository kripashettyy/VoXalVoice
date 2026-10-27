"""Synthesis and preview endpoints."""
import asyncio
import logging

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from app.models.requests import SynthesizeRequest, PreviewRequest
from app.services.tts_service import synthesize, VoiceNotFoundError

logger = logging.getLogger(__name__)
router = APIRouter()

SYNTHESIS_TIMEOUT_SECONDS = 300  # 5 minutes — sufficient for up to 50k chars


def _voice_exists(voice_id: str) -> bool:
    try:
        from app.services.voice_registry import get_voices
        ids = {v.id for v in get_voices()}
        # Fail-open: if registry returned empty (network error/cold start),
        # don't block the request with a false 404.
        return (not ids) or (voice_id in ids)
    except Exception:
        return True  # Don't block on registry errors


def _stream_audio(buf):
    buf.seek(0)
    while True:
        chunk = buf.read(65536)
        if not chunk:
            break
        yield chunk


@router.post("/synthesize", tags=["synthesis"])
async def synthesize_endpoint(request_body: SynthesizeRequest, request: Request):
    """Synthesize full text to WAV audio."""
    if request_body.output_format != "wav":
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported output format '{request_body.output_format}'. Supported formats: wav"
        )

    if not _voice_exists(request_body.voice_id):
        raise HTTPException(
            status_code=404,
            detail=f"Voice ID '{request_body.voice_id}' is not available. Refresh the page to reload the voice list."
        )

    try:
        audio_buf = await asyncio.wait_for(
            asyncio.get_running_loop().run_in_executor(None, synthesize, request_body),
            timeout=SYNTHESIS_TIMEOUT_SECONDS,
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail="Audio generation timed out. Try shorter text or a simpler voice setting."
        )
    except VoiceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        err = str(exc)
        if "unavailable" in err.lower() or "espeak" in err.lower():
            raise HTTPException(status_code=503, detail="Speech synthesis is temporarily unavailable. Please try again in a moment.")
        raise HTTPException(status_code=500, detail="Audio generation failed. Please try again.")
    except Exception as exc:
        logger.exception("Unexpected synthesis error")
        raise HTTPException(status_code=500, detail="Audio generation failed. Please try again.")

    return StreamingResponse(
        _stream_audio(audio_buf),
        media_type="audio/wav",
        headers={"Content-Disposition": "inline; filename=output.wav"},
    )


@router.post("/preview", tags=["synthesis"])
async def preview_endpoint(request_body: PreviewRequest, request: Request):
    """Synthesize preview (first 200 chars) to WAV audio."""
    # Truncate text to 200 characters at service boundary
    truncated = request_body.model_copy(update={"text": request_body.text[:200]})

    if not _voice_exists(truncated.voice_id):
        raise HTTPException(
            status_code=404,
            detail=f"Voice ID '{truncated.voice_id}' is not available. Refresh the page to reload the voice list."
        )

    try:
        audio_buf = await asyncio.wait_for(
            asyncio.get_running_loop().run_in_executor(None, synthesize, truncated),
            timeout=SYNTHESIS_TIMEOUT_SECONDS,
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail="Audio generation timed out. Try shorter text or a simpler voice setting."
        )
    except VoiceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        logger.exception("Preview synthesis error")
        raise HTTPException(status_code=500, detail="Preview generation failed. Please try again.")

    return StreamingResponse(
        _stream_audio(audio_buf),
        media_type="audio/wav",
        headers={"Content-Disposition": "inline; filename=preview.wav"},
    )
