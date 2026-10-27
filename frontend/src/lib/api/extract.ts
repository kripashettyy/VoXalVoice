const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export interface ExtractResult {
  text: string
  truncated: boolean
  char_count: number
  filename: string
}

/**
 * Upload a PDF or DOCX file and receive extracted plain text.
 * Throws an Error with a user-friendly message on failure.
 */
export async function extractTextFromDocument(file: File): Promise<ExtractResult> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE}/api/v1/extract-text`, {
    method: 'POST',
    body: formData,
    // Do NOT set Content-Type — browser sets it with the correct boundary
  })

  if (!response.ok) {
    const detail = await response
      .json()
      .then((d) => d.detail as string)
      .catch(() => response.statusText)
    throw new Error(detail)
  }

  return response.json() as Promise<ExtractResult>
}
