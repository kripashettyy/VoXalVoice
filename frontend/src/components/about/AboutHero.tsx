'use client'
import Image from 'next/image'

export default function AboutHero() {
  return (
    <section style={{
      background: '#FFF0F5',
      padding: '160px 24px 100px',
      position: 'relative',
      overflow: 'hidden',
      marginTop: -80,
    }}>
      {/* Cracked earth texture */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.06, pointerEvents: 'none' }}>
        <div style={{ width: '100%', height: '100%', backgroundColor: '#191919', filter: 'url(#about-cracks)' }} />
        <svg width={0} height={0} style={{ position: 'absolute' }}>
          <defs>
            <filter id="about-cracks">
              <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={5} seed={7} result="noise" />
              <feColorMatrix type="luminanceToAlpha" in="noise" result="alphaNoise" />
              <feComponentTransfer in="alphaNoise" result="plates">
                <feFuncA type="discrete" tableValues="0 1" />
              </feComponentTransfer>
              <feConvolveMatrix order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" in="plates" result="edges" />
              <feFlood floodColor="#000" result="bgColor" />
              <feComposite operator="in" in="bgColor" in2="edges" />
            </filter>
          </defs>
        </svg>
      </div>

      {/* Background image with overlay */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Image src="/img1.jpg" alt="" fill style={{ objectFit: 'cover', opacity: 0.18 }} priority />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(255,240,245,0.3) 0%, rgba(255,240,245,0.5) 60%, rgba(255,240,245,0.95) 100%)' }} />
      </div>

      {/* Floating orbs */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(201,168,224,0.12)', filter: 'blur(80px)', top: -100, right: -80, animation: 'orb-drift 16s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', background: 'rgba(212,114,106,0.08)', filter: 'blur(60px)', bottom: 40, left: 80, animation: 'orb-drift 12s ease-in-out infinite alternate-reverse' }} />
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <p className="about-eyebrow">About VoXalVoice</p>

        <h1 className="about-h1">
          Built for people
          <br />
          <span style={{ fontWeight: 400, fontStyle: 'italic' }}>with something to say.</span>
        </h1>

        <p className="about-sub">
          VoXalVoice started as a weekend project to make studio-quality text-to-speech
          accessible to everyone — no paywalls, no sign-up, no friction.
          Today it&apos;s open source and growing with every contributor.
        </p>
      </div>

      <style>{`
        .about-eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
          color: #9A8A8A; text-transform: uppercase; margin: 0 0 24px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          animation: fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both;
          animation-delay: 0.1s;
        }
        .about-h1 {
          font-size: clamp(38px, 6vw, 72px); font-weight: 700;
          color: #1A1A1A; margin: 0 0 28px; line-height: 1.1;
          letter-spacing: -0.02em; font-family: Georgia, "Times New Roman", serif;
          animation: fade-up 0.75s cubic-bezier(0.22,1,0.36,1) both;
          animation-delay: 0.22s;
        }
        .about-sub {
          font-size: clamp(16px, 2vw, 19px); color: #5A4A4A; margin: 0 auto;
          max-width: 560px; line-height: 1.7;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          animation: fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both;
          animation-delay: 0.38s;
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes orb-drift {
          from { transform: translate(0, 0); }
          to   { transform: translate(24px, 18px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .about-eyebrow, .about-h1, .about-sub { animation: none !important; }
        }
      `}</style>
    </section>
  )
}
