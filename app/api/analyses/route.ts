import { NextResponse } from "next/server";

import {
  getSessionKey,
  getValidatedSessionToken,
  unauthorizedResponse
} from "@/lib/security/request-session";
import { listAnalysesForSession } from "@/lib/storage/analysis-store";

export async function GET(request: Request) {
  const sessionToken = await getValidatedSessionToken(request);

  if (!sessionToken) {
    return unauthorizedResponse();
  }

  const analyses = await listAnalysesForSession(getSessionKey(sessionToken));

  return NextResponse.json({
    analyses: analyses.map((analysis) => ({
      id: analysis.id,
      prompt: analysis.prompt,
      source: analysis.source,
      createdAt: analysis.createdAt,
      verdictAction: analysis.verdictAction,
      analysis: analysis.analysis
    }))
  });
}

