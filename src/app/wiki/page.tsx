import type { Metadata } from "next";
import Link from "next/link";
import PageTitle from "@/components/PageTitle";
import { formatWikiDate, getWikiArticles, getWikiCategories, getWikiCoverage, getWikiPages } from "@/lib/wiki";
import WikiPageCard from "./WikiPageCard";
import WikiSearch from "./WikiSearch";

export const metadata: Metadata = {
  title: "Wiki",
  description: "The whole AAClassic wiki, cleaned up and searchable.",
};

const PREVIEW = 6;

export default function WikiHome() {
  const all = getWikiCategories();
  const categories = all.filter((c) => !c.internal);
  const internals = all.filter((c) => c.internal);
  const pages = getWikiArticles();
  const coverage = getWikiCoverage();
  const recent = [...pages].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 6);

  return (
    <>
      <PageTitle
        title="Wiki"
        subtitle={
          <>
            A complete copy of the{" "}
            <a href="https://wiki.aa-classic.com/Main_Page" className="underline hover:text-text">
              AAClassic wiki
            </a>
            , cleaned up and searchable: every page and every image, stored on this site. Content is CC0 and each page
            links back to its source.
          </>
        }
      />

      <div className="mb-6 flex flex-wrap gap-3 text-sm">
        <span className="rounded-lg border border-line bg-panel px-3 py-2">
          <b>{pages.length}</b> <span className="text-muted">articles</span>
        </span>
        <span className="rounded-lg border border-line bg-panel px-3 py-2">
          <b>{getWikiPages().length - pages.length}</b> <span className="text-muted">templates, modules &amp; other pages</span>
        </span>
        <Link href="/wiki/files" className="rounded-lg border border-line bg-panel px-3 py-2 hover:border-accent">
          <b>{coverage ? coverage.files.wiki.toLocaleString() : "All"}</b> <span className="text-muted">images &amp; files →</span>
        </Link>
        {coverage && (
          <Link href="/wiki/coverage" className="rounded-lg border border-line bg-panel px-3 py-2 hover:border-accent">
            <span className={coverage.complete ? "text-accent-2" : "text-red-400"}>
              {coverage.complete ? "✓ Verified complete" : `${coverage.problems.length} gaps`}
            </span>{" "}
            <span className="text-muted">{formatWikiDate(coverage.checked)} →</span>
          </Link>
        )}
      </div>

      <WikiSearch />

      {pages.length === 0 && (
        <p className="mt-8 text-muted">
          The wiki has not been imported yet. Run <code>npm run wiki:import</code>.
        </p>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-10">
          {categories.map((c) => (
            <section key={c.slug}>
              <div className="mb-3 flex items-end justify-between">
                <h2 className="text-lg font-semibold text-accent">
                  {c.name} <span className="text-sm font-normal text-muted">{c.pages.length}</span>
                </h2>
                {c.pages.length > PREVIEW && (
                  <Link href={`/wiki/category/${c.slug}`} className="text-sm text-accent-2 hover:underline">
                    All {c.pages.length}
                  </Link>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {c.pages.slice(0, PREVIEW).map((p) => (
                  <WikiPageCard key={p.slug} page={p} />
                ))}
              </div>
            </section>
          ))}

          {internals.length > 0 && (
            <section className="rounded-xl border border-line p-5">
              <h2 className="text-lg font-semibold">Wiki internals</h2>
              <p className="mt-1 text-sm text-muted">
                The building blocks behind the articles, kept so nothing from the wiki is left out.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {internals.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/wiki/category/${c.slug}`}
                    className="rounded-lg border border-line bg-panel px-3 py-1.5 hover:border-accent"
                  >
                    {c.name} <span className="text-muted">{c.pages.length}</span>
                  </Link>
                ))}
                <Link href="/wiki/files" className="rounded-lg border border-line bg-panel px-3 py-1.5 hover:border-accent">
                  Files
                </Link>
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border border-line bg-panel p-4">
            <h2 className="mb-2 font-semibold">Categories</h2>
            <ul className="space-y-1 text-sm">
              {categories.map((c) => (
                <li key={c.slug} className="flex justify-between">
                  <Link href={`/wiki/category/${c.slug}`} className="hover:text-accent">
                    {c.name}
                  </Link>
                  <span className="text-muted">{c.pages.length}</span>
                </li>
              ))}
            </ul>
          </div>
          {recent.length > 0 && (
            <div className="rounded-xl border border-line bg-panel p-4">
              <h2 className="mb-2 font-semibold">Recently edited</h2>
              <ul className="space-y-2 text-sm">
                {recent.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/wiki/${p.slug}`} className="hover:text-accent">
                      {p.title}
                    </Link>
                    <span className="block text-xs text-muted">{formatWikiDate(p.updated)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
