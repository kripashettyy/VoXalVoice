"""Integration tests for POST /api/v1/generate-dialogue."""
import io
import json
import wave
import numpy as np
import pytest
from unittest.mock import patch
from scipy.io import wavfile
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def _make_wav(duration_s: float = 0.1, rate: int = 24000) -> bytes:
    t = np.linspace(0, duration_s, int(rate * duration_s), endpoint=False)
    samples = (np.sin(2 * np.pi * 440 * t) * 16000).astype(np.int16)
    buf = io.BytesIO()
    wavfile.write(buf, rate, samples)
    return buf.getvalue()


def _turns(*texts, voice="en-US-AriaNeural"):
    return json.dumps([
        {"speaker": f"Speaker {i+1}", "text": t, "voice_id": voice,
         "pitch": 1.0, "speed": 1.0, "volume": 0.8,
         "tone_preset": "neutral", "natural_flow": True,
         "warmth": 0.0, "clarity": 0.0}
        for i, t in enumerate(texts)
    ])


# ── Happy path ───────

def test_dialogue_returns_200():
    wav = _make_wav()
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        resp = client.post("/api/v1/generate-dialogue", data={"turns": _turns("Hello."), "pause_ms": "300"})
    assert resp.status_code == 200


def test_dialogue_returns_wav_content_type():
    wav = _make_wav()
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        resp = client.post("/api/v1/generate-dialogue", data={"turns": _turns("Hello."), "pause_ms": "300"})
    assert "audio/wav" in resp.headers["content-type"]


def test_dialogue_response_is_valid_wav():
    wav = _make_wav()
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        resp = client.post("/api/v1/generate-dialogue", data={"turns": _turns("Hello."), "pause_ms": "0"})
    assert resp.status_code == 200
    wf = wave.open(io.BytesIO(resp.content))
    assert wf.getnframes() > 0
    wf.close()


def test_dialogue_x_turn_count_header():
    wav = _make_wav()
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        resp = client.post("/api/v1/generate-dialogue", data={"turns": _turns("Hi.", "Hello."), "pause_ms": "0"})
    assert resp.status_code == 200
    assert resp.headers.get("x-turn-count") == "2"


def test_dialogue_x_audio_duration_header():
    wav = _make_wav()
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        resp = client.post("/api/v1/generate-dialogue", data={"turns": _turns("Hello."), "pause_ms": "0"})
    assert resp.status_code == 200
    duration = float(resp.headers.get("x-audio-duration", "0"))
    assert duration > 0


def test_dialogue_content_disposition():
    wav = _make_wav()
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        resp = client.post("/api/v1/generate-dialogue", data={"turns": _turns("Hi."), "pause_ms": "0"})
    assert "dialogue.wav" in resp.headers.get("content-disposition", "")


def test_dialogue_default_pause():
    wav = _make_wav()
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        resp = client.post("/api/v1/generate-dialogue", data={"turns": _turns("Hi.")})
    assert resp.status_code == 200


# ── Validation errors 

def test_missing_turns_returns_422():
    resp = client.post("/api/v1/generate-dialogue", data={"pause_ms": "300"})
    assert resp.status_code == 422


def test_invalid_json_turns_returns_422():
    resp = client.post("/api/v1/generate-dialogue", data={"turns": "not json", "pause_ms": "0"})
    assert resp.status_code == 422


def test_empty_turns_array_returns_422():
    resp = client.post("/api/v1/generate-dialogue", data={"turns": "[]", "pause_ms": "0"})
    assert resp.status_code == 422


def test_turn_missing_voice_id_returns_422():
    turns = json.dumps([{"speaker": "A", "text": "Hi."}])
    resp = client.post("/api/v1/generate-dialogue", data={"turns": turns, "pause_ms": "0"})
    assert resp.status_code == 422


def test_turn_empty_text_returns_422():
    turns = json.dumps([{"speaker": "A", "text": "", "voice_id": "en-US-AriaNeural"}])
    resp = client.post("/api/v1/generate-dialogue", data={"turns": turns, "pause_ms": "0"})
    assert resp.status_code == 422


def test_pause_ms_too_large_returns_422():
    resp = client.post("/api/v1/generate-dialogue", data={"turns": _turns("Hi."), "pause_ms": "9999"})
    assert resp.status_code == 422


def test_script_too_long_returns_413():
    long_text = "x" * 50_001
    turns = json.dumps([{"speaker": "A", "text": long_text, "voice_id": "en-US-AriaNeural",
                         "pitch": 1.0, "speed": 1.0, "volume": 0.8,
                         "tone_preset": "neutral", "natural_flow": True,
                         "warmth": 0.0, "clarity": 0.0}])
    resp = client.post("/api/v1/generate-dialogue", data={"turns": turns, "pause_ms": "0"})
    assert resp.status_code == 413


def test_turns_not_array_returns_422():
    resp = client.post("/api/v1/generate-dialogue", data={"turns": '{"key": "val"}', "pause_ms": "0"})
    assert resp.status_code == 422


# ── Error propagation 

def test_voice_not_found_returns_404():
    from app.services.tts_service import VoiceNotFoundError
    with patch("app.services.tts_service.synthesize", side_effect=VoiceNotFoundError("bad")):
        resp = client.post("/api/v1/generate-dialogue", data={"turns": _turns("Hi."), "pause_ms": "0"})
    assert resp.status_code == 404


def test_runtime_error_returns_500():
    with patch("app.services.tts_service.synthesize", side_effect=RuntimeError("engine down")):
        resp = client.post("/api/v1/generate-dialogue", data={"turns": _turns("Hi."), "pause_ms": "0"})
    assert resp.status_code == 500


def test_timeout_returns_504():
    import asyncio
    with patch("asyncio.wait_for", side_effect=asyncio.TimeoutError):
        resp = client.post("/api/v1/generate-dialogue", data={"turns": _turns("Hi."), "pause_ms": "0"})
    assert resp.status_code == 504
