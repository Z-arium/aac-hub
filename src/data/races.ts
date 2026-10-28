// Source: https://wiki.aa-classic.com/Races (read 2026-10-28).
// Classic swaps some racial skills between races for balance.

export interface Race {
  name: string;
  faction: "Nuia" | "Haranya";
  skills: { name: string; cooldown: string; effect: string }[];
}

export const RACES: Race[] = [
  { name: "Nuian", faction: "Nuia", skills: [
    { name: "Explosive Expert", cooldown: "30 min", effect: "+3% ship and tank cannon damage for 5 min" },
    { name: "Nui's Blessing", cooldown: "30 min", effect: "+8% Strength, Spirit, Intelligence, Stamina and Agility for 5 min, fading over time" },
  ] },
  { name: "Elf", faction: "Nuia", skills: [
    { name: "Lithe Flow", cooldown: "30 min", effect: "+5% swim speed and 30 s longer breath for 5 min" },
    { name: "Earth Lover", cooldown: "30 min", effect: "+10% max health for nearby allies' mounts for 5 min" },
  ] },
  { name: "Dwarf", faction: "Nuia", skills: [
    { name: "Catlike Reflexes", cooldown: "30 min", effect: "No falling damage for 5 min" },
    { name: "Dwarven Artifice", cooldown: "30 min", effect: "-30% Machining production time for 5 min" },
  ] },
  { name: "Harani", faction: "Haranya", skills: [
    { name: "Jungle Tamers", cooldown: "30 s (as listed)", effect: "-30% logging and herb gathering time, resets Recall cooldown, for 5 min" },
    { name: "Explosive Expert", cooldown: "30 s (as listed)", effect: "+3% ship and tank cannon damage for 5 min" },
  ] },
  { name: "Firran", faction: "Haranya", skills: [
    { name: "Strong Claws", cooldown: "30 min", effect: "Climb 50% faster and +10% move speed while dashing for 5 min" },
    { name: "Catlike Reflexes", cooldown: "30 min", effect: "No falling damage for 5 min" },
  ] },
  { name: "Warborn", faction: "Haranya", skills: [
    { name: "Lithe Flow", cooldown: "30 min", effect: "+5% swim speed and 30 s longer breath for 5 min" },
    { name: "Brute Strength", cooldown: "30 min", effect: "+10% move speed while carrying trade packs for 5 min" },
  ] },
];
