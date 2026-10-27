'use client'
import { useState } from 'react'
import Link from 'next/link'
import ErrorBoundary from '@/components/studio/ErrorBoundary'
import TextInputArea from '@/components/studio/TextInputArea'
import VoiceSelector from '@/components/studio/VoiceSelector'
import ParameterPanel from '@/components/studio/ParameterPanel'
import WaveformVisualizer from '@/components/studio/WaveformVisualizer'
import PlaybackControls from '@/components/studio/PlaybackControls'
import DownloadButton from '@/components/studio/DownloadButton'
import ProfileManager from '@/components/studio/ProfileManager'
import VoiceAnalyzerPanel from '@/components/studio/VoiceAnalyzerPanel'
import StatusLiveRegion from '@/components/studio/StatusLiveRegion'
import ActionBar from '@/components/studio/ActionBar'
import AppHeader from '@/components/shared/AppHeader'

export default function StudioPage() {
  const [text, setText] = useState('')
  const [showAnalyzer, setShowAnalyzer] = useState(false)

  const headerActions = (
    <button
      onClick={() => setShowAnalyzer(v => !v)}
      aria-label="Toggle voice analyzer"
      aria-pressed={showAnalyzer}
      style={{
        padding: '7px 14px',
        background: showAnalyzer ? '#D4726A' : 'rgba(212,114,106,0.08)',
        border: '1.5px solid rgba(212,114,106,0.25)',
        borderRadius: 9999, cursor: 'pointer',
        fontSize: 13, fontWeight: 500,
        color: showAnalyzer ? '#fff' : '#D4726A',
        minHeight: 36, whiteSpace: 'nowrap',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {showAnalyzer ? 'Hide analyzer' : 'Analyzer'}
    </button>
  )

  return (
    <ErrorBoundary>
      <StatusLiveRegion />

      <div style={{ minHeight: '100vh', background: '#FFF0F5', paddingBottom: 96 }}>

        <AppHeader pageLabel="Studio" actions={headerActions} />

        {/* ── Main 3-column grid ── */}
        <div
          className="studio-grid"
          style={{
            maxWidth: 1440,
            margin: '0 auto',
            padding: '28px 24px',
            display: 'grid',
            gridTemplateColumns: '270px 1fr 300px',
            gap: 20,
            alignItems: 'start',
          }}
        >
          {/* Left — Profiles */}
          <aside style={{ position: 'sticky', top: 84 }}>
            <ProfileManager />
          </aside>

          {/* Centre — Text + Waveform + Controls */}
          <main style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
            <div className="studio-card">
              <VoiceSelector />
              <TextInputArea onTextChange={setText} />
            </div>
            <div className="studio-card">
              <WaveformVisualizer />
            </div>
            <div className="studio-card">
              <PlaybackControls text={text} />
            </div>
            <DownloadButton text={text} />
            {showAnalyzer && (
              <div className="studio-card">
                <VoiceAnalyzerPanel onClose={() => setShowAnalyzer(false)} />
              </div>
            )}
          </main>

          {/* Right — Parameters */}
          <aside style={{ position: 'sticky', top: 84 }}>
            <div className="studio-card">
              <div style={{ padding: '4px 0 12px', borderBottom: '1px solid rgba(212,114,106,0.15)', marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                  Voice Parameters
                </p>
              </div>
              <ParameterPanel />
            </div>
          </aside>
        </div>
      </div>

      <div className="studio-mobile-bar">
        <ActionBar text={text} />
      </div>

      <style>{`
        .studio-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 20px;
          border: 1px solid rgba(212,114,106,0.12);
          box-shadow: 0 2px 12px rgba(212,114,106,0.06);
        }
        @media (max-width: 1280px) {
          .studio-grid { grid-template-columns: 1fr 280px !important; }
          .studio-grid > aside:first-child { grid-column: 1 / -1 !important; position: static !important; }
        }
        @media (max-width: 768px) {
          .studio-grid { grid-template-columns: 1fr !important; }
          .studio-grid > aside { position: static !important; }
        }
        @media (min-width: 769px) {
          .studio-mobile-bar { display: none !important; }
        }
      `}</style>
    </ErrorBoundary>
  )
}
