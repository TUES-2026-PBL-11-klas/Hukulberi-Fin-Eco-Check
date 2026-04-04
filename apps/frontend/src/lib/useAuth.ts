"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, fetchWithAuth, removeToken } from "./api";

interface User {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
}

export function useAuth(options?: { redirect?: boolean }) {
  const hasToken = typeof window !== "undefined" && !!getToken();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(hasToken);
  const router = useRouter();
  const shouldRedirect = options?.redirect ?? true;

  useEffect(() => {
    const token = getToken();

    if (!token) {
      if (shouldRedirect) router.replace("/login");
      return;
    }

    fetchWithAuth("/auth/me")
      .then(async (res) => {
        if (!res.ok) {
          removeToken();
          if (shouldRedirect) router.replace("/login");
          return;
        }
        const data = await res.json();
        setUser(data);
      })
      .catch(() => {
        removeToken();
        if (shouldRedirect) router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [router, shouldRedirect]);

  return { user, loading };
}
