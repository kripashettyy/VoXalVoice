"""Subtitle-to-timed-audio assembler."""
from __future__ import annotations

import io
import logging
import struct
import wave

from app.models.requests import SynthesizeRequest
from app.services.subtitle_parser import SubtitleCue

logger = logging.getLogger(__name__)

MAX_SUBTITLE_CUES = 500
MAX_SUBTITLE_BYTES = 2 * 1024 * 1024  # 2 MB


# ---------------------------------------------------------------------------
# WAV helpers (no extra deps — stdlib wave only)
# ---------------------------------------------------------------------------

def _read_wav_params(data: bytes) -> tuple[int, int, int]:
    """Return (channels, sample_width, framerate) from raw WAV bytes."""
    with wave.open(io.BytesIO(data), "rb") as wf:
        return wf.getnchannels(), wf.getsampwidth(), wf.getframerate()


def _wav_frames(data: bytes) -> bytes:
    """Return raw PCM frames from a WAV byte string."""
    with wave.open(io.BytesIO(data), "rb") as wf:
        return wf.readframes(wf.getnframes())


def _make_silence(channels: int, sample_width: int, framerate: int, duration_ms: int) -> bytes:
    """Return PCM silence for the requested duration."""
    n_frames = int(framerate * duration_ms / 1000)
    return b"\x00" * (n_frames * channels * sample_width)


def _build_wav(pcm: bytes, channels: int, sample_width: int, framerate: int) -> bytes:
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sample_width)
        wf.setframerate(framerate)
        wf.writeframes(pcm)
    return buf.getvalue()



# Public API

def generate_timed_audio(
    cues: list[SubtitleCue],
    synth_request: SynthesizeRequest,
) -> tuple[bytes, float]:
    """
    Synthesize each cue and assemble them into a single timed WAV.

    Returns (wav_bytes, total_duration_seconds).
    """
    if not cues:
        raise ValueError("Subtitle file contains no usable cues.")
    if len(cues) > MAX_SUBTITLE_CUES:
        raise ValueError(
            f"Too many subtitle cues ({len(cues)}). Maximum is {MAX_SUBTITLE_CUES}."
        )

    from app.services.tts_service import synthesize, VoiceNotFoundError  # noqa: PLC0415

    # Synthesise each cue and collect PCM
    cue_audio: list[tuple[SubtitleCue, bytes]] = []
    channels = sample_width = framerate = None

    for cue in cues:
        cue_req = synth_request.model_copy(update={"text": cue.text})
        try:
            buf = synthesize(cue_req)
        except VoiceNotFoundError:
            raise
        except Exception as exc:
            logger.warning("Synthesis failed for cue %d (%r): %s", cue.index, cue.text[:40], exc)
            raise RuntimeError(f"Synthesis failed for cue {cue.index}: {exc}") from exc

        raw = buf.getvalue()
        if not raw:
            logger.warning("Empty audio for cue %d, skipping.", cue.index)
            continue

        ch, sw, fr = _read_wav_params(raw)
        if channels is None:
            channels, sample_width, framerate = ch, sw, fr
        cue_audio.append((cue, raw))

    if not cue_audio:
        raise RuntimeError("All cues produced empty audio.")

    assert channels and sample_width and framerate  # type: ignore[truthy-bool]

    # Determine total timeline length
    last_cue = max(cue_audio, key=lambda x: x[0].end_ms)[0]
    total_ms = last_cue.end_ms

    # Build a flat PCM buffer: silence everywhere, cue audio written at start_ms
    total_frames = int(framerate * total_ms / 1000)
    frame_bytes = channels * sample_width
    pcm_buffer = bytearray(total_frames * frame_bytes)

    for cue, raw in cue_audio:
        cue_pcm = _wav_frames(raw)
        start_frame = int(framerate * cue.start_ms / 1000)
        end_frame = int(framerate * cue.end_ms / 1000)
        slot_frames = end_frame - start_frame

        if slot_frames <= 0:
            continue

        # Fit audio into slot: truncate if too long, pad with silence if short
        cue_frames_available = len(cue_pcm) // frame_bytes
        if cue_frames_available > slot_frames:
            cue_pcm = cue_pcm[: slot_frames * frame_bytes]
        elif cue_frames_available < slot_frames:
            padding = _make_silence(channels, sample_width, framerate,
                                    (slot_frames - cue_frames_available) * 1000 // framerate)
            cue_pcm = cue_pcm + padding

        write_start = start_frame * frame_bytes
        write_end = write_start + len(cue_pcm)
        if write_end > len(pcm_buffer):
            cue_pcm = cue_pcm[: len(pcm_buffer) - write_start]
            write_end = len(pcm_buffer)

        pcm_buffer[write_start:write_end] = cue_pcm

    wav_bytes = _build_wav(bytes(pcm_buffer), channels, sample_width, framerate)
    duration_seconds = total_ms / 1000.0
    return wav_bytes, duration_seconds
