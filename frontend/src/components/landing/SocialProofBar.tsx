'use client'

const FLAGS = [
  { code: 'us', name: 'United States' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'jp', name: 'Japan' },
  { code: 'in', name: 'India' },
  { code: 'br', name: 'Brazil' },
  { code: 'ca', name: 'Canada' },
  { code: 'au', name: 'Australia' },
  { code: 'kr', name: 'South Korea' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'se', name: 'Sweden' },
  { code: 'sg', name: 'Singapore' },
  { code: 'mx', name: 'Mexico' },
  { code: 'es', name: 'Spain' },
  { code: 'it', name: 'Italy' },
  { code: 'za', name: 'South Africa' },
  { code: 'ae', name: 'UAE' },
  { code: 'tr', name: 'Turkey' },
  { code: 'ar', name: 'Argentina' },
  { code: 'pt', name: 'Portugal' },
  { code: 'fi', name: 'Finland' },
  { code: 'ng', name: 'Nigeria' },
  { code: 'ch', name: 'Switzerland' },
  { code: 'pl', name: 'Poland' },
  { code: 'cn', name: 'China' },
  { code: 'id', name: 'Indonesia' },
  { code: 'ph', name: 'Philippines' },
  { code: 'vn', name: 'Vietnam' },
  { code: 'ua', name: 'Ukraine' },
]

const DOUBLED = [...FLAGS, ...FLAGS]

export default function SocialProofBar() {
  return (
    <>
      <section
        style={{
          background: '#111111',
          padding: '72px 0 120px',
          overflow: 'hidden',
          width: '100%',
          margin: 0,
        }}
      >
        <p style={{
          textAlign: 'center',
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: '0.15em',
          color: '#666666',
          textTransform: 'uppercase',
          margin: '0 0 52px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          Used by people in 100+ countries
        </p>

        {/* Scrolling track */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 120,
            background: 'linear-gradient(90deg, #111111 0%, transparent 100%)',
            zIndex: 2, pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: 120,
            background: 'linear-gradient(270deg, #111111 0%, transparent 100%)',
            zIndex: 2, pointerEvents: 'none',
          }} />

          <div
            className="flags-scroll-track"
            style={{
              display: 'flex',
              alignItems: 'center',
              width: 'max-content',
              animation: 'flags-move 45s linear infinite',
              willChange: 'transform',
            }}
          >
            {DOUBLED.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '0 40px',
                  flexShrink: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://flagcdn.com/40x30/${item.code}.png`}
                  srcSet={`https://flagcdn.com/80x60/${item.code}.png 2x`}
                  width={40}
                  height={30}
                  alt={item.name}
                  style={{
                    borderRadius: 4,
                    objectFit: 'cover',
                    flexShrink: 0,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                    display: 'block',
                  }}
                />
                <span style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: '#cccccc',
                  whiteSpace: 'nowrap',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  letterSpacing: '-0.01em',
                }}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes flags-move {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .flags-scroll-track { animation: none !important; }
        }
      `}</style>
    </>
  )
}
