"""Abstract TTS engine base class and SSML utilities."""
import re
from abc import ABC, abstractmethod


def strip_ssml(text: str) -> str:
    """Remove all SSML/XML tags from text, preserving plain-text content."""
    return re.sub(r'<[^>]+>', '', text)


class AbstractTTSEngine(ABC):
    """Unified synthesis interface for all TTS engine adapters."""

    @abstractmethod
    def synthesize(self, text: str, voice_id: str, params: dict) -> bytes:
        """Synthesize text and return raw WAV bytes."""
        ...
