// Recurring event and world boss schedule.
//
// Times are in server time (US Eastern, America/New_York). They were read off
// https://aa-classic.com/timers on 2026-10-27 and converted from UTC (EDT, UTC-4).
// The official page has a "Region Times" selector (NA Prime / EU Prime / Mixed),
// so these still need an in-game check: see `verified` on each entry.

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
  /** False until Jacob confirms the times in game. */
  verified: boolean;
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
    verified: false,
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
    verified: false,
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
    verified: false,
  },
  {
    id: "berserker",
    name: "Hanure the Berserker",
    category: "world-boss",
    slots: [{ day: 0, time: "16:30" }],
    location: "Hasla",
    notes: "Level 55. Drops a new set of weapons.",
    wiki: "https://wiki.aa-classic.com/World_Bosses",
    verified: false,
  },
  {
    id: "random-boss",
    name: "Random boss (Red Dragon / Kraken / Berserker)",
    category: "world-boss",
    slots: [{ day: 6, time: "05:00" }],
    verified: false,
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
    verified: false,
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
    verified: false,
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
    verified: false,
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
    verified: false,
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
    verified: false,
  },
  {
    id: "veroe-harvest",
    name: "Veroe Harvest Festival",
    category: "pve",
    slots: [
      { day: 2, time: "19:30" },
      { day: 4, time: "15:30" },
    ],
    verified: false,
  },
  {
    id: "supplying-the-settlers",
    name: "Supplying the Settlers",
    category: "pve",
    slots: [
      { day: 3, time: "14:30" },
      { day: 3, time: "22:00" },
    ],
    verified: false,
  },
];

/** Weekly Activity Token events. The wiki gives the day but not the time. */
export const WEEKLY_TOKEN_EVENTS = [
  { name: "Crystalline Bloodbath", day: "Friday", where: "Diamond Shores", tokens: 30, wiki: "https://wiki.aa-classic.com/Crystalline_Bloodbath" },
  { name: "Preparing for the Fish Market", day: "Saturday", where: "Any Fish Stand: fish and sell 10 fish", tokens: 20, wiki: "https://wiki.aa-classic.com/Custom_Server_Changes" },
  { name: "The Crimson Threat", day: "Sunday", where: "Sungold Fields: kill Anthalon once", tokens: 15, wiki: "https://wiki.aa-classic.com/Custom_Server_Changes" },
];

/** Rifts run on the in-game clock (one in-game day = 4 real hours). */
export const RIFTS = [
  { name: "Crimson Rift", gameTime: "12:00", every: "4 hours", rewards: "1000 Honor Points, 10 Leadership; each Hound gives 3 Gilda Stars, 2 Clear Synthium Shards, 7 Adventurer's Growthstones" },
  { name: "Grimgast Rift", gameTime: "00:00", every: "4 hours", rewards: "Quest rewards (not listed on the wiki)" },
];
