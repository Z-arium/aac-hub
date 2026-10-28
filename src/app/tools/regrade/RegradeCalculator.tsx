"use client";

import { useMemo, useState } from "react";
import { GRADES, GRADE_COLORS, RATES, RESPLENDENT_BONUS, RISK_FROM, type Difficulty } from "@/data/regrade";

const DIFFICULTIES: { id: Difficulty; label: string; hint: string }[] = [
  { id: "easy", label: "Easy", hint: "Dungeon drops" },
  { id: "normal", label: "Normal", hint: "Most gear" },
  { id: "difficult", label: "Difficult", hint: "Crafted, Obsidian, world boss" },
  { id: "shipPet", label: "Ship / Pet", hint: "Ships and pets" },
];

interface SimResult {
  avgScrolls: number;
  medianScrolls: number;
  breakChance: number;
}

/**
 * Monte Carlo run from `from` to `to`. Fail above Celestial can break or drop one grade.
 * With Resplendent scrolls a success has a RESPLENDENT_BONUS% chance to go up two grades.
 */
function simulate(
  rates: number[],
  from: number,
  to: number,
  breakPct: number,
  downPct: number,
  resplendent: boolean,
  runs = 20000,
): SimResult {
  const scrolls: number[] = [];
  let broken = 0;
  for (let r = 0; r < runs; r++) {
    let g = from;
    let n = 0;
    while (g < to && n < 100000) {
      n++;
      if (Math.random() * 100 < rates[g]) {
        g += resplendent && Math.random() * 100 < RESPLENDENT_BONUS ? 2 : 1;
      } else if (g >= RISK_FROM) {
        const roll = Math.random() * 100;
        if (roll < breakPct) {
          broken++;
          break;
        } else if (roll < breakPct + downPct) {
          g--;
        }
      }
    }
    scrolls.push(n);
  }
  scrolls.sort((a, b) => a - b);
  return {
    avgScrolls: scrolls.reduce((a, b) => a + b, 0) / runs,
    medianScrolls: scrolls[Math.floor(runs / 2)],
    breakChance: (broken / runs) * 100,
  };
}

function GradeSelect({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <select
      className="w-full rounded border border-line bg-panel-2 px-3 py-2"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ color: GRADE_COLORS[GRADES[value]] }}
    >
      {GRADES.map((g, i) =>
        i >= min && i <= max ? (
          <option key={g} value={i} style={{ color: GRADE_COLORS[g] }}>
            {g}
          </option>
        ) : null,
      )}
    </select>
  );
}

