// Build-graph module: derives the Plan screen's build graph from the plan's
// targets — one layered graph per namespace (balls, passives; the graphs are
// strictly separate, as everywhere) showing every step to build the planned
// items: base entities → evolved → tier-3, plus — balls only — a fusion row
// for the planned fused pairs. Pure derivation, layout, and the whole
// Plan-screen view derivation (`deriveBuildGraphView`), unit-tested in
// src/build-graph.test.ts; the renderer only paints the laid-out model.
//
// The module owns the graph's inputs, row model, and highlight rule:
// `deriveBuildGraphView(planState, { focus, done, collapsed })` assembles the
// targets from the plan (including Evolves-instead resolution), derives and
// lays out both namespace graphs, validates the focus id, walks the related
// set, and carries the fixed row model (row counts, fusion row index, row
// labels). view-state only embeds the result.
//
// The model rules (settled with the user):
// - One node per id across the whole graph (deduped by id). A planned fused
//   pair is one fusion-layer node whose id carries the `fusion:` prefix so
//   it can never collide with a catalog id (the namespace invariant). A
//   planned pair that Evolves instead of Fusing never reaches here as a
//   pair — `deriveBuildGraphView` resolves it into a single target of the
//   evolved ball (it is just a way of building that ball).
// - Counts are physical copies: a node's demand is the sum over everything
//   that needs it. Being a planned target adds 1; each parent (a model node
//   whose recipes include the node) adds the parent's own demand × the slot
//   factor — a single-option recipe slot is mandatory {1,1}, a per-slot
//   alternate is {0,1}. Min and max aggregate as independent sums, so
//   alternate paths read as ranges ("0-1", "1-2") and shared bases sum.
// - `final` marks the planned targets: planned singles ride their own depth
//   row (a planned base ball is a final node in the base row); only fused
//   pairs occupy the fusion row.
// - Edges connect component → builder for every recipe membership — also
//   alternates: the line shows the possible path.
// - Rows are fixed (callers pass the row count; empty rows keep their band
//   so the panel's height never jumps). Within a row, nodes sort by
//   complexity (graph.complexity, most complex left), ties in catalog order;
//   done/suppressed nodes read as disabled and move right of everything
//   still needed in their row.
import { type GraphItem, complexity, componentsOf, recipeSlots, closure, union } from './graph';
import { pairKey, parsePair } from './pair';
import { ballMap, passiveMap, graphFor } from './catalog';
import { evolvesInstead } from './fusion';
import { DEPTH_LABELS } from './depth-labels';
import type { PlanState } from './plan-state';

/** The fusion row's index — the only row outside the structural depths. */
export const FUSION_ROW = 3 as const;
export type FusionRow = typeof FUSION_ROW;

/** The graph's fixed row bands: one per structural depth plus — balls only —
 *  the fusion row. The single definition of the row count, the fusion row
 *  index, and the row labels (the derivation reads the count; the renderer
 *  reads the labels and the fusion row index). */
export interface BuildGraphRows {
  /** Fixed row bands (empty rows keep their band). */
  rowCount: number;
  /** The fusion row's index, or null when the namespace has no fusion row. */
  fusionRow: FusionRow | null;
  /** Row labels, index-aligned with the bands. */
  labels: readonly string[];
}
const rows = (labels: readonly string[], fusionRow: FusionRow | null): BuildGraphRows => ({
  rowCount: labels.length,
  fusionRow,
  labels,
});
export const BUILD_GRAPH_ROWS: Record<'balls' | 'passives', BuildGraphRows> = {
  balls: rows([...DEPTH_LABELS, 'Fusions'], FUSION_ROW),
  passives: rows(DEPTH_LABELS, null),
};

/** The plan-side input: which entities the graph must show the build for.
 *  Planned pairs that Evolve instead of Fuse arrive as singles of the
 *  evolved ball (resolved by `deriveBuildGraphView`). */
export interface BuildGraphTargets {
  singles: string[];
  pairs: { a: string; b: string }[];
}

/** One node in the build graph. `row` is 0/1/2 for the item's structural
 *  depth and 3 for the fusion row (balls only). Fusion nodes carry the
 *  second component's icon in `icon2` and a `fusion:`-prefixed id. */
export interface BuildGraphNode {
  id: string;
  name: string;
  icon: string;
  row: 0 | 1 | 2 | FusionRow;
  /** Physical copies still needed: min when every path needs it, max when
   *  alternate paths could push it higher. Equal → show a plain count.
   *  Done marks stop their node from contributing, so these are the
   *  REMAINING copies — what the player still has to build this run. */
  min: number;
  max: number;
  final: boolean;
  /** Marked done this run (the renderer paints the green check and dims). */
  done: boolean;
  /** Nothing done-marked, but zero remaining demand anyway — every path to
   *  it runs through a done node. Suppressed visually (dimmed, no check). */
  suppressed: boolean;
  icon2?: string;
}

