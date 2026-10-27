/**
 * Property 8: Voice list default selection
 * Property 9: Voice grouping correctness
 * Validates: Requirements 4.4, 4.6
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { FALLBACK_VOICES } from '@/lib/api/voices'
import type { VoiceInfo } from '@/types/voice'

function getDefaultVoice(voices: VoiceInfo[]): VoiceInfo | undefined {
  return voices.find((v) => v.gender === 'female') ?? voices[0]
}

function groupVoices(voices: VoiceInfo[]) {
  return {
    female: voices.filter((v) => v.gender === 'female'),
    male: voices.filter((v) => v.gender === 'male'),
  }
}

describe('Property 8: Voice list default selection', () => {
  it('fallback list pre-selects first female voice', () => {
    const def = getDefaultVoice(FALLBACK_VOICES)
    expect(def).toBeDefined()
    expect(def?.gender).toBe('female')
  })

  it('property: given any non-empty voice list, a default is always selected', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1 }),
            name: fc.string({ minLength: 1 }),
            gender: fc.constantFrom('male', 'female') as fc.Arbitrary<'male' | 'female'>,
            engine: fc.constant('edge-tts'),
          }),
          { minLength: 1 }
        ),
        (voices) => {
          const def = getDefaultVoice(voices)
          expect(def).toBeDefined()
        }
      )
    )
  })
})

describe('Property 9: Voice grouping correctness', () => {
  it('all voices are in exactly one group (male or female)', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1 }),
            name: fc.string({ minLength: 1 }),
            gender: fc.constantFrom('male', 'female') as fc.Arbitrary<'male' | 'female'>,
            engine: fc.constant('edge-tts'),
          })
        ),
        (voices) => {
          const { female, male } = groupVoices(voices)
          expect(female.length + male.length).toBe(voices.length)
          female.forEach((v) => expect(v.gender).toBe('female'))
          male.forEach((v) => expect(v.gender).toBe('male'))
        }
      )
    )
  })

  it('fallback voices contain at least one male and one female', () => {
    const { female, male } = groupVoices(FALLBACK_VOICES)
    expect(female.length).toBeGreaterThan(0)
    expect(male.length).toBeGreaterThan(0)
  })
})
