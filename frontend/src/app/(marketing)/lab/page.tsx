import type { Metadata } from 'next'
import Link from 'next/link'
import StickyNav from '@/components/landing/StickyNav'
import SiteFooter from '@/components/landing/SiteFooter'

export const metadata: Metadata = {
  title: 'Lab — VoXalVoice',
  description: 'Experimental features, research notes, and what we are building next.',
}

const EXPERIMENTS = [
  {
    status: 'In progress',
    statusColor: '#D4726A',
    title: 'Voice cloning',
    description:
      'Upload a 30-second audio sample and generate a custom voice model. Early results are promising — we are working on quality consistency across accents.',
    tag: 'Audio ML',
  },
  {
    status: 'Research',
    statusColor: '#c9a8e0',
    title: 'Emotion-aware synthesis',
    description:
      'Inject emotion cues (calm, excited, concerned) into the synthesis pipeline via extended SSML. Currently exploring prosody models that generalise across voices.',
    tag: 'SSML',
  },
  {
    status: 'Prototyping',
    statusColor: '#89c4f4',
    title: 'Real-time streaming playback',
    description:
      'Begin playing audio before generation completes. Requires a true streaming decoder on the client — we have a working prototype with ~400ms first-byte latency.',
    tag: 'Streaming',
  },
  {
    status: 'Planned',
    statusColor: '#888',
    title: 'Multilingual voice switching',
    description:
      'Automatically switch voices mid-sentence when the language changes. Useful for mixed-language scripts without manual segmentation.',
    tag: 'NLP',
  },
  {
    status: 'Planned',
    statusColor: '#888',
    title: 'Background score mixing',
    description:
      'Layer synthesized speech over royalty-free background music with automatic ducking. Output as a single mixed-down WAV or stereo stems.',
    tag: 'Audio processing',
  },
  {
    status: 'Shipped',
    statusColor: '#4CAF50',
    title: 'Natural flow SSML injection',
    description:
      'Automatic pause injection at sentence and paragraph boundaries using a rule-based prosody processor. Live in the studio today.',
    tag: 'Prosody',
  },
]

const PRINCIPLES = [
  {
    title: 'No black boxes',
    description: 'Every parameter in the studio maps to a concrete audio effect. We document what each slider does at the signal level.',
  },
  {
    title: 'Progressively disclosed complexity',
    description: 'The default experience is one click. Advanced controls are there when you need them, hidden when you do not.',
  },
  {
    title: 'Offline-first fallback',
    description: 'If the neural engine is unavailable, synthesis continues via eSpeak-NG. The studio never leaves you with silence.',
  },
  {
    title: 'Browser as the platform',
    description: 'No installed software, no app store, no driver. If you have a browser, you have the studio.',
  },
]

