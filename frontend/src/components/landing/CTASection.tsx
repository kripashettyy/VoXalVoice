'use client'
import Link from 'next/link'
import { useScrollReveal } from '@/hooks/useScrollReveal'

export default function CTASection() {
  const { ref, visible } = useScrollReveal<HTMLElement>({ threshold: 0.2 })

  return (
    <section
      ref={ref}
      style={{
        background: '#FFF0F5',
        padding: '88px 24px 80px',
        textAlign: 'center',
      }}
    >
      {/* Wave animation */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 48, gap: 0 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            style={{
              width: '1.8rem', height: 150, backgroundColor: '#D4726A',
              margin: '0 4px', borderRadius: '0.4rem', transformOrigin: 'center',
              animationName: 'cta-wave', animationDuration: '1.5s',
              animationTimingFunction: 'linear', animationIterationCount: 'infinite',
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      <p style={{
        fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em',
        color: '#9A8A8A', textTransform: 'uppercase', margin: '0 0 20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease 0.05s, transform 0.6s ease 0.05s',
      }}>
        Get started
      </p>

      <h2 style={{
        fontSize: 'clamp(32px, 5vw, 58px)', fontWeight: 700,
        color: '#1A1A1A', margin: '0 0 8px', lineHeight: 1.1,
        letterSpacing: '-0.02em', fontFamily: 'Georgia, "Times New Roman", serif',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.65s ease 0.15s, transform 0.65s ease 0.15s',
      }}>
        You have a voice.
      </h2>

      <h2 style={{
        fontSize: 'clamp(32px, 5vw, 58px)', fontWeight: 400, fontStyle: 'italic',
        color: '#1A1A1A', margin: '0 0 24px', lineHeight: 1.1,
        letterSpacing: '-0.02em', fontFamily: 'Georgia, "Times New Roman", serif',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.65s ease 0.27s, transform 0.65s ease 0.27s',
      }}>
        Now make it heard.
      </h2>

      <p style={{
        fontSize: 16, color: '#5A4A4A', margin: '0 auto 40px',
        maxWidth: 420, lineHeight: 1.6,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease 0.38s, transform 0.6s ease 0.38s',
      }}>
        Open the studio and start generating studio-quality speech in seconds. No sign-up needed.
      </p>

      <div style={{
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s',
        display: 'inline-block',
      }}>
        <Link
          href="/studio"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 32px', background: '#E8D5F0', color: '#1A1A1A',
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

      <style>{`
        @keyframes cta-wave {
          0%   { transform: scale(0); filter: hue-rotate(90deg)  blur(100px); }
          25%  { transform: scale(0); filter: hue-rotate(120deg) blur(50px);  }
          50%  { transform: scale(1); filter: hue-rotate(180deg) blur(25px);  }
          75%  { transform: scale(0); filter: hue-rotate(360deg) blur(2px);   }
          100% { transform: scale(0); filter: hue-rotate(0deg)   blur(0);     }
        }
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; animation: none !important; }
        }
      `}</style>
    </section>
  )
}
