import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — VoXalVoice',
  description: 'Page not found.',
}

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', background: '#FFF0F5',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', textAlign: 'center',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Cracked earth texture */}
      <div
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.07 }}
      >
        <div style={{ width: '100%', height: '100%', backgroundColor: '#191919', filter: 'url(#nf-cracks)' }} />
        <svg width={0} height={0} style={{ position: 'absolute' }}>
          <defs>
            <filter id="nf-cracks">
              <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={5} seed={10} result="noise" />
              <feColorMatrix type="luminanceToAlpha" in="noise" result="alphaNoise" />
              <feComponentTransfer in="alphaNoise" result="plates">
                <feFuncA type="discrete" tableValues="0 1" />
              </feComponentTransfer>
              <feConvolveMatrix order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" in="plates" result="edges" />
              <feComponentTransfer in="edges" result="invertedEdges">
                <feFuncR type="table" tableValues="1 0" />
                <feFuncG type="table" tableValues="1 0" />
                <feFuncB type="table" tableValues="1 0" />
              </feComponentTransfer>
              <feFlood floodColor="#000" result="bgColor" />
              <feComposite operator="in" in="bgColor" in2="invertedEdges" />
            </filter>
          </defs>
        </svg>
      </div>

      {/* Animated face */}
      <main className="face-container" style={{ position: 'relative', zIndex: 1 }}>
        <svg className="face" viewBox="0 0 320 380">
          <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={25}>
            <g className="face__eyes" transform="translate(0,112.5)">
              <g transform="translate(15,0)">
                <polyline className="face__eye-lid" points="37,0 0,120 75,120" />
                <polyline className="face__pupil" points="55,120 55,155" strokeDasharray="35 35" />
              </g>
              <g transform="translate(230,0)">
                <polyline className="face__eye-lid" points="37,0 0,120 75,120" />
                <polyline className="face__pupil" points="55,120 55,155" strokeDasharray="35 35" />
              </g>
            </g>
            <rect className="face__nose" x="132.5" y="112.5" width={55} height={155} rx={4} ry={4} />
            <g transform="translate(65,334)" strokeDasharray="102 102">
              <path className="face__mouth-left" d="M 0 30 C 0 30 40 0 95 0" />
              <path className="face__mouth-right" d="M 95 0 C 150 0 190 30 190 30" />
            </g>
          </g>
        </svg>
      </main>

      {/* Text */}
      <div style={{ position: 'relative', zIndex: 1 }}>
      <p style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: '#D4726A', margin: '0 0 12px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        404
      </p>
      <h1 style={{
        fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 700, color: '#1A1A1A',
        margin: '0 0 8px', letterSpacing: '-0.02em',
        fontFamily: 'Georgia, "Times New Roman", serif',
      }}>
        Page not found.
      </h1>
      <p style={{
        fontSize: 16, color: '#5A4A4A', margin: '0 0 36px', lineHeight: 1.6, maxWidth: 360,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        The page you are looking for does not exist or has been moved.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '12px 28px', background: '#1A1A1A', color: '#fff',
          borderRadius: 9999, textDecoration: 'none', fontSize: 14, fontWeight: 600,
          border: '1.5px solid #D4726A', minHeight: 44,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          Go home
        </Link>
        <Link href="/studio" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '12px 28px', background: 'transparent', color: '#1A1A1A',
          borderRadius: 9999, textDecoration: 'none', fontSize: 14, fontWeight: 500,
          border: '1.5px solid rgba(26,26,26,0.2)', minHeight: 44,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          Open studio
        </Link>
      </div>
      </div>

      <style>{`
        .face-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 300px;
          color: #D4726A;
        }
        .face {
          width: 160px;
        }
        .face__eyes {
          animation: eyes 1s 0.3s forwards;
        }
        .face__mouth-left {
          animation: mouth-left 1s 0.3s forwards;
        }
        .face__mouth-right {
          animation: mouth-right 1s 0.3s forwards;
        }
        .face__nose {
          animation: nose 1s 0.3s forwards;
        }
        .face__eye-lid,
        .face__pupil {
          animation-duration: 4s;
          animation-delay: 1.3s;
          animation-iteration-count: infinite;
        }
        .face__eye-lid {
          animation-name: eye-lid;
        }
        .face__pupil {
          animation-name: pupil;
        }
        @keyframes eye-lid {
          0%, 40%, 45%, 100% { transform: translateY(0); }
          42.5%              { transform: translateY(17.5px); }
        }
        @keyframes eyes {
          from { transform: translateY(112.5px); }
          to   { transform: translateY(15px); }
        }
        @keyframes pupil {
          0%, 37.5%, 40%, 45%, 87.5%, 100% { stroke-dashoffset: 0;  transform: translate(0, 0); }
          12.5%, 25%, 62.5%, 75%            { transform: translate(-35px, 0); }
          42.5%                             { stroke-dashoffset: 35; transform: translate(0, 17.5px); }
        }
        @keyframes mouth-left {
          from, 50% { stroke-dashoffset: -102; }
          to         { stroke-dashoffset: 0; }
        }
        @keyframes mouth-right {
          from, 50% { stroke-dashoffset: 102; }
          to         { stroke-dashoffset: 0; }
        }
        @keyframes nose {
          from { transform: translate(0, 0); }
          to   { transform: translate(0, 22.5px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .face__eyes, .face__eye-lid, .face__pupil,
          .face__mouth-left, .face__mouth-right,
          .face__nose { animation: none; }
        }
      `}</style>
    </div>
  )
}
