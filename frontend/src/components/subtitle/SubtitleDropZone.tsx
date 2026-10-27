'use client'
import { useCallback, useRef, useState } from 'react'

interface Props {
  file: File | null
  onChange: (f: File | null) => void
  disabled?: boolean
}

const ACCEPTED = ['.srt', '.vtt']

export default function SubtitleDropZone({ file, onChange, disabled }: Props) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const accept = (f: File) => {
    const ext = '.' + f.name.split('.').pop()?.toLowerCase()
    if (!ACCEPTED.includes(ext)) {
      alert(`Only .srt and .vtt files are supported.`)
      return
    }
    onChange(f)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (disabled) return
    const f = e.dataTransfer.files[0]
    if (f) accept(f)
  }, [disabled])

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); if (!disabled) setDragging(true) }
  const onDragLeave = () => setDragging(false)

  if (file) {
    return (
      <div style={{
        borderRadius: 16, border: '1.5px solid rgba(212,114,106,0.3)',
        background: 'rgba(212,114,106,0.04)', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(212,114,106,0.2), rgba(212,114,106,0.1))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#D4726A" strokeWidth="1.8"/>
            <polyline points="14 2 14 8 20 8" stroke="#D4726A" strokeWidth="1.8"/>
            <line x1="8" y1="13" x2="16" y2="13" stroke="#D4726A" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="8" y1="17" x2="12" y2="17" stroke="#D4726A" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            {file.name}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
        {!disabled && (
          <button
            onClick={() => onChange(null)}
            aria-label="Remove subtitle file"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9A8A8A', lineHeight: 1, flexShrink: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload subtitle file — click or drop .srt / .vtt"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) inputRef.current?.click() }}
      style={{
        borderRadius: 16,
        border: `2px dashed ${dragging ? '#D4726A' : 'rgba(212,114,106,0.3)'}`,
        background: dragging ? 'rgba(212,114,106,0.06)' : 'rgba(212,114,106,0.02)',
        padding: '28px 20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s', opacity: disabled ? 0.5 : 1,
        outline: 'none',
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: 'linear-gradient(135deg, rgba(212,114,106,0.15), rgba(212,114,106,0.08))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }} aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#D4726A" strokeWidth="1.8"/>
          <polyline points="14 2 14 8 20 8" stroke="#D4726A" strokeWidth="1.8"/>
          <line x1="12" y1="18" x2="12" y2="12" stroke="#D4726A" strokeWidth="1.8" strokeLinecap="round"/>
          <polyline points="9 15 12 12 15 15" stroke="#D4726A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1A1A1A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          Drop your subtitle file here
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          .srt or .vtt · max 2 MB
        </p>
      </div>
      <span style={{
        padding: '6px 16px', borderRadius: 9999,
        background: 'rgba(212,114,106,0.1)', border: '1px solid rgba(212,114,106,0.2)',
        fontSize: 12, fontWeight: 600, color: '#D4726A',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        Browse file
      </span>
      <input
        ref={inputRef}
        type="file"
        accept=".srt,.vtt"
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) accept(f); e.target.value = '' }}
      />
    </div>
  )
}
