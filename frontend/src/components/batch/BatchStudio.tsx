'use client'
import { useCallback, useReducer, useRef, useState } from 'react'
import VoiceoverVoiceSelector from '@/components/voiceover/VoiceoverVoiceSelector'
import VoiceoverParamPanel from '@/components/voiceover/VoiceoverParamPanel'
import VoiceoverProgress from '@/components/voiceover/VoiceoverProgress'
import { generateBatch } from '@/lib/api/batch'
import type { BatchResult } from '@/types/batch'

interface Params {
  pitch: number; speed: number; volume: number
  warmth: number; clarity: number
  tonePreset: 'neutral' | 'warm' | 'crisp'; naturalFlow: boolean
}

interface State {
  file: File | null
  voiceId: string
  params: Params
  status: 'idle' | 'generating' | 'done' | 'error'
  progress: number
  result: BatchResult | null
  error: string | null
}

type Action =
  | { type: 'SET_FILE'; payload: File | null }
  | { type: 'SET_VOICE'; payload: string }
  | { type: 'SET_PARAM'; key: keyof Params; value: Params[keyof Params] }
  | { type: 'START' }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'DONE'; payload: BatchResult }
  | { type: 'ERROR'; payload: string }
  | { type: 'RESET' }

const DEFAULT_PARAMS: Params = { pitch: 1.0, speed: 1.0, volume: 0.8, warmth: 0.0, clarity: 0.0, tonePreset: 'neutral', naturalFlow: true }
const INITIAL: State = { file: null, voiceId: 'en-US-AriaNeural', params: DEFAULT_PARAMS, status: 'idle', progress: 0, result: null, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FILE':  return { ...state, file: action.payload, error: null }
    case 'SET_VOICE': return { ...state, voiceId: action.payload }
    case 'SET_PARAM': return { ...state, params: { ...state.params, [action.key]: action.value } }
    case 'START':     return { ...state, status: 'generating', progress: 0, error: null, result: null }
    case 'SET_PROGRESS': return { ...state, progress: action.payload }
    case 'DONE':      return { ...state, status: 'done', progress: 100, result: action.payload }
    case 'ERROR':     return { ...state, status: 'error', error: action.payload }
    case 'RESET': {
      if (state.result?.blobUrl) URL.revokeObjectURL(state.result.blobUrl)
      return { ...INITIAL, voiceId: state.voiceId, params: state.params }
    }
    default: return state
  }
}

export default function BatchStudio() {
  const [state, dispatch] = useReducer(reducer, INITIAL)
  const abortRef = useRef<AbortController | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  const busy = state.status === 'generating'
  const canGenerate = !busy && !!state.file

  const handleFileChange = useCallback((f: File | null) => dispatch({ type: 'SET_FILE', payload: f }), [])

  const handleGenerate = useCallback(async () => {
    const { file, voiceId, params } = stateRef.current
    if (!file) return
    abortRef.current = new AbortController()
    dispatch({ type: 'START' })
    try {
      const result = await generateBatch(
        { file, voiceId, pitch: params.pitch, speed: params.speed, volume: params.volume, tonePreset: params.tonePreset, naturalFlow: params.naturalFlow, warmth: params.warmth, clarity: params.clarity },
        (pct) => dispatch({ type: 'SET_PROGRESS', payload: pct }),
        abortRef.current.signal,
      )
      dispatch({ type: 'DONE', payload: result })
    } catch (err: unknown) {
      dispatch({ type: 'ERROR', payload: err instanceof Error ? err.message : 'Something went wrong.' })
    }
  }, [])

  const handleCancel = useCallback(() => { abortRef.current?.abort(); dispatch({ type: 'ERROR', payload: 'Cancelled.' }) }, [])
  const handleReset = useCallback(() => dispatch({ type: 'RESET' }), [])

  if (state.status === 'generating') {
    return (
      <>
        <style>{STYLES}</style>
        <div className="bt-card bt-single-card">
          <VoiceoverProgress progress={state.progress} onCancel={handleCancel} />
        </div>
      </>
    )
  }

  if (state.status === 'done' && state.result) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="bt-card bt-single-card bt-result-card">
          <BatchResultView result={state.result} onReset={handleReset} />
        </div>
      </>
    )
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="bt-grid">
        <div className="bt-main-col">
          <section className="bt-card" aria-label="File upload">
            <Label>1 — Upload your file</Label>
            <BatchDropZone file={state.file} onChange={handleFileChange} disabled={busy} />
            <FormatGuide />
          </section>

          {state.error && (
            <div role="alert" style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.2)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10" stroke="#c0392b" strokeWidth="1.8"/>
                <path d="M12 8v4M12 16h.01" stroke="#c0392b" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p style={{ margin: 0, fontSize: 13, color: '#c0392b', lineHeight: 1.5, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>{state.error}</p>
            </div>
          )}

          <button onClick={handleGenerate} disabled={!canGenerate} aria-disabled={!canGenerate}
            className={`bt-generate-btn${canGenerate ? ' bt-generate-btn--active' : ''}`}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Generate ZIP
          </button>
        </div>

        <aside className="bt-sidebar">
          <section className="bt-card" aria-label="Voice">
            <Label>2 — Voice</Label>
            <VoiceoverVoiceSelector voiceId={state.voiceId} onChange={(id) => dispatch({ type: 'SET_VOICE', payload: id })} disabled={busy} />
          </section>
          <section className="bt-card" aria-label="Parameters">
            <Label>3 — Parameters</Label>
            <VoiceoverParamPanel params={state.params} onChange={(key, val) => dispatch({ type: 'SET_PARAM', key, value: val as Params[keyof Params] })} disabled={busy} />
          </section>
        </aside>
      </div>
    </>
  )
}

