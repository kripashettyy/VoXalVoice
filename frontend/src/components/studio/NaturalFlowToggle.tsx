'use client'
import { useVoiceParams } from '@/store/voiceParams'

export default function NaturalFlowToggle() {
  const naturalFlow = useVoiceParams((s) => s.naturalFlow)
  const setParam    = useVoiceParams((s) => s.setParam)

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', minHeight: 44 }}>
      <div>
        <span id="natural-flow-label" style={{
          fontSize: 13, color: '#5A4A4A', fontWeight: 500, display: 'block',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          Natural flow
        </span>
        <span style={{ fontSize: 11, color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          Smart SSML pauses
        </span>
      </div>
      <button
        role="switch"
        aria-checked={naturalFlow}
        aria-labelledby="natural-flow-label"
        onClick={() => setParam('naturalFlow', !naturalFlow)}
        style={{
          width: 48, height: 26, borderRadius: 13,
          background: naturalFlow ? '#D4726A' : 'rgba(212,114,106,0.2)',
          border: 'none', cursor: 'pointer', position: 'relative',
          transition: 'background 0.2s', flexShrink: 0,
        }}
      >
        <span style={{
          position: 'absolute', top: 3,
          left: naturalFlow ? 25 : 3,
          width: 20, height: 20, borderRadius: '50%',
          background: '#fff', transition: 'left 0.2s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  )
}
