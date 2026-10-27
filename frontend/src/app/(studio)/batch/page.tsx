'use client'
import AppHeader from '@/components/shared/AppHeader'
import ErrorBoundary from '@/components/studio/ErrorBoundary'
import BatchStudio from '@/components/batch/BatchStudio'

export default function BatchPage() {
  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', background: '#FFF0F5', paddingBottom: 80 }}>
        <AppHeader pageLabel="Batch TTS" />
        <style>{PAGE_STYLES}</style>

        <div className="batch-page-wrap">
          <div className="batch-hero">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: 'linear-gradient(135deg, rgba(212,114,106,0.15), rgba(212,114,106,0.08))', border: '1px solid rgba(212,114,106,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4726A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 800, color: '#1A1A1A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', letterSpacing: '-0.3px' }}>
                  Batch Text-to-Speech
                </h1>
                <p style={{ margin: '3px 0 0', fontSize: 13, color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                  Upload a .txt or .csv · synthesize every line · download a ZIP of WAV files
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
              {[
                { text: 'Upload .txt or .csv', d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6' },
                { text: 'One WAV per line', d: 'M9 11l3 3L22 4' },
                { text: 'Up to 200 entries', d: 'M4 6h16M4 12h16M4 18h16' },
                { text: 'Download as ZIP', d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3' },
              ].map(({ text, d }) => (
                <span key={text} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 9999, background: 'rgba(212,114,106,0.07)', border: '1px solid rgba(212,114,106,0.15)', fontSize: 12, color: '#5A4A4A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4726A" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d={d}/></svg>
                  {text}
                </span>
              ))}
            </div>
          </div>

          <BatchStudio />
        </div>
      </div>
    </ErrorBoundary>
  )
}

const PAGE_STYLES = `
  .batch-page-wrap { max-width: 1200px; margin: 0 auto; padding: 28px 16px 0; }
  .batch-hero { margin-bottom: 24px; }
  @media (max-width: 480px) { .batch-page-wrap { padding-top: 20px; } }
`
