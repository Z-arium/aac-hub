import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

const DIR = path.join(process.cwd(), "content", "guides");

export interface Guide {
  slug: string;
  title: string;
  summary: string;
  category: string;
  featured: boolean;
  updated: string;
  sources: string[];
  body: string;
}

function parse(slug: string, raw: string): Guide {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`Guide ${slug} is missing frontmatter`);
  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return {
    slug,
    title: meta.title ?? slug,
    summary: meta.summary ?? "",
    category: meta.category ?? "General",
    featured: meta.featured === "true",
    updated: meta.updated ?? "",
    sources: (meta.sources ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    body: match[2],
  };
}

export function getGuides(): Guide[] {
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => parse(f.replace(/\.md$/, ""), fs.readFileSync(path.join(DIR, f), "utf8")))
    .sort((a, b) => b.updated.localeCompare(a.updated) || a.title.localeCompare(b.title));
}

export function getGuide(slug: string): Guide | undefined {
  return getGuides().find((g) => g.slug === slug);
}

export function renderMarkdown(md: string): string {
  const html = marked.parse(md, { async: false });
  // Site-relative links in markdown are raw anchors, so add the deploy base path
  // (e.g. /aac-hub on GitHub Pages) that next/link would otherwise add.
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return base ? html.replace(/href="\/(?!\/)/g, `href="${base}/`) : html;
}
