import { NextResponse } from "next/server";

export function ensureSameOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return null;
  }

  const host = request.headers.get("host");

  if (!host) {
    return NextResponse.json({ error: "Missing host header." }, { status: 400 });
  }

  const originHost = new URL(origin).host;

  if (originHost !== host) {
    return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });
  }

  return null;
}

