# Throughline

Throughline is a privacy nudge copilot that helps people understand the downstream consequences of privacy-related choices before they click accept, decline, or override. It combines concise guidance, multimodal input, and an advisory verdict layer designed to preserve user agency while making privacy tradeoffs more legible.

## Why This Exists

Most privacy prompts are optimized for completion, not comprehension. Throughline addresses that gap by translating a request into:

- a short explanation of what is being asked
- projected consequences across time
- a recommendation with confidence
- clear next actions the user can take

The product goal is not to replace user judgment. It is to improve it.

## Current Scope

This repository currently includes:

- a secure baseline Next.js and TypeScript scaffold
- a landing and access page for Throughline
- a chat workspace wireframe for text, screenshot, and voice input
- a verdict card component that recommends `Decline`, `Accept anyway`, or `Override`
- architecture and threat-model documentation for implementation

## Product Flow

1. User lands on the Throughline access page.
2. User provides an access token to enter the workspace.
3. User submits text, a screenshot, or a voice note.
4. Throughline shows a branded generating state.
5. Throughline returns a concise summary, projected impacts, and a recommendation.
6. User chooses a follow-up path or records a verdict action.

## Tech Direction

- `Next.js`
- `TypeScript`
- server-side validation with `zod`
- structured model output for deterministic UI rendering
- server-only analysis orchestration for privacy and key protection

## Security Baseline

Security is a build requirement, not a later hardening step. The implementation is expected to follow OWASP Top 10 guidance and adjacent secure engineering practices.

Current baseline in this repo:

- strict TypeScript configuration
- route-gating middleware stub for protected paths
- security headers via middleware
- server-first trust model for future token validation and authorization
- threat-model documentation covering uploads, prompt injection, auth abuse, and data exposure

Planned controls:

- server-side auth and authorization checks on every protected action
- schema validation on all requests and model responses
- rate limiting and abuse protection
- secure session management
- upload type and size restrictions
- secret redaction in logs
- CSP, HSTS, and related headers tuned for production

## Repository Structure

```text
app/
  chat/
components/
  auth/
  brand/
  chat/
  inputs/
  verdict/
docs/
lib/
middleware.ts
```

## Getting Started

1. Install dependencies.
2. Create environment variables for auth, storage, and model providers.
3. Run the development server.

```bash
npm install
npm run dev
```

## Next Build Steps

1. Add real access-token validation and session handling.
2. Define the analysis API contract with schema validation.
3. Implement screenshot upload and voice transcription adapters.
4. Persist analyses, verdict actions, and conversation history.
5. Add tests for auth, uploads, validation, and protected routes.

## Documentation

- [Architecture](./docs/architecture.md)
- [Threat Model](./docs/threat-model.md)

