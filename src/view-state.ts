// View-state module: the island's state (item selection, character slots,
// fusion picks, the plan's selections and upgrade toggle, per-screen search
// queries) and every derivation the island used to hand-wire between its
// event handlers. One interface:
// dispatch(action) → ViewModel — 'clear' is section-scoped (the active
// section's selection only; the plan is excluded — it is deliberate work,
// only clearPlan wipes it); selections from different screens coexist, so
// tab switching dispatches nothing. Search is per screen: each section has
// its own query (own search box), independent of every other screen's.
// The island (src/companion.ts) keeps only event listening, theme, hash
// routing, and plan persistence; painting lives in src/renderer.ts. Fusion
// composition lives in src/fusion.ts. The view model carries resolved
// items, not bare ids: fusionPanel names the fusion screen's state machine
// (empty / pending / composed) and carries the resolved Ball objects and
// composed fusion so the renderer never re-derives them — it switches on
// the named state and paints. The plan rides vm.plan the same way
// (PlanState: resolved entries, verdicts, limits, over-limit marks).
import { BALLS, type Ball } from './data/balls';
import { PASSIVES } from './data/passives';
import { CHARACTERS, type Character } from './data/characters';
import { highlightSet } from './graph';
import { ballMap, passiveMap, isPassive, itemFor, graphFor } from './catalog';
import { fusionBalls, fusionName, fuse, type FusionResult } from './fusion';
import { verdictFor, type Item, type Verdict } from './synergy';

export interface TileState { selected: boolean; related: boolean; dimmed: boolean; filtered: boolean; verdict: Verdict | null; }
export interface CharCardState { selected: boolean; filtered: boolean; }
/** Pick state of one ball row on the fusion screen: slot = pick order (1
 *  first, 2 second), null when not picked. Baby Ball is not a fusable
 *  upgrade entity and is excluded from the list. */
export interface FusionRowState { slot: 1 | 2 | null; filtered: boolean; }
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
  | { state: 'composed'; fusion: FusionResult; a: Ball; b: Ball; planned: boolean; planFull: boolean };

/** The plan screen's slot limits: without end-game upgrades 1 character,
 *  4 balls, 4 passives; with them 2 / 5 / 5. */
export interface PlanLimits { chars: number; balls: number; passives: number; }
/** A planned fused pair — compose order (a first) for display, sorted ids
 *  for identity (the reverse composition is the same planned pair). */
export interface PlanFused { a: string; b: string; }
/** The plan as bare ids — the persistence currency. The island serializes
 *  this shape to localStorage and feeds it back through `hydrate`; one type
 *  pins both sides (and `planSnapshot(vm)` produces it from a view model). */
export interface PlanSnapshot { upgradesOn: boolean; chars: string[]; balls: string[]; passives: string[]; fused: PlanFused[]; }
/** One character in the plan: overLimit marks slots beyond the active
 *  limit (kept, never trimmed — the user decides what to remove). */
export interface PlanCharState { character: Character; overLimit: boolean; }
/** One ball/passive in the plan: the resolved item (renderer never
 *  re-resolves), its verdict against the selected characters, and the
 *  over-limit mark. */
export interface PlanEntryState { item: Item; overLimit: boolean; verdict: Verdict | null; }
/** One fused pair in the plan: resolved components in compose order, the
 *  composed display name, one verdict per component (badges ride each
 *  icon), and the over-limit mark. A pair counts as ONE ball slot. */
export interface PlanFusedState { a: Ball; b: Ball; name: string; overLimit: boolean; verdicts: [Verdict | null, Verdict | null]; }
/** The plan screen's whole state — the final build the user is assembling.
 *  Derived in one place so the renderer only paints. */
export interface PlanState {
  upgradesOn: boolean;
  limits: PlanLimits;
  counts: PlanLimits;
  characters: PlanCharState[];
  balls: PlanEntryState[];
  passives: PlanEntryState[];
  fused: PlanFusedState[];
  /** Any section holds more than its active limit allows. */
  overLimit: boolean;
  /** Warning shown while over limit; '' otherwise. */
  hint: string;
}
/** The balls/passives screens' selection box: the currently selected item
 *  (null = no box on that screen) and the label states for its buttons —
 *  derived here so the renderer only paints. `plan`/`fusion` label kinds:
 *  add / remove (toggle) / disabled (at limit or, for fusion, picks full) /
 *  unfusable (Baby Ball). `fusion` is null where there is no fusion button
 *  (passives). */
