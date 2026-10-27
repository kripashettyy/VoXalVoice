import type { Metadata } from 'next'
import Link from 'next/link'
import StickyNav from '@/components/landing/StickyNav'
import SiteFooter from '@/components/landing/SiteFooter'

export const metadata: Metadata = {
  title: 'Pricing — VoXalVoice',
  description: 'Simple, honest pricing. Start free, no credit card required.',
}

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Everything you need to get started.',
    highlight: false,
    features: [
      'Unlimited text-to-speech generations',
      '300+ neural voices',
      'Real-time pitch, speed, and volume controls',
      'EQ warmth and clarity',
      'WAV download',
      'Up to 20 saved voice profiles',
      'Natural flow mode',
      'No sign-up required',
    ],
    cta: 'Open the studio',
    href: '/studio',
  },
  {
    name: 'Pro',
    price: 'Coming soon',
    period: '',
    description: 'Advanced features for power users and teams.',
    highlight: true,
    features: [
      'Everything in Free',
      'MP3 and FLAC export',
      'Batch processing via API',
      'Custom voice cloning',
      'Priority synthesis queue',
      'Team workspaces',
      'Usage analytics dashboard',
      'Dedicated support',
    ],
    cta: 'Join the waitlist',
    href: 'mailto:narensonu1520@gmail.com',
  },
]

const FAQS = [
  {
    q: 'Is it really free?',
    a: 'Yes. The Free plan has no usage limits, no watermarks, and no credit card required. We mean it.',
  },
  {
    q: 'Will the Free plan stay free?',
    a: 'Yes. The core studio will always be free. Pro features will be additive, not a paywall over existing functionality.',
  },
  {
    q: 'What counts as a generation?',
    a: 'Each time you click Generate or Preview in the studio, that is one synthesis request. There are no daily or monthly caps on the Free plan.',
  },
  {
    q: 'How do I get the Pro plan?',
    a: 'Pro is not released yet. Send us an email to join the early-access waitlist and get notified when it launches.',
  },
]

