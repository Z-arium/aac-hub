import Link from "next/link";
import AccountLink from "./AccountLink";

const NAV = [
  { href: "/guides", label: "Guides" },
  { href: "/wiki", label: "Wiki" },
  { href: "/timers", label: "Timers" },
  { href: "/tools", label: "Tools" },
  { href: "/database", label: "Database" },
  { href: "/videos", label: "Videos" },
  { href: "/roadmap", label: "Roadmap" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          <span className="text-accent">AA</span> Classic Hub
        </Link>
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-text">
              {n.label}
            </Link>
          ))}
        </nav>
        <AccountLink />
      </div>
    </header>
  );
}
