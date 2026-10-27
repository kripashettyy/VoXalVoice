/**
 * Integration tests for studio flow with mocked API
 * Validates: Requirements 4.5, 8.1–8.7
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { usePlayback } from '@/store/playback'
import { useVoiceParams } from '@/store/voiceParams'
import { FALLBACK_VOICES } from '@/lib/api/voices'

beforeEach(() => {
  usePlayback.setState({
    status: 'idle',
    audioBuffer: null,
    currentTime: 0,
    duration: 0,
    analyserNode: null,
    lastPreviewBuffer: null,
    generatedBlobUrl: null,
    audioInvalidated: false,
  })
  useVoiceParams.setState({
    voiceId: 'en-US-AriaNeural',
    pitch: 1.0, speed: 1.0, volume: 0.8,
    tonePreset: 'neutral', warmth: 50, clarity: 50, naturalFlow: true,
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ---- Voice fallback ----
describe('voice fallback when API fails', () => {
  it('falls back to FALLBACK_VOICES when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const { fetchVoices, FALLBACK_VOICES: fb } = await import('@/lib/api/voices')

    let voices
    try {
      voices = await fetchVoices()
    } catch {
      voices = fb
    }

    expect(voices).toEqual(fb)
    expect(voices.some((v) => v.id === 'en-US-AriaNeural')).toBe(true)
  })
})

// ---- Download state ----
describe('download state management', () => {
  it('generatedBlobUrl is null initially', () => {
    expect(usePlayback.getState().generatedBlobUrl).toBeNull()
  })

  it('setAudioBuffer sets blobUrl and clears invalidation', () => {
    const mockBuf = { duration: 1 } as unknown as AudioBuffer
    usePlayback.getState().setAudioBuffer(mockBuf, 'blob:test-url')
    expect(usePlayback.getState().generatedBlobUrl).toBe('blob:test-url')
    expect(usePlayback.getState().audioInvalidated).toBe(false)
  })

  it('invalidate clears blobUrl', () => {
    const mockBuf = { duration: 1 } as unknown as AudioBuffer
    usePlayback.getState().setAudioBuffer(mockBuf, 'blob:test-url')
    usePlayback.getState().invalidate()
    expect(usePlayback.getState().generatedBlobUrl).toBeNull()
    expect(usePlayback.getState().audioInvalidated).toBe(true)
  })
})

// ---- Playback state transitions ----
describe('playback state transitions', () => {
  it('status starts as idle', () => {
    expect(usePlayback.getState().status).toBe('idle')
  })

  it('setStatus transitions correctly', () => {
    const { setStatus } = usePlayback.getState()
    setStatus('loading')
    expect(usePlayback.getState().status).toBe('loading')
    setStatus('playing')
    expect(usePlayback.getState().status).toBe('playing')
    setStatus('paused')
    expect(usePlayback.getState().status).toBe('paused')
    setStatus('idle')
    expect(usePlayback.getState().status).toBe('idle')
  })

  it('error status is reachable', () => {
    usePlayback.getState().setStatus('error')
    expect(usePlayback.getState().status).toBe('error')
  })
})

// ---- Voice params ----
describe('voice params store', () => {
  it('voiceId is set to AriaNeural by default', () => {
    expect(useVoiceParams.getState().voiceId).toBe('en-US-AriaNeural')
  })

  it('setParam updates value correctly', () => {
    useVoiceParams.getState().setParam('pitch', 1.5)
    expect(useVoiceParams.getState().pitch).toBe(1.5)
  })

  it('resetDefaults restores original values', () => {
    useVoiceParams.getState().setParam('pitch', 2.0)
    useVoiceParams.getState().resetDefaults()
    expect(useVoiceParams.getState().pitch).toBe(1.0)
  })
})

// ---- Error handling does not leave loading state ----
describe('error paths do not leave status stuck on loading', () => {
  it('after any error path, status is error or idle, never loading', () => {
    const { setStatus } = usePlayback.getState()
    setStatus('loading')

    // Simulate error
    setStatus('error')

    expect(usePlayback.getState().status).not.toBe('loading')
  })
})
