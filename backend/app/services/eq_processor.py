"""EQ post-processor using scipy SOS biquad filters."""
import io
import logging
import struct
import warnings

import numpy as np
from scipy.io import wavfile
from scipy.signal import sosfilt, sosfilt_zi, butter

logger = logging.getLogger(__name__)


def _low_shelf_sos(gain_db: float, cutoff_hz: float, sample_rate: int) -> np.ndarray:
    """Design a low-shelf SOS filter."""
    # Use a simple first-order shelf approximation via butter + gain
    # For a shelf, we boost/cut around the cutoff using a bilinear approach
    A = 10 ** (gain_db / 40.0)  # amplitude sqrt
    w0 = 2 * np.pi * cutoff_hz / sample_rate
    # shelving filter coefficients
    cos_w0 = np.cos(w0)
    sin_w0 = np.sin(w0)
    alpha = sin_w0 / 2 * np.sqrt((A + 1/A) * (1/0.9 - 1) + 2)

    b0 =    A*((A+1) - (A-1)*cos_w0 + 2*np.sqrt(A)*alpha)
    b1 =  2*A*((A-1) - (A+1)*cos_w0)
    b2 =    A*((A+1) - (A-1)*cos_w0 - 2*np.sqrt(A)*alpha)
    a0 =       (A+1) + (A-1)*cos_w0 + 2*np.sqrt(A)*alpha
    a1 =   -2*((A-1) + (A+1)*cos_w0)
    a2 =       (A+1) + (A-1)*cos_w0 - 2*np.sqrt(A)*alpha

    return np.array([[b0/a0, b1/a0, b2/a0, 1.0, a1/a0, a2/a0]])


def _high_shelf_sos(gain_db: float, cutoff_hz: float, sample_rate: int) -> np.ndarray:
    """Design a high-shelf SOS filter."""
    A = 10 ** (gain_db / 40.0)
    w0 = 2 * np.pi * cutoff_hz / sample_rate
    cos_w0 = np.cos(w0)
    sin_w0 = np.sin(w0)
    alpha = sin_w0 / 2 * np.sqrt((A + 1/A) * (1/0.9 - 1) + 2)

    b0 =    A*((A+1) + (A-1)*cos_w0 + 2*np.sqrt(A)*alpha)
    b1 = -2*A*((A-1) + (A+1)*cos_w0)
    b2 =    A*((A+1) + (A-1)*cos_w0 - 2*np.sqrt(A)*alpha)
    a0 =       (A+1) - (A-1)*cos_w0 + 2*np.sqrt(A)*alpha
    a1 =    2*((A-1) - (A+1)*cos_w0)
    a2 =       (A+1) - (A-1)*cos_w0 - 2*np.sqrt(A)*alpha

    return np.array([[b0/a0, b1/a0, b2/a0, 1.0, a1/a0, a2/a0]])


def apply_eq(audio_bytes: bytes, warmth: float, clarity: float) -> bytes:
    """
    Apply low-shelf (warmth) and high-shelf (clarity) EQ to WAV audio.

    - warmth: 0.0–1.0 → gain at 250 Hz = warmth * 6.0 dB
    - clarity: 0.0–1.0 → gain at 4000 Hz = clarity * 6.0 dB
    - Early return when both are 0.0
    - Catches NaN/Inf overflow and returns unfiltered with warning
    - Catches malformed WAV and returns unfiltered with warning
    - Raises ValueError for empty buffer
    """
    if not audio_bytes:
        raise ValueError("Audio buffer is empty. Cannot apply EQ.")

    # Early return – no filtering needed
    if warmth == 0.0 and clarity == 0.0:
        return audio_bytes

    # Validate WAV header
    if len(audio_bytes) < 12 or audio_bytes[0:4] != b'RIFF' or audio_bytes[8:12] != b'WAVE':
        logger.warning("apply_eq: malformed WAV input, returning unfiltered audio")
        return audio_bytes

    try:
        sample_rate, data = wavfile.read(io.BytesIO(audio_bytes))
    except (ValueError, struct.error, Exception) as exc:
        logger.warning("apply_eq: failed to read WAV (%s), returning unfiltered audio", exc)
        return audio_bytes

    original_dtype = data.dtype
    data_float = data.astype(np.float64)
    if data_float.ndim == 2:
        data_float = data_float.mean(axis=1)

    filtered = data_float.copy()

    try:
        if warmth > 0.0:
            gain_db = warmth * 6.0
            sos = _low_shelf_sos(gain_db, 250.0, sample_rate)
            filtered = sosfilt(sos, filtered)

        if clarity > 0.0:
            gain_db = clarity * 6.0
            sos = _high_shelf_sos(gain_db, 4000.0, sample_rate)
            filtered = sosfilt(sos, filtered)

        # Check for numerical instability
        if np.any(np.isnan(filtered) | np.isinf(filtered)):
            logger.warning("apply_eq: filter produced NaN/Inf, returning unfiltered audio")
            return audio_bytes

    except Exception as exc:
        logger.warning("apply_eq: filter error (%s), returning unfiltered audio", exc)
        return audio_bytes

    # Convert back to original dtype
    if np.issubdtype(original_dtype, np.integer):
        info = np.iinfo(original_dtype)
        filtered = np.clip(filtered, info.min, info.max).astype(original_dtype)
    else:
        filtered = filtered.astype(original_dtype)

    out = io.BytesIO()
    wavfile.write(out, sample_rate, filtered)
    return out.getvalue()
