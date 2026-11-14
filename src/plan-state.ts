// Plan-state module: the plan screen's state and its derivation — the End
// game upgrades toggle, the planned balls/passives/fused pairs, and the
// PlanState the renderer paints. One interface:
// createPlanState() → { dispatch(planAction, selectedChars),
// derive(selectedChars), snapshot(), has(id), hasPair(a, b),
// dropHidden(enabled), limits() }.
// The seam is "selectedChars in, PlanState out": the plan's characters are
// the shared selectedChars — one selection feeds verdicts, chips, and the
// plan — and they are owned by view-state.ts. plan-state never mutates
// them; dispatch and derive read only what they are handed, and the
// persisted characters are view-state's half of the SharedSnapshot
// (src/plan-codec.ts). The selection is read at dispatch time because the
// capacity guards are character-aware: src/slot-limits.ts overlays the
// global limits with the selected characters' slot quirks (The Ballbearer's
// zero passives, The Hoary Hoarder's redistribution).
// PlanSnapshot, the plan-owned persistence currency, lives here; the codec
// owns the wire/normalized shapes around it.
// The three plan lists are pick lists (src/pick-list.ts): the sticky toggle,
// the capacity guard, the resolution guard, and duplicate-free restore live
// there, not here. The fused-pair list shares the ball capacity with the
// single-ball list (a pair is ONE slot) through its `hasRoom` callback.
// Paint order is derived here as well: the plan's balls (singles + fused
// pairs, one merged grid) and passives sort by complexity — how many base
// entities the final form contains (graph.complexity), most complex left.
// The Potager's "cannot fuse balls normally" is derived here too: a planned
// pair that actually fuses is marked `fusionInvalid` (kept, never trimmed)
// while The Potager is selected, and live fusing-pair adds are blocked.
// Passive availability (src/passive-availability.ts) is derived the same way:
// a planned passive the selected characters cannot use is marked
// `passiveInvalid` (kept, never trimmed), live adds are blocked, and the
// build graph excludes it. Zero passive slots stays the capacity's over-limit
// mark, never passive-invalid.
import { type Ball } from './data/balls';
import { type Passive } from './data/passives';
import { type Character } from './data/characters';
import { type Edition } from './data/editions';
import { ballMap, passiveMap, isPassive, itemFor } from './catalog';
import { isEditionEnabled } from './edition-gate';
import { complexity } from './graph';
import { evolvesInstead, fusionName, isFusable } from './fusion';
import { createPickList } from './pick-list';
import { passiveAvailability } from './passive-availability';
import { verdictFor, type Item, type Verdict } from './synergy';
import { pairKey } from './pair';
import { globalLimits, limitsFor, selectedSlotRule, type PlanLimits } from './slot-limits';

export type { PlanLimits };
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
/** One passive in the plan: the resolved item (renderer never re-resolves),
 *  its verdict against the selected characters, the over-limit mark, and the
 *  passive-availability mark (character-locked or stat-gated; kept, never
 *  trimmed). `availabilityReason` is the tooltip line (used when invalid). */
export interface PlanEntryState {
  item: Item;
  overLimit: boolean;
  verdict: Verdict | null;
  passiveInvalid: boolean;
  availabilityReason: string;
}
/** One single ball in the plan's merged ball grid. */
export interface PlanSingleState { kind: 'single'; item: Ball; overLimit: boolean; verdict: Verdict | null; }
/** One fused pair in the plan's merged ball grid: resolved components in
 *  compose order, the composed display name, one verdict per component
 *  (badges ride each icon), the over-limit mark, and The Potager's
 *  `fusionInvalid` mark (the pair actually fuses, which The Potager cannot
 *  do; evolve-instead pairs are exempt). A pair counts as ONE ball slot and
 *  paints as ONE entry. */
