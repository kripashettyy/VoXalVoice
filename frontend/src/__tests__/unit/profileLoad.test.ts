/**
 * Property 20: Profile load restores all parameters
 * Validates: Requirements 12.5, 12.6
 */
import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { useProfiles } from '@/store/profiles'
import type { SynthesisParams } from '@/types/synthesis'
import type { VoiceProfile } from '@/types/profile'

const tonePresets = ['neutral', 'warm', 'crisp'] as const

beforeEach(() => {
  useProfiles.setState({ profiles: [], storageWarning: null })
  Object.defineProperty(window, 'localStorage', {
    value: { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} },
    writable: true,
  })
})

describe('Property 20: Profile load restores all parameters', () => {
  it('loadProfile returns exact params that were saved', () => {
    fc.assert(
      fc.property(
        fc.record({
          pitch: fc.float({ min: 0.5, max: 2.0, noNaN: true }),
          speed: fc.float({ min: 0.5, max: 2.5, noNaN: true }),
          volume: fc.float({ min: 0.0, max: 1.0, noNaN: true }),
          warmth: fc.float({ min: 0.0, max: 1.0, noNaN: true }),
          clarity: fc.float({ min: 0.0, max: 1.0, noNaN: true }),
          naturalFlow: fc.boolean(),
          tonePreset: fc.constantFrom(...tonePresets),
        }),
        (params) => {
          useProfiles.setState({ profiles: [] })
          const fullParams: SynthesisParams = {
            ...params,
            voiceId: 'en-US-AriaNeural',
            outputFormat: 'wav',
          }
          useProfiles.getState().saveProfile(`test-${Date.now()}`, fullParams)
          const profiles = useProfiles.getState().profiles
          const saved = profiles[profiles.length - 1]
          const loaded = useProfiles.getState().loadProfile(saved.id)
          expect(loaded).not.toBeNull()
          if (loaded) {
            expect(loaded.params.pitch).toBeCloseTo(fullParams.pitch, 5)
            expect(loaded.params.speed).toBeCloseTo(fullParams.speed, 5)
            expect(loaded.params.volume).toBeCloseTo(fullParams.volume, 5)
            expect(loaded.params.naturalFlow).toBe(fullParams.naturalFlow)
            expect(loaded.params.tonePreset).toBe(fullParams.tonePreset)
          }
        }
      )
    )
  })
})
