'use client'
import { useEffect, useState } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

interface Step {
  label: string
  description: string
}

const TYPING_TEXT = 'Good morning! Today I want to share something important with all of you.'
const TYPING_SPEED = 60   // ms per character
const PAUSE_AFTER  = 1800 // ms pause before reset
const DELETE_SPEED = 30   // ms per delete

function TypingVisual() {
  const [displayed, setDisplayed] = useState('')
  const [phase, setPhase] = useState<'typing' | 'pause' | 'deleting'>('typing')

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    if (phase === 'typing') {
      if (displayed.length < TYPING_TEXT.length) {
        timeout = setTimeout(() => {
          setDisplayed(TYPING_TEXT.slice(0, displayed.length + 1))
        }, TYPING_SPEED)
      } else {
        timeout = setTimeout(() => setPhase('pause'), PAUSE_AFTER)
      }
    } else if (phase === 'pause') {
      timeout = setTimeout(() => setPhase('deleting'), 400)
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => {
          setDisplayed(displayed.slice(0, -1))
        }, DELETE_SPEED)
      } else {
        timeout = setTimeout(() => setPhase('typing'), 400)
      }
    }

    return () => clearTimeout(timeout)
  }, [displayed, phase])

  return (
    <div style={{
      width: '100%',
      background: '#141414',
      borderRadius: 8,
      padding: '10px 12px',
      minHeight: 72,
    }}>
      {/* fake textarea header */}
      <div style={{
        display: 'flex', gap: 5, marginBottom: 8,
      }}>
        {['#D4726A', '#f5c842', '#4CAF50'].map((c, i) => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c, opacity: 0.7 }} />
        ))}
      </div>
      <p style={{
        margin: 0, fontSize: 12, lineHeight: 1.6,
        color: '#cccccc',
        fontFamily: 'ui-monospace, "Cascadia Code", monospace',
        minHeight: 38,
        wordBreak: 'break-word',
      }}>
        {displayed}
        <span style={{
          display: 'inline-block', width: 1.5, height: '1em',
          background: '#D4726A', marginLeft: 1, verticalAlign: 'text-bottom',
          animation: 'hiw-blink 0.8s step-end infinite',
        }} />
      </p>
    </div>
  )
}

export default function HowItWorks({ steps }: { steps: Step[] }) {
  const { ref: headingRef, visible: headingVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.2 })
  const STEP_VISUALS = [
    // Step 1 — typing animation
    <TypingVisual key="1" />,

    // Step 2 — frequency bars
    <div key="2" style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 72, width: '100%' }}>
      {[40, 65, 80, 55, 90, 70, 45, 85, 60, 75, 50, 88].map((h, i) => (
        <div key={i} style={{
          flex: 1, borderRadius: 3,
          background: `hsl(${5 + i * 4}, 65%, ${48 + i * 1.5}%)`,
          height: `${h}%`,
          animation: `hiw-bar ${0.7 + i * 0.08}s ease-in-out infinite alternate`,
          transformOrigin: 'bottom',
        }} />
      ))}
    </div>,

    // Step 3 — scrolling sine wave
    <div key="3" style={{ width: '100%', height: 72, overflow: 'hidden', position: 'relative' }}>
      <svg viewBox="0 0 200 72" width="280" height="72" style={{ display: 'block' }}>
        <path
          d="M0,36 C20,6 40,66 60,36 C80,6 100,66 120,36 C140,6 160,66 180,36 C200,6 220,66 240,36 C260,6 280,66 300,36"
          fill="none" stroke="#D4726A" strokeWidth="2.5" strokeLinecap="round"
          style={{ animation: 'hiw-wave 2.5s linear infinite' }}
        />
      </svg>
    </div>,

    // Step 4 — download progress
    <div key="4" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: '#D4726A', fontWeight: 600, fontFamily: 'monospace' }}>output.wav</span>
        <span style={{ fontSize: 11, color: '#555', fontFamily: 'monospace' }}>16-bit PCM</span>
      </div>
      <div style={{ height: 6, background: 'rgba(212,114,106,0.15)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 3,
          background: 'linear-gradient(90deg, #D4726A, #c9a8e0)',
          animation: 'hiw-fill 2.5s ease-in-out infinite',
        }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4726A" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span style={{ fontSize: 12, color: '#666', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          Ready to download
        </span>
      </div>
    </div>,
  ]

  return (
    <section id="how-it-works" style={{ background: '#1A1A1A', padding: '88px 24px' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>

        <div ref={headingRef} style={{
          opacity: headingVisible ? 1 : 0,
          transform: headingVisible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
        <p style={{
          textAlign: 'center', fontSize: 10.5, fontWeight: 700,
          letterSpacing: '0.14em', color: '#555', textTransform: 'uppercase',
          margin: '0 0 20px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          How it works
        </p>
        <h2 style={{
          fontSize: 'clamp(30px, 4vw, 50px)', fontWeight: 700,
          color: '#ffffff', textAlign: 'center', margin: '0 0 72px',
          lineHeight: 1.15, letterSpacing: '-0.02em',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}>
          Speak at the speed you think,<br />
          <span style={{ fontWeight: 400, fontStyle: 'italic' }}>in every voice, on every device.</span>
        </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }} className="hiw-grid">
          {steps.map((step, i) => (
            <div key={i} style={{
              background: '#161616', borderRadius: 20,
              padding: '28px 24px 24px',
              border: '1px solid #242424',
              display: 'flex', flexDirection: 'column', gap: 20,
              position: 'relative', overflow: 'hidden',
              opacity: headingVisible ? 1 : 0,
              transform: headingVisible ? 'translateY(0)' : 'translateY(36px)',
              transition: `opacity 0.6s ease ${0.15 + i * 0.12}s, transform 0.6s ease ${0.15 + i * 0.12}s`,
            }}>
              <div style={{
                position: 'absolute', top: 16, right: 16,
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(212,114,106,0.12)',
                border: '1px solid rgba(212,114,106,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#D4726A',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}>
                {i + 1}
              </div>

              <div style={{
                background: '#1e1e1e', borderRadius: 12,
                padding: '14px 12px', minHeight: 80,
                display: 'flex', alignItems: 'center',
                border: '1px solid #2a2a2a', overflow: 'hidden',
              }}>
                {STEP_VISUALS[i]}
              </div>

              <div>
                <strong style={{
                  display: 'block', fontSize: 15, color: '#ffffff',
                  marginBottom: 8, fontWeight: 600,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}>
                  {step.label}
                </strong>
                <p style={{
                  fontSize: 13, color: '#666', margin: 0, lineHeight: 1.65,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}>
                  {step.description}
                </p>
              </div>

              {i < steps.length - 1 && (
                <div style={{
                  position: 'absolute', right: -7, top: '50%',
                  transform: 'translateY(-50%)',
                  width: 14, height: 14,
                  background: '#1A1A1A',
                  borderTop: '1px solid #333',
                  borderRight: '1px solid #333',
                  rotate: '45deg',
                  zIndex: 2,
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes hiw-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes hiw-bar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
        @keyframes hiw-wave {
          from { transform: translateX(0); }
          to   { transform: translateX(-100px); }
        }
        @keyframes hiw-fill {
          0%   { width: 0%; }
          65%  { width: 100%; }
          100% { width: 100%; }
        }
        @media (max-width: 900px) {
          .hiw-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 520px) {
          .hiw-grid { grid-template-columns: 1fr !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hiw-grid * { animation: none !important; }
        }
      `}</style>
    </section>
  )
}
