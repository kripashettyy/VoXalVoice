import type { BatchResult } from '@/types/batch'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
const TIMEOUT_MS = 600_000

interface BatchRequest {
  file: File
  voiceId: string
  pitch: number
  speed: number
  volume: number
  tonePreset: 'neutral' | 'warm' | 'crisp'
  naturalFlow: boolean
  warmth: number
  clarity: number
}

export async function generateBatch(
  req: BatchRequest,
  onProgress: (pct: number) => void,
  signal?: AbortSignal,
): Promise<BatchResult> {
  const form = new FormData()
  form.append('file', req.file)
  form.append('voice_id', req.voiceId)
  form.append('pitch', String(req.pitch))
  form.append('speed', String(req.speed))
  form.append('volume', String(req.volume))
  form.append('tone_preset', req.tonePreset)
  form.append('natural_flow', String(req.naturalFlow))
  form.append('warmth', String(req.warmth))
  form.append('clarity', String(req.clarity))

  onProgress(5)
  let pct = 5
  const uploadTimer = setInterval(() => {
    if (pct < 28) { pct += 3; onProgress(pct) }
    else clearInterval(uploadTimer)
  }, 200)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)
  signal?.addEventListener('abort', () => controller.abort())

  let response: Response
  try {
    response = await fetch(`${API_BASE}/api/v1/batch-synthesize`, {
      method: 'POST', body: form, signal: controller.signal,
    })
  } catch (err: unknown) {
    clearInterval(uploadTimer)
    clearTimeout(timeoutId)
    if (err instanceof Error && err.name === 'AbortError')
      throw new Error('Batch generation was cancelled.')
    throw new Error('Could not reach the server. Check your connection and try again.')
  } finally {
    clearTimeout(timeoutId)
    clearInterval(uploadTimer)
  }

  if (!response.ok) {
    const detail = await response.json().then((d) => (d.detail as string) ?? response.statusText).catch(() => response.statusText)
    const msg = (() => {
      switch (response.status) {
        case 415: return 'Unsupported file type. Upload a .txt or .csv file.'
        case 413: return 'File too large. Maximum is 1 MB.'
        case 422: return `Invalid file. ${detail}`
        case 404: return detail || 'Voice not found. Refresh and try again.'
        case 504: return 'Batch timed out. Try fewer entries.'
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
  }, 600)

  let blob: Blob
  try { blob = await response.blob() }
  finally { clearInterval(serverTimer) }

  onProgress(95)

  const entryCount = parseInt(response.headers.get('X-Entry-Count') ?? '0', 10)
  const successCount = parseInt(response.headers.get('X-Success-Count') ?? '0', 10)
  const filename = response.headers.get('Content-Disposition')?.match(/filename="?([^"]+)"?/)?.[1] ?? 'batch_voices.zip'
  const blobUrl = URL.createObjectURL(blob)
  onProgress(100)

  return { blobUrl, filename, sizeBytes: blob.size, entryCount, successCount }
}
