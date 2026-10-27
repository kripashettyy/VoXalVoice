'use client'
import Link from 'next/link'
import ErrorBoundary from '@/components/studio/ErrorBoundary'
import VoiceLab from '@/components/voice-lab/VoiceLab'
import AppHeader from '@/components/shared/AppHeader'

export default function VoiceLabPage() {
  const headerActions = (
    <Link
      href="/studio"
      style={{
        padding: '7px 16px',
        background: '#1A1A1A',
        border: '1.5px solid #D4726A',
        borderRadius: 9999,
        fontSize: 13, fontWeight: 600, color: '#fff',
        minHeight: 36, textDecoration: 'none',
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        transition: 'all 0.15s', whiteSpace: 'nowrap',
      }}
    >
      <svg width="12" height="12" viewBox="0 0 20 18" fill="none" aria-hidden="true">
        <rect x="0"  y="6" width="2.5" height="6"  rx="1.25" fill="#D4726A"/>
        <rect x="4"  y="3" width="2.5" height="12" rx="1.25" fill="#D4726A"/>
        <rect x="8"  y="0" width="2.5" height="18" rx="1.25" fill="#D4726A"/>
        <rect x="12" y="3" width="2.5" height="12" rx="1.25" fill="#D4726A"/>
        <rect x="16" y="6" width="2.5" height="6"  rx="1.25" fill="#D4726A"/>
      </svg>
      Open Studio
    </Link>
  )

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', background: '#FFF0F5' }}>
        <AppHeader pageLabel="Voice Lab" actions={headerActions} />
        <VoiceLab />
      </div>
    </ErrorBoundary>
  )
}
