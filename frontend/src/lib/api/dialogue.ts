import type { DialogueTurn, DialogueResult } from '@/types/dialogue'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
const TIMEOUT_MS = 600_000

export async function generateDialogue(
  turns: DialogueTurn[],
  pauseMs: number,
  onProgress: (pct: number) => void,
  signal?: AbortSignal,
): Promise<DialogueResult> {
  const turnsPayload = turns.map((t) => ({
    speaker: t.speaker,
    text: t.text,
    voice_id: t.voiceId,
    pitch: t.params.pitch,
    speed: t.params.speed,
    volume: t.params.volume,
    tone_preset: t.params.tonePreset,
    natural_flow: t.params.naturalFlow,
    warmth: t.params.warmth,
    clarity: t.params.clarity,
  }))

  const form = new FormData()
  form.append('turns', JSON.stringify(turnsPayload))
  form.append('pause_ms', String(pauseMs))

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
    response = await fetch(`${API_BASE}/api/v1/generate-dialogue`, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    })
  } catch (err: unknown) {
    clearInterval(uploadTimer)
    clearTimeout(timeoutId)
    if (err instanceof Error && err.name === 'AbortError')
      throw new Error('Dialogue generation was cancelled.')
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
        case 413: return `Script too long. ${detail}`
        case 422: return `Invalid script. ${detail}`
        case 404: return detail || 'A voice was not found. Refresh and try again.'
        case 504: return 'Generation timed out. Try a shorter script.'
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
  const turnCount = parseInt(response.headers.get('X-Turn-Count') ?? '0', 10)
  const blobUrl = URL.createObjectURL(blob)
  onProgress(100)

  return { blobUrl, duration, filename: 'dialogue.wav', sizeBytes: blob.size, turnCount }
}
