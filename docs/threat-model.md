# Throughline Threat Model

## Goal

Throughline processes privacy-sensitive prompts, screenshots, and transcripts. The threat model focuses on protecting user data, preserving trustworthy recommendations, and preventing misuse of the app as an upload or analysis surface.

## Protected Assets

- access tokens and session identifiers
- uploaded screenshots
- voice recordings and transcripts
- analysis content and verdict history
- model provider credentials
- user identity and any linked metadata

## Trust Boundaries

- browser to application server
- application server to storage
- application server to model, OCR, or speech providers
- authenticated user to protected history and verdict data

## Key Threats

### Broken Access Control

Risk:
Users access another user’s analysis history, uploads, or verdict actions.

Controls:

- authorize every read and write on the server
- avoid direct object references without ownership checks
- use opaque identifiers

### Authentication Abuse

Risk:
Attackers brute-force or replay access tokens.

Controls:

- short-lived tokens where possible
- hashed stored tokens
- rate limiting and lockout thresholds
- audit logging for repeated failures

### Malicious File Uploads

Risk:
Attackers upload oversized, malformed, or hostile files.

Controls:

- strict content-type and size validation
- verify file signatures, not extensions only
- scan files before persistence if retained
- isolate upload processing

### Prompt Injection

Risk:
User-supplied content attempts to manipulate the model into ignoring policy or emitting unsafe output.

Controls:

- server-side prompt construction
- structured response schema validation
- strict separation of system instructions and user content
- no model-controlled UI actions outside an allowlisted schema

### Sensitive Data Exposure

Risk:
Screenshots, transcripts, or tokens leak through logs, analytics, or client storage.

Controls:

- redact secrets and sensitive payloads from logs
- avoid local storage for protected data
- minimize retention windows
- define deletion behavior clearly

### Cross-Site Scripting

Risk:
Untrusted text is rendered into the chat interface unsafely.

Controls:

- render plain text by default
- avoid `dangerouslySetInnerHTML`
- enforce CSP

### CSRF And Session Abuse

Risk:
State-changing actions are triggered from another origin.

Controls:

- same-site cookies
- CSRF protections on state-changing routes
- origin and referer checks where applicable

### Dependency And Supply Chain Risk

Risk:
Compromised libraries or unsafe upgrades introduce vulnerabilities.

Controls:

- keep dependency surface small
- enable dependency scanning
- review upgrade diffs
- pin critical versions

## Abuse Cases

- mass automated token guessing
- uploading sensitive third-party screenshots without consent
- using the tool to extract or transform private data at scale
- manipulating verdict outputs to create false trust signals

## Logging Guidance

Log:

- auth successes and failures
- upload attempts and validation failures
- analysis requests and provider failures
- verdict action submissions

Do not log:

- raw access tokens
- raw screenshots
- full transcripts unless explicitly justified and protected
- provider secrets

## Security Review Checklist

- access control enforced server-side
- schema validation applied to requests and responses
- uploads constrained and scanned
- rate limiting enabled
- headers configured
- secrets stored securely
- audit trail redacted
- tests cover unauthorized access and malformed input

