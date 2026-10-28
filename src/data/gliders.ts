// Source: https://wiki.aa-classic.com/Gliders (read 2026-10-28).
// Stats are for the lowest-grade crafted version and improve with upgrades.

export type Rating = "Low" | "Moderate" | "High" | "Very High" | "?";

export interface Glider {
  name: string;
  group: "Basic" | "Glider" | "Coin glider" | "Magithopter";
  skill: string;
  obtain: string;
  speed: Rating;
  glide: Rating;
  turn: Rating;
  launch: Rating;
}

export const GLIDERS: Glider[] = [
  { group: "Basic", name: "Experimental Glider", skill: "-", obtain: "Quest reward (blueprint 5 silver)", speed: "Low", glide: "Low", turn: "Low", launch: "Low" },
  { group: "Basic", name: "Improved Glider", skill: "-", obtain: "Blueprint, 25 silver, Mirage Isle", speed: "Moderate", glide: "Low", turn: "Low", launch: "Low" },
  { group: "Basic", name: "Enhanced Glider", skill: "-", obtain: "Blueprint, 50 silver, Mirage Isle", speed: "Moderate", glide: "Low", turn: "Moderate", launch: "Moderate" },
  { group: "Basic", name: "Ultimate Glider", skill: "-", obtain: "Blueprint, 1 gold, Mirage Isle", speed: "High", glide: "High", turn: "Moderate", launch: "Moderate" },
  { group: "Glider", name: "Ezi's Glider", skill: "Invincible Flight", obtain: "Crafting", speed: "Very High", glide: "High", turn: "High", launch: "High" },
  { group: "Glider", name: "Red Dragon Glider", skill: "Divebomb", obtain: "Crafting", speed: "High", glide: "High", turn: "Moderate", launch: "Moderate" },
  { group: "Glider", name: "Glider Companion: Sloth", skill: "Backward Roll", obtain: "Crafting", speed: "High", glide: "High", turn: "Moderate", launch: "Moderate" },
  { group: "Glider", name: "Moonshadow Glider", skill: "Shadow Flight", obtain: "Crafting", speed: "Moderate", glide: "High", turn: "Very High", launch: "Very High" },
  { group: "Glider", name: "Thunderbolt Glider", skill: "Bombard", obtain: "Crafting", speed: "Low", glide: "Very High", turn: "High", launch: "Very High" },
  { group: "Glider", name: "Goblin Glider", skill: "Teleportation", obtain: "Crafting", speed: "High", glide: "High", turn: "Moderate", launch: "Moderate" },
  { group: "Glider", name: "Flamefeather Glider", skill: "Glider Charge, Instant Acceleration", obtain: "Crafting", speed: "High", glide: "High", turn: "Moderate", launch: "Moderate" },
  { group: "Glider", name: "Glider Companion: Squirrel", skill: "Focused Glide, Acorn Bomb", obtain: "Priceless Coins, Activity Tokens", speed: "High", glide: "High", turn: "Moderate", launch: "Moderate" },
  { group: "Glider", name: "Skywhisper Glider", skill: "Ascending Stunt, Descending Stunt", obtain: "Priceless Coins, Activity Tokens", speed: "High", glide: "High", turn: "Moderate", launch: "Moderate" },
  { group: "Glider", name: "Feathered Dragon Glider", skill: "Immune to turbulence", obtain: "Kraken drop", speed: "High", glide: "High", turn: "Moderate", launch: "Moderate" },
  { group: "Glider", name: "Legendary Dragon Wings", skill: "Dragonfire; immune to turbulence", obtain: "Red Dragon drop", speed: "High", glide: "High", turn: "Moderate", launch: "Moderate" },
  { group: "Coin glider", name: "Stormduster 1000", skill: "Stealthy Sweeper, Broomaneuver", obtain: "Broom Race Coins", speed: "High", glide: "High", turn: "Moderate", launch: "Moderate" },
  { group: "Coin glider", name: "Cloudrun Glider", skill: "Glider Nitro", obtain: "Player Appreciation Coins", speed: "High", glide: "High", turn: "Moderate", launch: "Moderate" },
  { group: "Coin glider", name: "Yin-Yang Wings", skill: "Focused Glide", obtain: "Player Appreciation Coins", speed: "High", glide: "High", turn: "Moderate", launch: "Moderate" },
  { group: "Coin glider", name: "Gilded Royal Glider", skill: "Glider Descent", obtain: "Player Appreciation Coins", speed: "High", glide: "High", turn: "Moderate", launch: "Moderate" },
  { group: "Coin glider", name: "Imperial Jade Glider", skill: "Glider Descent", obtain: "Player Appreciation Coins", speed: "High", glide: "High", turn: "Moderate", launch: "Moderate" },
  { group: "Magithopter", name: "Astra Wings", skill: "Takeoff, Teleport Right, Teleport Left", obtain: "Crafting", speed: "Very High", glide: "High", turn: "High", launch: "High" },
  { group: "Magithopter", name: "Crystal Wings", skill: "Crystal Trail", obtain: "Activity Tokens", speed: "Very High", glide: "High", turn: "Very High", launch: "Very High" },
  { group: "Magithopter", name: "Cumulus Magithopter", skill: "Breeze on By", obtain: "Comet Shards", speed: "High", glide: "High", turn: "Moderate", launch: "Moderate" },
  { group: "Magithopter", name: "Titan's Wings", skill: "Ragebolt", obtain: "Thunderwing Titan drop", speed: "?", glide: "?", turn: "?", launch: "?" },
  { group: "Magithopter", name: "Snowflake Wings", skill: "Snowflake Flight", obtain: "Snowfang Isle questline", speed: "Very High", glide: "High", turn: "Very High", launch: "Very High" },
  { group: "Magithopter", name: "Faelight Wings", skill: "Stealth", obtain: "Daru Festival Coins", speed: "High", glide: "High", turn: "High", launch: "High" },
];
