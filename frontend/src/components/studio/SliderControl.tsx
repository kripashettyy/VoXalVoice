'use client'
interface Props {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
  formatValue?: (v: number) => string
}

export default function SliderControl({ label, min, max, step, value, onChange, formatValue }: Props) {
  const pct = ((value - min) / (max - min)) * 100
  const display = formatValue ? formatValue(value) : String(value)
  const id = `slider-${label.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <label htmlFor={id} style={{
          fontSize: 13, color: '#5A4A4A', fontWeight: 500,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          {label}
        </label>
        <span style={{
          fontSize: 12, color: '#D4726A', fontWeight: 600,
          background: 'rgba(212,114,106,0.1)', padding: '2px 8px',
          borderRadius: 20, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          {display}
        </span>
      </div>
      <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 4, background: 'rgba(212,114,106,0.15)', borderRadius: 2 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #e8a09a, #D4726A)', borderRadius: 2, transition: 'width 0.08s' }} />
        </div>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={display}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#D4726A', cursor: 'pointer', position: 'relative', zIndex: 1, background: 'transparent' }}
        />
      </div>
    </div>
  )
}
