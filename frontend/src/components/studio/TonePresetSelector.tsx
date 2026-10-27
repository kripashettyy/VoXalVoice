'use client'
import { useVoiceParams } from '@/store/voiceParams'
import type { TonePreset } from '@/types/synthesis'

const PRESETS: { value: TonePreset; label: string; desc: string }[] = [
  { value: 'neutral', label: 'Neutral', desc: 'Balanced' },
  { value: 'warm',    label: 'Warm',    desc: 'Rich tone' },
  { value: 'crisp',  label: 'Crisp',   desc: 'Clear highs' },
]

export default function TonePresetSelector() {
  const tonePreset = useVoiceParams((s) => s.tonePreset)
  const setParam   = useVoiceParams((s) => s.setParam)

  return (
    <fieldset style={{ border: 'none', padding: 0, margin: '0 0 16px' }}>
      <legend style={{
        fontSize: 11, color: '#9A8A8A', fontWeight: 700, marginBottom: 10,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        Tone preset
      </legend>
      <div style={{ display: 'flex', gap: 8 }}>
        {PRESETS.map(({ value, label, desc }) => {
          const active = tonePreset === value
          return (
            <label
              key={value}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 2, cursor: 'pointer', padding: '8px 4px', borderRadius: 10,
                border: `1.5px solid ${active ? '#D4726A' : 'rgba(212,114,106,0.2)'}`,
                background: active ? 'rgba(212,114,106,0.08)' : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              <input
                type="radio"
                name="tone-preset"
                value={value}
                checked={active}
                onChange={() => setParam('tonePreset', value)}
                aria-label={label}
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
              />
              <span style={{
                fontSize: 13, fontWeight: 600, color: active ? '#D4726A' : '#5A4A4A',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}>
                {label}
              </span>
              <span style={{
                fontSize: 10, color: active ? '#D4726A' : '#9A8A8A',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}>
                {desc}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
