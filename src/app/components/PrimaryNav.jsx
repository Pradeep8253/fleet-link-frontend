"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiPlusCircle, FiSearch, FiBook } from "react-icons/fi";
import { useAuth } from "./AuthProvider";

const tabs = [
  { href: "/search-vehicle", label: "Search", Icon: FiSearch },
  { href: "/add-vehicle", label: "Add Vehicle", Icon: FiPlusCircle },
  { href: "/my-bookings", label: "My Bookings", Icon: FiBook },
];

export default function PrimaryNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthed, authChecked } = useAuth();

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

  return (
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
  );
}
