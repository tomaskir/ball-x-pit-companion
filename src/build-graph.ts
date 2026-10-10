// Build-graph module: derives the Plan screen's build graph from the plan's
// targets — one layered graph per namespace (balls, passives; the graphs are
// strictly separate, as everywhere) showing every step to build the planned
// items: base entities → evolved → tier-3, plus — balls only — a fusion row
// for the planned fused pairs. Pure derivation and layout, unit-tested in
// src/build-graph.test.ts; the renderer only paints the laid-out model.
//
// The model rules (settled with the user):
// - One node per id across the whole graph (deduped by id). A planned fused
//   pair is one fusion-layer node whose id carries the `fusion:` prefix so
//   it can never collide with a catalog id (the namespace invariant). A
//   planned pair that Evolves instead of Fusing never reaches here as a
//   pair — view-state resolves it into a single target of the evolved ball
//   (it is just a way of building that ball).
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
//   complexity (graph.complexity, most complex left), ties in catalog order.
import { type GraphItem, complexity, componentsOf, recipeSlots } from './graph';

/** The plan-side input: which entities the graph must show the build for.
 *  Planned pairs that Evolve instead of Fuse arrive as singles of the
 *  evolved ball (resolved by view-state, which owns the fusion model). */
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
  row: 0 | 1 | 2 | 3;
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
  `${FUSION_ID_PREFIX}${[a, b].sort().join('+')}`;

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
 * catalog map (balls or passives — never both), `fusionRow` adds the fusion
 * layer for the planned pairs (balls only). Every target plus its full
 * component ancestry becomes a node; demands aggregate as min-sum/max-sum
 * over the model's parent edges (see the module header). The dataset is
 * verified acyclic (graph.ts's stance); a cycle would yield a
 * bounded-but-undefined demand, guarded the same way complexity() guards it.
 */
export function deriveBuildGraph<T extends GraphItem & { name: string; icon: string }>(
  targets: BuildGraphTargets,
  graph: Map<string, T>,
  { fusionRow, done: doneMarks = new Set<string>() }: { fusionRow: boolean; done?: ReadonlySet<string> },
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
    const id = stack.pop()!;
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
      const a = graph.get(fusion.a)!;
      const b = graph.get(fusion.b)!;
      nodes.push({
        id,
        name: `${a.name} × ${b.name}`,
        icon: a.icon,
        icon2: b.icon,
        row: 3,
        min,
        max,
        final: true,
        done: isDone,
        suppressed,
      });
      continue;
    }
    const item = graph.get(id)!;
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
    const w = n.row === 3 ? fusedW : nodeW;
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
  const edges = model.edges
    .filter((e) => byId.has(e.from) && byId.has(e.to))
    .map((e) => {
      const f = byId.get(e.from)!;
      const t = byId.get(e.to)!;
      const sx = f.x + f.w / 2;
      const sy = f.y + nodeH;
      const tx = t.x + t.w / 2;
      const ty = t.y;
      const dy = (ty - sy) / 2;
      return { ...e, path: `M ${sx} ${sy} C ${sx} ${sy + dy}, ${tx} ${ty - dy}, ${tx} ${ty}` };
    });
  return { width, height: rows * rowH, nodes, edges };
}
