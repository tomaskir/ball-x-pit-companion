// Passive data from docs/research/game-mechanics.md — base-game rows from
// ballxpit.wiki.gg (2026-09-13, game v1.301), effect text verbatim; Risen
// Ballbylon rows datamined from v1.308, normalized to display units.
// Same shape as Ball; own id namespace. Ball and passive graphs never
// cross-reference. edition is the content-filter dimension.
// characterIds is the DLC allow-list (authored for DLC base passives, derived
// from the components' intersection for evolved passives; Handheld Rupture is
// the documented override). excludedCharacterIds is the separate base-game
// character-stat gate. requirement is the informational loadout gate.
import type { Edition } from './editions';

export interface Passive {
  id: string;
  name: string;
  depth: 0 | 1 | 2;
  edition: Edition;
  effects: string;
  recipes: string[][];
  icon: string;
  tags: string[];
  /** DLC allow-list (one or two character ids); absent = no character lock. */
  characterIds?: string[];
  /** Base-game character-stat gate exclusions (not inherited by evolution). */
  excludedCharacterIds?: string[];
  /** Loadout gate / appearance requirement (informational). */
  requirement?: string;
}

export const PASSIVES: Passive[] = [
  {
    "id": "ancient-ladle",
    "name": "Ancient Ladle",
    "depth": 0,
    "edition": "dlc-risen-ballbylon",
    "effects": "Your combined ball has a 6% chance of birthing a copy of one of its components with each bounce.",
    "recipes": [],
    "icon": "icons/passives/ancient-ladle.png",
    "tags": [
      "fused-ball",
      "clone"
    ],
    "characterIds": [
      "the-potager"
    ]
  },
  {
    "id": "archers-effigy",
    "name": "Archer's Effigy",
    "depth": 0,
    "edition": "base-game",
    "effects": "Every 7–12 rows, spawn a stone archer with 160 health on your side. Shoots arrows at enemies, dealing 10–20 each. Immune to ball damage.",
    "recipes": [],
    "icon": "icons/passives/archers-effigy.png",
    "tags": [
      "spawns-allies"
    ]
  },
  {
    "id": "artificial-heart",
    "name": "Artificial Heart",
    "depth": 0,
    "edition": "base-game",
    "effects": "Friendly pieces gain 100% more health",
    "recipes": [],
    "icon": "icons/passives/artificial-heart.png",
    "tags": [],
    "requirement": "needs another \"friendly pieces\" passive"
  },
  {
    "id": "baby-rattle",
    "name": "Baby Rattle",
    "depth": 0,
    "edition": "base-game",
    "effects": "Gain 1.5x baby balls, but your aim becomes scattered",
    "recipes": [],
    "icon": "icons/passives/baby-rattle.png",
    "tags": [
      "spawns-baby-balls"
    ],
    "excludedCharacterIds": [
      "the-empty-nester",
      "the-makeshift-sisyphus",
      "the-potager"
    ]
  },
  {
    "id": "bandage-roll",
    "name": "Bandage Roll",
    "depth": 0,
    "edition": "base-game",
    "effects": "Shoot 1–2 baby balls each time you're healed",
    "recipes": [],
    "icon": "icons/passives/bandage-roll.png",
    "tags": [
      "spawns-baby-balls",
      "lifesteal"
    ]
  },
  {
    "id": "bent-spyglass",
    "name": "Bent Spyglass",
    "depth": 0,
    "edition": "dlc-risen-ballbylon",
    "effects": "Balls that are shot while aiming backwards deal 60% more damage.",
    "recipes": [],
    "icon": "icons/passives/bent-spyglass.png",
    "tags": [
      "aim-direction"
    ],
    "characterIds": [
      "the-sentinel"
    ]
  },
  {
    "id": "bottled-tornado",
    "name": "Bottled Tornado",
    "depth": 0,
    "edition": "base-game",
    "effects": "When you catch a special ball, automatically shoot 1–3 new baby balls in random directions",
    "recipes": [],
    "icon": "icons/passives/bottled-tornado.png",
    "tags": [
      "spawns-baby-balls"
    ]
  },
  {
    "id": "breastplate",
    "name": "Breastplate",
    "depth": 0,
    "edition": "base-game",
    "effects": "Decrease damage taken by 10%",
    "recipes": [],
    "icon": "icons/passives/breastplate.png",
    "tags": []
  },
  {
    "id": "charged-bracelet",
    "name": "Charged Bracelet",
    "depth": 0,
    "edition": "dlc-risen-ballbylon",
    "effects": "Increase range of all ball area-of-effects by an extra 20%.",
    "recipes": [],
    "icon": "icons/passives/charged-bracelet.png",
    "tags": [
      "aoe"
    ],
    "characterIds": [
      "the-conduit"
    ]
  },
  {
    "id": "cracked-cinderblock",
    "name": "Cracked Cinderblock",
    "depth": 0,
    "edition": "dlc-risen-ballbylon",
    "effects": "After a special ball passes through a wall, spawn 1–3 baby balls where it emerges.",
    "recipes": [],
    "icon": "icons/passives/cracked-cinderblock.png",
    "tags": [
      "spawns-baby-balls",
      "wall-bounce"
    ],
    "characterIds": [
      "the-makeshift-sisyphus",
      "the-wallbreaker"
    ]
  },
  {
    "id": "crown-of-thorns",
    "name": "Crown of Thorns",
    "depth": 0,
    "edition": "base-game",
    "effects": "Destroy the 2 nearest enemies when you are hit from close range",
    "recipes": [],
    "icon": "icons/passives/crown-of-thorns.png",
    "tags": [
      "aoe"
    ]
  },
  {
    "id": "crystal-decanter",
    "name": "Crystal Decanter",
    "depth": 0,
    "edition": "dlc-risen-ballbylon",
    "effects": "Balls deal 20% more damage when in orbit.",
    "recipes": [],
    "icon": "icons/passives/crystal-decanter.png",
    "tags": [
      "orbit"
    ],
    "characterIds": [
      "the-carouser",
      "the-scandalmonger"
    ]
  },
  {
    "id": "cursed-elixir",
    "name": "Cursed Elixir",
    "depth": 0,
    "edition": "base-game",
    "effects": "When a poisoned enemy dies, 10% chance to come back as a zombie with 240 health",
    "recipes": [],
    "icon": "icons/passives/cursed-elixir.png",
    "tags": [
      "spawns-allies",
      "status-effect"
    ],
    "requirement": "needs a Poison-applying ball"
  },
  {
    "id": "deadeyes-amulet",
    "name": "Deadeye's Amulet",
    "depth": 0,
    "edition": "base-game",
    "effects": "Critical hits deal 10–15 bonus damage",
    "recipes": [],
    "icon": "icons/passives/deadeyes-amulet.png",
    "tags": [
      "crit"
    ]
  },
  {
    "id": "diamond-hilted-dagger",
    "name": "Diamond Hilted Dagger",
    "depth": 0,
    "edition": "base-game",
    "effects": "Increase crit chance to 20% when hitting enemies in the front",
    "recipes": [],
    "icon": "icons/passives/diamond-hilted-dagger.png",
    "tags": [
      "crit"
    ]
  },
  {
    "id": "dynamite",
    "name": "Dynamite",
    "depth": 0,
    "edition": "base-game",
    "effects": "Every 5–10 rows, spawn an enemy with dynamite attached. Destroying them deals 200–500 damage to nearby enemies",
    "recipes": [],
    "icon": "icons/passives/dynamite.png",
    "tags": [
      "aoe"
    ]
  },
  {
    "id": "eldritch-gauntlet",
    "name": "Eldritch Gauntlet",
    "depth": 0,
    "edition": "dlc-risen-ballbylon",
    "effects": "Increase bonus damage after hitting the right wall by 20%.",
    "recipes": [],
    "icon": "icons/passives/eldritch-gauntlet.png",
    "tags": [
      "wall-bounce"
    ],
    "characterIds": [
      "the-right-hand-man"
    ]
  },
  {
    "id": "emerald-hilted-dagger",
    "name": "Emerald Hilted Dagger",
    "depth": 0,
    "edition": "base-game",
    "effects": "Increase crit chance to 20% when hitting enemies on their right side",
    "recipes": [],
    "icon": "icons/passives/emerald-hilted-dagger.png",
    "tags": [
      "crit"
    ]
  },
  {
    "id": "ethereal-cloak",
    "name": "Ethereal Cloak",
    "depth": 0,
    "edition": "base-game",
    "effects": "Balls go through enemies and deal 25% bonus damage until they hit the back of the field",
    "recipes": [],
    "icon": "icons/passives/ethereal-cloak.png",
    "tags": [
      "pass-through"
    ]
  },
  {
    "id": "everflowing-goblet",
    "name": "Everflowing Goblet",
    "depth": 0,
    "edition": "base-game",
    "effects": "You can heal past your max health at 20% efficiency",
    "recipes": [],
    "icon": "icons/passives/everflowing-goblet.png",
    "tags": [
      "lifesteal"
    ]
  },
  {
    "id": "eye-of-the-beholder",
    "name": "Eye of the Beholder",
    "depth": 0,
    "edition": "base-game",
    "effects": "10% chance to dodge incoming attacks",
    "recipes": [],
    "icon": "icons/passives/eye-of-the-beholder.png",
    "tags": []
  },
  {
    "id": "fleet-feet",
    "name": "Fleet Feet",
    "depth": 0,
    "edition": "base-game",
    "effects": "Increase movement speed by 10% and move at full speed while shooting",
    "recipes": [],
    "icon": "icons/passives/fleet-feet.png",
    "tags": [
      "ball-speed"
    ]
  },
  {
    "id": "fractured-boulder",
    "name": "Fractured Boulder",
    "depth": 0,
    "edition": "dlc-risen-ballbylon",
    "effects": "Increase area-of-effect damage (such as earthquake, laser, and lightning) and status effect damage (such as burn and poison) by 10%.",
    "recipes": [],
    "icon": "icons/passives/fractured-boulder.png",
    "tags": [
      "aoe",
      "status-scaling"
    ],
    "characterIds": [
      "the-makeshift-sisyphus"
    ]
  },
  {
    "id": "frozen-spike",
    "name": "Frozen Spike",
    "depth": 0,
    "edition": "base-game",
    "effects": "When an enemy is frozen, they emit a chill to nearby enemies that deals 10–20 damage",
    "recipes": [],
    "icon": "icons/passives/frozen-spike.png",
    "tags": [
      "aoe",
      "status-effect"
    ],
    "requirement": "needs a Freeze-applying ball"
  },
  {
    "id": "gemspring",
    "name": "Gemspring",
    "depth": 0,
    "edition": "base-game",
    "effects": "Every 7–11 rows, spawn a Gemspring. Damaging it drops an increasing amount of XP gems",
    "recipes": [],
    "icon": "icons/passives/gemspring.png",
    "tags": []
  },
  {
    "id": "ghostly-corset",
    "name": "Ghostly Corset",
    "depth": 0,
    "edition": "base-game",
    "effects": "Balls go through enemies and deal 20% bonus damage when hitting them from the side",
    "recipes": [],
    "icon": "icons/passives/ghostly-corset.png",
    "tags": [
      "pass-through"
    ]
  },
  {
    "id": "ghostly-shield",
    "name": "Ghostly Shield",
    "depth": 0,
    "edition": "base-game",
    "effects": "Balls go through allies and heal them for 2 health",
    "recipes": [],
    "icon": "icons/passives/ghostly-shield.png",
    "tags": [
      "lifesteal"
    ],
    "requirement": "needs an \"allies\" passive"
  },
  {
    "id": "golden-bull",
    "name": "Golden Bull",
    "depth": 0,
    "edition": "base-game",
    "effects": "Every 7–11 rows, spawn a golden bull with 400 health; accrues 10 gold/minute; moves up the field blocking/attacking",
    "recipes": [],
    "icon": "icons/passives/golden-bull.png",
    "tags": [
      "spawns-allies"
    ]
  },
  {
    "id": "goniometer",
    "name": "Goniometer",
    "depth": 0,
    "edition": "dlc-risen-ballbylon",
    "effects": "Balls' first bounce deals more damage based on how close to a perfect diagonal it is (up to 100%).",
    "recipes": [],
    "icon": "icons/passives/goniometer.png",
    "tags": [
      "bounce-scaling",
      "diagonal"
    ],
    "characterIds": [
      "the-scrupulous-scoundrel"
    ]
  },
  {
    "id": "hand-drill",
    "name": "Hand Drill",
    "depth": 0,
    "edition": "dlc-risen-ballbylon",
    "effects": "Each time a ball loops around, it deals 30% extra damage on the next hit.",
    "recipes": [],
    "icon": "icons/passives/hand-drill.png",
    "tags": [
      "playfield-loop"
    ],
    "characterIds": [
      "the-tunneller"
    ]
  },
  {
    "id": "hand-fan",
    "name": "Hand Fan",
    "depth": 0,
    "edition": "base-game",
    "effects": "Slow down enemies in the same column as you by 50%",
    "recipes": [],
    "icon": "icons/passives/hand-fan.png",
    "tags": [
      "status-effect"
    ]
  },
  {
    "id": "hand-me-downs",
    "name": "Hand Me Downs",
    "depth": 0,
    "edition": "dlc-risen-ballbylon",
    "effects": "Launch 1–2 baby balls randomly with each shot.",
    "recipes": [],
    "icon": "icons/passives/hand-me-downs.png",
    "tags": [
      "spawns-baby-balls"
    ],
    "characterIds": [
      "the-empty-nester"
    ]
  },
  {
    "id": "hand-mirror",
    "name": "Hand Mirror",
    "depth": 0,
    "edition": "base-game",
    "effects": "Projectiles have a 50% chance to reflect upon hitting you, dealing 20–40 damage if they hit an enemy",
    "recipes": [],
    "icon": "icons/passives/hand-mirror.png",
    "tags": []
  },
  {
    "id": "healers-effigy",
    "name": "Healer's Effigy",
    "depth": 0,
    "edition": "base-game",
    "effects": "Every 7–12 rows, spawn a stone healer with 100 health; heals you 10 health/minute",
    "recipes": [],
    "icon": "icons/passives/healers-effigy.png",
    "tags": [
      "spawns-allies",
      "lifesteal"
    ]
  },
  {
    "id": "hourglass",
    "name": "Hourglass",
    "depth": 0,
    "edition": "base-game",
    "effects": "Balls deal 150% damage, but damage decays by 30% each bounce (min 50%)",
    "recipes": [],
    "icon": "icons/passives/hourglass.png",
    "tags": [
      "bounce-scaling"
    ]
  },
  {
    "id": "iron-onesie",
    "name": "Iron Onesie",
    "depth": 0,
    "edition": "base-game",
    "effects": "Balls deal 0.5% more damage for each baby ball on the field",
    "recipes": [],
    "icon": "icons/passives/iron-onesie.png",
    "tags": [
      "baby-ball-scaling"
    ]
  },
  {
    "id": "jugglers-club",
    "name": "Juggler's Club",
    "depth": 0,
    "edition": "dlc-risen-ballbylon",
    "effects": "Balls deal an extra 5–15 damage to nearby enemies upon first landing.",
    "recipes": [],
    "icon": "icons/passives/jugglers-club.png",
    "tags": [
      "aoe"
    ],
    "characterIds": [
      "the-juggler"
    ]
  },
  {
    "id": "kiss-of-death",
    "name": "Kiss of Death",
    "depth": 0,
    "edition": "base-game",
    "effects": "Charmed enemies have a 10% chance of dying after recovering",
    "recipes": [],
    "icon": "icons/passives/kiss-of-death.png",
    "tags": [
      "status-effect"
    ],
    "requirement": "needs a Charm-applying ball"
  },
  {
    "id": "kris-knife",
    "name": "Kris Knife",
    "depth": 0,
    "edition": "dlc-risen-ballbylon",
    "effects": "Backstabs deal 10–15 bonus damage until they hit the back of the field.",
    "recipes": [],
    "icon": "icons/passives/kris-knife.png",
    "tags": [
      "backstab"
    ],
    "characterIds": [
      "the-shade"
    ]
  },
  {
    "id": "kunai",
    "name": "Kunai",
    "depth": 0,
    "edition": "dlc-risen-ballbylon",
    "effects": "Balls deal 10–15 bonus damage to bosses and minibosses.",
    "recipes": [],
    "icon": "icons/passives/kunai.png",
    "tags": [
      "direct-damage"
    ],
    "characterIds": [
      "the-tiptoer"
    ]
  },
  {
    "id": "lovers-quiver",
    "name": "Lover's Quiver",
    "depth": 0,
    "edition": "base-game",
    "effects": "Projectiles have a 40% chance to heal you for 1 health instead of hurting you",
    "recipes": [],
    "icon": "icons/passives/lovers-quiver.png",
    "tags": [
      "lifesteal"
    ]
  },
  {
    "id": "lucky-coin",
    "name": "Lucky Coin",
    "depth": 0,
    "edition": "dlc-risen-ballbylon",
    "effects": "30% bonus gold dropped. Launch 1–2 baby balls when picking up gold or other resources.",
    "recipes": [],
    "icon": "icons/passives/lucky-coin.png",
    "tags": [
      "spawns-baby-balls"
    ],
    "characterIds": [
      "the-spendthrift"
    ]
  },
  {
    "id": "magic-staff",
    "name": "Magic Staff",
    "depth": 0,
    "edition": "base-game",
    "effects": "Increase area-of-effect damage (earthquake, laser, lightning) by 20%",
    "recipes": [],
    "icon": "icons/passives/magic-staff.png",
    "tags": [
      "aoe"
    ]
  },
  {
    "id": "magnet",
    "name": "Magnet",
    "depth": 0,
    "edition": "base-game",
    "effects": "Increase range at which you pick up items and catch balls by 1.0 tiles",
    "recipes": [],
    "icon": "icons/passives/magnet.png",
    "tags": [],
    "excludedCharacterIds": [
      "the-shieldbearer"
    ]
  },
  {
    "id": "midnight-oil",
    "name": "Midnight Oil",
    "depth": 0,
    "edition": "base-game",
    "effects": "Balls that hit flaming enemies light on fire and deal 10–20 bonus fire damage on the next hit",
    "recipes": [],
    "icon": "icons/passives/midnight-oil.png",
    "tags": [
      "status-effect"
    ],
    "requirement": "needs a Burn-applying ball"
  },
  {
    "id": "platinum-dumbbell",
    "name": "Platinum Dumbbell",
    "depth": 0,
    "edition": "base-game",
    "effects": "Balls deal 12% bonus damage until they hit the back of the field",
    "recipes": [],
    "icon": "icons/passives/platinum-dumbbell.png",
    "tags": [
      "direct-damage"
    ]
  },
  {
    "id": "pressure-valve",
    "name": "Pressure Valve",
    "depth": 0,
    "edition": "base-game",
    "effects": "Enemies explode on death, dealing 20–30 damage to adjacent enemies",
    "recipes": [],
    "icon": "icons/passives/pressure-valve.png",
    "tags": [
      "aoe"
    ]
  },
  {
    "id": "protective-charm",
    "name": "Protective Charm",
    "depth": 0,
    "edition": "base-game",
    "effects": "Gain a shield that blocks the next damage; recharges after 60 seconds",
    "recipes": [],
    "icon": "icons/passives/protective-charm.png",
    "tags": [
      "shield"
    ]
  },
  {
    "id": "radiant-feather",
    "name": "Radiant Feather",
    "depth": 0,
    "edition": "base-game",
    "effects": "Increases ball launch speed by 20%, but you get knocked back a little each shot",
    "recipes": [],
    "icon": "icons/passives/radiant-feather.png",
    "tags": [
      "ball-speed"
    ],
    "excludedCharacterIds": [
      "the-shieldbearer",
      "the-tactician"
    ]
  },
  {
    "id": "reachers-spear",
    "name": "Reacher's Spear",
    "depth": 0,
    "edition": "base-game",
    "effects": "Increase crit chance to 20% when hitting enemies in the same column as you",
    "recipes": [],
    "icon": "icons/passives/reachers-spear.png",
    "tags": [
      "crit"
    ]
  },
  {
    "id": "refracting-glass",
    "name": "Refracting Glass",
    "depth": 0,
    "edition": "dlc-risen-ballbylon",
    "effects": "After a special ball reaches its target position, spawn 1–2 baby balls from that position.",
    "recipes": [],
    "icon": "icons/passives/refracting-glass.png",
    "tags": [
      "spawns-baby-balls"
    ],
    "characterIds": [
      "the-recollector"
    ]
  },
  {
    "id": "rubber-headband",
    "name": "Rubber Headband",
    "depth": 0,
    "edition": "base-game",
    "effects": "Balls start at 70% speed but increase by 20% each bounce (max 200%)",
    "recipes": [],
    "icon": "icons/passives/rubber-headband.png",
    "tags": [
      "ball-speed",
      "bounce-scaling"
    ]
  },
  {
    "id": "ruby-hilted-dagger",
    "name": "Ruby Hilted Dagger",
    "depth": 0,
    "edition": "base-game",
    "effects": "Increase crit chance to 15% when hitting enemies in the back",
    "recipes": [],
    "icon": "icons/passives/ruby-hilted-dagger.png",
    "tags": [
      "crit"
    ]
  },
  {
    "id": "rusted-blade",
    "name": "Rusted Blade",
    "depth": 0,
    "edition": "dlc-risen-ballbylon",
    "effects": "Whenever bleed is applied, add 2 extra stacks.",
    "recipes": [],
    "icon": "icons/passives/rusted-blade.png",
    "tags": [
      "status-effect"
    ],
    "characterIds": [
      "the-warrior"
    ]
  },
  {
    "id": "sapphire-hilted-dagger",
    "name": "Sapphire Hilted Dagger",
    "depth": 0,
    "edition": "base-game",
    "effects": "Increase crit chance to 30% when hitting enemies on their left side",
    "recipes": [],
    "icon": "icons/passives/sapphire-hilted-dagger.png",
    "tags": [
      "crit"
    ]
  },
  {
    "id": "shortbow",
    "name": "Shortbow",
    "depth": 0,
    "edition": "base-game",
    "effects": "Increase fire rate by 15%",
    "recipes": [],
    "icon": "icons/passives/shortbow.png",
    "tags": [],
    "excludedCharacterIds": [
      "the-spendthrift",
      "the-tactician"
    ]
  },
  {
    "id": "silver-blindfold",
    "name": "Silver Blindfold",
    "depth": 0,
    "edition": "base-game",
    "effects": "Increase crit chance to 20% when hitting blinded enemies",
    "recipes": [],
    "icon": "icons/passives/silver-blindfold.png",
    "tags": [
      "crit"
    ]
  },
  {
    "id": "silver-bullet",
    "name": "Silver Bullet",
    "depth": 0,
    "edition": "base-game",
    "effects": "Balls deal 20% bonus damage until they hit a wall",
    "recipes": [],
    "icon": "icons/passives/silver-bullet.png",
    "tags": [
      "direct-damage"
    ]
  },
  {
    "id": "silver-revolver",
    "name": "Silver Revolver",
    "depth": 0,
    "edition": "dlc-risen-ballbylon",
    "effects": "Balls pierce and deal 50% extra damage to the first enemy they hit.",
    "recipes": [],
    "icon": "icons/passives/silver-revolver.png",
    "tags": [
      "pass-through",
      "direct-damage"
    ],
    "characterIds": [
      "the-itchy-finger"
    ]
  },
  {
    "id": "slingshot",
    "name": "Slingshot",
    "depth": 0,
    "edition": "base-game",
    "effects": "25% chance to launch a baby ball when you pick up a gem",
    "recipes": [],
    "icon": "icons/passives/slingshot.png",
    "tags": [
      "spawns-baby-balls"
    ]
  },
  {
    "id": "spiked-collar",
    "name": "Spiked Collar",
    "depth": 0,
    "edition": "base-game",
    "effects": "Deal 30–50 to enemies the first time you get into their melee attack range",
    "recipes": [],
    "icon": "icons/passives/spiked-collar.png",
    "tags": [
      "direct-damage"
    ]
  },
  {
    "id": "spiked-discipline",
    "name": "Spiked Discipline",
    "depth": 0,
    "edition": "dlc-risen-ballbylon",
    "effects": "Each time a ball hits the bottom of the screen, it deals 50% extra damage on the next hit.",
    "recipes": [],
    "icon": "icons/passives/spiked-discipline.png",
    "tags": [
      "wall-bounce"
    ],
    "characterIds": [
      "the-flagellant"
    ]
  },
  {
    "id": "steel-bulwark",
    "name": "Steel Bulwark",
    "depth": 0,
    "edition": "dlc-risen-ballbylon",
    "effects": "Increase shield size by 20%.",
    "recipes": [],
    "icon": "icons/passives/steel-bulwark.png",
    "tags": [
      "shield"
    ],
    "characterIds": [
      "the-shieldbearer"
    ]
  },
  {
    "id": "stone-effigy",
    "name": "Stone Effigy",
    "depth": 0,
    "edition": "base-game",
    "effects": "Every 7–12 rows, spawn a stone soldier with 200 health; moves up the field blocking/attacking",
    "recipes": [],
    "icon": "icons/passives/stone-effigy.png",
    "tags": [
      "spawns-allies"
    ]
  },
  {
    "id": "sword-breaker",
    "name": "Sword Breaker",
    "depth": 0,
    "edition": "base-game",
    "effects": "Balls deal 40% less damage, but gain 1% damage for each enemy on the field",
    "recipes": [],
    "icon": "icons/passives/sword-breaker.png",
    "tags": [
      "direct-damage"
    ]
  },
  {
    "id": "teardrop-necklace",
    "name": "Teardrop Necklace",
    "depth": 0,
    "edition": "dlc-risen-ballbylon",
    "effects": "Balls deal 50% more damage when on a return trajectory.",
    "recipes": [],
    "icon": "icons/passives/teardrop-necklace.png",
    "tags": [
      "return-trajectory"
    ],
    "characterIds": [
      "the-repentant"
    ]
  },
  {
    "id": "test-tube",
    "name": "Test Tube",
    "depth": 0,
    "edition": "dlc-risen-ballbylon",
    "effects": "Balls deal more damage the faster they move (up to 100%).",
    "recipes": [],
    "icon": "icons/passives/test-tube.png",
    "tags": [
      "ball-speed"
    ],
    "characterIds": [
      "the-physicist"
    ]
  },
  {
    "id": "traitors-cowl",
    "name": "Traitor's Cowl",
    "depth": 0,
    "edition": "base-game",
    "effects": "Stone allies can now be damaged by your balls, but you heal 2 health when a ball hits one",
    "recipes": [],
    "icon": "icons/passives/traitors-cowl.png",
    "tags": [
      "friendly-fire-risk",
      "lifesteal"
    ],
    "requirement": "needs a \"stone allies\" passive"
  },
  {
    "id": "turret",
    "name": "Turret",
    "depth": 0,
    "edition": "base-game",
    "effects": "Floats around your character and shoots a baby ball at enemies every 2.0 seconds",
    "recipes": [],
    "icon": "icons/passives/turret.png",
    "tags": [
      "spawns-baby-balls"
    ]
  },
  {
    "id": "unkempt-cradle",
    "name": "Unkempt Cradle",
    "depth": 0,
    "edition": "dlc-risen-ballbylon",
    "effects": "Shots made while characters are facing each other have a 30% chance to shoot an extra baby ball straight forward.",
    "recipes": [],
    "icon": "icons/passives/unkempt-cradle.png",
    "tags": [
      "spawns-baby-balls"
    ],
    "characterIds": [
      "the-cohabitants"
    ]
  },
  {
    "id": "upturned-hatchet",
    "name": "Upturned Hatchet",
    "depth": 0,
    "edition": "base-game",
    "effects": "Balls deal 80% more damage after hitting the back of the field, otherwise damage reduced by 20%",
    "recipes": [],
    "icon": "icons/passives/upturned-hatchet.png",
    "tags": [
      "wall-bounce"
    ],
    "excludedCharacterIds": [
      "the-physicist"
    ]
  },
  {
    "id": "vampiric-sword",
    "name": "Vampiric Sword",
    "depth": 0,
    "edition": "base-game",
    "effects": "Each kill heals you by 5, but each shot you take deals 2 damage to you",
    "recipes": [],
    "icon": "icons/passives/vampiric-sword.png",
    "tags": [
      "lifesteal",
      "self-damage"
    ]
  },
  {
    "id": "voodoo-doll",
    "name": "Voodoo Doll",
    "depth": 0,
    "edition": "base-game",
    "effects": "Curse has a 10% chance of killing enemies",
    "recipes": [],
    "icon": "icons/passives/voodoo-doll.png",
    "tags": [
      "status-effect"
    ],
    "requirement": "needs a Curse-applying ball"
  },
  {
    "id": "wagon-wheel",
    "name": "Wagon Wheel",
    "depth": 0,
    "edition": "base-game",
    "effects": "Each time a ball hits a wall, it deals 30% extra damage on the next hit",
    "recipes": [],
    "icon": "icons/passives/wagon-wheel.png",
    "tags": [
      "wall-bounce"
    ]
  },
  {
    "id": "war-horn",
    "name": "War Horn",
    "depth": 0,
    "edition": "base-game",
    "effects": "All baby balls deal 20% more damage",
    "recipes": [],
    "icon": "icons/passives/war-horn.png",
    "tags": [
      "baby-ball-scaling"
    ],
    "excludedCharacterIds": [
      "the-empty-nester",
      "the-makeshift-sisyphus",
      "the-potager"
    ]
  },
  {
    "id": "wrapped-explosive",
    "name": "Wrapped Explosive",
    "depth": 0,
    "edition": "dlc-risen-ballbylon",
    "effects": "The first time balls hit a wall, they emit an explosion, dealing 20–30 to nearby enemies.",
    "recipes": [],
    "icon": "icons/passives/wrapped-explosive.png",
    "tags": [
      "aoe",
      "wall-bounce"
    ],
    "characterIds": [
      "the-embedded"
    ]
  },
  {
    "id": "wretched-onion",
    "name": "Wretched Onion",
    "depth": 0,
    "edition": "base-game",
    "effects": "Deal 6–12 per second to enemies within 2 tiles",
    "recipes": [],
    "icon": "icons/passives/wretched-onion.png",
    "tags": [
      "aoe"
    ]
  },
  {
    "id": "ardent-tire",
    "name": "Ardent Tire",
    "depth": 1,
    "edition": "base-game",
    "effects": "Each bounce increases ball speed by 10% and damage by 5%.",
    "recipes": [
      [
        "wagon-wheel",
        "rubber-headband"
      ]
    ],
    "icon": "icons/passives/ardent-tire.png",
    "tags": [
      "ball-speed",
      "bounce-scaling"
    ]
  },
  {
    "id": "argent-stopwatch",
    "name": "Argent Stopwatch",
    "depth": 1,
    "edition": "base-game",
    "effects": "Balls deal 200% damage, but damage decays by 20% each bounce (minimum 100%).",
    "recipes": [
      [
        "hourglass",
        "silver-bullet"
      ]
    ],
    "icon": "icons/passives/argent-stopwatch.png",
    "tags": [
      "bounce-scaling"
    ]
  },
  {
    "id": "arrow-of-fate",
    "name": "Arrow of Fate",
    "depth": 1,
    "edition": "base-game",
    "effects": "Projectiles no longer hurt you. Shoot 1–2 baby balls when hit by a projectile.",
    "recipes": [
      [
        "lovers-quiver",
        "hand-mirror"
      ]
    ],
    "icon": "icons/passives/arrow-of-fate.png",
    "tags": [
      "lifesteal",
      "spawns-baby-balls"
    ]
  },
  {
    "id": "baby-armor",
    "name": "Baby Armor",
    "depth": 1,
    "edition": "dlc-risen-ballbylon",
    "effects": "Each shot, launch 1–3 baby balls with the properties of the ball being shot.",
    "recipes": [
      [
        "hand-me-downs",
        "iron-onesie"
      ]
    ],
    "icon": "icons/passives/baby-armor.png",
    "tags": [
      "spawns-baby-balls"
    ],
    "characterIds": [
      "the-empty-nester"
    ]
  },
  {
    "id": "blood-kunai",
    "name": "Blood Kunai",
    "depth": 1,
    "edition": "dlc-risen-ballbylon",
    "effects": "Balls deal 0.6 of target's current health as bonus damage.",
    "recipes": [
      [
        "kunai",
        "everflowing-goblet"
      ]
    ],
    "icon": "icons/passives/blood-kunai.png",
    "tags": [
      "direct-damage"
    ],
    "characterIds": [
      "the-tiptoer"
    ]
  },
  {
    "id": "charged-bow",
    "name": "Charged Bow",
    "depth": 1,
    "edition": "dlc-risen-ballbylon",
    "effects": "Area-of-effects trigger at the nearest enemy. Increase range of all ball area-of-effects by an extra 30%. Increase fire rate by 20%.",
    "recipes": [
      [
        "charged-bracelet",
        "shortbow"
      ]
    ],
    "icon": "icons/passives/charged-bow.png",
    "tags": [
      "aoe"
    ],
    "characterIds": [
      "the-conduit"
    ]
  },
  {
    "id": "cornucopia",
    "name": "Cornucopia",
    "depth": 1,
    "edition": "base-game",
    "effects": "Each time baby balls are created, spawn 0–1 additional baby balls.",
    "recipes": [
      [
        "baby-rattle",
        "war-horn"
      ]
    ],
    "icon": "icons/passives/cornucopia.png",
    "tags": [
      "spawns-baby-balls"
    ],
    "excludedCharacterIds": [
      "the-empty-nester",
      "the-makeshift-sisyphus",
      "the-potager"
    ]
  },
  {
    "id": "cradle-of-filth",
    "name": "Cradle of Filth",
    "depth": 1,
    "edition": "dlc-risen-ballbylon",
    "effects": "Shots made while characters are facing each other have a 60% chance to shoot an extra baby ball in a random direction.",
    "recipes": [
      [
        "unkempt-cradle",
        "baby-rattle"
      ]
    ],
    "icon": "icons/passives/cradle-of-filth.png",
    "tags": [
      "spawns-baby-balls"
    ],
    "characterIds": [
      "the-cohabitants"
    ]
  },
  {
    "id": "deadeyes-cross",
    "name": "Deadeye's Cross",
    "depth": 1,
    "edition": "base-game",
    "effects": "Increase critical hit chance to 60%.",
    "recipes": [
      [
        "diamond-hilted-dagger",
        "sapphire-hilted-dagger",
        "ruby-hilted-dagger",
        "emerald-hilted-dagger"
      ]
    ],
    "icon": "icons/passives/deadeyes-cross.png",
    "tags": [
      "crit"
    ]
  },
  {
    "id": "deadeyes-impaler",
    "name": "Deadeye's Impaler",
    "depth": 2,
    "edition": "base-game",
    "effects": "Increase critical hit chance to 5%. Critical hits instantly kill non-boss enemies.",
    "recipes": [
      [
        "deadeyes-cross",
        "gracious-impaler"
      ]
    ],
    "icon": "icons/passives/deadeyes-impaler.png",
    "tags": [
      "crit"
    ]
  },
  {
    "id": "eldritch-dagger",
    "name": "Eldritch Dagger",
    "depth": 1,
    "edition": "dlc-risen-ballbylon",
    "effects": "First hit after hitting a right wall creates an explosion that deals 30–50 damage to nearby enemies.",
    "recipes": [
      [
        "eldritch-gauntlet",
        "diamond-hilted-dagger"
      ]
    ],
    "icon": "icons/passives/eldritch-dagger.png",
    "tags": [
      "aoe",
      "wall-bounce"
    ],
    "characterIds": [
      "the-right-hand-man"
    ]
  },
  {
    "id": "eyeless-spyglass",
    "name": "Eyeless Spyglass",
    "depth": 1,
    "edition": "dlc-risen-ballbylon",
    "effects": "Increase crit chance to 300% while you're looking backwards.",
    "recipes": [
      [
        "bent-spyglass",
        "silver-blindfold"
      ]
    ],
    "icon": "icons/passives/eyeless-spyglass.png",
    "tags": [
      "crit",
      "aim-direction"
    ],
    "characterIds": [
      "the-sentinel"
    ]
  },
  {
    "id": "full-metal-rapier",
    "name": "Full Metal Rapier",
    "depth": 1,
    "edition": "base-game",
    "effects": "Balls deal 1% more damage for each baby ball and enemy on the field.",
    "recipes": [
      [
        "iron-onesie",
        "sword-breaker"
      ]
    ],
    "icon": "icons/passives/full-metal-rapier.png",
    "tags": [
      "baby-ball-scaling"
    ]
  },
  {
    "id": "gracious-impaler",
    "name": "Gracious Impaler",
    "depth": 1,
    "edition": "base-game",
    "effects": "Critical hits have a 5% chance to instantly kill enemies.",
    "recipes": [
      [
        "reachers-spear",
        "deadeyes-amulet"
      ]
    ],
    "icon": "icons/passives/gracious-impaler.png",
    "tags": [
      "crit"
    ]
  },
  {
    "id": "grotesque-artillery",
    "name": "Grotesque Artillery",
    "depth": 1,
    "edition": "base-game",
    "effects": "Floats around your character and shoots a random level 1 unevolved special ball at enemies every 8.0 seconds.",
    "recipes": [
      [
        "turret",
        "hand-fan"
      ]
    ],
    "icon": "icons/passives/grotesque-artillery.png",
    "tags": [
      "spawns-baby-balls"
    ]
  },
  {
    "id": "handheld-rupture",
    "name": "Handheld Rupture",
    "depth": 1,
    "edition": "dlc-risen-ballbylon",
    "effects": "Whenever a special ball warps, emit an earthquake that deals 5–13 damage to nearby enemies. Increase area-of-effect damage and status effect damage by 20%.",
    "recipes": [
      [
        "cracked-cinderblock",
        "fractured-boulder"
      ]
    ],
    "icon": "icons/passives/handheld-rupture.png",
    "tags": [
      "aoe",
      "status-scaling",
      "teleport"
    ],
    "characterIds": [
      "the-makeshift-sisyphus",
      "the-wallbreaker"
    ]
  },
  {
    "id": "inglorious-hammer",
    "name": "Inglorious Hammer",
    "depth": 1,
    "edition": "base-game",
    "effects": "When balls hit a wall or the back of the field, they hit a random enemy with 50% bonus damage.",
    "recipes": [
      [
        "platinum-dumbbell",
        "upturned-hatchet"
      ]
    ],
    "icon": "icons/passives/inglorious-hammer.png",
    "tags": [
      "wall-bounce"
    ]
  },
  {
    "id": "jugglers-wheel",
    "name": "Juggler's Wheel",
    "depth": 1,
    "edition": "dlc-risen-ballbylon",
    "effects": "Balls deal an extra 15–25 damage to nearby enemies in a large area upon first landing.",
    "recipes": [
      [
        "jugglers-club",
        "wagon-wheel"
      ]
    ],
    "icon": "icons/passives/jugglers-wheel.png",
    "tags": [
      "aoe"
    ],
    "characterIds": [
      "the-juggler"
    ]
  },
  {
    "id": "levitating-rock",
    "name": "Levitating Rock",
    "depth": 1,
    "edition": "dlc-risen-ballbylon",
    "effects": "Increase area-of-effect damage (such as earthquake, laser, and lightning) and status effect damage (such as burn and poison) by 20%.",
    "recipes": [
      [
        "fractured-boulder",
        "magic-staff"
      ]
    ],
    "icon": "icons/passives/levitating-rock.png",
    "tags": [
      "aoe",
      "status-scaling"
    ],
    "characterIds": [
      "the-makeshift-sisyphus"
    ]
  },
  {
    "id": "liquid-flame",
    "name": "Liquid Flame",
    "depth": 1,
    "edition": "dlc-risen-ballbylon",
    "effects": "Balls that hit flaming enemies light on fire and deal 20–30 bonus fire damage on the next hit. Orbiting balls are always on fire.",
    "recipes": [
      [
        "crystal-decanter",
        "midnight-oil"
      ]
    ],
    "icon": "icons/passives/liquid-flame.png",
    "tags": [
      "status-effect",
      "orbit"
    ],
    "characterIds": [
      "the-carouser",
      "the-scandalmonger"
    ]
  },
  {
    "id": "mystic-dipper",
    "name": "Mystic Dipper",
    "depth": 1,
    "edition": "dlc-risen-ballbylon",
    "effects": "Your combined ball has a 10% chance of birthing a copy of one of its components with each bounce. Increase area-of-effect damage by 40%.",
    "recipes": [
      [
        "ancient-ladle",
        "magic-staff"
      ]
    ],
    "icon": "icons/passives/mystic-dipper.png",
    "tags": [
      "fused-ball",
      "clone",
      "aoe"
    ],
    "characterIds": [
      "the-potager"
    ]
  },
  {
    "id": "odiferous-shell",
    "name": "Odiferous Shell",
    "depth": 1,
    "edition": "base-game",
    "effects": "When you touch enemies, they have a 50% chance of instantly dying.",
    "recipes": [
      [
        "wretched-onion",
        "breastplate"
      ]
    ],
    "icon": "icons/passives/odiferous-shell.png",
    "tags": []
  },
  {
    "id": "peacemaker",
    "name": "Peacemaker",
    "depth": 1,
    "edition": "dlc-risen-ballbylon",
    "effects": "Balls pierce and deal 100% extra damage to the first enemy they hit.",
    "recipes": [
      [
        "silver-revolver",
        "silver-bullet"
      ]
    ],
    "icon": "icons/passives/peacemaker.png",
    "tags": [
      "pass-through",
      "direct-damage"
    ],
    "characterIds": [
      "the-itchy-finger"
    ]
  },
  {
    "id": "phantom-regalia",
    "name": "Phantom Regalia",
    "depth": 1,
    "edition": "base-game",
    "effects": "Balls go through enemies until they hit the back wall. Balls deal 50% more damage when going through enemies.",
    "recipes": [
      [
        "ghostly-corset",
        "ethereal-cloak"
      ]
    ],
    "icon": "icons/passives/phantom-regalia.png",
    "tags": [
      "pass-through"
    ]
  },
  {
    "id": "reachers-drill",
    "name": "Reacher's Drill",
    "depth": 1,
    "edition": "dlc-risen-ballbylon",
    "effects": "After a ball loops around, increase its crit hit chance to 300%.",
    "recipes": [
      [
        "hand-drill",
        "reachers-spear"
      ]
    ],
    "icon": "icons/passives/reachers-drill.png",
    "tags": [
      "crit",
      "playfield-loop"
    ],
    "characterIds": [
      "the-tunneller"
    ]
  },
  {
    "id": "refracted-echo",
    "name": "Refracted Echo",
    "depth": 1,
    "edition": "dlc-risen-ballbylon",
    "effects": "After a special ball reaches its target position, 30% chance to spawn a clone from that position.",
    "recipes": [
      [
        "refracting-glass",
        "dynamite"
      ]
    ],
    "icon": "icons/passives/refracted-echo.png",
    "tags": [
      "clone"
    ],
    "characterIds": [
      "the-recollector"
    ]
  },
  {
    "id": "relentless-whip",
    "name": "Relentless Whip",
    "depth": 1,
    "edition": "dlc-risen-ballbylon",
    "effects": "Each time a special ball hits the bottom of the screen, it launches 0–2 baby balls with its properties.",
    "recipes": [
      [
        "spiked-discipline",
        "bottled-tornado"
      ]
    ],
    "icon": "icons/passives/relentless-whip.png",
    "tags": [
      "spawns-baby-balls",
      "wall-bounce"
    ],
    "characterIds": [
      "the-flagellant"
    ]
  },
  {
    "id": "remote-detonator",
    "name": "Remote Detonator",
    "depth": 1,
    "edition": "base-game",
    "effects": "Enemies spawn a level 1 bomb ball upon dying.",
    "recipes": [
      [
        "pressure-valve",
        "magnet"
      ]
    ],
    "icon": "icons/passives/remote-detonator.png",
    "tags": [
      "spawns-baby-balls",
      "aoe"
    ]
  },
  {
    "id": "sands-of-time",
    "name": "Sands of Time",
    "depth": 1,
    "edition": "dlc-risen-ballbylon",
    "effects": "Balls deal more damage the faster they move (up to 200%).",
    "recipes": [
      [
        "test-tube",
        "hourglass"
      ]
    ],
    "icon": "icons/passives/sands-of-time.png",
    "tags": [
      "ball-speed"
    ],
    "characterIds": [
      "the-physicist"
    ]
  },
  {
    "id": "shadow-blade",
    "name": "Shadow Blade",
    "depth": 1,
    "edition": "dlc-risen-ballbylon",
    "effects": "Increase crit chance to 700% when hitting enemies in the back.",
    "recipes": [
      [
        "kris-knife",
        "ruby-hilted-dagger"
      ]
    ],
    "icon": "icons/passives/shadow-blade.png",
    "tags": [
      "crit",
      "backstab"
    ],
    "characterIds": [
      "the-shade"
    ]
  },
  {
    "id": "soul-reaver",
    "name": "Soul Reaver",
    "depth": 1,
    "edition": "base-game",
    "effects": "Each kill heals you by 1 and you can heal past your max health at 30% efficiency.",
    "recipes": [
      [
        "vampiric-sword",
        "everflowing-goblet"
      ]
    ],
    "icon": "icons/passives/soul-reaver.png",
    "tags": [
      "lifesteal"
    ]
  },
  {
    "id": "spiked-shield",
    "name": "Spiked Shield",
    "depth": 1,
    "edition": "dlc-risen-ballbylon",
    "effects": "Increase shield size by 50%. Whenever you bounce a special ball, eject a spike at a random enemy that deals 50–90.",
    "recipes": [
      [
        "steel-bulwark",
        "spiked-collar"
      ]
    ],
    "icon": "icons/passives/spiked-shield.png",
    "tags": [
      "shield",
      "aoe"
    ],
    "characterIds": [
      "the-shieldbearer"
    ]
  },
  {
    "id": "teardrop-dagger",
    "name": "Teardrop Dagger",
    "depth": 1,
    "edition": "dlc-risen-ballbylon",
    "effects": "Balls deal 100% more damage and move 20 faster when on a return trajectory.",
    "recipes": [
      [
        "teardrop-necklace",
        "sapphire-hilted-dagger"
      ]
    ],
    "icon": "icons/passives/teardrop-dagger.png",
    "tags": [
      "return-trajectory",
      "ball-speed"
    ],
    "characterIds": [
      "the-repentant"
    ]
  },
  {
    "id": "tilted-dagger",
    "name": "Tilted Dagger",
    "depth": 1,
    "edition": "dlc-risen-ballbylon",
    "effects": "When balls hit enemies on their right side, increase crit chance to 600% and bounce horizontally.",
    "recipes": [
      [
        "goniometer",
        "emerald-hilted-dagger"
      ]
    ],
    "icon": "icons/passives/tilted-dagger.png",
    "tags": [
      "crit",
      "backstab"
    ],
    "characterIds": [
      "the-scrupulous-scoundrel"
    ]
  },
  {
    "id": "tormenters-mask",
    "name": "Tormenters Mask",
    "depth": 1,
    "edition": "base-game",
    "effects": "Enemies have a 10% chance of dying immediately the first time they detect you.",
    "recipes": [
      [
        "spiked-collar",
        "crown-of-thorns"
      ]
    ],
    "icon": "icons/passives/tormenters-mask.png",
    "tags": []
  },
  {
    "id": "vampires-kiss",
    "name": "Vampire's Kiss",
    "depth": 1,
    "edition": "dlc-risen-ballbylon",
    "effects": "Whenever bleed is applied, add 3 extra stacks. Dealing bleed damage has a 2% chance of healing 1 health.",
    "recipes": [
      [
        "rusted-blade",
        "vampiric-sword"
      ]
    ],
    "icon": "icons/passives/vampires-kiss.png",
    "tags": [
      "status-effect",
      "lifesteal"
    ],
    "characterIds": [
      "the-warrior"
    ]
  },
  {
    "id": "volatile-explosive",
    "name": "Volatile Explosive",
    "depth": 1,
    "edition": "dlc-risen-ballbylon",
    "effects": "Enemies create a large explosion on death, dealing 40–60 damage to nearby enemies.",
    "recipes": [
      [
        "wrapped-explosive",
        "pressure-valve"
      ]
    ],
    "icon": "icons/passives/volatile-explosive.png",
    "tags": [
      "aoe"
    ],
    "characterIds": [
      "the-embedded"
    ]
  },
  {
    "id": "windweaver",
    "name": "Windweaver",
    "depth": 1,
    "edition": "base-game",
    "effects": "Shoot a level 1 wind ball every time you pick up a gem.",
    "recipes": [
      [
        "bottled-tornado",
        "slingshot"
      ]
    ],
    "icon": "icons/passives/windweaver.png",
    "tags": [
      "spawns-baby-balls",
      "ball-speed"
    ]
  },
  {
    "id": "wings-of-the-anointed",
    "name": "Wings of the Anointed",
    "depth": 1,
    "edition": "base-game",
    "effects": "Balls move 40% faster and you move 20% faster. No longer affected by environmental hazards on the ground.",
    "recipes": [
      [
        "radiant-feather",
        "fleet-feet"
      ]
    ],
    "icon": "icons/passives/wings-of-the-anointed.png",
    "tags": [
      "ball-speed"
    ]
  }
];

