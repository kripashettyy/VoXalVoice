'use client'
import Link from 'next/link'
import SineWaveTicker from './SineWaveTicker'
import RadioDevice from './RadioDevice'

export default function HeroSection() {
  return (
    <section
      style={{
        background: '#FFF0F5',
        height: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 48px 140px',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Cracked earth texture */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.07 }}>
        <div style={{ width: '100%', height: '100%', backgroundColor: '#191919', filter: 'url(#hero-cracks)' }} />
        <svg width={0} height={0} style={{ position: 'absolute' }}>
          <defs>
            <filter id="hero-cracks">
              <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={5} seed={10} result="noise" />
              <feColorMatrix type="luminanceToAlpha" in="noise" result="alphaNoise" />
              <feComponentTransfer in="alphaNoise" result="plates">
                <feFuncA type="discrete" tableValues="0 1" />
              </feComponentTransfer>
              <feConvolveMatrix order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" in="plates" result="edges" />
              <feComponentTransfer in="edges" result="invertedEdges">
                <feFuncR type="table" tableValues="1 0" />
                <feFuncG type="table" tableValues="1 0" />
                <feFuncB type="table" tableValues="1 0" />
              </feComponentTransfer>
              <feFlood floodColor="#000" result="bgColor" />
              <feComposite operator="in" in="bgColor" in2="invertedEdges" />
            </filter>
          </defs>
        </svg>
      </div>

      {/* Floating soft orbs — decorative background blobs */}
      <div aria-hidden="true">
        <div className="hero-orb hero-orb--2" />
        <div className="hero-orb hero-orb--3" />
      </div>

      {/* Two-column layout */}
      <div
        className="hero-grid"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 72,
          width: '100%',
          maxWidth: 1100,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Left — text content */}
        <div className="hero-text" style={{ flex: '1 1 0', minWidth: 0 }}>

          {/* Eyebrow — slides in from left */}
          <p className="hero-eyebrow" style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.13em',
            color: '#9A8A8A', textTransform: 'uppercase', margin: '0 0 20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>
            VoXalVoice · Text-to-Speech Studio
          </p>

          {/* H1 line 1 — fades up */}
          <h1 className="hero-h1-a" style={{
            fontSize: 'clamp(40px, 5.5vw, 72px)', fontWeight: 700,
            color: '#1A1A1A', margin: '0 0 4px', lineHeight: 1.1,
            letterSpacing: '-0.02em', fontFamily: 'Georgia, "Times New Roman", serif',
          }}>
            Don&apos;t type,
          </h1>

          {/* H1 line 2 — fades up, slight delay */}
          <h1 className="hero-h1-b" style={{
            fontSize: 'clamp(40px, 5.5vw, 72px)', fontWeight: 400, fontStyle: 'italic',
            color: '#1A1A1A', margin: '0 0 28px', lineHeight: 1.1,
            letterSpacing: '-0.02em', fontFamily: 'Georgia, "Times New Roman", serif',
          }}>
            just speak.
          </h1>

          {/* Subtitle */}
          <p className="hero-sub" style={{
            fontSize: 'clamp(15px, 1.6vw, 18px)', color: '#5A4A4A',
            margin: '0 0 36px', lineHeight: 1.6, maxWidth: 400,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>
            The voice-to-text studio that turns speech into clear, polished audio in every format.
          </p>

          {/* CTA */}
          <div className="hero-cta" style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            <Link
              href="/studio"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 28px', background: '#E8D5F0', color: '#1A1A1A',
                borderRadius: 9999, textDecoration: 'none', fontSize: 15, fontWeight: 600,
                minHeight: 48, border: '1.5px solid #c9a8e0',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(201,168,224,0.45)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <rect x="0" y="0" width="6" height="6" rx="1" fill="#8B5CF6"/>
                <rect x="8" y="0" width="6" height="6" rx="1" fill="#8B5CF6"/>
                <rect x="0" y="8" width="6" height="6" rx="1" fill="#8B5CF6"/>
                <rect x="8" y="8" width="6" height="6" rx="1" fill="#8B5CF6"/>
              </svg>
              Open the studio
            </Link>
          </div>

          <p className="hero-note" style={{
            fontSize: 12, color: '#9A8A8A', margin: 0,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>
            Available in your browser · No sign-up needed
          </p>
        </div>

        {/* Right — radio device, slides in from right */}
        <div className="hero-device hero-device-anim" style={{ flexShrink: 0 }}>
          <RadioDevice />
        </div>
      </div>

      <SineWaveTicker />

      <style>{`
        /* ── Entrance animations ── */
        .hero-eyebrow {
          animation: hero-slide-left 0.7s cubic-bezier(0.22,1,0.36,1) both;
          animation-delay: 0.05s;
        }
        .hero-h1-a {
          animation: hero-fade-up 0.75s cubic-bezier(0.22,1,0.36,1) both;
          animation-delay: 0.18s;
        }
        .hero-h1-b {
          animation: hero-fade-up 0.75s cubic-bezier(0.22,1,0.36,1) both;
          animation-delay: 0.32s;
        }
        .hero-sub {
          animation: hero-fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both;
          animation-delay: 0.46s;
        }
        .hero-cta {
          animation: hero-fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both;
          animation-delay: 0.58s;
        }
        .hero-note {
          animation: hero-fade-up 0.6s ease both;
          animation-delay: 0.72s;
        }
        .hero-device-anim {
          animation: hero-slide-right 0.9s cubic-bezier(0.22,1,0.36,1) both;
          animation-delay: 0.25s;
        }

        @keyframes hero-fade-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hero-slide-left {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes hero-slide-right {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* ── Floating orbs ── */
        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(64px);
          pointer-events: none;
          z-index: 0;
        }
        .hero-orb--2 {
          width: 280px; height: 280px;
          background: rgba(201,168,224,0.14);
          bottom: 60px; left: -40px;
          animation: orb-drift 15s ease-in-out infinite alternate-reverse;
        }
        .hero-orb--3 {
          width: 180px; height: 180px;
          background: rgba(212,114,106,0.08);
          top: 40%; left: 40%;
          animation: orb-drift 10s ease-in-out infinite alternate;
          animation-delay: -4s;
        }
        @keyframes orb-drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, 20px) scale(1.08); }
        }

        /* ── Responsive ── */
        @media (max-width: 820px) {
          .hero-device { display: none; }
          .hero-grid { justify-content: center !important; }
          .hero-text { text-align: center; }
          .hero-text p { margin-left: auto; margin-right: auto; }
          .hero-text div { justify-content: center; }
          .hero-orb--1 { width: 260px; height: 260px; }
          .hero-orb--2 { width: 180px; height: 180px; }
        }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .hero-eyebrow, .hero-h1-a, .hero-h1-b, .hero-sub,
          .hero-cta, .hero-note, .hero-device-anim {
            animation: none !important;
          }
          .hero-orb { animation: none !important; }
        }
      `}</style>
    </section>
  )
}
