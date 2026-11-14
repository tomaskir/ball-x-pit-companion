// Character data from docs/research/game-mechanics.md — base-game rows from
// ballxpit.wiki.gg (2026-09-13, game v1.301); Risen Ballbylon rows datamined
// from v1.308. Verdict rules are the site's editorial synergy model derived
// from quirk text — not playtested (flagged in docs/research/game-mechanics.md).
// Unlisted tags are neutral.
// The wildcard tag "*passives" matches every passive (The Ballbearer).
// cannotPair is game data: the Matchmaker's forbidden two-character pairs
// (docs/research/character-pairings.md) — symmetric; the False Messiah
// cannot pair with anyone.
export interface VerdictRule {
  tag: string;
  verdict: 'red' | 'green';
  note?: string;
}

export interface Character {
  id: string;
  name: string;
  baseBallId: string | null;
  quirk: string;
  icon: string;
  sprite: string;
  verdicts: VerdictRule[];
  /** Matchmaker-forbidden partner ids (symmetric relation). */
  cannotPair: string[];
}

export const CHARACTERS: Character[] = [
  {
    "id": "the-warrior",
    "name": "The Warrior",
    "baseBallId": "bleed",
    "quirk": "Default character, no special gameplay quirks.",
    "icon": "icons/character-portraits/the-warrior.png",
    "sprite": "icons/character-sprites/the-warrior.png",
    "verdicts": [],
    "cannotPair": [
      "the-false-messiah"
    ]
  },
  {
    "id": "the-itchy-finger",
    "name": "The Itchy Finger",
    "baseBallId": "burn",
    "quirk": "Scattered aim, shoots twice as fast, auto-launches balls; full speed while shooting.",
    "icon": "icons/character-portraits/the-itchy-finger.png",
    "sprite": "icons/character-sprites/the-itchy-finger.png",
    "verdicts": [
      {
        "tag": "spawns-baby-balls",
        "verdict": "green",
        "note": "More shots per second"
      },
      {
        "tag": "direct-damage",
        "verdict": "red",
        "note": "Scattered aim degrades aimed direct-damage play"
      }
    ],
    "cannotPair": [
      "the-false-messiah",
      "the-tactician"
    ]
  },
  {
    "id": "the-repentant",
    "name": "The Repentant",
    "baseBallId": "freeze",
    "quirk": "Balls deal +5% damage per bounce; on hitting the back wall they return, damaging enemies passed through.",
    "icon": "icons/character-portraits/the-repentant.png",
    "sprite": "icons/character-sprites/the-repentant.png",
    "verdicts": [
      {
        "tag": "bounce-scaling",
        "verdict": "green",
        "note": "Balls gain +5% damage per bounce and return from the back wall"
      },
      {
        "tag": "destroy-on-hit",
        "verdict": "red",
        "note": "No bounces to scale"
      }
    ],
    "cannotPair": [
      "the-false-messiah",
      "the-flagellant",
      "the-recollector",
      "the-shieldbearer",
      "the-tunneller"
    ]
  },
  {
    "id": "the-cohabitants",
    "name": "The Cohabitants",
    "baseBallId": "brood-mother",
    "quirk": "Each launched ball is mirrored by a copy; balls deal half damage.",
    "icon": "icons/character-portraits/the-cohabitants.png",
    "sprite": "icons/character-sprites/the-cohabitants.png",
    "verdicts": [
      {
        "tag": "aoe",
        "verdict": "green",
        "note": "Each ball is mirrored — double area coverage"
      },
      {
        "tag": "spawns-baby-balls",
        "verdict": "green",
        "note": "Mirrored copies double spawns"
      },
      {
        "tag": "spawns-allies",
        "verdict": "green",
        "note": "Mirrored copies double spawns"
      },
      {
        "tag": "direct-damage",
        "verdict": "red",
        "note": "Balls deal half damage"
      }
    ],
    "cannotPair": [
      "the-falconer",
      "the-false-messiah",
      "the-juggler",
      "the-makeshift-sisyphus",
      "the-recollector",
      "the-spendthrift"
    ]
  },
  {
    "id": "the-cogitator",
    "name": "The Cogitator",
    "baseBallId": "laser-vertical",
    "quirk": "Automatically chooses upgrades.",
    "icon": "icons/character-portraits/the-cogitator.png",
    "sprite": "icons/character-sprites/the-cogitator.png",
    "verdicts": [],
    "cannotPair": [
      "the-false-messiah"
    ]
  },
  {
    "id": "the-embedded",
    "name": "The Embedded",
    "baseBallId": "poison",
    "quirk": "Balls always pierce enemies until they hit a wall.",
    "icon": "icons/character-portraits/the-embedded.png",
    "sprite": "icons/character-sprites/the-embedded.png",
    "verdicts": [
      {
        "tag": "pass-through",
        "verdict": "green",
        "note": "Balls always pierce until they hit a wall"
      },
      {
        "tag": "status-effect",
        "verdict": "green",
        "note": "Piercing spreads status effects across the field"
      },
      {
        "tag": "wall-bounce",
        "verdict": "red",
        "note": "Balls never bounce off enemies on the way"
      }
    ],
    "cannotPair": [
      "the-false-messiah",
      "the-recollector"
    ]
  },
  {
    "id": "the-shade",
    "name": "The Shade",
    "baseBallId": "dark",
    "quirk": "Balls shoot from the back; base crit chance 10%.",
    "icon": "icons/character-portraits/the-shade.png",
    "sprite": "icons/character-sprites/the-shade.png",
    "verdicts": [
      {
        "tag": "crit",
        "verdict": "green",
        "note": "Base crit chance 10%; backstabs reward Assassin line"
      },
      {
        "tag": "direct-damage",
        "verdict": "green",
        "note": "Backstab synergy"
      }
    ],
    "cannotPair": [
      "the-falconer",
      "the-false-messiah",
      "the-makeshift-sisyphus",
      "the-sentinel"
    ]
  },
  {
    "id": "the-shieldbearer",
    "name": "The Shieldbearer",
    "baseBallId": "iron",
    "quirk": "Large shield bounces back balls that hit it.",
    "icon": "icons/character-portraits/the-shieldbearer.png",
    "sprite": "icons/character-sprites/the-shieldbearer.png",
    "verdicts": [
      {
        "tag": "destroy-on-hit",
        "verdict": "green",
        "note": "Shield bounces balls back — destroy-on-hit still gets recycled value"
      }
    ],
    "cannotPair": [
      "the-false-messiah",
      "the-flagellant",
      "the-physicist",
      "the-recollector",
      "the-repentant",
      "the-tactician",
      "the-tunneller"
    ]
  },
  {
    "id": "the-spendthrift",
    "name": "The Spendthrift",
    "baseBallId": "vampire",
    "quirk": "Shoots all balls at once in a wide arc.",
    "icon": "icons/character-portraits/the-spendthrift.png",
    "sprite": "icons/character-sprites/the-spendthrift.png",
    "verdicts": [
      {
        "tag": "aoe",
        "verdict": "green",
        "note": "Wide-arc volley covers the field"
      }
    ],
    "cannotPair": [
      "the-cohabitants",
      "the-false-messiah",
      "the-makeshift-sisyphus",
      "the-potager",
      "the-recollector"
    ]
  },
  {
    "id": "the-juggler",
    "name": "The Juggler",
    "baseBallId": "lightning",
    "quirk": "Lobs balls at a target position; no bouncing until landing.",
    "icon": "icons/character-portraits/the-juggler.png",
    "sprite": "icons/character-sprites/the-juggler.png",
    "verdicts": [
      {
        "tag": "aoe",
        "verdict": "green",
        "note": "Aimed landing rewards area damage"
      },
      {
        "tag": "bounce-scaling",
        "verdict": "red",
        "note": "No bouncing until landing"
      }
    ],
    "cannotPair": [
      "the-cohabitants",
      "the-false-messiah",
      "the-recollector",
      "the-sentinel"
    ]
  },
  {
    "id": "the-empty-nester",
    "name": "The Empty Nester",
    "baseBallId": "ghost",
    "quirk": "No baby balls. Each shot shoots multiple instances of one equipped special ball.",
    "icon": "icons/character-portraits/the-empty-nester.png",
    "sprite": "icons/character-sprites/the-empty-nester.png",
    "verdicts": [
      {
        "tag": "direct-damage",
        "verdict": "green",
        "note": "Multiple instances of one special ball per shot"
      },
      {
        "tag": "aoe",
        "verdict": "green",
        "note": "Multi-shot of one special ball"
      },
      {
        "tag": "spawns-baby-balls",
        "verdict": "red",
        "note": "No baby balls"
      },
      {
        "tag": "baby-ball-scaling",
        "verdict": "red",
        "note": "No baby balls to scale off"
      }
    ],
    "cannotPair": [
      "the-false-messiah",
      "the-potager"
    ]
  },
  {
    "id": "the-flagellant",
    "name": "The Flagellant",
    "baseBallId": "egg-sac",
    "quirk": "Balls bounce normally off the bottom of the screen.",
    "icon": "icons/character-portraits/the-flagellant.png",
    "sprite": "icons/character-sprites/the-flagellant.png",
    "verdicts": [
      {
        "tag": "spawns-baby-balls",
        "verdict": "green",
        "note": "Balls stay in play longer off the bottom bounce"
      }
    ],
    "cannotPair": [
      "the-false-messiah",
      "the-physicist",
      "the-recollector",
      "the-repentant",
      "the-shieldbearer",
      "the-tactician",
      "the-tunneller"
    ]
  },
  {
    "id": "the-makeshift-sisyphus",
    "name": "The Makeshift Sisyphus",
    "baseBallId": "earthquake",
    "quirk": "No baby balls. No direct hit damage; AOE and status damage ×4.",
    "icon": "icons/character-portraits/the-makeshift-sisyphus.png",
    "sprite": "icons/character-sprites/the-makeshift-sisyphus.png",
    "verdicts": [
      {
        "tag": "aoe",
        "verdict": "green",
        "note": "AOE and status damage ×4"
      },
      {
        "tag": "status-effect",
        "verdict": "green",
        "note": "Status damage ×4"
      },
      {
        "tag": "direct-damage",
        "verdict": "red",
        "note": "No direct hit damage"
      },
      {
        "tag": "spawns-baby-balls",
        "verdict": "red",
        "note": "No baby balls"
      },
      {
        "tag": "baby-ball-scaling",
        "verdict": "red",
        "note": "No baby balls to scale off"
      }
    ],
    "cannotPair": [
      "the-cohabitants",
      "the-false-messiah",
      "the-shade",
      "the-spendthrift"
    ]
  },
  {
    "id": "the-physicist",
    "name": "The Physicist",
    "baseBallId": "light",
    "quirk": "Balls are affected by gravity toward the back of the screen.",
    "icon": "icons/character-portraits/the-physicist.png",
    "sprite": "icons/character-sprites/the-physicist.png",
    "verdicts": [],
    "cannotPair": [
      "the-false-messiah",
      "the-flagellant",
      "the-recollector",
      "the-scandalmonger",
      "the-scrupulous-scoundrel",
      "the-shieldbearer"
    ]
  },
  {
    "id": "the-tactician",
    "name": "The Tactician",
    "baseBallId": "iron",
    "quirk": "Battles become turn-based.",
    "icon": "icons/character-portraits/the-tactician.png",
    "sprite": "icons/character-sprites/the-tactician.png",
    "verdicts": [],
    "cannotPair": [
      "the-carouser",
      "the-false-messiah",
      "the-flagellant",
      "the-itchy-finger",
      "the-scandalmonger",
      "the-shieldbearer"
    ]
  },
  {
    "id": "the-radical",
    "name": "The Radical",
    "baseBallId": "wind",
    "quirk": "Plays the game and chooses upgrades automatically (AI plays).",
    "icon": "icons/character-portraits/the-radical.png",
    "sprite": "icons/character-sprites/the-radical.png",
    "verdicts": [],
    "cannotPair": [
      "the-false-messiah"
    ]
  },
  {
    "id": "the-falconer",
    "name": "The Falconer",
    "baseBallId": "lightning",
    "quirk": "Balls shot from two falcons on the sides of the screen.",
    "icon": "icons/character-portraits/the-falconer.png",
    "sprite": "icons/character-sprites/the-falconer.png",
    "verdicts": [
      {
        "tag": "aoe",
        "verdict": "green",
        "note": "Two side lanes cover the field"
      }
    ],
    "cannotPair": [
      "the-cohabitants",
      "the-false-messiah",
      "the-sentinel",
      "the-shade"
    ]
  },
  {
    "id": "the-carouser",
    "name": "The Carouser",
    "baseBallId": "charm",
    "quirk": "Balls can briefly orbit the player on return trajectory.",
    "icon": "icons/character-portraits/the-carouser.png",
    "sprite": "icons/character-sprites/the-carouser.png",
    "verdicts": [],
    "cannotPair": [
      "the-false-messiah",
      "the-scandalmonger",
      "the-tactician"
    ]
  },
  {
    "id": "the-tunneller",
    "name": "The Tunneller",
    "baseBallId": "earthquake",
    "quirk": "Balls wrap around top and bottom of the screen.",
    "icon": "icons/character-portraits/the-tunneller.png",
    "sprite": "icons/character-sprites/the-tunneller.png",
    "verdicts": [
      {
        "tag": "aoe",
        "verdict": "green",
        "note": "Vertical wrap keeps balls on the field"
      }
    ],
    "cannotPair": [
      "the-false-messiah",
      "the-flagellant",
      "the-recollector",
      "the-repentant",
      "the-shieldbearer"
    ]
  },
  {
    "id": "the-tiptoer",
    "name": "The Tiptoer",
    "baseBallId": "laser-horizontal",
    "quirk": "Undetectable by enemies (except bosses/minibosses); drastically less health.",
    "icon": "icons/character-portraits/the-tiptoer.png",
    "sprite": "icons/character-sprites/the-tiptoer.png",
    "verdicts": [
      {
        "tag": "direct-damage",
        "verdict": "green",
        "note": "Stealth keeps you safe while picking targets"
      }
    ],
    "cannotPair": [
      "the-false-messiah"
    ]
  },
  {
    "id": "the-hoary-hoarder",
    "name": "The Hoary Hoarder",
    "baseBallId": null,
    "quirk": "Only 2 ball slots; remaining equipment slots become passive slots.",
    "icon": "icons/character-portraits/the-hoary-hoarder.png",
    "sprite": "icons/character-sprites/the-hoary-hoarder.png",
    "verdicts": [
      {
        "tag": "status-effect",
        "verdict": "green",
        "note": "Passive-heavy build"
      },
      {
        "tag": "crit",
        "verdict": "green",
        "note": "Passive-heavy build"
      },
      {
        "tag": "spawns-baby-balls",
        "verdict": "red",
        "note": "Only 2 ball slots — uncertain, needs playtesting"
      }
    ],
    "cannotPair": [
      "the-ballbearer",
      "the-false-messiah"
    ]
  },
  {
    "id": "the-ballbearer",
    "name": "The Ballbearer",
    "baseBallId": "stone",
    "quirk": "Twice as many ball slots, but no passive slots.",
    "icon": "icons/character-portraits/the-ballbearer.png",
    "sprite": "icons/character-sprites/the-ballbearer.png",
    "verdicts": [
      {
        "tag": "direct-damage",
        "verdict": "green",
        "note": "Twice as many ball slots"
      },
      {
        "tag": "aoe",
        "verdict": "green",
        "note": "Twice as many ball slots"
      },
      {
        "tag": "*passives",
        "verdict": "red",
        "note": "No passive slots — every passive is dead weight"
      }
    ],
    "cannotPair": [
      "the-false-messiah",
      "the-hoary-hoarder"
    ]
  },
  {
    "id": "the-false-messiah",
    "name": "The False Messiah",
    "baseBallId": "bleed",
    "quirk": "Twitch audience votes on choices and random events.",
    "icon": "icons/character-portraits/the-false-messiah.png",
    "sprite": "icons/character-sprites/the-false-messiah.png",
    "verdicts": [],
    "cannotPair": [
      "the-ballbearer",
      "the-carouser",
      "the-cogitator",
      "the-cohabitants",
      "the-conduit",
      "the-embedded",
      "the-empty-nester",
      "the-falconer",
      "the-flagellant",
      "the-hoary-hoarder",
      "the-itchy-finger",
      "the-juggler",
      "the-makeshift-sisyphus",
      "the-physicist",
      "the-potager",
      "the-radical",
      "the-recollector",
      "the-repentant",
      "the-right-hand-man",
      "the-scandalmonger",
      "the-scrupulous-scoundrel",
      "the-sentinel",
      "the-shade",
      "the-shieldbearer",
      "the-spendthrift",
      "the-tactician",
      "the-tiptoer",
      "the-tunneller",
      "the-wallbreaker",
      "the-warrior"
    ]
  },
  {
    "id": "the-conduit",
    "name": "The Conduit",
    "baseBallId": "lightning",
    "quirk": "Area-of-effect damage from balls is centered on the player.",
    "icon": "icons/character-portraits/the-conduit.png",
    "sprite": "icons/character-sprites/the-conduit.png",
    "verdicts": [
      {
        "tag": "aoe",
        "verdict": "green",
        "note": "All ball AOE is centered on you, so area builds land reliably"
      },
      {
        "tag": "direct-damage",
        "verdict": "red",
        "note": "You must stand near targets for AOE; pure direct damage loses positioning value"
      }
    ],
    "cannotPair": [
      "the-false-messiah"
    ]
  },
  {
    "id": "the-potager",
    "name": "The Potager",
    "baseBallId": "wood",
    "quirk": "All equipped special balls are fused into one ball when shot. Cannot fuse balls normally, and has no baby balls.",
    "icon": "icons/character-portraits/the-potager.png",
    "sprite": "icons/character-sprites/the-potager.png",
    "verdicts": [
      {
        "tag": "fused-ball",
        "verdict": "green",
        "note": "Fusing every special ball into one stacks their effects"
      },
      {
        "tag": "spawns-baby-balls",
        "verdict": "red",
        "note": "Cannot fuse normally and has no baby balls"
      }
    ],
    "cannotPair": [
      "the-empty-nester",
      "the-false-messiah",
      "the-spendthrift"
    ]
  },
  {
    "id": "the-recollector",
    "name": "The Recollector",
    "baseBallId": "time",
    "quirk": "Balls return to you after reaching your aim cursor, piercing enemies there and back.",
    "icon": "icons/character-portraits/the-recollector.png",
    "sprite": "icons/character-sprites/the-recollector.png",
    "verdicts": [
      {
        "tag": "return-trajectory",
        "verdict": "green",
        "note": "Return trajectory doubles hits on the same target"
      },
      {
        "tag": "pass-through",
        "verdict": "green",
        "note": "Balls pierce on the way out and back"
      }
    ],
    "cannotPair": [
      "the-cohabitants",
      "the-embedded",
      "the-false-messiah",
      "the-flagellant",
      "the-juggler",
      "the-physicist",
      "the-repentant",
      "the-right-hand-man",
      "the-scrupulous-scoundrel",
      "the-sentinel",
      "the-shieldbearer",
      "the-spendthrift",
      "the-tunneller",
      "the-wallbreaker"
    ]
  },
  {
    "id": "the-right-hand-man",
    "name": "The Right Hand Man",
    "baseBallId": "stone",
    "quirk": "After hitting the right wall, balls deal double damage. After hitting the left wall, balls deal half damage and go through enemies.",
    "icon": "icons/character-portraits/the-right-hand-man.png",
    "sprite": "icons/character-sprites/the-right-hand-man.png",
    "verdicts": [
      {
        "tag": "wall-bounce",
        "verdict": "green",
        "note": "Right-wall hits deal double damage"
      },
      {
        "tag": "pass-through",
        "verdict": "green",
        "note": "Left-wall hits pierce, at half damage"
      }
    ],
    "cannotPair": [
      "the-false-messiah",
      "the-recollector"
    ]
  },
  {
    "id": "the-scandalmonger",
    "name": "The Scandalmonger",
    "baseBallId": "beast",
    "quirk": "Balls can briefly orbit around the aim cursor when on a return trajectory.",
    "icon": "icons/character-portraits/the-scandalmonger.png",
    "sprite": "icons/character-sprites/the-scandalmonger.png",
    "verdicts": [
      {
        "tag": "orbit",
        "verdict": "green",
        "note": "Returning balls orbit the cursor, covering an area"
      }
    ],
    "cannotPair": [
      "the-carouser",
      "the-false-messiah",
      "the-physicist",
      "the-sentinel",
      "the-tactician"
    ]
  },
  {
    "id": "the-scrupulous-scoundrel",
    "name": "The Scrupulous Scoundrel",
    "baseBallId": "force",
    "quirk": "Balls only bounce in perfect diagonals.",
    "icon": "icons/character-portraits/the-scrupulous-scoundrel.png",
    "sprite": "icons/character-sprites/the-scrupulous-scoundrel.png",
    "verdicts": [
      {
        "tag": "diagonal",
        "verdict": "green",
        "note": "Perfect-diagonal bounces are predictable and repeatable"
      },
      {
        "tag": "wall-bounce",
        "verdict": "green",
        "note": "Balls bounce off walls in perfect diagonals"
      }
    ],
    "cannotPair": [
      "the-false-messiah",
      "the-physicist",
      "the-recollector"
    ]
  },
  {
    "id": "the-sentinel",
    "name": "The Sentinel",
    "baseBallId": "force",
    "quirk": "Can aim and shoot in any direction (including behind you).",
    "icon": "icons/character-portraits/the-sentinel.png",
    "sprite": "icons/character-sprites/the-sentinel.png",
    "verdicts": [
      {
        "tag": "aim-direction",
        "verdict": "green",
        "note": "Aim any direction, including behind you"
      }
    ],
    "cannotPair": [
      "the-falconer",
      "the-false-messiah",
      "the-juggler",
      "the-recollector",
      "the-scandalmonger",
      "the-shade"
    ]
  },
  {
    "id": "the-wallbreaker",
    "name": "The Wallbreaker",
    "baseBallId": "earthquake",
    "quirk": "Balls teleport to the opposite side of the screen the first time hitting a wall.",
    "icon": "icons/character-portraits/the-wallbreaker.png",
    "sprite": "icons/character-sprites/the-wallbreaker.png",
    "verdicts": [
      {
        "tag": "teleport",
        "verdict": "green",
        "note": "First wall hit teleports the ball across the screen"
      },
      {
        "tag": "wall-bounce",
        "verdict": "green",
        "note": "First wall hit triggers the teleport"
      }
    ],
    "cannotPair": [
      "the-false-messiah",
      "the-recollector"
    ]
  }
];

