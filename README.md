# VoXalVoice

Studio-quality text-to-speech in the browser. Convert text into natural-sounding audio with real-time voice controls, EQ processing, and WAV download — no sign-up required.

---

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5-orange)

---

## Prerequisites

- Node.js 18+
- Python 3.11+
- ffmpeg

```bash
# Windows
winget install --id Gyan.FFmpeg -e

# macOS
brew install ffmpeg

# Linux
sudo apt install ffmpeg
```

---

## Setup

### Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

API runs at `http://localhost:8000` — docs at `/docs`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

App runs at `http://localhost:3000`

---

## Quick Start (Run Both at Once)

From the project root, use the included `start.bat` to launch both servers in one command.

**CMD**
```cmd
start.bat
```

**PowerShell**
```powershell
.\start.bat
```

This opens two terminal windows — one for the backend, one for the frontend.

- Backend → `http://localhost:8000`
- Frontend → `http://localhost:3000`

> Make sure you've completed the [Setup](#setup) steps above before running this.

## Stopping the Servers

In each terminal window opened by `start.bat`, press:

```
Ctrl + C
```

Or kill them by port from any terminal:

**PowerShell**
```powershell
# Kill backend (port 8000)
$p = (netstat -ano | Select-String ":8000 ").ToString().Trim().Split()[-1]; Stop-Process -Id $p -Force

# Kill frontend (port 3000)
$p = (netstat -ano | Select-String ":3000 ").ToString().Trim().Split()[-1]; Stop-Process -Id $p -Force
```

**CMD**
```cmd
for /f "tokens=5" %a in ('netstat -ano ^| findstr ":8000"') do taskkill /PID %a /F
for /f "tokens=5" %a in ('netstat -ano ^| findstr ":3000"') do taskkill /PID %a /F
```
**Kill backend (port 8000)**
- npx kill-port 8000
**Kill frontend (port 3000)**
- npx kill-port 3000
---


## Environment Variables

**`backend/.env`**

```env
ALLOWED_ORIGINS=http://localhost:3000
ENGINE_SELECTION=edge-tts
DEFAULT_PITCH=1.0
DEFAULT_SPEED=1.0
DEFAULT_VOLUME=0.8
```

**`frontend/.env.local`**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Author

**Naren S J**
[narensonu1520@gmail.com](mailto:narensonu1520@gmail.com) · [LinkedIn](https://linkedin.com/in/narensj20) · [Portfolio](https://narensj.netlify.app)
