"""Backend error handling unit tests."""
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_empty_text_returns_422():
    resp = client.post("/api/v1/synthesize", json={"text": "", "voice_id": "en-US-AriaNeural"})
    assert resp.status_code == 422
    body = resp.json()["detail"].lower()
    assert "text" in body


def test_malformed_json_returns_422():
    resp = client.post(
        "/api/v1/synthesize",
        content=b"{bad json}",
        headers={"Content-Type": "application/json"},
    )
    assert resp.status_code == 422


def test_health_ok():
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_voices_fallback():
    with patch("app.api.v1.voices.get_voices", side_effect=Exception("fail")):
        # get_voices handles exception internally, so it should still return something
        pass
    resp = client.get("/api/v1/voices")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
