'use client'
import { useCallback, useReducer, useRef } from 'react'
import SubtitleDropZone from './SubtitleDropZone'
import SubtitleProgress from './SubtitleProgress'
import SubtitleResult from './SubtitleResult'
import VoiceoverVoiceSelector from '@/components/voiceover/VoiceoverVoiceSelector'
import VoiceoverParamPanel from '@/components/voiceover/VoiceoverParamPanel'
import { generateSubtitleAudio } from '@/lib/api/subtitle'
import type { SubtitleResult as ResultType } from '@/types/subtitle'

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
  file: File | null
  voiceId: string
  params: Params
  status: 'idle' | 'generating' | 'done' | 'error'
  progress: number
  result: ResultType | null
  error: string | null
}

type Action =
  | { type: 'SET_FILE'; payload: File | null }
  | { type: 'SET_VOICE'; payload: string }
  | { type: 'SET_PARAM'; key: keyof Params; value: Params[keyof Params] }
  | { type: 'START_GENERATE' }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'SET_DONE'; payload: ResultType }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' }

const DEFAULT_PARAMS: Params = {
  pitch: 1.0, speed: 1.0, volume: 0.8,
  warmth: 0.0, clarity: 0.0, tonePreset: 'neutral', naturalFlow: true,
}

const INITIAL: State = {
  file: null, voiceId: 'en-US-AriaNeural', params: DEFAULT_PARAMS,
  status: 'idle', progress: 0, result: null, error: null,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FILE':       return { ...state, file: action.payload, error: null }
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

export default function SubtitleStudio() {
  const [state, dispatch] = useReducer(reducer, INITIAL)
  const abortRef = useRef<AbortController | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  const busy = state.status === 'generating'
  const canGenerate = !busy && !!state.file

  const handleGenerate = useCallback(async () => {
    const { file, voiceId, params } = stateRef.current
    if (!file) return
    abortRef.current = new AbortController()
    dispatch({ type: 'START_GENERATE' })
    try {
      const result = await generateSubtitleAudio(
        { subtitle: file, voiceId, pitch: params.pitch, speed: params.speed,
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
  const handleVoiceChange = useCallback((id: string) => dispatch({ type: 'SET_VOICE', payload: id }), [])
  const handleParamChange = useCallback(<K extends keyof Params>(key: K, value: Params[K]) => {
    dispatch({ type: 'SET_PARAM', key, value: value as Params[keyof Params] })
  }, [])

  if (state.status === 'generating') {
    return (
      <>
        <style>{ST_STYLES}</style>
        <div className="st-card st-single-card">
          <SubtitleProgress progress={state.progress} onCancel={handleCancel} />
        </div>
      </>
    )
  }

  if (state.status === 'done' && state.result) {
    return (
      <>
        <style>{ST_STYLES}</style>
        <div className="st-card st-single-card st-result-card">
          <SubtitleResult result={state.result} onReset={handleReset} />
        </div>
      </>
    )
  }

  return (
    <>
      <style>{ST_STYLES}</style>
      <div className="st-grid">
        <div className="st-main-col">
          <section className="st-card" aria-label="Subtitle file upload">
            <SectionLabel>1 — Upload Subtitle File</SectionLabel>
            <SubtitleDropZone file={state.file} onChange={(f) => dispatch({ type: 'SET_FILE', payload: f })} disabled={busy} />
          </section>

          {state.error && (
            <div role="alert" style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.2)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
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
            className={`st-generate-btn${canGenerate ? ' st-generate-btn--active' : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="1.5"/>
              <polyline points="14 2 14 8 20 8" stroke="white" strokeWidth="1.5"/>
              <path d="M6 10v4M9 9v6M12 11v2" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Generate Timed Audio
          </button>

          {!state.file && (
            <p style={{ margin: 0, textAlign: 'center', fontSize: 12, color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              Upload an .srt or .vtt file to get started
            </p>
          )}
        </div>

        <aside className="st-sidebar">
          <section className="st-card" aria-label="Voice selection">
            <SectionLabel>2 — Choose a Voice</SectionLabel>
            <VoiceoverVoiceSelector voiceId={state.voiceId} onChange={handleVoiceChange} disabled={busy} />
          </section>
          <section className="st-card" aria-label="Voice parameters">
            <SectionLabel>3 — Tune the Voice</SectionLabel>
            <VoiceoverParamPanel params={state.params} onChange={handleParamChange} disabled={busy} />
          </section>
        </aside>
      </div>
    </>
  )
}

const ST_STYLES = `
  .st-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 20px;
    border: 1px solid rgba(212,114,106,0.12);
    box-shadow: 0 2px 12px rgba(212,114,106,0.06);
  }
  .st-grid {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 20px;
    align-items: start;
  }
  .st-main-col { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
  .st-sidebar { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 84px; }
  .st-single-card { max-width: 480px; width: 100%; margin: 0 auto; box-sizing: border-box; }
  .st-result-card { max-width: 600px; }
  .st-generate-btn {
    width: 100%; padding: 14px 24px; border-radius: 9999px; border: none;
    cursor: not-allowed; background: rgba(212,114,106,0.2); color: #9A8A8A;
    font-size: 15px; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10;
    box-sizing: border-box;
  }
  .st-generate-btn--active {
    cursor: pointer; background: linear-gradient(135deg, #e8a09a, #D4726A);
    color: #fff; box-shadow: 0 4px 20px rgba(212,114,106,0.4);
  }
  .st-generate-btn--active:hover { opacity: 0.9; }
  @media (max-width: 1024px) { .st-grid { grid-template-columns: 1fr 260px; } }
  @media (max-width: 768px) {
    .st-grid { grid-template-columns: 1fr; gap: 16px; }
    .st-sidebar { position: static; }
    .st-single-card, .st-result-card { max-width: 100%; }
  }
  @media (max-width: 480px) {
    .st-card { border-radius: 16px; padding: 16px; }
    .st-generate-btn { font-size: 14px; padding: 13px 20px; }
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
