// Fusion composer tests — the editorial fusion model (see fusion.ts header).
import { describe, it, expect } from 'vitest';
import { fusionName, abstractDamage, crossWire, evolvesInstead, fuse } from './fusion';
import { ballMap } from './catalog';

const ball = (id: string) => ballMap.get(id)!;

describe('fusionName', () => {
  it('is "A × B" with the first-selected ball first (U+00D7)', () => {
    expect(fusionName(ball('flash'), ball('glacier'))).toBe('Flash × Glacier');
    expect(fusionName(ball('glacier'), ball('flash'))).toBe('Glacier × Flash');
  });
});

describe('abstractDamage', () => {
  it('abstracts damage rolls to X damage', () => {
    expect(abstractDamage('Damages all enemies on screen for 1–3 damage after hitting an enemy.'))
      .toBe('Damages all enemies on screen for X damage after hitting an enemy.');
    expect(abstractDamage('Explodes, dealing 150–300 damage to nearby enemies.'))
      .toBe('Explodes, dealing X damage to nearby enemies.');
    expect(abstractDamage('Deals 3.0x damage but destroys itself after hitting an enemy.'))
      .toBe('Deals X damage but destroys itself after hitting an enemy.');
    expect(abstractDamage('Initially deals 300% damage.'))
      .toBe('Initially deals X damage.');
  });

  it('abstracts bare rolls after deals/dealt/dealing', () => {
    expect(abstractDamage('Cursed enemies are dealt 150–300 after being hit 6 times.'))
      .toBe('Cursed enemies are dealt X after being hit 6 times.');
    expect(abstractDamage('Petrifies all enemies within its sightline for 1.5 seconds, dealing 50–120.'))
      .toBe('Petrifies all enemies within its sightline for 1.5 seconds, dealing X.');
  });

  it('keeps durations, stacks, cooldowns, percentages and health', () => {
    const t = abstractDamage(
      'Inflicts 3 stacks of bleed. When hitting an enemy with 12+ stacks of bleed, consumes all stacks to deal 20% of their current health.'
    );
    expect(t).toContain('3 stacks');
    expect(t).toContain('12+ stacks');
    expect(t).toContain('20% of their current health');
    expect(abstractDamage('Has a 3 second cooldown before it can be shot again.'))
      .toBe('Has a 3 second cooldown before it can be shot again.');
    expect(abstractDamage('Blinds enemies on hit for 2 seconds.')).toContain('2 seconds');
    expect(abstractDamage('Heals 1 health.')).toBe('Heals 1 health.');
  });
});

describe('crossWire', () => {
  it('spawn + status: spawned balls get the status (Overgrowth × Maggot)', () => {
    expect(crossWire(ball('overgrowth'), ball('maggot'))).toBe(
      'Spawned balls from Maggot have the same properties as Overgrowth.'
    );
  });

  it('AOE + status: the AOE hits apply the status (Overgrowth × Flash)', () => {
    expect(crossWire(ball('flash'), ball('overgrowth'))).toBe(
      'Area-of-effect damage from Flash inflicts the status effect of Overgrowth.'
    );
  });

  it('no cross-wire when neither channel carries (Flash × Glacier)', () => {
    // Glacier's freeze lives on spawned spikes, not a status on the ball;
    // Flash carries no status and Glacier is not a status ball.
    expect(crossWire(ball('flash'), ball('glacier'))).toBeNull();
  });

  it('status × status: no cross-wire line', () => {
    expect(crossWire(ball('freeze'), ball('poison'))).toBeNull();
  });
});

describe('evolvesInstead', () => {
  it('flags 2-component evolution recipes (Bleed + Poison → Virus)', () => {
    expect(evolvesInstead(ball('bleed'), ball('poison'))?.name).toBe('Virus');
    expect(evolvesInstead(ball('poison'), ball('bleed'))?.name).toBe('Virus');
  });

  it('flags alternate 2-component recipes (Vampire + Dark → Vampire Lord)', () => {
    expect(evolvesInstead(ball('vampire'), ball('dark'))?.name).toBe('Vampire Lord');
  });

  it('does not block 3-component recipes (Nosferatu)', () => {
    // Nosferatu needs vampire-lord + spider-queen + mosquito-king; any 2 of
    // them can still fuse.
    expect(evolvesInstead(ball('spider-queen'), ball('mosquito-king'))).toBeNull();
    expect(evolvesInstead(ball('vampire-lord'), ball('spider-queen'))).toBeNull();
    expect(evolvesInstead(ball('vampire-lord'), ball('mosquito-king'))).toBeNull();
  });
});

