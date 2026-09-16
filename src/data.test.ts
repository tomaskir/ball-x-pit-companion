// Data invariants — from ticket 03 (data schema), ticket 02 (fact base counts),
// and the emit-data.ts validations. These guard the generated data files.
import { describe, it, expect } from 'vitest';
import { BALLS } from './data/balls';
import { PASSIVES } from './data/passives';
import { CHARACTERS } from './data/characters';
import { TAGS } from './data/tags';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const ballIds = new Set(BALLS.map((b) => b.id));
const passiveIds = new Set(PASSIVES.map((p) => p.id));
const WILDCARD = '*passives';

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

  it('every recipe component resolves within its own namespace (graphs never cross)', () => {
    for (const b of BALLS) for (const r of b.recipes) for (const c of r) expect(ballIds.has(c)).toBe(true);
    for (const p of PASSIVES) for (const r of p.recipes) for (const c of r) expect(passiveIds.has(c)).toBe(true);
  });

  it('every tag on a ball/passive is in the vocabulary', () => {
    const vocab = new Set(Object.keys(TAGS));
    for (const b of BALLS) for (const t of b.tags) expect(vocab.has(t)).toBe(true);
    for (const p of PASSIVES) for (const t of p.tags) expect(vocab.has(t)).toBe(true);
  });

  it('every character has verdict rules with valid tags and red/green verdicts', () => {
    const vocab = new Set(Object.keys(TAGS));
    for (const ch of CHARACTERS) {
      for (const v of ch.verdicts) {
        expect(['red', 'green']).toContain(v.verdict);
        expect(vocab.has(v.tag) || v.tag === WILDCARD).toBe(true);
      }
    }
  });

  it('every character verdict note is present (tooltip explains the indicator)', () => {
    for (const ch of CHARACTERS) for (const v of ch.verdicts) expect(v.note?.length ?? 0).toBeGreaterThan(0);
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

describe('icon assets self-hosted (ticket 04)', () => {
  const iconDir = new URL('./../public/icons/', import.meta.url).pathname;

  it('every ball/passive/character icon file exists on disk', () => {
    for (const b of BALLS) expect(existsSync(`${iconDir}balls/${b.id}.png`)).toBe(true);
    for (const p of PASSIVES) expect(existsSync(`${iconDir}passives/${p.id}.png`)).toBe(true);
    for (const c of CHARACTERS) expect(existsSync(`${iconDir}character-portraits/${c.id}.png`)).toBe(true);
  });

  it('icon counts on disk match data (91/71/23/23)', () => {
    expect(readdirSync(`${iconDir}balls`)).toHaveLength(91);
    expect(readdirSync(`${iconDir}passives`)).toHaveLength(71);
    expect(readdirSync(`${iconDir}character-sprites`)).toHaveLength(23);
    expect(readdirSync(`${iconDir}character-portraits`)).toHaveLength(23);
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
    // no other character uses the wildcard
    expect(CHARACTERS.filter((c) => c.verdicts.some((v) => v.tag === WILDCARD))).toHaveLength(1);
  });

  it('The Empty Nester and The Makeshift Sisyphus are red on spawns-baby-balls (no baby balls)', () => {
    for (const id of ['the-empty-nester', 'the-makeshift-sisyphus']) {
      const ch = CHARACTERS.find((c) => c.id === id)!;
      expect(ch.verdicts.some((v) => v.tag === 'spawns-baby-balls' && v.verdict === 'red')).toBe(true);
    }
  });
});
