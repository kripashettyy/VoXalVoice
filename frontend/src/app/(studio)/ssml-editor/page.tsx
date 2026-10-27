'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import AppHeader from '@/components/shared/AppHeader'
import ErrorBoundary from '@/components/studio/ErrorBoundary'
import SsmlEditor from '@/components/ssml-editor/SsmlEditor'
import VoiceoverVoiceSelector from '@/components/voiceover/VoiceoverVoiceSelector'
import { preview } from '@/lib/api/synthesize'
import { useVoiceParams } from '@/store/voiceParams'

export default function SsmlEditorPage() {
  const params = useVoiceParams()
  const [voiceId, setVoiceId] = useState(params.voiceId || 'en-US-AriaNeural')
  const voiceIdRef = useRef(voiceId)
  voiceIdRef.current = voiceId

  useEffect(() => { useVoiceParams.getState().setParam('voiceId', voiceId) }, [voiceId])

  const synthesize = useCallback(async (text: string, pitchOverride?: number, speedOverride?: number): Promise<ArrayBuffer> => {
    return preview(text, {
      voiceId: voiceIdRef.current,
      pitch: pitchOverride ?? params.pitch,
      speed: speedOverride ?? params.speed,
      volume: params.volume,
      tonePreset: params.tonePreset,
      naturalFlow: false,
      warmth: params.warmth / 100,
      clarity: params.clarity / 100,
      outputFormat: 'wav',
    })
  }, [params.pitch, params.speed, params.volume, params.tonePreset, params.warmth, params.clarity])

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', background: '#FFF0F5', paddingBottom: 80 }}>
        <AppHeader pageLabel="SSML Editor" />
        <style>{PAGE_STYLES}</style>

        <div className="ssml-page-wrap">
          <div className="ssml-hero">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(212,114,106,0.15), rgba(212,114,106,0.08))',
                border: '1px solid rgba(212,114,106,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }} aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <polyline points="4 7 4 4 20 4 20 7" stroke="#D4726A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="9" y1="20" x2="15" y2="20" stroke="#D4726A" strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="12" y1="4" x2="12" y2="20" stroke="#D4726A" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 800, color: '#1A1A1A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', letterSpacing: '-0.3px' }}>
                  SSML Visual Editor
                </h1>
                <p style={{ margin: '3px 0 0', fontSize: 13, color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                  Build pauses, emphasis, and prosody — see the SSML live
                </p>
              </div>
            </div>
          </div>

          <div className="ssml-grid">
            <main className="ssml-main">
              <SsmlEditor voiceId={voiceId} synthesize={synthesize} />
            </main>
            <aside className="ssml-sidebar">
              <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: '1px solid rgba(212,114,106,0.12)', boxShadow: '0 2px 8px rgba(212,114,106,0.06)' }}>
                <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', paddingBottom: 10, borderBottom: '1px solid rgba(212,114,106,0.1)' }}>
                  Voice
                </p>
                <VoiceoverVoiceSelector voiceId={voiceId} onChange={setVoiceId} />
              </div>

              <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: '1px solid rgba(212,114,106,0.12)', boxShadow: '0 2px 8px rgba(212,114,106,0.06)' }}>
                <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                  Quick Reference
                </p>
                {[
                  { tag: '<break strength="medium"/>', desc: 'Pause ~300ms' },
                  { tag: '<emphasis level="strong">', desc: 'Louder, slower' },
                  { tag: 'pitch="+10%"', desc: 'Raise pitch 10%' },
                  { tag: 'rate="slow"', desc: 'Slow speaking rate' },
                  { tag: 'volume="loud"', desc: 'Increase volume' },
                ].map(({ tag, desc }) => (
                  <div key={tag} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '5px 0', borderBottom: '1px solid rgba(0,0,0,0.05)', fontSize: 12, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                    <code style={{ color: '#D4726A', fontFamily: '"Fira Code", monospace', fontSize: 11 }}>{tag}</code>
                    <span style={{ color: '#9A8A8A', whiteSpace: 'nowrap' }}>{desc}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

const PAGE_STYLES = `
  .ssml-page-wrap { max-width: 1200px; margin: 0 auto; padding: 28px 16px 0; }
  .ssml-hero { margin-bottom: 20px; }
  .ssml-grid { display: grid; grid-template-columns: 1fr 280px; gap: 20px; align-items: start; }
  .ssml-main { display: flex; flex-direction: column; gap: 0; min-width: 0; }
  .ssml-sidebar { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 84px; }
  @media (max-width: 900px) { .ssml-grid { grid-template-columns: 1fr; } .ssml-sidebar { position: static; } }
  @media (max-width: 480px) { .ssml-page-wrap { padding-top: 20px; } }
`
