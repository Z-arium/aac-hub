// Source: https://wiki.aa-classic.com/World_Bosses (read 2026-10-27).

export type BossTier = "Major" | "Normal" | "Minor";

export interface Boss {
  name: string;
  level: number;
  location: string;
  tier: BossTier;
  notes?: string;
  /** Matches an id in schedule.ts when the boss has a fixed spawn time. */
  scheduleId?: string;
}

export const BOSSES: Boss[] = [
  { tier: "Major", name: "Kraken", level: 50, location: "West of the Arcadian Sea", notes: "Giant squid. Only takes damage from ships.", scheduleId: "kraken" },
  { tier: "Major", name: "Red Dragon", level: 50, location: "Karkasse Ridgelands", notes: "Several flying and ground phases.", scheduleId: "red-dragon" },
  { tier: "Major", name: "Leviathan", level: 55, location: "East of the Arcadian Sea", notes: "Naval battle. You follow it through the ocean.", scheduleId: "leviathan" },
  { tier: "Major", name: "Hanure the Berserker", level: 55, location: "Hasla", notes: "Improved Hanure the Hunter. Drops a new set of weapons.", scheduleId: "berserker" },
  { tier: "Major", name: "Thunderwing Titan", level: 55, location: "Reedwind", notes: "Summoned in Reedwind." },
  { tier: "Major", name: "Anthalon", level: 50, location: "Sungold Fields", notes: "Spawns after the Sungold Crimson Rift. Good loot for mage tanks." },
  { tier: "Major", name: "Delphinad Ghost Ship", level: 50, location: "Arcadian Sea (several spots)", notes: "Daily challenge for ships." },
  { tier: "Normal", name: "Hanure the Hunter", level: 55, location: "Hasla" },
  { tier: "Normal", name: "Meina & Glenn", level: 50, location: "Sungold Fields" },
  { tier: "Normal", name: "Captain Rangora", level: 50, location: "Freedich Island" },
  { tier: "Normal", name: "Dahuta's Champion Nazar", level: 50, location: "Sunspeck Sea" },
  { tier: "Normal", name: "Morpheus the Forsaken", level: 50, location: "Growlgate Isle" },
  { tier: "Normal", name: "Zaldrane the Enchantress", level: 50, location: "Hellswamp" },
  { tier: "Normal", name: "Hounds of Kyrios", level: 50, location: "Cinderstone Moor, Ynystere" },
  { tier: "Minor", name: "Croakfiend", level: 40, location: "Hellswamp" },
  { tier: "Minor", name: "Daruda the Watcher", level: 55, location: "Cinderstone Moor" },
  { tier: "Minor", name: "Goretusk the Leveler", level: 55, location: "Windscour Savannah" },
  { tier: "Minor", name: "Farkrag the Wanderer", level: 30, location: "Gweonid Forest, Falcorth Plains" },
  { tier: "Minor", name: "Tarian the Grim", level: 30, location: "Dewstone Plains" },
  { tier: "Minor", name: "Windlord", level: 30, location: "Arcum Iris, Lilyut Hills" },
  { tier: "Minor", name: "Flamelord", level: 30, location: "Solis Headlands" },
];

export const TIER_INFO: Record<BossTier, string> = {
  Major: "Fixed spawn times so groups can prepare.",
  Normal: "Respawn on a timer after each kill. Loot is minor but sometimes contested.",
  Minor: "Field bosses with smaller rewards.",
};
