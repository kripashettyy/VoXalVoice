"""Health check endpoint."""
from fastapi import APIRouter
from app.models.responses import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check() -> HealthResponse:
    """Return service health status."""
    return HealthResponse(status="ok")
