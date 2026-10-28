// Sources: https://wiki.aa-classic.com/World_Bosses (read 2026-10-27) and the
// boss tables on https://wiki.aa-classic.com/Gilda_Star (respawn timers, Gilda).

export type BossTier = "Major" | "Normal" | "Minor";

export interface Boss {
  name: string;
  level: number;
  location: string;
  tier: BossTier;
  notes?: string;
  /** Respawn timer after a kill, for bosses on a timer. */
  respawn?: string;
  /** Gilda Stars from the daily kill quest. */
  gilda?: number;
  /** Matches an id in schedule.ts when the boss has a fixed spawn time. */
  scheduleId?: string;
}

export const BOSSES: Boss[] = [
  { tier: "Major", name: "Kraken", level: 50, location: "West of the Arcadian Sea", notes: "Giant squid. Only takes damage from ships.", gilda: 3, scheduleId: "kraken" },
  { tier: "Major", name: "Red Dragon", level: 50, location: "Karkasse Ridgelands", notes: "Several flying and ground phases.", gilda: 5, scheduleId: "red-dragon" },
  { tier: "Major", name: "Leviathan", level: 55, location: "East of the Arcadian Sea", notes: "Naval battle. You follow it through the ocean.", scheduleId: "leviathan" },
  { tier: "Major", name: "Hanure the Berserker", level: 55, location: "Hasla", notes: "Improved Hanure the Hunter. Drops a new set of weapons.", gilda: 3, scheduleId: "berserker" },
  { tier: "Major", name: "Thunderwing Titan", level: 55, location: "Reedwind", notes: "Summoned by players in Reedwind.", gilda: 4 },
  { tier: "Major", name: "Anthalon", level: 50, location: "Sungold Fields", notes: "Spawns after the Sungold Crimson Rift. Good loot for mage tanks." },
  { tier: "Major", name: "Delphinad Ghost Ship", level: 50, location: "Arcadian Sea (several spots)", notes: "Daily challenge for ships. Stays up for 12 hours.", gilda: 3, scheduleId: "delphinad-ghost-ship" },
  { tier: "Normal", name: "Hanure the Hunter", level: 55, location: "Hasla" },
  { tier: "Normal", name: "Meina & Glenn", level: 50, location: "Sungold Fields", gilda: 3 },
  { tier: "Normal", name: "Captain Rangora", level: 50, location: "Freedich Island", respawn: "8 hours", gilda: 3 },
  { tier: "Normal", name: "Dahuta's Champion Nazar", level: 50, location: "Sunspeck Sea", respawn: "4 hours", gilda: 3 },
  { tier: "Normal", name: "Morpheus the Forsaken", level: 50, location: "Growlgate Isle", respawn: "8 hours", gilda: 3 },
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

/** Field bosses on a respawn timer, from the Gilda Star page. Each kill quest gives 1 Gilda Star. */
export const FIELD_BOSSES: { name: string; location: string; respawn: string }[] = [
  { name: "Akanun the Tidelord", location: "Solzreed Peninsula", respawn: "1 hour" },
  { name: "Gilneas", location: "Solzreed Peninsula", respawn: "4 hours" },
  { name: "Castigant Reaper", location: "Solzreed Peninsula", respawn: "4 hours" },
  { name: "Gweonid Forest Spirit", location: "Gweonid Forest", respawn: "4 hours" },
  { name: "Hellhook the Impaler", location: "Lilyut Hills", respawn: "4 hours" },
  { name: "Verith's Masterpiece", location: "White Arden", respawn: "4 hours" },
  { name: "Karon the Herdlord", location: "Arcum Iris", respawn: "30 minutes" },
  { name: "Rainbow Ostrich", location: "Arcum Iris", respawn: "4 hours" },
  { name: "Skeleton Lord Jamushi", location: "Falcorth Plains", respawn: "4 hours" },
  { name: "Annulta the Yatamaton", location: "Tigerspine Mountains", respawn: "4 hours" },
  { name: "Werespider Arak", location: "Silent Forest", respawn: "4 hours" },
  { name: "Jamerath the Shadowmage", location: "Silent Forest", respawn: "4 hours" },
  { name: "Reedpipe Leader Palaxis", location: "Villanelle", respawn: "1 hour" },
  { name: "Singing Greenman Shoon", location: "Villanelle", respawn: "4 hours" },
  { name: "The General's Spirit", location: "Perinoor Ruins", respawn: "4 hours" },
  { name: "Twisted Gate Spawn", location: "Hellswamp", respawn: "6 hours" },
];

export const TIER_INFO: Record<BossTier, string> = {
  Major: "Fixed spawn times so groups can prepare.",
  Normal: "Respawn on a timer after each kill. Loot is minor but sometimes contested.",
  Minor: "Field bosses with smaller rewards.",
};
