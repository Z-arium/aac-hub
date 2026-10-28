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
  /** One of our guides, as "slug#section". */
  guide?: string;
  /** Ids of scheduled events in schedule.ts; the task shows the next start. */
  events?: string[];
  /** Where it falls in the day's route. Set from ROUTE below. */
  phase: Phase;
}

export type Phase = "start" | "scheduled" | "rifts" | "anytime";

export const PHASES: { id: Phase; name: string; blurb: string }[] = [
  { id: "start", name: "Start of day", blurb: "Log in and get the quick ones going first." },
  { id: "scheduled", name: "Scheduled events", blurb: "Sorted by what starts next, in your local time." },
  { id: "rifts", name: "Rifts", blurb: "Run every 4 real hours on the in-game clock. Watch faction chat for \"x cr\", \"x gr\", \"x ws\"." },
  { id: "anytime", name: "Between events", blurb: "Fill the gaps with these." },
];

// The order of a well-planned day. Every task id appears exactly once.
const ROUTE: Record<Phase, string[]> = {
  start: ["login", "aaa", "guild-start", "experia", "colonize", "ds-construction", "ahnimar", "meals", "farmhouse", "tradesman", "proficiency"],
  scheduled: ["mistmerrow", "kadum", "halcyona", "luscas", "abyssal", "ghost-ship-daily", "ghost-ship", "large-boss"],
  rifts: ["cr", "cr-hound", "anthalon", "crimson-threat", "gr", "gr-bosses", "whalesong", "aegis", "ocleera", "comet"],
  anytime: ["blue-salt", "ocean-ghosts", "seabugs", "jola", "meina", "glenn", "minor-boss", "guild-boss", "defend", "library-1", "library-2", "library-3", "ayanad-agent", "library", "dungeons", "arena", "bloodbath", "fish-market"],
};

type TaskData = Omit<ChecklistTask, "phase">;

export interface ChecklistCategory {
  id: string;
  name: string;
  blurb: string;
}

export const CATEGORIES: ChecklistCategory[] = [
  { id: "routine", name: "Daily routine", blurb: "The first things to do each day." },
  { id: "rifts", name: "Rifts & PvE events", blurb: "Honor, Leadership and Gilda from the raids that run all day." },
  { id: "pvp", name: "PvP", blurb: "Honor, Warrior Medals and Leadership." },
  { id: "gilda", name: "Gilda Stars", blurb: "Daily quests that pay Gilda Stars." },
  { id: "bosses", name: "World bosses", blurb: "Daily boss kill quests. Most pay 3 Gilda Stars." },
  { id: "library", name: "Library & dungeons", blurb: "Ayanad Library floors and dungeon board dailies." },
  { id: "guild", name: "Guild missions", blurb: "Prestige and guild XP." },
  { id: "tokens", name: "Activity Tokens", blurb: "The daily merit quest, and weekly quests you pick up on one day and finish any time that week." },
];

