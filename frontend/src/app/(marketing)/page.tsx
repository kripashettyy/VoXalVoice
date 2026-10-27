import type { Metadata } from 'next'
import StickyNav from '@/components/landing/StickyNav'
import HeroSection from '@/components/landing/HeroSection'
import SocialProofBar from '@/components/landing/SocialProofBar'
import SpeedSection from '@/components/landing/SpeedSection'
import FeatureSection from '@/components/landing/FeatureSection'
import HowItWorks from '@/components/landing/HowItWorks'
import FAQAccordion from '@/components/landing/FAQAccordion'
import AstronautFloat from '@/components/landing/AstronautFloat'
import CTASection from '@/components/landing/CTASection'
import SiteFooter from '@/components/landing/SiteFooter'

export const metadata: Metadata = {
  title: {
    absolute: 'VoXalVoice',
  },
  description:
    'Turn any text into natural AI speech for free. VoXalVoice offers 300+ neural voices, PDF & DOCX upload, pitch/speed/tone controls, and instant WAV download — no sign-up needed.',
  alternates: {
    canonical: '/',
  },
}
import WelcomeGreeting from '@/components/landing/WelcomeGreeting'

const FEATURES = [
  {
    eyebrow: 'Voices',
    title: 'Natural-sounding voices for every use case',
    description:
      'Choose from dozens of neural voices across accents and genders. Fine-tune pitch, speed, and warmth until it sounds exactly right for your audience.',
  },
  {
    eyebrow: 'EQ Controls',
    title: 'Studio-grade EQ, right in the browser',
    description:
      'Boost warmth for a richer, warmer tone or dial up clarity for crisper articulation. Every change plays back instantly so you hear it before you download.',
  },
  {
    eyebrow: 'Natural Flow',
    title: 'Smart pauses that make speech feel human',
    description:
      'Natural flow automatically injects SSML pauses at commas, sentence ends, and paragraph breaks — so your audio sounds conversational, not robotic.',
  },
]

const HOW_IT_WORKS_STEPS = [
  { label: 'Enter your text', description: 'Type or paste up to 10,000 characters into the studio editor.' },
  { label: 'Pick a voice and tune the settings', description: 'Choose a voice, adjust pitch and speed, and dial in warmth and clarity.' },
  { label: 'Preview or generate', description: 'Click preview to hear the first 200 characters instantly, then generate the full audio.' },
  { label: 'Download your file', description: 'Download the finished WAV file with a single click, ready to use anywhere.' },
]

const FAQ_ITEMS = [
  { question: 'Is VoXalVoice free to use?', answer: 'Yes, VoXalVoice is free to use in your browser with no sign-up required.' },
  { question: 'What languages are supported?', answer: 'The default voice set covers English. Additional locales are available through the voice selector in the studio.' },
  { question: 'Can I save my voice settings?', answer: 'Yes. Use the profile manager in the studio to save and reload up to 20 named profiles, each storing all your parameter settings.' },
  { question: 'What audio format does it export?', answer: 'The studio exports standard WAV files (16-bit PCM, 22050 Hz) compatible with all major video and audio editors.' },
  { question: 'Does it work offline?', answer: 'The primary neural engine requires an internet connection. If unavailable, the studio automatically falls back to eSpeak-NG for offline synthesis.' },
  { question: 'How does the EQ processor work?', answer: 'Warmth applies a low-shelf boost at 250 Hz (up to +6 dB) and clarity applies a high-shelf boost at 4000 Hz (up to +6 dB), both using SOS biquad filters.' },
]

