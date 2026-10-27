"""Application configuration loaded from environment variables."""

from __future__ import annotations

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Store as plain str to avoid pydantic-settings JSON-parsing it.
    # Use the ALLOWED_ORIGINS property below throughout the app.
    ALLOWED_ORIGINS_RAW: str = Field(
        default="http://localhost:3000",
        alias="ALLOWED_ORIGINS",
    )

    ENGINE_SELECTION: str = Field(default="edge-tts")

    DEFAULT_PITCH: float = Field(default=1.0, ge=0.5, le=2.0)
    DEFAULT_SPEED: float = Field(default=1.0, ge=0.5, le=2.5)
    DEFAULT_VOLUME: float = Field(default=0.8, ge=0.0, le=1.0)

    @property
    def ALLOWED_ORIGINS(self) -> list[str]:
        """Parse comma-separated origins into a list."""
        return [o.strip() for o in self.ALLOWED_ORIGINS_RAW.split(",") if o.strip()]


settings = Settings()
