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

export function nextSlotTime(slot: Slot, now: number): number {
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
  const day = slot.day === "daily" ? "Daily" : WEEKDAYS[slot.day];
  return `${day} ${slot.time}`;
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
