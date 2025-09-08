"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { postJson } from "../lib/api";
import { useAuth } from "./AuthProvider";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthed, setIsAuthed, authChecked } = useAuth();

  const logout = async () => {
    try {
      await postJson("/api/auth/logout", {});
    } finally {
      setIsAuthed(false);
      router.push("/auth/login");
    }
  };

  const loginHref =
    pathname === "/auth/login"
      ? "/auth/login"
      : `/auth/login?redirect=${encodeURIComponent(pathname || "/")}`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight"
            aria-label="FleetLink Home"
          >
            <span className="inline-block h-7 w-7 rounded-lg bg-gray-900" />
            <span>
              <span className="text-gray-900">Fleet</span>
              <span className="text-blue-600">Link</span>
            </span>
          </Link>

          {!authChecked ? (
            <Link
              href="/auth/login"
              className="rounded-lg px-3 py-2 bg-slate-200 text-slate-600"
              aria-disabled
            >
              Login
            </Link>
          ) : isAuthed ? (
            <button
              onClick={logout}
              className="rounded-lg px-3 py-2 bg-black text-white"
            >
              Logout
            </button>
          ) : (
            <Link
              href={loginHref}
              className="rounded-lg px-3 py-2 bg-blue-600 text-white"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
