"""Integration tests for POST /api/v1/batch-synthesize."""
import io
import json
import zipfile
import numpy as np
import pytest
from unittest.mock import patch
from scipy.io import wavfile
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def _wav(rate: int = 24000) -> bytes:
    t = np.linspace(0, 0.05, int(rate * 0.05), endpoint=False)
    buf = io.BytesIO()
    wavfile.write(buf, rate, (np.sin(2 * np.pi * 440 * t) * 16000).astype(np.int16))
    return buf.getvalue()


def _form(content: bytes = b"Hello.\nWorld.", filename: str = "test.txt") -> dict:
    return {
        "data": {
            "voice_id": "en-US-AriaNeural",
            "pitch": "1.0", "speed": "1.0", "volume": "0.8",
            "tone_preset": "neutral", "natural_flow": "true",
            "warmth": "0.0", "clarity": "0.0",
        },
        "files": {"file": (filename, io.BytesIO(content), "text/plain")},
    }


#  Happy path 

def test_batch_returns_200():
    wav = _wav()
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        f = _form()
        resp = client.post("/api/v1/batch-synthesize", data=f["data"], files=f["files"])
    assert resp.status_code == 200


def test_batch_returns_zip_content_type():
    wav = _wav()
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        f = _form()
        resp = client.post("/api/v1/batch-synthesize", data=f["data"], files=f["files"])
    assert "zip" in resp.headers["content-type"]


def test_batch_response_is_valid_zip():
    wav = _wav()
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        f = _form()
        resp = client.post("/api/v1/batch-synthesize", data=f["data"], files=f["files"])
    zf = zipfile.ZipFile(io.BytesIO(resp.content))
    assert len(zf.namelist()) > 0
    zf.close()


def test_batch_zip_contains_wav_files():
    wav = _wav()
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        f = _form(b"Hello.\nWorld.\nThird.")
        resp = client.post("/api/v1/batch-synthesize", data=f["data"], files=f["files"])
    zf = zipfile.ZipFile(io.BytesIO(resp.content))
    assert all(name.endswith(".wav") for name in zf.namelist())
    zf.close()


def test_batch_x_entry_count_header():
    wav = _wav()
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        f = _form(b"Line one.\nLine two.")
        resp = client.post("/api/v1/batch-synthesize", data=f["data"], files=f["files"])
    assert resp.headers.get("x-entry-count") == "2"


def test_batch_x_success_count_header():
    wav = _wav()
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        f = _form(b"A.\nB.\nC.")
        resp = client.post("/api/v1/batch-synthesize", data=f["data"], files=f["files"])
    assert resp.headers.get("x-success-count") == "3"


def test_batch_content_disposition_filename():
    wav = _wav()
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        f = _form(b"Hello.", "my_script.txt")
        resp = client.post("/api/v1/batch-synthesize", data=f["data"], files=f["files"])
    assert "my_script_voices.zip" in resp.headers.get("content-disposition", "")


def test_batch_csv_accepted():
    wav = _wav()
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        f = _form(b"Hello world\nFoo bar", "data.csv")
        resp = client.post("/api/v1/batch-synthesize", data=f["data"], files=f["files"])
    assert resp.status_code == 200


#  Validation errors 

def test_missing_file_returns_422():
    resp = client.post("/api/v1/batch-synthesize", data={"voice_id": "en-US-AriaNeural"})
    assert resp.status_code == 422


def test_wrong_extension_returns_415():
    files = {"file": ("data.xlsx", io.BytesIO(b"content"), "text/plain")}
    resp = client.post("/api/v1/batch-synthesize", data=_form()["data"], files=files)
    assert resp.status_code == 415


def test_empty_file_returns_400():
    files = {"file": ("empty.txt", io.BytesIO(b""), "text/plain")}
    resp = client.post("/api/v1/batch-synthesize", data=_form()["data"], files=files)
    assert resp.status_code == 400


def test_blank_lines_only_returns_422():
    files = {"file": ("blank.txt", io.BytesIO(b"\n\n\n"), "text/plain")}
    resp = client.post("/api/v1/batch-synthesize", data=_form()["data"], files=files)
    assert resp.status_code == 422


def test_too_many_entries_returns_422():
    content = ("\n".join([f"line {i}" for i in range(201)])).encode()
    files = {"file": ("big.txt", io.BytesIO(content), "text/plain")}
    resp = client.post("/api/v1/batch-synthesize", data=_form()["data"], files=files)
    assert resp.status_code == 422


def test_file_too_large_returns_413():
    big = b"x " * (600 * 1024)
    files = {"file": ("big.txt", io.BytesIO(big), "text/plain")}
    resp = client.post("/api/v1/batch-synthesize", data=_form()["data"], files=files)
    assert resp.status_code == 413


def test_invalid_pitch_returns_422():
    files = {"file": ("t.txt", io.BytesIO(b"Hello."), "text/plain")}
    data = {**_form()["data"], "pitch": "99.0"}
    resp = client.post("/api/v1/batch-synthesize", data=data, files=files)
    assert resp.status_code == 422


def test_invalid_tone_preset_returns_422():
    files = {"file": ("t.txt", io.BytesIO(b"Hello."), "text/plain")}
    data = {**_form()["data"], "tone_preset": "bass"}
    resp = client.post("/api/v1/batch-synthesize", data=data, files=files)
    assert resp.status_code == 422


#  Error propagation 

def test_voice_not_found_returns_404():
    from app.services.tts_service import VoiceNotFoundError
    with patch("app.services.tts_service.synthesize", side_effect=VoiceNotFoundError("bad")):
        f = _form()
        resp = client.post("/api/v1/batch-synthesize", data=f["data"], files=f["files"])
    assert resp.status_code == 404


def test_all_entries_fail_returns_500():
    with patch("app.services.tts_service.synthesize", side_effect=RuntimeError("fail")):
        f = _form()
        resp = client.post("/api/v1/batch-synthesize", data=f["data"], files=f["files"])
    assert resp.status_code == 500


def test_timeout_returns_504():
    import asyncio
    with patch("asyncio.wait_for", side_effect=asyncio.TimeoutError):
        f = _form()
        resp = client.post("/api/v1/batch-synthesize", data=f["data"], files=f["files"])
    assert resp.status_code == 504