export default function PricingPage() {
  return (
    <>
      <StickyNav />

      <main style={{ paddingTop: 80, background: '#FFF0F5' }}>

        {/* Hero */}
        <section style={{ padding: '88px 24px 72px', textAlign: 'center' }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
            color: '#D4726A', textTransform: 'uppercase', margin: '0 0 20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>
            Pricing
          </p>
          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 700, color: '#1A1A1A',
            margin: '0 0 8px', lineHeight: 1.08, letterSpacing: '-0.03em',
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}>
            Simple pricing.
          </h1>
          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 400, fontStyle: 'italic',
            color: '#1A1A1A', margin: '0 0 24px', lineHeight: 1.08,
            letterSpacing: '-0.03em', fontFamily: 'Georgia, "Times New Roman", serif',
          }}>
            No surprises.
          </h1>
          <p style={{
            fontSize: 17, color: '#5A4A4A', margin: '0 auto', lineHeight: 1.65,
            maxWidth: 480, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>
            Start for free. No sign-up. No credit card. No hidden limits.
          </p>
        </section>

        {/* Pricing cards */}
        <div style={{ background: '#FFF0F5', paddingBottom: 0 }}>
          <div style={{ background: '#111111', borderRadius: '48px 48px 0 0', overflow: 'hidden' }}>
            <section style={{ padding: '72px 24px 80px' }}>
              <div style={{
                maxWidth: 860, margin: '0 auto',
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20,
              }} className="pricing-grid">
                {PLANS.map((plan) => (
                  <div
                    key={plan.name}
                    style={{
                      background: plan.highlight ? '#FFF0F5' : '#1a1a1a',
                      borderRadius: 28,
                      padding: '40px 36px',
                      border: plan.highlight ? 'none' : '1px solid #222',
                      display: 'flex', flexDirection: 'column',
                      position: 'relative', overflow: 'hidden',
                    }}
                  >
                    {plan.highlight && (
                      <div style={{
                        position: 'absolute', top: 20, right: 20,
                        fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                        textTransform: 'uppercase', color: '#D4726A',
                        background: 'rgba(212,114,106,0.12)',
                        padding: '3px 10px', borderRadius: 20,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      }}>
                        Coming soon
                      </div>
                    )}

                    <p style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                      textTransform: 'uppercase', margin: '0 0 16px',
                      color: plan.highlight ? '#9A8A8A' : '#666',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    }}>
                      {plan.name}
                    </p>

                    <div style={{ marginBottom: 8 }}>
                      <span style={{
                        fontSize: plan.highlight ? 28 : 'clamp(40px, 5vw, 56px)',
                        fontWeight: 700, letterSpacing: '-0.02em',
                        color: plan.highlight ? '#1A1A1A' : '#ffffff',
                        fontFamily: 'Georgia, "Times New Roman", serif',
                      }}>
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span style={{
                          fontSize: 14, color: plan.highlight ? '#9A8A8A' : '#555',
                          marginLeft: 6,
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                        }}>
                          / {plan.period}
                        </span>
                      )}
                    </div>

                    <p style={{
                      fontSize: 14, margin: '0 0 32px', lineHeight: 1.5,
                      color: plan.highlight ? '#5A4A4A' : '#666',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    }}>
                      {plan.description}
                    </p>

                    <ul style={{ listStyle: 'none', margin: '0 0 40px', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {plan.features.map((f) => (
                        <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true">
                            <circle cx="8" cy="8" r="8" fill={plan.highlight ? 'rgba(212,114,106,0.12)' : '#222'}/>
                            <polyline points="4.5,8 7,10.5 11.5,5.5" stroke={plan.highlight ? '#D4726A' : '#555'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span style={{
                            fontSize: 14, lineHeight: 1.5,
                            color: plan.highlight ? '#3A3A3A' : '#aaa',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                          }}>
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div style={{ marginTop: 'auto' }}>
                      <Link href={plan.href} style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '100%', padding: '13px 0',
                        background: plan.highlight ? '#1A1A1A' : 'rgba(255,255,255,0.08)',
                        color: plan.highlight ? '#fff' : '#aaa',
                        border: plan.highlight ? '1.5px solid #D4726A' : '1px solid #333',
                        borderRadius: 12, textDecoration: 'none',
                        fontSize: 14, fontWeight: 600, minHeight: 48,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      }}>
                        {plan.cta}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ background: '#111111' }}>
          <div style={{ background: '#FFF0F5', borderRadius: '48px 48px 0 0', overflow: 'hidden' }}>
            <section style={{ padding: '80px 24px', maxWidth: 720, margin: '0 auto' }}>
              <p style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
                color: '#D4726A', textTransform: 'uppercase', margin: '0 0 16px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}>
                FAQ
              </p>
              <h2 style={{
                fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#1A1A1A',
                margin: '0 0 48px', lineHeight: 1.15, letterSpacing: '-0.02em',
                fontFamily: 'Georgia, "Times New Roman", serif',
              }}>
                Questions about pricing
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {FAQS.map((item, i) => (
                  <div key={i} style={{
                    padding: '24px 0',
                    borderBottom: i < FAQS.length - 1 ? '1px solid rgba(212,114,106,0.15)' : 'none',
                  }}>
                    <h3 style={{
                      fontSize: 17, fontWeight: 600, color: '#1A1A1A',
                      margin: '0 0 10px', letterSpacing: '-0.01em',
                      fontFamily: 'Georgia, "Times New Roman", serif',
                    }}>
                      {item.q}
                    </h3>
                    <p style={{
                      fontSize: 15, color: '#5A4A4A', margin: 0, lineHeight: 1.7,
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    }}>
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: '#FFF0F5' }}>
          <div style={{ background: '#111111', borderRadius: '48px 48px 0 0', overflow: 'hidden' }}>
            <SiteFooter />
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 640px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
