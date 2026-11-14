// View-state module: the island's state (item selection, character slots,
// fusion picks, per-screen search queries, the content filter's enabled
// editions) and every derivation the island used to hand-wire between its
// event handlers. One interface: dispatch(action) → ViewModel — 'clear' is
// section-scoped (the active section's selection only; the plan is excluded
// — it is deliberate work, only clearPlan wipes it); selections from
// different screens coexist, so tab switching dispatches nothing. Search is
// per screen: each section has its own query (own search box), independent
// of every other screen's.
//
// The edition filter is content visibility, not a game-version switch:
// toggling an edition off drops every hidden entry (selected characters,
// fusion picks, plan entries, fused pairs) and reports the loss count;
// re-enabling restores nothing. The ViewModel carries the per-item hidden
// flags, the edition-filtered collections, and each item's surviving
// recipes, so the renderer never re-derives the gate. Passive availability
// (src/passive-availability.ts) rides each passive tile too — dimmed, never
// hidden, with the character-specific badge and the reason — and the
// selection box carries the unavailable-passive reason that disables its
// plan button.
// The island (src/companion.ts) keeps only composition, hash routing, and
// plan persistence; the static-shell wiring lives in src/shell.ts and
// painting lives in src/renderer.ts. Fusion
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
// src/plan-codec.ts's SharedSnapshot: this module owns the chars and editions
// halves and restores them on hydrate; plan-state owns the plan half.
import { BALLS, type Ball } from './data/balls';
import { PASSIVES, type Passive } from './data/passives';
import { CHARACTERS, type Character } from './data/characters';
import { type Edition } from './data/editions';
import {
  DEFAULT_EDITIONS,
  availableRecipes as filterRecipes,
  canonicalEditions,
  gatedGraph,
  isEditionEnabled,
  visibleItems,
} from './edition-gate';
import { highlightSet } from './graph';
import { ballMap, passiveMap, isPassive, itemFor } from './catalog';
import { deriveBuildGraphView, type BuildGraphViewState } from './build-graph';
import { fusionBalls, isFusable } from './fusion';
import { deriveFusionPanel, type FusionPanelState } from './fusion-panel';
import { createPickList } from './pick-list';
import { passiveAvailability, type PassiveAvailability } from './passive-availability';
import { verdictFor, type Item, type Verdict } from './synergy';
import { createPlanState } from './plan-state';
import type { PlanAction, PlanLimits, PlanState } from './plan-state';
import type { SharedSnapshot } from './plan-codec';

export interface TileState {
  selected: boolean;
  related: boolean;
  dimmed: boolean;
  filtered: boolean;
  hidden: boolean;
  verdict: Verdict | null;
  /** Passive availability under the selected characters: dimmed (not hidden)
   *  and, for character-locked passives, badged. Null for balls and for
   *  edition-hidden content (the filter runs first). */
  availability: PassiveAvailability | null;
}
/** One character card. `blocked` is a Matchmaker pairing restriction (game
 *  data): with exactly one character held (and two allowed), a forbidden
 *  partner is blocked — selecting it is a no-op. `blockedBy` names the held
 *  character for the tooltip; null when not blocked. `hidden` is the edition
 *  filter — hidden content is not painted, not dimmed. */
export interface CharCardState { selected: boolean; filtered: boolean; hidden: boolean; blocked: boolean; blockedBy: string | null; }
/** Pick state of one ball row on the fusion screen: slot = pick order (1
 *  first, 2 second), null when not picked. Baby Ball is not a fusable
 *  upgrade entity and is excluded from the list. `hidden` is the edition
 *  filter. */
export interface FusionRowState { slot: 1 | 2 | null; filtered: boolean; hidden: boolean; }
/** The balls/passives screens' selection box: the currently selected item
 *  (null = no box on that screen) and the label states for its buttons —
 *  derived here so the renderer only paints. `plan`/`fusion` label kinds:
 *  add / remove (toggle) / disabled (at limit or, for fusion, picks full) /
 *  unfusable (Baby Ball). `fusion` is null where there is no fusion button
 *  (passives). */
