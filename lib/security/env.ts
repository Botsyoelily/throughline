const DEVELOPMENT_ACCESS_TOKEN = "throughline-local-demo";
const DEVELOPMENT_SESSION_SECRET = "throughline-local-session-secret";
const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-5-20250929";

export function getAccessToken() {
  if (process.env.THROUGHLINE_ACCESS_TOKEN) {
    return process.env.THROUGHLINE_ACCESS_TOKEN;
  }

  if (process.env.NODE_ENV !== "production") {
    return DEVELOPMENT_ACCESS_TOKEN;
  }

  throw new Error("THROUGHLINE_ACCESS_TOKEN is required in production.");
}

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
