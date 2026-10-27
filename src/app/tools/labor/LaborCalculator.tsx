"use client";

import { useState } from "react";
import { useNow } from "@/components/UpcomingTimers";

const PER_TICK = 40;
const TICK_MINUTES = 5;

export default function LaborCalculator() {
  const now = useNow(60_000);
  const [current, setCurrent] = useState(1000);
  const [cap, setCap] = useState(5000);
  const [hours, setHours] = useState(8);

  const missing = Math.max(0, cap - current);
  const minutesToCap = Math.ceil(missing / PER_TICK) * TICK_MINUTES;
  const after = Math.min(cap, current + Math.floor((hours * 60) / TICK_MINUTES) * PER_TICK);
  const wasted = Math.max(0, current + Math.floor((hours * 60) / TICK_MINUTES) * PER_TICK - cap);

  const input = "mt-1 w-full rounded border border-line bg-panel-2 px-3 py-2 text-text";
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 rounded-xl border border-line bg-panel p-5">
        <label className="block text-sm text-muted">
          Current labor
          <input type="number" min={0} value={current} onChange={(e) => setCurrent(Number(e.target.value))} className={input} />
        </label>
        <label className="block text-sm text-muted">
          Labor cap
          <input type="number" min={1} value={cap} onChange={(e) => setCap(Number(e.target.value))} className={input} />
          <span className="mt-1 block text-xs">Default is a guess. Set it to the max shown on your labor bar.</span>
        </label>
        <label className="block text-sm text-muted">
          Hours away
          <input type="number" min={0} value={hours} onChange={(e) => setHours(Number(e.target.value))} className={input} />
        </label>
      </div>
      <div className="space-y-3">
        <Result label="Full in" value={missing === 0 ? "Already full" : `${Math.floor(minutesToCap / 60)}h ${minutesToCap % 60}m`} sub={now && missing > 0 ? `At ${new Date(now + minutesToCap * 60_000).toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" })} your time` : undefined} />
        <Result label={`Labor after ${hours}h`} value={after.toLocaleString()} sub={wasted > 0 ? `${wasted.toLocaleString()} labor wasted at the cap` : "Nothing wasted"} />
        <Result label="Regen rate" value={`${(PER_TICK * 60) / TICK_MINUTES}/hour`} sub={`${((PER_TICK * 60 * 24) / TICK_MINUTES).toLocaleString()} per day`} />
      </div>
    </div>
  );
}

function Result({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <p className="text-xs uppercase text-muted">{label}</p>
      <p className="mt-1 font-mono text-2xl text-accent">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}
