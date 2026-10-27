'use client'
import { useCallback, useReducer, useRef } from 'react'
import DialogueTurnCard from './DialogueTurnCard'
import DialogueResult from './DialogueResult'
import VoiceoverProgress from '@/components/voiceover/VoiceoverProgress'
import { generateDialogue } from '@/lib/api/dialogue'
import type { DialogueTurn, DialogueTurnParams, DialogueResult as ResultType } from '@/types/dialogue'

const DEFAULT_PARAMS: DialogueTurnParams = {
  pitch: 1.0, speed: 1.0, volume: 0.8,
  warmth: 0.0, clarity: 0.0, tonePreset: 'neutral', naturalFlow: true,
}

const DEFAULT_VOICES = ['en-US-AriaNeural', 'en-US-GuyNeural']

let _id = 0
function newId() { return `t${++_id}` }

function makeTurn(index: number): DialogueTurn {
  return {
    id: newId(),
    speaker: `Speaker ${index + 1}`,
    text: '',
    voiceId: DEFAULT_VOICES[index % DEFAULT_VOICES.length],
    params: { ...DEFAULT_PARAMS },
  }
}

interface State {
  turns: DialogueTurn[]
  pauseMs: number
  status: 'idle' | 'generating' | 'done' | 'error'
  progress: number
  result: ResultType | null
  error: string | null
}

type Action =
  | { type: 'SET_TURNS'; payload: DialogueTurn[] }
  | { type: 'ADD_TURN' }
  | { type: 'UPDATE_TURN'; id: string; patch: Partial<DialogueTurn> }
  | { type: 'REMOVE_TURN'; id: string }
  | { type: 'MOVE_TURN'; id: string; dir: -1 | 1 }
  | { type: 'SET_PAUSE'; payload: number }
  | { type: 'START' }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'DONE'; payload: ResultType }
  | { type: 'ERROR'; payload: string }
  | { type: 'RESET' }

const INITIAL: State = {
  turns: [makeTurn(0), makeTurn(1)],
  pauseMs: 400,
  status: 'idle', progress: 0, result: null, error: null,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_TURNS':   return { ...state, turns: action.payload }
    case 'ADD_TURN':    return { ...state, turns: [...state.turns, makeTurn(state.turns.length)] }
    case 'UPDATE_TURN': return { ...state, turns: state.turns.map((t) => t.id === action.id ? { ...t, ...action.patch } : t) }
    case 'REMOVE_TURN': return { ...state, turns: state.turns.filter((t) => t.id !== action.id) }
    case 'MOVE_TURN': {
      const idx = state.turns.findIndex((t) => t.id === action.id)
      if (idx < 0) return state
      const arr = [...state.turns]
      const swap = idx + action.dir
      if (swap < 0 || swap >= arr.length) return state
      ;[arr[idx], arr[swap]] = [arr[swap], arr[idx]]
      return { ...state, turns: arr }
    }
    case 'SET_PAUSE':     return { ...state, pauseMs: action.payload }
    case 'START':         return { ...state, status: 'generating', progress: 0, error: null, result: null }
    case 'SET_PROGRESS':  return { ...state, progress: action.payload }
    case 'DONE':          return { ...state, status: 'done', progress: 100, result: action.payload }
    case 'ERROR':         return { ...state, status: 'error', error: action.payload }
    case 'RESET': {
      if (state.result?.blobUrl) URL.revokeObjectURL(state.result.blobUrl)
      return { ...INITIAL, turns: [makeTurn(0), makeTurn(1)] }
    }
    default: return state
  }
}

