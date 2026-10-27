"""Subtitle-to-timed-voice-over endpoint."""
import asyncio
import logging
from typing import Literal

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from app.models.requests import SynthesizeRequest
from app.services.tts_service import VoiceNotFoundError

logger = logging.getLogger(__name__)
router = APIRouter()

SUBTITLE_TIMEOUT_SECONDS = 600  # cue synthesis is sequential; allow up to 10 min

ACCEPTED_EXTENSIONS = {".srt", ".vtt"}
MAX_FILE_BYTES = 2 * 1024 * 1024  # 2 MB


def _stream_bytes(data: bytes, chunk: int = 65536):
    for i in range(0, len(data), chunk):
        yield data[i : i + chunk]


@router.post(
    "/subtitle-to-voice",
    tags=["subtitle"],
    summary="Generate a timed WAV audio track from an SRT or VTT subtitle file",
    response_description="WAV audio with synthesized speech placed at subtitle timestamps",
)
async def subtitle_to_voice_endpoint(
    subtitle: UploadFile = File(..., description=".srt or .vtt subtitle file, ≤ 2 MB"),
    voice_id: str = Form(default="en-US-AriaNeural"),
    pitch: float = Form(default=1.0, ge=0.5, le=2.0),
    speed: float = Form(default=1.0, ge=0.5, le=2.5),
    volume: float = Form(default=0.8, ge=0.0, le=1.0),
    tone_preset: Literal["neutral", "warm", "crisp"] = Form(default="neutral"),
    natural_flow: bool = Form(default=True),
    warmth: float = Form(default=0.0, ge=0.0, le=1.0),
    clarity: float = Form(default=0.0, ge=0.0, le=1.0),
):
    filename = subtitle.filename or ""
    ext = ("." + filename.rsplit(".", 1)[-1].lower()) if "." in filename else ""

    if ext not in ACCEPTED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{ext or filename}'. Please upload an .srt or .vtt file.",
        )

    raw = await subtitle.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Uploaded subtitle file is empty.")
    if len(raw) > MAX_FILE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({len(raw) // 1024} KB). Maximum allowed size is 2 MB.",
        )

    try:
        content = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise HTTPException(status_code=422, detail="Could not decode the subtitle file as UTF-8.")

    from app.services.subtitle_parser import parse_subtitle_file  # noqa: PLC0415
    from app.services.subtitle_processor import generate_timed_audio  # noqa: PLC0415

    try:
        cues = parse_subtitle_file(filename, content)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    if not cues:
        raise HTTPException(status_code=422, detail="No subtitle cues found in the file.")

    synth_request = SynthesizeRequest(
        text=cues[0].text,  # placeholder — processor overrides per cue
        voice_id=voice_id,
        pitch=pitch,
        speed=speed,
        volume=volume,
        tone_preset=tone_preset,
        natural_flow=natural_flow,
        warmth=warmth,
        clarity=clarity,
        output_format="wav",
    )

    try:
        wav_bytes, duration = await asyncio.wait_for(
            asyncio.get_running_loop().run_in_executor(
                None, generate_timed_audio, cues, synth_request
            ),
            timeout=SUBTITLE_TIMEOUT_SECONDS,
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail="Audio generation timed out. Try a shorter subtitle file.",
        )
    except VoiceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception:
        logger.exception("Unexpected error during subtitle-to-voice generation")
        raise HTTPException(status_code=500, detail="Audio generation failed. Please try again.")

    stem = filename.rsplit(".", 1)[0] if "." in filename else "subtitle"
    out_filename = f"{stem}_voiced.wav"

    return StreamingResponse(
        _stream_bytes(wav_bytes),
        media_type="audio/wav",
        headers={
            "Content-Disposition": f'attachment; filename="{out_filename}"',
            "X-Audio-Duration": f"{duration:.2f}",
            "X-Cue-Count": str(len(cues)),
            "Content-Length": str(len(wav_bytes)),
        },
    )