export interface BuildGraphEdge {
  /** Component id (or, into a fusion node, the pair ball's id). */
  from: string;
  /** Builder id — a catalog id, or a `fusion:`-prefixed pair node. */
  to: string;
}

export interface BuildGraphModel {
  nodes: BuildGraphNode[];
  edges: BuildGraphEdge[];
}

/** Fusion-layer node id prefix — the fusion row lives outside the catalog
 *  namespace, so its ids are namespaced to keep the no-collision invariant. */
export const FUSION_ID_PREFIX = 'fusion:';
export const fusionNodeId = (a: string, b: string): string =>
  `${FUSION_ID_PREFIX}${pairKey(a, b)}`;

/** The two component ids of a fusion node id, or null when `id` is not one
 *  (no prefix, or a malformed pair key). The reverse of `fusionNodeId`. */
export function fusionNodePair(id: string): [string, string] | null {
  if (!id.startsWith(FUSION_ID_PREFIX)) return null;
  return parsePair(id.slice(FUSION_ID_PREFIX.length));
}

/** Fixed layout metrics — the renderer reads them for the node cards and
 *  the row-label column, so one source pins both. */
export const BUILD_GRAPH_METRICS = {
  nodeW: 108,
  nodeH: 68,
  fusedW: 152,
  gapX: 30,
  rowH: 104,
  padX: 14,
} as const;

/** A laid-out node: pixel box inside the canvas (y centers the card in its
 *  row band). */
export type PlacedNode = BuildGraphNode & { x: number; y: number; w: number };

export interface BuildGraphLayout {
  width: number;
  height: number;
  nodes: PlacedNode[];
  /** Edges as SVG path `d` strings (bottom-center of `from` to top-center
   *  of `to`, a vertical bezier), paired with their endpoints so the
   *  renderer can light the paths touching the focused node. */
  edges: { from: string; to: string; path: string }[];
}

/**
 * Derive the build graph for one namespace: `graph` is that namespace's
 * catalog map (balls or passives — never both). Every target plus its full
 * component ancestry becomes a node; demands aggregate as min-sum/max-sum
 * over the model's parent edges (see the module header). The dataset is
 * verified acyclic (graph.ts's stance); a cycle would yield a
 * bounded-but-undefined demand, guarded the same way complexity() guards it.
 */
