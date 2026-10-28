import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

// The roadmap page is built from ROADMAP.md at the repo root, so ticking an
// item there (- [x]) is all it takes to update the site.

export interface RoadmapItem {
  done: boolean;
  /** Inline HTML, with the must-have / suggested tag removed. */
  html: string;
  tag?: "must-have" | "suggested";
}

export interface RoadmapSection {
  id: string;
  title: string;
  /** HTML for any text in the section that isn't a checklist item. */
  intro: string;
  items: RoadmapItem[];
}

const inline = (md: string) => marked.parseInline(md, { async: false });

export function getRoadmap() {
  const raw = fs.readFileSync(path.join(process.cwd(), "ROADMAP.md"), "utf8");
  const [head, ...parts] = raw.split(/^## /m);
  const sections = parts.map((part): RoadmapSection => {
    const [title, ...lines] = part.split("\n");
    const items: RoadmapItem[] = [];
    const rest: string[] = [];
    for (const line of lines) {
      const m = line.match(/^- \[( |x)\] (.*)$/i);
      if (!m) {
        rest.push(line);
        continue;
      }
      const tag = m[2].match(/^\*\*\((must-have|suggested)\)\*\*\s*/);
      items.push({
        done: m[1].toLowerCase() === "x",
        tag: tag?.[1] as RoadmapItem["tag"],
        html: inline(tag ? m[2].slice(tag[0].length) : m[2]),
      });
    }
    return {
      id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      title: title.trim(),
      intro: marked.parse(rest.join("\n").trim(), { async: false }),
      items,
    };
  });
  // The intro is everything under the title except the "/roadmap" note meant for editors.
  const intro = head.replace(/^# .*\n/, "").split(/\n\n/).filter((p) => !p.includes("/roadmap")).join("\n\n");
  return { intro: marked.parse(intro.trim(), { async: false }), sections };
}
