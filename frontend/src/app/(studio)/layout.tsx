import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Studio',
  description:
    'Open the VoXalVoice studio and convert text to speech for free. Choose from 300+ AI neural voices, upload PDF or DOCX, adjust pitch, speed and tone, then download WAV audio instantly.',
  alternates: {
    canonical: '/studio',
  },
  openGraph: {
    title: 'VoXalVoice Studio',
    description:
      'Convert text to natural AI speech online. 300+ voices, PDF upload, pitch & speed controls, WAV download. Free, no sign-up.',
    url: '/studio',
  },
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
