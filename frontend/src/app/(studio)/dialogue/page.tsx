'use client'
import AppHeader from '@/components/shared/AppHeader'
import ErrorBoundary from '@/components/studio/ErrorBoundary'
import DialogueStudio from '@/components/dialogue/DialogueStudio'

export default function DialoguePage() {
  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', background: '#FFF0F5', paddingBottom: 80 }}>
        <AppHeader pageLabel="Dialogue" />
        <style>{PAGE_STYLES}</style>

        <div className="dg-page-wrap">
          <div className="dg-hero">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(212,114,106,0.15), rgba(212,114,106,0.08))',
                border: '1px solid rgba(212,114,106,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }} aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#D4726A" strokeWidth="1.8" strokeLinecap="round"/>
                  <circle cx="9" cy="7" r="4" stroke="#D4726A" strokeWidth="1.8"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#D4726A" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 800, color: '#1A1A1A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', letterSpacing: '-0.3px' }}>
                  Multi-voice Dialogue
                </h1>
                <p style={{ margin: '3px 0 0', fontSize: 13, color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                  Assign a different neural voice to each speaker · download one continuous WAV
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
              {[
                { text: 'Add speaker turns', d: 'M12 5v14M5 12h14' },
                { text: 'Assign unique voices', d: 'M9 2a1 1 0 0 0 0 2v4a3 3 0 0 0 6 0V4a1 1 0 1 0-2 0' },
                { text: 'Tune per-speaker', d: 'M12 20h9M4.22 4.22l15.56 15.56M1.64 9H6m12 6h4.36' },
                { text: 'Download WAV', d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3' },
              ].map(({ text, d }) => (
                <span key={text} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px',
                  borderRadius: 9999, background: 'rgba(212,114,106,0.07)',
                  border: '1px solid rgba(212,114,106,0.15)', fontSize: 12, color: '#5A4A4A',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4726A" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d={d}/></svg>
                  {text}
                </span>
              ))}
            </div>
          </div>

          <DialogueStudio />
        </div>
      </div>
    </ErrorBoundary>
  )
}

const PAGE_STYLES = `
  .dg-page-wrap { max-width: 1200px; margin: 0 auto; padding: 28px 16px 0; }
  .dg-hero { margin-bottom: 24px; }
  @media (max-width: 480px) { .dg-page-wrap { padding-top: 20px; } }
`
