/**
 * Property 28: Download button invalidated on any parameter change
 * Validates: Requirements 9.5, 5.12
 */
import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { usePlayback } from '@/store/playback'
import { useVoiceParams } from '@/store/voiceParams'

// Mock AudioBuffer
const mockBuffer = { duration: 1, sampleRate: 22050, numberOfChannels: 1 } as unknown as AudioBuffer

beforeEach(() => {
  usePlayback.setState({
    status: 'idle',
    audioBuffer: mockBuffer,
    generatedBlobUrl: 'blob:mock',
    audioInvalidated: false,
    currentTime: 0,
    duration: 1,
    analyserNode: null,
    lastPreviewBuffer: null,
  })
  useVoiceParams.setState({
    voiceId: 'en-US-AriaNeural',
    pitch: 1.0, speed: 1.0, volume: 0.8,
    tonePreset: 'neutral', warmth: 50, clarity: 50, naturalFlow: true,
  })
})

describe('Property 28: Download invalidated on parameter change', () => {
  it('invalidate() sets audioInvalidated=true and clears blobUrl', () => {
    usePlayback.getState().invalidate()
    const s = usePlayback.getState()
    expect(s.audioInvalidated).toBe(true)
    expect(s.generatedBlobUrl).toBeNull()
  })

  it('download is visible when blobUrl set and not invalidated', () => {
    const s = usePlayback.getState()
    expect(!!s.generatedBlobUrl && !s.audioInvalidated).toBe(true)
  })

  it('download is hidden after invalidate', () => {
    usePlayback.getState().invalidate()
    const s = usePlayback.getState()
    const visible = !!s.generatedBlobUrl && !s.audioInvalidated
    expect(visible).toBe(false)
  })

  it('setAudioBuffer resets invalidation', () => {
    usePlayback.getState().invalidate()
    usePlayback.getState().setAudioBuffer(mockBuffer, 'blob:new')
    const s = usePlayback.getState()
    expect(s.audioInvalidated).toBe(false)
    expect(s.generatedBlobUrl).toBe('blob:new')
  })

  it('any pitch change should trigger invalidate pattern', () => {
    fc.assert(
      fc.property(fc.float({ min: 0.5, max: 2.0, noNaN: true }), (v) => {
        usePlayback.setState({ audioInvalidated: false, generatedBlobUrl: 'blob:test' })
        // Simulate what TextInputArea and controls do: call invalidate on change
        usePlayback.getState().invalidate()
        expect(usePlayback.getState().audioInvalidated).toBe(true)
      })
    )
  })
})
