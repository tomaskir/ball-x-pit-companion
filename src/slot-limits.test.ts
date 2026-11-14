// Tests for the slot-limits module through its one interface:
// globalLimits(upgradesOn) and limitsFor(upgradesOn, selectedChars). The
// formula table and the forced double-quirk pair are the contract (spec #53);
// the map pin keeps the hand-authored quirk table honest.
import { describe, it, expect } from 'vitest';
import { SLOT_RULES, globalLimits, limitsFor } from './slot-limits';
import { CHARACTERS } from './data/characters';

const chars = (...ids: string[]) => ids.map((id) => ({ id }));

describe('slot limits: global limits', () => {
  it('without End game upgrades: 1 character / 4 balls / 4 passives', () => {
    expect(globalLimits(false)).toEqual({ chars: 1, balls: 4, passives: 4 });
  });

  it('with End game upgrades: 2 characters / 5 balls / 5 passives', () => {
    expect(globalLimits(true)).toEqual({ chars: 2, balls: 5, passives: 5 });
  });
});

describe('slot limits: character overlays', () => {
  it('no character selected: the global limits', () => {
    expect(limitsFor(true, [])).toEqual({ chars: 2, balls: 5, passives: 5 });
    expect(limitsFor(false, [])).toEqual({ chars: 1, balls: 4, passives: 4 });
  });

  it('a character without a slot quirk: the global limits', () => {
    expect(limitsFor(true, chars('the-warrior'))).toEqual({ chars: 2, balls: 5, passives: 5 });
    expect(limitsFor(false, chars('the-shade'))).toEqual({ chars: 1, balls: 4, passives: 4 });
  });

  it('The Ballbearer doubles the ball slots and zeroes passives (8/0 base, 10/0 upgraded)', () => {
    expect(limitsFor(false, chars('the-ballbearer'))).toEqual({ chars: 1, balls: 8, passives: 0 });
    expect(limitsFor(true, chars('the-ballbearer'))).toEqual({ chars: 2, balls: 10, passives: 0 });
  });

  it('The Hoary Hoarder keeps 2 ball slots and turns the rest into passives (2/6 base, 2/8 upgraded)', () => {
    expect(limitsFor(false, chars('the-hoary-hoarder'))).toEqual({ chars: 1, balls: 2, passives: 6 });
    expect(limitsFor(true, chars('the-hoary-hoarder'))).toEqual({ chars: 2, balls: 2, passives: 8 });
  });

  it('a quirk character beside a normal one still applies its overlay', () => {
    expect(limitsFor(true, chars('the-ballbearer', 'the-warrior'))).toEqual({ chars: 2, balls: 10, passives: 0 });
    expect(limitsFor(true, chars('the-warrior', 'the-hoary-hoarder'))).toEqual({ chars: 2, balls: 2, passives: 8 });
  });

  it('the illegal double-quirk pair resolves to The Ballbearer (the game check order)', () => {
    // The Matchmaker forbids the pair; a hydrated/share pair can still reach
    // here. Ballbearer wins outright — not most-restrictive, not first-picked.
    expect(limitsFor(true, chars('the-hoary-hoarder', 'the-ballbearer'))).toEqual({ chars: 2, balls: 10, passives: 0 });
    expect(limitsFor(false, chars('the-ballbearer', 'the-hoary-hoarder'))).toEqual({ chars: 1, balls: 8, passives: 0 });
  });
});

describe('slot limits: the quirk map pin', () => {
  it('exactly two rules exist, in precedence order', () => {
    expect([...SLOT_RULES.keys()]).toEqual(['the-ballbearer', 'the-hoary-hoarder']);
  });

  it('every map key resolves in CHARACTERS', () => {
    const ids = new Set(CHARACTERS.map((c) => c.id));
    for (const id of SLOT_RULES.keys()) expect(ids.has(id), id).toBe(true);
  });
});
