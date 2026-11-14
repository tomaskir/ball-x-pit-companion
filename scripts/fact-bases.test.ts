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
import { parseMarkdownTable, column } from './markdown-table.ts';

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

  it('expands a three-way slot alternate', () => {
    expect(parseRecipes('Freeze + (Wind or Lightning or Water)')).toEqual([
      ['freeze', 'wind'],
      ['freeze', 'lightning'],
      ['freeze', 'water'],
    ]);
  });
});

describe('parseGameMechanics: adjacent duplicate rows are one entity', () => {
  const evolved = (...rows: string[]) => mechanicsTables({ evolvedRows: rows });
  const evolvedPassives = (...rows: string[]) => mechanicsTables({ evolvedPassiveRows: rows });

  it('unions the recipes of consecutive rows in row order', () => {
    const { balls } = parseGameMechanics(evolved(
      '| Overgrowth | Evo | Earthquake + Cell | — | Overgrowth | Applies 1 stack. | base-game |',
      '| Overgrowth | Evo | Time + Wood | — | Overgrowth | Applies 1 stack. | base-game |',
    ));
    expect(balls.find((b) => b.name === 'Overgrowth')!.recipes).toEqual([
      ['earthquake', 'cell'],
      ['time', 'wood'],
    ]);
  });

  it('dedupes an identical recipe repeated across rows', () => {
    const { balls } = parseGameMechanics(evolved(
      '| Overgrowth | Evo | Earthquake + Cell | — | Overgrowth | Applies 1 stack. | base-game |',
      '| Overgrowth | Evo | Earthquake + Cell | — | Overgrowth | Applies 1 stack. | base-game |',
    ));
    expect(balls.find((b) => b.name === 'Overgrowth')!.recipes).toEqual([
      ['earthquake', 'cell'],
    ]);
  });

  it('throws when a non-recipe cell differs across the group', () => {
    expect(() => parseGameMechanics(evolved(
      '| Overgrowth | Evo | Earthquake + Cell | — | Overgrowth | Applies 1 stack. | base-game |',
      '| Overgrowth | Tier-3 | Time + Wood | — | Overgrowth | Applies 1 stack. | base-game |',
    ))).toThrow('duplicate row for Overgrowth differs in "Depth"');
  });

  it('groups adjacent evolved-passive rows the same way', () => {
    const { passives } = parseGameMechanics(evolvedPassives(
      '| Test Passive | Alpha + Beta | Effect. | base-game |',
      '| Test Passive | Gamma + Delta | Effect. | base-game |',
    ));
    expect(passives.find((p) => p.name === 'Test Passive')!.recipes).toEqual([
      ['alpha', 'beta'],
      ['gamma', 'delta'],
    ]);
  });

  it('treats a repeated non-adjacent name as a separate entity', () => {
    const { balls } = parseGameMechanics(evolved(
      '| Overgrowth | Evo | Earthquake + Cell | — | Overgrowth | Applies 1 stack. | base-game |',
      '| Other | Evo | Time + Wood | — | Overgrowth | Applies 1 stack. | base-game |',
      '| Overgrowth | Evo | Time + Wood | — | Overgrowth | Applies 1 stack. | base-game |',
    ));
    expect(balls.filter((b) => b.name === 'Overgrowth')).toHaveLength(2);
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

describe('parsePairings: Risen Ballbylon rows (S5, research #32)', () => {
  // The pairing table names the 8 DLC characters before their roster rows
  // land in game-mechanics.md (T10). Parse the real table against the real
  // roster plus those names; once the roster includes them the dedupe is a
  // no-op. The integration test below is authoritative for the full roster.
  const dlcNames = [
    'The Conduit', 'The Potager', 'The Recollector', 'The Right Hand Man',
    'The Scandalmonger', 'The Scrupulous Scoundrel', 'The Sentinel',
    'The Wallbreaker',
  ];
  const { characters } = parseGameMechanics(realMechanics());
  const roster = [
    ...characters,
    ...dlcNames
      .filter((name) => !characters.some((c) => c.name === name))
      .map((name) => ({ name })),
  ];
  const md = readFileSync(new URL('../docs/research/character-pairings.md', import.meta.url), 'utf8');
  const byName = new Map(parsePairings(md, roster).map((c) => [c.name, c]));

  it('expands the Recollector row in both directions', () => {
    const partners = [
      'The Cohabitants', 'The Embedded', 'The Flagellant', 'The Juggler',
      'The Physicist', 'The Repentant', 'The Right Hand Man',
      'The Scrupulous Scoundrel', 'The Sentinel', 'The Shieldbearer',
      'The Spendthrift', 'The Tunneller', 'The Wallbreaker',
    ];
    expect(byName.get('The Recollector')!.cannotPair).toEqual(expect.arrayContaining(partners));
    for (const partner of partners) {
      expect(byName.get(partner)!.cannotPair).toContain('The Recollector');
    }
  });

  it('expands every other DLC row in both directions', () => {
    const rows: Array<[string, string[]]> = [
      ['The Potager', ['The Spendthrift', 'The Empty Nester']],
      ['The Right Hand Man', ['The Recollector']],
      ['The Scandalmonger', ['The Carouser', 'The Physicist', 'The Sentinel', 'The Tactician']],
      ['The Scrupulous Scoundrel', ['The Physicist', 'The Recollector']],
      ['The Sentinel', ['The Falconer', 'The Juggler', 'The Recollector', 'The Scandalmonger', 'The Shade']],
      ['The Wallbreaker', ['The Recollector']],
    ];
    for (const [name, partners] of rows) {
      expect(byName.get(name)!.cannotPair).toEqual(expect.arrayContaining(partners));
      for (const partner of partners) {
        expect(byName.get(partner)!.cannotPair).toContain(name);
      }
    }
  });

  it('leaves The Conduit unrestricted except for the False Messiah rule', () => {
    expect(byName.get('The Conduit')!.cannotPair).toEqual(['The False Messiah']);
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

describe('parseGameMechanics: reads columns by header name', () => {
  it('does not shift values when a column is inserted after the matched header prefix', () => {
    const md = mechanicsDoc(
      '| Ball | On-hit effect | Notes | Status trigger(s) | Status effect | Effect text (wiki) | Character(s) | Unlock |',
      '| Iron | — | inserted | On-Hit | — | Deals double damage. | The Shieldbearer | default |',
      '| Character | Base ball | Notes | Ability (wiki text, abridged) | Unlock | Synergy-relevant facts |',
      '| The Warrior | Iron | inserted | Quirk. | default | |',
    );
    assertColumnsByName(md);
  });

  it('does not shift values when a column is reordered after the matched header prefix', () => {
    const md = mechanicsDoc(
      '| Ball | On-hit effect | Effect text (wiki) | Status trigger(s) | Status effect | Character(s) | Unlock |',
      '| Iron | — | Deals double damage. | On-Hit | — | The Shieldbearer | default |',
      '| Character | Base ball | Ability (wiki text, abridged) | Unlock | Synergy-relevant facts |',
      '| The Warrior | Iron | Quirk. | default | |',
    );
    assertColumnsByName(md);
  });

  function assertColumnsByName(md: string) {
    const { balls, characters } = parseGameMechanics(md);
    expect(balls.find((b) => b.name === 'Iron')).toMatchObject({ onhit: '—', effect: 'Deals double damage.' });
    expect(characters[0]).toMatchObject({ name: 'The Warrior', baseBall: 'Iron', quirk: 'Quirk.' });
  }

  /** A minimal mechanics doc; the base-ball and character tables are the variables. */
  function mechanicsDoc(baseHeader: string, baseRow: string, charHeader: string, charRow: string): string {
    return [
      baseHeader,
      separator(baseHeader),
      baseRow,
      '',
      '| Ball | Depth | Recipe(s) | On-hit | Status effects | Effect text (wiki) |',
      '|---|---|---|---|---|---|',
      '',
      '| Passive | Effect text (wiki) | Appearance requirement | Unlock |',
      '|---|---|---|---|',
      '',
      '| Passive | Recipe | Effect text (wiki) |',
      '|---|---|---|',
      '',
      charHeader,
      separator(charHeader),
      charRow,
    ].join('\n');
  }
});

describe('parseFactBases: the real fact bases parse without the CLI', () => {
  const parsed = parseFactBases(realSources());

  it('parses the full catalog', () => {
    expect(parsed.balls).toHaveLength(115);
    expect(parsed.passives).toHaveLength(116);
    expect(parsed.characters).toHaveLength(31);
    // The level-3 overlay is extended separately; this pins the current fact base.
    expect(Object.keys(parsed.level3)).toHaveLength(90);
  });

  it('onboards the DLC balls, passives, and characters', () => {
    const balls = new Map(parsed.balls.map((b) => [b.name, b]));
    expect(balls.get('Beast')).toMatchObject({ depth: 0, recipes: [] });
    expect(balls.get('Mudslide')).toMatchObject({
      depth: 2,
      recipes: [['landslide', 'water'], ['sandstorm', 'water']],
    });
    expect(balls.get('Overgrowth')!.recipes).toEqual([
      ['earthquake', 'cell'],
      ['time', 'wood'],
    ]);
    expect(balls.get('Blizzard')!.recipes).toEqual([
      ['freeze', 'wind'],
      ['freeze', 'lightning'],
      ['freeze', 'water'],
    ]);
    expect(balls.get('Venom')!.recipes).toEqual([
      ['freeze', 'poison'],
      ['beast', 'poison'],
    ]);
    expect(parsed.passives.find((p) => p.name === 'Ancient Ladle')).toMatchObject({ depth: 0 });
    expect(parsed.passives.find((p) => p.name === 'Mystic Dipper')).toMatchObject({ depth: 1 });
    expect(parsed.characters.find((c) => c.name === 'The Potager')).toMatchObject({
      baseBall: 'Wood',
    });
  });

  it('expands the Matchmaker relation symmetrically', () => {
    const byName = new Map(parsed.characters.map((c) => [c.name, c]));
    expect(byName.get('The Repentant')!.cannotPair).toContain('The Shieldbearer');
    expect(byName.get('The Shieldbearer')!.cannotPair).toContain('The Repentant');
    expect(byName.get('The False Messiah')!.cannotPair).toHaveLength(parsed.characters.length - 1);
  });
});

describe('game-mechanics.md: every entity row carries an Edition cell', () => {
  const md = realMechanics();
  const tables: [RegExp, string][] = [
    [/^\| Ball \| On-hit effect \|/, 'base balls'],
    [/^\| Ball \| Depth \|/, 'evolved balls'],
    [/^\| Passive \| Effect text \(wiki\) \|/, 'base passives'],
    [/^\| Passive \| Recipe \|/, 'evolved passives'],
    [/^\| Character \| Base ball \|/, 'characters'],
  ];

  for (const [headerRe, label] of tables) {
    it(`${label} rows are base-game or dlc-risen-ballbylon`, () => {
      const rows = parseMarkdownTable(md, headerRe, label);
      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) {
        expect(['base-game', 'dlc-risen-ballbylon']).toContain(column(row, 'Edition'));
      }
    });
  }
});

/** The markdown separator row for a header line. */
const separator = (header: string): string =>
  `|${header.split('|').slice(1, -1).map(() => '---').join('|')}|`;

/** A minimal mechanics doc whose evolved tables are the variables. */
function mechanicsTables(opts: { evolvedRows?: string[]; evolvedPassiveRows?: string[] } = {}): string {
  const table = (header: string, rows: string[]) => [header, separator(header), ...rows].join('\n');
  return [
    table('| Ball | On-hit effect | Status trigger(s) | Status effect | Effect text (wiki) | Character(s) | Unlock | Edition |', [
      '| Iron | — | On-Hit | — | Deals double damage. | — | default | base-game |',
    ]),
    '',
    table('| Ball | Depth | Recipe(s) | On-hit | Status effects | Effect text (wiki) | Edition |', opts.evolvedRows ?? []),
    '',
    table('| Passive | Effect text (wiki) | Appearance requirement | Unlock | Edition |', []),
    '',
    table('| Passive | Recipe | Effect text (wiki) | Edition |', opts.evolvedPassiveRows ?? []),
    '',
    table('| Character | Base ball | Ability (wiki text, abridged) | Unlock | Synergy-relevant facts | Edition |', [
      '| The Warrior | Iron | Quirk. | default | | base-game |',
    ]),
  ].join('\n');
}

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
