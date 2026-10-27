"""Property tests for EQ processor (Properties 23, 24, 25)."""
import io
import numpy as np
import pytest
from hypothesis import given, settings as h_settings
from hypothesis import strategies as st
from scipy.io import wavfile

from app.services.eq_processor import apply_eq


def make_wav(duration_s: float = 0.1, sample_rate: int = 22050) -> bytes:
    """Create a simple sine-wave WAV for testing."""
    t = np.linspace(0, duration_s, int(sample_rate * duration_s), endpoint=False)
    samples = (np.sin(2 * np.pi * 440 * t) * 16000).astype(np.int16)
    buf = io.BytesIO()
    wavfile.write(buf, sample_rate, samples)
    return buf.getvalue()


def test_eq_identity_at_zero():
    """Property 24: apply_eq with warmth=0 and clarity=0 returns identical bytes."""
    # Feature: text-to-speech-studio, Property 24: EQ identity at zero
    wav = make_wav()
    result = apply_eq(wav, warmth=0.0, clarity=0.0)
    assert result == wav


@h_settings(max_examples=100)
@given(
    warmth=st.floats(min_value=0.0, max_value=1.0, allow_nan=False),
    clarity=st.floats(min_value=0.0, max_value=1.0, allow_nan=False),
)
def test_eq_preserves_metadata(warmth, clarity):
    """Property 25: EQ preserves sample rate and bit depth."""
    # Feature: text-to-speech-studio, Property 25: EQ preserves audio metadata
    wav = make_wav(sample_rate=22050)
    result = apply_eq(wav, warmth=warmth, clarity=clarity)

    sr_in, _ = wavfile.read(io.BytesIO(wav))
    sr_out, data_out = wavfile.read(io.BytesIO(result))

    assert sr_in == sr_out
    assert data_out.dtype == np.int16


def test_eq_empty_buffer_raises():
    """EQ on empty buffer raises ValueError."""
    with pytest.raises(ValueError, match="empty"):
        apply_eq(b"", warmth=0.5, clarity=0.5)
