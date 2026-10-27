'use client'
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Studio ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#FFF0F5', padding: 24, textAlign: 'center',
        }}>
          <div style={{
            background: '#fff', borderRadius: 24, padding: '48px 40px',
            border: '1px solid rgba(212,114,106,0.15)',
            boxShadow: '0 8px 32px rgba(212,114,106,0.1)',
            maxWidth: 400,
          }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#D4726A" strokeWidth="2" aria-hidden="true" style={{ marginBottom: 20 }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: '0 0 10px', fontFamily: 'Georgia, "Times New Roman", serif' }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: 14, color: '#5A4A4A', margin: '0 0 28px', lineHeight: 1.6, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              Your session text will be restored when you reload.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '11px 28px', background: '#D4726A', color: '#fff',
                border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14,
                fontWeight: 600, minHeight: 44,
                boxShadow: '0 4px 14px rgba(212,114,106,0.35)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              Reload page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
