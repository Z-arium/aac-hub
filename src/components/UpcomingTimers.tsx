"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCountdown, formatLocal, upcoming } from "@/lib/time";

const CATEGORY_STYLE: Record<string, string> = {
  "world-boss": "bg-red-500/15 text-red-300",
  pvp: "bg-orange-500/15 text-orange-300",
  pve: "bg-emerald-500/15 text-emerald-300",
  commerce: "bg-yellow-500/15 text-yellow-300",
};

const CATEGORY_LABEL: Record<string, string> = {
  "world-boss": "Boss",
  pvp: "PvP",
  pve: "PvE",
  commerce: "Trade",
};

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export default function UpcomingTimers({ limit = 6 }: { limit?: number }) {
  const now = useNow();
  return (
    <div className="rounded-xl border border-line bg-panel">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="font-semibold">Coming up</h2>
        <Link href="/timers" className="text-sm text-accent-2 hover:underline">
          All timers
        </Link>
      </div>
      <ul className="divide-y divide-line">
        {now === null
          ? Array.from({ length: limit }).map((_, i) => <li key={i} className="h-14 animate-pulse" />)
          : upcoming(now)
              .slice(0, limit)
              .map(({ event, at }) => (
                <li key={event.id} className="flex items-center gap-3 px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${CATEGORY_STYLE[event.category]}`}>
                    {CATEGORY_LABEL[event.category]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{event.name}</p>
                    <p className="text-xs text-muted">{formatLocal(at)} your time</p>
                  </div>
                  <span className="font-mono text-sm tabular-nums text-accent">{formatCountdown(at - now)}</span>
                </li>
              ))}
      </ul>
    </div>
  );
}

export { CATEGORY_LABEL, CATEGORY_STYLE };
