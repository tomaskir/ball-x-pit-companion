// Fusion-panel module: the fusion screen's panel derivation — the named
// 3-state machine (empty / pending / composed), the composed pair's order
// presentation (the order-sensitive warning and the empty-result copy), and
// the panel's hint text. One interface:
// deriveFusionPanel(picks, plan) → { panel, hint }. The seam is "picks + the
// plan facts in, panel state out": the module resolves the picks through the
// catalog, composes through src/fusion.ts, and reads only the plan facts it
// needs (pair membership for `planned`, ball slots for `planFull`). It never
// imports view-state (no runtime cycle); view-state embeds the result in the
// ViewModel, so the renderer's named-state contract is unchanged.
import { ballMap } from './catalog';
import { fuse, type FusionResult } from './fusion';
import { type Ball } from './data/balls';

/** The fusion panel's state machine, named. Three states:
 *  - empty    — no picks; the panel shows only the pick-two hint.
 *  - pending  — one pick; the head shows the first ball, the second icon
 *               slot stays hidden (an src-less <img> renders as a broken-
 *               image box), and the hint asks for a second ball.
 *  - composed — both picks; the full panel (head, evo line, effect body,
 *               cross-wire, notes) paints from the fused result.
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
      /** True when the selection order changes the fused result: a shared
       *  scalar collision (first pick wins) or an order-dependent reported
       *  exception. Drives the swap affordance and its warning line. */
      orderSensitive: boolean;
      /** The warning line above the action row; '' when not order-sensitive. */
      orderNotice: string;
      /** Empty "Fused result" copy, set only when the pair has no collisions:
       *  order-sensitive pairs say only that no shared properties exist;
       *  order-independent pairs add that order does not matter; '' when
       *  result rows exist. Derived here so the renderer only paints it. */
      resultEmptyText: string;
    };

/** The plan facts the panel reads — a narrow input rather than PlanState so
 *  this module never imports view-state and the panel's tests can hand in a
 *  stub. `hasPair` is order-insensitive plan membership of the composed
 *  pair; `ballSlots` is the plan's ball-side capacity read (a fused pair is
 *  ONE slot), whose `used >= capacity` is the panel's `planFull` mark. */
export interface FusionPanelPlan {
  hasPair(a: string, b: string): boolean;
  ballSlots: { used: number; capacity: number };
}

/** Both max-2 selections (characters, fusion picks) show this when full —
 *  the sticky-toggle semantics are shared, so is the wording. Exported so
 *  view-state's slotHint and the fusion hint cannot drift. */
export const SELECTION_FULL = 'selection full — deselect one first';

/** "A", "A and B", "A, B, and C" — the order notice's property list. */
const labelList = (labels: string[]): string =>
  labels.length <= 1 ? (labels[0] ?? '')
  : labels.length === 2 ? `${labels[0]} and ${labels[1]}`
  : `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;

/** The order presentation, derived here so the renderer only paints it
 *  (decision #8). Order model: docs/research/fusion-mechanics.md §3. A pair is
 *  order-sensitive when the composed fusion has a collision or an
 *  order-dependent exception; an evolve-instead pair never fuses, so order
 *  cannot matter. */
const orderPresentation = (
  fusion: FusionResult,
): { orderSensitive: boolean; orderNotice: string; resultEmptyText: string } => {
  if (fusion.evolvesInstead) return { orderSensitive: false, orderNotice: '', resultEmptyText: '' };
  const collisions = fusion.resolved.collisions;
  const orderSensitive = collisions.length > 0 || fusion.exceptions.some((e) => e.orderDependent);
  // Only pairs with no collisions reach the empty-result copy. An
  // exception-only order-sensitive pair has no shared properties, but order
  // still matters — the warning line above the action row says so.
  const resultEmptyText = collisions.length > 0
    ? ''
    : orderSensitive
      ? 'No shared properties.'
      : 'No shared properties — order does not matter.';
  if (!orderSensitive) return { orderSensitive: false, orderNotice: '', resultEmptyText };
  const orderNotice = collisions.length
    ? `⚠ Order matters for this pair — swapping changes ${labelList(collisions.map((c) => c.label))}.`
    : '⚠ Order matters for this pair — a reported exception is order-dependent.';
  return { orderSensitive: true, orderNotice, resultEmptyText };
};

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
      : (() => {
          const fusion = fuse(a, b);
          return {
            state: 'composed',
            fusion,
            a,
            b,
            planned: plan.hasPair(a.id, b.id),
            planFull: plan.ballSlots.used >= plan.ballSlots.capacity,
            ...orderPresentation(fusion),
          };
        })();
  const hint =
    picks.length === 0 ? 'Pick two balls to see their fusion.'
    : picks.length === 1 ? '…pick a second ball.'
    : SELECTION_FULL;
  return { panel, hint };
}
