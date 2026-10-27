"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORY_LABEL, CATEGORY_STYLE, useNow } from "@/components/UpcomingTimers";
import { RIFTS, WEEKDAY_NAMES, WEEKLY_TOKEN_EVENTS, type Category } from "@/data/schedule";
import { formatCountdown, formatLocal, formatServerClock, formatSlot, upcoming } from "@/lib/time";

const FILTERS: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "world-boss", label: "World bosses" },
  { id: "pvp", label: "PvP" },
  { id: "pve", label: "PvE" },
  { id: "commerce", label: "Trade" },
];

const STORAGE_KEY = "aac-timer-alerts";

interface AlertSettings {
  enabled: boolean;
  minutesBefore: number;
  muted: string[];
}

function loadSettings(): AlertSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { enabled: false, minutesBefore: 10, muted: [] };
}

export default function TimerBoard() {
  const now = useNow();
  const [filter, setFilter] = useState<Category | "all">("all");
  const [settings, setSettings] = useState<AlertSettings>({ enabled: false, minutesBefore: 10, muted: [] });
  const fired = useRef(new Set<string>());

  useEffect(() => setSettings(loadSettings()), []);

  function save(next: AlertSettings) {
    setSettings(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }

  async function toggleAlerts() {
    if (!settings.enabled && "Notification" in window && Notification.permission !== "granted") {
      const result = await Notification.requestPermission();
      if (result !== "granted") return;
    }
    save({ ...settings, enabled: !settings.enabled });
  }

  // Fire a notification once per occurrence when it enters the alert window.
  useEffect(() => {
    if (!now || !settings.enabled || !("Notification" in window) || Notification.permission !== "granted") return;
    for (const { event, at } of upcoming(now)) {
      const key = `${event.id}:${at}`;
      const left = at - now;
      if (settings.muted.includes(event.id) || fired.current.has(key)) continue;
      if (left <= settings.minutesBefore * 60_000) {
        fired.current.add(key);
        new Notification(`${event.name} in ${Math.max(1, Math.round(left / 60_000))} min`, {
          body: event.location ?? "ArcheAge Classic",
          tag: key,
        });
      }
    }
  }, [now, settings]);

  const list = now ? upcoming(now).filter((o) => filter === "all" || o.event.category === filter) : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-panel p-4">
        <div>
          <p className="text-xs uppercase text-muted">Server time (ET)</p>
          <p className="font-mono text-lg tabular-nums">{now ? formatServerClock(now) : "--:--:--"}</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <label className="text-sm text-muted">
            Alert me{" "}
            <select
              className="rounded border border-line bg-panel-2 px-2 py-1 text-text"
              value={settings.minutesBefore}
              onChange={(e) => save({ ...settings, minutesBefore: Number(e.target.value) })}
            >
              {[5, 10, 15, 30, 60].map((m) => (
                <option key={m} value={m}>
                  {m} min
                </option>
              ))}
            </select>{" "}
            before
          </label>
          <button
            onClick={toggleAlerts}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              settings.enabled ? "bg-accent text-bg" : "border border-line bg-panel-2 hover:border-accent"
            }`}
          >
            {settings.enabled ? "🔔 Alerts on" : "🔕 Turn on alerts"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3 py-1 text-sm ${
              filter === f.id ? "bg-accent text-bg" : "border border-line text-muted hover:text-text"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {list.map(({ event, at }) => {
          const muted = settings.muted.includes(event.id);
          const soon = now !== null && at - now < 30 * 60_000;
          return (
            <div key={event.id} className={`rounded-xl border bg-panel p-4 ${soon ? "border-accent" : "border-line"}`}>
              <div className="flex items-start gap-3">
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${CATEGORY_STYLE[event.category]}`}>
                  {CATEGORY_LABEL[event.category]}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">{event.name}</h3>
                  {event.location && <p className="text-sm text-muted">{event.location}</p>}
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg tabular-nums text-accent">{now ? formatCountdown(at - now) : ""}</p>
                  <p className="text-xs text-muted">{formatLocal(at)}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
                {event.slots.map((s) => (
                  <span key={`${s.day}-${s.time}`} className="rounded bg-panel-2 px-2 py-0.5">
                    {formatSlot(s)} ET
                  </span>
                ))}
                <button
                  onClick={() =>
                    save({
                      ...settings,
                      muted: muted ? settings.muted.filter((m) => m !== event.id) : [...settings.muted, event.id],
                    })
                  }
                  className="ml-auto hover:text-text"
                  title={muted ? "Turn alerts back on for this event" : "No alerts for this event"}
                >
                  {muted ? "🔕 Muted" : "🔔"}
                </button>
              </div>
              {event.rewards && <p className="mt-2 text-xs text-muted">Rewards: {event.rewards}</p>}
            </div>
          );
        })}
      </div>

      <section>
        <h2 className="mb-1 text-xl font-bold">Weekly Activity Token quests</h2>
        <p className="mb-3 text-sm text-muted">Pick each one up on its day. You can finish it any time before it resets next week.</p>
        <div className="grid gap-3 md:grid-cols-3">
          {WEEKLY_TOKEN_EVENTS.map((e) => (
            <a key={e.name} href={e.wiki} className="rounded-xl border border-line bg-panel p-4 hover:border-accent">
              <p className="text-sm text-accent">{WEEKDAY_NAMES[e.day]}</p>
              <h3 className="font-semibold">{e.name}</h3>
              <p className="text-sm text-muted">{e.where}</p>
              <p className="mt-2 text-sm">{e.tokens} Activity Tokens</p>
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">Rifts (in-game clock)</h2>
        <p className="mb-3 text-sm text-muted">
          Rifts follow the in-game clock, where one game day lasts 4 real hours. Hover the top-right of your screen in game
          to see the game time.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {RIFTS.map((r) => (
            <div key={r.name} className="rounded-xl border border-line bg-panel p-4">
              <h3 className="font-semibold">{r.name}</h3>
              <p className="text-sm text-muted">
                Every {r.every} at {r.gameTime} game time
              </p>
              <p className="mt-2 text-xs text-muted">{r.rewards}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
