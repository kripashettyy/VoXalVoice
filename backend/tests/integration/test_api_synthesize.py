"""Integration tests for /api/v1/synthesize and /api/v1/preview."""
import pytest
from unittest.mock import patch, MagicMock
import io
import numpy as np
from scipy.io import wavfile
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def _make_wav_bytes(duration_s: float = 0.05, sample_rate: int = 22050) -> bytes:
    """Generate a minimal valid WAV buffer for mocking."""
    t = np.linspace(0, duration_s, int(sample_rate * duration_s), endpoint=False)
    samples = (np.sin(2 * np.pi * 440 * t) * 16000).astype(np.int16)
    buf = io.BytesIO()
    wavfile.write(buf, sample_rate, samples)
    return buf.getvalue()


VALID_PAYLOAD = {
    "text": "Hello world",
    "voice_id": "en-US-AriaNeural",
    "pitch": 1.0,
    "speed": 1.0,
    "volume": 0.8,
    "tone_preset": "neutral",
    "natural_flow": True,
    "warmth": 0.0,
    "clarity": 0.0,
    "output_format": "wav",
}


# ---------------------------------------------------------------------------
# Synthesize endpoint
# ---------------------------------------------------------------------------

def test_synthesize_returns_wav_content_type():
    """Full synthesis returns audio/wav Content-Type."""
    wav = _make_wav_bytes()
    with patch("app.api.v1.synthesize.synthesize") as mock_synth, \
         patch("app.api.v1.synthesize._voice_exists", return_value=True):
        mock_synth.return_value = io.BytesIO(wav)
        resp = client.post("/api/v1/synthesize", json=VALID_PAYLOAD)
    assert resp.status_code == 200
    assert "audio/wav" in resp.headers["content-type"]


def test_synthesize_returns_bytes():
    """Response body is non-empty bytes."""
    wav = _make_wav_bytes()
    with patch("app.api.v1.synthesize.synthesize") as mock_synth, \
         patch("app.api.v1.synthesize._voice_exists", return_value=True):
        mock_synth.return_value = io.BytesIO(wav)
        resp = client.post("/api/v1/synthesize", json=VALID_PAYLOAD)
    assert len(resp.content) > 0


def test_synthesize_empty_text_returns_422():
    """Empty text field returns 422."""
    payload = {**VALID_PAYLOAD, "text": ""}
    resp = client.post("/api/v1/synthesize", json=payload)
    assert resp.status_code == 422


def test_synthesize_text_too_long_returns_422():
    """Text exceeding 50000 chars returns 422."""
    payload = {**VALID_PAYLOAD, "text": "x" * 50001}
    resp = client.post("/api/v1/synthesize", json=payload)
    assert resp.status_code == 422


def test_synthesize_unsupported_format_returns_4xx():
    """Unsupported output_format returns 400 or 422 (Pydantic rejects at schema level)."""
    payload = {**VALID_PAYLOAD, "output_format": "mp3"}
    with patch("app.api.v1.synthesize._voice_exists", return_value=True):
        resp = client.post("/api/v1/synthesize", json=payload)
    # Pydantic v2 rejects Literal["wav"] mismatch with 422 before the route handler;
    # the route handler would return 400, so both are acceptable.
    assert resp.status_code in (400, 422)


def test_synthesize_unknown_voice_returns_404():
    """Unknown voice_id returns 404 with voice ID in message."""
    payload = {**VALID_PAYLOAD, "voice_id": "xx-XX-UnknownVoice"}
    with patch("app.api.v1.synthesize._voice_exists", return_value=False):
        resp = client.post("/api/v1/synthesize", json=payload)
    assert resp.status_code == 404
    assert "xx-XX-UnknownVoice" in resp.json()["detail"]


def test_synthesize_malformed_json_returns_422():
    """Malformed JSON body returns 422."""
    resp = client.post(
        "/api/v1/synthesize",
        content=b"{bad json}",
        headers={"Content-Type": "application/json"},
    )
    assert resp.status_code == 422


def test_synthesize_timeout_returns_504():
    """Simulated timeout returns 504 with timeout message."""
    import asyncio
    with patch("app.api.v1.synthesize._voice_exists", return_value=True), \
         patch("asyncio.wait_for", side_effect=asyncio.TimeoutError):
        resp = client.post("/api/v1/synthesize", json=VALID_PAYLOAD)
    assert resp.status_code == 504
    assert "timed out" in resp.json()["detail"].lower()


# ---------------------------------------------------------------------------
# Preview endpoint
# ---------------------------------------------------------------------------

def test_preview_truncates_to_200_chars():
    """Preview endpoint truncates text to 200 chars before synthesis."""
    wav = _make_wav_bytes()
    long_text = "A" * 500

    captured = {}

    def fake_synthesize(params):
        captured["text"] = params.text
        return io.BytesIO(wav)

    payload = {**VALID_PAYLOAD, "text": long_text}
    with patch("app.api.v1.synthesize.synthesize", side_effect=fake_synthesize), \
         patch("app.api.v1.synthesize._voice_exists", return_value=True):
        resp = client.post("/api/v1/preview", json=payload)

    assert resp.status_code == 200
    assert len(captured["text"]) == 200


def test_preview_returns_wav():
    """Preview returns audio/wav."""
    wav = _make_wav_bytes()
    with patch("app.api.v1.synthesize.synthesize") as mock_synth, \
         patch("app.api.v1.synthesize._voice_exists", return_value=True):
        mock_synth.return_value = io.BytesIO(wav)
        resp = client.post("/api/v1/preview", json=VALID_PAYLOAD)
    assert resp.status_code == 200
    assert "audio/wav" in resp.headers["content-type"]
