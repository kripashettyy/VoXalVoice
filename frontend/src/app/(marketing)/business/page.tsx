import type { Metadata } from 'next'
import Link from 'next/link'
import StickyNav from '@/components/landing/StickyNav'
import SiteFooter from '@/components/landing/SiteFooter'

export const metadata: Metadata = {
  title: 'Business — VoXalVoice',
  description: 'Studio-quality text-to-speech for teams, content studios, and enterprise workflows.',
}

const USE_CASES = [
  {
    eyebrow: 'Content Teams',
    title: 'Scale audio production without scaling headcount',
    description:
      'Turn blog posts, newsletters, and documentation into polished audio in minutes. One voice, one brand, consistent quality across every piece of content you produce.',
    visual: <ContentVisual />,
  },
  {
    eyebrow: 'Product & Engineering',
    title: 'Integrate speech into your product via API',
    description:
      'Hit our REST endpoint directly from your backend. WAV output, streaming support, and configurable voice parameters — no third-party SDK required.',
    visual: <ApiVisual />,
  },
  {
    eyebrow: 'E-Learning & Training',
    title: 'Narrate courses at a fraction of the cost',
    description:
      'Generate consistent voiceovers for slides, walkthroughs, and onboarding flows. Update the script and re-generate instantly — no re-recording sessions.',
    visual: <ElearningVisual />,
  },
]

const STATS = [
  { value: '300+', label: 'Neural voices' },
  { value: '100+', label: 'Languages & locales' },
  { value: '<2s',  label: 'Avg. generation time' },
  { value: '0',    label: 'Sign-ups required' },
]

