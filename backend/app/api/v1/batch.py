"""Batch text-to-speech endpoint."""
import asyncio
import logging
from typing import Literal

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from app.models.requests import SynthesizeRequest
from app.services.tts_service import VoiceNotFoundError

logger = logging.getLogger(__name__)
router = APIRouter()

BATCH_TIMEOUT_SECONDS = 600
MAX_FILE_BYTES = 1 * 1024 * 1024  # 1 MB
ACCEPTED_EXTENSIONS = {".txt", ".csv"}


def _stream_bytes(data: bytes, chunk: int = 65536):
    for i in range(0, len(data), chunk):
        yield data[i : i + chunk]


@router.post(
    "/batch-synthesize",
    tags=["batch"],
    summary="Synthesize multiple texts from a .txt or .csv file and return a ZIP of WAVs",
)
async def batch_synthesize_endpoint(
    file: UploadFile = File(..., description=".txt or .csv file, ≤ 1 MB"),
    voice_id: str = Form(default="en-US-AriaNeural"),
    pitch: float = Form(default=1.0, ge=0.5, le=2.0),
    speed: float = Form(default=1.0, ge=0.5, le=2.5),
    volume: float = Form(default=0.8, ge=0.0, le=1.0),
    tone_preset: Literal["neutral", "warm", "crisp"] = Form(default="neutral"),
    natural_flow: bool = Form(default=True),
    warmth: float = Form(default=0.0, ge=0.0, le=1.0),
    clarity: float = Form(default=0.0, ge=0.0, le=1.0),
):
    filename = file.filename or ""
    ext = ("." + filename.rsplit(".", 1)[-1].lower()) if "." in filename else ""

    if ext not in ACCEPTED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{ext or filename}'. Upload a .txt or .csv file.",
        )

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(raw) > MAX_FILE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({len(raw) // 1024} KB). Maximum is 1 MB.",
        )

    try:
        content = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise HTTPException(status_code=422, detail="Could not decode the file as UTF-8.")

    from app.services.batch_processor import parse_batch_file, generate_batch  # noqa: PLC0415

    try:
        entries = parse_batch_file(filename, content)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    synth_request = SynthesizeRequest(
        text=entries[0],
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
        zip_bytes, success_count = await asyncio.wait_for(
            asyncio.get_running_loop().run_in_executor(
                None, generate_batch, entries, synth_request
            ),
            timeout=BATCH_TIMEOUT_SECONDS,
        )
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Batch generation timed out. Try fewer entries.")
    except VoiceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception:
        logger.exception("Unexpected error during batch synthesis")
        raise HTTPException(status_code=500, detail="Batch synthesis failed. Please try again.")

    stem = filename.rsplit(".", 1)[0] if "." in filename else "batch"
    out_filename = f"{stem}_voices.zip"

    return StreamingResponse(
        _stream_bytes(zip_bytes),
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="{out_filename}"',
            "X-Entry-Count": str(len(entries)),
            "X-Success-Count": str(success_count),
            "Content-Length": str(len(zip_bytes)),
        },
    )
