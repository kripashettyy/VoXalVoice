import type { SynthesisParams } from '@/types/synthesis'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
const TIMEOUT_MS = 300_000  // 5 minutes — sufficient for up to 50k chars

function paramsToBody(text: string, params: SynthesisParams) {
  return {
    text,
    voice_id: params.voiceId,
    pitch: params.pitch,
    speed: params.speed,
    volume: params.volume,
    tone_preset: params.tonePreset,
    natural_flow: params.naturalFlow,
    warmth: params.warmth,
    clarity: params.clarity,
    output_format: params.outputFormat,
  }
}

/**
 * Stream synthesized audio chunk by chunk.
 * Calls onChunk for each Uint8Array chunk received.
 * Aborts after TIMEOUT_MS.
 */
export async function synthesize(
  text: string,
  params: SynthesisParams,
  onChunk: (chunk: Uint8Array) => void
): Promise<void> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(`${API_BASE}/api/v1/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paramsToBody(text, params)),
      signal: controller.signal,
    })

    if (!response.ok) {
      const detail = await response.json().then((d) => d.detail).catch(() => response.statusText)
      throw new Error(`Synthesis failed (${response.status}): ${detail}`)
    }

    if (!response.body) {
      throw new Error('Response body is empty')
    }

    const reader = response.body.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) onChunk(value)
    }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Generate a preview (first 200 chars). Returns full ArrayBuffer.
 * Aborts after TIMEOUT_MS.
 */
export async function preview(
  text: string,
  params: SynthesisParams
): Promise<ArrayBuffer> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(`${API_BASE}/api/v1/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paramsToBody(text, params)),
      signal: controller.signal,
    })

    if (!response.ok) {
      const detail = await response.json().then((d) => d.detail).catch(() => response.statusText)
      throw new Error(`Preview failed (${response.status}): ${detail}`)
    }

    return await response.arrayBuffer()
  } finally {
    clearTimeout(timer)
  }
}
