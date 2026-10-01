# TravelMind — Setup Guide (step by step)

This guide gets you from a fresh clone to a running app using **only free
accounts** — no credit card needed anywhere. It also documents fixes for
every real issue people have hit setting this up on Windows.

## 0. Prerequisites

- Python 3.11 or 3.12 **strongly recommended** over 3.13. Python 3.13 is
  new enough that a few dependencies (grpcio, pydantic-core, watchfiles)
  can be slow to ship prebuilt Windows wheels for every patch release,
  which forces pip to try compiling from source (needs a Rust toolchain
  you likely don't have, and fails with errors mentioning `maturin`).
  This project's `requirements.txt` is pinned to versions that install
  cleanly as pre-built wheels, but 3.11/3.12 is the safest bet if you hit
  any install trouble.
- Node.js 18+ (includes npm)
- VS Code
- Git

Check versions:
```bash
python --version
node --version
```

## 1. Get a free LLM API key (pick ONE)

### Option A — Groq (recommended: fastest, simplest dashboard)
1. https://console.groq.com/keys
2. Sign up free, click **Create API Key**, copy it (starts with `gsk_`).

### Option B — Google Gemini
1. https://aistudio.google.com/apikey
2. Sign in, click **Create API key** (starts with `AIzaSy`).
3. If asked to choose a project, pick **"create new project"** if offered;
   otherwise any personal (non-Workspace) project works fine.

> This project auto-detects which Gemini model your key actually supports
> at startup (model names get renamed by Google fairly often), so you
> don't need to know the exact current model name — just get the key.

## 2. Backend setup

```bash
cd backend
python -m venv venv
```

Activate it:
```bash
# macOS / Linux
source venv/bin/activate

# Windows PowerShell
.\venv\Scripts\Activate.ps1
```
You must see `(venv)` at the start of your prompt after this. If
PowerShell blocks the script with an execution-policy error, run once:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
then activate again.

Install dependencies:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```
This should complete with **no compilation** — every package here has a
pre-built wheel. If you see `maturin`, `Failed to build`, or `Rust` in an
error, see the Troubleshooting section below.

Create your `.env`:
```bash
cp .env.example .env       # Windows: copy .env.example .env
```
Edit `.env` and fill in:
```
LLM_PROVIDER=groq
GROQ_API_KEY=gsk_...your_real_key...
```
(or `LLM_PROVIDER=gemini` + `GEMINI_API_KEY=AIzaSy...`)

Run it:
```bash
uvicorn app.main:app --reload --port 8000
```
Check http://localhost:8000/api/health returns `{"status":"ok",...}`.

## 3. Frontend setup

New terminal (keep backend running):
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173.

## 4. Use it

Fill in the form, click **Send the agents to work**, watch the live
"Agents at work" console update, then the full itinerary renders.

---

## Troubleshooting

### `pip install` fails with `maturin` / "Failed to build ... pydantic-core"
This means pip couldn't find a pre-built wheel and tried compiling Rust
code, which needs a Rust toolchain. Try in order:
1. `pip install --upgrade pip` then retry — old pip resolvers sometimes
   miss newer wheel tags.
2. Confirm you're using this project's exact `requirements.txt` (pinned
   versions verified to have wheels for Python 3.10–3.13).
3. If it still fails, **switch to Python 3.11 or 3.12** for this project's
   venv — delete `venv`, install Python 3.11/3.12 alongside your existing
   Python, and recreate the venv with it explicitly:
   ```powershell
   py -3.11 -m venv venv
   ```

### PowerShell: `venv\Scripts\Activate.ps1` → "not recognized"
Use an explicit relative path prefix:
```powershell
.\venv\Scripts\Activate.ps1
```
If `venv\Scripts` doesn't exist but `venv\bin` does, your `python` command
is resolving to a Unix-style Python (e.g. via WSL or Git Bash) instead of
native Windows Python. Activate from `bin` instead:
```powershell
.\venv\bin\Activate.ps1
```
or better, recreate the venv after confirming `where.exe python` points
to a real Windows install under `AppData\Local\Programs\Python\...`.

### Gemini: `RetryError ... raised NotFound`
The model name in `.env` (`GEMINI_MODEL`) isn't available for your key.
This code auto-detects and falls back to a working model automatically —
if you still see this error, run the diagnostic script to see exactly
what your key supports:
```bash
python list_gemini_models.py
```
and set `GEMINI_MODEL` in `.env` to one of the printed names (though the
auto-fallback should handle this without you needing to).

### Gemini API key doesn't look right
A real key from https://aistudio.google.com/apikey always starts with
`AIzaSy`. Anything else (e.g. starting with `AQ.` or similar) is the
wrong credential type — go back to that exact URL and use the copy icon
next to the generated key.

### `.env` changes don't seem to take effect
`uvicorn --reload` watches Python files, **not** `.env`. After editing
`.env`, stop the server (Ctrl+C) and restart it.

### Agent console never appears / stuck on "Agents are working..."
If the backend terminal shows real activity (search results, weather
calls, LLM requests with `200 OK`) but the browser never updates, this
was a known bug in early versions of `frontend/src/lib/api.js`: some
server/proxy stacks send SSE messages with `\r\n` line endings, which an
early version of the parser didn't normalize before splitting on message
boundaries. This is already fixed in this codebase — the fix is the
`.replace(/\r\n/g, "\n")` call in `streamTripPlan()`. If you're seeing
this on a modified copy, confirm that line is present.

### CORS error in browser console
Make sure `backend/.env` has `CORS_ORIGINS=http://localhost:5173` and
that you're browsing to the **frontend** URL (5173), not calling the
backend (8000) directly from the browser.

### Weather section says "outside forecast window"
Expected behavior — Open-Meteo only forecasts ~16 days ahead. Not a bug.

## Optional: production build
```bash
cd frontend
npm run build
npm run preview

cd ../backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
For free deployment: frontend on Vercel/Netlify, backend on Render/Fly.io.
