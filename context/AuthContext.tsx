"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppUser } from "@/types";

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  isAdmin: boolean;
  /** Re-reads the session from the server. */
  refresh: () => Promise<AppUser | null>;
  /** Optimistically sets the user after a successful login/register call. */
  setUser: (user: AppUser | null) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  initialUser = null,
  children,
}: {
  initialUser?: AppUser | null;
  children: ReactNode;
}) {
  const [user, setUser] = useState<AppUser | null>(initialUser);
  const [loading, setLoading] = useState(initialUser === null);

  const refresh = useCallback(async (): Promise<AppUser | null> => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json().catch(() => ({ user: null }));
      const next = res.ok ? ((data.user ?? null) as AppUser | null) : null;
      setUser(next);
      return next;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  }, []);

  useEffect(() => {
    // Confirm the cookie is still valid on mount (it may have expired between
    // page loads, or the user may have signed out in another tab).
    refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAdmin: user?.role === "admin",
      refresh,
      setUser,
      signOut,
    }),
    [user, loading, refresh, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
