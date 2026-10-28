export type UserRole = "customer" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

async function parse(res: Response) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.message || "Something went wrong");
  }
  return body;
}

/** Same-origin auth API (Next.js route handlers backed directly by MongoDB). */
export const authApi = {
  async login(payload: LoginPayload): Promise<AuthUser> {
    // Trailing slash matches next.config `trailingSlash: true` (avoids a 308).
    const res = await fetch("/api/auth/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await parse(res);
    return body.data as AuthUser;
  },

  async logout(): Promise<void> {
    await fetch("/api/auth/logout/", { method: "POST" });
  },

  async me(): Promise<AuthUser | null> {
    const res = await fetch("/api/auth/me/");
    if (!res.ok) return null;
    const body = await res.json();
    return body.data as AuthUser;
  },
};
