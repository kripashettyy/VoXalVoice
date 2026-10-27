"""Property tests for prosody processor (Properties 13, 14)."""
from hypothesis import given, settings as h_settings
from hypothesis import strategies as st
from app.services.prosody_processor import process


@h_settings(max_examples=200)
@given(text=st.text(
    alphabet=st.characters(blacklist_categories=('Cs',)),
    min_size=1,
    max_size=500,
))
def test_natural_flow_false_unchanged(text):
    """Property 14: natural_flow=False returns text unchanged."""
    # Feature: text-to-speech-studio, Property 14: Natural Flow toggle controls pause injection
    result = process(text, natural_flow=False)
    assert result == text


def test_comma_pause_injected():
    """Property 13: comma gets a 300ms break tag."""
    # Feature: text-to-speech-studio, Property 13: Prosody pause injection correctness
    result = process("Hello, world", natural_flow=True)
    assert '<break time="300ms"/>' in result


def test_sentence_pause_injected():
    """Property 13: period gets a 650ms break tag."""
    result = process("Hello. World", natural_flow=True)
    assert '<break time="650ms"/>' in result


def test_paragraph_pause_injected():
    """Property 13: double newline gets a 1050ms break tag."""
    result = process("Para one\n\nPara two", natural_flow=True)
    assert '<break time="1050ms"/>' in result


@h_settings(max_examples=100)
@given(
    text=st.from_regex(r'[A-Za-z ]+,[A-Za-z ]+', fullmatch=True),
)
def test_natural_flow_true_adds_breaks(text):
    """Property 14: text with comma gets break marker when natural_flow=True."""
    result = process(text, natural_flow=True)
    assert '<break' in result
