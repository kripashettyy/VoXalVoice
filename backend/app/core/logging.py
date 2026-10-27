"""
Structured JSON logging for the VoXalVoice backend.

Each log record emitted to stdout contains exactly four fields:
    timestamp   ISO-8601 UTC datetime string
    level       Log level name (e.g. "INFO", "WARNING", "ERROR")
    request_id  UUID v4 correlation identifier for the current request,
                sourced from the ``request_id_ctx`` ContextVar; falls back
                to "n/a" outside of a request context.
    message     Human-readable log message

Usage
-----
From any module, simply use the standard ``logging`` module:

    import logging
    logger = logging.getLogger(__name__)
    logger.info("Something happened")

Call ``configure_logging()`` once at application startup (in ``main.py``)
to install the JSON formatter and set the desired log level.
"""

from __future__ import annotations

import json
import logging
import logging.config
import sys
from contextvars import ContextVar
from datetime import datetime, timezone
from typing import Any

# ---------------------------------------------------------------------------
# Context variable that stores the current request's correlation ID.
# The correlation ID middleware sets this at the start of every request.
# ---------------------------------------------------------------------------
request_id_ctx: ContextVar[str] = ContextVar("request_id_ctx", default="n/a")


class JSONFormatter(logging.Formatter):
    """Custom log formatter that serialises each record as a single-line JSON
    object with exactly the four required fields.
    """

    def format(self, record: logging.LogRecord) -> str:
        """Return a JSON-serialised log entry string."""
        # Let the base class handle exception/stack-trace formatting first so
        # that ``record.message`` is fully resolved.
        record.message = record.getMessage()

        entry: dict[str, Any] = {
            "timestamp": datetime.now(tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "request_id": request_id_ctx.get(),
            "message": record.message,
        }

        # Append exception info as a separate "exc_info" key so that the four
        # mandatory fields are always present and the JSON structure is stable.
        if record.exc_info:
            entry["exc_info"] = self.formatException(record.exc_info)

        return json.dumps(entry, ensure_ascii=False)


def configure_logging(level: str = "INFO") -> None:
    """Install the JSON formatter on the root logger and direct output to
    stdout.

    Parameters
    ----------
    level:
        Logging level string accepted by ``logging.getLevelName``.
        Defaults to ``"INFO"``.
    """
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())

    root_logger = logging.getLogger()
    # Remove any handlers that may have been registered by uvicorn or other
    # libraries before this call so we don't produce duplicate entries.
    root_logger.handlers.clear()
    root_logger.addHandler(handler)
    root_logger.setLevel(getattr(logging, level.upper(), logging.INFO))

    # Suppress uvicorn's own access log and error log handlers — our JSON
    # formatter covers all log output.
    for uvicorn_logger_name in ("uvicorn", "uvicorn.access", "uvicorn.error"):
        uvicorn_logger = logging.getLogger(uvicorn_logger_name)
        uvicorn_logger.handlers.clear()
        uvicorn_logger.propagate = True
