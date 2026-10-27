@echo off
echo Starting VocalVoice...

start "VocalVoice Backend" cmd /k "cd /d %~dp0backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

start "VocalVoice Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Both servers are starting in separate windows.
echo   Backend  ^>  http://localhost:8000
echo   Frontend ^>  http://localhost:3000