export default function RegradeCalculator() {
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [from, setFrom] = useState(GRADES.indexOf("Heroic"));
  const [to, setTo] = useState(GRADES.indexOf("Divine"));
  const [scrollCost, setScrollCost] = useState(0);
  const [breakPct, setBreakPct] = useState(0);
  const [downPct, setDownPct] = useState(0);
  const [seed, setSeed] = useState(0);
  const [resplendentPicked, setResplendent] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [current, setCurrent] = useState<number | null>(null);

  const rates = RATES[difficulty];
  // The wiki has no Resplendent table for ships and pets.
  const resplendent = resplendentPicked && difficulty !== "shipPet";
  const target = Math.max(to, from + 1);
  const steps = rates.slice(from, target).map((p, i) => ({ from: from + i, p }));
  const straight = steps.reduce((acc, s) => acc * (s.p / 100), 1) * 100;
  const sim = useMemo(
    () => simulate(rates, from, target, breakPct, downPct, resplendent),
    // seed lets the user re-run the simulation
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rates, from, target, breakPct, downPct, resplendent, seed],
  );

  function rollOnce() {
    const g = current ?? from;
    if (g >= GRADES.length - 1) return;
    const ok = Math.random() * 100 < rates[g];
    let next = g;
    let msg: string;
    if (ok) {
      const jump = resplendent && g + 2 < GRADES.length && Math.random() * 100 < RESPLENDENT_BONUS;
      next = g + (jump ? 2 : 1);
      msg = `${jump ? "Great success" : "Success"}: ${GRADES[g]} → ${GRADES[next]}`;
    } else if (g >= RISK_FROM) {
      const roll = Math.random() * 100;
      if (roll < breakPct) {
        msg = `Failed: your ${GRADES[g]} item broke`;
        next = from;
      } else if (roll < breakPct + downPct) {
        next = g - 1;
        msg = `Failed: dropped to ${GRADES[next]}`;
      } else msg = `Failed: stayed ${GRADES[g]}`;
    } else msg = `Failed: stayed ${GRADES[g]}`;
    setCurrent(next);
    setLog((l) => [msg, ...l].slice(0, 12));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-5 rounded-xl border border-line bg-panel p-5">
        <div>
          <p className="mb-2 text-sm text-muted">Item type</p>
          <div className="grid grid-cols-2 gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`rounded-lg border px-3 py-2 text-left text-sm ${
                  difficulty === d.id ? "border-accent bg-accent/10" : "border-line hover:border-muted"
                }`}
              >
                <span className="font-semibold">{d.label}</span>
                <span className="block text-xs text-muted">{d.hint}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-muted">
            From
            <GradeSelect value={from} onChange={(v) => { setFrom(v); setCurrent(null); }} min={0} max={GRADES.length - 2} />
          </label>
          <label className="text-sm text-muted">
            To
            <GradeSelect value={target} onChange={setTo} min={from + 1} max={GRADES.length - 1} />
          </label>
        </div>
        <label className={`flex items-start gap-3 text-sm ${difficulty === "shipPet" ? "opacity-40" : ""}`}>
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-[var(--accent)]"
            checked={resplendent}
            disabled={difficulty === "shipPet"}
            onChange={(e) => setResplendent(e.target.checked)}
          />
          <span>
            Use Resplendent scrolls
            <span className="block text-xs text-muted">
              Same success chance, plus a {RESPLENDENT_BONUS}% chance on success to go up two grades.
              {difficulty === "shipPet" && " Not available for ships and pets."}
            </span>
          </span>
        </label>
        <label className="block text-sm text-muted">
          Cost per attempt (gold, scroll + charm)
          <input
            type="number"
            min={0}
            value={scrollCost}
            onChange={(e) => setScrollCost(Number(e.target.value))}
            className="mt-1 w-full rounded border border-line bg-panel-2 px-3 py-2 text-text"
          />
        </label>
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3 text-sm">
          <p className="text-yellow-200">
            From Celestial up, a failed regrade can break or downgrade your item. The wiki doesn&apos;t list those odds, so
            enter your own. A Bound Destruction Preventive Charm stops breaking but not downgrading.
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <label className="text-muted">
              Break %
              <input type="number" min={0} max={100} value={breakPct} onChange={(e) => setBreakPct(Number(e.target.value))} className="mt-1 w-full rounded border border-line bg-panel-2 px-2 py-1 text-text" />
            </label>
            <label className="text-muted">
              Downgrade %
              <input type="number" min={0} max={100} value={downPct} onChange={(e) => setDownPct(Number(e.target.value))} className="mt-1 w-full rounded border border-line bg-panel-2 px-2 py-1 text-text" />
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-4 lg:col-span-2">
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Chance with no failures" value={`${straight < 0.01 ? straight.toExponential(2) : straight.toFixed(2)}%`} />
          <Stat
            label="Average attempts"
            value={sim.avgScrolls.toFixed(1)}
            sub={`Median ${sim.medianScrolls}${resplendent ? ", with Resplendent scrolls" : ""}`}
          />
          <Stat
            label="Average cost"
            value={scrollCost ? `${Math.round(sim.avgScrolls * scrollCost).toLocaleString()}g` : "-"}
            sub={sim.breakChance > 0 ? `${sim.breakChance.toFixed(1)}% chance to break on the way` : undefined}
          />
        </div>

        <div className="overflow-x-auto rounded-xl border border-line bg-panel">
          <table className="w-full text-sm">
            <thead className="bg-panel-2 text-left text-muted">
              <tr>
                <th className="px-4 py-2">Step</th>
                <th className="px-4 py-2">Success</th>
                <th className="px-4 py-2">Avg. attempts</th>
                {resplendent && <th className="px-4 py-2">Two grades</th>}
                <th className="px-4 py-2">On fail</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((s) => (
                <tr key={s.from} className="border-t border-line">
                  <td className="px-4 py-2">
                    <span style={{ color: GRADE_COLORS[GRADES[s.from]] }}>{GRADES[s.from]}</span> →{" "}
                    <span style={{ color: GRADE_COLORS[GRADES[s.from + 1]] }}>{GRADES[s.from + 1]}</span>
                  </td>
                  <td className="px-4 py-2 font-mono">{s.p}%</td>
                  <td className="px-4 py-2 font-mono">{(100 / s.p).toFixed(1)}</td>
                  {resplendent && (
                    <td className="px-4 py-2 font-mono">
                      {s.from + 2 < GRADES.length ? `${+((s.p * RESPLENDENT_BONUS) / 100).toFixed(2)}%` : "-"}
                    </td>
                  )}
                  <td className="px-4 py-2 text-muted">{s.from >= RISK_FROM ? "Can break or downgrade" : "Stays the same"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-line bg-panel p-5">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-semibold">Try your luck</h3>
            <span className="text-sm" style={{ color: GRADE_COLORS[GRADES[current ?? from]] }}>
              Current: {GRADES[current ?? from]}
            </span>
            <div className="ml-auto flex gap-2">
              <button onClick={() => { setCurrent(null); setLog([]); }} className="rounded-lg border border-line px-3 py-1.5 text-sm hover:border-muted">
                Reset
              </button>
              <button onClick={() => setSeed((s) => s + 1)} className="rounded-lg border border-line px-3 py-1.5 text-sm hover:border-muted">
                Re-run averages
              </button>
              <button onClick={rollOnce} className="rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-bg">
                Regrade
              </button>
            </div>
          </div>
          <ul className="mt-3 space-y-1 font-mono text-xs text-muted">
            {log.map((l, i) => (
              <li key={i} className={l.startsWith("Great") ? "text-accent" : l.startsWith("Success") ? "text-emerald-300" : l.includes("broke") ? "text-red-400" : ""}>
                {l}
              </li>
            ))}
          </ul>
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
