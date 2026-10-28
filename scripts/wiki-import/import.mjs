#!/usr/bin/env node
// Mirrors the whole AAClassic wiki (https://wiki.aa-classic.com, CC0) through
// the MediaWiki API: every page in every namespace, every uploaded file, and
// redirects. Run with `npm run wiki:import`. Pages whose revision has not
// changed and files already on disk are not downloaded again.
//
// Output:
//   content/wiki/index.json         page list (no bodies), categories, redirects
//   content/wiki/pages/<slug>.json  cleaned HTML, wikitext, headings, tables, source link
//   content/wiki/files.json         every uploaded file: name, local path, size, sha1…
//   public/wiki-files/<xx>/<sha1>.<ext>  the files themselves (one copy per distinct file)
//   public/wiki-files/index.json    compact file list for the file browser
//   public/wiki-search.json         compact text index for the site search

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parse } from "node-html-parser";
import { categorize, isJunk, namespaceCategory } from "./categories.mjs";
import { extract } from "./extract.mjs";

const WIKI = "https://wiki.aa-classic.com";
const API = `${WIKI}/api.php`;
const USER_AGENT = "aac-hub-wiki-import/1.0 (+https://github.com/Z-arium/aac-hub)";
const DELAY_MS = Number(process.env.WIKI_DELAY_MS ?? 750);
const FILE_WORKERS = Number(process.env.WIKI_FILE_WORKERS ?? 6);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const OUT = path.join(ROOT, "content", "wiki");
const PAGES_DIR = path.join(OUT, "pages");
const FILES_DIR = path.join(ROOT, "public", "wiki-files");
const SEARCH_FILE = path.join(ROOT, "public", "wiki-search.json");
const FILE_NS = 6;
// Bump when the cleaning changes, so the next run re-downloads every page.
const VERSION = 3;
let FORCE = process.argv.includes("--force");
const SKIP_FILES = process.argv.includes("--skip-file-downloads");

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

const normTitle = (t) => {
  let s = t;
  try {
    s = decodeURIComponent(t);
  } catch {}
  return s.replace(/_/g, " ").trim();
};
const collapse = (s) => s.replace(/\s+/g, " ").trim();
const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Local path (under public/) for an uploaded file, by content hash. */
export function localFilePath(sha1, name) {
  const ext = (name.match(/\.([a-z0-9]{1,5})$/i)?.[1] ?? "bin").toLowerCase();
  return `wiki-files/${sha1.slice(0, 2)}/${sha1}.${ext}`;
}