describe('fuse', () => {
  it('composes name, paragraphs in name order, and caveats', () => {
    const r = fuse(ball('glacier'), ball('flash'))!;
    expect(r.name).toBe('Glacier × Flash');
    expect(r.paragraphs[0]).toContain('glacial spikes');
    expect(r.paragraphs[1]).toContain('blinds them');
    expect(r.notes).toEqual(['Composition is modeled from community-observed rules; verify against the game.']);
  });

  it('returns null for self-fusion', () => {
    expect(fuse(ball('flash'), ball('flash'))).toBeNull();
  });

  it('reports evolutions instead of fusing them', () => {
    const r = fuse(ball('bleed'), ball('poison'))!;
    expect(r.evolvesInstead?.name).toBe('Virus');
    const plain = fuse(ball('flash'), ball('glacier'))!;
    expect(plain.evolvesInstead).toBeNull();
  });

  it('composes the playtest pairs with the expected cross-wire lines', () => {
    // playtest ground truth (docs/research/fusion-observations/playtest.jsonl):
    // Overgrowth × Flash cross-wires; Flicker × Radiation Beam cross-wires;
    // Flash × Glacier does not.
    const og = fuse(ball('overgrowth'), ball('flash'))!;
    expect(og.crossWire).toContain('Flash');
    expect(og.crossWire).toContain('Overgrowth');
    const fr = fuse(ball('flicker'), ball('radiation-beam'))!;
    expect(fr.crossWire).not.toBeNull();
    const fg = fuse(ball('flash'), ball('glacier'))!;
    expect(fg.crossWire).toBeNull();
  });
});

describe('fused-stat overrides (observed, from transcribed tooltips)', () => {
  it('Overgrowth threshold drops 3 → 2 in fusions (Overgrowth × Flash tooltip)', () => {
    const r = fuse(ball('overgrowth'), ball('flash'))!;
    expect(r.paragraphs[0]).toContain('Upon reaching 2, consume all stacks');
    expect(r.paragraphs[0]).not.toContain('reaching 3');
  });

  it('spawn counts gain +1 per bound (Egg Sac 2–4 → 3–5)', () => {
    const r = fuse(ball('egg-sac'), ball('poison'))!;
    expect(r.paragraphs.find((p) => p.includes('baby balls'))).toContain('Explodes into 3–5 baby balls');
  });

  it('Maggot babies 1–2 → 2–3 (Overgrowth × Maggot tooltip)', () => {
    const r = fuse(ball('maggot'), ball('overgrowth'))!;
    expect(r.paragraphs.find((p) => p.includes('Infest'))).toContain('explode into 2–3 baby balls');
  });

  it('Reaper kill chance 10% → 15% and heal 5 → 7 (Satan × Reaper tooltip)', () => {
    const r = fuse(ball('reaper'), ball('satan'))!;
    const p = r.paragraphs.find((p) => p.includes('kill enemies on impact'))!;
    expect(p).toContain('15% chance');
    expect(p).toContain('healing you for 7 health');
  });

  it('no hard-coded fused damage values in FUSED_STATS (unchanged base constants allowed)', () => {
    // The no-damage-tracking decision: FUSED_STATS replacement values must
    // never introduce concrete damage rolls that the base text does not
    // already have. An output-level scan cannot catch violations
    // (abstractDamage runs after the table and cleans up), so this scans
    // the module source: extract each [from, to] pair, diff their damage
    // rolls — any roll present in `to` but not in `from` is a fused value
    // and fails. Rolls shared by both sides are unchanged mechanic
    // constants (e.g. bleed's 1 damage per stack) and are allowed.
    const { readFileSync } = require('node:fs') as typeof import('node:fs');
    const src = readFileSync(new URL('./fusion.ts', import.meta.url).pathname, 'utf8');
    const table = src.match(/const FUSED_STATS[\s\S]*?^};/m)![0];
    const strings = [...table.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1]);
    expect(strings.length % 2, 'FUSED_STATS pairs must be complete').toBe(0);
    const beforeDamage = /\b\d+(?:\.\d+)?(?:[–-]\d+(?:\.\d+)?)?(?:x|%)?(?= damage)/gi;
    const afterDeal = /\b(?:deals?|dealt|dealing) \d+(?:\.\d+)?(?:[–-]\d+(?:\.\d+)?)?(?![\dx%]|\.\d)/gi;
    const rolls = (s: string) => [...(s.match(beforeDamage) ?? []), ...(s.match(afterDeal) ?? [])];
    for (let i = 0; i < strings.length; i += 2) {
      const [from, to] = [strings[i], strings[i + 1]];
      const fromRolls = new Set(rolls(from));
      const introduced = rolls(to).filter((r) => !fromRolls.has(r));
      expect(introduced, `FUSED_STATS introduces fused damage rolls: ${introduced.join(', ')}`).toEqual([]);
    }
  });

  it('overrides are per-ball, not global (unrelated balls keep base numbers)', () => {
    const r = fuse(ball('freeze'), ball('light'))!;
    expect(r.paragraphs[0]).toContain('4% chance to freeze');
    expect(r.paragraphs[1]).toContain('Blinds enemies on hit for 3 seconds');
  });

  it('damage rolls in overridden text still abstract to X', () => {
    const r = fuse(ball('overgrowth'), ball('flash'))!;
    // the fused tooltip's 150–200 explosion is a damage roll → X
    expect(r.paragraphs[0]).toContain('deal X damage to all enemies');
  });
});

