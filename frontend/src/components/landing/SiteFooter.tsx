import Link from 'next/link'

const FOOTER_COLS = [
  {
    heading: 'Product',
    links: [
      { label: 'Studio', href: '/studio' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Roadmap', href: '#', soon: true },
      { label: 'API docs', href: '#', soon: true },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'How it works', href: '#how-it-works' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Blog', href: '#', soon: true },
      { label: 'Changelog', href: '#', soon: true },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Data Controls', href: '/data-controls' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
]

export default function SiteFooter() {
  return (
    <footer style={{ background: '#111111', padding: '64px 24px 40px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        {/* Top row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr repeat(3, auto)',
          gap: 48,
          marginBottom: 56,
          flexWrap: 'wrap',
        }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <Link href="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              textDecoration: 'none',
              marginBottom: 14,
            }}>
              <svg width="20" height="18" viewBox="0 0 20 18" fill="none" aria-hidden="true">
                <rect x="0"  y="6" width="2.5" height="6"  rx="1.25" fill="#D4726A"/>
                <rect x="4"  y="3" width="2.5" height="12" rx="1.25" fill="#D4726A"/>
                <rect x="8"  y="0" width="2.5" height="18" rx="1.25" fill="#D4726A"/>
                <rect x="12" y="3" width="2.5" height="12" rx="1.25" fill="#D4726A"/>
                <rect x="16" y="6" width="2.5" height="6"  rx="1.25" fill="#D4726A"/>
              </svg>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.3px' }}>
                VoXalVoice
              </span>
            </Link>
            <p style={{
              fontSize: 13,
              color: '#666',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: 220,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}>
              Studio-quality text-to-speech, right in your browser.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.heading}>
              <p style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#555',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                margin: '0 0 16px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}>
                {col.heading}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    style={{
                      fontSize: 14,
                      color: l.soon ? '#444' : '#aaa',
                      textDecoration: 'none',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: l.soon ? 'default' : 'pointer',
                    }}
                  >
                    {l.label}
                    {l.soon && (
                      <span style={{
                        fontSize: 10,
                        background: '#222',
                        color: '#555',
                        padding: '1px 6px',
                        borderRadius: 4,
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                      }}>
                        soon
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar — no divider, centered copyright only */}
        <div style={{ paddingTop: 24, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p style={{ fontSize: 12, color: '#444', margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            © {new Date().getFullYear()} VoXalVoice. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 32px !important;
          }
          .footer-grid > div:first-child {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </footer>
  )
}
