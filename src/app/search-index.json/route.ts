import { DATABASE, TOOLS } from "@/data/tools";
import { EVENTS } from "@/data/schedule";
import { getGuides } from "@/lib/guides";
import type { SearchItem } from "@/lib/search";
import { getWikiArticles } from "@/lib/wiki";

// Small index for the site-wide search box (SearchPalette), built once at
// build time. Wiki page text stays in /wiki-search.json, which is much larger.
export const dynamic = "force-static";

export function GET() {
  const items: SearchItem[] = [
    { t: "Guides", h: "/guides", k: "Page" },
    { t: "Boss & event timers", h: "/timers", k: "Page", d: "Live countdowns with alerts" },
    { t: "Tools", h: "/tools", k: "Page" },
    { t: "Database", h: "/database", k: "Page" },
    { t: "Wiki", h: "/wiki", k: "Page" },
    { t: "Videos", h: "/videos", k: "Page" },
    { t: "Roadmap", h: "/roadmap", k: "Page", d: "Versions 0.1 to 1.0, changelog" },
    { t: "My hub", h: "/hub", k: "Page", d: "Pinned tools, saved pages, timers, checklist and builds" },
    { t: "My account", h: "/account", k: "Page", d: "Sign in, profile, download or delete your data" },
    { t: "Privacy", h: "/privacy", k: "Page" },
    ...TOOLS.filter((t) => t.href !== "/timers").map((t) => ({ t: t.name, h: t.href, k: "Tool", d: t.blurb })),
    ...DATABASE.map((t) => ({ t: t.name, h: t.href, k: "Database", d: t.blurb })),
    ...getGuides().map((g) => ({ t: g.title, h: `/guides/${g.slug}`, k: "Guide", d: g.summary })),
    ...EVENTS.map((e) => ({ t: e.name, h: "/timers", k: "Timer", d: e.location })),
    ...getWikiArticles().map((p) => ({ t: p.title, h: `/wiki/${p.slug}`, k: "Wiki", d: p.category })),
  ];
  return Response.json(items);
}
