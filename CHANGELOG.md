# Changelog

All notable changes to VoXalVoice are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added
- Document upload support — extract text from PDF and DOCX files directly into the studio
- Chunked TTS synthesis — edge-tts text is split into 2,000-character chunks to prevent silent truncation on long documents
- Cat loader animation with real-time progress percentage while generating audio
- `▶ Generate and play` button added to the desktop Playback panel (previously desktop-only users could not trigger full synthesis)
- Singleton `audioEngine` module — eliminates the dual AudioContext conflict that caused playback to stop after ~14 seconds
- Background "VoXal Voice" watermark text on the dark astronaut section of the landing page
- MIT License
- `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `CHANGELOG.md`
- `sitemap.ts` and `robots.ts` for SEO — auto-generates `/sitemap.xml` and `/robots.txt`
- JSON-LD structured data (WebApplication, Organization, FAQPage schemas) in root layout
- SVG favicon and Apple touch icon using the waveform bars logo
- Raised text synthesis limit from 10,000 to 50,000 characters

### Fixed
- Voice stopping after a few seconds on long text (dual AudioContext conflict)
- PDF extraction merging words without spaces (e.g. `OrchestrationNaren` → `Orchestration Naren`)
- Synthesis timeout raised from 30s to 5 minutes for long documents
- Footer: removed duplicate Terms/Privacy/Data Controls row, centered copyright, removed divider line
- Browser tab showing "VoXalVoice | VoXalVoice" (absolute title fix on home page)

---

## [1.0.0] — 2026-01-01

### Added
- Initial release of VoXalVoice
- Text-to-speech studio with edge-tts primary engine and eSpeak fallback
- 300+ neural voices via Microsoft Edge TTS
- Voice parameters: pitch, speed, volume, warmth, clarity, tone preset, natural flow
- Real-time waveform visualizer and voice analyzer panel
- Voice profile manager (save and load parameter presets)
- WAV download
- Preview mode (first 200 characters)
- EQ post-processing (warmth and clarity shelf filters)
- SSML prosody injection for natural pauses
- FastAPI backend with streaming WAV response
- Next.js 16 frontend with Zustand state management
- Responsive layout (desktop 3-column grid, mobile action bar)
- Fully accessible — ARIA labels, live regions, keyboard navigation
