import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FeaturedVideo from "@/components/FeaturedVideo";
import { getFeaturedVideo } from "@/data/videos";
import GuideCard from "@/components/GuideCard";
import { getGuide, getGuides, headingId, renderMarkdown } from "@/lib/guides";

export function generateStaticParams() {
  return getGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  return { title: guide?.title, description: guide?.summary };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();
  const video = guide.video ? getFeaturedVideo(guide.video) : undefined;
  const toc = [...guide.body.matchAll(/^(##|###) (.+)$/gm)].map((m) => ({
    level: m[1].length,
    text: m[2].replace(/[*_`]/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"),
  }));
  const related = getGuides()
    .filter((g) => g.slug !== guide.slug && g.category === guide.category)
    .slice(0, 3);
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_15rem]">
      <article className="min-w-0 max-w-3xl">
        <Link href="/guides" className="text-sm text-accent-2 hover:underline">
          ← All guides
        </Link>
        <p className="mt-6 text-sm font-medium text-accent">{guide.category}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">{guide.title}</h1>
        <p className="mt-2 text-lg text-muted">{guide.summary}</p>
        {guide.updated && <p className="mt-2 text-xs text-muted">Updated {guide.updated}</p>}
        {video && (
          <div className="mt-6">
            <FeaturedVideo video={video} />
          </div>
        )}
        <div className="prose-guide mt-6" dangerouslySetInnerHTML={{ __html: renderMarkdown(guide.body) }} />
        {guide.sources.length > 0 && (
          <div className="mt-10 border-t border-line pt-4 text-sm text-muted">
            <p className="break-words">
              Sources:{" "}
              {guide.sources.map((s, i) => (
                <span key={s}>
                  {i > 0 && ", "}
                  <a href={s} className="underline hover:text-text">
                    {decodeURIComponent(s.replace(/^https?:\/\//, ""))}
                  </a>
                </span>
              ))}
            </p>
          </div>
        )}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-bold">More {guide.category.toLowerCase()} guides</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {related.map((g) => (
                <GuideCard key={g.slug} guide={g} />
              ))}
            </div>
          </section>
        )}
      </article>
      {toc.length > 2 && (
        <aside className="hidden lg:block">
          <nav className="sticky top-20 rounded-xl border border-line bg-panel p-4 text-sm">
            <p className="mb-2 font-semibold">On this page</p>
            <ul className="space-y-1.5">
              {toc.map((h) => (
                <li key={h.text} className={h.level === 3 ? "pl-3" : ""}>
                  <a href={`#${headingId(h.text)}`} className="text-muted hover:text-accent">
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      )}
    </div>
  );
}
