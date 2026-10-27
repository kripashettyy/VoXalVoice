/**
 * Property 21: Profile count limit (max 20)
 * Validates: Requirements 12.3, 12.4
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useProfiles } from '@/store/profiles'
import type { SynthesisParams } from '@/types/synthesis'

const DEFAULT_PARAMS: SynthesisParams = {
  voiceId: 'en-US-AriaNeural',
  pitch: 1.0, speed: 1.0, volume: 0.8,
  tonePreset: 'neutral', naturalFlow: true,
  warmth: 0, clarity: 0, outputFormat: 'wav',
}

beforeEach(() => {
  useProfiles.setState({ profiles: [], storageWarning: null })
  Object.defineProperty(window, 'localStorage', {
    value: { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} },
    writable: true,
  })
})

describe('Property 21: Profile count limit', () => {
  it('allows saving up to 20 profiles', () => {
    for (let i = 0; i < 20; i++) {
      const r = useProfiles.getState().saveProfile(`Profile ${i}`, DEFAULT_PARAMS)
      expect(r.ok).toBe(true)
    }
    expect(useProfiles.getState().profiles.length).toBe(20)
  })

  it('returns limit_reached on 21st save', () => {
    for (let i = 0; i < 20; i++) {
      useProfiles.getState().saveProfile(`Profile ${i}`, DEFAULT_PARAMS)
    }
    const result = useProfiles.getState().saveProfile('Profile 21', DEFAULT_PARAMS)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('limit_reached')
  })

  it('does not write to localStorage on 21st save attempt', () => {
    const setItemCalls: string[] = []
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: () => null,
        setItem: (k: string) => { setItemCalls.push(k) },
        removeItem: () => {},
        clear: () => {},
      },
      writable: true,
    })
    useProfiles.setState({ profiles: [] })
    for (let i = 0; i < 20; i++) {
      useProfiles.getState().saveProfile(`Profile ${i}`, DEFAULT_PARAMS)
    }
    const countBefore = setItemCalls.length
    useProfiles.getState().saveProfile('Profile 21', DEFAULT_PARAMS)
    // No additional write should have happened
    expect(setItemCalls.length).toBe(countBefore)
  })
})
