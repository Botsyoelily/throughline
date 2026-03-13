const DEVELOPMENT_SESSION_SECRET = "throughline-local-session-secret";
const DEVELOPMENT_INVITE_SECRET = "throughline-local-invite-secret";
const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-5-20250929";

export function getSessionSecret() {
  if (process.env.THROUGHLINE_SESSION_SECRET) {
    return process.env.THROUGHLINE_SESSION_SECRET;
  }

  if (process.env.NODE_ENV !== "production") {
    return DEVELOPMENT_SESSION_SECRET;
  }

  throw new Error("THROUGHLINE_SESSION_SECRET is required in production.");
}

export function getAnthropicApiKey() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is required for analysis.");
  }

  return apiKey;
}

export function getAnthropicModel() {
  return process.env.ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL;
}

export function getInviteSecret() {
  if (process.env.THROUGHLINE_INVITE_SECRET) {
    return process.env.THROUGHLINE_INVITE_SECRET;
  }

  if (process.env.NODE_ENV !== "production") {
    return DEVELOPMENT_INVITE_SECRET;
  }

  throw new Error("THROUGHLINE_INVITE_SECRET is required in production.");
}
