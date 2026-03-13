import { createHmac } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function parseEnvFile(filepath) {
  if (!existsSync(filepath)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(filepath, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        const key = line.slice(0, index).trim();
        const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
        return [key, value];
      })
  );
}

function encodeBase64Url(input) {
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function signPayload(payload, secret) {
  return createHmac("sha256", secret)
    .update(payload)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

const env = {
  ...parseEnvFile(path.join(process.cwd(), ".env.local")),
  ...process.env
};

const baseUrl = process.argv[2] || env.THROUGHLINE_APP_URL || "http://localhost:3000";
const ttlHours = Number(process.argv[3] || "168");
const cohort = process.argv[4];
const inviteSecret =
  env.THROUGHLINE_INVITE_SECRET ||
  (env.NODE_ENV !== "production" ? "throughline-local-invite-secret" : undefined);

if (!inviteSecret) {
  console.error("Missing THROUGHLINE_INVITE_SECRET.");
  process.exit(1);
}

if (!Number.isFinite(ttlHours) || ttlHours <= 0) {
  console.error("TTL hours must be a positive number.");
  process.exit(1);
}

const payload = {
  sub: "throughline-invite",
  exp: Date.now() + ttlHours * 60 * 60 * 1000,
  ...(cohort ? { cohort } : {})
};

const encodedPayload = encodeBase64Url(JSON.stringify(payload));
const signature = signPayload(encodedPayload, inviteSecret);
const token = `${encodedPayload}.${signature}`;
const inviteUrl = new URL("/invite", baseUrl);

inviteUrl.searchParams.set("token", token);

console.log(inviteUrl.toString());
