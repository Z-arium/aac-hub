// Source: https://wiki.aa-classic.com/Ships (read 2026-10-28).

export interface Ship {
  name: string;
  type: string;
  obtain: string;
  cost: string;
  features: string;
}

export const SHIPS: Ship[] = [
  { type: "Clipper", name: "Adventure Clipper", obtain: "Design from Mirage Isle or Marketplace", cost: "50 Gilda Stars", features: "Cannon on the right side" },
  { type: "Clipper", name: "Harpoon Clipper", obtain: "Design from Mirage Isle or Marketplace", cost: "50 Gilda Stars", features: "Harpoon on the front" },
  { type: "Speedboat", name: "Seawhip Speedboat", obtain: "Design from Marketplace, or crafted on Mirage Isle", cost: "1,200 Gilda Stars or 6 Login Badges", features: "Small and fast, carries at least 4 people" },
  { type: "Speedboat", name: "Seaskimmer Speedboat", obtain: "Speedboat Upgrade Ticket from Marketplace", cost: "400 Gilda Stars", features: "Small and fast, at least 4 people, 4 pack slots" },
  { type: "Merchant", name: "Merchant Schooner", obtain: "Design from Mirage Isle or Marketplace", cost: "400 Gilda Stars", features: "Holds 22 trade packs; telescope shows nearby ships on the map" },
  { type: "Fishing", name: "Fish-Find Longliner", obtain: "Design from Mirage Isle or Marketplace", cost: "250 Gilda Stars", features: "Holds 5 small/medium fish and 2 gargantuan fish" },
  { type: "Fishing", name: "Predator Longliner", obtain: "Marketplace, ready to use", cost: "700 Merit Badges", features: "Holds 5 small/medium fish and 2 gargantuan fish" },
  { type: "Fishing", name: "Moby Drake", obtain: "Moby Drake Upgrade Ticket on a longliner", cost: "2,000 Credits", features: "Cosmetic version of the longliners" },
  { type: "Small warship", name: "Lutesong Junk", obtain: "Design from Mirage Isle or Marketplace", cost: "250 Gilda Stars", features: "2 sails, 1 figurehead, 8 cannons" },
  { type: "Small warship", name: "Eznan Cutter", obtain: "Design from Mirage Isle or Marketplace", cost: "250 Gilda Stars", features: "2 sails, 1 figurehead, 8 cannons" },
  { type: "Small warship", name: "Growling Yawl", obtain: "Design fragments from Ghost Ship loot and Warsmith Castle mobs", cost: "55 Growling Yawl Design Fragments", features: "8 cannons; more HP, speed and crew than other small warships" },
  { type: "Small warship", name: "Pufferfish Ship", obtain: "Design from Marketplace", cost: "350 Gilda Stars", features: "Big front cannon with heavy damage (none to bosses)" },
  { type: "Medium warship", name: "Enoan Galleon", obtain: "Design scraps from Luscas, or the full design from Leviathan", cost: "5,000 Enoan Galleon Design Scraps", features: "3 sails, 2 figureheads, 10 cannons, huge ramming damage" },
  { type: "Luxury liner", name: "Luxury Liner", obtain: "Crafted at a Carpentry Workbench", cost: "2,800 Gilda Stars", features: "Big, slow party ship" },
];
