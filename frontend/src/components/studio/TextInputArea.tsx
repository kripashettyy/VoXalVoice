'use client'
import { useEffect, useRef, useState } from 'react'
import { usePlayback } from '@/store/playback'
import ErrorBanner from '@/components/shared/ErrorBanner'
import { extractTextFromDocument } from '@/lib/api/extract'

const MAX_CHARS = 50_000
const SESSION_KEY = 'voxalvoice_text'

export default function TextInputArea({ onTextChange }: { onTextChange?: (t: string) => void }) {
  const [text, setText] = useState('')
  const [truncated, setTruncated] = useState(false)
  const [storageWarn, setStorageWarn] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const warnShown = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const invalidate = usePlayback((s) => s.invalidate)

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY)
      if (saved && typeof saved === 'string') { setText(saved); onTextChange?.(saved) }
    } catch {}
    const clearSession = () => { try { sessionStorage.removeItem(SESSION_KEY) } catch {} }
    window.addEventListener('beforeunload', clearSession)
    return () => window.removeEventListener('beforeunload', clearSession)
  }, [])

  const updateText = (value: string) => {
    let next = value
    let wasTruncated = false
    if (value.length > MAX_CHARS) { next = value.slice(0, MAX_CHARS); wasTruncated = true }
    setText(next)
    setTruncated(wasTruncated)
    invalidate()
    onTextChange?.(next)
    try { sessionStorage.setItem(SESSION_KEY, next) } catch {
      if (!warnShown.current) { warnShown.current = true; setStorageWarn(true) }
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items
    if (items) {
      for (const item of Array.from(items)) {
        if (item.kind !== 'string') { e.preventDefault(); return }
      }
    }
  }

  const handleFileSelected = async (file: File) => {
    setUploadError(null)
    setUploading(true)
    setUploadedFile(null)
    try {
      const result = await extractTextFromDocument(file)
      updateText(result.text)
      setUploadedFile(result.filename)
      if (result.truncated) setTruncated(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to extract text from document.'
      setUploadError(msg)
    } finally {
      setUploading(false)
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelected(file)
  }

  // Drag-and-drop handlers
  const [dragOver, setDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelected(file)
  }

  const pct = Math.round((text.length / MAX_CHARS) * 100)
  const nearLimit = text.length > MAX_CHARS * 0.9

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {truncated && <ErrorBanner message="Text was trimmed to 10,000 characters." onDismiss={() => setTruncated(false)} />}
      {storageWarn && <ErrorBanner message="Your text cannot be saved for this session." onDismiss={() => setStorageWarn(false)} />}
      {uploadError && <ErrorBanner message={uploadError} onDismiss={() => setUploadError(null)} />}

      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <label style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          Text
        </label>

        {/* Upload button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {uploadedFile && !uploading && (
            <span
              title={uploadedFile}
              style={{
                fontSize: 11, color: '#6BAE75', fontWeight: 600,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
            >
              ✓ {uploadedFile}
            </span>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileInput}
            style={{ display: 'none' }}
            aria-label="Upload PDF or DOCX document"
            id="doc-upload-input"
          />
          <label
            htmlFor="doc-upload-input"
            aria-busy={uploading}
            title="Upload a PDF or Word document to extract its text"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 8, cursor: uploading ? 'wait' : 'pointer',
              fontSize: 12, fontWeight: 600, userSelect: 'none',
              background: 'rgba(212,114,106,0.08)',
              color: uploading ? '#9A8A8A' : '#D4726A',
              border: '1.5px solid rgba(212,114,106,0.25)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              transition: 'all 0.15s',
              minHeight: 30,
              pointerEvents: uploading ? 'none' : 'auto',
            }}
          >
            {uploading ? (
              <>
                <span aria-hidden="true" style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(212,114,106,0.3)', borderTopColor: '#D4726A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Extracting…
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload PDF / DOCX
              </>
            )}
          </label>
        </div>
      </div>

      {/* Textarea with drag-and-drop */}
      <textarea
        aria-label="Text to synthesize"
        value={text}
        onChange={(e) => updateText(e.target.value)}
        onPaste={handlePaste}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        placeholder={uploading ? 'Extracting text from document…' : 'Enter text to convert to speech, or upload a PDF / DOCX above…'}
        rows={8}
        disabled={uploading}
        style={{
          width: '100%', padding: '14px 16px',
          border: `1.5px solid ${dragOver ? 'rgba(212,114,106,0.6)' : 'rgba(212,114,106,0.2)'}`,
          borderRadius: 12, fontSize: 15, color: '#1A1A1A',
          resize: 'vertical', fontFamily: 'Georgia, "Times New Roman", serif',
          lineHeight: 1.7, background: dragOver ? 'rgba(212,114,106,0.04)' : '#FFF8FA',
          boxSizing: 'border-box', outline: 'none',
          transition: 'border-color 0.15s, background 0.15s',
          opacity: uploading ? 0.6 : 1,
          cursor: uploading ? 'wait' : 'text',
        }}
        onFocus={(e) => { if (!dragOver) e.currentTarget.style.borderColor = 'rgba(212,114,106,0.5)' }}
        onBlur={(e) => { if (!dragOver) e.currentTarget.style.borderColor = 'rgba(212,114,106,0.2)' }}
      />

      {/* Drag hint */}
      {dragOver && (
        <div style={{
          position: 'absolute', pointerEvents: 'none',
          fontSize: 13, color: '#D4726A', fontWeight: 600, textAlign: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          Drop to extract text
        </div>
      )}

      {/* Char count bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, height: 3, background: 'rgba(212,114,106,0.15)', borderRadius: 2 }}>
          <div style={{
            height: '100%', width: `${pct}%`, borderRadius: 2, transition: 'width 0.2s',
            background: nearLimit ? '#D4726A' : 'rgba(212,114,106,0.5)',
          }} />
        </div>
        <span style={{ fontSize: 12, color: nearLimit ? '#D4726A' : '#9A8A8A', flexShrink: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
        </span>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
