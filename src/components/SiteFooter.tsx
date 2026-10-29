import Link from "next/link";
import { DATABASE, TOOLS } from "@/data/tools";
import { getSiteVersion } from "@/lib/roadmap";

const COLUMNS = [
  {
    title: "Hub",
    links: [
      { href: "/guides", label: "Guides" },
      { href: "/timers", label: "Timers" },
      { href: "/wiki", label: "Wiki" },
      { href: "/videos", label: "Videos" },
      { href: "/hub", label: "My hub" },
      { href: "/roadmap", label: "Roadmap" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
  { title: "Tools", links: TOOLS.filter((t) => t.href !== "/timers").map((t) => ({ href: t.href, label: t.name })) },
  { title: "Database", links: DATABASE.map((t) => ({ href: t.href, label: t.name })) },
];

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-panel/40 text-sm text-muted">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1">
          <p className="font-bold text-text">
            AA Classic <span className="text-accent">Hub</span>
          </p>
          <p className="mt-2 max-w-sm">
            A fan-made site for ArcheAge Classic. Not affiliated with the AAClassic team, XLGames or Kakao Games.
          </p>
          <p className="mt-2 max-w-sm">
            Game data comes from the{" "}
            <a className="underline hover:text-text" href="https://wiki.aa-classic.com/Main_Page">
              AAClassic wiki
            </a>{" "}
            and the official{" "}
            <a className="underline hover:text-text" href="https://aa-classic.com/timers">
              timers page
            </a>
            . Event times use server time (US Eastern).
          </p>
          <p className="mt-2">
            <Link href="/roadmap" className="rounded border border-line px-1.5 py-0.5 text-xs hover:text-text">
              v{getSiteVersion()}
            </Link>
          </p>
        </div>
        {COLUMNS.map((c) => (
          <div key={c.title}>
            <p className="mb-3 font-semibold text-text">{c.title}</p>
            <ul className="space-y-2">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-text">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
