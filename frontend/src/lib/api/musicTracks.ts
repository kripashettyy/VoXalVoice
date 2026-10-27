import type { BuiltinTrack } from '@/types/reels'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export async function fetchMusicTracks(): Promise<BuiltinTrack[]> {
  const res = await fetch(`${API_BASE}/api/v1/music-tracks`, { cache: 'no-store' })
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data.tracks) ? data.tracks : []
}
