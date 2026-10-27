/**
 * Integration tests for voice fallback behavior
 * Validates: Requirements 4.5, 4.6
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { FALLBACK_VOICES, fetchVoices } from '@/lib/api/voices'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('voice fallback when /api/v1/voices fails', () => {
  it('FALLBACK_VOICES is a non-empty array', () => {
    expect(Array.isArray(FALLBACK_VOICES)).toBe(true)
    expect(FALLBACK_VOICES.length).toBeGreaterThan(0)
  })

  it('FALLBACK_VOICES includes en-US-AriaNeural (female)', () => {
    const aria = FALLBACK_VOICES.find((v) => v.id === 'en-US-AriaNeural')
    expect(aria).toBeDefined()
    expect(aria?.gender).toBe('female')
    expect(aria?.engine).toBe('edge-tts')
  })

  it('FALLBACK_VOICES includes en-US-GuyNeural (male)', () => {
    const guy = FALLBACK_VOICES.find((v) => v.id === 'en-US-GuyNeural')
    expect(guy).toBeDefined()
    expect(guy?.gender).toBe('male')
    expect(guy?.engine).toBe('edge-tts')
  })

  it('fetchVoices throws on non-200 response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: async () => ({}),
    } as unknown as Response)

    await expect(fetchVoices()).rejects.toThrow()
  })

  it('fetchVoices throws on network failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
    await expect(fetchVoices()).rejects.toThrow('Network error')
  })

  it('caller catching fetchVoices error can use fallback', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    let voices = FALLBACK_VOICES
    try {
      voices = await fetchVoices()
    } catch {
      // Use fallback — this is the expected path
    }

    expect(voices).toBe(FALLBACK_VOICES)
    expect(voices.some((v) => v.gender === 'female')).toBe(true)
    expect(voices.some((v) => v.gender === 'male')).toBe(true)
  })

  it('all fallback voices have required fields', () => {
    FALLBACK_VOICES.forEach((v) => {
      expect(typeof v.id).toBe('string')
      expect(v.id.length).toBeGreaterThan(0)
      expect(typeof v.name).toBe('string')
      expect(v.name.length).toBeGreaterThan(0)
      expect(['male', 'female']).toContain(v.gender)
      expect(typeof v.engine).toBe('string')
    })
  })
})
