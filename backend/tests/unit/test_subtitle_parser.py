"""Unit tests for subtitle_parser — SRT and VTT parsing."""
import pytest
from app.services.subtitle_parser import (
    parse_srt,
    parse_vtt,
    parse_subtitle_file,
    _timestamp_to_ms,
    _strip_tags,
)


# ---------------------------------------------------------------------------
# _timestamp_to_ms
# ---------------------------------------------------------------------------

def test_timestamp_srt_format():
    assert _timestamp_to_ms("00:00:01,000") == 1000

def test_timestamp_vtt_format():
    assert _timestamp_to_ms("00:00:01.500") == 1500

def test_timestamp_hours():
    assert _timestamp_to_ms("01:00:00,000") == 3_600_000

def test_timestamp_minutes_and_seconds():
    assert _timestamp_to_ms("00:01:30,250") == 90_250

def test_timestamp_short_mm_ss():
    assert _timestamp_to_ms("01:30.500") == 90_500


# ---------------------------------------------------------------------------
# _strip_tags
# ---------------------------------------------------------------------------

def test_strip_html_bold():
    assert _strip_tags("<b>Hello</b>") == "Hello"

def test_strip_html_italic():
    assert _strip_tags("<i>World</i>") == "World"

def test_strip_vtt_voice_tag():
    assert _strip_tags("<v John>Hello there") == "Hello there"

def test_strip_curly_braces():
    assert _strip_tags("{\\an8}Top text") == "Top text"

def test_strip_leaves_plain_text():
    assert _strip_tags("No tags here") == "No tags here"


# ---------------------------------------------------------------------------
# parse_srt
# ---------------------------------------------------------------------------

SRT_BASIC = (
    "1\n00:00:01,000 --> 00:00:03,500\nHello world.\n\n"
    "2\n00:00:04,000 --> 00:00:07,000\nSecond cue."
)

def test_srt_cue_count():
    cues = parse_srt(SRT_BASIC)
    assert len(cues) == 2

def test_srt_first_cue_timing():
    cues = parse_srt(SRT_BASIC)
    assert cues[0].start_ms == 1000
    assert cues[0].end_ms == 3500

def test_srt_second_cue_timing():
    cues = parse_srt(SRT_BASIC)
    assert cues[1].start_ms == 4000
    assert cues[1].end_ms == 7000

def test_srt_text_content():
    cues = parse_srt(SRT_BASIC)
    assert cues[0].text == "Hello world."
    assert cues[1].text == "Second cue."

def test_srt_index_preserved():
    cues = parse_srt(SRT_BASIC)
    assert cues[0].index == 1
    assert cues[1].index == 2

def test_srt_strips_html_tags():
    srt = "1\n00:00:01,000 --> 00:00:03,000\n<b>Bold</b> and <i>italic</i>."
    cues = parse_srt(srt)
    assert cues[0].text == "Bold and italic."

def test_srt_multiline_cue_joined():
    srt = "1\n00:00:01,000 --> 00:00:03,000\nLine one\nLine two."
    cues = parse_srt(srt)
    assert cues[0].text == "Line one Line two."

def test_srt_empty_text_cue_skipped():
    srt = "1\n00:00:01,000 --> 00:00:03,000\n<b></b>\n\n2\n00:00:04,000 --> 00:00:06,000\nKeep this."
    cues = parse_srt(srt)
    assert len(cues) == 1
    assert cues[0].text == "Keep this."

def test_srt_empty_string_returns_empty():
    assert parse_srt("") == []

def test_srt_no_valid_blocks_returns_empty():
    assert parse_srt("just some random text\nno timestamps here") == []

def test_srt_windows_line_endings():
    srt = "1\r\n00:00:01,000 --> 00:00:03,000\r\nHello.\r\n"
    cues = parse_srt(srt)
    assert len(cues) == 1
    assert cues[0].text == "Hello."


# ---------------------------------------------------------------------------
# parse_vtt
# ---------------------------------------------------------------------------

VTT_BASIC = (
    "WEBVTT\n\n"
    "00:00:01.000 --> 00:00:03.500\nHello VTT.\n\n"
    "cue-id\n00:00:05.000 --> 00:00:08.000\nSecond cue."
)

def test_vtt_cue_count():
    cues = parse_vtt(VTT_BASIC)
    assert len(cues) == 2

def test_vtt_first_cue_timing():
    cues = parse_vtt(VTT_BASIC)
    assert cues[0].start_ms == 1000
    assert cues[0].end_ms == 3500

def test_vtt_cue_with_identifier():
    cues = parse_vtt(VTT_BASIC)
    assert cues[1].start_ms == 5000
    assert cues[1].text == "Second cue."

def test_vtt_strips_inline_tags():
    vtt = "WEBVTT\n\n00:00:01.000 --> 00:00:03.000\n<c.yellow>Coloured</c> text."
    cues = parse_vtt(vtt)
    assert cues[0].text == "Coloured text."

def test_vtt_missing_header_raises():
    with pytest.raises(ValueError, match="WEBVTT"):
        parse_vtt("00:00:01.000 --> 00:00:03.000\nNo header.")

def test_vtt_note_block_ignored():
    vtt = "WEBVTT\n\nNOTE This is a comment\n\n00:00:01.000 --> 00:00:03.000\nReal cue."
    cues = parse_vtt(vtt)
    assert len(cues) == 1
    assert cues[0].text == "Real cue."

def test_vtt_empty_after_header_returns_empty():
    assert parse_vtt("WEBVTT\n\n") == []


# ---------------------------------------------------------------------------
# parse_subtitle_file
# ---------------------------------------------------------------------------

def test_dispatch_srt_extension():
    srt = "1\n00:00:01,000 --> 00:00:03,000\nHello."
    cues = parse_subtitle_file("my_file.srt", srt)
    assert len(cues) == 1

def test_dispatch_vtt_extension():
    vtt = "WEBVTT\n\n00:00:01.000 --> 00:00:03.000\nHello."
    cues = parse_subtitle_file("my_file.vtt", vtt)
    assert len(cues) == 1

def test_dispatch_unsupported_extension_raises():
    with pytest.raises(ValueError, match="Unsupported subtitle format"):
        parse_subtitle_file("video.mp4", "content")

def test_dispatch_no_extension_raises():
    with pytest.raises(ValueError, match="Unsupported subtitle format"):
        parse_subtitle_file("noextension", "content")
