"""Video voice-over processor service."""
from __future__ import annotations

import io
import logging
import os
import subprocess
import tempfile

from app.models.requests import SynthesizeRequest

logger = logging.getLogger(__name__)

MAX_VIDEO_BYTES = 500 * 1024 * 1024
RECOMMENDED_MAX_SECONDS = 60


def _ffmpeg_bin() -> str:
    for candidate in ("ffmpeg", "ffmpeg.exe"):
        try:
            result = subprocess.run([candidate, "-version"], capture_output=True, timeout=5)
            if result.returncode == 0:
                return candidate
        except (FileNotFoundError, subprocess.TimeoutExpired):
            pass

    winget_bin = os.path.join(
        os.environ.get("LOCALAPPDATA", ""),
        r"Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe"
        r"\ffmpeg-9.0.2-full_build\bin\ffmpeg.exe",
    )
    if os.path.isfile(winget_bin):
        return winget_bin

    raise RuntimeError("ffmpeg not found. Make sure ffmpeg is installed and available on PATH.")


def _get_video_duration(video_path: str) -> float:
    ffprobe = _ffmpeg_bin().replace("ffmpeg", "ffprobe").replace("ffmpeg.exe", "ffprobe.exe")
    try:
        result = subprocess.run(
            [ffprobe, "-v", "error", "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1", video_path],
            capture_output=True, text=True, timeout=15,
        )
        return float(result.stdout.strip())
    except Exception:
        return 0.0


def _strip_audio(video_path: str, silent_path: str) -> None:
    result = subprocess.run(
        [_ffmpeg_bin(), "-y", "-i", video_path, "-an", "-c:v", "copy", silent_path],
        capture_output=True, timeout=120,
    )
    if result.returncode != 0:
        logger.error("ffmpeg strip-audio failed: %s", result.stderr.decode(errors="replace"))
        raise RuntimeError("Failed to process video. The file may be corrupted or unsupported.")


def _mux_video_audio(silent_video: str, audio_wav: str, output_path: str) -> None:
    result = subprocess.run(
        [
            _ffmpeg_bin(), "-y",
            "-i", silent_video,
            "-i", audio_wav,
            "-c:v", "copy",
            "-c:a", "aac", "-b:a", "128k",
            "-map", "0:v:0",
            "-map", "1:a:0",
            "-shortest",
            output_path,
        ],
        capture_output=True, timeout=180,
    )
    if result.returncode != 0:
        logger.error("ffmpeg mux failed: %s", result.stderr.decode(errors="replace"))
        raise RuntimeError("Failed to combine video and audio. Please try again.")


def generate_voiceover(
    video_bytes: bytes,
    synth_request: SynthesizeRequest,
) -> tuple[bytes, float]:
    """Generate a voiced-over MP4. Returns (mp4_bytes, duration_seconds)."""
    if not video_bytes:
        raise ValueError("Uploaded video is empty.")

    if len(video_bytes) > MAX_VIDEO_BYTES:
        raise ValueError(
            f"Video is too large ({len(video_bytes) // (1024 * 1024)} MB). "
            "Maximum allowed size is 500 MB."
        )

    from app.services.tts_service import synthesize, VoiceNotFoundError  # noqa: PLC0415

    try:
        audio_buf: io.BytesIO = synthesize(synth_request)
    except (VoiceNotFoundError, ValueError, RuntimeError):
        raise
    except Exception as exc:
        logger.exception("TTS synthesis failed during voiceover generation")
        raise RuntimeError("Voice synthesis failed. Please try again.") from exc

    audio_bytes = audio_buf.getvalue()
    if not audio_bytes:
        raise RuntimeError("Voice synthesis returned no audio.")

    with tempfile.TemporaryDirectory(prefix="vv_voiceover_") as tmp:
        video_in   = os.path.join(tmp, "input.mp4")
        silent_mp4 = os.path.join(tmp, "silent.mp4")
        audio_wav  = os.path.join(tmp, "voice.wav")
        output_mp4 = os.path.join(tmp, "output.mp4")

        with open(video_in, "wb") as f:
            f.write(video_bytes)
        with open(audio_wav, "wb") as f:
            f.write(audio_bytes)

        duration = _get_video_duration(video_in)
        if duration > RECOMMENDED_MAX_SECONDS:
            logger.warning("Video is %.1f s — exceeds recommended %d s.", duration, RECOMMENDED_MAX_SECONDS)

        _strip_audio(video_in, silent_mp4)
        _mux_video_audio(silent_mp4, audio_wav, output_mp4)

        with open(output_mp4, "rb") as f:
            result_bytes = f.read()

    if not result_bytes:
        raise RuntimeError("Output video is empty after processing.")

    return result_bytes, duration
