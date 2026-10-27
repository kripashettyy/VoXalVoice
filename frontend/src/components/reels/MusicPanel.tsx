'use client'
import { useEffect, useRef, useState } from 'react'
import { fetchMusicTracks } from '@/lib/api/musicTracks'
import type { MusicSettings, MusicSource, BuiltinTrack } from '@/types/reels'

interface Props {
  settings: MusicSettings
  onChange: (settings: MusicSettings) => void
  disabled?: boolean
}

const ACCEPTED_AUDIO = '.mp3,.wav,.aac,.m4a,.ogg'
const MAX_AUDIO_MB = 50

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MusicPanel({ settings, onChange, disabled }: Props) {
  const [tracks, setTracks] = useState<BuiltinTrack[]>([])
  const [loadingTracks, setLoadingTracks] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLoadingTracks(true)
    fetchMusicTracks()
      .then(setTracks)
      .catch(() => setTracks([]))
      .finally(() => setLoadingTracks(false))
  }, [])

  function set(partial: Partial<MusicSettings>) {
    onChange({ ...settings, ...partial })
  }

  function handleSourceChange(source: MusicSource) {
    set({
      source,
      builtinTrackId: source === 'builtin' ? (tracks[0]?.id ?? '') : settings.builtinTrackId,
      uploadedFile: source !== 'upload' ? null : settings.uploadedFile,
    })
    setAudioError(null)
  }

  function handleAudioFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    e.target.value = ''
    if (!file) return
    if (file.size > MAX_AUDIO_MB * 1024 * 1024) {
      setAudioError(`File too large (${formatBytes(file.size)}). Max is ${MAX_AUDIO_MB} MB.`)
      return
    }
    setAudioError(null)
    set({ uploadedFile: file })
  }

  const isOn = settings.source !== 'none'

  return (
    <div style={{ opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
        <button
          role="switch"
          aria-checked={isOn}
          onClick={() => handleSourceChange(isOn ? 'none' : 'builtin')}
          style={{
            width: 44, height: 24, borderRadius: 9999, border: 'none', cursor: 'pointer',
            background: isOn ? '#D4726A' : '#e0e0e0',
            position: 'relative', transition: 'background 0.2s', flexShrink: 0, padding: 0,
          }}
          aria-label="Enable background music"
        >
          <span style={{
            position: 'absolute', top: 3, left: isOn ? 23 : 3,
            width: 18, height: 18, borderRadius: '50%',
            background: '#fff', transition: 'left 0.2s',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }} />
        </button>
        <span style={{ fontSize: 13, color: '#3A3A3A', fontFamily: 'system-ui, sans-serif' }}>
          Add background music
          <span style={{ display: 'block', fontSize: 11, color: '#9A8A8A', marginTop: 1 }}>
            Mixed with the voice-over
          </span>
        </span>
      </label>

      {isOn && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['builtin', 'upload'] as MusicSource[]).map((src) => (
              <button
                key={src}
                onClick={() => handleSourceChange(src)}
                aria-pressed={settings.source === src}
                style={{
                  flex: 1, padding: '7px 10px', borderRadius: 10, cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, fontFamily: 'system-ui, sans-serif',
                  border: settings.source === src
                    ? '1.5px solid #D4726A' : '1.5px solid rgba(212,114,106,0.2)',
                  background: settings.source === src
                    ? 'rgba(212,114,106,0.1)' : 'transparent',
                  color: settings.source === src ? '#D4726A' : '#9A8A8A',
                  transition: 'all 0.15s',
                }}
              >
                {src === 'builtin' ? '🎵 Built-in loops' : '📁 Upload my own'}
              </button>
            ))}
          </div>

          {settings.source === 'builtin' && (
            <div>
              {loadingTracks ? (
                <p style={{ margin: 0, fontSize: 12, color: '#9A8A8A', fontFamily: 'system-ui, sans-serif' }}>
                  Loading tracks…
                </p>
              ) : tracks.length === 0 ? (
                <p style={{ margin: 0, fontSize: 12, color: '#c0392b', fontFamily: 'system-ui, sans-serif' }}>
                  No built-in tracks available. Add MP3 files to backend/assets/music/.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {tracks.map((track) => {
                    const active = settings.builtinTrackId === track.id
                    return (
                      <button
                        key={track.id}
                        onClick={() => set({ builtinTrackId: track.id })}
                        aria-pressed={active}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
                          border: active ? '1.5px solid #D4726A' : '1.5px solid rgba(212,114,106,0.15)',
                          background: active ? 'rgba(212,114,106,0.08)' : '#FAFAFA',
                          textAlign: 'left', transition: 'all 0.15s',
                        }}
                      >
                        <span style={{
                          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                          background: active ? 'rgba(212,114,106,0.2)' : 'rgba(0,0,0,0.05)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 15,
                        }}>
                          🎵
                        </span>
                        <span style={{ minWidth: 0 }}>
                          <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: active ? '#D4726A' : '#1A1A1A', fontFamily: 'system-ui, sans-serif' }}>
                            {track.label}
                          </span>
                          <span style={{ display: 'block', fontSize: 11, color: '#9A8A8A', fontFamily: 'system-ui, sans-serif' }}>
                            {track.description}
                          </span>
                        </span>
                        {active && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                            <circle cx="12" cy="12" r="10" fill="#D4726A"/>
                            <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {settings.source === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_AUDIO}
                onChange={handleAudioFile}
                style={{ display: 'none' }}
                aria-hidden="true"
              />
              <div
                role="button"
                tabIndex={0}
                aria-label="Upload audio file"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click() } }}
                style={{
                  border: `2px dashed ${settings.uploadedFile ? 'rgba(212,114,106,0.5)' : 'rgba(212,114,106,0.25)'}`,
                  borderRadius: 14, padding: '20px 16px', textAlign: 'center',
                  cursor: 'pointer', background: settings.uploadedFile ? 'rgba(212,114,106,0.04)' : '#FAFAFA',
                  transition: 'all 0.2s', outline: 'none',
                }}
              >
                {settings.uploadedFile ? (
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: '#1A1A1A', fontFamily: 'system-ui, sans-serif' }}>
                      {settings.uploadedFile.name}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: '#9A8A8A', fontFamily: 'system-ui, sans-serif' }}>
                      {formatBytes(settings.uploadedFile.size)} · Click to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#5A4A4A', fontFamily: 'system-ui, sans-serif' }}>
                      Drop audio here or click to browse
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: '#9A8A8A', fontFamily: 'system-ui, sans-serif' }}>
                      MP3, WAV, AAC, M4A, OGG · Max {MAX_AUDIO_MB} MB
                    </p>
                  </div>
                )}
              </div>
              {audioError && (
                <p role="alert" style={{ margin: '6px 0 0', fontSize: 12, color: '#c0392b', fontFamily: 'system-ui, sans-serif' }}>
                  {audioError}
                </p>
              )}
            </div>
          )}

          <VolumeSlider
            value={settings.musicVolume}
            onChange={(v) => set({ musicVolume: v })}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Toggle
              label="Auto-ducking"
              desc="Music lowers during voice-over"
              checked={settings.ducking}
              onChange={(v) => set({ ducking: v })}
            />
            <Toggle
              label="Fade in"
              desc="Music fades in at start"
              checked={settings.fadeIn}
              onChange={(v) => set({ fadeIn: v })}
            />
            <Toggle
              label="Fade out"
              desc="Music fades out at end"
              checked={settings.fadeOut}
              onChange={(v) => set({ fadeOut: v })}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function VolumeSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#5A4A4A', fontFamily: 'system-ui, sans-serif' }}>
          Music volume
        </p>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#D4726A', fontFamily: 'system-ui, sans-serif' }}>
          {Math.round(value * 100)}%
        </span>
      </div>
      <input
        type="range"
        min={0} max={1} step={0.05}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={`Music volume ${Math.round(value * 100)}%`}
        style={{ width: '100%', accentColor: '#D4726A', cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <span style={{ fontSize: 10, color: '#9A8A8A', fontFamily: 'system-ui, sans-serif' }}>Silent</span>
        <span style={{ fontSize: 10, color: '#9A8A8A', fontFamily: 'system-ui, sans-serif' }}>Full</span>
      </div>
    </div>
  )
}

function Toggle({
  label, desc, checked, onChange,
}: {
  label: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <div>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: '#5A4A4A', fontFamily: 'system-ui, sans-serif' }}>
          {label}
        </p>
        <p style={{ margin: '1px 0 0', fontSize: 11, color: '#9A8A8A', fontFamily: 'system-ui, sans-serif' }}>
          {desc}
        </p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          width: 36, height: 20, borderRadius: 9999, border: 'none', cursor: 'pointer',
          background: checked ? '#D4726A' : '#e0e0e0',
          position: 'relative', transition: 'background 0.2s', flexShrink: 0, padding: 0,
        }}
        aria-label={label}
      >
        <span style={{
          position: 'absolute', top: 2, left: checked ? 18 : 2,
          width: 16, height: 16, borderRadius: '50%',
          background: '#fff', transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  )
}
