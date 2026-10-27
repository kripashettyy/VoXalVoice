'use client'

const TEXT = 'Turn your voice into polished audio · Studio-quality synthesis · Natural flow · Real-time controls · '
const RADIUS = 148
const SIZE = RADIUS * 2 + 60

export default function CircleText() {
  const cx = SIZE / 2
  const cy = SIZE / 2

  // SVG circle path: start at top, go clockwise
  const pathD = [
    `M ${cx}, ${cy - RADIUS}`,
    `a ${RADIUS},${RADIUS} 0 1,1 -0.01,0`,
  ].join(' ')

  return (
    <div
      style={{
        position: 'absolute',
        left: '-2%',
        top: '50%',
        transform: 'translateY(-50%)',
        width: SIZE,
        height: SIZE,
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.2,
        animation: 'circle-spin 24s linear infinite',
      }}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden="true"
        overflow="visible"
      >
        <defs>
          <path id="vv-circle" d={pathD} />
        </defs>
        <text
          fontSize="12.5"
          fill="#3A2A2A"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          letterSpacing="2"
        >
          <textPath href="#vv-circle" startOffset="0%">
            {TEXT}{TEXT}
          </textPath>
        </text>
      </svg>

      <style>{`
        @keyframes circle-spin {
          from { transform: translateY(-50%) rotate(0deg); }
          to   { transform: translateY(-50%) rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          div[style*="circle-spin"] { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
