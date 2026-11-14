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
import { slug } from './slug.ts';
import { pairKey } from '../src/pair.ts';

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
  const byName = new Map(realPairings().map((c) => [c.name, c]));

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

describe('parsePairings: existing-roster corrections (S5, risen-matchmaker-pairs.md §5)', () => {
  const parsed = realPairings();
  const byName = new Map(parsed.map((c) => [c.name, c]));
  const nonMessiahPairs = 43;

  it('adds the four pre-DLC pairs the community table missed, both directions', () => {
    const pairs: Array<[string, string]> = [
      ['The Tunneller', 'The Shieldbearer'],
      ['The Tunneller', 'The Flagellant'],
      ['The Tactician', 'The Carouser'],
      ['The Ballbearer', 'The Hoary Hoarder'],
    ];
    for (const [a, b] of pairs) {
      expect(byName.get(a)!.cannotPair).toContain(b);
      expect(byName.get(b)!.cannotPair).toContain(a);
    }
  });

  it('drops Cogitator x Radical, which v1.308 does not enforce', () => {
    expect(byName.get('The Cogitator')!.cannotPair).not.toContain('The Radical');
    expect(byName.get('The Radical')!.cannotPair).not.toContain('The Cogitator');
  });

  it('keeps the False Messiah no-partner rule and the symmetric closure', () => {
    const messiah = byName.get('The False Messiah')!;
    expect(messiah.cannotPair).toHaveLength(parsed.length - 1);
    for (const c of parsed) {
      if (c.name === 'The False Messiah') continue;
      expect(c.cannotPair).toContain('The False Messiah');
    }
  });

  it(`models exactly the ${nonMessiahPairs} non-Messiah forbidden pairs of the v1.308 matrix`, () => {
    const pairs = new Set(
      parsed
        .filter((c) => c.name !== 'The False Messiah')
        .flatMap((c) => c.cannotPair
          .filter((p) => p !== 'The False Messiah')
          .map((p) => pairKey(c.name, p))),
    );
    expect(pairs.size).toBe(nonMessiahPairs);
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

describe('parseGameMechanics: the Edition column', () => {
  /** A minimal mechanics doc whose base-ball Edition cell is the variable. */
  const minimal = (editionCell: string): string => [
    '| Ball | On-hit effect | Status trigger(s) | Status effect | Effect text (wiki) | Character(s) | Unlock | Edition |',
    '|---|---|---|---|---|---|---|---|',
    `| Iron | — | On-Hit | — | Deals double damage. | — | default | ${editionCell} |`,
    '',
    '| Ball | Depth | Recipe(s) | On-hit | Status effects | Effect text (wiki) | Edition |',
    '|---|---|---|---|---|---|---|',
    '',
    '| Passive | Effect text (wiki) | Appearance requirement | Unlock | Edition |',
    '|---|---|---|---|---|',
    '',
    '| Passive | Recipe | Effect text (wiki) | Edition |',
    '|---|---|---|---|',
    '',
    '| Character | Base ball | Ability (wiki text, abridged) | Unlock | Synergy-relevant facts | Edition |',
    '|---|---|---|---|---|---|',
    '| The Warrior | Iron | Quirk. | default | | base-game |',
  ].join('\n');

  it('reads the Edition cell', () => {
    const { balls } = parseGameMechanics(minimal('dlc-risen-ballbylon'));
    expect(balls.find((b) => b.name === 'Iron')!.edition).toBe('dlc-risen-ballbylon');
  });

  it('an absent (blank) cell means base-game', () => {
    const { balls } = parseGameMechanics(minimal(''));
    expect(balls.find((b) => b.name === 'Iron')!.edition).toBe('base-game');
  });

  it('an unknown edition is a content error', () => {
    expect(() => parseGameMechanics(minimal('future-edition'))).toThrow('unknown edition "future-edition"');
  });

  it('parses the real roster editions', () => {
    const parsed = parseFactBases(realSources());
    const ball = (name: string) => parsed.balls.find((b) => b.name === name)!;
    const passive = (name: string) => parsed.passives.find((p) => p.name === name)!;
    const character = (name: string) => parsed.characters.find((c) => c.name === name)!;
    expect(ball('Beast').edition).toBe('dlc-risen-ballbylon');
    expect(ball('Ash').edition).toBe('dlc-risen-ballbylon');
    expect(ball('Bleed').edition).toBe('base-game');
    expect(ball('Baby Ball').edition).toBe('base-game');
    expect(passive('Ancient Ladle').edition).toBe('dlc-risen-ballbylon');
    expect(passive('Wagon Wheel').edition).toBe('base-game');
    expect(character('The Potager').edition).toBe('dlc-risen-ballbylon');
    expect(character('The Warrior').edition).toBe('base-game');
  });
});

describe('parseFactBases: the real fact bases parse without the CLI', () => {
  const parsed = parseFactBases(realSources());

  it('parses the full catalog', () => {
    expect(parsed.balls).toHaveLength(115);
    expect(parsed.passives).toHaveLength(116);
    expect(parsed.characters).toHaveLength(31);
    expect(Object.keys(parsed.level3)).toHaveLength(114);
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

describe('parseGameMechanics: passive allow-lists and stat gates (§2.3)', () => {
  const parsed = parseFactBases(realSources());
  const passive = (name: string) => parsed.passives.find((p) => p.name === name)!;

  it('parses the DLC allow-list into characterIds', () => {
    expect(passive('Rusted Blade').characterIds).toEqual(['the-warrior']);
    expect(passive('Crystal Decanter').characterIds).toEqual(['the-carouser', 'the-scandalmonger']);
  });

  it('parses the evolved override separately from the base allow-list', () => {
    expect(passive('Handheld Rupture').allowListOverride).toEqual(['the-makeshift-sisyphus', 'the-wallbreaker']);
    expect(passive('Handheld Rupture').characterIds).toBeUndefined();
  });

  it('parses base-game stat-gate exclusions', () => {
    expect(passive('Magnet').excludedCharacterIds).toEqual(['the-shieldbearer']);
    expect(passive('Cornucopia').excludedCharacterIds).toEqual(['the-empty-nester', 'the-makeshift-sisyphus', 'the-potager']);
  });

  it('parses the loadout requirement text', () => {
    expect(passive('Cursed Elixir').requirement).toBe('needs a Poison-applying ball');
    expect(passive('Wagon Wheel').requirement).toBeUndefined();
  });

  it('throws on a restriction row for an unknown passive', () => {
    const md = mechanicsTables() + [
      '',
      '| Passive | Character(s) | Excluded characters |',
      '|---|---|---|',
      '| Nobody | The Warrior | — |',
    ].join('\n');
    expect(() => parseGameMechanics(md)).toThrow('passive restriction row for unknown passive: Nobody');
  });
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

/** The real roster paired against the real pairing table. */
function realPairings() {
  const { characters } = parseGameMechanics(realMechanics());
  const md = readFileSync(new URL('../docs/research/character-pairings.md', import.meta.url), 'utf8');
  return parsePairings(md, characters);
}

describe('parseFactBases: DLC level-3 normalization (T11 / #37)', () => {
  const level3 = parseFactBases(realSources()).level3;
  // The catalog derives ids with `slug(name)`; pin that the fact-base rows land
  // under the same ids the catalog will use once T10 onboards the DLC balls.
  const dlcBalls: [name: string, id: string][] = [
    ['Ash', 'ash'], ['Beast', 'beast'], ['Bullet', 'bullet'], ['Force', 'force'],
    ['Fruit', 'fruit'], ['Gale', 'gale'], ['Hedgehog', 'hedgehog'],
    ['Ironwood', 'ironwood'], ['Ivy', 'ivy'], ['Kaiju', 'kaiju'],
    ['Misfortune', 'misfortune'], ['Mudslide', 'mudslide'], ['Rot', 'rot'],
    ['Siren', 'siren'], ['Stalagmite', 'stalagmite'], ['Steam', 'steam'],
    ['Thunderbird', 'thunderbird'], ['Tsunami', 'tsunami'], ['Water', 'water'],
    ['Water Bug', 'water-bug'], ['Waterfall', 'waterfall'],
    ['Werewolf', 'werewolf'], ['Wolfpack', 'wolfpack'], ['Wood', 'wood'],
  ];

  it('onboards all 24 DLC balls under their catalog slug ids', () => {
    for (const [name, id] of dlcBalls) {
      expect(slug(name), `${name} slug`).toBe(id);
      expect(level3[id], `missing level-3 text for ${id}`).toBeTruthy();
    }
  });

  it('applies the field-specific divisors, not a blanket ÷10', () => {
    // kCharmChance and kLifeStealChance are tenths; kDamageMultiplier is hundredths.
    expect(level3.siren).toContain('7.5% chance');
    expect(level3.werewolf).toContain('40% chance');
    expect(level3.misfortune).toContain('6.0x damage');
    // kBonusDamagePct is a plain percentage (Stone precedent) — 1200%, not 120%.
    expect(level3.bullet).toContain('1200% damage');
    // Time fields with no field precedent: ÷10 per the S4 decision.
    expect(level3.steam).toContain('6.0 seconds');
    expect(level3.steam).toContain('8.0 seconds');
    expect(level3.waterfall).toContain('8.0 seconds');
    expect(level3.ash).toContain('5.0 seconds');
    expect(level3.ash).toContain('6.0 seconds');
  });
});

describe('parseFactBases: existing-row refresh (T20 / #46)', () => {
  const level3 = parseFactBases(realSources()).level3;

  it('takes the datamined Hemorrhage value (30% → 20%)', () => {
    // R9 (#35): kHemorrhagePct is a ÷1 field, so no divisor explains the gap;
    // the v1.308 release build is the current game value.
    expect(level3.hemorrhage).toContain('deal 20% of their current health');
    expect(level3.hemorrhage).not.toContain('30%');
  });

  it('takes the datamined Vampire Lord bleed count (3 → 4 stacks)', () => {
    // R9 (#35): kBleedAmt is a ÷1 count; the threshold (9) agrees.
    expect(level3['vampire-lord']).toContain('inflicts 4 stacks of bleed');
    expect(level3['vampire-lord']).not.toContain('3 stacks');
  });

  it('keeps the wiki display values for all 19 divisor-only rows (no blanket ÷10)', () => {
    // Each datamined raw value is the same quantity in game units (R9 §6);
    // a blanket ÷10 would corrupt the ÷1 and ÷100 fields.
    const display: [id: string, fragment: string][] = [
      ['blizzard', '1.3 seconds'], ['catapult', '1.5 seconds'],
      ['charm', '5% chance'], ['dark', '5.0x damage'],
      ['flesh-mound', '0.6 seconds'], ['flicker', '1.2 seconds'],
      ['freeze', '8.0 seconds'], ['freeze-ray', '13.0 seconds'],
      ['glacier', '3.0 seconds'], ['heart-swallower', '70% chance'],
      ['incubus', '5% chance'], ['lightning-rod', '2.5 seconds'],
      ['petrify', '2.0 seconds'], ['soul-sucker', '50% chance'],
      ['succubus', '5% chance'], ['time', '3.0 seconds'],
      ['timestop', '6.0 seconds'], ['vampire', '6% chance'],
      ['wraith', '1.8 seconds'],
    ];
    expect(display).toHaveLength(19);
    for (const [id, fragment] of display) {
      expect(level3[id], `missing level-3 text for ${id}`).toContain(fragment);
    }
  });

  it('keeps the wiki prose for the three extract-omits-% rows', () => {
    expect(level3.flesh).toContain('40%');
    expect(level3.shotgun).toContain('200%');
    expect(level3.warp).toContain('10%');
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
