import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAccessToken } from "@/lib/security/env";
import { ensureSameOrigin } from "@/lib/security/origin";
import { createSessionToken } from "@/lib/security/session";
import { accessTokenSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const sameOriginError = ensureSameOrigin(request);

  if (sameOriginError) {
    return sameOriginError;
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
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  return NextResponse.json({ ok: true });
}

