'use client'
import { useEffect, useState } from 'react'
import { fetchVoices, FALLBACK_VOICES } from '@/lib/api/voices'
import { useVoiceParams } from '@/store/voiceParams'
import ErrorBanner from '@/components/shared/ErrorBanner'
import type { VoiceInfo } from '@/types/voice'

type GenderFilter = 'all' | 'female' | 'male'

export default function VoiceSelector() {
  const [voices, setVoices] = useState<VoiceInfo[]>([])
  const [error, setError] = useState<string | null>(null)
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('female')
  const voiceId = useVoiceParams((s) => s.voiceId)
  const setParam = useVoiceParams((s) => s.setParam)

  useEffect(() => {
    let cancelled = false
    fetchVoices()
      .then((v) => {
        if (cancelled) return
        setVoices(v)
        const firstFemale = v.find((x) => x.gender === 'female') ?? v[0]
        if (firstFemale) setParam('voiceId', firstFemale.id)
      })
      .catch(() => {
        if (cancelled) return
        setError('Could not load voices. Using a default list.')
        setVoices(FALLBACK_VOICES)
        const firstFemale = FALLBACK_VOICES.find((x) => x.gender === 'female') ?? FALLBACK_VOICES[0]
        if (firstFemale) setParam('voiceId', firstFemale.id)
      })
    return () => { cancelled = true }
  }, [setParam])

  const filtered = genderFilter === 'all'
    ? voices
    : voices.filter((v) => v.gender === genderFilter)

  const femaleCount = voices.filter((v) => v.gender === 'female').length
  const maleCount   = voices.filter((v) => v.gender === 'male').length

  const tabs: { value: GenderFilter; label: string; icon: string; count: number }[] = [
    { value: 'female', label: 'Female', icon: '♀',  count: femaleCount },
    { value: 'male',   label: 'Male',   icon: '♂',  count: maleCount },
    { value: 'all',    label: 'All',    icon: '◈',  count: voices.length },
  ]

  const handleFilterChange = (f: GenderFilter) => {
    setGenderFilter(f)
    const first = voices.find((v) => f === 'all' || v.gender === f)
    if (first) setParam('voiceId', first.id)
  }

  return (
    <div style={{ marginBottom: 16 }}>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <label style={{
        display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: '#9A8A8A', marginBottom: 10,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        Voice
      </label>

      {/* Gender filter tabs */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 10,
        background: 'rgba(212,114,106,0.07)',
        borderRadius: 12, padding: 4,
      }}>
        {tabs.map(({ value, label, icon, count }) => {
          const active = genderFilter === value
          return (
            <button
              key={value}
              onClick={() => handleFilterChange(value)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 5, padding: '7px 4px', borderRadius: 9, border: 'none',
                cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
                background: active ? '#D4726A' : 'transparent',
                color: active ? '#fff' : '#9A8A8A',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                minHeight: 34,
              }}
            >
              <span style={{ fontSize: 13 }}>{icon}</span>
              {label}
              {count > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  background: active ? 'rgba(255,255,255,0.25)' : 'rgba(212,114,106,0.15)',
                  color: active ? '#fff' : '#D4726A',
                  padding: '1px 5px', borderRadius: 8,
                }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Voice dropdown */}
      <select
        id="voice-select"
        aria-label="Select voice"
        value={voiceId}
        onChange={(e) => setParam('voiceId', e.target.value)}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 12,
          border: '1.5px solid rgba(212,114,106,0.25)', fontSize: 14,
          color: '#1A1A1A', background: '#FFF8FA', minHeight: 44,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          cursor: 'pointer', outline: 'none',
        }}
      >
        {filtered.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}{v.locale ? ` (${v.locale})` : ''}
          </option>
        ))}
      </select>

      {/* Count hint */}
      <p style={{
        margin: '6px 0 0', fontSize: 11, color: '#9A8A8A',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        {filtered.length} {genderFilter === 'all' ? 'voices' : `${genderFilter} voices`} available
      </p>
    </div>
  )
}
