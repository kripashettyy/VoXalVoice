export type ReelsStatus = 'idle' | 'generating' | 'done' | 'error'

export type CaptionStyle = 'default' | 'bold' | 'minimal'

export type MusicSource = 'none' | 'builtin' | 'upload'

export interface BuiltinTrack {
  id: string
  label: string
  description: string
}

export interface MusicSettings {
  source: MusicSource
  builtinTrackId: string
  uploadedFile: File | null
  musicVolume: number
  ducking: boolean
  fadeIn: boolean
  fadeOut: boolean
}

export interface ReelsRequest {
  video: File
  script: string
  voiceId: string
  pitch: number
  speed: number
  volume: number
  tonePreset: 'neutral' | 'warm' | 'crisp'
  naturalFlow: boolean
  warmth: number
  clarity: number
  burnCaptions: boolean
  captionStyle: CaptionStyle
  music: MusicSettings
}

export interface ReelsResult {
  blobUrl: string
  duration: number
  filename: string
  sizeBytes: number
  captionsBurned: boolean
  musicMixed: boolean
}
