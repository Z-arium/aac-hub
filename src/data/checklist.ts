import { WEEKDAY_NAMES, WEEKLY_TOKEN_EVENTS, type Weekday } from "./schedule";

// Daily and weekly tasks for the checklist tool. The list follows the DailyAge
// addon (github.com/michaelqtz/aac-addon-dailyage) and the wiki pages linked
// on each task. Ids are saved in people's progress and settings, so don't
// rename them.

export interface ChecklistTask {
  id: string;
  label: string;
  note?: string;
  category: string;
  /** Weekly tasks reset at the daily reset on this UTC day. Daily if unset. */
  resetDay?: Weekday;
  gilda?: number;
  tokens?: number;
  /** Slug of a page in our wiki mirror. */
  wiki?: string;
}

export interface ChecklistCategory {
  id: string;
  name: string;
  blurb: string;
}

export const CATEGORIES: ChecklistCategory[] = [
  { id: "rifts", name: "Rifts & PvE events", blurb: "Honor, Leadership and Gilda from the raids that run all day." },
  { id: "pvp", name: "PvP", blurb: "Honor, Warrior Medals and Leadership." },
  { id: "gilda", name: "Gilda Stars", blurb: "Daily quests that pay Gilda Stars." },
  { id: "bosses", name: "World bosses", blurb: "Daily boss kill quests. Most pay 3 Gilda Stars." },
  { id: "library", name: "Library & dungeons", blurb: "Ayanad Library floors and dungeon board dailies." },
  { id: "guild", name: "Guild missions", blurb: "Prestige and guild XP." },
  { id: "tokens", name: "Weekly Activity Tokens", blurb: "Picked up on one day, done any time that week." },
  { id: "chores", name: "Chores", blurb: "Things that are easy to forget." },
];

