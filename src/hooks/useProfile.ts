"use client";

import * as React from "react";

export interface ProfileUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  phone: string | null;
  createdAt: string | null;
}

/** Fetches the currently authenticated user from the same-origin auth API. */
export function useProfile() {
  const [user, setUser] = React.useState<ProfileUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    fetch("/api/auth/me/")
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (active) setUser(body?.data ?? null);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { user, loading };
}
