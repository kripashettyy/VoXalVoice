import type { VoiceInfo } from '@/types/voice'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export const FALLBACK_VOICES: VoiceInfo[] = [
  { id: 'en-US-AriaNeural', name: 'Aria', gender: 'female', engine: 'edge-tts', locale: 'en-US' },
  { id: 'en-US-JennyNeural', name: 'Jenny', gender: 'female', engine: 'edge-tts', locale: 'en-US' },
  { id: 'en-US-GuyNeural', name: 'Guy', gender: 'male', engine: 'edge-tts', locale: 'en-US' },
  { id: 'en-US-DavisNeural', name: 'Davis', gender: 'male', engine: 'edge-tts', locale: 'en-US' },
]

/**
 * Fetch available voices from the API gateway.
 * Throws on non-200 response — callers should catch and fall back to FALLBACK_VOICES.
 */
export async function fetchVoices(): Promise<VoiceInfo[]> {
  const response = await fetch(`${API_BASE}/api/v1/voices`)
  if (!response.ok) {
    throw new Error(`Failed to fetch voices: ${response.status} ${response.statusText}`)
  }
  const data = await response.json()
  return data as VoiceInfo[]
}
