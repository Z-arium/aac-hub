"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { CATEGORY_LABEL, CATEGORY_STYLE, useNow } from "@/components/UpcomingTimers";
import { DEFAULT_PINNED, TASKS } from "@/data/checklist";
import { DATABASE, TOOLS } from "@/data/tools";
import { SAVED_BUILDS_KEY, type SavedBuild } from "@/lib/builds";
import { DEFAULT_PINNED_TOOLS, PINNED_TOOLS_KEY, useSavedPages } from "@/lib/saved";
import { useSynced } from "@/lib/sync";
import { dailyResetKey, formatCountdown, formatLocal, upcoming } from "@/lib/time";

const ALL_TOOLS = [...TOOLS, ...DATABASE];
const card = "rounded-xl border border-line bg-panel";
const cardHead = "flex items-center justify-between gap-3 border-b border-line px-4 py-3";
const link = "text-sm text-accent-2 hover:underline";

const list = <T,>(v: unknown) => (Array.isArray(v) ? (v as T[]) : []);

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-4 py-6 text-sm text-muted">{children}</p>;
}

function PinnedTools() {
  const [stored, setPinned] = useSynced<string[]>(PINNED_TOOLS_KEY, DEFAULT_PINNED_TOOLS);
  const pinned = list<string>(stored);
  const [editing, setEditing] = useState(false);
  const shown = editing ? ALL_TOOLS : ALL_TOOLS.filter((t) => pinned.includes(t.href));
  const toggle = (href: string) => setPinned(pinned.includes(href) ? pinned.filter((h) => h !== href) : [...pinned, href]);

  return (
    <section className={`${card} lg:col-span-2`}>
      <div className={cardHead}>
        <h2 className="font-semibold">Pinned tools</h2>
        <button className={link} onClick={() => setEditing(!editing)}>
          {editing ? "Done" : "Edit"}
        </button>
      </div>
      {shown.length === 0 ? (
        <Empty>Nothing pinned. Click Edit to pick your tools.</Empty>
      ) : (
        <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((t) =>
            editing ? (
              <label key={t.href} className="flex cursor-pointer items-center gap-2 rounded-lg border border-line p-3 text-sm hover:bg-panel-2">
                <input type="checkbox" className="accent-[var(--accent)]" checked={pinned.includes(t.href)} onChange={() => toggle(t.href)} />
                <span aria-hidden>{t.icon}</span>
                {t.name}
              </label>
            ) : (
              <Link key={t.href} href={t.href} className="flex items-center gap-2 rounded-lg border border-line p-3 text-sm hover:border-accent/50 hover:bg-panel-2">
                <span aria-hidden className="text-lg">
                  {t.icon}
                </span>
                {t.name}
              </Link>
            ),
          )}
        </div>
      )}
    </section>
  );
}

