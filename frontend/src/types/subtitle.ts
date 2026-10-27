export interface SubtitleResult {
  blobUrl: string
  duration: number
  filename: string
  sizeBytes: number
  cueCount: number
}

export interface SubtitleRequest {
  subtitle: File
  voiceId: string
  pitch: number
  speed: number
  volume: number
  tonePreset: 'neutral' | 'warm' | 'crisp'
  naturalFlow: boolean
  warmth: number
  clarity: number
}
