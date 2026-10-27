import type { Metadata } from 'next'
import StickyNav from '@/components/landing/StickyNav'
import SiteFooter from '@/components/landing/SiteFooter'
import ContactForm from '@/components/contact/ContactForm'

export const metadata: Metadata = {
  title: 'Contact — VoXalVoice',
  description: 'Get in touch with the VoXalVoice team.',
}

const CONTACT_METHODS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    label: 'Email',
    value: 'narensonu1520@gmail.com',
    href: 'mailto:narensonu1520@gmail.com',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.08 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 15.92z"/>
      </svg>
    ),
    label: 'Phone',
    value: '+91 82968 33381',
    href: 'tel:+918296833381',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect x="2" y="9" width="4" height="12"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
    label: 'LinkedIn',
    value: 'linkedin.com/in/narensj20',
    href: 'https://linkedin.com/in/narensj20',
  },
]

export default function ContactPage() {
  return (
    <>
      <StickyNav />

      <main style={{ paddingTop: 80, background: '#FFF0F5' }}>

        {/* Hero */}
        <section style={{ padding: '80px 24px 72px', textAlign: 'center' }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
            color: '#D4726A', textTransform: 'uppercase', margin: '0 0 20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>
            Get in touch
          </p>
          <h1 style={{
            fontSize: 'clamp(38px, 6vw, 68px)', fontWeight: 700, color: '#1A1A1A',
            margin: '0 0 8px', lineHeight: 1.08, letterSpacing: '-0.03em',
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}>
            We would love to
          </h1>
          <h1 style={{
            fontSize: 'clamp(38px, 6vw, 68px)', fontWeight: 400, fontStyle: 'italic',
            color: '#1A1A1A', margin: '0 0 24px', lineHeight: 1.08,
            letterSpacing: '-0.03em', fontFamily: 'Georgia, "Times New Roman", serif',
          }}>
            hear from you.
          </h1>
          <p style={{
            fontSize: 17, color: '#5A4A4A', margin: '0 auto', lineHeight: 1.65, maxWidth: 460,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>
            Questions, feedback, bug reports, or just a hello — fill out the form and we
            will get back to you within 24 hours.
          </p>
        </section>

        {/* Main content */}
        <div style={{ background: '#FFF0F5', paddingBottom: 0 }}>
          <div style={{ background: '#111111', borderRadius: '48px 48px 0 0', overflow: 'hidden' }}>
            <section style={{ padding: '72px 24px 96px' }}>
              <div style={{
                maxWidth: 1040, margin: '0 auto',
                display: 'grid', gridTemplateColumns: '1fr 400px', gap: 48, alignItems: 'start',
              }} className="contact-grid">

                {/* Form */}
                <ContactForm />

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

                  {/* Contact methods */}
                  <div style={{
                    background: '#1a1a1a', borderRadius: 20,
                    border: '1px solid #222', padding: '32px 28px',
                  }}>
                    <p style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                      textTransform: 'uppercase', color: '#555', margin: '0 0 24px',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    }}>
                      Direct contact
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      {CONTACT_METHODS.map((m) => (
                        <a
                          key={m.label}
                          href={m.href}
                          target={m.href.startsWith('http') ? '_blank' : undefined}
                          rel={m.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 14,
                            textDecoration: 'none', color: '#aaa',
                          }}
                        >
                          <div style={{
                            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                            background: 'rgba(212,114,106,0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#D4726A',
                          }}>
                            {m.icon}
                          </div>
                          <div>
                            <p style={{
                              fontSize: 11, color: '#555', margin: '0 0 2px',
                              fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                            }}>
                              {m.label}
                            </p>
                            <p style={{
                              fontSize: 14, color: '#aaa', margin: 0,
                              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                            }}>
                              {m.value}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Response time */}
                  <div style={{
                    background: 'rgba(212,114,106,0.08)', borderRadius: 16,
                    border: '1px solid rgba(212,114,106,0.2)', padding: '20px 24px',
                    display: 'flex', gap: 14, alignItems: 'flex-start',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                      background: 'rgba(212,114,106,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4726A" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                    </div>
                    <div>
                      <p style={{
                        fontSize: 13, fontWeight: 600, color: '#D4726A', margin: '0 0 4px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      }}>
                        Typical response time
                      </p>
                      <p style={{
                        fontSize: 13, color: '#9A8A8A', margin: 0, lineHeight: 1.5,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      }}>
                        Within 24 hours on weekdays. We read every message personally.
                      </p>
                    </div>
                  </div>

                </div>
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
        @media (max-width: 900px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
