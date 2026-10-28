import fs from "node:fs";
import path from "node:path";

// Game data pulled out of wiki tables by scripts/wiki-import/extract.mjs.
// Server-only: read it in a page or server component and pass it down.

const DIR = path.join(process.cwd(), "content", "wiki", "data");

function read<T>(name: string): T | undefined {
  const file = path.join(DIR, `${name}.json`);
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as T) : undefined;
}

export interface WikiRegrade {
  source: string;
  revid: number;
  grades: string[];
  /** Success % from grades[i] to grades[i + 1], by difficulty (easy, normal, difficult, shipPet). */
  rates: Record<string, number[]>;
  /** Resplendent scroll: success % from grades[i] to grades[i + 2]. */
  resplendent: Record<string, number[]>;
}

export interface WikiBoss {
  name: string;
  level: number | null;
  location: string;
  tier: "Major" | "Normal" | "Minor";
  description: string;
}

export const getWikiRegrade = () => read<WikiRegrade>("regrade");
export const getWikiBosses = () => read<{ source: string; revid: number; bosses: WikiBoss[] }>("bosses");
