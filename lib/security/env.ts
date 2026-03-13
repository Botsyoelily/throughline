const DEVELOPMENT_ACCESS_TOKEN = "throughline-local-demo";
const DEVELOPMENT_SESSION_SECRET = "throughline-local-session-secret";

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

