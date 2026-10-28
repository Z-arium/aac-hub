import { EVENTS, SERVER_TZ, type ScheduledEvent, type Slot } from "@/data/schedule";

const partsFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: SERVER_TZ,
  hourCycle: "h23",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  weekday: "short",
});

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function zonedParts(ms: number) {
  const p = Object.fromEntries(partsFmt.formatToParts(ms).map((x) => [x.type, x.value]));
  return {
    year: +p.year,
    month: +p.month,
    day: +p.day,
    hour: +p.hour,
    minute: +p.minute,
    second: +p.second,
    weekday: WEEKDAYS.indexOf(p.weekday),
  };
}

/** Offset of the server zone from UTC at an instant, in ms. */
function offsetAt(ms: number) {
  const p = zonedParts(ms);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ms / 1000) * 1000;
}

/** UTC instant for a wall-clock time in server time. */
export function serverWallToUtc(year: number, month: number, day: number, hour: number, minute: number) {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const first = guess - offsetAt(guess);
  return guess - offsetAt(first);
}

/** One in-game day lasts 4 real hours, so a game minute is 10 real seconds. */
export const GAME_DAY_MS = 4 * 3_600_000;
/**
 * A real instant when the in-game clock read 00:00. Worked out from Jacob's
 * reading of game 16:55 at 2026-10-28 20:04 UTC (3:04 PM CDT), rounded to the minute.
 */
export const GAME_MIDNIGHT_UTC = Date.UTC(2026, 9, 28, 17, 15);

/** In-game clock at a real instant, as minutes after game midnight (0-1439). */
export function gameMinutes(now: number) {
  const into = (((now - GAME_MIDNIGHT_UTC) % GAME_DAY_MS) + GAME_DAY_MS) % GAME_DAY_MS;
  return Math.floor((into / GAME_DAY_MS) * 1440);
}

export function formatGameClock(now: number) {
  const m = gameMinutes(now);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** Next real instant the in-game clock reads `hhmm`. */
export function nextGameTime(hhmm: string, now: number) {
  const [h, m] = hhmm.split(":").map(Number);
  const offset = ((h * 60 + m) / 1440) * GAME_DAY_MS;
  const cycles = Math.floor((now - GAME_MIDNIGHT_UTC - offset) / GAME_DAY_MS) + 1;
  return GAME_MIDNIGHT_UTC + offset + cycles * GAME_DAY_MS;
}

export function nextSlotTime(slot: Slot, now: number): number {
  if (slot.day === "game") return nextGameTime(slot.time, now);
  const [h, m] = slot.time.split(":").map(Number);
  const today = zonedParts(now);
  for (let i = 0; i <= 7; i++) {
    // Step through calendar days in server time.
    const d = new Date(Date.UTC(today.year, today.month - 1, today.day + i));
    const weekday = d.getUTCDay();
    if (slot.day !== "daily" && slot.day !== weekday) continue;
    const t = serverWallToUtc(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), h, m);
    if (t > now) return t;
  }
  throw new Error(`No upcoming time for slot ${slot.day} ${slot.time}`);
}

export interface Occurrence {
  event: ScheduledEvent;
  at: number;
}

export function nextOccurrence(event: ScheduledEvent, now: number): Occurrence {
  const at = Math.min(...event.slots.map((s) => nextSlotTime(s, now)));
  return { event, at };
}

export function upcoming(now: number, events: ScheduledEvent[] = EVENTS): Occurrence[] {
  return events.map((e) => nextOccurrence(e, now)).sort((a, b) => a.at - b.at);
}

export function formatCountdown(ms: number) {
  if (ms <= 0) return "now";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${String(sec).padStart(2, "0")}s`;
  return `${m}m ${String(sec).padStart(2, "0")}s`;
}

export function formatSlot(slot: Slot) {
  if (slot.day === "game") return `Every 4h at ${slot.time} game time`;
  const day = slot.day === "daily" ? "Daily" : WEEKDAYS[slot.day];
  return `${day} ${slot.time} ET`;
}

export function formatServerClock(ms: number) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: SERVER_TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(ms);
}

export function formatLocal(ms: number) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(ms);
}

/** Daily reset is 00:00 UTC (Jacob's call; the wiki gives no time). */
export const DAILY_RESET_UTC_HOUR = 0;

/** The UTC date of the current daily period, e.g. "2026-10-27". */
export function dailyResetKey(now: number) {
  return new Date(now - DAILY_RESET_UTC_HOUR * 3_600_000).toISOString().slice(0, 10);
}

export function nextDailyReset(now: number) {
  const d = new Date(dailyResetKey(now) + "T00:00:00Z");
  return d.getTime() + (24 + DAILY_RESET_UTC_HOUR) * 3_600_000;
}
