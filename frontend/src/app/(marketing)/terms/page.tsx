import type { Metadata } from 'next'
import LegalLayout from '@/components/legal/LegalLayout'

export const metadata: Metadata = {
  title: 'Terms of Service — VoXalVoice',
  description: 'Terms governing your use of VoXalVoice.',
}

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="October 1, 2026">
      <p>
        By accessing or using VoXalVoice, you agree to be bound by these Terms of Service.
        If you do not agree, please do not use the service.
      </p>

      <h2>1. Use of the Service</h2>
      <p>
        VoXalVoice is a browser-based text-to-speech tool provided for personal and
        professional use. You may use the service to generate audio from text you own or
        have the right to use. You agree not to use the service to:
      </p>
      <ul>
        <li>Generate audio that infringes third-party intellectual property rights</li>
        <li>Produce content that is defamatory, abusive, or violates applicable law</li>
        <li>Attempt to reverse-engineer, scrape, or abuse the underlying API</li>
        <li>Automate requests in a manner that places excessive load on the service</li>
      </ul>

      <h2>2. Intellectual Property</h2>
      <p>
        The VoXalVoice interface, design, and source code are the property of the developer.
        Audio files generated through the service are owned by you, the user, subject to the
        terms of the underlying TTS provider (Microsoft Edge TTS).
      </p>

      <h2>3. Third-Party Services</h2>
      <p>
        VoXalVoice uses Microsoft Edge TTS for speech synthesis. By using this service,
        your input text is transmitted to Microsoft servers for processing. Use of this
        service is also subject to Microsoft&apos;s applicable terms of use.
      </p>

      <h2>4. Availability and Modifications</h2>
      <p>
        The service is provided on an as-is basis without any uptime guarantee. We reserve
        the right to modify, suspend, or discontinue any part of the service at any time
        without prior notice.
      </p>

      <h2>5. Disclaimer of Warranties</h2>
      <p>
        VoXalVoice is provided without warranties of any kind, express or implied, including
        but not limited to merchantability, fitness for a particular purpose, or
        non-infringement. Use of the service is at your own risk.
      </p>

      <h2>6. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, the developer shall not be liable for any
        indirect, incidental, special, or consequential damages arising from your use of
        or inability to use the service.
      </p>

      <h2>7. Changes to These Terms</h2>
      <p>
        These terms may be updated from time to time. Continued use of the service after
        changes are posted constitutes your acceptance of the updated terms.
      </p>

      <h2>8. Contact</h2>
      <p>
        For questions regarding these terms, contact{' '}
        <a href="mailto:narensonu1520@gmail.com">narensonu1520@gmail.com</a>.
      </p>
    </LegalLayout>
  )
}
