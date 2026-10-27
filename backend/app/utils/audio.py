"""WAV byte-stream helpers: sample rate normalization and 16-bit PCM encoding."""

import io
import struct

import numpy as np
from scipy.io import wavfile
from scipy.signal import resample_poly


def normalize_wav(buf: bytes, target_sample_rate: int = 22050) -> bytes:
    """Normalize a WAV byte buffer to the target sample rate with 16-bit mono PCM.

    Steps performed:
    1. Validate RIFF/WAVE magic bytes.
    2. Read the WAV with scipy.
    3. If stereo, convert to mono by averaging channels.
    4. If sample_rate < target_sample_rate, upsample using resample_poly.
       Otherwise keep the original rate.
    5. Ensure output is 16-bit signed PCM (np.int16).
    6. Return WAV bytes via scipy.io.wavfile.write.

    Args:
        buf: Raw bytes of a valid WAV file.
        target_sample_rate: Minimum desired sample rate in Hz. Defaults to 22050.

    Returns:
        WAV bytes normalized to at least target_sample_rate, mono, 16-bit PCM.

    Raises:
        ValueError: If the buffer does not start with a valid RIFF/WAVE header.
        RuntimeError: If sample rate conversion fails.
    """
    # --- Validate RIFF/WAVE header magic bytes ---
    if len(buf) < 12:
        raise ValueError("Invalid audio format. Expected a WAV file.")
    riff_tag = buf[0:4]
    wave_tag = buf[8:12]
    if riff_tag != b"RIFF" or wave_tag != b"WAVE":
        raise ValueError("Invalid audio format. Expected a WAV file.")

    # --- Read WAV data ---
    sample_rate, data = wavfile.read(io.BytesIO(buf))

    # --- Convert to mono if stereo ---
    if data.ndim == 2:
        # Average across channels; preserve numeric type temporarily
        data = data.mean(axis=1)

    # --- Upsample if below target rate ---
    if sample_rate < target_sample_rate:
        # Compute a rational up/down ratio using GCD to keep resample_poly happy
        from math import gcd
        g = gcd(target_sample_rate, sample_rate)
        up = target_sample_rate // g
        down = sample_rate // g
        try:
            # resample_poly works best on float data
            data_float = data.astype(np.float64)
            data_float = resample_poly(data_float, up, down)
            data = data_float
        except Exception as exc:
            raise RuntimeError(
                f"Sample rate conversion failed from {sample_rate} Hz "
                f"to {target_sample_rate} Hz: {exc}"
            ) from exc
        out_rate = target_sample_rate
    else:
        out_rate = sample_rate

    # --- Ensure 16-bit signed PCM ---
    data = _to_int16(data)

    # --- Write back to bytes ---
    out_buf = io.BytesIO()
    wavfile.write(out_buf, out_rate, data)
    return out_buf.getvalue()


def bytes_to_wav(pcm_bytes: bytes, sample_rate: int, channels: int = 1) -> bytes:
    """Wrap raw int16 PCM bytes in a WAV (RIFF) container.

    Args:
        pcm_bytes: Raw 16-bit signed PCM audio bytes (little-endian).
        sample_rate: Sample rate in Hz.
        channels: Number of audio channels. Defaults to 1 (mono).

    Returns:
        WAV bytes suitable for playback or further processing.
    """
    # Interpret the raw bytes as int16 samples
    data = np.frombuffer(pcm_bytes, dtype=np.int16)

    if channels > 1:
        # Reshape into (frames, channels) so scipy writes the correct header
        data = data.reshape(-1, channels)

    out_buf = io.BytesIO()
    wavfile.write(out_buf, sample_rate, data)
    return out_buf.getvalue()


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _to_int16(data: np.ndarray) -> np.ndarray:
    """Convert a numpy audio array to int16, clipping to avoid overflow."""
    if data.dtype == np.int16:
        return data

    if np.issubdtype(data.dtype, np.floating):
        # Float arrays are typically in [-1.0, 1.0] or can be arbitrary scale
        # Detect the scale: if values are within [-1, 1] treat as normalized
        abs_max = np.abs(data).max()
        if abs_max == 0.0:
            return data.astype(np.int16)
        if abs_max <= 1.0:
            data = data * 32767.0
        # Otherwise assume already in int-like range; just clip and cast
        data = np.clip(data, -32768, 32767)
        return data.astype(np.int16)

    if data.dtype == np.int32:
        # Scale down from int32 range to int16 range
        data = (data / 65536.0).astype(np.float64)
        data = np.clip(data, -32768, 32767)
        return data.astype(np.int16)

    if data.dtype == np.uint8:
        # uint8 PCM is offset by 128; convert to signed int16
        data = (data.astype(np.int16) - 128) * 256
        return data.astype(np.int16)

    # Fallback: attempt a direct cast with clipping
    data = np.clip(data.astype(np.float64), -32768, 32767)
    return data.astype(np.int16)
