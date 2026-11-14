// The editorial model's own contract: validateEditorial is the one invariant
// list for the hand-maintained maps (TAGS / BALL_TAGS / PASSIVE_TAGS /
// CHAR_VERDICTS), shared by the emit CLI (through validateGenerated) and
// src/data.test.ts. Bidirectional: every entity has an entry and every entry
// resolves to an entity.
import { describe, it, expect } from 'vitest';
import {
  validateEditorial,
  WILDCARD,
  TAGS,
  BALL_TAGS,
  PASSIVE_TAGS,
  CHAR_VERDICTS,
} from './editorial.ts';
import type { EditorialMaps } from './editorial.ts';

const ids = {
  balls: ['iron', 'baby-ball'],
  passives: ['magnet'],
  characters: ['alpha', 'beta'],
};

const valid = (): EditorialMaps => ({
  TAGS: { aoe: 'Area damage' },
  BALL_TAGS: { iron: ['aoe'], 'baby-ball': [] },
  PASSIVE_TAGS: { magnet: [] },
  CHAR_VERDICTS: { alpha: [{ tag: 'aoe', verdict: 'green', note: 'Why' }], beta: [] },
});

describe('validateEditorial: valid model', () => {
  it('passes a complete, resolving model', () => {
    expect(validateEditorial(valid(), ids)).toEqual([]);
  });
});

describe('validateEditorial: bidirectional entity coverage', () => {
  it('reports an entity with no entry', () => {
    const editorial = valid();
    delete editorial.BALL_TAGS['baby-ball'];
    expect(validateEditorial(editorial, ids)).toContain('ball missing tags: baby-ball');
  });

  it('reports a passive with no entry', () => {
    const editorial = valid();
    editorial.PASSIVE_TAGS = {};
    expect(validateEditorial(editorial, ids)).toContain('passive missing tags: magnet');
  });

  it('reports a character with no verdict entry', () => {
    const editorial = valid();
    delete editorial.CHAR_VERDICTS.beta;
    expect(validateEditorial(editorial, ids)).toContain('character missing verdicts: beta');
  });

  it('reports an orphan ball key', () => {
    const editorial = valid();
    editorial.BALL_TAGS.ghost = ['aoe'];
    expect(validateEditorial(editorial, ids)).toContain('ball tags for unknown id: ghost');
  });

  it('reports an orphan passive key', () => {
    const editorial = valid();
    editorial.PASSIVE_TAGS.ghost = [];
    expect(validateEditorial(editorial, ids)).toContain('passive tags for unknown id: ghost');
  });

  it('reports an orphan character key', () => {
    const editorial = valid();
    editorial.CHAR_VERDICTS.ghost = [];
    expect(validateEditorial(editorial, ids)).toContain('character verdicts for unknown id: ghost');
  });
});

describe('validateEditorial: tag vocabulary', () => {
  it('reports an unknown ball tag', () => {
    const editorial = valid();
    editorial.BALL_TAGS.iron = ['nope'];
    expect(validateEditorial(editorial, ids)).toContain('ball iron: unknown tag nope');
  });

  it('reports an unknown passive tag', () => {
    const editorial = valid();
    editorial.PASSIVE_TAGS.magnet = ['nope'];
    expect(validateEditorial(editorial, ids)).toContain('passive magnet: unknown tag nope');
  });

  it('reports an unknown verdict tag', () => {
    const editorial = valid();
    editorial.CHAR_VERDICTS.alpha = [{ tag: 'nope', verdict: 'green', note: 'Why' }];
    expect(validateEditorial(editorial, ids)).toContain('character alpha: unknown tag nope');
  });
});