export default function DialogueStudio() {
  const [state, dispatch] = useReducer(reducer, INITIAL)
  const abortRef = useRef<AbortController | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  const busy = state.status === 'generating'
  const canGenerate = !busy && state.turns.length >= 1 && state.turns.some((t) => t.text.trim().length > 0)
  const validTurns = state.turns.filter((t) => t.text.trim().length > 0)

  const handleGenerate = useCallback(async () => {
    const { turns, pauseMs } = stateRef.current
    const filled = turns.filter((t) => t.text.trim())
    if (!filled.length) return
    abortRef.current = new AbortController()
    dispatch({ type: 'START' })
    try {
      const result = await generateDialogue(
        filled, pauseMs,
        (pct) => dispatch({ type: 'SET_PROGRESS', payload: pct }),
        abortRef.current.signal,
      )
      dispatch({ type: 'DONE', payload: result })
    } catch (err: unknown) {
      dispatch({ type: 'ERROR', payload: err instanceof Error ? err.message : 'Something went wrong.' })
    }
  }, [])

  const handleCancel = useCallback(() => {
    abortRef.current?.abort()
    dispatch({ type: 'ERROR', payload: 'Generation cancelled.' })
  }, [])

  const handleReset = useCallback(() => dispatch({ type: 'RESET' }), [])

  const handleUpdate = useCallback((id: string, patch: Partial<DialogueTurn>) => {
    dispatch({ type: 'UPDATE_TURN', id, patch })
  }, [])

  const handleRemove = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TURN', id })
  }, [])

  const handleMove = useCallback((id: string, dir: -1 | 1) => {
    dispatch({ type: 'MOVE_TURN', id, dir })
  }, [])

  if (state.status === 'generating') {
    return (
      <>
        <style>{DG_STYLES}</style>
        <div className="dg-card dg-single-card">
          <VoiceoverProgress progress={state.progress} onCancel={handleCancel} />
        </div>
      </>
    )
  }

  if (state.status === 'done' && state.result) {
    return (
      <>
        <style>{DG_STYLES}</style>
        <div className="dg-card dg-single-card dg-result-card">
          <DialogueResult result={state.result} onReset={handleReset} />
        </div>
      </>
    )
  }

  return (
    <>
      <style>{DG_STYLES}</style>
      <div className="dg-grid">
        <div className="dg-main-col">
          {/* Script header */}
          <section className="dg-card" aria-label="Dialogue script">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <SectionLabel>Script — {validTurns.length} / {state.turns.length} turn{state.turns.length !== 1 ? 's' : ''} ready</SectionLabel>
              <button
                onClick={() => dispatch({ type: 'ADD_TURN' })}
                disabled={busy}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                  borderRadius: 8, border: '1.5px solid rgba(212,114,106,0.3)',
                  background: 'transparent', color: '#D4726A', fontSize: 12, fontWeight: 600,
                  cursor: busy ? 'not-allowed' : 'pointer',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  transition: 'all 0.15s',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Turn
              </button>
            </div>

            {state.turns.length === 0 ? (
              <div style={{ padding: '28px 0', textAlign: 'center', color: '#9A8A8A', fontSize: 13, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                No turns yet. Click Add Turn to start.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {state.turns.map((turn, idx) => (
                  <DialogueTurnCard
                    key={turn.id}
                    turn={turn}
                    index={idx}
                    total={state.turns.length}
                    disabled={busy}
                    onChange={handleUpdate}
                    onRemove={handleRemove}
                    onMove={handleMove}
                  />
                ))}
              </div>
            )}
          </section>

          {state.error && (
            <div role="alert" style={{
              padding: '12px 16px', borderRadius: 12,
              background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.2)',
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
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
            className={`dg-generate-btn${canGenerate ? ' dg-generate-btn--active' : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="1.8"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Generate Dialogue
          </button>

          {!canGenerate && state.turns.length > 0 && (
            <p style={{ margin: 0, textAlign: 'center', fontSize: 12, color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              Add text to at least one turn to generate audio.
            </p>
          )}
        </div>

        {/* Sidebar */}
        <aside className="dg-sidebar">
          <section className="dg-card" aria-label="Global settings">
            <SectionLabel>Global Settings</SectionLabel>
            <div>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#5A4A4A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                  Pause between turns
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="range" min={0} max={2000} step={100}
                    value={state.pauseMs}
                    onChange={(e) => dispatch({ type: 'SET_PAUSE', payload: Number(e.target.value) })}
                    disabled={busy}
                    style={{ flex: 1, accentColor: '#D4726A' }}
                    aria-label="Pause between turns in milliseconds"
                  />
                  <span style={{ fontSize: 12, color: '#9A8A8A', minWidth: 48, textAlign: 'right', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                    {state.pauseMs}ms
                  </span>
                </div>
              </label>
            </div>
          </section>

          <section className="dg-card" aria-label="Script format guide">
            <SectionLabel>Format Tips</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Each turn = one speaker line',
                'Name each speaker clearly',
                'Expand a turn to change its voice',
                'Reorder turns with the arrows',
                'Empty turns are skipped',
              ].map((tip) => (
                <div key={tip} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }}>
                    <polyline points="9 11 12 14 22 4" stroke="#D4726A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="#D4726A" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontSize: 12, color: '#5A4A4A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', lineHeight: 1.5 }}>{tip}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </>
  )
}

const DG_STYLES = `
  .dg-card { background: #fff; border-radius: 20px; padding: 20px; border: 1px solid rgba(212,114,106,0.12); box-shadow: 0 2px 12px rgba(212,114,106,0.06); }
  .dg-grid { display: grid; grid-template-columns: 1fr 280px; gap: 20px; align-items: start; }
  .dg-main-col { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
  .dg-sidebar { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 84px; }
  .dg-single-card { max-width: 480px; width: 100%; margin: 0 auto; box-sizing: border-box; }
  .dg-result-card { max-width: 600px; }
  .dg-generate-btn { width: 100%; padding: 14px 24px; border-radius: 9999px; border: none; cursor: not-allowed; background: rgba(212,114,106,0.2); color: #9A8A8A; font-size: 15px; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; box-sizing: border-box; }
  .dg-generate-btn--active { cursor: pointer; background: linear-gradient(135deg, #e8a09a, #D4726A); color: #fff; box-shadow: 0 4px 20px rgba(212,114,106,0.4); }
  .dg-generate-btn--active:hover { opacity: 0.9; }
  @media (max-width: 900px) { .dg-grid { grid-template-columns: 1fr; } .dg-sidebar { position: static; } }
  @media (max-width: 480px) { .dg-card { border-radius: 16px; padding: 16px; } .dg-generate-btn { font-size: 14px; padding: 13px 20px; } .dg-single-card, .dg-result-card { max-width: 100%; } }
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