describe('cross-wire exclusions (corpus no-cross-wire evidence)', () => {
  it('VES two-hop spawn chain drops the property (Steam: Assassin × VES, Hemorrhage × VES)', () => {
    expect(fuse(ball('hemorrhage'), ball('voluptuous-egg-sac'))!.crossWire).toBeNull();
    expect(fuse(ball('nuclear-bomb'), ball('voluptuous-egg-sac'))!.crossWire).toBeNull();
  });

  it('Freeze Ray freeze is beam-path-bound — Sun AOE does not apply it', () => {
    expect(fuse(ball('freeze-ray'), ball('sun'))!.crossWire).toBeNull();
  });

  it('Brood Mother spawn channel does not carry the partner property', () => {
    expect(fuse(ball('brood-mother'), ball('flash'))!.crossWire).toBeNull();
  });

  it('Mosquito King spawn-on-hit does not fire from screen hits', () => {
    expect(fuse(ball('flash'), ball('mosquito-king'))!.crossWire).toBeNull();
  });

  it('Satan field judgment is debuff-only — cannot carry on-hit statuses', () => {
    expect(fuse(ball('hemorrhage'), ball('satan'))!.crossWire).toBeNull();
  });

  it('Blizzard freeze stays icicle-bound (status-vs-spawn, both Flash pairs)', () => {
    expect(fuse(ball('blizzard'), ball('flash'))!.crossWire).toBeNull();
  });

  it('positive controls keep wiring (playtest + tooltip pairs)', () => {
    expect(fuse(ball('overgrowth'), ball('flash'))!.crossWire).not.toBeNull();
    expect(fuse(ball('flicker'), ball('radiation-beam'))!.crossWire).not.toBeNull();
    expect(fuse(ball('overgrowth'), ball('maggot'))!.crossWire).not.toBeNull();
  });

  it('kill effects ride AOE carriers (Black Hole × Sun — the corpus meta pair)', () => {
    // corpus: black-hole+sun 7 cross-wire claims, black-hole+flash 6 —
    // "Sun's screen-wide hits apply Black Hole's instant-kill to every
    // non-boss enemy". Previously the composer emitted nothing: Black Hole's
    // kill is not a status effect.
    expect(fuse(ball('black-hole'), ball('sun'))!.crossWire).toContain('Black Hole');
    expect(fuse(ball('black-hole'), ball('flash'))!.crossWire).toContain('instant kill');
    expect(fuse(ball('reaper'), ball('flash'))!.crossWire).toContain('Reaper');
    expect(fuse(ball('flicker'), ball('reaper'))!.crossWire).not.toBeNull();
    expect(fuse(ball('armageddon'), ball('reaper'))!.crossWire).not.toBeNull();
  });

  it('kill carriers are damage-dealing AOE only (Timestop freezes, deals no damage)', () => {
    expect(fuse(ball('black-hole'), ball('timestop'))!.crossWire).toBeNull();
  });

  it('Satan carries Black Hole\'s kill but not Reaper\'s (corpus: both directions tested)', () => {
    // black-hole+satan: 3 cross-wire claims ("Satan's aoe will inflict the
    // instant kill from Black Hole", Steam build guide).
    expect(fuse(ball('black-hole'), ball('satan'))!.crossWire).toContain('Black Hole');
    // reaper+satan: no-cross-wire — "Reaper's instant-kill is NOT triggered
    // by Satan's AOE" (on-impact kill vs debuff-only judgment).
    expect(fuse(ball('reaper'), ball('satan'))!.crossWire).toBeNull();
  });

  it('spawn carriers carry spawn-bound statuses too (Glacier × Maggot, Blizzard × Spider Queen)', () => {
    // corpus: glacier+maggot 2 CW, cell+glacier 2, blizzard+spider-queen 2,
    // magma+cell, swamp+cell, inferno+spider-queen — namu rule 6: the spawned
    // balls carry the fused kit including its spawned spikes/blobs.
    expect(fuse(ball('glacier'), ball('maggot'))!.crossWire).toContain('Glacier');
    expect(fuse(ball('blizzard'), ball('spider-queen'))!.crossWire).toContain('Spider Queen');
    expect(fuse(ball('cell'), ball('glacier'))!.crossWire).not.toBeNull();
    expect(fuse(ball('magma'), ball('cell'))!.crossWire).not.toBeNull();
    expect(fuse(ball('swamp'), ball('cell'))!.crossWire).not.toBeNull();
  });
});

