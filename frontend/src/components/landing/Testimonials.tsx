const TESTIMONIALS = [
  {
    quote: 'The natural flow feature makes a huge difference. My voiceovers sound so much more human now.',
    name: 'Tharun Rai',
    role: 'AiML Developer',
    avatar: 'AR',
    color: '#D4726A',
  },
  {
    quote: 'The API integration was straightforward and the voice quality is excellent for my app.',
    name: 'Prerna Shetty',
    role: 'Developer',
    avatar: 'SL',
    color: '#8B5CF6',
  },
  {
    quote: 'I use VoXalVoice for all my course materials. The EQ controls let me match the tone perfectly.',
    name: 'Abhiram.',
    role: 'Tester',
    avatar: 'MP',
    color: '#1a6b55',
  },
  {
    quote: 'VoXalVoice just gets it right. It is consistently so much better than standard TTS tools.',
    name: 'Jamie K.',
    role: 'Podcaster',
    avatar: 'JK',
    color: '#e07b4a',
  },
  {
    quote: 'Warmth and clarity controls are a game changer. I can finally get the exact tone I need.',
    name: 'Taylor M.',
    role: 'Voice director',
    avatar: 'TM',
    color: '#3a8fd1',
  },
  {
    quote: 'Profile saving means I never have to re-tune my settings. It just remembers everything.',
    name: 'Jordan W.',
    role: 'Audiobook author',
    avatar: 'JW',
    color: '#c9a8e0',
  },
]

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      style={{ background: '#FFF0F5', padding: '88px 24px' }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <p style={{
          textAlign: 'center',
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: '#9A8A8A',
          textTransform: 'uppercase',
          margin: '0 0 56px',
        }}>
          Early access, real results
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
        }}>
          {TESTIMONIALS.map((t, i) => (
            <blockquote
              key={i}
              style={{
                background: '#ffffff',
                border: '1px solid #E8D5D0',
                borderRadius: 20,
                padding: '28px 28px 24px',
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}
            >
              {/* Quote */}
              <p style={{
                fontSize: 15,
                color: '#1A1A1A',
                lineHeight: 1.65,
                margin: 0,
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontStyle: 'italic',
                flex: 1,
              }}>
                "{t.quote}"
              </p>
              {/* Author */}
              <footer style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: t.color,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}>
                  {t.avatar}
                </div>
                <div>
                  <strong style={{
                    display: 'block',
                    fontSize: 14,
                    color: '#1A1A1A',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  }}>
                    {t.name}
                  </strong>
                  <span style={{
                    fontSize: 12,
                    color: '#9A8A8A',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  }}>
                    {t.role}
                  </span>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
