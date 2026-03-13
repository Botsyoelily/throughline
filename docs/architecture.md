# Throughline Architecture

## Purpose

Throughline helps users evaluate privacy requests by accepting multimodal input and returning a short, structured analysis with a recommendation. The architecture must support three things well:

- privacy-sensitive data handling
- deterministic rendering from structured model output
- secure boundaries between browser, app server, and external services

## High-Level Components

### Client

The web client renders:

- landing and access experience
- chat workspace
- input modes for text, screenshot, and voice
- verdict and consequence cards
- recent analysis history

The client must never hold model provider secrets or make trusted authorization decisions.

### App Server

The app server is the trust boundary. It is responsible for:

- validating access tokens or authenticated sessions
- authorizing access to protected data
- validating request bodies
- enforcing file limits and MIME constraints
- orchestrating calls to transcription, OCR, or LLM providers
- returning a constrained JSON response that the UI can render safely

### Persistence Layer

Planned persistent storage:

- `Postgres` for users, sessions, analyses, and verdict actions
- object storage for uploaded screenshots if retention is required
- optional `Redis` for rate limiting and short-lived job state

## Suggested Request Flow

1. The user enters Throughline with an access token.
2. The app server validates the token and issues a secure session.
3. The user submits text, a screenshot, or a voice input.
4. The app server validates the input and normalizes it into analysis content.
5. The analysis service builds a structured prompt and requests a model response.
6. The model output is validated against a strict schema.
7. The server stores a minimal analysis record and returns the validated result.
8. The client renders the response, verdict card, and follow-up actions.

## Response Contract

The UI should render from validated structured output only.

```ts
type AnalysisResponse = {
  summary: string;
  recommendation: "decline" | "accept_with_caution" | "safe_to_accept";
  rationale: string;
  confidence: number;
  impacts: {
    immediate: string;
    shortTerm: string;
    longTerm: string;
  };
  userOptions: Array<{
    id: "dig_deeper" | "my_rights" | "analyze_another";
    label: string;
  }>;
};
```

This reduces UI ambiguity and makes prompt injection less likely to alter front-end behavior.

## Frontend Boundaries

- UI components should stay presentational where possible.
- analysis state should be isolated in a small orchestration layer.
- uploads and voice recording should be capability-checked before use.
- no privileged decision should rely on hidden client state.

## Security Controls By Layer

### Browser

- encode untrusted output by default
- restrict upload size and accepted file types in the UI
- avoid storing sensitive analysis data in local storage

### Server

- validate every request with schemas
- authorize every protected read and write
- log security-relevant events with redaction
- enforce rate limiting

### External Integrations

- call providers only from server-side code
- keep API keys server-only
- minimize prompt exposure of user-sensitive data
- define retention and deletion expectations

## Deployment Notes

- deploy frontend and server through a controlled CI path
- keep secrets in platform-managed environment variables
- enable dependency scanning and branch protection
- run lint, typecheck, tests, and security checks in CI

