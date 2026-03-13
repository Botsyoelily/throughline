import { NextResponse } from "next/server";

import { AnalysisProviderError, analyzeFollowUp } from "@/lib/analysis/text-analyzer";
import { ensureSameOrigin } from "@/lib/security/origin";
import { getValidatedSessionToken, unauthorizedResponse } from "@/lib/security/request-session";
import { followUpRequestSchema } from "@/lib/validation/analysis";

export async function POST(request: Request) {
  const sameOriginError = ensureSameOrigin(request);

  if (sameOriginError) {
    return sameOriginError;
  }

  const sessionToken = await getValidatedSessionToken(request);

  if (!sessionToken) {
    return unauthorizedResponse();
  }

  const payload = followUpRequestSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid follow-up request." }, { status: 400 });
  }

  if (payload.data.optionId === "analyze_another") {
    return NextResponse.json(
      { error: "Analyze another does not require a follow-up call." },
      { status: 400 }
    );
  }

  try {
    const followUp = await analyzeFollowUp({
      ...payload.data,
      optionId: payload.data.optionId
    });
    return NextResponse.json(followUp);
  } catch (error) {
    if (error instanceof AnalysisProviderError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Unexpected follow-up analysis failure." },
      { status: 500 }
    );
  }
}