describe('validateEditorial: verdict rules', () => {
  it('reports a duplicate rule for the same tag', () => {
    const editorial = valid();
    editorial.CHAR_VERDICTS.alpha = [
      { tag: 'aoe', verdict: 'green', note: 'Why' },
      { tag: 'aoe', verdict: 'green', note: 'Why again' },
    ];
    expect(validateEditorial(editorial, ids)).toContain('character alpha: duplicate rule for tag aoe');
  });

  it('reports contradictory verdicts for the same tag', () => {
    const editorial = valid();
    editorial.CHAR_VERDICTS.alpha = [
      { tag: 'aoe', verdict: 'green', note: 'Why' },
      { tag: 'aoe', verdict: 'red', note: 'Why not' },
    ];
    expect(validateEditorial(editorial, ids)).toContain('character alpha: contradictory verdicts for tag aoe');
  });

  it('reports an invalid verdict value', () => {
    const editorial = valid();
    editorial.CHAR_VERDICTS.alpha = [{ tag: 'aoe', verdict: 'yellow' as 'red', note: 'Why' }];
    expect(validateEditorial(editorial, ids)).toContain('character alpha: invalid verdict yellow');
  });

  it('reports a rule with no note', () => {
    const editorial = valid();
    editorial.CHAR_VERDICTS.alpha = [{ tag: 'aoe', verdict: 'green' }];
    expect(validateEditorial(editorial, ids)).toContain('character alpha: rule for tag aoe has no note');
  });
});

describe('validateEditorial: the wildcard', () => {
  it('reports the wildcard used by more than one character', () => {
    const editorial = valid();
    editorial.CHAR_VERDICTS.alpha = [{ tag: WILDCARD, verdict: 'red', note: 'Why' }];
    editorial.CHAR_VERDICTS.beta = [{ tag: WILDCARD, verdict: 'red', note: 'Why' }];
    expect(validateEditorial(editorial, ids)).toContain(`wildcard ${WILDCARD} is used 2 times; it must be unique`);
  });

  it('reports the wildcard used twice on one character', () => {
    const editorial = valid();
    editorial.CHAR_VERDICTS.alpha = [
      { tag: WILDCARD, verdict: 'red', note: 'Why' },
      { tag: WILDCARD, verdict: 'green', note: 'Why not' },
    ];
    expect(validateEditorial(editorial, ids)).toContain(`wildcard ${WILDCARD} is used 2 times; it must be unique`);
  });

  it('reports the wildcard in a ball tag list', () => {
    const editorial = valid();
    editorial.BALL_TAGS.iron = [WILDCARD];
    expect(validateEditorial(editorial, ids)).toContain(`ball iron: wildcard ${WILDCARD} is only valid in character verdicts`);
  });

  it('reports the wildcard in a passive tag list', () => {
    const editorial = valid();
    editorial.PASSIVE_TAGS.magnet = [WILDCARD];
    expect(validateEditorial(editorial, ids)).toContain(`passive magnet: wildcard ${WILDCARD} is only valid in character verdicts`);
  });

  it('accepts a single wildcard use', () => {
    const editorial = valid();
    editorial.CHAR_VERDICTS.alpha = [{ tag: WILDCARD, verdict: 'red', note: 'Why' }];
    expect(validateEditorial(editorial, ids)).toEqual([]);
  });
});

// The applied model from the S2 resolution (issue #28). These pin the exact
// content T15 was asked to apply, so a later edit to the maps is a deliberate
// content decision rather than silent drift.
const S2_TAGS = [
  'aim-direction', 'aoe', 'attach', 'baby-ball-scaling', 'backstab', 'ball-speed',
  'bounce-scaling', 'clone', 'crit', 'destroy-on-hit', 'diagonal', 'direct-damage',
  'field', 'friendly-fire-risk', 'fused-ball', 'knock-up', 'lifesteal', 'orbit',
  'pass-through', 'playfield-loop', 'return-trajectory', 'screen-clear',
  'self-damage', 'shield', 'spawns-allies', 'spawns-baby-balls', 'status-effect',
  'status-scaling', 'teleport', 'wall-bounce',
];

