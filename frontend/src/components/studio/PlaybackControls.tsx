'use client'
import { useRef, useState } from 'react'
import { usePlayback } from '@/store/playback'
import { synthesize as synthesizeApi, preview as previewApi } from '@/lib/api/synthesize'
import { useVoiceParams } from '@/store/voiceParams'
import * as audioEngine from '@/lib/audioEngine'
import ErrorBanner from '@/components/shared/ErrorBanner'
import CatGeneratingLoader from '@/components/studio/CatGeneratingLoader'
import type { SynthesisParams } from '@/types/synthesis'

// Rough estimate: ~160 bytes of WAV per character at typical TTS bitrate
const BYTES_PER_CHAR = 160

export default function PlaybackControls({ text }: { text: string }) {
  const { status, audioBuffer, currentTime, duration, setStatus, setAudioBuffer } = usePlayback()
  const params = useVoiceParams()
  const [error, setError] = useState<string | null>(null)
  const [genProgress, setGenProgress] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  const getSynthParams = (): SynthesisParams => ({
    voiceId: params.voiceId, pitch: params.pitch, speed: params.speed,
    volume: params.volume, tonePreset: params.tonePreset, naturalFlow: params.naturalFlow,
    warmth: params.warmth / 100, clarity: params.clarity / 100, outputFormat: 'wav',
  })

  const handleGenerate = async () => {
    if (!text.trim()) return
    audioEngine.stop()
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    setError(null)
    setGenProgress(1) // start immediately so cat shows right away
    setStatus('loading')

    const estimatedBytes = text.length * BYTES_PER_CHAR
    let receivedBytes = 0

    try {
      const chunks: Uint8Array[] = []
      await synthesizeApi(text, getSynthParams(), (chunk) => {
        chunks.push(chunk)
        receivedBytes += chunk.length
        // Cap visible progress at 92% — the last 8% is for decode + play start
        const pct = Math.min(92, Math.round((receivedBytes / estimatedBytes) * 100))
        setGenProgress(pct)
      })

      setGenProgress(96) // decoding phase

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
      // Small delay so user sees 100% before it transitions to playing
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
    if (!text.trim()) return
    audioEngine.stop()
    setError(null)
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
      const msg = err instanceof Error ? err.message : 'Preview failed.'
      setError(
        msg.includes('timed out') ? 'Audio generation timed out.' :
        msg.includes('fetch') ? 'Could not reach the server.' : msg
      )
    }
  }

  const handlePlay  = () => { if (audioBuffer) audioEngine.play(audioBuffer, audioEngine.getCurrentOffset()) }
  const handlePause = () => audioEngine.pause()
  const handleStop  = () => audioEngine.stop()

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value)
    if (audioBuffer) audioEngine.seekTo(audioBuffer, t)
  }

  const isGenerating = status === 'loading' && genProgress > 0
  const isLoading    = status === 'loading'
  const noText       = !text.trim()

  const btnBase: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
    minHeight: 40, border: 'none', transition: 'opacity 0.15s',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <label style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        Playback
      </label>

      {/* Cat loader — shown only while generating full audio */}
      {isGenerating && <CatGeneratingLoader progress={genProgress} />}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>

        {/* Generate — primary, reads full text */}
        <button
          onClick={handleGenerate}
          disabled={noText || isLoading}
          aria-label="Generate and play full audio"
          style={{
            ...btnBase,
            background: (noText || isLoading) ? 'rgba(212,114,106,0.5)' : '#D4726A',
            color: '#fff',
            boxShadow: (noText || isLoading) ? 'none' : '0 4px 14px rgba(212,114,106,0.3)',
            cursor: (noText || isLoading) ? 'not-allowed' : 'pointer',
          }}
        >
          ▶ Generate and play
        </button>

        {/* Preview — first 200 chars */}
        <button
          onClick={handlePreview}
          disabled={noText || isLoading}
          aria-label="Preview first 200 characters"
          style={{
            ...btnBase,
            background: 'rgba(212,114,106,0.1)', color: '#D4726A',
            border: '1.5px solid rgba(212,114,106,0.3)',
            opacity: (noText || isLoading) ? 0.5 : 1,
            cursor: (noText || isLoading) ? 'not-allowed' : 'pointer',
          }}
        >
          Preview
        </button>

        <button
          onClick={handlePlay}
          disabled={!audioBuffer || status === 'playing' || isLoading}
          aria-label="Play"
          style={{
            ...btnBase,
            background: 'rgba(212,114,106,0.12)', color: '#D4726A',
            border: '1.5px solid rgba(212,114,106,0.2)',
            opacity: (!audioBuffer || status === 'playing' || isLoading) ? 0.4 : 1,
            cursor: (!audioBuffer || status === 'playing' || isLoading) ? 'not-allowed' : 'pointer',
          }}
        >
          ▶ Play
        </button>

        <button
          onClick={handlePause}
          disabled={status !== 'playing'}
          aria-label="Pause"
          style={{
            ...btnBase,
            background: 'rgba(212,114,106,0.15)', color: '#D4726A',
            opacity: status !== 'playing' ? 0.4 : 1,
            cursor: status !== 'playing' ? 'not-allowed' : 'pointer',
          }}
        >
          ⏸ Pause
        </button>

        <button
          onClick={handleStop}
          disabled={status === 'idle' && !audioBuffer}
          aria-label="Stop"
          style={{
            ...btnBase,
            background: 'rgba(90,74,74,0.08)', color: '#5A4A4A',
            opacity: (status === 'idle' && !audioBuffer) ? 0.4 : 1,
            cursor: (status === 'idle' && !audioBuffer) ? 'not-allowed' : 'pointer',
          }}
        >
          ⏹ Stop
        </button>
      </div>

      <input
        type="range" min={0} max={duration || 0} step={0.1} value={currentTime}
        onChange={handleSeek} disabled={!audioBuffer} aria-label="Seek audio"
        aria-valuemin={0} aria-valuemax={duration || 0} aria-valuenow={currentTime}
        style={{ width: '100%', accentColor: '#D4726A', minHeight: 20, cursor: audioBuffer ? 'pointer' : 'default' }}
      />
      <div style={{
        display: 'flex', justifyContent: 'space-between', fontSize: 12,
        color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  )
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}
