// Slot-limits module: the Plan's per-section capacity, global or overlaid by
// the selected characters' slot quirks. The interface is the two limit
// functions — globalLimits(upgradesOn) and limitsFor(upgradesOn,
// selectedChars) — plus the quirk table they read (SLOT_RULES /
// selectedSlotRule), which also carries each quirk's explanation copy so the
// quirk ids and their reasons have one home.
//
// The global limits are the site's binary End game upgrades toggle: 1
// character / 4 balls / 4 passives without it, 2 / 5 / 5 with it. The
// character quirks are FORMULAS over those globals, not a fixed per-character
// table (the game computes them from BuildingMgr.NumBallSlots /
// NumPassiveSlots — docs/research/risen-slot-limits.md):
//   - The Ballbearer: balls = 2 × global.balls, passives = 0.
//   - The Hoary Hoarder: balls = 2, passives = global.passives − 2 + global.balls.
// A formula survives a future partial-upgrade toggle; a fixed table would
// duplicate the globals and drift.
//
// Selection resolution: zero characters and ordinary characters use the
// globals; one quirk character overlays its rule; with two characters each
// quirk character's rule applies to the pair. The Matchmaker forbids the
// double-quirk pair, but a hydrated/share pair can still reach here — it
// resolves by the game's check order, The Ballbearer first (its rule wins
// outright: balls doubled, passives zero). The map's insertion order IS that
// precedence, and a test pins the two keys.
//
// Enforcement stays the plan's hybrid: live adds are hard-blocked at the
// active limit (`hasRoom`), hydrated over-limit entries are kept and marked
// red, never trimmed. The character limit is not overlaid — the quirk map
// only changes balls and passives.
/** The plan screen's slot limits: without end-game upgrades 1 character,
 *  4 balls, 4 passives; with them 2 / 5 / 5. Character quirks overlay the
 *  balls/passives numbers (see SLOT_RULES); the character cap stays global. */
export interface PlanLimits { chars: number; balls: number; passives: number; }

/** The global limits by upgrade state — the plan's End game upgrades toggle. */
const GLOBAL: { on: PlanLimits; off: PlanLimits } = {
  on: { chars: 2, balls: 5, passives: 5 },
  off: { chars: 1, balls: 4, passives: 4 },
};

/** One character's slot-quirk overlay: a pure transform of the global limits
 *  (so the upgrade toggle still applies underneath) plus the copy explaining
 *  it. The quirk's id is the map key, not a field. */
export interface SlotRule {
  apply(global: PlanLimits): PlanLimits;
  /** The section whose capacity the quirk changes surprisingly, and the
   *  over-limit hint naming it — End game upgrades cannot help that section
   *  (The Ballbearer's passives are 0 either way; The Hoary Hoarder's balls
   *  are 2 either way). */
  overLimitHint: { section: 'balls' | 'passives'; text: string };
  /** Override for the passives section's empty hint, when the quirk zeroes
   *  the section. */
  passivesEmptyHint?: string;
}

/** The hand-authored quirk table. Insertion order is precedence: the first
 *  matching rule wins, so The Ballbearer's rule beats The Hoary Hoarder's on
 *  the illegal double-quirk pair. */
export const SLOT_RULES: ReadonlyMap<string, SlotRule> = new Map<string, SlotRule>([
  ['the-ballbearer', {
    apply: (global) => ({ ...global, balls: global.balls * 2, passives: 0 }),
    overLimitHint: {
      section: 'passives',
      text: 'The Ballbearer has no passive slots — remove the highlighted passives',
    },
    passivesEmptyHint: 'The Ballbearer has no passive slots.',
  }],
  ['the-hoary-hoarder', {
    apply: (global) => ({ ...global, balls: 2, passives: global.passives - 2 + global.balls }),
    overLimitHint: {
      section: 'balls',
      text: 'The Hoary Hoarder has 2 ball slots — remove the highlighted balls',
    },
  }],
]);

/** The limits in force with no character overlay — view-state reads these for
 *  the character cap (the quirk map never changes `chars`). */
export const globalLimits = (upgradesOn: boolean): PlanLimits => ({ ...(upgradesOn ? GLOBAL.on : GLOBAL.off) });

/** The selected characters' quirk rule, if any. First matching rule wins
 *  (see SLOT_RULES), so the double-quirk pair resolves to The Ballbearer.
 *  The structural `{ id }` input keeps this module free of generated-data
 *  imports. */
export function selectedSlotRule(
  selectedChars: readonly { id: string }[],
): SlotRule | null {
  const selected = new Set(selectedChars.map((character) => character.id));
  for (const [id, rule] of SLOT_RULES) {
    if (selected.has(id)) return rule;
  }
  return null;
}

/** The active limits: the globals overlaid by the selected characters' slot
 *  quirks. */
export function limitsFor(
  upgradesOn: boolean,
  selectedChars: readonly { id: string }[],
): PlanLimits {
  const global = globalLimits(upgradesOn);
  return selectedSlotRule(selectedChars)?.apply(global) ?? global;
}