const DAILY: TaskData[] = [
  // Daily routine
  { id: "login", category: "routine", label: "Log in and claim your login reward", note: "Daily Schedule (bottom right), Login Tracker tab", wiki: "user-interface", guide: "daily-routine#log-in-and-claim-your-login-reward" },
  { id: "guild-start", category: "routine", label: "Start your guild missions", note: "Prestige and guild XP. Needs a guild", wiki: "prestige", guide: "guild-missions#start-your-guild-missions" },

  // Rifts & PvE
  { id: "cr", category: "rifts", label: "Crimson Rift", note: "Recruiter at the rift. 3 waves (Crimson Omens): 1,000 Honor and 10 Leadership", gilda: 3, wiki: "world-events", guide: "daily-world-events#crimson-rift" },
  { id: "cr-hound", category: "rifts", label: "Crimson Rift: kill a Hound of Kyrios", note: "Also 2 Clear Synthium Shards and 7 Growthstones", gilda: 3, wiki: "gilda-star", guide: "daily-world-events#hound-of-kyrios" },
  { id: "anthalon", category: "rifts", label: "Anthalon", note: "Spawns after the Sungold Fields Crimson Rift", gilda: 3, wiki: "world-bosses", guide: "daily-world-events#anthalon" },
  { id: "gr", category: "rifts", label: "Grimgast Rift", note: "Materials quest at the Community Center board, 2 packs to the trebuchet, then 2 harpoon waves", gilda: 8, wiki: "world-events", guide: "daily-world-events#grimgast-rift" },
  { id: "gr-bosses", category: "rifts", label: "Grimgast Rift: kill both Nightmares", note: "Nightmare Blade and Nightmare Bowstring, 3 Gilda each", gilda: 6, wiki: "gilda-star", guide: "daily-world-events#grimgast-nightmares" },
  { id: "whalesong", category: "rifts", label: "Whalesong Siege", note: "Raiko in Whalesong Harbor. 3 waves, then Possessed Jakar. 20 Leadership", gilda: 4, wiki: "gilda-star", guide: "daily-world-events#whalesong-siege" },
  { id: "aegis", category: "rifts", label: "Aegis Island", note: "Scout Gaon on Aegis Island. 3 seals, then the Final Sealbreaker. 20 Leadership", gilda: 4, wiki: "gilda-star", guide: "daily-world-events#aegis-island" },
  { id: "ocleera", category: "rifts", label: "Ocleera Rift", note: "Scout Karlsburg, Riven Gates in west Diamond Shores. 3 mark quests, then the Hateful Ocleera", wiki: "prestige", guide: "daily-world-events#ocleera-rift" },
  { id: "comet", category: "rifts", label: "Comet Rift (Starfall)", note: "3 rift stages, then the Undying Flame. Comet Shards", wiki: "starfall", guide: "daily-world-events#comet-rift" },

  // PvP
  { id: "mistmerrow", category: "pvp", label: "Mistmerrow", note: "Entry quests at the capital portal, then the towers. 10 Leadership", wiki: "world-events", events: ["mistmerrow"], guide: "daily-world-events#mistmerrow" },
  { id: "kadum", category: "pvp", label: "Mistmerrow: gates and Kadum", note: "After the battle, from the NPCs in the middle", gilda: 4, wiki: "world-events", events: ["mistmerrow"], guide: "daily-world-events#mistmerrow-gates-and-kadum" },
  { id: "halcyona", category: "pvp", label: "Halcyona War", note: "10 enemy kills (shared in a raid). 10 Leadership", wiki: "world-events", events: ["halcyona"], guide: "daily-world-events#halcyona-war" },
  { id: "luscas", category: "pvp", label: "Luscas Awakening", note: "Seamist Researcher at Ezi's Light. Kill 5 Lusca for another Gilda", gilda: 2, wiki: "world-events", events: ["luscas"], guide: "daily-world-events#luscas" },
  { id: "abyssal", category: "pvp", label: "Abyssal Attack", note: "Abyssal Attack Recruiter: Becoming a Seaknight and Stopping Doomsday", wiki: "abyssal-attack", events: ["abyssal-attack"], guide: "daily-world-events#abyssal-attack" },
  { id: "arena", category: "pvp", label: "Arena: Blood, Sweat, and Training", note: "Gladiator Arena Manager in Marianople, Austera, Seachild Wharf, Caernord or Growlgate. Fight one arena match", guide: "daily-world-events#arena" },

  // Gilda Stars
  { id: "blue-salt", category: "gilda", label: "Blue Salt dailies", note: "5 quests in the Blue Salt towns: animal raising, perfume, vases and more", gilda: 5, wiki: "gilda-star", guide: "gilda-stars#blue-salt-dailies" },
  { id: "ds-construction", category: "gilda", label: "Diamond Shores bridge and wall", gilda: 2, wiki: "gilda-star", guide: "guild-missions#colonizing-auroria" },
  { id: "ahnimar", category: "gilda", label: "Ahnimar: water the Darus", gilda: 1, wiki: "gilda-star", guide: "gilda-stars#ahnimar-watering-the-darus" },
  { id: "meals", category: "gilda", label: "4 meals at a workstation", gilda: 4, wiki: "gilda-star", guide: "gilda-stars#workstation-meals" },
  { id: "farmhouse", category: "gilda", label: "Farmhouse quests", gilda: 2, wiki: "gilda-star", guide: "gilda-stars#farmhouse-quests" },
  { id: "tradesman", category: "gilda", label: "Tradesman, Apothecary or Armorer quests", gilda: 2, wiki: "gilda-star", guide: "gilda-stars#tradesman-apothecary-and-armorer-quests" },
  { id: "proficiency", category: "gilda", label: "Proficiency quests", note: "Mining, gathering, farming, husbandry: 1 Gilda each", gilda: 4, wiki: "gilda-star", guide: "gilda-stars#proficiency-quests" },
  { id: "seabugs", category: "gilda", label: "Enemies of Sea Trade (seabugs)", note: "Martus, Suiharan, Bormas, Elle or Sorgo", gilda: 1, wiki: "gilda-star", guide: "gilda-stars#enemies-of-sea-trade" },
  { id: "ocean-ghosts", category: "gilda", label: "Ghosts from the Depths", note: "Any Archeologist. Sink a roaming ghost ship", gilda: 1, guide: "gilda-stars#ghosts-from-the-depths" },

  // World bosses
  { id: "ghost-ship-daily", category: "bosses", label: "Delphinad Ghost Ship", note: "Ghost Ships of Delphinad, from any Archeologist", gilda: 3, wiki: "world-bosses", events: ["delphinad-ghost-ship"], guide: "gilda-stars#delphinad-ghost-ship" },
  { id: "jola", category: "bosses", label: "The Prophecy: Jola", gilda: 3, wiki: "gilda-star", guide: "gilda-stars#jola-meina-and-glenn" },
  { id: "meina", category: "bosses", label: "The Prophecy: Meina", gilda: 3, wiki: "gilda-star", guide: "gilda-stars#jola-meina-and-glenn" },
  { id: "glenn", category: "bosses", label: "The Prophecy: Glenn", gilda: 3, wiki: "gilda-star", guide: "gilda-stars#jola-meina-and-glenn" },
  { id: "large-boss", category: "bosses", label: "Large world boss kill quest", note: "Rangora, Nazar, Morpheus, Hanure and others", gilda: 3, wiki: "gilda-star", events: ["red-dragon", "kraken", "berserker"], guide: "gilda-stars#large-world-bosses" },
  { id: "minor-boss", category: "bosses", label: "Minor world boss kill quests", note: "1 Gilda each", gilda: 1, wiki: "gilda-star", guide: "gilda-stars#minor-world-bosses" },

  // Library & dungeons
  { id: "library-1", category: "library", label: "Library floor 1 dailies", note: "Ayanad Library Task Board on floor 1. 3 quests", wiki: "ayanad-library", guide: "ayanad-library-dailies#floor-1-dailies" },
  { id: "library-2", category: "library", label: "Library floor 2 dailies", note: "Lemian on floor 2. 3 quests", wiki: "ayanad-library", guide: "ayanad-library-dailies#floor-2-dailies" },
  { id: "library-3", category: "library", label: "Library floor 3 dailies", note: "3 quests", wiki: "ayanad-library", guide: "ayanad-library-dailies#floor-3-dailies" },
  { id: "ayanad-agent", category: "library", label: "Ayanad Agent quests", note: "Ayanad Disciple, Lemian or Bresgo. 3 quests", wiki: "ayanad-library", guide: "ayanad-library-dailies#ayanad-agent-quests" },
  { id: "dungeons", category: "library", label: "Dungeon board dailies", note: "Mistmight Stones; greater dungeons give Sunstrength Stones", wiki: "ynystere-ring", guide: "ayanad-library-dailies#dungeon-board-dailies" },

  // Guild
  { id: "colonize", category: "guild", label: "Colonizing Auroria", note: "Craft an Archeum bundle and deliver it in your Diamond Shores base", wiki: "prestige", guide: "guild-missions#colonizing-auroria" },
  { id: "defend", category: "guild", label: "Defending Auroria", note: "Destroy an Alemine bunker with the harpoon cannons", wiki: "prestige", guide: "guild-missions#defending-auroria" },
  { id: "experia", category: "guild", label: "Gather Experia patches", note: "Harvest the patches you planted yesterday, then replant for tomorrow", wiki: "prestige", guide: "guild-missions#gather-experia-patches" },
  { id: "guild-boss", category: "guild", label: "Guild mission: kill a world boss", wiki: "prestige", guide: "guild-missions#kill-a-world-boss" },

  // Activity Tokens
  { id: "aaa", category: "tokens", label: "Active Adventurers Appreciated", note: "Daily merit quest: spend labor on a profession", tokens: 5, wiki: "active-adventurers-appreciated", guide: "weekly-activity-tokens#active-adventurers-appreciated" },
];