describe('order side-effects (fusion-ordering.md)', () => {
  it('both-cooldown pairs: first-selected ball\'s cooldown wins (namu.wiki)', () => {
    // cooldown class = {black-hole, bomb, dark, egg-sac, nuclear-bomb,
    // timestop, voluptuous-egg-sac} — exactly the balls whose text lists a
    // cooldown (validated against the game-file dump class).
    const r = fuse(ball('black-hole'), ball('timestop'))!;
    expect(r.notes.join(' ')).toMatch(/cooldown/i);
    expect(fuse(ball('bomb'), ball('dark'))!.notes.join(' ')).toMatch(/cooldown/i);
    // non-cooldown pairs get no order note
    expect(fuse(ball('flash'), ball('glacier'))!.notes.join(' ')).not.toMatch(/first-selected ball's cooldown/i);
  });

  it('same-property pairs: first-selected variant wins (PSA #2)', () => {
    const r = fuse(ball('mosquito-swarm'), ball('mosquito-king'))!;
    expect(r.notes.join(' ')).toMatch(/first-selected ball's variant/i);
    expect(fuse(ball('radiation-beam'), ball('nuclear-bomb'))!.notes.join(' ')).toMatch(/first-selected ball's variant/i);
  });
});

describe('composition caveats (general_rules_notes)', () => {
  it('two Destroy-class balls may lose one self-destruct effect', () => {
    expect(fuse(ball('bomb'), ball('dark'))!.notes.join(' ')).toMatch(/Destroy/i);
  });

  it('hit-once + cooldown suppresses the partner\'s pass-through', () => {
    expect(fuse(ball('black-hole'), ball('ghost'))!.notes.join(' ')).toMatch(/pass-through/i);
    expect(fuse(ball('ghost'), ball('flash'))!.notes.join(' ')).not.toMatch(/pass-through/i);
  });

  it('spawn can compensate Destroy (Cell × Bomb = indestructible bomb)', () => {
    expect(fuse(ball('bomb'), ball('cell'))!.notes.join(' ')).toMatch(/Spawn/i);
  });

  it('Dark\'s damage multiplier carries into any fusion (namu.wiki)', () => {
    expect(fuse(ball('dark'), ball('flash'))!.notes.join(' ')).toMatch(/Dark's damage multiplier/);
    expect(fuse(ball('flash'), ball('sun'))!.notes.join(' ')).not.toMatch(/multiplier/);
  });
});
