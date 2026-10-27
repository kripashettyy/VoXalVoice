'use client'
import { useEffect, useRef, useState } from 'react'
import { usePlayback } from '@/store/playback'
import { useVoiceParams } from '@/store/voiceParams'

interface Props {
  onClose: () => void
}

export default function VoiceAnalyzerPanel({ onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const analyserNode = usePlayback((s) => s.analyserNode)
  const lastPreviewBuffer = usePlayback((s) => s.lastPreviewBuffer)
  const params = useVoiceParams()
  const [tooltip, setTooltip] = useState<{ hz: number; amp: number; x: number; y: number } | null>(null)
  const [noCanvas, setNoCanvas] = useState(false)

  const pitchHz = params.pitch * 110 // rough estimate: A2 * pitch multiplier

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) { setNoCanvas(true); return }

    if (!analyserNode) {
      // Draw empty chart with message
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#E8D5D0'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    const bufferLength = analyserNode.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      analyserNode.getByteFrequencyData(dataArray)

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#FDF0F0'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height
        const hue = 5 + (i / bufferLength) * 20
        ctx.fillStyle = `hsl(${hue}, 60%, 55%)`
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
        x += barWidth + 1
      }

      // Draw pitch marker
      if (analyserNode.context?.sampleRate) {
        const nyquist = analyserNode.context.sampleRate / 2
        const pitchX = (pitchHz / nyquist) * canvas.width
        ctx.strokeStyle = '#1A1A1A'
        ctx.lineWidth = 2
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.moveTo(pitchX, 0)
        ctx.lineTo(pitchX, canvas.height)
        ctx.stroke()
        ctx.setLineDash([])
      }
    }

    draw()
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [analyserNode, pitchHz])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !analyserNode?.context?.sampleRate) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const nyquist = analyserNode.context.sampleRate / 2
    const hz = Math.round((x / rect.width) * nyquist)
    const amp = Math.round((1 - y / rect.height) * 100)
    setTooltip({ hz, amp, x, y })
  }

  // Fallback text if canvas fails
  if (noCanvas) {
    return (
      <div role="dialog" aria-label="Voice analyzer" style={{ background: '#FDF0F0', padding: 16, borderRadius: 8, position: 'relative' }}>
        <button onClick={onClose} aria-label="Close analyzer" style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
        <p>Pitch: {params.pitch.toFixed(1)}×</p>
        <p>Speed: {params.speed.toFixed(1)}×</p>
        <p>Warmth: {params.warmth}</p>
        <p>Clarity: {params.clarity}</p>
        <p>Estimated pitch frequency: ~{pitchHz} Hz</p>
      </div>
    )
  }

  return (
    <div
      role="dialog"
      aria-label="Voice analyzer panel"
      style={{ background: '#FDF0F0', border: '1px solid #E8B4B0', borderRadius: 8, padding: 16, position: 'relative' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 14, color: '#1A1A1A', fontWeight: 600 }}>Voice analyzer</h3>
        <button
          onClick={onClose}
          aria-label="Close analyzer"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#5A4A4A', minWidth: 44, minHeight: 44 }}
        >
          ×
        </button>
      </div>

      {!analyserNode && !lastPreviewBuffer ? (
        <p style={{ fontSize: 13, color: '#5A4A4A', margin: '12px 0' }}>
          Generate a preview first to see the frequency analysis.
        </p>
      ) : (
        <div style={{ position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={500}
            height={150}
            aria-label="Frequency spectrum"
            role="img"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setTooltip(null)}
            style={{ width: '100%', height: 150, borderRadius: 4, cursor: 'crosshair', display: 'block' }}
          />
          {tooltip && (
            <div
              style={{
                position: 'absolute',
                left: tooltip.x + 10,
                top: tooltip.y - 30,
                background: 'rgba(26,26,26,0.8)',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 12,
                pointerEvents: 'none',
              }}
            >
              {tooltip.hz} Hz / {tooltip.amp}%
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 8, fontSize: 12, color: '#5A4A4A', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <span>Estimated pitch: ~{pitchHz} Hz</span>
        <span>Speed: {params.speed.toFixed(1)}×</span>
        <span>Warmth: {params.warmth}</span>
        <span>Clarity: {params.clarity}</span>
      </div>
    </div>
  )
}
