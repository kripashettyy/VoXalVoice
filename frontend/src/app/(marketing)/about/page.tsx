import type { Metadata } from 'next'
import StickyNav from '@/components/landing/StickyNav'
import SiteFooter from '@/components/landing/SiteFooter'
import AboutHero from '@/components/about/AboutHero'
import AboutMission from '@/components/about/AboutMission'
import AboutContributors from '@/components/about/AboutContributors'
import AboutOpenSource from '@/components/about/AboutOpenSource'

export const metadata: Metadata = {
  title: 'About',
  description:
    'VoXalVoice is a free, open-source AI text-to-speech studio. Learn about the project, our mission, and the contributors who built it.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <>
      <StickyNav />

      <main style={{ paddingTop: 0 }}>
        {/* Hero — cream */}
        <AboutHero />

        {/* Mission — cream continues */}
        <div style={{ background: '#FFF0F5' }}>
          <AboutMission />
        </div>

        {/* Contributors — dark card curves up from cream */}
        <div style={{ background: '#FFF0F5' }}>
          <div style={{ background: '#1A1A1A', borderRadius: '48px 48px 0 0', overflow: 'hidden' }}>
            <AboutContributors />
          </div>
        </div>

        {/* Open source — cream curves up from dark */}
        <div style={{ background: '#1A1A1A' }}>
          <div style={{ background: '#FFF0F5', borderRadius: '48px 48px 0 0', overflow: 'hidden' }}>
            <AboutOpenSource />
          </div>
        </div>

        {/* Footer — dark curves up from cream */}
        <div style={{ background: '#FFF0F5' }}>
          <div style={{ background: '#111111', borderRadius: '48px 48px 0 0', overflow: 'hidden' }}>
            <SiteFooter />
          </div>
        </div>
      </main>
    </>
  )
}
