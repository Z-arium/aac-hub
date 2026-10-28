// Source: https://wiki.aa-classic.com/Regrade_Rates (read 2026-10-27).
// Easy: dungeon drops. Normal: everything else. Difficult: crafted, obsidian
// and world boss gear. Failure odds above Celestial (break / downgrade) are not
// on the wiki yet, so the calculator lets the player enter them.

export const GRADES = ["Basic", "Grand", "Rare", "Arcane", "Heroic", "Unique", "Celestial", "Divine", "Epic", "Legendary", "Mythic"] as const;
export type Grade = (typeof GRADES)[number];

export const GRADE_COLORS: Record<Grade, string> = {
  Basic: "#c9c9c9",
  Grand: "#7fd66b",
  Rare: "#5aa9ff",
  Arcane: "#c77dff",
  Heroic: "#f4c542",
  Unique: "#ff9f43",
  Celestial: "#ff6b6b",
  Divine: "#e0e0ff",
  Epic: "#9b8cff",
  Legendary: "#ffb347",
  Mythic: "#ff4d8d",
};

export type Difficulty = "easy" | "normal" | "difficult" | "shipPet";

/** Success chance (%) to go from GRADES[i] to GRADES[i + 1]. */
export const RATES: Record<Difficulty, number[]> = {
  easy: [100, 100, 100, 67.5, 67.5, 47.3, 40.5, 13.5, 10.8, 4.1],
  normal: [100, 100, 100, 50, 50, 35, 30, 10, 8, 3],
  difficult: [100, 100, 100, 32.5, 32.5, 22.8, 19.5, 6.5, 5.2, 2],
  shipPet: [100, 60, 60, 60, 60, 50, 50, 40, 35, 17.5],
};

/**
 * Resplendent scroll: same success chance as a normal scroll, plus a 20% chance on
 * success to go up one extra grade. These are the wiki's two-grade-jump odds
 * (normal rate x 20%), from GRADES[i] to GRADES[i + 2]. No Ship/Pet table.
 */
export const RESPLENDENT_RATES: Record<Exclude<Difficulty, "shipPet">, number[]> = {
  easy: [20, 20, 20, 13.5, 13.5, 9.46, 8.1, 2.7, 2.16],
  normal: [20, 20, 20, 10, 10, 7, 6, 2, 1.6],
  difficult: [20, 20, 20, 6.5, 6.5, 4.56, 3.9, 1.3, 1.04],
};

/** Chance (%) that a successful Resplendent regrade goes up one extra grade. */
export const RESPLENDENT_BONUS = 20;

/** Index of Celestial: failing from this grade or above can break or downgrade. */
export const RISK_FROM = GRADES.indexOf("Celestial");
