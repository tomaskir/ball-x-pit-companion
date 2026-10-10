// Tests for the plan-state module through its one interface:
// createPlanState() → dispatch(planAction) / derive(selectedChars) /
// snapshot(selectedChars) / has(id) / hasPair(a, b) / limits(). The seam is
// "selectedChars in, PlanState out" — the plan's characters are the shared
// selection owned by view-state.ts, so every derive/snapshot call hands
// them in. Integration through the full view state (action forwarding, the
// shared selectedChars, the ViewModel's plan fields for the renderer) lives
// in src/view-state.test.ts.
import { describe, it, expect } from 'vitest';
import { createPlanState } from './plan-state';
import { CHARACTERS } from './data/characters';

/** The shared selection, handed in — plan-state never builds it itself. */
const chars = (...ids: string[]): (typeof CHARACTERS)[number][] =>
  ids.map((id) => CHARACTERS.find((c) => c.id === id)!);

describe('plan state: limits (End game upgrades toggle)', () => {
  it('defaults: upgrades on, limits 2 chars / 5 balls / 5 passives, empty plan', () => {
    const state = createPlanState();
    const plan = state.derive([]);
    expect(plan.upgradesOn).toBe(true);
    expect(plan.limits).toEqual({ chars: 2, balls: 5, passives: 5 });
    expect(plan.counts).toEqual({ chars: 0, balls: 0, passives: 0 });
    expect(plan.overLimit).toBe(false);
    expect(plan.hint).toBe('');
  });

  it('toggleUpgrades flips the toggle and shrinks the limits to 1/4/4', () => {
    const state = createPlanState();
    state.dispatch({ type: 'toggleUpgrades' });
    expect(state.derive([]).upgradesOn).toBe(false);
    expect(state.derive([]).limits).toEqual({ chars: 1, balls: 4, passives: 4 });
    state.dispatch({ type: 'toggleUpgrades' });
    expect(state.derive([]).upgradesOn).toBe(true);
    expect(state.derive([]).limits).toEqual({ chars: 2, balls: 5, passives: 5 });
  });

  it('limits() mirrors the derived limits (view-state reads it for the character slots)', () => {
    const state = createPlanState();
    expect(state.limits()).toEqual({ chars: 2, balls: 5, passives: 5 });
    state.dispatch({ type: 'toggleUpgrades' });
    expect(state.limits()).toEqual({ chars: 1, balls: 4, passives: 4 });
  });
});