export interface PlanFusedState { kind: 'fused'; a: Ball; b: Ball; name: string; overLimit: boolean; fusionInvalid: boolean; verdicts: [Verdict | null, Verdict | null]; }
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
  /** Warning shown while over limit; '' otherwise. Names the slot quirk when
   *  one is responsible (The Ballbearer's passives, The Hoary Hoarder's
   *  balls), because re-enabling End game upgrades cannot help those. */
  hint: string;
  /** The Potager is selected: live fusing-pair adds are blocked and planned
   *  pairs are marked `fusionInvalid`. */
  fusionBlocked: boolean;
  /** Second warning line shown while fusion-invalid pairs exist; '' otherwise. */
  fusionInvalidHint: string;
  /** Second warning line shown while passive-invalid entries exist; '' otherwise. */
  passiveInvalidHint: string;
  /** Override for the passives section's empty hint (The Ballbearer has no
   *  passive slots); null means the renderer's default. */
  passivesEmptyHint: string | null;
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
   *  sorted ids. Counts as ONE ball slot. While The Potager is selected a
   *  live add of a pair that actually fuses is a no-op; removal is always
   *  allowed, and evolve-instead pairs are exempt. */
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

/** The Potager's "cannot fuse balls normally" quirk: any planned pair that
 *  actually fuses is impossible while The Potager is selected. One id
 *  constant for the live block and the derived mark. */
const POTAGER_ID = 'the-potager';

/** The generic over-limit hint — used when no slot quirk is responsible (the
 *  End game upgrades toggle can help). */
const OVER_LIMIT_HINT = 'Over the limit — remove the highlighted picks or re-enable End game upgrades.';

/** Whether any selected character is The Potager — the fusion block applies
 *  with one or two selected characters. */
