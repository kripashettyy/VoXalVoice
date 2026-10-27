'use client'
import { useState } from 'react'
import Link from 'next/link'

const SECTIONS = [
  { id: 'studio',    label: 'Studio' },
  { id: 'voiceover', label: 'Video Voice-over' },
  { id: 'subtitle',  label: 'Subtitle to Voice' },
  { id: 'ssml',      label: 'SSML Editor' },
  { id: 'dialogue',  label: 'Dialogue' },
  { id: 'batch',     label: 'Batch TTS' },
  { id: 'voice-lab', label: 'Voice Lab' },
  { id: 'tips',      label: 'Tips & Limits' },
]

export default function GuideContent() {
  const [active, setActive] = useState('studio')

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 48, maxWidth: 1080, margin: '0 auto', padding: '60px 24px 100px', alignItems: 'start' }} className="guide-grid">

      {/* Sidebar nav */}
      <aside style={{ position: 'sticky', top: 96 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9A8A8A', margin: '0 0 12px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          Features
        </p>
        <nav>
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => setActive(s.id)} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: active === s.id ? 600 : 400,
              background: active === s.id ? 'rgba(212,114,106,0.1)' : 'transparent',
              color: active === s.id ? '#D4726A' : '#5A4A4A',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              transition: 'all 0.15s', marginBottom: 2,
            }}>
              {active === s.id && <span style={{ marginRight: 6 }}>→</span>}
              {s.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main>
        {active === 'studio'    && <StudioGuide />}
        {active === 'voiceover' && <VoiceoverGuide />}
        {active === 'subtitle'  && <SubtitleGuide />}
        {active === 'ssml'      && <SsmlGuide />}
        {active === 'dialogue'  && <DialogueGuide />}
        {active === 'batch'     && <BatchGuide />}
        {active === 'voice-lab' && <VoiceLabGuide />}
        {active === 'tips'      && <TipsGuide />}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .guide-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px', lineHeight: 1.15, letterSpacing: '-0.02em', fontFamily: 'Georgia, "Times New Roman", serif' }}>
      {children}
    </h2>
  )
}

function Lead({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 17, color: '#5A4A4A', margin: '0 0 36px', lineHeight: 1.7, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {children}
    </p>
  )
}

function StepCard({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(212,114,106,0.1)', border: '1px solid rgba(212,114,106,0.25)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#D4726A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        {n}
      </div>
      <div>
        <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: '#1A1A1A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>{title}</p>
        <p style={{ margin: 0, fontSize: 14, color: '#5A4A4A', lineHeight: 1.65, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>{body}</p>
      </div>
    </div>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '12px 16px', background: 'rgba(212,114,106,0.06)', borderRadius: 10, border: '1px solid rgba(212,114,106,0.15)', marginBottom: 12 }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D4726A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p style={{ margin: 0, fontSize: 13, color: '#5A4A4A', lineHeight: 1.6, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>{children}</p>
    </div>
  )
}

function SubHead({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#D4726A', margin: '32px 0 14px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {children}
    </p>
  )
}

function CTALink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '10px 20px', background: '#E8D5F0', color: '#1A1A1A',
      borderRadius: 9999, textDecoration: 'none', fontSize: 13, fontWeight: 600,
      border: '1.5px solid #c9a8e0', marginTop: 24,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {children} →
    </Link>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'rgba(212,114,106,0.12)', margin: '32px 0' }} />
}

