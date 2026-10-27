'use client'
import ErrorBoundary from '@/components/studio/ErrorBoundary'
import AppHeader from '@/components/shared/AppHeader'
import ReelsStudio from '@/components/reels/ReelsStudio'

export default function ReelsPage() {
  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', background: '#FFF0F5', paddingBottom: 80 }}>
        <AppHeader pageLabel="Reels" />

        <style>{`
          .rl-page-wrap {
            max-width: 1200px;
            margin: 0 auto;
            padding: 28px 16px 0;
          }
          .rl-hero { margin-bottom: 24px; }
          .rl-hero-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
            flex-wrap: wrap;
          }
          .rl-hero-title {
            margin: 0;
            font-size: clamp(18px, 4vw, 22px);
            font-weight: 800;
            color: #1A1A1A;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            letter-spacing: -0.3px;
          }
          .rl-hero-sub {
            margin: 3px 0 0;
            font-size: 13px;
            color: #9A8A8A;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }
          .rl-chips {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
            margin-top: 14px;
          }
          @media (max-width: 480px) {
            .rl-page-wrap { padding-top: 20px; }
            .rl-hero-icon { display: none; }
          }
        `}</style>

        <div className="rl-page-wrap">
          <div className="rl-hero">
            <div className="rl-hero-row">
              {/* Icon */}
              <div className="rl-hero-icon" style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(212,114,106,0.15), rgba(212,114,106,0.08))',
                border: '1px solid rgba(212,114,106,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }} aria-hidden="true">
                {/* Phone / vertical video icon */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="7" y="2" width="10" height="20" rx="2" fill="rgba(212,114,106,0.2)" stroke="#D4726A" strokeWidth="1.5"/>
                  <circle cx="12" cy="19" r="1" fill="#D4726A"/>
                  <path d="M10 6l2 2 2-2M12 8v5" stroke="#D4726A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h1 className="rl-hero-title">Reels &amp; Shorts Auto-Voiceover</h1>
                <p className="rl-hero-sub">
                  Upload a vertical video · add a script · burn in captions · download an Instagram / YouTube-ready MP4
                </p>
              </div>
            </div>

            {/* How it works chips */}
            <div className="rl-chips">
              {([
                {
                  text: 'Upload 9:16 video',
                  svg: (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="7" y="2" width="10" height="20" rx="2" stroke="#D4726A" strokeWidth="1.8"/>
                    </svg>
                  ),
                },
                {
                  text: 'Write script',
                  svg: (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 20h9" stroke="#D4726A" strokeWidth="1.8" strokeLinecap="round"/>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" stroke="#D4726A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ),
                },
                {
                  text: 'Optional captions',
                  svg: (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="2" y="7" width="20" height="10" rx="2" stroke="#D4726A" strokeWidth="1.8"/>
                      <path d="M6 12h4M6 15h8" stroke="#D4726A" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  ),
                },
                {
                  text: 'Download ready MP4',
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

          <ReelsStudio />
        </div>
      </div>
    </ErrorBoundary>
  )
}
