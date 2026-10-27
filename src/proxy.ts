import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

const PROTECTED_PREFIXES = ["/dashboard", "/candidates", "/slots", "/interviews", "/jobs"];
const PROTECTED_API_PREFIXES = ["/api/dashboard", "/api/candidates", "/api/slots", "/api/interviews", "/api/jobs"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPage = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isProtectedApi = PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);

  if (!session) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/candidates/:path*",
    "/slots/:path*",
    "/interviews/:path*",
    "/api/dashboard/:path*",
    "/api/candidates/:path*",
    "/api/slots/:path*",
    "/api/interviews/:path*",
    "/jobs/:path*",
    "/api/jobs/:path*",
  ],
};
