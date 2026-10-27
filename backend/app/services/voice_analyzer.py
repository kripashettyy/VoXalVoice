"""Voice analysis service.

Analyses a user's voice recording and returns suggested TTS parameters
by matching acoustic features against known neural voice characteristics.

Algorithm (parameter-matching, no real cloning):
  1. Decode uploaded audio → mono float32 PCM via librosa
  2. Estimate fundamental pitch (Hz) using librosa.yin
  3. Estimate speaking rate proxy from voiced/unvoiced ratio
  4. Compute RMS energy for volume/warmth estimation
  5. Score every voice in VOICE_PROFILES against the measured features
  6. Return the best-matching voice_id + suggested parameter set
"""
from __future__ import annotations

import io
import logging
from dataclasses import dataclass
from typing import Optional

import numpy as np

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Acoustic profiles for known edge-tts voices.
# pitch_hz    : expected mean fundamental frequency of the voice
# tempo       : relative speaking pace  (0.8 = slow, 1.0 = normal, 1.2 = fast)
# warmth      : low-frequency richness  0.0–1.0
# clarity     : high-frequency crispness 0.0–1.0
# gender      : for coarse pre-filter
# ---------------------------------------------------------------------------
@dataclass
class VoiceProfile:
    voice_id: str
    name: str
    gender: str          # "male" | "female"
    pitch_hz: float      # expected mean F0
    tempo: float         # relative speaking rate
    warmth: float        # 0.0–1.0
    clarity: float       # 0.0–1.0


VOICE_PROFILES: list[VoiceProfile] = [
    # Female — English (US)
    VoiceProfile("en-US-AriaNeural",      "Aria",     "female", 210.0, 1.05, 0.55, 0.60),
    VoiceProfile("en-US-JennyNeural",     "Jenny",    "female", 195.0, 1.00, 0.60, 0.55),
    VoiceProfile("en-US-MichelleNeural",  "Michelle", "female", 220.0, 0.95, 0.65, 0.45),
    # Male — English (US)
    VoiceProfile("en-US-GuyNeural",       "Guy",      "male",   115.0, 1.10, 0.45, 0.65),
    VoiceProfile("en-US-DavisNeural",     "Davis",    "male",   105.0, 0.95, 0.70, 0.40),
    VoiceProfile("en-US-TonyNeural",      "Tony",     "male",   120.0, 1.05, 0.50, 0.60),
    # Female — English (GB)
    VoiceProfile("en-GB-SoniaNeural",     "Sonia",    "female", 205.0, 0.95, 0.55, 0.65),
    VoiceProfile("en-GB-LibbyNeural",     "Libby",    "female", 215.0, 1.00, 0.50, 0.60),
    # Male — English (GB)
    VoiceProfile("en-GB-RyanNeural",      "Ryan",     "male",   110.0, 1.00, 0.55, 0.55),
    # Female — English (AU/IN)
    VoiceProfile("en-AU-NatashaNeural",   "Natasha",  "female", 200.0, 0.95, 0.60, 0.55),
    VoiceProfile("en-IN-NeerjaNeural",    "Neerja",   "female", 225.0, 1.05, 0.65, 0.50),
    # Male — English (AU/IN)
    VoiceProfile("en-AU-WilliamNeural",   "William",  "male",   108.0, 0.95, 0.60, 0.50),
    VoiceProfile("en-IN-PrabhatNeural",   "Prabhat",  "male",   118.0, 1.00, 0.65, 0.45),
]


@dataclass
class AnalysisResult:
    """Returned from analyse_voice()."""
    voice_id: str
    voice_name: str
    gender: str
    confidence: float         # 0.0–1.0

    # Suggested synthesis parameters
    pitch: float              # SynthesizeRequest.pitch  (0.5–2.0)
    speed: float              # SynthesizeRequest.speed  (0.5–2.5)
    volume: float             # SynthesizeRequest.volume (0.0–1.0)
    warmth: float             # EQ warmth                (0.0–1.0)
    clarity: float            # EQ clarity               (0.0–1.0)
    tone_preset: str          # "neutral" | "warm" | "crisp"

    # Raw measurements (for display)
    measured_pitch_hz: float
    measured_energy_rms: float
    measured_speaking_rate: float  # voiced frames / total × 100


def _decode_audio(data: bytes) -> tuple[np.ndarray, int]:
    """Decode audio bytes (WAV, WebM, Opus, OGG, MP3) → mono float32.

    librosa.load uses soundfile which cannot handle WebM/Opus containers
    (the format browsers produce via MediaRecorder). We first try soundfile
    directly (works for WAV/FLAC/OGG), then fall back to pydub which uses
    ffmpeg and handles everything.
    """
    import librosa  # type: ignore

    # Fast path — soundfile-compatible formats (WAV, FLAC, OGG Vorbis)
    try:
        audio, sr = librosa.load(io.BytesIO(data), sr=None, mono=True)
        return audio.astype(np.float32), int(sr)
    except Exception:
        pass  # fall through to pydub

    # Slow path — anything ffmpeg can read (WebM, Opus, MP4, MP3 …)
    try:
        from pydub import AudioSegment  # type: ignore

        seg = AudioSegment.from_file(io.BytesIO(data))
        # Convert to mono 16-bit WAV in memory
        seg = seg.set_channels(1).set_frame_rate(16000).set_sample_width(2)
        wav_io = io.BytesIO()
        seg.export(wav_io, format="wav")
        wav_io.seek(0)
        audio, sr = librosa.load(wav_io, sr=None, mono=True)
        return audio.astype(np.float32), int(sr)
    except Exception as exc:
        raise RuntimeError(
            f"Format not recognised even after ffmpeg decode. ({exc})"
        ) from exc


