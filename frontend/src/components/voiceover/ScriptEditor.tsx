'use client'

const MAX_CHARS = 50_000

interface Props {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}

export default function ScriptEditor({ value, onChange, disabled }: Props) {
  const remaining   = MAX_CHARS - value.length
  const isNearLimit = remaining < 500
  const isAtLimit   = remaining <= 0

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <label
          htmlFor="voiceover-script"
          style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
        >
          Voice-over Script
        </label>
        <span style={{
          fontSize: 11, fontWeight: 600, transition: 'color 0.2s',
          color: isAtLimit ? '#c0392b' : isNearLimit ? '#D4726A' : '#9A8A8A',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          {value.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
        </span>
      </div>

      <textarea
        id="voiceover-script"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
        disabled={disabled}
        placeholder="Type or paste the script that will be spoken as your video's voice-over…"
        rows={7}
        maxLength={MAX_CHARS}
        aria-label="Voice-over script"
        aria-describedby="voiceover-script-hint"
        style={{
          width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: 140,
          padding: '12px 14px', borderRadius: 12,
          border: `1.5px solid ${isAtLimit ? '#c0392b' : 'rgba(212,114,106,0.25)'}`,
          fontSize: 14, lineHeight: 1.6, color: '#1A1A1A',
          background: disabled ? '#F5F5F5' : '#FEFAFA',
          outline: 'none', transition: 'border-color 0.15s',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          cursor: disabled ? 'not-allowed' : 'text',
        }}
        onFocus={(e) => { if (!disabled) e.target.style.borderColor = '#D4726A' }}
        onBlur={(e) => { e.target.style.borderColor = isAtLimit ? '#c0392b' : 'rgba(212,114,106,0.25)' }}
      />

      <p id="voiceover-script-hint" style={{ margin: '6px 0 0', fontSize: 11, color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        The entire script will be synthesized and replace the video&apos;s original audio.
      </p>
    </div>
  )
}
