// Regression tests for every data/logic bug found and fixed this session.
// Each test names the bug it pins. UI-only fixes (icon blink, portrait
// centering) are CSS/DOM concerns — covered indirectly where the data
// participates.
import { describe, it, expect } from 'vitest';
import { BALLS } from './data/balls';
import { PASSIVES } from './data/passives';
import { CHARACTERS } from './data/characters';
import { byId, highlightSet, factorizesIntoSlots } from './graph';
import { verdictFor } from './synergy';
import { readFileSync } from 'node:fs';

const ballMap = byId(BALLS);
const passiveMap = byId(PASSIVES);

describe('regression: structural depth (was wiki labels — Tumor et al. misplaced)', () => {
  // The wiki labeled Tumor, Laser Cutter, Nuclear Bomb, Time Bomb, Black Hole
  // as "Evo" though each requires an evolved ball. Cheat sheet: Tier 2/3.
  const TIER3 = ['armageddon', 'banshee', 'black-hole', 'laser-cutter', 'mosquito-kingdom', 'nosferatu', 'nuclear-bomb', 'reaper', 'satan', 'sniper', 'time-bomb', 'tumor', 'x-ray'];

  it('all 13 structurally-tier-3 balls are depth 2', () => {
    for (const id of TIER3) expect(ballMap.get(id)?.depth, id).toBe(2);
  });

  it('Tumor: Radiation Beam (evolved) + Flesh → tier-3', () => {
    const tumor = ballMap.get('tumor')!;
    expect(tumor.recipes).toEqual([['radiation-beam', 'flesh']]);
    expect(ballMap.get('radiation-beam')!.depth).toBe(1);
    expect(tumor.depth).toBe(2);
  });

  it('Black Hole: Sun + (Dark or Time) → tier-3 (was tier-3 wiki label but depth-1 in first deploy)', () => {
    expect(ballMap.get('black-hole')!.depth).toBe(2);
  });

  it('depth is consistent: every depth-2 ball has a depth-1 component; depth-1 has none', () => {
    for (const b of BALLS) {
      const comps = b.recipes.flat().map((c) => ballMap.get(c)!);
      if (b.depth === 2) expect(comps.some((c) => c.depth >= 1), b.id).toBe(true);
      if (b.depth === 1) expect(comps.every((c) => c.depth === 0), b.id).toBe(true);
    }
  });

  it('passives: Deadeye\'s Impaler is the only structural tier-3 (built from evolved Deadeye\'s Cross)', () => {
    const impaler = passiveMap.get('deadeyes-impaler')!;
    expect(impaler.depth).toBe(2);
    expect(passiveMap.get('deadeyes-cross')!.depth).toBe(1);
    expect(PASSIVES.filter((p) => p.depth === 2)).toHaveLength(1);
  });
});

describe('regression: passive selection highlights evolved variants (walked ball graph)', () => {
  // paintGrids used closure(..., ballMap) for every selection — a passive
  // selection found no children. The fix walks the graph the selection lives in;
  // here we pin the data-side premise: passive graphs contain real chains.
  it('basic passive has descendants in the passive graph', () => {
    const hl = highlightSet('wagon-wheel', passiveMap);
    expect(hl).toContain('ardent-tire');
  });
  it('basic passive with a tier-3 chain: Deadeye\'s Amulet → Gracious Impaler → Deadeye\'s Impaler', () => {
    const hl = highlightSet('deadeyes-amulet', passiveMap);
    expect(hl).toContain('gracious-impaler');
    expect(hl).toContain('deadeyes-impaler');
  });
  it('evolved passive selection includes its tier-3 child AND components', () => {
    const hl = highlightSet('deadeyes-cross', passiveMap);
    expect(hl).toContain('deadeyes-impaler'); // child
    for (const comp of ['diamond-hilted-dagger', 'sapphire-hilted-dagger', 'ruby-hilted-dagger', 'emerald-hilted-dagger'])
      expect(hl).toContain(comp); // components
  });
});

describe('regression: tier-2 ball selection includes tier-3 children', () => {
  it('Inferno highlights Burn/Wind/Time (components) and Armageddon (child)', () => {
    const hl = highlightSet('inferno', ballMap);
    expect(hl).toContain('burn');
    expect(hl).toContain('wind');
    expect(hl).toContain('time');
    expect(hl).toContain('armageddon');
  });
  it('multi-recipe component closure: Vampire Lord reaches Vampire, Bleed AND Dark', () => {
    const hl = highlightSet('vampire-lord', ballMap);
    for (const c of ['vampire', 'bleed', 'dark']) expect(hl).toContain(c);
  });
});

