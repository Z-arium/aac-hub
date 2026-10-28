import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FeaturedVideo from "@/components/FeaturedVideo";
import { getFeaturedVideo } from "@/data/videos";
import { getGuide, getGuides, renderMarkdown } from "@/lib/guides";

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
  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/guides" className="text-sm text-accent-2 hover:underline">
        ← All guides
      </Link>
      <p className="mt-6 text-sm font-medium text-accent">{guide.category}</p>
      <h1 className="mt-1 text-3xl font-bold">{guide.title}</h1>
      <p className="mt-2 text-muted">{guide.summary}</p>
      {video && (
        <div className="mt-6">
          <FeaturedVideo video={video} />
        </div>
      )}
      <div className="prose-guide mt-6" dangerouslySetInnerHTML={{ __html: renderMarkdown(guide.body) }} />
      <div className="mt-10 border-t border-line pt-4 text-sm text-muted">
        <p>Last updated {guide.updated}.</p>
        {guide.sources.length > 0 && (
          <p className="mt-1">
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
        )}
      </div>
    </article>
  );
}
