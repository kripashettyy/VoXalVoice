"""Edge-TTS engine adapter."""
import asyncio
import io
import os
import re
import threading

from app.services.engines.base import AbstractTTSEngine

# Ensure ffmpeg is findable — winget installs outside PATH until shell restart.
_WINGET_BIN = os.path.join(
    os.environ.get("LOCALAPPDATA", ""),
    r"Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin",
)
if os.path.isdir(_WINGET_BIN) and _WINGET_BIN not in os.environ.get("PATH", ""):
    os.environ["PATH"] = _WINGET_BIN + os.pathsep + os.environ.get("PATH", "")

# edge-tts silently truncates requests beyond ~3000 chars.
# We split into safe-sized sentence chunks and concatenate the audio.
_CHUNK_MAX_CHARS = 2000


def _split_into_chunks(text: str, max_chars: int = _CHUNK_MAX_CHARS) -> list[str]:
    """Split text into chunks of at most max_chars, breaking on sentence boundaries.

    Priority of split points (highest → lowest):
      1. Sentence-ending punctuation  (. ! ?)
      2. Clause punctuation           (, ; :)
      3. Whitespace                   (word boundary)
    """
    # Tokenise into sentences — keep the delimiter attached to the sentence.
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())

    chunks: list[str] = []
    current = ""

    def _flush(buf: str) -> str:
        if buf:
            chunks.append(buf.strip())
        return ""

    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue

        # Single sentence too big — break on clause punctuation first
        if len(sentence) > max_chars:
            sub_parts = re.split(r'(?<=[,;:])\s+', sentence)
            for part in sub_parts:
                part = part.strip()
                if not part:
                    continue
                if len(current) + len(part) + 1 <= max_chars:
                    current = (current + " " + part).strip()
                else:
                    current = _flush(current)
                    # Part still too big — hard split on words
                    if len(part) > max_chars:
                        words = part.split()
                        for word in words:
                            if len(current) + len(word) + 1 <= max_chars:
                                current = (current + " " + word).strip()
                            else:
                                current = _flush(current)
                                current = word
                    else:
                        current = part
        else:
            if len(current) + len(sentence) + 1 <= max_chars:
                current = (current + " " + sentence).strip()
            else:
                current = _flush(current)
                current = sentence

    _flush(current)
    return chunks or [text[:max_chars]]


def _run_async_in_thread(coro):
    """Run async coroutine in a brand-new event loop on a dedicated thread.
    Safe to call from within FastAPI's running event loop.
    """
    result = None
    exc = None

    def target():
        nonlocal result, exc
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result = loop.run_until_complete(coro)
        except Exception as e:
            exc = e
        finally:
            loop.close()

    t = threading.Thread(target=target, daemon=True)
    t.start()
    t.join()
    if exc is not None:
        raise exc
    return result


class EdgeTTSAdapter(AbstractTTSEngine):
    """Wraps the edge-tts library for neural TTS synthesis."""

    def synthesize(self, text: str, voice_id: str, params: dict) -> bytes:
        return _run_async_in_thread(self._synthesize_async(text, voice_id, params))

    async def _synthesize_async(self, text: str, voice_id: str, params: dict) -> bytes:
        import edge_tts
        from pydub import AudioSegment

        rate_pct = int((params.get('speed', 1.0) - 1.0) * 100)
        rate_str = f"{'+' if rate_pct >= 0 else ''}{rate_pct}%"

        pitch_semitones = int((params.get('pitch', 1.0) - 1.0) * 12)
        pitch_str = f"{'+' if pitch_semitones >= 0 else ''}{pitch_semitones}Hz"

        volume_pct = int((params.get('volume', 0.8) - 1.0) * 100)
        volume_str = f"{'+' if volume_pct >= 0 else ''}{volume_pct}%"

        # Resolve ffmpeg paths once
        ffmpeg_exe = os.path.join(_WINGET_BIN, "ffmpeg.exe")
        ffprobe_exe = os.path.join(_WINGET_BIN, "ffprobe.exe")
        if os.path.isfile(ffmpeg_exe):
            AudioSegment.converter = ffmpeg_exe
            AudioSegment.ffprobe = ffprobe_exe

        # Split text into safe-sized chunks and synthesise each one
        chunks = _split_into_chunks(text)
        audio_segments: list[AudioSegment] = []

        for chunk in chunks:
            communicate = edge_tts.Communicate(
                text=chunk,
                voice=voice_id,
                rate=rate_str,
                pitch=pitch_str,
                volume=volume_str,
            )

            mp3_buf = io.BytesIO()
            async for piece in communicate.stream():
                if piece["type"] == "audio":
                    mp3_buf.write(piece["data"])

            mp3_buf.seek(0)
            if mp3_buf.getbuffer().nbytes == 0:
                # Empty chunk — skip silently rather than failing the whole request
                continue

            audio_segments.append(AudioSegment.from_mp3(mp3_buf))

        if not audio_segments:
            raise ValueError("Engine returned no audio. Try different text or voice settings.")

        # Concatenate all segments
        combined = audio_segments[0]
        for seg in audio_segments[1:]:
            combined += seg

        wav_buf = io.BytesIO()
        combined.export(wav_buf, format="wav")
        return wav_buf.getvalue()

