// Passive data from ballxpit.wiki.gg (2026-09-13) — effect text verbatim.
// Same shape as Ball; own id namespace. Ball and passive graphs never
// cross-reference.
export interface Passive {
  id: string;
  name: string;
  depth: 0 | 1 | 2;
  effects: string;
  recipes: string[][];
  icon: string;
  tags: string[];
}

export const PASSIVES: Passive[] = [
  {
    "id": "archers-effigy",
    "name": "Archer's Effigy",
    "depth": 0,
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
    "effects": "Friendly pieces gain 100% more health",
    "recipes": [],
    "icon": "icons/passives/artificial-heart.png",
    "tags": []
  },
  {
    "id": "baby-rattle",
    "name": "Baby Rattle",
    "depth": 0,
    "effects": "Gain 1.5x baby balls, but your aim becomes scattered",
    "recipes": [],
    "icon": "icons/passives/baby-rattle.png",
    "tags": [
      "spawns-baby-balls"
    ]
  },
  {
    "id": "bandage-roll",
    "name": "Bandage Roll",
    "depth": 0,
    "effects": "Shoot 1–2 baby balls each time you're healed",
    "recipes": [],
    "icon": "icons/passives/bandage-roll.png",
    "tags": [
      "spawns-baby-balls",
      "lifesteal"
    ]
  },
  {
    "id": "bottled-tornado",
    "name": "Bottled Tornado",
    "depth": 0,
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
    "effects": "Decrease damage taken by 10%",
    "recipes": [],
    "icon": "icons/passives/breastplate.png",
    "tags": []
  },
  {
    "id": "crown-of-thorns",
    "name": "Crown of Thorns",
    "depth": 0,
    "effects": "Destroy the 2 nearest enemies when you are hit from close range",
    "recipes": [],
    "icon": "icons/passives/crown-of-thorns.png",
    "tags": [
      "aoe"
    ]
  },
  {
    "id": "cursed-elixir",
    "name": "Cursed Elixir",
    "depth": 0,
    "effects": "When a poisoned enemy dies, 10% chance to come back as a zombie with 240 health",
    "recipes": [],
    "icon": "icons/passives/cursed-elixir.png",
    "tags": [
      "spawns-allies",
      "status-effect"
    ]
  },
  {
    "id": "deadeyes-amulet",
    "name": "Deadeye's Amulet",
    "depth": 0,
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
    "effects": "Every 5–10 rows, spawn an enemy with dynamite attached. Destroying them deals 200–500 damage to nearby enemies",
    "recipes": [],
    "icon": "icons/passives/dynamite.png",
    "tags": [
      "aoe"
    ]
  },
  {
    "id": "emerald-hilted-dagger",
    "name": "Emerald Hilted Dagger",
    "depth": 0,
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
    "effects": "10% chance to dodge incoming attacks",
    "recipes": [],
    "icon": "icons/passives/eye-of-the-beholder.png",
    "tags": []
  },
  {
    "id": "fleet-feet",
    "name": "Fleet Feet",
    "depth": 0,
    "effects": "Increase movement speed by 10% and move at full speed while shooting",
    "recipes": [],
    "icon": "icons/passives/fleet-feet.png",
    "tags": [
      "ball-speed"
    ]
  },
  {
    "id": "frozen-spike",
    "name": "Frozen Spike",
    "depth": 0,
    "effects": "When an enemy is frozen, they emit a chill to nearby enemies that deals 10–20 damage",
    "recipes": [],
    "icon": "icons/passives/frozen-spike.png",
    "tags": [
      "aoe",
      "status-effect"
    ]
  },
  {
    "id": "gemspring",
    "name": "Gemspring",
    "depth": 0,
    "effects": "Every 7–11 rows, spawn a Gemspring. Damaging it drops an increasing amount of XP gems",
    "recipes": [],
    "icon": "icons/passives/gemspring.png",
    "tags": []
  },
  {
    "id": "ghostly-corset",
    "name": "Ghostly Corset",
    "depth": 0,
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
    "effects": "Balls go through allies and heal them for 2 health",
    "recipes": [],
    "icon": "icons/passives/ghostly-shield.png",
    "tags": [
      "lifesteal"
    ]
  },
  {
    "id": "golden-bull",
    "name": "Golden Bull",
    "depth": 0,
    "effects": "Every 7–11 rows, spawn a golden bull with 400 health; accrues 10 gold/minute; moves up the field blocking/attacking",
    "recipes": [],
    "icon": "icons/passives/golden-bull.png",
    "tags": [
      "spawns-allies"
    ]
  },
  {
    "id": "hand-fan",
    "name": "Hand Fan",
    "depth": 0,
    "effects": "Slow down enemies in the same column as you by 50%",
    "recipes": [],
    "icon": "icons/passives/hand-fan.png",
    "tags": [
      "status-effect"
    ]
  },
  {
    "id": "hand-mirror",
    "name": "Hand Mirror",
    "depth": 0,
    "effects": "Projectiles have a 50% chance to reflect upon hitting you, dealing 20–40 damage if they hit an enemy",
    "recipes": [],
    "icon": "icons/passives/hand-mirror.png",
    "tags": []
  },
  {
    "id": "healers-effigy",
    "name": "Healer's Effigy",
    "depth": 0,
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
    "effects": "Balls deal 0.5% more damage for each baby ball on the field",
    "recipes": [],
    "icon": "icons/passives/iron-onesie.png",
    "tags": [
      "baby-ball-scaling"
    ]
  },
  {
    "id": "kiss-of-death",
    "name": "Kiss of Death",
    "depth": 0,
    "effects": "Charmed enemies have a 10% chance of dying after recovering",
    "recipes": [],
    "icon": "icons/passives/kiss-of-death.png",
    "tags": [
      "status-effect"
    ]
  },
  {
    "id": "lovers-quiver",
    "name": "Lover's Quiver",
    "depth": 0,
    "effects": "Projectiles have a 40% chance to heal you for 1 health instead of hurting you",
    "recipes": [],
    "icon": "icons/passives/lovers-quiver.png",
    "tags": [
      "lifesteal"
    ]
  },
  {
    "id": "magic-staff",
    "name": "Magic Staff",
    "depth": 0,
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
    "effects": "Increase range at which you pick up items and catch balls by 1.0 tiles",
    "recipes": [],
    "icon": "icons/passives/magnet.png",
    "tags": []
  },
  {
    "id": "midnight-oil",
    "name": "Midnight Oil",
    "depth": 0,
    "effects": "Balls that hit flaming enemies light on fire and deal 10–20 bonus fire damage on the next hit",
    "recipes": [],
    "icon": "icons/passives/midnight-oil.png",
    "tags": [
      "status-effect"
    ]
  },
  {
    "id": "platinum-dumbbell",
    "name": "Platinum Dumbbell",
    "depth": 0,
    "effects": "Balls deal 12% bonus damage until they hit the back of the field",
    "recipes": [],
    "icon": "icons/passives/platinum-dumbbell.png",
    "tags": [
      "single-target"
    ]
  },
  {
    "id": "pressure-valve",
    "name": "Pressure Valve",
    "depth": 0,
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
    "effects": "Gain a shield that blocks the next damage; recharges after 60 seconds",
    "recipes": [],
    "icon": "icons/passives/protective-charm.png",
    "tags": []
  },
  {
    "id": "radiant-feather",
    "name": "Radiant Feather",
    "depth": 0,
    "effects": "Increases ball launch speed by 20%, but you get knocked back a little each shot",
    "recipes": [],
    "icon": "icons/passives/radiant-feather.png",
    "tags": [
      "ball-speed"
    ]
  },
  {
    "id": "reachers-spear",
    "name": "Reacher's Spear",
    "depth": 0,
    "effects": "Increase crit chance to 20% when hitting enemies in the same column as you",
    "recipes": [],
    "icon": "icons/passives/reachers-spear.png",
    "tags": [
      "crit"
    ]
  },
  {
    "id": "rubber-headband",
    "name": "Rubber Headband",
    "depth": 0,
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
    "effects": "Increase crit chance to 15% when hitting enemies in the back",
    "recipes": [],
    "icon": "icons/passives/ruby-hilted-dagger.png",
    "tags": [
      "crit"
    ]
  },
  {
    "id": "sapphire-hilted-dagger",
    "name": "Sapphire Hilted Dagger",
    "depth": 0,
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
    "effects": "Increase fire rate by 15%",
    "recipes": [],
    "icon": "icons/passives/shortbow.png",
    "tags": []
  },
  {
    "id": "silver-blindfold",
    "name": "Silver Blindfold",
    "depth": 0,
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
    "effects": "Balls deal 20% bonus damage until they hit a wall",
    "recipes": [],
    "icon": "icons/passives/silver-bullet.png",
    "tags": [
      "single-target"
    ]
  },
  {
    "id": "slingshot",
    "name": "Slingshot",
    "depth": 0,
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
    "effects": "Deal 30–50 to enemies the first time you get into their melee attack range",
    "recipes": [],
    "icon": "icons/passives/spiked-collar.png",
    "tags": [
      "single-target"
    ]
  },
  {
    "id": "stone-effigy",
    "name": "Stone Effigy",
    "depth": 0,
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
    "effects": "Balls deal 40% less damage, but gain 1% damage for each enemy on the field",
    "recipes": [],
    "icon": "icons/passives/sword-breaker.png",
    "tags": [
      "single-target"
    ]
  },
  {
    "id": "traitors-cowl",
    "name": "Traitor's Cowl",
    "depth": 0,
    "effects": "Stone allies can now be damaged by your balls, but you heal 2 health when a ball hits one",
    "recipes": [],
    "icon": "icons/passives/traitors-cowl.png",
    "tags": [
      "friendly-fire-risk",
      "lifesteal"
    ]
  },
  {
    "id": "turret",
    "name": "Turret",
    "depth": 0,
    "effects": "Floats around your character and shoots a baby ball at enemies every 2.0 seconds",
    "recipes": [],
    "icon": "icons/passives/turret.png",
    "tags": [
      "spawns-baby-balls"
    ]
  },
  {
    "id": "upturned-hatchet",
    "name": "Upturned Hatchet",
    "depth": 0,
    "effects": "Balls deal 80% more damage after hitting the back of the field, otherwise damage reduced by 20%",
    "recipes": [],
    "icon": "icons/passives/upturned-hatchet.png",
    "tags": [
      "wall-bounce"
    ]
  },
  {
    "id": "vampiric-sword",
    "name": "Vampiric Sword",
    "depth": 0,
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
    "effects": "Curse has a 10% chance of killing enemies",
    "recipes": [],
    "icon": "icons/passives/voodoo-doll.png",
    "tags": [
      "status-effect"
    ]
  },
  {
    "id": "wagon-wheel",
    "name": "Wagon Wheel",
    "depth": 0,
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
    "effects": "All baby balls deal 20% more damage",
    "recipes": [],
    "icon": "icons/passives/war-horn.png",
    "tags": [
      "baby-ball-scaling"
    ]
  },
  {
    "id": "wretched-onion",
    "name": "Wretched Onion",
    "depth": 0,
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
    "id": "cornucopia",
    "name": "Cornucopia",
    "depth": 1,
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
    ]
  },
  {
    "id": "deadeyes-cross",
    "name": "Deadeye's Cross",
    "depth": 1,
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
    "id": "full-metal-rapier",
    "name": "Full Metal Rapier",
    "depth": 1,
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
    "id": "inglorious-hammer",
    "name": "Inglorious Hammer",
    "depth": 1,
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
    "id": "odiferous-shell",
    "name": "Odiferous Shell",
    "depth": 1,
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
    "id": "phantom-regalia",
    "name": "Phantom Regalia",
    "depth": 1,
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
    "id": "remote-detonator",
    "name": "Remote Detonator",
    "depth": 1,
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
    "id": "soul-reaver",
    "name": "Soul Reaver",
    "depth": 1,
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
    "id": "tormenters-mask",
    "name": "Tormenters Mask",
    "depth": 1,
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
    "id": "windweaver",
    "name": "Windweaver",
    "depth": 1,
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

