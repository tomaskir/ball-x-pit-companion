// Graph logic tests — ticket 05 interaction semantics plus the pure helpers
// extracted from the island (src/graph.ts). Fixture graph mirrors the real
// ball graph's shapes: multi-recipe alternates, 3-way, 4-way, chains.
import { describe, it, expect } from 'vitest';
import { byId, closure, childrenOf, componentsOf, highlightSet, structuralDepth, factorizesIntoSlots, recipeSlots, recipeHtml, resolveDepths, type GraphItem } from './graph';

// fixture: base(0) a,b,c,d; tier-2(1) ab (a+b or a+c), ad (a+d); tier-3(2) abd (ab+d)
const G: GraphItem[] = [
  { id: 'a', depth: 0, recipes: [] },
  { id: 'b', depth: 0, recipes: [] },
  { id: 'c', depth: 0, recipes: [] },
  { id: 'd', depth: 0, recipes: [] },
  { id: 'ab', depth: 1, recipes: [['a', 'b'], ['a', 'c']] },
  { id: 'ad', depth: 1, recipes: [['a', 'd']] },
  { id: 'abd', depth: 2, recipes: [['ab', 'd']] },
];
const graph = byId(G);

describe('componentsOf / childrenOf', () => {
  it('flattens all recipes into a distinct component set', () => {
    expect(componentsOf(graph.get('ab')!).sort()).toEqual(['a', 'b', 'c']);
  });
  it('finds children through any single recipe', () => {
    expect(childrenOf('c', graph).map((x) => x.id)).toEqual(['ab']);
    expect(childrenOf('a', graph).map((x) => x.id).sort()).toEqual(['ab', 'ad']);
  });
});

describe('closure (ticket 05: multi-level, multi-recipe aware)', () => {
  it('down: basic ball reaches all descendants through alternate recipes', () => {
    expect(closure(['a'], graph, true)).toEqual(new Set(['a', 'ab', 'ad', 'abd']));
  });
  it('down: includes tier-3 through a tier-2 intermediate', () => {
    expect(closure(['b'], graph, true)).toEqual(new Set(['b', 'ab', 'abd']));
  });
  it('up: evolved ball reaches all components recursively', () => {
    expect(closure(['abd'], graph, false)).toEqual(new Set(['abd', 'ab', 'd', 'a', 'b', 'c']));
  });
  it('up: multi-recipe evolved reaches every alternate component', () => {
    expect(closure(['ab'], graph, false)).toEqual(new Set(['ab', 'a', 'b', 'c']));
  });
});

describe('highlightSet (ticket 05 selection semantics)', () => {
  it('basic selection: descendants only (no component dimming)', () => {
    const hl = highlightSet('a', graph);
    expect(hl).toEqual(new Set(['a', 'ab', 'ad', 'abd']));
  });
  it('tier-2 selection: components AND tier-3 children', () => {
    // regression: tier-2 used to walk only one direction
    const hl = highlightSet('ab', graph);
    expect(hl).toContain('a'); // component
    expect(hl).toContain('b'); // component
    expect(hl).toContain('c'); // alternate component
    expect(hl).toContain('abd'); // tier-3 child
    expect(hl).toContain('ab'); // itself
    expect(hl).not.toContain('ad'); // sibling, unrelated
  });
  it('tier-3 selection: full component tree', () => {
    const hl = highlightSet('abd', graph);
    expect(hl).toEqual(new Set(['abd', 'ab', 'a', 'b', 'c', 'd']));
  });
});

describe('structuralDepth (session fix: depth from recipe structure, not wiki labels)', () => {
  const isEvolved = (id: string) => ['rbeam', 'inferno'].includes(id);
  const depthOf = (id: string): number => (isEvolved(id) ? 1 : 0);

  it('base-only recipe → tier-2 (depth 1)', () => {
    expect(structuralDepth([['a', 'b']], isEvolved, depthOf)).toBe(1);
  });
  it('recipe with an evolved component → tier-3 (depth 2)', () => {
    // regression: Tumor (Radiation Beam + Flesh) was labeled "Evo" by the wiki
    expect(structuralDepth([['rbeam', 'flesh']], isEvolved, depthOf)).toBe(2);
  });
  it('any recipe having an evolved component is enough (OR-of-ANDs)', () => {
    expect(structuralDepth([['a', 'b'], ['rbeam', 'b']], isEvolved, depthOf)).toBe(2);
  });
  it('no recipes → basic', () => {
    expect(structuralDepth([], isEvolved, depthOf)).toBe(0);
  });
});

