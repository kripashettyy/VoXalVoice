import { create } from 'zustand'

interface VoiceParamsState {
  voiceId: string
  pitch: number        // 0.5–2.0, default 1.0
  speed: number        // 0.5–2.5, default 1.0
  volume: number       // 0.0–1.0, default 0.8
  tonePreset: 'neutral' | 'warm' | 'crisp'
  warmth: number       // 0–100 (UI), maps to 0.0–1.0 internally, default 50
  clarity: number      // 0–100 (UI), maps to 0.0–1.0 internally, default 50
  naturalFlow: boolean // default true
  setParam: <K extends keyof Omit<VoiceParamsState, 'setParam' | 'resetDefaults'>>(
    key: K,
    value: VoiceParamsState[K]
  ) => void
  resetDefaults: () => void
}

const DEFAULTS = {
  voiceId: 'en-US-AriaNeural',
  pitch: 1.0,
  speed: 1.0,
  volume: 0.8,
  tonePreset: 'neutral' as const,
  warmth: 50,
  clarity: 50,
  naturalFlow: true,
}

// Clamp helpers
const RANGES: Partial<Record<string, [number, number]>> = {
  pitch: [0.5, 2.0],
  speed: [0.5, 2.5],
  volume: [0.0, 1.0],
  warmth: [0, 100],
  clarity: [0, 100],
}

function clampValue(key: string, value: unknown): unknown {
  const range = RANGES[key]
  if (range && typeof value === 'number') {
    return Math.max(range[0], Math.min(range[1], value))
  }
  return value
}

export const useVoiceParams = create<VoiceParamsState>((set) => ({
  ...DEFAULTS,
  setParam(key, value) {
    set({ [key]: clampValue(key as string, value) } as Partial<VoiceParamsState>)
  },
  resetDefaults() {
    set({ ...DEFAULTS })
  },
}))
