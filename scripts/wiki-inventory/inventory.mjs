#!/usr/bin/env node
// One-off inventory of wiki.aa-classic.com: page counts per namespace,
// images (count, total size, types). Writes wiki-inventory.json.
import fs from "node:fs";

const API = "https://wiki.aa-classic.com/api.php";
const UA = "aac-hub-wiki-import/1.0 (+https://github.com/Z-arium/aac-hub)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function api(params) {
  await sleep(300);
  const res = await fetch(`${API}?${new URLSearchParams({ format: "json", formatversion: "2", ...params })}`, { headers: { "User-Agent": UA } });
  return res.json();
}
async function all(params, pick) {
  const out = [];
  let cont = {};
  for (;;) {
    const j = await api({ action: "query", ...params, ...cont });
    out.push(...pick(j));
    if (!j.continue) return out;
    cont = j.continue;
  }
}

const si = await api({ action: "query", meta: "siteinfo", siprop: "general|namespaces|statistics|rightsinfo|extensions" });
const out = {
  statistics: si.query.statistics,
  rights: si.query.rightsinfo,
  generator: si.query.general.generator,
  extensions: si.query.extensions.map((e) => e.name),
  namespaces: {},
};
for (const ns of Object.values(si.query.namespaces)) {
  if (ns.id < 0) continue;
  const titles = await all({ list: "allpages", apnamespace: String(ns.id), aplimit: "max", apfilterredir: "nonredirects" }, (j) => j.query.allpages.map((p) => p.title));
  const redirects = await all({ list: "allpages", apnamespace: String(ns.id), aplimit: "max", apfilterredir: "redirects" }, (j) => j.query.allpages.map((p) => p.title));
  out.namespaces[ns.id] = { name: ns.name || "(main)", pages: titles.length, redirects: redirects.length, sample: titles.slice(0, 40) };
  console.log(ns.id, ns.name, titles.length, redirects.length);
}
const images = await all({ list: "allimages", ailimit: "max", aiprop: "size|mime" }, (j) => j.query.allimages);
const mimes = {};
let bytes = 0;
for (const i of images) {
  bytes += i.size;
  mimes[i.mime] = (mimes[i.mime] ?? 0) + 1;
}
const sizes = images.map((i) => i.size).sort((a, b) => b - a);
out.images = {
  count: images.length,
  bytes,
  mb: +(bytes / 1048576).toFixed(1),
  mimes,
  largest: sizes.slice(0, 10),
  over1mb: sizes.filter((s) => s > 1048576).length,
  sample: images.slice(0, 20).map((i) => i.name),
};
fs.writeFileSync("wiki-inventory.json", JSON.stringify(out, null, 1));
const summary = [
  `stats: ${JSON.stringify(out.statistics)}`,
  ...Object.entries(out.namespaces).map(([id, n]) => `ns ${id} ${n.name}: ${n.pages} pages, ${n.redirects} redirects`),
  `images: ${images.length}, ${out.images.mb} MB, ${JSON.stringify(mimes)}, >1MB: ${out.images.over1mb}`,
];
console.log(summary.join("\n"));
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, "```\n" + summary.join("\n") + "\n```\n");