def _estimate_pitch(audio: np.ndarray, sr: int) -> float:
    """Estimate mean fundamental frequency using YIN algorithm."""
    import librosa  # type: ignore
    f0 = librosa.yin(
        audio,
        fmin=librosa.note_to_hz('C2'),   # ~65 Hz
        fmax=librosa.note_to_hz('C7'),   # ~2093 Hz
        sr=sr,
    )
    # Filter out unvoiced frames (yin returns 0 or nan for them)
    voiced = f0[(f0 > 60) & (f0 < 600)]
    if len(voiced) == 0:
        return 150.0  # neutral fallback
    return float(np.median(voiced))


def _estimate_energy(audio: np.ndarray) -> float:
    """Compute RMS energy, normalised to 0.0–1.0 approx."""
    rms = float(np.sqrt(np.mean(audio ** 2)))
    return min(1.0, rms * 10)   # scale so typical speech lands ~0.3–0.8


def _estimate_speaking_rate(audio: np.ndarray, sr: int) -> float:
    """Estimate voiced fraction as a proxy for speaking pace (0–100)."""
    import librosa  # type: ignore
    intervals = librosa.effects.split(audio, top_db=25)
    if len(intervals) == 0:
        return 50.0
    voiced_samples = sum(end - start for start, end in intervals)
    return float(voiced_samples / len(audio) * 100)


def _infer_gender(pitch_hz: float) -> str:
    """Rough gender inference from pitch."""
    return "female" if pitch_hz >= 155 else "male"


def _score_profile(profile: VoiceProfile, pitch_hz: float) -> float:
    """
    Score how well a voice profile matches the measured pitch.
    Returns 0.0 (no match) → 1.0 (perfect match).
    """
    # Pitch distance — exponential decay, half-score at 40 Hz away
    pitch_diff = abs(profile.pitch_hz - pitch_hz)
    pitch_score = np.exp(-pitch_diff / 40.0)
    return float(pitch_score)


def _map_pitch_to_param(measured: float, target: float) -> float:
    """
    Map the user's measured pitch onto a SynthesizeRequest.pitch value
    by computing the ratio against the voice's natural pitch.
    Clamps to [0.5, 2.0].
    """
    ratio = measured / target
    return float(np.clip(ratio, 0.5, 2.0))


def _map_energy_to_warmth(energy: float, base_warmth: float) -> float:
    """Higher energy → slightly more warmth. Clamps to [0.0, 1.0]."""
    delta = (energy - 0.5) * 0.2
    return float(np.clip(base_warmth + delta, 0.0, 1.0))


def _speaking_rate_to_speed(rate: float, base_tempo: float) -> float:
    """Map voiced-fraction (0–100) to a speed multiplier. Clamps to [0.5, 2.0]."""
    # Fast speakers (rate > 70) → slightly faster synthesis
    normalized = (rate - 50) / 50      # -1 … +1
    adjustment = normalized * 0.3
    return float(np.clip(base_tempo + adjustment, 0.5, 2.0))


def _tone_preset(warmth: float, clarity: float) -> str:
    if warmth > 0.6:
        return "warm"
    if clarity > 0.6:
        return "crisp"
    return "neutral"


def analyse_voice(audio_data: bytes) -> AnalysisResult:
    """
    Main entry point. Accept raw audio bytes, return AnalysisResult.

    Raises:
        ValueError: audio too short or unreadable
        RuntimeError: librosa not installed or analysis failed
    """
    try:
        audio, sr = _decode_audio(audio_data)
    except Exception as exc:
        raise ValueError(
            f"Could not read the audio recording. "
            f"Make sure your browser supports microphone recording. ({exc})"
        ) from exc

    # Need at least 1 second of audio
    if len(audio) < sr:
        raise ValueError(
            "Recording is too short. Please record at least 2 seconds of speech."
        )

    try:
        pitch_hz = _estimate_pitch(audio, sr)
        energy = _estimate_energy(audio)
        speaking_rate = _estimate_speaking_rate(audio, sr)
    except Exception as exc:
        logger.exception("Acoustic analysis failed")
        raise RuntimeError(f"Acoustic analysis failed: {exc}") from exc

    gender = _infer_gender(pitch_hz)

    # Score all profiles — prefer same gender, but don't hard-exclude cross-gender
    scored: list[tuple[float, VoiceProfile]] = []
    for profile in VOICE_PROFILES:
        score = _score_profile(profile, pitch_hz)
        # Small bonus for same-gender match
        if profile.gender == gender:
            score *= 1.2
        scored.append((score, profile))

    scored.sort(key=lambda x: x[0], reverse=True)
    best_score, best = scored[0]

    # Normalise confidence to 0–1
    max_possible = 1.2   # same-gender perfect pitch match
    confidence = min(1.0, best_score / max_possible)

    # Derive synthesis parameters
    pitch_param  = _map_pitch_to_param(pitch_hz, best.pitch_hz)
    speed_param  = _speaking_rate_to_speed(speaking_rate, best.tempo)
    warmth_param = _map_energy_to_warmth(energy, best.warmth)
    clarity_param = float(np.clip(best.clarity, 0.0, 1.0))
    volume_param = float(np.clip(0.4 + energy * 0.6, 0.4, 1.0))

    return AnalysisResult(
        voice_id=best.voice_id,
        voice_name=best.name,
        gender=best.gender,
        confidence=round(confidence, 3),
        pitch=round(pitch_param, 3),
        speed=round(speed_param, 3),
        volume=round(volume_param, 3),
        warmth=round(warmth_param, 3),
        clarity=round(clarity_param, 3),
        tone_preset=_tone_preset(warmth_param, clarity_param),
        measured_pitch_hz=round(pitch_hz, 1),
        measured_energy_rms=round(energy, 3),
        measured_speaking_rate=round(speaking_rate, 1),
    )
