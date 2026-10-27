'use client'
import { useCallback, useReducer, useRef } from 'react'
import VideoDropZone from '@/components/voiceover/VideoDropZone'
import ScriptEditor from '@/components/voiceover/ScriptEditor'
import VoiceoverVoiceSelector from '@/components/voiceover/VoiceoverVoiceSelector'
import VoiceoverParamPanel from '@/components/voiceover/VoiceoverParamPanel'
import VoiceoverProgress from '@/components/voiceover/VoiceoverProgress'
import MusicPanel from '@/components/reels/MusicPanel'
import { generateReelsVoiceover } from '@/lib/api/reels'
import type { ReelsResult, CaptionStyle, MusicSettings } from '@/types/reels'

interface Params {
  pitch: number
  speed: number
  volume: number
  warmth: number
  clarity: number
  tonePreset: 'neutral' | 'warm' | 'crisp'
  naturalFlow: boolean
}

interface State {
  video: File | null
  script: string
  voiceId: string
  params: Params
  burnCaptions: boolean
  captionStyle: CaptionStyle
  music: MusicSettings
  status: 'idle' | 'generating' | 'done' | 'error'
  progress: number
  result: ReelsResult | null
  error: string | null
}

type Action =
  | { type: 'SET_VIDEO';         payload: File | null }
  | { type: 'SET_SCRIPT';        payload: string }
  | { type: 'SET_VOICE';         payload: string }
  | { type: 'SET_PARAM';         key: keyof Params; value: Params[keyof Params] }
  | { type: 'SET_BURN_CAPTIONS'; payload: boolean }
  | { type: 'SET_CAPTION_STYLE'; payload: CaptionStyle }
  | { type: 'SET_MUSIC';         payload: MusicSettings }
  | { type: 'START_GENERATE' }
  | { type: 'SET_PROGRESS';      payload: number }
  | { type: 'SET_DONE';          payload: ReelsResult }
  | { type: 'SET_ERROR';         payload: string }
  | { type: 'RESET' }

const DEFAULT_PARAMS: Params = {
  pitch: 1.0, speed: 1.0, volume: 0.8,
  warmth: 0.0, clarity: 0.0,
  tonePreset: 'neutral', naturalFlow: true,
}

const DEFAULT_MUSIC: MusicSettings = {
  source: 'none',
  builtinTrackId: '',
  uploadedFile: null,
  musicVolume: 0.3,
  ducking: true,
  fadeIn: true,
  fadeOut: true,
}

const INITIAL: State = {
  video: null, script: '', voiceId: 'en-US-AriaNeural',
  params: DEFAULT_PARAMS,
  burnCaptions: false, captionStyle: 'default',
  music: DEFAULT_MUSIC,
  status: 'idle', progress: 0, result: null, error: null,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_VIDEO':         return { ...state, video: action.payload, error: null }
    case 'SET_SCRIPT':        return { ...state, script: action.payload, error: null }
    case 'SET_VOICE':         return { ...state, voiceId: action.payload }
    case 'SET_PARAM':         return { ...state, params: { ...state.params, [action.key]: action.value } }
    case 'SET_BURN_CAPTIONS': return { ...state, burnCaptions: action.payload }
    case 'SET_CAPTION_STYLE': return { ...state, captionStyle: action.payload }
    case 'SET_MUSIC':         return { ...state, music: action.payload }
    case 'START_GENERATE':    return { ...state, status: 'generating', progress: 0, error: null, result: null }
    case 'SET_PROGRESS':      return { ...state, progress: action.payload }
    case 'SET_DONE':          return { ...state, status: 'done', progress: 100, result: action.payload }
    case 'SET_ERROR':         return { ...state, status: 'error', error: action.payload }
    case 'RESET': {
      if (state.result?.blobUrl) URL.revokeObjectURL(state.result.blobUrl)
      return { ...INITIAL, voiceId: state.voiceId, params: state.params }
    }
    default: return state
  }
}

