import { NextResponse } from "next/server";

import { ensureSameOrigin } from "@/lib/security/origin";
import { getValidatedSessionToken, unauthorizedResponse } from "@/lib/security/request-session";
import { verdictActionSchema } from "@/lib/validation/verdict";

export async function POST(request: Request) {
  const sameOriginError = ensureSameOrigin(request);

  if (sameOriginError) {
    return sameOriginError;
  }

  const sessionToken = await getValidatedSessionToken(request);

  if (!sessionToken) {
    return unauthorizedResponse();
  }

  const payload = verdictActionSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid verdict action." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
