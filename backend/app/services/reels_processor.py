from __future__ import annotations

import io
import logging
import os
import re
import shutil
import subprocess
import tempfile
import wave
from typing import Literal

from app.models.requests import SynthesizeRequest

logger = logging.getLogger(__name__)

MAX_VIDEO_BYTES = 500 * 1024 * 1024

ASSETS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "music")

BUILTIN_TRACKS: dict[str, dict] = {
    "lofi":       {"label": "Lo-fi",      "description": "Chill lo-fi beat"},
    "cinematic":  {"label": "Cinematic",  "description": "Dramatic & emotional"},
    "upbeat":     {"label": "Upbeat",     "description": "Energetic & positive"},
    "calm":       {"label": "Calm",       "description": "Soft ambient"},
}


def get_available_tracks() -> list[dict]:
    tracks = []
    for track_id, meta in BUILTIN_TRACKS.items():
        path = os.path.join(ASSETS_DIR, f"{track_id}.mp3")
        if os.path.isfile(path):
            tracks.append({"id": track_id, **meta})
    return tracks


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

    raise RuntimeError("ffmpeg not found. Install ffmpeg and make sure it is on PATH.")


def _get_video_duration(video_path: str) -> float:
    ffprobe = (
        _ffmpeg_bin()
        .replace("ffmpeg.exe", "ffprobe.exe")
        .replace("ffmpeg", "ffprobe")
    )
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
        [_ffmpeg_bin(), "-y",
         "-i", silent_video, "-i", audio_wav,
         "-c:v", "copy", "-c:a", "aac", "-b:a", "128k",
         "-map", "0:v:0", "-map", "1:a:0", "-shortest",
         output_path],
        capture_output=True, timeout=180,
    )
    if result.returncode != 0:
        logger.error("ffmpeg mux failed: %s", result.stderr.decode(errors="replace"))
        raise RuntimeError("Failed to combine video and audio. Please try again.")