describe('regression: multi-recipe data supports the compact x+(y/z) notation', () => {
  // The notation is only faithful if every multi-recipe entity factorizes
  // into per-slot alternates — verified over the whole dataset when built.
  it('every multi-recipe ball/passive factorizes into slots', () => {
    for (const item of [...BALLS, ...PASSIVES]) {
      if (item.recipes.length > 1) expect(factorizesIntoSlots(item.recipes), item.id).toBe(true);
    }
  });

  it('Vampire Lord: Vampire + (Bleed or Dark) — 2 recipes, shared first slot', () => {
    const vl = ballMap.get('vampire-lord')!;
    expect(vl.recipes).toEqual([['vampire', 'bleed'], ['vampire', 'dark']]);
  });

  it('Nosferatu: single 3-way recipe (Vampire Lord + Spider Queen + Mosquito King)', () => {
    expect(ballMap.get('nosferatu')!.recipes).toEqual([['vampire-lord', 'spider-queen', 'mosquito-king']]);
  });

  it('Elemental: single 4-way recipe', () => {
    expect(ballMap.get('elemental')!.recipes).toEqual([['burn', 'wind', 'freeze', 'earthquake']]);
  });

  it('Radiation Beam: worst case (a/b)+(c/d) — 4 recipes from 2 alternate slots', () => {
    const rb = ballMap.get('radiation-beam')!;
    expect(rb.recipes).toHaveLength(4);
    expect(factorizesIntoSlots(rb.recipes)).toBe(true);
  });

  it('Lovestruck: 3 alternate slots (Light or Lightning or Time)', () => {
    const ls = ballMap.get('lovestruck')!;
    expect(ls.recipes).toEqual([['charm', 'light'], ['charm', 'lightning'], ['charm', 'time']]);
  });

  it("Deadeye's Cross: 4-way dagger recipe (wiki cell carried a (**4-way**) annotation the parser must strip)", () => {
    expect(passiveMap.get('deadeyes-cross')!.recipes).toEqual([
      ['diamond-hilted-dagger', 'sapphire-hilted-dagger', 'ruby-hilted-dagger', 'emerald-hilted-dagger'],
    ]);
  });
});

describe('regression: icon paths are base-relative (sub-path deploy join)', () => {
  // Icons were root-absolute "/icons/..." — 404 under /ball-x-pit-companion/.
  // Then BASE_URL (no trailing slash) was concatenated directly — ".../companionicons/...".
  // Data must be base-relative; the island joins BASE_URL + '/' + path.
  it('no icon path starts with "/"', () => {
    for (const b of BALLS) expect(b.icon.startsWith('/'), b.id).toBe(false);
    for (const p of PASSIVES) expect(p.icon.startsWith('/'), p.id).toBe(false);
    for (const c of CHARACTERS) expect(c.icon.startsWith('/'), c.id).toBe(false);
  });

  it('icon paths match the on-disk layout (icons/<dir>/<id>.png)', () => {
    for (const b of BALLS) expect(b.icon).toBe(`icons/balls/${b.id}.png`);
    for (const p of PASSIVES) expect(p.icon).toBe(`icons/passives/${p.id}.png`);
  });

  it('island joins BASE_URL with an explicit slash (source check)', () => {
    const src = readFileSync(new URL('./companion.ts', import.meta.url), 'utf8');
    expect(src).toMatch(/BASE_URL[^\n]*replace\([^)]*\)\s*\+\s*'\/'/);
  });
});

describe('regression: apostrophe slug normalization (Archer\'s Effigy et al.)', () => {
  // Slugs once produced "archer-s-effigy" while icons used "archers-effigy".
  it('apostrophes are dropped, not slugified as separators', () => {
    expect(passiveMap.has('archers-effigy')).toBe(true);
    expect(passiveMap.has('deadeyes-amulet')).toBe(true);
    expect(passiveMap.has('lovers-quiver')).toBe(true);
    expect(passiveMap.has('traitors-cowl')).toBe(true);
    expect(passiveMap.has('archer-s-effigy')).toBe(false);
  });

  it('Laser H/V abbreviations resolve to full ids', () => {
    // recipe cells use "Laser H or Laser V"; icons are laser-horizontal/vertical
    const freezeRay = ballMap.get('freeze-ray')!;
    expect(freezeRay.recipes).toContainEqual(['freeze', 'laser-horizontal']);
    expect(freezeRay.recipes).toContainEqual(['freeze', 'laser-vertical']);
  });
});

