// Renderer facade: all DOM painting for the island behind one interface.
// buildAll(options) builds the static DOM once (grids, character cards, the
// fusion panel, the plan screen skeleton), then paint(viewModel) repaints
// state on it — never recreating <img> elements (rebuilding would blink the
// icons; the plan's entries and the character chips are the one accepted
// exception, rebuilding only when their content key changes — the reconcile
// seam). The painters themselves live in internal modules under
// src/renderer/: grids.ts, characters.ts, chips.ts, fusion-screen.ts,
// plan.ts, build-graphs.ts, and selection-box.ts, sharing the reconcile
// seam (reconcile.ts) and the build seam (seam.ts — the emit callback and
// the toast adapter from src/toast.ts). This facade composes them; only
// buildAll, paint, FUSION_PANEL_SKELETON, and FUSION_PANEL_SELECTORS are
// public.
//
// The island (src/companion.ts) is transport only — event
// listening, storage/history/clipboard, with the routing, clear-policy, and
// theme decisions in src/companion-core.ts and the share-link lifecycle in
// src/share.ts (plan persistence to localStorage is the island's own job);
// the ViewModel it paints comes from src/view-state.ts — the fusion panel rides
// the named fusionPanel state (empty / pending / composed) and paintFusion
// switches on it; the plan rides vm.plan and paintPlan paints per section;
// the renderer holds no domain data of its own. The icon-URL join comes
// from src/icon-url.ts. The fusion panel's skeleton and hook-selector map are
// exported as pure data (FUSION_PANEL_SKELETON / FUSION_PANEL_SELECTORS) so
// the tests pin the same values buildFusionPanel paints and queries.
//
// The build seam is the options object: { getVerdict, emit }. getVerdict
// supplies the toast adapter's per-item verdict against the current
// character selection; emit is how built-in click handlers report selection
// toggles back to the island — emit(action) hands over the whole view-state
// ToggleAction (the island dispatches it verbatim). The
// renderer never dispatches DOM events or touches view state: emit is just
// a callback the island supplies (it dispatches and paints); hover/tap
// toast listeners stay internal to the renderer (binding anchors to the
// toast adapter).
import type { Item } from './catalog';
import type { Verdict } from './synergy';
import type { ToggleAction, ViewModel } from './view-state';
import { initSeam } from './renderer/seam';
import { buildGrids, paintTiles } from './renderer/grids';
import { buildCharacters, paintCharCards } from './renderer/characters';
import { paintCharChips } from './renderer/chips';
import { buildFusionList, buildFusionPanel, paintFusion } from './renderer/fusion-screen';
import { buildPlan, paintPlan } from './renderer/plan';
import { buildBuildGraphs, paintBuildGraphs } from './renderer/build-graphs';
import { buildSelectionBoxes, paintSelectionBoxes } from './renderer/selection-box';

export { FUSION_PANEL_SKELETON, FUSION_PANEL_SELECTORS } from './renderer/fusion-screen';

// ---------- interface ----------

/** The build seam: everything the island injects at build time.
 *  `getVerdict` supplies the toast adapter's per-item verdict against the
 *  current character selection; `emit` is how the built-in click handlers
 *  report actions back (selection toggles and the fusion order swap) — the
 *  island dispatches the whole ToggleAction and paints. The renderer stays
 *  paint-only: it never dispatches DOM events and never touches view state. */
export interface BuildOptions {
  getVerdict: (item: Item) => Verdict | null;
  emit: (action: ToggleAction) => void;
}

/** Build all static DOM once: balls grid, passives grid, character cards,
 *  fusion pick list, plan screen skeleton — and the toast adapter (from
 *  src/toast.ts), which the grid tiles and base-ball chips bind to. Call
 *  once at startup, before the first paint(). */
export function buildAll({ getVerdict, emit: onEmit }: BuildOptions): void {
  initSeam({ getVerdict, emit: onEmit });
  buildGrids();
  buildCharacters();
  buildFusionList();
  buildFusionPanel();
  buildPlan();
  buildBuildGraphs();
  buildSelectionBoxes();
}

/** Repaint state (selection/related/dimmed/filtered, verdict badges,
 *  character cards and chips, fusion picks and panel, the plan screen) on
 *  the existing DOM. Safe to call before buildAll() (no-op — nothing built
 *  yet). Idempotent; never recreates <img> elements — the fusion panel's
 *  skeleton (with its two head icons) is built once and repainted in place,
 *  and the plan's entries rebuild only when their section's entry set
 *  changes (the reconcile seam). */
export function paint(vm: ViewModel): void {
  paintTiles(vm);
  paintCharCards(vm);
  paintCharChips(vm);
  paintFusion(vm);
  paintPlan(vm);
  paintBuildGraphs(vm);
  paintSelectionBoxes(vm);
}
