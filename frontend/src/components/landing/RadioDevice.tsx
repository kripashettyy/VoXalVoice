'use client'

export default function RadioDevice() {
  return (
    <>
      <div className="device-case">
        <input type="radio" name="mode" id="app1" className="rd-input" defaultChecked />
        <input type="radio" name="mode" id="app2" className="rd-input" />
        <input type="radio" name="mode" id="app3" className="rd-input" />
        <input type="radio" name="mode" id="app4" className="rd-input" />

        <div className="speaker-grille" />

        <div className="screen-window">
          <div className="glass-glare" />
          <div className="freq-needle" />
          <div className="tuner-band">

            {/* Panel 1 — Tape Deck */}
            <div className="panel panel-1">
              <div className="label">Tape Deck</div>
              <div style={{ textAlign: 'center' }}>
                <div className="counter-box">0 4 2</div>
              </div>
              <div className="tape-mechanism">
                <div className="spool" />
                <div className="spool" />
              </div>
              <div className="freq-display">
                <span>AM</span><span>54</span><span>60</span><span>70</span><span>80</span>
              </div>
            </div>

            {/* Panel 2 — Signal Monitor */}
            <div className="panel panel-2">
              <div className="label">Signal Monitor</div>
              <div className="waveform">
                {[0.1, 0.3, 0.5, 0.2, 0.4, 0.6, 0.1, 0.3].map((delay, i) => (
                  <div key={i} className="wave-bar" style={{ animationDelay: `${delay}s` }} />
                ))}
              </div>
              <div style={{ marginTop: 20, fontSize: '2rem', fontWeight: 800, textAlign: 'center' }}>
                98.6 <span style={{ fontSize: '1rem', color: '#888' }}>MHz</span>
              </div>
              <div className="freq-display">
                <span>FM</span><span>88</span><span>92</span><span>96</span><span>100</span>
              </div>
            </div>

            {/* Panel 3 — System Config */}
            <div className="panel panel-3">
              <div className="label">System Config</div>
              <div className="switch-row">
                <div className="toggle">
                  <span>Power</span>
                  <div className="toggle-graphic" style={{ background: '#f04e30' }}>
                    <div style={{ position: 'absolute', right: 2, top: 2, width: 16, height: 16, background: '#fff', borderRadius: '50%' }} />
                  </div>
                </div>
                <div className="toggle">
                  <span>Dolby NR</span>
                  <div className="toggle-graphic" />
                </div>
                <div className="toggle">
                  <span>Filter</span>
                  <div className="toggle-graphic" />
                </div>
              </div>
              <div className="freq-display">
                <span>SW</span><span>4</span><span>6</span><span>8</span><span>10</span>
              </div>
            </div>

            {/* Panel 4 — Battery Check */}
            <div className="panel panel-4">
              <div className="label">Battery Check</div>
              <div style={{ width: '100%', height: 30, border: '1px solid #999', borderRadius: 4, padding: 2, marginTop: 30 }}>
                <div style={{ width: '75%', height: '100%', background: '#2a2a2a' }} />
              </div>
              <div style={{ marginTop: 10, fontSize: '0.8rem', textAlign: 'right' }}>DC 12V</div>
              <div className="freq-display">
                <span>LW</span><span>150</span><span>200</span><span>250</span><span>300</span>
              </div>
            </div>

          </div>
        </div>

        <div className="controls-strip">
          <label htmlFor="app1" className="push-btn"><span className="btn-label">Play</span></label>
          <label htmlFor="app2" className="push-btn"><span className="btn-label">Tuner</span></label>
          <label htmlFor="app3" className="push-btn"><span className="btn-label">Set</span></label>
          <label htmlFor="app4" className="push-btn"><span className="btn-label">Batt</span></label>
        </div>
      </div>

      <style>{`
        .device-case {
          --case: #e6e6e2;
          --text-dark: #2a2a2a;
          --accent-orange: #f04e30;
          --accent-green: #4a6fa5;
          --grid-lines: #c0c0bc;
          width: 320px;
          height: 420px;
          background-color: var(--case);
          border-radius: 12px;
          font-family: "Inter", sans-serif;
          box-shadow: 15px 15px 30px rgba(0,0,0,0.1), -5px -5px 15px rgba(255,255,255,0.8);
          padding: 22px;
          display: flex;
          flex-direction: column;
          position: relative;
          flex-shrink: 0;
        }
        .rd-input { display: none; }
        .speaker-grille {
          width: 100%; height: 44px;
          background-image: radial-gradient(#aaa 1.5px, transparent 1.5px);
          background-size: 6px 6px;
          margin-bottom: 14px;
          opacity: 0.6;
        }
        .screen-window {
          width: 100%; height: 240px;
          background: #f0f0f0;
          border: 1px solid #d0d0d0;
          border-radius: 4px;
          position: relative;
          overflow: hidden;
          box-shadow: inset 2px 2px 5px rgba(0,0,0,0.05);
          margin-bottom: 10px;
        }
        .glass-glare {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(120deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 60%);
          z-index: 10; pointer-events: none;
        }
        .tuner-band {
          display: flex; width: 400%; height: 100%;
          transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .panel {
          width: 25%; height: 100%; padding: 16px;
          position: relative; border-right: 1px solid var(--grid-lines);
          background:
            linear-gradient(90deg, transparent 95%, var(--grid-lines) 95%),
            linear-gradient(transparent 95%, var(--grid-lines) 95%);
          background-size: 20px 20px;
        }
        .label {
          font-weight: 800; font-size: 0.75rem;
          text-transform: uppercase; letter-spacing: 1px;
          margin-bottom: 8px; color: #666;
        }
        .freq-display {
          position: absolute; bottom: 16px; left: 0; width: 100%; height: 36px;
          border-top: 2px solid var(--text-dark);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 10px; font-family: monospace; font-size: 0.85rem;
        }
        .freq-needle {
          position: absolute; bottom: 0; left: 50%;
          width: 2px; height: 100%;
          background: var(--accent-orange); z-index: 5;
        }
        .tape-mechanism {
          display: flex; justify-content: center; gap: 24px; margin-top: 32px;
        }
        .spool {
          width: 52px; height: 52px; border-radius: 50%;
          background: #ddd; position: relative;
          border: 1px solid #bbb; overflow: hidden;
        }
        .spool::after {
          content: ""; position: absolute; top: 0; left: 0;
          width: 100%; height: 100%;
          background: conic-gradient(#333 0deg, #333 120deg, transparent 120deg, transparent 180deg, #333 180deg, #333 300deg, transparent 300deg);
          border-radius: 50%;
        }
        .counter-box {
          background: #222; color: #fff;
          padding: 4px 8px; font-family: monospace;
          border-radius: 2px; display: inline-block;
          letter-spacing: 4px; margin-top: 16px;
        }
        .waveform {
          width: 100%; height: 70px;
          display: flex; align-items: center; gap: 2px; margin-top: 16px;
        }
        .wave-bar {
          flex: 1; background: var(--text-dark); height: 10px;
          animation: rd-equalize 1s ease-in-out infinite;
        }
        @keyframes rd-equalize {
          0%, 100% { height: 10px; }
          50%       { height: 55px; }
        }
        .switch-row {
          display: flex; flex-direction: column; gap: 12px; margin-top: 16px;
        }
        .toggle {
          display: flex; align-items: center; justify-content: space-between;
          font-size: 0.85rem; font-weight: 600;
        }
        .toggle-graphic {
          width: 40px; height: 20px;
          background: #ccc; border-radius: 10px; position: relative;
        }
        .toggle-graphic::after {
          content: ""; position: absolute;
          top: 2px; left: 2px; width: 16px; height: 16px;
          background: #fff; border-radius: 50%;
          box-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }
        .controls-strip {
          margin-top: auto;
          display: flex; justify-content: space-between;
          align-items: center; padding: 0 4px; margin-bottom: 8px;
        }
        .push-btn {
          width: 46px; height: 46px; border-radius: 50%;
          background: #f5f5f5; border: 1px solid #ddd;
          box-shadow: inset 0 0 5px rgba(255,255,255,1), 3px 3px 6px rgba(0,0,0,0.1);
          cursor: pointer;
          display: flex; justify-content: center; align-items: center;
          transition: all 0.1s; position: relative;
        }
        .push-btn::after {
          content: ""; width: 18px; height: 18px;
          border-radius: 50%; background: #e0e0e0;
          box-shadow: inset 1px 1px 2px rgba(0,0,0,0.1);
        }
        .push-btn:active {
          box-shadow: inset 2px 2px 5px rgba(0,0,0,0.1), 1px 1px 2px rgba(0,0,0,0.1);
          transform: translateY(1px);
        }
        .push-btn:active::after { background: var(--accent-orange); }
        .btn-label {
          position: absolute; bottom: -22px;
          font-size: 0.6rem; font-weight: 600;
          color: #888; text-transform: uppercase;
        }

        /* Panel switching */
        #app1:checked ~ .screen-window .tuner-band { transform: translateX(0%); }
        #app2:checked ~ .screen-window .tuner-band { transform: translateX(-25%); }
        #app3:checked ~ .screen-window .tuner-band { transform: translateX(-50%); }
        #app4:checked ~ .screen-window .tuner-band { transform: translateX(-75%); }

        #app1:checked ~ .controls-strip label[for="app1"]::after { background: var(--accent-green); }
        #app2:checked ~ .controls-strip label[for="app2"]::after { background: var(--accent-green); }
        #app3:checked ~ .controls-strip label[for="app3"]::after { background: var(--accent-green); }
        #app4:checked ~ .controls-strip label[for="app4"]::after { background: var(--accent-green); }

        #app1:checked ~ .screen-window .tuner-band .panel-1 .spool {
          animation: rd-spin 4s linear infinite;
        }
        @keyframes rd-spin { to { transform: rotate(360deg); } }

        @media (prefers-reduced-motion: reduce) {
          .wave-bar { animation: none !important; height: 30px !important; }
          .spool     { animation: none !important; }
        }
      `}</style>
    </>
  )
}