const S2_BALL_TAGS: Record<string, string[]> = {
  ash: ['pass-through', 'status-effect', 'field'],
  beast: ['attach'],
  bullet: ['pass-through', 'direct-damage'],
  force: ['pass-through', 'direct-damage'],
  fruit: ['destroy-on-hit', 'lifesteal'],
  gale: ['aoe', 'knock-up'],
  hedgehog: ['spawns-baby-balls', 'status-effect'],
  ironwood: ['aoe'],
  ivy: ['status-effect', 'aoe'],
  kaiju: ['aoe', 'direct-damage'],
  misfortune: ['destroy-on-hit', 'status-effect', 'aoe'],
  mudslide: ['destroy-on-hit', 'aoe', 'status-effect', 'field'],
  rot: ['destroy-on-hit', 'direct-damage'],
  siren: ['pass-through', 'status-effect'],
  stalagmite: ['aoe', 'knock-up'],
  steam: ['pass-through', 'aoe', 'field'],
  thunderbird: ['attach', 'aoe'],
  tsunami: ['pass-through', 'aoe', 'destroy-on-hit'],
  water: ['spawns-baby-balls', 'aoe'],
  'water-bug': ['spawns-baby-balls'],
  waterfall: ['destroy-on-hit', 'aoe', 'field'],
  werewolf: ['attach', 'lifesteal'],
  wolfpack: ['attach', 'spawns-allies'],
  wood: ['aoe'],
};

const S2_PASSIVE_TAGS: Record<string, string[]> = {
  'ancient-ladle': ['fused-ball', 'clone'],
  'baby-armor': ['spawns-baby-balls'],
  'bent-spyglass': ['aim-direction'],
  'eyeless-spyglass': ['crit', 'aim-direction'],
  'blood-kunai': ['direct-damage'],
  'fractured-boulder': ['aoe', 'status-scaling'],
  'steel-bulwark': ['shield'],
  'charged-bow': ['aoe'],
  'charged-bracelet': ['aoe'],
  'cracked-cinderblock': ['spawns-baby-balls', 'wall-bounce'],
  'unkempt-cradle': ['spawns-baby-balls'],
  'cradle-of-filth': ['spawns-baby-balls'],
  'crystal-decanter': ['orbit'],
  'spiked-discipline': ['wall-bounce'],
  'eldritch-dagger': ['aoe', 'wall-bounce'],
  'eldritch-gauntlet': ['wall-bounce'],
  goniometer: ['bounce-scaling', 'diagonal'],
  'hand-drill': ['playfield-loop'],
  'hand-me-downs': ['spawns-baby-balls'],
  'handheld-rupture': ['aoe', 'status-scaling', 'teleport'],
  'jugglers-club': ['aoe'],
  'jugglers-wheel': ['aoe'],
  'kris-knife': ['backstab'],
  kunai: ['direct-damage'],
  'levitating-rock': ['aoe', 'status-scaling'],
  'liquid-flame': ['status-effect', 'orbit'],
  'lucky-coin': ['spawns-baby-balls'],
  'mystic-dipper': ['fused-ball', 'clone', 'aoe'],
  peacemaker: ['pass-through', 'direct-damage'],
  'silver-revolver': ['pass-through', 'direct-damage'],
  'reachers-drill': ['crit', 'playfield-loop'],
  'refracted-echo': ['clone'],
  'refracting-glass': ['spawns-baby-balls'],
  'relentless-whip': ['spawns-baby-balls', 'wall-bounce'],
  'rusted-blade': ['status-effect'],
  'sands-of-time': ['ball-speed'],
  'shadow-blade': ['crit', 'backstab'],
  'spiked-shield': ['shield', 'aoe'],
  'teardrop-necklace': ['return-trajectory'],
  'teardrop-dagger': ['return-trajectory', 'ball-speed'],
  'test-tube': ['ball-speed'],
  'tilted-dagger': ['crit', 'backstab'],
  'vampires-kiss': ['status-effect', 'lifesteal'],
  'volatile-explosive': ['aoe'],
  'wrapped-explosive': ['aoe', 'wall-bounce'],
};

