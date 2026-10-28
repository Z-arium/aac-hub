import Link from "next/link";
import FeaturedVideo from "@/components/FeaturedVideo";
import GuideCard from "@/components/GuideCard";
import ToolGrid from "@/components/ToolGrid";
import UpcomingTimers from "@/components/UpcomingTimers";
import VideoGrid from "@/components/VideoGrid";
import { DATABASE } from "@/data/tools";
import { FEATURED_VIDEOS } from "@/data/videos";
import { getGuides } from "@/lib/guides";
import { getVideos } from "@/lib/youtube";

const QUICK_LINKS = [
  { href: "/timers", label: "Timers" },
  { href: "/tools/checklist", label: "Daily checklist" },
  { href: "/tools/class-builder", label: "Class builder" },
  { href: "/tools/regrade", label: "Regrade calculator" },
];

function SectionHeader({ title, href, linkText }: { title: string; href?: string; linkText?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <h2 className="text-xl font-bold">{title}</h2>
      {href && (
        <Link href={href} className="text-sm text-accent-2 hover:underline">
          {linkText}
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const guides = getGuides();
  const featured = guides.filter((g) => g.featured);
  const [lead, ...rest] = featured.length ? featured : guides;
  const videos = getVideos(8, FEATURED_VIDEOS.slice(0, 1).map((v) => v.id));

  return (
    <div className="space-y-12">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything for <span className="text-accent">ArcheAge Classic</span>
          </h1>
          <p className="mt-2 max-w-2xl text-muted">Guides, live boss timers, calculators and the full wiki, in one place.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {QUICK_LINKS.map((q) => (
            <Link key={q.href} href={q.href} className="rounded-full border border-line bg-panel px-3 py-1.5 hover:border-accent/60 hover:text-accent">
              {q.label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Featured guides" href="/guides" linkText="All guides" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">{lead && <GuideCard guide={lead} large />}</div>
          <UpcomingTimers limit={5} />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.slice(0, 3).map((g) => (
            <GuideCard key={g.slug} guide={g} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Videos" href="/videos" linkText="More videos" />
        {FEATURED_VIDEOS[0] && (
          <div className="mb-4 max-w-3xl">
            <FeaturedVideo video={FEATURED_VIDEOS[0]} showGuide />
          </div>
        )}
        <VideoGrid videos={videos} />
      </section>

      <section>
        <SectionHeader title="Tools" href="/tools" linkText="All tools" />
        <ToolGrid />
      </section>

      <section>
        <SectionHeader title="Database" href="/database" linkText="Browse the database" />
        <ToolGrid items={DATABASE} />
      </section>
    </div>
  );
}
