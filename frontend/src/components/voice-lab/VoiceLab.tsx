'use client'
import { useRef, useState } from 'react'
import { analyzeVoice, type VoiceAnalysisResult } from '@/lib/api/analyzeVoice'
import { useProfiles } from '@/store/profiles'
import SliderControl from '@/components/studio/SliderControl'
import ErrorBanner from '@/components/shared/ErrorBanner'
import type { SynthesisParams } from '@/types/synthesis'
import type { TonePreset } from '@/types/synthesis'

type Phase = 'idle' | 'recording' | 'analysing' | 'result'

interface MatchedParams {
  voiceId: string
  voiceName: string
  gender: string
  confidence: number
  pitch: number
  speed: number
  volume: number
  warmth: number    // 0–100 for UI sliders
  clarity: number   // 0–100 for UI sliders
  tonePreset: TonePreset
  measuredPitchHz: number
  measuredEnergy: number
  measuredRate: number
}

const TONE_PRESETS: TonePreset[] = ['neutral', 'warm', 'crisp']

export default function VoiceLab() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [params, setParams] = useState<MatchedParams | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [recordSecs, setRecordSecs] = useState(0)
  const [profileName, setProfileName] = useState('')
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  const mediaRef    = useRef<MediaRecorder | null>(null)
  const chunksRef   = useRef<Blob[]>([])
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null)

  const { saveProfile, confirmOverwrite, profiles } = useProfiles()

  // ── Recording ───

  const startRecording = async () => {
    setError(null)
    setSaveMsg(null)
    chunksRef.current = []

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setError('Microphone access was denied. Please allow microphone access and try again.')
      return
    }

    const mimeType =
      MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' :
      MediaRecorder.isTypeSupported('audio/webm')             ? 'audio/webm' :
      MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')  ? 'audio/ogg;codecs=opus' :
      ''  // let browser choose

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    recorder.onstop = () => { stream.getTracks().forEach((t) => t.stop()) }

    mediaRef.current = recorder
    recorder.start(250)   // collect chunks every 250ms
    setPhase('recording')
    setRecordSecs(0)

    timerRef.current = setInterval(() => {
      setRecordSecs((s) => s + 1)
    }, 1000)
  }

  const stopRecording = async () => {
    if (!mediaRef.current) return
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }

    mediaRef.current.stop()
    setPhase('analysing')

    // Wait a tick for the final ondataavailable to fire
    await new Promise((r) => setTimeout(r, 150))

    const blob = new Blob(chunksRef.current, { type: mediaRef.current?.mimeType || 'audio/webm' })
    const blobType = blob.type  // preserve for filename extension hint
    if (blob.size < 2000) {
      setError('Recording was too short. Please record at least 2 seconds of speech.')
      setPhase('idle')
      return
    }

    try {
      const result: VoiceAnalysisResult = await analyzeVoice(blob, blobType)
      setParams({
        voiceId:       result.voice_id,
        voiceName:     result.voice_name,
        gender:        result.gender,
        confidence:    result.confidence,
        pitch:         result.pitch,
        speed:         result.speed,
        volume:        result.volume,
        warmth:        Math.round(result.warmth * 100),
        clarity:       Math.round(result.clarity * 100),
        tonePreset:    result.tone_preset as TonePreset,
        measuredPitchHz: result.measured_pitch_hz,
        measuredEnergy:  result.measured_energy_rms,
        measuredRate:    result.measured_speaking_rate,
      })
      setPhase('result')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.')
      setPhase('idle')
    }
  }

  const handleSave = () => {
    if (!params) return
    const name = profileName.trim() || `${params.voiceName} Clone`

    const snapshot: SynthesisParams = {
      voiceId:     params.voiceId,
      pitch:       params.pitch,
      speed:       params.speed,
      volume:      params.volume,
      tonePreset:  params.tonePreset,
      naturalFlow: true,
      warmth:      params.warmth / 100,
      clarity:     params.clarity / 100,
      outputFormat: 'wav',
    }

    const existing = profiles.find((p) => p.name.toLowerCase() === name.toLowerCase())
    const result = existing
      ? confirmOverwrite(name, snapshot)
      : saveProfile(name, snapshot)

    if (result.ok) {
      setSaveMsg(`Saved as "${name}". Find it in Voice Profiles in the Studio.`)
      setProfileName('')
    } else {
      setSaveMsg('Could not save. Try a different name.')
    }
  }

  const setP = <K extends keyof MatchedParams>(key: K, val: MatchedParams[K]) =>
    setParams((p) => p ? { ...p, [key]: val } : p)

  // ── Render ───────

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px' }}>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Page heading */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{
          fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700,
          color: '#1A1A1A', margin: '0 0 10px', lineHeight: 1.15,
          letterSpacing: '-0.02em', fontFamily: 'Georgia, "Times New Roman", serif',
        }}>
          Voice Lab
        </h1>
        <p style={{
          fontSize: 15, color: '#5A4A4A', margin: 0, lineHeight: 1.6,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          maxWidth: 560,
        }}>
          Record a few seconds of your voice. We'll analyse your pitch, pace, and tone,
          then match you to the closest neural voice with suggested parameters you can
          fine-tune and save as a profile.
        </p>
      </div>

      {/* ── Step 1: Record ── */}
      <section style={card} aria-label="Step 1: Record your voice">
        <StepLabel n={1} label="Record your voice" />

        <p style={hint}>
          Speak naturally for 5 to 15 seconds. Read anything: a sentence from a book,
          or just describe your day.
        </p>

        {phase === 'idle' || phase === 'result' ? (
          <button
            onClick={startRecording}
            style={{
              ...btnPrimary,
              display: 'inline-flex', alignItems: 'center', gap: 10,
            }}
            aria-label="Start recording"
          >
            <MicIcon /> {phase === 'result' ? 'Re-record' : 'Start recording'}
          </button>
        ) : phase === 'recording' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                width: 10, height: 10, borderRadius: '50%',
                background: '#D4726A',
                animation: 'vl-pulse 1s ease-in-out infinite',
                display: 'inline-block',
              }} aria-hidden="true" />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#D4726A', fontFamily: 'sans-serif' }}>
                Recording… {recordSecs}s
              </span>
            </div>
            <button
              onClick={stopRecording}
              style={{ ...btnSecondary, display: 'inline-flex', alignItems: 'center', gap: 8 }}
              aria-label="Stop recording"
            >
              <StopIcon /> Stop &amp; analyse
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Spinner />
            <span style={{ fontSize: 14, color: '#5A4A4A', fontFamily: 'sans-serif' }}>
              Analysing your voice…
            </span>
          </div>
        )}
      </section>

      {/* ── Step 2: Results + Tuning ── */}
      {params && phase === 'result' && (
        <>
          {/* Match card */}
          <section style={{ ...card, marginTop: 20 }} aria-label="Voice match result">
            <StepLabel n={2} label="Your voice match" />

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
              {/* Match info */}
              <div style={{ flex: '1 1 200px' }}>
                <p style={{ margin: '0 0 4px', fontSize: 13, color: '#9A8A8A', fontFamily: 'sans-serif' }}>Matched voice</p>
                <p style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 700, color: '#1A1A1A', fontFamily: 'Georgia, serif' }}>
                  {params.voiceName}
                  <span style={{ fontSize: 13, fontWeight: 400, color: '#9A8A8A', marginLeft: 8, fontFamily: 'sans-serif' }}>
                    {params.gender}
                  </span>
                </p>

                {/* Confidence bar */}
                <p style={{ margin: '0 0 6px', fontSize: 12, color: '#9A8A8A', fontFamily: 'sans-serif' }}>
                  Match confidence
                </p>
                <div style={{ height: 8, background: 'rgba(212,114,106,0.15)', borderRadius: 4, width: '100%', maxWidth: 260 }}>
                  <div style={{
                    height: '100%', borderRadius: 4,
                    width: `${Math.round(params.confidence * 100)}%`,
                    background: 'linear-gradient(90deg, #D4726A, #e8a09a)',
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#D4726A', fontWeight: 600, fontFamily: 'sans-serif' }}>
                  {Math.round(params.confidence * 100)}% confidence
                </p>
              </div>

              {/* Measurements */}
              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ margin: '0 0 8px', fontSize: 13, color: '#9A8A8A', fontFamily: 'sans-serif' }}>Your voice measurements</p>
                <Stat label="Pitch" value={`${params.measuredPitchHz} Hz`} />
                <Stat label="Energy" value={`${Math.round(params.measuredEnergy * 100)}%`} />
                <Stat label="Speaking rate" value={`${Math.round(params.measuredRate)}% voiced`} />
              </div>
            </div>
          </section>

          {/* Fine-tune */}
          <section style={{ ...card, marginTop: 20 }} aria-label="Fine-tune voice parameters">
            <StepLabel n={3} label="Fine-tune parameters" />
            <p style={hint}>Adjust these to better match your voice or style preference.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }} className="vl-grid">
              <SliderControl
                label="Pitch"
                min={0.5} max={2.0} step={0.05}
                value={params.pitch}
                onChange={(v) => setP('pitch', v)}
                formatValue={(v) => `${v.toFixed(2)}×`}
              />
              <SliderControl
                label="Speed"
                min={0.5} max={2.5} step={0.05}
                value={params.speed}
                onChange={(v) => setP('speed', v)}
                formatValue={(v) => `${v.toFixed(2)}×`}
              />
              <SliderControl
                label="Volume"
                min={0} max={1} step={0.05}
                value={params.volume}
                onChange={(v) => setP('volume', v)}
                formatValue={(v) => `${Math.round(v * 100)}%`}
              />
              <SliderControl
                label="Warmth"
                min={0} max={100} step={1}
                value={params.warmth}
                onChange={(v) => setP('warmth', v)}
                formatValue={(v) => `${v}`}
              />
              <SliderControl
                label="Clarity"
                min={0} max={100} step={1}
                value={params.clarity}
                onChange={(v) => setP('clarity', v)}
                formatValue={(v) => `${v}`}
              />
            </div>

            {/* Tone preset */}
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: 13, color: '#5A4A4A', fontWeight: 500, margin: '0 0 10px', fontFamily: 'sans-serif' }}>
                Tone preset
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {TONE_PRESETS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setP('tonePreset', t)}
                    aria-pressed={params.tonePreset === t}
                    style={{
                      padding: '7px 18px', borderRadius: 9999,
                      border: '1.5px solid',
                      borderColor: params.tonePreset === t ? '#D4726A' : 'rgba(212,114,106,0.25)',
                      background: params.tonePreset === t ? '#D4726A' : 'transparent',
                      color: params.tonePreset === t ? '#fff' : '#D4726A',
                      cursor: 'pointer', fontSize: 13, fontWeight: 600,
                      fontFamily: 'sans-serif', transition: 'all 0.15s',
                      textTransform: 'capitalize',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Save */}
          <section style={{ ...card, marginTop: 20 }} aria-label="Save as voice profile">
            <StepLabel n={4} label="Save as a profile" />
            <p style={hint}>
              This will appear in Voice Profiles in the Studio. Load it any time to use
              your matched voice settings.
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder={`${params.voiceName} Clone`}
                maxLength={50}
                aria-label="Profile name"
                style={{
                  flex: '1 1 200px', padding: '10px 14px',
                  border: '1.5px solid rgba(212,114,106,0.25)',
                  borderRadius: 10, fontSize: 14, minHeight: 44,
                  outline: 'none', background: '#FFF8FA',
                  fontFamily: 'sans-serif',
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              <button onClick={handleSave} style={{ ...btnPrimary, minWidth: 120 }}>
                Save profile
              </button>
            </div>

            {saveMsg && (
              <p style={{ margin: '10px 0 0', fontSize: 13, color: '#6BAE75', fontWeight: 500, fontFamily: 'sans-serif' }}>
                {saveMsg}
              </p>
            )}
          </section>
        </>
      )}

      <style>{`
        @keyframes vl-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(1.4); }
        }
        @media (max-width: 600px) {
          .vl-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────

function StepLabel({ n, label }: { n: number; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <span style={{
        width: 26, height: 26, borderRadius: '50%',
        background: 'rgba(212,114,106,0.12)',
        border: '1.5px solid rgba(212,114,106,0.3)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, color: '#D4726A',
        fontFamily: 'sans-serif', flexShrink: 0,
      }}>
        {n}
      </span>
      <span style={{
        fontSize: 15, fontWeight: 600, color: '#1A1A1A',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        {label}
      </span>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: '#5A4A4A', fontFamily: 'sans-serif' }}>{label}</span>
      <span style={{
        fontSize: 13, fontWeight: 600, color: '#D4726A',
        background: 'rgba(212,114,106,0.08)', padding: '2px 10px',
        borderRadius: 20, fontFamily: 'sans-serif',
      }}>
        {value}
      </span>
    </div>
  )
}

function Spinner() {
  return (
    <span style={{
      width: 18, height: 18, border: '2px solid rgba(212,114,106,0.2)',
      borderTopColor: '#D4726A', borderRadius: '50%',
      animation: 'vl-spin 0.7s linear infinite', display: 'inline-block',
    }}>
      <style>{`@keyframes vl-spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  )
}

