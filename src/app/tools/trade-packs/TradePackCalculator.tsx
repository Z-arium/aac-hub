"use client";

import { useState } from "react";

export default function TradePackCalculator() {
  const [base, setBase] = useState(20);
  const [percent, setPercent] = useState(120);
  const [packs, setPacks] = useState(10);
  const [matCost, setMatCost] = useState(8);
  const [laborPerPack, setLaborPerPack] = useState(250);
  const [dropPerPack, setDropPerPack] = useState(0);

  // Each pack sold can lower the percentage for the next one on that route.
  let total = 0;
  for (let i = 0; i < packs; i++) {
    const pct = Math.max(70, percent - i * dropPerPack);
    total += (base * pct) / 100;
  }
  const profit = total - matCost * packs;
  const labor = laborPerPack * packs;

  const field = (label: string, value: number, set: (n: number) => void, hint?: string, step = 1) => (
    <label className="block text-sm text-muted">
      {label}
      <input type="number" step={step} value={value} onChange={(e) => set(Number(e.target.value))} className="mt-1 w-full rounded border border-line bg-panel-2 px-3 py-2 text-text" />
      {hint && <span className="mt-1 block text-xs">{hint}</span>}
    </label>
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="grid gap-4 rounded-xl border border-line bg-panel p-5 sm:grid-cols-2">
        {field("Base value (gold)", base, setBase, "Value at 100%", 0.01)}
        {field("Turn-in %", percent, setPercent, "Shift+O in game")}
        {field("Packs", packs, setPacks)}
        {field("Material cost per pack (gold)", matCost, setMatCost, undefined, 0.01)}
        {field("Labor per pack", laborPerPack, setLaborPerPack, "Crafting + turn-in")}
        {field("% drop per pack sold", dropPerPack, setDropPerPack, "Optional, if you know it", 0.1)}
      </div>
      <div className="space-y-3">
        <Result label="Total payout" value={`${total.toFixed(2)}g`} />
        <Result label="Profit after materials" value={`${profit.toFixed(2)}g`} sub={`${(profit / Math.max(1, packs)).toFixed(2)}g per pack`} />
        <Result label="Silver per labor" value={labor ? `${((profit * 100) / labor).toFixed(2)}s` : "-"} sub={`${labor.toLocaleString()} labor in total`} />
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
