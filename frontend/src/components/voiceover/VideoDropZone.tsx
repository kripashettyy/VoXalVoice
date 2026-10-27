'use client'
import { useRef, useState, useCallback } from 'react'

const ACCEPTED = '.mp4,.mov,.avi,.webm,.mkv'
const ACCEPTED_TYPES = new Set([
  'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska',
])
const MAX_MB = 500

interface Props {
  file: File | null
  onChange: (file: File | null) => void
  disabled?: boolean
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function VideoDropZone({ file, onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validate = useCallback((f: File): string | null => {
    const ext = f.name.includes('.') ? '.' + f.name.split('.').pop()!.toLowerCase() : ''
    if (!ACCEPTED_TYPES.has(f.type) && !ACCEPTED.includes(ext))
      return `Unsupported file type "${ext || f.type}". Use MP4, MOV, AVI, WebM or MKV.`
    if (f.size > MAX_MB * 1024 * 1024)
      return `File is too large (${formatBytes(f.size)}). Maximum is ${MAX_MB} MB.`
    return null
  }, [])

  const handleFile = useCallback((f: File | null) => {
    if (!f) return
    const err = validate(f)
    if (err) { setError(err); return }
    setError(null)
    onChange(f)
  }, [validate, onChange])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (disabled) return
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [disabled, handleFile])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    handleFile(f)
    e.target.value = ''
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload video file"
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() } }}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragging ? '#D4726A' : file ? 'rgba(212,114,106,0.5)' : 'rgba(212,114,106,0.25)'}`,
          borderRadius: 16,
          background: dragging ? 'rgba(212,114,106,0.08)' : file ? 'rgba(212,114,106,0.04)' : '#FAFAFA',
          padding: '28px 20px', textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s', opacity: disabled ? 0.6 : 1, outline: 'none',
        }}
      >
        <input ref={inputRef} type="file" accept={ACCEPTED} onChange={onInputChange} disabled={disabled} style={{ display: 'none' }} aria-hidden="true" />

        {file ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="2" y="4" width="15" height="16" rx="2" fill="rgba(212,114,106,0.15)" stroke="#D4726A" strokeWidth="1.5"/>
              <path d="M17 8.5l5-3v13l-5-3V8.5z" fill="#D4726A" opacity="0.7"/>
            </svg>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1A1A1A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              {file.name}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              {formatBytes(file.size)} · Click to change
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="2" y="4" width="15" height="16" rx="2" stroke="rgba(212,114,106,0.4)" strokeWidth="1.5" strokeDasharray="3 2"/>
              <path d="M17 8.5l5-3v13l-5-3V8.5z" stroke="rgba(212,114,106,0.4)" strokeWidth="1.5"/>
              <path d="M12 10v4M10 12h4" stroke="rgba(212,114,106,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#5A4A4A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                Drop a video here or click to browse
              </p>
              <p style={{ margin: 0, fontSize: 12, color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                MP4, MOV, AVI, WebM, MKV · Max {MAX_MB} MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" style={{ margin: '8px 0 0', fontSize: 12, color: '#c0392b', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          {error}
        </p>
      )}
    </div>
  )
}
