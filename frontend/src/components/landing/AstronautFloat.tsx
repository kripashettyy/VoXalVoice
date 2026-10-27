export default function AstronautFloat() {
  return (
    <section style={{
      background: '#111111',
      height: 420,
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background watermark */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}>
        {/* "VoXal" line */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -58%)',
          fontSize: 'clamp(80px, 18vw, 200px)',
          fontWeight: 900,
          fontFamily: 'Georgia, "Times New Roman", serif',
          letterSpacing: '-0.04em',
          lineHeight: 0.9,
          whiteSpace: 'nowrap',
          background: 'linear-gradient(135deg, rgba(212,114,106,0.13) 0%, rgba(255,255,255,0.06) 50%, rgba(212,114,106,0.10) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          userSelect: 'none',
          filter: 'blur(0.4px)',
        }}>
          VoXal
        </div>
        {/* "Voice" line — italic, offset right */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-44%, 8%)',
          fontSize: 'clamp(80px, 18vw, 200px)',
          fontWeight: 900,
          fontStyle: 'italic',
          fontFamily: 'Georgia, "Times New Roman", serif',
          letterSpacing: '-0.04em',
          lineHeight: 0.9,
          whiteSpace: 'nowrap',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(212,114,106,0.12) 60%, rgba(255,255,255,0.04) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          userSelect: 'none',
          filter: 'blur(0.4px)',
        }}>
          Voice
        </div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://uiverse.io/astronaut.png"
        alt="Floating astronaut"
        className="astronaut"
        style={{
          width: 180,
          position: 'absolute',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <style>{`
        .astronaut {
          animation:
            astronaut-x 18s ease-in-out infinite alternate,
            astronaut-y 11s ease-in-out infinite alternate,
            astronaut-spin 24s linear infinite;
          transform-origin: center center;
        }

        @keyframes astronaut-x {
          0%   { left: 5%; }
          25%  { left: 65%; }
          50%  { left: 30%; }
          75%  { left: 75%; }
          100% { left: 10%; }
        }

        @keyframes astronaut-y {
          0%   { top: 8%; }
          33%  { top: 60%; }
          66%  { top: 20%; }
          100% { top: 55%; }
        }

        @keyframes astronaut-spin {
          0%   { transform: rotate(-15deg) scale(1); }
          25%  { transform: rotate(10deg)  scale(1.08); }
          50%  { transform: rotate(-8deg)  scale(0.95); }
          75%  { transform: rotate(12deg)  scale(1.05); }
          100% { transform: rotate(-15deg) scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .astronaut {
            animation: none;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </section>
  )
}
