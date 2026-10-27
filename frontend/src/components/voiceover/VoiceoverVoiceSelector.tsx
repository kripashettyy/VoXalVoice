'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { fetchVoices, FALLBACK_VOICES } from '@/lib/api/voices'
import type { VoiceInfo } from '@/types/voice'

type GenderFilter = 'all' | 'female' | 'male'

interface Props {
  voiceId: string
  onChange: (id: string) => void
  disabled?: boolean
}

function cleanName(v: VoiceInfo): string {
  return v.name.replace(/^Microsoft\s+/i, '').replace(/\s+Online\s*\(Natural\)/i, '').trim()
}

function localeLabel(locale?: string): string {
  if (!locale) return ''
  return locale.toUpperCase().replace('-', '·')
}

const GENDER_COLOR: Record<string, string> = {
  female: '#D4726A',
  male:   '#6A8ED4',
}

export default function VoiceoverVoiceSelector({ voiceId, onChange, disabled }: Props) {
  const [voices, setVoices]   = useState<VoiceInfo[]>([])
  const [filter, setFilter]   = useState<GenderFilter>('female')
  const [search, setSearch]   = useState('')
  const [open, setOpen]       = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [focused, setFocused] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef    = useRef<HTMLInputElement>(null)
  const listRef      = useRef<HTMLUListElement>(null)
  const onChangeRef  = useRef(onChange)
  onChangeRef.current = onChange

  // Runs once on mount — onChangeRef prevents re-firing on every render
  useEffect(() => {
    let cancelled = false
    fetchVoices()
      .then((v) => {
        if (cancelled) return
        setVoices(v)
        const first = v.find((x) => x.gender === 'female') ?? v[0]
        if (first) onChangeRef.current(first.id)
      })
      .catch(() => {
        if (cancelled) return
        setError('Could not load voices — using default list.')
        setVoices(FALLBACK_VOICES)
        const first = FALLBACK_VOICES.find((x) => x.gender === 'female') ?? FALLBACK_VOICES[0]
        if (first) onChangeRef.current(first.id)
      })
    return () => { cancelled = true }
  }, [])

  const filtered = voices
    .filter((v) => filter === 'all' || v.gender === filter)
    .filter((v) => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return cleanName(v).toLowerCase().includes(q) || (v.locale ?? '').toLowerCase().includes(q)
    })

  const selected = voices.find((v) => v.id === voiceId) ?? null

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50)
      setFocused(-1)
    }
  }, [open])

  useEffect(() => {
    if (focused < 0 || !listRef.current) return
    const el = listRef.current.children[focused] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [focused])

  const handleSelect = useCallback((v: VoiceInfo) => {
    onChange(v.id)
    setOpen(false)
    setSearch('')
    setFocused(-1)
  }, [onChange])

  const handleFilterChange = (f: GenderFilter) => {
    setFilter(f)
    setSearch('')
    setFocused(-1)
    const first = voices.find((v) => f === 'all' || v.gender === f)
    if (first) onChangeRef.current(first.id)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); setOpen(true) }
      return
    }
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setFocused((f) => Math.min(f + 1, filtered.length - 1)); break
      case 'ArrowUp':   e.preventDefault(); setFocused((f) => Math.max(f - 1, 0)); break
      case 'Enter':     e.preventDefault(); if (focused >= 0 && filtered[focused]) handleSelect(filtered[focused]); break
      case 'Escape':    setOpen(false); setSearch(''); break
    }
  }

  const tabs: { value: GenderFilter; label: string; count: number }[] = [
    { value: 'female', label: 'Female', count: voices.filter(v => v.gender === 'female').length },
    { value: 'male',   label: 'Male',   count: voices.filter(v => v.gender === 'male').length },
    { value: 'all',    label: 'All',    count: voices.length },
  ]

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: '#9A8A8A', marginBottom: 10,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        Voice
      </label>

      {error && (
        <p style={{ margin: '0 0 8px', fontSize: 12, color: '#D4726A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: 6, marginBottom: 10, background: 'rgba(212,114,106,0.07)', borderRadius: 12, padding: 4 }}>
        {tabs.map(({ value, label, count }) => {
          const active = filter === value
          return (
            <button
              key={value}
              onClick={() => handleFilterChange(value)}
              disabled={disabled}
              style={{
                flex: 1, padding: '7px 4px', borderRadius: 9, border: 'none',
                cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600,
                transition: 'all 0.15s', background: active ? '#D4726A' : 'transparent',
                color: active ? '#fff' : '#9A8A8A',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                minHeight: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}
            >
              {label}
              {count > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  background: active ? 'rgba(255,255,255,0.25)' : 'rgba(212,114,106,0.15)',
                  color: active ? '#fff' : '#D4726A', padding: '1px 6px', borderRadius: 8,
                }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select voice for voice-over"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 12,
          border: `1.5px solid ${open ? '#D4726A' : 'rgba(212,114,106,0.25)'}`,
          background: disabled ? '#F5F5F5' : '#FFF8FA',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 10,
          transition: 'border-color 0.15s', outline: 'none', minHeight: 46,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        {selected ? (
          <>
            <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: GENDER_COLOR[selected.gender] ?? '#ccc' }} />
            <span style={{ flex: 1, textAlign: 'left', fontSize: 14, fontWeight: 600, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {cleanName(selected)}
            </span>
            {selected.locale && (
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', background: 'rgba(212,114,106,0.1)', color: '#D4726A', padding: '2px 7px', borderRadius: 6, flexShrink: 0 }}>
                {localeLabel(selected.locale)}
              </span>
            )}
          </>
        ) : (
          <span style={{ flex: 1, textAlign: 'left', fontSize: 14, color: '#9A8A8A' }}>Loading voices…</span>
        )}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"
          style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          <polyline points="6 9 12 15 18 9" stroke="#9A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <p style={{ margin: '6px 0 0', fontSize: 11, color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        {voices.filter(v => filter === 'all' || v.gender === filter).length}{' '}
        {filter === 'all' ? 'voices' : `${filter} voices`} available
      </p>

      {open && (
        <div
          role="dialog"
          aria-label="Voice picker"
          style={{
            position: 'absolute', top: 'calc(100% - 18px)', left: 0, right: 0,
            background: '#fff', borderRadius: 16,
            border: '1.5px solid rgba(212,114,106,0.25)',
            boxShadow: '0 8px 32px rgba(212,114,106,0.18)',
            zIndex: 100, overflow: 'hidden',
          }}
          onKeyDown={handleKeyDown}
        >
          <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(212,114,106,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="7" stroke="#9A8A8A" strokeWidth="2"/>
              <path d="M21 21l-4.35-4.35" stroke="#9A8A8A" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search by name or language…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setFocused(-1) }}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#1A1A1A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
            />
            {search && (
              <button onClick={() => { setSearch(''); searchRef.current?.focus() }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#9A8A8A', lineHeight: 1 }}
                aria-label="Clear search"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>

          <ul ref={listRef} role="listbox" aria-label="Available voices"
            style={{ listStyle: 'none', margin: 0, padding: '6px 0', maxHeight: 260, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'rgba(212,114,106,0.3) transparent' }}
          >
            {filtered.length === 0 ? (
              <li style={{ padding: '20px 16px', textAlign: 'center', fontSize: 13, color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                No voices match &ldquo;{search}&rdquo;
              </li>
            ) : filtered.map((v, idx) => {
              const isSelected = v.id === voiceId
              const isFocused  = idx === focused
              return (
                <li key={v.id} role="option" aria-selected={isSelected}
                  onClick={() => handleSelect(v)} onMouseEnter={() => setFocused(idx)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', cursor: 'pointer',
                    background: isSelected ? 'rgba(212,114,106,0.1)' : isFocused ? 'rgba(212,114,106,0.05)' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: GENDER_COLOR[v.gender] ?? '#ccc' }} />
                  <span style={{
                    flex: 1, fontSize: 13, fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? '#D4726A' : '#1A1A1A',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  }}>
                    {cleanName(v)}
                  </span>
                  {v.locale && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
                      background: isSelected ? 'rgba(212,114,106,0.15)' : 'rgba(0,0,0,0.05)',
                      color: isSelected ? '#D4726A' : '#9A8A8A', padding: '2px 7px', borderRadius: 6, flexShrink: 0,
                    }}>
                      {localeLabel(v.locale)}
                    </span>
                  )}
                  {isSelected && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                      <path d="M20 6L9 17l-5-5" stroke="#D4726A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </li>
              )
            })}
          </ul>

          {filtered.length > 0 && (
            <div style={{ padding: '8px 14px', borderTop: '1px solid rgba(212,114,106,0.08)', fontSize: 11, color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              {filtered.length} {search ? 'matching' : filter === 'all' ? '' : filter} voice{filtered.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
