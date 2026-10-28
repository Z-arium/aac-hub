export interface Tool {
  href: string;
  name: string;
  blurb: string;
  icon: string;
}

export const TOOLS: Tool[] = [
  { href: "/timers", name: "Boss & event timers", blurb: "Live countdowns for world bosses, PvP events and the Freedich Gold Trader, with alerts.", icon: "⏰" },
  { href: "/tools/class-builder", name: "Class builder", blurb: "Pick skill trees, skills and passives. Share a build by link or save it.", icon: "🧙" },
  { href: "/tools/halcyona-necklace", name: "Halcyona Necklace planner", blurb: "Warrior Medals and Mana Wisps from your current rank to your goal.", icon: "📿" },
  { href: "/tools/regrade", name: "Regrade calculator", blurb: "Odds and expected scrolls to reach any grade, plus a simulator.", icon: "✨" },
  { href: "/tools/checklist", name: "Daily & weekly checklist", blurb: "Every daily and weekly, grouped by category. Pick what you see. Resets on its own.", icon: "✅" },
  { href: "/tools/labor", name: "Labor calculator", blurb: "When your labor will be full, and how much you'll have at a set time.", icon: "⚒️" },
  { href: "/tools/trade-packs", name: "Trade pack calculator", blurb: "Profit per pack and per labor after turn-in percentage and material cost.", icon: "📦" },
];

export const DATABASE: Tool[] = [
  { href: "/database/world-bosses", name: "World bosses", blurb: "Major, normal, minor and field bosses with respawn timers and Gilda rewards.", icon: "🐉" },
  { href: "/database/gliders", name: "Gliders", blurb: "Every glider and magithopter, its skill, stats and where to get it.", icon: "🪂" },
  { href: "/database/ships", name: "Ships", blurb: "Clippers, speedboats, merchant and fishing boats, warships and their costs.", icon: "⛵" },
  { href: "/database/currencies", name: "Currencies", blurb: "All 18 currencies, how to earn them and where to spend them.", icon: "🪙" },
  { href: "/database/races", name: "Races", blurb: "The six races and their racial skills on Classic.", icon: "🧝" },
  { href: "/database/festivals", name: "Festival calendar", blurb: "Which festival runs each month and where to find it.", icon: "🎉" },
];
