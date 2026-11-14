// Slot-limits module: the Plan's per-section capacity, global or overlaid by
// the selected characters' slot quirks. One interface:
// globalLimits(upgradesOn) and limitsFor(upgradesOn, selectedChars).
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
 *  (so the upgrade toggle still applies underneath). */
export interface SlotRule {
  /** The character id the rule belongs to (a hand-authored code-level fact,
   *  like the kit tables; the research file is not parsed). */
  id: string;
  apply(global: PlanLimits): PlanLimits;
}

/** The hand-authored quirk table. Insertion order is precedence: the first
 *  matching rule wins, so The Ballbearer's rule beats The Hoary Hoarder's on
 *  the illegal double-quirk pair. */
export const SLOT_RULES: ReadonlyMap<string, SlotRule> = new Map<string, SlotRule>([
  ['the-ballbearer', {
    id: 'the-ballbearer',
    apply: (global) => ({ ...global, balls: global.balls * 2, passives: 0 }),
  }],
  ['the-hoary-hoarder', {
    id: 'the-hoary-hoarder',
    apply: (global) => ({ ...global, balls: 2, passives: global.passives - 2 + global.balls }),
  }],
]);

/** The limits in force with no character overlay — view-state reads these for
 *  the character cap (the quirk map never changes `chars`). */
export const globalLimits = (upgradesOn: boolean): PlanLimits => ({ ...(upgradesOn ? GLOBAL.on : GLOBAL.off) });

/** The active limits: the globals overlaid by the selected characters' slot
 *  quirks. First matching rule wins (see SLOT_RULES). */
export function limitsFor(
  upgradesOn: boolean,
  selectedChars: readonly { id: string }[],
): PlanLimits {
  const global = globalLimits(upgradesOn);
  const selected = new Set(selectedChars.map((character) => character.id));
  for (const [id, rule] of SLOT_RULES) {
    if (selected.has(id)) return rule.apply(global);
  }
  return global;
}
