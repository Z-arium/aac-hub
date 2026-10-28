#!/usr/bin/env node
// Imports every article from the AAClassic wiki (https://wiki.aa-classic.com,
// CC0) through the MediaWiki API and writes cleaned, structured copies to
// content/wiki. Run with `npm run wiki:import`. Pages whose revision has not
// changed since the last run are not re-downloaded.
//
// Output:
//   content/wiki/index.json      page list (no bodies), categories, redirects
//   content/wiki/pages/<slug>.json  cleaned HTML, headings, tables, source link
//   public/wiki-search.json      compact text index for the site search

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parse } from "node-html-parser";
import { categorize, isJunk } from "./categories.mjs";

const WIKI = "https://wiki.aa-classic.com";
const API = `${WIKI}/api.php`;
const USER_AGENT = "aac-hub-wiki-import/1.0 (+https://github.com/Z-arium/aac-hub)";
const DELAY_MS = Number(process.env.WIKI_DELAY_MS ?? 750);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const OUT = path.join(ROOT, "content", "wiki");
const PAGES_DIR = path.join(OUT, "pages");
const SEARCH_FILE = path.join(ROOT, "public", "wiki-search.json");
const FORCE = process.argv.includes("--force");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(params, attempt = 1) {
  const url = `${API}?${new URLSearchParams({ format: "json", formatversion: "2", ...params })}`;
  await sleep(DELAY_MS);
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const json = await res.json();
    if (json.error) throw Object.assign(new Error(`${json.error.code}: ${json.error.info}`), { fatal: true });
    return json;
  } catch (err) {
    if (err.fatal || attempt >= 5) throw err;
    const wait = 2000 * 2 ** attempt;
    console.warn(`  retry ${attempt} in ${wait}ms (${err.message})`);
    await sleep(wait);
    return api(params, attempt + 1);
  }
}

/** Runs a query and follows `continue` until the list is complete. */
async function queryAll(params, pick) {
  const out = [];
  let cont = {};
  for (;;) {
    const json = await api({ action: "query", ...params, ...cont });
    out.push(...pick(json));
    if (!json.continue) return out;
    cont = json.continue;
  }
}

