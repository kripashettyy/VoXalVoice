"""Voice registry: enumerates available TTS voices."""
import asyncio
import logging
import threading
from typing import List, Optional

from app.models.responses import VoiceInfo

logger = logging.getLogger(__name__)

FALLBACK_VOICES: List[VoiceInfo] = [
    VoiceInfo(id="en-US-AriaNeural",     name="Aria",     gender="female", engine="edge-tts", locale="en-US"),
    VoiceInfo(id="en-US-JennyNeural",    name="Jenny",    gender="female", engine="edge-tts", locale="en-US"),
    VoiceInfo(id="en-US-MichelleNeural", name="Michelle", gender="female", engine="edge-tts", locale="en-US"),
    VoiceInfo(id="en-US-GuyNeural",      name="Guy",      gender="male",   engine="edge-tts", locale="en-US"),
    VoiceInfo(id="en-US-DavisNeural",    name="Davis",    gender="male",   engine="edge-tts", locale="en-US"),
    VoiceInfo(id="en-US-TonyNeural",     name="Tony",     gender="male",   engine="edge-tts", locale="en-US"),
]

# ── In-memory cache ──
# Populated on first successful fetch; reused for all subsequent calls.
# This avoids a blocking network round-trip on every synthesis request.
_cache: Optional[List[VoiceInfo]] = None
_cache_lock = threading.Lock()


def _run_in_thread(coro) -> list:
    """Run an async coroutine in a dedicated thread with its own event loop."""
    result = [None]
    exc = [None]

    def target():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result[0] = loop.run_until_complete(coro)
        except Exception as e:
            exc[0] = e
        finally:
            loop.close()

    t = threading.Thread(target=target, daemon=True)
    t.start()
    t.join()
    if exc[0] is not None:
        raise exc[0]
    return result[0]


def get_voices() -> List[VoiceInfo]:
    """Return all available voices, using the in-memory cache after first fetch.

    Falls back to the hardcoded list if the network call fails.
    The cache is never invalidated at runtime — restart the server to refresh.
    """
    global _cache

    # Fast path: already cached (no lock needed for read after first set)
    if _cache is not None:
        return _cache

    # Slow path: first call — acquire lock, double-check, then fetch
    with _cache_lock:
        if _cache is not None:       # another thread may have populated it
            return _cache

        try:
            voices = _run_in_thread(_fetch_edge_tts_voices())
            if voices:
                _cache = voices
                return _cache
            # Empty list from API — fall through to fallback
            raise ValueError("edge-tts returned an empty voice list")
        except Exception as exc:
            logger.warning("Failed to enumerate edge-tts voices (%s), using fallback.", exc)
            _cache = FALLBACK_VOICES
            return FALLBACK_VOICES


async def _fetch_edge_tts_voices() -> List[VoiceInfo]:
    import edge_tts
    voices_raw = await edge_tts.list_voices()
    voices = []
    for v in voices_raw:
        gender = "female" if v.get("Gender", "").lower() in ("female", "f") else "male"
        voices.append(VoiceInfo(
            id=v["ShortName"],
            name=v.get("FriendlyName", v["ShortName"]),
            gender=gender,
            engine="edge-tts",
            locale=v.get("Locale"),
        ))
    return voices
