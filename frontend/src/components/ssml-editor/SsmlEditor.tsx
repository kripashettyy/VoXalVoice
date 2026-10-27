'use client'
import { useCallback, useReducer, useState } from 'react'
import TagToolbar from './TagToolbar'
import NodeList from './NodeList'
import SsmlPreview from './SsmlPreview'
import RawSsmlTerminal from './RawSsmlTerminal'
import { serialize, plainText, newId, extractProsodyParams, stripSsmlTags, extractProsodyFromRaw } from '@/lib/ssml'
import { validateSsml } from '@/lib/ssmlValidate'
import type { SsmlNode } from '@/lib/ssml'

interface State {
  nodes: SsmlNode[]
  status: 'idle' | 'generating' | 'done' | 'error'
  audioUrl: string | null
  error: string | null
}

type Action =
  | { type: 'SET_NODES'; payload: SsmlNode[] }
  | { type: 'ADD_NODE'; payload: SsmlNode }
  | { type: 'START' }
  | { type: 'DONE'; payload: string }
  | { type: 'ERROR'; payload: string }
  | { type: 'RESET_AUDIO' }

const INITIAL: State = {
  nodes: [{ id: newId(), kind: 'text', text: '' }],
  status: 'idle', audioUrl: null, error: null,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_NODES':   return { ...state, nodes: action.payload, error: null }
    case 'ADD_NODE':    return { ...state, nodes: [...state.nodes, action.payload] }
    case 'START':       return { ...state, status: 'generating', error: null, audioUrl: null }
    case 'DONE':        return { ...state, status: 'done', audioUrl: action.payload }
    case 'ERROR':       return { ...state, status: 'error', error: action.payload }
    case 'RESET_AUDIO': return { ...state, status: 'idle', audioUrl: null, error: null }
    default:            return state
  }
}

interface Props {
  voiceId: string
  synthesize: (text: string, pitchOverride?: number, speedOverride?: number) => Promise<ArrayBuffer>
}

type Mode = 'visual' | 'raw'

