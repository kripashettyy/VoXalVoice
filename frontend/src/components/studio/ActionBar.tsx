'use client'
import { useRef, useState } from 'react'
import { usePlayback } from '@/store/playback'
import { synthesize as synthesizeApi, preview as previewApi } from '@/lib/api/synthesize'
import { useVoiceParams } from '@/store/voiceParams'
import * as audioEngine from '@/lib/audioEngine'
import ErrorBanner from '@/components/shared/ErrorBanner'
import ProgressSpinner from '@/components/shared/ProgressSpinner'
import CatGeneratingLoader from '@/components/studio/CatGeneratingLoader'
import type { SynthesisParams } from '@/types/synthesis'

const BYTES_PER_CHAR = 160

export default function ActionBar({ text }: { text: string }) {
  const { status, setStatus, setAudioBuffer } = usePlayback()
  const params = useVoiceParams()
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [genProgress, setGenProgress] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  const getSynthParams = (): SynthesisParams => ({
    voiceId: params.voiceId, pitch: params.pitch, speed: params.speed,
    volume: params.volume, tonePreset: params.tonePreset, naturalFlow: params.naturalFlow,
    warmth: params.warmth / 100, clarity: params.clarity / 100, outputFormat: 'wav',
  })

  const handleGenerate = async () => {
    if (!text.trim()) { setValidationError('Enter some text before generating.'); return }
    setValidationError(null); setError(null)
    audioEngine.stop()
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    setGenProgress(1)
    setStatus('loading')

    const estimatedBytes = text.length * BYTES_PER_CHAR
    let receivedBytes = 0

    try {
      const chunks: Uint8Array[] = []
      await synthesizeApi(text, getSynthParams(), (chunk) => {
        chunks.push(chunk)
        receivedBytes += chunk.length
        const pct = Math.min(92, Math.round((receivedBytes / estimatedBytes) * 100))
        setGenProgress(pct)
      })

      setGenProgress(96)

      const totalLength = chunks.reduce((n, c) => n + c.length, 0)
      const combined = new Uint8Array(totalLength)
      let offset = 0
      for (const chunk of chunks) { combined.set(chunk, offset); offset += chunk.length }

      const audioCtx = audioEngine.getCtx()
      let decodedBuf: AudioBuffer
      try {
        decodedBuf = await audioCtx.decodeAudioData(combined.buffer.slice(0))
      } catch {
        setStatus('error'); setError('The audio could not be decoded.'); setGenProgress(0); return
      }

      setGenProgress(100)
      const blobUrl = URL.createObjectURL(new Blob([combined], { type: 'audio/wav' }))
      setAudioBuffer(decodedBuf, blobUrl)
      await new Promise((r) => setTimeout(r, 300))
      setGenProgress(0)
      audioEngine.play(decodedBuf, 0)
    } catch (err: unknown) {
      setGenProgress(0)
      if (err instanceof Error && err.name === 'AbortError') { setStatus('idle'); return }
      setStatus('error')
      const msg = err instanceof Error ? err.message : 'Audio generation failed.'
      setError(
        msg.includes('timed out') || msg.includes('504') ? 'Timed out. Try shorter text.' :
        msg.includes('fetch') ? 'Could not reach the server.' : msg
      )
    }
  }

  const handlePreview = async () => {
    if (!text.trim()) { setValidationError('Enter some text before previewing.'); return }
    setValidationError(null); setError(null)
    audioEngine.stop()
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    setStatus('loading')

    try {
      const arrayBuf = await previewApi(text, getSynthParams())
      const audioCtx = audioEngine.getCtx()
      let decodedBuf: AudioBuffer
      try {
        decodedBuf = await audioCtx.decodeAudioData(arrayBuf)
      } catch {
        setStatus('error'); setError('The audio could not be decoded.'); return
      }
      const blobUrl = URL.createObjectURL(new Blob([arrayBuf], { type: 'audio/wav' }))
      setAudioBuffer(decodedBuf, blobUrl)
      audioEngine.play(decodedBuf, 0)
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') { setStatus('idle'); return }
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Preview failed.')
    }
  }

  const isLoading = status === 'loading'
  const isGenerating = isLoading && genProgress > 0

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: '#FFF0F5',
      borderTop: '1px solid rgba(212,114,106,0.2)',
      padding: '12px 20px',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      {validationError && (
        <p role="alert" style={{ margin: 0, fontSize: 13, color: '#D4726A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          {validationError}
        </p>
      )}

      {/* Cat loader for mobile */}
      {isGenerating && <CatGeneratingLoader progress={genProgress} />}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={handleGenerate} disabled={isLoading} aria-label="Generate and play"
          style={{
            padding: '11px 28px', borderRadius: 12,
            background: isLoading ? 'rgba(212,114,106,0.5)' : '#D4726A',
            color: '#fff', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: 14, fontWeight: 600, minHeight: 44,
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: isLoading ? 'none' : '0 4px 14px rgba(212,114,106,0.35)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            transition: 'all 0.15s',
          }}
        >
          {isLoading && !isGenerating ? <><ProgressSpinner size={16} /> Loading…</> : '▶ Generate and play'}
        </button>
        <button
          onClick={handlePreview} disabled={isLoading} aria-label="Preview voice"
          style={{
            padding: '11px 24px', borderRadius: 12,
            background: 'rgba(212,114,106,0.1)', color: '#D4726A',
            border: '1.5px solid rgba(212,114,106,0.3)',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: 14, fontWeight: 600, minHeight: 44,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            transition: 'all 0.15s',
          }}
        >
          Preview
        </button>
      </div>
    </div>
  )
}
