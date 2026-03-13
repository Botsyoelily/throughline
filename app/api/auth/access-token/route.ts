import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAccessToken } from "@/lib/security/env";
import { ensureSameOrigin } from "@/lib/security/origin";
import { consumeRateLimit, getClientAddress } from "@/lib/security/rate-limit";
import { createSessionToken } from "@/lib/security/session";
import { accessTokenSchema } from "@/lib/validation/auth";

const AUTH_WINDOW_MS = 60_000;
const AUTH_ATTEMPT_LIMIT = 10;

export async function POST(request: Request) {
  const sameOriginError = ensureSameOrigin(request);

  if (sameOriginError) {
    return sameOriginError;
  }

  const clientAddress = getClientAddress(request);
  const rateLimit = consumeRateLimit(`auth:${clientAddress}`, {
    limit: AUTH_ATTEMPT_LIMIT,
    windowMs: AUTH_WINDOW_MS
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many access attempts. Try again in a minute." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000))
        }
      }
    );
  }

  const payload = accessTokenSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      { error: "Enter a valid access token." },
      { status: 400 }
    );
  }

  if (payload.data.accessToken !== getAccessToken()) {
    return NextResponse.json(
      { error: "Access token not recognized." },
      { status: 401 }
    );
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

  return NextResponse.json({ ok: true });
}
