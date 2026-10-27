'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const LOGO_SVG = (
  <svg width="20" height="18" viewBox="0 0 20 18" fill="none" aria-hidden="true">
    <rect x="0"  y="6" width="2.5" height="6"  rx="1.25" fill="#D4726A"/>
    <rect x="4"  y="3" width="2.5" height="12" rx="1.25" fill="#D4726A"/>
    <rect x="8"  y="0" width="2.5" height="18" rx="1.25" fill="#D4726A"/>
    <rect x="12" y="3" width="2.5" height="12" rx="1.25" fill="#D4726A"/>
    <rect x="16" y="6" width="2.5" height="6"  rx="1.25" fill="#D4726A"/>
  </svg>
)

interface ToolLink { label: string; href: string; icon: React.ReactNode; desc: string }

const TOOLS: ToolLink[] = [
  {
    label: 'Voice-over',
    href: '/voiceover',
    desc: 'Replace video audio with TTS',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="4" width="15" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M17 8.5l5-3v13l-5-3V8.5z" fill="currentColor" opacity="0.7"/>
      </svg>
    ),
  },
  {
    label: 'Subtitle Voice',
    href: '/subtitle',
    desc: 'Convert .srt/.vtt to timed WAV',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.8"/>
        <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.8"/>
        <line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'SSML Editor',
    href: '/ssml-editor',
    desc: 'Visual SSML builder with preview',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <polyline points="4 7 4 4 20 4 20 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="9" y1="20" x2="15" y2="20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Dialogue',
    href: '/dialogue',
    desc: 'Multi-voice script synthesis',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Batch TTS',
    href: '/batch',
    desc: 'Synthesize a file of texts to ZIP',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.8"/>
        <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.8"/>
        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Reels & Shorts',
    href: '/reels',
    desc: 'Auto-voiceover for vertical videos',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="12" cy="19" r="1" fill="currentColor"/>
        <path d="M10 8l4 3-4 3V8z" fill="currentColor" opacity="0.7"/>
      </svg>
    ),
  },
]

const MOBILE_NAV_LINKS = [
  { label: 'Studio',    href: '/studio' },
  { label: 'Voice Lab', href: '/voice-lab' },
  { label: 'Pricing',   href: '/pricing' },
  { label: 'Lab',       href: '/lab' },
]

interface Props {
  pageLabel: string
  actions?: React.ReactNode
}

export default function AppHeader({ pageLabel, actions }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const toolsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!toolsOpen) return
    const handler = (e: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [toolsOpen])

  return (
    <>
      <style>{HEADER_STYLES}</style>

      <div className="app-header-wrap">
        <nav role="navigation" aria-label="App navigation" className="app-nav-pill">
          {/* Logo */}
          <Link href="/" className="app-logo" aria-label="VoXalVoice home">
            {LOGO_SVG}
            <span className="app-logo-text">VoXalVoice</span>
          </Link>

          {/* Page badge */}
          <span className="app-page-badge">{pageLabel}</span>

          <div style={{ flex: 1, minWidth: 0 }} />

          {/* Desktop: Studio + Tools dropdown + page-specific actions */}
          <div className="app-header-actions">
            <Link href="/studio" className="app-nav-btn" aria-label="Studio">
              <svg width="13" height="13" viewBox="0 0 20 18" fill="none" aria-hidden="true">
                <rect x="0"  y="6" width="2.5" height="6"  rx="1.25" fill="currentColor"/>
                <rect x="4"  y="3" width="2.5" height="12" rx="1.25" fill="currentColor"/>
                <rect x="8"  y="0" width="2.5" height="18" rx="1.25" fill="currentColor"/>
                <rect x="12" y="3" width="2.5" height="12" rx="1.25" fill="currentColor"/>
                <rect x="16" y="6" width="2.5" height="6"  rx="1.25" fill="currentColor"/>
              </svg>
              Studio
            </Link>

            {/* Tools dropdown */}
            <div ref={toolsRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setToolsOpen((o) => !o)}
                aria-expanded={toolsOpen}
                aria-haspopup="true"
                className="app-nav-btn"
                style={{ gap: 5 }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Tools
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true"
                  style={{ transition: 'transform 0.2s', transform: toolsOpen ? 'rotate(180deg)' : 'none' }}>
                  <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {toolsOpen && (
                <div className="app-tools-dropdown" role="menu" aria-label="Tools menu">
                  <p className="app-tools-heading">Tools</p>
                  {TOOLS.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      role="menuitem"
                      onClick={() => setToolsOpen(false)}
                      className="app-tool-item"
                    >
                      <span className="app-tool-icon">{tool.icon}</span>
                      <span style={{ minWidth: 0 }}>
                        <span className="app-tool-label">{tool.label}</span>
                        <span className="app-tool-desc">{tool.desc}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {actions}
          </div>

          {/* Hamburger — mobile only */}
          <button
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="app-header-hamburger"
          >
            {[0, 1, 2].map((i) => (
              <span key={i} style={{
                display: 'block', width: 20, height: 2,
                background: '#1A1A1A', borderRadius: 2,
                transform:
                  i === 0 && menuOpen ? 'rotate(45deg) translate(5px, 5px)' :
                  i === 2 && menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
                opacity: i === 1 && menuOpen ? 0 : 1,
                transition: 'transform 0.2s, opacity 0.2s',
              }} />
            ))}
          </button>
        </nav>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="app-mobile-menu">
            {MOBILE_NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="app-mobile-link">
                {l.label}
              </Link>
            ))}

            {/* Tools section in mobile */}
            <div style={{ padding: '8px 8px 4px', borderTop: '1px solid rgba(212,114,106,0.1)', marginTop: 4 }}>
              <p style={{ margin: '0 0 4px', padding: '4px 8px', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                Tools
              </p>
              {TOOLS.map((tool) => (
                <Link key={tool.href} href={tool.href} onClick={() => setMenuOpen(false)} className="app-mobile-link" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: '#D4726A', display: 'flex' }}>{tool.icon}</span>
                  <span style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 14 }}>{tool.label}</span>
                    <span style={{ fontSize: 11, color: '#9A8A8A' }}>{tool.desc}</span>
                  </span>
                </Link>
              ))}
            </div>

            {actions && (
              <div className="app-mobile-actions">
                {actions}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ height: 72 }} aria-hidden="true" />
    </>
  )
}

