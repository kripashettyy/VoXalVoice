/**
 * Types for the Video Voice-over Generator feature.
 */

export type VoiceoverStatus =
  | 'idle'
  | 'uploading'
  | 'generating'
  | 'done'
  | 'error'

export interface VoiceoverResult {
  /** Blob URL of the generated MP4 — revoke when done */
  blobUrl: string
  /** Duration of the source video in seconds */
  duration: number
  /** Suggested download filename */
  filename: string
  /** Size of the output file in bytes */
  sizeBytes: number
}

export interface VoiceoverRequest {
  video: File
  script: string
  voiceId: string
  pitch: number
  speed: number
  volume: number
  tonePreset: 'neutral' | 'warm' | 'crisp'
  naturalFlow: boolean
  warmth: number   // 0.0–1.0
  clarity: number  // 0.0–1.0
}
