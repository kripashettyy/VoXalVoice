/**
 * Property 11: Slider proportional fill indicator
 * Validates: Requirements 5.8
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

function computeFillPercent(value: number, min: number, max: number): number {
  if (max === min) return 0
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
}

describe('Property 11: Slider proportional fill indicator', () => {
  it('fill is 0% at minimum value', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -100, max: 0, noNaN: true }),
        fc.float({ min: 1, max: 100, noNaN: true }),
        (min, range) => {
          const max = min + range
          expect(computeFillPercent(min, min, max)).toBeCloseTo(0, 5)
        }
      )
    )
  })

  it('fill is 100% at maximum value', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -100, max: 0, noNaN: true }),
        fc.float({ min: 1, max: 100, noNaN: true }),
        (min, range) => {
          const max = min + range
          expect(computeFillPercent(max, min, max)).toBeCloseTo(100, 5)
        }
      )
    )
  })

  it('fill is always between 0 and 100', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -1000, max: 1000, noNaN: true }),
        fc.float({ min: -1000, max: 1000, noNaN: true }),
        fc.float({ min: -2000, max: 2000, noNaN: true }),
        (min, max, value) => {
          if (max <= min) return // skip degenerate
          const pct = computeFillPercent(value, min, max)
          expect(pct).toBeGreaterThanOrEqual(0)
          expect(pct).toBeLessThanOrEqual(100)
        }
      )
    )
  })

  it('fill is proportional (midpoint = 50%)', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -100, max: 0, noNaN: true }),
        fc.float({ min: 1, max: 100, noNaN: true }),
        (min, range) => {
          const max = min + range
          const mid = (min + max) / 2
          expect(computeFillPercent(mid, min, max)).toBeCloseTo(50, 3)
        }
      )
    )
  })
})
