import type { Metadata } from 'next'
import StickyNav from '@/components/landing/StickyNav'
import SiteFooter from '@/components/landing/SiteFooter'
import GuideContent from '@/components/guide/GuideContent'

export const metadata: Metadata = {
  title: 'Guide',
  description: 'Learn how to use every feature of VoXalVoice — Studio, Voice-over, Subtitle to Voice, SSML Editor, Dialogue, and Voice Lab.',
  alternates: { canonical: '/guide' },
}

export default function GuidePage() {
  return (
    <>
      <StickyNav />

      <main style={{ paddingTop: 80, background: '#FFF0F5' }}>
        {/* Hero */}
        <section style={{ padding: '80px 24px 0', textAlign: 'center' }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
            color: '#D4726A', textTransform: 'uppercase', margin: '0 0 18px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>
            Documentation
          </p>
          <h1 style={{
            fontSize: 'clamp(38px, 6vw, 68px)', fontWeight: 700,
            color: '#1A1A1A', margin: '0 0 8px', lineHeight: 1.08,
            letterSpacing: '-0.03em', fontFamily: 'Georgia, "Times New Roman", serif',
          }}>
            How to use VoXalVoice.
          </h1>
          <h1 style={{
            fontSize: 'clamp(38px, 6vw, 68px)', fontWeight: 400, fontStyle: 'italic',
            color: '#1A1A1A', margin: '0 0 24px', lineHeight: 1.08,
            letterSpacing: '-0.03em', fontFamily: 'Georgia, "Times New Roman", serif',
          }}>
            Every feature, explained.
          </h1>
          <p style={{
            fontSize: 17, color: '#5A4A4A', margin: '0 auto 60px', lineHeight: 1.65,
            maxWidth: 500, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>
            Pick a feature from the sidebar and follow the steps. Everything is free — no sign-up needed.
          </p>
        </section>

        {/* Guide body — dark card */}
        <div style={{ background: '#FFF0F5' }}>
          <div style={{ background: '#fff', borderRadius: '48px 48px 0 0', overflow: 'hidden', borderTop: '1px solid rgba(212,114,106,0.12)' }}>
            <GuideContent />
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: '#fff' }}>
          <div style={{ background: '#111111', borderRadius: '48px 48px 0 0', overflow: 'hidden' }}>
            <SiteFooter />
          </div>
        </div>
      </main>
    </>
  )
}
