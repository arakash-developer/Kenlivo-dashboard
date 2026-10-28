import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Edge route protection. A valid better-auth session cookie must be present to
 * reach any /dashboard route; otherwise the user is sent to the sign-in page.
 *
 * This only checks for the cookie's presence (fast, edge-safe). The session is
 * still fully validated server-side by better-auth on every API call.
 */
export function middleware(req: NextRequest) {
  const sessionCookie = getSessionCookie(req);

  if (!sessionCookie) {
    const signInUrl = new URL("/authentication/sign-in/", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
