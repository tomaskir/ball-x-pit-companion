// Plan-state module: the plan screen's state and its derivation — the End
// game upgrades toggle, the planned balls/passives/fused pairs, and the
// PlanState the renderer paints. One interface:
// createPlanState() → { dispatch(planAction), derive(selectedChars),
// snapshot(), has(id), hasPair(a, b), dropHidden(enabled), limits() }.
// The seam is "selectedChars in, PlanState out": the plan's characters are
// the shared selectedChars — one selection feeds verdicts, chips, and the
// plan — and they are owned by view-state.ts. plan-state never mutates
// them; derive reads only what it is handed, and the persisted characters
// are view-state's half of the SharedSnapshot (src/plan-codec.ts).
// PlanSnapshot, the plan-owned persistence currency, lives here; the codec
// owns the wire/normalized shapes around it.
// The three plan lists are pick lists (src/pick-list.ts): the sticky toggle,
// the capacity guard, the resolution guard, and duplicate-free restore live
// there, not here. The fused-pair list shares the ball capacity with the
// single-ball list (a pair is ONE slot) through its `hasRoom` callback.
// Paint order is derived here as well: the plan's balls (singles + fused
// pairs, one merged grid) and passives sort by complexity — how many base
// entities the final form contains (graph.complexity), most complex left.
import { type Ball } from './data/balls';
import { type Passive } from './data/passives';
import { type Character } from './data/characters';
import { type Edition } from './data/editions';
import { ballMap, passiveMap, isPassive, itemFor } from './catalog';
import { isEditionEnabled } from './edition-gate';
import { complexity } from './graph';
import { fusionName, isFusable } from './fusion';
import { createPickList } from './pick-list';
import { verdictFor, type Item, type Verdict } from './synergy';
import { pairKey } from './pair';

/** The plan screen's slot limits: without end-game upgrades 1 character,
 *  4 balls, 4 passives; with them 2 / 5 / 5. */
export interface PlanLimits { chars: number; balls: number; passives: number; }
/** A planned fused pair — compose order (a first) for display, sorted ids
 *  for identity (the reverse composition is the same planned pair). */
export interface PlanFused { a: string; b: string; }
/** The plan as bare ids — the plan-owned persistence currency. The codec
 *  (src/plan-codec.ts) wraps it with the shared character selection as the
 *  SharedSnapshot the island serializes; plan-state neither reads nor writes
 *  `chars`. */
export interface PlanSnapshot { upgradesOn: boolean; balls: string[]; passives: string[]; fused: PlanFused[]; }
/** One character in the plan: overLimit marks slots beyond the active
 *  limit (kept, never trimmed — the user decides what to remove).
 *  pairInvalid marks a Matchmaker-forbidden pair that arrived hydrated
 *  (Share link / localStorage) — also kept and marked, never trimmed; live
 *  selection can never produce one. */
export interface PlanCharState { character: Character; overLimit: boolean; pairInvalid: boolean; }
/** One ball/passive in the plan: the resolved item (renderer never
 *  re-resolves), its verdict against the selected characters, and the
 *  over-limit mark. The passives' entry shape. */
export interface PlanEntryState { item: Item; overLimit: boolean; verdict: Verdict | null; }
/** One single ball in the plan's merged ball grid. */
export interface PlanSingleState { kind: 'single'; item: Ball; overLimit: boolean; verdict: Verdict | null; }
/** One fused pair in the plan's merged ball grid: resolved components in
 *  compose order, the composed display name, one verdict per component
 *  (badges ride each icon), and the over-limit mark. A pair counts as ONE
 *  ball slot and paints as ONE entry. */
export interface PlanFusedState { kind: 'fused'; a: Ball; b: Ball; name: string; overLimit: boolean; verdicts: [Verdict | null, Verdict | null]; }
/** The plan's ball grid is ONE ordered list — singles and fused pairs
 *  interleaved by complexity (`graph.complexity`; a pair's is the sum of
 *  its components'), most complex left, ties in pick order (stable sort). */
export type PlanBallEntry = PlanSingleState | PlanFusedState;
/** The plan screen's whole state — the final build the user is assembling.
 *  Derived in one place so the renderer only paints. */
