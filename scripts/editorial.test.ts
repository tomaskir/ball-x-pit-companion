// The editorial model's own contract: validateEditorial is the one invariant
// list for the hand-maintained maps (TAGS / BALL_TAGS / PASSIVE_TAGS /
// CHAR_VERDICTS), shared by the emit CLI (through validateGenerated) and
// src/data.test.ts. Bidirectional: every entity has an entry and every entry
// resolves to an entity.
import { describe, it, expect } from 'vitest';
import { validateEditorial, WILDCARD } from './editorial.ts';
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
