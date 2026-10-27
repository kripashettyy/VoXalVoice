'use client'
import { usePlayback } from '@/store/playback'

const STATUS_MESSAGES: Record<string, string> = {
  idle: '',
  loading: 'Loading audio',
  playing: 'Playback started',
  paused: 'Playback paused',
  error: 'Error loading audio',
}

export default function StatusLiveRegion() {
  const status = usePlayback((s) => s.status)
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
    >
      {STATUS_MESSAGES[status] ?? ''}
    </div>
  )
}
