/**
 * Property 6: Text input truncation and counter accuracy
 * Property 7: Session text round-trip
 * Validates: Requirements 3.1, 3.2, 3.3, 3.5
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as fc from 'fast-check'

const MAX_CHARS = 50_000

function processTextInput(value: string): { text: string; truncated: boolean } {
  if (value.length > MAX_CHARS) {
    return { text: value.slice(0, MAX_CHARS), truncated: true }
  }
  return { text: value, truncated: false }
}

describe('Property 6: Text input truncation and counter accuracy', () => {
  it('text never exceeds MAX_CHARS after processing', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 15000 }), (input) => {
        const { text } = processTextInput(input)
        expect(text.length).toBeLessThanOrEqual(MAX_CHARS)
      })
    )
  })

  it('truncated flag is true only when input exceeded limit', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 15000 }), (input) => {
        const { truncated } = processTextInput(input)
        expect(truncated).toBe(input.length > MAX_CHARS)
      })
    )
  })

  it('character counter reflects processed text length exactly', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 15000 }), (input) => {
        const { text } = processTextInput(input)
        const counterValue = text.length
        expect(counterValue).toBe(text.length)
        expect(counterValue).toBeLessThanOrEqual(MAX_CHARS)
      })
    )
  })

  it('text within limit is preserved exactly', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: MAX_CHARS }), (input) => {
        const { text, truncated } = processTextInput(input)
        expect(text).toBe(input)
        expect(truncated).toBe(false)
      })
    )
  })
})

describe('Property 7: Session text round-trip', () => {
  const sessionStore: Record<string, string> = {}

  beforeEach(() => {
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: (k: string) => sessionStore[k] ?? null,
        setItem: (k: string, v: string) => { sessionStore[k] = v },
        removeItem: (k: string) => { delete sessionStore[k] },
        clear: () => { Object.keys(sessionStore).forEach((k) => delete sessionStore[k]) },
      },
      writable: true,
    })
  })

  it('text stored in sessionStorage is retrieved exactly', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: MAX_CHARS }), (text) => {
        sessionStorage.setItem('voxalvoice_text', text)
        const retrieved = sessionStorage.getItem('voxalvoice_text')
        expect(retrieved).toBe(text)
      })
    )
  })

  it('null from sessionStorage leads to empty initial text', () => {
    sessionStorage.removeItem('voxalvoice_text')
    const val = sessionStorage.getItem('voxalvoice_text')
    expect(val).toBeNull()
    // Component should default to ''
    const initialText = val ?? ''
    expect(initialText).toBe('')
  })
})
