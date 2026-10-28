import fs from "node:fs";
import path from "node:path";

// Reads the AAClassic wiki import written by scripts/wiki-import (run
// `npm run wiki:import`). Everything here is CC0 content from
// https://wiki.aa-classic.com; each page keeps a link back to its source.

const DIR = path.join(process.cwd(), "content", "wiki");

export interface WikiPageMeta {
  slug: string;
  title: string;
  category: string;
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
  headings: { level: number; id: string; text: string }[];
  tables: WikiTable[];
  text: string;
  html: string;
}

interface WikiIndex {
  source: string;
  license: string;
  pages: WikiPageMeta[];
  categories: string[];
  redirects: Record<string, string>;
}

let cached: WikiIndex | undefined;

export function getWikiIndex(): WikiIndex {
  if (!cached) {
    const file = path.join(DIR, "index.json");
    cached = fs.existsSync(file)
      ? JSON.parse(fs.readFileSync(file, "utf8"))
      : { source: "https://wiki.aa-classic.com", license: "CC0 1.0", pages: [], categories: [], redirects: {} };
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
export function getWikiRedirect(slug: string): string | undefined {
  return getWikiIndex().redirects[slug];
}

export function categorySlug(category: string): string {
  return category.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function getWikiCategories(): { name: string; slug: string; pages: WikiPageMeta[] }[] {
  const pages = getWikiPages();
  return getWikiIndex()
    .categories.map((name) => ({ name, slug: categorySlug(name), pages: pages.filter((p) => p.category === name) }))
    .sort((a, b) => (a.name === "General" ? 1 : b.name === "General" ? -1 : b.pages.length - a.pages.length));
}

/** Tables from a wiki page, for tools that read game data from the wiki. */
export function getWikiTables(slug: string): WikiTable[] {
  return getWikiPage(slug)?.tables ?? [];
}

export function formatWikiDate(iso: string): string {
  return iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }) : "";
}
