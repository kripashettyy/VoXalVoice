"""Unit tests for dialogue_processor."""
import io
import wave
import numpy as np
import pytest
from unittest.mock import patch, MagicMock
from scipy.io import wavfile

from app.services.dialogue_processor import generate_dialogue, _make_silence, _build_wav


def _make_wav(duration_s: float = 0.1, rate: int = 24000) -> bytes:
    t = np.linspace(0, duration_s, int(rate * duration_s), endpoint=False)
    samples = (np.sin(2 * np.pi * 440 * t) * 16000).astype(np.int16)
    buf = io.BytesIO()
    wavfile.write(buf, rate, samples)
    return buf.getvalue()


def _turn(speaker="A", text="Hello.", voice_id="en-US-AriaNeural"):
    return {"speaker": speaker, "text": text, "voice_id": voice_id,
            "pitch": 1.0, "speed": 1.0, "volume": 0.8,
            "tone_preset": "neutral", "natural_flow": True,
            "warmth": 0.0, "clarity": 0.0}


def test_empty_turns_raises():
    with pytest.raises(ValueError, match="no turns"):
        generate_dialogue([])


def test_too_many_turns_raises():
    turns = [_turn(text="x") for _ in range(101)]
    with pytest.raises(ValueError, match="Too many"):
        generate_dialogue(turns)


def test_single_turn_returns_wav():
    wav = _make_wav()
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        result, duration = generate_dialogue([_turn()])
    assert result[:4] == b"RIFF"
    assert duration > 0


def test_two_turns_longer_than_one():
    wav = _make_wav()
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        _, dur1 = generate_dialogue([_turn()], pause_ms=0)
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        _, dur2 = generate_dialogue([_turn(), _turn(speaker="B", text="Hi.")], pause_ms=0)
    assert dur2 > dur1


def test_pause_increases_duration():
    wav = _make_wav()
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        _, dur_no_pause = generate_dialogue([_turn(), _turn(speaker="B", text="Hi.")], pause_ms=0)
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        _, dur_with_pause = generate_dialogue([_turn(), _turn(speaker="B", text="Hi.")], pause_ms=500)
    assert dur_with_pause > dur_no_pause


def test_empty_text_turns_are_skipped():
    wav = _make_wav()
    empty_turn = _turn(text="")
    real_turn = _turn(text="Hello.")
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        result, _ = generate_dialogue([empty_turn, real_turn])
    assert result[:4] == b"RIFF"
    # synthesize should only be called once (empty turn skipped)
    assert mock.call_count == 1


def test_all_empty_turns_raises():
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(b"")
        with pytest.raises(RuntimeError, match="empty audio"):
            generate_dialogue([_turn(text="")])


def test_voice_not_found_propagates():
    from app.services.tts_service import VoiceNotFoundError
    with patch("app.services.tts_service.synthesize", side_effect=VoiceNotFoundError("bad voice")):
        with pytest.raises(VoiceNotFoundError):
            generate_dialogue([_turn()])


def test_synthesis_error_raises_runtime():
    with patch("app.services.tts_service.synthesize", side_effect=Exception("engine fail")):
        with pytest.raises(RuntimeError, match="Synthesis failed"):
            generate_dialogue([_turn()])


def test_output_is_valid_wav():
    wav = _make_wav()
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        result, _ = generate_dialogue([_turn()])
    wf = wave.open(io.BytesIO(result))
    assert wf.getnframes() > 0
    wf.close()


def test_make_silence_length():
    silence = _make_silence(1, 2, 24000, 500)
    expected = int(24000 * 500 / 1000) * 1 * 2
    assert len(silence) == expected


def test_make_silence_zero_ms():
    silence = _make_silence(1, 2, 24000, 0)
    assert silence == b""
