import asyncio
import logging
from typing import Literal, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse, StreamingResponse

from app.models.requests import SynthesizeRequest
from app.services.tts_service import VoiceNotFoundError

logger = logging.getLogger(__name__)
router = APIRouter()

REELS_TIMEOUT_SECONDS = 600

ACCEPTED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".webm", ".mkv"}
ACCEPTED_VIDEO_TYPES = {
    "video/mp4", "video/quicktime", "video/x-msvideo",
    "video/webm", "video/x-matroska",
}
ACCEPTED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".aac", ".m4a", ".ogg"}
ACCEPTED_AUDIO_TYPES = {
    "audio/mpeg", "audio/wav", "audio/aac",
    "audio/mp4", "audio/ogg", "audio/x-m4a",
}
MAX_MUSIC_BYTES = 50 * 1024 * 1024  # 50 MB


def _stream_bytes(data: bytes, chunk: int = 65536):
    for i in range(0, len(data), chunk):
        yield data[i : i + chunk]


@router.get(
    "/music-tracks",
    tags=["reels"],
    summary="List available built-in background music tracks",
)
async def list_music_tracks():
    from app.services.reels_processor import get_available_tracks
    return JSONResponse(content={"tracks": get_available_tracks()})


@router.post(
    "/reels-voiceover",
    tags=["reels"],
    summary="Generate a Reels/Shorts-ready MP4 with TTS voice-over, optional captions and background music",
)
async def reels_voiceover_endpoint(
    video: UploadFile = File(..., description="Vertical video (9:16). MP4/MOV/AVI/WebM/MKV, ≤ 500 MB."),
    script: str = Form(..., min_length=1, max_length=50_000),
    voice_id: str = Form(default="en-US-AriaNeural"),
    pitch: float = Form(default=1.0, ge=0.5, le=2.0),
    speed: float = Form(default=1.0, ge=0.5, le=2.5),
    volume: float = Form(default=0.8, ge=0.0, le=1.0),
    tone_preset: Literal["neutral", "warm", "crisp"] = Form(default="neutral"),
    natural_flow: bool = Form(default=True),
    warmth: float = Form(default=0.0, ge=0.0, le=1.0),
    clarity: float = Form(default=0.0, ge=0.0, le=1.0),
    burn_captions: bool = Form(default=False),
    caption_style: Literal["default", "bold", "minimal"] = Form(default="default"),
    music_source: Literal["none", "builtin", "upload"] = Form(default="none"),
    music_track_id: str = Form(default=""),
    music_file: Optional[UploadFile] = File(default=None, description="Custom background music, ≤ 50 MB."),
    music_volume: float = Form(default=0.3, ge=0.0, le=1.0),
    ducking: bool = Form(default=True),
    fade_in: bool = Form(default=True),
    fade_out: bool = Form(default=True),
):
    filename = video.filename or ""
    ext = ("." + filename.rsplit(".", 1)[-1].lower()) if "." in filename else ""
    content_type = (video.content_type or "").lower()

    if ext not in ACCEPTED_VIDEO_EXTENSIONS and content_type not in ACCEPTED_VIDEO_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported video format '{ext or content_type}'. Upload MP4, MOV, AVI, WebM or MKV.",
        )

    video_bytes = await video.read()
    if not video_bytes:
        raise HTTPException(status_code=400, detail="Uploaded video is empty.")

    music_bytes: bytes | None = None
    if music_source == "upload" and music_file is not None:
        music_filename = music_file.filename or ""
        music_ext = ("." + music_filename.rsplit(".", 1)[-1].lower()) if "." in music_filename else ""
        music_ct = (music_file.content_type or "").lower()
        if music_ext not in ACCEPTED_AUDIO_EXTENSIONS and music_ct not in ACCEPTED_AUDIO_TYPES:
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported audio format '{music_ext or music_ct}'. Upload MP3, WAV, AAC, M4A or OGG.",
            )
        music_bytes = await music_file.read()
        if not music_bytes:
            raise HTTPException(status_code=400, detail="Uploaded music file is empty.")
        if len(music_bytes) > MAX_MUSIC_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"Music file too large ({len(music_bytes) // (1024 * 1024)} MB). Maximum is 50 MB.",
            )
    elif music_source == "upload" and music_file is None:
        raise HTTPException(status_code=400, detail="music_source is 'upload' but no music_file was provided.")

    synth_request = SynthesizeRequest(
        text=script, voice_id=voice_id, pitch=pitch, speed=speed,
        volume=volume, tone_preset=tone_preset, natural_flow=natural_flow,
        warmth=warmth, clarity=clarity, output_format="wav",
    )

    from app.services.reels_processor import generate_reels_voiceover  # noqa: PLC0415

    try:
        result_bytes, duration, music_mixed = await asyncio.wait_for(
            asyncio.get_running_loop().run_in_executor(
                None,
                generate_reels_voiceover,
                video_bytes, synth_request,
                burn_captions, caption_style,
                music_source, music_track_id, music_bytes,
                music_volume, ducking, fade_in, fade_out,
            ),
            timeout=REELS_TIMEOUT_SECONDS,
        )
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Reels generation timed out. Try a shorter video or script.")
    except VoiceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        if "ffmpeg" in str(exc).lower():
            raise HTTPException(status_code=503, detail="Video processing unavailable. ffmpeg may not be installed.")
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception:
        logger.exception("Unexpected error during reels voiceover generation")
        raise HTTPException(status_code=500, detail="Reels voiceover generation failed. Please try again.")

    stem = filename.rsplit(".", 1)[0] if "." in filename else "reels"

    return StreamingResponse(
        _stream_bytes(result_bytes),
        media_type="video/mp4",
        headers={
            "Content-Disposition": f'attachment; filename="{stem}_reels.mp4"',
            "X-Video-Duration": f"{duration:.2f}",
            "X-Captions-Burned": str(burn_captions).lower(),
            "X-Music-Mixed": str(music_mixed).lower(),
            "Content-Length": str(len(result_bytes)),
        },
    )
