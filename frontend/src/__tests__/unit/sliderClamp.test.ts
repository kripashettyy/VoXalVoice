/**
 * Property 10: Slider value clamping (voiceParams store)
 * Validates: Requirements 5.1–5.3, 5.5, 5.6, 5.12
 */
import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { useVoiceParams } from '@/store/voiceParams'

describe('Property 10: Slider value clamping', () => {
  beforeEach(() => {
    useVoiceParams.setState({
      voiceId: 'en-US-AriaNeural',
      pitch: 1.0,
      speed: 1.0,
      volume: 0.8,
      tonePreset: 'neutral',
      warmth: 50,
      clarity: 50,
      naturalFlow: true,
    })
  })

  it('pitch is always clamped to [0.5, 2.0]', () => {
    fc.assert(
      fc.property(fc.float({ min: -10, max: 10 }), (v) => {
        useVoiceParams.getState().setParam('pitch', v)
        const result = useVoiceParams.getState().pitch
        expect(result).toBeGreaterThanOrEqual(0.5)
        expect(result).toBeLessThanOrEqual(2.0)
      })
    )
  })

  it('speed is always clamped to [0.5, 2.5]', () => {
    fc.assert(
      fc.property(fc.float({ min: -10, max: 10 }), (v) => {
        useVoiceParams.getState().setParam('speed', v)
        const result = useVoiceParams.getState().speed
        expect(result).toBeGreaterThanOrEqual(0.5)
        expect(result).toBeLessThanOrEqual(2.5)
      })
    )
  })

  it('volume is always clamped to [0.0, 1.0]', () => {
    fc.assert(
      fc.property(fc.float({ min: -5, max: 5 }), (v) => {
        useVoiceParams.getState().setParam('volume', v)
        const result = useVoiceParams.getState().volume
        expect(result).toBeGreaterThanOrEqual(0.0)
        expect(result).toBeLessThanOrEqual(1.0)
      })
    )
  })

  it('warmth is always clamped to [0, 100]', () => {
    fc.assert(
      fc.property(fc.integer({ min: -200, max: 200 }), (v) => {
        useVoiceParams.getState().setParam('warmth', v)
        const result = useVoiceParams.getState().warmth
        expect(result).toBeGreaterThanOrEqual(0)
        expect(result).toBeLessThanOrEqual(100)
      })
    )
  })

  it('clarity is always clamped to [0, 100]', () => {
    fc.assert(
      fc.property(fc.integer({ min: -200, max: 200 }), (v) => {
        useVoiceParams.getState().setParam('clarity', v)
        const result = useVoiceParams.getState().clarity
        expect(result).toBeGreaterThanOrEqual(0)
        expect(result).toBeLessThanOrEqual(100)
      })
    )
  })

  it('resetDefaults restores all default values', () => {
    useVoiceParams.getState().setParam('pitch', 2.0)
    useVoiceParams.getState().setParam('speed', 2.5)
    useVoiceParams.getState().setParam('warmth', 100)
    useVoiceParams.getState().resetDefaults()
    const s = useVoiceParams.getState()
    expect(s.pitch).toBe(1.0)
    expect(s.speed).toBe(1.0)
    expect(s.volume).toBe(0.8)
    expect(s.warmth).toBe(50)
    expect(s.clarity).toBe(50)
    expect(s.naturalFlow).toBe(true)
    expect(s.tonePreset).toBe('neutral')
  })
})