export default function ReelsStudio() {
  const [state, dispatch] = useReducer(reducer, INITIAL)
  const abortRef = useRef<AbortController | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  const busy = state.status === 'generating'
  const canGenerate = !busy && !!state.video && state.script.trim().length > 0

  const handleGenerate = useCallback(async () => {
    const s = stateRef.current
    if (!s.video || !s.script.trim()) return

    const musicValid =
      s.music.source === 'none' ||
      (s.music.source === 'builtin' && !!s.music.builtinTrackId) ||
      (s.music.source === 'upload' && !!s.music.uploadedFile)

    if (!musicValid) {
      dispatch({ type: 'SET_ERROR', payload: 'Select a built-in track or upload an audio file before generating.' })
      return
    }

    abortRef.current = new AbortController()
    dispatch({ type: 'START_GENERATE' })

    try {
      const result = await generateReelsVoiceover(
        {
          video: s.video, script: s.script, voiceId: s.voiceId,
          pitch: s.params.pitch, speed: s.params.speed, volume: s.params.volume,
          tonePreset: s.params.tonePreset, naturalFlow: s.params.naturalFlow,
          warmth: s.params.warmth, clarity: s.params.clarity,
          burnCaptions: s.burnCaptions, captionStyle: s.captionStyle,
          music: s.music,
        },
        (pct) => dispatch({ type: 'SET_PROGRESS', payload: pct }),
        abortRef.current.signal,
      )
      dispatch({ type: 'SET_DONE', payload: result })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      dispatch({ type: 'SET_ERROR', payload: msg })
    }
  }, [])

  const handleCancel = useCallback(() => {
    abortRef.current?.abort()
    dispatch({ type: 'SET_ERROR', payload: 'Generation cancelled.' })
  }, [])

  const handleReset = useCallback(() => dispatch({ type: 'RESET' }), [])
  const handleVoiceChange = useCallback((id: string) => dispatch({ type: 'SET_VOICE', payload: id }), [])
  const handleParamChange = useCallback(<K extends keyof Params>(key: K, value: Params[K]) => {
    dispatch({ type: 'SET_PARAM', key, value: value as Params[keyof Params] })
  }, [])

  if (state.status === 'generating') {
    return (
      <>
        <style>{STYLES}</style>
        <div className="rl-card rl-single-card">
          <VoiceoverProgress progress={state.progress} onCancel={handleCancel} />
        </div>
      </>
    )
  }

  if (state.status === 'done' && state.result) {
    return (
      <>
        <style>{STYLES}</style>
        <ReelsResult result={state.result} onReset={handleReset} />
      </>
    )
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="rl-grid">
        <div className="rl-main-col">

          <section className="rl-card" aria-label="Video upload">
            <SectionLabel>1 — Upload Vertical Video (9:16)</SectionLabel>
            <VideoDropZone
              file={state.video}
              onChange={(f) => dispatch({ type: 'SET_VIDEO', payload: f })}
              disabled={busy}
            />
          </section>

          <section className="rl-card" aria-label="Voice-over script">
            <SectionLabel>2 — Write Your Script</SectionLabel>
            <ScriptEditor
              value={state.script}
              onChange={(v) => dispatch({ type: 'SET_SCRIPT', payload: v })}
              disabled={busy}
            />
          </section>

          <section className="rl-card" aria-label="Background music">
            <SectionLabel>3 — Background Music (Optional)</SectionLabel>
            <MusicPanel
              settings={state.music}
              onChange={(m) => dispatch({ type: 'SET_MUSIC', payload: m })}
              disabled={busy}
            />
          </section>

          <section className="rl-card" aria-label="Caption settings">
            <SectionLabel>4 — Captions (Optional)</SectionLabel>
            <CaptionSection
              burnCaptions={state.burnCaptions}
              captionStyle={state.captionStyle}
              busy={busy}
              dispatch={dispatch}
            />
          </section>

          {state.error && (
            <div role="alert" className="rl-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10" stroke="#c0392b" strokeWidth="1.8"/>
                <path d="M12 8v4M12 16h.01" stroke="#c0392b" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p style={{ margin: 0, fontSize: 13, color: '#c0392b', lineHeight: 1.5, fontFamily: 'system-ui, sans-serif' }}>
                {state.error}
              </p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            aria-disabled={!canGenerate}
            className={`rl-generate-btn${canGenerate ? ' rl-generate-btn--active' : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <polygon points="5 3 19 12 5 21" fill="white" opacity="0.9"/>
            </svg>
            Generate Reels Video
          </button>

          {!state.video && !state.script && (
            <p style={{ margin: 0, textAlign: 'center', fontSize: 12, color: '#9A8A8A', fontFamily: 'system-ui, sans-serif' }}>
              Upload a vertical video and add a script to get started
            </p>
          )}
        </div>

        <aside className="rl-sidebar">
          <section className="rl-card" aria-label="Voice selection">
            <SectionLabel>5 — Choose a Voice</SectionLabel>
            <VoiceoverVoiceSelector voiceId={state.voiceId} onChange={handleVoiceChange} disabled={busy} />
          </section>

          <section className="rl-card" aria-label="Voice parameters">
            <SectionLabel>6 — Tune the Voice</SectionLabel>
            <VoiceoverParamPanel params={state.params} onChange={handleParamChange} disabled={busy} />
          </section>
        </aside>
      </div>
    </>
  )
}

function CaptionSection({
  burnCaptions, captionStyle, busy, dispatch,
}: {
  burnCaptions: boolean
  captionStyle: CaptionStyle
  busy: boolean
  dispatch: React.Dispatch<Action>
}) {
  const presets = {
    default: { bg: 'rgba(0,0,0,0.55)', color: '#fff', fontWeight: 600, fontSize: 13 },
    bold:    { bg: 'rgba(0,0,0,0.7)',  color: '#FFE01A', fontWeight: 800, fontSize: 14 },
    minimal: { bg: 'transparent',      color: '#fff', fontWeight: 600, fontSize: 13 },
  }

  return (
    <div style={{ opacity: busy ? 0.6 : 1, pointerEvents: busy ? 'none' : 'auto' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
        <button
          role="switch"
          aria-checked={burnCaptions}
          onClick={() => dispatch({ type: 'SET_BURN_CAPTIONS', payload: !burnCaptions })}
          style={{
            width: 44, height: 24, borderRadius: 9999, border: 'none', cursor: 'pointer',
            background: burnCaptions ? '#D4726A' : '#e0e0e0',
            position: 'relative', transition: 'background 0.2s', flexShrink: 0, padding: 0,
          }}
          aria-label="Burn captions into video"
        >
          <span style={{
            position: 'absolute', top: 3, left: burnCaptions ? 23 : 3,
            width: 18, height: 18, borderRadius: '50%',
            background: '#fff', transition: 'left 0.2s',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }} />
        </button>
        <span style={{ fontSize: 13, color: '#3A3A3A', fontFamily: 'system-ui, sans-serif' }}>
          Burn captions into video
          <span style={{ display: 'block', fontSize: 11, color: '#9A8A8A', marginTop: 1 }}>
            Word-wrapped text in the lower third
          </span>
        </span>
      </label>

      {burnCaptions && (
        <div style={{ marginTop: 16 }}>
          <p style={{
            margin: '0 0 10px', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A8A8A',
            fontFamily: 'system-ui, sans-serif',
          }}>
            Caption style
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(['default', 'bold', 'minimal'] as CaptionStyle[]).map((s) => (
              <button
                key={s}
                onClick={() => dispatch({ type: 'SET_CAPTION_STYLE', payload: s })}
                aria-pressed={captionStyle === s}
                style={{
                  padding: '6px 16px', borderRadius: 9999, cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
                  fontFamily: 'system-ui, sans-serif',
                  border: captionStyle === s ? '1.5px solid #D4726A' : '1.5px solid rgba(212,114,106,0.2)',
                  background: captionStyle === s ? 'rgba(212,114,106,0.12)' : 'transparent',
                  color: captionStyle === s ? '#D4726A' : '#9A8A8A',
                  transition: 'all 0.15s',
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <div
            aria-label={`Preview of ${captionStyle} caption style`}
            style={{
              marginTop: 12, borderRadius: 10, overflow: 'hidden',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              height: 72, display: 'flex', alignItems: 'flex-end',
              justifyContent: 'center', paddingBottom: 10,
            }}
          >
            <span style={{
              background: presets[captionStyle].bg,
              color: presets[captionStyle].color,
              fontWeight: presets[captionStyle].fontWeight,
              fontSize: presets[captionStyle].fontSize,
              padding: '3px 10px', borderRadius: 6,
              fontFamily: 'system-ui, sans-serif',
              textShadow: captionStyle === 'minimal' ? '0 1px 4px rgba(0,0,0,0.8)' : 'none',
            }}>
              Sample caption text
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function ReelsResult({ result, onReset }: { result: ReelsResult; onReset: () => void }) {
  const fmt = (b: number) =>
    b >= 1_048_576 ? `${(b / 1_048_576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`
  const durFmt = (s: number) => {
    const m = Math.floor(s / 60), sec = Math.round(s % 60)
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`
  }
  const tags = [
    result.captionsBurned && 'captions',
    result.musicMixed && 'music',
  ].filter(Boolean).join(' · ')

  return (
    <>
      <style>{STYLES}</style>
      <div className="rl-card rl-single-card rl-result-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }} aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="rgba(39,174,96,0.1)" stroke="#27ae60" strokeWidth="1.5"/>
              <path d="M8 12l3 3 5-5" stroke="#27ae60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1A1A1A', fontFamily: 'system-ui, sans-serif' }}>
              Reels video ready!
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9A8A8A', fontFamily: 'system-ui, sans-serif' }}>
              {fmt(result.sizeBytes)} · {durFmt(result.duration)}{tags ? ` · ${tags}` : ''}
            </p>
          </div>
        </div>

        <video
          src={result.blobUrl}
          controls
          playsInline
          aria-label="Preview of the generated reels video"
          style={{
            width: '100%', maxHeight: 480, borderRadius: 14,
            background: '#000', display: 'block',
            border: '1px solid rgba(212,114,106,0.15)',
          }}
        />

        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          <a
            href={result.blobUrl}
            download={result.filename}
            style={{
              flex: 1, minWidth: 140,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px 20px', borderRadius: 9999, textDecoration: 'none',
              background: 'linear-gradient(135deg, #e8a09a, #D4726A)',
              color: '#fff', fontSize: 14, fontWeight: 700,
              boxShadow: '0 4px 16px rgba(212,114,106,0.35)',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <polyline points="7 10 12 15 17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="15" x2="12" y2="3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Download MP4
          </a>
          <button
            onClick={onReset}
            style={{
              flex: 1, minWidth: 120,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px 20px', borderRadius: 9999, cursor: 'pointer',
              background: 'rgba(212,114,106,0.08)', border: '1.5px solid rgba(212,114,106,0.25)',
              color: '#D4726A', fontSize: 14, fontWeight: 600, fontFamily: 'system-ui, sans-serif',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <polyline points="23 4 23 10 17 10" stroke="#D4726A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="#D4726A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            New video
          </button>
        </div>
      </div>
    </>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      margin: '0 0 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
      textTransform: 'uppercase', color: '#9A8A8A', fontFamily: 'system-ui, sans-serif',
      paddingBottom: 10, borderBottom: '1px solid rgba(212,114,106,0.12)',
    }}>
      {children}
    </p>
  )
}

const STYLES = `
  .rl-card {
    background: #fff;
    border-radius: 20px;
    padding: 20px;
    border: 1px solid rgba(212,114,106,0.12);
    box-shadow: 0 2px 12px rgba(212,114,106,0.06);
  }
  .rl-grid {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 20px;
    align-items: start;
  }
  .rl-main-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }
  .rl-sidebar {
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: sticky;
    top: 84px;
  }
  .rl-single-card {
    max-width: 480px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
  }
  .rl-result-card { max-width: 640px; }
  .rl-error {
    padding: 12px 16px;
    border-radius: 12px;
    background: rgba(192,57,43,0.07);
    border: 1px solid rgba(192,57,43,0.2);
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }
  .rl-generate-btn {
    width: 100%;
    padding: 14px 24px;
    border-radius: 9999px;
    border: none;
    cursor: not-allowed;
    background: rgba(212,114,106,0.2);
    color: #9A8A8A;
    font-size: 15px;
    font-weight: 700;
    font-family: system-ui, sans-serif;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    box-sizing: border-box;
  }
  .rl-generate-btn--active {
    cursor: pointer;
    background: linear-gradient(135deg, #e8a09a, #D4726A);
    color: #fff;
    box-shadow: 0 4px 20px rgba(212,114,106,0.4);
  }
  .rl-generate-btn--active:hover { opacity: 0.9; }

  @media (max-width: 1024px) {
    .rl-grid { grid-template-columns: 1fr 260px; }
  }
  @media (max-width: 768px) {
    .rl-grid { grid-template-columns: 1fr; gap: 16px; }
    .rl-sidebar { position: static; }
    .rl-single-card, .rl-result-card { max-width: 100%; }
  }
  @media (max-width: 480px) {
    .rl-card { border-radius: 16px; padding: 16px; }
    .rl-generate-btn { font-size: 14px; padding: 13px 20px; }
  }
`
