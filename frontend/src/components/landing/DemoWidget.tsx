'use client'
import { useEffect, useRef, useState } from 'react'
import { preview } from '@/lib/api/synthesize'
import ErrorBanner from '@/components/shared/ErrorBanner'
import WaveformVisualizer from '@/components/studio/WaveformVisualizer'
import { usePlayback } from '@/store/playback'

const MAX_CHARS = 100
const DEMO_VOICE_ID = 'en-US-AriaNeural'

export default function DemoWidget() {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { setStatus, setAudioBuffer, setAnalyserNode, status } = usePlayback()
  const audioCtxRef = useRef<AudioContext | null>(null)

  const handlePreview = async () => {
    if (!text.trim() || isLoading) return
    setError(null)
    setIsLoading(true)
    setStatus('loading')

    try {
      const arrayBuf = await preview(text, {
        voiceId: DEMO_VOICE_ID,
        pitch: 1.0,
        speed: 1.0,
        volume: 0.8,
        tonePreset: 'neutral',
        naturalFlow: true,
        warmth: 0,
        clarity: 0,
        outputFormat: 'wav',
      })

      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioContext()
      }
      const audioCtx = audioCtxRef.current
      const decoded = await audioCtx.decodeAudioData(arrayBuf)

      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 2048
      analyser.connect(audioCtx.destination)
      setAnalyserNode(analyser)

      const blob = new Blob([arrayBuf], { type: 'audio/wav' })
      const url = URL.createObjectURL(blob)
      setAudioBuffer(decoded, url)

      const source = audioCtx.createBufferSource()
      source.buffer = decoded
      source.connect(analyser)
      source.start(0)
      setStatus('playing')
      source.onended = () => setStatus('idle')
    } catch (err: unknown) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Preview failed. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ background: 'rgba(255,248,245,0.92)', borderRadius: 8, padding: 20, maxWidth: 480, margin: '0 auto' }}>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          value={text}
          maxLength={MAX_CHARS}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          onKeyDown={(e) => e.key === 'Enter' && handlePreview()}
          placeholder="Type something to hear it…"
          aria-label="Demo text input"
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '1px solid #E8D5D0',
            borderRadius: 4,
            fontSize: 14,
            minHeight: 44,
          }}
        />
        <button
          onClick={handlePreview}
          disabled={!text.trim() || isLoading}
          aria-label="Play demo"
          style={{
            padding: '10px 18px',
            background: !text.trim() || isLoading ? '#E8B4B0' : '#D4726A',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: !text.trim() || isLoading ? 'not-allowed' : 'pointer',
            fontSize: 14,
            minHeight: 44,
          }}
        >
          {isLoading ? '…' : '▶ Play'}
        </button>
      </div>
      <div style={{ fontSize: 12, color: '#5A4A4A', marginBottom: 8, textAlign: 'right' }}>
        {text.length} / {MAX_CHARS}
        {text.length >= MAX_CHARS && <span style={{ color: '#D4726A', marginLeft: 4 }}>Limit reached</span>}
      </div>
      {status === 'playing' && <WaveformVisualizer />}
    </div>
  )
}
