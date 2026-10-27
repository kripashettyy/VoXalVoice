'use client'
import type { SsmlNode } from '@/lib/ssml'

interface Props {
  nodes: SsmlNode[]
  onChange: (nodes: SsmlNode[]) => void
}

const LABEL: Record<string, string> = {
  text: 'Text',
  break: 'Pause',
  emphasis: 'Emphasis',
  prosody: 'Prosody',
}

const ACCENT: Record<string, string> = {
  text: '#1A1A1A',
  break: '#6A8ED4',
  emphasis: '#D4726A',
  prosody: '#6BAE75',
}

export default function NodeList({ nodes, onChange }: Props) {
  const update = (id: string, patch: Partial<SsmlNode>) => {
    onChange(nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)))
  }

  const remove = (id: string) => onChange(nodes.filter((n) => n.id !== id))

  const move = (id: string, dir: -1 | 1) => {
    const idx = nodes.findIndex((n) => n.id === id)
    if (idx < 0) return
    const next = [...nodes]
    const swap = idx + dir
    if (swap < 0 || swap >= next.length) return
    ;[next[idx], next[swap]] = [next[swap], next[idx]]
    onChange(next)
  }

  if (nodes.length === 0) {
    return (
      <div style={{ padding: '28px 16px', textAlign: 'center', color: '#9A8A8A', fontSize: 13, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        No nodes yet. Type some text or insert a tag above.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {nodes.map((node, idx) => {
        const accent = ACCENT[node.kind] ?? '#9A8A8A'
        return (
          <div key={node.id} style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            padding: '10px 12px', borderRadius: 12,
            border: `1.5px solid ${accent}22`,
            background: `${accent}08`,
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: accent, minWidth: 60, paddingTop: 2, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              {LABEL[node.kind]}
            </span>

            <div style={{ flex: 1, minWidth: 0 }}>
              {node.kind === 'text' && (
                <textarea
                  value={node.text ?? ''}
                  onChange={(e) => update(node.id, { text: e.target.value })}
                  rows={2}
                  aria-label="Text content"
                  style={{ width: '100%', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, padding: '6px 10px', fontSize: 14, fontFamily: 'Georgia, serif', lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box', outline: 'none', background: '#fff' }}
                />
              )}

              {node.kind === 'break' && (
                <select
                  value={(node.tag as { type: 'break'; strength?: string }).strength ?? 'medium'}
                  onChange={(e) => update(node.id, { tag: { type: 'break', strength: e.target.value as 'weak' | 'medium' | 'strong' } })}
                  aria-label="Pause strength"
                  style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, padding: '5px 10px', fontSize: 13, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#fff', outline: 'none' }}
                >
                  <option value="x-weak">x-weak (~50ms)</option>
                  <option value="weak">weak (~100ms)</option>
                  <option value="medium">medium (~300ms)</option>
                  <option value="strong">strong (~600ms)</option>
                  <option value="x-strong">x-strong (~1s)</option>
                </select>
              )}

              {node.kind === 'emphasis' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <select
                    value={(node.tag as { type: 'emphasis'; level: string }).level}
                    onChange={(e) => update(node.id, { tag: { type: 'emphasis', level: e.target.value as 'moderate' | 'strong' | 'reduced' | 'none' } })}
                    aria-label="Emphasis level"
                    style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, padding: '5px 10px', fontSize: 13, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#fff', outline: 'none' }}
                  >
                    <option value="reduced">Reduced</option>
                    <option value="none">None</option>
                    <option value="moderate">Moderate</option>
                    <option value="strong">Strong</option>
                  </select>
                  <textarea
                    value={node.text ?? ''}
                    onChange={(e) => update(node.id, { text: e.target.value })}
                    rows={2}
                    aria-label="Emphasized text"
                    placeholder="Text to emphasize…"
                    style={{ width: '100%', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, padding: '6px 10px', fontSize: 14, fontFamily: 'Georgia, serif', lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box', outline: 'none', background: '#fff' }}
                  />
                </div>
              )}

              {node.kind === 'prosody' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <ProsodyField label="Pitch" value={(node.tag as { type: 'prosody'; pitch?: string }).pitch ?? ''} placeholder="e.g. +10% or high"
                      onChange={(v) => update(node.id, { tag: { ...(node.tag as object), type: 'prosody', pitch: v || undefined } as { type: 'prosody'; pitch?: string; rate?: string; volume?: string } })} />
                    <ProsodyField label="Rate" value={(node.tag as { type: 'prosody'; rate?: string }).rate ?? ''} placeholder="e.g. slow or 80%"
                      onChange={(v) => update(node.id, { tag: { ...(node.tag as object), type: 'prosody', rate: v || undefined } as { type: 'prosody'; pitch?: string; rate?: string; volume?: string } })} />
                    <ProsodyField label="Volume" value={(node.tag as { type: 'prosody'; volume?: string }).volume ?? ''} placeholder="e.g. loud or +6dB"
                      onChange={(v) => update(node.id, { tag: { ...(node.tag as object), type: 'prosody', volume: v || undefined } as { type: 'prosody'; pitch?: string; rate?: string; volume?: string } })} />
                  </div>
                  <textarea
                    value={node.text ?? ''}
                    onChange={(e) => update(node.id, { text: e.target.value })}
                    rows={2}
                    aria-label="Prosody text"
                    placeholder="Text to apply prosody to…"
                    style={{ width: '100%', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, padding: '6px 10px', fontSize: 14, fontFamily: 'Georgia, serif', lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box', outline: 'none', background: '#fff' }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
              <IconBtn aria-label="Move up" onClick={() => move(node.id, -1)} disabled={idx === 0}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>
              </IconBtn>
              <IconBtn aria-label="Move down" onClick={() => move(node.id, 1)} disabled={idx === nodes.length - 1}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
              </IconBtn>
              <IconBtn aria-label="Remove node" onClick={() => remove(node.id)} style={{ color: '#c0392b' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </IconBtn>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ProsodyField({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (v: string) => void }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 90 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: '#9A8A8A', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: 7, padding: '5px 8px', fontSize: 12, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', outline: 'none', background: '#fff', width: '100%', boxSizing: 'border-box' }} />
    </label>
  )
}

function IconBtn({ children, style, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} style={{ background: 'none', border: 'none', cursor: props.disabled ? 'default' : 'pointer', padding: 4, borderRadius: 6, color: props.disabled ? '#ccc' : '#9A8A8A', lineHeight: 1, transition: 'color 0.1s', ...style }}>
      {children}
    </button>
  )
}