export interface SelectionBoxState {
  item: Item;
  plan: 'add' | 'remove' | 'disabled';
  fusion: 'add' | 'remove' | 'disabled' | 'unfusable' | null;
}
export interface ViewModel {
  tiles: Map<string, TileState>;
  charCards: Map<string, CharCardState>;
  fusionRows: Map<string, FusionRowState>;
  selectedChars: Character[];
  /** Hint for the character screen: "pick a second character…" while one is
   *  held and two are allowed, "selection full — deselect one first" when at
   *  the active limit. */
  slotHint: string;
  /** The fusion screen's panel state — see FusionPanelState. The panel's
   *  hint text is derived here too (fusionHint below) so the renderer
   *  paints it without re-deriving pick counts. */
  fusionPanel: FusionPanelState;
  /** Hint for the fusion panel's pending states, mirroring slotHint's
   *  pick-a-second / selection-full wording for balls. */
  fusionHint: string;
  /** The plan screen's state — see PlanState. */
  plan: PlanState;
  /** The balls/passives screens' selection boxes — see SelectionBoxState. */
  selectionBoxes: { balls: SelectionBoxState | null; passives: SelectionBoxState | null };
}
export type Section = 'balls' | 'passives' | 'characters' | 'fusions' | 'plan';
export type Action =
  | { type: 'toggleItem'; id: string }
  | { type: 'toggleChar'; id: string }
  | { type: 'toggleFusion'; id: string }
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
  /** The plan toolbar's Clear button: empties characters, balls, passives
   *  and resets the toggle to its default (on). Nothing else is touched. */
  | { type: 'clearPlan' }
  /** Restore a persisted plan (the island reads localStorage at startup).
   *  Unknown ids and duplicates are filtered; over-limit selections are
   *  kept as-is and marked, not trimmed. */
  | { type: 'hydrate'; plan: PlanSnapshot }
  /** Per-screen search: each section has its own query (own search box),
   *  independent of every other screen's. */
  | { type: 'search'; section: Section; query: string }
  /** Esc / empty-space click: clears the named section's selection only.
   *  The plan section is deliberately not clearable this way (its selection
   *  is deliberate work — only clearPlan wipes it). */
  | { type: 'clear'; section: Section };

/** The selection-toggle actions — exactly the ones the renderer's click
 *  handlers produce and hand back through the build seam's `emit` callback
 *  (the island dispatches them verbatim). ToggleAction is the seam's
 *  currency: emit carries the whole action, so callers never reassemble
 *  it from a type/id pair. */
export type ToggleAction = Extract<
  Action,
  { type: 'toggleItem' | 'toggleChar' | 'toggleFusion' | 'togglePlanItem' | 'togglePlanFusion' | 'toggleUpgrades' }
>;

/** Balls offered by the fusion pick list: all fusable upgrade entities.
 *  Baby Ball is not one (research: it is not an upgrade entity). */
const FUSION_BALLS = fusionBalls();

/** Both max-2 selections (characters, fusion picks) show this when full —
 *  the sticky-toggle semantics are shared, so is the wording. */
const SELECTION_FULL = 'selection full — deselect one first';

/** Slot limits by upgrade state: base game vs end-game upgrades. */
const LIMITS: { on: PlanLimits; off: PlanLimits } = {
  on: { chars: 2, balls: 5, passives: 5 },
  off: { chars: 1, balls: 4, passives: 4 },
};

/** Shared sticky-toggle semantics for characters and fusion picks:
 *  re-clicking a member deselects it; adding past `max` is a no-op — one
 *  must be deselected first. Mutates `list` in place. */
