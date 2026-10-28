"use client";

import { useState } from "react";
import { NECKLACE_PATHS, SAFE_RANK, type NecklacePath } from "@/data/necklace";

export default function NecklacePlanner() {
  const [path, setPath] = useState<NecklacePath>("Daeier");
  const [current, setCurrent] = useState(0);
  const [target, setTarget] = useState(7);
  const [have, setHave] = useState(0);

  const ranks = NECKLACE_PATHS[path];
  const to = Math.max(target, current + 1);
  const steps = ranks.filter((r) => r.rank > current && r.rank <= to);
  const medals = steps.reduce((a, r) => a + r.medals, 0);
  const wisps = steps.reduce((a, r) => a + r.wisps, 0);
  const risky = to > SAFE_RANK;

  const select = "mt-1 w-full rounded border border-line bg-panel-2 px-3 py-2 text-text";
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4 rounded-xl border border-line bg-panel p-5">
        <label className="block text-sm text-muted">
          Rank 8+ line
          <select className={select} value={path} onChange={(e) => setPath(e.target.value as NecklacePath)}>
            <option>Daeier</option>
            <option>Evernight</option>
          </select>
        </label>
        <label className="block text-sm text-muted">
          Current rank
          <select className={select} value={current} onChange={(e) => setCurrent(Number(e.target.value))}>
            <option value={0}>No necklace yet</option>
            {ranks.slice(0, -1).map((r) => (
              <option key={r.rank} value={r.rank}>
                {r.rank}: {r.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-muted">
          Target rank
          <select className={select} value={to} onChange={(e) => setTarget(Number(e.target.value))}>
            {ranks
              .filter((r) => r.rank > current)
              .map((r) => (
                <option key={r.rank} value={r.rank}>
                  {r.rank}: {r.name}
                </option>
              ))}
          </select>
        </label>
        <label className="block text-sm text-muted">
          Warrior Medals you have
          <input type="number" min={0} value={have} onChange={(e) => setHave(Number(e.target.value))} className={select} />
        </label>
      </div>

      <div className="space-y-4 lg:col-span-2">
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Warrior Medals" value={medals.toString()} sub={have >= medals ? "You have enough" : `${medals - have} more needed`} />
          <Stat label="Large Jewelry Mana Wisps" value={wisps.toString()} />
          <Stat label="Upgrades" value={steps.length.toString()} sub={risky ? "Assumes no failures past rank 7" : undefined} />
        </div>
        {risky && (
          <p className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3 text-sm text-yellow-200">
            Past rank 7, a failed upgrade has a high chance of dropping the necklace back to rank 7. It can never be destroyed.
            Many players keep their best necklace and upgrade a second one until it passes the first.
          </p>
        )}
        <div className="overflow-x-auto rounded-xl border border-line bg-panel">
          <table className="w-full text-sm">
            <thead className="bg-panel-2 text-left text-muted">
              <tr>
                <th className="px-4 py-2">Rank</th>
                <th className="px-4 py-2">Necklace</th>
                <th className="px-4 py-2">Medals</th>
                <th className="px-4 py-2">Wisps</th>
              </tr>
            </thead>
            <tbody>
              {ranks.map((r) => {
                const inPlan = r.rank > current && r.rank <= to;
                return (
                  <tr key={r.rank} className={`border-t border-line ${inPlan ? "" : "text-muted"}`}>
                    <td className="px-4 py-2 font-mono">{r.rank}</td>
                    <td className={`px-4 py-2 ${inPlan ? "font-medium" : ""}`}>
                      {r.name}
                      {r.rank === 6 && <span className="ml-2 text-xs text-muted">pick one of two effects</span>}
                    </td>
                    <td className="px-4 py-2 font-mono">{r.medals}</td>
                    <td className="px-4 py-2 font-mono">{r.wisps || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <p className="text-xs uppercase text-muted">{label}</p>
      <p className="mt-1 font-mono text-2xl text-accent">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}
