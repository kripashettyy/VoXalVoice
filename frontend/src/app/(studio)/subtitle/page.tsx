'use client'
import ErrorBoundary from '@/components/studio/ErrorBoundary'
import AppHeader from '@/components/shared/AppHeader'
import SubtitleStudio from '@/components/subtitle/SubtitleStudio'

export default function SubtitlePage() {
  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', background: '#FFF0F5', paddingBottom: 80 }}>
        <AppHeader pageLabel="Subtitle Voice" />

        <style>{PAGE_STYLES}</style>

        <div className="st-page-wrap">
          <div className="st-hero">
            <div className="st-hero-row">
              <div className="st-hero-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="rgba(212,114,106,0.2)" stroke="#D4726A" strokeWidth="1.5"/>
                  <polyline points="14 2 14 8 20 8" stroke="#D4726A" strokeWidth="1.5"/>
                  <line x1="6" y1="13" x2="18" y2="13" stroke="#D4726A" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="6" y1="17" x2="12" y2="17" stroke="#D4726A" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h1 className="st-hero-title">Subtitle to Voice</h1>
                <p className="st-hero-sub">Upload an .srt or .vtt file · get a timed WAV · perfect for Reels &amp; Shorts</p>
              </div>
            </div>

            <div className="st-chips">
              {chips.map(({ icon, text }) => (
                <span key={text} className="st-chip">
                  {icon}
                  <span>{text}</span>
                </span>
              ))}
            </div>
          </div>

          <SubtitleStudio />
        </div>
      </div>
    </ErrorBoundary>
  )
}

const chipIcon = (d: string) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d={d} stroke="#D4726A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const chips = [
  { icon: chipIcon('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6'), text: 'Upload .srt or .vtt' },
  { icon: chipIcon('M9 2h6l2 7H7zM4.5 10h15M9 10v10M15 10v10'), text: 'Each cue timed precisely' },
  { icon: chipIcon('M9 2a1 1 0 0 0-2 0v4M15 2a1 1 0 0 1 2 0v4M12 22V12m-5-4h10'), text: '300+ neural voices' },
  { icon: chipIcon('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3'), text: 'Download WAV' },
]

const PAGE_STYLES = `
  .st-page-wrap { max-width: 1200px; margin: 0 auto; padding: 28px 16px 0; }
  .st-hero { margin-bottom: 24px; }
  .st-hero-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; flex-wrap: wrap; }
  .st-hero-icon {
    width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
    background: linear-gradient(135deg, rgba(212,114,106,0.15), rgba(212,114,106,0.08));
    border: 1px solid rgba(212,114,106,0.2);
    display: flex; align-items: center; justify-content: center;
  }
  .st-hero-title {
    margin: 0; font-size: clamp(18px, 4vw, 22px); font-weight: 800; color: #1A1A1A;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; letter-spacing: -0.3px;
  }
  .st-hero-sub { margin: 3px 0 0; font-size: 13px; color: #9A8A8A; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  .st-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 14px; }
  .st-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 12px; border-radius: 9999px;
    background: rgba(212,114,106,0.07); border: 1px solid rgba(212,114,106,0.15);
    font-size: 12px; color: #5A4A4A;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  @media (max-width: 480px) {
    .st-page-wrap { padding-top: 20px; }
    .st-hero-icon { display: none; }
  }
`