export default function LandingPage() {
  return (
    <>
      <WelcomeGreeting />
      <StickyNav />

      {/* Root bg is cream — hero lives here */}
      <main style={{ paddingTop: 80, background: '#FFF0F5', position: 'relative' }}>

        {/* Cracked earth texture on nav pad area */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 80,
          zIndex: 0, opacity: 0.07, pointerEvents: 'none',
        }}>
          <div style={{ width: '100%', height: '100%', backgroundColor: '#191919', filter: 'url(#main-cracks)' }} />
          <svg width={0} height={0} style={{ position: 'absolute' }}>
            <defs>
              <filter id="main-cracks">
                <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={5} seed={10} result="noise" />
                <feColorMatrix type="luminanceToAlpha" in="noise" result="alphaNoise" />
                <feComponentTransfer in="alphaNoise" result="plates">
                  <feFuncA type="discrete" tableValues="0 1" />
                </feComponentTransfer>
                <feConvolveMatrix order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" in="plates" result="edges" />
                <feComponentTransfer in="edges" result="invertedEdges">
                  <feFuncR type="table" tableValues="1 0" />
                  <feFuncG type="table" tableValues="1 0" />
                  <feFuncB type="table" tableValues="1 0" />
                </feComponentTransfer>
                <feFlood floodColor="#000" result="bgColor" />
                <feComposite operator="in" in="bgColor" in2="invertedEdges" />
              </filter>
            </defs>
          </svg>
        </div>

        <HeroSection />

        {/*
          Layered card stack:
          Hero (cream) → black card curves up from bottom
          Black card   → green card curves up from black
          Green card   → cream features section continues below
        */}

        {/* Layer 1: cream background behind the black card's top curve */}
        <div style={{ background: '#FFF0F5', paddingBottom: 0 }}>
          {/* Layer 2: black card — top corners curve up into cream */}
          <div style={{ background: '#111111', borderRadius: '48px 48px 0 0', overflow: 'hidden' }}>
            <SocialProofBar />

            {/* Layer 3: green card curves up inside the black card */}
            <div style={{ marginTop: -28, position: 'relative', zIndex: 1 }}>
              <SpeedSection />
            </div>
          </div>
        </div>

        {/* Features — cream, curves up from green */}
        <div style={{ background: '#1a6b55' /* green bg behind features' curve */ }}>
          <div style={{ background: '#FFF0F5', borderRadius: '48px 48px 0 0', overflow: 'hidden' }}>
            <div id="features">
              {FEATURES.map((f, i) => (
                <FeatureSection
                  key={i}
                  index={i}
                  title={f.title}
                  description={f.description}
                  eyebrow={f.eyebrow}
                />
              ))}
            </div>
          </div>
        </div>

        {/* HowItWorks — dark, curves up from cream */}
        <div style={{ background: '#FFF0F5' }}>
          <div style={{ background: '#1A1A1A', borderRadius: '48px 48px 0 0', overflow: 'hidden' }}>
            <HowItWorks steps={HOW_IT_WORKS_STEPS} />
          </div>
        </div>

        {/* FAQ — light, curves up from dark HowItWorks */}
        <div style={{ background: '#1A1A1A' }}>
          <div style={{ background: '#FFF0F5', borderRadius: '48px 48px 0 0', overflow: 'hidden' }}>
            <FAQAccordion items={FAQ_ITEMS} />
          </div>
        </div>

        {/* Astronaut — dark, curves up from FAQ cream */}
        <div style={{ background: '#FFF0F5' }}>
          <div style={{ background: '#111111', borderRadius: '48px 48px 0 0', overflow: 'hidden' }}>
            <AstronautFloat />
          </div>
        </div>

        {/* CTA — cream, curves up from dark */}
        <div style={{ background: '#111111' }}>
          <div style={{ background: '#FFF0F5', borderRadius: '48px 48px 0 0', overflow: 'hidden' }}>
            <CTASection />
          </div>
        </div>

        {/* Footer — dark, curves up from cream CTA */}
        <div style={{ background: '#FFF0F5' }}>
          <div style={{ background: '#111111', borderRadius: '48px 48px 0 0', overflow: 'hidden' }}>
            <SiteFooter />
          </div>
        </div>
      </main>
    </>
  )
}
