'use client'
import { useId } from 'react'

const TEXT =
  'Generate natural-sounding speech  ·  Real-time voice controls  ·  EQ warmth and clarity  ·  Natural flow pauses  ·  Download WAV instantly  ·  '

const FULL_TEXT = TEXT.repeat(8)

export default function SineWaveTicker() {
  const uid = useId().replace(/:/g, 'x')

  const VW  = 1440
  const VH  = 120
  const MID = VH / 2   // 60
  const AMP = 26
  const WL  = 340

  // ── Full scrolling path ──────────────────────────────────────────────────
  const START_X = -VW * 2
  const TOTAL_W = VW * 6
  let fullPath = `M ${START_X},${MID}`
  const steps = Math.ceil(TOTAL_W / (WL / 2))
  for (let i = 0; i < steps; i++) {
    const x1    = START_X + i * (WL / 2)
    const x2    = START_X + (i + 1) * (WL / 2)
    const yPeak = i % 2 === 0 ? MID - AMP : MID + AMP
    const cpX   = (x1 + x2) / 2
    fullPath += ` C ${cpX},${yPeak} ${cpX},${yPeak} ${x2},${MID}`
  }

  // ── Lens path — one full wavelength centred at VW/2 ──────────────────────
  const LX      = VW / 2 - WL / 2
  const relLX   = LX - START_X
  const halfIdx = Math.floor(relLX / (WL / 2))

  function halfWave(idx: number) {
    const x1    = START_X + idx * (WL / 2)
    const x2    = START_X + (idx + 1) * (WL / 2)
    const yPeak = idx % 2 === 0 ? MID - AMP : MID + AMP
    const cpX   = (x1 + x2) / 2
    return `C ${cpX},${yPeak} ${cpX},${yPeak} ${x2},${MID}`
  }

  const lensStartX = START_X + halfIdx * (WL / 2)
  const lensPath = [
    `M ${lensStartX},${MID}`,
    halfWave(halfIdx),
    halfWave(halfIdx + 1),
  ].join(' ')

  const FONT_SIZE   = 16
  const LENS_STROKE = 54
  const DY          = 6   // shift baseline so cap-height centres on path

  // Mask gradient bounds
  const FADE        = 70
  const MASK_X      = LX - FADE
  const MASK_W      = WL + FADE * 2
  const fadeStop1   = `${((FADE / MASK_W) * 100).toFixed(1)}%`
  const fadeStop2   = `${(((FADE + WL) / MASK_W) * 100).toFixed(1)}%`

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: VH,
        pointerEvents: 'none',
        zIndex: 3,
        overflow: 'hidden',
      }}
    >
      <svg
        width="100%"
        height={VH}
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <path id={`${uid}-p`} d={fullPath} />

          {/* Horizontal feathered gradient — white in lens zone, black outside */}
          <linearGradient
            id={`${uid}-lg`}
            gradientUnits="userSpaceOnUse"
            x1={MASK_X}
            y1="0"
            x2={MASK_X + MASK_W}
            y2="0"
          >
            <stop offset="0%"       stopColor="black"  stopOpacity="0" />
            <stop offset={fadeStop1} stopColor="white" stopOpacity="1" />
            <stop offset={fadeStop2} stopColor="white" stopOpacity="1" />
            <stop offset="100%"     stopColor="black"  stopOpacity="0" />
          </linearGradient>

          {/* Mask using that gradient */}
          <mask
            id={`${uid}-m`}
            maskUnits="userSpaceOnUse"
            x={MASK_X}
            y="0"
            width={MASK_W}
            height={VH}
          >
            <rect
              x={MASK_X} y="0"
              width={MASK_W} height={VH}
              fill={`url(#${uid}-lg)`}
            />
          </mask>
        </defs>

        {/* ── 1. Faint background text ── */}
        <text
          fontSize={FONT_SIZE - 1}
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          fontWeight="400"
          fill="rgba(90,74,74,0.32)"
          letterSpacing="0.5"
          dy={DY}
        >
          <textPath href={`#${uid}-p`} startOffset="33.33%">
            <animate
              attributeName="startOffset"
              from="33.33%" to="16.66%"
              dur="22s" repeatCount="indefinite"
            />
            {FULL_TEXT}
          </textPath>
        </text>

        {/* ── 2. Lens glass body (wave-tube shape) ── */}
        {/* Outer rim */}
        <path
          d={lensPath} fill="none"
          stroke="rgba(212,114,106,0.2)"
          strokeWidth={LENS_STROKE + 8}
          strokeLinecap="round"
        />
        {/* Frosted glass fill */}
        <path
          d={lensPath} fill="none"
          stroke="rgba(255,242,240,0.88)"
          strokeWidth={LENS_STROKE}
          strokeLinecap="round"
        />
        {/* Top sheen */}
        <path
          d={lensPath} fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={LENS_STROKE * 0.28}
          strokeLinecap="round"
        />

        {/* ── 3. Vivid text — masked (NOT clipped) so no character is cut ── */}
        <text
          fontSize={FONT_SIZE + 2}
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          fontWeight="700"
          fill="#1A1A1A"
          letterSpacing="0.5"
          dy={DY}
          mask={`url(#${uid}-m)`}
        >
          <textPath href={`#${uid}-p`} startOffset="33.33%">
            <animate
              attributeName="startOffset"
              from="33.33%" to="16.66%"
              dur="22s" repeatCount="indefinite"
            />
            {FULL_TEXT}
          </textPath>
        </text>
      </svg>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          animate { display: none !important; }
        }
      `}</style>
    </div>
  )
}
