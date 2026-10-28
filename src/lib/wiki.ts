import fs from "node:fs";
import path from "node:path";

// Reads the AAClassic wiki import written by scripts/wiki-import (run
// `npm run wiki:import`). Everything here is CC0 content from
// https://wiki.aa-classic.com; each page keeps a link back to its source.

const DIR = path.join(process.cwd(), "content", "wiki");

export interface WikiPageMeta {
  slug: string;
  title: string;
  /** MediaWiki namespace: 0 articles, 2 users, 8 settings, 10 templates, 828 modules. */
  ns: number;
  category: string;
  /** Templates, modules, user pages and other wiki plumbing. */
  internal: boolean;
  summary: string;
  updated: string;
  source: string;
  words: number;
}

export interface WikiTable {
  heading: string;
  caption: string;
  headers: string[];
  rows: string[][];
}

export interface WikiPage extends WikiPageMeta {
  pageid: number;
  revid: number;
  /** Content model: "wikitext", "Scribunto" (Lua), "css", "javascript", "json"… */
  model: string;
  /** Files the page shows. */
  images: string[];
  /** The page's source as stored on the wiki. */
  wikitext: string;
  headings: { level: number; id: string; text: string }[];
  tables: WikiTable[];
  text: string;
  html: string;
}

export interface WikiRedirect {
  to: string;
  from: string;
  fragment?: string;
}

interface WikiIndex {
  source: string;
  license: string;
  pages: WikiPageMeta[];
  categories: string[];
  internalCategories: string[];
  redirects: Record<string, WikiRedirect>;
}

let cached: WikiIndex | undefined;

export function getWikiIndex(): WikiIndex {
  if (!cached) {
    const file = path.join(DIR, "index.json");
    cached = fs.existsSync(file)
      ? JSON.parse(fs.readFileSync(file, "utf8"))
      : { source: "https://wiki.aa-classic.com", license: "CC0 1.0", pages: [], categories: [], internalCategories: [], redirects: {} };
  }
  return cached!;
}

export function getWikiPages(): WikiPageMeta[] {
  return getWikiIndex().pages;
}

export function getWikiPage(slug: string): WikiPage | undefined {
  const meta = getWikiPages().find((p) => p.slug === slug);
  if (!meta) return undefined;
  const page = JSON.parse(fs.readFileSync(path.join(DIR, "pages", `${slug}.json`), "utf8"));
  return { ...page, ...meta };
}

/** Where an old or alternate title now lives, if the wiki redirects it. */
export function getWikiRedirect(slug: string): WikiRedirect | undefined {
  return getWikiIndex().redirects[slug];
}

export function categorySlug(category: string): string {
  return category.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export interface WikiCategory {
  name: string;
  slug: string;
  internal: boolean;
  pages: WikiPageMeta[];
}

/** Every category, articles first; `internal` ones hold templates, modules and the like. */
export function getWikiCategories(): WikiCategory[] {
  const { pages, categories, internalCategories = [] } = getWikiIndex();
  return categories
    .map((name) => ({
      name,
      slug: categorySlug(name),
      internal: internalCategories.includes(name),
      pages: pages.filter((p) => p.category === name),
    }))
    .sort((a, b) => (a.name === "General" ? 1 : b.name === "General" ? -1 : b.pages.length - a.pages.length));
}

/** Tables from a wiki page, for tools that read game data from the wiki. */
export function getWikiTables(slug: string): WikiTable[] {
  return getWikiPage(slug)?.tables ?? [];
}

export function formatWikiDate(iso: string): string {
  return iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }) : "";
}

/** Articles a reader would browse: everything outside the wiki's plumbing. */
export function getWikiArticles(): WikiPageMeta[] {
  return getWikiPages().filter((p) => !p.internal);
}

export interface WikiCoverage {
  checked: string;
  complete: boolean;
  statistics: { pages: number; articles: number; images: number; edits: number; users: number };
  namespaces: {
    id: number;
    name: string;
    wikiPages: number;
    mirrored: number;
    wikiRedirects: number;
    redirectsMirrored: number;
    missing: string[];
    missingRedirects: string[];
  }[];
  files: { wiki: number; verified: number; distinctOnDisk: number; megabytes: number };
  totals: { wikiPagesAllNamespaces: number; statisticsPages: number; mirroredPages: number; mirroredRedirects: number; mirroredFiles: number };
  brokenOnWiki: Record<string, string[]>;
  problems: string[];
  notes: string[];
}

/** The last completeness check (scripts/wiki-import/coverage.mjs), if one has run. */
export function getWikiCoverage(): WikiCoverage | undefined {
  const file = path.join(DIR, "coverage.json");
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : undefined;
}

/** Imported HTML uses root-relative links; add the deploy base path to them. */
export function withBasePath(html: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return base ? html.replace(/(href|src)="\/(wiki|wiki-files)\//g, `$1="${base}/$2/`) : html;
}
