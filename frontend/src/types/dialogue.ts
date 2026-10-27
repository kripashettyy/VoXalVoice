export interface DialogueTurnParams {
  pitch: number
  speed: number
  volume: number
  warmth: number
  clarity: number
  tonePreset: 'neutral' | 'warm' | 'crisp'
  naturalFlow: boolean
}

export interface DialogueTurn {
  id: string
  speaker: string
  text: string
  voiceId: string
  params: DialogueTurnParams
}

export interface DialogueResult {
  blobUrl: string
  duration: number
  filename: string
  sizeBytes: number
  turnCount: number
}
