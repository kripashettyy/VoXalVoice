# Contributing to VoXalVoice

Thanks for taking the time to contribute! This document covers how to get set up, the conventions we follow, and the process for submitting changes.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/VocalVoice.git`
3. Add the upstream remote: `git remote add upstream https://github.com/narensj/VocalVoice.git`
4. Follow the [Development Setup](#development-setup) steps below

---

## Development Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- ffmpeg (`winget install Gyan.FFmpeg` / `brew install ffmpeg`)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

---

## Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/short-description` | `feat/docx-upload` |
| Bug fix | `fix/short-description` | `fix/audio-stops-at-14s` |
| Docs | `docs/short-description` | `docs/api-reference` |
| Chore | `chore/short-description` | `chore/update-deps` |

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

[optional body]
[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**

```
feat(tts): add chunked synthesis for long documents
fix(playback): stop audio engine conflict between ActionBar and PlaybackControls
docs(readme): add ffmpeg install instructions for Linux
```

---

## Pull Request Process

1. Create a branch from `main` using the naming convention above
2. Make your changes with clear, focused commits
3. Run tests before submitting:
   ```bash
   # Backend
   cd backend && pytest
   # Frontend
   cd frontend && npm test
   ```
4. Open a PR against `main` with:
   - A clear title (following commit convention)
   - A description of *what* changed and *why*
   - Screenshots or recordings for UI changes
5. Address review feedback — PRs are merged once approved

---

## Code Style

### Frontend (TypeScript / React)

- Functional components only, no class components
- Inline styles (project convention) — no CSS modules or styled-components
- Zustand for global state — no Redux
- Keep components small and focused

### Backend (Python)

- Follow PEP 8
- Pydantic models for all request/response schemas
- No file writes in the synthesis path — use `io.BytesIO`
- Type-annotate all public functions

---

## Reporting Bugs

Open a [GitHub Issue](../../issues/new?template=bug_report.md) with:

- Steps to reproduce
- Expected vs actual behaviour
- Browser / OS / Python version
- Console errors or logs if available

---

## Suggesting Features

Open a [GitHub Issue](../../issues/new?template=feature_request.md) with:

- The problem it solves
- Your proposed solution
- Any alternatives you considered

---

## Code of Conduct

Be respectful, constructive, and inclusive. See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