export default function LabPage() {
  return (
    <>
      <StickyNav />

      <main style={{ paddingTop: 80, background: '#FFF0F5' }}>

        {/* Hero */}
        <section style={{ padding: '88px 24px 80px', textAlign: 'center' }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
            color: '#D4726A', textTransform: 'uppercase', margin: '0 0 20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>
            VoXalVoice Lab
          </p>
          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 700, color: '#1A1A1A',
            margin: '0 0 8px', lineHeight: 1.08, letterSpacing: '-0.03em',
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}>
            What we are
          </h1>
          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 400, fontStyle: 'italic',
            color: '#1A1A1A', margin: '0 0 28px', lineHeight: 1.08,
            letterSpacing: '-0.03em', fontFamily: 'Georgia, "Times New Roman", serif',
          }}>
            building next.
          </h1>
          <p style={{
            fontSize: 17, color: '#5A4A4A', margin: '0 auto',
            lineHeight: 1.65, maxWidth: 520,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>
            A transparent view into active research, experiments in progress, and
            features we are planning. Nothing is final until it ships.
          </p>
        </section>

        {/* Experiments — dark section */}
        <div style={{ background: '#FFF0F5' }}>
          <div style={{ background: '#111111', borderRadius: '48px 48px 0 0', overflow: 'hidden' }}>
            <section style={{ padding: '72px 24px 80px', maxWidth: 1080, margin: '0 auto' }}>
              <p style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#555',
                textTransform: 'uppercase', margin: '0 0 16px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}>
                Experiments
              </p>
              <h2 style={{
                fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#ffffff',
                margin: '0 0 56px', lineHeight: 1.15, letterSpacing: '-0.02em',
                fontFamily: 'Georgia, "Times New Roman", serif',
              }}>
                Active research &amp; upcoming features
              </h2>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
              }} className="lab-grid">
                {EXPERIMENTS.map((exp) => (
                  <div key={exp.title} style={{
                    background: '#1a1a1a', border: '1px solid #222',
                    borderRadius: 20, padding: '28px 24px',
                    display: 'flex', flexDirection: 'column', gap: 14,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: exp.statusColor,
                        background: `${exp.statusColor}18`,
                        padding: '3px 10px', borderRadius: 20,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                        letterSpacing: '0.04em',
                      }}>
                        {exp.status}
                      </span>
                      <span style={{
                        fontSize: 11, color: '#444', fontWeight: 500,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      }}>
                        {exp.tag}
                      </span>
                    </div>
                    <h3 style={{
                      fontSize: 18, fontWeight: 700, color: '#ffffff',
                      margin: 0, letterSpacing: '-0.01em',
                      fontFamily: 'Georgia, "Times New Roman", serif',
                    }}>
                      {exp.title}
                    </h3>
                    <p style={{
                      fontSize: 14, color: '#888', lineHeight: 1.65, margin: 0,
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    }}>
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Principles */}
        <div style={{ background: '#111111' }}>
          <div style={{ background: '#FFF0F5', borderRadius: '48px 48px 0 0', overflow: 'hidden' }}>
            <section style={{ padding: '80px 24px', maxWidth: 1080, margin: '0 auto' }}>
              <p style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
                color: '#D4726A', textTransform: 'uppercase', margin: '0 0 16px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}>
                Principles
              </p>
              <h2 style={{
                fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#1A1A1A',
                margin: '0 0 56px', lineHeight: 1.15, letterSpacing: '-0.02em',
                fontFamily: 'Georgia, "Times New Roman", serif',
              }}>
                How we think about audio
              </h2>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32,
              }} className="principles-grid">
                {PRINCIPLES.map((p) => (
                  <div key={p.title} style={{
                    padding: '32px 28px', background: '#ffffff',
                    borderRadius: 20, border: '1px solid rgba(212,114,106,0.12)',
                    boxShadow: '0 2px 12px rgba(212,114,106,0.05)',
                  }}>
                    <h3 style={{
                      fontSize: 18, fontWeight: 700, color: '#1A1A1A',
                      margin: '0 0 12px', letterSpacing: '-0.01em',
                      fontFamily: 'Georgia, "Times New Roman", serif',
                    }}>
                      {p.title}
                    </h3>
                    <p style={{
                      fontSize: 15, color: '#5A4A4A', lineHeight: 1.7, margin: 0,
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    }}>
                      {p.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: '#FFF0F5' }}>
          <div style={{ background: '#111111', borderRadius: '48px 48px 0 0', overflow: 'hidden' }}>
            <section style={{ padding: '80px 24px', textAlign: 'center' }}>
              <h2 style={{
                fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: '#ffffff',
                margin: '0 0 8px', lineHeight: 1.15, letterSpacing: '-0.02em',
                fontFamily: 'Georgia, "Times New Roman", serif',
              }}>
                Have an idea or feedback?
              </h2>
              <p style={{
                fontSize: 16, color: '#666', margin: '0 auto 36px', lineHeight: 1.65, maxWidth: 460,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}>
                We read every message. Tell us what you want to see in the lab.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="mailto:narensonu1520@gmail.com" style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '13px 30px', background: '#D4726A', color: '#fff',
                  borderRadius: 9999, textDecoration: 'none', fontSize: 14, fontWeight: 600,
                  minHeight: 48, boxShadow: '0 4px 20px rgba(212,114,106,0.4)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}>
                  Send feedback
                </a>
                <Link href="/studio" style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '13px 30px', background: 'transparent', color: '#aaa',
                  borderRadius: 9999, textDecoration: 'none', fontSize: 14, fontWeight: 500,
                  border: '1.5px solid #333', minHeight: 48,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}>
                  Try the studio
                </Link>
              </div>
            </section>

            <SiteFooter />
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 900px) {
          .lab-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .lab-grid { grid-template-columns: 1fr !important; }
          .principles-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
