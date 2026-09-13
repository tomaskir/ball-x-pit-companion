// Character data from ballxpit.wiki.gg (2026-09-13). Verdict rules are the
// site's editorial synergy model derived from quirk text — not playtested
// (flagged in docs/research/game-mechanics.md). Unlisted tags are neutral.
// The wildcard tag "*passives" matches every passive (The Ballbearer).
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
  verdicts: VerdictRule[];
}

export const CHARACTERS: Character[] = [
  {
    "id": "the-warrior",
    "name": "The Warrior",
    "baseBallId": "bleed",
    "quirk": "Default character, no special gameplay quirks.",
    "icon": "/icons/character-portraits/the-warrior.png",
    "sprite": "/icons/character-sprites/the-warrior.png",
    "verdicts": []
  },
  {
    "id": "the-itchy-finger",
    "name": "The Itchy Finger",
    "baseBallId": "burn",
    "quirk": "Scattered aim, shoots twice as fast, auto-launches balls; full speed while shooting.",
    "icon": "/icons/character-portraits/the-itchy-finger.png",
    "sprite": "/icons/character-sprites/the-itchy-finger.png",
    "verdicts": [
      {
        "tag": "spawns-baby-balls",
        "verdict": "green",
        "note": "More shots per second"
      },
      {
        "tag": "single-target",
        "verdict": "red",
        "note": "Scattered aim degrades aimed single-target play"
      }
    ]
  },
  {
    "id": "the-repentant",
    "name": "The Repentant",
    "baseBallId": "freeze",
    "quirk": "Balls deal +5% damage per bounce; on hitting the back wall they return, damaging enemies passed through.",
    "icon": "/icons/character-portraits/the-repentant.png",
    "sprite": "/icons/character-sprites/the-repentant.png",
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
    ]
  },
  {
    "id": "the-cohabitants",
    "name": "The Cohabitants",
    "baseBallId": "brood-mother",
    "quirk": "Each launched ball is mirrored by a copy; balls deal half damage.",
    "icon": "/icons/character-portraits/the-cohabitants.png",
    "sprite": "/icons/character-sprites/the-cohabitants.png",
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
        "tag": "single-target",
        "verdict": "red",
        "note": "Balls deal half damage"
      }
    ]
  },
  {
    "id": "the-cogitator",
    "name": "The Cogitator",
    "baseBallId": "laser-vertical",
    "quirk": "Automatically chooses upgrades.",
    "icon": "/icons/character-portraits/the-cogitator.png",
    "sprite": "/icons/character-sprites/the-cogitator.png",
    "verdicts": []
  },
  {
    "id": "the-embedded",
    "name": "The Embedded",
    "baseBallId": "poison",
    "quirk": "Balls always pierce enemies until they hit a wall.",
    "icon": "/icons/character-portraits/the-embedded.png",
    "sprite": "/icons/character-sprites/the-embedded.png",
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
    ]
  },
  {
    "id": "the-shade",
    "name": "The Shade",
    "baseBallId": "dark",
    "quirk": "Balls shoot from the back; base crit chance 10%.",
    "icon": "/icons/character-portraits/the-shade.png",
    "sprite": "/icons/character-sprites/the-shade.png",
    "verdicts": [
      {
        "tag": "crit",
        "verdict": "green",
        "note": "Base crit chance 10%; backstabs reward Assassin line"
      },
      {
        "tag": "single-target",
        "verdict": "green",
        "note": "Backstab synergy"
      }
    ]
  },
  {
    "id": "the-shieldbearer",
    "name": "The Shieldbearer",
    "baseBallId": "iron",
    "quirk": "Large shield bounces back balls that hit it.",
    "icon": "/icons/character-portraits/the-shieldbearer.png",
    "sprite": "/icons/character-sprites/the-shieldbearer.png",
    "verdicts": [
      {
        "tag": "destroy-on-hit",
        "verdict": "green",
        "note": "Shield bounces balls back — destroy-on-hit still gets recycled value"
      }
    ]
  },
  {
    "id": "the-spendthrift",
    "name": "The Spendthrift",
    "baseBallId": "vampire",
    "quirk": "Shoots all balls at once in a wide arc.",
    "icon": "/icons/character-portraits/the-spendthrift.png",
    "sprite": "/icons/character-sprites/the-spendthrift.png",
    "verdicts": [
      {
        "tag": "aoe",
        "verdict": "green",
        "note": "Wide-arc volley covers the field"
      }
    ]
  },
  {
    "id": "the-juggler",
    "name": "The Juggler",
    "baseBallId": "lightning",
    "quirk": "Lobs balls at a target position; no bouncing until landing.",
    "icon": "/icons/character-portraits/the-juggler.png",
    "sprite": "/icons/character-sprites/the-juggler.png",
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
    ]
  },
  {
    "id": "the-empty-nester",
    "name": "The Empty Nester",
    "baseBallId": "ghost",
    "quirk": "No baby balls. Each shot shoots multiple instances of one equipped special ball.",
    "icon": "/icons/character-portraits/the-empty-nester.png",
    "sprite": "/icons/character-sprites/the-empty-nester.png",
    "verdicts": [
      {
        "tag": "single-target",
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
    ]
  },
  {
    "id": "the-flagellant",
    "name": "The Flagellant",
    "baseBallId": "egg-sac",
    "quirk": "Balls bounce normally off the bottom of the screen.",
    "icon": "/icons/character-portraits/the-flagellant.png",
    "sprite": "/icons/character-sprites/the-flagellant.png",
    "verdicts": [
      {
        "tag": "spawns-baby-balls",
        "verdict": "green",
        "note": "Balls stay in play longer off the bottom bounce"
      }
    ]
  },
  {
    "id": "the-makeshift-sisyphus",
    "name": "The Makeshift Sisyphus",
    "baseBallId": "earthquake",
    "quirk": "No baby balls. No direct hit damage; AOE and status damage ×4.",
    "icon": "/icons/character-portraits/the-makeshift-sisyphus.png",
    "sprite": "/icons/character-sprites/the-makeshift-sisyphus.png",
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
        "tag": "single-target",
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
    ]
  },
  {
    "id": "the-physicist",
    "name": "The Physicist",
    "baseBallId": "light",
    "quirk": "Balls are affected by gravity toward the back of the screen.",
    "icon": "/icons/character-portraits/the-physicist.png",
    "sprite": "/icons/character-sprites/the-physicist.png",
    "verdicts": []
  },
  {
    "id": "the-tactician",
    "name": "The Tactician",
    "baseBallId": "iron",
    "quirk": "Battles become turn-based.",
    "icon": "/icons/character-portraits/the-tactician.png",
    "sprite": "/icons/character-sprites/the-tactician.png",
    "verdicts": []
  },
  {
    "id": "the-radical",
    "name": "The Radical",
    "baseBallId": "wind",
    "quirk": "Plays the game and chooses upgrades automatically (AI plays).",
    "icon": "/icons/character-portraits/the-radical.png",
    "sprite": "/icons/character-sprites/the-radical.png",
    "verdicts": []
  },
  {
    "id": "the-falconer",
    "name": "The Falconer",
    "baseBallId": "lightning",
    "quirk": "Balls shot from two falcons on the sides of the screen.",
    "icon": "/icons/character-portraits/the-falconer.png",
    "sprite": "/icons/character-sprites/the-falconer.png",
    "verdicts": [
      {
        "tag": "aoe",
        "verdict": "green",
        "note": "Two side lanes cover the field"
      }
    ]
  },
  {
    "id": "the-carouser",
    "name": "The Carouser",
    "baseBallId": "charm",
    "quirk": "Balls can briefly orbit the player on return trajectory.",
    "icon": "/icons/character-portraits/the-carouser.png",
    "sprite": "/icons/character-sprites/the-carouser.png",
    "verdicts": []
  },
  {
    "id": "the-tunneller",
    "name": "The Tunneller",
    "baseBallId": "earthquake",
    "quirk": "Balls wrap around top and bottom of the screen.",
    "icon": "/icons/character-portraits/the-tunneller.png",
    "sprite": "/icons/character-sprites/the-tunneller.png",
    "verdicts": [
      {
        "tag": "aoe",
        "verdict": "green",
        "note": "Vertical wrap keeps balls on the field"
      }
    ]
  },
  {
    "id": "the-tiptoer",
    "name": "The Tiptoer",
    "baseBallId": "laser-horizontal",
    "quirk": "Undetectable by enemies (except bosses/minibosses); drastically less health.",
    "icon": "/icons/character-portraits/the-tiptoer.png",
    "sprite": "/icons/character-sprites/the-tiptoer.png",
    "verdicts": [
      {
        "tag": "single-target",
        "verdict": "green",
        "note": "Stealth keeps you safe while picking targets"
      }
    ]
  },
  {
    "id": "the-hoary-hoarder",
    "name": "The Hoary Hoarder",
    "baseBallId": null,
    "quirk": "Only 2 ball slots; remaining equipment slots become passive slots.",
    "icon": "/icons/character-portraits/the-hoary-hoarder.png",
    "sprite": "/icons/character-sprites/the-hoary-hoarder.png",
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
    ]
  },
  {
    "id": "the-ballbearer",
    "name": "The Ballbearer",
    "baseBallId": "stone",
    "quirk": "Twice as many ball slots, but no passive slots.",
    "icon": "/icons/character-portraits/the-ballbearer.png",
    "sprite": "/icons/character-sprites/the-ballbearer.png",
    "verdicts": [
      {
        "tag": "single-target",
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
    ]
  },
  {
    "id": "the-false-messiah",
    "name": "The False Messiah",
    "baseBallId": "bleed",
    "quirk": "Twitch audience votes on choices and random events.",
    "icon": "/icons/character-portraits/the-false-messiah.png",
    "sprite": "/icons/character-sprites/the-false-messiah.png",
    "verdicts": []
  }
];

