import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";
import { getRoadmap, type RoadmapSection } from "@/lib/roadmap";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "What AA Classic Hub is building before its 1.0 launch, and what's already done.",
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
  const { intro, sections } = getRoadmap();
  const phases = sections.filter((s) => s.items.length);
  const notes = sections.filter((s) => !s.items.length);
  const all = count(phases);
  const mustHave = count(phases.map((s) => ({ ...s, items: s.items.filter((i) => i.tag === "must-have") })));

  return (
    <>
      <PageTitle title="Roadmap to 1.0" subtitle={<span dangerouslySetInnerHTML={{ __html: intro.replace(/<\/?p>/g, " ") }} />} />

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {[
          { label: "Overall", ...all },
          { label: "Must-haves for 1.0", ...mustHave },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-panel p-4">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="font-semibold">{s.label}</span>
              <span className="text-sm text-muted">
                {s.done} of {s.total} done · {Math.round((s.done / s.total) * 100)}%
              </span>
            </div>
            <Bar done={s.done} total={s.total} />
          </div>
        ))}
      </div>

      <nav className="mb-8 flex flex-wrap gap-2 text-sm">
        {phases.map((s) => {
          const c = count([s]);
          return (
            <a key={s.id} href={`#${s.id}`} className="rounded-full border border-line px-3 py-1 text-muted hover:text-text">
              {s.title} <span className={c.done === c.total ? "text-accent" : ""}>{c.done}/{c.total}</span>
            </a>
          );
        })}
      </nav>

      <div className="space-y-6">
        {phases.map((s) => {
          const c = count([s]);
          return (
            <section key={s.id} id={s.id} className="scroll-mt-20 rounded-xl border border-line bg-panel">
              <div className="border-b border-line px-4 py-3">
                <div className="mb-2 flex items-baseline justify-between gap-4">
                  <h2 className="text-lg font-semibold">
                    {s.title}
                    {c.done === c.total && <span className="ml-2 text-sm text-accent">Complete</span>}
                  </h2>
                  <span className="shrink-0 text-sm text-muted">
                    {c.done}/{c.total}
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
