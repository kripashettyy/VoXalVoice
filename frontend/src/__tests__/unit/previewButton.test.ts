/**
 * Property 12: Preview button enabled state
 * Validates: Requirements 6.1
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

function isPreviewEnabled(text: string, status: string): boolean {
  return text.trim().length > 0 && status !== 'loading'
}

describe('Property 12: Preview button enabled state', () => {
  it('disabled when text is empty or whitespace-only', () => {
    fc.assert(
      fc.property(
        fc.stringOf(fc.constantFrom(' ', '\t', '\n'), { maxLength: 20 }),
        fc.constantFrom('idle', 'playing', 'paused', 'error'),
        (text, status) => {
          expect(isPreviewEnabled(text, status)).toBe(false)
        }
      )
    )
  })

  it('disabled when status is loading regardless of text', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (text) => {
        expect(isPreviewEnabled(text, 'loading')).toBe(false)
      })
    )
  })

  it('enabled when text is non-empty and status is not loading', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        fc.constantFrom('idle', 'playing', 'paused', 'error'),
        (text, status) => {
          expect(isPreviewEnabled(text, status)).toBe(true)
        }
      )
    )
  })
})
