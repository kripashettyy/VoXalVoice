"""Property tests for SSML tag stripping (Property 18)."""
from hypothesis import given, settings as h_settings
from hypothesis import strategies as st
import re
from app.services.engines.base import strip_ssml


@h_settings(max_examples=200)
@given(text=st.text(
    alphabet=st.characters(blacklist_categories=('Cs',)),
    max_size=500,
))
def test_no_tags_in_output(text):
    """Property 18: strip_ssml removes all XML/SSML tags."""
    # Feature: text-to-speech-studio, Property 18: SSML tag stripping
    result = strip_ssml(text)
    assert not re.search(r'<[^>]+>', result)


def test_plain_text_preserved():
    """Plain text between tags is preserved."""
    result = strip_ssml('<speak>Hello <break time="300ms"/> world</speak>')
    assert 'Hello' in result
    assert 'world' in result
