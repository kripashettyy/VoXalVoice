'use client'
import { useEffect, useState } from 'react'
import { useProfiles } from '@/store/profiles'
import { useVoiceParams } from '@/store/voiceParams'
import ErrorBanner from '@/components/shared/ErrorBanner'

export default function ProfileManager() {
  const { profiles, loadProfiles, saveProfile, confirmOverwrite, loadProfile, deleteProfile, storageWarning, clearStorageWarning } = useProfiles()
  const params = useVoiceParams()
  const [open, setOpen] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [confirmDup, setConfirmDup] = useState<{ name: string } | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadProfiles() }, [loadProfiles])

  const handleSave = () => {
    if (saving) return
    setSaving(true)
    const snapshot = {
      voiceId: params.voiceId, pitch: params.pitch, speed: params.speed,
      volume: params.volume, tonePreset: params.tonePreset, naturalFlow: params.naturalFlow,
      warmth: params.warmth / 100, clarity: params.clarity / 100, outputFormat: 'wav' as const,
    }
    const result = saveProfile(nameInput, snapshot)
    setSaving(false)
    if (result.ok) { setNameInput(''); setNameError(null) }
    else if (result.error === 'empty_name') setNameError('Profile name cannot be empty.')
    else if (result.error === 'duplicate') { setConfirmDup({ name: nameInput }); setNameError(null) }
    else if (result.error === 'limit_reached') setNameError('Limit reached (20). Delete one first.')
    else setNameError('Could not save profile.')
  }

  const handleLoad = (id: string) => {
    const p = loadProfile(id)
    if (!p) return
    params.setParam('voiceId', p.params.voiceId)
    params.setParam('pitch', p.params.pitch)
    params.setParam('speed', p.params.speed)
    params.setParam('volume', p.params.volume)
    params.setParam('tonePreset', p.params.tonePreset)
    params.setParam('naturalFlow', p.params.naturalFlow)
    params.setParam('warmth', Math.round(p.params.warmth * 100))
    params.setParam('clarity', Math.round(p.params.clarity * 100))
  }

  const card: React.CSSProperties = {
    background: '#ffffff', borderRadius: 20, overflow: 'hidden',
    border: '1px solid rgba(212,114,106,0.12)',
    boxShadow: '0 2px 12px rgba(212,114,106,0.06)',
  }

  return (
    <div style={card}>
      {/* Header toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          width: '100%', padding: '14px 18px', background: 'transparent',
          border: 'none', textAlign: 'left', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          minHeight: 48,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4726A" strokeWidth="2" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            Voice profiles
          </span>
          {profiles.length > 0 && (
            <span style={{ fontSize: 11, background: 'rgba(212,114,106,0.12)', color: '#D4726A', padding: '1px 7px', borderRadius: 20, fontWeight: 600 }}>
              {profiles.length}
            </span>
          )}
        </div>
        <span style={{ fontSize: 11, color: '#9A8A8A', transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
      </button>

      {open && (
        <div style={{ padding: '0 18px 18px', borderTop: '1px solid rgba(212,114,106,0.1)' }}>
          {storageWarning && <div style={{ marginTop: 12 }}><ErrorBanner message={storageWarning} onDismiss={clearStorageWarning} /></div>}

          {/* Save input */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <input
              type="text" value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Profile name"
              aria-label="New profile name"
              maxLength={50}
              style={{
                flex: 1, padding: '8px 12px',
                border: '1.5px solid rgba(212,114,106,0.25)', borderRadius: 10,
                fontSize: 13, minHeight: 40, outline: 'none',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                background: '#FFF8FA',
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button
              onClick={handleSave} disabled={saving} aria-label="Save profile"
              style={{
                padding: '8px 14px', background: '#D4726A', color: '#fff',
                border: 'none', borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: 13, fontWeight: 600, minHeight: 40,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              Save
            </button>
          </div>
          {nameError && <p role="alert" style={{ color: '#D4726A', fontSize: 12, margin: '6px 0 0', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>{nameError}</p>}

          {/* Duplicate confirm */}
          {confirmDup && (
            <div role="alertdialog" aria-label="Duplicate profile" style={{ background: 'rgba(212,114,106,0.08)', padding: 12, borderRadius: 10, marginTop: 10 }}>
              <p style={{ margin: '0 0 8px', fontSize: 13, color: '#1A1A1A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                "{confirmDup.name}" already exists. Overwrite?
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { confirmOverwrite(confirmDup.name, { voiceId: params.voiceId, pitch: params.pitch, speed: params.speed, volume: params.volume, tonePreset: params.tonePreset, naturalFlow: params.naturalFlow, warmth: params.warmth / 100, clarity: params.clarity / 100, outputFormat: 'wav' as const }); setConfirmDup(null); setNameInput('') }}
                  style={{ padding: '6px 14px', background: '#D4726A', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, minHeight: 36 }}>
                  Overwrite
                </button>
                <button onClick={() => setConfirmDup(null)}
                  style={{ padding: '6px 14px', background: 'transparent', border: '1.5px solid rgba(212,114,106,0.3)', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#D4726A', minHeight: 36 }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Profile list */}
          {profiles.length === 0 ? (
            <p style={{ fontSize: 13, color: '#9A8A8A', margin: '14px 0 0', textAlign: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              No profiles saved yet.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {profiles.map((p) => (
                <li key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, background: '#FFF8FA', border: '1px solid rgba(212,114,106,0.1)' }}>
                  <span style={{ flex: 1, fontSize: 13, color: '#1A1A1A', fontWeight: 500, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                    {p.name}
                  </span>
                  {confirmDelete === p.id ? (
                    <div role="alertdialog" style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => { deleteProfile(p.id); setConfirmDelete(null) }} aria-label="Confirm delete"
                        style={{ padding: '3px 10px', background: '#D4726A', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, minHeight: 30 }}>
                        Confirm
                      </button>
                      <button onClick={() => setConfirmDelete(null)} aria-label="Cancel delete"
                        style={{ padding: '3px 10px', background: 'transparent', border: '1px solid rgba(212,114,106,0.3)', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#D4726A', minHeight: 30 }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => handleLoad(p.id)} aria-label={`Load ${p.name}`}
                        style={{ padding: '3px 10px', background: 'rgba(212,114,106,0.1)', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#D4726A', fontWeight: 600, minHeight: 30 }}>
                        Load
                      </button>
                      <button onClick={() => setConfirmDelete(p.id)} aria-label={`Delete ${p.name}`}
                        style={{ padding: '3px 8px', background: 'transparent', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, color: '#9A8A8A', minHeight: 30 }}>
                        ×
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
