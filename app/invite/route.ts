import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { consumeRateLimit, getClientAddress } from "@/lib/security/rate-limit";
import { verifyInviteToken } from "@/lib/security/invite";
import { createSessionToken } from "@/lib/security/session";

const INVITE_WINDOW_MS = 60_000;
const INVITE_ATTEMPT_LIMIT = 20;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/?invite=missing", url));
  }

  const clientAddress = getClientAddress(request);
  const rateLimit = consumeRateLimit(`invite:${clientAddress}`, {
    limit: INVITE_ATTEMPT_LIMIT,
    windowMs: INVITE_WINDOW_MS
  });

  if (!rateLimit.allowed) {
    return NextResponse.redirect(new URL("/?invite=rate_limited", url));
  }

  const invite = await verifyInviteToken(token);

  if (!invite) {
    return NextResponse.redirect(new URL("/?invite=invalid", url));
  }

  const sessionToken = await createSessionToken();
  const cookieStore = await cookies();

  cookieStore.set("throughline_session", sessionToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  return NextResponse.redirect(new URL("/?invite=ready", url));
}
