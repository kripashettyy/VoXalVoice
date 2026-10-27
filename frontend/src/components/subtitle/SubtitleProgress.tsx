'use client'

interface Props {
  progress: number
  onCancel: () => void
}

export default function SubtitleProgress({ progress, onCancel }: Props) {
  const pct = Math.min(100, Math.max(0, Math.round(progress)))

  const label =
    pct < 30 ? 'Uploading subtitle file…' :
    pct < 65 ? 'Synthesizing each cue…' :
    pct < 90 ? 'Assembling timed audio…' :
    pct < 98 ? 'Finalizing WAV…' :
               'Almost done!'

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Subtitle audio generation ${pct}% complete: ${label}`}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '32px 24px' }}
    >
      <div style={{ position: 'relative', width: 72, height: 72 }} aria-hidden="true">
        <svg width="72" height="72" viewBox="0 0 72 72" style={{ position: 'absolute', inset: 0 }}>
          <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(212,114,106,0.15)" strokeWidth="4"/>
          <circle cx="36" cy="36" r="30" fill="none" stroke="#D4726A" strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 30}`}
            strokeDashoffset={`${2 * Math.PI * 30 * (1 - pct / 100)}`}
            transform="rotate(-90 36 36)"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#D4726A" strokeWidth="1.8"/>
            <polyline points="14 2 14 8 20 8" stroke="#D4726A" strokeWidth="1.8"/>
            <line x1="8" y1="13" x2="16" y2="13" stroke="#D4726A" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      <span style={{ fontSize: 28, fontWeight: 800, color: '#D4726A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', letterSpacing: '-0.5px' }}>
        {pct}%
      </span>

      <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#5A4A4A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', textAlign: 'center' }}>
        {label}
      </p>

      <div style={{ width: '100%', height: 6, background: 'rgba(212,114,106,0.15)', borderRadius: 999 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #e8a09a, #D4726A)', borderRadius: 999, transition: 'width 0.4s ease' }} />
      </div>

      <p style={{ margin: 0, fontSize: 11, color: '#9A8A8A', textAlign: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        Each subtitle cue is synthesized individually — may take a moment.
      </p>

      <button
        onClick={onCancel}
        style={{
          padding: '8px 20px', borderRadius: 9999, cursor: 'pointer',
          background: 'transparent', border: '1.5px solid rgba(212,114,106,0.3)',
          fontSize: 13, fontWeight: 500, color: '#9A8A8A',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#D4726A'; e.currentTarget.style.color = '#D4726A' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(212,114,106,0.3)'; e.currentTarget.style.color = '#9A8A8A' }}
      >
        Cancel
      </button>
    </div>
  )
}
