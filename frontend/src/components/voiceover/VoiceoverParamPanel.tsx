'use client'
import SliderControl from '@/components/studio/SliderControl'

interface Params {
  pitch: number
  speed: number
  volume: number
  warmth: number
  clarity: number
  tonePreset: 'neutral' | 'warm' | 'crisp'
  naturalFlow: boolean
}

interface Props {
  params: Params
  onChange: <K extends keyof Params>(key: K, value: Params[K]) => void
  disabled?: boolean
}

const TONE_PRESETS: { value: Params['tonePreset']; label: string; desc: string }[] = [
  { value: 'neutral', label: 'Neutral', desc: 'Balanced' },
  { value: 'warm',    label: 'Warm',    desc: 'Low boost' },
  { value: 'crisp',   label: 'Crisp',   desc: 'High boost' },
]

export default function VoiceoverParamPanel({ params, onChange, disabled }: Props) {
  return (
    <div style={{ opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <SliderControl label="Pitch"   min={0.5} max={2.0} step={0.05} value={params.pitch}
        formatValue={(v) => `${v.toFixed(2)}×`} onChange={(v) => onChange('pitch', v)} />
      <SliderControl label="Speed"   min={0.5} max={2.5} step={0.05} value={params.speed}
        formatValue={(v) => `${v.toFixed(2)}×`} onChange={(v) => onChange('speed', v)} />
      <SliderControl label="Volume"  min={0.0} max={1.0} step={0.05} value={params.volume}
        formatValue={(v) => `${Math.round(v * 100)}%`} onChange={(v) => onChange('volume', v)} />
      <SliderControl label="Warmth"  min={0.0} max={1.0} step={0.05} value={params.warmth}
        formatValue={(v) => `${Math.round(v * 100)}%`} onChange={(v) => onChange('warmth', v)} />
      <SliderControl label="Clarity" min={0.0} max={1.0} step={0.05} value={params.clarity}
        formatValue={(v) => `${Math.round(v * 100)}%`} onChange={(v) => onChange('clarity', v)} />

      <div style={{ marginBottom: 20 }}>
        <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 500, color: '#5A4A4A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          Tone
        </p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TONE_PRESETS.map(({ value, label, desc }) => {
            const active = params.tonePreset === value
            return (
              <button key={value} onClick={() => onChange('tonePreset', value)}
                style={{
                  flex: 1, minWidth: 72, padding: '8px 4px', borderRadius: 10, border: 'none',
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: active ? '#D4726A' : 'rgba(212,114,106,0.08)',
                  color: active ? '#fff' : '#5A4A4A',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700 }}>{label}</span>
                <span style={{ fontSize: 10, opacity: 0.75 }}>{desc}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#5A4A4A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            Natural Flow
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            Prosodic pauses at punctuation
          </p>
        </div>
        <button
          role="switch"
          aria-checked={params.naturalFlow}
          onClick={() => onChange('naturalFlow', !params.naturalFlow)}
          style={{
            width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
            background: params.naturalFlow ? '#D4726A' : 'rgba(212,114,106,0.2)',
            position: 'relative', transition: 'background 0.2s', flexShrink: 0,
          }}
        >
          <span style={{
            position: 'absolute', top: 3, left: params.naturalFlow ? 23 : 3,
            width: 18, height: 18, borderRadius: '50%', background: '#fff',
            transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </button>
      </div>
    </div>
  )
}
