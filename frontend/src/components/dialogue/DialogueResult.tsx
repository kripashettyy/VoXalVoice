'use client'
import type { DialogueResult } from '@/types/dialogue'

interface Props {
  result: DialogueResult
  onReset: () => void
}

function fmt(secs: number) {
  if (!secs) return '—'
  const m = Math.floor(secs / 60), s = Math.floor(secs % 60)
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}
function fmtBytes(b: number) {
  return b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`
}

export default function DialogueResult({ result, onReset }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '24px 0' }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'linear-gradient(135deg, #e8a09a, #D4726A)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(212,114,106,0.35)',
      }} aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700, color: '#1A1A1A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          Dialogue Ready!
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          {result.turnCount} speaker turn{result.turnCount !== 1 ? 's' : ''} synthesized successfully.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { label: `${result.turnCount} turns`, icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
          { label: fmt(result.duration), icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2' },
          { label: fmtBytes(result.sizeBytes), icon: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' },
        ].map(({ label, icon }) => (
          <span key={label} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', borderRadius: 9999, background: 'rgba(212,114,106,0.08)',
            fontSize: 12, fontWeight: 500, color: '#5A4A4A',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4726A" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d={icon}/>
            </svg>
            {label}
          </span>
        ))}
      </div>

      <div style={{ width: '100%', borderRadius: 16, padding: 16, background: 'rgba(212,114,106,0.04)', border: '1px solid rgba(212,114,106,0.15)', boxSizing: 'border-box' }}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio src={result.blobUrl} controls style={{ width: '100%', display: 'block' }} aria-label="Dialogue audio preview" />
      </div>

      <div style={{ display: 'flex', gap: 10, width: '100%', flexWrap: 'wrap' }}>
        <a href={result.blobUrl} download={result.filename} style={{
          flex: 1, minWidth: 140, padding: '12px 20px', borderRadius: 9999,
          background: '#D4726A', color: '#fff', fontSize: 14, fontWeight: 600,
          textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          boxShadow: '0 2px 12px rgba(212,114,106,0.35)', transition: 'opacity 0.15s',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download WAV
        </a>
        <button onClick={onReset} style={{
          flex: 1, minWidth: 140, padding: '12px 20px', borderRadius: 9999, cursor: 'pointer',
          background: 'transparent', border: '1.5px solid rgba(212,114,106,0.3)',
          fontSize: 14, fontWeight: 600, color: '#D4726A',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', transition: 'all 0.15s',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212,114,106,0.08)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          New Dialogue
        </button>
      </div>
    </div>
  )
}
