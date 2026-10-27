# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest (main) | :white_check_mark: Yes |
| older branches | :x: No |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

If you discover a security issue in VoXalVoice, please report it responsibly:

**Email:** narensonu1520@gmail.com  
**Subject:** `[SECURITY] VoXalVoice — <brief description>`

### What to include

- A clear description of the vulnerability
- Steps to reproduce it
- The potential impact
- Any suggested fix (optional)

### What to expect

- **Acknowledgement** within 48 hours
- **Status update** within 7 days
- Credit in the changelog (if desired) once the issue is resolved

## Scope

The following are in scope:

- Backend API (`/backend`) — FastAPI endpoints, input validation, auth
- Frontend (`/frontend`) — XSS, CSRF, exposed secrets, data leakage
- Dependency vulnerabilities with confirmed exploitability

The following are **out of scope**:

- Vulnerabilities in third-party services (edge-tts, Microsoft neural voices)
- Rate-limiting / DoS on local development instances
- Issues that require physical access to the machine

## Security Practices

- All user input is validated via Pydantic schemas before processing
- No audio files are persisted to disk in the normal synthesis path
- API keys and secrets are never committed — `.env` files are git-ignored
- CORS is restricted to configured `ALLOWED_ORIGINS`
- GitHub and webhook payloads are verified with HMAC-SHA256
