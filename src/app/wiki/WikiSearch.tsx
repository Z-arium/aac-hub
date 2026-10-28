"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface Entry {
  s: string; // slug
  t: string; // title
  c: string; // category
  h: string[]; // headings
  x: string; // text
}

interface Hit {
  entry: Entry;
  score: number;
  snippet: string;
}

function snippet(text: string, terms: string[]): string {
  const lower = text.toLowerCase();
  const at = terms.map((t) => lower.indexOf(t)).filter((i) => i >= 0).sort((a, b) => a - b)[0];
  if (at === undefined) return text.slice(0, 160) + (text.length > 160 ? "…" : "");
  const start = Math.max(0, at - 60);
  return (start > 0 ? "…" : "") + text.slice(start, start + 180).trim() + (start + 180 < text.length ? "…" : "");
}

function search(index: Entry[], query: string): Hit[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const hits: Hit[] = [];
  for (const entry of index) {
    const title = entry.t.toLowerCase();
    const headings = entry.h.join(" ").toLowerCase();
    const text = entry.x.toLowerCase();
    let score = 0;
    let all = true;
    for (const term of terms) {
      let s = 0;
      if (title === term) s += 50;
      if (title.startsWith(term)) s += 15;
      if (title.includes(term)) s += 20;
      if (headings.includes(term)) s += 6;
      let n = 0;
      for (let i = text.indexOf(term); i >= 0 && n < 20; i = text.indexOf(term, i + term.length)) n++;
      s += Math.min(n, 20);
      if (!s) all = false;
      score += s;
    }
    if (all) hits.push({ entry, score, snippet: snippet(entry.x, terms) });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 30);
}

function Highlight({ text, query }: { text: string; query: string }) {
  const terms = query.split(/\s+/).filter(Boolean).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!terms.length) return <>{text}</>;
  const parts = text.split(new RegExp(`(${terms.join("|")})`, "gi"));
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <mark key={i} className="rounded bg-accent/25 px-0.5 text-text">{p}</mark> : p))}
    </>
  );
}

export default function WikiSearch({ autoFocus = false }: { autoFocus?: boolean }) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<Entry[] | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuery(q);
  }, []);

  useEffect(() => {
    if (!query || index) return;
    fetch("/wiki-search.json")
      .then((r) => r.json())
      .then(setIndex)
      .catch(() => setIndex([]));
  }, [query, index]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (query) url.searchParams.set("q", query);
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  }, [query]);

  const hits = useMemo(() => (index ? search(index, query) : []), [index, query]);

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus={autoFocus}
        placeholder="Search the wiki: bosses, regrade, Ayanad, labor…"
        className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-base outline-none placeholder:text-muted focus:border-accent"
      />
      {query && (
        <div className="mt-4 space-y-2">
          {!index && <p className="text-sm text-muted">Loading the index…</p>}
          {index && hits.length === 0 && <p className="text-sm text-muted">No pages match “{query}”.</p>}
          {hits.map((h) => (
            <Link
              key={h.entry.s}
              href={`/wiki/${h.entry.s}`}
              className="block rounded-lg border border-line bg-panel p-4 transition hover:border-accent"
            >
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-semibold">
                  <Highlight text={h.entry.t} query={query} />
                </span>
                <span className="text-xs text-accent">{h.entry.c}</span>
              </div>
              <p className="mt-1 text-sm text-muted">
                <Highlight text={h.snippet} query={query} />
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
