// Renderer facade: all DOM painting for the island behind one instance
// interface. createRenderer(options) returns { build(), paint(vm), destroy() }:
// build() builds the static DOM once (grids, character cards, the fusion
// panel, the plan screen skeleton), paint(viewModel) repaints state on it —
// never recreating <img> elements (rebuilding would blink the icons; the
// plan's entries and the character chips are the one accepted exception,
// rebuilding only when their content key changes — the reconcile seam).
// destroy() tears the instance down: the toast adapter's document listener is
// removed and every painter registry is cleared. The instance owns the seam
// and every registry, so two renderers on one document never rebind each
// other; paint() before build() is a safe no-op.
//
// The painters themselves live in internal modules under src/renderer/:
// grids.ts, characters.ts, chips.ts, fusion-screen.ts, plan.ts,
// build-graphs.ts, selection-box.ts, and edition-filter.ts (the per-screen
// checkbox groups and the header loss notice), each a factory over the
// instance's seam (seam.ts — the emit callback, the captured view model, and
// the toast adapter from src/toast.ts) and reconcile cache (reconcile.ts —
// the content-diff cache), sharing the action-slot adapter (action-slot.ts —
// the typed action a built-once handler reports) and the DOM/label helpers
// (dom.ts, labels.ts). This facade composes them; only createRenderer,
// Renderer, BuildOptions, FUSION_PANEL_SKELETON, and FUSION_PANEL_SELECTORS
// are public.
//
// The island (src/companion.ts) is transport only — hash routing and
// storage/history/clipboard, with the static-shell controls (theme, tabs,
// search, plan toolbar, share, Esc/empty-space) in src/shell.ts, the
// routing, clear-policy, and theme decisions in src/companion-core.ts, the
// share-link URL transport in src/share.ts, the persistence lifecycle in
// src/plan-session.ts, and the persistence codec in src/plan-codec.ts;
// the ViewModel it paints comes from src/view-state.ts — the fusion panel rides
// the named fusionPanel state (empty / pending / composed) and the fusion
// painter switches on it; the plan rides vm.plan and the plan painter paints
// per section; the renderer holds no domain data of its own. The icon-URL join
// comes from src/icon-url.ts. The fusion panel's skeleton and hook-selector
// map are exported as pure data (FUSION_PANEL_SKELETON /
// FUSION_PANEL_SELECTORS) so the tests pin the same values the fusion
// painter builds and queries.
//
// The build seam is the options object: { emit }. emit is how built-in
// click handlers report selection toggles back to the island — emit(action)
// hands over the whole view-state ToggleAction (the island dispatches it
// verbatim). The renderer never dispatches DOM events or touches view
// state: emit is just a callback the island supplies (it dispatches and
// paints); hover/tap toast listeners stay internal to the renderer (binding
// anchors to the toast adapter), and the toast's verdict comes from the
// view model paint() last captured — the painted tile verdict itself, not a
// second read into live view state.
import type { ViewModel } from './view-state';
import { createSeam, type SeamOptions } from './renderer/seam';
import { createReconcile } from './renderer/reconcile';
import { createGrids } from './renderer/grids';
import { createCharacters } from './renderer/characters';
import { createChips } from './renderer/chips';
import { createFusionScreen } from './renderer/fusion-screen';
import { createPlan } from './renderer/plan';
import { createBuildGraphs } from './renderer/build-graphs';
import { createSelectionBoxes } from './renderer/selection-box';
import { createEditionFilter } from './renderer/edition-filter';

export { FUSION_PANEL_SKELETON, FUSION_PANEL_SELECTORS } from './renderer/fusion-screen';

// ---------- interface ----------

/** The build seam: everything the island injects at renderer creation.
 *  `emit` is how the built-in click handlers report actions back (selection
 *  toggles and the fusion order swap) — the island dispatches the whole
 *  ToggleAction and paints. The renderer stays paint-only: it never
 *  dispatches DOM events and never touches view state. The shape is defined
 *  once, in the seam module the facade hands it to. */
export type BuildOptions = SeamOptions;

/** One renderer instance. */
export interface Renderer {
  /** Build all static DOM once: balls grid, passives grid, character cards,
   *  fusion pick list, plan screen skeleton, build-graph panels, selection
   *  boxes. Safe to call again (the containers and registries reset). */
  build(): void;
  /** Repaint state (selection/related/dimmed/filtered, verdict badges,
   *  character cards and chips, fusion picks and panel, the plan screen) on
   *  the existing DOM, capturing the view model in the seam for the toast's
   *  verdict lookup. A no-op before build(); idempotent; never recreates
   *  <img> elements — the fusion panel's skeleton (with its two head icons)
   *  is built once and repainted in place, and the plan's entries rebuild
   *  only when their section's entry set changes (the reconcile seam). */
  paint(vm: ViewModel): void;
  /** Tear the instance down: hide any shown toast and remove its
   *  document-level dismissal listener, clear every painter registry, and
   *  make the seam inert (built-once DOM handlers cannot emit or show toasts
   *  afterwards). Idempotent and terminal — a later build() is a no-op. */
  destroy(): void;
}

/** Create one renderer instance over the island's build seam. The instance
 *  owns the toast adapter, the reconcile cache, and every DOM registry — no
 *  module-level renderer state remains. */
export function createRenderer(options: BuildOptions): Renderer {
  const seam = createSeam(options);
  const reconciler = createReconcile();
  const reconcile = reconciler.reconcile;
  const grids = createGrids(seam);
  const characters = createCharacters(seam);
  const chips = createChips({ emitAction: seam.emitAction, reconcile });
  const fusion = createFusionScreen({ emitAction: seam.emitAction, reconcile });
  const plan = createPlan({ emitAction: seam.emitAction, reconcile });
  const graphs = createBuildGraphs({ emitAction: seam.emitAction, reconcile });
  const selection = createSelectionBoxes({ emitAction: seam.emitAction });
  const editionFilter = createEditionFilter();
  let built = false;
  let destroyed = false;

  return {
    build() {
      if (destroyed) return;
      seam.capture(null); // a rebuild starts unpainted; no stale toast verdict
      grids.build();
      characters.build();
      fusion.buildList();
      fusion.buildPanel();
      plan.build();
      graphs.build();
      selection.build();
      built = true;
    },
    paint(vm) {
      if (!built || destroyed) return;
      seam.capture(vm);
      editionFilter.paint(vm);
      grids.paint(vm);
      characters.paint(vm);
      chips.paint(vm);
      fusion.paint(vm);
      plan.paint(vm);
      graphs.paint(vm);
      selection.paint(vm);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      seam.destroy();
      reconciler.reset();
      grids.destroy();
      characters.destroy();
      fusion.destroy();
      plan.destroy();
      graphs.destroy();
      selection.destroy();
      editionFilter.destroy();
      built = false;
    },
  };
}
