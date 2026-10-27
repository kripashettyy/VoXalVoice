"""Integration tests for /api/v1/health."""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_returns_ok():
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_health_content_type_json():
    resp = client.get("/api/v1/health")
    assert "application/json" in resp.headers["content-type"]


def test_health_has_request_id_header():
    resp = client.get("/api/v1/health")
    assert "x-request-id" in resp.headers
