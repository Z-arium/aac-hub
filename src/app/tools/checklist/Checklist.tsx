"use client";

import Link from "next/link";
import { useState } from "react";
import { useNow } from "@/components/UpcomingTimers";
import { dailyResetKey, formatCountdown, nextDailyReset, nextOccurrence } from "@/lib/time";
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
  // Daily events always come round within a day; only rarer ones sit out.
  if (at && at - now > 86_400_000) return `Next on ${new Date(at).toLocaleDateString(undefined, { weekday: "long" })}`;
  return null;
}

const STEPS = [
  { id: "start", name: "Start your day", blurb: "Pick these up from your UI, then do them whenever you like." },
  { id: "timed", name: "Timed events", blurb: "Next up first." },
  { id: "whenever", name: "Whenever you can", blurb: "" },
] as const;

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
    <>
      {task.gilda ? <span className="text-xs text-yellow-300">{task.gilda} Gilda</span> : null}
      {task.tokens ? <span className="text-xs text-emerald-300">{task.tokens} tokens</span> : null}
    </>
  );
}

/** One short muted hint: when it's on, or why it isn't today. */
function Hint({ task, now }: { task: ChecklistTask; now: number | null }) {
  const reason = unavailableReason(task, now);
  if (reason) return <span className="text-xs text-red-400/80">{reason}</span>;
  const at = nextStart(task, now);
  if (!at || !now) return null;
  return <span className="text-xs tabular-nums text-accent-2">{at <= now ? "Up now" : `in ${formatCountdown(at - now)}`}</span>;
}

interface RowProps {
  task: ChecklistTask;
  now: number | null;
  done: boolean;
  onToggle: () => void;
  details: boolean;
  editing: boolean;
  pinned: boolean;
  hidden: boolean;
  onPin: () => void;
  onHide: () => void;
}

function Row({ task, now, done, onToggle, details, editing, pinned, hidden, onPin, onHide }: RowProps) {
  const unavailable = !done && unavailableReason(task, now) !== null;
  return (
    <li className={`group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-panel-2 ${hidden ? "opacity-50" : ""}`}>
      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
        <input type="checkbox" className="h-4 w-4 shrink-0 accent-[var(--accent)]" checked={done} onChange={onToggle} disabled={hidden} />
        <span className="min-w-0">
          <span className="flex flex-wrap items-baseline gap-x-2">
            <span className={done ? "text-muted line-through" : unavailable ? "text-red-400" : ""}>{task.label}</span>
            {!done && <Hint task={task} now={now} />}
            {details && <Badges task={task} />}
          </span>
          {details && task.note && <span className="block text-xs text-muted">{task.note}</span>}
        </span>
      </label>
      {editing ? (
        <span className="flex shrink-0 gap-1 text-xs">
          <button type="button" onClick={onPin} className={`rounded px-2 py-0.5 ${pinned ? "text-accent" : "text-muted hover:text-text"}`}>
            {pinned ? "★ Main" : "☆ Main"}
          </button>
          <button type="button" onClick={onHide} className="rounded px-2 py-0.5 text-muted hover:text-text">
            {hidden ? "Show" : "Hide"}
          </button>
        </span>
      ) : (
        <span className="flex shrink-0 gap-3 text-xs">
          {details && task.wiki && (
            <Link href={`/wiki/${task.wiki}`} className="text-muted hover:text-accent-2">
              Wiki
            </Link>
          )}
          {task.guide && (
            <Link href={`/guides/${task.guide}`} className="text-muted hover:text-accent">
              Guide
            </Link>
          )}
        </span>
      )}
    </li>
  );
}

