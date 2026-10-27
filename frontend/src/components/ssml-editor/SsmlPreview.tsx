'use client'

interface Props {
  ssml: string
}

export default function SsmlPreview({ ssml }: Props) {
  return (
    <div>
      <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        SSML Output
      </p>
      <pre
        aria-label="Generated SSML"
        style={{
          margin: 0, padding: '14px 16px', borderRadius: 12,
          background: '#1A1A1A', color: '#e8d9b0',
          fontSize: 12, fontFamily: '"Fira Code", "Cascadia Code", "Courier New", monospace',
          lineHeight: 1.7, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
          border: '1px solid rgba(0,0,0,0.15)',
          minHeight: 60,
        }}
      >
        {ssml}
      </pre>
    </div>
  )
}
