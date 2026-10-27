'use client'
import Image from 'next/image'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const CONTRIBUTORS = [
  {
    name: 'Naren S J',
    role: 'Creator & Lead Developer',
    contribution: 'Architecture, backend, frontend, TTS pipeline, all features.',
    photo: '/team/naren.png',
    color: '#D4726A',
    website: 'https://narensj.netlify.app/',
    github: 'https://github.com/Naren1520',
    linkedin: 'https://linkedin.com/in/narensj20',
  },
]

const CORE_CONTRIBUTORS = [
  {
    name: 'Kripa Shetty',
    photo: '/img3.avif',
    color: '#8B5CF6',
  },
  {
    name: 'Pranava Pai',
    photo: '/img6.avif',
    color: '#1a6b55',
  },
]

const WANT_TO_CONTRIBUTE = [
  'Fix a bug or edge case',
  'Add a new voice engine',
  'Improve accessibility',
  'Write tests',
  'Suggest a feature',
  'Translate the UI',
]

const chipStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  padding: '6px 12px', borderRadius: 7,
  border: '1px solid #333', background: 'transparent',
  color: '#888', fontSize: 12, fontWeight: 500,
  textDecoration: 'none',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  transition: 'all 0.15s',
}

export default function AboutContributors() {
  const { ref, visible } = useScrollReveal<HTMLElement>({ threshold: 0.15 })

  return (
    <section ref={ref} style={{ background: '#1A1A1A', padding: '88px 24px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>

        {/* Heading */}
        <div style={{
          textAlign: 'center', marginBottom: 64,
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#555', textTransform: 'uppercase', margin: '0 0 18px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            The people behind it
          </p>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 52px)', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em', fontFamily: 'Georgia, "Times New Roman", serif' }}>
            Contributors
          </h2>
        </div>

        {/* Contributor cards */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 64 }}>
          {CONTRIBUTORS.map((c, i) => (
            <div key={c.name} style={{
              width: '100%', maxWidth: 360,
              borderRadius: 20, overflow: 'hidden',
              border: '1px solid #2a2a2a',
              background: '#161616',
              opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)',
              transition: `opacity 0.6s ease ${0.15 + i * 0.1}s, transform 0.6s ease ${0.15 + i * 0.1}s`,
            }}>
              {/* Rectangular photo */}
              <div style={{ position: 'relative', width: '100%', aspectRatio: '3/2', overflow: 'hidden', background: '#111' }}>
                <Image
                  src={c.photo}
                  alt={c.name}
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'top center' }}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, rgba(22,22,22,0.85) 0%, transparent 100%)' }} />
              </div>

              {/* Info */}
              <div style={{ padding: '20px 24px 24px' }}>
                <p style={{ margin: '0 0 2px', fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                  {c.name}
                </p>
                <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: c.color, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                  {c.role}
                </p>
                <p style={{ margin: '0 0 20px', fontSize: 13, color: '#777', lineHeight: 1.6, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                  {c.contribution}
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {c.website && (
                    <a href={c.website} target="_blank" rel="noopener noreferrer" style={chipStyle}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#D4726A'; e.currentTarget.style.borderColor = '#D4726A'; e.currentTarget.style.color = '#fff' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#888' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                      </svg>
                      Website
                    </a>
                  )}
                  {c.github && (
                    <a href={c.github} target="_blank" rel="noopener noreferrer" style={chipStyle}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.color = '#111' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#888' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
                      </svg>
                      GitHub
                    </a>
                  )}
                  {c.linkedin && (
                    <a href={c.linkedin} target="_blank" rel="noopener noreferrer" style={chipStyle}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#0A66C2'; e.currentTarget.style.borderColor = '#0A66C2'; e.currentTarget.style.color = '#fff' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#888' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Core contributors */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 40 }} className="core-contrib-row">
            {/* Side heading */}
            <div style={{ flexShrink: 0, paddingTop: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#444', textTransform: 'uppercase', margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                Core Contributors
              </p>
            </div>

            {/* Cards */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', flex: 1 }}>
              {CORE_CONTRIBUTORS.map((c, i) => (
                <div key={c.name} style={{
                  width: 200, borderRadius: 16, overflow: 'hidden',
                  border: '1px solid #2a2a2a', background: '#161616', flexShrink: 0,
                  opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)',
                  transition: `opacity 0.6s ease ${0.3 + i * 0.1}s, transform 0.6s ease ${0.3 + i * 0.1}s`,
                }}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '3/2', overflow: 'hidden', background: '#111' }}>
                    <Image
                      src={c.photo}
                      alt={c.name}
                      fill
                      style={{ objectFit: 'cover', objectPosition: 'center top' }}
                    />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, rgba(22,22,22,0.85) 0%, transparent 100%)' }} />
                  </div>
                  <div style={{ padding: '12px 14px 14px' }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                      {c.name}
                    </p>
                    <p style={{ margin: '3px 0 0', fontSize: 10, fontWeight: 700, color: c.color, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                      Contributor
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Want to contribute */}
        <div style={{
          background: '#161616', borderRadius: 24, padding: '40px',
          border: '1px solid #242424',
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }} className="contrib-cta-grid">
            <div>
              <h3 style={{ margin: '0 0 14px', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em', fontFamily: 'Georgia, "Times New Roman", serif' }}>
                Want to contribute?
              </h3>
              <p style={{ margin: '0 0 24px', fontSize: 14, color: '#888', lineHeight: 1.7, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                VoXalVoice is open source. Every PR, bug report, and idea counts. Contributors get credited right here on this page.
              </p>
              <a href="https://github.com/Naren1520/VoXalVoice" target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 24px', background: '#fff', color: '#1A1A1A',
                borderRadius: 9999, textDecoration: 'none', fontSize: 14, fontWeight: 600,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,255,255,0.12)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                View on GitHub
              </a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {WANT_TO_CONTRIBUTE.map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4726A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span style={{ fontSize: 13, color: '#888', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .contrib-cta-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          .core-contrib-row { flex-direction: column !important; gap: 16px !important; }
          .core-contrib-row > div:first-child { writing-mode: horizontal-tb !important; transform: none !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          section, div { opacity: 1 !important; transform: none !important; transition: none !important; }
        }
      `}</style>
    </section>
  )
}
