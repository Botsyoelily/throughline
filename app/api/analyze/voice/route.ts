import { NextResponse } from "next/server";

import { AnalysisProviderError, analyzeTextPrompt } from "@/lib/analysis/text-analyzer";
import { ensureSameOrigin } from "@/lib/security/origin";
import { getValidatedSessionToken, unauthorizedResponse } from "@/lib/security/request-session";
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
      { error: "Submit a longer transcript so Throughline can analyze it." },
      { status: 400 }
    );
  }

  try {
    const analysis = await analyzeTextPrompt(payload.data.prompt, "voice");
    return NextResponse.json({ ...analysis, source: "voice" });
  } catch (error) {
    if (error instanceof AnalysisProviderError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Unexpected analysis failure." },
      { status: 500 }
    );
  }
}
