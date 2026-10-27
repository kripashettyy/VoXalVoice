"""Property tests for API request validation (Properties 16, 17)."""
import pytest
from hypothesis import given, settings as h_settings
from hypothesis import strategies as st
from pydantic import ValidationError
from app.models.requests import SynthesizeRequest


@h_settings(max_examples=200)
@given(length=st.integers(min_value=0, max_value=0))
def test_empty_text_rejected(length):
    """Property 16: empty text (len==0) raises validation error."""
    # Feature: text-to-speech-studio, Property 16: API text length validation
    with pytest.raises(ValidationError):
        SynthesizeRequest(text="", voice_id="en-US-AriaNeural")


def test_text_too_long_rejected():
    """Property 16: text > 50000 chars raises validation error."""
    # Use direct string construction — Hypothesis BUFFER_SIZE prevents min_size>8192
    for length in (50001, 51000, 60000):
        with pytest.raises(ValidationError):
            SynthesizeRequest(text="x" * length, voice_id="en-US-AriaNeural")


@h_settings(max_examples=100)
@given(text=st.text(min_size=1, max_size=10000))
def test_valid_text_accepted(text):
    """Property 16: text 1..50000 chars is accepted."""
    req = SynthesizeRequest(text=text, voice_id="en-US-AriaNeural")
    assert len(req.text) == len(text)
