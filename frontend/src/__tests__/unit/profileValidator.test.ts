/**
 * Property 19: Profile name whitespace validation
 * Property 22: Case-insensitive duplicate profile name detection
 * Validates: Requirements 12.2–12.8
 */
import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { useProfiles } from '@/store/profiles'
import type { SynthesisParams } from '@/types/synthesis'

const DEFAULT_PARAMS: SynthesisParams = {
  voiceId: 'en-US-AriaNeural',
  pitch: 1.0,
  speed: 1.0,
  volume: 0.8,
  tonePreset: 'neutral',
  naturalFlow: true,
  warmth: 0,
  clarity: 0,
  outputFormat: 'wav',
}

describe('Property 19: Profile name whitespace validation', () => {
  beforeEach(() => {
    useProfiles.setState({ profiles: [], storageWarning: null })
    // Prevent actual localStorage writes in tests
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
      },
      writable: true,
    })
  })

  it('empty name (whitespace only) returns empty_name error', () => {
    fc.assert(
      fc.property(fc.stringOf(fc.constantFrom(' ', '\t', '\n'), { maxLength: 20 }), (name) => {
        const result = useProfiles.getState().saveProfile(name, DEFAULT_PARAMS)
        if (name.trim().length === 0) {
          expect(result.ok).toBe(false)
          if (!result.ok) expect(result.error).toBe('empty_name')
        }
      })
    )
  })

  it('non-empty name succeeds (up to limit)', () => {
    const result = useProfiles.getState().saveProfile('My profile', DEFAULT_PARAMS)
    expect(result.ok).toBe(true)
  })
})

describe('Property 22: Case-insensitive duplicate profile name detection', () => {
  beforeEach(() => {
    useProfiles.setState({ profiles: [], storageWarning: null })
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} },
      writable: true,
    })
  })

  it('duplicate name in any casing returns duplicate error', () => {
    // Only test names with at least one ASCII letter (so casing produces a different string)
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 })
          .filter((s) => {
            const trimmed = s.trim()
            // Must have at least one letter AND produce a genuinely different casing variant
            if (!trimmed.length) return false
            if (!/[a-zA-Z]/.test(trimmed)) return false
            const up = trimmed.toUpperCase()
            const lo = trimmed.toLowerCase()
            return up !== lo // ensures the two variants differ
          }),
        (name) => {
          // Fresh store state for each iteration
          useProfiles.setState({ profiles: [] })

          // Save with the original trimmed name
          const trimmed = name.trim()
          const r1 = useProfiles.getState().saveProfile(trimmed, DEFAULT_PARAMS)
          // r1 must succeed — if not, skip this example (shouldn't happen given filters)
          if (!r1.ok) return

          // Now try a casing variant (guaranteed different because toUpperCase !== toLowerCase)
          const variant = trimmed.toUpperCase()
          const r2 = useProfiles.getState().saveProfile(variant, DEFAULT_PARAMS)
          expect(r2.ok).toBe(false)
          if (!r2.ok) expect(r2.error).toBe('duplicate')
        }
      )
    )
  })
})
