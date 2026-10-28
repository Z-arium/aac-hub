#!/usr/bin/env node
// Turns tables from imported wiki pages into typed game data that the site's
// tools can use: content/wiki/data/<name>.json. Runs at the end of every
// import, or on its own with `npm run wiki:extract` (no network needed).

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const PAGES = path.join(ROOT, "content", "wiki", "pages");
const OUT = path.join(ROOT, "content", "wiki", "data");

const GRADES = ["Basic", "Grand", "Rare", "Arcane", "Heroic", "Unique", "Celestial", "Divine", "Epic", "Legendary", "Mythic"];

function page(slug) {
  const file = path.join(PAGES, `${slug}.json`);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : undefined;
}

const pct = (s) => {
  const n = parseFloat(String(s).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
};

// Column headers as the keys src/data/regrade.ts uses ("Ship/Pet" -> shipPet).
const columnKey = (h) => {
  const key = h.toLowerCase().replace(/[^a-z]/g, "");
  return key === "shippet" ? "shipPet" : key;
};

/** Regrade Rates: success % per step, keyed by difficulty column. */
function regrade() {
  const p = page("regrade-rates");
  if (!p) return null;
  const read = (table) => {
    const cols = table.headers.slice(1).map(columnKey);
    const out = Object.fromEntries(cols.map((c) => [c, []]));
    for (const row of table.rows) {
      const [from, to] = row[0].split(/\s*-+>\s*|\s*→\s*/);
      if (!GRADES.includes(from) || !GRADES.includes(to)) continue;
      cols.forEach((c, i) => (out[c][GRADES.indexOf(from)] = pct(row[i + 1])));
    }
    return out;
  };
  const [normal, resplendent] = [
    p.tables.find((t) => !/resplendent/i.test(t.heading) && t.headers[0] === "Grade"),
    p.tables.find((t) => /resplendent/i.test(t.heading)),
  ];
  return {
    source: p.source,
    revid: p.revid,
    grades: GRADES,
    rates: normal ? read(normal) : {},
    resplendent: resplendent ? read(resplendent) : {},
  };
}

/** World Bosses: name, level, location, tier, description, wiki page. */
function bosses() {
  const p = page("world-bosses");
  if (!p) return null;
  const list = [];
  for (const t of p.tables) {
    const tier = /major/i.test(t.heading) ? "Major" : /minor/i.test(t.heading) ? "Minor" : "Normal";
    const col = (name) => t.headers.findIndex((h) => h.toLowerCase().startsWith(name));
    const [n, l, loc, d] = [col("name"), col("level"), col("location"), col("description")];
    if (n < 0) continue;
    for (const r of t.rows) {
      if (!r[n]) continue;
      list.push({
        name: r[n],
        level: l >= 0 ? Number(r[l]) || null : null,
        location: loc >= 0 ? r[loc] : "",
        tier,
        description: d >= 0 ? r[d] : "",
      });
    }
  }
  return { source: p.source, revid: p.revid, bosses: list };
}

export function extract() {
  fs.mkdirSync(OUT, { recursive: true });
  const written = [];
  for (const [name, fn] of Object.entries({ regrade, bosses })) {
    const data = fn();
    if (!data) continue;
    fs.writeFileSync(path.join(OUT, `${name}.json`), JSON.stringify(data, null, 1) + "\n");
    written.push(name);
  }
  console.log(`Extracted: ${written.join(", ") || "nothing"}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) extract();
