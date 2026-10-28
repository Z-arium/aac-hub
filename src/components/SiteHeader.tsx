"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AccountLink from "./AccountLink";

export const NAV = [
  { href: "/guides", label: "Guides" },
  { href: "/timers", label: "Timers" },
  { href: "/tools", label: "Tools" },
  { href: "/database", label: "Database" },
  { href: "/wiki", label: "Wiki" },
  { href: "/videos", label: "Videos" },
  { href: "/roadmap", label: "Roadmap" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Close the mobile menu after navigating.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-xs font-black text-bg">AA</span>
          <span>
            Classic <span className="text-accent">Hub</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active(n.href) ? "page" : undefined}
              className={`rounded-md px-3 py-1.5 transition ${
                active(n.href) ? "bg-panel-2 text-text" : "text-muted hover:bg-panel hover:text-text"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <AccountLink />
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center rounded-md border border-line text-muted hover:text-text md:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-line px-4 py-2 md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active(n.href) ? "page" : undefined}
              className={`block rounded-md px-3 py-2.5 ${active(n.href) ? "bg-panel-2 text-text" : "text-muted"}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
