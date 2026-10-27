'use client'
import { usePlayback } from '@/store/playback'

function sanitizeFilename(text: string, maxChars = 30): string {
  let result = text.replace(/[/\\:*?"<>|]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '').slice(0, maxChars).replace(/^_+|_+$/g, '')
  return result || 'untitled'
}

export default function DownloadButton({ text }: { text: string }) {
  const { generatedBlobUrl, audioInvalidated } = usePlayback()
  if (!generatedBlobUrl || audioInvalidated) return null

  const filename = sanitizeFilename(text) + '.wav'

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <a
        href={generatedBlobUrl}
        download={filename}
        aria-label={`Download audio as ${filename}`}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '11px 22px', background: '#D4726A', color: '#fff',
          borderRadius: 12, textDecoration: 'none', fontSize: 14, fontWeight: 600,
          minHeight: 44, boxShadow: '0 4px 14px rgba(212,114,106,0.35)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          transition: 'box-shadow 0.15s',
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Download WAV
      </a>
    </div>
  )
}
