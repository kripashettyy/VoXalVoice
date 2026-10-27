'use client'

interface Props {
  onInsertBreak: (strength: string) => void
  onInsertEmphasis: () => void
  onInsertProsody: () => void
  onClear: () => void
  disabled?: boolean
}

const BTN: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  padding: '6px 12px', borderRadius: 8, border: '1.5px solid rgba(212,114,106,0.25)',
  background: 'rgba(212,114,106,0.07)', color: '#D4726A',
  fontSize: 12, fontWeight: 600, cursor: 'pointer',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  transition: 'all 0.15s', whiteSpace: 'nowrap',
}

const BREAKS = ['weak', 'medium', 'strong'] as const

export default function TagToolbar({ onInsertBreak, onInsertEmphasis, onInsertProsody, onClear, disabled }: Props) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', marginRight: 2 }}>
        Insert
      </span>

      {BREAKS.map((s) => (
        <button key={s} onClick={() => onInsertBreak(s)} disabled={disabled} style={BTN}
          aria-label={`Insert ${s} pause`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="6" y1="8" x2="6" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
            <line x1="18" y1="8" x2="18" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
          </svg>
          Pause ({s})
        </button>
      ))}

      <button onClick={onInsertEmphasis} disabled={disabled} style={BTN} aria-label="Insert emphasis on selected text">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 4h8a4 4 0 0 1 0 8H6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M6 12h9a4 4 0 0 1 0 8H6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
        Emphasis
      </button>

      <button onClick={onInsertProsody} disabled={disabled} style={BTN} aria-label="Insert prosody on selected text">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
        </svg>
        Prosody
      </button>

      <div style={{ flex: 1 }} />

      <button onClick={onClear} disabled={disabled} style={{ ...BTN, color: '#9A8A8A', borderColor: 'rgba(0,0,0,0.1)', background: 'transparent' }}
        aria-label="Clear all nodes">
        Clear
      </button>
    </div>
  )
}
