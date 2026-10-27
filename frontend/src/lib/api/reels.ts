import type { ReelsRequest, ReelsResult } from '@/types/reels'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
const TIMEOUT_MS = 600_000

export async function generateReelsVoiceover(
  req: ReelsRequest,
  onProgress: (pct: number) => void,
  signal?: AbortSignal,
): Promise<ReelsResult> {
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
  form.append('burn_captions', String(req.burnCaptions))
  form.append('caption_style', req.captionStyle)
  form.append('music_source', req.music.source)
  form.append('music_track_id', req.music.builtinTrackId)
  form.append('music_volume', String(req.music.musicVolume))
  form.append('ducking', String(req.music.ducking))
  form.append('fade_in', String(req.music.fadeIn))
  form.append('fade_out', String(req.music.fadeOut))

  if (req.music.source === 'upload' && req.music.uploadedFile) {
    form.append('music_file', req.music.uploadedFile)
  }

  onProgress(5)

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
  signal?.addEventListener('abort', () => controller.abort())

  let response: Response
  try {
    response = await fetch(`${API_BASE}/api/v1/reels-voiceover`, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    })
  } catch (err: unknown) {
    clearInterval(uploadTimer)
    clearTimeout(timeoutId)
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Reels generation was cancelled.')
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
        case 415: return `Unsupported file format. ${detail}`
        case 413: return detail || 'File too large.'
        case 422: return `Invalid input. ${detail}`
        case 404: return detail || 'Voice not found. Refresh and try again.'
        case 503: return 'Video processing unavailable — ffmpeg may not be installed.'
        case 504: return 'Reels generation timed out. Try a shorter video or script.'
        default:  return `Generation failed (${response.status}): ${detail}`
      }
    })()
    throw new Error(msg)
  }

  onProgress(32)
  let serverPct = 32
  const serverTimer = setInterval(() => {
    if (serverPct < 88) {
      serverPct += 2
      onProgress(serverPct)
    } else {
      clearInterval(serverTimer)
    }
  }, 500)

  let blob: Blob
  try {
    blob = await response.blob()
  } finally {
    clearInterval(serverTimer)
  }

  onProgress(95)

  const duration       = parseFloat(response.headers.get('X-Video-Duration') ?? '0')
  const captionsBurned = response.headers.get('X-Captions-Burned') === 'true'
  const musicMixed     = response.headers.get('X-Music-Mixed') === 'true'
  const filename =
    response.headers
      .get('Content-Disposition')
      ?.match(/filename="?([^"]+)"?/)?.[1] ?? 'reels.mp4'

  const blobUrl = URL.createObjectURL(blob)
  onProgress(100)

  return { blobUrl, duration, filename, sizeBytes: blob.size, captionsBurned, musicMixed }
}