const HEADER_STYLES = `
  .app-header-wrap {
    position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
    width: calc(100% - 48px); max-width: 960px; z-index: 200;
  }
  .app-nav-pill {
    background: #ffffff; border-radius: 9999px; border: 1px solid #e8e8e8;
    box-shadow: 0 2px 16px rgba(0,0,0,0.08);
    display: flex; align-items: center; padding: 6px 8px 6px 14px;
    gap: 8px; width: 100%; box-sizing: border-box; min-height: 52px;
  }
  .app-logo {
    display: flex; align-items: center; gap: 7px; text-decoration: none;
    color: #1A1A1A; font-weight: 700; font-size: 17px; letter-spacing: -0.3px;
    min-height: 36px; flex-shrink: 0;
    font-family: Georgia, "Times New Roman", serif;
  }
  .app-logo-text { display: inline; }
  .app-page-badge {
    display: inline-flex; font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: #9A8A8A; background: rgba(212,114,106,0.08);
    padding: 3px 10px; border-radius: 9999px; white-space: nowrap; flex-shrink: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .app-header-actions { display: flex; align-items: center; gap: 8px; }
  .app-header-hamburger {
    display: none !important; background: none; border: none; cursor: pointer;
    padding: 6px 8px; min-width: 44px; min-height: 44px;
    flex-direction: column; justify-content: center; align-items: center;
    gap: 5px; border-radius: 8px; flex-shrink: 0;
  }
  .app-nav-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; background: rgba(212,114,106,0.08);
    border: 1.5px solid rgba(212,114,106,0.25); border-radius: 9999px;
    cursor: pointer; font-size: 13px; font-weight: 500; color: #D4726A;
    min-height: 36px; text-decoration: none; white-space: nowrap;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    transition: all 0.15s;
  }
  .app-nav-btn:hover { background: rgba(212,114,106,0.14); }

  /* Tools dropdown */
  .app-tools-dropdown {
    position: absolute; top: calc(100% + 8px); right: 0;
    background: #fff; border-radius: 16px;
    border: 1.5px solid rgba(212,114,106,0.18);
    box-shadow: 0 8px 32px rgba(212,114,106,0.15);
    padding: 8px; min-width: 240px; z-index: 300;
  }
  .app-tools-heading {
    margin: 0 0 4px; padding: 4px 10px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: #9A8A8A;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .app-tool-item {
    display: flex; align-items: center; gap: 12px; padding: 10px 10px;
    border-radius: 10px; text-decoration: none; transition: background 0.1s;
  }
  .app-tool-item:hover { background: rgba(212,114,106,0.07); }
  .app-tool-icon {
    width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
    background: rgba(212,114,106,0.1); color: #D4726A;
    display: flex; align-items: center; justify-content: center;
  }
  .app-tool-label {
    display: block; font-size: 13px; font-weight: 600; color: #1A1A1A;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .app-tool-desc {
    display: block; font-size: 11px; color: #9A8A8A; margin-top: 1px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  /* Mobile */
  .app-mobile-menu {
    margin-top: 8px; background: #ffffff; border-radius: 20px;
    border: 1px solid #e8e8e8; box-shadow: 0 4px 24px rgba(0,0,0,0.10);
    padding: 8px 8px 12px; display: flex; flex-direction: column; gap: 2px;
  }
  .app-mobile-link {
    color: #3A3A3A; text-decoration: none; font-size: 15px;
    padding: 11px 16px; border-radius: 12px; min-height: 44px;
    display: flex; align-items: center; transition: background 0.1s;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .app-mobile-link:hover { background: rgba(212,114,106,0.07); }
  .app-mobile-actions {
    padding: 8px 8px 0; display: flex; flex-direction: column; gap: 6px;
  }
  .app-mobile-actions a, .app-mobile-actions button {
    justify-content: center !important; width: 100% !important;
    box-sizing: border-box !important;
  }

  @media (max-width: 600px) {
    .app-header-wrap {
      left: 12px !important; right: 12px !important;
      width: auto !important; max-width: none !important; transform: none !important;
    }
    .app-header-actions { display: none !important; }
    .app-header-hamburger { display: flex !important; }
  }
  @media (max-width: 420px) { .app-logo-text { display: none; } }
  @media (max-width: 380px) { .app-page-badge { display: none !important; } }
`
