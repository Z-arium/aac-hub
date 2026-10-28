// The AAClassic wiki has no real categories, so the import sorts pages into
// sections by title. Checked in order: the first rule that matches wins.
// Titles not matched fall into "General".

const RULES = [
  ["Patch Notes", [/^Patch\b/, /^Server Updates/, /^Patch notes$/, /^Custom Server Changes$/, /^Marketplace Updates$/]],
  ["Events & Festivals", [/Festival\b/, /^Event\b/, /^Event:/, /^Event Guide/, /^Event Calendar$/, /^Festivals$/, /^World Events$/, /^Community Goals$/, /^Crystalline Bloodbath$/]],
  ["World Bosses", [
    /^World Bosses$/, /^Kraken$/, /^Primal Kraken$/, /^Red Dragon$/, /^Leviathan$/, /^Hanure the/, /^Thunderwing Titan$/, /^Anthalon$/,
    /^Delphinad Ghost Ship$/, /^Meina & Glenn$/, /^Captain Rangora$/, /^Dahuta's Champion Nazar$/, /^Morpheus the Forsaken$/,
    /^Zaldrane the Enchantress$/, /^Hounds of Kyrios$/, /^Stormwraith Kirin$/, /^Serpentis$/, /^Abyssal Attack$/,
  ]],
  ["Mounts & Pets", [/^Tamed Mount:/, /[Mm]ounts$/, /Pets?$/, /^Taming/, /^Mounts$/]],
  ["Classes & Skills", [
    /Skills$/, /^Skill Trees$/, /^Battlerage$/, /^Archery$/, /^Auramancy$/, /^Defense$/, /^Occultism$/, /^Shadowplay$/, /^Songcraft$/,
    /^Sorcery$/, /^Vitalism$/, /^Witchcraft$/, /^Berserker's Awakening/, /^(Archer|Healer|Mage|Melee) Guide$/, /^Stat Migration$/, /^Races$/,
  ]],
  ["Gear & Regrading", [
    /Gear\b/, /^Gearing/, /Regrad/, /^Gemming/, /Weapons?$/, /^Obsidian/, /Accessories$/, /Earring/, /Ring$/, /Necklace$/, /Costume/,
    /Undergarments/, /^Crests$/, /^Guild Cloak$/, /^Cometshard Staff$/, /^Serp Sleeves$/, /^Soulforged anvil$/, /^Jousting Lances$/,
    /^Catch-up Gear Box$/, /^Custom weapon skins$/, /^Fusion [Aa]lembics?$/, /^Undying Flame$/, /^Brave Warrior's Medal$/, /^Gliders$/,
  ]],
  ["Ships & Naval", [/^Ships$/, /^Cannons$/, /^Sails$/, /^Rudders$/, /^Radars$/, /^Figureheads$/, /^Enoan Galleon$/, /^Eznan Cutter$/, /^Growling Yawl/, /^Ship /]],
  ["Housing & Land", [/Housing/, /^Owning Land$/, /Farmhouse$/, /^Building Designs$/, /^Designs$/, /^Castle/, /^Guide:Working at Castles$/, /^Tax Certificate$/, /^Hay Bale$/, /^Fishing Stand$/, /Workbench$/]],
  ["Economy & Trade", [
    /^Commerce$/, /Trade ?[Rr]un/, /^Earning Gold$/, /^Currencies$/, /Merchant$/, /^Prestige/, /^Priceless/, /^Gilda Star$/, /^Activity Tokens$/,
    /^Larceny$/, /^Staging Packs$/, /^Daru Subscription Box$/, /^Planks$/, /^Lutesong Junk$/, /^Tax/, /^Eco-friendly Fuel$/, /^Aria's Autograph$/,
  ]],
  ["Professions & Life Skills", [/^Proficiency$/, /^Fishing/, /^Mining$/, /^Dawnsdrop/, /^RecipeBox$/, /^Leadership$/, /^Anchoring Emblem$/]],
  ["Zones & Dungeons", [/^Map$/, /^Auroria$/, /^Snowfang Isle$/, /^Swirling Meadow$/, /^Rum Runner Rapids$/, /^Ayanad Library$/, /^Starfall$/, /^Evenbards$/, /^Shroudlights$/]],
  ["New Players", [/^Getting Started$/, /^New Player/, /^Adventurer's Guide$/, /^FAQ$/, /^Frequently Asked Questions$/, /^Joining Classic/, /^I'm Lost/, /^Aquestria questline$/, /^Abbreviations$/, /^Daily Schedule$/, /^Buffs & Potions$/, /^Status Effects$/, /^Titles$/]],
  ["Interface & Setup", [/^Addon/, /^Settings$/, /^User Interface$/, /^In Game Menu$/, /^Setting Up/]],
  ["Items", [/^Abyssal Shard$/, /^Mysterious Chest$/, /^Zephyr Lamp$/, /^Image Items$/, /^Rubiole$/]],
  ["Community", [/\(Player\)$/, /^Guilds$/, /^Active Adventurers/]],
];

export function categorize(title) {
  for (const [name, patterns] of RULES) if (patterns.some((re) => re.test(title))) return name;
  return "General";
}

// Wiki housekeeping pages that are not articles.
const JUNK = [/^\d+x\d+$/, /\.css$/, /\.js$/, /^Sandbox/, /^Test Page$/, /^Template example$/, /^Main Page Temp$/, /^No$/];

export function isJunk(title) {
  return JUNK.some((re) => re.test(title));
}

// Pages outside the main namespace, grouped by what they are.
const NAMESPACE_CATEGORIES = {
  2: "User pages",
  3: "User pages",
  4: "About the wiki",
  8: "Wiki settings",
  10: "Templates",
  12: "Help",
  14: "Wiki categories",
  828: "Modules (data & code)",
};

export function namespaceCategory(ns) {
  return NAMESPACE_CATEGORIES[ns] ?? (ns % 2 === 1 ? "Talk pages" : "Other namespaces");
}
