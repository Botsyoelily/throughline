# Contributing

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create local environment variables:

```bash
cp .env.example .env.local
```

3. Start the app:

```bash
npm run dev
```

Use `throughline-local-demo` only for local development unless you configure a real token.

## Before Opening A PR

Run:

```bash
npm run typecheck
npm run lint
npm run build
```

Do not open a PR with failing checks.

## Security Expectations

Throughline handles privacy-sensitive prompts and session-protected flows. Contributions should preserve the current baseline:

- validate untrusted input server-side
- do not trust client state for authorization
- do not commit secrets or local data files
- keep uploads constrained by size and content type
- avoid introducing unsafe HTML rendering

If you add authentication, uploads, storage, or external providers, update [docs/threat-model.md](./docs/threat-model.md) when the trust boundary changes.

## Pull Request Guidance

- keep changes scoped
- include a short summary of what changed
- call out any security-sensitive behavior
- mention new environment variables
- include testing notes

## Do Not Commit

- `.env` files
- real tokens or secrets
- `data/analyses.json`
- build artifacts

