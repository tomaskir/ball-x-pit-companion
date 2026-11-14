// Fusion-panel module: the fusion screen's panel derivation — the named
// 3-state machine (empty / pending / composed), the composed state's
// presentation (the "Fused result" and "Reported exceptions" display rows
// plus their section visibility, and the order-sensitive warning), and the
// panel's hint text.
// One interface:
// deriveFusionPanel(picks, plan) → { panel, hint }. The seam is "picks + the
// plan facts in, panel state out": the module resolves the picks through the
// catalog, composes through src/fusion.ts, and reads only the plan facts it
// needs (pair membership for `planned`, ball slots for `planFull`, and The
// Potager selection for `fusionBlocked`). It never imports view-state (no
// runtime cycle); view-state embeds the result in the ViewModel, so the
// renderer's named-state contract is unchanged.
import { ballMap } from './catalog';
import { fuse, type FusionResult } from './fusion';
import { type FusionException } from './fusion-knowledge';
import { type Ball } from './data/balls';

/** One "Fused result" display row — a shared scalar collision resolved to
 *  the first pick. Text-only, so the renderer never blinks an icon. */
export interface FusionResultRow {
  /** Reconcile identity, derived from the row content: a swap changes the
   *  winner/value, so the key changes and the rows repaint. */
  key: string;
  label: string;
  value: string;
  /** The first pick's ball name — its value wins. */
  winner: string;
  /** Tooltip: "<winner>'s <value> wins over <loser>'s <loserValue>". */
  title: string;
  /** True for community-reported values; the presentation marks them
   *  "· reported". */
  reported: boolean;
}

/** One "Reported exceptions" display row — an anomaly outside the general
 *  rule. */
export interface FusionExceptionRow {
  /** Reconcile identity, derived from the row content. */
  key: string;
  title: string;
  detail: string;
  source: string;
  confidence: FusionException['confidence'];
  /** True when the report says the two selection orders behave differently. */
  orderDependent: boolean;
}

/** The fusion panel's state machine, named. Three states:
 *  - empty    — no picks; the panel shows only the pick-two hint.
 *  - pending  — one pick; the head shows the first ball, the second icon
 *               slot stays hidden (an src-less <img> renders as a broken-
 *               image box), and the hint asks for a second ball.
 *  - composed — both picks; the full panel (head, evo line, effect body,
 *               cross-wire, notes, result rows, exception rows) paints from
 *               this state. The result/exception presentation — display
 *               rows and section visibility — is derived here, so the
 *               renderer paints that data rather than reaching into
 *               FusionResult for it.
 *  The renderer switches on `state`; everything it paints per state rides
 *  here, derived in one place (testable without DOM). */
export type FusionPanelState =
  | { state: 'empty' }
  | { state: 'pending'; first: Ball }
  | {
      state: 'composed';
      fusion: FusionResult;
      a: Ball;
      b: Ball;
      planned: boolean;
      planFull: boolean;
      /** The Potager is selected and this pair actually fuses: the plan's
       *  add-to-plan action is blocked (removal stays allowed). Evolve-instead
       *  pairs are never blocked — they evolve, not fuse. */
      fusionBlocked: boolean;
      /** The "Fused result" rows; empty when the pair has no collisions. */
      resultRows: FusionResultRow[];
      /** The "Reported exceptions" rows; empty when the pair has none. */
      exceptions: FusionExceptionRow[];
      /** Whether the "Fused result" section shows (there are collisions). */
      showResult: boolean;
      /** Whether the "Reported exceptions" section shows. */
      showExceptions: boolean;
      /** True when the selection order changes the fused result: a shared
       *  scalar collision (first pick wins) or an order-dependent reported
       *  exception. Drives the swap affordance and its warning line. */
      orderSensitive: boolean;
      /** The warning line above the action row; '' when not order-sensitive. */
      orderNotice: string;
    };

/** The plan facts the panel reads — a narrow input rather than PlanState so
 *  this module never imports view-state and the panel's tests can hand in a
 *  stub. `hasPair` is order-insensitive plan membership of the composed
 *  pair; `ballSlots` is the plan's ball-side capacity read (a fused pair is
 *  ONE slot), whose `used >= capacity` is the panel's `planFull` mark. */
export interface FusionPanelPlan {
  hasPair(a: string, b: string): boolean;
  ballSlots: { used: number; capacity: number };
  /** The Potager is selected (the plan state's derived `fusionBlocked`). The
   *  panel exempts evolve-instead pairs itself. */
  fusionBlocked: boolean;
}

