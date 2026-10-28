"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CLASS_NAMES } from "@/data/classes";
import { SKILL_TREES } from "@/data/skillTrees";

const keyOf = (trees: string[]) => [...trees].sort().join("/");

export default function ClassBuilder() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const selected = (params.get("trees") ?? "")
    .split(",")
    .filter((t) => SKILL_TREES.some((s) => s.name === t))
    .slice(0, 3);

  function setSelected(next: string[]) {
    const qs = next.length ? `?trees=${next.join(",")}` : "";
    router.replace(`${pathname}${qs}`, { scroll: false });
  }

  function toggle(name: string) {
    if (selected.includes(name)) setSelected(selected.filter((t) => t !== name));
    else if (selected.length < 3) setSelected([...selected, name]);
  }

  const className = selected.length === 3 ? CLASS_NAMES[keyOf(selected)] : null;

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return Object.entries(CLASS_NAMES)
      .filter(([k, v]) => v.toLowerCase().includes(q) || k.toLowerCase().includes(q))
      .slice(0, 12);
  }, [query]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-line bg-panel p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase text-muted">Your class</p>
            <p className="text-3xl font-bold text-accent">
              {className ?? (selected.length === 3 ? "Unknown" : `Pick ${3 - selected.length} more`)}
            </p>
            <p className="text-sm text-muted">{selected.length ? selected.join(" · ") : "No trees picked yet"}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSelected([])} className="rounded-lg border border-line px-3 py-2 text-sm hover:border-muted">
              Clear
            </button>
            <button
              onClick={copyLink}
              disabled={selected.length === 0}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg disabled:opacity-40"
            >
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>
        <div className="relative mt-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a class, e.g. Darkrunner"
            className="w-full rounded border border-line bg-panel-2 px-3 py-2"
          />
          {matches.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-line bg-panel-2 shadow-lg">
              {matches.map(([k, v]) => (
                <li key={k}>
                  <button
                    onClick={() => {
                      setSelected(k.split("/"));
                      setQuery("");
                    }}
                    className="flex w-full justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-panel"
                  >
                    <span className="font-medium">{v}</span>
                    <span className="text-muted">{k.replaceAll("/", " · ")}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {(["Primary", "Secondary"] as const).map((kind) => (
        <section key={kind}>
          <h2 className="mb-3 text-lg font-semibold">{kind} trees</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SKILL_TREES.filter((t) => t.kind === kind).map((t) => {
              const on = selected.includes(t.name);
              const disabled = !on && selected.length >= 3;
              return (
                <button
                  key={t.name}
                  onClick={() => toggle(t.name)}
                  disabled={disabled}
                  className={`flex flex-col rounded-xl border bg-panel p-4 text-left transition disabled:opacity-40 ${
                    on ? "border-accent bg-accent/5" : "border-line hover:border-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: t.color }} />
                    <h3 className="font-semibold">{t.name}</h3>
                    {on && <span className="ml-auto text-xs text-accent">Picked</span>}
                  </div>
                  <p className="mt-1 text-sm text-muted">{t.summary}</p>
                  {on && (
                    <ul className="mt-3 space-y-1 text-sm">
                      {t.keySkills.map((s) => (
                        <li key={s.name}>
                          <span className="font-medium">{s.name}</span> <span className="text-muted">· {s.note}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
