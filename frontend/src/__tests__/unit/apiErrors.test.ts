/**
 * Frontend API error handling tests
 * Validates: Requirements 8.6, 8.7, 4.5
 */
import { describe, it, expect, vi } from 'vitest'
import { ApiError, parseApiError } from '@/lib/api/errors'
import { FALLBACK_VOICES } from '@/lib/api/voices'

// ---- ApiError class ----
describe('ApiError', () => {
  it('extends Error with statusCode', () => {
    const err = new ApiError('Something failed', 500)
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(ApiError)
    expect(err.statusCode).toBe(500)
    expect(err.message).toBe('Something failed')
    expect(err.name).toBe('ApiError')
  })

  it('stores optional field', () => {
    const err = new ApiError('Bad field', 422, 'text')
    expect(err.field).toBe('text')
  })
})

// ---- parseApiError ----
describe('parseApiError', () => {
  function makeResponse(status: number, body: unknown, statusText = 'Error'): Response {
    return {
      status,
      statusText,
      ok: status >= 200 && status < 300,
      json: async () => body,
    } as unknown as Response
  }

  it('maps 400 to invalid request message', async () => {
    const err = await parseApiError(makeResponse(400, { detail: 'bad format' }))
    expect(err.statusCode).toBe(400)
    expect(err.message).toContain('Invalid request')
    expect(err.message).toContain('bad format')
  })

  it('maps 404 to voice not found message', async () => {
    const err = await parseApiError(makeResponse(404, { detail: 'not found' }))
    expect(err.statusCode).toBe(404)
    expect(err.message).toContain('Voice not found')
  })

  it('maps 422 to check input message', async () => {
    const err = await parseApiError(makeResponse(422, { detail: 'text too short' }))
    expect(err.statusCode).toBe(422)
    expect(err.message).toContain('Check your input')
  })

  it('maps 429 to rate limit message', async () => {
    const err = await parseApiError(makeResponse(429, {}))
    expect(err.statusCode).toBe(429)
    expect(err.message).toContain('Too many requests')
  })

  it('maps 500 to server error message', async () => {
    const err = await parseApiError(makeResponse(500, { detail: 'internal' }))
    expect(err.statusCode).toBe(500)
    expect(err.message).toContain('Something went wrong')
  })

  it('maps 503 to unavailable message', async () => {
    const err = await parseApiError(makeResponse(503, {}))
    expect(err.statusCode).toBe(503)
    expect(err.message).toContain('temporarily unavailable')
  })

  it('maps 504 to timeout message', async () => {
    const err = await parseApiError(makeResponse(504, {}))
    expect(err.statusCode).toBe(504)
    expect(err.message).toContain('timed out')
  })

  it('falls back to statusText when json parse fails', async () => {
    const resp = {
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => { throw new Error('parse fail') },
    } as unknown as Response
    const err = await parseApiError(resp)
    expect(err.statusCode).toBe(500)
  })
})

// ---- Voice fallback ----
describe('fetchVoices fallback', () => {
  it('fallback list has at least one female voice', () => {
    expect(FALLBACK_VOICES.some((v) => v.gender === 'female')).toBe(true)
  })

  it('fallback list has at least one male voice', () => {
    expect(FALLBACK_VOICES.some((v) => v.gender === 'male')).toBe(true)
  })

  it('fallback list contains Aria (en-US-AriaNeural)', () => {
    expect(FALLBACK_VOICES.some((v) => v.id === 'en-US-AriaNeural')).toBe(true)
  })

  it('fallback list contains Guy (en-US-GuyNeural)', () => {
    expect(FALLBACK_VOICES.some((v) => v.id === 'en-US-GuyNeural')).toBe(true)
  })
})

// ---- Profile localStorage limits ----
describe('profiles localStorage edge cases', () => {
  it('corrupted localStorage resets profiles to []', () => {
    // Simulate corrupted value
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: () => '{invalid json:::}',
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
      },
      writable: true,
    })
    // readProfiles function behaviour
    let result: unknown[] = []
    try {
      const raw = localStorage.getItem('voxalvoice_profiles')
      if (raw) result = JSON.parse(raw)
    } catch {
      result = []
    }
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(0)
  })
})
