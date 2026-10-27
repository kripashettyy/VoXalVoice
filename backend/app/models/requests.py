"""Request schemas for the VoXalVoice API."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class SynthesizeRequest(BaseModel):
    """Request body for POST /api/v1/synthesize.

    All fields with defaults are optional; only `text` and `voice_id`
    are required.  Field constraints are enforced by Pydantic v2 before
    the request reaches any route handler, so a 422 is returned
    automatically for any violation.
    """

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "text": "Hello, welcome to VoXalVoice.",
                "voice_id": "en-US-AriaNeural",
                "pitch": 1.0,
                "speed": 1.0,
                "volume": 0.8,
                "tone_preset": "neutral",
                "natural_flow": True,
                "warmth": 0.0,
                "clarity": 0.0,
                "output_format": "wav",
            }
        }
    )

    text: str = Field(
        ...,
        min_length=1,
        max_length=50000,
        description="The text to synthesize. Must be between 1 and 50,000 characters.",
        examples=["Hello, welcome to VoXalVoice."],
    )
    voice_id: str = Field(
        ...,
        min_length=1,
        description="Identifier of the voice to use for synthesis.",
        examples=["en-US-AriaNeural"],
    )
    pitch: float = Field(
        default=1.0,
        ge=0.5,
        le=2.0,
        description="Pitch multiplier relative to the engine default. Range: 0.5–2.0.",
        examples=[1.0],
    )
    speed: float = Field(
        default=1.0,
        ge=0.5,
        le=2.5,
        description="Speed (rate) multiplier relative to the engine default. Range: 0.5–2.5.",
        examples=[1.0],
    )
    volume: float = Field(
        default=0.8,
        ge=0.0,
        le=1.0,
        description="Output volume as a fraction of maximum. Range: 0.0–1.0.",
        examples=[0.8],
    )
    tone_preset: Literal["neutral", "warm", "crisp"] = Field(
        default="neutral",
        description="Tone shaping preset applied before EQ processing.",
        examples=["neutral"],
    )
    natural_flow: bool = Field(
        default=True,
        description=(
            "When True, punctuation-based prosodic pauses are injected "
            "before synthesis. When False, the engine's default prosody is used."
        ),
        examples=[True],
    )
    warmth: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description=(
            "Low-frequency resonance boost applied by the EQ processor. "
            "0.0 = no boost, 1.0 = maximum boost (~6 dB at 250 Hz)."
        ),
        examples=[0.0],
    )
    clarity: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description=(
            "High-frequency articulation boost applied by the EQ processor. "
            "0.0 = no boost, 1.0 = maximum boost (~6 dB at 4000 Hz)."
        ),
        examples=[0.0],
    )
    output_format: Literal["wav"] = Field(
        default="wav",
        description="Audio container format for the synthesized output.",
        examples=["wav"],
    )


# PreviewRequest uses the same schema as SynthesizeRequest.
# The service layer is responsible for truncating `text` to 200 characters
# before passing it to the TTS engine.
PreviewRequest = SynthesizeRequest
