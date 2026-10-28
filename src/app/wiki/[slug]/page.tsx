import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  categorySlug,
  formatWikiDate,
  getWikiIndex,
  getWikiPage,
  getWikiPages,
  getWikiRedirect,
  withBasePath,
} from "@/lib/wiki";
import RedirectTo from "../RedirectTo";

export function generateStaticParams() {
  // Redirected titles get a page too, so old links keep working on a static host.
  return [...getWikiPages().map((p) => p.slug), ...Object.keys(getWikiIndex().redirects)].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = getWikiPage((await params).slug);
  return { title: page ? `${page.title} · Wiki` : "Wiki", description: page?.summary };
}

export default async function WikiArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getWikiPage(slug);
  if (!page) {
    const redirect = getWikiRedirect(slug);
    if (!redirect) notFound();
    const target = getWikiPages().find((p) => p.slug === redirect.to);
    const href = `/wiki/${redirect.to}${redirect.fragment ? `#${redirect.fragment.replace(/ /g, "_")}` : ""}`;
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <RedirectTo href={href} />
        <p className="text-muted">“{redirect.from}” redirects to</p>
        <Link href={href} className="mt-2 inline-block text-2xl font-bold text-accent hover:underline">
          {target?.title ?? redirect.to}
        </Link>
      </div>
    );
  }
  const toc = page.headings.filter((h) => h.level <= 3);
  const isSource = page.model !== "wikitext";

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_16rem]">
      <article className="min-w-0">
        <nav className="text-sm text-muted">
          <Link href="/wiki" className="text-accent-2 hover:underline">
            Wiki
          </Link>
          {" / "}
          <Link href={`/wiki/category/${categorySlug(page.category)}`} className="text-accent-2 hover:underline">
            {page.category}
          </Link>
        </nav>
        <h1 className="mt-3 text-3xl font-bold break-words">{page.title}</h1>
        {isSource && <p className="mt-2 text-sm text-muted">Source code ({page.model}) as stored on the wiki.</p>}
        <div className="prose-guide prose-wiki mt-6" dangerouslySetInnerHTML={{ __html: withBasePath(page.html) }} />
        {!page.html.trim() && <p className="mt-6 text-muted">This page is empty on the wiki.</p>}
        {!isSource && page.wikitext && (
          <details className="mt-10 rounded-lg border border-line bg-panel">
            <summary className="cursor-pointer px-4 py-2 text-sm text-muted hover:text-text">View wiki source</summary>
            <pre className="max-h-[32rem] overflow-auto border-t border-line px-4 py-3 text-xs whitespace-pre-wrap">{page.wikitext}</pre>
          </details>
        )}
        <footer className="mt-10 border-t border-line pt-4 text-sm text-muted">
          <p>
            From the{" "}
            <a href={page.source} className="underline hover:text-text">
              AAClassic wiki page “{page.title}”
            </a>{" "}
            (CC0), last edited {formatWikiDate(page.updated)}. Spot something wrong? Fix it on the wiki and it will show
            up here on the next refresh.
          </p>
        </footer>
      </article>

      {toc.length > 1 && (
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-xl border border-line bg-panel p-4 text-sm">
            <h2 className="mb-2 font-semibold">On this page</h2>
            <ul className="space-y-1">
              {toc.map((h) => (
                <li key={h.id} className={h.level === 3 ? "pl-3" : ""}>
                  <a href={`#${h.id}`} className="text-muted hover:text-accent">
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}
    </div>
  );
}
