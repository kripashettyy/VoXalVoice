'use client'
import { useEffect, useRef, useState } from 'react'
import { validateSsml } from '@/lib/ssmlValidate'

interface Props {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}

const PLACEHOLDER = `<speak>
  Hello, <break strength="medium"/> world.
  <emphasis level="strong">This is important.</emphasis>
  <prosody pitch="+10%" rate="slow">Speak slowly.</prosody>
</speak>`

const SNIPPETS = [
  { label: '<break/>', insert: '<break strength="medium"/>' },
  { label: '<emphasis>', insert: '<emphasis level="strong">text</emphasis>' },
  { label: '<prosody>', insert: '<prosody pitch="+10%">text</prosody>' },
  { label: '<p>', insert: '<p>paragraph text</p>' },
  { label: '&amp;', insert: '&amp;' },
]

export default function RawSsmlTerminal({ value, onChange, disabled }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [focused, setFocused] = useState(false)
  const validation = validateSsml(value)
  const hasContent = value.trim().length > 0

  const insertSnippet = (snippet: string) => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const next = value.slice(0, start) + snippet + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + snippet.length, start + snippet.length)
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      insertSnippet('  ')
    }
  }

  // Line count for gutter
  const lines = value.split('\n')
  const lineCount = Math.max(lines.length, 8)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Terminal header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
        background: '#2b2b2b', borderRadius: '12px 12px 0 0',
        borderBottom: '1px solid #444',
      }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56', display: 'inline-block' }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f', display: 'inline-block' }} />
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: '#666', fontFamily: '"Fira Code", monospace' }}>ssml</span>
      </div>

      {/* Snippet bar */}
      <div style={{
        display: 'flex', gap: 6, flexWrap: 'wrap', padding: '7px 12px',
        background: '#222', borderBottom: '1px solid #333',
      }}>
        <span style={{ fontSize: 10, color: '#555', fontFamily: 'monospace', alignSelf: 'center', marginRight: 4 }}>INSERT</span>
        {SNIPPETS.map((s) => (
          <button
            key={s.label}
            onClick={() => insertSnippet(s.insert)}
            disabled={disabled}
            style={{
              padding: '3px 9px', borderRadius: 5, border: '1px solid #444',
              background: '#2d2d2d', color: '#e8b86d',
              fontSize: 11, fontFamily: '"Fira Code", "Courier New", monospace',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'background 0.1s',
            }}
            onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = '#3a3a3a' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#2d2d2d' }}
          >
            {s.label}
          </button>
        ))}
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: '#555', fontFamily: 'monospace', alignSelf: 'center' }}>Tab = 2 spaces</span>
      </div>

      {/* Editor area: line gutter + textarea */}
      <div style={{
        display: 'flex', background: '#1e1e1e',
        borderLeft: `1px solid ${focused ? '#D4726A' : '#333'}`,
        borderRight: `1px solid ${focused ? '#D4726A' : '#333'}`,
        borderBottom: `1px solid ${focused ? '#D4726A' : '#333'}`,
        borderTop: 'none',
        borderRadius: '0 0 12px 12px',
        overflow: 'hidden',
        transition: 'border-color 0.15s',
      }}>
        {/* Line numbers */}
        <div
          aria-hidden="true"
          style={{
            padding: '14px 0', minWidth: 40, textAlign: 'right',
            background: '#252525', borderRight: '1px solid #333',
            userSelect: 'none', flexShrink: 0,
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} style={{ padding: '0 10px', fontSize: 12, lineHeight: '1.7', color: '#555', fontFamily: '"Fira Code", monospace' }}>
              {i + 1}
            </div>
          ))}
        </div>

        {/* The actual textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder={PLACEHOLDER}
          spellCheck={false}
          aria-label="Raw SSML editor"
          style={{
            flex: 1, padding: '14px 16px', border: 'none', outline: 'none',
            background: 'transparent',
            color: '#d4d4d4', caretColor: '#D4726A',
            fontSize: 13, fontFamily: '"Fira Code", "Cascadia Code", "Courier New", monospace',
            lineHeight: 1.7, resize: 'none',
            minHeight: `${lineCount * 1.7 * 13 + 28}px`,
            tabSize: 2,
          }}
        />
      </div>

      {/* Validation feedback */}
      <div style={{
        padding: '8px 14px', borderRadius: '0 0 12px 12px',
        background: hasContent
          ? validation.valid ? 'rgba(107,174,117,0.08)' : 'rgba(192,57,43,0.08)'
          : '#1e1e1e',
        borderLeft: hasContent
          ? `1px solid ${validation.valid ? 'rgba(107,174,117,0.3)' : 'rgba(192,57,43,0.3)'}`
          : '1px solid #333',
        borderRight: hasContent
          ? `1px solid ${validation.valid ? 'rgba(107,174,117,0.3)' : 'rgba(192,57,43,0.3)'}`
          : '1px solid #333',
        borderBottom: hasContent
          ? `1px solid ${validation.valid ? 'rgba(107,174,117,0.3)' : 'rgba(192,57,43,0.3)'}`
          : '1px solid #333',
        borderTop: 'none',
        display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap',
        marginTop: -1,
      }}>
        {!hasContent && (
          <span style={{ fontSize: 11, color: '#555', fontFamily: 'monospace' }}>
            ▸ Type your SSML above. Must start with &lt;speak&gt; and end with &lt;/speak&gt;.
          </span>
        )}
        {hasContent && validation.valid && (
          <span style={{ fontSize: 11, color: '#6BAE75', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Valid SSML — ready to synthesize
          </span>
        )}
        {hasContent && !validation.valid && validation.errors.map((err, i) => (
          <span key={i} style={{ fontSize: 11, color: '#e07070', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 5, width: '100%' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {err}
          </span>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#555', fontFamily: 'monospace' }}>
          {value.length} chars · {lines.length} lines
        </span>
      </div>
    </div>
  )
}
