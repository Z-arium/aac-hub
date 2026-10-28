#!/usr/bin/env node
// Checks the mirror against the live wiki and writes content/wiki/coverage.json.
// It asks the wiki afresh for every page in every namespace, every redirect,
// every uploaded file (with its sha1) and the site statistics, then compares
// them with content/wiki and with the files on disk (re-hashing each one).
// Exits 1 if anything is missing or a file doesn't match.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const WIKI = "https://wiki.aa-classic.com";
const API = `${WIKI}/api.php`;
const USER_AGENT = "aac-hub-wiki-import/1.0 (+https://github.com/Z-arium/aac-hub)";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const OUT = path.join(ROOT, "content", "wiki");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(params) {
  await sleep(300);
  const res = await fetch(`${API}?${new URLSearchParams({ format: "json", formatversion: "2", ...params })}`, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
async function queryAll(params, pick) {
  const out = [];
  let cont = {};
  for (;;) {
    const j = await api({ action: "query", ...params, ...cont });
    out.push(...pick(j));
    if (!j.continue) return out;
    cont = j.continue;
  }
}
const norm = (t) => t.replace(/_/g, " ");

const index = JSON.parse(fs.readFileSync(path.join(OUT, "index.json"), "utf8"));
const filesJson = JSON.parse(fs.readFileSync(path.join(OUT, "files.json"), "utf8"));
const ourTitles = new Set(index.pages.map((p) => p.title));
const ourRedirects = new Set(Object.values(index.redirects).map((r) => r.from));
const ourFiles = new Map(filesJson.files.map((f) => [f.name, f]));

const site = (await api({ action: "query", meta: "siteinfo", siprop: "namespaces|statistics" })).query;
const report = { checked: new Date().toISOString(), source: WIKI, statistics: site.statistics, namespaces: [], files: {}, problems: [], notes: [] };

let wikiTotal = 0;
for (const ns of Object.values(site.namespaces).filter((n) => n.id >= 0)) {
  const pages = await queryAll({ list: "allpages", apnamespace: String(ns.id), aplimit: "max", apfilterredir: "nonredirects" }, (j) => j.query.allpages.map((p) => p.title));
  const redirects = await queryAll({ list: "allpages", apnamespace: String(ns.id), aplimit: "max", apfilterredir: "redirects" }, (j) => j.query.allpages.map((p) => p.title));
  wikiTotal += pages.length + redirects.length;
  const row = { id: ns.id, name: ns.name || "(Main)", wikiPages: pages.length, wikiRedirects: redirects.length, missing: [], missingRedirects: [] };
  if (ns.id === 6) {
    // File description pages: covered by the file mirror below.
    row.mirrored = pages.filter((t) => ourFiles.has(t.replace(/^File:/, ""))).length;
    row.missing = pages.filter((t) => !ourFiles.has(t.replace(/^File:/, "")));
  } else {
    row.mirrored = pages.filter((t) => ourTitles.has(t)).length;
    row.missing = pages.filter((t) => !ourTitles.has(t));
  }
  row.redirectsMirrored = redirects.filter((t) => ourRedirects.has(t)).length;
  row.missingRedirects = redirects.filter((t) => !ourRedirects.has(t));
  if (row.wikiPages || row.wikiRedirects) report.namespaces.push(row);
  for (const t of row.missing) report.problems.push(`Page not mirrored: ${t}`);
  for (const t of row.missingRedirects) report.problems.push(`Redirect not mirrored: ${t}`);
}
const extra = index.pages.filter((p) => !report.namespaces.some((n) => n.id === p.ns));
for (const p of extra) report.notes.push(`Mirror has a page the wiki no longer lists: ${p.title}`);

// Files: every upload, its sha1, and the copy on disk.
const images = await queryAll({ list: "allimages", ailimit: "max", aiprop: "sha1|size" }, (j) => j.query.allimages);
const hashCache = new Map();
let verified = 0;
let bytes = 0;
for (const img of images) {
  const name = norm(img.name);
  const ours = ourFiles.get(name);
  if (!ours) {
    report.problems.push(`File not mirrored: ${name}`);
    continue;
  }
  if (ours.sha1 !== img.sha1) {
    report.problems.push(`File changed on the wiki since the import: ${name}`);
    continue;
  }
  const disk = path.join(ROOT, "public", ours.path);
  if (!hashCache.has(disk)) {
    hashCache.set(disk, fs.existsSync(disk) ? crypto.createHash("sha1").update(fs.readFileSync(disk)).digest("hex") : null);
    if (hashCache.get(disk)) bytes += fs.statSync(disk).size;
  }
  const hash = hashCache.get(disk);
  if (!hash) report.problems.push(`File missing on disk: ${name} (${ours.path})`);
  else if (hash !== img.sha1) report.problems.push(`File on disk doesn't match the wiki: ${name}`);
  else verified++;
}
const uploaded = new Set(images.map((i) => norm(i.name)));
for (const name of ourFiles.keys()) if (!uploaded.has(name)) report.notes.push(`Mirror has a file the wiki no longer lists: ${name}`);
report.files = { wiki: images.length, verified, distinctOnDisk: hashCache.size, megabytes: +(bytes / 1048576).toFixed(1) };

// Images that pages use but that were never uploaded to the wiki (red links there too).
const brokenOnWiki = {};
for (const p of index.pages) {
  const page = JSON.parse(fs.readFileSync(path.join(OUT, "pages", `${p.slug}.json`), "utf8"));
  for (const img of page.images ?? []) if (!uploaded.has(img)) (brokenOnWiki[img] ??= []).push(p.title);
}
report.brokenOnWiki = brokenOnWiki;
if (Object.keys(brokenOnWiki).length)
  report.notes.push(`${Object.keys(brokenOnWiki).length} images are used on pages but were never uploaded to the wiki, so they are broken there too (listed under brokenOnWiki).`);

report.totals = {
  wikiPagesAllNamespaces: wikiTotal,
  statisticsPages: site.statistics.pages,
  mirroredPages: index.pages.length,
  mirroredRedirects: ourRedirects.size,
  mirroredFiles: verified,
};
if (wikiTotal !== site.statistics.pages)
  report.notes.push(
    `The wiki's statistics say ${site.statistics.pages} pages; listing every namespace gives ${wikiTotal}. MediaWiki keeps that statistic as a running counter that drifts from the real count, so the listing is what we compare against.`,
  );
report.notes.push("Special pages (Special:…) are generated by the wiki software, not stored pages, so they are not part of the mirror.");
report.complete = report.problems.length === 0;

fs.writeFileSync(path.join(OUT, "coverage.json"), JSON.stringify(report, null, 1) + "\n");
const lines = [
  `## Wiki coverage: ${report.complete ? "complete" : `${report.problems.length} problems`}`,
  "",
  "| Namespace | Pages on wiki | Mirrored | Redirects on wiki | Mirrored |",
  "| --- | --: | --: | --: | --: |",
  ...report.namespaces.map((n) => `| ${n.name} | ${n.wikiPages} | ${n.mirrored} | ${n.wikiRedirects} | ${n.redirectsMirrored} |`),
  "",
  `Files: ${report.files.wiki} on the wiki, ${verified} mirrored and sha1-verified (${report.files.distinctOnDisk} distinct files, ${report.files.megabytes} MB).`,
  "",
  ...report.problems.slice(0, 50).map((p) => `- ❌ ${p}`),
  ...report.notes.map((n) => `- ${n}`),
];
console.log(lines.join("\n"));
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join("\n") + "\n");
if (!report.complete) process.exitCode = 1;
