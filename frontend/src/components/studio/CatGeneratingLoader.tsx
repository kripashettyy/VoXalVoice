'use client'

interface Props {
  progress: number // 0–100
}

export default function CatGeneratingLoader({ progress }: Props) {
  const pct = Math.min(100, Math.max(0, Math.round(progress)))

  const label =
    pct <= 5  ? 'Starting up…' :
    pct < 35  ? 'Purring through your text…' :
    pct < 55  ? 'Almost halfway there…' :
    pct < 75  ? 'Getting closer…' :
    pct < 92  ? 'Nearly done…' :
                'Finishing up!'

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 10, padding: '18px 0 6px',
    }}>

      {/* Cat animation */}
      <div className="vv-cat-wrap" aria-hidden="true">
        <div className="vv-cat">
          <div className="vv-cat__body">
            <div className="vv-cat__tail" />
          </div>
          <div className="vv-cat__paws">
            <div className="vv-cat__paw vv-cat__paw--left" />
            <div className="vv-cat__paw vv-cat__paw--right" />
          </div>
          <div className="vv-cat__head">
            <div className="vv-cat__ear vv-cat__ear--left" />
            <div className="vv-cat__ear vv-cat__ear--right" />
            <div className="vv-cat__eye vv-cat__eye--left" />
            <div className="vv-cat__eye vv-cat__eye--right" />
            <div className="vv-cat__nose" />
            <div className="vv-cat__mouth" />
            <div className="vv-cat__whiskers-l" />
            <div className="vv-cat__whiskers-r" />
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
        <div style={{
          width: '80%', height: 6, background: 'rgba(212,114,106,0.15)',
          borderRadius: 999, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #D4726A, #e8a09a)',
            borderRadius: 999,
            transition: 'width 0.4s ease',
          }} />
        </div>

        <span style={{
          fontSize: 13, fontWeight: 700, color: '#D4726A',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          letterSpacing: '0.02em',
        }}>
          {pct}%
        </span>

        <span style={{
          fontSize: 11, color: '#9A8A8A',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          {label}
        </span>
      </div>

      <style>{`
        .vv-cat-wrap {
          position: relative;
          width: 10vmax; height: 10vmax;
          min-width: 80px; min-height: 80px;
          display: flex; justify-content: center; align-items: center;
        }
        .vv-cat-wrap::before {
          content: "";
          position: absolute;
          bottom: -0.5vmax; left: 50%;
          transform: translateX(-50%);
          width: 7.5vmax; height: 1vmax;
          min-width: 60px; min-height: 8px;
          background-color: #dcdcdc;
          border-radius: 50%;
          z-index: -10;
          animation: vv-shadow 8s ease-in-out infinite;
        }
        .vv-cat {
          position: relative;
          width: 10vmax; height: 9vmax;
          min-width: 80px; min-height: 72px;
        }
        .vv-cat__body {
          position: absolute; bottom: 0; left: 50%;
          transform: translateX(-50%);
          width: 7.5vmax; height: 5vmax;
          min-width: 60px; min-height: 40px;
          background-color: #D4726A;
          border-radius: 50% 50% 30% 30% / 60% 60% 40% 40%;
          z-index: -1;
          animation: vv-body-bob 8s ease-in-out infinite;
        }
        .vv-cat__paws {
          position: absolute; bottom: 0; left: 50%;
          transform: translateX(-50%);
          width: 5.5vmax; height: 1.5vmax;
          min-width: 44px; min-height: 12px;
          z-index: 2;
          animation: vv-body-bob 8s ease-in-out infinite;
        }
        .vv-cat__paw {
          position: absolute; bottom: 0;
          width: 2vmax; height: 1.25vmax;
          min-width: 16px; min-height: 10px;
          background-color: #e8a09a;
          border-radius: 50% 50% 40% 40% / 70% 70% 30% 30%;
        }
        .vv-cat__paw--left  { left: 0; }
        .vv-cat__paw--right { right: 0; }
        .vv-cat__tail {
          position: absolute;
          bottom: 0.5vmax; left: -2vmax;
          width: 6vmax; height: 1.25vmax;
          min-width: 48px; min-height: 10px;
          background-color: #D4726A;
          border-radius: 1vmax;
          transform-origin: 100% 50%;
          transform: rotate(30deg);
          animation: vv-tail-sway 8s ease-in-out infinite;
        }
        .vv-cat__head {
          position: absolute; top: 0; left: 50%;
          transform: translateX(-50%);
          width: 6vmax; height: 5.5vmax;
          min-width: 48px; min-height: 44px;
          background-color: #e8a09a;
          border-radius: 50%;
          animation: vv-head-turn 8s ease-in-out infinite;
        }
        .vv-cat__ear {
          position: absolute;
          top: -0.5vmax;
          width: 2.5vmax; height: 2.5vmax;
          min-width: 20px; min-height: 20px;
          background-color: #e8a09a;
          z-index: -1;
        }
        .vv-cat__ear::before {
          content: "";
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 70%; height: 70%;
          background-color: #FFF0F5;
        }
        .vv-cat__ear--left {
          left: -0.5vmax;
          border-radius: 5% 70% 5% 50%;
          transform: rotate(-15deg);
          animation: vv-ear-left 8s ease-in-out infinite;
        }
        .vv-cat__ear--left::before  { border-radius: 5% 70% 5% 50%; }
        .vv-cat__ear--right {
          right: -0.5vmax;
          border-radius: 70% 5% 50% 5%;
          transform: rotate(15deg);
          animation: vv-ear-right 8s ease-in-out infinite;
        }
        .vv-cat__ear--right::before { border-radius: 70% 5% 50% 5%; }
        .vv-cat__eye {
          position: absolute;
          top: 2vmax;
          width: 1.25vmax; height: 1.25vmax;
          min-width: 10px; min-height: 10px;
          background-color: #a8e6cf;
          border-radius: 50%;
          animation: vv-blink 8s linear infinite;
        }
        .vv-cat__eye::before {
          content: "";
          position: absolute; left: 50%; top: 50%;
          transform: translate(-50%, -50%);
          width: 0.25vmax; height: 0.6vmax;
          min-width: 2px; min-height: 5px;
          background-color: #2c3e50;
          border-radius: 0.125vmax;
        }
        .vv-cat__eye--left  { left: 1vmax; }
        .vv-cat__eye--right { right: 1vmax; }
        .vv-cat__nose {
          position: absolute;
          top: 3.25vmax; left: 50%;
          transform: translateX(-50%);
          width: 0.75vmax; height: 0.5vmax;
          min-width: 6px; min-height: 4px;
          background-color: #FFF0F5;
          border-radius: 20% 20% 50% 50%;
        }
        .vv-cat__mouth {
          position: absolute;
          top: 3.75vmax; left: 50%;
          width: 1.5vmax; height: 0.75vmax;
          min-width: 12px; min-height: 6px;
          transform: translateX(-50%);
          animation: vv-meow 8s ease-in-out infinite;
        }
        .vv-cat__mouth::before,
        .vv-cat__mouth::after {
          content: "";
          position: absolute; top: 0;
          width: 50%; height: 100%;
          border-style: solid;
          border-color: #c45a52;
          border-width: 0 0 0.1vmax 0;
          border-radius: 0 0 50% 50% / 0 0 100% 100%;
        }
        .vv-cat__mouth::before { left: 0;  transform: rotate(10deg); }
        .vv-cat__mouth::after  { right: 0; transform: rotate(-10deg); }
        .vv-cat__whiskers-l,
        .vv-cat__whiskers-r {
          position: absolute;
          top: 3.75vmax;
          width: 2.5vmax; height: 1.5vmax;
          min-width: 20px; min-height: 12px;
        }
        .vv-cat__whiskers-l { left: -0.25vmax;  transform: rotate(10deg); }
        .vv-cat__whiskers-r { right: -0.25vmax; transform: rotate(-10deg); }
        .vv-cat__whiskers-l::before, .vv-cat__whiskers-l::after,
        .vv-cat__whiskers-r::before, .vv-cat__whiskers-r::after {
          content: "";
          position: absolute;
          height: 0.075vmax;
          background-color: #c45a52;
          border-radius: 0.05vmax;
        }
        .vv-cat__whiskers-l::before { width: 80%; top: 0;       left: 0;  transform: rotate(-10deg); }
        .vv-cat__whiskers-l::after  { width: 100%; top: 0.5vmax; left: 0; }
        .vv-cat__whiskers-r::before { width: 80%; top: 0;       right: 0; transform: rotate(10deg); }
        .vv-cat__whiskers-r::after  { width: 100%; top: 0.5vmax; right: 0; }

        @keyframes vv-head-turn {
          0%,100% { transform: translateX(-50%) rotate(0deg); }
          20%     { transform: translateX(-55%) rotate(-5deg); }
          60%     { transform: translateX(-45%) rotate(5deg); }
          80%     { transform: translateX(-50%) rotate(0deg); }
        }
        @keyframes vv-tail-sway {
          0%,20%,100% { transform: rotate(30deg); }
          50%          { transform: rotate(0deg); }
          80%          { transform: rotate(-25deg); }
        }
        @keyframes vv-blink {
          0%,38%,41%,88%,91%,100% { transform: scaleY(1); }
          40%,90%                  { transform: scaleY(0.1); }
        }
        @keyframes vv-body-bob {
          0%,100% { bottom: 0; }
          50%     { bottom: 0.25vmax; }
        }
        @keyframes vv-ear-left {
          0%,50%,100% { transform: rotate(-15deg); }
          55%          { transform: rotate(-25deg); }
          60%          { transform: rotate(-15deg); }
        }
        @keyframes vv-ear-right {
          0%,70%,100% { transform: rotate(15deg); }
          75%          { transform: rotate(25deg); }
          80%          { transform: rotate(15deg); }
        }
        @keyframes vv-meow {
          0%,50%,60%,100% { transform: translateX(-50%) scaleY(1); }
          55%              { transform: translateX(-50%) scaleY(1.3); }
        }
        @keyframes vv-shadow {
          0%,100% { width: 7.5vmax; opacity: 1; }
          50%     { width: 8vmax;   opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}
