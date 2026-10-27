import type { Metadata } from 'next'
import LegalLayout from '@/components/legal/LegalLayout'

export const metadata: Metadata = {
  title: 'Privacy Policy — VoXalVoice',
  description: 'How VoXalVoice handles your data.',
}

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="October 1, 2026">
      <p>
        This Privacy Policy describes how VoXalVoice collects, uses, and handles information
        when you use the service. We are committed to keeping your data minimal and transparent.
      </p>

      <h2>1. Information We Do Not Collect</h2>
      <p>
        VoXalVoice does not require account registration. We do not collect, store, or
        process personally identifiable information such as your name, email address, or
        payment details.
      </p>

      <h2>2. Text Input</h2>
      <p>
        Text you enter in the studio is processed solely to generate audio. It is transmitted
        to Microsoft Edge TTS servers for synthesis and is not stored by VoXalVoice at any
        point. We have no access to your text after the request completes.
      </p>

      <h2>3. Session Storage</h2>
      <p>
        The studio temporarily saves your draft text in your browser&apos;s <code>sessionStorage</code>.
        This data exists only for the duration of your browser session and is automatically
        cleared when you close the tab. It never leaves your device.
      </p>

      <h2>4. Voice Profiles</h2>
      <p>
        Named voice profiles you save are stored exclusively in your browser&apos;s
        <code> localStorage</code>. This data is local to your device and is never transmitted
        to any server.
      </p>

      <h2>5. Analytics and Cookies</h2>
      <p>
        VoXalVoice does not use cookies, tracking pixels, or third-party analytics services.
        No behavioural data is collected or sold.
      </p>

      <h2>6. Third-Party Processing</h2>
      <p>
        Speech synthesis is performed by Microsoft Edge TTS. When you generate or preview
        audio, your input text is sent to Microsoft&apos;s servers. This processing is
        governed by Microsoft&apos;s own privacy practices. We encourage you to review
        Microsoft&apos;s privacy policy for details.
      </p>

      <h2>7. Infrastructure</h2>
      <p>
        The VoXalVoice backend is hosted on Render. Standard server access logs (IP address,
        request path, timestamp) may be retained by Render in accordance with their
        infrastructure logging practices. These logs are not actively monitored or used by
        VoXalVoice for any purpose.
      </p>

      <h2>8. Children</h2>
      <p>
        VoXalVoice is not directed at children under the age of 13. We do not knowingly
        collect information from children.
      </p>

      <h2>9. Changes to This Policy</h2>
      <p>
        This policy may be updated to reflect changes in the service. The date at the top
        of this page indicates when it was last revised.
      </p>

      <h2>10. Contact</h2>
      <p>
        For privacy-related questions, contact{' '}
        <a href="mailto:narensonu1520@gmail.com">narensonu1520@gmail.com</a>.
      </p>
    </LegalLayout>
  )
}
