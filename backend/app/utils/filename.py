"""Filename sanitization utilities."""
import re


def sanitize_filename(text: str, max_chars: int = 30) -> str:
    """
    Sanitize a text string into a safe filename.
    
    - Replaces illegal filename characters (/\\:*?"<>|) with underscores
    - Collapses consecutive underscores to a single underscore
    - Strips leading and trailing underscores
    - Truncates to max_chars characters
    - Returns 'untitled' if the result is empty after sanitization
    """
    # Replace illegal characters
    result = re.sub(r'[/\\:*?"<>|]', '_', text)
    # Collapse consecutive underscores
    result = re.sub(r'_+', '_', result)
    # Strip leading/trailing underscores
    result = result.strip('_')
    # Truncate
    result = result[:max_chars]
    # Strip again after truncation (in case truncation left trailing underscore)
    result = result.strip('_')
    # Fallback for empty result
    if not result:
        result = 'untitled'
    return result
