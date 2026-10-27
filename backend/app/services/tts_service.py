"""TTS orchestration service."""
import asyncio
import io
import logging
from typing import Optional

from app.models.requests import SynthesizeRequest
from app.services.prosody_processor import process as apply_prosody
from app.services.eq_processor import apply_eq

logger = logging.getLogger(__name__)


class VoiceNotFoundError(Exception):
    """Raised when the requested voice_id is not available."""
    pass


def synthesize(params: SynthesizeRequest) -> io.BytesIO:
    """
    Orchestrate TTS synthesis:
      1. Prosody processing
      2. Engine selection (edge-tts primary, eSpeak fallback)
      3. EQ post-processing
    """
    processed_text = apply_prosody(params.text, params.natural_flow)

    # Step 2: Engine selection
    engine_params = {
        'pitch': params.pitch,
        'speed': params.speed,
        'volume': params.volume,
        'tone_preset': params.tone_preset,
    }

    raw_audio: Optional[bytes] = None

    # Try edge-tts first
    try:
        from app.services.engines.edge_tts_adapter import EdgeTTSAdapter
        adapter = EdgeTTSAdapter()

        # Validate voice_id exists — fail-open if registry returns empty
        # (avoids false 404s when edge-tts network call fails during validation)
        from app.services.voice_registry import get_voices
        available_ids = {v.id for v in get_voices()}
        if available_ids and params.voice_id not in available_ids:
            raise VoiceNotFoundError(
                f"Voice ID '{params.voice_id}' is not available. "
                "Refresh the page to reload the voice list."
            )

        raw_audio = adapter.synthesize(processed_text, params.voice_id, engine_params)

    except VoiceNotFoundError:
        raise  # propagate immediately

    except Exception as primary_exc:
        # Check for network errors
        exc_name = type(primary_exc).__name__
        exc_str = str(primary_exc)
        if any(x in exc_name for x in ('ClientError', 'ClientConnectorError')) or \
           'aiohttp' in exc_str.lower():
            raise RuntimeError(
                "Could not reach the speech engine. "
                "Check your internet connection and try again."
            ) from primary_exc

        logger.warning(
            "Primary engine (edge-tts) failed (%s: %s). Falling back to eSpeak.",
            type(primary_exc).__name__,
            primary_exc,
        )

        try:
            from app.services.engines.espeak_adapter import ESpeakAdapter
            fallback = ESpeakAdapter()
            raw_audio = fallback.synthesize(
                processed_text, params.voice_id, engine_params
            )
        except Exception as fallback_exc:
            raise RuntimeError("Speech synthesis unavailable") from fallback_exc

    # Guard: empty audio
    if not raw_audio:
        raise ValueError(
            "Engine returned no audio. Try different text or voice settings."
        )

    # Step 3: EQ post-processing
    try:
        eq_audio = apply_eq(raw_audio, params.warmth, params.clarity)
    except Exception as eq_exc:
        logger.warning("EQ processing failed (%s), using unfiltered audio.", eq_exc)
        eq_audio = raw_audio

    return io.BytesIO(eq_audio)