const WEEKLY_GUIDE: Record<string, string> = {
  "ghost-ship": "weekly-activity-tokens#have-you-ever-seen-a-ghost",
  "crimson-threat": "weekly-activity-tokens#the-crimson-threat",
  "library": "weekly-activity-tokens#ayanad-library",
  "bloodbath": "weekly-activity-tokens#the-crystalline-bloodbath",
  "fish-market": "weekly-activity-tokens#preparing-for-the-fish-market",
};

const WEEKLY: TaskData[] = WEEKLY_TOKEN_EVENTS.map((e) => ({
  id: e.id,
  category: "tokens",
  label: e.name,
  note: `Pick up on ${WEEKDAY_NAMES[e.day]}. ${e.where}`,
  resetDay: e.day,
  tokens: e.tokens,
  wiki: "activity-tokens",
  guide: WEEKLY_GUIDE[e.id],
  ...(e.id === "ghost-ship" && { events: ["delphinad-ghost-ship"] }),
}));

const ORDER = (Object.keys(ROUTE) as Phase[]).flatMap((phase) => ROUTE[phase].map((id) => ({ id, phase })));

/** Every task, in route order. */
export const TASKS: ChecklistTask[] = ORDER.map(({ id, phase }) => {
  const task = [...DAILY, ...WEEKLY].find((t) => t.id === id);
  if (!task) throw new Error(`ROUTE names unknown checklist task ${id}`);
  return { ...task, phase };
});
if (TASKS.length !== DAILY.length + WEEKLY.length) throw new Error("A checklist task is missing from ROUTE");

/** What sits in "Main" until someone picks their own. */
export const DEFAULT_PINNED = ["login", "aaa", "guild-start", "cr", "gr", "mistmerrow", "halcyona", ...WEEKLY.map((t) => t.id)];
