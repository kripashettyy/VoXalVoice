'use client'
import { useEffect, useRef } from 'react'
import { usePlayback } from '@/store/playback'

export default function WaveformVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const status = usePlayback((s) => s.status)
  const analyserNode = usePlayback((s) => s.analyserNode)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (status !== 'playing' || !analyserNode) {
      if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(212,114,106,0.25)'
      ctx.lineWidth = 2
      ctx.setLineDash([6, 4])
      ctx.moveTo(0, canvas.height / 2)
      ctx.lineTo(canvas.width, canvas.height / 2)
      ctx.stroke()
      ctx.setLineDash([])
      return
    }

    const bufferLength = analyserNode.fftSize
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      analyserNode.getByteTimeDomainData(dataArray)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
      gradient.addColorStop(0, 'rgba(212,114,106,0.6)')
      gradient.addColorStop(0.5, '#D4726A')
      gradient.addColorStop(1, 'rgba(212,114,106,0.6)')

      ctx.beginPath()
      ctx.strokeStyle = gradient
      ctx.lineWidth = 2.5

      const sliceWidth = canvas.width / bufferLength
      let x = 0
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * canvas.height) / 2
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
        x += sliceWidth
      }
      ctx.lineTo(canvas.width, canvas.height / 2)
      ctx.stroke()
    }

    draw()
    return () => { if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null } }
  }, [status, analyserNode])

  return (
    <div style={{ position: 'relative' }}>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: '#9A8A8A', marginBottom: 10,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        Waveform
      </label>
      <canvas
        ref={canvasRef}
        width={600}
        height={72}
        aria-label="Audio waveform visualizer"
        role="img"
        style={{
          width: '100%', height: 72, borderRadius: 12,
          background: '#FFF0F5', display: 'block',
          border: '1.5px solid rgba(212,114,106,0.15)',
        }}
      />
    </div>
  )
}
