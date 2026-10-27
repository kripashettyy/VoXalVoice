'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const STATS = [
  { value: '300+', label: 'Neural voices' },
  { value: '4', label: 'Studio tools' },
  { value: '100%', label: 'Free to use' },
  { value: '0', label: 'Sign-ups needed' },
]

export default function AboutOpenSource() {
  const { ref, visible } = useScrollReveal<HTMLElement>({ threshold: 0.15 })

  return (
    <section ref={ref} style={{ background: '#FFF0F5', padding: '88px 24px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>

        {/* Stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
          marginBottom: 80,
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }} className="stats-grid">
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              background: '#fff', borderRadius: 20, padding: '32px 20px',
              border: '1px solid #E8D5D0', textAlign: 'center',
              opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)',
              transition: `opacity 0.6s ease ${0.1 + i * 0.1}s, transform 0.6s ease ${0.1 + i * 0.1}s`,
            }}>
              <p style={{ margin: '0 0 6px', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, color: '#D4726A', letterSpacing: '-0.02em', fontFamily: 'Georgia, "Times New Roman", serif' }}>
                {s.value}
              </p>
              <p style={{ margin: 0, fontSize: 13, color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontWeight: 500 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Image + text grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64,
          alignItems: 'center',
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)',
          transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
        }} className="open-source-grid">
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#D4726A', textTransform: 'uppercase', margin: '0 0 18px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              Open source
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 700, color: '#1A1A1A', margin: '0 0 20px', lineHeight: 1.15, letterSpacing: '-0.02em', fontFamily: 'Georgia, "Times New Roman", serif' }}>
              Built in the open,
              <br />
              <span style={{ fontWeight: 400, fontStyle: 'italic' }}>for everyone.</span>
            </h2>
            <p style={{ fontSize: 16, color: '#5A4A4A', lineHeight: 1.7, margin: '0 0 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              The full codebase — FastAPI backend, Next.js frontend, TTS adapters, all four studio tools — is public on GitHub. Read it, run it locally, or submit a pull request.
            </p>
            <p style={{ fontSize: 16, color: '#5A4A4A', lineHeight: 1.7, margin: '0 0 32px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              When you contribute, your name goes on the About page. We believe the people who build a product deserve to be visible in it.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/studio" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 24px', background: '#E8D5F0', color: '#1A1A1A',
                borderRadius: 9999, textDecoration: 'none', fontSize: 14, fontWeight: 600,
                border: '1.5px solid #c9a8e0',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(201,168,224,0.45)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="0" y="0" width="6" height="6" rx="1" fill="#8B5CF6"/>
                  <rect x="8" y="0" width="6" height="6" rx="1" fill="#8B5CF6"/>
                  <rect x="0" y="8" width="6" height="6" rx="1" fill="#8B5CF6"/>
                  <rect x="8" y="8" width="6" height="6" rx="1" fill="#8B5CF6"/>
                </svg>
                Try the studio
              </Link>
              <a href="https://github.com/Naren1520/VoXalVoice" target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 24px', background: 'transparent', color: '#1A1A1A',
                borderRadius: 9999, textDecoration: 'none', fontSize: 14, fontWeight: 600,
                border: '1.5px solid #E8D5D0',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                transition: 'border-color 0.15s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#D4726A' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E8D5D0' }}
              >
                Star on GitHub
              </a>
            </div>
          </div>

          <div style={{ borderRadius: 24, overflow: 'hidden', position: 'relative', aspectRatio: '4/3', background: '#FDF0F0', border: '1px solid #E8D5D0', boxShadow: '0 16px 48px rgba(212,114,106,0.1)' }}>
            <Image src="/img5.jpg" alt="Open source collaboration" fill style={{ objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(212,114,106,0.08) 0%, transparent 60%)' }} />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 520px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 768px) {
          .open-source-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          section, div { opacity: 1 !important; transform: none !important; transition: none !important; }
        }
      `}</style>
    </section>
  )
}