export interface PlanState {
  upgradesOn: boolean;
  limits: PlanLimits;
  counts: PlanLimits;
  characters: PlanCharState[];
  /** The merged ball grid in paint order (see PlanBallEntry). */
  balls: PlanBallEntry[];
  /** In paint order too: most complex first. */
  passives: PlanEntryState[];
  /** Any section holds more than its active limit allows. */
  overLimit: boolean;
  /** Warning shown while over limit; '' otherwise. */
  hint: string;
}
/** The plan's actions — the plan-shaped slice of the view-state Action
 *  union. view-state forwards them verbatim; `hydrate` carries the plan's
 *  own fields (the shared selection is view-state's half of the
 *  SharedSnapshot). */
export type PlanAction =
  /** Plan membership toggle for a ball or passive — the namespace comes
   *  from the catalog, callers pass the id only. */
  | { type: 'togglePlanItem'; id: string }
  /** Plan membership toggle for a fused pair (the fusion screen's composed
   *  panel and the balls screen's selection box emit it). Identity is
   *  order-insensitive: the pair is stored in compose order but matched by
   *  sorted ids. Counts as ONE ball slot. */
  | { type: 'togglePlanFusion'; a: string; b: string }
  /** The plan screen's End game upgrades toggle (on by default). */
  | { type: 'toggleUpgrades' }
  /** The plan toolbar's Clear button: empties the plan's balls, passives
   *  and fused pairs and resets the toggle to its default (on). The shared
   *  selectedChars are cleared by view-state, which owns them. Nothing
   *  else is touched. */
  | { type: 'clearPlan' }
  /** Restore a persisted plan (the island reads localStorage at startup).
   *  Unknown ids and duplicates are filtered; over-limit selections are
   *  kept as-is and marked, not trimmed. */
  | { type: 'hydrate'; plan: PlanSnapshot };

/** Slot limits by upgrade state: base game vs end-game upgrades. */
const LIMITS: { on: PlanLimits; off: PlanLimits } = {
  on: { chars: 2, balls: 5, passives: 5 },
  off: { chars: 1, balls: 4, passives: 4 },
};

/** The limits in force for an upgrade-toggle state — one place, every call
 *  site (plan derivation and view-state's character slots alike). */
const activeLimits = (upgradesOn: boolean): PlanLimits => (upgradesOn ? LIMITS.on : LIMITS.off);

/** Ball slots a plan occupies: every single ball is one slot, and a fused
 *  pair is ONE slot (the pair replaces its two components) — one internal
 *  definition, not one per call site. */
const ballSlotsUsed = (balls: readonly Ball[], fused: readonly ResolvedFusedPair[]): number =>
  balls.length + fused.length;

/** A planned fused pair resolved to its catalog balls — the pick list's
 *  stored shape. The snapshot maps it back to the persisted id pair. */
interface ResolvedFusedPair { a: Ball; b: Ball; }

