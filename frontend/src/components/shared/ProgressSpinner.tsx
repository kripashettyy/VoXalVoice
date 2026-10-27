'use client'
export default function ProgressSpinner({ size = 24 }: { size?: number }) {
  return (
    <div role="status" aria-label="Loading" style={{ display: 'inline-flex', alignItems: 'center' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#D4726A"
        strokeWidth="2.5"
        style={{ animation: 'spin 0.8s linear infinite' }}
        aria-hidden="true"
      >
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        <path d="M12 2 A10 10 0 0 1 22 12" strokeLinecap="round"/>
      </svg>
      <span className="sr-only">Loading</span>
    </div>
  )
}
