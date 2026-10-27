"""Response schemas for the VoXalVoice API."""

from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class VoiceInfo(BaseModel):
    """A single voice entry returned by GET /api/v1/voices."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "en-US-AriaNeural",
                "name": "Aria",
                "gender": "female",
                "engine": "edge-tts",
                "locale": "en-US",
            }
        }
    )

    id: str = Field(
        ...,
        min_length=1,
        description="Unique identifier for the voice used in synthesis requests.",
        examples=["en-US-AriaNeural"],
    )
    name: str = Field(
        ...,
        min_length=1,
        description="Human-readable display name for the voice.",
        examples=["Aria"],
    )
    gender: Literal["male", "female"] = Field(
        ...,
        description="Gender classification used for grouping in the UI.",
        examples=["female"],
    )
    engine: str = Field(
        ...,
        min_length=1,
        description="The TTS engine that provides this voice (e.g. 'edge-tts', 'espeak').",
        examples=["edge-tts"],
    )
    locale: Optional[str] = Field(
        default=None,
        description="BCP-47 locale tag for the voice (e.g. 'en-US'). May be None if unknown.",
        examples=["en-US"],
    )


class HealthResponse(BaseModel):
    """Response body for GET /api/v1/health."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "ok",
            }
        }
    )

    status: Literal["ok"] = Field(
        ...,
        description="Service health status. Always 'ok' when the service is operational.",
        examples=["ok"],
    )
