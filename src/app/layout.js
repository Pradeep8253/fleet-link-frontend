"use client";

import "./globals.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { FiPlusCircle, FiSearch, FiBook } from "react-icons/fi";
import { getJson, postJson } from "./lib/api";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const tabs = [
  { href: "/search-vehicle", label: "Search", Icon: FiSearch },
  { href: "/add-vehicle", label: "Add Vehicle", Icon: FiPlusCircle },
  { href: "/my-bookings", label: "My Bookings", Icon: FiBook },
];

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isAuthed, setIsAuthed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getJson("/api/auth/get");
        if (mounted && data?.user) setIsAuthed(true);
      } catch {
        if (mounted) setIsAuthed(false);
      } finally {
        if (mounted) setAuthChecked(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleClick = (e, href) => {
    if (href === "/search-vehicle") return;
    if (!authChecked) {
      e.preventDefault();
      return;
    }
    if (!isAuthed) {
      e.preventDefault();
      router.push(`/auth/login?redirect=${encodeURIComponent(href)}`);
    }
  };

  const logout = async () => {
    await postJson("/api/auth/logout", {});
    router.push("/auth/login");
  };

  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-gray-900 antialiased">
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

              <button
                onClick={logout}
                className="rounded-lg px-3 py-2 bg-black text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-4 pt-6">
          <nav
            className="flex items-center gap-2 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200"
            aria-label="Primary"
          >
            {tabs.map(({ href, label, Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  onClick={(e) => handleClick(e, href)}
                  className={`w-full rounded-lg px-4 py-2 text-center text-sm font-medium transition
                    ${
                      active
                        ? "bg-blue-600 text-white shadow"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <Icon size={16} aria-hidden="true" />
                    <span>{label}</span>
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <main className="mx-auto max-w-3xl p-6">
          <Suspense fallback={null}>{children}</Suspense>
        </main>

        <ToastContainer position="top-center" autoClose={3000} />
      </body>
    </html>
  );
}
