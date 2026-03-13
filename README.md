# Throughline

Throughline is a privacy nudge copilot that helps users understand the downstream consequences of privacy-related choices before they accept, decline, or override them. The current app supports text input, screenshot analysis, and voice transcript analysis inside a session-protected chat workspace.

## What The App Does

- redeems a signed invite link before entering the workspace
- accepts privacy prompts as text, screenshot, or voice transcript
- returns a concise consequence summary plus a recommendation
- shows immediate, short-term, and long-term impacts
- lets the user choose a verdict action locally in the current browser session
- stores no analysis history, verdict history, or prompt data after the session ends

## Stack

- `Next.js 15`
- `React 19`
- `TypeScript`
- `zod` for request validation

## Run Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment variables

Copy [.env.example](./.env.example) to `.env.local` and set real values:

```bash
cp .env.example .env.local
```

Required variables:

- `THROUGHLINE_SESSION_SECRET`
- `THROUGHLINE_INVITE_SECRET`
- `ANTHROPIC_API_KEY`

Optional variable:

- `ANTHROPIC_MODEL` to override the default Claude model

If you do not set them in development, the app falls back to:

- session secret: local development default only
- invite secret: local development default only

Do not use development fallbacks in production.
There is no development fallback for Claude credentials.

### 3. Start the app

```bash
npm run dev
```

Then open `http://localhost:3000`.

### 4. Enter the app

On the landing page:

- open a signed invite link that points to `/invite?token=...`
- after redemption, land on `/` and click `Enter Throughline`

After successful entry, Throughline sets a signed `httpOnly` session cookie and redirects to `/chat`.

### 5. Generate a tester invite link

Generate a signed invite URL locally:

```bash
npm run invite:generate -- http://localhost:3000 168 cohort-a
```

Arguments:

- base URL, for example `https://your-study-app.example`
- TTL in hours, for example `168` for 7 days
- optional cohort label

The command prints a full invite URL. Share that link with testers. The tester does not need the Anthropic key, session secret, or invite secret.

## How To Use The Current App

### Text analysis

1. Open the `Text` tab.
2. Paste a privacy prompt or request.
3. Click `Analyze request`.

### Screenshot analysis

1. Open the `Screenshot` tab.
2. Upload a `PNG`, `JPEG`, or `WebP` image under `5 MB`.
3. If your browser supports `TextDetector`, Throughline will try to extract the text automatically.
4. If not, add a short note describing the prompt in the screenshot.
5. Click `Analyze screenshot`.

### Voice analysis

1. Open the `Voice` tab.
2. Start recording if your browser supports speech recognition.
3. Review or edit the transcript.
4. Click `Analyze transcript`.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```

## Security Notes

This repository is set up to avoid committing secrets or session data.

Already ignored:

- `.env*` local environment files
- build output and dependency folders

Do not commit:

- production session secrets
- invite-signing secrets

The app currently includes:

- signed session cookies
- signed invite links with expiry
- same-origin checks on state-changing routes
- schema validation on API inputs
- file size and type checks for screenshot uploads
- image signature validation instead of trusting MIME type alone
- no server-side storage of analyses or verdict choices

## Current API Surface

- `GET /api/analyses`
- `POST /api/analyze/text`
- `POST /api/analyze/image`
- `POST /api/analyze/voice`
- `POST /api/verdict-action`

## Project Structure

```text
app/
  api/
  chat/
components/
  auth/
  brand/
  chat/
  verdict/
data/
docs/
lib/
  analysis/
  security/
  validation/
middleware.ts
```

## Verification

The current app has been verified with:

```bash
npm run typecheck
npm run lint
npm run build
```

## Limitations

- screenshot OCR currently depends on the browser `TextDetector` API when available
- voice input currently depends on browser speech recognition support
- the app is intentionally non-retentive and does not persist analysis history server-side
- the analysis engine requires `ANTHROPIC_API_KEY` and will fail closed without it

## Documentation

- [Architecture](./docs/architecture.md)
- [Threat Model](./docs/threat-model.md)
- [Contributing](./CONTRIBUTING.md)
