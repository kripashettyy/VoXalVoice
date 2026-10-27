'use client'
import { useEffect, useRef, useState } from 'react'

interface FeatureProps {
  index: number
  title: string
  description: string
  visual?: React.ReactNode
  eyebrow?: string
}

export default function FeatureSection({ index, title, description, visual, eyebrow }: FeatureProps) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const isEven = index % 2 === 0

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      style={{
        background: '#FFF0F5',
        padding: '80px 24px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 64,
          alignItems: 'center',
          direction: isEven ? 'ltr' : 'rtl',
        }}
        className="feature-grid"
      >
        {/* Text side */}
        <div style={{ direction: 'ltr' }}>
          {eyebrow && (
            <p style={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: '#D4726A',
              textTransform: 'uppercase',
              margin: '0 0 16px',
            }}>
              {eyebrow}
            </p>
          )}
          <h2 style={{
            fontSize: 'clamp(28px, 3.5vw, 44px)',
            fontWeight: 700,
            color: '#1A1A1A',
            margin: '0 0 20px',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}>
            {title}
          </h2>
          <p style={{
            fontSize: 16,
            color: '#5A4A4A',
            lineHeight: 1.7,
            margin: 0,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>
            {description}
          </p>
        </div>

        {/* Visual side */}
        <div style={{ direction: 'ltr' }}>
          <div style={{
            background: '#FDF0F0',
            border: '1px solid #E8D5D0',
            borderRadius: 20,
            minHeight: 280,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {visual ?? <FeatureVisual index={index} />}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .feature-grid {
            grid-template-columns: 1fr !important;
            direction: ltr !important;
            gap: 32px !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          section { opacity: 1 !important; transform: none !important; transition: none !important; }
        }
      `}</style>
    </section>
  )
}

function FeatureVisual({ index }: { index: number }) {
  const visuals = [
    // Voice waveform bars
    <div key="0" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 32 }}>
      {[20, 45, 65, 80, 55, 70, 40, 30, 60, 75, 50, 35, 65, 85, 45].map((h, i) => (
        <div key={i} style={{
          width: 8, height: h,
          background: `hsl(${5 + i * 2}, 65%, ${50 + i}%)`,
          borderRadius: 4,
          animation: `bar-pulse ${0.8 + i * 0.07}s ease-in-out infinite alternate`,
        }} />
      ))}
      <style>{`
        @keyframes bar-pulse {
          from { transform: scaleY(0.6); }
          to   { transform: scaleY(1.1); }
        }
        @media (prefers-reduced-motion: reduce) {
          div[style*="bar-pulse"] { animation: none !important; }
        }
      `}</style>
    </div>,

    // EQ sliders visual
    <div key="1" style={{ padding: 32, width: '100%' }}>
      {[
        { label: 'Warmth', val: 72, color: '#D4726A' },
        { label: 'Clarity', val: 55, color: '#c9a8e0' },
        { label: 'Pitch',   val: 40, color: '#89c4f4' },
        { label: 'Speed',   val: 60, color: '#f5c842' },
      ].map((s) => (
        <div key={s.label} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#5A4A4A', fontWeight: 500 }}>{s.label}</span>
            <span style={{ fontSize: 12, color: '#1A1A1A' }}>{s.val}%</span>
          </div>
          <div style={{ height: 6, background: '#E8D5D0', borderRadius: 3 }}>
            <div style={{ height: '100%', width: `${s.val}%`, background: s.color, borderRadius: 3, transition: 'width 1s ease' }} />
          </div>
        </div>
      ))}
    </div>,

    // Pause injection visual
    <div key="2" style={{ padding: 32, fontFamily: 'Georgia, serif', lineHeight: 1.8, fontSize: 15, color: '#1A1A1A' }}>
      <p style={{ margin: 0 }}>
        Hello
        <span style={{ display: 'inline-block', background: '#D4726A', color: '#fff', fontSize: 10, padding: '1px 5px', borderRadius: 3, margin: '0 4px', verticalAlign: 'middle' }}>300ms</span>
        world. Welcome to VoXalVoice
        <span style={{ display: 'inline-block', background: '#D4726A', color: '#fff', fontSize: 10, padding: '1px 5px', borderRadius: 3, margin: '0 4px', verticalAlign: 'middle' }}>650ms</span>
        <br />
        <br />
        <span style={{ display: 'inline-block', background: '#c9a8e0', color: '#1A1A1A', fontSize: 10, padding: '1px 5px', borderRadius: 3, marginRight: 4, verticalAlign: 'middle' }}>1050ms</span>
        Natural pauses, automatically.
      </p>
    </div>,
  ]
  return visuals[index % visuals.length]
}