describe('plan state: plan items (balls/passives, pick order, limits)', () => {
  it('togglePlanItem adds balls and passives in pick order, split by namespace', () => {
    const state = createPlanState();
    state.dispatch({ type: 'togglePlanItem', id: 'flash' });
    let plan = state.derive([]);
    expect(plan.balls.map((e) => e.item.id)).toEqual(['flash']);
    expect(plan.passives).toHaveLength(0);
    state.dispatch({ type: 'togglePlanItem', id: 'wagon-wheel' });
    plan = state.derive([]);
    expect(plan.passives.map((e) => e.item.id)).toEqual(['wagon-wheel']);
    expect(plan.balls.map((e) => e.item.id)).toEqual(['flash']);
  });

  it('re-clicking a plan item removes it, keeping the others in pick order', () => {
    const state = createPlanState();
    state.dispatch({ type: 'togglePlanItem', id: 'flash' });
    state.dispatch({ type: 'togglePlanItem', id: 'glacier' });
    state.dispatch({ type: 'togglePlanItem', id: 'flash' });
    expect(state.derive([]).balls.map((e) => e.item.id)).toEqual(['glacier']);
  });

  it('adding past the active ball limit is a no-op (5 with upgrades on)', () => {
    const state = createPlanState();
    for (const id of ['flash', 'glacier', 'maggot', 'flicker', 'burn']) state.dispatch({ type: 'togglePlanItem', id });
    const plan = state.derive([]);
    expect(plan.balls).toHaveLength(5);
    state.dispatch({ type: 'togglePlanItem', id: 'vampire' });
    const after = state.derive([]);
    expect(after.balls).toHaveLength(5);
    expect(after.balls.some((e) => e.item.id === 'vampire')).toBe(false);
  });

  it('the passive limit is enforced separately (4 with upgrades off)', () => {
    const state = createPlanState();
    state.dispatch({ type: 'toggleUpgrades' });
    for (const id of ['wagon-wheel', 'ardent-tire', 'deadeyes-cross', 'deadeyes-impaler']) {
      state.dispatch({ type: 'togglePlanItem', id });
    }
    state.dispatch({ type: 'togglePlanItem', id: 'magnet' });
    expect(state.derive([]).passives).toHaveLength(4);
  });

  it('toggling upgrades off with 5 balls keeps all, marks the 5th over limit', () => {
    const state = createPlanState();
    for (const id of ['flash', 'glacier', 'maggot', 'flicker', 'burn']) state.dispatch({ type: 'togglePlanItem', id });
    state.dispatch({ type: 'toggleUpgrades' });
    const plan = state.derive([]);
    expect(plan.balls).toHaveLength(5);
    expect(plan.balls[4].overLimit).toBe(true);
    expect(plan.balls[3].overLimit).toBe(false);
    expect(plan.hint).toContain('Over the limit');
  });

  it('the hint clears when the over-limit pick is removed', () => {
    const state = createPlanState();
    for (const id of ['flash', 'glacier', 'maggot', 'flicker', 'burn']) state.dispatch({ type: 'togglePlanItem', id });
    state.dispatch({ type: 'toggleUpgrades' });
    state.dispatch({ type: 'togglePlanItem', id: 'burn' });
    const plan = state.derive([]);
    expect(plan.overLimit).toBe(false);
    expect(plan.hint).toBe('');
  });

  it('plan entries carry verdicts against the handed-in selection', () => {
    const state = createPlanState();
    state.dispatch({ type: 'togglePlanItem', id: 'wagon-wheel' });
    const plan = state.derive(chars('the-ballbearer'));
    expect(plan.passives[0].verdict).toMatchObject({ verdict: 'red' });
  });

  it('unknown ids are ignored', () => {
    const state = createPlanState();
    state.dispatch({ type: 'togglePlanItem', id: 'not-a-real-id' });
    const plan = state.derive([]);
    expect(plan.balls).toHaveLength(0);
    expect(plan.passives).toHaveLength(0);
  });

  it('has(id) answers plan membership through the catalog namespace (the seam the selection boxes query)', () => {
    const state = createPlanState();
    state.dispatch({ type: 'togglePlanItem', id: 'flash' });
    state.dispatch({ type: 'togglePlanItem', id: 'wagon-wheel' });
    expect(state.has('flash')).toBe(true); // planned ball
    expect(state.has('wagon-wheel')).toBe(true); // planned passive
    expect(state.has('glacier')).toBe(false); // ball, not planned
    expect(state.has('magnet')).toBe(false); // passive, not planned
    expect(state.has('not-a-real-id')).toBe(false);
  });
});

describe('plan state: clearPlan (plan side)', () => {
  it('clears balls, passives and fused pairs and resets the toggle to on', () => {
    const state = createPlanState();
    state.dispatch({ type: 'togglePlanItem', id: 'flash' });
    state.dispatch({ type: 'togglePlanItem', id: 'wagon-wheel' });
    state.dispatch({ type: 'togglePlanFusion', a: 'glacier', b: 'maggot' });
    state.dispatch({ type: 'toggleUpgrades' });
    state.dispatch({ type: 'clearPlan' });
    const plan = state.derive([]);
    expect(plan.counts).toEqual({ chars: 0, balls: 0, passives: 0 });
    expect(plan.upgradesOn).toBe(true);
    expect(plan.fused).toHaveLength(0);
  });

  it('leaves the handed-in characters alone — the shared selection is view-state\'s to clear', () => {
    const state = createPlanState();
    state.dispatch({ type: 'togglePlanItem', id: 'flash' });
    state.dispatch({ type: 'clearPlan' });
    const plan = state.derive(chars('the-warrior'));
    expect(plan.counts.chars).toBe(1);
    expect(plan.characters.map((c) => c.character.id)).toEqual(['the-warrior']);
  });
});

