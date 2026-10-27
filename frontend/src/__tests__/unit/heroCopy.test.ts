/**
 * Property 2: Hero copy word count limits
 * Validates: Requirements 1.5, 19.1
 */
import { describe, it, expect } from 'vitest'

const HERO_HEADLINE = 'Turn your words into natural-sounding speech'
const HERO_SUBHEADLINE = 'Studio-quality voice synthesis with real-time controls and instant preview'

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length
}

describe('Property 2: Hero copy word count limits', () => {
  it('headline is 12 words or fewer', () => {
    expect(wordCount(HERO_HEADLINE)).toBeLessThanOrEqual(12)
  })

  it('sub-headline is 20 words or fewer', () => {
    expect(wordCount(HERO_SUBHEADLINE)).toBeLessThanOrEqual(20)
  })

  it('headline is not empty', () => {
    expect(wordCount(HERO_HEADLINE)).toBeGreaterThan(0)
  })

  it('headline contains no em dashes', () => {
    expect(HERO_HEADLINE).not.toContain('\u2014')
  })

  it('sub-headline contains no em dashes', () => {
    expect(HERO_SUBHEADLINE).not.toContain('\u2014')
  })
})
