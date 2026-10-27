'use client'
import ErrorBoundary from '@/components/studio/ErrorBoundary'
import AppHeader from '@/components/shared/AppHeader'
import VoiceoverStudio from '@/components/voiceover/VoiceoverStudio'

export default function VoiceoverPage() {
  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', background: '#FFF0F5', paddingBottom: 80 }}>
        <AppHeader pageLabel="Voice-over" />

        <style>{`
          .vo-page-wrap {
            max-width: 1200px;
            margin: 0 auto;
            padding: 28px 16px 0;
          }
          .vo-hero { margin-bottom: 24px; }
          .vo-hero-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
            flex-wrap: wrap;
          }
          .vo-hero-title {
            margin: 0;
            font-size: clamp(18px, 4vw, 22px);
            font-weight: 800;
            color: #1A1A1A;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            letter-spacing: -0.3px;
          }
          .vo-hero-sub {
            margin: 3px 0 0;
            font-size: 13px;
            color: #9A8A8A;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }
          .vo-chips {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
            margin-top: 14px;
          }
          @media (max-width: 480px) {
            .vo-page-wrap { padding-top: 20px; }
            .vo-hero-icon { display: none; }
          }
        `}</style>

        {/* Page hero */}
        <div className="vo-page-wrap">
          <div className="vo-hero">
            <div className="vo-hero-row">
              {/* Video + waveform icon */}
              <div className="vo-hero-icon" style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(212,114,106,0.15), rgba(212,114,106,0.08))',
                border: '1px solid rgba(212,114,106,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }} aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="15" height="16" rx="2" fill="rgba(212,114,106,0.2)" stroke="#D4726A" strokeWidth="1.5"/>
                  <path d="M17 8.5l5-3v13l-5-3V8.5z" fill="#D4726A" opacity="0.8"/>
                  <path d="M6 10v4M9 9v6M12 11v2" stroke="#D4726A" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h1 className="vo-hero-title">
                  Video Voice-over Generator
                </h1>
                <p className="vo-hero-sub">
                  Upload a video · write a script · download a re-voiced MP4
                </p>
              </div>
            </div>

            {/* How it works chips */}
            <div className="vo-chips">
              {([
                {
                  text: 'Upload MP4 / MOV / WebM',
                  svg: (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="2" y="4" width="15" height="16" rx="2" stroke="#D4726A" strokeWidth="1.8"/>
                      <path d="M17 8.5l5-3v13l-5-3V8.5z" fill="#D4726A"/>
                    </svg>
                  ),
                },
                {
                  text: 'Write your script',
                  svg: (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 20h9" stroke="#D4726A" strokeWidth="1.8" strokeLinecap="round"/>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" stroke="#D4726A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ),
                },
                {
                  text: '300+ neural voices',
                  svg: (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="9" y="2" width="6" height="12" rx="3" stroke="#D4726A" strokeWidth="1.8"/>
                      <path d="M5 10a7 7 0 0 0 14 0" stroke="#D4726A" strokeWidth="1.8" strokeLinecap="round"/>
                      <line x1="12" y1="19" x2="12" y2="22" stroke="#D4726A" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  ),
                },
                {
                  text: 'Download voiced MP4',
                  svg: (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#D4726A" strokeWidth="1.8" strokeLinecap="round"/>
                      <polyline points="7 10 12 15 17 10" stroke="#D4726A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="12" y1="15" x2="12" y2="3" stroke="#D4726A" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  ),
                },
              ] as { text: string; svg: React.ReactNode }[]).map(({ svg, text }) => (
                <span
                  key={text}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '4px 12px', borderRadius: 9999,
                    background: 'rgba(212,114,106,0.07)',
                    border: '1px solid rgba(212,114,106,0.15)',
                    fontSize: 12, color: '#5A4A4A',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  }}
                >
                  {svg}
                  <span>{text}</span>
                </span>
              ))}
            </div>
          </div>

          <VoiceoverStudio />
        </div>
      </div>
    </ErrorBoundary>
  )
}
