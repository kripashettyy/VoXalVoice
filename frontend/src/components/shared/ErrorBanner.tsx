'use client'
interface Props {
  message: string
  onDismiss: () => void
}

export default function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <div
      role="alert"
      style={{
        background: '#FDF0F0',
        borderLeft: '4px solid #D4726A',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        borderRadius: 4,
        marginBottom: 8,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4726A" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span style={{ flex: 1, color: '#5A4A4A', fontSize: 14 }}>{message}</span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss error"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#5A4A4A' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  )
}
