"""Batch text-to-speech processor — synthesizes each entry and zips the WAVs."""
import csv
import io
import logging
import re
import zipfile

from app.models.requests import SynthesizeRequest

logger = logging.getLogger(__name__)

MAX_ENTRIES = 200
MAX_ENTRY_CHARS = 5_000


def _parse_txt(content: str) -> list[str]:
    lines = [l.strip() for l in content.splitlines()]
    return [l for l in lines if l]


def _parse_csv(content: str) -> list[str]:
    reader = csv.reader(io.StringIO(content))
    entries: list[str] = []
    for row in reader:
        if not row:
            continue
        text = row[0].strip()
        if text:
            entries.append(text)
    return entries


def parse_batch_file(filename: str, content: str) -> list[str]:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext == "txt":
        entries = _parse_txt(content)
    elif ext == "csv":
        entries = _parse_csv(content)
    else:
        raise ValueError(f"Unsupported file type '.{ext}'. Upload a .txt or .csv file.")

    if not entries:
        raise ValueError("No entries found in the file.")
    if len(entries) > MAX_ENTRIES:
        raise ValueError(f"Too many entries ({len(entries)}). Maximum is {MAX_ENTRIES}.")

    for i, e in enumerate(entries):
        if len(e) > MAX_ENTRY_CHARS:
            raise ValueError(
                f"Entry {i + 1} is too long ({len(e)} chars). Maximum is {MAX_ENTRY_CHARS} per entry."
            )

    return entries


def _safe_filename(text: str, index: int) -> str:
    slug = re.sub(r"[^\w\s-]", "", text[:40]).strip()
    slug = re.sub(r"[\s_-]+", "_", slug).strip("_")
    return f"{index:03d}_{slug or 'entry'}.wav"


def generate_batch(entries: list[str], synth_request: SynthesizeRequest) -> tuple[bytes, int]:
    """Synthesize each entry and return a ZIP archive + count of successful files."""
    from app.services.tts_service import synthesize, VoiceNotFoundError  # noqa: PLC0415

    zip_buf = io.BytesIO()
    success = 0

    with zipfile.ZipFile(zip_buf, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        for i, text in enumerate(entries):
            req = synth_request.model_copy(update={"text": text})
            try:
                wav_buf = synthesize(req)
            except VoiceNotFoundError:
                raise
            except Exception as exc:
                logger.warning("Batch entry %d failed: %s", i + 1, exc)
                continue

            wav_bytes = wav_buf.getvalue()
            if not wav_bytes:
                logger.warning("Batch entry %d returned empty audio, skipping.", i + 1)
                continue

            fname = _safe_filename(text, i + 1)
            zf.writestr(fname, wav_bytes)
            success += 1

    if success == 0:
        raise RuntimeError("All entries failed to synthesize. Check the voice settings and try again.")

    return zip_buf.getvalue(), success