function stickyToggle<T>(list: T[], id: string, max: number, match: (x: T) => boolean, make: () => T | undefined) {
  const idx = list.findIndex(match);
  if (idx >= 0) list.splice(idx, 1);
  else if (list.length < max) {
    const x = make();
    if (x) list.push(x);
  }
}

/** Fused-pair identity: the sorted id pair, so the reverse composition is
 *  the same planned pair. */
const pairKey = (a: string, b: string): string => [a, b].sort().join('+');
const samePair = (p: PlanFused, a: string, b: string): boolean => pairKey(p.a, p.b) === pairKey(a, b);

/** Fusable upgrade entities, indexed once — Baby Ball is not one. */
const FUSABLE = new Set(fusionBalls().map((b) => b.id));
const isFusable = (id: string): boolean => FUSABLE.has(id);

export function createViewState() {
  let selectedId: string | null = null;
  /** Per-screen search queries — each section has its own search box, so
   *  each keeps its own query, independent of every other screen's. The
   *  plan screen has no search box; its key only completes the record. */
  const queries: Record<Section, string> = { balls: '', passives: '', characters: '', fusions: '', plan: '' };
  const selectedChars: Character[] = [];
  /** Fusion picks in selection order, at most 2. */
  const fusionPicks: string[] = [];
  /** The plan's End game upgrades toggle — on by default. */
  let upgradesOn = true;
  /** Plan balls/passives in pick order. The plan's characters are the
   *  shared selectedChars — one selection feeds verdicts, chips, plan. */
  const planBalls: string[] = [];
  const planPassives: string[] = [];
  /** Planned fused pairs in compose order; identity is the sorted id pair. */
  const planFused: PlanFused[] = [];
  /** The limits in force right now — one place, three former call sites. */
  const activeLimits = (): PlanLimits => (upgradesOn ? LIMITS.on : LIMITS.off);

  const derive = (): ViewModel => {
    const tiles = new Map<string, TileState>();
    const charCards = new Map<string, CharCardState>();
    const fusionRows = new Map<string, FusionRowState>();
    const related = selectedId ? highlightSet(selectedId, graphFor(selectedId)) : new Set<string>();
    const ballQ = queries.balls.trim().toLowerCase();
    const passiveQ = queries.passives.trim().toLowerCase();
    const charQ = queries.characters.trim().toLowerCase();
    const fusionQ = queries.fusions.trim().toLowerCase();
    // each namespace filters against its own screen's query — one loop shape,
    // two (collection, query) pairs; the graphs themselves stay separate
    for (const [items, q] of [[BALLS, ballQ], [PASSIVES, passiveQ]] as const) {
      for (const item of items) {
        const v = verdictFor(item, selectedChars);
        tiles.set(item.id, {
          selected: selectedId === item.id,
          related: !!selectedId && selectedId !== item.id && related.has(item.id),
          dimmed: !!selectedId && !related.has(item.id),
          filtered: !!q && !(item.name.toLowerCase().includes(q) || item.effects.toLowerCase().includes(q)),
          verdict: v,
        });
      }
    }
    for (const ch of CHARACTERS) {
      charCards.set(ch.id, {
        selected: selectedChars.some((c) => c.id === ch.id),
        filtered: !!charQ && !(ch.name.toLowerCase().includes(charQ) || ch.quirk.toLowerCase().includes(charQ) || (ch.baseBallId && itemFor(ch.baseBallId)?.name.toLowerCase().includes(charQ) || false)),
      });
    }
    for (const b of FUSION_BALLS) {
      const pick = fusionPicks.indexOf(b.id);
      fusionRows.set(b.id, {
        slot: pick === 0 ? 1 : pick === 1 ? 2 : null,
        filtered: !!fusionQ && !b.name.toLowerCase().includes(fusionQ),
      });
    }
    const a = fusionPicks[0] ? ballMap.get(fusionPicks[0]) : null;
    const b = fusionPicks[1] ? ballMap.get(fusionPicks[1]) : null;
    const ballSlots = planBalls.length + planFused.length;
    const fusionPanel: FusionPanelState = !a
      ? { state: 'empty' }
      : !b
        ? { state: 'pending', first: a }
        : {
            state: 'composed',
            fusion: fuse(a, b),
            a,
            b,
            planned: planFused.some((p) => samePair(p, a.id, b.id)),
            planFull: ballSlots >= activeLimits().balls,
          };
    // The plan: resolved entries in pick order, marked over limit beyond the
    // active section limit (kept, never trimmed). Verdicts ride along so the
    // renderer paints them without re-deriving. Fused pairs count as ONE
    // ball slot each and are marked after the single balls.
    const limits = activeLimits();
    const planBallsState = planBalls.map((id, i) => {
      const item = ballMap.get(id)!;
      return { item, overLimit: i >= limits.balls, verdict: verdictFor(item, selectedChars) };
    });
    const planFusedState = planFused.map(({ a, b }, i) => {
      const ballA = ballMap.get(a)!;
      const ballB = ballMap.get(b)!;
      return {
        a: ballA,
        b: ballB,
        name: fusionName(ballA, ballB),
        overLimit: planBalls.length + i >= limits.balls,
        verdicts: [verdictFor(ballA, selectedChars), verdictFor(ballB, selectedChars)] as [Verdict | null, Verdict | null],
      };
    });
    const planPassivesState = planPassives.map((id, i) => {
      const item = passiveMap.get(id)!;
      return { item, overLimit: i >= limits.passives, verdict: verdictFor(item, selectedChars) };
    });
    const overLimit =
      selectedChars.length > limits.chars ||
      ballSlots > limits.balls ||
      planPassives.length > limits.passives;
    const plan: PlanState = {
      upgradesOn,
      limits,
      counts: { chars: selectedChars.length, balls: ballSlots, passives: planPassives.length },
      characters: selectedChars.map((c, i) => ({ character: c, overLimit: i >= limits.chars })),
      balls: planBallsState,
      passives: planPassivesState,
      fused: planFusedState,
      overLimit,
      hint: overLimit ? 'Over the limit — remove the highlighted picks or re-enable End game upgrades.' : '',
    };
    // The selection boxes: one per item screen, filled only when the
    // selected item lives in that screen's namespace.
    const selected = selectedId ? itemFor(selectedId) : undefined;
    const selectedIsPassive = selected ? isPassive(selected.id) : false;
    const inPlan = selected ? (selectedIsPassive ? planPassives.includes(selected.id) : planBalls.includes(selected.id)) : false;
    const planLabel: SelectionBoxState['plan'] =
      inPlan ? 'remove'
      : (selectedIsPassive ? planPassives.length : ballSlots) >= (selectedIsPassive ? limits.passives : limits.balls) ? 'disabled'
      : 'add';
    const fusionLabel: SelectionBoxState['fusion'] = !selected || selectedIsPassive
      ? null
      : !isFusable(selected.id) ? 'unfusable'
      : fusionPicks.includes(selected.id) ? 'remove'
      : fusionPicks.length >= 2 ? 'disabled'
      : 'add';
    const selectionBoxes: ViewModel['selectionBoxes'] = {
      balls: selected && !isPassive(selected.id) ? { item: selected, plan: planLabel, fusion: fusionLabel } : null,
      passives: selected && isPassive(selected.id) ? { item: selected, plan: planLabel, fusion: fusionLabel } : null,
    };
    return {
      tiles,
      charCards,
      fusionRows,
      selectedChars,
      slotHint:
        selectedChars.length === 0 ? ''
        : selectedChars.length < limits.chars ? 'pick a second character…'
        : SELECTION_FULL,
      fusionPanel,
      fusionHint:
        fusionPicks.length === 0 ? 'Pick two balls to see their fusion.'
        : fusionPicks.length === 1 ? '…pick a second ball.'
        : SELECTION_FULL,
      plan,
      selectionBoxes,
    };
  };

  return {
    /** Verdict for one item against the current selection — the toast needs
     *  the full verdict (note included), not just the tile's badge color. */
    verdictFor(item: Item) {
      return verdictFor(item, selectedChars);
    },
    /** The plan as bare ids — the island's persistence currency (saved to
     *  localStorage, fed back through `hydrate`). Lives here so the island
     *  never re-extracts ids from the resolved view model. */
    planSnapshot(): PlanSnapshot {
      return {
        upgradesOn,
        chars: selectedChars.map((c) => c.id),
        balls: [...planBalls],
        passives: [...planPassives],
        fused: planFused.map((p) => ({ ...p })),
      };
    },
    /** Current view model without a state change — initial paint. */
    derive(): ViewModel {
      return derive();
    },
    dispatch(action: Action): ViewModel {
      switch (action.type) {
        case 'toggleItem': selectedId = selectedId === action.id ? null : action.id; break;
        // Character slots and fusion picks share stickyToggle's sticky
        // semantics (re-click deselects; adding past the limit is a no-op).
        // The character limit rides the plan's upgrade toggle.
        case 'toggleChar':
          stickyToggle(selectedChars, action.id, activeLimits().chars,
            (c) => c.id === action.id, () => CHARACTERS.find((c) => c.id === action.id));
          break;
        case 'toggleFusion':
          stickyToggle(fusionPicks, action.id, 2, (id) => id === action.id, () => action.id);
          break;
        // Plan membership: the catalog decides the namespace (and rejects
        // unknown ids); re-click removes, adding past the active limit is a
        // no-op. Removal is always allowed — even over-limit entries.
        // Fused pairs count as ball slots, so the ball limit is shared.
        case 'togglePlanItem': {
          if (!itemFor(action.id)) break;
          const passive = isPassive(action.id);
          const limits = activeLimits();
          const list = passive ? planPassives : planBalls;
          const idx = list.indexOf(action.id);
          if (idx >= 0) list.splice(idx, 1);
          else if (list.length < (passive ? limits.passives : limits.balls - planFused.length)) list.push(action.id);
          break;
        }
        // Fused-pair plan membership: identity is order-insensitive (the
        // reverse composition toggles the same pair); adding past the ball
        // limit is a no-op. Compose order is kept for display.
        case 'togglePlanFusion': {
          const limits = activeLimits();
          const idx = planFused.findIndex((p) => samePair(p, action.a, action.b));
          if (idx >= 0) planFused.splice(idx, 1);
          else if (planBalls.length + planFused.length < limits.balls) planFused.push({ a: action.a, b: action.b });
          break;
        }
        case 'toggleUpgrades': upgradesOn = !upgradesOn; break;
        case 'clearPlan':
          selectedChars.length = 0;
          planBalls.length = 0;
          planPassives.length = 0;
          planFused.length = 0;
          upgradesOn = true;
          break;
        case 'hydrate': {
          upgradesOn = action.plan.upgradesOn;
          selectedChars.length = 0;
          for (const id of action.plan.chars) {
            const ch = CHARACTERS.find((c) => c.id === id);
            if (ch && !selectedChars.some((c) => c.id === id)) selectedChars.push(ch);
          }
          planBalls.length = 0;
          for (const id of action.plan.balls) if (ballMap.has(id) && !planBalls.includes(id)) planBalls.push(id);
          planPassives.length = 0;
          for (const id of action.plan.passives) if (passiveMap.has(id) && !planPassives.includes(id)) planPassives.push(id);
          planFused.length = 0;
          for (const p of action.plan.fused ?? []) {
            // both sides must be real, distinct, fusable balls; identity
            // (sorted pair) dedupes — over-limit pairs are kept, not trimmed
            if (
              ballMap.has(p.a) && ballMap.has(p.b) && p.a !== p.b &&
              isFusable(p.a) && isFusable(p.b) &&
              !planFused.some((q) => samePair(q, p.a, p.b))
            ) planFused.push({ a: p.a, b: p.b });
          }
          break;
        }
        case 'search': queries[action.section] = action.query; break;
        case 'clear':
          if (action.section === 'balls' || action.section === 'passives') selectedId = null;
          else if (action.section === 'characters') selectedChars.length = 0;
          else if (action.section === 'fusions') fusionPicks.length = 0;
          // 'plan' is not clearable via the section-scoped clear — the plan
          // is deliberate work; only clearPlan wipes it.
          break;
      }
      return derive();
    },
  };
}