export function deriveBuildGraph<T extends GraphItem & { name: string; icon: string }>(
  targets: BuildGraphTargets,
  graph: Map<string, T>,
  { done: doneMarks = new Set<string>() }: { done?: ReadonlySet<string> } = {},
): BuildGraphModel {
  // --- collect the model's node ids: targets + recursive components
  const modelIds = new Set<string>(targets.singles);
  const stack = [...targets.singles];
  for (const { a, b } of targets.pairs) {
    modelIds.add(a);
    modelIds.add(b);
    stack.push(a, b);
  }
  while (stack.length) {
    const id = stack.pop();
    if (id === undefined) break;
    const item = graph.get(id);
    if (!item) continue;
    for (const c of componentsOf(item)) {
      if (!modelIds.has(c)) {
        modelIds.add(c);
        stack.push(c);
      }
    }
  }

  // --- parents within the model: component id → builder ids. Fusion nodes
  // are pseudo-builders of exactly their two pair balls (both mandatory).
  const fusionByNode = new Map<string, { a: string; b: string }>();
  const parents = new Map<string, string[]>();
  const addParent = (component: string, builder: string) => {
    const list = parents.get(component);
    if (list) list.push(builder);
    else parents.set(component, [builder]);
  };
  for (const id of modelIds) {
    const item = graph.get(id);
    if (!item || !item.recipes.length) continue;
    for (const c of componentsOf(item)) addParent(c, id);
  }
  for (const { a, b } of targets.pairs) {
    const fid = fusionNodeId(a, b);
    fusionByNode.set(fid, { a, b });
    modelIds.add(fid);
    addParent(a, fid);
    addParent(b, fid);
  }

  // --- demands: min-sum/max-sum over the parent edges (module header).
  // demandOf(id) finalizes id's demand before its parents read it; the
  // in-progress guard pins the same cycle stance as graph.complexity.
  const demandMin = new Map<string, number>();
  const demandMax = new Map<string, number>();
  const done = new Set<string>();
  const inProgress = new Set<string>();
  const demandOf = (id: string): void => {
    if (done.has(id)) return;
    if (inProgress.has(id)) return;
    inProgress.add(id);
    const isTarget = targets.singles.includes(id) || fusionByNode.has(id);
    let min = isTarget ? 1 : 0;
    let max = isTarget ? 1 : 0;
    for (const p of parents.get(id) ?? []) {
      demandOf(p);
      // a done-marked parent is already built this run — it contributes no
      // remaining demand to its components
      if (doneMarks.has(p)) continue;
      if (!done.has(p)) continue; // cycle: bounded-undefined, contribute 0
      const [fMin, fMax] = slotFactor(p, id, graph, fusionByNode);
      min += (demandMin.get(p) ?? 0) * fMin;
      max += (demandMax.get(p) ?? 0) * fMax;
    }
    inProgress.delete(id);
    done.add(id);
    demandMin.set(id, min);
    demandMax.set(id, max);
  };
  for (const id of modelIds) demandOf(id);

  // --- nodes, sorted per row: complexity desc, ties in catalog order
  // (Map iteration order IS catalog order — byId builds from the arrays).
  const orderOf = new Map([...graph.keys()].map((id, i) => [id, i]));
  const complexityOf = (id: string): number => {
    const item = graph.get(id);
    return item ? complexity(item, graph) : 0;
  };
  const nodes: BuildGraphNode[] = [];
  for (const id of modelIds) {
    const isDone = doneMarks.has(id);
    const min = demandMin.get(id) ?? 0;
    const max = demandMax.get(id) ?? 0;
    // suppressed: not done itself, but nothing points at it anymore — every
    // path runs through a done node (a pure alternate keeps its max > 0)
    const suppressed = !isDone && min === 0 && max === 0;
    const fusion = fusionByNode.get(id);
    if (fusion) {
      const a = graph.get(fusion.a);
      const b = graph.get(fusion.b);
      if (!a || !b) continue; // resolution guards keep this unreachable
      nodes.push({
        id,
        name: `${a.name} × ${b.name}`,
        icon: a.icon,
        icon2: b.icon,
        row: FUSION_ROW,
        min,
        max,
        final: true,
        done: isDone,
        suppressed,
      });
      continue;
    }
    const item = graph.get(id);
    if (!item) continue;
    nodes.push({
      id,
      name: item.name,
      icon: item.icon,
      row: item.depth,
      min,
      max,
      final: targets.singles.includes(id),
      done: isDone,
      suppressed,
    });
  }
  nodes.sort((x, y) =>
    x.row - y.row ||
    // done/suppressed nodes read as disabled — they move right of everything
    // still needed in their row (layout positions follow the model order)
    Number(x.done || x.suppressed) - Number(y.done || y.suppressed) ||
    complexityOf(y.id) - complexityOf(x.id) ||
    (orderOf.get(x.id) ?? 0) - (orderOf.get(y.id) ?? 0),
  );

  // --- edges: component → builder for every recipe membership (also
  // alternates), and pair ball → fusion node
  const edges: BuildGraphEdge[] = [];
  for (const id of modelIds) {
    const fusion = fusionByNode.get(id);
    if (fusion) {
      edges.push({ from: fusion.a, to: id }, { from: fusion.b, to: id });
      continue;
    }
    const item = graph.get(id);
    if (!item || !item.recipes.length) continue;
    for (const c of componentsOf(item)) edges.push({ from: c, to: id });
  }

  return { nodes, edges };
}

/** How much of `component` one unit of `builder`'s demand needs: {1,1} for
 *  a mandatory slot (single-option), {0,1} for a per-slot alternate. A
 *  component occupying several slots sums the factors. Fusion builders need
 *  both pair balls outright. */
function slotFactor(
  builder: string,
  component: string,
  graph: Map<string, GraphItem & { name: string; icon: string }>,
  fusionByNode: Map<string, { a: string; b: string }>,
): [number, number] {
  if (fusionByNode.has(builder)) return [1, 1];
  const item = graph.get(builder);
  if (!item || !item.recipes.length) return [0, 0];
  let min = 0;
  let max = 0;
  for (const slot of recipeSlots(item.recipes)) {
    if (!slot.includes(component)) continue;
    min += slot.length === 1 ? 1 : 0;
    max += 1;
  }
  return [min, max];
}

/**
 * Lay the model out for painting: fixed row bands (one per `rows`), nodes
 * stacked left-to-right within a band in the model's order, edges as bezier
 * paths in the same coordinate space. Pure — the renderer positions cards
 * and draws paths straight from this.
 */
