// Tests for the passive-availability module: the two authored character
// mechanisms (DLC allow-list, base-game stat gates) with union semantics,
// the zero-slots reason derived from the slot limit (not a per-passive
// rule), the informational loadout gate, and the character-specific flag.
import { describe, it, expect } from 'vitest';
import { CHARACTERS } from './data/characters';
import { passiveMap } from './catalog';
import { passiveAvailability, isCharacterSpecific } from './passive-availability';

const chars = (...ids: string[]) => ids.map((id) => CHARACTERS.find((c) => c.id === id)!);
const passive = (id: string) => passiveMap.get(id)!;
const availability = (id: string, selected: string[], passiveSlots = 5) =>
  passiveAvailability(passive(id), { selectedChars: chars(...selected), passiveSlots });

describe('passive availability: DLC allow-list', () => {
  it('allows the listed character and blocks everyone else', () => {
    expect(availability('rusted-blade', ['the-warrior']).blocked).toBe(false);
    const blocked = availability('rusted-blade', ['the-shade']);
    expect(blocked.blocked).toBe(true);
    expect(blocked.reason).toBe('Only The Warrior can use this.');
  });

  it('lists both characters of a shared allow-list', () => {
    const blocked = availability('crystal-decanter', ['the-warrior']);
    expect(blocked.blocked).toBe(true);
    expect(blocked.reason).toBe('Only The Carouser or The Scandalmonger can use this.');
    expect(availability('crystal-decanter', ['the-carouser']).blocked).toBe(false);
    expect(availability('crystal-decanter', ['the-scandalmonger']).blocked).toBe(false);
  });

  it('uses union semantics: either selected character may use it', () => {
    // The Carouser can use it; The Warrior cannot — the pair is allowed.
    expect(availability('crystal-decanter', ['the-warrior', 'the-carouser']).blocked).toBe(false);
    // Neither can use it.
    expect(availability('crystal-decanter', ['the-warrior', 'the-shade']).blocked).toBe(true);
  });

  it('with no character selected: no block, but the badge and reason remain', () => {
    const none = availability('rusted-blade', []);
    expect(none.blocked).toBe(false);
    expect(none.characterSpecific).toBe(true);
    expect(none.reason).toBe('Only The Warrior can use this.');
  });

  it('evolved passives inherit the components\' intersection', () => {
    expect(availability('vampires-kiss', ['the-warrior']).blocked).toBe(false);
    expect(availability('vampires-kiss', ['the-shade']).blocked).toBe(true);
    // Liquid Flame = Crystal Decanter + Midnight Oil → Carouser/Scandalmonger.
    expect(availability('liquid-flame', ['the-carouser']).blocked).toBe(false);
    expect(availability('liquid-flame', ['the-scandalmonger']).blocked).toBe(false);
    expect(availability('liquid-flame', ['the-warrior']).blocked).toBe(true);
  });

  it('Handheld Rupture is the documented override (Sisyphus or Wallbreaker)', () => {
    expect(availability('handheld-rupture', ['the-makeshift-sisyphus']).blocked).toBe(false);
    expect(availability('handheld-rupture', ['the-wallbreaker']).blocked).toBe(false);
    expect(availability('handheld-rupture', ['the-warrior']).blocked).toBe(true);
  });

  it('marks DLC passives character-specific (base and evolved), base passives not', () => {
    expect(isCharacterSpecific(passive('rusted-blade'))).toBe(true);
    expect(isCharacterSpecific(passive('vampires-kiss'))).toBe(true);
    expect(isCharacterSpecific(passive('magnet'))).toBe(false);
    expect(isCharacterSpecific(passive('wagon-wheel'))).toBe(false);
  });
});

