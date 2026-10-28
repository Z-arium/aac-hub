"use client";

import { useEffect, useState } from "react";
import { useNow } from "@/components/UpcomingTimers";
import { serverWallToUtc } from "@/lib/time";
import { SERVER_TZ, WEEKDAY_NAMES, WEEKLY_TOKEN_EVENTS } from "@/data/schedule";

interface Task {
  id: string;
  label: string;
  note?: string;
  /** Weekly tasks reset on their own day (server time). */
  resetDay?: number;
}

const DAILY: Task[] = [
  { id: "aaa", label: "Active Adventurers Appreciated", note: "Daily merit quest, unlocked after quest 99.1" },
  { id: "sign", label: "Sign Quests in Golden Ruins", note: "Daily kill quests" },
  { id: "library", label: "Ayanad Library dailies and bosses" },
  { id: "cr", label: "Crimson Rift", note: "1000 Honor, 10 Leadership" },
  { id: "gr", label: "Grimgast Rift" },
  { id: "halcyona", label: "Halcyona War" },
  { id: "mistmerrow", label: "Mistmerrow" },
  { id: "luscas", label: "Luscas" },
  { id: "labor", label: "Spend labor before it caps" },
];

const WEEKLY: Task[] = WEEKLY_TOKEN_EVENTS.map((e) => ({
  id: e.id,
  label: `${e.name} (${WEEKDAY_NAMES[e.day]})`,
  note: `${e.tokens} Activity Tokens`,
  resetDay: e.day,
}));

// The wiki says dailies reset each day but gives no time. Midnight server time is assumed.
const DAILY_RESET_HOUR = 0;

function serverDate(ms: number) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: SERVER_TZ, year: "numeric", month: "numeric", day: "numeric", hour: "numeric", hourCycle: "h23" })
      .formatToParts(ms)
      .map((x) => [x.type, x.value]),
  );
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour };
}

/** Start of the current daily period as a key, e.g. "2026-10-27". */
function dailyKey(now: number) {
  const s = serverDate(now);
  const start = new Date(Date.UTC(s.y, s.m - 1, s.d - (s.h < DAILY_RESET_HOUR ? 1 : 0)));
  return start.toISOString().slice(0, 10);
}

/** Start of the current week for a task that resets on `resetDay`. */
function weeklyKey(now: number, resetDay: number) {
  const day = new Date(dailyKey(now) + "T00:00:00Z");
  const back = (day.getUTCDay() - resetDay + 7) % 7;
  day.setUTCDate(day.getUTCDate() - back);
  return day.toISOString().slice(0, 10);
}

function nextDailyReset(now: number) {
  const day = new Date(dailyKey(now) + "T00:00:00Z");
  day.setUTCDate(day.getUTCDate() + 1);
  return serverWallToUtc(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), DAILY_RESET_HOUR, 0);
}

function useStoredSet(key: string | null) {
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => {
    if (!key) return;
    try {
      setDone(JSON.parse(localStorage.getItem(key) ?? "[]"));
    } catch {
      setDone([]);
    }
  }, [key]);
  function toggle(id: string) {
    if (!key) return;
    const next = done.includes(id) ? done.filter((d) => d !== id) : [...done, id];
    setDone(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
  }
  return [done, toggle] as const;
}

function List({ title, tasks, done, toggle, footer }: { title: string; tasks: Task[]; done: string[]; toggle: (id: string) => void; footer?: string }) {
  const count = tasks.filter((t) => done.includes(t.id)).length;
  return (
    <section className="rounded-xl border border-line bg-panel">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="font-semibold">{title}</h2>
        <span className="text-sm text-muted">
          {count}/{tasks.length}
        </span>
      </div>
      <div className="h-1 bg-panel-2">
        <div className="h-1 bg-accent transition-all" style={{ width: `${(count / tasks.length) * 100}%` }} />
      </div>
      <ul className="divide-y divide-line">
        {tasks.map((t) => (
          <li key={t.id}>
            <label className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-panel-2">
              <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--accent)]" checked={done.includes(t.id)} onChange={() => toggle(t.id)} />
              <span className={done.includes(t.id) ? "text-muted line-through" : ""}>
                {t.label}
                {t.note && <span className="block text-xs text-muted no-underline">{t.note}</span>}
              </span>
            </label>
          </li>
        ))}
      </ul>
      {footer && <p className="border-t border-line px-4 py-2 text-xs text-muted">{footer}</p>}
    </section>
  );
}

export default function Checklist() {
  const now = useNow(30_000);
  const [daily, toggleDaily] = useStoredSet(now ? `aac-daily-${dailyKey(now)}` : null);
  // One store for all weekly tasks; each entry carries its own reset period.
  const [weeklyRaw, toggleWeeklyRaw] = useStoredSet(now ? "aac-weekly" : null);
  const weeklyId = (t: Task) => (now ? `${t.id}@${weeklyKey(now, t.resetDay ?? 1)}` : t.id);
  const weekly = WEEKLY.filter((t) => weeklyRaw.includes(weeklyId(t))).map((t) => t.id);
  const toggleWeekly = (id: string) => toggleWeeklyRaw(weeklyId(WEEKLY.find((t) => t.id === id)!));
  const resetIn = now ? Math.max(0, nextDailyReset(now) - now) : 0;
  const h = Math.floor(resetIn / 3_600_000);
  const m = Math.floor((resetIn % 3_600_000) / 60_000);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <List title="Daily" tasks={DAILY} done={daily} toggle={toggleDaily} footer={now ? `Resets in ${h}h ${m}m (assumed midnight server time)` : undefined} />
      <List title="Weekly" tasks={WEEKLY} done={weekly} toggle={toggleWeekly} footer="Each quest resets on the day it can be picked up" />
    </div>
  );
}