const DAILY: ChecklistTask[] = [
  // Rifts & PvE
  { id: "cr", category: "rifts", label: "Crimson Rift", note: "3 stage quests (Crimson Omens): 1,000 Honor and 10 Leadership", gilda: 3, wiki: "world-events" },
  { id: "cr-hound", category: "rifts", label: "Crimson Rift: kill a Hound of Kyrios", note: "Also 2 Clear Synthium Shards and 7 Growthstones", gilda: 3, wiki: "gilda-star" },
  { id: "anthalon", category: "rifts", label: "Anthalon", note: "Spawns after the Sungold Fields Crimson Rift", gilda: 3, wiki: "world-bosses" },
  { id: "gr", category: "rifts", label: "Grimgast Rift", note: "Construction quest, then 2 stage quests (Halting the Crimson Tide)", gilda: 8, wiki: "world-events" },
  { id: "gr-bosses", category: "rifts", label: "Grimgast Rift: kill both Nightmares", note: "Nightmare Blade and Nightmare Bowstring, 3 Gilda each", gilda: 6, wiki: "gilda-star" },
  { id: "whalesong", category: "rifts", label: "Whalesong Siege", note: "3 waves, then Jakar. 20 Leadership", gilda: 3, wiki: "gilda-star" },
  { id: "aegis", category: "rifts", label: "Aegis Island", note: "3 waves, then the Final Sealbreaker. 20 Leadership", gilda: 4, wiki: "gilda-star" },
  { id: "ocleera", category: "rifts", label: "Ocleera Rift", note: "3 mark quests and the Hateful Ocleera, west Diamond Shores. Prestige and 10 Leadership", wiki: "prestige" },
  { id: "comet", category: "rifts", label: "Comet Rift (Starfall)", note: "3 rift stages, then the Undying Flame. Comet Shards", wiki: "starfall" },

  // PvP
  { id: "mistmerrow", category: "pvp", label: "Mistmerrow", note: "Entry quests at the capital portal, then the towers. 10 Leadership", wiki: "world-events" },
  { id: "kadum", category: "pvp", label: "Mistmerrow: gates and Kadum", note: "After the battle, from the NPCs in the middle", gilda: 4, wiki: "world-events" },
  { id: "halcyona", category: "pvp", label: "Halcyona War", note: "10 enemy kills (shared in a raid). 10 Leadership", wiki: "world-events" },
  { id: "luscas", category: "pvp", label: "Luscas Awakening", note: "Quest at Ezi's Light. Kill 5 Lusca for another Gilda", gilda: 2, wiki: "world-events" },
  { id: "abyssal", category: "pvp", label: "Abyssal Attack", note: "Becoming a Seaknight and Stopping Doomsday", wiki: "abyssal-attack" },
  { id: "arena", category: "pvp", label: "Arena: Blood, Sweat and Training" },

  // Gilda Stars
  { id: "blue-salt", category: "gilda", label: "Blue Salt dailies", note: "Animal raising, perfume, vases and more, east or west", gilda: 5, wiki: "gilda-star" },
  { id: "ds-construction", category: "gilda", label: "Diamond Shores bridge and wall", gilda: 2, wiki: "gilda-star" },
  { id: "ahnimar", category: "gilda", label: "Ahnimar: water the Darus", gilda: 1, wiki: "gilda-star" },
  { id: "meals", category: "gilda", label: "4 meals at a workstation", gilda: 4, wiki: "gilda-star" },
  { id: "farmhouse", category: "gilda", label: "Farmhouse quests", gilda: 2, wiki: "gilda-star" },
  { id: "tradesman", category: "gilda", label: "Tradesman, Apothecary or Armorer quests", gilda: 2, wiki: "gilda-star" },
  { id: "proficiency", category: "gilda", label: "Proficiency quests", note: "Mining, gathering, farming, husbandry: 1 Gilda each", gilda: 4, wiki: "gilda-star" },
  { id: "seabugs", category: "gilda", label: "Enemies of Sea Trade (seabugs)", gilda: 1, wiki: "gilda-star" },
  { id: "ocean-ghosts", category: "gilda", label: "Ocean dailies: Ghosts from the Depths, Calming the Ocean's Malice" },

  // World bosses
  { id: "ghost-ship-daily", category: "bosses", label: "Delphinad Ghost Ship", note: "Ghost Ships of Delphinad quest", gilda: 3, wiki: "world-bosses" },
  { id: "jola", category: "bosses", label: "The Prophecy: Jola", gilda: 3, wiki: "gilda-star" },
  { id: "meina", category: "bosses", label: "The Prophecy: Meina", gilda: 3, wiki: "gilda-star" },
  { id: "glenn", category: "bosses", label: "The Prophecy: Glenn", gilda: 3, wiki: "gilda-star" },
  { id: "large-boss", category: "bosses", label: "Large world boss kill quest", note: "Rangora, Nazar, Morpheus, Hanure and others", gilda: 3, wiki: "gilda-star" },
  { id: "minor-boss", category: "bosses", label: "Minor world boss kill quests", note: "1 Gilda each", gilda: 1, wiki: "gilda-star" },

  // Library & dungeons
  { id: "library-1", category: "library", label: "Library floor 1 dailies", note: "3 quests", wiki: "ayanad-library" },
  { id: "library-2", category: "library", label: "Library floor 2 dailies", note: "3 quests", wiki: "ayanad-library" },
  { id: "library-3", category: "library", label: "Library floor 3 dailies", note: "3 quests", wiki: "ayanad-library" },
  { id: "ayanad-agent", category: "library", label: "Ayanad Agent quests", note: "3 quests across all floors", wiki: "ayanad-library" },
  { id: "dungeons", category: "library", label: "Dungeon board dailies", note: "Mistmight Stones; greater dungeons give Sunstrength Stones", wiki: "ynystere-ring" },

  // Guild
  { id: "colonize", category: "guild", label: "Colonizing Auroria", note: "Archeum bundle quest in your Diamond Shores base (A Grand Construction)", wiki: "prestige" },
  { id: "defend", category: "guild", label: "Defending Auroria", note: "Destroy an Alemine bunker with the harpoon cannons", wiki: "prestige" },
  { id: "experia", category: "guild", label: "Gather Experia patches", wiki: "prestige" },
  { id: "guild-boss", category: "guild", label: "Guild mission: kill a world boss", wiki: "prestige" },

  // Chores
  { id: "aaa", category: "chores", label: "Active Adventurers Appreciated", note: "Daily merit quest: spend labor on a profession", tokens: 5, wiki: "active-adventurers-appreciated" },
  { id: "labor", category: "chores", label: "Spend labor before it caps", note: "Labor caps at 10,000" },
];

const WEEKLY: ChecklistTask[] = WEEKLY_TOKEN_EVENTS.map((e) => ({
  id: e.id,
  category: "tokens",
  label: e.name,
  note: `Pick up on ${WEEKDAY_NAMES[e.day]}. ${e.where}`,
  resetDay: e.day,
  tokens: e.tokens,
  wiki: "activity-tokens",
}));

export const TASKS: ChecklistTask[] = [...DAILY, ...WEEKLY];

/** What sits in "Main" until someone picks their own. */
export const DEFAULT_PINNED = ["aaa", "cr", "gr", "mistmerrow", "labor", ...WEEKLY.map((t) => t.id)];
