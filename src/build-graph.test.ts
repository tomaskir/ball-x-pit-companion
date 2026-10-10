// Tests for the build-graph derivation and layout (src/build-graph.ts) —
// the Plan screen's layered "how do I build this" model. The flagship case
// is the user's example: planning Freeze Ray × Time Bomb must aggregate the
// base row (Freeze 1, both Lasers 0-1, Burn 1, Iron 1, Time 1), the evolved
// row (Freeze Ray 1, Bomb 1), the tier-3 row (Time Bomb 1) and the fusion
// row (the pair), all connected component → builder.
import { describe, it, expect } from 'vitest';
import { deriveBuildGraph, layoutBuildGraph, BUILD_GRAPH_METRICS, fusionNodeId } from './build-graph';
import { ballMap, passiveMap } from './catalog';

const node = (model: ReturnType<typeof deriveBuildGraph>, id: string) =>
  model.nodes.find((n) => n.id === id);

describe('build graph: the Freeze Ray × Time Bomb example', () => {
  const model = deriveBuildGraph(
    { singles: [], pairs: [{ a: 'freeze-ray', b: 'time-bomb' }] },
    ballMap,
    { fusionRow: true },
  );

  it('the base row aggregates every base ball with its demand', () => {
    expect(node(model, 'freeze')).toMatchObject({ row: 0, min: 1, max: 1 });
    // Freeze Ray builds two ways — each laser is a per-slot alternate
    expect(node(model, 'laser-horizontal')).toMatchObject({ row: 0, min: 0, max: 1 });
    expect(node(model, 'laser-vertical')).toMatchObject({ row: 0, min: 0, max: 1 });
    // Bomb = Burn + Iron, both mandatory
    expect(node(model, 'burn')).toMatchObject({ row: 0, min: 1, max: 1 });
    expect(node(model, 'iron')).toMatchObject({ row: 0, min: 1, max: 1 });
    expect(node(model, 'time')).toMatchObject({ row: 0, min: 1, max: 1 });
  });

  it('the evolved and tier-3 rows hold the intermediate balls', () => {
    expect(node(model, 'freeze-ray')).toMatchObject({ row: 1, min: 1, max: 1, final: false });
    expect(node(model, 'bomb')).toMatchObject({ row: 1, min: 1, max: 1 });
    expect(node(model, 'time-bomb')).toMatchObject({ row: 2, min: 1, max: 1 });
  });

  it('the fusion row holds one namespaced pair node, final-styled', () => {
    const fid = fusionNodeId('freeze-ray', 'time-bomb');
    expect(fid).toMatch(/^fusion:/);
    expect(node(model, fid)).toMatchObject({
      row: 3,
      final: true,
      name: 'Freeze Ray × Time Bomb',
      min: 1,
      max: 1,
    });
  });

  it('edges connect every component to its builder, alternates included', () => {
    const has = (from: string, to: string) => model.edges.some((e) => e.from === from && e.to === to);
    expect(has('freeze', 'freeze-ray')).toBe(true);
    expect(has('laser-horizontal', 'freeze-ray')).toBe(true);
    expect(has('laser-vertical', 'freeze-ray')).toBe(true);
    expect(has('burn', 'bomb')).toBe(true);
    expect(has('iron', 'bomb')).toBe(true);
    expect(has('bomb', 'time-bomb')).toBe(true);
    expect(has('time', 'time-bomb')).toBe(true);
    const fid = fusionNodeId('freeze-ray', 'time-bomb');
    expect(has('freeze-ray', fid)).toBe(true);
    expect(has('time-bomb', fid)).toBe(true);
  });
});

describe('build graph: count semantics', () => {
  it('shared bases sum across targets (physical copies)', () => {
    // Bomb planned as a single AND inside Time Bomb: two Bombs, so two Burns
    const model = deriveBuildGraph(
      { singles: ['bomb', 'time-bomb'], pairs: [] },
      ballMap,
      { fusionRow: true },
    );
    expect(node(model, 'bomb')).toMatchObject({ min: 2, max: 2, final: true });
    expect(node(model, 'burn')).toMatchObject({ min: 2, max: 2 });
    expect(node(model, 'iron')).toMatchObject({ min: 2, max: 2 });
    expect(node(model, 'time')).toMatchObject({ min: 1, max: 1 });
  });

  it('alternate paths aggregate into ranges (0-2)', () => {
    // Freeze Ray and Laser Beam each need one laser, each slot alternates
    const model = deriveBuildGraph(
      { singles: ['freeze-ray', 'laser-beam'], pairs: [] },
      ballMap,
      { fusionRow: true },
    );
    expect(node(model, 'laser-horizontal')).toMatchObject({ min: 0, max: 2 });
    expect(node(model, 'laser-vertical')).toMatchObject({ min: 0, max: 2 });
    expect(node(model, 'freeze')).toMatchObject({ min: 1, max: 1 });
  });

  it('mandatory + optional demand mixes into a bounded range (1-2)', () => {
    // Holy Laser needs both lasers outright; Laser Beam needs one of them
    const model = deriveBuildGraph(
      { singles: ['holy-laser', 'laser-beam'], pairs: [] },
      ballMap,
      { fusionRow: true },
    );
    expect(node(model, 'laser-horizontal')).toMatchObject({ min: 1, max: 2 });
    expect(node(model, 'laser-vertical')).toMatchObject({ min: 1, max: 2 });
  });

  it('a ball both planned and demanded by a planned fusion counts twice', () => {
    const model = deriveBuildGraph(
      { singles: ['freeze-ray'], pairs: [{ a: 'freeze-ray', b: 'time-bomb' }] },
      ballMap,
      { fusionRow: true },
    );
    expect(node(model, 'freeze-ray')).toMatchObject({ min: 2, max: 2, final: true });
    expect(node(model, 'freeze')).toMatchObject({ min: 2, max: 2 });
  });
});

