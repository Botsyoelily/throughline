import { createHash } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verifySessionToken } from "@/lib/security/session";

function parseCookieValue(cookieHeader: string, name: string) {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export async function getValidatedSessionToken(request: Request | NextRequest) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const sessionToken = parseCookieValue(cookieHeader, "throughline_session");

  if (!sessionToken || !(await verifySessionToken(sessionToken))) {
    return null;
  }

  return sessionToken;
}

export function getSessionKey(sessionToken: string) {
  return createHash("sha256").update(sessionToken).digest("hex");
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

