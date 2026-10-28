import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Inlined (not imported from lib/session) to keep jsonwebtoken out of the
// edge middleware bundle.
const SESSION_COOKIE = "session";

/**
 * Edge route protection. A valid, signature-verified session cookie with the
 * admin role is required to reach any /dashboard route. The cookie is issued by
 * /api/auth/login after checking the user's password directly against MongoDB.
 */

const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

async function getRole(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return (payload as { role?: string }).role ?? null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const role = token ? await getRole(token) : null;

  if (role !== "admin") {
    return NextResponse.redirect(new URL("/authentication/sign-in/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/my-profile/:path*"],
};
