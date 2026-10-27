'use client'
import { useCallback, useReducer, useRef } from 'react'
import VideoDropZone from './VideoDropZone'
import ScriptEditor from './ScriptEditor'
import VoiceoverVoiceSelector from './VoiceoverVoiceSelector'
import VoiceoverParamPanel from './VoiceoverParamPanel'
import VoiceoverProgress from './VoiceoverProgress'
import VoiceoverResult from './VoiceoverResult'
import { generateVoiceover } from '@/lib/api/voiceover'
import type { VoiceoverResult as ResultType } from '@/types/voiceover'

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
  status: 'idle' | 'generating' | 'done' | 'error'
  progress: number
  result: ResultType | null
  error: string | null
}

type Action =
  | { type: 'SET_VIDEO'; payload: File | null }
  | { type: 'SET_SCRIPT'; payload: string }
  | { type: 'SET_VOICE'; payload: string }
  | { type: 'SET_PARAM'; key: keyof Params; value: Params[keyof Params] }
  | { type: 'START_GENERATE' }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'SET_DONE'; payload: ResultType }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' }

const DEFAULT_PARAMS: Params = {
  pitch: 1.0,
  speed: 1.0,
  volume: 0.8,
  warmth: 0.0,
  clarity: 0.0,
  tonePreset: 'neutral',
  naturalFlow: true,
}

const INITIAL: State = {
  video: null,
  script: '',
  voiceId: 'en-US-AriaNeural',
  params: DEFAULT_PARAMS,
  status: 'idle',
  progress: 0,
  result: null,
  error: null,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_VIDEO':      return { ...state, video: action.payload, error: null }
    case 'SET_SCRIPT':     return { ...state, script: action.payload, error: null }
    case 'SET_VOICE':      return { ...state, voiceId: action.payload }
    case 'SET_PARAM':      return { ...state, params: { ...state.params, [action.key]: action.value } }
    case 'START_GENERATE': return { ...state, status: 'generating', progress: 0, error: null, result: null }
    case 'SET_PROGRESS':   return { ...state, progress: action.payload }
    case 'SET_DONE':       return { ...state, status: 'done', progress: 100, result: action.payload }
    case 'SET_ERROR':      return { ...state, status: 'error', error: action.payload }
    case 'RESET': {
      if (state.result?.blobUrl) URL.revokeObjectURL(state.result.blobUrl)
      return { ...INITIAL, voiceId: state.voiceId, params: state.params }
    }
    default: return state
  }
}

