import { NextResponse } from "next/server";

import { analyzeTextPrompt } from "@/lib/analysis/text-analyzer";
import { ensureSameOrigin } from "@/lib/security/origin";
import {
  getSessionKey,
  getValidatedSessionToken,
  unauthorizedResponse
} from "@/lib/security/request-session";
import { saveAnalysis } from "@/lib/storage/analysis-store";
import { analysisRequestSchema } from "@/lib/validation/analysis";

export async function POST(request: Request) {
  const sameOriginError = ensureSameOrigin(request);

  if (sameOriginError) {
    return sameOriginError;
  }

  const sessionToken = await getValidatedSessionToken(request);

  if (!sessionToken) {
    return unauthorizedResponse();
  }

  const payload = analysisRequestSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      { error: "Submit a privacy request with enough detail to analyze." },
      { status: 400 }
    );
  }

  const analysis = analyzeTextPrompt(payload.data.prompt);
  const saved = await saveAnalysis({
    sessionKey: getSessionKey(sessionToken),
    source: "text",
    prompt: payload.data.prompt,
    analysis
  });

  return NextResponse.json({ ...saved.analysis, id: saved.id, source: saved.source });
}
