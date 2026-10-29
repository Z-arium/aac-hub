import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";
import { getRoadmap, type RoadmapSection } from "@/lib/roadmap";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "What AA Classic Hub is building before its 1.0 launch, version by version, and what's already done.",
};

function count(sections: RoadmapSection[]) {
  const items = sections.flatMap((s) => s.items);
  return { done: items.filter((i) => i.done).length, total: items.length };
}

function Bar({ done, total }: { done: number; total: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-panel-2" role="progressbar" aria-valuenow={done} aria-valuemax={total}>
      <div className="h-2 rounded-full bg-accent" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
    </div>
  );
}

const TAG_STYLE = {
  "must-have": "border-accent/50 text-accent",
  suggested: "border-line text-muted",
};

export default function RoadmapPage() {
  const { intro, sections, current } = getRoadmap();
  const versions = sections.filter((s) => s.items.length);
  const notes = sections.filter((s) => !s.items.length);
  const next = versions[versions.findIndex((s) => s === current) + 1];
  const all = count(versions);
  const mustHave = count(versions.map((s) => ({ ...s, items: s.items.filter((i) => i.tag === "must-have") })));
  const status = (s: RoadmapSection) => (s === current ? "Current" : s === next ? "Next up" : null);

  return (
    <>
      <PageTitle title="Roadmap to 1.0" subtitle={<span dangerouslySetInnerHTML={{ __html: intro.replace(/<\/?p>/g, " ") }} />} />

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-accent/40 bg-panel p-4">
          <p className="text-sm text-muted">The site is at</p>
          <p className="text-3xl font-bold text-accent">v{current?.version ?? "0.0"}</p>
          {next && (
            <p className="mt-1 text-sm text-muted">
              Next:{" "}
              <a href={`#${next.id}`} className="text-text hover:underline">
                {next.version} {next.name}
              </a>{" "}
              ({count([next]).done}/{count([next]).total})
            </p>
          )}
        </div>
        {[
          { label: "Everything to 1.0", ...all },
          { label: "Must-haves for 1.0", ...mustHave },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-panel p-4">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <span className="font-semibold">{s.label}</span>
              <span className="text-sm text-muted">
                {s.done}/{s.total} · {Math.round((s.done / s.total) * 100)}%
              </span>
            </div>
            <Bar done={s.done} total={s.total} />
          </div>
        ))}
      </div>

      <nav className="mb-8 flex flex-wrap gap-2 text-sm">
        {versions.map((s) => {
          const c = count([s]);
          const finished = c.done === c.total;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`rounded-full border px-3 py-1 hover:text-text ${s === current ? "border-accent text-accent" : "border-line text-muted"}`}
            >
              {s.version ?? s.title} {finished ? "✓" : <span className="text-xs">{c.done}/{c.total}</span>}
            </a>
          );
        })}
      </nav>

      <div className="space-y-6">
        {versions.map((s) => {
          const c = count([s]);
          const label = status(s);
          return (
            <section key={s.id} id={s.id} className={`scroll-mt-20 rounded-xl border bg-panel ${s === current ? "border-accent/50" : "border-line"}`}>
              <div className="border-b border-line px-4 py-3">
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="text-lg font-semibold">
                    {s.version && <span className="mr-2 text-accent">{s.version}</span>}
                    {s.name}
                    {label && <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">{label}</span>}
                  </h2>
                  <span className="text-sm text-muted">
                    {s.released && c.done === c.total ? `Released ${s.released}` : `${c.done}/${c.total} done`}
                  </span>
                </div>
                <Bar {...c} />
                {s.intro && <div className="mt-3 text-sm text-muted" dangerouslySetInnerHTML={{ __html: s.intro }} />}
              </div>
              <ul className="divide-y divide-line">
                {s.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 px-4 py-2.5">
                    <span
                      aria-label={item.done ? "Done" : "To do"}
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${item.done ? "border-accent bg-accent text-bg" : "border-line"}`}
                    >
                      {item.done ? "✓" : ""}
                    </span>
                    <span className={item.done ? "text-muted" : ""}>
                      <span dangerouslySetInnerHTML={{ __html: item.html }} />
                      {item.tag && <span className={`ml-2 inline-block rounded border px-1.5 text-xs ${TAG_STYLE[item.tag]}`}>{item.tag}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {notes.map((s) => (
        <section key={s.id} className="prose-guide mt-10 text-sm break-words text-muted">
          <h2>{s.title}</h2>
          <div dangerouslySetInnerHTML={{ __html: s.intro }} />
        </section>
      ))}
    </>
  );
}
