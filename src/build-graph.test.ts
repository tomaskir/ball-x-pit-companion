// Tests for the build-graph derivation and layout (src/build-graph.ts) —
// the Plan screen's layered "how do I build this" model. The flagship case
// is the user's example: planning Freeze Ray × Time Bomb must aggregate the
// base row (Freeze 1, both Lasers 0-1, Burn 1, Iron 1, Time 1), the evolved
// row (Freeze Ray 1, Bomb 1), the tier-3 row (Time Bomb 1) and the fusion
// row (the pair), all connected component → builder.
import { describe, it, expect } from 'vitest';
import {
  deriveBuildGraph,
  deriveBuildGraphView,
  layoutBuildGraph,
  BUILD_GRAPH_METRICS,
  BUILD_GRAPH_ROWS,
  FUSION_ROW,
  fusionNodeId,
  fusionNodePair,
  type BuildGraphSessionState,
} from './build-graph';
import { ballMap, passiveMap } from './catalog';
import { CHARACTERS } from './data/characters';
import { EDITIONS } from './data/editions';
import { createPlanState, type PlanAction } from './plan-state';

const node = (model: ReturnType<typeof deriveBuildGraph>, id: string) =>
  model.nodes.find((n) => n.id === id);

describe('build graph: the Freeze Ray × Time Bomb example', () => {
  const model = deriveBuildGraph(
    { singles: [], pairs: [{ a: 'freeze-ray', b: 'time-bomb' }] },
    ballMap,
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

  it('fusionNodePair reverses fusionNodeId; non-fusion ids yield null', () => {
    const fid = fusionNodeId('time-bomb', 'freeze-ray');
    expect(fusionNodePair(fid)).toEqual(['freeze-ray', 'time-bomb']);
    expect(fusionNodePair('freeze-ray')).toBeNull();
    expect(fusionNodePair('fusion:freeze-ray')).toBeNull();
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
    );
    expect(node(model, 'laser-horizontal')).toMatchObject({ min: 1, max: 2 });
    expect(node(model, 'laser-vertical')).toMatchObject({ min: 1, max: 2 });
  });

  it('non-factorizable recipes count components per recipe, not per column', () => {
    // Swamp = Earthquake+Poison OR Poison+Water. Poison sits in a different
    // slot in each recipe, so the column-wise alternate sum would report it
    // as 0-2; it is mandatory in both recipes (1-1).
    const model = deriveBuildGraph({ singles: ['swamp'], pairs: [] }, ballMap);
    expect(node(model, 'poison')).toMatchObject({ min: 1, max: 1 });
    expect(node(model, 'earthquake')).toMatchObject({ min: 0, max: 1 });
    expect(node(model, 'water')).toMatchObject({ min: 0, max: 1 });

    // Overgrowth = Earthquake+Cell OR Time+Wood: each component is 0-1.
    const overgrowth = deriveBuildGraph({ singles: ['overgrowth'], pairs: [] }, ballMap);
    for (const id of ['earthquake', 'cell', 'time', 'wood']) {
      expect(node(overgrowth, id)).toMatchObject({ min: 0, max: 1 });
    }
  });

  it('a ball both planned and demanded by a planned fusion counts twice', () => {
    const model = deriveBuildGraph(
      { singles: ['freeze-ray'], pairs: [{ a: 'freeze-ray', b: 'time-bomb' }] },
      ballMap,
    );
    expect(node(model, 'freeze-ray')).toMatchObject({ min: 2, max: 2, final: true });
    expect(node(model, 'freeze')).toMatchObject({ min: 2, max: 2 });
  });
});

describe('build graph: shape rules', () => {
  it('passives derive in their own namespace with no fusion row', () => {
    // Deadeye's Impaler = Deadeye's Cross + Gracious Impaler (both passives)
    const model = deriveBuildGraph({ singles: ['deadeyes-impaler'], pairs: [] }, passiveMap);
    expect(node(model, 'deadeyes-impaler')).toMatchObject({ row: 2, final: true });
    expect(node(model, 'deadeyes-cross')).toMatchObject({ row: 1 });
    expect(model.nodes.every((n) => n.row !== 3)).toBe(true);
    // nothing from the ball namespace leaks in
    expect(model.nodes.every((n) => passiveMap.has(n.id))).toBe(true);
  });

  it('a base ball planned alone is a final node in the base row', () => {
    const model = deriveBuildGraph({ singles: ['burn'], pairs: [] }, ballMap);
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
    );
    const fid1 = fusionNodeId('freeze-ray', 'time-bomb');
    const fid2 = fusionNodeId('bomb', 'burn');
    const fusionNodes = model.nodes.filter((n) => n.row === 3);
    expect(fusionNodes.map((n) => n.id)).toEqual([fid1, fid2]);
  });
});

