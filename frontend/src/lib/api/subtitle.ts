import type { SubtitleRequest, SubtitleResult } from '@/types/subtitle'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
const TIMEOUT_MS = 600_000 // 10 min — cues are synthesized sequentially

export async function generateSubtitleAudio(
  req: SubtitleRequest,
  onProgress: (pct: number) => void,
  signal?: AbortSignal,
): Promise<SubtitleResult> {
  const form = new FormData()
  form.append('subtitle', req.subtitle)
  form.append('voice_id', req.voiceId)
  form.append('pitch', String(req.pitch))
  form.append('speed', String(req.speed))
  form.append('volume', String(req.volume))
  form.append('tone_preset', req.tonePreset)
  form.append('natural_flow', String(req.naturalFlow))
  form.append('warmth', String(req.warmth))
  form.append('clarity', String(req.clarity))

  onProgress(5)

  let uploadPct = 5
  const uploadTimer = setInterval(() => {
    if (uploadPct < 28) { uploadPct += 3; onProgress(uploadPct) }
    else clearInterval(uploadTimer)
  }, 200)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)
  signal?.addEventListener('abort', () => controller.abort())

  let response: Response
  try {
    response = await fetch(`${API_BASE}/api/v1/subtitle-to-voice`, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    })
  } catch (err: unknown) {
    clearInterval(uploadTimer)
    clearTimeout(timeoutId)
    if (err instanceof Error && err.name === 'AbortError')
      throw new Error('Audio generation was cancelled.')
    throw new Error('Could not reach the server. Check your connection and try again.')
  } finally {
    clearTimeout(timeoutId)
    clearInterval(uploadTimer)
  }

  if (!response.ok) {
    const detail = await response
      .json()
      .then((d) => (d.detail as string) ?? response.statusText)
      .catch(() => response.statusText)

    const msg = (() => {
      switch (response.status) {
        case 415: return `Unsupported file type. Please upload an .srt or .vtt file.`
        case 413: return `File too large. Maximum size is 2 MB.`
        case 422: return `Could not parse the subtitle file. ${detail}`
        case 404: return detail || 'Voice not found. Refresh and try again.'
        case 504: return 'Audio generation timed out. Try a shorter subtitle file.'
        default:  return `Generation failed (${response.status}): ${detail}`
      }
    })()
    throw new Error(msg)
  }

  onProgress(32)
  let serverPct = 32
  const serverTimer = setInterval(() => {
    if (serverPct < 88) { serverPct += 2; onProgress(serverPct) }
    else clearInterval(serverTimer)
  }, 500)

  let blob: Blob
  try {
    blob = await response.blob()
  } finally {
    clearInterval(serverTimer)
  }

  onProgress(95)

  const duration = parseFloat(response.headers.get('X-Audio-Duration') ?? '0')
  const cueCount = parseInt(response.headers.get('X-Cue-Count') ?? '0', 10)
  const filename =
    response.headers.get('Content-Disposition')
      ?.match(/filename="?([^"]+)"?/)?.[1] ?? 'subtitle_voiced.wav'

  const blobUrl = URL.createObjectURL(blob)
  onProgress(100)

  return { blobUrl, duration, filename, sizeBytes: blob.size, cueCount }
}
