import { getSessionSecret } from "@/lib/security/env";
import { createSignedToken, verifySignedToken } from "@/lib/security/signed-token";

const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

export type SessionPayload = {
  exp: number;
  sub: string;
};

export async function createSessionToken() {
  const payload: SessionPayload = {
    sub: "throughline-user",
    exp: Date.now() + SESSION_TTL_MS
  };

  return createSignedToken(payload, getSessionSecret());
}

export async function verifySessionToken(token: string) {
  const payload = await verifySignedToken<SessionPayload>(token, getSessionSecret());

  if (!payload) {
    return false;
  }

  return payload.sub === "throughline-user" && payload.exp > Date.now();
}
