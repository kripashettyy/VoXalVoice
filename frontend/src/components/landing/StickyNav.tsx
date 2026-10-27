'use client'
import { useState } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Business', href: '/business' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Lab', href: '/lab' },
]

export default function StickyNav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <style>{`
        .nav-pill-tabs { display: flex; }
        .nav-text-links { display: flex; }
        .nav-cta { display: flex; }
        .nav-hamburger { display: none; }

        @media (max-width: 768px) {
          .nav-pill-tabs { display: none; }
          .nav-text-links { display: none; }
          .nav-cta { display: none; }
          .nav-hamburger { display: flex !important; }
        }

        @media (max-width: 480px) {
          .nav-floating {
            left: 12px !important;
            right: 12px !important;
            width: auto !important;
            max-width: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; animation: none !important; }
        }

        .nav-link-hover:hover { background: #f5f5f5 !important; }
        .cta-hover:hover { background: #2e2e2e !important; }
      `}</style>

      {/* Floating pill wrapper */}
      <div
        style={{
          position: 'fixed',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 48px)',
          maxWidth: 860,
          zIndex: 200,
        }}
      >
        <nav
          role="navigation"
          aria-label="Main navigation"
          className="nav-floating"
          style={{
            background: '#ffffff',
            borderRadius: 9999,
            border: '1px solid #e8e8e8',
            boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            padding: '6px 6px 6px 16px',
            gap: 4,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              textDecoration: 'none',
              color: '#1A1A1A',
              fontWeight: 700,
              fontSize: 17,
              letterSpacing: '-0.3px',
              whiteSpace: 'nowrap',
              minHeight: 36,
              flexShrink: 0,
            }}
          >
            <svg width="20" height="18" viewBox="0 0 20 18" fill="none" aria-hidden="true">
              <rect x="0"  y="6" width="2.5" height="6"  rx="1.25" fill="#D4726A"/>
              <rect x="4"  y="3" width="2.5" height="12" rx="1.25" fill="#D4726A"/>
              <rect x="8"  y="0" width="2.5" height="18" rx="1.25" fill="#D4726A"/>
              <rect x="12" y="3" width="2.5" height="12" rx="1.25" fill="#D4726A"/>
              <rect x="16" y="6" width="2.5" height="6"  rx="1.25" fill="#D4726A"/>
            </svg>
            VoXalVoice
          </Link>

          {/* Pill tab switcher — hidden on mobile */}
          <div
            className="nav-pill-tabs"
            style={{
              alignItems: 'center',
              background: '#f2f2f2',
              borderRadius: 9999,
              padding: '3px',
              marginLeft: 10,
              gap: 2,
              flexShrink: 0,
            }}
          >
            <Link
              href="/"
              style={{
                padding: '5px 14px',
                borderRadius: 9999,
                background: '#ffffff',
                color: '#1A1A1A',
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
                boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                whiteSpace: 'nowrap',
                minHeight: 30,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              Studio
            </Link>
            <Link
              href="/studio"
              style={{
                padding: '5px 14px',
                borderRadius: 9999,
                color: '#5A4A4A',
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                minHeight: 30,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              Generate
            </Link>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Text nav links — hidden on mobile */}
          <div
            className="nav-text-links"
            style={{ alignItems: 'center', gap: 0 }}
          >
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="nav-link-hover"
                style={{
                  color: '#3A3A3A',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 400,
                  padding: '6px 12px',
                  borderRadius: 8,
                  minHeight: 36,
                  display: 'flex',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                  background: 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA — hidden on mobile */}
          <div className="nav-cta" style={{ flexShrink: 0 }}>
            <Link
              href="/studio"
              className="cta-hover"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 18px',
                background: '#1A1A1A',
                color: '#fff',
                borderRadius: 9999,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                minHeight: 40,
                border: '1.5px solid #D4726A',
                transition: 'background 0.15s',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <rect x="0" y="0" width="6" height="6" rx="1" fill="#D4726A"/>
                <rect x="8" y="0" width="6" height="6" rx="1" fill="#D4726A"/>
                <rect x="0" y="8" width="6" height="6" rx="1" fill="#D4726A"/>
                <rect x="8" y="8" width="6" height="6" rx="1" fill="#D4726A"/>
              </svg>
              Open studio
            </Link>
          </div>

          {/* Hamburger — visible on mobile only */}
          <button
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="nav-hamburger"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 8px',
              minWidth: 44,
              minHeight: 44,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 5,
              borderRadius: 8,
              flexShrink: 0,
            }}
          >
            <span style={{
              display: 'block', width: 20, height: 2,
              background: '#1A1A1A', borderRadius: 2,
              transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
              transition: 'transform 0.2s',
            }} />
            <span style={{
              display: 'block', width: 20, height: 2,
              background: '#1A1A1A', borderRadius: 2,
              opacity: menuOpen ? 0 : 1,
              transition: 'opacity 0.2s',
            }} />
            <span style={{
              display: 'block', width: 20, height: 2,
              background: '#1A1A1A', borderRadius: 2,
              transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
              transition: 'transform 0.2s',
            }} />
          </button>
        </nav>

        {/* Mobile dropdown — slides down below the pill */}
        {menuOpen && (
          <div
            style={{
              marginTop: 8,
              background: '#ffffff',
              borderRadius: 20,
              border: '1px solid #e8e8e8',
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
              padding: '8px 8px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {/* Pill tabs in menu */}
            <div style={{ display: 'flex', gap: 6, padding: '8px 8px 4px' }}>
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  background: '#f2f2f2',
                  borderRadius: 9999,
                  textAlign: 'center',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#1A1A1A',
                  textDecoration: 'none',
                  minHeight: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Home
              </Link>
              <Link
                href="/studio"
                onClick={() => setMenuOpen(false)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  background: '#1A1A1A',
                  borderRadius: 9999,
                  textAlign: 'center',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#fff',
                  textDecoration: 'none',
                  border: '1.5px solid #D4726A',
                  minHeight: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Open studio
              </Link>
            </div>

            {/* Nav links */}
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  color: '#3A3A3A',
                  textDecoration: 'none',
                  fontSize: 15,
                  padding: '10px 16px',
                  borderRadius: 12,
                  minHeight: 44,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
