#!/usr/bin/env node
// Compares the hand-kept game data in src/data with what the wiki says now
// (content/wiki/data), and lists any differences. Run `npm run wiki:check`.
// Exits 0 either way: a difference is something to review, not a failure.

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const wiki = (name) => {
  const file = path.join(ROOT, "content", "wiki", "data", `${name}.json`);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : undefined;
};
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const diffs = [];

const regrade = wiki("regrade");
if (regrade) {
  const { RATES, RESPLENDENT_RATES } = await import(path.join(ROOT, "src/data/regrade.ts"));
  for (const [label, ours, theirs] of [["Regrade", RATES, regrade.rates], ["Resplendent", RESPLENDENT_RATES, regrade.resplendent]]) {
    for (const [diff, values] of Object.entries(theirs)) {
      if (!ours[diff]) {
        diffs.push(`${label}: wiki has a "${diff}" column the site does not use`);
        continue;
      }
      values.forEach((v, i) => {
        if (v !== ours[diff][i]) diffs.push(`${label} ${diff} ${regrade.grades[i]}: site ${ours[diff][i]}%, wiki ${v}% (${regrade.source})`);
      });
    }
  }
}

const bosses = wiki("bosses");
if (bosses) {
  const { BOSSES } = await import(path.join(ROOT, "src/data/bosses.ts"));
  const ours = new Map(BOSSES.map((b) => [norm(b.name), b]));
  for (const b of bosses.bosses) {
    const o = ours.get(norm(b.name));
    if (!o) diffs.push(`Bosses: "${b.name}" is on the wiki but not in src/data/bosses.ts`);
    else {
      if (b.level && o.level !== b.level) diffs.push(`Bosses: ${b.name} level site ${o.level}, wiki ${b.level}`);
      if (o.tier !== b.tier) diffs.push(`Bosses: ${b.name} tier site ${o.tier}, wiki ${b.tier}`);
    }
    ours.delete(norm(b.name));
  }
  for (const o of ours.values()) diffs.push(`Bosses: "${o.name}" is in src/data/bosses.ts but not on the wiki's World Bosses page`);
}

const report = diffs.length ? `Site data differs from the wiki:\n${diffs.map((d) => `- ${d}`).join("\n")}` : "Site data matches the wiki.";
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Wiki data check\n\n${report}\n`);
