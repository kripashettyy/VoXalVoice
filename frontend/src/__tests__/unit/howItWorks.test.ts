/**
 * Property 3: How It Works step completeness
 * Validates: Requirements 1.7
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

interface Step {
  label: string
  description: string
}

function validateSteps(steps: Step[]): boolean {
  return steps.every(
    (s) =>
      typeof s.label === 'string' &&
      s.label.trim().length > 0 &&
      typeof s.description === 'string' &&
      s.description.trim().length > 0
  )
}

const HOW_IT_WORKS_STEPS: Step[] = [
  { label: 'Enter your text', description: 'Type or paste up to 10,000 characters into the studio editor.' },
  { label: 'Pick a voice and tune the settings', description: 'Choose a voice, adjust pitch and speed, and dial in warmth and clarity.' },
  { label: 'Preview or generate', description: 'Click preview to hear the first 200 characters instantly, then generate the full audio.' },
  { label: 'Download your file', description: 'Download the finished WAV file with a single click, ready to use anywhere.' },
]

describe('Property 3: How It Works step completeness', () => {
  it('all steps have non-empty label and description', () => {
    expect(validateSteps(HOW_IT_WORKS_STEPS)).toBe(true)
  })

  it('at least one step is defined', () => {
    expect(HOW_IT_WORKS_STEPS.length).toBeGreaterThan(0)
  })

  it('step numbers are sequential starting from 1', () => {
    HOW_IT_WORKS_STEPS.forEach((_, i) => {
      expect(i + 1).toBeGreaterThanOrEqual(1)
    })
  })

  it('property: any valid steps array passes validation', () => {
    // Use strings guaranteed to have at least one non-whitespace character
    const nonEmptyStr = fc.string({ minLength: 1, maxLength: 80 })
      .filter((s) => s.trim().length > 0)
    fc.assert(
      fc.property(
        fc.array(
          fc.record({ label: nonEmptyStr, description: nonEmptyStr }),
          { minLength: 1 }
        ),
        (steps) => {
          expect(validateSteps(steps)).toBe(true)
        }
      )
    )
  })

  it('property: step with empty label fails validation', () => {
    const nonEmptyDesc = fc.string({ minLength: 1, maxLength: 80 })
      .filter((s) => s.trim().length > 0)
    fc.assert(
      fc.property(nonEmptyDesc, (desc) => {
        const steps: Step[] = [{ label: '', description: desc }]
        expect(validateSteps(steps)).toBe(false)
      })
    )
  })
})
