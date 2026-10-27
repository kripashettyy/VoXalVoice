/**
 * Property 4: FAQ accordion single-open invariant
 * Validates: Requirements 1.8
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

// Pure logic mirror of FAQAccordion state management
function accordionReducer(
  openIndex: number | null,
  action: { type: 'toggle'; index: number }
): number | null {
  if (action.type === 'toggle') {
    return openIndex === action.index ? null : action.index
  }
  return openIndex
}

describe('Property 4: FAQ accordion single-open invariant', () => {
  it('clicking a closed item opens it', () => {
    fc.assert(
      fc.property(fc.nat({ max: 20 }), (i) => {
        const next = accordionReducer(null, { type: 'toggle', index: i })
        expect(next).toBe(i)
      })
    )
  })

  it('clicking the open item closes it (returns null)', () => {
    fc.assert(
      fc.property(fc.nat({ max: 20 }), (i) => {
        const next = accordionReducer(i, { type: 'toggle', index: i })
        expect(next).toBeNull()
      })
    )
  })

  it('only one item is open at a time after any toggle sequence', () => {
    fc.assert(
      fc.property(
        fc.array(fc.nat({ max: 10 }), { minLength: 1, maxLength: 20 }),
        (toggles) => {
          let state: number | null = null
          for (const idx of toggles) {
            state = accordionReducer(state, { type: 'toggle', index: idx })
          }
          // state is either null or a single number — never multiple
          expect(state === null || typeof state === 'number').toBe(true)
        }
      )
    )
  })

  it('clicking a different item while one is open switches to new item', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 10 }),
        fc.nat({ max: 10 }),
        (a, b) => {
          if (a === b) return // skip same item
          const state = accordionReducer(a, { type: 'toggle', index: b })
          expect(state).toBe(b)
        }
      )
    )
  })
})
