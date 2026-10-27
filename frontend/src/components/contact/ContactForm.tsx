'use client'
import { useState } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'error'

const SUBJECTS = [
  'General enquiry',
  'Business & partnerships',
  'Bug report',
  'Feature request',
  'API access',
  'Other',
]

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setError(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      setStatus('success')
      setName(''); setEmail(''); setSubject(SUBJECTS[0]); setMessage('')
    } catch (err: unknown) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    border: '1.5px solid rgba(212,114,106,0.22)', fontSize: 15,
    color: '#1A1A1A', background: '#FFF8FA', boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    outline: 'none', transition: 'border-color 0.15s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: '#9A8A8A', marginBottom: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  }

  if (status === 'success') {
    return (
      <div style={{
        background: '#ffffff', borderRadius: 24, padding: '48px 40px',
        border: '1px solid rgba(212,114,106,0.12)',
        boxShadow: '0 4px 24px rgba(212,114,106,0.08)',
        textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'rgba(212,114,106,0.1)', margin: '0 auto 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4726A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h3 style={{
          fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: '0 0 10px',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}>
          Message sent
        </h3>
        <p style={{
          fontSize: 15, color: '#5A4A4A', margin: '0 0 28px', lineHeight: 1.6,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          Thanks for reaching out. We will get back to you within 24 hours.
        </p>
        <button
          onClick={() => setStatus('idle')}
          style={{
            padding: '10px 24px', background: 'transparent', border: '1.5px solid rgba(212,114,106,0.3)',
            borderRadius: 9999, cursor: 'pointer', fontSize: 14, color: '#D4726A', fontWeight: 600,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: '#ffffff', borderRadius: 24, padding: '40px 36px',
        border: '1px solid rgba(212,114,106,0.12)',
        boxShadow: '0 4px 24px rgba(212,114,106,0.08)',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}
    >
      {/* Name + Email row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="form-row">
        <div>
          <label htmlFor="cf-name" style={labelStyle}>Name</label>
          <input
            id="cf-name" type="text" required value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212,114,106,0.5)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(212,114,106,0.22)' }}
          />
        </div>
        <div>
          <label htmlFor="cf-email" style={labelStyle}>Email</label>
          <input
            id="cf-email" type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212,114,106,0.5)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(212,114,106,0.22)' }}
          />
        </div>
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="cf-subject" style={labelStyle}>Subject</label>
        <select
          id="cf-subject" required value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212,114,106,0.5)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(212,114,106,0.22)' }}
        >
          {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="cf-message" style={labelStyle}>Message</label>
        <textarea
          id="cf-message" required value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what is on your mind…"
          rows={6}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65 }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212,114,106,0.5)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(212,114,106,0.22)' }}
        />
      </div>

      {error && (
        <p role="alert" style={{
          fontSize: 13, color: '#D4726A', margin: 0,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        style={{
          padding: '13px 0', background: status === 'loading' ? 'rgba(212,114,106,0.5)' : '#D4726A',
          color: '#fff', border: 'none', borderRadius: 12, cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          fontSize: 15, fontWeight: 600, minHeight: 48,
          boxShadow: status === 'loading' ? 'none' : '0 4px 14px rgba(212,114,106,0.35)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          transition: 'all 0.15s',
        }}
      >
        {status === 'loading' ? 'Sending…' : 'Send message'}
      </button>

      <style>{`
        @media (max-width: 520px) {
          .form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </form>
  )
}