function TodaysChecklist({ now }: { now: number | null }) {
  const [done] = useSynced<string[]>(now ? `aac-daily-${dailyResetKey(now)}` : null, []);
  const [settings] = useSynced<{ pinned?: string[] }>("aac-checklist", { pinned: DEFAULT_PINNED });
  const pinned = list<string>(settings?.pinned ?? DEFAULT_PINNED);
  const daily = TASKS.filter((t) => t.resetDay === undefined && pinned.includes(t.id));
  const count = daily.filter((t) => list<string>(done).includes(t.id)).length;
  const left = daily.filter((t) => !list<string>(done).includes(t.id)).slice(0, 5);

  return (
    <section className={card}>
      <div className={cardHead}>
        <h2 className="font-semibold">Today&apos;s checklist</h2>
        <Link href="/tools/checklist" className={link}>
          Open checklist
        </Link>
      </div>
      <div className="px-4 py-3">
        <p className="mb-2 text-sm">
          <span className="text-2xl font-bold text-accent">{count}</span>
          <span className="text-muted"> of {daily.length} dailies done</span>
        </p>
        <div className="h-2 overflow-hidden rounded-full bg-panel-2">
          <div className="h-2 rounded-full bg-accent" style={{ width: `${daily.length ? (count / daily.length) * 100 : 0}%` }} />
        </div>
        {left.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-muted">
            {left.map((t) => (
              <li key={t.id}>○ {t.label}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function MyTimers({ now }: { now: number | null }) {
  const [settings] = useSynced<{ muted?: string[] }>("aac-timer-alerts", { muted: [] });
  const muted = list<string>(settings?.muted);
  const next = now ? upcoming(now).filter(({ event }) => !muted.includes(event.id)).slice(0, 5) : [];

  return (
    <section className={card}>
      <div className={cardHead}>
        <h2 className="font-semibold">Your timers</h2>
        <Link href="/timers" className={link}>
          All timers
        </Link>
      </div>
      <ul className="divide-y divide-line">
        {next.map(({ event, at }) => (
          <li key={event.id} className="flex items-center gap-3 px-4 py-2.5">
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${CATEGORY_STYLE[event.category]}`}>{CATEGORY_LABEL[event.category]}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{event.name}</p>
              <p className="text-xs text-muted">{formatLocal(at)}</p>
            </div>
            <span className="font-mono text-sm tabular-nums text-accent">{formatCountdown(at - now!)}</span>
          </li>
        ))}
      </ul>
      {muted.length > 0 && <p className="border-t border-line px-4 py-2 text-xs text-muted">Hiding {muted.length} muted on the timers page.</p>}
    </section>
  );
}

function SavedPages() {
  const { pages, toggle } = useSavedPages();
  return (
    <section className={card}>
      <div className={cardHead}>
        <h2 className="font-semibold">Saved guides and wiki pages</h2>
      </div>
      {pages.length === 0 ? (
        <Empty>Press ☆ Save on any guide or wiki page and it shows up here.</Empty>
      ) : (
        <ul className="divide-y divide-line">
          {pages.map((p) => (
            <li key={p.href} className="flex items-center gap-3 px-4 py-2.5">
              <span className="w-10 shrink-0 text-xs text-muted">{p.kind === "guide" ? "Guide" : "Wiki"}</span>
              <Link href={p.href} className="min-w-0 flex-1 truncate text-sm hover:text-accent">
                {p.title}
              </Link>
              <button className="text-sm text-muted hover:text-text" title="Remove" aria-label={`Remove ${p.title}`} onClick={() => toggle(p)}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SavedBuilds() {
  const [stored] = useSynced<SavedBuild[]>(SAVED_BUILDS_KEY, []);
  const builds = list<SavedBuild>(stored);
  return (
    <section className={card}>
      <div className={cardHead}>
        <h2 className="font-semibold">Saved builds</h2>
        <Link href="/tools/class-builder" className={link}>
          Class builder
        </Link>
      </div>
      {builds.length === 0 ? (
        <Empty>Builds you save in the class builder show up here.</Empty>
      ) : (
        <ul className="divide-y divide-line">
          {builds.map((b) => (
            <li key={b.id}>
              <Link href={`/tools/class-builder?${b.query}`} className="block px-4 py-2.5 hover:bg-panel-2">
                <p className="text-sm font-medium">{b.name}</p>
                {b.className && b.className !== b.name && <p className="text-xs text-muted">{b.className}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function MyHub() {
  const now = useNow(30_000);
  const { enabled, user } = useAuth();
  return (
    <div className="space-y-6">
      {enabled && user === null && (
        <p className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
          Your hub is saved in this browser.{" "}
          <Link href="/account" className="font-semibold text-accent hover:underline">
            Sign in
          </Link>{" "}
          to keep it on every device.
        </p>
      )}
      {user && (
        <p className="text-sm text-muted">
          Signed in.{" "}
          <Link href="/account" className="text-accent-2 hover:underline">
            Profile and account settings
          </Link>
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <PinnedTools />
        <TodaysChecklist now={now} />
        <MyTimers now={now} />
        <SavedPages />
        <SavedBuilds />
      </div>
    </div>
  );
}
