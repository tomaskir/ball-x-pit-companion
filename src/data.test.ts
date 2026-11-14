// Data invariants — from ticket 03 (data schema), ticket 02 (fact base counts),
// and the generated-data contract. The pipeline invariants are asserted once,
// through validateGenerated (shared with scripts/emit-data.ts); the rest are
// content assertions specific to this fact base.
import { describe, it, expect } from 'vitest';
import { BALLS } from './data/balls';
import { PASSIVES } from './data/passives';
import { CHARACTERS } from './data/characters';
import { TAGS } from './data/tags';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { LEVEL_3_EFFECTS } from './data/level-3';
import { BALL_KIT } from './ball-kit';
import { pairKey } from './pair';
import { byId, complexity } from './graph';
import { validateGenerated } from '../scripts/generated-data.ts';
import { EDITORIAL, WILDCARD } from '../scripts/editorial.ts';

const ballIds = new Set(BALLS.map((b) => b.id));
const iconDir = new URL('./../public/icons/', import.meta.url).pathname;

describe('fact-base counts (ticket 02, game v1.301)', () => {
  it('has 91 balls (21 base + Baby Ball + 69 evolved)', () => {
    expect(BALLS).toHaveLength(91);
    expect(BALLS.filter((b) => b.depth === 0)).toHaveLength(22);
  });
  it('has 71 passives (54 base + 17 evolved)', () => {
    expect(PASSIVES).toHaveLength(71);
    expect(PASSIVES.filter((p) => p.depth === 0)).toHaveLength(54);
  });
  it('has 23 characters', () => {
    expect(CHARACTERS).toHaveLength(23);
  });
  it('has 69 evolved balls (depth > 0)', () => {
    expect(BALLS.filter((b) => b.depth > 0)).toHaveLength(69);
  });
});

