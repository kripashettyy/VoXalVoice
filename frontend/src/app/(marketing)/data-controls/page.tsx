import type { Metadata } from 'next'
import LegalLayout from '@/components/legal/LegalLayout'

export const metadata: Metadata = {
  title: 'Data Controls — VoXalVoice',
  description: 'Understand and control the data VoXalVoice stores on your device.',
}

export default function DataControlsPage() {
  return (
    <LegalLayout title="Data Controls" lastUpdated="October 1, 2026">
      <p>
        VoXalVoice stores a minimal amount of data on your device to improve your experience.
        This page explains exactly what is stored, where, and how to remove it.
      </p>

      <h2>What is Stored on Your Device</h2>

      <p><strong>Session draft text</strong> — <code>sessionStorage</code></p>
      <p>
        Your current studio text is saved to <code>sessionStorage</code> under the key
        <code> voxalvoice_text</code>. This allows the studio to restore your draft if you
        accidentally navigate away. It is automatically cleared when the browser tab is closed
        and is never sent to any server.
      </p>

      <p><strong>Voice profiles</strong> — <code>localStorage</code></p>
      <p>
        Named voice profiles you save in the studio are stored in <code>localStorage</code>
        under the key <code>VoXalVoice_profiles</code>. These profiles contain your voice
        parameter settings only (pitch, speed, volume, etc.) — not any text content.
      </p>

      <p><strong>Welcome greeting flag</strong> — <code>sessionStorage</code></p>
      <p>
        A single flag (<code>vv-welcomed</code>) is stored in <code>sessionStorage</code> to
        ensure the welcome greeting plays only once per browser session. It contains no
        personal information.
      </p>

      <hr />

      <h2>How to Clear Your Data</h2>

      <p><strong>Clear session data (draft text, welcome flag)</strong></p>
      <p>
        Close the browser tab or window. Session storage is automatically cleared by
        the browser when a tab is closed.
      </p>

      <p><strong>Clear voice profiles</strong></p>
      <p>
        Open the studio, expand the Voice profiles panel, and delete each profile
        individually using the delete button. Alternatively, open your browser&apos;s
        developer tools, navigate to Application &rarr; Local Storage, and remove the
        <code> VoXalVoice_profiles</code> key.
      </p>

      <p><strong>Clear all VoXalVoice data at once</strong></p>
      <p>
        In your browser, navigate to Settings &rarr; Privacy &rarr; Clear browsing data,
        and select &quot;Cookies and site data&quot; or &quot;Site settings&quot;. You can
        also clear data for just this site via the padlock icon in the address bar &rarr;
        Site settings &rarr; Clear data.
      </p>

      <hr />

      <h2>Data We Do Not Have</h2>
      <ul>
        <li>We do not have access to your voice profiles — they exist only in your browser</li>
        <li>We do not store your input text on any server</li>
        <li>We do not track usage, sessions, or behaviour</li>
        <li>We do not use cookies of any kind</li>
      </ul>

      <hr />

      <h2>Questions</h2>
      <p>
        If you have questions about data stored by VoXalVoice, contact{' '}
        <a href="mailto:narensonu1520@gmail.com">narensonu1520@gmail.com</a>.
      </p>
    </LegalLayout>
  )
}
