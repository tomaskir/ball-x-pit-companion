// View-state module: the island's state (item selection, character slots,
// fusion picks, per-screen search queries) and every derivation the island
// used to hand-wire between its event handlers. One interface:
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
// the named state and paints. The plan rides vm.plan the same way — its
// state and derivation live in src/plan-state.ts (PlanState: resolved
// entries, verdicts, limits, over-limit marks); this module forwards the
// plan actions to it and embeds the result in the ViewModel, handing the
// shared selectedChars in on every derive/snapshot. The plan types are
// re-exported here so companion.ts and share.ts keep their import paths.
import { BALLS, type Ball } from './data/balls';
import { PASSIVES } from './data/passives';
import { CHARACTERS, type Character } from './data/characters';
import { highlightSet, closure, union } from './graph';
import { ballMap, isPassive, itemFor, graphFor, passiveMap } from './catalog';
import { deriveBuildGraph, layoutBuildGraph, FUSION_ID_PREFIX, type BuildGraphLayout } from './build-graph';
import { fusionBalls, fuse, evolvesInstead, type FusionResult } from './fusion';
import { verdictFor, type Item, type Verdict } from './synergy';
import { createPlanState, stickyToggle, hydrateList, isFusable } from './plan-state';
import type { PlanAction, PlanLimits, PlanState, PlanSnapshot } from './plan-state';

// The plan's types are plan-state's — re-exported so existing import paths
// (companion.ts, share.ts) keep working. Types only: plan-state must never
// be imported *by* view-state's consumers at runtime through here.
export type { PlanAction, PlanBallEntry, PlanCharState, PlanEntryState, PlanFused, PlanFusedState, PlanLimits, PlanSnapshot, PlanState } from './plan-state';

export interface TileState { selected: boolean; related: boolean; dimmed: boolean; filtered: boolean; verdict: Verdict | null; }
/** One character card. `blocked` is a Matchmaker pairing restriction (game
 *  data): with exactly one character held (and two allowed), a forbidden
 *  partner is blocked — selecting it is a no-op. `blockedBy` names the held
 *  character for the tooltip; null when not blocked. */
export interface CharCardState { selected: boolean; filtered: boolean; blocked: boolean; blockedBy: string | null; }
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
  /** The plan screen's state — see PlanState (src/plan-state.ts). */
  plan: PlanState;
  /** The plan screen's build graphs — see BuildGraphViewState. */
  buildGraph: BuildGraphViewState;
  /** The balls/passives screens' selection boxes — see SelectionBoxState. */
  selectionBoxes: { balls: SelectionBoxState | null; passives: SelectionBoxState | null };
}
/** The Plan screen's build graphs: one laid-out model per namespace (balls
 *  with a fusion row, passives without — the graphs stay strictly separate),
 *  the focused node id (null = nothing focused), the related set the
 *  renderer lights for it (the focus plus its full upstream AND downstream
 *  chains — for a fusion node, the pair balls and their ancestries), and
 *  the session-only collapsed flags for the two panels. */
export interface BuildGraphViewState {
  balls: BuildGraphLayout;
  passives: BuildGraphLayout;
  focus: string | null;
  related: Set<string>;
  collapsed: { balls: boolean; passives: boolean };
}
export type Section = 'balls' | 'passives' | 'characters' | 'fusions' | 'plan';
export type Action =
  | { type: 'toggleItem'; id: string }
  | { type: 'toggleChar'; id: string }
  | { type: 'toggleFusion'; id: string }
  /** Per-screen search: each section has its own query (own search box),
   *  independent of every other screen's. */
  | { type: 'search'; section: Section; query: string }
  /** Esc / empty-space click: clears the named section's selection only.
   *  The plan section is deliberately not clearable this way (its selection
   *  is deliberate work — only clearPlan wipes it). */
  | { type: 'clear'; section: Section }
  /** The plan screen's build graph: focus (or unfocus) a node — the graph's
   *  highlight. The id is a catalog id or a `fusion:`-prefixed pair node. */
  | { type: 'toggleGraphFocus'; id: string }
  /** Collapse/expand one of the plan screen's build-graph panels. */
  | { type: 'toggleGraphCollapse'; which: 'balls' | 'passives' }
  // The plan's actions, forwarded verbatim to the plan state
  // (src/plan-state.ts) — same members, same shapes as before the
  // extraction; see PlanAction there for the per-action contracts.
  | PlanAction;