describe('build graph layout', () => {
  it('fixed row bands: the canvas height never depends on which rows are filled', () => {
    const oneRow = layoutBuildGraph(deriveBuildGraph({ singles: ['burn'], pairs: [] }, ballMap), 4);
    const full = layoutBuildGraph(
      deriveBuildGraph({ singles: [], pairs: [{ a: 'freeze-ray', b: 'time-bomb' }] }, ballMap),
      4,
    );
    expect(oneRow.height).toBe(full.height);
    expect(full.height).toBe(4 * BUILD_GRAPH_METRICS.rowH);
  });

  it('nodes stack left-to-right within a band, centered vertically in it', () => {
    const layout = layoutBuildGraph(
      deriveBuildGraph({ singles: ['bomb', 'time-bomb'], pairs: [] }, ballMap),
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
      deriveBuildGraph({ singles: ['bomb'], pairs: [] }, ballMap),
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

describe('build graph: done tracking', () => {
  it('a done node stops contributing demand — base balls show what is still needed', () => {
    const all = deriveBuildGraph(
      { singles: [], pairs: [{ a: 'freeze-ray', b: 'time-bomb' }] },
      ballMap,
    );
    const done = deriveBuildGraph(
      { singles: [], pairs: [{ a: 'freeze-ray', b: 'time-bomb' }] },
      ballMap,
      { done: new Set(['freeze-ray']) },
    );
    // Freeze Ray done: Freeze and both lasers drop to zero remaining demand
    expect(node(done, 'freeze')).toMatchObject({ min: 0, max: 0 });
    expect(node(done, 'laser-horizontal')).toMatchObject({ min: 0, max: 0 });
    // the done node itself keeps its count and carries the flag
    expect(node(done, 'freeze-ray')).toMatchObject({ min: 1, max: 1, done: true });
    // untouched branches keep their counts (same model without done marks)
    expect(node(done, 'bomb')).toMatchObject({ min: 1, max: 1, done: false });
    expect(node(done, 'burn')).toMatchObject({ min: 1, max: 1 });
    // sanity: without the mark nothing is done or freed
    expect(node(all, 'freeze')).toMatchObject({ min: 1, max: 1 });
  });

  it('a done fusion frees its pair balls; freed base balls are suppressed', () => {
    const done = deriveBuildGraph(
      { singles: [], pairs: [{ a: 'freeze-ray', b: 'time-bomb' }] },
      ballMap,
      { done: new Set(['fusion:freeze-ray+time-bomb']) },
    );
    const fid = fusionNodeId('freeze-ray', 'time-bomb');
    expect(node(done, fid)!.done).toBe(true);
    // Time Bomb's demand came only from the fusion → freed; Bomb stays
    // demanded by nothing else here... Bomb was only needed by Time Bomb → 0
    expect(node(done, 'time-bomb')).toMatchObject({ min: 0, max: 0 });
    expect(node(done, 'bomb')).toMatchObject({ min: 0, max: 0, suppressed: true });
    expect(node(done, 'time')).toMatchObject({ min: 0, max: 0, suppressed: true });
    // Freeze Ray was only the fusion's component → freed too
    expect(node(done, 'freeze-ray')).toMatchObject({ min: 0, max: 0, suppressed: true });
    expect(node(done, 'freeze')).toMatchObject({ min: 0, max: 0, suppressed: true });
  });

  it('partial done: a shared base stays demanded while one of its consumers is done', () => {
    // Bomb planned as a single AND inside Time Bomb; Time Bomb done leaves
    // the single's copy — Burn still needs 1
    const done = deriveBuildGraph(
      { singles: ['bomb', 'time-bomb'], pairs: [] },
      ballMap,
      { done: new Set(['time-bomb']) },
    );
    expect(node(done, 'bomb')).toMatchObject({ min: 1, max: 1, done: false });
    expect(node(done, 'burn')).toMatchObject({ min: 1, max: 1 });
    expect(node(done, 'time')).toMatchObject({ min: 0, max: 0, suppressed: true });
  });

  it('a pure-alternate base (0-1) is never suppressed while its max is above zero', () => {
    const done = deriveBuildGraph(
      { singles: [], pairs: [{ a: 'freeze-ray', b: 'time-bomb' }] },
      ballMap,
      { done: new Set<string>() },
    );
    expect(node(done, 'laser-horizontal')).toMatchObject({ min: 0, max: 1, suppressed: false });
  });
});

describe('build graph: done/suppressed nodes sort to the right of their row', () => {
  it('freed base balls move right of still-needed ones; order among themselves preserved', () => {
    // Freeze Ray done → Freeze + both lasers freed (0 remaining); the Time
    // Bomb branch stays live. Row 0 must read: live balls left, freed right.
    const model = deriveBuildGraph(
      { singles: [], pairs: [{ a: 'freeze-ray', b: 'time-bomb' }] },
      ballMap,
      { done: new Set(['freeze-ray']) },
    );
    const row0 = model.nodes.filter((n) => n.row === 0).map((n) => n.id);
    const freed = new Set(['freeze', 'laser-horizontal', 'laser-vertical']);
    const live = row0.filter((id) => !freed.has(id));
    const done = row0.filter((id) => freed.has(id));
    expect(live).toEqual(['burn', 'iron', 'time']);
    expect(done).toEqual(['freeze', 'laser-horizontal', 'laser-vertical']);
    expect(row0.indexOf('freeze')).toBeGreaterThan(row0.indexOf('time'));
  });

  it('a done-marked node with remaining demand also moves right', () => {
    // Bomb done while still demanded (single + Time Bomb): it reads disabled,
    // so it goes right within row 1
    const model = deriveBuildGraph(
      { singles: ['bomb', 'time-bomb'], pairs: [] },
      ballMap,
      { done: new Set(['bomb']) },
    );
    const row1 = model.nodes.filter((n) => n.row === 1).map((n) => n.id);
    expect(row1[row1.length - 1]).toBe('bomb');
  });

  it('layout positions follow: a freed node sits right of the live ones', () => {
    const layout = layoutBuildGraph(
      deriveBuildGraph(
        { singles: [], pairs: [{ a: 'freeze-ray', b: 'time-bomb' }] },
        ballMap,
        { done: new Set(['freeze-ray']) },
      ),
      4,
    );
    const row0 = layout.nodes.filter((n) => n.row === 0);
    const freeze = row0.find((n) => n.id === 'freeze')!;
    const burn = row0.find((n) => n.id === 'burn')!;
    expect(freeze.x).toBeGreaterThan(burn.x);
  });
});

describe('build graph view: the whole Plan-screen derivation', () => {
  const planStateWith = (actions: PlanAction[]) => {
    const plan = createPlanState();
    for (const action of actions) plan.dispatch(action);
    return plan.derive([]);
  };
  const session = (over: Partial<BuildGraphSessionState> = {}): BuildGraphSessionState => ({
    focus: null,
    done: new Set<string>(),
    collapsed: { balls: false, passives: false },
    editions: [...EDITIONS],
    ...over,
  });
  const fusionId = fusionNodeId('freeze-ray', 'time-bomb');

  it('derives both namespace graphs from the plan and embeds the session state', () => {
    const collapsed = { balls: true, passives: false };
    const view = deriveBuildGraphView(
      planStateWith([{ type: 'togglePlanFusion', a: 'freeze-ray', b: 'time-bomb' }]),
      session({ collapsed }),
    );
    expect(view.balls.nodes.some((n) => n.id === fusionId)).toBe(true);
    expect(view.passives.nodes).toHaveLength(0);
    expect(view.focus).toBe(null);
    expect(view.related.size).toBe(0);
    expect(view.collapsed).toEqual(collapsed);
    // the flags are copied, not shared with the caller's session object
    expect(view.collapsed).not.toBe(collapsed);
  });

  it('resolves a planned Evolves-instead pair into a single target of the evolved ball', () => {
    const view = deriveBuildGraphView(
      planStateWith([{ type: 'togglePlanFusion', a: 'freeze', b: 'laser-horizontal' }]),
      session(),
    );
    expect(view.balls.nodes.find((n) => n.id === 'freeze-ray')!.final).toBe(true);
    expect(view.balls.nodes.some((n) => n.row === FUSION_ROW)).toBe(false);
  });

  it('keeps fusion-invalid pairs out of the graph (The Potager cannot build them)', () => {
    const plan = createPlanState();
    plan.dispatch({
      type: 'hydrate',
      plan: { upgradesOn: true, balls: [], passives: [], fused: [{ a: 'flash', b: 'glacier' }] },
    });
    const potager = CHARACTERS.filter((c) => c.id === 'the-potager');
    const planState = plan.derive(potager);
    expect(planState.balls[0].kind === 'fused' && planState.balls[0].fusionInvalid).toBe(true);
    const view = deriveBuildGraphView(planState, session());
    expect(view.balls.nodes.some((n) => n.row === FUSION_ROW)).toBe(false);
    expect(view.balls.nodes.some((n) => n.id === 'flash')).toBe(false);
  });

  it('keeps over-limit entries out of the graph', () => {
    const view = deriveBuildGraphView(
      planStateWith([{
        type: 'hydrate',
        plan: {
          upgradesOn: false,
          balls: ['bomb', 'inferno', 'frozen-flame', 'elemental', 'time-bomb'],
          passives: [],
          fused: [],
        },
      }]),
      session(),
    );
    expect(view.balls.nodes.some((n) => n.id === 'frozen-flame')).toBe(false);
    expect(view.balls.nodes.some((n) => n.id === 'time-bomb')).toBe(true);
  });

  it('validates the focus id against both graphs and walks upstream + downstream', () => {
    const planState = planStateWith([{ type: 'togglePlanFusion', a: 'freeze-ray', b: 'time-bomb' }]);
    const onBall = deriveBuildGraphView(planState, session({ focus: 'burn' }));
    expect(onBall.focus).toBe('burn');
    expect(onBall.related.has('bomb')).toBe(true); // downstream
    expect(onBall.related.has(fusionId)).toBe(true); // rides in via bomb
    expect(onBall.related.has('freeze')).toBe(false); // other branch

    const onFusion = deriveBuildGraphView(planState, session({ focus: fusionId }));
    expect(onFusion.focus).toBe(fusionId);
    expect(onFusion.related.has('freeze')).toBe(true); // pair ancestry
    expect(onFusion.related.has('freeze-ray')).toBe(true);
    expect(onFusion.related.has('time-bomb')).toBe(true);

    // an id outside both graphs (and a passive id with only a ball plan)
    // highlights nothing
    for (const focus of ['bleed', 'deadeyes-impaler']) {
      const outside = deriveBuildGraphView(planState, session({ focus }));
      expect(outside.focus, focus).toBe(null);
      expect(outside.related.size, focus).toBe(0);
    }
  });

  it('done marks ride into both graphs and free their components', () => {
    const view = deriveBuildGraphView(
      planStateWith([{ type: 'togglePlanFusion', a: 'freeze-ray', b: 'time-bomb' }]),
      session({ done: new Set(['freeze-ray']) }),
    );
    expect(view.balls.nodes.find((n) => n.id === 'freeze-ray')!.done).toBe(true);
    expect(view.balls.nodes.find((n) => n.id === 'freeze')!.min).toBe(0);
  });

  it('the row model is one definition: row counts, fusion index, and labels', () => {
    expect(BUILD_GRAPH_ROWS.balls).toEqual({
      rowCount: 4,
      fusionRow: FUSION_ROW,
      labels: ['Basic', 'Evolved', 'Tier-3', 'Fusions'],
    });
    expect(BUILD_GRAPH_ROWS.passives).toEqual({
      rowCount: 3,
      fusionRow: null,
      labels: ['Basic', 'Evolved', 'Tier-3'],
    });
    const view = deriveBuildGraphView(
      planStateWith([{ type: 'togglePlanFusion', a: 'freeze-ray', b: 'time-bomb' }]),
      session(),
    );
    expect(view.balls.height).toBe(BUILD_GRAPH_ROWS.balls.rowCount * BUILD_GRAPH_METRICS.rowH);
    expect(view.passives.height).toBe(BUILD_GRAPH_ROWS.passives.rowCount * BUILD_GRAPH_METRICS.rowH);
  });
});
