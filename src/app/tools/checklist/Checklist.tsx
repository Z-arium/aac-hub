"use client";

import Link from "next/link";
import { useState } from "react";
import { useNow } from "@/components/UpcomingTimers";
import { dailyResetKey, formatCountdown, formatLocal, nextDailyReset, nextOccurrence } from "@/lib/time";
import { useSynced } from "@/lib/sync";
import { CATEGORIES, DEFAULT_PINNED, TASKS, type ChecklistTask } from "@/data/checklist";
import { EVENTS, WEEKDAY_NAMES } from "@/data/schedule";

interface Settings {
  pinned: string[];
  hidden: string[];
  hiddenCategories: string[];
}

const DEFAULT_SETTINGS: Settings = { pinned: DEFAULT_PINNED, hidden: [], hiddenCategories: [] };

/** Start of the current week for a task that resets on `resetDay` (UTC day). */
function weeklyKey(now: number, resetDay: number) {
  const day = new Date(dailyResetKey(now) + "T00:00:00Z");
  const back = (day.getUTCDay() - resetDay + 7) % 7;
  day.setUTCDate(day.getUTCDate() - back);
  return day.toISOString().slice(0, 10);
}

/**
 * When the task's scheduled event starts: the one running now if it lingers
 * (upFor), otherwise the next one. Null for tasks without a schedule.
 */
function nextStart(task: ChecklistTask, now: number | null) {
  if (!now || !task.events) return null;
  const from = now - (task.upFor ?? 0) * 3_600_000;
  const times = EVENTS.filter((e) => task.events!.includes(e.id)).map((e) => nextOccurrence(e, from).at);
  return times.length ? Math.min(...times) : null;
}

/** Why a task can't be done today, or null if it can. */
function unavailableReason(task: ChecklistTask, now: number | null) {
  if (!now) return null;
  if (task.resetDay !== undefined) {
    const today = new Date(dailyResetKey(now) + "T00:00:00Z").getUTCDay();
    if (today !== task.resetDay) return `${WEEKDAY_NAMES[task.resetDay]} pickup`;
  }
  const at = nextStart(task, now);
  if (at && at >= nextDailyReset(now)) return "Not today";
  return null;
}

const GROUPS = [
  { id: "anytime", name: "Do anytime", blurb: "" },
  { id: "timed", name: "Timed", blurb: "Next up first. Rifts pop every 4 hours, watch faction chat" },
  { id: "unavailable", name: "Not available today", blurb: "Weekly quests you already have can still be finished" },
] as const;

/** The tasks of one "Your day" group, in the order to do them. */
function groupTasks(group: (typeof GROUPS)[number]["id"], tasks: ChecklistTask[], now: number | null, isDone: (t: ChecklistTask) => boolean) {
  const off = (t: ChecklistTask) => !isDone(t) && unavailableReason(t, now) !== null;
  if (group === "unavailable") return tasks.filter(off);
  const open = tasks.filter((t) => !off(t));
  if (group === "anytime") return open.filter((t) => t.phase === "start" || t.phase === "anytime");
  // Scheduled events by start time (running ones first), then the rifts.
  const scheduled = open.filter((t) => t.phase === "scheduled").sort((a, b) => (nextStart(a, now) ?? Infinity) - (nextStart(b, now) ?? Infinity));
  return [...scheduled, ...open.filter((t) => t.phase === "rifts")];
}

function toggleIn(list: string[], id: string) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

function useProgress(now: number | null) {
  const [daily, setDaily] = useSynced<string[]>(now ? `aac-daily-${dailyResetKey(now)}` : null, []);
  // One store for all weekly tasks; each entry carries its own reset period.
  const [weekly, setWeekly] = useSynced<string[]>(now ? "aac-weekly" : null, []);
  const weeklyId = (t: ChecklistTask) => `${t.id}@${now ? weeklyKey(now, t.resetDay!) : ""}`;
  const isDone = (t: ChecklistTask) => (t.resetDay === undefined ? daily.includes(t.id) : weekly.includes(weeklyId(t)));
  function toggle(t: ChecklistTask) {
    if (!now) return;
    if (t.resetDay === undefined) setDaily(toggleIn(daily, t.id));
    // Drop entries from past weeks while we're here.
    else setWeekly(toggleIn(weekly.filter((w) => TASKS.some((x) => x.resetDay !== undefined && w === weeklyId(x))), weeklyId(t)));
  }
  return { isDone, toggle };
}

