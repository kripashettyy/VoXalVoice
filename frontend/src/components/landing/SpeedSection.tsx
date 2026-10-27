'use client'
import { useEffect, useRef, useState } from 'react'

function useCounter(target: number, duration = 1800, active = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [active, target, duration])
  return count
}

export default function SpeedSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const keyboard = useCounter(45, 1200, visible)
  const flow = useCounter(220, 1800, visible)

  return (
    <section
      ref={ref}
      style={{
        background: '#1a6b55',
        borderRadius: '48px 48px 0 0',
        padding: '72px 24px 0',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 16px' }}>
        <h2 style={{
          fontSize: 'clamp(36px, 5.5vw, 64px)',
          fontWeight: 700,
          color: '#ffffff',
          margin: '0 0 8px',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}>
          4x faster{' '}
          <span style={{ fontWeight: 400, fontStyle: 'italic' }}>than typing</span>
        </h2>
        <p style={{
          fontSize: 'clamp(14px, 1.8vw, 17px)',
          color: 'rgba(255,255,255,0.75)',
          margin: '16px 0 0',
          lineHeight: 1.6,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          Voice that finally works is here. VoXalVoice lets you create, dictate, and produce
          audio at the speed of thought, faster than any keyboard.
        </p>
      </div>

      {/* Stat cards row */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          maxWidth: 780,
          margin: '52px auto 0',
          alignItems: 'flex-end',
          padding: '0 8px',
        }}
      >
        <div
          style={{
            flex: '0 0 220px',
            background: 'rgba(255,255,255,0.12)',
            borderRadius: '18px 18px 0 0',
            padding: '28px 28px 36px',
            color: '#fff',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', margin: '0 0 6px', letterSpacing: '0.01em' }}>
            Keyboard
          </p>
          <p style={{
            fontSize: 'clamp(40px, 5vw, 56px)',
            fontWeight: 700,
            margin: 0,
            lineHeight: 1,
            color: 'rgba(255,255,255,0.85)',
            fontFamily: 'Georgia, "Times New Roman", serif',
            letterSpacing: '-0.02em',
          }}>
            {keyboard} <span style={{ fontSize: '0.42em', fontWeight: 500, fontFamily: 'inherit' }}>wpm</span>
          </p>
        </div>

        <div
          style={{
            flex: 1,
            borderRadius: '18px 18px 0 0',
            overflow: 'hidden',
            position: 'relative',
            minHeight: 220,
          }}
        >
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #3a8fd1 0%, #5bb8e8 40%, #89d4f5 70%, #a8e6f0 100%)',
            filter: 'blur(0px)',
            zIndex: 0,
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(30, 80, 120, 0.35)',
            zIndex: 1,
          }} />

          <ScrollingText />

          <div style={{
            position: 'relative',
            zIndex: 3,
            padding: '28px 28px 36px',
            color: '#fff',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.8)', margin: '0 0 6px', letterSpacing: '0.01em' }}>
              VoXalVoice
            </p>
            <p style={{
              fontSize: 'clamp(44px, 6vw, 68px)',
              fontWeight: 700,
              margin: 0,
              lineHeight: 1,
              color: '#ffffff',
              fontFamily: 'Georgia, "Times New Roman", serif',
              letterSpacing: '-0.02em',
            }}>
              {flow} <span style={{ fontSize: '0.42em', fontWeight: 500, fontFamily: 'inherit' }}>wpm</span>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes stat-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (max-width: 560px) {
          .speed-cards { flex-direction: column !important; align-items: stretch !important; }
          .speed-left  { flex: unset !important; border-radius: 18px 18px 0 0 !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .stat-scroll-track { animation: none !important; }
        }
      `}</style>
    </section>
  )
}

function ScrollingText() {
  const text = "I'm getting started with the project. How would you like to set up the file? I can create a new one from scratch, or pull in something you're already working with. What sounds good?   "
  const repeated = text.repeat(4)

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 2,
      overflow: 'hidden',
      padding: '12px 0',
      background: 'rgba(0,0,0,0.18)',
    }}>
      <div
        className="stat-scroll-track"
        style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          animation: 'stat-scroll 22s linear infinite',
          willChange: 'transform',
        }}
      >
        {[0, 1].map((i) => (
          <span key={i} style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.85)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            letterSpacing: '0.01em',
          }}>
            {repeated}
          </span>
        ))}
      </div>
    </div>
  )
}
