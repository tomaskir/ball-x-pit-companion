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
    expect(r.notes.length).toBeGreaterThan(0);
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