/** Both max-2 selections (characters, fusion picks) show this when full —
 *  the sticky-toggle semantics are shared, so is the wording. view-state's
 *  slotHint carries the same literal; the two are pinned by tests. */
const SELECTION_FULL = 'selection full — deselect one first';

/** "A", "A and B", "A, B, and C" — the order notice's property list. */
const labelList = (labels: string[]): string =>
  labels.length <= 1 ? (labels[0] ?? '')
  : labels.length === 2 ? `${labels[0]} and ${labels[1]}`
  : `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;

/** The composed state's whole presentation: the "Fused result" and
 *  "Reported exceptions" display rows, their section visibility, and the
 *  order-sensitive warning. The renderer paints these fields and never reads
 *  `fusion.resolved.collisions` or `fusion.exceptions` itself. An
 *  evolve-instead pair does not fuse, so it carries no rows, hides both
 *  sections, and cannot be order-sensitive.
 *
 *  Order model: docs/research/fusion-mechanics.md §3. A pair is
 *  order-sensitive when the composed fusion has a collision or an
 *  order-dependent exception. No empty-result copy exists: the result
 *  section is hidden when there are no collisions. */
const composedPresentation = (
  fusion: FusionResult,
): Pick<
  Extract<FusionPanelState, { state: 'composed' }>,
  'resultRows' | 'exceptions' | 'showResult' | 'showExceptions' | 'orderSensitive' | 'orderNotice'
> => {
  if (fusion.evolvesInstead) {
    return {
      resultRows: [],
      exceptions: [],
      showResult: false,
      showExceptions: false,
      orderSensitive: false,
      orderNotice: '',
    };
  }
  const resultRows: FusionResultRow[] = fusion.resolved.collisions.map((c) => ({
    key: `${c.key}|${c.winner}|${c.value}|${c.reported}`,
    label: c.label,
    value: c.value,
    winner: c.winnerName,
    title: `${c.winnerName}'s ${c.value} wins over ${c.loserName}'s ${c.loserValue}`,
    reported: c.reported,
  }));
  const exceptions: FusionExceptionRow[] = fusion.exceptions.map((e) => ({
    key: e.pair,
    title: e.title,
    detail: e.detail,
    source: e.source,
    confidence: e.confidence,
    orderDependent: e.orderDependent,
  }));
  const orderSensitive = resultRows.length > 0 || exceptions.some((r) => r.orderDependent);
  const orderNotice = !orderSensitive ? ''
    : resultRows.length
      ? `⚠ Order matters for this pair — swapping changes ${labelList(resultRows.map((r) => r.label))}.`
      : '⚠ Order matters for this pair — a reported exception is order-dependent.';
  return {
    resultRows,
    exceptions,
    showResult: resultRows.length > 0,
    showExceptions: exceptions.length > 0,
    orderSensitive,
    orderNotice,
  };
};

/** The composed state for two resolved balls. A repeated ball is rejected
 *  before composing (the game forbids self-fusion); the pick list dedupes, so
 *  that only happens for a hand-built pick list. fuse() still returns null
 *  for it — fall back to pending rather than carry a null `fusion` the
 *  renderer would crash on. */
function composedPanel(a: Ball, b: Ball, plan: FusionPanelPlan): FusionPanelState {
  const fusion = a.id === b.id ? null : fuse(a, b);
  if (!fusion) return { state: 'pending', first: a };
  return {
    state: 'composed',
    fusion,
    a,
    b,
    planned: plan.hasPair(a.id, b.id),
    planFull: plan.ballSlots.used >= plan.ballSlots.capacity,
    fusionBlocked: plan.fusionBlocked && !fusion.evolvesInstead,
    ...composedPresentation(fusion),
  };
}

/** Derive the fusion screen's panel and hint from the pick order and the
 *  plan facts. The panel resolves the picks through the catalog (an unknown
 *  id reads as no pick) and composes the pair through src/fusion.ts; the
 *  hint follows the raw pick count, so it stays truthful even if an id does
 *  not resolve. */
export function deriveFusionPanel(
  picks: readonly string[],
  plan: FusionPanelPlan,
): { panel: FusionPanelState; hint: string } {
  const a = picks[0] ? ballMap.get(picks[0]) : null;
  const b = picks[1] ? ballMap.get(picks[1]) : null;
  const panel: FusionPanelState = !a
    ? { state: 'empty' }
    : !b
      ? { state: 'pending', first: a }
      : composedPanel(a, b, plan);
  const hint =
    picks.length === 0 ? 'Pick two balls to see their fusion.'
    : picks.length === 1 ? '…pick a second ball.'
    : SELECTION_FULL;
  return { panel, hint };
}
