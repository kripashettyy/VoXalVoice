'use client'
import Image from 'next/image'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const PILLARS = [
  {
    title: 'Free, always.',
    body: 'No credit card, no account. Open the studio and start. Every feature — voices, EQ, subtitle sync, dialogue — is free to use in the browser.',
    color: '#D4726A',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
      </svg>
    ),
  },
  {
    title: 'Open source.',
    body: 'Every line of code is public. Fork it, study it, improve it. We believe the best tools are built in the open with people who actually use them.',
    color: '#8B5CF6',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
      </svg>
    ),
  },
  {
    title: 'Privacy first.',
    body: 'Your text never leaves for advertising. No tracking, no training on your input. What you write stays yours — we only send it to the TTS engine to synthesize.',
    color: '#1a6b55',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
]

export default function AboutMission() {
  const { ref, visible } = useScrollReveal<HTMLElement>({ threshold: 0.15 })

  return (
    <section ref={ref} style={{ background: '#FFF0F5', padding: '88px 24px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64,
          alignItems: 'center',
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }} className="about-mission-grid">
          {/* Left — image */}
          <div style={{
            borderRadius: 24, overflow: 'hidden', aspectRatio: '4/3',
            position: 'relative', background: '#FDF0F0',
            border: '1px solid #E8D5D0',
            boxShadow: '0 16px 48px rgba(212,114,106,0.12)',
          }}>
            <Image src="/img4.jpg" alt="Building VoXalVoice" fill style={{ objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(212,114,106,0.18) 0%, transparent 50%)' }} />
          </div>

          {/* Right — text */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#D4726A', textTransform: 'uppercase', margin: '0 0 18px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              Our mission
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 700, color: '#1A1A1A', margin: '0 0 20px', lineHeight: 1.15, letterSpacing: '-0.02em', fontFamily: 'Georgia, "Times New Roman", serif' }}>
              Voice should be
              <br />
              <span style={{ fontWeight: 400, fontStyle: 'italic' }}>for everyone.</span>
            </h2>
            <p style={{ fontSize: 16, color: '#5A4A4A', lineHeight: 1.7, margin: '0 0 32px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              We built VoXalVoice because professional-grade TTS tools were locked behind expensive subscriptions or buried in developer-only APIs. We wanted something anyone could open in a browser, tune in seconds, and actually use.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {PILLARS.map((p, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.6s ease ${0.2 + i * 0.12}s, transform 0.6s ease ${0.2 + i * 0.12}s`,
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: `${p.color}15`, color: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${p.color}25` }}>
                    {p.icon}
                  </div>
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#1A1A1A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>{p.title}</p>
                    <p style={{ margin: 0, fontSize: 13, color: '#5A4A4A', lineHeight: 1.6, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-mission-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          section { opacity: 1 !important; transform: none !important; transition: none !important; }
        }
      `}</style>
    </section>
  )
}