function Badges({ task }: { task: ChecklistTask }) {
  return (
    <span className="flex shrink-0 gap-1 text-xs">
      {task.gilda ? <span className="rounded bg-yellow-500/15 px-1.5 py-0.5 text-yellow-300">{task.gilda} Gilda</span> : null}
      {task.tokens ? <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-300">{task.tokens} tokens</span> : null}
      {task.resetDay !== undefined && <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-sky-300">weekly</span>}
    </span>
  );
}

function NextTime({ task, now }: { task: ChecklistTask; now: number | null }) {
  const at = nextStart(task, now);
  if (!at || !now) return null;
  return (
    <span className="text-xs text-accent-2">{at <= now ? "Up now" : `${formatLocal(at)} · in ${formatCountdown(at - now)}`}</span>
  );
}

interface RowProps {
  task: ChecklistTask;
  now: number | null;
  done: boolean;
  onToggle: () => void;
  editing: boolean;
  pinned: boolean;
  hidden: boolean;
  onPin: () => void;
  onHide: () => void;
}

function Row({ task, now, done, onToggle, editing, pinned, hidden, onPin, onHide }: RowProps) {
  const unavailable = done ? null : unavailableReason(task, now);
  return (
    <li className={`flex items-center gap-3 px-4 py-2 hover:bg-panel-2 ${hidden ? "opacity-50" : ""} ${unavailable ? "bg-red-500/5" : ""}`}>
      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3" title={task.note}>
        <input type="checkbox" className="h-4 w-4 shrink-0 accent-[var(--accent)]" checked={done} onChange={onToggle} disabled={hidden} />
        <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className={done ? "text-muted line-through" : unavailable ? "text-red-400" : ""}>{task.label}</span>
          <Badges task={task} />
          {unavailable ? <span className="text-xs text-red-400">{unavailable}</span> : !done && <NextTime task={task} now={now} />}
        </span>
      </label>
      {editing ? (
        <span className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onPin}
            title={pinned ? "Move out of Main" : "Move to Main"}
            className={`rounded border border-line px-2 py-0.5 text-xs ${pinned ? "bg-accent/20 text-accent" : "text-muted hover:text-text"}`}
          >
            {pinned ? "★ Main" : "☆ Main"}
          </button>
          <button type="button" onClick={onHide} className="rounded border border-line px-2 py-0.5 text-xs text-muted hover:text-text">
            {hidden ? "Show" : "Hide"}
          </button>
        </span>
      ) : (
        <span className="flex shrink-0 gap-1 text-xs">
          {task.guide && (
            <Link href={`/guides/${task.guide}`} className="rounded border border-line px-2 py-0.5 text-accent hover:bg-panel-2">
              Guide
            </Link>
          )}
          {task.wiki && (
            <Link href={`/wiki/${task.wiki}`} className="rounded border border-line px-2 py-0.5 text-accent-2 hover:bg-panel-2">
              Wiki
            </Link>
          )}
        </span>
      )}
    </li>
  );
}

function Section({ title, blurb, tasks, isDone, children }: { title: string; blurb?: string; tasks: ChecklistTask[]; isDone: (t: ChecklistTask) => boolean; children: React.ReactNode }) {
  const count = tasks.filter(isDone).length;
  return (
    <section className="rounded-xl border border-line bg-panel">
      <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {blurb && <p className="text-xs text-muted">{blurb}</p>}
        </div>
        <span className="shrink-0 text-sm text-muted">
          {count}/{tasks.length}
        </span>
      </div>
      <div className="h-1 bg-panel-2">
        <div className="h-1 bg-accent transition-all" style={{ width: `${tasks.length ? (count / tasks.length) * 100 : 0}%` }} />
      </div>
      {children}
    </section>
  );
}

export default function Checklist() {
  const now = useNow(30_000);
  const { isDone, toggle } = useProgress(now);
  const [settings, setSettings] = useSynced<Settings>("aac-checklist", DEFAULT_SETTINGS);
  const [editing, setEditing] = useState(false);
  const { pinned, hidden, hiddenCategories } = { ...DEFAULT_SETTINGS, ...settings };

  const update = (patch: Partial<Settings>) => setSettings({ pinned, hidden, hiddenCategories, ...patch });
  const shown = (t: ChecklistTask) => editing || !hidden.includes(t.id);
  const main = TASKS.filter((t) => pinned.includes(t.id) && shown(t));
  const mainActive = main.filter((t) => !hidden.includes(t.id));
  const mainDone = mainActive.length > 0 && mainActive.every(isDone);
  const extras = CATEGORIES.filter((c) => editing || !hiddenCategories.includes(c.id))
    .map((c) => ({ ...c, tasks: TASKS.filter((t) => t.category === c.id && !pinned.includes(t.id) && shown(t)) }))
    .filter((c) => c.tasks.length);

  const visibleDaily = TASKS.filter((t) => t.resetDay === undefined && !hidden.includes(t.id) && (pinned.includes(t.id) || !hiddenCategories.includes(t.category)));
  const gildaTotal = visibleDaily.reduce((n, t) => n + (t.gilda ?? 0), 0);
  const gildaDone = visibleDaily.filter(isDone).reduce((n, t) => n + (t.gilda ?? 0), 0);

  const resetIn = now ? Math.max(0, nextDailyReset(now) - now) : 0;
  const h = Math.floor(resetIn / 3_600_000);
  const m = Math.floor((resetIn % 3_600_000) / 60_000);

  const row = (t: ChecklistTask) => (
    <Row
      key={t.id}
      task={t}
      now={now}
      done={isDone(t)}
      onToggle={() => toggle(t)}
      editing={editing}
      pinned={pinned.includes(t.id)}
      hidden={hidden.includes(t.id)}
      onPin={() => update({ pinned: toggleIn(pinned, t.id) })}
      onHide={() => update({ hidden: toggleIn(hidden, t.id) })}
    />
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-line bg-panel px-4 py-3 text-sm">
        <span>{now ? `Daily reset in ${h}h ${m}m (midnight UTC)` : " "}</span>
        {gildaTotal > 0 && (
          <span className="text-yellow-300">
            Gilda Stars today: {gildaDone}/{gildaTotal}
          </span>
        )}
        <button
          type="button"
          onClick={() => setEditing(!editing)}
          className={`ml-auto rounded-lg border px-3 py-1.5 font-medium ${editing ? "border-accent bg-accent text-bg" : "border-line hover:bg-panel-2"}`}
        >
          {editing ? "Done" : "Customize"}
        </button>
      </div>

      {editing && (
        <div className="rounded-xl border border-accent/40 bg-panel p-4 text-sm">
          <p className="mb-3 text-muted">
            Pick the categories you want to see. On each task, <b className="text-text">★ Main</b> moves it to your main list at the top and{" "}
            <b className="text-text">Hide</b> takes it off your list. Your choices are saved to your account when you are signed in.
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const on = !hiddenCategories.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => update({ hiddenCategories: toggleIn(hiddenCategories, c.id) })}
                  className={`rounded-full border px-3 py-1 ${on ? "border-accent-2 bg-accent-2/15 text-accent-2" : "border-line text-muted line-through"}`}
                >
                  {c.name}
                </button>
              );
            })}
            <button type="button" onClick={() => setSettings(DEFAULT_SETTINGS)} className="ml-auto rounded-full border border-line px-3 py-1 text-muted hover:text-text">
              Reset to defaults
            </button>
          </div>
        </div>
      )}

      <Section title="Your day" tasks={mainActive} isDone={isDone}>
        {main.length ? (
          GROUPS.map((g, i) => {
            const tasks = groupTasks(g.id, main, now, isDone);
            if (!tasks.length) return null;
            return (
              <div key={g.id}>
                <div className={`border-b border-line px-4 py-1.5 ${g.id === "unavailable" ? "bg-red-500/10" : "bg-panel-2/60"}`}>
                  <span className={`text-xs font-semibold uppercase tracking-wide ${g.id === "unavailable" ? "text-red-400" : "text-accent"}`}>
                    {i + 1}. {g.name}
                  </span>
                  {g.blurb && <span className="ml-2 text-xs text-muted">{g.blurb}</span>}
                </div>
                <ul className="divide-y divide-line border-b border-line last:border-b-0">{tasks.map(row)}</ul>
              </div>
            );
          })
        ) : (
          <p className="px-4 py-6 text-sm text-muted">Nothing here yet. Press Customize and star the tasks you never want to miss.</p>
        )}
        {mainDone && <p className="border-t border-line bg-accent/10 px-4 py-3 text-sm text-accent">Main list done. Pick up some extras below.</p>}
      </Section>

      {extras.length > 0 && (
        <>
          <div>
            <h2 className="text-lg font-semibold">Extras</h2>
            <p className="text-xs text-muted">Gilda, PvP, bosses and more once your day is done. Tap a group to open it.</p>
          </div>
          <div className="space-y-2">
            {extras.map((c) => {
              const active = c.tasks.filter((t) => !hidden.includes(t.id));
              const count = active.filter(isDone).length;
              return (
                <details key={c.id} open={editing} className={`group rounded-xl border border-line bg-panel ${editing && hiddenCategories.includes(c.id) ? "opacity-50" : ""}`}>
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 hover:bg-panel-2 [&::-webkit-details-marker]:hidden">
                    <span className="text-muted transition-transform group-open:rotate-90">▸</span>
                    <span className="font-semibold">{c.name}</span>
                    <span className="hidden truncate text-xs text-muted sm:inline">{c.blurb}</span>
                    <span className="ml-auto shrink-0 text-sm text-muted">
                      {count}/{active.length}
                    </span>
                  </summary>
                  <ul className="divide-y divide-line border-t border-line">{c.tasks.map(row)}</ul>
                </details>
              );
            })}
          </div>
        </>
      )}

      <p className="text-xs text-muted">
        Task list based on the DailyAge addon and the AAClassic wiki. Weekly token quests reset at midnight UTC on the day you can pick them up.
      </p>
    </div>
  );
}
