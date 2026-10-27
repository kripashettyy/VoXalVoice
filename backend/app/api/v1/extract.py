"""Document text extraction endpoint."""
import logging

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel

from app.services.document_extractor import extract_text, SUPPORTED_EXTENSIONS

logger = logging.getLogger(__name__)
router = APIRouter()

MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB
MAX_TEXT_CHARS = 50_000             # matches SynthesizeRequest.text max_length


class ExtractResponse(BaseModel):
    text: str
    truncated: bool
    char_count: int
    filename: str


@router.post("/extract-text", tags=["document"], response_model=ExtractResponse)
async def extract_text_endpoint(file: UploadFile = File(...)):
    """Extract plain text from an uploaded PDF or DOCX file.

    - Accepts `.pdf` and `.docx` only.
    - Maximum file size: 10 MB.
    - Returned text is truncated to 10,000 characters to fit the synthesis limit.
    """
    filename = file.filename or ""

    # Validate extension
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=(
                f"Unsupported file type '{ext or filename}'. "
                "Please upload a PDF (.pdf) or Word document (.docx)."
            ),
        )

    # Read & size-check
    data = await file.read()
    if len(data) > MAX_FILE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File is too large ({len(data) // (1024*1024)} MB). Maximum allowed size is 10 MB.",
        )

    if not data:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Extract
    try:
        text = extract_text(filename, data)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        logger.exception("Document extraction runtime error")
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception:
        logger.exception("Unexpected document extraction error for file: %s", filename)
        raise HTTPException(
            status_code=500,
            detail="Failed to extract text from the document. The file may be corrupted.",
        )

    truncated = len(text) > MAX_TEXT_CHARS
    return ExtractResponse(
        text=text[:MAX_TEXT_CHARS],
        truncated=truncated,
        char_count=min(len(text), MAX_TEXT_CHARS),
        filename=filename,
    )