export default function SsmlEditor({ synthesize }: Props) {
  const [state, dispatch] = useReducer(reducer, INITIAL)
  const [mode, setMode] = useState<Mode>('visual')
  const [rawSsml, setRawSsml] = useState('<speak>\n  \n</speak>')

  const visualSsml = serialize(state.nodes)
  const busy = state.status === 'generating'

  // Which SSML gets sent to the engine depends on mode
  const activeSsml = mode === 'raw' ? rawSsml : visualSsml

  const canGenerate = !busy && (() => {
    if (mode === 'raw') return validateSsml(rawSsml).valid
    return plainText(state.nodes).trim().length > 0
  })()

  const switchMode = (next: Mode) => {
    if (next === 'raw' && mode === 'visual') {
      // Push current visual SSML into the raw editor
      setRawSsml(visualSsml)
    }
    dispatch({ type: 'RESET_AUDIO' })
    setMode(next)
  }

  const insertBreak = useCallback((strength: string) => {
    dispatch({ type: 'ADD_NODE', payload: { id: newId(), kind: 'break', tag: { type: 'break', strength: strength as 'weak' | 'medium' | 'strong' } } })
  }, [])

  const insertEmphasis = useCallback(() => {
    dispatch({ type: 'ADD_NODE', payload: { id: newId(), kind: 'emphasis', text: '', tag: { type: 'emphasis', level: 'moderate' } } })
  }, [])

  const insertProsody = useCallback(() => {
    dispatch({ type: 'ADD_NODE', payload: { id: newId(), kind: 'prosody', text: '', tag: { type: 'prosody', pitch: '+10%' } } })
  }, [])

  const clear = useCallback(() => {
    dispatch({ type: 'SET_NODES', payload: [{ id: newId(), kind: 'text', text: '' }] })
    dispatch({ type: 'RESET_AUDIO' })
  }, [])

  const handleGenerate = useCallback(async () => {
    dispatch({ type: 'START' })
    try {
      let text: string
      let pitchOverride: number | undefined
      let speedOverride: number | undefined

      if (mode === 'raw') {
        text = stripSsmlTags(rawSsml)
        const extracted = extractProsodyFromRaw(rawSsml)
        pitchOverride = extracted.pitch
        speedOverride = extracted.speed
      } else {
        text = plainText(state.nodes)
        const extracted = extractProsodyParams(state.nodes)
        pitchOverride = extracted.pitch
        speedOverride = extracted.speed
      }

      const buf = await synthesize(text, pitchOverride, speedOverride)
      const blob = new Blob([buf], { type: 'audio/wav' })
      const url = URL.createObjectURL(blob)
      dispatch({ type: 'DONE', payload: url })
    } catch (err: unknown) {
      dispatch({ type: 'ERROR', payload: err instanceof Error ? err.message : 'Synthesis failed.' })
    }
  }, [mode, rawSsml, state.nodes, synthesize])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 0, background: 'rgba(212,114,106,0.07)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        <ModeBtn active={mode === 'visual'} onClick={() => switchMode('visual')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
          </svg>
          Visual Editor
        </ModeBtn>
        <ModeBtn active={mode === 'raw'} onClick={() => switchMode('raw')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <polyline points="4 17 10 11 4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="19" x2="20" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Raw SSML
        </ModeBtn>
      </div>

      {/* Visual mode */}
      {mode === 'visual' && (
        <>
          <div style={CARD}>
            <TagToolbar
              onInsertBreak={insertBreak}
              onInsertEmphasis={insertEmphasis}
              onInsertProsody={insertProsody}
              onClear={clear}
              disabled={busy}
            />
          </div>
          <div style={CARD}>
            <NodeList nodes={state.nodes} onChange={(n) => dispatch({ type: 'SET_NODES', payload: n })} />
          </div>
          <div style={CARD}>
            <SsmlPreview ssml={visualSsml} />
          </div>
        </>
      )}

      {/* Raw mode */}
      {mode === 'raw' && (
        <RawSsmlTerminal value={rawSsml} onChange={setRawSsml} disabled={busy} />
      )}

      {/* Error */}
      {state.error && (
        <div role="alert" style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.2)', fontSize: 13, color: '#c0392b', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          {state.error}
        </div>
      )}

      {/* Audio result */}
      {state.status === 'done' && state.audioUrl && (
        <div style={{ ...CARD, border: '1px solid rgba(107,174,117,0.25)' }}>
          <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6BAE75', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            Preview
          </p>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio src={state.audioUrl} controls style={{ width: '100%' }} aria-label="SSML audio preview" />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <a href={state.audioUrl} download="ssml_output.wav" style={{ padding: '8px 16px', borderRadius: 9999, background: '#D4726A', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              Download WAV
            </a>
            <button onClick={() => dispatch({ type: 'RESET_AUDIO' })} style={{ padding: '8px 16px', borderRadius: 9999, border: '1.5px solid rgba(212,114,106,0.3)', background: 'transparent', color: '#D4726A', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              Edit
            </button>
          </div>
        </div>
      )}

      {/* Synthesize */}
      <button
        onClick={handleGenerate}
        disabled={!canGenerate}
        aria-disabled={!canGenerate}
        style={{
          padding: '13px 24px', borderRadius: 9999, border: 'none',
          background: canGenerate ? 'linear-gradient(135deg, #e8a09a, #D4726A)' : 'rgba(212,114,106,0.2)',
          color: canGenerate ? '#fff' : '#9A8A8A',
          fontSize: 15, fontWeight: 700, cursor: canGenerate ? 'pointer' : 'not-allowed',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          boxShadow: canGenerate ? '0 4px 16px rgba(212,114,106,0.35)' : 'none',
          transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        {busy ? (
          <>
            <span aria-hidden="true" style={{ width: 16, height: 16, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
            Synthesizing…
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <polygon points="5 3 19 12 5 21 5 3" fill="white"/>
            </svg>
            Synthesize SSML
          </>
        )}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const CARD: React.CSSProperties = {
  background: '#fff', borderRadius: 16, padding: 16,
  border: '1px solid rgba(212,114,106,0.12)',
  boxShadow: '0 2px 8px rgba(212,114,106,0.06)',
}

function ModeBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 14px', borderRadius: 9, border: 'none',
        cursor: 'pointer', fontSize: 13, fontWeight: 600,
        background: active ? '#D4726A' : 'transparent',
        color: active ? '#fff' : '#9A8A8A',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  )
}
