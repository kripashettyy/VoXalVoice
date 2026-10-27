'use client'
import { useState } from 'react'
import VoiceoverVoiceSelector from '@/components/voiceover/VoiceoverVoiceSelector'
import VoiceoverParamPanel from '@/components/voiceover/VoiceoverParamPanel'
import type { DialogueTurn, DialogueTurnParams } from '@/types/dialogue'

const SPEAKER_COLORS = ['#D4726A', '#6A8ED4', '#6BAE75', '#C07AD4', '#D4A76A', '#6AD4C8']

interface Props {
  turn: DialogueTurn
  index: number
  total: number
  disabled: boolean
  onChange: (id: string, patch: Partial<DialogueTurn>) => void
  onRemove: (id: string) => void
  onMove: (id: string, dir: -1 | 1) => void
}

export default function DialogueTurnCard({ turn, index, total, disabled, onChange, onRemove, onMove }: Props) {
  const [expanded, setExpanded] = useState(false)
  const color = SPEAKER_COLORS[index % SPEAKER_COLORS.length]

  const patchParam = <K extends keyof DialogueTurnParams>(key: K, value: DialogueTurnParams[K]) => {
    onChange(turn.id, { params: { ...turn.params, [key]: value } })
  }

  return (
    <div style={{
      borderRadius: 16, border: `1.5px solid ${color}22`,
      background: `${color}06`, overflow: 'hidden',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#fff',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          {index + 1}
        </div>

        <input
          value={turn.speaker}
          onChange={(e) => onChange(turn.id, { speaker: e.target.value })}
          disabled={disabled}
          placeholder="Speaker name…"
          aria-label={`Speaker name for turn ${index + 1}`}
          style={{
            flex: 1, border: 'none', background: 'transparent',
            fontSize: 13, fontWeight: 700, color: '#1A1A1A',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            outline: 'none', minWidth: 0,
          }}
        />

        <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <IconBtn aria-label="Move turn up" onClick={() => onMove(turn.id, -1)} disabled={disabled || index === 0} style={{ padding: 3 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 4L5 11h4v9h6v-9h4L12 4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill={disabled || index === 0 ? 'none' : 'currentColor'} opacity={disabled || index === 0 ? 0.3 : 1}/>
              </svg>
            </IconBtn>
            <IconBtn aria-label="Move turn down" onClick={() => onMove(turn.id, 1)} disabled={disabled || index === total - 1} style={{ padding: 3 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 20l7-7h-4V4H9v9H5l7 7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill={disabled || index === total - 1 ? 'none' : 'currentColor'} opacity={disabled || index === total - 1 ? 0.3 : 1}/>
              </svg>
            </IconBtn>
          </div>

          <div style={{ width: 1, height: 28, background: 'rgba(212,114,106,0.15)', margin: '0 2px' }} />

          <IconBtn
            aria-label={expanded ? 'Collapse voice settings' : 'Expand voice settings'}
            onClick={() => setExpanded((v) => !v)}
            style={{
              background: expanded ? 'rgba(212,114,106,0.12)' : 'transparent',
              borderRadius: 7, padding: '5px 6px', color: expanded ? '#D4726A' : '#9A8A8A',
            }}
            title="Voice & parameter settings"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="9" cy="6" r="2.5" fill="currentColor"/>
              <circle cx="15" cy="12" r="2.5" fill="currentColor"/>
              <circle cx="9" cy="18" r="2.5" fill="currentColor"/>
            </svg>
          </IconBtn>

          <IconBtn
            aria-label={`Remove turn ${index + 1}`}
            onClick={() => onRemove(turn.id)}
            disabled={disabled}
            style={{ color: '#c0392b', padding: '5px 6px', borderRadius: 7 }}
            title="Remove this turn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </IconBtn>
        </div>
      </div>

      {/* Text area */}
      <div style={{ padding: '0 14px 12px' }}>
        <textarea
          value={turn.text}
          onChange={(e) => onChange(turn.id, { text: e.target.value })}
          disabled={disabled}
          rows={3}
          placeholder="What does this speaker say…"
          aria-label={`Dialogue text for turn ${index + 1}`}
          style={{
            width: '100%', padding: '10px 12px', border: '1.5px solid rgba(0,0,0,0.1)',
            borderRadius: 10, fontSize: 14, fontFamily: 'Georgia, serif',
            lineHeight: 1.6, resize: 'vertical', background: '#fff',
            boxSizing: 'border-box', outline: 'none',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = color }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <span style={{ fontSize: 11, color: turn.text.length > 2000 ? '#c0392b' : '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            {turn.text.length} / 2000
          </span>
        </div>
      </div>

      {/* Expandable voice settings */}
      {expanded && (
        <div style={{ padding: '12px 14px 14px', borderTop: `1px solid ${color}22`, background: '#fff', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>Voice</p>
            <VoiceoverVoiceSelector voiceId={turn.voiceId} onChange={(id) => onChange(turn.id, { voiceId: id })} disabled={disabled} />
          </div>
          <div>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>Parameters</p>
            <VoiceoverParamPanel params={turn.params} onChange={patchParam} disabled={disabled} />
          </div>
        </div>
      )}
    </div>
  )
}

function IconBtn({ children, style, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} style={{
      background: 'none', border: 'none', cursor: props.disabled ? 'default' : 'pointer',
      padding: 5, borderRadius: 6, color: props.disabled ? '#ddd' : '#9A8A8A',
      lineHeight: 1, transition: 'color 0.1s', ...style,
    }}>
      {children}
    </button>
  )
}
