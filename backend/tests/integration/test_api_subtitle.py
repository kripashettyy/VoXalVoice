"""Integration tests for POST /api/v1/subtitle-to-voice."""
import io
import wave
import numpy as np
import pytest
from unittest.mock import patch
from scipy.io import wavfile
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def _make_wav_bytes(duration_s: float = 0.1, sample_rate: int = 24000) -> bytes:
    t = np.linspace(0, duration_s, int(sample_rate * duration_s), endpoint=False)
    samples = (np.sin(2 * np.pi * 440 * t) * 16000).astype(np.int16)
    buf = io.BytesIO()
    wavfile.write(buf, sample_rate, samples)
    return buf.getvalue()


def _srt(cues: list[tuple[str, str, str]]) -> bytes:
    """Build a minimal SRT bytes from (start, end, text) tuples."""
    lines = []
    for i, (start, end, text) in enumerate(cues, 1):
        lines.append(f"{i}\n{start} --> {end}\n{text}\n")
    return "\n".join(lines).encode()


def _default_form(srt_bytes: bytes, filename: str = "test.srt") -> dict:
    return {
        "data": {
            "voice_id": "en-US-AriaNeural",
            "pitch": "1.0",
            "speed": "1.0",
            "volume": "0.8",
            "tone_preset": "neutral",
            "natural_flow": "true",
            "warmth": "0.0",
            "clarity": "0.0",
        },
        "files": {"subtitle": (filename, io.BytesIO(srt_bytes), "text/plain")},
    }


# ---------------------------------------------------------------------------
# Happy path
# ---------------------------------------------------------------------------

def test_subtitle_returns_200():
    wav = _make_wav_bytes()
    srt = _srt([("00:00:01,000", "00:00:03,000", "Hello world.")])
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        f = _default_form(srt)
        resp = client.post("/api/v1/subtitle-to-voice", data=f["data"], files=f["files"])
    assert resp.status_code == 200


def test_subtitle_returns_wav_content_type():
    wav = _make_wav_bytes()
    srt = _srt([("00:00:01,000", "00:00:03,000", "Hello.")])
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        f = _default_form(srt)
        resp = client.post("/api/v1/subtitle-to-voice", data=f["data"], files=f["files"])
    assert "audio/wav" in resp.headers["content-type"]


def test_subtitle_response_is_valid_wav():
    wav = _make_wav_bytes()
    srt = _srt([("00:00:01,000", "00:00:03,000", "Test cue.")])
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        f = _default_form(srt)
        resp = client.post("/api/v1/subtitle-to-voice", data=f["data"], files=f["files"])
    assert resp.status_code == 200
    wf = wave.open(io.BytesIO(resp.content))
    assert wf.getnframes() > 0
    wf.close()


def test_subtitle_x_cue_count_header():
    wav = _make_wav_bytes()
    srt = _srt([
        ("00:00:01,000", "00:00:03,000", "First."),
        ("00:00:04,000", "00:00:06,000", "Second."),
    ])
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        f = _default_form(srt)
        resp = client.post("/api/v1/subtitle-to-voice", data=f["data"], files=f["files"])
    assert resp.status_code == 200
    assert resp.headers.get("x-cue-count") == "2"


def test_subtitle_x_audio_duration_header():
    wav = _make_wav_bytes()
    srt = _srt([("00:00:01,000", "00:00:04,000", "Three seconds.")])
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        f = _default_form(srt)
        resp = client.post("/api/v1/subtitle-to-voice", data=f["data"], files=f["files"])
    assert resp.status_code == 200
    duration = float(resp.headers.get("x-audio-duration", "0"))
    assert duration == pytest.approx(4.0, abs=0.1)


def test_subtitle_content_disposition_filename():
    wav = _make_wav_bytes()
    srt = _srt([("00:00:01,000", "00:00:03,000", "Hello.")])
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        files = {"subtitle": ("my_subs.srt", io.BytesIO(srt), "text/plain")}
        resp = client.post("/api/v1/subtitle-to-voice", data=_default_form(srt)["data"], files=files)
    assert resp.status_code == 200
    cd = resp.headers.get("content-disposition", "")
    assert "my_subs_voiced.wav" in cd


