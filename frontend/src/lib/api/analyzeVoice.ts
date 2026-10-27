const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export interface VoiceAnalysisResult {
  voice_id: string
  voice_name: string
  gender: string
  confidence: number         // 0.0–1.0

  // Suggested synthesis params
  pitch: number              // 0.5–2.0
  speed: number              // 0.5–2.5
  volume: number             // 0.0–1.0
  warmth: number             // 0.0–1.0
  clarity: number            // 0.0–1.0
  tone_preset: string        // "neutral" | "warm" | "crisp"

  // Raw measurements for display
  measured_pitch_hz: number
  measured_energy_rms: number
  measured_speaking_rate: number
}

/**
 * Upload a voice recording blob and receive matching TTS parameters.
 * Throws an Error with a user-friendly message on failure.
 */
export async function analyzeVoice(blob: Blob, mimeType?: string): Promise<VoiceAnalysisResult> {
  const ext =
    (mimeType ?? blob.type).includes('ogg') ? 'ogg' :
    (mimeType ?? blob.type).includes('mp4') ? 'mp4' : 'webm'

  const formData = new FormData()
  formData.append('file', blob, `recording.${ext}`)

  const response = await fetch(`${API_BASE}/api/v1/analyze-voice`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const detail = await response
      .json()
      .then((d) => d.detail as string)
      .catch(() => response.statusText)
    throw new Error(detail)
  }

  return response.json() as Promise<VoiceAnalysisResult>
}
