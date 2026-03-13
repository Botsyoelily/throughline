import { getInviteSecret } from "@/lib/security/env";
import { createSignedToken, verifySignedToken } from "@/lib/security/signed-token";

const DEFAULT_INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export type InvitePayload = {
  cohort?: string;
  exp: number;
  sub: "throughline-invite";
};

export async function createInviteToken({
  cohort,
  ttlMs = DEFAULT_INVITE_TTL_MS
}: {
  cohort?: string;
  ttlMs?: number;
}) {
  const payload: InvitePayload = {
    sub: "throughline-invite",
    exp: Date.now() + ttlMs,
    ...(cohort ? { cohort } : {})
  };

  return createSignedToken(payload, getInviteSecret());
}

export async function verifyInviteToken(token: string) {
  const payload = await verifySignedToken<InvitePayload>(token, getInviteSecret());

  if (!payload) {
    return null;
  }

  if (payload.sub !== "throughline-invite" || payload.exp <= Date.now()) {
    return null;
  }

  return payload;
}
