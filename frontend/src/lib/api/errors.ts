export class ApiError extends Error {
  statusCode: number
  field?: string

  constructor(message: string, statusCode: number, field?: string) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.field = field
  }
}

export async function parseApiError(response: Response): Promise<ApiError> {
  let detail = response.statusText
  try {
    const body = await response.json()
    if (body?.detail) detail = body.detail
  } catch {}

  const msg = (() => {
    switch (response.status) {
      case 400: return `Invalid request. ${detail}`
      case 404: return 'Voice not found. Refresh the page to reload the voice list.'
      case 422: return `Check your input and try again. ${detail}`
      case 429: return 'Too many requests. Wait a moment and try again.'
      case 500: return 'Something went wrong on the server. Try again in a moment.'
      case 503: return 'Speech synthesis is temporarily unavailable. Try again shortly.'
      case 504: return 'Audio generation timed out. Try shorter text.'
      default:  return `Request failed (${response.status}): ${detail}`
    }
  })()

  return new ApiError(msg, response.status)
}
