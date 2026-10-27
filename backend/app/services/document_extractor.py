"""Document text extraction service.

Supports PDF (via pypdf) and DOCX (via python-docx).
Returns extracted plain text suitable for TTS synthesis.
"""
import io
import logging
import re

logger = logging.getLogger(__name__)

SUPPORTED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

SUPPORTED_EXTENSIONS = {".pdf", ".docx"}


def _fix_merged_words(text: str) -> str:
    """Insert a space wherever a lowercase letter is immediately followed by
    an uppercase letter with no space — a common artefact of PDF line merging.
    e.g. 'OrchestrationNaren' → 'Orchestration Naren'
    """
    return re.sub(r'([a-z])([A-Z])', r'\1 \2', text)


def _clean_for_tts(text: str) -> str:
    """Clean extracted text so it reads naturally when spoken.

    Steps:
    1. Normalise line endings.
    2. Fix words smashed together by PDF extraction (camelCase seams).
    3. Join hyphenated line-break words  ('develop-\\nment' → 'development').
    4. Replace single newlines (soft wraps) with a space.
    5. Replace double+ newlines (paragraph breaks) with '. ' so TTS pauses.
    6. Collapse multiple spaces.
    7. Strip common non-speakable artifacts (em-dashes used as bullets, etc.).
    """
    # Normalise line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Fix camelCase seams from PDF merging
    text = _fix_merged_words(text)

    # Re-join hyphenated line breaks: "develop-\nment" → "development"
    text = re.sub(r'-\n(\S)', r'\1', text)

    # Paragraph breaks → sentence pause for TTS
    text = re.sub(r'\n{2,}', '. ', text)

    # Soft line wraps → single space
    text = text.replace('\n', ' ')

    # Collapse multiple spaces
    text = re.sub(r' {2,}', ' ', text)

    # Remove double-periods created by the above (e.g. "end.. Next")
    text = re.sub(r'\.{2,}', '.', text)

    # Strip lone em-dashes / en-dashes at word boundaries
    text = re.sub(r'\s[—–]\s', ', ', text)

    return text.strip()


def extract_pdf(data: bytes) -> str:
    """Extract text from a PDF byte payload using pypdf."""
    try:
        from pypdf import PdfReader  # type: ignore
    except ImportError as exc:
        raise RuntimeError("pypdf is not installed. Run: pip install pypdf") from exc

    reader = PdfReader(io.BytesIO(data))
    parts: list[str] = []

    for page in reader.pages:
        # layout mode preserves word spacing better than the default
        try:
            page_text = page.extract_text(extraction_mode="layout") or ""
        except Exception:
            page_text = page.extract_text() or ""

        if page_text.strip():
            parts.append(page_text)

    if not parts:
        raise ValueError(
            "No readable text found in the PDF. "
            "The file may be scanned (image-only) or encrypted."
        )

    raw = "\n\n".join(parts)
    return _clean_for_tts(raw)


def extract_docx(data: bytes) -> str:
    """Extract text from a DOCX byte payload using python-docx."""
    try:
        import docx  # type: ignore
    except ImportError as exc:
        raise RuntimeError(
            "python-docx is not installed. Run: pip install python-docx"
        ) from exc

    doc = docx.Document(io.BytesIO(data))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    if not paragraphs:
        raise ValueError("No readable text found in the DOCX file.")

    raw = "\n\n".join(paragraphs)
    return _clean_for_tts(raw)


def extract_text(filename: str, data: bytes) -> str:
    """Dispatch to the correct extractor based on file extension.

    Args:
        filename: Original upload filename (used to detect type).
        data:     Raw file bytes.

    Returns:
        Extracted plain text string, cleaned for TTS.

    Raises:
        ValueError: Unsupported file type or no text found.
        RuntimeError: Extraction library missing.
    """
    lower = filename.lower()
    if lower.endswith(".pdf"):
        return extract_pdf(data)
    if lower.endswith(".docx"):
        return extract_docx(data)
    raise ValueError(
        f"Unsupported file type: '{filename}'. "
        "Please upload a PDF (.pdf) or Word document (.docx)."
    )