function BatchDropZone({ file, onChange, disabled }: { file: File | null; onChange: (f: File | null) => void; disabled?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const accept = (f: File) => {
    const ext = '.' + (f.name.split('.').pop()?.toLowerCase() ?? '')
    if (!['.txt', '.csv'].includes(ext)) { alert('Only .txt and .csv files are supported.'); return }
    onChange(f)
  }

  if (file) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, border: '1.5px solid rgba(212,114,106,0.25)', background: 'rgba(212,114,106,0.04)' }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4726A" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>{file.name}</p>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>{(file.size / 1024).toFixed(1)} KB</p>
      </div>
      {!disabled && <button onClick={() => onChange(null)} aria-label="Remove file" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A8A8A', padding: 4 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>}
    </div>
  )

  return (
    <div role="button" tabIndex={disabled ? -1 : 0}
      aria-label="Upload .txt or .csv file"
      onDrop={(e) => { e.preventDefault(); setDragging(false); if (!disabled) { const f = e.dataTransfer.files[0]; if (f) accept(f) } }}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) inputRef.current?.click() }}
      style={{ borderRadius: 14, border: `2px dashed ${dragging ? '#D4726A' : 'rgba(212,114,106,0.3)'}`, background: dragging ? 'rgba(212,114,106,0.05)' : 'rgba(212,114,106,0.02)', padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, outline: 'none' }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4726A" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 12 15 15"/>
      </svg>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1A1A1A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>Drop your file here</p>
      <p style={{ margin: 0, fontSize: 12, color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>.txt or .csv · max 1 MB · max 200 entries</p>
      <span style={{ padding: '5px 14px', borderRadius: 9999, background: 'rgba(212,114,106,0.1)', border: '1px solid rgba(212,114,106,0.2)', fontSize: 12, fontWeight: 600, color: '#D4726A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>Browse</span>
      <input ref={inputRef} type="file" accept=".txt,.csv" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) accept(f); e.target.value = '' }} />
    </div>
  )
}

function FormatGuide() {
  return (
    <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 10, background: 'rgba(212,114,106,0.04)', border: '1px solid rgba(212,114,106,0.1)' }}>
      <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>Format</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: '#1A1A1A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>.txt</p>
          <div style={{ fontFamily: '"Fira Code", monospace', fontSize: 11, color: '#5A4A4A', lineHeight: 1.8, background: '#fff', borderRadius: 7, padding: '8px 10px', border: '1px solid rgba(212,114,106,0.1)' }}>
            Hello, welcome.<br />This is line two.<br />Each line = one WAV.
          </div>
        </div>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: '#1A1A1A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>.csv</p>
          <div style={{ fontFamily: '"Fira Code", monospace', fontSize: 11, color: '#5A4A4A', lineHeight: 1.8, background: '#fff', borderRadius: 7, padding: '8px 10px', border: '1px solid rgba(212,114,106,0.1)' }}>
            Hello, welcome.<br />This is line two.<br />First column used.
          </div>
        </div>
      </div>
    </div>
  )
}

function BatchResultView({ result, onReset }: { result: BatchResult; onReset: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '24px 0' }}>
      <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #e8a09a, #D4726A)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(212,114,106,0.35)' }} aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700, color: '#1A1A1A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>ZIP Ready!</h2>
        <p style={{ margin: 0, fontSize: 13, color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          {result.successCount} of {result.entryCount} entries synthesized successfully.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { label: `${result.entryCount} entries` },
          { label: `${result.successCount} WAVs` },
          { label: `${(result.sizeBytes / 1024).toFixed(0)} KB` },
        ].map(({ label }) => (
          <span key={label} style={{ padding: '5px 12px', borderRadius: 9999, background: 'rgba(212,114,106,0.08)', fontSize: 12, fontWeight: 500, color: '#5A4A4A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>{label}</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, width: '100%' }}>
        <a href={result.blobUrl} download={result.filename} style={{ flex: 1, padding: '12px 20px', borderRadius: 9999, background: '#D4726A', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', boxShadow: '0 2px 12px rgba(212,114,106,0.35)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download ZIP
        </a>
        <button onClick={onReset} style={{ flex: 1, padding: '12px 20px', borderRadius: 9999, border: '1.5px solid rgba(212,114,106,0.3)', background: 'transparent', color: '#D4726A', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          New Batch
        </button>
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', paddingBottom: 10, borderBottom: '1px solid rgba(212,114,106,0.12)' }}>{children}</p>
}

const STYLES = `
  .bt-card { background: #fff; border-radius: 20px; padding: 20px; border: 1px solid rgba(212,114,106,0.12); box-shadow: 0 2px 12px rgba(212,114,106,0.06); }
  .bt-grid { display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start; }
  .bt-main-col { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
  .bt-sidebar { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 84px; }
  .bt-single-card { max-width: 480px; width: 100%; margin: 0 auto; box-sizing: border-box; }
  .bt-result-card { max-width: 560px; }
  .bt-generate-btn { width: 100%; padding: 14px 24px; border-radius: 9999px; border: none; cursor: not-allowed; background: rgba(212,114,106,0.2); color: #9A8A8A; font-size: 15px; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10; box-sizing: border-box; }
  .bt-generate-btn--active { cursor: pointer; background: linear-gradient(135deg, #e8a09a, #D4726A); color: #fff; box-shadow: 0 4px 20px rgba(212,114,106,0.4); }
  .bt-generate-btn--active:hover { opacity: 0.9; }
  @media (max-width: 768px) { .bt-grid { grid-template-columns: 1fr; } .bt-sidebar { position: static; } .bt-single-card, .bt-result-card { max-width: 100%; } }
  @media (max-width: 480px) { .bt-card { border-radius: 16px; padding: 16px; } }
`
