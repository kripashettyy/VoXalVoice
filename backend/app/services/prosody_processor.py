"""Prosody pre-processor: enhances text rhythm using punctuation and spacing.

edge-tts 7.x escapes all text before embedding it in its internal SSML, so
injecting raw <break> tags does not work — they get read aloud as literal text.
Instead, we nudge natural pauses using punctuation and whitespace that edge-tts
already responds to natively.
"""
import re


def process(text: str, natural_flow: bool) -> str:
    """
    Pre-process text for natural prosody.

    When natural_flow=True:
      - Ensures sentence-ending punctuation is followed by two spaces, which
        prompts a slightly longer inter-sentence pause from the TTS engine.
      - Converts bare line breaks to paragraph breaks (blank line) so the
        engine produces a noticeable pause between sections.
      - Removes any stray SSML-like tags that may have crept in from prior
        processing, preventing them from being read aloud.

    When natural_flow=False, returns the original text unchanged.
    """
    if not natural_flow:
        return text

    # Strip any accidental SSML tags so they are never read aloud
    result = re.sub(r'<[^>]+>', '', text)

    # Paragraph: single newline → double newline (stronger pause)
    result = re.sub(r'(?<!\n)\n(?!\n)', '\n\n', result)

    # Sentence endings: ensure two spaces after . ! ? for a longer pause
    result = re.sub(r'([.!?])\s+', r'\1  ', result)

    return result
