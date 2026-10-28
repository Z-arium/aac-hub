"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { type SearchItem, searchItems } from "@/lib/search";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

let cached: Promise<SearchItem[]> | null = null;
function loadIndex() {
  cached ??= fetch(`${BASE}/search-index.json`)
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => {
      cached = null;
      return [];
    });
  return cached;
}

const SUGGESTED = ["Timers", "Daily & weekly checklist", "Class builder", "Regrade calculator", "World bosses"];

export default function SearchPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [cursor, setCursor] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !isTyping(e.target))) {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    loadIndex().then(setItems);
    input.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const results = useMemo(() => {
    if (query.trim()) return searchItems(items, query);
    return SUGGESTED.map((t) => items.find((i) => i.t === t)).filter((i): i is SearchItem => !!i);
  }, [items, query]);

  function close() {
    setOpen(false);
    setQuery("");
    setCursor(0);
  }

  function go(item: SearchItem | undefined) {
    if (!item) return;
    close();
    router.push(item.h);
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter") go(results[cursor]);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Search the site"
        className="flex h-9 items-center gap-2 rounded-md border border-line bg-panel px-2.5 text-sm text-muted hover:text-text lg:w-56"
      >
        <SearchIcon />
        <span className="hidden lg:inline">Search…</span>
        <kbd className="ml-auto hidden rounded border border-line px-1.5 text-[10px] lg:inline">Ctrl K</kbd>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[12vh]" onMouseDown={close}>
          <div
            role="dialog"
            aria-label="Search"
            className="w-full max-w-xl overflow-hidden rounded-xl border border-line bg-panel shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <SearchIcon />
              <input
                ref={input}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCursor(0);
                }}
                onKeyDown={onInputKey}
                placeholder="Search guides, tools, timers and the wiki"
                className="h-12 flex-1 bg-transparent outline-none placeholder:text-muted"
              />
              <kbd className="rounded border border-line px-1.5 text-[10px] text-muted">Esc</kbd>
            </div>
            <ul className="max-h-[60vh] overflow-y-auto p-2">
              {!query.trim() && results.length > 0 && <li className="px-3 py-1 text-xs uppercase text-muted">Popular</li>}
              {results.map((r, i) => (
                <li key={`${r.k}${r.h}${r.t}`}>
                  <button
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => go(r)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left ${i === cursor ? "bg-panel-2" : ""}`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{r.t}</span>
                      {r.d && <span className="block truncate text-xs text-muted">{r.d}</span>}
                    </span>
                    <span className="shrink-0 rounded bg-panel-2 px-2 py-0.5 text-xs text-muted">{r.k}</span>
                  </button>
                </li>
              ))}
              {query.trim() && results.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-muted">
                  {items.length ? `Nothing found for "${query}".` : "Loading…"}
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}