describe('resolveDepths (ticket 11: the parser\'s recursion machinery has one home)', () => {
  // namespace: bases a,b; evolved ab (a+b), abc (ab+c) — mirrors the ball graph's chain shape
  const evolvedIds = new Set(['ab', 'abc']);
  const recipes: Record<string, string[][]> = {
    ab: [['a', 'b']],
    abc: [['ab', 'c']],
  };
  const recipesOf = (id: string) => recipes[id] ?? [];

  it('base-only recipe → depth 1; evolved component → depth 2', () => {
    const depths = resolveDepths(['ab', 'abc'], evolvedIds, recipesOf);
    expect(depths.get('ab')).toBe(1);
    expect(depths.get('abc')).toBe(2);
  });
  it('entity with no recipes → depth 0', () => {
    const depths = resolveDepths(['a'], new Set<string>(), recipesOf);
    expect(depths.get('a')).toBe(0);
    // and an evolved entity with no recipes is still depth 0 (structuralDepth: no recipes → 0)
    const noRecipeEvolved = resolveDepths(['z'], new Set(['z']), () => []);
    expect(noRecipeEvolved.get('z')).toBe(0);
  });
  it('shared cache: a component referenced by another entity resolves once', () => {
    // 'ab' appears as a component of 'abc'; both must agree on its depth
    const depths = resolveDepths(['a', 'b', 'ab', 'abc'], evolvedIds, recipesOf);
    expect(depths.get('ab')).toBe(1);
    expect(depths.get('abc')).toBe(depths.get('ab')! + 1);
  });
  it('cycle guard: a↔b cycle terminates with bounded depths (no infinite loop)', () => {
    const cyclic: Record<string, string[][]> = { a: [['b']], b: [['a']] };
    const cycIds = new Set(['a', 'b']);
    const depths = resolveDepths(['a', 'b'], cycIds, (id) => cyclic[id] ?? []);
    // guard pins depth 1 on first visit; each then resolves one above its
    // highest component (1 → 2): bounded-but-undefined, deterministic here
    expect(depths.get('a')).toBe(2);
    expect(depths.get('b')).toBe(2);
  });
  it('self-cycle terminates', () => {
    const selfRef: Record<string, string[][]> = { x: [['x']] };
    const depths = resolveDepths(['x'], new Set(['x']), (id) => selfRef[id] ?? []);
    expect(depths.get('x')).toBe(2);
  });
});

describe('factorizesIntoSlots (session fix: compact x+(y/z) notation is faithful)', () => {
  it('accepts per-slot alternates: a+(b/c)', () => {
    expect(factorizesIntoSlots([['a', 'b'], ['a', 'c']])).toBe(true);
  });
  it('accepts two alternate slots: (a/b)+(c/d)', () => {
    expect(factorizesIntoSlots([['a', 'c'], ['a', 'd'], ['b', 'c'], ['b', 'd']])).toBe(true);
  });
  it('accepts 3-way and 4-way single recipes', () => {
    expect(factorizesIntoSlots([['a', 'b', 'c']])).toBe(true);
    expect(factorizesIntoSlots([['a', 'b', 'c', 'd']])).toBe(true);
  });
  it('rejects ragged recipes (would break the notation)', () => {
    expect(factorizesIntoSlots([['a', 'b'], ['a']])).toBe(false);
  });
  it('rejects non-factorizable constraints (cross product not all valid)', () => {
    // a+d valid, b+c valid, but a+c and b+d invalid — cannot render as slots
    expect(factorizesIntoSlots([['a', 'd'], ['b', 'c']])).toBe(false);
  });
});

describe('recipeSlots / recipeHtml (the compact x+(y/z) notation has one home)', () => {
  it('recipeSlots groups recipes column-wise into per-slot alternates', () => {
    // Vampire Lord shape: shared first slot, alternate second slot
    expect(recipeSlots([['v', 'bleed'], ['v', 'dark']])).toEqual([['v'], ['bleed', 'dark']]);
  });
  it('recipeSlots preserves option order (first occurrence wins)', () => {
    expect(recipeSlots([['a', 'x'], ['b', 'x']])).toEqual([['a', 'b'], ['x']]);
  });
  it('recipeSlots on a single recipe is just its columns', () => {
    expect(recipeSlots([['a', 'b', 'c']])).toEqual([['a'], ['b'], ['c']]);
  });
  it('recipeHtml renders single-slot components as plain img + plus joins', () => {
    const html = recipeHtml([['a', 'b']], (id) => `<img data-id="${id}">`);
    expect(html).toBe('<img data-id="a"><span class="plus">+</span><img data-id="b">');
  });
  it('recipeHtml renders alternate slots as alt spans joined with or', () => {
    const html = recipeHtml([['a', 'b'], ['a', 'c']], (id) => `<img data-id="${id}">`);
    expect(html).toBe(
      '<img data-id="a"><span class="plus">+</span>' +
      '<span class="alt"><img data-id="b"><span class="or">/</span><img data-id="c"></span>'
    );
  });
  it('recipeHtml falls back to the raw id when the resolver returns null', () => {
    expect(recipeHtml([['ghost-id']], () => null)).toBe('ghost-id');
  });
});
