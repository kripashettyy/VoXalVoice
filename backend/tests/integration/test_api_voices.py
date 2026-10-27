from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_voices_returns_list():
    resp = client.get("/api/v1/voices")
    assert resp.status_code == 200
    voices = resp.json()
    assert isinstance(voices, list)
    assert len(voices) >= 2
    genders = {v["gender"] for v in voices}
    assert "male" in genders
    assert "female" in genders


def test_voices_have_required_fields():
    resp = client.get("/api/v1/voices")
    for voice in resp.json():
        assert "id" in voice
        assert "name" in voice
        assert "gender" in voice
        assert "engine" in voice