export default function VoiceoverStudio() {
  const [state, dispatch] = useReducer(reducer, INITIAL)
  const abortRef = useRef<AbortController | null>(null)
  // Ref mirror keeps handleGenerate always reading the latest state without stale closures
  const stateRef = useRef(state)
  stateRef.current = state

  const busy        = state.status === 'generating'
  const canGenerate = !busy && !!state.video && state.script.trim().length > 0

  const handleGenerate = useCallback(async () => {
    const { video, script, voiceId, params } = stateRef.current
    if (!video || !script.trim()) return
    abortRef.current = new AbortController()
    dispatch({ type: 'START_GENERATE' })
    try {
      const result = await generateVoiceover(
        { video, script, voiceId, pitch: params.pitch, speed: params.speed,
          volume: params.volume, tonePreset: params.tonePreset,
          naturalFlow: params.naturalFlow, warmth: params.warmth, clarity: params.clarity },
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

  // Stable refs prevent the voice selector's load effect from re-firing on re-renders
  const handleVoiceChange = useCallback((id: string) => dispatch({ type: 'SET_VOICE', payload: id }), [])
  const handleParamChange = useCallback(<K extends keyof Params>(key: K, value: Params[K]) => {
    dispatch({ type: 'SET_PARAM', key, value: value as Params[keyof Params] })
  }, [])

  if (state.status === 'generating') {
    return (
      <>
        <style>{VO_STYLES}</style>
        <div className="vo-card vo-single-card">
          <VoiceoverProgress progress={state.progress} onCancel={handleCancel} />
        </div>
      </>
    )
  }

  if (state.status === 'done' && state.result) {
    return (
      <>
        <style>{VO_STYLES}</style>
        <div className="vo-card vo-single-card vo-result-card">
          <VoiceoverResult result={state.result} onReset={handleReset} />
        </div>
      </>
    )
  }

  return (
    <>
      <style>{VO_STYLES}</style>
      <div className="vo-grid">
        <div className="vo-main-col">
          <section className="vo-card" aria-label="Video upload">
            <SectionLabel>1 — Upload Video</SectionLabel>
            <VideoDropZone
              file={state.video}
              onChange={(f) => dispatch({ type: 'SET_VIDEO', payload: f })}
              disabled={busy}
            />
          </section>

          <section className="vo-card" aria-label="Voice-over script">
            <SectionLabel>2 — Write Your Script</SectionLabel>
            <ScriptEditor
              value={state.script}
              onChange={(v) => dispatch({ type: 'SET_SCRIPT', payload: v })}
              disabled={busy}
            />
          </section>

          {state.error && (
            <div
              role="alert"
              style={{
                padding: '12px 16px', borderRadius: 12,
                background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.2)',
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10" stroke="#c0392b" strokeWidth="1.8"/>
                <path d="M12 8v4M12 16h.01" stroke="#c0392b" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p style={{ margin: 0, fontSize: 13, color: '#c0392b', lineHeight: 1.5, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                {state.error}
              </p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            aria-disabled={!canGenerate}
            className={`vo-generate-btn${canGenerate ? ' vo-generate-btn--active' : ''}`}
            onMouseEnter={(e) => { if (canGenerate) e.currentTarget.style.opacity = '0.9' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="2" y="4" width="15" height="16" rx="2" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="1.5"/>
              <path d="M17 8.5l5-3v13l-5-3V8.5z" fill="white" opacity="0.9"/>
              <path d="M6 10v4M9 9v6M12 11v2" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Generate Voice-over
          </button>

          {!state.video && !state.script && (
            <p style={{ margin: 0, textAlign: 'center', fontSize: 12, color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              Upload a video and add a script to get started
            </p>
          )}
        </div>

        <aside className="vo-sidebar">
          <section className="vo-card" aria-label="Voice selection">
            <SectionLabel>3 — Choose a Voice</SectionLabel>
            <VoiceoverVoiceSelector voiceId={state.voiceId} onChange={handleVoiceChange} disabled={busy} />
          </section>

          <section className="vo-card" aria-label="Voice parameters">
            <SectionLabel>4 — Tune the Voice</SectionLabel>
            <VoiceoverParamPanel params={state.params} onChange={handleParamChange} disabled={busy} />
          </section>
        </aside>
      </div>
    </>
  )
}

const VO_STYLES = `
  .vo-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 20px;
    border: 1px solid rgba(212,114,106,0.12);
    box-shadow: 0 2px 12px rgba(212,114,106,0.06);
  }

  /* Two-column grid: main + 300px sidebar */
  .vo-grid {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 20px;
    align-items: start;
  }

  .vo-main-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }

  .vo-sidebar {
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: sticky;
    top: 84px;
  }

  /* Single-card states (progress / result) */
  .vo-single-card {
    max-width: 480px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
  }
  .vo-result-card {
    max-width: 600px;
  }

  /* Generate button */
  .vo-generate-btn {
    width: 100%;
    padding: 14px 24px;
    border-radius: 9999px;
    border: none;
    cursor: not-allowed;
    background: rgba(212,114,106,0.2);
    color: #9A8A8A;
    font-size: 15px;
    font-weight: 700;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    box-shadow: none;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    box-sizing: border-box;
  }
  .vo-generate-btn--active {
    cursor: pointer;
    background: linear-gradient(135deg, #e8a09a, #D4726A);
    color: #fff;
    box-shadow: 0 4px 20px rgba(212,114,106,0.4);
  }

  /* Tablet: sidebar becomes narrower */
  @media (max-width: 1024px) {
    .vo-grid {
      grid-template-columns: 1fr 260px;
    }
  }

  /* Mobile: single column */
  @media (max-width: 768px) {
    .vo-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
    .vo-sidebar {
      position: static;
    }
    .vo-single-card {
      max-width: 100%;
    }
    .vo-result-card {
      max-width: 100%;
    }
  }

  /* Small phones: tighten card padding */
  @media (max-width: 480px) {
    .vo-card {
      border-radius: 16px;
      padding: 16px;
    }
    .vo-generate-btn {
      font-size: 14px;
      padding: 13px 20px;
    }
  }
`

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      margin: '0 0 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
      textTransform: 'uppercase', color: '#9A8A8A',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      paddingBottom: 10, borderBottom: '1px solid rgba(212,114,106,0.12)',
    }}>
      {children}
    </p>
  )
}
