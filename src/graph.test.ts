// Graph logic tests — ticket 05 interaction semantics plus the pure helpers
// extracted from the island (src/graph.ts). Fixture graph mirrors the real
// ball graph's shapes: multi-recipe alternates, 3-way, 4-way, chains.
import { describe, it, expect } from 'vitest';
import { byId, closure, childrenOf, componentsOf, highlightSet, structuralDepth, factorizesIntoSlots, type GraphItem } from './graph';

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
