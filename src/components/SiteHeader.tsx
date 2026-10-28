import Link from "next/link";

const NAV = [
  { href: "/guides", label: "Guides" },
  { href: "/timers", label: "Timers" },
  { href: "/tools", label: "Tools" },
  { href: "/database/world-bosses", label: "Bosses" },
  { href: "/database/festivals", label: "Festivals" },
  { href: "/videos", label: "Videos" },
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
      </div>
    </header>
  );
}
