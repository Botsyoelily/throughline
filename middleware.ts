import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verifySessionToken } from "@/lib/security/session";

const scriptSrc =
  process.env.NODE_ENV === "production"
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

const securityHeaders = {
  "Content-Security-Policy": `default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; style-src 'self' 'unsafe-inline'; ${scriptSrc}; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`,
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=(self)"
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  if (request.nextUrl.pathname.startsWith("/chat")) {
    const sessionToken = request.cookies.get("throughline_session")?.value;
    const isPreview = request.nextUrl.searchParams.get("preview") === "1";

    if ((!sessionToken || !(await verifySessionToken(sessionToken))) && !isPreview) {
      const redirectUrl = new URL("/", request.url);
      redirectUrl.searchParams.set("from", "chat");
      return NextResponse.redirect(redirectUrl, {
        headers: response.headers
      });
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
