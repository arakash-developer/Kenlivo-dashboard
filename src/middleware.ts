import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "session";

// Verify an HS256 JWT using the Web Crypto API (Edge-compatible, no jose needed).
async function getRole(token: string): Promise<string | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sigB64] = parts;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(process.env.SESSION_SECRET ?? ""),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );

    const sig = Uint8Array.from(
      atob(sigB64.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0),
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sig,
      new TextEncoder().encode(`${headerB64}.${payloadB64}`),
    );
    if (!valid) return null;

    const payload = JSON.parse(
      atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")),
    ) as { role?: string; exp?: number };

    if (payload.exp && payload.exp < Date.now() / 1000) return null;

    return payload.role ?? null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const role = token ? await getRole(token) : null;

  const { pathname } = req.nextUrl;

  // /users/* is super_admin only
  if (pathname.startsWith("/users")) {
    if (role !== "super_admin") {
      return NextResponse.redirect(new URL("/authentication/sign-in/", req.url));
    }
    return NextResponse.next();
  }

  // /dashboard/* and /my-profile/* require admin or super_admin
  if (role !== "admin" && role !== "super_admin") {
    return NextResponse.redirect(new URL("/authentication/sign-in/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/my-profile/:path*",
    "/users/:path*",
    "/ecommerce/shipping-settings/:path*",
  ],
};
