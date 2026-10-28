// Source: https://wiki.aa-classic.com/Skill_Trees (read 2026-10-28).
// Gunslinger, Swiftblade, Spelldancer and Malediction are not on Classic.

export interface SkillTree {
  name: string;
  kind: "Primary" | "Secondary";
  color: string;
  summary: string;
  keySkills: { name: string; note: string }[];
}

export const SKILL_TREES: SkillTree[] = [
  {
    name: "Battlerage",
    kind: "Primary",
    color: "#e5534b",
    summary: "Melee damage with gap closers and a trip.",
    keySkills: [
      { name: "Lasso", note: "Locks down one target" },
      { name: "Sunder Earth", note: "Lowers damage taken for allies" },
      { name: "Charge", note: "Gap closer" },
      { name: "Behind Enemy Lines", note: "Mobility" },
      { name: "Trip", note: "The tree's crowd control" },
      { name: "Tiger Strike", note: "Damage" },
      { name: "Precision Strike", note: "Finisher" },
    ],
  },
  {
    name: "Sorcery",
    kind: "Primary",
    color: "#6cb6ff",
    summary: "Magic damage, AOE and roots.",
    keySkills: [
      { name: "Arc Lightning", note: "Single-target damage" },
      { name: "Searing Rain", note: "AOE damage" },
      { name: "Frozen Earth", note: "Immobilizes enemies" },
      { name: "Cold Feet", note: "Immobilizes enemies" },
      { name: "Meteor", note: "Damage" },
    ],
  },
  {
    name: "Archery",
    kind: "Primary",
    color: "#57ab5a",
    summary: "Ranged physical damage that keeps enemies at a distance.",
    keySkills: [
      { name: "Endless Arrows", note: "Constant pressure" },
      { name: "Wild Instincts", note: "Passive that helps keep distance" },
      { name: "Marksman", note: "Passive that helps keep distance" },
    ],
  },
  {
    name: "Vitalism",
    kind: "Primary",
    color: "#f2cc60",
    summary: "Healing.",
    keySkills: [
      { name: "Fervent Hearts", note: "Single-target heal" },
      { name: "Mend", note: "AOE heal" },
      { name: "Resurgence", note: "Heal over time" },
    ],
  },
  {
    name: "Occultism",
    kind: "Secondary",
    color: "#b083f0",
    summary: "Stuns and debuffs that slow enemies down.",
    keySkills: [
      { name: "Hellspears", note: "Stun" },
      { name: "Summon Wraith", note: "Lowers enemy move speed, attack speed and accuracy" },
      { name: "Summon Crows", note: "Lowers enemy move speed, attack speed and accuracy" },
    ],
  },
  {
    name: "Shadowplay",
    kind: "Secondary",
    color: "#768390",
    summary: "Stealth, slows and healing reduction.",
    keySkills: [
      { name: "Stealth", note: "Escape tool" },
      { name: "Stalker's Mark", note: "Reduces enemy healing" },
      { name: "Throw Dagger", note: "Slows up to 5 players" },
      { name: "Overwhelm", note: "Built-in trip" },
      { name: "Shadowsmite", note: "Built-in trip" },
    ],
  },
  {
    name: "Witchcraft",
    kind: "Secondary",
    color: "#c96198",
    summary: "1v1 control, fear and a minion.",
    keySkills: [
      { name: "Insidious Whisper", note: "1v1 control" },
      { name: "Lassitude", note: "1v1 control" },
      { name: "Banshee Wail", note: "Fear, used to escape" },
      { name: "Fiend's Knell", note: "Minion" },
    ],
  },
  {
    name: "Songcraft",
    kind: "Secondary",
    color: "#39c5cf",
    summary: "Group songs for defense, damage, speed and healing.",
    keySkills: [
      { name: "Bulwark Ballad", note: "Defense song" },
      { name: "Bloody Chanty", note: "Damage song" },
      { name: "Quickstep", note: "Move speed song" },
      { name: "Ode to Recovery", note: "Healing" },
      { name: "Zeal", note: "Passive crit damage bonus" },
    ],
  },
  {
    name: "Defense",
    kind: "Secondary",
    color: "#cc6b2c",
    summary: "Tanking: invulnerability, shields and walls.",
    keySkills: [
      { name: "Invincibility", note: "Resists all damage but you can't move" },
      { name: "Fortress", note: "Pulls in nearby allies and lowers their damage taken" },
      { name: "Redoubt", note: "More shield block and stun immunity for a short time" },
      { name: "Imprison", note: "A wall enemies can't pass" },
    ],
  },
  {
    name: "Auramancy",
    kind: "Secondary",
    color: "#a5d6ff",
    summary: "Mobility, magic resistance and debuff protection.",
    keySkills: [
      { name: "Teleport", note: "Mobility" },
      { name: "Mirror Warp", note: "Mobility" },
      { name: "Vicious Implosion", note: "AOE pull" },
      { name: "Thwart", note: "Attack speed" },
      { name: "Magic Shield", note: "Magic resistance" },
      { name: "Shrug It Off", note: "Debuff protection" },
      { name: "Liberation", note: "Debuff protection" },
      { name: "Absorb Damage", note: "Damage reduction" },
      { name: "Unassailable", note: "Chance at 3 seconds of invulnerability" },
    ],
  },
];