/** The file name an /images/... URL points at (originals and thumbnails). */
export function fileNameFromUrl(src) {
  const u = src.replace(/^https?:\/\/wiki\.aa-classic\.com/, "").split(/[?#]/)[0];
  const m = u.match(/^\/images\/thumb\/[0-9a-f]\/[0-9a-f]{2}\/([^/]+)\//) ?? u.match(/^\/images\/[0-9a-f]\/[0-9a-f]{2}\/([^/]+)$/);
  return m ? normTitle(m[1]) : undefined;
}

const KEEP_CLASSES = new Set(["wikitable", "sortable", "infobox", "gallery", "thumb", "tright", "tleft", "center", "floatright", "floatleft"]);
const KEEP_STYLE = new Set(["color", "text-align", "font-weight", "font-style", "width", "vertical-align"]);
const DROP_SELECTORS = [
  ".mw-editsection", "script", "style", "link", "meta", "#toc", ".toc", ".noprint", ".mw-empty-elt",
  ".citizen-ui-icon", ".mw-jump-link", "noscript", "iframe", "object", "embed", "form",
];

/**
 * Cleans one parsed page: local links, mirrored images, no wiki chrome.
 * `resolveFile(name)` returns the local path of a mirrored file, if any.
 */
function cleanHtml(html, resolveLink, resolveFile = () => undefined) {
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
    const src = img.getAttribute("src") ?? "";
    const name = fileNameFromUrl(src);
    const local = name && resolveFile(name);
    if (local) {
      img.setAttribute("src", `/${local}`);
      img.removeAttribute("srcset");
    } else {
      if (src.startsWith("/")) img.setAttribute("src", WIKI + src);
      const srcset = img.getAttribute("srcset");
      if (srcset) img.setAttribute("srcset", srcset.replace(/(^|,\s*)\//g, `$1${WIKI}/`));
    }
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

const sha1Of = (buf) => crypto.createHash("sha1").update(buf).digest("hex");

/** Downloads every distinct file not yet on disk, checking its sha1. */
async function downloadFiles(files) {
  const todo = new Map();
  for (const f of files) if (!todo.has(f.sha1) && !fs.existsSync(path.join(ROOT, "public", f.path))) todo.set(f.sha1, f);
  const queue = [...todo.values()];
  const total = queue.length;
  console.log(`Downloading ${total} files (${FILE_WORKERS} at a time)…`);
  const failed = [];
  let done = 0;
  async function worker() {
    for (let f = queue.shift(); f; f = queue.shift()) {
      for (let attempt = 1; ; attempt++) {
        try {
          await sleep(100);
          const res = await fetch(f.url, { headers: { "User-Agent": USER_AGENT } });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const buf = Buffer.from(await res.arrayBuffer());
          if (sha1Of(buf) !== f.sha1) throw new Error("sha1 mismatch");
          const dest = path.join(ROOT, "public", f.path);
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.writeFileSync(dest, buf);
          break;
        } catch (err) {
          if (attempt >= 4) {
            console.warn(`  failed ${f.name}: ${err.message}`);
            failed.push({ name: f.name, error: err.message });
            break;
          }
          await sleep(2000 * 2 ** attempt);
        }
      }
      if (++done % 1000 === 0) console.log(`  ${done}/${total}`);
    }
  }
  await Promise.all(Array.from({ length: FILE_WORKERS }, worker));
  return failed;
}

async function main() {
  fs.mkdirSync(PAGES_DIR, { recursive: true });
  fs.mkdirSync(FILES_DIR, { recursive: true });
  const previous = readJson(path.join(OUT, "index.json"), { pages: [] });
  const prevBySlug = new Map(previous.pages.map((p) => [p.slug, p]));
  if (previous.version !== VERSION) FORCE = true;

  const site = (await api({ action: "query", meta: "siteinfo", siprop: "general|namespaces|statistics" })).query;
  const namespaces = Object.values(site.namespaces).filter((n) => n.id >= 0 && n.id !== FILE_NS);

  // ---- Files: list them first so pages can point images at local copies.
  console.log("Listing files…");
  const images = await queryAll(
    { list: "allimages", ailimit: "max", aiprop: "url|size|dimensions|sha1|mime|timestamp|user|comment" },
    (j) => j.query?.allimages ?? [],
  );
  const fileInfo = await queryAll(
    { generator: "allpages", gapnamespace: String(FILE_NS), gaplimit: "max", prop: "info" },
    (j) => j.query?.pages ?? [],
  );
  const filePageLength = new Map(fileInfo.map((p) => [p.title.replace(/^File:/, ""), p.length]));
  const files = images.map((i) => {
    const name = normTitle(i.name);
    return {
      name,
      path: localFilePath(i.sha1, name),
      url: i.url,
      sha1: i.sha1,
      size: i.size,
      width: i.width,
      height: i.height,
      mime: i.mime,
      uploaded: i.timestamp,
      user: i.user,
      comment: i.comment || undefined,
    };
  });
  const fileByName = new Map(files.map((f) => [f.name, f]));
  const resolveFile = (name) => (fileByName.get(name) ?? fileByName.get(name.charAt(0).toUpperCase() + name.slice(1)))?.path;

  // ---- Pages in every namespace (File description pages are handled below).
  console.log("Listing pages…");
  const pages = [];
  const redirectTitles = [];
  for (const ns of namespaces) {
    const list = await queryAll(
      { generator: "allpages", gapnamespace: String(ns.id), gaplimit: "max", prop: "revisions|info", rvprop: "ids|timestamp" },
      (j) => j.query?.pages ?? [],
    );
    for (const p of list) {
      if (p.redirect) redirectTitles.push(p.title);
      else
        pages.push({
          pageid: p.pageid,
          ns: p.ns,
          title: p.title,
          model: p.contentmodel,
          revid: p.revisions?.[0]?.revid,
          updated: p.revisions?.[0]?.timestamp,
        });
    }
  }
  pages.sort((a, b) => a.ns - b.ns || a.title.localeCompare(b.title));

  const redirectList = [];
  for (let i = 0; i < redirectTitles.length; i += 50) {
    const json = await api({ action: "query", titles: redirectTitles.slice(i, i + 50).join("|"), redirects: "1" });
    redirectList.push(...(json.query?.redirects ?? []));
  }

  // Titles that differ only in case ("Castle Warehouse" / "Castle warehouse")
  // would share a slug: the older page gets a numbered slug.
  const slugOf = new Map();
  const bySlug = new Map();
  for (const p of [...pages].sort((a, b) => a.pageid - b.pageid)) {
    const base = slugify(p.title) || `page-${p.pageid}`;
    let slug = base;
    for (let n = 2; bySlug.has(slug); n++) slug = `${base}-${n}`;
    bySlug.set(slug, p);
    slugOf.set(p.title, slug);
  }
  const redirects = {};
  for (const r of redirectList) {
    const [target, fragment] = r.to.split("#");
    const slug = slugOf.get(target);
    if (slug) {
      slugOf.set(r.from, slug);
      redirects[slugify(r.from)] = { to: slug, from: r.from, fragment: r.tofragment ?? fragment ?? undefined };
    }
  }

  const resolveLink = (href) => {
    if (href.startsWith("#") || /^(https?:|mailto:)/.test(href)) return href;
    const m = href.match(/^\/(?:index\.php\?title=)?([^?#&]+)(?:[?&][^#]*)?(#.*)?$/);
    if (!m) return WIKI + href;
    const title = normTitle(m[1]);
    const file = title.match(/^(?:File|Image|Media):(.+)$/i);
    if (file && fileByName.has(file[1])) return `/wiki/files?f=${encodeURIComponent(file[1])}`;
    const slug = slugOf.get(title) ?? slugOf.get(title.charAt(0).toUpperCase() + title.slice(1));
    if (slug && !href.includes("action=")) return `/wiki/${slug}${m[2] ?? ""}`;
    return WIKI + href;
  };

  const index = [];
  const search = [];
  const usedOn = new Map();
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
      const raw = await api({ action: "query", pageids: String(p.pageid), prop: "revisions", rvprop: "content", rvslots: "main" });
      const source = raw.query.pages[0].revisions?.[0]?.slots?.main?.content ?? "";
      let root;
      let images = [];
      if (p.model === "wikitext") {
        const json = await api({
          action: "parse",
          pageid: String(p.pageid),
          prop: "text|images",
          disableeditsection: "1",
          disabletoc: "1",
          disablelimitreport: "1",
        });
        root = cleanHtml(json.parse.text, resolveLink, resolveFile);
        images = (json.parse.images ?? []).map(normTitle);
        const first = root.querySelector("h1,h2,h3");
        if (first && collapse(first.text) === p.title && !first.previousElementSibling) first.remove();
      } else {
        // Lua modules, CSS, JS and JSON pages: show the source itself.
        root = parse(`<pre><code>${escapeHtml(source)}</code></pre>`);
      }
      page = {
        slug,
        title: p.title,
        ns: p.ns,
        model: p.model,
        pageid: p.pageid,
        revid: p.revid,
        updated: p.updated,
        source: `${WIKI}/${encodeURI(p.title.replace(/ /g, "_"))}`,
        headings: extractHeadings(root),
        tables: extractTables(root),
        images,
        text: p.model === "wikitext" ? textOf(root) : collapse(source),
        html: root.innerHTML.trim(),
        wikitext: source,
      };
      fs.writeFileSync(file, JSON.stringify(page, null, 1) + "\n");
      fetched++;
    }
    for (const img of page.images ?? []) {
      if (!usedOn.has(img)) usedOn.set(img, []);
      usedOn.get(img).push(slug);
    }
    const internal = p.ns !== 0 || isJunk(page.title);
    const category = p.ns !== 0 ? namespaceCategory(p.ns) : isJunk(page.title) ? "Wiki housekeeping" : categorize(page.title);
    const summary = page.text.slice(0, 220).replace(/\s+\S*$/, "") + (page.text.length > 220 ? "…" : "");
    index.push({ slug, title: page.title, ns: p.ns, category, internal, summary, updated: page.updated, source: page.source, words: page.text.split(" ").length });
    search.push({ s: slug, t: page.title, c: category, h: page.headings.map((h) => h.text), x: page.text.slice(0, 20000) });
  }

  for (const f of fs.readdirSync(PAGES_DIR)) {
    if (!bySlug.has(f.replace(/\.json$/, ""))) fs.rmSync(path.join(PAGES_DIR, f));
  }

  // ---- File description pages: almost all are empty; render the ones that aren't.
  const prevFiles = new Map((readJson(path.join(OUT, "files.json"), { files: [] }).files ?? []).map((f) => [f.name, f]));
  for (const f of files) {
    if (!filePageLength.get(f.name)) continue;
    const prev = prevFiles.get(f.name);
    if (!FORCE && prev?.description !== undefined && prev.uploaded === f.uploaded) {
      f.description = prev.description;
      continue;
    }
    const json = await api({ action: "parse", page: `File:${f.name}`, prop: "text", disableeditsection: "1", disablelimitreport: "1" });
    const root = cleanHtml(json.parse.text, resolveLink, resolveFile);
    root.querySelectorAll("#filehistory, .filehistory, #filelinks, #mw-imagepage-section-linkstoimage").forEach((n) => n.remove());
    f.description = root.innerHTML.trim();
  }
  for (const f of files) f.usedOn = usedOn.get(f.name);

  const failed = SKIP_FILES ? [] : await downloadFiles(files);

  // Remove local files the wiki no longer has.
  const wanted = new Set(files.map((f) => f.path));
  for (const dir of fs.readdirSync(FILES_DIR, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    for (const name of fs.readdirSync(path.join(FILES_DIR, dir.name))) {
      const rel = `wiki-files/${dir.name}/${name}`;
      if (!wanted.has(rel)) fs.rmSync(path.join(FILES_DIR, dir.name, name));
    }
  }

  index.sort((a, b) => a.title.localeCompare(b.title));
  const categories = [...new Set(index.map((p) => p.category))].sort();
  const internalCategories = [...new Set(index.filter((p) => p.internal).map((p) => p.category))].sort();
  fs.writeFileSync(
    path.join(OUT, "index.json"),
    JSON.stringify({ version: VERSION, source: WIKI, license: "CC0 1.0", pages: index, categories, internalCategories, redirects }, null, 1) + "\n",
  );
  fs.writeFileSync(
    path.join(OUT, "files.json"),
    JSON.stringify({ source: WIKI, count: files.length, distinct: wanted.size, failed, files: files.map((f) => ({ ...f, url: undefined })) }) + "\n",
  );
  // Compact list for the file browser: [name, path, width, height, bytes, uploaded, usedOn?]
  fs.writeFileSync(
    path.join(FILES_DIR, "index.json"),
    JSON.stringify(files.map((f) => [f.name, f.path, f.width, f.height, f.size, f.uploaded.slice(0, 10), ...(f.usedOn ? [f.usedOn] : [])])),
  );
  fs.writeFileSync(SEARCH_FILE, JSON.stringify(search));
  extract();
  console.log(
    `Done: ${index.length} pages (${fetched} downloaded), ${Object.keys(redirects).length} redirects, ${files.length} files (${wanted.size} distinct, ${failed.length} failed).`,
  );
  // Failed downloads are reported by `npm run wiki:coverage`.
}

export { cleanHtml, extractTables, extractHeadings, textOf };

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