function StudioGuide() {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#D4726A', margin: '0 0 10px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>Text to Speech</p>
      <SectionHeading>Studio</SectionHeading>
      <Lead>The core text-to-speech workspace. Type or paste any text, pick a voice, tune the parameters, then generate and download a WAV file.</Lead>

      <SubHead>How to use</SubHead>
      <StepCard n={1} title="Open the studio" body="Go to /studio. No sign-up needed — it works immediately in the browser." />
      <StepCard n={2} title="Enter your text" body="Type or paste up to 50,000 characters. You can also upload a PDF or DOCX and the text is extracted automatically." />
      <StepCard n={3} title="Choose a voice" body="Use the voice selector to browse 300+ neural voices. Filter by female/male or search by name or language." />
      <StepCard n={4} title="Adjust parameters" body="Set pitch (0.5–2.0×), speed (0.5–2.5×), and volume (0–100%). Add warmth to boost low frequencies or clarity to sharpen highs." />
      <StepCard n={5} title="Preview" body="Click Preview to hear the first 200 characters instantly. Use this to dial in the voice before generating the full audio." />
      <StepCard n={6} title="Generate and download" body="Click Generate. The full WAV downloads when ready. Use Save Profile to keep your settings for next time." />

      <Divider />
      <SubHead>Voice parameters explained</SubHead>
      <p style={{ fontSize: 14, color: '#5A4A4A', lineHeight: 1.7, margin: '0 0 12px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <strong>Pitch</strong> — raises or lowers the voice frequency. 1.0 is the engine default. 1.2 sounds notably higher; 0.8 deeper.<br />
        <strong>Speed</strong> — controls speaking rate. 1.0 is natural. 0.7 is slow and deliberate; 1.5 is fast.<br />
        <strong>Warmth</strong> — applies a low-shelf EQ boost at 250 Hz. Adds resonance and fullness to thin voices.<br />
        <strong>Clarity</strong> — applies a high-shelf boost at 4 kHz. Brings out consonants and makes speech cut through background noise.<br />
        <strong>Tone preset</strong> — Neutral (flat EQ), Warm (slight low boost), Crisp (slight high boost).<br />
        <strong>Natural flow</strong> — inserts SSML-style pauses at punctuation marks for more human-sounding rhythm.
      </p>

      <Tip>Save profiles with Ctrl+S or the Save button. You can have up to 20 named profiles, each storing all parameter values.</Tip>
      <Tip>The Voice Analyzer panel lets you upload an audio clip and measure its pitch range — useful for matching a voice to existing recordings.</Tip>

      <CTALink href="/studio">Open Studio</CTALink>
    </div>
  )
}

function VoiceoverGuide() {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#D4726A', margin: '0 0 10px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>Video Tool</p>
      <SectionHeading>Video Voice-over</SectionHeading>
      <Lead>Upload a video, write a script, and download the same video with a synthesized voice replacing the original audio track.</Lead>

      <SubHead>How to use</SubHead>
      <StepCard n={1} title="Upload a video" body="Accepts MP4, MOV, AVI, WebM, and MKV. Maximum size is 100 MB. Drag and drop or click to browse." />
      <StepCard n={2} title="Write your script" body="Type the narration in the script editor. This text is what gets synthesized as the voice-over." />
      <StepCard n={3} title="Choose a voice and tune" body="Select a voice and adjust pitch, speed, volume, warmth, and clarity in the sidebar." />
      <StepCard n={4} title="Generate" body="Click Generate Voice-over. The backend strips the original audio, synthesizes the script, and mixes them into a new MP4." />
      <StepCard n={5} title="Download" body="The finished MP4 downloads with the original video and your new voice track. The filename is [original]_voiceover.mp4." />

      <Divider />
      <Tip>For best results, write your script to match the approximate duration of the video. The voice-over does not auto-sync to the video length — it replaces the audio track completely.</Tip>
      <Tip>Requires ffmpeg to be installed on the server. If you see a 503 error, ffmpeg is unavailable in that deployment.</Tip>

      <CTALink href="/voiceover">Open Voice-over</CTALink>
    </div>
  )
}