describe('plan state: hydrate (plan side)', () => {
  it('restores balls, passives and the toggle in pick order', () => {
    const state = createPlanState();
    state.dispatch({
      type: 'hydrate',
      plan: { upgradesOn: false, chars: [], balls: ['flash', 'glacier'], passives: ['wagon-wheel'], fused: [] },
    });
    const plan = state.derive([]);
    expect(plan.upgradesOn).toBe(false);
    expect(plan.balls.map((e) => e.item.id)).toEqual(['flash', 'glacier']);
    expect(plan.passives.map((e) => e.item.id)).toEqual(['wagon-wheel']);
  });

  it('filters unknown ids and duplicates', () => {
    const state = createPlanState();
    state.dispatch({
      type: 'hydrate',
      plan: {
        upgradesOn: true,
        chars: [],
        balls: ['flash', 'not-a-ball', 'flash'],
        passives: ['wagon-wheel', 'not-a-passive'],
        fused: [],
      },
    });
    const plan = state.derive([]);
    expect(plan.balls.map((e) => e.item.id)).toEqual(['flash']);
    expect(plan.passives.map((e) => e.item.id)).toEqual(['wagon-wheel']);
  });

  it('keeps over-limit selections without trimming (marked over limit instead)', () => {
    const state = createPlanState();
    state.dispatch({
      type: 'hydrate',
      plan: {
        upgradesOn: false,
        chars: [],
        balls: ['flash', 'glacier', 'maggot', 'flicker', 'burn'],
        passives: [],
        fused: [],
      },
    });
    const plan = state.derive([]);
    expect(plan.balls[4].overLimit).toBe(true);
    expect(plan.overLimit).toBe(true);
  });

  it('ignores the snapshot\'s chars — the shared selection is restored by view-state', () => {
    const state = createPlanState();
    state.dispatch({
      type: 'hydrate',
      plan: { upgradesOn: true, chars: ['the-warrior'], balls: ['flash'], passives: [], fused: [] },
    });
    const plan = state.derive([]);
    expect(plan.balls.map((e) => e.item.id)).toEqual(['flash']);
    expect(plan.counts.chars).toBe(0); // derive only counts what it is handed
    expect(state.snapshot([]).chars).toEqual([]);
  });

  it('validates fused pairs: unknown/non-ball/degenerate/duplicate pairs are dropped', () => {
    const state = createPlanState();
    state.dispatch({
      type: 'hydrate',
      plan: {
        upgradesOn: true,
        chars: [],
        balls: [],
        passives: [],
        fused: [
          { a: 'flash', b: 'glacier' },
          { a: 'flash', b: 'not-a-ball' },
          { a: 'wagon-wheel', b: 'magnet' }, // passives, not balls
          { a: 'flash', b: 'flash' }, // degenerate
          { a: 'glacier', b: 'flash' }, // duplicate of pair 1 (sorted identity)
        ],
      },
    });
    const plan = state.derive([]);
    expect(plan.fused).toHaveLength(1);
    expect(plan.fused[0].a.id).toBe('flash');
    expect(plan.fused[0].b.id).toBe('glacier');
  });

  it('snapshot round-trips through hydrate (empty chars — the shared selection rides through view-state)', () => {
    const state = createPlanState();
    state.dispatch({ type: 'togglePlanItem', id: 'flash' });
    state.dispatch({ type: 'togglePlanFusion', a: 'glacier', b: 'maggot' });
    state.dispatch({ type: 'toggleUpgrades' });
    const snapshot = state.snapshot([]);
    expect(snapshot.chars).toEqual([]);
    const restored = createPlanState();
    restored.dispatch({ type: 'hydrate', plan: snapshot });
    expect(restored.snapshot([])).toEqual(snapshot);
  });

  it('snapshot(selectedChars) serializes the handed-in selection as the plan\'s characters', () => {
    const state = createPlanState();
    state.dispatch({ type: 'togglePlanItem', id: 'flash' });
    expect(state.snapshot(chars('the-warrior', 'the-shade'))).toEqual({
      upgradesOn: true,
      chars: ['the-warrior', 'the-shade'],
      balls: ['flash'],
      passives: [],
      fused: [],
    });
  });
});

