import { NextResponse } from "next/server";

import { getValidatedSessionToken, unauthorizedResponse } from "@/lib/security/request-session";

export async function GET(request: Request) {
  const sessionToken = await getValidatedSessionToken(request);

  if (!sessionToken) {
    return unauthorizedResponse();
  }

  return NextResponse.json({ analyses: [] });
}
