import { TREE_SKILLS } from "@/data/skills";
import { SKILL_TREES } from "@/data/skillTrees";

// A build lives in the page URL so it can be shared as a link:
//   ?trees=Sorcery,Occultism,Witchcraft&s=1k3.9z.0&name=My+build
// `s` holds one base-36 bitmask per tree, in the same order as `trees`.
// Bits 0-11 are the active skills and bits 12+ the passives, by position in
// src/data/skills.ts.

export interface TreePicks {
  active: number[];
  passive: number[];
}

export interface Build {
  name: string;
  trees: string[];
  picks: Record<string, TreePicks>;
}

const ACTIVE_BITS = 12;

const empty = (): TreePicks => ({ active: [], passive: [] });

function decodeMask(tree: string, code: string | undefined): TreePicks {
  const skills = TREE_SKILLS[tree];
  const mask = parseInt(code ?? "", 36);
  if (!skills || !Number.isFinite(mask)) return empty();
  const has = (bit: number) => Math.floor(mask / 2 ** bit) % 2 === 1;
  return {
    active: skills.active.map((_, i) => i).filter((i) => has(i)),
    passive: skills.passive.map((_, i) => i).filter((i) => has(ACTIVE_BITS + i)),
  };
}

function encodeMask(p: TreePicks) {
  const mask = [...p.active, ...p.passive.map((i) => ACTIVE_BITS + i)].reduce((m, bit) => m + 2 ** bit, 0);
  return mask.toString(36);
}

export function decodeBuild(params: URLSearchParams): Build {
  const trees = (params.get("trees") ?? "")
    .split(",")
    .filter((t, i, all) => SKILL_TREES.some((s) => s.name === t) && all.indexOf(t) === i)
    .slice(0, 3);
  const codes = (params.get("s") ?? "").split(".");
  return {
    name: (params.get("name") ?? "").slice(0, 60),
    trees,
    picks: Object.fromEntries(trees.map((t, i) => [t, decodeMask(t, codes[i])])),
  };
}

export function encodeBuild(b: Build) {
  const qs = new URLSearchParams();
  if (b.trees.length) qs.set("trees", b.trees.join(","));
  const codes = b.trees.map((t) => encodeMask(b.picks[t] ?? empty()));
  if (codes.some((c) => c !== "0")) qs.set("s", codes.join("."));
  if (b.name.trim()) qs.set("name", b.name.trim());
  // Keep the commas readable in shared links.
  return qs.toString().replaceAll("%2C", ",");
}

/** Skills and passives picked in one tree. */
export const pickedIn = (p: TreePicks | undefined) => (p ? p.active.length + p.passive.length : 0);

export interface SavedBuild {
  id: string;
  name: string;
  className: string;
  query: string;
  saved: number;
}

const STORAGE_KEY = "aac-builds";

export function loadSavedBuilds(): SavedBuild[] {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function storeSavedBuilds(list: SavedBuild[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}