def test_subtitle_vtt_accepted():
    wav = _make_wav_bytes()
    vtt = b"WEBVTT\n\n00:00:01.000 --> 00:00:03.000\nVTT cue."
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        files = {"subtitle": ("captions.vtt", io.BytesIO(vtt), "text/plain")}
        resp = client.post("/api/v1/subtitle-to-voice", data=_default_form(vtt)["data"], files=files)
    assert resp.status_code == 200


# ---------------------------------------------------------------------------
# Validation errors
# ---------------------------------------------------------------------------

def test_subtitle_missing_file_returns_422():
    resp = client.post("/api/v1/subtitle-to-voice", data={"voice_id": "en-US-AriaNeural"})
    assert resp.status_code == 422


def test_subtitle_wrong_extension_returns_415():
    files = {"subtitle": ("video.mp4", io.BytesIO(b"not a subtitle"), "video/mp4")}
    data = _default_form(b"")["data"]
    resp = client.post("/api/v1/subtitle-to-voice", data=data, files=files)
    assert resp.status_code == 415


def test_subtitle_empty_file_returns_400():
    files = {"subtitle": ("empty.srt", io.BytesIO(b""), "text/plain")}
    data = _default_form(b"")["data"]
    resp = client.post("/api/v1/subtitle-to-voice", data=data, files=files)
    assert resp.status_code == 400


def test_subtitle_no_valid_cues_returns_422():
    srt = b"this is not a valid srt file at all"
    files = {"subtitle": ("bad.srt", io.BytesIO(srt), "text/plain")}
    data = _default_form(srt)["data"]
    resp = client.post("/api/v1/subtitle-to-voice", data=data, files=files)
    assert resp.status_code == 422


def test_subtitle_file_too_large_returns_413():
    big = b"x" * (2 * 1024 * 1024 + 1)
    files = {"subtitle": ("big.srt", io.BytesIO(big), "text/plain")}
    data = _default_form(big)["data"]
    resp = client.post("/api/v1/subtitle-to-voice", data=data, files=files)
    assert resp.status_code == 413


def test_subtitle_invalid_pitch_returns_422():
    srt = _srt([("00:00:01,000", "00:00:03,000", "Hi.")])
    files = {"subtitle": ("t.srt", io.BytesIO(srt), "text/plain")}
    data = {**_default_form(srt)["data"], "pitch": "99.0"}
    resp = client.post("/api/v1/subtitle-to-voice", data=data, files=files)
    assert resp.status_code == 422


def test_subtitle_invalid_tone_preset_returns_422():
    srt = _srt([("00:00:01,000", "00:00:03,000", "Hi.")])
    files = {"subtitle": ("t.srt", io.BytesIO(srt), "text/plain")}
    data = {**_default_form(srt)["data"], "tone_preset": "bass-boost"}
    resp = client.post("/api/v1/subtitle-to-voice", data=data, files=files)
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Error propagation
# ---------------------------------------------------------------------------

def test_subtitle_voice_not_found_returns_404():
    from app.services.tts_service import VoiceNotFoundError
    srt = _srt([("00:00:01,000", "00:00:03,000", "Hello.")])
    with patch("app.services.tts_service.synthesize",
               side_effect=VoiceNotFoundError("Voice not available")):
        f = _default_form(srt)
        resp = client.post("/api/v1/subtitle-to-voice", data=f["data"], files=f["files"])
    assert resp.status_code == 404


def test_subtitle_runtime_error_returns_500():
    srt = _srt([("00:00:01,000", "00:00:03,000", "Hello.")])
    with patch("app.services.tts_service.synthesize",
               side_effect=RuntimeError("engine down")):
        f = _default_form(srt)
        resp = client.post("/api/v1/subtitle-to-voice", data=f["data"], files=f["files"])
    assert resp.status_code == 500
