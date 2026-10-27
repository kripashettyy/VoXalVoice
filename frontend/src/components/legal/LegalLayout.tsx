import StickyNav from '@/components/landing/StickyNav'

interface Props {
  title: string
  lastUpdated: string
  children: React.ReactNode
}

export default function LegalLayout({ title, lastUpdated, children }: Props) {
  return (
    <div style={{ minHeight: '100vh', background: '#FFF0F5' }}>
      <StickyNav />

      <main style={{ maxWidth: 740, margin: '0 auto', padding: '120px 24px 96px' }}>
        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase',
          color: '#9A8A8A', margin: '0 0 16px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          Legal
        </p>
        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 700, color: '#1A1A1A',
          margin: '0 0 8px', lineHeight: 1.15, letterSpacing: '-0.02em',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}>
          {title}
        </h1>
        <p style={{
          fontSize: 13, color: '#9A8A8A', margin: '0 0 56px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          Last updated: {lastUpdated}
        </p>

        <div className="legal-body">
          {children}
        </div>
      </main>

      <style>{`
        .legal-body h2 {
          font-size: 18px;
          font-weight: 700;
          color: #1A1A1A;
          margin: 40px 0 12px;
          letter-spacing: -0.01em;
          font-family: Georgia, "Times New Roman", serif;
        }
        .legal-body p {
          font-size: 15px;
          color: #3A3A3A;
          line-height: 1.75;
          margin: 0 0 16px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .legal-body ul {
          margin: 0 0 16px;
          padding-left: 20px;
        }
        .legal-body li {
          font-size: 15px;
          color: #3A3A3A;
          line-height: 1.75;
          margin-bottom: 6px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .legal-body a {
          color: #D4726A;
          text-decoration: none;
        }
        .legal-body a:hover {
          text-decoration: underline;
        }
        .legal-body hr {
          border: none;
          border-top: 1px solid rgba(212,114,106,0.15);
          margin: 40px 0;
        }
        .legal-body code {
          font-size: 13px;
          background: rgba(212,114,106,0.08);
          color: #D4726A;
          padding: 1px 6px;
          border-radius: 4px;
          font-family: ui-monospace, "Cascadia Code", monospace;
        }
      `}</style>
    </div>
  )
}
