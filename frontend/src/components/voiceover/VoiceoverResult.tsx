'use client'
import type { VoiceoverResult } from '@/types/voiceover'

interface Props {
  result: VoiceoverResult
  onReset: () => void
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDuration(secs: number): string {
  if (!secs || secs <= 0) return '—'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export default function VoiceoverResult({ result, onReset }: Props) {
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
          Voice-over Ready!
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          Your video has been re-voiced successfully.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {([
          {
            label: result.filename,
            svg: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2" y="4" width="15" height="16" rx="2" stroke="#D4726A" strokeWidth="1.8"/><path d="M17 8.5l5-3v13l-5-3V8.5z" fill="#D4726A"/></svg>,
          },
          {
            label: formatDuration(result.duration),
            svg: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="#D4726A" strokeWidth="1.8"/><polyline points="12 7 12 12 15 15" stroke="#D4726A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
          },
          {
            label: formatBytes(result.sizeBytes),
            svg: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="#D4726A" strokeWidth="1.8"/></svg>,
          },
        ] as { label: string; svg: React.ReactNode }[]).map(({ svg, label }) => (
          <span key={label} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', borderRadius: 9999, background: 'rgba(212,114,106,0.08)',
            fontSize: 12, fontWeight: 500, color: '#5A4A4A',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>
            {svg}
            <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
          </span>
        ))}
      </div>

      <div style={{ width: '100%', borderRadius: 16, overflow: 'hidden', background: '#000' }}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video src={result.blobUrl} controls style={{ width: '100%', maxHeight: 340, display: 'block' }} aria-label="Voice-overed video preview" />
      </div>

      <div style={{ display: 'flex', gap: 10, width: '100%', flexWrap: 'wrap' }}>
        <a
          href={result.blobUrl}
          download={result.filename}
          style={{
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
          Download MP4
        </a>

        <button
          onClick={onReset}
          style={{
            flex: 1, minWidth: 140, padding: '12px 20px', borderRadius: 9999, cursor: 'pointer',
            background: 'transparent', border: '1.5px solid rgba(212,114,106,0.3)',
            fontSize: 14, fontWeight: 600, color: '#D4726A',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212,114,106,0.08)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          Make Another
        </button>
      </div>
    </div>
  )
}
