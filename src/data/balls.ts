// Ball data from ballxpit.wiki.gg (2026-09-13, game v1.301) — effect text
// verbatim. recipes: OR-of-ANDs of component ids. depth: 0 = basic,
// 1 = evolved (level-2), 2 = tier-3. Tags are the site's editorial synergy
// model, not game data.
export interface Ball {
  id: string;
  name: string;
  depth: 0 | 1 | 2;
  effects: string;
  recipes: string[][];
  onHit: string;
  icon: string;
  tags: string[];
}

export const BALLS: Ball[] = [
  {
    "id": "bleed",
    "name": "Bleed",
    "depth": 0,
    "effects": "Inflicts 2 stacks of bleed. Bleeding enemies receive 1 damage per stack when hit by a ball (max 8 stacks).",
    "recipes": [],
    "onHit": "—",
    "icon": "icons/balls/bleed.png",
    "tags": [
      "status-effect"
    ]
  },
  {
    "id": "brood-mother",
    "name": "Brood Mother",
    "depth": 0,
    "effects": "Has a 25% chance of birthing a baby ball each time it hits an enemy.",
    "recipes": [],
    "onHit": "Spawn",
    "icon": "icons/balls/brood-mother.png",
    "tags": [
      "spawns-baby-balls"
    ]
  },
  {
    "id": "burn",
    "name": "Burn",
    "depth": 0,
    "effects": "Add 1 stack of burn on hit for 3 seconds (max 3 stacks). Burnt units are dealt 4–8 damage per stack per second.",
    "recipes": [],
    "onHit": "—",
    "icon": "icons/balls/burn.png",
    "tags": [
      "status-effect"
    ]
  },
  {
    "id": "cell",
    "name": "Cell",
    "depth": 0,
    "effects": "Splits into a clone on hit 2 times.",
    "recipes": [],
    "onHit": "Spawn",
    "icon": "icons/balls/cell.png",
    "tags": [
      "clone",
      "spawns-allies"
    ]
  },
  {
    "id": "charm",
    "name": "Charm",
    "depth": 0,
    "effects": "Each hit has a 4% chance of charming the enemy for 5 seconds. Charmed units walk up the board and attack enemies.",
    "recipes": [],
    "onHit": "—",
    "icon": "icons/balls/charm.png",
    "tags": [
      "status-effect"
    ]
  },
  {
    "id": "dark",
    "name": "Dark",
    "depth": 0,
    "effects": "Deals 3.0x damage but destroys itself after hitting an enemy. Has a 3 second cooldown before it can be shot again.",
    "recipes": [],
    "onHit": "Destroy",
    "icon": "icons/balls/dark.png",
    "tags": [
      "single-target",
      "destroy-on-hit"
    ]
  },
  {
    "id": "earthquake",
    "name": "Earthquake",
    "depth": 0,
    "effects": "Deals 5–13 damage to nearby units in a 3x3 tile square.",
    "recipes": [],
    "onHit": "AOE",
    "icon": "icons/balls/earthquake.png",
    "tags": [
      "aoe"
    ]
  },
  {
    "id": "egg-sac",
    "name": "Egg Sac",
    "depth": 0,
    "effects": "Explodes into 2–4 baby balls on hitting an enemy. Has a 3 second cooldown before it can be shot again.",
    "recipes": [],
    "onHit": "Destroy, Spawn",
    "icon": "icons/balls/egg-sac.png",
    "tags": [
      "destroy-on-hit",
      "spawns-baby-balls"
    ]
  },
  {
    "id": "flesh",
    "name": "Flesh",
    "depth": 0,
    "effects": "Speed increases by 25% per bounce.",
    "recipes": [],
    "onHit": "—",
    "icon": "icons/balls/flesh.png",
    "tags": [
      "ball-speed"
    ]
  },
  {
    "id": "freeze",
    "name": "Freeze",
    "depth": 0,
    "effects": "Has a 4% chance to freeze enemies for 5.0 seconds. Frozen enemies receive 25% more damage.",
    "recipes": [],
    "onHit": "—",
    "icon": "icons/balls/freeze.png",
    "tags": [
      "status-effect"
    ]
  },
  {
    "id": "ghost",
    "name": "Ghost",
    "depth": 0,
    "effects": "Passes through enemies.",
    "recipes": [],
    "onHit": "Pass Through",
    "icon": "icons/balls/ghost.png",
    "tags": [
      "pass-through"
    ]
  },
  {
    "id": "iron",
    "name": "Iron",
    "depth": 0,
    "effects": "Deals double damage but moves 40% slower.",
    "recipes": [],
    "onHit": "—",
    "icon": "icons/balls/iron.png",
    "tags": [
      "single-target"
    ]
  },
  {
    "id": "laser-horizontal",
    "name": "Laser (Horizontal)",
    "depth": 0,
    "effects": "Deals 9–18 damage to all enemies in the same row.",
    "recipes": [],
    "onHit": "AOE",
    "icon": "icons/balls/laser-horizontal.png",
    "tags": [
      "aoe"
    ]
  },
  {
    "id": "laser-vertical",
    "name": "Laser (Vertical)",
    "depth": 0,
    "effects": "Deals 9–18 damage to all enemies in the same column.",
    "recipes": [],
    "onHit": "AOE",
    "icon": "icons/balls/laser-vertical.png",
    "tags": [
      "aoe"
    ]
  },
  {
    "id": "light",
    "name": "Light",
    "depth": 0,
    "effects": "Blinds enemies on hit for 3 seconds. Blinded units have a hard time detecting you and have a 50% chance of missing when they attack.",
    "recipes": [],
    "onHit": "—",
    "icon": "icons/balls/light.png",
    "tags": [
      "status-effect"
    ]
  },
  {
    "id": "lightning",
    "name": "Lightning",
    "depth": 0,
    "effects": "Deals 1–20 damage to up to 3 nearby enemies.",
    "recipes": [],
    "onHit": "AOE",
    "icon": "icons/balls/lightning.png",
    "tags": [
      "aoe"
    ]
  },
  {
    "id": "poison",
    "name": "Poison",
    "depth": 0,
    "effects": "Applies 1 stack of poison on hit (max 5 stacks). Poison lasts for 6 seconds and each stack deals 1–4 damage per second.",
    "recipes": [],
    "onHit": "—",
    "icon": "icons/balls/poison.png",
    "tags": [
      "status-effect"
    ]
  },
  {
    "id": "stone",
    "name": "Stone",
    "depth": 0,
    "effects": "Initially deals 300% damage. Damage erodes by 40% each time hitting an enemy (minimum 50%).",
    "recipes": [],
    "onHit": "—",
    "icon": "icons/balls/stone.png",
    "tags": [
      "single-target"
    ]
  },
  {
    "id": "time",
    "name": "Time",
    "depth": 0,
    "effects": "Explodes into a time snare upon hitting an enemy, which stays on the field for 20 seconds and freezes enemies inside it.",
    "recipes": [],
    "onHit": "Destroy",
    "icon": "icons/balls/time.png",
    "tags": [
      "destroy-on-hit",
      "status-effect"
    ]
  },
  {
    "id": "vampire",
    "name": "Vampire",
    "depth": 0,
    "effects": "Each hit has a 4.5% chance of healing 1 health.",
    "recipes": [],
    "onHit": "—",
    "icon": "icons/balls/vampire.png",
    "tags": [
      "lifesteal"
    ]
  },
  {
    "id": "wind",
    "name": "Wind",
    "depth": 0,
    "effects": "Passes through enemies and slows them down by 30% for 5 seconds, but deals 25% less damage.",
    "recipes": [],
    "onHit": "Pass Through",
    "icon": "icons/balls/wind.png",
    "tags": [
      "pass-through",
      "status-effect"
    ]
  },
  {
    "id": "baby-ball",
    "name": "Baby Ball",
    "depth": 0,
    "effects": "Base attack ball, no special abilities. All characters start with a few except The Empty Nester and The Makeshift Sisyphus.",
    "recipes": [],
    "onHit": "",
    "icon": "icons/balls/baby-ball.png",
    "tags": []
  },
  {
    "id": "armageddon",
    "name": "Armageddon",
    "depth": 2,
    "effects": "Creates a meteor shower upon hitting an enemy. The meteor shower lasts for 5 seconds and deals 30–50 damage/second to enemies within a 3 tile radius.",
    "recipes": [
      [
        "inferno",
        "storm"
      ]
    ],
    "onHit": "Destroy, AOE",
    "icon": "icons/balls/armageddon.png",
    "tags": [
      "aoe",
      "destroy-on-hit"
    ]
  },
  {
    "id": "assassin",
    "name": "Assassin",
    "depth": 1,
    "effects": "Passes through the front of enemies, but not the back. Backstabs deal 30% bonus damage.",
    "recipes": [
      [
        "iron",
        "ghost"
      ],
      [
        "iron",
        "dark"
      ]
    ],
    "onHit": "Pass Through",
    "icon": "icons/balls/assassin.png",
    "tags": [
      "single-target",
      "pass-through"
    ]
  },
  {
    "id": "banished-flame",
    "name": "Banished Flame",
    "depth": 1,
    "effects": "Add 1 stack of darkflame on hit for 2 seconds (max 6 stacks). Darkflame deals 1–30 damage per stack per second. When the darkflame goes out, it deals 1–100 to the enemy.",
    "recipes": [
      [
        "dark",
        "burn"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/banished-flame.png",
    "tags": [
      "status-effect"
    ]
  },
  {
    "id": "banshee",
    "name": "Banshee",
    "depth": 2,
    "effects": "Curses all enemies while on the field when launched. Cursed enemies are dealt 150–300 after being hit 6 times.",
    "recipes": [
      [
        "phantom",
        "wraith"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/banshee.png",
    "tags": [
      "status-effect"
    ]
  },
  {
    "id": "berserk",
    "name": "Berserk",
    "depth": 1,
    "effects": "Each hit has a 30% chance of causing enemies to go berserk for 6 seconds. Berserk enemies deal 15–24 damage to adjacent enemies every second.",
    "recipes": [
      [
        "charm",
        "bleed"
      ],
      [
        "charm",
        "burn"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/berserk.png",
    "tags": [
      "status-effect"
    ]
  },
  {
    "id": "black-hole",
    "name": "Black Hole",
    "depth": 2,
    "effects": "Instantly kills the first non-boss enemy that it hits, but destroys itself afterwards. Has a 7 second cooldown before it can be shot again.",
    "recipes": [
      [
        "sun",
        "dark"
      ],
      [
        "sun",
        "time"
      ]
    ],
    "onHit": "Destroy",
    "icon": "icons/balls/black-hole.png",
    "tags": [
      "destroy-on-hit",
      "screen-clear"
    ]
  },
  {
    "id": "blizzard",
    "name": "Blizzard",
    "depth": 1,
    "effects": "Freezes all enemies within a 2 tile radius for 0.8 seconds, dealing 1–50 damage.",
    "recipes": [
      [
        "freeze",
        "wind"
      ],
      [
        "freeze",
        "lightning"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/blizzard.png",
    "tags": [
      "aoe",
      "status-effect"
    ]
  },
  {
    "id": "bomb",
    "name": "Bomb",
    "depth": 1,
    "effects": "Explodes when hitting an enemy, dealing 150–300 damage to nearby enemies. Has a 3 second cooldown before it can be shot again.",
    "recipes": [
      [
        "burn",
        "iron"
      ]
    ],
    "onHit": "Destroy",
    "icon": "icons/balls/bomb.png",
    "tags": [
      "aoe",
      "destroy-on-hit"
    ]
  },
  {
    "id": "brimstone",
    "name": "Brimstone",
    "depth": 1,
    "effects": "Applies 1 stack of burn and poison every second to all enemies within a 2 tile radius (max 4 stacks).",
    "recipes": [
      [
        "burn",
        "stone"
      ],
      [
        "burn",
        "poison"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/brimstone.png",
    "tags": [
      "aoe",
      "status-effect"
    ]
  },
  {
    "id": "catapult",
    "name": "Catapult",
    "depth": 1,
    "effects": "Launches 3–5 stone baby balls every 1.5 seconds, which are destroyed after hitting anything.",
    "recipes": [
      [
        "stone",
        "egg-sac"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/catapult.png",
    "tags": [
      "spawns-baby-balls"
    ]
  },
  {
    "id": "drill",
    "name": "Drill",
    "depth": 1,
    "effects": "Pierces enemies and deals 50% bonus damage until reaching the back of the field.",
    "recipes": [
      [
        "earthquake",
        "iron"
      ]
    ],
    "onHit": "Pass Through",
    "icon": "icons/balls/drill.png",
    "tags": [
      "pass-through",
      "single-target"
    ]
  },
  {
    "id": "elemental",
    "name": "Elemental",
    "depth": 1,
    "effects": "Applies a random status effect (burn, slow, or freeze) to nearby enemies on hit.",
    "recipes": [
      [
        "burn",
        "wind",
        "freeze",
        "earthquake"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/elemental.png",
    "tags": [
      "aoe",
      "status-effect"
    ]
  },
  {
    "id": "erosion",
    "name": "Erosion",
    "depth": 1,
    "effects": "Passes through enemies. Deals 3% of enemy's current health as bonus damage on hit.",
    "recipes": [
      [
        "time",
        "wind"
      ]
    ],
    "onHit": "Pass Through",
    "icon": "icons/balls/erosion.png",
    "tags": [
      "pass-through"
    ]
  },
  {
    "id": "fireworks",
    "name": "Fireworks",
    "depth": 1,
    "effects": "Explodes into 3–6 fireworks. Fireworks target random enemies, dealing 20–30 damage and applying 1 stack of burn.",
    "recipes": [
      [
        "burn",
        "egg-sac"
      ]
    ],
    "onHit": "Destroy",
    "icon": "icons/balls/fireworks.png",
    "tags": [
      "destroy-on-hit",
      "spawns-baby-balls",
      "status-effect"
    ]
  },
  {
    "id": "flash",
    "name": "Flash",
    "depth": 1,
    "effects": "Damages all enemies on screen for 1–3 damage after hitting an enemy and blinds them for 2 seconds.",
    "recipes": [
      [
        "lightning",
        "light"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/flash.png",
    "tags": [
      "aoe",
      "screen-clear",
      "status-effect"
    ]
  },
  {
    "id": "flesh-mound",
    "name": "Flesh Mound",
    "depth": 1,
    "effects": "Emits a fleshy baby ball in a random direction every 1.0 seconds.",
    "recipes": [
      [
        "brood-mother",
        "flesh"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/flesh-mound.png",
    "tags": [
      "spawns-baby-balls"
    ]
  },
  {
    "id": "flicker",
    "name": "Flicker",
    "depth": 1,
    "effects": "Deals 1–7 damage to every enemy on screen every 1.4 seconds.",
    "recipes": [
      [
        "light",
        "dark"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/flicker.png",
    "tags": [
      "aoe",
      "screen-clear"
    ]
  },
  {
    "id": "freeze-ray",
    "name": "Freeze Ray",
    "depth": 1,
    "effects": "Emits a freeze ray when hitting an enemy, dealing 20–50 to all enemies in its path, with a 10% chance of freezing them for 10.0 seconds.",
    "recipes": [
      [
        "freeze",
        "laser-horizontal"
      ],
      [
        "freeze",
        "laser-vertical"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/freeze-ray.png",
    "tags": [
      "status-effect",
      "aoe"
    ]
  },
  {
    "id": "frozen-flame",
    "name": "Frozen Flame",
    "depth": 1,
    "effects": "Add 1 stack of frostburn on hit for 20 seconds (max 4 stacks). Frostburnt units are dealt 8–12 damage per stack per second and receive 25% more damage from other sources.",
    "recipes": [
      [
        "burn",
        "freeze"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/frozen-flame.png",
    "tags": [
      "status-effect"
    ]
  },
  {
    "id": "glacier",
    "name": "Glacier",
    "depth": 1,
    "effects": "Releases glacial spikes over time that deal 15–30 to enemies that touch them and freeze them for 2.0 seconds. This ball and its glacial spikes also deal 6–12 damage to nearby units.",
    "recipes": [
      [
        "freeze",
        "earthquake"
      ],
      [
        "freeze",
        "stone"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/glacier.png",
    "tags": [
      "aoe",
      "status-effect"
    ]
  },
  {
    "id": "heart-swallower",
    "name": "Heart Swallower",
    "depth": 1,
    "effects": "Saps enemies on hit, with a 40% chance of stealing 1 health and reducing their attack damage by 20%.",
    "recipes": [
      [
        "bleed",
        "ghost"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/heart-swallower.png",
    "tags": [
      "lifesteal",
      "status-effect"
    ]
  },
  {
    "id": "hemorrhage",
    "name": "Hemorrhage",
    "depth": 1,
    "effects": "Inflicts 3 stacks of bleed. When hitting an enemy with 12+ stacks of bleed, consumes all stacks to deal 20% of their current health.",
    "recipes": [
      [
        "bleed",
        "iron"
      ],
      [
        "bleed",
        "flesh"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/hemorrhage.png",
    "tags": [
      "status-effect"
    ]
  },
  {
    "id": "holy-laser",
    "name": "Holy Laser",
    "depth": 1,
    "effects": "Deals 24–36 damage to all enemies in the same row and column.",
    "recipes": [
      [
        "laser-horizontal",
        "laser-vertical"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/holy-laser.png",
    "tags": [
      "aoe"
    ]
  },
  {
    "id": "incubus",
    "name": "Incubus",
    "depth": 1,
    "effects": "Each hit has a 4% chance of charming the enemy for 9 seconds. Charmed enemies curse nearby enemies. Cursed enemies are dealt 100–200 after being hit 5 times.",
    "recipes": [
      [
        "charm",
        "dark"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/incubus.png",
    "tags": [
      "status-effect"
    ]
  },
  {
    "id": "inferno",
    "name": "Inferno",
    "depth": 1,
    "effects": "Applies 1 stack of burn every second to all enemies within a 2 tile radius. Burn lasts for 6 seconds, dealing 3–7 damage per stack per second.",
    "recipes": [
      [
        "burn",
        "wind"
      ],
      [
        "burn",
        "time"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/inferno.png",
    "tags": [
      "aoe",
      "status-effect"
    ]
  },
  {
    "id": "landslide",
    "name": "Landslide",
    "depth": 1,
    "effects": "Creates a landslide and destroys self upon hitting an enemy. The landslide lasts for 5 seconds and deals 20–30 damage per second to enemies within a 2 tile radius.",
    "recipes": [
      [
        "stone",
        "earthquake"
      ]
    ],
    "onHit": "Destroy",
    "icon": "icons/balls/landslide.png",
    "tags": [
      "aoe",
      "destroy-on-hit"
    ]
  },
  {
    "id": "laser-beam",
    "name": "Laser Beam",
    "depth": 1,
    "effects": "Emits a laser beam on hit that deals 30–42 damage and blinds enemies for 8 seconds.",
    "recipes": [
      [
        "light",
        "laser-horizontal"
      ],
      [
        "light",
        "laser-vertical"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/laser-beam.png",
    "tags": [
      "aoe",
      "status-effect"
    ]
  },
  {
    "id": "laser-cutter",
    "name": "Laser Cutter",
    "depth": 1,
    "effects": "Constantly emits a laser in front of it, which deals 100–150 damage per second.",
    "recipes": [
      [
        "laser-horizontal",
        "steel"
      ],
      [
        "laser-vertical",
        "steel"
      ]
    ],
    "onHit": "?",
    "icon": "icons/balls/laser-cutter.png",
    "tags": [
      "aoe"
    ]
  },
  {
    "id": "leech",
    "name": "Leech",
    "depth": 1,
    "effects": "Attaches up to 1 leech onto enemies it hits, which adds 2 stacks of bleed per second (max 24 stacks).",
    "recipes": [
      [
        "brood-mother",
        "bleed"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/leech.png",
    "tags": [
      "status-effect"
    ]
  },
  {
    "id": "lightning-bug",
    "name": "Lightning Bug",
    "depth": 1,
    "effects": "Spawns a lightning bug each time it hits an enemy. Lightning bugs attack a random enemy, dealing 1–80 damage to up to 3 nearby enemies.",
    "recipes": [
      [
        "lightning",
        "brood-mother"
      ]
    ],
    "onHit": "Spawn",
    "icon": "icons/balls/lightning-bug.png",
    "tags": [
      "spawns-allies",
      "aoe"
    ]
  },
  {
    "id": "lightning-rod",
    "name": "Lightning Rod",
    "depth": 1,
    "effects": "Plants a lightning rod into enemies it hits. These enemies are struck by lightning every 3.0 seconds, dealing 1–30 damage to up to 8 nearby enemies.",
    "recipes": [
      [
        "lightning",
        "iron"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/lightning-rod.png",
    "tags": [
      "aoe",
      "status-effect"
    ]
  },
  {
    "id": "lovestruck",
    "name": "Lovestruck",
    "depth": 1,
    "effects": "Inflicts lovestruck on hit enemies for 20 seconds. Lovestruck units have a 50% chance of healing you for 5 health when they attack.",
    "recipes": [
      [
        "charm",
        "light"
      ],
      [
        "charm",
        "lightning"
      ],
      [
        "charm",
        "time"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/lovestruck.png",
    "tags": [
      "status-effect",
      "lifesteal"
    ]
  },
  {
    "id": "maggot",
    "name": "Maggot",
    "depth": 1,
    "effects": "Infests enemies on hit with maggots. When they die, they explode into 1–2 baby balls.",
    "recipes": [
      [
        "brood-mother",
        "cell"
      ]
    ],
    "onHit": "Spawn",
    "icon": "icons/balls/maggot.png",
    "tags": [
      "status-effect",
      "spawns-baby-balls"
    ]
  },
  {
    "id": "magma",
    "name": "Magma",
    "depth": 1,
    "effects": "Emits lava blobs over time. Enemies who walk into lava blobs are dealt 15–30 damage and gain 1 stack of burn (max 3 stacks). This ball and its lava blobs also deal 6–12 damage to nearby units.",
    "recipes": [
      [
        "burn",
        "earthquake"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/magma.png",
    "tags": [
      "aoe",
      "status-effect"
    ]
  },
  {
    "id": "mosquito-king",
    "name": "Mosquito King",
    "depth": 1,
    "effects": "Spawns a mosquito each time it hits an enemy. Mosquitos attack a random enemy, dealing 80–120 damage each. If a mosquito kills an enemy, they steal 1 health.",
    "recipes": [
      [
        "vampire",
        "brood-mother"
      ]
    ],
    "onHit": "Spawn",
    "icon": "icons/balls/mosquito-king.png",
    "tags": [
      "spawns-allies",
      "lifesteal"
    ]
  },
  {
    "id": "mosquito-kingdom",
    "name": "Mosquito Kingdom",
    "depth": 2,
    "effects": "Spawns 1–2 mosquitos each time it hits an enemy. Mosquitos attack a random enemy, dealing 100–150 damage each. If a mosquito kills an enemy, they steal 2 health.",
    "recipes": [
      [
        "mosquito-king",
        "mosquito-swarm"
      ]
    ],
    "onHit": "Spawn",
    "icon": "icons/balls/mosquito-kingdom.png",
    "tags": [
      "spawns-allies",
      "lifesteal"
    ]
  },
  {
    "id": "mosquito-swarm",
    "name": "Mosquito Swarm",
    "depth": 1,
    "effects": "Explodes into 3–6 mosquitos. Mosquitos attack random enemies, dealing 80–120 damage each. If a mosquito kills an enemy, they steal 1 health.",
    "recipes": [
      [
        "vampire",
        "egg-sac"
      ]
    ],
    "onHit": "Destroy, Spawn",
    "icon": "icons/balls/mosquito-swarm.png",
    "tags": [
      "destroy-on-hit",
      "spawns-allies",
      "lifesteal"
    ]
  },
  {
    "id": "nosferatu",
    "name": "Nosferatu",
    "depth": 2,
    "effects": "Spawns a vampire bat each bounce. Vampire bats fly towards a random enemy, dealing 132–176 damage on hit, turning into a Vampire Lord.",
    "recipes": [
      [
        "vampire-lord",
        "spider-queen",
        "mosquito-king"
      ]
    ],
    "onHit": "Spawn",
    "icon": "icons/balls/nosferatu.png",
    "tags": [
      "spawns-allies"
    ]
  },
  {
    "id": "noxious",
    "name": "Noxious",
    "depth": 1,
    "effects": "Passes through enemies and applies 3 stacks of poison to nearby enemies within a 2 tile radius. Poison lasts for 4 seconds and each stack deals 1–3 damage per second.",
    "recipes": [
      [
        "wind",
        "poison"
      ],
      [
        "wind",
        "dark"
      ]
    ],
    "onHit": "Pass Through",
    "icon": "icons/balls/noxious.png",
    "tags": [
      "pass-through",
      "status-effect"
    ]
  },
  {
    "id": "nuclear-bomb",
    "name": "Nuclear Bomb",
    "depth": 1,
    "effects": "Explodes when hitting an enemy, dealing 300–500 damage to nearby enemies and applying 1 stack of radiation to everyone present indefinitely (max 5 stacks). Each stack of radiation increases damage received by 10%. Has a 3 second cooldown.",
    "recipes": [
      [
        "bomb",
        "poison"
      ]
    ],
    "onHit": "Destroy, AOE",
    "icon": "icons/balls/nuclear-bomb.png",
    "tags": [
      "aoe",
      "destroy-on-hit",
      "screen-clear",
      "status-effect"
    ]
  },
  {
    "id": "offspring",
    "name": "Offspring",
    "depth": 1,
    "effects": "Splits into a clone on hit 4 times.",
    "recipes": [
      [
        "cell",
        "flesh"
      ]
    ],
    "onHit": "Spawn",
    "icon": "icons/balls/offspring.png",
    "tags": [
      "clone"
    ]
  },
  {
    "id": "overgrowth",
    "name": "Overgrowth",
    "depth": 1,
    "effects": "Applies 1 stack of overgrowth. Upon reaching 3, consume all stacks and deal 150–200 damage to all enemies in a 3x3 tile square.",
    "recipes": [
      [
        "earthquake",
        "cell"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/overgrowth.png",
    "tags": [
      "aoe",
      "status-effect"
    ]
  },
  {
    "id": "petrify",
    "name": "Petrify",
    "depth": 1,
    "effects": "Petrifies all enemies within its sightline for 1.5 seconds when first launched, dealing 50–120.",
    "recipes": [
      [
        "stone",
        "flesh"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/petrify.png",
    "tags": [
      "status-effect",
      "aoe"
    ]
  },
  {
    "id": "phantom",
    "name": "Phantom",
    "depth": 1,
    "effects": "Curses enemies on hit. Cursed enemies are dealt 100–200 damage after being hit 5 times.",
    "recipes": [
      [
        "dark",
        "ghost"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/phantom.png",
    "tags": [
      "status-effect"
    ]
  },
  {
    "id": "radiation-beam",
    "name": "Radiation Beam",
    "depth": 1,
    "effects": "Emits a radiation beam on hit that deals 24–48 damage and applies 1 stack of radiation (max 5 stacks, +10% damage taken per stack, 15 s).",
    "recipes": [
      [
        "laser-horizontal",
        "poison"
      ],
      [
        "laser-horizontal",
        "cell"
      ],
      [
        "laser-vertical",
        "poison"
      ],
      [
        "laser-vertical",
        "cell"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/radiation-beam.png",
    "tags": [
      "aoe",
      "status-effect"
    ]
  },
  {
    "id": "reaper",
    "name": "Reaper",
    "depth": 2,
    "effects": "Has a 10% chance to kill enemies on impact, healing you for 5 health.",
    "recipes": [
      [
        "soul-sucker",
        "heart-swallower"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/reaper.png",
    "tags": [
      "screen-clear",
      "lifesteal"
    ]
  },
  {
    "id": "sacrifice",
    "name": "Sacrifice",
    "depth": 1,
    "effects": "Inflicts 4 stacks of bleed (max 15 stacks) and applies curse to hit enemies. Cursed enemies are dealt 50–100 after being hit 5 times.",
    "recipes": [
      [
        "bleed",
        "dark"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/sacrifice.png",
    "tags": [
      "status-effect"
    ]
  },
  {
    "id": "sandstorm",
    "name": "Sandstorm",
    "depth": 1,
    "effects": "Goes through enemies and is surrounded by a raging storm dealing 10–20 damage per second and blinding nearby enemies for 3 seconds.",
    "recipes": [
      [
        "earthquake",
        "wind"
      ],
      [
        "stone",
        "wind"
      ]
    ],
    "onHit": "Pass Through",
    "icon": "icons/balls/sandstorm.png",
    "tags": [
      "pass-through",
      "aoe",
      "status-effect"
    ]
  },
  {
    "id": "satan",
    "name": "Satan",
    "depth": 2,
    "effects": "While active, adds 1 stack of burn to all active enemies per second (max 5 stacks, 10–20 damage per stack per second) and makes them go berserk (15–24 damage to adjacent enemies every second).",
    "recipes": [
      [
        "incubus",
        "succubus"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/satan.png",
    "tags": [
      "aoe",
      "status-effect"
    ]
  },
  {
    "id": "shotgun",
    "name": "Shotgun",
    "depth": 1,
    "effects": "Shoots 3–7 iron baby balls after hitting a wall. Iron baby balls move at 200% speed but are destroyed upon hitting anything.",
    "recipes": [
      [
        "iron",
        "egg-sac"
      ]
    ],
    "onHit": "Spawn",
    "icon": "icons/balls/shotgun.png",
    "tags": [
      "spawns-baby-balls"
    ]
  },
  {
    "id": "sniper",
    "name": "Sniper",
    "depth": 2,
    "effects": "Pierces enemies and shoots 3–7 sniper baby balls after hitting a wall. Sniper baby balls pierce enemies but are destroyed upon hitting a wall.",
    "recipes": [
      [
        "shotgun",
        "assassin"
      ]
    ],
    "onHit": "Pass Through, Spawn",
    "icon": "icons/balls/sniper.png",
    "tags": [
      "pass-through",
      "spawns-baby-balls"
    ]
  },
  {
    "id": "soul-sucker",
    "name": "Soul Sucker",
    "depth": 1,
    "effects": "Passes through enemies and saps them, with a 30% chance of stealing 1 health and reducing their attack damage by 20%.",
    "recipes": [
      [
        "vampire",
        "ghost"
      ]
    ],
    "onHit": "Pass Through",
    "icon": "icons/balls/soul-sucker.png",
    "tags": [
      "pass-through",
      "lifesteal",
      "status-effect"
    ]
  },
  {
    "id": "spider-queen",
    "name": "Spider Queen",
    "depth": 1,
    "effects": "Has a 25% chance of birthing an Egg Sac each time it hits an enemy.",
    "recipes": [
      [
        "brood-mother",
        "egg-sac"
      ]
    ],
    "onHit": "Spawn",
    "icon": "icons/balls/spider-queen.png",
    "tags": [
      "spawns-baby-balls"
    ]
  },
  {
    "id": "steel",
    "name": "Steel",
    "depth": 1,
    "effects": "Initially deals double damage but moves 50% slower. Damage increases by 10% each time it hits an enemy (max 300%).",
    "recipes": [
      [
        "iron",
        "stone"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/steel.png",
    "tags": [
      "single-target",
      "bounce-scaling"
    ]
  },
  {
    "id": "storm",
    "name": "Storm",
    "depth": 1,
    "effects": "Emits lightning to strike nearby enemies every second, dealing 1–40 damage.",
    "recipes": [
      [
        "lightning",
        "wind"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/storm.png",
    "tags": [
      "aoe"
    ]
  },
  {
    "id": "succubus",
    "name": "Succubus",
    "depth": 1,
    "effects": "Each hit has a 4% chance of charming the enemy for 9 seconds. Heals 1 when hitting a charmed enemy.",
    "recipes": [
      [
        "charm",
        "vampire"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/succubus.png",
    "tags": [
      "status-effect",
      "lifesteal"
    ]
  },
  {
    "id": "sun",
    "name": "Sun",
    "depth": 1,
    "effects": "Blinds all enemies in view and adds 1 stack of burn every second (max 5 stacks). Burn lasts for 6 seconds and deals 6–12 damage per stack per second.",
    "recipes": [
      [
        "burn",
        "light"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/sun.png",
    "tags": [
      "screen-clear",
      "aoe",
      "status-effect"
    ]
  },
  {
    "id": "swamp",
    "name": "Swamp",
    "depth": 1,
    "effects": "Leaves behind tar blobs over time. Enemies who walk into tar blobs are dealt 15–30, are slowed by 50% for 7 seconds and gain 1 stack of poison (max 8 stacks). This ball and its tar blobs also deal 6–12 damage to nearby units.",
    "recipes": [
      [
        "poison",
        "earthquake"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/swamp.png",
    "tags": [
      "aoe",
      "status-effect"
    ]
  },
  {
    "id": "time-bomb",
    "name": "Time Bomb",
    "depth": 1,
    "effects": "Throws a time bomb every few seconds, which explodes after a delay, dealing 80–120 damage to nearby enemies.",
    "recipes": [
      [
        "time",
        "bomb"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/time-bomb.png",
    "tags": [
      "aoe",
      "status-effect"
    ]
  },
  {
    "id": "timestop",
    "name": "Timestop",
    "depth": 1,
    "effects": "Freezes everything on the field for 5.0 seconds but destroys itself after hitting an enemy. Has a 30 second cooldown.",
    "recipes": [
      [
        "time",
        "freeze"
      ]
    ],
    "onHit": "Destroy",
    "icon": "icons/balls/timestop.png",
    "tags": [
      "screen-clear",
      "status-effect",
      "destroy-on-hit"
    ]
  },
  {
    "id": "tumor",
    "name": "Tumor",
    "depth": 1,
    "effects": "Applies tumor on hit. Enemies with a tumor die after 40 seconds (except for bosses).",
    "recipes": [
      [
        "radiation-beam",
        "flesh"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/tumor.png",
    "tags": [
      "status-effect"
    ]
  },
  {
    "id": "vampire-lord",
    "name": "Vampire Lord",
    "depth": 1,
    "effects": "Each hit inflicts 3 stacks of bleed. Heals 1 health and consumes all stacks when hitting an enemy with at least 10 stacks of bleed.",
    "recipes": [
      [
        "vampire",
        "bleed"
      ],
      [
        "vampire",
        "dark"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/vampire-lord.png",
    "tags": [
      "status-effect",
      "lifesteal"
    ]
  },
  {
    "id": "venom",
    "name": "Venom",
    "depth": 1,
    "effects": "Applies 1 stack of venom on hit (max 8 stacks). Each stack deals 3–6 damage per second and slows down enemies.",
    "recipes": [
      [
        "poison",
        "freeze"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/venom.png",
    "tags": [
      "status-effect"
    ]
  },
  {
    "id": "virus",
    "name": "Virus",
    "depth": 1,
    "effects": "Applies 1 stack of disease to units it hits (max 8 stacks). Disease lasts 6 seconds; each stack deals 3–6 damage per second, and diseased units have a 15% chance per second of passing a stack to nearby enemies.",
    "recipes": [
      [
        "poison",
        "bleed"
      ],
      [
        "poison",
        "ghost"
      ],
      [
        "poison",
        "cell"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/virus.png",
    "tags": [
      "status-effect"
    ]
  },
  {
    "id": "voluptuous-egg-sac",
    "name": "Voluptuous Egg Sac",
    "depth": 1,
    "effects": "Explodes into 2–3 egg sacs on hitting an enemy. Has a 3 second cooldown.",
    "recipes": [
      [
        "egg-sac",
        "cell"
      ]
    ],
    "onHit": "Destroy, Spawn",
    "icon": "icons/balls/voluptuous-egg-sac.png",
    "tags": [
      "destroy-on-hit",
      "spawns-baby-balls"
    ]
  },
  {
    "id": "warp",
    "name": "Warp",
    "depth": 1,
    "effects": "After each hit, warps to a random spot on the field and speeds up by 5%.",
    "recipes": [
      [
        "time",
        "light"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/warp.png",
    "tags": [
      "ball-speed"
    ]
  },
  {
    "id": "wraith",
    "name": "Wraith",
    "depth": 1,
    "effects": "Freezes any enemy it passes through for 0.8 seconds.",
    "recipes": [
      [
        "freeze",
        "ghost"
      ]
    ],
    "onHit": "Pass Through",
    "icon": "icons/balls/wraith.png",
    "tags": [
      "pass-through",
      "status-effect"
    ]
  },
  {
    "id": "x-ray",
    "name": "X Ray",
    "depth": 2,
    "effects": "Emits an X-shaped laser on hit, which deals 50–75 damage to enemies and applies 1 stack of radiation (max 5 stacks; +10% damage taken per stack).",
    "recipes": [
      [
        "holy-laser",
        "laser-beam"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/x-ray.png",
    "tags": [
      "aoe",
      "status-effect"
    ]
  },
  {
    "id": "zombie",
    "name": "Zombie",
    "depth": 1,
    "effects": "Infects enemies on hit, giving them a 40% chance to turn into a friendly zombie on death.",
    "recipes": [
      [
        "vampire",
        "flesh"
      ]
    ],
    "onHit": "—",
    "icon": "icons/balls/zombie.png",
    "tags": [
      "spawns-allies",
      "status-effect"
    ]
  }
];

