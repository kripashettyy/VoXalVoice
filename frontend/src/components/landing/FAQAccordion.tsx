'use client'
import { useState } from 'react'

interface FAQItem { question: string; answer: string }

export default function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" style={{ background: '#FFF0F5', padding: '88px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <p style={{
          textAlign: 'center',
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: '#9A8A8A',
          textTransform: 'uppercase',
          margin: '0 0 16px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          FAQs
        </p>
        <h2 style={{
          fontSize: 'clamp(28px, 3.5vw, 46px)',
          fontWeight: 700,
          color: '#1A1A1A',
          textAlign: 'center',
          margin: '0 0 56px',
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}>
          Good questions.
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={i}
                style={{
                  background: isOpen ? '#ffffff' : '#fdf5f8',
                  borderRadius: 14,
                  overflow: 'hidden',
                  transition: 'background 0.2s',
                  border: `1px solid ${isOpen ? 'rgba(212,114,106,0.25)' : 'rgba(212,114,106,0.1)'}`,
                }}
              >
                <button
                  id={`faq-btn-${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  style={{
                    width: '100%',
                    padding: '18px 22px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: 15,
                    color: '#1A1A1A',
                    fontWeight: isOpen ? 600 : 400,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: 56,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    gap: 16,
                  }}
                >
                  {item.question}
                  <span style={{
                    flexShrink: 0,
                    width: 24, height: 24,
                    borderRadius: '50%',
                    border: '1.5px solid rgba(212,114,106,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, color: '#D4726A',
                    transition: 'transform 0.2s',
                    transform: isOpen ? 'rotate(45deg)' : 'none',
                  }}>
                    +
                  </span>
                </button>
                {isOpen && (
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-btn-${i}`}
                    style={{
                      padding: '0 22px 20px',
                      fontSize: 14,
                      color: '#5A4A4A',
                      lineHeight: 1.7,
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    }}
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