export interface SelectionBoxState {
  item: Item;
  plan: 'add' | 'remove' | 'disabled';
  /** Why the plan button is disabled (passive unavailable vs. capacity);
   *  null when enabled. The renderer falls back to the limit copy. */
  planReason: string | null;
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
  /** The content filter's enabled editions, in vocabulary order. */
  enabledEditions: readonly Edition[];
  /** Entries the last action removed because the edition filter hid them
   *  (selected characters, fusion picks, plan entries, fused pairs). 0 when
   *  nothing was dropped — the loss notice's count; it clears on the next
   *  action. */
  editionDroppedCount: number;
  /** Edition-filtered collections for every screen — the renderer paints
   *  these instead of re-deriving the gate. */
  visible: {
    balls: Ball[];
    passives: Passive[];
    characters: Character[];
    fusionBalls: Ball[];
  };
  /** Per-item recipes whose components are all enabled (the catalog's recipe
   *  notation and the build graph consume these; a recipe with a hidden
   *  component disappears while the item stays). Keyed by catalog id. */
  availableRecipes: Map<string, string[][]>;
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
  /** Toggle one edition in the content filter. Turning an edition off drops
   *  every hidden entry (selected characters, fusion picks, plan entries,
   *  fused pairs) and reports the loss count; turning it back on restores
   *  nothing. */
  | { type: 'toggleEdition'; edition: Edition }
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
  /** Restore the whole transport snapshot (plan + chars + editions). The
   *  editions are applied first, then the plan and chars are restored, then
   *  the same drop invariant runs — entries the share's own editions hide
   *  are dropped. `notify` is true for a share restore: the loss notice fires
   *  then, but not on a plain startup restore. */
  | { type: 'hydrate'; shared: SharedSnapshot; notify?: boolean };

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

export interface ViewStateOptions {
  /** The editions to start with (the island passes the restored filter).
   *  Omitted → the default, base-game only. An explicit empty list is valid
   *  (both checkboxes unchecked). */
  editions?: readonly Edition[];
}

export function createViewState({ editions }: ViewStateOptions = {}) {
  let selectedId: string | null = null;
  /** The content filter. Canonical vocabulary order; an empty list is a
   *  valid "nothing enabled" state. */
  let enabledEditions: Edition[] =
    editions === undefined ? [...DEFAULT_EDITIONS] : canonicalEditions(editions);
  /** Entries the last action dropped by the edition filter — the loss
   *  notice's count, reset at the start of every dispatch. */
  let editionDroppedCount = 0;
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

  /** Enforce the filter's no-hidden-live-state invariant: drop selected
   *  characters, fusion picks, plan entries, and fused pairs whose edition is
   *  disabled. Returns the number of entries removed (a fused pair counts
   *  once; the transient catalog selection is dropped silently). Re-enabling
   *  an edition never restores anything. */
  const dropHiddenEntries = (): number => {
    let dropped = 0;
    const visible = (entity: { edition: Edition }): boolean => isEditionEnabled(enabledEditions, entity.edition);

    const charsBefore = selectedChars.list();
    selectedChars.restore(charsBefore.filter(visible).map((character) => character.id));
    dropped += charsBefore.length - selectedChars.list().length;

    const picksBefore = fusionPicks.list();
    fusionPicks.restore(
      picksBefore.filter((id) => {
        const ball = ballMap.get(id);
        return ball !== undefined && visible(ball);
      }),
    );
    dropped += picksBefore.length - fusionPicks.list().length;

    dropped += plan.dropHidden(enabledEditions);

    if (selectedId) {
      const selected = itemFor(selectedId);
      if (!selected || !visible(selected)) selectedId = null;
    }
    return dropped;
  };

  const derive = (): ViewModel => {
    const tiles = new Map<string, TileState>();
    const charCards = new Map<string, CharCardState>();
    const fusionRows = new Map<string, FusionRowState>();
    const chars = selectedChars.list();
    const picks = fusionPicks.list();
    // The highlight walk reads the gated graphs: a hidden component can
    // never enter a visible item's related chain.
    const ballGraph = gatedGraph(ballMap, enabledEditions);
    const passiveGraph = gatedGraph(passiveMap, enabledEditions);
    const related = selectedId
      ? highlightSet(selectedId, isPassive(selectedId) ? passiveGraph : ballGraph)
      : new Set<string>();
    const ballQ = queries.balls.trim().toLowerCase();
    const passiveQ = queries.passives.trim().toLowerCase();
    const charQ = queries.characters.trim().toLowerCase();
    const fusionQ = queries.fusions.trim().toLowerCase();
    // The plan state is derived before the tiles because passive availability
    // reads the character-overlaid passive slot limit (zero slots is a limit,
    // not a per-passive rule).
    const planState = plan.derive(chars);
    const limits = planState.limits;
    /** One passive's availability under the current selection and limits —
     *  the one context literal both the tiles and the selection box read. */
    const availabilityOf = (passive: Passive): PassiveAvailability =>
      passiveAvailability(passive, {
        selectedChars: chars,
        passiveSlots: limits.passives,
        zeroSlotsReason: planState.passivesEmptyHint,
      });
    // each namespace filters against its own screen's query — one loop shape,
    // two (collection, query) pairs; the graphs themselves stay separate.
    // `hidden` is the edition filter: hidden content is not painted at all
    // and carries no availability state (the filter runs first).
    // Passives additionally carry their availability under the selection
    // (dimmed, not hidden; searchable).
    for (const [items, q] of [[BALLS, ballQ], [PASSIVES, passiveQ]] as const) {
      for (const item of items) {
        const v = verdictFor(item, chars);
        const hidden = !isEditionEnabled(enabledEditions, item.edition);
        const passive = isPassive(item.id) ? passiveMap.get(item.id) : undefined;
        tiles.set(item.id, {
          selected: selectedId === item.id,
          related: !!selectedId && selectedId !== item.id && related.has(item.id),
          dimmed: !!selectedId && !related.has(item.id),
          filtered: !!q && !(item.name.toLowerCase().includes(q) || item.effects.toLowerCase().includes(q)),
          hidden,
          verdict: v,
          availability: !hidden && passive ? availabilityOf(passive) : null,
        });
      }
    }
    // Matchmaker pairing restrictions: with exactly one character held (and
    // two allowed), forbidden partners are blocked — the game darkens them
    // on the select screen. With 0 or 2 held nothing is blocked.
    const held = blockedPartner(chars, limits);
    for (const ch of CHARACTERS) {
      const blockedBy = held && ch.cannotPair.includes(held.id) ? held.name : null;
      charCards.set(ch.id, {
        selected: selectedChars.has(ch.id),
        filtered: !!charQ && !(ch.name.toLowerCase().includes(charQ) || ch.quirk.toLowerCase().includes(charQ) || (ch.baseBallId && itemFor(ch.baseBallId)?.name.toLowerCase().includes(charQ) || false)),
        hidden: !isEditionEnabled(enabledEditions, ch.edition),
        blocked: blockedBy !== null,
        blockedBy,
      });
    }
    for (const b of FUSION_BALLS) {
      const pick = picks.indexOf(b.id);
      fusionRows.set(b.id, {
        slot: pick === 0 ? 1 : pick === 1 ? 2 : null,
        filtered: !!fusionQ && !b.name.toLowerCase().includes(fusionQ),
        hidden: !isEditionEnabled(enabledEditions, b.edition),
      });
    }
    // The fusion panel and its hint are derived in src/fusion-panel.ts from
    // the pick order plus the plan facts this screen hands in — the panel's
    // 3-state machine, order presentation, and hint live there, not here.
    const { panel: fusionPanel, hint: fusionHint } = deriveFusionPanel(picks, {
      hasPair: (x, y) => plan.hasPair(x, y),
      ballSlots: { used: planState.counts.balls, capacity: planState.limits.balls },
      // The Potager's fusion block is derived with the plan state (one
      // selection feeds both); the panel exempts evolve-instead pairs.
      fusionBlocked: planState.fusionBlocked,
    });
    // The selection boxes: one per item screen, filled only when the
    // selected item lives in that screen's namespace. Plan membership and
    // capacity are queried from the plan state (has / counts / limits) —
    // never read from its internals.
    const selected = selectedId ? itemFor(selectedId) : undefined;
    const selectedIsPassive = selected ? isPassive(selected.id) : false;
    const inPlan = selected ? plan.has(selected.id) : false;
    // A selected passive's availability drives the "Add to plan" disable and
    // its tooltip; the capacity check still owns the zero-slot case (which
    // the availability object reports as a reason).
    const selectedPassive = selected && selectedIsPassive ? passiveMap.get(selected.id) : undefined;
    const selectedAvailability = selectedPassive ? availabilityOf(selectedPassive) : null;
    const atCapacity = (selectedIsPassive ? planState.counts.passives : planState.counts.balls) >= (selectedIsPassive ? limits.passives : limits.balls);
    const planLabel: SelectionBoxState['plan'] =
      inPlan ? 'remove'
      : selectedAvailability?.blocked || atCapacity ? 'disabled'
      : 'add';
    const planReason: string | null =
      planLabel === 'disabled' && selectedAvailability && (selectedAvailability.blocked || selectedAvailability.zeroSlots)
        ? selectedAvailability.reason
        : null;
    const fusionLabel: SelectionBoxState['fusion'] = !selected || selectedIsPassive
      ? null
      : !isFusable(selected.id) ? 'unfusable'
      : fusionPicks.has(selected.id) ? 'remove'
      : picks.length >= 2 ? 'disabled'
      : 'add';
    const selectionBoxes: ViewModel['selectionBoxes'] = {
      balls: selected && !isPassive(selected.id) ? { item: selected, plan: planLabel, planReason, fusion: fusionLabel } : null,
      passives: selected && isPassive(selected.id) ? { item: selected, plan: planLabel, planReason, fusion: fusionLabel } : null,
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
      editions: enabledEditions,
    });
    // The edition-filtered collections and the surviving recipes — derived
    // once here so every screen (and the build graph) reads the same gate.
    const availableRecipeMap = new Map<string, string[][]>();
    for (const ball of BALLS) {
      availableRecipeMap.set(ball.id, filterRecipes(ball, enabledEditions, (id) => ballMap.get(id)));
    }
    for (const passive of PASSIVES) {
      availableRecipeMap.set(passive.id, filterRecipes(passive, enabledEditions, (id) => passiveMap.get(id)));
    }
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
      enabledEditions: [...enabledEditions],
      editionDroppedCount,
      visible: {
        balls: visibleItems(BALLS, enabledEditions),
        passives: visibleItems(PASSIVES, enabledEditions),
        characters: visibleItems(CHARACTERS, enabledEditions),
        fusionBalls: visibleItems(FUSION_BALLS, enabledEditions),
      },
      availableRecipes: availableRecipeMap,
    };
  };

  return {
    /** The transport currency — the plan's own fields plus the shared
     *  selection — the island saves to localStorage and encodes into share
     *  links. Each module supplies its half, so the island never re-extracts
     *  ids from the resolved view model. */
    sharedSnapshot(): SharedSnapshot {
      return {
        plan: plan.snapshot(),
        chars: selectedChars.list().map((c) => c.id),
        editions: [...enabledEditions],
      };
    },
    /** Current view model without a state change — initial paint. */
    derive(): ViewModel {
      return derive();
    },
    dispatch(action: Action): ViewModel {
      // The loss notice clears on the next action; only a toggle-off or a
      // share restore that drops entries sets it again below.
      editionDroppedCount = 0;
      switch (action.type) {
        // The content filter. Turning an edition off drops every hidden
        // entry (the no-hidden-live-state invariant); turning it on restores
        // nothing. Canonical vocabulary order keeps the list stable.
        case 'toggleEdition': {
          const wasEnabled = enabledEditions.includes(action.edition);
          enabledEditions = wasEnabled
            ? enabledEditions.filter((edition) => edition !== action.edition)
            : canonicalEditions([...enabledEditions, action.edition]);
          if (wasEnabled) editionDroppedCount = dropHiddenEntries();
          break;
        }
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
          // the selection rides along: the plan's capacity guards are
          // character-aware (src/slot-limits.ts) and The Potager blocks live
          // fusing-pair adds
          plan.dispatch(action, selectedChars.list());
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
          plan.dispatch(action, selectedChars.list());
          selectedChars.restore([]);
          graphDone.clear(); // a wiped plan has nothing left to track
          break;
        // The island hands the whole SharedSnapshot; each module restores
        // its own half — the plan fields go to plan-state, the shared
        // selection and editions are restored here (view-state owns them).
        // The editions apply first, then the same drop invariant runs: a
        // share's entries excluded by its own editions are dropped. The loss
        // notice fires only for a share restore (`notify`), not a plain
        // startup restore.
        case 'hydrate':
          enabledEditions = canonicalEditions(action.shared.editions);
          plan.dispatch({ type: 'hydrate', plan: action.shared.plan }, selectedChars.list());
          selectedChars.restore(action.shared.chars);
          editionDroppedCount = dropHiddenEntries();
          if (!action.notify) editionDroppedCount = 0;
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
