import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Email service not configured.' }, { status: 500 })
  }

  let body: { name?: string; email?: string; subject?: string; message?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { name, email, subject, message } = body

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 422 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 422 })
  }

  const payload = {
    sender: { name: 'VoXalVoice Contact', email: 'narensonu1520@gmail.com' },
    to: [{ email: 'narensonu1520@gmail.com', name: 'Naren S J' }],
    replyTo: { email: email.trim(), name: name.trim() },
    subject: `[VoXalVoice] ${subject.trim()}`,
    htmlContent: `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #D4726A; margin: 0 0 24px;">New contact form submission</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #9A8A8A; font-size: 13px; width: 80px;">From</td><td style="padding: 8px 0; font-size: 15px; color: #1A1A1A;">${name.trim()}</td></tr>
          <tr><td style="padding: 8px 0; color: #9A8A8A; font-size: 13px;">Email</td><td style="padding: 8px 0; font-size: 15px; color: #1A1A1A;">${email.trim()}</td></tr>
          <tr><td style="padding: 8px 0; color: #9A8A8A; font-size: 13px;">Subject</td><td style="padding: 8px 0; font-size: 15px; color: #1A1A1A;">${subject.trim()}</td></tr>
        </table>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="font-size: 15px; color: #3A3A3A; line-height: 1.7; white-space: pre-wrap;">${message.trim()}</p>
      </div>
    `,
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[contact] Brevo error:', err)
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
