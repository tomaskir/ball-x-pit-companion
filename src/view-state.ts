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
// the named state and paints. That panel derivation (the 3-state machine,
// order presentation, and hint) lives in src/fusion-panel.ts; this module
// hands it the picks and the plan facts and embeds the result. The plan
// rides vm.plan the same way — its state and derivation live in
// src/plan-state.ts (PlanState: resolved
// entries, verdicts, limits, over-limit marks); this module forwards the
// plan actions to it and embeds the result in the ViewModel, handing the
// shared selectedChars in on every derive. The persistence currency is
// src/plan-codec.ts's SharedSnapshot: this module owns the chars half and
// restores it on hydrate; plan-state owns the plan half.
import { BALLS } from './data/balls';
import { PASSIVES } from './data/passives';
import { CHARACTERS, type Character } from './data/characters';
import { highlightSet } from './graph';
import { isPassive, itemFor, graphFor } from './catalog';
import { deriveBuildGraphView, type BuildGraphViewState } from './build-graph';
import { fusionBalls, isFusable } from './fusion';
import { deriveFusionPanel, type FusionPanelState } from './fusion-panel';
import { createPickList } from './pick-list';
import { verdictFor, type Item, type Verdict } from './synergy';
import { createPlanState } from './plan-state';
import type { PlanAction, PlanLimits, PlanState } from './plan-state';
import type { SharedSnapshot } from './plan-codec';

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
  selectedChars: readonly Character[];
  /** Hint for the character screen: "pick a second character…" while one is
   *  held and two are allowed, "selection full — deselect one first" when at
   *  the active limit. */
  slotHint: string;
  /** The fusion screen's panel state — see FusionPanelState (derived in
   *  src/fusion-panel.ts). */
  fusionPanel: FusionPanelState;
  /** Hint for the fusion panel's pending states, mirroring slotHint's
   *  pick-a-second / selection-full wording for balls — derived in
   *  src/fusion-panel.ts too. */
  fusionHint: string;
  /** The plan screen's state — see PlanState (src/plan-state.ts). */
  plan: PlanState;
  /** The plan screen's build graphs — see BuildGraphViewState. */
  buildGraph: BuildGraphViewState;
  /** The balls/passives screens' selection boxes — see SelectionBoxState. */
  selectionBoxes: { balls: SelectionBoxState | null; passives: SelectionBoxState | null };
}
// The build-graph view type is build-graph.ts's; the ViewModel's
// `buildGraph` field imports it from there.
export type Section = 'balls' | 'passives' | 'characters' | 'fusions' | 'plan';
export type Action =
  | { type: 'toggleItem'; id: string }
  | { type: 'toggleChar'; id: string }
  | { type: 'toggleFusion'; id: string }
  /** Reverse the two fusion picks (a,b → b,a) and recompute the panel. */
  | { type: 'swapFusion' }
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
  /** Mark/unmark a build-graph node as done this run (the green check):
   *  the node stops contributing demand to everything it is built from. */
  | { type: 'toggleGraphDone'; id: string }
  // The plan's actions, forwarded verbatim to the plan state
  // (src/plan-state.ts) — same members, same shapes as before the
  // extraction; see PlanAction there for the per-action contracts.
  // `hydrate` is the exception: the island hands the whole SharedSnapshot
  // (plan + chars) and view-state splits it — the plan half goes to
  // plan-state, the chars half is restored here.
  | Exclude<PlanAction, { type: 'hydrate' }>
  | { type: 'hydrate'; shared: SharedSnapshot };

/** The actions the renderer's click handlers produce and hand back through
 *  the build seam's `emit` callback (the island dispatches them verbatim).
 *  Most are selection toggles; `swapFusion` is the fusion order swap.
 *  ToggleAction is the seam's currency: emit carries the whole action, so
 *  callers never reassemble it from a type/id pair. (`toggleUpgrades` is not
 *  one: its toggle is static shell markup the island wires directly, like
 *  Clear and Share.) */
export type ToggleAction = Extract<
  Action,
  { type: 'toggleItem' | 'toggleChar' | 'toggleFusion' | 'swapFusion' | 'togglePlanItem' | 'togglePlanFusion' | 'toggleGraphFocus' | 'toggleGraphCollapse' | 'toggleGraphDone' }
>;

/** Balls offered by the fusion pick list: all fusable upgrade entities.
 *  Baby Ball is not one (research: it is not an upgrade entity). */
const FUSION_BALLS = fusionBalls();

