"""Unit tests for batch_processor."""
import io
import zipfile
import numpy as np
import pytest
from unittest.mock import patch
from scipy.io import wavfile

from app.services.batch_processor import parse_batch_file, generate_batch, _safe_filename


def _wav(rate: int = 24000) -> bytes:
    t = np.linspace(0, 0.05, int(rate * 0.05), endpoint=False)
    buf = io.BytesIO()
    wavfile.write(buf, rate, (np.sin(2 * np.pi * 440 * t) * 16000).astype(np.int16))
    return buf.getvalue()


def _req():
    from app.models.requests import SynthesizeRequest
    return SynthesizeRequest(text="x", voice_id="en-US-AriaNeural", pitch=1.0, speed=1.0,
                             volume=0.8, tone_preset="neutral", natural_flow=True,
                             warmth=0.0, clarity=0.0, output_format="wav")


#  parse_batch_file 

def test_parse_txt_basic():
    entries = parse_batch_file("test.txt", "Hello.\nWorld.\n")
    assert entries == ["Hello.", "World."]

def test_parse_txt_skips_blank_lines():
    entries = parse_batch_file("test.txt", "A\n\nB\n\n\nC")
    assert entries == ["A", "B", "C"]

def test_parse_csv_first_column():
    entries = parse_batch_file("test.csv", "Hello world\nFoo bar\n")
    assert entries == ["Hello world", "Foo bar"]

def test_parse_csv_ignores_extra_columns():
    entries = parse_batch_file("test.csv", "text,label\nHello,en\nWorld,en")
    assert entries == ["text", "Hello", "World"]

def test_unsupported_extension_raises():
    with pytest.raises(ValueError, match="Unsupported file type"):
        parse_batch_file("test.xlsx", "content")

def test_empty_file_raises():
    with pytest.raises(ValueError, match="No entries"):
        parse_batch_file("test.txt", "\n\n\n")

def test_too_many_entries_raises():
    content = "\n".join([f"line {i}" for i in range(201)])
    with pytest.raises(ValueError, match="Too many"):
        parse_batch_file("test.txt", content)

def test_entry_too_long_raises():
    with pytest.raises(ValueError, match="too long"):
        parse_batch_file("test.txt", "x" * 5001)

def test_exactly_200_entries_ok():
    content = "\n".join([f"line {i}" for i in range(200)])
    entries = parse_batch_file("test.txt", content)
    assert len(entries) == 200


# safe_filename 

def test_safe_filename_basic():
    assert _safe_filename("Hello world", 1) == "001_Hello_world.wav"

def test_safe_filename_strips_special_chars():
    name = _safe_filename("Hello! @World#", 5)
    assert name.startswith("005_")
    assert "!" not in name
    assert "@" not in name

def test_safe_filename_empty_text():
    assert _safe_filename("", 3) == "003_entry.wav"

def test_safe_filename_index_padding():
    assert _safe_filename("x", 42).startswith("042_")


#  generate_batch 

def test_generate_batch_returns_zip():
    wav = _wav()
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        result, count = generate_batch(["Hello.", "World."], _req())
    assert result[:2] == b"PK"
    assert count == 2

def test_generate_batch_zip_contains_wavs():
    wav = _wav()
    with patch("app.services.tts_service.synthesize") as mock:
        mock.return_value = io.BytesIO(wav)
        result, _ = generate_batch(["Hello.", "World."], _req())
    with zipfile.ZipFile(io.BytesIO(result)) as zf:
        names = zf.namelist()
    assert len(names) == 2
    assert all(n.endswith(".wav") for n in names)

def test_generate_batch_skips_failed_entries():
    wav = _wav()
    calls = [0]
    def side_effect(params):
        calls[0] += 1
        if calls[0] == 2:
            raise RuntimeError("engine fail")
        return io.BytesIO(wav)
    with patch("app.services.tts_service.synthesize", side_effect=side_effect):
        result, count = generate_batch(["A", "B", "C"], _req())
    assert count == 2

def test_generate_batch_all_fail_raises():
    with patch("app.services.tts_service.synthesize", side_effect=RuntimeError("fail")):
        with pytest.raises(RuntimeError, match="All entries failed"):
            generate_batch(["A", "B"], _req())

def test_generate_batch_voice_not_found_propagates():
    from app.services.tts_service import VoiceNotFoundError
    with patch("app.services.tts_service.synthesize", side_effect=VoiceNotFoundError("bad")):
        with pytest.raises(VoiceNotFoundError):
            generate_batch(["Hello."], _req())
