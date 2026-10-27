"""Multi-voice dialogue assembler."""
from __future__ import annotations

import io
import logging
import wave

from app.models.requests import SynthesizeRequest

logger = logging.getLogger(__name__)

MAX_TURNS = 100
MAX_SCRIPT_CHARS = 50_000
DEFAULT_PAUSE_MS = 400


def _make_silence(channels: int, sample_width: int, framerate: int, ms: int) -> bytes:
    n_frames = int(framerate * ms / 1000)
    return b"\x00" * (n_frames * channels * sample_width)


def _wav_params(data: bytes) -> tuple[int, int, int]:
    with wave.open(io.BytesIO(data), "rb") as wf:
        return wf.getnchannels(), wf.getsampwidth(), wf.getframerate()


def _wav_frames(data: bytes) -> bytes:
    with wave.open(io.BytesIO(data), "rb") as wf:
        return wf.readframes(wf.getnframes())


def _build_wav(pcm: bytes, channels: int, sample_width: int, framerate: int) -> bytes:
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sample_width)
        wf.setframerate(framerate)
        wf.writeframes(pcm)
    return buf.getvalue()


def generate_dialogue(
    turns: list[dict],
    pause_ms: int = DEFAULT_PAUSE_MS,
) -> tuple[bytes, float]:
    """
    Synthesize each dialogue turn and concatenate into one WAV.

    Each turn dict must have: text, voice_id, pitch, speed, volume,
    tone_preset, natural_flow, warmth, clarity.

    Returns (wav_bytes, duration_seconds).
    """
    from app.services.tts_service import synthesize, VoiceNotFoundError  # noqa: PLC0415

    if not turns:
        raise ValueError("Dialogue has no turns.")
    if len(turns) > MAX_TURNS:
        raise ValueError(f"Too many turns ({len(turns)}). Maximum is {MAX_TURNS}.")

    segments: list[bytes] = []
    channels = sample_width = framerate = None

    for i, turn in enumerate(turns):
        text = turn.get("text", "").strip()
        if not text:
            logger.warning("Turn %d has empty text, skipping.", i)
            continue

        params = SynthesizeRequest(
            text=text,
            voice_id=turn["voice_id"],
            pitch=float(turn.get("pitch", 1.0)),
            speed=float(turn.get("speed", 1.0)),
            volume=float(turn.get("volume", 0.8)),
            tone_preset=turn.get("tone_preset", "neutral"),
            natural_flow=bool(turn.get("natural_flow", True)),
            warmth=float(turn.get("warmth", 0.0)),
            clarity=float(turn.get("clarity", 0.0)),
            output_format="wav",
        )

        try:
            buf = synthesize(params)
        except VoiceNotFoundError:
            raise
        except Exception as exc:
            raise RuntimeError(f"Synthesis failed for turn {i + 1} ({turn.get('speaker', '')}): {exc}") from exc

        raw = buf.getvalue()
        if not raw:
            logger.warning("Turn %d returned empty audio, skipping.", i)
            continue

        ch, sw, fr = _wav_params(raw)
        if channels is None:
            channels, sample_width, framerate = ch, sw, fr

        segments.append(_wav_frames(raw))

    if not segments:
        raise RuntimeError("All turns produced empty audio.")

    assert channels and sample_width and framerate
    pause_pcm = _make_silence(channels, sample_width, framerate, pause_ms)

    combined = b""
    for idx, seg in enumerate(segments):
        combined += seg
        if idx < len(segments) - 1:
            combined += pause_pcm

    wav_bytes = _build_wav(combined, channels, sample_width, framerate)
    n_frames = len(combined) // (channels * sample_width)
    duration = n_frames / framerate
    return wav_bytes, duration
