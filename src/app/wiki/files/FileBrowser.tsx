"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// One entry of public/wiki-files/index.json:
// [name, path, width, height, bytes, uploaded, usedOn (page slugs) | 0, description HTML?]
type Entry = [string, string, number, number, number, string, (string[] | 0)?, string?];

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const PAGE = 240;
const WIKI = "https://wiki.aa-classic.com";

function formatBytes(n: number): string {
  return n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(2)} MB`;
}

function setParam(key: string, value: string | null) {
  const url = new URL(window.location.href);
  if (value) url.searchParams.set(key, value);
  else url.searchParams.delete(key);
  window.history.replaceState(null, "", url);
}

function FileDetail({ file, titles, onClose }: { file: Entry; titles: Record<string, string>; onClose: () => void }) {
  const [name, src, width, height, bytes, uploaded, usedOn, description] = file;
  const small = Math.max(width, height) <= 128;
  return (
    <div className="mb-8 grid gap-6 rounded-xl border border-accent/40 bg-panel p-5 md:grid-cols-[minmax(0,22rem)_1fr]">
      <div className="flex min-h-48 items-center justify-center rounded-lg bg-panel-2 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${BASE}/${src}`}
          alt={name}
          width={small ? width * 3 : undefined}
          height={small ? height * 3 : undefined}
          className="max-h-[28rem] max-w-full object-contain"
          style={small ? { imageRendering: "pixelated" } : undefined}
        />
      </div>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold break-words">{name}</h2>
          <button onClick={onClose} className="shrink-0 rounded border border-line px-2 py-1 text-sm text-muted hover:text-text">
            Close
          </button>
        </div>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-muted">Size</dt>
          <dd>
            {width} × {height} px, {formatBytes(bytes)}
          </dd>
          <dt className="text-muted">Uploaded</dt>
          <dd>{uploaded}</dd>
          <dt className="text-muted">Used on</dt>
          <dd>
            {usedOn && usedOn.length ? (
              usedOn.map((slug, i) => (
                <span key={slug}>
                  {i > 0 && ", "}
                  <Link href={`/wiki/${slug}`} className="text-accent-2 hover:underline">
                    {titles[slug] ?? slug}
                  </Link>
                </span>
              ))
            ) : (
              <span className="text-muted">No wiki pages show it</span>
            )}
          </dd>
        </dl>
        {description && <div className="prose-guide prose-wiki mt-4 text-sm" dangerouslySetInnerHTML={{ __html: description.replace(/(href|src)="\/(wiki|wiki-files)\//g, `$1="${BASE}/$2/`) }} />}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <a href={`${BASE}/${src}`} download={name} className="text-accent-2 hover:underline">
            Download
          </a>
          <a href={`${WIKI}/File:${encodeURIComponent(name.replace(/ /g, "_"))}`} className="text-accent-2 hover:underline">
            File page on the wiki
          </a>
        </div>
      </div>
    </div>
  );
}

export default function FileBrowser({ titles }: { titles: Record<string, string> }) {
  const [files, setFiles] = useState<Entry[] | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"name" | "newest" | "largest">("name");
  const [usedOnly, setUsedOnly] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q") ?? "");
    setSelected(params.get("f"));
    fetch(`${BASE}/wiki-files/index.json`)
      .then((r) => r.json())
      .then(setFiles)
      .catch(() => setError(true));
  }, []);

  useEffect(() => setShown(PAGE), [query, sort, usedOnly]);

  const filtered = useMemo(() => {
    if (!files) return [];
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const list = files.filter((f) => (!usedOnly || (f[6] && f[6].length)) && terms.every((t) => f[0].toLowerCase().includes(t)));
    if (sort === "newest") list.sort((a, b) => b[5].localeCompare(a[5]) || a[0].localeCompare(b[0]));
    else if (sort === "largest") list.sort((a, b) => b[2] * b[3] - a[2] * a[3] || b[4] - a[4]);
    return list;
  }, [files, query, sort, usedOnly]);

  const current = selected && files ? files.find((f) => f[0] === selected) : undefined;
  const select = (name: string | null) => {
    setSelected(name);
    setParam("f", name);
    if (name) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      {current && <FileDetail file={current} titles={titles} onClose={() => select(null)} />}
      {selected && files && !current && (
        <p className="mb-6 rounded-lg border border-line bg-panel p-4 text-sm text-muted">No file named “{selected}” in the mirror.</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setParam("q", e.target.value || null);
          }}
          placeholder="Search files by name: Ayanad, glider, crest…"
          className="min-w-0 flex-1 rounded-xl border border-line bg-panel px-4 py-3 outline-none placeholder:text-muted focus:border-accent"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="rounded-lg border border-line bg-panel px-3 py-3 text-sm"
        >
          <option value="name">A to Z</option>
          <option value="newest">Newest first</option>
          <option value="largest">Largest first</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={usedOnly} onChange={(e) => setUsedOnly(e.target.checked)} />
          Used on pages
        </label>
      </div>

      <p className="mt-3 text-sm text-muted">
        {error
          ? "Couldn't load the file list."
          : files
            ? `${filtered.length.toLocaleString()} of ${files.length.toLocaleString()} files`
            : "Loading the file list…"}
      </p>

      <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-3">
        {filtered.slice(0, shown).map((f) => (
          <li key={f[0]}>
            <button
              onClick={() => select(f[0])}
              className={`flex h-full w-full flex-col items-center gap-2 rounded-lg border bg-panel p-3 text-center transition hover:border-accent ${
                f[0] === selected ? "border-accent" : "border-line"
              }`}
            >
              <span className="flex h-16 w-full items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${BASE}/${f[1]}`} alt="" loading="lazy" className="max-h-16 max-w-full object-contain" />
              </span>
              <span className="line-clamp-2 text-xs break-all text-muted">{f[0]}</span>
            </button>
          </li>
        ))}
      </ul>

      {filtered.length > shown && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShown((n) => n + PAGE)}
            className="rounded-lg border border-line bg-panel px-4 py-2 text-sm hover:border-accent"
          >
            Show more ({(filtered.length - shown).toLocaleString()} left)
          </button>
        </div>
      )}
    </div>
  );
}
