// Recurring event and world boss schedule.
//
// Times are in server time (US Eastern, America/New_York, so they follow
// daylight saving). They were read off https://aa-classic.com/timers on
// 2026-10-27, which the wiki's boss pages point to as the schedule source.
// Patch 1.3.1.3 on the wiki puts a Mistmerrow at "9 PM server time", which
// matches the 21:00 ET slot below.

export type Category = "world-boss" | "pvp" | "pve" | "commerce" | "weekly";

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export interface Slot {
  /** Day of week in server time, or "daily". */
  day: Weekday | "daily";
  /** "HH:MM" in server time. */
  time: string;
}

export interface ScheduledEvent {
  id: string;
  name: string;
  category: Category;
  slots: Slot[];
  location?: string;
  rewards?: string;
  notes?: string;
  wiki?: string;
}

export const SERVER_TZ = "America/New_York";

export const EVENTS: ScheduledEvent[] = [
  {
    id: "red-dragon",
    name: "Red Dragon",
    category: "world-boss",
    slots: [
      { day: 3, time: "13:30" },
      { day: 5, time: "17:30" },
      { day: 1, time: "22:30" },
    ],
    location: "Karkasse Ridgelands",
    notes: "Level 50 major world boss with flying and ground phases.",
    wiki: "https://wiki.aa-classic.com/World_Bosses",
  },
  {
    id: "leviathan",
    name: "Leviathan",
    category: "world-boss",
    slots: [
      { day: 3, time: "14:00" },
      { day: 6, time: "14:00" },
      { day: 1, time: "15:00" },
    ],
    location: "East of the Arcadian Sea",
    notes: "Level 55 naval fight. You follow it through the ocean.",
    wiki: "https://wiki.aa-classic.com/World_Bosses",
  },
  {
    id: "kraken",
    name: "Kraken",
    category: "world-boss",
    slots: [
      { day: 3, time: "21:30" },
      { day: 6, time: "16:30" },
      { day: 1, time: "14:30" },
    ],
    location: "West of the Arcadian Sea",
    notes: "Level 50. Only takes damage from ships.",
    wiki: "https://wiki.aa-classic.com/World_Bosses",
  },
  {
    id: "berserker",
    name: "Hanure the Berserker",
    category: "world-boss",
    slots: [{ day: 0, time: "16:30" }],
    location: "Hasla",
    notes: "Level 55. Drops a new set of weapons.",
    wiki: "https://wiki.aa-classic.com/World_Bosses",
  },
  {
    id: "random-boss",
    name: "Random boss (Red Dragon / Kraken / Berserker)",
    category: "world-boss",
    slots: [{ day: 6, time: "05:00" }],
  },
  {
    id: "freedich-gold-trader",
    name: "Freedich Gold Trader",
    category: "commerce",
    slots: [
      { day: "daily", time: "10:30" },
      { day: "daily", time: "18:30" },
    ],
    location: "Freedich Island",
    notes: "Usually the best payout per trade pack, but high PvP risk.",
    wiki: "https://wiki.aa-classic.com/Commerce",
  },
  {
    id: "luscas",
    name: "Luscas",
    category: "pvp",
    slots: [
      { day: "daily", time: "14:00" },
      { day: "daily", time: "20:00" },
    ],
    location: "Between Auroria and Freedich Island (quest at Ezi's Light, Diamond Shores)",
    rewards: "Honor Points, 1 Gilda Star, Shatigon's Sand, Leadership",
    wiki: "https://wiki.aa-classic.com/World_Events",
  },
  {
    id: "mistmerrow",
    name: "Mistmerrow",
    category: "pvp",
    slots: [
      { day: "daily", time: "10:00" },
      { day: "daily", time: "21:00" },
    ],
    location: "Portals in Marianople (Nuia) and Austera (Haranya)",
    rewards: "Honor Points, Warrior Medals, Clear Synthium Shards, Leadership",
    notes: "Custom server change: 20 minutes long, with an added kill quest.",
    wiki: "https://wiki.aa-classic.com/World_Events",
  },
  {
    id: "halcyona",
    name: "Halcyona War",
    category: "pvp",
    slots: [
      { day: "daily", time: "04:30" },
      { day: "daily", time: "22:00" },
    ],
    location: "Halcyona (quest in your faction capital)",
    rewards: "Honor Points, Clear Synthium Shards, Warrior Medals, Leadership",
    wiki: "https://wiki.aa-classic.com/World_Events",
  },
  {
    id: "abyssal-attack",
    name: "Abyssal Attack",
    category: "pve",
    slots: [
      { day: 2, time: "20:00" },
      { day: 4, time: "20:00" },
    ],
    wiki: "https://wiki.aa-classic.com/Abyssal_Attack",
  },
  {
    id: "veroe-harvest",
    name: "Veroe Harvest Festival",
    category: "pve",
    slots: [
      { day: 2, time: "19:30" },
      { day: 4, time: "15:30" },
    ],
  },
  {
    id: "supplying-the-settlers",
    name: "Supplying the Settlers",
    category: "pve",
    slots: [
      { day: 3, time: "14:30" },
      { day: 3, time: "22:00" },
    ],
  },
];

/**
 * Weekly Activity Token quests, from https://wiki.aa-classic.com/Activity_Tokens.
 * Each can only be picked up on its day (which is also when it resets) but can be
 * finished any time that week. The wiki gives no start times.
 */
export interface TokenQuest {
  id: string;
  name: string;
  day: Weekday;
  where: string;
  tokens: number;
  wiki: string;
}

export const WEEKLY_TOKEN_EVENTS: TokenQuest[] = [
  { id: "bloodbath", name: "Crystalline Bloodbath", day: 5, where: "Shadow Daru in your capital, then kill 50 enemies in Diamond Shores", tokens: 30, wiki: "https://wiki.aa-classic.com/Crystalline_Bloodbath" },
  { id: "fish-market", name: "Preparing for the Fish Market", day: 6, where: "Any Fish Stand: fish and sell 10 fish", tokens: 20, wiki: "https://wiki.aa-classic.com/Activity_Tokens" },
  { id: "ghost-ship", name: "Delphinad Ghost Ship", day: 6, where: "Kill the ghost ship at sea", tokens: 33, wiki: "https://wiki.aa-classic.com/Activity_Tokens" },
  { id: "library", name: "Ayanad Library", day: 6, where: "Kill bosses: 2 quests, 10 tokens each", tokens: 20, wiki: "https://wiki.aa-classic.com/Ayanad_Library" },
  { id: "crimson-threat", name: "The Crimson Threat", day: 0, where: "Sungold Fields: kill Anthalon (needs story chapter 99)", tokens: 33, wiki: "https://wiki.aa-classic.com/Activity_Tokens" },
];

export const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Rifts run on the in-game clock (one in-game day = 4 real hours). */
export const RIFTS = [
  { name: "Crimson Rift", gameTime: "12:00", every: "4 hours", rewards: "1000 Honor Points, 10 Leadership; each Hound gives 3 Gilda Stars, 2 Clear Synthium Shards, 7 Adventurer's Growthstones" },
  { name: "Grimgast Rift", gameTime: "00:00", every: "4 hours", rewards: "Quest rewards (not listed on the wiki)" },
];
