export interface Tool {
  href: string;
  name: string;
  blurb: string;
  icon: string;
}

export const TOOLS: Tool[] = [
  { href: "/timers", name: "Boss & event timers", blurb: "Live countdowns for world bosses, PvP events and the Freedich Gold Trader, with alerts.", icon: "⏰" },
  { href: "/tools/regrade", name: "Regrade calculator", blurb: "Odds and expected scrolls to reach any grade, plus a simulator.", icon: "✨" },
  { href: "/tools/checklist", name: "Daily & weekly checklist", blurb: "Track Rifts, Activity Token events and dailies. Resets on its own.", icon: "✅" },
  { href: "/tools/labor", name: "Labor calculator", blurb: "When your labor will be full, and how much you'll have at a set time.", icon: "⚒️" },
  { href: "/tools/trade-packs", name: "Trade pack calculator", blurb: "Profit per pack and per labor after turn-in percentage and material cost.", icon: "📦" },
  { href: "/database/world-bosses", name: "World boss database", blurb: "Every major, normal and minor world boss with level and location.", icon: "🐉" },
  { href: "/database/festivals", name: "Festival calendar", blurb: "Which festival runs each month and where to find it.", icon: "🎉" },
];