describe('passive availability: base-game stat gates', () => {
  it('Magnet is excluded for The Shieldbearer only', () => {
    expect(availability('magnet', ['the-shieldbearer']).blocked).toBe(true);
    expect(availability('magnet', ['the-warrior']).blocked).toBe(false);
    expect(availability('magnet', ['the-tactician']).blocked).toBe(false);
  });

  it('Radiant Feather is excluded for The Shieldbearer and The Tactician', () => {
    expect(availability('radiant-feather', ['the-shieldbearer']).blocked).toBe(true);
    expect(availability('radiant-feather', ['the-tactician']).blocked).toBe(true);
    expect(availability('radiant-feather', ['the-warrior']).blocked).toBe(false);
  });

  it('Shortbow is excluded for The Spendthrift and The Tactician', () => {
    expect(availability('shortbow', ['the-spendthrift']).blocked).toBe(true);
    expect(availability('shortbow', ['the-tactician']).blocked).toBe(true);
    expect(availability('shortbow', ['the-warrior']).blocked).toBe(false);
  });

  it('Upturned Hatchet is excluded for The Physicist', () => {
    expect(availability('upturned-hatchet', ['the-physicist']).blocked).toBe(true);
    expect(availability('upturned-hatchet', ['the-warrior']).blocked).toBe(false);
  });

  it('baby-ball passives are excluded for Empty Nester, Sisyphus, and Potager', () => {
    for (const id of ['war-horn', 'baby-rattle', 'cornucopia']) {
      for (const character of ['the-empty-nester', 'the-makeshift-sisyphus', 'the-potager']) {
        expect(availability(id, [character]).blocked, `${id} / ${character}`).toBe(true);
      }
      expect(availability(id, ['the-warrior']).blocked, id).toBe(false);
    }
  });

  it('uses union semantics across two selected characters', () => {
    // Shieldbearer is excluded; Warrior is not — the pair may use it.
    expect(availability('magnet', ['the-shieldbearer', 'the-warrior']).blocked).toBe(false);
    // Both are excluded.
    expect(availability('radiant-feather', ['the-shieldbearer', 'the-tactician']).blocked).toBe(true);
  });

  it('names the selected character and the gate in the reason', () => {
    const blocked = availability('magnet', ['the-shieldbearer']);
    expect(blocked.reason).toContain('The Shieldbearer');
    expect(blocked.reason).toContain('stat gate');
  });

  it('with no character selected: no block and no stat-gate reason', () => {
    const none = availability('magnet', []);
    expect(none.blocked).toBe(false);
    expect(none.reason).toBe('');
  });
});

describe('passive availability: zero slots is the slot limit, not a per-passive rule', () => {
  it('reports zero slots with the quirk copy and does not set blocked', () => {
    const zero = passiveAvailability(passive('wagon-wheel'), {
      selectedChars: chars('the-ballbearer'),
      passiveSlots: 0,
      zeroSlotsReason: 'The Ballbearer has no passive slots.',
    });
    expect(zero.zeroSlots).toBe(true);
    expect(zero.blocked).toBe(false);
    expect(zero.unavailable).toBe(true);
    expect(zero.reason).toBe('The Ballbearer has no passive slots.');
  });

  it('keeps the allow-list badge reason under zero slots', () => {
    const zero = passiveAvailability(passive('rusted-blade'), {
      selectedChars: chars('the-ballbearer'),
      passiveSlots: 0,
      zeroSlotsReason: 'The Ballbearer has no passive slots.',
    });
    expect(zero.characterLockReason).toBe('Only The Warrior can use this.');
  });

  it('does not double-mark a character-locked passive as blocked under zero slots', () => {
    // Under The Ballbearer every passive is unusable; the capacity (0) is the
    // single enforcement, so the Plan marks over-limit, not passive-invalid.
    const zero = passiveAvailability(passive('rusted-blade'), {
      selectedChars: chars('the-ballbearer'),
      passiveSlots: 0,
      zeroSlotsReason: 'The Ballbearer has no passive slots.',
    });
    expect(zero.blocked).toBe(false);
    expect(zero.zeroSlots).toBe(true);
  });

  it('is not zero-slots when a passive slot exists', () => {
    expect(availability('wagon-wheel', ['the-warrior'], 5).zeroSlots).toBe(false);
  });
});

describe('passive availability: loadout gates are informational', () => {
  it('surfaces the requirement without blocking', () => {
    const cursed = availability('cursed-elixir', ['the-warrior']);
    expect(cursed.blocked).toBe(false);
    expect(cursed.unavailable).toBe(false);
    expect(cursed.reason).toContain('needs a Poison-applying ball');
  });

  it('does not invent a reason for an unrestricted passive', () => {
    expect(availability('wagon-wheel', ['the-warrior']).reason).toBe('');
  });
});
