import { NextResponse } from "next/server";

import { ensureSameOrigin } from "@/lib/security/origin";
import {
  getSessionKey,
  getValidatedSessionToken,
  unauthorizedResponse
} from "@/lib/security/request-session";
import { updateVerdictAction } from "@/lib/storage/analysis-store";
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

  const updated = await updateVerdictAction(
    getSessionKey(sessionToken),
    payload.data.analysisId,
    payload.data.action
  );

  if (!updated) {
    return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