const potagerSelected = (selectedChars: readonly Character[]): boolean =>
  selectedChars.some((character) => character.id === POTAGER_ID);

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
  /** The selection the last dispatch/derive was handed — the capacity guards
   *  read it at toggle time (the active limits are character-aware). The
   *  shared selection itself stays view-state's; this is only the latest
   *  handed-in view. */
  let currentChars: readonly Character[] = [];
  /** The active limits: the globals overlaid by the selected characters'
   *  slot quirks (src/slot-limits.ts). Read at toggle time, never cached. */
  const activeLimits = (): PlanLimits => limitsFor(upgradesOn, currentChars);
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
    hasRoom: (list) => ballSlotsUsed(list, planFused.list()) < activeLimits().balls,
  });
  const planPassives = createPickList<Passive, string>({
    resolve: (id) => passiveMap.get(id),
    key: (passive) => passive.id,
    hasRoom: (list) => list.length < activeLimits().passives,
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
    hasRoom: (list) => ballSlotsUsed(planBalls.list(), list) < activeLimits().balls,
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
    const limits = limitsFor(upgradesOn, selectedChars);
    const planBallItems = planBalls.list();
    const planFusedPairs = planFused.list();
    const planPassiveItems = planPassives.list();
    const ballSlots = ballSlotsUsed(planBallItems, planFusedPairs);
    // The Potager cannot fuse balls normally: a planned pair that actually
    // fuses is marked (kept, never trimmed); evolve-instead pairs are exempt.
    const potager = potagerSelected(selectedChars);
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
        fusionInvalid: potager && !evolvesInstead(a, b),
        verdicts: [verdictFor(a, selectedChars), verdictFor(b, selectedChars)] as [Verdict | null, Verdict | null],
      })),
    ]
      .sort((x, y) => ballComplexity(y) - ballComplexity(x))
      .map((e, i) => ({ ...e, overLimit: i >= limits.balls }));
    // Quirk-aware copy: re-enabling End game upgrades cannot help the
    // section a quirk owns, so that hint names the quirk instead. Read before
    // the passive entries because the zero-slots reason comes from the rule.
    const slotRule = selectedSlotRule(selectedChars);
    /** One passive's availability under the derived selection and limits —
     *  the one context literal the entries read. */
    const availabilityOf = (passive: Passive) =>
      passiveAvailability(passive, {
        selectedChars,
        passiveSlots: limits.passives,
        zeroSlotsReason: slotRule?.passivesEmptyHint ?? null,
      });
    const planPassivesState = planPassiveItems
      .map((item) => {
        const availability = availabilityOf(item);
        return {
          item,
          overLimit: false,
          verdict: verdictFor(item, selectedChars),
          // Character-locked / stat-gated entries are kept and marked red.
          // Zero slots is the capacity's mark (over-limit), never this one.
          passiveInvalid: availability.blocked,
          availabilityReason: availability.reason,
        };
      })
      .sort((x, y) => complexity(y.item, passiveMap) - complexity(x.item, passiveMap))
      .map((e, i) => ({ ...e, overLimit: i >= limits.passives }));
    const ballsOver = ballSlots > limits.balls;
    const passivesOver = planPassiveItems.length > limits.passives;
    const overLimit = selectedChars.length > limits.chars || ballsOver || passivesOver;
    const quirkOver = slotRule?.overLimitHint.section === 'passives' ? passivesOver
      : slotRule?.overLimitHint.section === 'balls' ? ballsOver
      : false;
    const hint = slotRule && quirkOver ? slotRule.overLimitHint.text : overLimit ? OVER_LIMIT_HINT : '';
    const fusionInvalid = balls.some((e) => e.kind === 'fused' && e.fusionInvalid);
    const passiveInvalid = planPassivesState.some((e) => e.passiveInvalid);
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
      hint,
      fusionBlocked: potager,
      fusionInvalidHint: fusionInvalid ? "The Potager can't fuse balls — remove the highlighted pairs" : '',
      passiveInvalidHint: passiveInvalid
        ? "Some passives aren't available to the selected characters — remove the highlighted entries."
        : '',
      passivesEmptyHint: slotRule?.passivesEmptyHint ?? null,
    };
  };

  return {
    /** Mutates the plan's own state only — the shared selectedChars are
     *  view-state's; the selection is handed in so the capacity guards can
     *  read the active (quirk-overlaid) limits at toggle time. */
    dispatch(action: PlanAction, selectedChars: readonly Character[] = []): void {
      currentChars = selectedChars;
      switch (action.type) {
        // Plan membership: the catalog decides the namespace; the pick list
        // rejects unknown ids, re-click removes, adding past the active
        // limit is a no-op. Removal is always allowed — even over-limit
        // entries.
        case 'togglePlanItem':
          // Live passive adds are blocked when the selected characters cannot
          // use the passive (character-locked or stat-gated); removal is
          // always allowed, and hydrated entries are kept and marked.
          if (isPassive(action.id) && !planPassives.has(action.id)) {
            const passive = passiveMap.get(action.id);
            if (passive) {
              const limits = activeLimits();
              // The zero-slots reason is display-only; the guard reads
              // `blocked` (capacity owns the zero-slot case).
              if (passiveAvailability(passive, { selectedChars: currentChars, passiveSlots: limits.passives }).blocked) break;
            }
          }
          (isPassive(action.id) ? planPassives : planBalls).toggle(action.id);
          break;
        // Fused-pair plan membership: the pick list's identity is
        // order-insensitive (the reverse composition toggles the same pair)
        // and its resolution guard rejects unknown/non-fusable components;
        // adding past the ball limit is a no-op. Compose order is kept for
        // display. The Potager blocks live adds of pairs that actually fuse
        // (removal and evolve-instead pairs stay allowed) — the fusion
        // screen disables its button too; this is the seam's own guard.
        case 'togglePlanFusion': {
          const a = ballMap.get(action.a);
          const b = ballMap.get(action.b);
          const planned = planFused.has({ a: action.a, b: action.b });
          if (!planned && a && b && potagerSelected(currentChars) && !evolvesInstead(a, b)) break;
          planFused.toggle({ a: action.a, b: action.b });
          break;
        }
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
    /** The GLOBAL limits in force right now — view-state's character slots
     *  gate on them (the character limit rides the plan's upgrade toggle and
     *  the quirk map never changes it). The character-overlaid limits ride
     *  `derive(selectedChars).limits` instead. */
    limits(): PlanLimits {
      return globalLimits(upgradesOn);
    },
  };
}