const S2_CHAR_VERDICTS: Record<string, { tag: string; verdict: 'red' | 'green'; note: string }[]> = {
  'the-conduit': [
    { tag: 'aoe', verdict: 'green', note: 'All ball AOE is centered on you, so area builds land reliably' },
    { tag: 'direct-damage', verdict: 'red', note: 'You must stand near targets for AOE; pure direct damage loses positioning value' },
  ],
  'the-potager': [
    { tag: 'fused-ball', verdict: 'green', note: 'Fusing every special ball into one stacks their effects' },
    { tag: 'spawns-baby-balls', verdict: 'red', note: 'Cannot fuse normally and has no baby balls' },
  ],
  'the-recollector': [
    { tag: 'return-trajectory', verdict: 'green', note: 'Return trajectory doubles hits on the same target' },
    { tag: 'pass-through', verdict: 'green', note: 'Balls pierce on the way out and back' },
  ],
  'the-right-hand-man': [
    { tag: 'wall-bounce', verdict: 'green', note: 'Right-wall hits deal double damage' },
    { tag: 'pass-through', verdict: 'green', note: 'Left-wall hits pierce, at half damage' },
  ],
  'the-scandalmonger': [
    { tag: 'orbit', verdict: 'green', note: 'Returning balls orbit the cursor, covering an area' },
  ],
  'the-scrupulous-scoundrel': [
    { tag: 'diagonal', verdict: 'green', note: 'Perfect-diagonal bounces are predictable and repeatable' },
    { tag: 'wall-bounce', verdict: 'green', note: 'Balls bounce off walls in perfect diagonals' },
  ],
  'the-sentinel': [
    { tag: 'aim-direction', verdict: 'green', note: 'Aim any direction, including behind you' },
  ],
  'the-wallbreaker': [
    { tag: 'teleport', verdict: 'green', note: 'First wall hit teleports the ball across the screen' },
    { tag: 'wall-bounce', verdict: 'green', note: 'First wall hit triggers the teleport' },
  ],
};

describe('S2 editorial model: vocabulary (issue #28)', () => {
  it('has the 30-entry vocabulary in alphabetical order', () => {
    expect(Object.keys(TAGS)).toEqual(S2_TAGS);
  });

  it('renames single-target to direct-damage', () => {
    expect(TAGS['single-target']).toBeUndefined();
    expect(TAGS['direct-damage']).toBe('Direct damage — focused single-hit damage, no area or status');
  });

  it('leaves no single-target reference in any assignment or verdict', () => {
    const assigned = [
      ...Object.values(BALL_TAGS).flat(),
      ...Object.values(PASSIVE_TAGS).flat(),
      ...Object.values(CHAR_VERDICTS).flat().map((r) => r.tag),
    ];
    expect(assigned.filter((tag) => tag === 'single-target')).toEqual([]);
  });
});

describe('S2 editorial model: Risen Ballbylon assignments (issue #28)', () => {
  it('assigns the exact S2 tags to the 24 new balls', () => {
    for (const [id, tags] of Object.entries(S2_BALL_TAGS)) {
      expect(BALL_TAGS[id], `ball ${id}`).toEqual(tags);
    }
  });

  it('assigns the exact S2 tags to the 45 new passives', () => {
    for (const [id, tags] of Object.entries(S2_PASSIVE_TAGS)) {
      expect(PASSIVE_TAGS[id], `passive ${id}`).toEqual(tags);
    }
  });

  it('assigns the exact S2 verdicts to the 8 new characters', () => {
    for (const [id, rules] of Object.entries(S2_CHAR_VERDICTS)) {
      expect(CHAR_VERDICTS[id], `character ${id}`).toEqual(rules);
    }
  });

  it('applies the four retroactive base tags', () => {
    expect(BALL_TAGS.leech).toEqual(['status-effect', 'attach']);
    expect(BALL_TAGS.warp).toEqual(['ball-speed', 'teleport']);
    expect(BALL_TAGS.assassin).toEqual(['direct-damage', 'pass-through', 'backstab']);
    expect(PASSIVE_TAGS['protective-charm']).toEqual(['shield']);
  });
});