/** The selection-toggle actions — exactly the ones the renderer's click
 *  handlers produce and hand back through the build seam's `emit` callback
 *  (the island dispatches them verbatim). ToggleAction is the seam's
 *  currency: emit carries the whole action, so callers never reassemble
 *  it from a type/id pair. (`toggleUpgrades` is not one: its toggle is
 *  static shell markup the island wires directly, like Clear and Share.) */
export type ToggleAction = Extract<
  Action,
  { type: 'toggleItem' | 'toggleChar' | 'toggleFusion' | 'togglePlanItem' | 'togglePlanFusion' | 'toggleGraphFocus' | 'toggleGraphCollapse' }
>;

/** Balls offered by the fusion pick list: all fusable upgrade entities.
 *  Baby Ball is not one (research: it is not an upgrade entity). */
const FUSION_BALLS = fusionBalls();

/** Both max-2 selections (characters, fusion picks) show this when full —
 *  the sticky-toggle semantics are shared, so is the wording. */
const SELECTION_FULL = 'selection full — deselect one first';

/** The held character whose partners are Matchmaker-blocked: exactly one
 *  character held and two allowed. Null otherwise (0 or 2 held, or limit 1
 *  — no second pick exists to block). One definition for the card state and
 *  the toggle guard, so the two cannot drift. */
const blockedPartner = (chars: Character[], limits: PlanLimits): Character | null =>
  chars.length === 1 && limits.chars > 1 ? chars[0] : null;

