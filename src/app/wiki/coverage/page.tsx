import type { Metadata } from "next";
import Link from "next/link";
import PageTitle from "@/components/PageTitle";
import { formatWikiDate, getWikiCoverage } from "@/lib/wiki";

export const metadata: Metadata = {
  title: "Wiki coverage",
  description: "Proof that the mirror holds every page and file on the AAClassic wiki.",
};

export default function WikiCoveragePage() {
  const c = getWikiCoverage();
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/wiki" className="text-sm text-accent-2 hover:underline">
        ← Wiki
      </Link>
      <div className="mt-4">
        <PageTitle
          title="Coverage"
          subtitle="Each import asks the wiki for its full list of pages, redirects and files, compares it with this mirror, and re-checks every stored file against the wiki's checksum."
        />
      </div>
      {!c ? (
        <p className="text-muted">No coverage check has run yet.</p>
      ) : (
        <div className="space-y-8">
          <div
            className={`rounded-xl border p-5 ${c.complete ? "border-accent-2/50 bg-accent-2/10" : "border-red-500/50 bg-red-500/10"}`}
          >
            <p className="text-lg font-semibold">
              {c.complete ? "Complete: nothing on the wiki is missing here." : `${c.problems.length} problems found.`}
            </p>
            <p className="mt-1 text-sm text-muted">Checked {formatWikiDate(c.checked)}.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Pages", c.totals.mirroredPages, "in every namespace"],
              ["Redirects", c.totals.mirroredRedirects, "old titles that still work"],
              ["Files", c.files.verified, `checksum-verified, ${c.files.megabytes} MB`],
            ].map(([label, n, sub]) => (
              <div key={label} className="rounded-xl border border-line bg-panel p-4">
                <p className="text-sm text-muted">{label}</p>
                <p className="text-3xl font-bold">{Number(n).toLocaleString()}</p>
                <p className="text-xs text-muted">{sub}</p>
              </div>
            ))}
          </div>

          <section>
            <h2 className="mb-3 text-lg font-semibold">By namespace</h2>
            <div className="prose-guide">
              <table>
                <thead>
                  <tr>
                    <th>Namespace</th>
                    <th>Pages on the wiki</th>
                    <th>Mirrored</th>
                    <th>Redirects on the wiki</th>
                    <th>Mirrored</th>
                  </tr>
                </thead>
                <tbody>
                  {c.namespaces.map((n) => (
                    <tr key={n.id}>
                      <td>{n.id === 6 ? "File (see files)" : n.name}</td>
                      <td>{n.wikiPages.toLocaleString()}</td>
                      <td>{n.mirrored.toLocaleString()}</td>
                      <td>{n.wikiRedirects}</td>
                      <td>{n.redirectsMirrored}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-sm text-muted">
              The wiki&apos;s own statistics say {c.statistics.pages.toLocaleString()} pages and{" "}
              {c.statistics.images.toLocaleString()} files; listing every namespace gives{" "}
              {c.totals.wikiPagesAllNamespaces.toLocaleString()} pages.
            </p>
          </section>

          {c.problems.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Problems</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {c.problems.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-lg font-semibold">Notes</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
              {c.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
            {Object.keys(c.brokenOnWiki).length > 0 && (
              <details className="mt-3 rounded-lg border border-line bg-panel p-3 text-sm">
                <summary className="cursor-pointer text-muted">Images that are broken on the wiki itself</summary>
                <ul className="mt-2 space-y-1">
                  {Object.entries(c.brokenOnWiki).map(([img, pages]) => (
                    <li key={img}>
                      {img} <span className="text-muted">on {pages.join(", ")}</span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
