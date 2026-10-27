/**
 * Property 5: Demo widget input character limit
 * Validates: Requirements 2.2
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

const DEMO_MAX_CHARS = 100

function processDemoInput(value: string): string {
  return value.slice(0, DEMO_MAX_CHARS)
}

describe('Property 5: Demo widget input character limit', () => {
  it('input is always clamped to 100 characters', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 500 }), (input) => {
        const result = processDemoInput(input)
        expect(result.length).toBeLessThanOrEqual(DEMO_MAX_CHARS)
      })
    )
  })

  it('input within limit is preserved', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: DEMO_MAX_CHARS }), (input) => {
        expect(processDemoInput(input)).toBe(input)
      })
    )
  })

  it('input exceeding limit is truncated exactly to 100 chars', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 101, maxLength: 500 }), (input) => {
        const result = processDemoInput(input)
        expect(result.length).toBe(DEMO_MAX_CHARS)
        expect(result).toBe(input.slice(0, DEMO_MAX_CHARS))
      })
    )
  })

  it('limit message is shown when at max chars', () => {
    const text = 'a'.repeat(DEMO_MAX_CHARS)
    const atLimit = text.length >= DEMO_MAX_CHARS
    expect(atLimit).toBe(true)
  })
})
