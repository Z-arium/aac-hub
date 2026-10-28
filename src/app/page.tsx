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

export const revalidate = 3600;

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

export default async function Home() {
  const guides = getGuides();
  const featured = guides.filter((g) => g.featured);
  const [lead, ...rest] = featured.length ? featured : guides;
  const videos = await getVideos(8);

  return (
    <div className="space-y-12">
      <section>
        <SectionHeader title="Featured guides" href="/guides" linkText="All guides" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">{lead && <GuideCard guide={lead} large />}</div>
          <UpcomingTimers limit={5} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