export default function Checklist() {
  const now = useNow(1_000);
  const { isDone, toggle } = useProgress(now);
  const [settings, setSettings] = useSynced<Settings>("aac-checklist", DEFAULT_SETTINGS);
  const [editing, setEditing] = useState(false);
  const [details, setDetails] = useState(false);
  const { pinned, hidden, hiddenCategories } = { ...DEFAULT_SETTINGS, ...settings };

  const update = (patch: Partial<Settings>) => setSettings({ pinned, hidden, hiddenCategories, ...patch });
  const shown = (t: ChecklistTask) => editing || !hidden.includes(t.id);
  const listed = (t: ChecklistTask) => pinned.includes(t.id) || (!!t.events && !hiddenCategories.includes(t.category));
  const off = (t: ChecklistTask) => !isDone(t) && unavailableReason(t, now) !== null;
  const steps: Record<(typeof STEPS)[number]["id"], ChecklistTask[]> = {
    start: TASKS.filter((t) => pinned.includes(t.id) && shown(t) && t.phase === "start"),
    // Every timed event, soonest (or already running) first.
    timed: TASKS.filter((t) => t.events && listed(t) && shown(t) && !off(t)).sort((a, b) => (nextStart(a, now) ?? Infinity) - (nextStart(b, now) ?? Infinity)),
    whenever: TASKS.filter((t) => pinned.includes(t.id) && shown(t) && !t.events && t.phase !== "start" && !off(t)),
  };
  const notToday = TASKS.filter((t) => listed(t) && shown(t) && off(t));
  const extras = CATEGORIES.filter((c) => editing || !hiddenCategories.includes(c.id))
    .map((c) => ({ ...c, tasks: TASKS.filter((t) => t.category === c.id && !pinned.includes(t.id) && !t.events && shown(t)) }))
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
      details={details || editing}
      editing={editing}
      pinned={pinned.includes(t.id)}
      hidden={hidden.includes(t.id)}
      onPin={() => update({ pinned: toggleIn(pinned, t.id) })}
      onHide={() => update({ hidden: toggleIn(hidden, t.id) })}
    />
  );

  const toggleBtn = (on: boolean, set: (v: boolean) => void, label: string) => (
    <button type="button" onClick={() => set(!on)} className={on ? "text-accent" : "hover:text-text"}>
      {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
        <span>{now ? `Resets in ${h}h ${m}m` : " "}</span>
        <span className="ml-auto flex gap-4">
          {toggleBtn(details, setDetails, "Details")}
          {toggleBtn(editing, setEditing, editing ? "Done" : "Customize")}
        </span>
      </div>

      {(details || editing) && gildaTotal > 0 && (
        <p className="text-sm text-yellow-300">
          Gilda Stars today: {gildaDone}/{gildaTotal}
        </p>
      )}

      {editing && (
        <div className="rounded-xl border border-line p-4 text-sm">
          <p className="mb-3 text-muted">
            Pick the categories you want to see. <b className="text-text">★ Main</b> moves a task into steps 1 to 3 and <b className="text-text">Hide</b> takes it off
            your list. Saved to your account when you are signed in.
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const on = !hiddenCategories.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => update({ hiddenCategories: toggleIn(hiddenCategories, c.id) })}
                  className={`rounded-full border px-3 py-1 ${on ? "border-accent-2 text-accent-2" : "border-line text-muted line-through"}`}
                >
                  {c.name}
                </button>
              );
            })}
            <button type="button" onClick={() => setSettings(DEFAULT_SETTINGS)} className="ml-auto px-3 py-1 text-muted hover:text-text">
              Reset to defaults
            </button>
          </div>
        </div>
      )}

      {STEPS.map((step, i) => {
        const tasks = steps[step.id];
        const last = i === STEPS.length - 1;
        if (!tasks.length && !(last && notToday.length)) return null;
        return (
          <section key={step.id}>
            <h2 className="text-lg font-semibold">
              <span className="text-accent">{i + 1}.</span> {step.name}
            </h2>
            {step.blurb && <p className="px-0 text-xs text-muted">{step.blurb}</p>}
            <ul className="mt-2">{tasks.map(row)}</ul>
            {last && notToday.length > 0 &&
              (editing ? (
                <ul className="mt-2">{notToday.map(row)}</ul>
              ) : (
                <p className="mt-3 px-2 text-xs text-red-400/80">
                  Not today: {notToday.map((t) => `${t.label} (${unavailableReason(t, now)})`).join(", ")}
                </p>
              ))}
          </section>
        );
      })}

      {extras.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">
            <span className="text-accent">{STEPS.length + 1}.</span> Extras
          </h2>
          <p className="mb-2 text-xs text-muted">Gilda Stars, PvP, bosses and more. Tap a group to open it.</p>
          {extras.map((c) => {
            const active = c.tasks.filter((t) => !hidden.includes(t.id));
            return (
              <details key={c.id} open={editing} className={`group border-t border-line ${editing && hiddenCategories.includes(c.id) ? "opacity-50" : ""}`}>
                <summary className="flex cursor-pointer list-none items-center gap-2 px-2 py-3 hover:text-accent [&::-webkit-details-marker]:hidden">
                  <span className="text-muted transition-transform group-open:rotate-90">▸</span>
                  {c.name}
                  <span className="ml-auto text-sm text-muted">
                    {active.filter(isDone).length}/{active.length}
                  </span>
                </summary>
                <ul className="pb-2">{c.tasks.map(row)}</ul>
              </details>
            );
          })}
        </section>
      )}
    </div>
  );
}