export function createPlanState() {
  /** The plan's End game upgrades toggle — on by default. */
  let upgradesOn = true;
  /** Plan balls/passives in pick order — the storage order (snapshot,
   *  hydrate); the paint order is derived (complexity, see derive). The
   *  plan's characters are the shared selectedChars — one selection feeds
   *  verdicts, chips, plan. Resolution guards reject unknown ids (the
   *  catalog decides the namespace at the dispatch seam). */
  const planBalls = createPickList<Ball, string>({
    resolve: (id) => ballMap.get(id),
    key: (ball) => ball.id,
    // the ball list shares the ball capacity with the fused pairs (a pair
    // is ONE slot), so room is "slots used < capacity", not this list's length.
    // `planFused` is declared below; the callback runs only after
    // createPlanState returns, so the forward reference is safe.
    hasRoom: (list) => ballSlotsUsed(list, planFused.list()) < activeLimits(upgradesOn).balls,
  });
  const planPassives = createPickList<Passive, string>({
    resolve: (id) => passiveMap.get(id),
    key: (passive) => passive.id,
    hasRoom: (list) => list.length < activeLimits(upgradesOn).passives,
  });
  /** Planned fused pairs in compose order, resolved to their catalog balls;
   *  identity is the sorted id pair, so the reverse composition is the same
   *  planned pair. Resolution rejects unknown ids, non-fusable balls (Baby
   *  Ball), and degenerate pairs — derive() can therefore never meet a bad
   *  component. */
  const planFused = createPickList<ResolvedFusedPair, PlanFused>({
    resolve: (p) => {
      const a = ballMap.get(p.a);
      const b = ballMap.get(p.b);
      return a && b && a.id !== b.id && isFusable(a.id) && isFusable(b.id) ? { a, b } : undefined;
    },
    key: (p) => pairKey(p.a.id, p.b.id),
    hasRoom: (list) => ballSlotsUsed(planBalls.list(), list) < activeLimits(upgradesOn).balls,
  });

  /** Apply a normalized plan to the in-memory state, keyed by PlanSnapshot's
   *  fields: the compiler rejects a missing row when the plan grows a field,
   *  so hydrate cannot silently forget one. The codec's FIELDS table is the
   *  wire/normalized half of the same guarantee. The pick lists keep their
   *  resolution guards — unknown ids, non-fusable and degenerate pairs are
   *  still dropped here, not in the codec. */
  const restorePlan = {
    upgradesOn: (value: boolean) => { upgradesOn = value; },
    balls: (value: string[]) => planBalls.restore(value),
    passives: (value: string[]) => planPassives.restore(value),
    fused: (value: PlanFused[]) => planFused.restore(value),
  } satisfies { [K in keyof PlanSnapshot]: (value: PlanSnapshot[K]) => void };
  const applyPlan = (plan: PlanSnapshot): void => {
    // one cast: the loop cannot correlate the key with the row's value type
    for (const key of Object.keys(restorePlan) as (keyof PlanSnapshot)[]) {
      (restorePlan[key] as (value: PlanSnapshot[keyof PlanSnapshot]) => void)(plan[key]);
    }
  };

  /** The plan derived against the handed-in selection: resolved entries in
   *  paint order — balls and passives sorted by complexity (`graph.complexity`,
   *  most complex left; a fused pair's is the sum of its components'), ties
   *  in pick order (stable sort) — and marked over limit beyond the active
   *  section limit (kept, never trimmed; the marks ride the sorted order, so
   *  the displayed tail is what gets flagged). Verdicts ride along so the
   *  renderer paints them without re-deriving. */
  const derive = (selectedChars: readonly Character[]): PlanState => {
    const limits = activeLimits(upgradesOn);
    const planBallItems = planBalls.list();
    const planFusedPairs = planFused.list();
    const planPassiveItems = planPassives.list();
    const ballSlots = ballSlotsUsed(planBallItems, planFusedPairs);
    const ballComplexity = (e: PlanBallEntry): number =>
      e.kind === 'single' ? complexity(e.item, ballMap) : complexity(e.a, ballMap) + complexity(e.b, ballMap);
    const balls: PlanBallEntry[] = [
      ...planBallItems.map((item) => ({
        kind: 'single' as const,
        item,
        overLimit: false,
        verdict: verdictFor(item, selectedChars),
      })),
      ...planFusedPairs.map(({ a, b }) => ({
        kind: 'fused' as const,
        a,
        b,
        name: fusionName(a, b),
        overLimit: false,
        verdicts: [verdictFor(a, selectedChars), verdictFor(b, selectedChars)] as [Verdict | null, Verdict | null],
      })),
    ]
      .sort((x, y) => ballComplexity(y) - ballComplexity(x))
      .map((e, i) => ({ ...e, overLimit: i >= limits.balls }));
    const planPassivesState = planPassiveItems
      .map((item) => ({ item, overLimit: false, verdict: verdictFor(item, selectedChars) }))
      .sort((x, y) => complexity(y.item, passiveMap) - complexity(x.item, passiveMap))
      .map((e, i) => ({ ...e, overLimit: i >= limits.passives }));
    const overLimit =
      selectedChars.length > limits.chars ||
      ballSlots > limits.balls ||
      planPassiveItems.length > limits.passives;
    return {
      upgradesOn,
      limits,
      counts: { chars: selectedChars.length, balls: ballSlots, passives: planPassiveItems.length },
      characters: selectedChars.map((c, i) => ({
        character: c,
        overLimit: i >= limits.chars,
        pairInvalid:
          selectedChars.length === 2 &&
          selectedChars[1 - i].cannotPair.includes(c.id),
      })),
      balls,
      passives: planPassivesState,
      overLimit,
      hint: overLimit ? 'Over the limit — remove the highlighted picks or re-enable End game upgrades.' : '',
    };
  };

  return {
    /** Mutates the plan's own state only — the shared selectedChars are
     *  view-state's; derive(selectedChars) reads them back afterwards. */
    dispatch(action: PlanAction): void {
      switch (action.type) {
        // Plan membership: the catalog decides the namespace; the pick list
        // rejects unknown ids, re-click removes, adding past the active
        // limit is a no-op. Removal is always allowed — even over-limit
        // entries.
        case 'togglePlanItem':
          (isPassive(action.id) ? planPassives : planBalls).toggle(action.id);
          break;
        // Fused-pair plan membership: the pick list's identity is
        // order-insensitive (the reverse composition toggles the same pair)
        // and its resolution guard rejects unknown/non-fusable components;
        // adding past the ball limit is a no-op. Compose order is kept for
        // display.
        case 'togglePlanFusion':
          planFused.toggle({ a: action.a, b: action.b });
          break;
        case 'toggleUpgrades': upgradesOn = !upgradesOn; break;
        case 'clearPlan':
          planBalls.restore([]);
          planPassives.restore([]);
          planFused.restore([]);
          upgradesOn = true;
          break;
        case 'hydrate':
          applyPlan(action.plan);
          break;
      }
    },
    derive,
    /** The plan's own fields as bare ids — the plan half of the persistence
     *  currency (the codec pairs it with the shared selection). */
    snapshot(): PlanSnapshot {
      return {
        upgradesOn,
        balls: planBalls.list().map((ball) => ball.id),
        passives: planPassives.list().map((passive) => passive.id),
        fused: planFused.list().map((p) => ({ a: p.a.id, b: p.b.id })),
      };
    },
    /** Plan membership of one id, namespace resolved through the catalog —
     *  the selection boxes' "add/remove" label queries this instead of
     *  reaching into the plan's lists. */
    has(id: string): boolean {
      return isPassive(id) ? planPassives.has(id) : planBalls.has(id);
    },
    /** Plan membership of a fused pair, by sorted-id identity — the fusion
     *  panel's `planned` mark queries this. */
    hasPair(a: string, b: string): boolean {
      return planFused.has({ a, b });
    },
    /** Drop every plan entry the edition filter hides — singles whose own
     *  edition is disabled and fused pairs with either component hidden.
     *  Returns the number of entries removed (a fused pair counts once). The
     *  filter's no-hidden-live-state invariant lives here, with the plan's
     *  lists; re-enabling an edition does not restore anything. */
    dropHidden(enabled: readonly Edition[]): number {
      const visible = (id: string): boolean => {
        const item = itemFor(id);
        return item !== undefined && isEditionEnabled(enabled, item.edition);
      };
      const before = planBalls.list().length + planPassives.list().length + planFused.list().length;
      planBalls.restore(planBalls.list().filter((ball) => visible(ball.id)).map((ball) => ball.id));
      planPassives.restore(planPassives.list().filter((passive) => visible(passive.id)).map((passive) => passive.id));
      planFused.restore(
        planFused.list()
          .filter((pair) => visible(pair.a.id) && visible(pair.b.id))
          .map((pair) => ({ a: pair.a.id, b: pair.b.id })),
      );
      const after = planBalls.list().length + planPassives.list().length + planFused.list().length;
      return before - after;
    },
    /** The limits in force right now — view-state's character slots gate
     *  on them (the character limit rides the plan's upgrade toggle). */
    limits(): PlanLimits {
      return activeLimits(upgradesOn);
    },
  };
}
