import { create } from 'zustand'

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

interface PlaybackState {
  status: PlaybackStatus
  audioBuffer: AudioBuffer | null
  currentTime: number
  duration: number
  analyserNode: AnalyserNode | null
  lastPreviewBuffer: AudioBuffer | null
  generatedBlobUrl: string | null
  audioInvalidated: boolean
  setStatus: (status: PlaybackStatus) => void
  setAudioBuffer: (buf: AudioBuffer, blobUrl: string) => void
  setAnalyserNode: (node: AnalyserNode | null) => void
  seekTo: (time: number) => void
  invalidate: () => void
}

export const usePlayback = create<PlaybackState>((set) => ({
  status: 'idle',
  audioBuffer: null,
  currentTime: 0,
  duration: 0,
  analyserNode: null,
  lastPreviewBuffer: null,
  generatedBlobUrl: null,
  audioInvalidated: false,
  setStatus: (status) => set({ status }),
  setAudioBuffer: (buf, blobUrl) =>
    set({
      audioBuffer: buf,
      duration: buf.duration,
      generatedBlobUrl: blobUrl,
      audioInvalidated: false,
      currentTime: 0,
    }),
  setAnalyserNode: (node) => set({ analyserNode: node }),
  seekTo: (time) => set({ currentTime: time }),
  invalidate: () => set({ audioInvalidated: true, generatedBlobUrl: null }),
}))
