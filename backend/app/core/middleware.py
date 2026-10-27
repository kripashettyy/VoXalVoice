"""
HTTP middleware for the VoXalVoice FastAPI backend.

Two pieces of middleware are provided and should be registered in ``main.py``:

1. **CORS middleware** (``fastapi.middleware.cors.CORSMiddleware``)
   Reads allowed origins from ``settings.ALLOWED_ORIGINS`` and applies the
   standard CORS headers to every response.  Call
   ``add_cors_middleware(app)`` to register it.

2. **Correlation ID middleware** (``CorrelationIdMiddleware``)
   For each incoming request:
   - Reads the ``X-Request-ID`` header when present; otherwise generates a
     UUID v4.
   - Stores the value in ``request_id_ctx`` (a ``ContextVar``) so that every
     log entry emitted during the request lifecycle automatically includes it.
   - Adds the same value back in the ``X-Request-ID`` response header so
     callers can correlate client-side and server-side logs.
"""

from __future__ import annotations

import uuid

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp

from app.core.config import settings
from app.core.logging import request_id_ctx


# ---------------------------------------------------------------------------
# CORS middleware helper
# ---------------------------------------------------------------------------

def add_cors_middleware(app: FastAPI) -> None:
    """Register ``CORSMiddleware`` on *app* using origins from ``settings``.

    Parameters
    ----------
    app:
        The FastAPI application instance to configure.
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# ---------------------------------------------------------------------------
# Correlation ID middleware
# ---------------------------------------------------------------------------

class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """Starlette ``BaseHTTPMiddleware`` that propagates a per-request
    correlation identifier.

    The middleware:
    - Extracts the ``X-Request-ID`` header from the incoming request; if the
      header is absent or empty, generates a fresh UUID v4.
    - Sets ``request_id_ctx`` so that ``JSONFormatter`` picks up the value in
      every log entry emitted during this request.
    - Injects the ``X-Request-ID`` header into the outgoing response.
    """

    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: object) -> Response:
        # Resolve the correlation ID from the request header, or generate one.
        request_id: str = (
            request.headers.get("X-Request-ID") or str(uuid.uuid4())
        )

        # Bind to the context variable for the duration of this request.  The
        # token returned by ``set()`` lets us reset to the previous value after
        # the request completes, keeping the context clean in re-used workers.
        token = request_id_ctx.set(request_id)
        try:
            response: Response = await call_next(request)
        finally:
            request_id_ctx.reset(token)

        # Echo the correlation ID back to the caller.
        response.headers["X-Request-ID"] = request_id
        return response