describe('schema invariants (ticket 03)', () => {
  it('every id is kebab-case and unique', () => {
    for (const items of [BALLS, PASSIVES, CHARACTERS]) {
      const ids = items.map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('the generated data satisfies every pipeline invariant', () => {
    // One invariant list, shared with scripts/emit-data.ts: recipes resolve
    // within their namespace, tags/verdicts use the vocabulary, the editorial
    // maps cover every entity and resolve only to entities (validateEditorial),
    // every character has a resolving base ball, pairings are symmetric, and
    // the level-3 overlay covers every fusable ball.
    expect(validateGenerated({ tags: TAGS, balls: BALLS, passives: PASSIVES, characters: CHARACTERS, level3: LEVEL_3_EFFECTS }, EDITORIAL)).toEqual([]);
  });

  it('base balls and base passives have no recipes; evolved always do', () => {
    for (const b of BALLS) {
      if (b.depth === 0) expect(b.recipes).toHaveLength(0);
      else expect(b.recipes.length).toBeGreaterThan(0);
    }
    for (const p of PASSIVES) {
      if (p.depth === 0) expect(p.recipes).toHaveLength(0);
      else expect(p.recipes.length).toBeGreaterThan(0);
    }
  });

  it('effect text is non-empty and verbatim-length (no truncation)', () => {
    for (const b of BALLS) expect(b.effects.length).toBeGreaterThan(10);
    for (const p of PASSIVES) expect(p.effects.length).toBeGreaterThan(10);
  });
});

describe('complexity (graph.complexity against the real ball graph)', () => {
  it('counts base balls recursively (the user\'s example: Freeze Ray 2, Time Bomb 3)', () => {
    const graph = byId(BALLS);
    expect(complexity(graph.get('freeze-ray')!, graph)).toBe(2); // freeze + laser (either hilt)
    expect(complexity(graph.get('time-bomb')!, graph)).toBe(3); // time + bomb (burn + iron)
  });
});

describe('icon assets self-hosted (ticket 04)', () => {
  it('every ball/passive/character icon file exists on disk', () => {
    for (const b of BALLS) expect(existsSync(`${iconDir}balls/${b.id}.png`)).toBe(true);
    for (const p of PASSIVES) expect(existsSync(`${iconDir}passives/${p.id}.png`)).toBe(true);
    for (const c of CHARACTERS) expect(existsSync(`${iconDir}character-portraits/${c.id}.png`)).toBe(true);
  });

  it('icon counts on disk (115/116/31/31)', () => {
    expect(readdirSync(`${iconDir}balls`)).toHaveLength(115);
    expect(readdirSync(`${iconDir}passives`)).toHaveLength(116);
    expect(readdirSync(`${iconDir}character-sprites`)).toHaveLength(31);
    expect(readdirSync(`${iconDir}character-portraits`)).toHaveLength(31);
  });
});

describe('Risen Ballbylon icons (DLC v1.308)', () => {
  const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // The DLC catalog rows land with the edition data merge; pin the files on
  // disk independently so the onboarding is verified before that merge.
  const dlcBalls = [
    'ash', 'beast', 'bullet', 'force', 'fruit', 'gale', 'hedgehog', 'ironwood',
    'ivy', 'kaiju', 'misfortune', 'mudslide', 'rot', 'siren', 'stalagmite',
    'steam', 'thunderbird', 'tsunami', 'water', 'water-bug', 'waterfall',
    'werewolf', 'wolfpack', 'wood',
  ];
  const dlcPassives = [
    'ancient-ladle', 'baby-armor', 'bent-spyglass', 'blood-kunai', 'charged-bow',
    'charged-bracelet', 'cracked-cinderblock', 'cradle-of-filth',
    'crystal-decanter', 'eldritch-dagger', 'eldritch-gauntlet',
    'eyeless-spyglass', 'fractured-boulder', 'goniometer', 'hand-drill',
    'hand-me-downs', 'handheld-rupture', 'jugglers-club', 'jugglers-wheel',
    'kris-knife', 'kunai', 'levitating-rock', 'liquid-flame', 'lucky-coin',
    'mystic-dipper', 'peacemaker', 'reachers-drill', 'refracted-echo',
    'refracting-glass', 'relentless-whip', 'rusted-blade', 'sands-of-time',
    'shadow-blade', 'silver-revolver', 'spiked-discipline', 'spiked-shield',
    'steel-bulwark', 'teardrop-dagger', 'teardrop-necklace', 'test-tube',
    'tilted-dagger', 'unkempt-cradle', 'vampires-kiss', 'volatile-explosive',
    'wrapped-explosive',
  ];
  const dlcCharacters = [
    'the-conduit', 'the-potager', 'the-recollector', 'the-right-hand-man',
    'the-scandalmonger', 'the-scrupulous-scoundrel', 'the-sentinel',
    'the-wallbreaker',
  ];

  it('has all 85 DLC icon files on disk', () => {
    for (const id of dlcBalls) expect(existsSync(`${iconDir}balls/${id}.png`)).toBe(true);
    for (const id of dlcPassives) expect(existsSync(`${iconDir}passives/${id}.png`)).toBe(true);
    for (const id of dlcCharacters) {
      expect(existsSync(`${iconDir}character-portraits/${id}.png`)).toBe(true);
      expect(existsSync(`${iconDir}character-sprites/${id}.png`)).toBe(true);
    }
  });

  it('every icon file is a valid non-empty PNG', () => {
    for (const dir of ['balls', 'passives', 'character-sprites', 'character-portraits']) {
      for (const file of readdirSync(`${iconDir}${dir}`)) {
        const bytes = readFileSync(`${iconDir}${dir}/${file}`);
        expect(bytes.length, `${dir}/${file} is non-empty`).toBeGreaterThan(0);
        expect(bytes.subarray(0, 8), `${dir}/${file} has the PNG signature`).toEqual(PNG_SIGNATURE);
      }
    }
  });

  it('DLC character sprites are the generated 51x54 frames, not the 16x16 source frames', () => {
    for (const id of dlcCharacters) {
      const bytes = readFileSync(`${iconDir}character-sprites/${id}.png`);
      const dimensions = [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
      expect(dimensions, `${id} is 51x54`).toEqual([51, 54]);
    }
  });
});

describe('characters (ticket 06)', () => {
  it('every character except The Hoary Hoarder has a base ball that resolves', () => {
    for (const ch of CHARACTERS) {
      if (ch.id === 'the-hoary-hoarder') {
        expect(ch.baseBallId).toBeNull();
      } else {
        expect(ch.baseBallId).not.toBeNull();
        expect(ballIds.has(ch.baseBallId!)).toBe(true);
      }
    }
  });

  it('The Ballbearer carries the *passives wildcard (red on every passive)', () => {
    const ballbearer = CHARACTERS.find((c) => c.id === 'the-ballbearer')!;
    expect(ballbearer.verdicts.some((v) => v.tag === WILDCARD && v.verdict === 'red')).toBe(true);
    // wildcard uniqueness is an editorial invariant (validateEditorial, via
    // the pipeline-invariant test above)
  });

  it('The Empty Nester and The Makeshift Sisyphus are red on spawns-baby-balls (no baby balls)', () => {
    for (const id of ['the-empty-nester', 'the-makeshift-sisyphus']) {
      const ch = CHARACTERS.find((c) => c.id === id)!;
      expect(ch.verdicts.some((v) => v.tag === 'spawns-baby-balls' && v.verdict === 'red')).toBe(true);
    }
  });
});

describe('Matchmaker pairing restrictions (character-pairings.md)', () => {
  const byId = new Map(CHARACTERS.map((c) => [c.id, c]));

  it('17 forbidden pairs over the 22 pairable characters (the doc\'s table)', () => {
    const pairs = new Set(
      CHARACTERS.flatMap((c) => c.cannotPair.map((p) => pairKey(c.id, p))),
    );
    // 17 regular pairs + the False Messiah's 22 (they pair with nobody)
    expect(pairs.size).toBe(39);
    expect(pairs.size - [...pairs].filter((k) => k.includes('the-false-messiah')).length).toBe(17);
  });

  it('spot-checks from the research: Repentant x Shieldbearer, Cohabitants x Juggler, Itchy Finger x Tactician', () => {
    expect(byId.get('the-repentant')!.cannotPair).toContain('the-shieldbearer');
    expect(byId.get('the-cohabitants')!.cannotPair).toContain('the-juggler');
    expect(byId.get('the-itchy-finger')!.cannotPair).toContain('the-tactician');
    // the contradiction the doc resolves: Flagellant x Juggler is ALLOWED
    expect(byId.get('the-flagellant')!.cannotPair).not.toContain('the-juggler');
  });
});

describe('level-3 effect-text overlay (decision #12, transcription #22)', () => {
  it('has level-3 text for all 90 fusable balls; Baby Ball is excluded', () => {
    expect(Object.keys(LEVEL_3_EFFECTS)).toHaveLength(90);
    expect(LEVEL_3_EFFECTS['baby-ball']).toBeUndefined();
    for (const b of BALLS) {
      if (b.id === 'baby-ball') continue;
      expect(LEVEL_3_EFFECTS[b.id], `missing level-3 text for ${b.id}`).toBeTruthy();
    }
  });

  it('only Elemental and Ghost have no L3 diff (the transcription\'s two documented cases)', () => {
    const same = BALLS
      .filter((b) => b.id !== 'baby-ball' && LEVEL_3_EFFECTS[b.id] === b.effects)
      .map((b) => b.id)
      .sort();
    expect(same).toEqual(['elemental', 'ghost']);
  });
});

describe('ball kit table agrees with the level-3 overlay', () => {
  // The kit table carries L3 values directly (decision #7). Any value not
  // marked `source: 'reported'` must appear verbatim in the generated L3
  // text, so the table and the composer cannot drift apart.
  it('every non-reported scalar value appears in the ball\'s L3 text', () => {
    for (const [ballId, kit] of Object.entries(BALL_KIT)) {
      const text = LEVEL_3_EFFECTS[ballId];
      expect(text, `ball kit key "${ballId}" has no level-3 text`).toBeTruthy();
      for (const s of kit.scalars) {
        if (s.source === 'reported') continue;
        expect(text.includes(s.value), `${ballId} ${s.key}: "${s.value}" not in L3 text`).toBe(true);
      }
    }
  });
});