function SubtitleGuide() {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#D4726A', margin: '0 0 10px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>Subtitle Tool</p>
      <SectionHeading>Subtitle to Voice</SectionHeading>
      <Lead>Upload an .srt or .vtt subtitle file and get a timed WAV back — each cue synthesized and placed at exactly the right timestamp with silence gaps in between.</Lead>

      <SubHead>How to use</SubHead>
      <StepCard n={1} title="Upload your subtitle file" body="Accepts .srt and .vtt files up to 2 MB. The parser handles multi-line cues, HTML tags inside cues, and Windows line endings." />
      <StepCard n={2} title="Choose a voice" body="Select the voice to use for all cues. All cue settings (pitch, speed, etc.) apply globally." />
      <StepCard n={3} title="Generate" body="Each cue is synthesized individually and placed at its start timestamp. Silence fills the gaps between cues." />
      <StepCard n={4} title="Download the WAV" body="The output WAV has the exact same total duration as the last cue's end timestamp. Drop it directly onto your video timeline." />

      <Divider />
      <SubHead>Use cases</SubHead>
      <p style={{ fontSize: 14, color: '#5A4A4A', lineHeight: 1.7, margin: '0 0 12px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        Record video silently, write subtitles in any tool (CapCut, DaVinci, Premiere), export the .srt, generate the voice here, and drop the WAV on your timeline. Ideal for Reels, Shorts, and explainer videos.
      </p>
      <Tip>If cue audio runs longer than the cue slot, it gets trimmed. If it&apos;s shorter, silence pads it. The output always respects the original timestamps.</Tip>
      <Tip>Maximum 500 cues per file. For large files, split into parts.</Tip>

      <CTALink href="/subtitle">Open Subtitle to Voice</CTALink>
    </div>
  )
}

function SsmlGuide() {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#D4726A', margin: '0 0 10px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>Advanced</p>
      <SectionHeading>SSML Editor</SectionHeading>
      <Lead>Build speech with fine-grained control over pauses, emphasis, pitch, and speed using SSML — without writing XML by hand.</Lead>

      <SubHead>Two modes</SubHead>
      <p style={{ fontSize: 14, color: '#5A4A4A', lineHeight: 1.7, margin: '0 0 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <strong>Visual editor</strong> — add text nodes, break nodes, emphasis nodes, and prosody nodes using toolbar buttons. Each node is an editable card. Reorder with the arrow buttons.<br /><br />
        <strong>Raw SSML</strong> — a terminal-style editor where you type SSML directly. Includes a snippet bar for quick tag insertion, line numbers, and live validation feedback.
      </p>

      <SubHead>SSML tags supported</SubHead>
      <div style={{ fontFamily: '"Fira Code", monospace', fontSize: 12, background: '#1A1A1A', borderRadius: 12, padding: '16px 18px', color: '#d4d4d4', marginBottom: 20 }}>
        <div style={{ marginBottom: 8 }}><span style={{ color: '#D4726A' }}>&lt;break strength=&quot;medium&quot;/&gt;</span> — pause ~300ms. Values: x-weak, weak, medium, strong, x-strong</div>
        <div style={{ marginBottom: 8 }}><span style={{ color: '#c9a8e0' }}>&lt;emphasis level=&quot;strong&quot;&gt;text&lt;/emphasis&gt;</span> — stress a word. Values: reduced, none, moderate, strong</div>
        <div><span style={{ color: '#89c4f4' }}>&lt;prosody pitch=&quot;+10%&quot; rate=&quot;slow&quot;&gt;text&lt;/prosody&gt;</span> — adjust pitch, rate, and volume</div>
      </div>

      <Tip>The SSML tags are converted to equivalent pitch/speed parameters before sending to the engine, since edge-tts does not accept raw SSML text. The visual output accurately represents what you will hear.</Tip>
      <Tip>In Raw mode, the validator checks for missing &lt;speak&gt; tags, unclosed elements, and bare &amp; characters before letting you synthesize.</Tip>

      <CTALink href="/ssml-editor">Open SSML Editor</CTALink>
    </div>
  )
}

function DialogueGuide() {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#D4726A', margin: '0 0 10px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>Multi-voice</p>
      <SectionHeading>Multi-voice Dialogue</SectionHeading>
      <Lead>Write a script with multiple speakers, assign a different neural voice to each one, and generate a single continuous WAV with natural pauses between turns.</Lead>

      <SubHead>How to use</SubHead>
      <StepCard n={1} title="Add turns" body="Each turn is one speaker's line. Click Add Turn to add more. The first two turns are pre-filled with Speaker 1 and Speaker 2." />
      <StepCard n={2} title="Name each speaker" body="Click the speaker name field at the top of each turn card and type a custom name (e.g. Host, Guest, Narrator)." />
      <StepCard n={3} title="Write the text" body="Type what that speaker says. Empty turns are skipped automatically during generation." />
      <StepCard n={4} title="Assign voices" body="Expand a turn card using the sliders icon on the right. The left panel shows the voice selector, the right shows pitch/speed/volume controls." />
      <StepCard n={5} title="Set the pause" body="Use the Pause between turns slider in the sidebar (0–2000ms). 400ms is a natural conversational gap." />
      <StepCard n={6} title="Generate and download" body="Click Generate Dialogue. Each turn is synthesized in order and stitched together. Download the WAV." />

      <Divider />
      <Tip>Use different genders for speakers — it makes the output much easier to follow without visual cues.</Tip>
      <Tip>Maximum 100 turns, 50,000 total characters. For long scripts, split into multiple sessions.</Tip>
      <Tip>Reorder turns with the up/down arrows. Move speaker A to the top and speaker B below to change who speaks first without rewriting.</Tip>

      <CTALink href="/dialogue">Open Dialogue</CTALink>
    </div>
  )
}

function BatchGuide() {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#D4726A', margin: '0 0 10px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>Bulk Production</p>
      <SectionHeading>Batch TTS</SectionHeading>
      <Lead>Upload a .txt or .csv file with one text entry per line. The backend synthesizes each entry separately and returns a ZIP file containing one WAV per entry.</Lead>

      <SubHead>How to use</SubHead>
      <StepCard n={1} title="Prepare your file" body="Create a .txt with one line per entry, or a .csv where the first column contains the text. Maximum 200 entries, 5,000 characters per entry, 1 MB file size." />
      <StepCard n={2} title="Upload the file" body="Drop the file or click Browse. .txt and .csv are both accepted." />
      <StepCard n={3} title="Choose a voice and parameters" body="All entries use the same voice and parameter settings. Adjust pitch, speed, volume, warmth, and clarity in the sidebar." />
      <StepCard n={4} title="Generate ZIP" body="Click Generate ZIP. Each entry is synthesized sequentially. Failed entries are skipped — the rest are still included in the ZIP." />
      <StepCard n={5} title="Download" body="The ZIP contains files named 001_first_words.wav, 002_next_words.wav, etc. The number prefix preserves the original order." />

      <Divider />
      <SubHead>File format</SubHead>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {[
          { label: '.txt', lines: ['Hello, welcome.', 'This is entry two.', 'Each line = one WAV.'] },
          { label: '.csv', lines: ['Hello, welcome.', 'This is entry two.', 'First column used.'] },
        ].map(({ label, lines }) => (
          <div key={label}>
            <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 600, color: '#1A1A1A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>{label}</p>
            <div style={{ fontFamily: '"Fira Code", monospace', fontSize: 11, color: '#5A4A4A', lineHeight: 1.8, background: '#FDF0F0', borderRadius: 8, padding: '10px 12px', border: '1px solid #E8D5D0' }}>
              {lines.map((l, i) => <div key={i}>{l}</div>)}
            </div>
          </div>
        ))}
      </div>

      <Tip>Entries that fail synthesis (e.g. text too long) are skipped. The X-Success-Count response header tells you how many succeeded vs total entries.</Tip>
      <Tip>Use Batch TTS for e-learning narration, product catalog voice-overs, or any repetitive content that follows the same voice settings throughout.</Tip>

      <CTALink href="/batch">Open Batch TTS</CTALink>
    </div>
  )
}

