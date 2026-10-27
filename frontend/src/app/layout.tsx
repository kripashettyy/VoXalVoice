import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://voxal-voice.vercel.app/'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: 'VoXalVoice',
    template: '%s | VoXalVoice',
  },

  description:
    'VoXalVoice is a free AI-powered text-to-speech studio. Convert text to natural voice online instantly. Choose from 300+ neural voices, adjust pitch, speed & tone, and download WAV audio. No sign-up needed.',

  keywords: [
    // Core TTS
    'text to speech', 'text to speech online', 'free text to speech', 'text to speech converter',
    'text to voice', 'convert text to speech', 'text to audio', 'online text to speech',
    'ai text to speech', 'ai voice generator', 'ai speech generator', 'neural text to speech',
    // Voice qualities
    'natural sounding text to speech', 'realistic text to speech', 'human voice generator',
    'lifelike voice', 'natural voice synthesis', 'voice synthesis online',
    // Use cases
    'text to speech for videos', 'text to speech for youtube', 'text to speech for podcasts',
    'text to speech for audiobooks', 'text to speech for presentations', 'text to speech for e-learning',
    'text to speech for accessibility', 'voice over generator', 'voiceover generator free',
    // Document
    'pdf to speech', 'pdf to voice', 'document to speech', 'read pdf aloud', 'read document aloud',
    'docx to speech', 'word document to voice',
    // Brand / product
    'VoXalVoice', 'vocalvoice', 'vocal voice studio', 'voice studio online',
    // Technical
    'edge tts', 'microsoft neural voice', 'speech synthesis', 'tts engine', 'wav download',
    // Long tail
    'best free text to speech 2025', 'best ai voice generator 2025', 'free tts no signup',
    'free voice generator no sign up', 'text to speech with pitch control',
    'text to speech with speed control', 'customizable text to speech',
    'text to speech browser', 'text to speech no download',
  ],

  authors: [{ name: 'VoXalVoice' }],
  creator: 'VoXalVoice',
  publisher: 'VoXalVoice',

  category: 'technology',

  alternates: {
    canonical: BASE_URL,
  },

  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
    shortcut: '/icon.svg',
  },

  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: 'VoXalVoice',
    title: 'VoXalVoice — Free AI Text to Speech Studio | 300+ Neural Voices',
    description:
      'Convert any text to natural-sounding speech instantly. Free AI voice generator with 300+ neural voices, pitch & speed controls, PDF/DOCX upload, and WAV download. No sign-up required.',
    images: [
      {
        url: '/icon.svg',
        width: 512,
        height: 512,
        alt: 'VoXalVoice — AI Text to Speech Studio',
        type: 'image/svg+xml',
      },
    ],
    locale: 'en_US',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'VoXalVoice — Free AI Text to Speech Studio',
    description:
      'Free AI-powered text-to-speech with 300+ neural voices. Adjust pitch, speed & tone. Upload PDFs. Download WAV. No sign-up needed.',
    images: ['/icon.svg'],
    creator: '@vocalvoice',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  verification: {
    // Add your Google Search Console verification token here when you have it
    // google: 'your-google-site-verification-token',
  },
}

// JSON-LD structured data for Google rich results
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': `${BASE_URL}/#webapp`,
      name: 'VoXalVoice',
      url: BASE_URL,
      description:
        'Free AI-powered text-to-speech studio with 300+ neural voices, PDF/DOCX upload, pitch, speed and tone controls, and WAV download.',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free to use, no sign-up required',
      },
      featureList: [
        'Convert text to speech online for free',
        '300+ AI neural voices',
        'Adjust pitch, speed, volume, warmth and clarity',
        'Upload PDF or DOCX and convert to audio',
        'Download output as WAV',
        'No sign-up or account required',
        'Works in any browser',
      ],
    },
    {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#org`,
      name: 'VoXalVoice',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/icon.svg`,
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      url: BASE_URL,
      name: 'VoXalVoice',
      description: 'Free AI Text to Speech Studio',
      publisher: { '@id': `${BASE_URL}/#org` },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${BASE_URL}/studio`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is VoXalVoice free to use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. VoXalVoice is completely free to use with no sign-up required. Open the studio in your browser and start converting text to speech instantly.',
          },
        },
        {
          '@type': 'Question',
          name: 'What voices does VoXalVoice support?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'VoXalVoice supports 300+ neural AI voices powered by Microsoft Edge TTS, covering English, Spanish, French, Hindi, and many more languages.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I upload a PDF or Word document to convert to speech?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. VoXalVoice lets you upload PDF (.pdf) and Word (.docx) documents. The text is extracted automatically and fed into the TTS studio.',
          },
        },
        {
          '@type': 'Question',
          name: 'What audio format does VoXalVoice export?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'VoXalVoice exports high-quality WAV audio files which you can download directly from the studio.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need to install anything to use VoXalVoice?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No installation needed. VoXalVoice runs entirely in your web browser with no downloads or sign-up required.',
          },
        },
      ],
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
