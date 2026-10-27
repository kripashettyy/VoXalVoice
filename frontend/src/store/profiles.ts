import { create } from 'zustand'
import type { VoiceProfile } from '@/types/profile'
import type { SynthesisParams } from '@/types/synthesis'

const STORAGE_KEY = 'voxalvoice_profiles'
const MAX_PROFILES = 20

export type SaveResult =
  | { ok: true }
  | { ok: false; error: 'empty_name' | 'duplicate' | 'limit_reached' | 'storage_error'; existingProfile?: VoiceProfile }

interface ProfilesState {
  profiles: VoiceProfile[]
  storageWarning: string | null
  loadProfiles: () => void
  saveProfile: (name: string, params: SynthesisParams) => SaveResult
  confirmOverwrite: (name: string, params: SynthesisParams) => SaveResult
  loadProfile: (id: string) => VoiceProfile | null
  deleteProfile: (id: string) => void
  clearStorageWarning: () => void
}

function isStorageAvailable(): boolean {
  try {
    localStorage.setItem('__vv_test__', '1')
    localStorage.removeItem('__vv_test__')
    return true
  } catch {
    return false
  }
}

function readProfiles(): VoiceProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as VoiceProfile[]
  } catch {
    console.warn('Profile data was corrupted and has been reset.')
    return []
  }
}

function writeProfiles(profiles: VoiceProfile[]): { ok: boolean; error?: string } {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
    return { ok: true }
  } catch (e) {
    const msg =
      e instanceof Error && e.name === 'QuotaExceededError'
        ? 'Not enough storage to save this profile. Free up some space or delete older profiles.'
        : 'Profile could not be saved due to a storage error.'
    return { ok: false, error: msg }
  }
}

export const useProfiles = create<ProfilesState>((set, get) => ({
  profiles: [],
  storageWarning: null,

  loadProfiles() {
    if (!isStorageAvailable()) {
      set({
        profiles: [],
        storageWarning:
          'Profiles cannot be saved in this browser mode. Your settings will be lost when you close the tab.',
      })
      return
    }
    set({ profiles: readProfiles() })
  },

  saveProfile(name, params) {
    if (name.trim().length === 0) return { ok: false, error: 'empty_name' }

    const { profiles } = get()

    const duplicate = profiles.find(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    )
    if (duplicate) return { ok: false, error: 'duplicate', existingProfile: duplicate }

    if (profiles.length >= MAX_PROFILES)
      return { ok: false, error: 'limit_reached' }

    const newProfile: VoiceProfile = {
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: Date.now(),
      params,
    }
    const updated = [...profiles, newProfile]
    const result = writeProfiles(updated)
    if (!result.ok) {
      set({ storageWarning: result.error })
      return { ok: false, error: 'storage_error' }
    }
    set({ profiles: updated })
    return { ok: true }
  },

  confirmOverwrite(name, params) {
    const { profiles } = get()
    const updated = profiles.map((p) =>
      p.name.toLowerCase() === name.toLowerCase()
        ? { ...p, params, createdAt: Date.now() }
        : p
    )
    const result = writeProfiles(updated)
    if (!result.ok) {
      set({ storageWarning: result.error })
      return { ok: false, error: 'storage_error' }
    }
    set({ profiles: updated })
    return { ok: true }
  },

  loadProfile(id) {
    return get().profiles.find((p) => p.id === id) ?? null
  },

  deleteProfile(id) {
    const updated = get().profiles.filter((p) => p.id !== id)
    writeProfiles(updated)
    set({ profiles: updated })
  },

  clearStorageWarning() {
    set({ storageWarning: null })
  },
}))