describe('build graph: shape rules', () => {
  it('passives derive in their own namespace with no fusion row', () => {
    // Deadeye's Impaler = Deadeye's Cross + Gracious Impaler (both passives)
    const model = deriveBuildGraph({ singles: ['deadeyes-impaler'], pairs: [] }, passiveMap, { fusionRow: false });
    expect(node(model, 'deadeyes-impaler')).toMatchObject({ row: 2, final: true });
    expect(node(model, 'deadeyes-cross')).toMatchObject({ row: 1 });
    expect(model.nodes.every((n) => n.row !== 3)).toBe(true);
    // nothing from the ball namespace leaks in
    expect(model.nodes.every((n) => passiveMap.has(n.id))).toBe(true);
  });

  it('a base ball planned alone is a final node in the base row', () => {
    const model = deriveBuildGraph({ singles: ['burn'], pairs: [] }, ballMap, { fusionRow: true });
    expect(node(model, 'burn')).toMatchObject({ row: 0, min: 1, max: 1, final: true });
    expect(model.nodes).toHaveLength(1);
    expect(model.edges).toHaveLength(0);
  });

  it('nodes sort per row by complexity, most complex left; ties in catalog order', () => {
    // Elemental (4-wide recipe, complexity 4) leads the row; Bomb, Frozen
    // Flame and Inferno all hold 2 base balls — ties break in catalog order.
    // Inferno's alternates ([burn,wind]/[burn,time]) make Wind and Time 0-1.
    const model = deriveBuildGraph(
      { singles: ['inferno', 'frozen-flame', 'bomb', 'elemental'], pairs: [] },
      ballMap,
      { fusionRow: true },
    );
    const row1 = model.nodes.filter((n) => n.row === 1).map((n) => n.id);
    expect(row1).toEqual(['elemental', 'bomb', 'frozen-flame', 'inferno']);
    // Wind is mandatory via Elemental (4-wide) and alternate via Inferno: 1-2
    expect(node(model, 'wind')).toMatchObject({ min: 1, max: 2 });
    expect(node(model, 'time')).toMatchObject({ min: 0, max: 1 });
  });

  it('fusion row nodes keep the pair compose order (no complexity sort)', () => {
    const model = deriveBuildGraph(
      { singles: [], pairs: [{ a: 'freeze-ray', b: 'time-bomb' }, { a: 'bomb', b: 'burn' }] },
      ballMap,
      { fusionRow: true },
    );
    const fid1 = fusionNodeId('freeze-ray', 'time-bomb');
    const fid2 = fusionNodeId('bomb', 'burn');
    const fusionNodes = model.nodes.filter((n) => n.row === 3);
    expect(fusionNodes.map((n) => n.id)).toEqual([fid1, fid2]);
  });
});

describe('build graph layout', () => {
  it('fixed row bands: the canvas height never depends on which rows are filled', () => {
    const oneRow = layoutBuildGraph(deriveBuildGraph({ singles: ['burn'], pairs: [] }, ballMap, { fusionRow: true }), 4);
    const full = layoutBuildGraph(
      deriveBuildGraph({ singles: [], pairs: [{ a: 'freeze-ray', b: 'time-bomb' }] }, ballMap, { fusionRow: true }),
      4,
    );
    expect(oneRow.height).toBe(full.height);
    expect(full.height).toBe(4 * BUILD_GRAPH_METRICS.rowH);
  });

  it('nodes stack left-to-right within a band, centered vertically in it', () => {
    const layout = layoutBuildGraph(
      deriveBuildGraph({ singles: ['bomb', 'time-bomb'], pairs: [] }, ballMap, { fusionRow: true }),
      4,
    );
    const bomb = layout.nodes.find((n) => n.id === 'bomb')!;
    const timeBomb = layout.nodes.find((n) => n.id === 'time-bomb')!;
    const burn = layout.nodes.find((n) => n.id === 'burn')!;
    const iron = layout.nodes.find((n) => n.id === 'iron')!;
    // each row band stacks its nodes left-to-right (catalog order here)
    expect(burn.row).toBe(0);
    expect(iron.x).toBeGreaterThan(burn.x);
    // Bomb (row 1) and Time Bomb (row 2) sit vertically inside their bands
    expect(bomb.row).toBe(1);
    expect(timeBomb.row).toBe(2);
    expect(bomb.y).toBe(1 * BUILD_GRAPH_METRICS.rowH + (BUILD_GRAPH_METRICS.rowH - BUILD_GRAPH_METRICS.nodeH) / 2);
    expect(layout.width).toBeGreaterThan(BUILD_GRAPH_METRICS.nodeW);
  });

  it('edges become bezier paths from the builder above to the component below', () => {
    const layout = layoutBuildGraph(
      deriveBuildGraph({ singles: ['bomb'], pairs: [] }, ballMap, { fusionRow: true }),
      4,
    );
    expect(layout.edges).toHaveLength(2); // burn → bomb, iron → bomb
    for (const e of layout.edges) {
      expect(e.path).toMatch(/^M [\d.]+ [\d.]+ C /);
    }
    const burn = layout.nodes.find((n) => n.id === 'burn')!;
    const bomb = layout.nodes.find((n) => n.id === 'bomb')!;
    const edge = layout.edges.find((e) => e.from === 'burn')!;
    // the path starts at burn's bottom center and ends at bomb's top center
    expect(edge.path).toContain(`M ${burn.x + burn.w / 2} ${burn.y + BUILD_GRAPH_METRICS.nodeH}`);
    expect(edge.path.endsWith(`${bomb.x + bomb.w / 2} ${bomb.y}`)).toBe(true);
  });
});