describe('plan state: fused pairs in the plan', () => {
  it('togglePlanFusion adds a pair in compose order, counted as one ball slot', () => {
    const state = createPlanState();
    state.dispatch({ type: 'togglePlanFusion', a: 'flash', b: 'glacier' });
    const plan = state.derive([]);
    expect(plan.fused).toHaveLength(1);
    expect(plan.fused[0].a.id).toBe('flash');
    expect(plan.fused[0].b.id).toBe('glacier');
    expect(plan.fused[0].name).toBe('Flash × Glacier');
    expect(plan.counts.balls).toBe(1);
  });

  it('pair identity is order-insensitive: the reverse composition toggles it off', () => {
    const state = createPlanState();
    state.dispatch({ type: 'togglePlanFusion', a: 'flash', b: 'glacier' });
    state.dispatch({ type: 'togglePlanFusion', a: 'glacier', b: 'flash' });
    expect(state.derive([]).fused).toHaveLength(0);
    expect(state.derive([]).counts.balls).toBe(0);
  });

  it('re-adding the same pair (same order) toggles it off', () => {
    const state = createPlanState();
    state.dispatch({ type: 'togglePlanFusion', a: 'flash', b: 'glacier' });
    state.dispatch({ type: 'togglePlanFusion', a: 'flash', b: 'glacier' });
    expect(state.derive([]).fused).toHaveLength(0);
  });

  it('a fused pair counts toward the ball limit: 4 singles + 1 fused fills the 5 limit', () => {
    const state = createPlanState();
    for (const id of ['flash', 'glacier', 'maggot', 'flicker']) state.dispatch({ type: 'togglePlanItem', id });
    state.dispatch({ type: 'togglePlanFusion', a: 'burn', b: 'vampire' });
    state.dispatch({ type: 'togglePlanItem', id: 'wind' });
    const plan = state.derive([]);
    expect(plan.balls.some((e) => e.item.id === 'wind')).toBe(false);
    expect(plan.counts.balls).toBe(5);
  });

  it('togglePlanFusion past the ball limit is a no-op', () => {
    const state = createPlanState();
    for (const id of ['flash', 'glacier', 'maggot', 'flicker', 'burn']) state.dispatch({ type: 'togglePlanItem', id });
    state.dispatch({ type: 'togglePlanFusion', a: 'vampire', b: 'wind' });
    const plan = state.derive([]);
    expect(plan.fused).toHaveLength(0);
    expect(plan.counts.balls).toBe(5);
  });

  it('fused entries carry per-component verdicts and the over-limit mark', () => {
    const state = createPlanState();
    for (const id of ['flash', 'glacier', 'maggot', 'flicker']) state.dispatch({ type: 'togglePlanItem', id });
    state.dispatch({ type: 'togglePlanFusion', a: 'vampire', b: 'wind' });
    // 5 slots filled; shrinking the limits marks the pair (5th slot) over limit
    state.dispatch({ type: 'toggleUpgrades' });
    const plan = state.derive(chars('the-ballbearer'));
    expect(plan.fused[0].overLimit).toBe(true);
    expect(plan.fused[0].verdicts).toHaveLength(2);
  });

  it('clearPlan clears fused pairs too', () => {
    const state = createPlanState();
    state.dispatch({ type: 'togglePlanFusion', a: 'flash', b: 'glacier' });
    state.dispatch({ type: 'clearPlan' });
    const plan = state.derive([]);
    expect(plan.fused).toHaveLength(0);
    expect(plan.counts.balls).toBe(0);
  });

  it('hasPair answers fused-pair membership by sorted identity (the seam the fusion panel queries)', () => {
    const state = createPlanState();
    state.dispatch({ type: 'togglePlanFusion', a: 'flash', b: 'glacier' });
    expect(state.hasPair('flash', 'glacier')).toBe(true);
    expect(state.hasPair('glacier', 'flash')).toBe(true); // order-insensitive
    expect(state.hasPair('flash', 'maggot')).toBe(false);
  });
});