export function layoutBuildGraph(model: BuildGraphModel, rows: number): BuildGraphLayout {
  const { nodeW, nodeH, fusedW, gapX, rowH, padX } = BUILD_GRAPH_METRICS;
  const nodes: PlacedNode[] = [];
  let width = padX * 2;
  let cursor = padX;
  let currentRow = -1;
  for (const n of model.nodes) {
    if (n.row !== currentRow) {
      currentRow = n.row;
      cursor = padX;
    }
    const w = n.row === FUSION_ROW ? fusedW : nodeW;
    nodes.push({
      ...n,
      w,
      x: cursor,
      y: n.row * rowH + (rowH - nodeH) / 2,
    });
    cursor += w + gapX;
    width = Math.max(width, cursor - gapX + padX);
  }
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const edges = model.edges.flatMap((e) => {
    const f = byId.get(e.from);
    const t = byId.get(e.to);
    if (!f || !t) return [];
    const sx = f.x + f.w / 2;
    const sy = f.y + nodeH;
    const tx = t.x + t.w / 2;
    const ty = t.y;
    const dy = (ty - sy) / 2;
    return [{ ...e, path: `M ${sx} ${sy} C ${sx} ${sy + dy}, ${tx} ${ty - dy}, ${tx} ${ty}` }];
  });
  return { width, height: rows * rowH, nodes, edges };
}

/** The two build-graph panels' collapsed flags — session-only UI state. */
export interface BuildGraphCollapsed {
  balls: boolean;
  passives: boolean;
}

/** The session-only build-graph UI state view-state owns: the focused node
 *  (null = none), the done marks (nodes the player has already built this
 *  run), and the two panels' collapsed flags. */
export interface BuildGraphSessionState {
  focus: string | null;
  done: ReadonlySet<string>;
  collapsed: BuildGraphCollapsed;
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
  collapsed: BuildGraphCollapsed;
}

/**
 * Derive the whole Plan-screen graph view from the plan state plus the
 * session-only graph UI state. This module owns the graph's inputs: the
 * targets are the plan's kept (non-over-limit) entries — over-limit and
 * everything else the plan merely marks stays out of the picture. A planned
 * pair that Evolves instead of Fusing is just a way of building the evolved
 * ball, so it becomes a single target of the result (deduped against a
 * directly planned single by the derivation's id set). Both namespace graphs
 * are derived and laid out here; the focus id is validated against them and
 * the related set walks the focused node's upstream AND downstream chains in
 * its own namespace (a base ball has no upstream, a fusion no downstream —
 * "both directions" covers both). A fusion node lights its pair balls and
 * their ancestries; a lit ball rides its fusion nodes in.
 */
export function deriveBuildGraphView(
  planState: PlanState,
  { focus, done, collapsed }: BuildGraphSessionState,
): BuildGraphViewState {
  const ballTargets: BuildGraphTargets = { singles: [], pairs: [] };
  for (const e of planState.balls) {
    if (e.overLimit) continue;
    if (e.kind === 'single') ballTargets.singles.push(e.item.id);
    else {
      const evo = evolvesInstead(e.a, e.b);
      if (evo) ballTargets.singles.push(evo.id);
      else ballTargets.pairs.push({ a: e.a.id, b: e.b.id });
    }
  }
  const passiveTargets: BuildGraphTargets = {
    singles: planState.passives.filter((e) => !e.overLimit).map((e) => e.item.id),
    pairs: [],
  };
  const deriveAndLayout = <T extends GraphItem & { name: string; icon: string }>(
    targets: BuildGraphTargets,
    graph: Map<string, T>,
    rows: number,
  ) => layoutBuildGraph(deriveBuildGraph(targets, graph, { done }), rows);
  const balls = deriveAndLayout(ballTargets, ballMap, BUILD_GRAPH_ROWS.balls.rowCount);
  const passives = deriveAndLayout(passiveTargets, passiveMap, BUILD_GRAPH_ROWS.passives.rowCount);

  let resolvedFocus = focus;
  if (resolvedFocus && ![...balls.nodes, ...passives.nodes].some((n) => n.id === resolvedFocus)) {
    resolvedFocus = null;
  }
  const related = new Set<string>();
  if (resolvedFocus) {
    const focusPair = fusionNodePair(resolvedFocus);
    if (focusPair) {
      const [a, b] = focusPair;
      related.add(resolvedFocus);
      related.add(a);
      related.add(b);
      for (const id of closure([a, b], ballMap, false)) related.add(id);
    } else {
      const g = graphFor(resolvedFocus);
      for (const id of union(closure([resolvedFocus], g, false), closure([resolvedFocus], g, true))) {
        related.add(id);
      }
      related.add(resolvedFocus);
      for (const n of balls.nodes) {
        if (n.row !== FUSION_ROW) continue;
        const pair = fusionNodePair(n.id);
        if (pair && (related.has(pair[0]) || related.has(pair[1]))) related.add(n.id);
      }
    }
  }
  return { balls, passives, focus: resolvedFocus, related, collapsed: { ...collapsed } };
}
