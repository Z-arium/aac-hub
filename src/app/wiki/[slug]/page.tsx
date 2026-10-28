import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { categorySlug, formatWikiDate, getWikiPage, getWikiPages, getWikiRedirect } from "@/lib/wiki";

export function generateStaticParams() {
  return getWikiPages().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = getWikiPage((await params).slug);
  return { title: page ? `${page.title} · Wiki` : "Wiki", description: page?.summary };
}

export default async function WikiArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getWikiPage(slug);
  if (!page) {
    const target = getWikiRedirect(slug);
    if (target) permanentRedirect(`/wiki/${target}`);
    notFound();
  }
  const toc = page.headings.filter((h) => h.level <= 3);
  // Links inside the imported HTML skip next/link, so add the base path by hand.
  const html = page.html.replaceAll('href="/wiki/', `href="${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/wiki/`);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_16rem]">
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
        <h1 className="mt-3 text-3xl font-bold">{page.title}</h1>
        <div className="prose-guide prose-wiki mt-6" dangerouslySetInnerHTML={{ __html: html }} />
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