export default function BusinessPage() {
  return (
    <>
      <StickyNav />

      <main style={{ paddingTop: 80, background: '#FFF0F5' }}>

        {/* Hero */}
        <section style={{
          padding: '88px 24px 96px', textAlign: 'center',
          maxWidth: 860, margin: '0 auto',
        }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
            color: '#D4726A', textTransform: 'uppercase', margin: '0 0 20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>
            VoXalVoice for Business
          </p>
          <h1 style={{
            fontSize: 'clamp(40px, 6.5vw, 76px)', fontWeight: 700,
            color: '#1A1A1A', margin: '0 0 8px', lineHeight: 1.08,
            letterSpacing: '-0.03em', fontFamily: 'Georgia, "Times New Roman", serif',
          }}>
            Voice that works
          </h1>
          <h1 style={{
            fontSize: 'clamp(40px, 6.5vw, 76px)', fontWeight: 400, fontStyle: 'italic',
            color: '#1A1A1A', margin: '0 0 28px', lineHeight: 1.08,
            letterSpacing: '-0.03em', fontFamily: 'Georgia, "Times New Roman", serif',
          }}>
            at any scale.
          </h1>
          <p style={{
            fontSize: 'clamp(15px, 2vw, 18px)', color: '#5A4A4A', margin: '0 auto 44px',
            lineHeight: 1.65, maxWidth: 520,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>
            Studio-quality neural speech for content teams, developers, and enterprise
            workflows. No per-seat licences. No usage caps. Just audio.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/studio" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 30px', background: '#1A1A1A', color: '#fff',
              borderRadius: 9999, textDecoration: 'none', fontSize: 15, fontWeight: 600,
              border: '1.5px solid #D4726A', minHeight: 48,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <rect x="0" y="0" width="6" height="6" rx="1" fill="#D4726A"/>
                <rect x="8" y="0" width="6" height="6" rx="1" fill="#D4726A"/>
                <rect x="0" y="8" width="6" height="6" rx="1" fill="#D4726A"/>
                <rect x="8" y="8" width="6" height="6" rx="1" fill="#D4726A"/>
              </svg>
              Try the studio free
            </Link>
            <a href="mailto:narensonu1520@gmail.com" style={{
              display: 'inline-flex', alignItems: 'center', padding: '13px 30px',
              background: 'transparent', color: '#1A1A1A', borderRadius: 9999,
              textDecoration: 'none', fontSize: 15, fontWeight: 500,
              border: '1.5px solid rgba(26,26,26,0.2)', minHeight: 48,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}>
              Contact sales
            </a>
          </div>
        </section>

        {/* Stats bar */}
        <div style={{ background: '#FFF0F5', paddingBottom: 0 }}>
          <div style={{ background: '#111111', borderRadius: '48px 48px 0 0', overflow: 'hidden' }}>
            <div style={{
              maxWidth: 1080, margin: '0 auto',
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              padding: '64px 48px',
            }} className="stats-grid">
              {STATS.map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <p style={{
                    fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700,
                    color: '#ffffff', margin: '0 0 8px', lineHeight: 1,
                    letterSpacing: '-0.02em', fontFamily: 'Georgia, "Times New Roman", serif',
                  }}>
                    {s.value}
                  </p>
                  <p style={{
                    fontSize: 13, color: '#666', margin: 0, fontWeight: 500,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Use cases */}
        <div style={{ background: '#111111' }}>
          <div style={{ background: '#FFF0F5', borderRadius: '48px 48px 0 0', overflow: 'hidden' }}>
            {USE_CASES.map((item, i) => (
              <UseCaseSection key={i} index={i} {...item} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: '#FFF0F5', paddingBottom: 0 }}>
          <div style={{ background: '#111111', borderRadius: '48px 48px 0 0', overflow: 'hidden' }}>
            <section style={{ padding: '88px 24px', textAlign: 'center' }}>
              <p style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#666',
                textTransform: 'uppercase', margin: '0 0 20px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}>
                Ready to start
              </p>
              <h2 style={{
                fontSize: 'clamp(32px, 5vw, 58px)', fontWeight: 700, color: '#ffffff',
                margin: '0 0 8px', lineHeight: 1.1, letterSpacing: '-0.02em',
                fontFamily: 'Georgia, "Times New Roman", serif',
              }}>
                Your voice.
              </h2>
              <h2 style={{
                fontSize: 'clamp(32px, 5vw, 58px)', fontWeight: 400, fontStyle: 'italic',
                color: '#ffffff', margin: '0 0 32px', lineHeight: 1.1,
                letterSpacing: '-0.02em', fontFamily: 'Georgia, "Times New Roman", serif',
              }}>
                Your audience.
              </h2>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/studio" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '13px 30px', background: '#D4726A', color: '#fff',
                  borderRadius: 9999, textDecoration: 'none', fontSize: 15, fontWeight: 600,
                  minHeight: 48, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  boxShadow: '0 4px 20px rgba(212,114,106,0.4)',
                }}>
                  Open the studio free
                </Link>
                <a href="mailto:narensonu1520@gmail.com" style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '13px 30px', background: 'transparent', color: '#aaa',
                  borderRadius: 9999, textDecoration: 'none', fontSize: 15, fontWeight: 500,
                  border: '1.5px solid #333', minHeight: 48,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}>
                  Talk to us
                </a>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: '#111111' }}>
          <SiteFooter />
        </div>
      </main>

      <style>{`
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; gap: 32px; padding: 48px 24px !important; }
        }
      `}</style>
    </>
  )
}

function UseCaseSection({ index, eyebrow, title, description, visual }: {
  index: number; eyebrow: string; title: string; description: string; visual: React.ReactNode
}) {
  const isEven = index % 2 === 0
  return (
    <section style={{ padding: '80px 24px' }}>
      <div style={{
        maxWidth: 1080, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 64, alignItems: 'center',
        direction: isEven ? 'ltr' : 'rtl',
      }} className="feature-grid">
        <div style={{ direction: 'ltr' }}>
          <p style={{
            fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em',
            color: '#D4726A', textTransform: 'uppercase', margin: '0 0 16px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>{eyebrow}</p>
          <h2 style={{
            fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 700, color: '#1A1A1A',
            margin: '0 0 20px', lineHeight: 1.15, letterSpacing: '-0.02em',
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}>{title}</h2>
          <p style={{
            fontSize: 16, color: '#5A4A4A', lineHeight: 1.7, margin: 0,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>{description}</p>
        </div>
        <div style={{ direction: 'ltr' }}>
          <div style={{
            background: '#FDF0F0', border: '1px solid rgba(212,114,106,0.2)',
            borderRadius: 24, minHeight: 260,
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          }}>
            {visual}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .feature-grid { grid-template-columns: 1fr !important; direction: ltr !important; gap: 32px !important; }
        }
      `}</style>
    </section>
  )
}

function ContentVisual() {
  return (
    <div style={{ padding: 32, width: '100%' }}>
      {['Blog post', 'Newsletter', 'Documentation', 'Course module'].map((label, i) => (
        <div key={label} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', marginBottom: 8, borderRadius: 10,
          background: i === 1 ? 'rgba(212,114,106,0.1)' : '#fff',
          border: `1px solid ${i === 1 ? 'rgba(212,114,106,0.3)' : 'rgba(0,0,0,0.06)'}`,
        }}>
          <span style={{ fontSize: 13, color: '#1A1A1A', fontWeight: 500, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>{label}</span>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
            background: i === 1 ? '#D4726A' : 'rgba(0,0,0,0.06)',
            color: i === 1 ? '#fff' : '#9A8A8A',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>{i === 1 ? 'Generating…' : i < 1 ? 'Done' : 'Queued'}</span>
        </div>
      ))}
    </div>
  )
}

function ApiVisual() {
  return (
    <div style={{ padding: 28, width: '100%', fontFamily: 'ui-monospace, "Cascadia Code", monospace' }}>
      <div style={{ background: '#1A1A1A', borderRadius: 12, padding: '16px 18px' }}>
        <p style={{ margin: '0 0 4px', fontSize: 11, color: '#666' }}>POST /api/v1/synthesize</p>
        <p style={{ margin: 0, fontSize: 12, color: '#aaa', lineHeight: 1.7 }}>
          <span style={{ color: '#D4726A' }}>"voice_id"</span>: <span style={{ color: '#c9a8e0' }}>"en-US-AriaNeural"</span>,<br/>
          <span style={{ color: '#D4726A' }}>"speed"</span>: <span style={{ color: '#89c4f4' }}>1.0</span>,<br/>
          <span style={{ color: '#D4726A' }}>"warmth"</span>: <span style={{ color: '#89c4f4' }}>0.6</span>
        </p>
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #333' }}>
          <p style={{ margin: 0, fontSize: 11, color: '#4CAF50' }}>200 OK — audio/wav stream</p>
        </div>
      </div>
    </div>
  )
}

function ElearningVisual() {
  const steps = ['Introduction', 'Module 1', 'Quiz', 'Module 2', 'Summary']
  return (
    <div style={{ padding: 32, width: '100%' }}>
      {steps.map((s, i) => (
        <div key={s} style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            background: i < 2 ? '#D4726A' : i === 2 ? 'rgba(212,114,106,0.3)' : 'rgba(0,0,0,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {i < 2
              ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
              : <span style={{ fontSize: 10, color: i === 2 ? '#D4726A' : '#ccc', fontWeight: 700 }}>{i + 1}</span>
            }
          </div>
          <span style={{
            fontSize: 13, color: i < 2 ? '#1A1A1A' : '#9A8A8A', fontWeight: i < 2 ? 600 : 400,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>{s}</span>
          {i < 2 && (
            <span style={{
              marginLeft: 'auto', fontSize: 11, color: '#D4726A', fontWeight: 600,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}>Narrated</span>
          )}
        </div>
      ))}
    </div>
  )
}
