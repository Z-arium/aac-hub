// Source: https://wiki.aa-classic.com/Halcyona_Necklace (read 2026-10-28).
// Crafted and upgraded at the Proven Warrior Workbench in either faction base.

export interface NecklaceRank {
  rank: number;
  name: string;
  medals: number;
  wisps: number;
}

const base: NecklaceRank[] = [
  { rank: 1, name: "Proven Warrior Necklace", medals: 3, wisps: 0 },
  { rank: 2, name: "Brass Proven Warrior Necklace", medals: 6, wisps: 0 },
  { rank: 3, name: "Bronze Proven Warrior Necklace", medals: 9, wisps: 0 },
  { rank: 4, name: "Silver Proven Warrior Necklace", medals: 12, wisps: 0 },
  { rank: 5, name: "Gold Proven Warrior Necklace", medals: 15, wisps: 0 },
  { rank: 6, name: "Platinum Proven Warrior Necklace", medals: 15, wisps: 0 },
  { rank: 7, name: "Amethyst Proven Warrior Necklace", medals: 15, wisps: 0 },
];

function upper(line: "Daeier" | "Evernight"): NecklaceRank[] {
  return [
    { rank: 8, name: `Sealed Jade ${line} Necklace`, medals: 15, wisps: 0 },
    { rank: 9, name: `Sealed Diamond ${line} Necklace`, medals: 15, wisps: 0 },
    { rank: 10, name: `Sealed Archeum ${line} Necklace`, medals: 15, wisps: 0 },
    { rank: 11, name: `Sealed Archeum ${line} Necklace`, medals: 15, wisps: 1 },
    { rank: 12, name: `Sealed Archeum ${line} Necklace`, medals: 15, wisps: 2 },
    { rank: 13, name: `Sealed Archeum ${line} Necklace`, medals: 15, wisps: 6 },
  ];
}

export const NECKLACE_PATHS = {
  Daeier: [...base, ...upper("Daeier")],
  Evernight: [...base, ...upper("Evernight")],
};

export type NecklacePath = keyof typeof NECKLACE_PATHS;

/** Above this rank a failed upgrade can drop the necklace back to rank 7. It is never destroyed. */
export const SAFE_RANK = 7;
