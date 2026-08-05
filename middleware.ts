import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const PROTECTED_PREFIXES = ["/dashboard"];
const AUTH_PAGES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  // 1. Always refresh the Supabase session cookie (required for SSR auth)
  const response = await updateSession(request);

  const { pathname } = request.nextUrl;

  // 2. Edge-level protection: redirect /dashboard/* to /login if no session cookie.
  //    This is a fast, zero-latency check — the real auth validation still happens
  //    inside each page/layout via requireAuth(), but this stops crawlers and
  //    accidental navigations before they hit any server component.
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected) {
    // Supabase stores the session in a cookie named sb-<ref>-auth-token
    // If no auth cookie exists at all, we can fast-reject at the edge.
    const hasSession = request.cookies.getAll().some(
      (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
    );
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. If already authenticated, don't show login/signup again
  if (AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    const hasSession = request.cookies.getAll().some(
      (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
    );
    if (hasSession) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