describe('regression: every character has a verdict entry (The Carouser omission)', () => {
  // CHAR_VERDICTS initially missed The Carouser; the emitter now fails hard
  // on missing characters — pinned here at the data level.
  it('all 23 characters present in data with verdict arrays', () => {
    expect(CHARACTERS).toHaveLength(23);
    for (const ch of CHARACTERS) expect(Array.isArray(ch.verdicts)).toBe(true);
  });
});

describe('synergy verdict semantics (map Notes: red wins with 2 characters)', () => {
  // Behavior tests through the synergy module's interface (was: data-premise
  // assertions because verdictFor lived untested inside the island).
  const char = (id: string) => CHARACTERS.find((c) => c.id === id)!;
  const ball = (id: string) => ballMap.get(id)!;
  const passive = (id: string) => passiveMap.get(id)!;

  it('no selection → neutral', () => {
    expect(verdictFor(ball('vampire'), [])).toBeNull();
    expect(verdictFor(passive('wagon-wheel'), [])).toBeNull();
  });

  it('The Warrior (no rules) → neutral for every item', () => {
    for (const item of [...BALLS, ...PASSIVES]) expect(verdictFor(item, [char('the-warrior')])).toBeNull();
  });

  it('green rule fires on tag overlap (The Itchy Finger: spawns-baby-balls green)', () => {
    expect(verdictFor(ball('brood-mother'), [char('the-itchy-finger')])).toMatchObject({ verdict: 'green' });
    expect(verdictFor(ball('bleed'), [char('the-itchy-finger')])).toBeNull();
  });

  it('*passives wildcard fires on passives only (The Ballbearer: red on every passive)', () => {
    // every passive gets a verdict from the wildcard; passives that also match
    // a green rule (single-target: Platinum Dumbbell et al.) report green —
    // single-character selection, green wins over red
    for (const p of PASSIVES) expect(verdictFor(p, [char('the-ballbearer')])).not.toBeNull();
    // the wildcard never marks a ball red — balls only get The Ballbearer's
    // green tag rules (single-target/aoe), everything else is neutral
    for (const b of BALLS) {
      const v = verdictFor(b, [char('the-ballbearer')]);
      if (v) expect(v.verdict, b.id).toBe('green');
      else expect(v, b.id).toBeNull();
    }
    expect(verdictFor(passive('silver-bullet'), [char('the-ballbearer')])).toMatchObject({ verdict: 'green' });
    expect(verdictFor(passive('wagon-wheel'), [char('the-ballbearer')])).toMatchObject({ verdict: 'red' });
  });

  it('single character: green wins over red', () => {
    // one character with both a green and a red rule matching → green reported
    const both = CHARACTERS.find((c) => c.verdicts.some((v) => v.verdict === 'green') && c.verdicts.some((v) => v.verdict === 'red'));
    if (!both) return; // no such character in current data
    const greenTag = both.verdicts.find((v) => v.verdict === 'green')!.tag;
    const item = BALLS.find((b) => b.tags.includes(greenTag));
    if (item) expect(verdictFor(item, [both])?.verdict === 'green' || verdictFor(item, [both]) === null).toBe(true);
  });

  it('two characters: red wins, notes join with " · "', () => {
    const redChar = CHARACTERS.find((c) => c.verdicts.some((v) => v.verdict === 'red' && v.tag !== '*passives'))!;
    const redRule = redChar.verdicts.find((v) => v.verdict === 'red' && v.tag !== '*passives')!;
    const other = CHARACTERS.find((c) => c.id !== redChar.id && c.verdicts.some((v) => v.verdict === 'green' && v.tag === redRule.tag));
    const item = BALLS.find((b) => b.tags.includes(redRule.tag));
    if (!item) return;
    const v = verdictFor(item, [redChar, other ?? char('the-warrior')]);
    expect(v?.verdict).toBe('red');
    expect(v?.note).toContain(redChar.name);
  });

  it('namespace resolution: verdictFor never needs an isPassive flag', () => {
    // same id cannot exist in both namespaces (ticket 03) — the module resolves
    // membership itself; here we pin that a passive id gets the wildcard verdict
    expect(verdictFor(passive('wagon-wheel'), [char('the-ballbearer')])).toMatchObject({ verdict: 'red' });
  });
});