function VoiceLabGuide() {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#D4726A', margin: '0 0 10px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>Analysis</p>
      <SectionHeading>Voice Lab</SectionHeading>
      <Lead>Upload a voice recording and get a detailed acoustic analysis — pitch range, speech rate, energy levels, and spectral characteristics.</Lead>

      <SubHead>What it measures</SubHead>
      <p style={{ fontSize: 14, color: '#5A4A4A', lineHeight: 1.7, margin: '0 0 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <strong>Pitch (F0)</strong> — fundamental frequency in Hz. Average, min, and max over the recording.<br />
        <strong>Speech rate</strong> — estimated words per minute based on energy patterns.<br />
        <strong>Energy</strong> — RMS amplitude over time, showing loud and quiet segments.<br />
        <strong>Spectral centroid</strong> — the &quot;brightness&quot; of the voice. Higher values sound thinner and brighter; lower values sound warmer.
      </p>

      <SubHead>How to use it</SubHead>
      <StepCard n={1} title="Upload a WAV or MP3" body="Record yourself or your target speaker saying a few sentences. 10–30 seconds works well." />
      <StepCard n={2} title="Read the analysis" body="The lab shows pitch range, energy waveform, and spectral data as charts." />
      <StepCard n={3} title="Match a TTS voice" body="Take the average pitch reading and use it as a reference when adjusting Pitch in the Studio. If the target is 180 Hz and the default voice is 200 Hz, lower pitch to ~0.9×." />

      <Tip>Use Voice Lab before generating dialogue to match each speaker's pitch range to their assigned TTS voice.</Tip>

      <CTALink href="/voice-lab">Open Voice Lab</CTALink>
    </div>
  )
}

function TipsGuide() {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#D4726A', margin: '0 0 10px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>Reference</p>
      <SectionHeading>Tips & Limits</SectionHeading>
      <Lead>A quick reference for limits, file formats, and best practices across all tools.</Lead>

      <SubHead>Limits</SubHead>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(212,114,106,0.15)', marginBottom: 32 }}>
        {[
          ['Studio — text', '50,000 characters per request'],
          ['Studio — profiles', '20 saved profiles'],
          ['Video Voice-over', '100 MB per video file'],
          ['Subtitle to Voice', '2 MB per subtitle file, 500 cues max'],
          ['Batch TTS', '1 MB per file, 200 entries, 5,000 chars per entry'],
          ['Dialogue', '100 turns, 50,000 total characters'],
          ['Voice Lab upload', 'Standard WAV or MP3, any duration'],
          ['Synthesis timeout', '5 minutes (10 minutes for subtitle/dialogue)'],
        ].map(([label, value], i) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: i % 2 === 0 ? 'rgba(212,114,106,0.03)' : '#fff', gap: 16 }}>
            <span style={{ fontSize: 13, color: '#1A1A1A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontWeight: 500 }}>{label}</span>
            <span style={{ fontSize: 13, color: '#9A8A8A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', textAlign: 'right' }}>{value}</span>
          </div>
        ))}
      </div>

      <SubHead>Output format</SubHead>
      <p style={{ fontSize: 14, color: '#5A4A4A', lineHeight: 1.7, margin: '0 0 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        All audio output is <strong>16-bit PCM WAV</strong> at 24,000 Hz mono (edge-tts default). Compatible with all major video editors, DAWs, and audio tools. Video voice-over outputs are re-encoded as AAC 128k inside MP4.
      </p>

      <SubHead>Best practices</SubHead>
      <Tip>For long scripts, break text into natural paragraphs. The engine handles sentence pauses best when punctuation is present.</Tip>
      <Tip>Speed above 1.8× can reduce intelligibility significantly. Use 1.2–1.4× for fast but clear narration.</Tip>
      <Tip>Warmth and Clarity are additive. Setting both to 1.0 will create a muddy sound. Use one at a time.</Tip>
      <Tip>The engine requires internet — it connects to Microsoft&apos;s edge-tts service. If you get a network error, check your connection and retry.</Tip>
      <Tip>The offline fallback (eSpeak) produces robotic output and is only a safety net. For real use, ensure network access.</Tip>
    </div>
  )
}
