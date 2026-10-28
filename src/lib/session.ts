import jwt from "jsonwebtoken";

export const SESSION_COOKIE = "session";
const MAX_AGE_SEC = 7 * 24 * 60 * 60; // 7 days

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin" | "super_admin";
}

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

export function signSession(user: SessionUser): string {
  return jwt.sign(user, secret(), { expiresIn: MAX_AGE_SEC });
}

export function verifySession(token: string): SessionUser | null {
  try {
    const { iat, exp, ...user } = jwt.verify(token, secret()) as SessionUser & {
      iat: number;
      exp: number;
    };
    return user;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SEC,
};