export function slugify(title) {
  return title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const normTitle = (t) => decodeURIComponent(t).replace(/_/g, " ").trim();
const collapse = (s) => s.replace(/\s+/g, " ").trim();

const KEEP_CLASSES = new Set(["wikitable", "sortable", "infobox", "gallery", "thumb", "tright", "tleft", "center", "floatright", "floatleft"]);
const KEEP_STYLE = new Set(["color", "text-align", "font-weight", "font-style", "width", "vertical-align"]);
const DROP_SELECTORS = [
  ".mw-editsection", "script", "style", "link", "meta", "#toc", ".toc", ".noprint", ".mw-empty-elt",
  ".citizen-ui-icon", ".mw-jump-link", "noscript", "iframe", "object", "embed", "form",
];

/** Cleans one parsed page: absolute images, local links, no wiki chrome. */
function cleanHtml(html, resolveLink) {
  const doc = parse(html, { comment: false });
  const root = doc.querySelector(".mw-parser-output") ?? doc;
  for (const sel of DROP_SELECTORS) root.querySelectorAll(sel).forEach((n) => n.remove());

  // MediaWiki 1.4x wraps headings in <div class="mw-heading">; unwrap them.
  root.querySelectorAll("div.mw-heading").forEach((d) => {
    const h = d.querySelector("h1,h2,h3,h4,h5,h6");
    if (h) d.replaceWith(h);
  });

  root.querySelectorAll("a").forEach((a) => {
    const href = a.getAttribute("href");
    if (!href) return;
    // Image links point at File: pages; unwrap so the image is not a link.
    if (a.classList.contains("mw-file-description") || a.classList.contains("image")) {
      a.replaceWith(a.innerHTML);
      return;
    }
    if (/^\s*javascript:/i.test(href)) {
      a.removeAttribute("href");
      return;
    }
    a.setAttribute("href", resolveLink(href));
    if (/^https?:/.test(a.getAttribute("href"))) a.setAttribute("rel", "noopener");
    a.removeAttribute("title");
  });

  root.querySelectorAll("img").forEach((img) => {
    for (const attr of ["src", "data-src"]) {
      const v = img.getAttribute(attr);
      if (v && v.startsWith("/")) img.setAttribute(attr, WIKI + v);
    }
    const srcset = img.getAttribute("srcset");
    if (srcset) img.setAttribute("srcset", srcset.replace(/(^|,\s*)\//g, `$1${WIKI}/`));
    img.setAttribute("loading", "lazy");
    img.removeAttribute("decoding");
  });

  root.querySelectorAll("*").forEach((el) => {
    const cls = (el.getAttribute("class") ?? "").split(/\s+/).filter((c) => KEEP_CLASSES.has(c));
    if (cls.length) el.setAttribute("class", cls.join(" "));
    else el.removeAttribute("class");
    const style = el.getAttribute("style");
    if (style) {
      const kept = style
        .split(";")
        .map((s) => s.trim())
        .filter((s) => KEEP_STYLE.has(s.split(":")[0].trim().toLowerCase()));
      if (kept.length) el.setAttribute("style", kept.join("; "));
      else el.removeAttribute("style");
    }
    if (el.getAttribute("id") && !/^h[1-6]$/i.test(el.tagName)) el.removeAttribute("id");
    for (const attr of Object.keys(el.attributes)) {
      if ((attr.startsWith("data-") && attr !== "data-src") || attr.toLowerCase().startsWith("on") || ["typeof", "about", "lang", "dir"].includes(attr)) el.removeAttribute(attr);
    }
  });

  return root;
}

/** Every table on the page as plain text, so tools can read wiki data. */
function extractTables(root) {
  return root.querySelectorAll("table").map((table) => {
    let heading = "";
    for (let n = table; n && !heading; n = n.parentNode) {
      for (let p = n.previousElementSibling; p; p = p.previousElementSibling) {
        if (/^H[2-6]$/.test(p.tagName)) {
          heading = collapse(p.text);
          break;
        }
      }
      if (n.parentNode === root) break;
    }
    const caption = collapse(table.querySelector("caption")?.text ?? "");
    const rows = table.querySelectorAll("tr").map((tr) =>
      tr.querySelectorAll("th,td").map((c) => collapse(c.text)),
    );
    const firstIsHeader = table.querySelector("tr")?.querySelectorAll("td").length === 0;
    return {
      heading,
      caption,
      headers: firstIsHeader ? rows[0] : [],
      rows: (firstIsHeader ? rows.slice(1) : rows).filter((r) => r.some(Boolean)),
    };
  });
}

function extractHeadings(root) {
  return root.querySelectorAll("h2,h3").map((h) => ({
    level: Number(h.tagName[1]),
    id: h.getAttribute("id") ?? slugify(h.text),
    text: collapse(h.text),
  }));
}

function textOf(root) {
  const clone = parse(root.toString());
  clone.querySelectorAll("td,th,li,br,p,div").forEach((n) => n.insertAdjacentHTML("afterend", " "));
  return collapse(clone.structuredText.replace(/\n+/g, " \n "));
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function main() {
  fs.mkdirSync(PAGES_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(SEARCH_FILE), { recursive: true });
  const previous = readJson(path.join(OUT, "index.json"), { pages: [] });
  const prevBySlug = new Map(previous.pages.map((p) => [p.slug, p]));

  console.log("Listing pages…");
  const all = await queryAll(
    { generator: "allpages", gapnamespace: "0", gapfilterredir: "nonredirects", gaplimit: "max", prop: "revisions", rvprop: "ids|timestamp" },
    (j) => j.query?.pages ?? [],
  );
  const pages = all
    .filter((p) => !isJunk(p.title))
    .map((p) => ({ pageid: p.pageid, title: p.title, revid: p.revisions?.[0]?.revid, updated: p.revisions?.[0]?.timestamp }))
    .sort((a, b) => a.title.localeCompare(b.title));

  console.log("Listing redirects…");
  const redirectTitles = await queryAll(
    { list: "allpages", apnamespace: "0", apfilterredir: "redirects", aplimit: "max" },
    (j) => (j.query?.allpages ?? []).map((p) => p.title),
  );
  const redirectList = [];
  for (let i = 0; i < redirectTitles.length; i += 50) {
    const json = await api({ action: "query", titles: redirectTitles.slice(i, i + 50).join("|"), redirects: "1" });
    redirectList.push(...(json.query?.redirects ?? []));
  }

  // Titles that differ only in case (e.g. "Castle Warehouse" / "Castle
  // warehouse") would collide on one slug: keep the newer edit.
  const slugOf = new Map();
  const bySlug = new Map();
  for (const p of [...pages].sort((a, b) => (b.updated ?? "").localeCompare(a.updated ?? ""))) {
    const slug = slugify(p.title) || `page-${p.pageid}`;
    if (bySlug.has(slug)) {
      slugOf.set(p.title, slug);
      continue;
    }
    bySlug.set(slug, p);
    slugOf.set(p.title, slug);
  }
  const redirects = {};
  for (const r of redirectList) {
    const slug = slugOf.get(r.to);
    if (slug) {
      slugOf.set(r.from, slug);
      redirects[slugify(r.from)] = slug;
    }
  }

  const resolveLink = (href) => {
    if (href.startsWith("#") || /^(https?:|mailto:)/.test(href)) return href;
    const m = href.match(/^\/(?:index\.php\?title=)?([^?#&]+)(?:[?&][^#]*)?(#.*)?$/);
    if (!m) return WIKI + href;
    const title = normTitle(m[1]);
    const slug = slugOf.get(title) ?? slugOf.get(title.charAt(0).toUpperCase() + title.slice(1));
    if (slug && !href.includes("action=")) return `/wiki/${slug}${m[2] ?? ""}`;
    return WIKI + href;
  };

  const index = [];
  const search = [];
  let fetched = 0;
  for (const [slug, p] of bySlug) {
    const file = path.join(PAGES_DIR, `${slug}.json`);
    const prev = prevBySlug.get(slug);
    let page;
    if (!FORCE && prev && prev.revid === p.revid && fs.existsSync(file)) {
      page = readJson(file, null);
    }
    if (!page) {
      console.log(`  ${p.title}`);
      const json = await api({
        action: "parse",
        pageid: String(p.pageid),
        prop: "text|displaytitle",
        disableeditsection: "1",
        disabletoc: "1",
        disablelimitreport: "1",
      });
      const root = cleanHtml(json.parse.text, resolveLink);
      const text = textOf(root);
      page = {
        slug,
        title: p.title,
        pageid: p.pageid,
        revid: p.revid,
        updated: p.updated,
        source: `${WIKI}/${encodeURI(p.title.replace(/ /g, "_"))}`,
        headings: extractHeadings(root),
        tables: extractTables(root),
        text,
        html: root.innerHTML.trim(),
      };
      fs.writeFileSync(file, JSON.stringify(page, null, 1) + "\n");
      fetched++;
    }
    const category = categorize(page.title, page.text);
    const summary = page.text.slice(0, 220).replace(/\s+\S*$/, "") + (page.text.length > 220 ? "…" : "");
    index.push({ slug, title: page.title, category, summary, updated: page.updated, source: page.source, words: page.text.split(" ").length });
    search.push({ s: slug, t: page.title, c: category, h: page.headings.map((h) => h.text), x: page.text.slice(0, 20000) });
  }

  // Remove pages that were deleted or renamed on the wiki.
  for (const f of fs.readdirSync(PAGES_DIR)) {
    if (!bySlug.has(f.replace(/\.json$/, ""))) fs.rmSync(path.join(PAGES_DIR, f));
  }

  index.sort((a, b) => a.title.localeCompare(b.title));
  const categories = [...new Set(index.map((p) => p.category))].sort();
  const out = { source: WIKI, license: "CC0 1.0", pages: index, categories, redirects };
  fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify(out, null, 1) + "\n");
  fs.writeFileSync(SEARCH_FILE, JSON.stringify(search));
  console.log(`Done: ${index.length} pages (${fetched} downloaded), ${Object.keys(redirects).length} redirects.`);
}

export { cleanHtml, extractTables, extractHeadings, textOf };

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
