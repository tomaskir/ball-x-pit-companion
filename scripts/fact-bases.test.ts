// Fact-base parsers are exported and unit-tested without running the CLI:
// the recipe grammar, the pairing expansion, and the level-3 table each have
// a direct test, plus one integration pass over the real fact bases.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  parseRecipes,
  parseGameMechanics,
  parsePairings,
  parseLevel3,
  parseFactBases,
} from './fact-bases.ts';

describe('parseRecipes: OR-of-ANDs grammar', () => {
  it('expands a parenthesized slot alternate', () => {
    expect(parseRecipes('Iron + (Ghost or Dark)')).toEqual([
      ['iron', 'ghost'],
      ['iron', 'dark'],
    ]);
  });

  it('keeps a plain multi-slot recipe as one recipe', () => {
    expect(parseRecipes('Burn + Wind + Freeze + Earthquake')).toEqual([
      ['burn', 'wind', 'freeze', 'earthquake'],
    ]);
  });

  it('expands whole-cell alternates when there is no "+"', () => {
    expect(parseRecipes('Laser H or Laser V')).toEqual([['laser-horizontal'], ['laser-vertical']]);
  });

  it('expands alternates in every slot', () => {
    expect(parseRecipes('(Ghost or Dark) + (Wind or Lightning)')).toEqual([
      ['ghost', 'wind'],
      ['ghost', 'lightning'],
      ['dark', 'wind'],
      ['dark', 'lightning'],
    ]);
  });

  it('resolves evolved components and apostrophes through slug', () => {
    expect(parseRecipes("Deadeye's Cross + Gracious Impaler")).toEqual([
      ['deadeyes-cross', 'gracious-impaler'],
    ]);
  });

  it('strips bold markers and the "(4-way)" annotation', () => {
    expect(parseRecipes('**Sun** + (Dark or Time) (4-way)')).toEqual([
      ['sun', 'dark'],
      ['sun', 'time'],
    ]);
  });
});

describe('parsePairings: one symmetric expansion', () => {
  const characters = [{ name: 'Alpha' }, { name: 'Beta' }, { name: 'Gamma' }, { name: 'The False Messiah' }];
  const md = [
    '| Character | Cannot pair with | Sources |',
    '|---|---|---|',
    '| Alpha | Beta | S1 |',
    '| The False Messiah | *all* — cannot be a second character | S3 |',
  ].join('\n');

  it('expands each listed pair in both directions', () => {
    const out = parsePairings(md, characters);
    const byName = new Map(out.map((c) => [c.name, c]));
    expect(byName.get('Alpha')!.cannotPair).toContain('Beta');
    expect(byName.get('Beta')!.cannotPair).toContain('Alpha');
  });

  it('expands *all* to every other character, both directions', () => {
    const out = parsePairings(md, characters);
    const messiah = out.find((c) => c.name === 'The False Messiah')!;
    expect(messiah.cannotPair).toEqual(['Alpha', 'Beta', 'Gamma']);
    for (const name of ['Alpha', 'Beta', 'Gamma']) {
      expect(out.find((c) => c.name === name)!.cannotPair).toContain('The False Messiah');
    }
  });

  it('applies the *all* expansion to a character with no row of its own', () => {
    const out = parsePairings(md, characters);
    expect(out.find((c) => c.name === 'Gamma')!.cannotPair).toEqual(['The False Messiah']);
  });

  it('throws on a row for an unknown character', () => {
    const bad = '| Character | Cannot pair with | Sources |\n|---|---|---|\n| Nobody | Alpha | S1 |';
    expect(() => parsePairings(bad, characters)).toThrow('pairing row for unknown character: Nobody');
  });

  it('throws on an unknown partner', () => {
    const bad = '| Character | Cannot pair with | Sources |\n|---|---|---|\n| Alpha | Nobody | S1 |';
    expect(() => parsePairings(bad, characters)).toThrow('pairing row for Alpha: unknown partner "Nobody"');
  });
});

describe('parseLevel3: id → level-3 text', () => {
  const md = [
    '| Ball | Level-3 effect text | Notes |',
    '|---|---|---|',
    '| Iron | Deals **double** damage. | |',
    '| Baby Ball | — | no table |',
    '| Laser (Horizontal) | Deals 9–18 damage. | |',
  ].join('\n');

  it('keys by slug, cleans bold, and skips the non-fusable "—" row', () => {
    expect(parseLevel3(md)).toEqual({
      iron: 'Deals double damage.',
      'laser-horizontal': 'Deals 9–18 damage.',
    });
  });
});

describe('parseGameMechanics: structural depth from recipes', () => {
  it('computes depth 0/1/2 from the recipe graph, not wiki labels', () => {
    const { balls } = parseGameMechanics(realMechanics());
    const depth = new Map(balls.map((b) => [b.name, b.depth]));
    expect(depth.get('Iron')).toBe(0);
    expect(depth.get('Assassin')).toBe(1); // Iron + (Ghost or Dark)
    expect(depth.get('Tumor')).toBe(2); // Radiation Beam + Flesh
  });
});

describe('parseFactBases: the real fact bases parse without the CLI', () => {
  const parsed = parseFactBases(realSources());

  it('parses the full catalog', () => {
    expect(parsed.balls).toHaveLength(91);
    expect(parsed.passives).toHaveLength(71);
    expect(parsed.characters).toHaveLength(23);
    expect(Object.keys(parsed.level3)).toHaveLength(90);
  });

  it('expands the Matchmaker relation symmetrically', () => {
    const byName = new Map(parsed.characters.map((c) => [c.name, c]));
    expect(byName.get('The Repentant')!.cannotPair).toContain('The Shieldbearer');
    expect(byName.get('The Shieldbearer')!.cannotPair).toContain('The Repentant');
    expect(byName.get('The False Messiah')!.cannotPair).toHaveLength(22);
  });
});

function realSources() {
  return {
    mechanics: realMechanics(),
    pairings: readFileSync(new URL('../docs/research/character-pairings.md', import.meta.url), 'utf8'),
    level3: readFileSync(new URL('../docs/research/level-3-effects.md', import.meta.url), 'utf8'),
  };
}

function realMechanics(): string {
  return readFileSync(new URL('../docs/research/game-mechanics.md', import.meta.url), 'utf8');
}