def _mix_music(
    voice_wav: str,
    music_path: str,
    output_wav: str,
    music_volume: float,
    ducking: bool,
    fade_in: bool,
    fade_out: bool,
) -> None:
    try:
        from pydub import AudioSegment
    except ImportError:
        raise RuntimeError("pydub is required for music mixing. Run: pip install pydub")

    voice = AudioSegment.from_file(voice_wav)
    music_raw = AudioSegment.from_file(music_path)

    voice_len_ms = len(voice)

    # Loop music to match voice length
    if len(music_raw) < voice_len_ms:
        loops = (voice_len_ms // len(music_raw)) + 2
        music_raw = music_raw * loops
    music = music_raw[:voice_len_ms]

    # Apply volume — music_volume is 0.0–1.0, map to dB
    # 0.0 = -40dB (near silent), 1.0 = 0dB (full)
    if music_volume <= 0.0:
        db_adjust = -40.0
    else:
        import math
        db_adjust = 20 * math.log10(music_volume)
    music = music + db_adjust

    # Ducking: lower music by 12 dB during the entire voice track
    # In a real scenario you'd detect silence in voice, but for reels
    # the voice is continuous so we just apply a constant duck
    if ducking:
        music = music - 12

    if fade_in:
        music = music.fade_in(min(2000, voice_len_ms // 4))
    if fade_out:
        music = music.fade_out(min(2000, voice_len_ms // 4))

    # Ensure same sample rate and channels
    if music.frame_rate != voice.frame_rate:
        music = music.set_frame_rate(voice.frame_rate)
    if music.channels != voice.channels:
        music = music.set_channels(voice.channels)

    mixed = voice.overlay(music)
    mixed.export(output_wav, format="wav")


_CAPTION_STYLES: dict[str, dict] = {
    "default": {"fontsize": 24, "fontcolor": "&Hffffff&", "bold": 0,
                "outline": 2, "shadow": 1, "backcolour": "&H80000000&"},
    "bold":    {"fontsize": 28, "fontcolor": "&H00ffff&",  "bold": 1,
                "outline": 3, "shadow": 1, "backcolour": "&HB0000000&"},
    "minimal": {"fontsize": 22, "fontcolor": "&Hffffff&", "bold": 0,
                "outline": 1, "shadow": 0, "backcolour": "&H00000000&"},
}

_CHARS_PER_LINE = 32


def _word_wrap(text: str, max_chars: int = _CHARS_PER_LINE) -> str:
    words = text.split()
    lines: list[str] = []
    current: list[str] = []
    length = 0
    for word in words:
        if length + len(word) + (1 if current else 0) > max_chars:
            if current:
                lines.append(" ".join(current))
            current = [word]
            length = len(word)
        else:
            current.append(word)
            length += len(word) + (1 if len(current) > 1 else 0)
    if current:
        lines.append(" ".join(current))
    return "\n".join(lines)


def _ms_to_srt_ts(seconds: float) -> str:
    total_ms = int(seconds * 1000)
    h = total_ms // 3_600_000; total_ms %= 3_600_000
    m = total_ms //    60_000; total_ms %=    60_000
    s = total_ms //     1_000; ms_part   = total_ms % 1_000
    return f"{h:02d}:{m:02d}:{s:02d},{ms_part:03d}"


def _build_srt(script: str, audio_duration_s: float) -> str:
    sentences = re.split(r"(?<=[.!?])\s+", script.strip())
    segments: list[str] = []
    for sentence in sentences:
        words = sentence.split()
        if len(words) <= 10:
            if sentence.strip():
                segments.append(sentence.strip())
        else:
            for i in range(0, len(words), 10):
                segments.append(" ".join(words[i : i + 10]))
    if not segments:
        segments = [script.strip()]

    seg_dur = audio_duration_s / len(segments)
    lines: list[str] = []
    for idx, seg in enumerate(segments, start=1):
        start = (idx - 1) * seg_dur
        end = min(idx * seg_dur, audio_duration_s)
        lines.append(
            f"{idx}\n"
            f"{_ms_to_srt_ts(start)} --> {_ms_to_srt_ts(end)}\n"
            f"{_word_wrap(seg)}\n"
        )
    return "\n".join(lines)


def _find_windows_font() -> str | None:
    candidates = [
        r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\Arial.ttf",
        r"C:\Windows\Fonts\calibri.ttf",
        r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\verdana.ttf",
    ]
    for p in candidates:
        if os.path.isfile(p):
            return p
    fonts_dir = r"C:\Windows\Fonts"
    if os.path.isdir(fonts_dir):
        for f in os.listdir(fonts_dir):
            if f.lower().endswith(".ttf"):
                return os.path.join(fonts_dir, f)
    return None


def _ffmpeg_has_filter(ffmpeg: str, filter_name: str) -> bool:
    try:
        result = subprocess.run([ffmpeg, "-filters"], capture_output=True, text=True, timeout=10)
        return filter_name in result.stdout
    except Exception:
        return False


def _parse_srt_segments(srt: str) -> list[tuple[float, float, str]]:
    blocks = re.split(r"\n{2,}", srt.strip())
    result = []
    for block in blocks:
        lines = block.strip().splitlines()
        if len(lines) < 3:
            continue
        ts_match = re.match(
            r"(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})",
            lines[1],
        )
        if not ts_match:
            continue
        start_s = _srt_ts_to_s(ts_match.group(1))
        end_s   = _srt_ts_to_s(ts_match.group(2))
        text = " ".join(lines[2:])
        result.append((start_s, end_s, text))
    return result


def _srt_ts_to_s(ts: str) -> float:
    h, m, rest = ts.split(":")
    s, ms = rest.split(",")
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000


def _escape_drawtext_simple(text: str) -> str:
    text = text.replace("\\", "\\\\")
    text = text.replace("'", "\u2019")
    text = text.replace(":", "\\:")
    text = text.replace(",", "\\,")
    text = text.replace("\n", " ")
    return text


def _burn_captions(
    video_path: str,
    script: str,
    audio_duration_s: float,
    output_path: str,
    style: Literal["default", "bold", "minimal"] = "default",
) -> None:
    preset = _CAPTION_STYLES.get(style, _CAPTION_STYLES["default"])
    ffmpeg = _ffmpeg_bin()

    srt_content = _build_srt(script, audio_duration_s)
    tmp_dir = os.path.dirname(output_path)
    srt_path = os.path.join(tmp_dir, "captions.srt")
    with open(srt_path, "w", encoding="utf-8") as f:
        f.write(srt_content)

    if _ffmpeg_has_filter(ffmpeg, "subtitles"):
        force_style = (
            f"FontSize={preset['fontsize']},"
            f"PrimaryColour={preset['fontcolor']},"
            f"Bold={preset['bold']},"
            f"Outline={preset['outline']},"
            f"Shadow={preset['shadow']},"
            f"BackColour={preset['backcolour']},"
            "Alignment=2,MarginV=40"
        )
        srt_escaped = srt_path.replace("\\", "/").replace(":", "\\:")
        vf = f"subtitles='{srt_escaped}':force_style='{force_style}'"
        result = subprocess.run(
            [ffmpeg, "-y", "-i", video_path, "-vf", vf,
             "-c:v", "libx264", "-preset", "fast", "-crf", "23",
             "-c:a", "copy", output_path],
            capture_output=True, timeout=300,
        )
        if result.returncode == 0:
            return
        logger.warning(
            "subtitles filter failed (rc=%d): %s",
            result.returncode,
            result.stderr.decode(errors="replace")[-400:],
        )

    font_path = _find_windows_font()
    if font_path and _ffmpeg_has_filter(ffmpeg, "drawtext"):
        seg_list = _parse_srt_segments(srt_content)
        parts: list[str] = []
        font_escaped = font_path.replace("\\", "/").replace(":", "\\:")
        for start_s, end_s, seg_text in seg_list:
            text_escaped = _escape_drawtext_simple(seg_text)
            parts.append(
                f"drawtext=fontfile='{font_escaped}'"
                f":text='{text_escaped}'"
                f":fontsize={preset['fontsize']}"
                f":fontcolor=white"
                f":x=(w-text_w)/2:y=h*0.82"
                f":enable='between(t,{start_s:.3f},{end_s:.3f})'"
                f":box=1:boxcolor=black@0.55:boxborderw=8"
            )
        result = subprocess.run(
            [ffmpeg, "-y", "-i", video_path, "-vf", ",".join(parts),
             "-c:v", "libx264", "-preset", "fast", "-crf", "23",
             "-c:a", "copy", output_path],
            capture_output=True, timeout=300,
        )
        if result.returncode == 0:
            return
        logger.error(
            "drawtext fallback failed (rc=%d): %s",
            result.returncode,
            result.stderr.decode(errors="replace")[-600:],
        )

    raise RuntimeError(
        "Caption burning requires ffmpeg with libass. "
        "Install the full build from https://www.gyan.dev/ffmpeg/builds/"
    )


def generate_reels_voiceover(
    video_bytes: bytes,
    synth_request: SynthesizeRequest,
    burn_captions: bool = False,
    caption_style: Literal["default", "bold", "minimal"] = "default",
    music_source: Literal["none", "builtin", "upload"] = "none",
    music_track_id: str = "",
    music_bytes: bytes | None = None,
    music_volume: float = 0.3,
    ducking: bool = True,
    fade_in: bool = True,
    fade_out: bool = True,
) -> tuple[bytes, float, bool]:
    """
    Generate a Reels/Shorts-ready MP4.

    Returns (mp4_bytes, video_duration_seconds, music_was_mixed).
    """
    if not video_bytes:
        raise ValueError("Uploaded video is empty.")
    if len(video_bytes) > MAX_VIDEO_BYTES:
        raise ValueError(
            f"Video is too large ({len(video_bytes) // (1024 * 1024)} MB). "
            "Maximum allowed is 500 MB."
        )
    if not 0.0 <= music_volume <= 1.0:
        raise ValueError("music_volume must be between 0.0 and 1.0.")

    from app.services.tts_service import synthesize, VoiceNotFoundError  # noqa: PLC0415

    try:
        audio_buf: io.BytesIO = synthesize(synth_request)
    except (VoiceNotFoundError, ValueError, RuntimeError):
        raise
    except Exception as exc:
        logger.exception("TTS synthesis failed")
        raise RuntimeError("Voice synthesis failed. Please try again.") from exc

    audio_bytes = audio_buf.getvalue()
    if not audio_bytes:
        raise RuntimeError("Voice synthesis returned no audio.")

    music_mixed = False

    with tempfile.TemporaryDirectory(prefix="vv_reels_") as tmp:
        video_in   = os.path.join(tmp, "input.mp4")
        silent_mp4 = os.path.join(tmp, "silent.mp4")
        voice_wav  = os.path.join(tmp, "voice.wav")
        mixed_wav  = os.path.join(tmp, "mixed.wav")
        muxed_mp4  = os.path.join(tmp, "muxed.mp4")
        output_mp4 = os.path.join(tmp, "output.mp4")

        with open(video_in, "wb") as f:
            f.write(video_bytes)
        with open(voice_wav, "wb") as f:
            f.write(audio_bytes)

        duration = _get_video_duration(video_in)
        _strip_audio(video_in, silent_mp4)

        # Resolve music file path
        music_path: str | None = None
        if music_source == "builtin" and music_track_id:
            candidate = os.path.join(ASSETS_DIR, f"{music_track_id}.mp3")
            if os.path.isfile(candidate):
                music_path = candidate
            else:
                logger.warning("Builtin track '%s' not found at %s", music_track_id, candidate)
        elif music_source == "upload" and music_bytes:
            uploaded_music = os.path.join(tmp, "uploaded_music")
            with open(uploaded_music, "wb") as f:
                f.write(music_bytes)
            music_path = uploaded_music

        # Mix music with voice if a valid path was resolved
        audio_to_mux = voice_wav
        if music_path:
            try:
                _mix_music(voice_wav, music_path, mixed_wav,
                           music_volume, ducking, fade_in, fade_out)
                audio_to_mux = mixed_wav
                music_mixed = True
            except Exception as exc:
                logger.warning("Music mixing failed (%s), continuing without music.", exc)

        _mux_video_audio(silent_mp4, audio_to_mux, muxed_mp4)

        if burn_captions:
            try:
                with wave.open(io.BytesIO(audio_bytes), "rb") as wf:
                    audio_duration_s = wf.getnframes() / float(wf.getframerate())
            except Exception:
                audio_duration_s = duration or 30.0

            _burn_captions(muxed_mp4, synth_request.text, audio_duration_s, output_mp4, style=caption_style)
        else:
            shutil.copy2(muxed_mp4, output_mp4)

        with open(output_mp4, "rb") as f:
            result_bytes = f.read()

    if not result_bytes:
        raise RuntimeError("Output video is empty after processing.")

    return result_bytes, duration, music_mixed
