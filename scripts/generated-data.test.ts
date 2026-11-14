// The generated-data contract: emit → validate → write. Pins that validation
// runs before any write (a failing invariant writes nothing), that the
// invariant list catches each class of breakage, and that the checked-in
// generated files are exactly what the fact bases emit.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { emitData, renderGenerated, validateGenerated, runEmitData } from './generated-data.ts';
import { EDITORIAL } from './editorial.ts';
import { parseFactBases } from './fact-bases.ts';
import type { EditorialMaps } from './editorial.ts';
import type { ParsedFactBases } from './fact-bases.ts';

const editorial: EditorialMaps = {
  TAGS: { aoe: 'Area damage' },
  BALL_TAGS: { iron: ['aoe'], 'baby-ball': [] },
  PASSIVE_TAGS: { magnet: [] },
  CHAR_VERDICTS: { alpha: [], beta: [], 'the-false-messiah': [] },
};

const parsed: ParsedFactBases = {
  balls: [
    { name: 'Iron', depth: 0, recipes: [], onhit: 'Hit', effect: 'Deals double damage.', edition: 'base-game' },
    { name: 'Baby Ball', depth: 0, recipes: [], onhit: '', effect: 'Base attack ball, no special abilities.', edition: 'base-game' },
  ],
  passives: [{ name: 'Magnet', depth: 0, recipes: [], effect: 'Attracts pickups.', edition: 'base-game' }],
  characters: [
    { name: 'Alpha', baseBall: 'Iron', quirk: 'Quirk A', cannotPair: ['The False Messiah'], edition: 'base-game' },
    { name: 'Beta', baseBall: null, quirk: 'Quirk B', cannotPair: ['The False Messiah'], edition: 'base-game' },
    { name: 'The False Messiah', baseBall: null, quirk: 'Quirk C', cannotPair: ['Alpha', 'Beta'], edition: 'base-game' },
  ],
  level3: { iron: 'Deals double damage.' },
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

describe('emitData: parsed + editorial → generated shape', () => {
  const data = emitData(parsed, editorial);

  it('maps ids, icons, tags, verdicts, editions, and sorted cannotPair', () => {
    expect(data.balls.map((b) => b.id)).toEqual(['iron', 'baby-ball']);
    expect(data.balls[0].icon).toBe('icons/balls/iron.png');
    expect(data.balls[0].tags).toEqual(['aoe']);
    expect(data.balls[0].edition).toBe('base-game');
    expect(data.passives[0].edition).toBe('base-game');
    expect(data.characters[0].edition).toBe('base-game');
    expect(data.characters[0].verdicts).toEqual([]);
    expect(data.characters[2].cannotPair).toEqual(['alpha', 'beta']);
  });

  it('passes every invariant for valid data', () => {
    expect(validateGenerated(data, editorial)).toEqual([]);
  });
});

describe('validateGenerated: one invariant list', () => {
  const valid = () => emitData(clone(parsed), editorial);

  it('reports an unknown edition on every entity kind', () => {
    const data = valid();
    data.balls[0].edition = 'future-edition' as 'base-game';
    data.passives[0].edition = 'future-edition' as 'base-game';
    data.characters[0].edition = 'future-edition' as 'base-game';
    const findings = validateGenerated(data, editorial);
    expect(findings).toContain('ball iron: unknown edition future-edition');
    expect(findings).toContain('passive magnet: unknown edition future-edition');
    expect(findings).toContain('character alpha: unknown edition future-edition');
  });

  it('reports an unresolved recipe component within the namespace', () => {
    const data = valid();
    data.balls[0].recipes = [['ghost']];
    expect(validateGenerated(data, editorial)).toContain('ball Iron: unresolved component ghost');
  });

  it('reports an unknown tag', () => {
    const data = valid();
    data.balls[0].tags = ['nope'];
    expect(validateGenerated(data, editorial)).toContain('ball iron: unknown tag nope');
  });

  it('reports an invalid verdict value', () => {
    const data = valid();
    data.characters[0].verdicts.push({ tag: 'aoe', verdict: 'yellow' as 'red' });
    expect(validateGenerated(data, editorial)).toContain('character alpha: invalid verdict yellow');
  });

  it('reports a missing verdict entry', () => {
    const data = valid();
    const editorialMissing = { ...editorial, CHAR_VERDICTS: { alpha: [], beta: [] } };
    expect(validateGenerated(data, editorialMissing)).toContain('character missing verdicts: the-false-messiah');
  });

  it('reports an unresolved base ball', () => {
    const data = valid();
    data.characters[0].baseBallId = 'ghost';
    expect(validateGenerated(data, editorial)).toContain('character alpha: unresolved base ball ghost');
  });

  it('reports an asymmetric pairing', () => {
    const data = valid();
    data.characters[0].cannotPair = ['the-false-messiah'];
    data.characters[2].cannotPair = ['beta'];
    expect(validateGenerated(data, editorial)).toContain('pairing not symmetric: alpha -> the-false-messiah');
  });

  it('reports a self-pair', () => {
    const data = valid();
    data.characters[0].cannotPair = ['alpha', 'the-false-messiah'];
    expect(validateGenerated(data, editorial)).toContain('character alpha: cannotPair contains itself');
  });

  it('reports a missing tag entry', () => {
    const data = valid();
    const editorialMissing = { ...editorial, BALL_TAGS: { 'baby-ball': [] } };
    expect(validateGenerated(data, editorialMissing)).toContain('ball missing tags: iron');
  });

  it('reports an orphan editorial entry (validateEditorial runs inside validateGenerated)', () => {
    const data = valid();
    const editorialOrphan = { ...editorial, BALL_TAGS: { ...editorial.BALL_TAGS, ghost: [] } };
    expect(validateGenerated(data, editorialOrphan)).toContain('ball tags for unknown id: ghost');
  });

  it('reports a typo\'d editorial tag key once (data-side and editorial-side agree)', () => {
    const data = valid();
    const editorialTypo = { ...editorial, BALL_TAGS: { ...editorial.BALL_TAGS, iron: ['aoe', 'nope'] } };
    const findings = validateGenerated(data, editorialTypo);
    expect(findings).toContain('ball iron: unknown tag nope');
    expect(findings.filter((f) => f === 'ball iron: unknown tag nope')).toHaveLength(1);
  });

  it('reports an unknown level-3 key', () => {
    const data = valid();
    data.level3 = { ghost: 'text' };
    expect(validateGenerated(data, editorial)).toContain('level-3 text for unknown ball: ghost');
  });

  it('reports a fusable ball with no level-3 text', () => {
    const data = valid();
    data.level3 = {};
    expect(validateGenerated(data, editorial)).toContain('level-3 texts: 0, expected 1');
  });

  it('reports level-3 text for baby-ball', () => {
    const data = valid();
    data.level3 = { iron: 'text', 'baby-ball': 'text' };
    expect(validateGenerated(data, editorial)).toContain('level-3 text must not include baby-ball (not fusable)');
  });
});

describe('runEmitData: validate before write', () => {
  it('writes all five files when the data is valid', () => {
    const written = new Map<string, string>();
    const code = runEmitData(parsed, editorial, (name, content) => written.set(name, content), () => {}, () => {});
    expect(code).toBe(0);
    expect([...written.keys()]).toEqual(['editions.ts', 'tags.ts', 'balls.ts', 'passives.ts', 'characters.ts', 'level-3.ts']);
  });

  it('writes nothing and exits non-zero when an invariant fails', () => {
    const broken = clone(parsed);
    broken.balls[0].recipes = [['ghost']];
    const written = new Map<string, string>();
    const errors: string[] = [];
    const code = runEmitData(broken, editorial, (name, content) => written.set(name, content), () => {}, (m) => errors.push(m));
    expect(code).toBe(1);
    expect(written.size).toBe(0);
    expect(errors).toContain('ball Iron: unresolved component ghost');
    expect(errors.at(-1)).toBe('1 error(s)');
  });
});

describe('the checked-in generated files are exactly what the fact bases emit', () => {
  const sources = {
    mechanics: readFileSync(new URL('../docs/research/game-mechanics.md', import.meta.url), 'utf8'),
    pairings: readFileSync(new URL('../docs/research/character-pairings.md', import.meta.url), 'utf8'),
    level3: readFileSync(new URL('../docs/research/level-3-effects.md', import.meta.url), 'utf8'),
  };
  const files = renderGenerated(emitData(parseFactBases(sources), EDITORIAL));

  for (const { name, content } of files) {
    it(`src/data/${name} matches the emitter`, () => {
      const onDisk = readFileSync(new URL(`../src/data/${name}`, import.meta.url), 'utf8');
      expect(onDisk).toBe(content);
    });
  }
});

describe('passive allow-lists: emit, derive, and validate (T24 / #50)', () => {
  const sources = {
    mechanics: readFileSync(new URL('../docs/research/game-mechanics.md', import.meta.url), 'utf8'),
    pairings: readFileSync(new URL('../docs/research/character-pairings.md', import.meta.url), 'utf8'),
    level3: readFileSync(new URL('../docs/research/level-3-effects.md', import.meta.url), 'utf8'),
  };
  const real = () => emitData(parseFactBases(sources), EDITORIAL);
  const passive = (data: ReturnType<typeof real>, id: string) => data.passives.find((p) => p.id === id)!;

  it('emits the authored DLC allow-list on base passives', () => {
    const data = real();
    expect(passive(data, 'rusted-blade').characterIds).toEqual(['the-warrior']);
    expect(passive(data, 'crystal-decanter').characterIds).toEqual(['the-carouser', 'the-scandalmonger']);
  });

  it('derives evolved allow-lists as the components\' intersection', () => {
    const data = real();
    expect(passive(data, 'vampires-kiss').characterIds).toEqual(['the-warrior']);
    expect(passive(data, 'liquid-flame').characterIds).toEqual(['the-carouser', 'the-scandalmonger']);
    expect(passive(data, 'baby-armor').characterIds).toEqual(['the-empty-nester']);
  });

  it('applies the documented Handheld Rupture override', () => {
    const data = real();
    expect(passive(data, 'handheld-rupture').characterIds).toEqual(['the-makeshift-sisyphus', 'the-wallbreaker']);
  });

  it('emits the separate stat-gate exclusions and loadout requirement', () => {
    const data = real();
    expect(passive(data, 'magnet').excludedCharacterIds).toEqual(['the-shieldbearer']);
    expect(passive(data, 'cornucopia').excludedCharacterIds).toEqual(['the-empty-nester', 'the-makeshift-sisyphus', 'the-potager']);
    expect(passive(data, 'cursed-elixir').requirement).toBe('needs a Poison-applying ball');
  });

  it('the real data passes every invariant', () => {
    expect(validateGenerated(real(), EDITORIAL)).toEqual([]);
  });

  it('rejects a DLC passive with an empty allow-list', () => {
    const data = real();
    passive(data, 'rusted-blade').characterIds = [];
    expect(validateGenerated(data, EDITORIAL)).toContain('DLC passive rusted-blade: empty character allow-list');
  });

  it('rejects an unknown allow-list or excluded character', () => {
    const data = real();
    passive(data, 'rusted-blade').characterIds = ['nobody'];
    passive(data, 'magnet').excludedCharacterIds = ['nobody'];
    const findings = validateGenerated(data, EDITORIAL);
    expect(findings).toContain('passive rusted-blade: unknown allow-list character nobody');
    expect(findings).toContain('passive magnet: unknown excluded character nobody');
  });

  it('rejects an evolved allow-list that is not the component intersection', () => {
    const data = real();
    passive(data, 'vampires-kiss').characterIds = ['the-shade'];
    expect(validateGenerated(data, EDITORIAL).some((f) => f.startsWith('passive vampires-kiss: allow-list'))).toBe(true);
  });

  it('rejects a wrong Handheld Rupture override (the one documented exception)', () => {
    const data = real();
    passive(data, 'handheld-rupture').characterIds = ['the-makeshift-sisyphus'];
    expect(validateGenerated(data, EDITORIAL).some((f) => f.startsWith('passive handheld-rupture: allow-list'))).toBe(true);
  });

  it('keeps the two mechanisms separate: no DLC allow-list on base passives, no stat gates on DLC passives', () => {
    const data = real();
    passive(data, 'magnet').characterIds = ['the-warrior'];
    passive(data, 'rusted-blade').excludedCharacterIds = ['the-warrior'];
    const findings = validateGenerated(data, EDITORIAL);
    expect(findings).toContain('base-game passive magnet: unexpected DLC allow-list');
    expect(findings).toContain('DLC passive rusted-blade: unexpected stat-gate exclusions');
  });
});