/** Both max-2 selections (characters, fusion picks) show this when full —
 *  the sticky-toggle semantics are shared, so is the wording. The fusion
 *  panel keeps the same literal in src/fusion-panel.ts (its hint is derived
 *  there); the two are pinned by tests. */
const SELECTION_FULL = 'selection full — deselect one first';

/** The held character whose partners are Matchmaker-blocked: exactly one
 *  character held and two allowed. Null otherwise (0 or 2 held, or limit 1
 *  — no second pick exists to block). One definition for the card state and
 *  the toggle guard, so the two cannot drift. */
const blockedPartner = (chars: readonly Character[], limits: PlanLimits): Character | null =>
  chars.length === 1 && limits.chars > 1 ? chars[0] : null;

export function createViewState() {
  let selectedId: string | null = null;
  /** Per-screen search queries — each section has its own search box, so
   *  each keeps its own query, independent of every other screen's. The
   *  plan screen has no search box; its key only completes the record. */
  const queries: Record<Section, string> = { balls: '', passives: '', characters: '', fusions: '', plan: '' };
  /** The plan's state — upgrade toggle, planned balls/passives/fused pairs,
   *  and the PlanState derivation. The plan's characters are the shared
   *  selectedChars below: handed in on every derive/snapshot, cleared by
   *  clearPlan here (plan-state never mutates them). */
  const plan = createPlanState();
  /** The character slots and fusion picks are pick lists (src/pick-list.ts):
   *  the sticky toggle, capacity guard, and resolution guard live there.
   *  Unknown character ids are rejected; so are unknown and non-fusable ball
   *  ids (Baby Ball is not a fusion pick). */
  const selectedChars = createPickList<Character, string>({
    resolve: (id) => CHARACTERS.find((c) => c.id === id),
    key: (c) => c.id,
    hasRoom: (list) => list.length < plan.limits().chars,
  });
  /** Fusion picks in selection order, at most 2. */
  const fusionPicks = createPickList<string, string>({
    resolve: (id) => (isFusable(id) ? id : undefined),
    key: (id) => id,
    hasRoom: (list) => list.length < 2,
  });
  /** The build graph's focused node (null = none), the two panels' collapsed
   *  flags, and the done marks (nodes the player has already built this run)
   *  — session-only UI state, not part of the plan snapshot. */
  let graphFocus: string | null = null;
  const graphCollapsed = { balls: false, passives: false };
  const graphDone = new Set<string>();

  const derive = (): ViewModel => {
    const tiles = new Map<string, TileState>();
    const charCards = new Map<string, CharCardState>();
    const fusionRows = new Map<string, FusionRowState>();
    const chars = selectedChars.list();
    const picks = fusionPicks.list();
    const related = selectedId ? highlightSet(selectedId, graphFor(selectedId)) : new Set<string>();
    const ballQ = queries.balls.trim().toLowerCase();
    const passiveQ = queries.passives.trim().toLowerCase();
    const charQ = queries.characters.trim().toLowerCase();
    const fusionQ = queries.fusions.trim().toLowerCase();
    // each namespace filters against its own screen's query — one loop shape,
    // two (collection, query) pairs; the graphs themselves stay separate
    for (const [items, q] of [[BALLS, ballQ], [PASSIVES, passiveQ]] as const) {
      for (const item of items) {
        const v = verdictFor(item, chars);
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
    const planState = plan.derive(chars);
    const limits = planState.limits;
    const held = blockedPartner(chars, limits);
    for (const ch of CHARACTERS) {
      const blocked = !!held && ch.cannotPair.includes(held.id);
      charCards.set(ch.id, {
        selected: selectedChars.has(ch.id),
        filtered: !!charQ && !(ch.name.toLowerCase().includes(charQ) || ch.quirk.toLowerCase().includes(charQ) || (ch.baseBallId && itemFor(ch.baseBallId)?.name.toLowerCase().includes(charQ) || false)),
        blocked,
        blockedBy: blocked ? held!.name : null,
      });
    }
    for (const b of FUSION_BALLS) {
      const pick = picks.indexOf(b.id);
      fusionRows.set(b.id, {
        slot: pick === 0 ? 1 : pick === 1 ? 2 : null,
        filtered: !!fusionQ && !b.name.toLowerCase().includes(fusionQ),
      });
    }
    // The fusion panel and its hint are derived in src/fusion-panel.ts from
    // the pick order plus the plan facts this screen hands in — the panel's
    // 3-state machine, order presentation, and hint live there, not here.
    const { panel: fusionPanel, hint: fusionHint } = deriveFusionPanel(picks, {
      hasPair: (x, y) => plan.hasPair(x, y),
      ballSlots: { used: planState.counts.balls, capacity: planState.limits.balls },
    });
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
      : fusionPicks.has(selected.id) ? 'remove'
      : picks.length >= 2 ? 'disabled'
      : 'add';
    const selectionBoxes: ViewModel['selectionBoxes'] = {
      balls: selected && !isPassive(selected.id) ? { item: selected, plan: planLabel, fusion: fusionLabel } : null,
      passives: selected && isPassive(selected.id) ? { item: selected, plan: planLabel, fusion: fusionLabel } : null,
    };
    // The build graphs: src/build-graph.ts's deriveBuildGraphView owns the
    // graph's inputs — targets (including Evolves-instead resolution), both
    // namespace graphs, layout, focus validation, the related-set walk, and
    // the row model. This module only hands in the plan state and the
    // session-only graph UI state, then embeds the result.
    const buildGraph = deriveBuildGraphView(planState, {
      focus: graphFocus,
      done: graphDone,
      collapsed: graphCollapsed,
    });
    return {
      tiles,
      charCards,
      fusionRows,
      selectedChars: chars,
      slotHint:
        chars.length === 0 ? ''
        : chars.length < limits.chars ? 'pick a second character…'
        : SELECTION_FULL,
      fusionPanel,
      fusionHint,
      plan: planState,
      buildGraph,
      selectionBoxes,
    };
  };

  return {
    /** Verdict for one item against the current selection — the toast needs
     *  the full verdict (note included), not just the tile's badge color. */
    verdictFor(item: Item) {
      return verdictFor(item, selectedChars.list());
    },
    /** The transport currency — the plan's own fields plus the shared
     *  selection — the island saves to localStorage and encodes into share
     *  links. Each module supplies its half, so the island never re-extracts
     *  ids from the resolved view model. */
    sharedSnapshot(): SharedSnapshot {
      return { plan: plan.snapshot(), chars: selectedChars.list().map((c) => c.id) };
    },
    /** Current view model without a state change — initial paint. */
    derive(): ViewModel {
      return derive();
    },
    dispatch(action: Action): ViewModel {
      switch (action.type) {
        case 'toggleItem': selectedId = selectedId === action.id ? null : action.id; break;
        // Character slots and fusion picks are pick lists (src/pick-list.ts):
        // sticky semantics (re-click deselects; adding past the limit is a
        // no-op) and resolution (unknown ids rejected) live there. The
        // character limit rides the plan's upgrade toggle. Matchmaker pairing
        // restrictions (game data) block a forbidden second pick — the game
        // darkens them; here the toggle is a no-op.
        case 'toggleChar': {
          const held = blockedPartner(selectedChars.list(), plan.limits());
          if (held && held.id !== action.id && held.cannotPair.includes(action.id)) break;
          selectedChars.toggle(action.id);
          break;
        }
        case 'toggleFusion':
          fusionPicks.toggle(action.id);
          break;
        // Swap the two picks: the compose order is the first-pick precedence
        // order, so reversing it recomputes the resolved panel. A no-op with
        // fewer than two picks (nothing to swap).
        case 'swapFusion':
          fusionPicks.restore([...fusionPicks.list()].reverse());
          break;
        // Plan actions forward verbatim to the plan state. clearPlan also
        // clears the shared selectedChars — they are the plan's characters,
        // and view-state owns them.
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
        case 'toggleGraphDone':
          if (graphDone.has(action.id)) graphDone.delete(action.id);
          else graphDone.add(action.id);
          break;
        case 'clearPlan':
          plan.dispatch(action);
          selectedChars.restore([]);
          graphDone.clear(); // a wiped plan has nothing left to track
          break;
        // The island hands the whole SharedSnapshot; each module restores
        // its own half — the plan fields go to plan-state, the shared
        // selection is restored here (view-state owns it).
        case 'hydrate':
          plan.dispatch({ type: 'hydrate', plan: action.shared.plan });
          selectedChars.restore(action.shared.chars);
          break;
        case 'search': queries[action.section] = action.query; break;
        case 'clear':
          if (action.section === 'balls' || action.section === 'passives') selectedId = null;
          else if (action.section === 'characters') selectedChars.restore([]);
          else if (action.section === 'fusions') fusionPicks.restore([]);
          // 'plan' is not clearable via the section-scoped clear — the plan
          // is deliberate work; only clearPlan wipes it.
          break;
      }
      return derive();
    },
  };
}
