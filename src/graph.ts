// Pure evolution-graph helpers, extracted from the island so they can be
// unit-tested (src/graph.test.ts). The ball and passive graphs are strictly
// separate (ticket 03); ids never collide across them.

export interface GraphItem {
  id: string;
  depth: 0 | 1 | 2;
  recipes: string[][]; // OR-of-ANDs: outer = alternate recipes, inner = required components
}

export type Graph = Map<string, GraphItem>;

/** Index items by id, preserving the concrete item type (Ball, Passive, …). */
export const byId = <T extends GraphItem>(items: T[]): Map<string, T> => new Map(items.map((i) => [i.id, i]));

/** All recipes flattened: component ids this item is made from. */
export function componentsOf(item: GraphItem): string[] {
  return [...new Set(item.recipes.flat())];
}

/** Items this item can evolve into (any single recipe satisfied). */
export function childrenOf(id: string, graph: Graph): GraphItem[] {
  return [...graph.values()].filter((it) => it.recipes.some((r) => r.includes(id)));
}

/**
 * Recursive closure over the graph.
 * down=true: id → ids of all descendants (multi-level, multi-recipe aware).
 * down=false: id → ids of all components (expanded recursively).
 */
export function closure(ids: string[], graph: Graph, down: boolean): Set<string> {
  const seen = new Set<string>();
  const queue = [...ids];
  while (queue.length) {
    const id = queue.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    if (down) {
      for (const child of childrenOf(id, graph)) queue.push(child.id);
    } else {
      const item = graph.get(id);
      if (item) queue.push(...componentsOf(item));
    }
  }
  return seen;
}

export const union = (a: Set<string>, b: Set<string>) => new Set([...a, ...b]);

/**
 * Highlight set for a selection (ticket 05 semantics):
 * basic → all descendants; evolved/tier-3 → components (recursive) AND descendants.
 */
export function highlightSet(selectedId: string, graph: Graph): Set<string> {
  const sel = graph.get(selectedId);
  if (!sel) return new Set();
  let related = closure([selectedId], graph, true);
  if (sel.depth > 0) related = union(related, closure([selectedId], graph, false));
  related.add(selectedId);
  return related;
}

/**
 * Depth from recipe structure (not wiki labels): tier-2 = recipe includes an
 * evolved ball as a component; tier-3 = recipe includes a tier-2 ball.
 * `depths` maps already-known component depths (base components = 0).
 */
export function structuralDepth(recipes: string[][], isEvolvedId: (id: string) => boolean, componentDepth: (id: string) => number): 0 | 1 | 2 {
  if (!recipes.length) return 0;
  const maxComp = Math.max(...recipes.flat().map((c) => componentDepth(c)));
  return Math.min(maxComp + 1, 2) as 0 | 1 | 2;
}

/**
 * All multi-recipe entities must factorize into per-slot alternates — i.e.
 * every cross product of per-column choices is a valid recipe. This is what
 * makes the compact "x+(y/z)" tile notation faithful (user-verified format).
 */
export function factorizesIntoSlots(recipes: string[][]): boolean {
  if (recipes.length <= 1) return true;
  const width = recipes[0].length;
  if (recipes.some((r) => r.length !== width)) return false;
  const cols = recipeSlots(recipes);
  let acc: string[][] = [[]];
  for (const col of cols) acc = acc.flatMap((a) => col.map((y) => [...a, y]));
  const key = (r: string[]) => r.join('|');
  const valid = new Set(recipes.map(key));
  return acc.every((c) => valid.has(key(c)));
}

/**
 * The compact per-slot notation, grouped: recipes column-wise → per-slot
 * alternate lists (first-occurrence order). This is the data behind
 * "a+(b/c)" / "(a/b)+(c/d)" rendering — meaningful only when
 * factorizesIntoSlots(recipes) holds (the dataset is verified to).
 * Precondition: recipes is non-empty and rectangular (all rows the same
 * width) — callers guard or guard first via factorizesIntoSlots.
 */
export function recipeSlots(recipes: string[][]): string[][] {
  const width = recipes[0].length;
  const slots: string[][] = [];
  for (let s = 0; s < width; s++) slots.push([...new Set(recipes.map((r) => r[s]))]);
  return slots;
}

/**
 * Render recipes in the compact per-slot notation: "a+(b/c)",
 * "(a/b)+(c/d)", "a+b+c". `renderComponent` turns a component id into
 * markup (the renderer injects its icon markup, joined by src/icon-url.ts); returning null
 * falls back to the raw id. Single-recipe items never show alternates.
 */
export function recipeHtml(recipes: string[][], renderComponent: (id: string) => string | null): string {
  const img = (id: string) => renderComponent(id) ?? id;
  const single = recipes.length === 1;
  return recipeSlots(recipes)
    .map((opts) => (single || opts.length === 1 ? img(opts[0]) : `<span class="alt">${opts.map(img).join('<span class="or">/</span>')}</span>`))
    .join('<span class="plus">+</span>');
}
