"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getJson } from "../lib/api";

const AuthCtx = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

export default function AuthProvider({ children }) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let mounted = true;
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 5000);

    (async () => {
      try {
        const data = await getJson("/api/auth/get", { signal: ac.signal });
        if (mounted) setIsAuthed(!!data?.user);
      } catch {
        if (mounted) setIsAuthed(false);
      } finally {
        if (mounted) setAuthChecked(true);
      }
    })();

    return () => {
      mounted = false;
      clearTimeout(timer);
      ac.abort();
    };
  }, []);

  const value = useMemo(
    () => ({ isAuthed, setIsAuthed, authChecked }),
    [isAuthed, authChecked]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
