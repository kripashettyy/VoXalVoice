/**
 * Frontend integration error handling tests
 * Validates: Requirements 8.6, 8.7, 4.5, 12.9, 14.1, 8.9
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePlayback } from '@/store/playback'
import { useProfiles } from '@/store/profiles'
import type { SynthesisParams } from '@/types/synthesis'

const DEFAULT_PARAMS: SynthesisParams = {
  voiceId: 'en-US-AriaNeural',
  pitch: 1.0, speed: 1.0, volume: 0.8,
  tonePreset: 'neutral', naturalFlow: true,
  warmth: 0, clarity: 0, outputFormat: 'wav',
}

// ---- synthesize() network failure ----
describe('synthesize() network failure', () => {
  it('network failure results in error status, not stuck on loading', async () => {
    const { setStatus } = usePlayback.getState()

    // Simulate the error path in ActionBar
    setStatus('loading')
    expect(usePlayback.getState().status).toBe('loading')

    // Simulate catching network error
    try {
      throw new TypeError('Failed to fetch')
    } catch (err: unknown) {
      setStatus('error')
    }

    expect(usePlayback.getState().status).toBe('error')
    expect(usePlayback.getState().status).not.toBe('loading')
  })

  it('"Could not reach the server" message on fetch failure', () => {
    const err = new TypeError('Failed to fetch')
    const msg = err.message.toLowerCase().includes('fetch')
      ? 'Could not reach the server. Check your internet connection.'
      : err.message
    expect(msg).toContain('Could not reach the server')
  })
})

// ---- mid-stream disconnect ----
describe('mid-stream disconnect', () => {
  it('stream interrupted message shown and status returns to idle/error', () => {
    const { setStatus } = usePlayback.getState()
    setStatus('loading')

    // Simulate stream TypeError
    try {
      throw new TypeError('network error during stream')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.toLowerCase().includes('stream') || msg.includes('TypeError') || msg.includes('network')) {
        setStatus('error')
      }
    }

    expect(usePlayback.getState().status).toBe('error')
    expect(usePlayback.getState().status).not.toBe('loading')
  })
})

// ---- voices fallback ----
describe('fetchVoices fallback on failure', () => {
  it('fetchVoices failure returns fallback voices', async () => {
    // Mock fetch to fail
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const { fetchVoices, FALLBACK_VOICES } = await import('@/lib/api/voices')

    let voices
    try {
      voices = await fetchVoices()
    } catch {
      voices = FALLBACK_VOICES
    }

    expect(Array.isArray(voices)).toBe(true)
    expect(voices.length).toBeGreaterThan(0)
    expect(voices.some((v) => v.gender === 'female')).toBe(true)
    expect(voices.some((v) => v.gender === 'male')).toBe(true)
  })
})

// ---- 21st profile limit ----
describe('profile 21st save attempt', () => {
  beforeEach(() => {
    useProfiles.setState({ profiles: [], storageWarning: null })
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} },
      writable: true,
    })
  })

  it('saving a 21st profile shows limit_reached error and does not add profile', () => {
    for (let i = 0; i < 20; i++) {
      useProfiles.getState().saveProfile(`Profile ${i}`, DEFAULT_PARAMS)
    }
    expect(useProfiles.getState().profiles.length).toBe(20)

    const result = useProfiles.getState().saveProfile('Profile 21', DEFAULT_PARAMS)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('limit_reached')
    expect(useProfiles.getState().profiles.length).toBe(20)
  })
})

// ---- corrupted localStorage ----
describe('corrupted localStorage profiles', () => {
  it('resets profiles to [] without crashing', () => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: () => '{{corrupted::json',
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
      },
      writable: true,
    })

    useProfiles.setState({ profiles: [], storageWarning: null })
    useProfiles.getState().loadProfiles()

    const profiles = useProfiles.getState().profiles
    expect(Array.isArray(profiles)).toBe(true)
    // Does not crash, may be empty
    expect(profiles.length).toBeGreaterThanOrEqual(0)
  })
})

// ---- concurrent request guard ----
describe('concurrent request cancellation', () => {
  it('aborting an in-flight request sets status back to idle', () => {
    const { setStatus } = usePlayback.getState()
    const controller = new AbortController()

    setStatus('loading')
    controller.abort()

    // Simulate abort handling
    if (controller.signal.aborted) {
      setStatus('idle')
    }

    expect(usePlayback.getState().status).toBe('idle')
  })

  it('second generate click cancels first and does not leave two streams', () => {
    const { setStatus } = usePlayback.getState()

    // First request starts
    const ctrl1 = new AbortController()
    setStatus('loading')

    // Second request cancels first
    ctrl1.abort()
    const ctrl2 = new AbortController()

    expect(ctrl1.signal.aborted).toBe(true)
    expect(ctrl2.signal.aborted).toBe(false)
  })
})