export function createViewState() {
  let selectedId: string | null = null;
  /** Per-screen search queries — each section has its own search box, so
   *  each keeps its own query, independent of every other screen's. The
   *  plan screen has no search box; its key only completes the record. */
  const queries: Record<Section, string> = { balls: '', passives: '', characters: '', fusions: '', plan: '' };
  const selectedChars: Character[] = [];
  /** Fusion picks in selection order, at most 2. */
  const fusionPicks: string[] = [];
  /** The build graph's focused node (null = none) and the two panels'
   *  collapsed flags — session-only UI state, not part of the plan
   *  snapshot. */
  let graphFocus: string | null = null;
  const graphCollapsed = { balls: false, passives: false };
  /** The plan's state — upgrade toggle, planned balls/passives/fused pairs,
   *  and the PlanState derivation. The plan's characters are the shared
   *  selectedChars above: handed in on every derive/snapshot, cleared by
   *  clearPlan here (plan-state never mutates them). */
  const plan = createPlanState();

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
    // Matchmaker pairing restrictions: with exactly one character held (and
    // two allowed), forbidden partners are blocked — the game darkens them
    // on the select screen. With 0 or 2 held nothing is blocked.
    const planState = plan.derive(selectedChars);
    const limits = planState.limits;
    const held = blockedPartner(selectedChars, limits);
    for (const ch of CHARACTERS) {
      const blocked = !!held && ch.cannotPair.includes(held.id);
      charCards.set(ch.id, {
        selected: selectedChars.some((c) => c.id === ch.id),
        filtered: !!charQ && !(ch.name.toLowerCase().includes(charQ) || ch.quirk.toLowerCase().includes(charQ) || (ch.baseBallId && itemFor(ch.baseBallId)?.name.toLowerCase().includes(charQ) || false)),
        blocked,
        blockedBy: blocked ? held!.name : null,
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
    const fusionPanel: FusionPanelState = !a
      ? { state: 'empty' }
      : !b
        ? { state: 'pending', first: a }
        : {
            state: 'composed',
            fusion: fuse(a, b),
            a,
            b,
            planned: plan.hasPair(a.id, b.id),
            planFull: planState.counts.balls >= planState.limits.balls,
          };
    // The selection boxes: one per item screen, filled only when the
    // selected item lives in that screen's namespace. Plan membership and
    // capacity are queried from the plan state (has / counts / limits) —
    // never read from its internals.
    const selected = selectedId ? itemFor(selectedId) : undefined;
    const selectedIsPassive = selected ? isPassive(selected.id) : false;
    const inPlan = selected ? plan.has(selected.id) : false;
    const planLabel: SelectionBoxState['plan'] =
      inPlan ? 'remove'
      : (selectedIsPassive ? planState.counts.passives : planState.counts.balls) >= (selectedIsPassive ? limits.passives : limits.balls) ? 'disabled'
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
    // The build graphs: targets are the plan's kept (non-over-limit)
    // entries — over-limit and everything else the plan merely marks stays
    // out of the picture. A planned pair that Evolves instead of Fusing is
    // just a way of building the evolved ball, so it becomes a single
    // target of the result (deduped against a directly planned single by
    // the derivation's id set).
    const ballTargets = { singles: [] as string[], pairs: [] as { a: string; b: string }[] };
    for (const e of planState.balls) {
      if (e.overLimit) continue;
      if (e.kind === 'single') ballTargets.singles.push(e.item.id);
      else {
        const evo = evolvesInstead(e.a, e.b);
        if (evo) ballTargets.singles.push(evo.id);
        else ballTargets.pairs.push({ a: e.a.id, b: e.b.id });
      }
    }
    const passiveTargets = {
      singles: planState.passives.filter((e) => !e.overLimit).map((e) => e.item.id),
      pairs: [] as { a: string; b: string }[],
    };
    const ballsGraph = layoutBuildGraph(deriveBuildGraph(ballTargets, ballMap, { fusionRow: true }), 4);
    const passivesGraph = layoutBuildGraph(deriveBuildGraph(passiveTargets, passiveMap, { fusionRow: false }), 3);
    // Focus highlight: the focused node plus its full upstream AND downstream
    // chains in its own namespace (a base ball has no upstream, a fusion no
    // downstream — "both directions" covers both). A fusion node lights its
    // pair balls and their ancestries; a lit ball rides its fusion nodes in.
    let focus = graphFocus;
    if (focus && ![...ballsGraph.nodes, ...passivesGraph.nodes].some((n) => n.id === focus)) focus = null;
    const graphRelated = new Set<string>();
    if (focus) {
      if (focus.startsWith(FUSION_ID_PREFIX)) {
        const [a, b] = focus.slice(FUSION_ID_PREFIX.length).split('+');
        graphRelated.add(focus);
        graphRelated.add(a);
        graphRelated.add(b);
        for (const id of closure([a, b], ballMap, false)) graphRelated.add(id);
      } else {
        const g = graphFor(focus);
        for (const id of union(closure([focus], g, false), closure([focus], g, true))) graphRelated.add(id);
        graphRelated.add(focus);
        for (const n of ballsGraph.nodes) {
          if (n.row !== 3) continue;
          const [a, b] = n.id.slice(FUSION_ID_PREFIX.length).split('+');
          if (graphRelated.has(a) || graphRelated.has(b)) graphRelated.add(n.id);
        }
      }
    }
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
      plan: planState,
      buildGraph: { balls: ballsGraph, passives: passivesGraph, focus, related: graphRelated, collapsed: { ...graphCollapsed } },
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
     *  localStorage, fed back through `hydrate`). The plan state serializes
     *  it from its own lists plus the shared selection, so the island never
     *  re-extracts ids from the resolved view model. */
    planSnapshot(): PlanSnapshot {
      return plan.snapshot(selectedChars);
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
        // The character limit rides the plan's upgrade toggle. Matchmaker
        // pairing restrictions (game data) block a forbidden second pick —
        // the game darkens them; here the toggle is a no-op.
        case 'toggleChar': {
          const held = blockedPartner(selectedChars, plan.limits());
          if (held && held.id !== action.id && held.cannotPair.includes(action.id)) break;
          stickyToggle(selectedChars, (list) => list.length < plan.limits().chars,
            (c) => c.id === action.id, () => CHARACTERS.find((c) => c.id === action.id));
          break;
        }
        case 'toggleFusion':
          stickyToggle(fusionPicks, (list) => list.length < 2, (id) => id === action.id, () => action.id);
          break;
        // Plan actions forward verbatim to the plan state. clearPlan also
        // clears the shared selectedChars — they are the plan's characters,
        // and view-state owns them. hydrate's chars field is restored here
        // for the same reason; plan-state ignores it.
        case 'togglePlanItem':
        case 'togglePlanFusion':
        case 'toggleUpgrades':
          plan.dispatch(action);
          break;
        // Build-graph UI state: focus toggles (re-click clears); a stale
        // focus (its node left the graph) simply highlights nothing. The
        // collapsed flags are session-only — never persisted.
        case 'toggleGraphFocus':
          graphFocus = graphFocus === action.id ? null : action.id;
          break;
        case 'toggleGraphCollapse':
          graphCollapsed[action.which] = !graphCollapsed[action.which];
          break;
        case 'clearPlan':
          plan.dispatch(action);
          selectedChars.length = 0;
          break;
        case 'hydrate':
          plan.dispatch(action);
          hydrateList(selectedChars, action.plan.chars,
            (id) => CHARACTERS.find((c) => c.id === id), (c) => c.id);
          break;
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
