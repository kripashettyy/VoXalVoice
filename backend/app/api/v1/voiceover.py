"""Video voice-over generation endpoint."""
import asyncio
import logging

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from typing import Literal

from app.models.requests import SynthesizeRequest
from app.services.tts_service import VoiceNotFoundError

logger = logging.getLogger(__name__)
router = APIRouter()

VOICEOVER_TIMEOUT_SECONDS = 300

ACCEPTED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".webm", ".mkv"}
ACCEPTED_VIDEO_TYPES = {"video/mp4", "video/quicktime", "video/x-msvideo", "video/webm", "video/x-matroska"}


def _stream_bytes(data: bytes, chunk: int = 65536):
    for i in range(0, len(data), chunk):
        yield data[i : i + chunk]


@router.post(
    "/generate-voiceover",
    tags=["voiceover"],
    summary="Replace a video's audio track with a synthesized TTS voice-over",
    response_description="MP4 video with synthesized voice-over audio",
)
async def generate_voiceover_endpoint(
    video: UploadFile = File(..., description="MP4 (or MOV/AVI/WebM) video file, ≤ 500 MB"),
    script: str = Form(..., min_length=1, max_length=50_000),
    voice_id: str = Form(default="en-US-AriaNeural"),
    pitch: float  = Form(default=1.0, ge=0.5, le=2.0),
    speed: float  = Form(default=1.0, ge=0.5, le=2.5),
    volume: float = Form(default=0.8, ge=0.0, le=1.0),
    tone_preset: Literal["neutral", "warm", "crisp"] = Form(default="neutral"),
    natural_flow: bool  = Form(default=True),
    warmth: float  = Form(default=0.0, ge=0.0, le=1.0),
    clarity: float = Form(default=0.0, ge=0.0, le=1.0),
):
    filename     = video.filename or ""
    ext          = ("." + filename.rsplit(".", 1)[-1].lower()) if "." in filename else ""
    content_type = (video.content_type or "").lower()

    if ext not in ACCEPTED_VIDEO_EXTENSIONS and content_type not in ACCEPTED_VIDEO_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{ext or content_type}'. Please upload an MP4, MOV, AVI, WebM, or MKV file.",
        )

    video_bytes = await video.read()
    if not video_bytes:
        raise HTTPException(status_code=400, detail="Uploaded video is empty.")

    synth_request = SynthesizeRequest(
        text=script, voice_id=voice_id, pitch=pitch, speed=speed, volume=volume,
        tone_preset=tone_preset, natural_flow=natural_flow,
        warmth=warmth, clarity=clarity, output_format="wav",
    )

    from app.services.video_processor import generate_voiceover  # noqa: PLC0415

    try:
        result_bytes, duration = await asyncio.wait_for(
            asyncio.get_running_loop().run_in_executor(None, generate_voiceover, video_bytes, synth_request),
            timeout=VOICEOVER_TIMEOUT_SECONDS,
        )
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Voice-over generation timed out. Try a shorter video or script.")
    except VoiceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        if "ffmpeg" in str(exc).lower():
            raise HTTPException(status_code=503, detail="Video processing is unavailable. ffmpeg may not be installed.")
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception:
        logger.exception("Unexpected error during voiceover generation")
        raise HTTPException(status_code=500, detail="Voice-over generation failed. Please try again.")

    stem         = filename.rsplit(".", 1)[0] if "." in filename else "voiceover"
    out_filename = f"{stem}_voiceover.mp4"

    return StreamingResponse(
        _stream_bytes(result_bytes),
        media_type="video/mp4",
        headers={
            "Content-Disposition": f'attachment; filename="{out_filename}"',
            "X-Video-Duration": f"{duration:.2f}",
            "Content-Length": str(len(result_bytes)),
        },
    )
