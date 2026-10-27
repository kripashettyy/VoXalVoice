"""FastAPI application entry point for VoXalVoice."""
import logging
import traceback

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.logging import configure_logging
from app.core.middleware import CorrelationIdMiddleware
from app.api.v1 import health, voices, synthesize as synthesize_router, extract as extract_router, analyze as analyze_router, voiceover as voiceover_router, subtitle as subtitle_router, dialogue as dialogue_router, batch as batch_router, reels as reels_router

# Configure structured logging before anything else
configure_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title="VoXalVoice API",
    description="Text-to-Speech Studio — FastAPI backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

#  Middleware 
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(CorrelationIdMiddleware)

#  Routers 
app.include_router(health.router, prefix="/api/v1")
app.include_router(voices.router, prefix="/api/v1")
app.include_router(synthesize_router.router, prefix="/api/v1")
app.include_router(extract_router.router, prefix="/api/v1")
app.include_router(analyze_router.router, prefix="/api/v1")
app.include_router(voiceover_router.router, prefix="/api/v1")
app.include_router(subtitle_router.router, prefix="/api/v1")
app.include_router(dialogue_router.router, prefix="/api/v1")
app.include_router(batch_router.router, prefix="/api/v1")
app.include_router(reels_router.router, prefix="/api/v1")

#  Exception handlers 

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error.get("loc", []))
        msg = error.get("msg", "Invalid value")
        received = error.get("input", "")
        errors.append(f"{field}: {msg}. Received: {received!r}")
    detail = "; ".join(errors)
    logger.warning("Validation error on %s: %s", request.url, detail)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": detail},
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(
        "Unhandled exception on %s: %s\n%s",
        request.url,
        exc,
        traceback.format_exc(),
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong. Please try again."},
    )
