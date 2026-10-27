'use client'
import { useVoiceParams } from '@/store/voiceParams'
import SliderControl from './SliderControl'
import TonePresetSelector from './TonePresetSelector'
import NaturalFlowToggle from './NaturalFlowToggle'

export default function ParameterPanel() {
  const { pitch, speed, volume, warmth, clarity, setParam, resetDefaults } = useVoiceParams()

  return (
    <div>
      <SliderControl label="Pitch" min={0.5} max={2.0} step={0.1} value={pitch} onChange={(v) => setParam('pitch', v)} formatValue={(v) => `${v.toFixed(1)}×`} />
      <SliderControl label="Speed" min={0.5} max={2.5} step={0.1} value={speed} onChange={(v) => setParam('speed', v)} formatValue={(v) => `${v.toFixed(1)}×`} />
      <SliderControl label="Volume" min={0} max={100} step={5} value={Math.round(volume * 100)} onChange={(v) => setParam('volume', v / 100)} formatValue={(v) => `${v}%`} />
      <SliderControl label="Warmth" min={0} max={100} step={1} value={warmth} onChange={(v) => setParam('warmth', v)} formatValue={(v) => `${v}`} />
      <SliderControl label="Clarity" min={0} max={100} step={1} value={clarity} onChange={(v) => setParam('clarity', v)} formatValue={(v) => `${v}`} />

      <div style={{ borderTop: '1px solid rgba(212,114,106,0.12)', paddingTop: 16, marginTop: 4 }}>
        <TonePresetSelector />
      </div>

      <div style={{ borderTop: '1px solid rgba(212,114,106,0.12)', paddingTop: 4 }}>
        <NaturalFlowToggle />
      </div>

      <button
        onClick={resetDefaults}
        aria-label="Reset to defaults"
        style={{
          width: '100%', padding: '10px 0', marginTop: 8,
          background: 'transparent',
          border: '1.5px solid rgba(212,114,106,0.3)',
          borderRadius: 12, color: '#D4726A', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, minHeight: 44,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212,114,106,0.08)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      >
        Reset to defaults
      </button>
    </div>
  )
}
