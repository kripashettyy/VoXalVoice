import type { VoiceoverRequest, VoiceoverResult } from '@/types/voiceover'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

// 5 min timeout — generous for free-tier cold starts + long videos
const TIMEOUT_MS = 300_000

/**
 * Upload a video + script, receive a voice-overed MP4.
 *
 * Progress is reported via `onProgress(0–100)` based on a simulated
 * estimate (server doesn't stream progress), so the bar moves smoothly
 * rather than jumping straight from 0 → 100.
 *
 * Throws an Error with a user-friendly message on failure.
 */
export async function generateVoiceover(
  req: VoiceoverRequest,
  onProgress: (pct: number) => void,
  signal?: AbortSignal,
): Promise<VoiceoverResult> {
  const form = new FormData()
  form.append('video', req.video)
  form.append('script', req.script)
  form.append('voice_id', req.voiceId)
  form.append('pitch', String(req.pitch))
  form.append('speed', String(req.speed))
  form.append('volume', String(req.volume))
  form.append('tone_preset', req.tonePreset)
  form.append('natural_flow', String(req.naturalFlow))
  form.append('warmth', String(req.warmth))
  form.append('clarity', String(req.clarity))

  // Simulate progress (upload phase 0→30, server phase 30→90)
  onProgress(5)

  // Upload phase progress simulation
  let uploadPct = 5
  const uploadTimer = setInterval(() => {
    if (uploadPct < 28) {
      uploadPct += 3
      onProgress(uploadPct)
    } else {
      clearInterval(uploadTimer)
    }
  }, 200)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  // Forward external abort signal
  signal?.addEventListener('abort', () => controller.abort())

  let response: Response
  try {
    response = await fetch(`${API_BASE}/api/v1/generate-voiceover`, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    })
  } catch (err: unknown) {
    clearInterval(uploadTimer)
    clearTimeout(timeoutId)
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Voice-over generation was cancelled.')
    }
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
        case 415: return `Unsupported video format. ${detail}`
        case 413: return `Video is too large. Maximum is 500 MB.`
        case 422: return `Check your inputs and try again. ${detail}`
        case 404: return detail || 'Voice not found. Refresh and try again.'
        case 503: return 'Video processing is unavailable — ffmpeg may not be installed on the server.'
        case 504: return 'Voice-over generation timed out. Try a shorter video or script.'
        default:  return `Generation failed (${response.status}): ${detail}`
      }
    })()
    throw new Error(msg)
  }

  // Server processing phase: 30 → 90
  onProgress(32)
  let serverPct = 32
  const serverTimer = setInterval(() => {
    if (serverPct < 88) {
      serverPct += 2
      onProgress(serverPct)
    } else {
      clearInterval(serverTimer)
    }
  }, 400)

  let blob: Blob
  try {
    blob = await response.blob()
  } finally {
    clearInterval(serverTimer)
  }

  onProgress(95)

  const duration = parseFloat(response.headers.get('X-Video-Duration') ?? '0')
  const filename =
    response.headers
      .get('Content-Disposition')
      ?.match(/filename="?([^"]+)"?/)?.[1] ?? 'voiceover.mp4'

  const blobUrl = URL.createObjectURL(blob)
  onProgress(100)

  return {
    blobUrl,
    duration,
    filename,
    sizeBytes: blob.size,
  }
}
