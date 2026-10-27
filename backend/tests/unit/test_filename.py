"""Property tests for filename sanitization (Property 15)."""
from hypothesis import given, settings as h_settings
from hypothesis import strategies as st
from app.utils.filename import sanitize_filename


@h_settings(max_examples=200)
@given(text=st.text(max_size=200))
def test_no_illegal_chars(text):
    """Property 15a: sanitized filename contains no illegal characters."""
    # Feature: text-to-speech-studio, Property 15: Download filename sanitization and idempotence
    result = sanitize_filename(text)
    illegal = set('/\\:*?"<>|')
    assert not any(c in illegal for c in result)


@h_settings(max_examples=200)
@given(text=st.text(max_size=200))
def test_no_consecutive_underscores(text):
    """Property 15b: no consecutive underscores in result."""
    result = sanitize_filename(text)
    assert '__' not in result


@h_settings(max_examples=200)
@given(text=st.text(max_size=200))
def test_idempotent(text):
    """Property 15c: sanitize_filename is idempotent."""
    once = sanitize_filename(text)
    twice = sanitize_filename(once)
    assert once == twice


@h_settings(max_examples=200)
@given(text=st.text(max_size=200))
def test_max_length(text):
    """Property 15d: result never exceeds max_chars."""
    result = sanitize_filename(text, max_chars=30)
    assert len(result) <= 30