function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="9" y="2" width="6" height="12" rx="3"/>
      <path d="M5 10a7 7 0 0 0 14 0"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
      <line x1="8" y1="22" x2="16" y2="22"/>
    </svg>
  )
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2"/>
    </svg>
  )
}

// ── Shared styles 

const card: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 20,
  padding: 24,
  border: '1px solid rgba(212,114,106,0.12)',
  boxShadow: '0 2px 12px rgba(212,114,106,0.06)',
}

const btnPrimary: React.CSSProperties = {
  padding: '11px 24px', background: '#D4726A', color: '#fff',
  border: 'none', borderRadius: 12, cursor: 'pointer',
  fontSize: 14, fontWeight: 600, minHeight: 44,
  boxShadow: '0 4px 14px rgba(212,114,106,0.3)',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  transition: 'all 0.15s',
}

const btnSecondary: React.CSSProperties = {
  padding: '10px 22px',
  background: 'rgba(212,114,106,0.1)', color: '#D4726A',
  border: '1.5px solid rgba(212,114,106,0.3)',
  borderRadius: 12, cursor: 'pointer',
  fontSize: 14, fontWeight: 600, minHeight: 44,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  transition: 'all 0.15s',
}

const hint: React.CSSProperties = {
  fontSize: 13, color: '#9A8A8A', margin: '0 0 18px', lineHeight: 1.6,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}
