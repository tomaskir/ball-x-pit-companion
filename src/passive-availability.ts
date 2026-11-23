// Passive-availability module: whether a passive can be used by the selected
// character(s), and why not. Two authored mechanisms stay separate (see
// docs/research/character-passive-restrictions.md and the fact base's §2.3):
//
// - the DLC allow-list (`characterIds`): a passive is offered only to the
//   listed characters; evolved passives inherit the components' intersection
//   (Handheld Rupture is the documented override);
// - the base-game character-stat gate (`excludedCharacterIds`): a hard
//   offer-pool exclusion authored from the datamined stat/prop table. It
//   propagates through evolution (the component must be obtainable), even
//   though the game's `CanBeUsed` recursion does not re-check it.
//
// Selection semantics are the game's `CanBeUsed()`: usable by the active
// character or any combined type, so with two selected characters a passive
// is available if EITHER can use it (union). With zero selected there is no
// character restriction (the badge and allow-list reason still show).
//
// Zero passive slots (The Ballbearer) is NOT a per-passive availability rule:
// the plan's slot limit is the single enforcement (see src/slot-limits.ts).
// This module reports it as a display reason only, and deliberately leaves
// `blocked` false so the Plan marks such entries over-limit, never
// passive-invalid.
//
// Loadout gates (status ball / friendly piece / stone ally) are informational:
// they are surfaced as a requirement line, never as a block.
import type { Passive } from './data/passives';
import type { Character } from './data/characters';
import { CHARACTERS } from './i18n/catalog';
import { listJoin, requirementText, t } from './i18n';
import { passiveMap } from './catalog';

/** The character-specific badge applies to every DLC passive (base and
 *  evolved): the allow-list is the game's `IsCharSpecific` marker. */
export const isCharacterSpecific = (passive: Passive): boolean =>
  passive.characterIds !== undefined && passive.characterIds.length > 0;

/** One passive's availability under a selection. */
export interface PassiveAvailability {
  /** Character-locked or stat-gated: the Plan's `passiveInvalid` mark and the
   *  live-add block. False when zero slots is the only restriction (the slot
   *  limit owns that mark). */
  blocked: boolean;
  /** The DLC allow-list applies (the character-specific badge). */
  characterSpecific: boolean;
  /** The badge's tooltip — the allowed characters. '' when not
   *  character-specific. Independent of the selection, so the badge still
   *  lists the allow-list under zero slots. */
  characterLockReason: string;
  /** The selection has zero passive slots (derived from the slot limit). */
  zeroSlots: boolean;
  /** The Passives screen dims when blocked || zeroSlots. */
  unavailable: boolean;
  /** One consistent tooltip line; '' when unrestricted and no loadout gate. */
  reason: string;
}

export interface AvailabilityContext {
  selectedChars: readonly Character[];
  /** The active passive slot limit (character-overlaid); 0 = zero slots. */
  passiveSlots: number;
  /** The zero-slots copy from the slot quirk (src/slot-limits.ts); a generic
   *  fallback when omitted. */
  zeroSlotsReason?: string | null;
}

const characterName = new Map(CHARACTERS.map((character) => [character.id, character.name]));

/** "A"、"A 或 B" — the display join for a character set (listJoin owns the
 *  中/英连接词)。 */
const formatNames = (names: readonly string[]): string => listJoin(names);

const namesOf = (ids: readonly string[]): string[] => ids.map((id) => characterName.get(id) ?? id);

/** The active passive slots are zero: the slot limit, not a per-passive rule. */
const hasZeroSlots = ({ selectedChars, passiveSlots }: AvailabilityContext): boolean =>
  selectedChars.length > 0 && passiveSlots <= 0;

/**
 * Whether a character is stat-gate-excluded from a passive, recursively
 * through evolution. The game's `CanBeUsed(ct)` recursion does not re-check
 * the stat gate, but the component must still be obtainable before the
 * evolution is possible (the gate propagates through ownership), so an
 * evolved passive is excluded when every recipe has an excluded component.
 *
 * Only the stat gate propagates here. The evolved passive's own
 * `characterIds` already encodes the allow-list intersection (and the
 * Handheld Rupture override), so re-walking components' allow-lists would
 * wrongly narrow the override.
 */
function statGateExcluded(
  characterId: string,
  passive: Passive,
  memo: Map<string, boolean>,
  visiting: Set<string>,
): boolean {
  const key = `${characterId}\u0000${passive.id}`;
  const cached = memo.get(key);
  if (cached !== undefined) return cached;
  if (visiting.has(key)) return false; // defensive: the graph is acyclic
  visiting.add(key);
  let excluded = passive.excludedCharacterIds?.includes(characterId) ?? false;
  if (!excluded && passive.recipes.length > 0) {
    excluded = passive.recipes.every((recipe) =>
      recipe.some((componentId) => {
        const component = passiveMap.get(componentId);
        return component !== undefined && statGateExcluded(characterId, component, memo, visiting);
      }),
    );
  }
  visiting.delete(key);
  memo.set(key, excluded);
  return excluded;
}

export function passiveAvailability(passive: Passive, context: AvailabilityContext): PassiveAvailability {
  const { selectedChars } = context;
  const characterSpecific = isCharacterSpecific(passive);
  const characterLockReason = characterSpecific
    ? t('passive.only', { names: formatNames(namesOf(passive.characterIds!)) })
    : '';
  const zeroSlots = hasZeroSlots(context);

  // Zero slots dominates: every passive is unusable, but the capacity (not
  // this predicate) owns the Plan mark.
  if (zeroSlots) {
    return {
      blocked: false,
      characterSpecific,
      characterLockReason,
      zeroSlots: true,
      unavailable: true,
      reason: context.zeroSlotsReason ?? t('passive.zeroSlots'),
    };
  }

  // Combine the two mechanisms per character, then apply the union rule: the
  // passive is available if either selected character can use it. Combining
  // per character (not per mechanism) keeps a character who fails one gate
  // from counting as "able to use it" under the other.
  const memo = new Map<string, boolean>();
  const allowListed = (character: Character): boolean =>
    !characterSpecific || passive.characterIds!.includes(character.id);
  const statBlocked = (character: Character): boolean =>
    statGateExcluded(character.id, passive, memo, new Set());
  const canUse = (character: Character): boolean => allowListed(character) && !statBlocked(character);
  const blocked = selectedChars.length > 0 && !selectedChars.some(canUse);

  const reasons: string[] = [];
  // The allowed characters are always worth listing (the badge/tooltip).
  if (characterSpecific) reasons.push(characterLockReason);
  // Name the stat gate only when the allow-list does not already explain the
  // block (a DLC passive outside every selected character's allow-list needs
  // no second reason).
  if (blocked && selectedChars.every(statBlocked) && (!characterSpecific || selectedChars.some(allowListed))) {
    reasons.push(t('passive.statGate', { names: formatNames(selectedChars.map((c) => c.name)) }));
  }
  // Loadout gate: informational only.
  if (passive.requirement) reasons.push(t('passive.requirement', { req: requirementText(passive.requirement) }));

  return {
    blocked,
    characterSpecific,
    characterLockReason,
    zeroSlots: false,
    unavailable: blocked,
    reason: reasons.join(' '),
  };
}
