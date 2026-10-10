// Tests for the view-state module through its one interface:
// createViewState() → dispatch(action) → ViewModel. The island's repaint
// rules (which tiles are selected/related/dimmed/filtered, which chars are
// selected, what the chips show) concentrate here — testable without DOM.
import { describe, it, expect } from 'vitest';
import { createViewState } from './view-state';
import { ballMap } from './catalog';

describe('view state: item selection (ticket 05 semantics through one interface)', () => {
  it('selecting an evolved ball marks it selected, components+descendants related, the rest dimmed', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'toggleItem', id: 'inferno' });
    // Inferno = Burn + Wind + Time; Armageddon is its tier-3 child
    expect(vm.tiles.get('inferno')!.selected).toBe(true);
    expect(vm.tiles.get('burn')!.related).toBe(true);
    expect(vm.tiles.get('armageddon')!.related).toBe(true);
    expect(vm.tiles.get('bleed')!.dimmed).toBe(true);
  });

  it('clicking the selected tile again deselects everything (no dimming)', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleItem', id: 'inferno' });
    const vm = view.dispatch({ type: 'toggleItem', id: 'inferno' });
    expect(vm.tiles.get('inferno')!.selected).toBe(false);
    expect(vm.tiles.get('bleed')!.dimmed).toBe(false);
  });

  it('passive selection walks the passive graph, not the ball graph (was the ticket-05 bug)', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'toggleItem', id: 'wagon-wheel' });
    // Ardent Tire is wagon-wheel's passive child; a ball-graph walk would find nothing
    expect(vm.tiles.get('ardent-tire')!.related).toBe(true);
    expect(vm.tiles.get('inferno')!.dimmed).toBe(true);
  });

  it('evolved passive selection highlights its tier-3 child and components', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'toggleItem', id: 'deadeyes-cross' });
    expect(vm.tiles.get('deadeyes-impaler')!.related).toBe(true);
    expect(vm.tiles.get('ruby-hilted-dagger')!.related).toBe(true);
  });
});

describe('view state: character slots (max 2, sticky selection)', () => {
  it('first selection sets slotHint, selection marks the card', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'toggleChar', id: 'the-warrior' });
    expect(vm.slotHint).toBe('pick a second character…');
    expect(vm.charCards.get('the-warrior')!.selected).toBe(true);
    expect(vm.selectedChars).toHaveLength(1);
  });

  it('selection sticks: a third click when two are selected is a no-op', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleChar', id: 'the-warrior' });
    view.dispatch({ type: 'toggleChar', id: 'the-shade' });
    const vm = view.dispatch({ type: 'toggleChar', id: 'the-tactician' });
    expect(vm.selectedChars.map((c) => c.id)).toEqual(['the-warrior', 'the-shade']);
    expect(vm.charCards.get('the-tactician')!.selected).toBe(false);
  });

  it('the hint reports a full selection when two characters are held', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleChar', id: 'the-warrior' });
    view.dispatch({ type: 'toggleChar', id: 'the-shade' });
    const vm = view.dispatch({ type: 'toggleChar', id: 'the-tactician' });
    expect(vm.slotHint).toBe('selection full — deselect one first');
    const vm2 = view.dispatch({ type: 'toggleChar', id: 'the-warrior' });
    expect(vm2.slotHint).toBe('pick a second character…');
  });

  it('deselecting one character keeps the other', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleChar', id: 'the-warrior' });
    const vm = view.dispatch({ type: 'toggleChar', id: 'the-shade' });
    expect(vm.selectedChars).toHaveLength(2);
    expect(vm.slotHint).toBe('selection full — deselect one first');
    const vm2 = view.dispatch({ type: 'toggleChar', id: 'the-warrior' });
    expect(vm2.selectedChars.map((c) => c.id)).toEqual(['the-shade']);
  });
});

describe('view state: search filter (ticket 07 semantics, per screen)', () => {
  it('filters tiles by name and effect text, non-matching get filtered', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'search', section: 'balls', query: 'vampire' });
    expect(vm.tiles.get('vampire')!.filtered).toBe(false);
    expect(vm.tiles.get('vampire-lord')!.filtered).toBe(false); // name match
    // effect-text match: Nosferatu's effect mentions vampire bats but its name doesn't
    expect(vm.tiles.get('nosferatu')!.filtered).toBe(false);
    expect(vm.tiles.get('burn')!.filtered).toBe(true);
    expect(vm.tiles.get('inferno')!.filtered).toBe(true); // "Inferno" name
  });

  it('the characters search filters character cards by name, quirk, and base ball name', () => {
    const view = createViewState();
    // The Warrior's base ball is Bleed — base-ball-name match
    const vm = view.dispatch({ type: 'search', section: 'characters', query: 'bleed' });
    expect(vm.charCards.get('the-warrior')!.filtered).toBe(false);
  });

  it('search is case-insensitive and trims', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'search', section: 'balls', query: '  VAMPIRE  ' });
    expect(vm.tiles.get('vampire')!.filtered).toBe(false);
  });

  it('clearing the query un-filters', () => {
    const view = createViewState();
    view.dispatch({ type: 'search', section: 'balls', query: 'zzz-no-match' });
    const vm = view.dispatch({ type: 'search', section: 'balls', query: '' });
    expect(vm.tiles.get('burn')!.filtered).toBe(false);
  });
});

describe('view state: search is per screen (each screen has its own box)', () => {
  it('the balls search filters balls but leaves passives unfiltered', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'search', section: 'balls', query: 'vampire' });
    expect(vm.tiles.get('burn')!.filtered).toBe(true);
    expect(vm.tiles.get('wagon-wheel')!.filtered).toBe(false); // passive — different screen
  });

  it('the passives search filters passives but leaves balls unfiltered', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'search', section: 'passives', query: 'wagon' });
    expect(vm.tiles.get('wagon-wheel')!.filtered).toBe(false);
    expect(vm.tiles.get('vampire')!.filtered).toBe(false); // ball — different screen, own query
  });

  it('each screen keeps its own query, independent of the others', () => {
    const view = createViewState();
    view.dispatch({ type: 'search', section: 'balls', query: 'vamp' });
    const vm = view.dispatch({ type: 'search', section: 'fusions', query: 'maggot' });
    expect(vm.tiles.get('burn')!.filtered).toBe(true); // balls query still active
    expect(vm.fusionRows.get('maggot')!.filtered).toBe(false);
    expect(vm.fusionRows.get('flash')!.filtered).toBe(true);
    expect(vm.charCards.get('the-warrior')!.filtered).toBe(false); // characters untouched
  });

  it('queries survive a tab switch (switching dispatches nothing — cross-screen remembering)', () => {
    const view = createViewState();
    view.dispatch({ type: 'search', section: 'balls', query: 'vamp' });
    view.dispatch({ type: 'toggleChar', id: 'the-warrior' });
    view.dispatch({ type: 'toggleFusion', id: 'flash' });
    const vm = view.derive();
    expect(vm.tiles.get('burn')!.filtered).toBe(true); // query persists
    expect(vm.selectedChars).toHaveLength(1); // selection persists too
    expect(vm.fusionPanel).toMatchObject({ state: 'pending' });
  });
});

describe('view state: clear action (Esc / empty-space click, section-scoped)', () => {
  it('clearing the item section clears the item selection but keeps characters and query', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleItem', id: 'inferno' });
    view.dispatch({ type: 'toggleChar', id: 'the-warrior' });
    view.dispatch({ type: 'search', section: 'balls', query: 'vamp' });
    const vm = view.dispatch({ type: 'clear', section: 'balls' });
    expect(vm.tiles.get('inferno')!.selected).toBe(false);
    expect(vm.tiles.get('bleed')!.dimmed).toBe(false);
    expect(vm.selectedChars).toHaveLength(1);
    expect(vm.tiles.get('burn')!.filtered).toBe(true); // query survives
  });

  it('clearing the characters section clears both picks but keeps the item selection', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleItem', id: 'inferno' });
    view.dispatch({ type: 'toggleChar', id: 'the-warrior' });
    view.dispatch({ type: 'toggleChar', id: 'the-shade' });
    const vm = view.dispatch({ type: 'clear', section: 'characters' });
    expect(vm.selectedChars).toHaveLength(0);
    expect(vm.tiles.get('inferno')!.selected).toBe(true); // item selection untouched
  });

  it('clearing the fusions section empties both picks', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleFusion', id: 'flash' });
    view.dispatch({ type: 'toggleFusion', id: 'glacier' });
    const vm = view.dispatch({ type: 'clear', section: 'fusions' });
    expect(vm.fusionPanel).toEqual({ state: 'empty' });
  });

  it('toggles across screens coexist in one view model (nothing clears on a switch)', () => {
    // Cross-screen remembering: there is no clear-on-switch action at all —
    // selections survive because nothing wipes them. (The tab-switch wiring
    // itself lives in companion.ts, pinned at source level in
    // regression.test.ts.) Only Esc / empty-space (section-scoped clear) wipes.
    const view = createViewState();
    view.dispatch({ type: 'toggleItem', id: 'inferno' });
    view.dispatch({ type: 'toggleChar', id: 'the-warrior' });
    view.dispatch({ type: 'toggleFusion', id: 'flash' });
    const vm = view.derive();
    expect(vm.tiles.get('inferno')!.selected).toBe(true);
    expect(vm.selectedChars.map((c) => c.id)).toEqual(['the-warrior']);
    expect(vm.fusionPanel).toMatchObject({ state: 'pending', first: ballMap.get('flash')! });
  });
});

describe('view state: fusion picks (max 2, sticky selection)', () => {
  it('initial panel state is empty', () => {
    const view = createViewState();
    expect(view.derive().fusionPanel).toEqual({ state: 'empty' });
  });

  it('first click → pending with the first ball; second → composed with the fusion', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'toggleFusion', id: 'flash' });
    expect(vm.fusionPanel).toEqual({ state: 'pending', first: ballMap.get('flash')! });
    const vm2 = view.dispatch({ type: 'toggleFusion', id: 'glacier' });
    expect(vm2.fusionPanel).toMatchObject({
      state: 'composed',
      a: ballMap.get('flash')!,
      b: ballMap.get('glacier')!,
    });
    if (vm2.fusionPanel.state === 'composed') {
      expect(vm2.fusionPanel.fusion.name).toBe('Flash × Glacier');
    }
  });

  it('selection sticks: a third click when two are picked is a no-op', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleFusion', id: 'flash' });
    view.dispatch({ type: 'toggleFusion', id: 'glacier' });
    const vm = view.dispatch({ type: 'toggleFusion', id: 'flicker' });
    expect(vm.fusionPanel).toMatchObject({
      state: 'composed',
      a: ballMap.get('flash')!,
      b: ballMap.get('glacier')!,
    });
    expect(vm.fusionRows.get('flicker')!.slot).toBeNull();
    expect(vm.fusionHint).toBe('selection full — deselect one first');
  });

  it('the fusion hint walks through empty → second-pick → full', () => {
    const view = createViewState();
    expect(view.derive().fusionHint).toBe('Pick two balls to see their fusion.');
    const vm = view.dispatch({ type: 'toggleFusion', id: 'flash' });
    expect(vm.fusionHint).toBe('…pick a second ball.');
  });

  it('clicking a selected ball deselects it, leaving the other pending', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleFusion', id: 'flash' });
    view.dispatch({ type: 'toggleFusion', id: 'glacier' });
    const vm = view.dispatch({ type: 'toggleFusion', id: 'flash' });
    expect(vm.fusionPanel).toEqual({ state: 'pending', first: ballMap.get('glacier')! });
  });

  it('clicking the only selected ball clears the pick entirely', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleFusion', id: 'flash' });
    const vm = view.dispatch({ type: 'toggleFusion', id: 'flash' });
    expect(vm.fusionPanel).toEqual({ state: 'empty' });
  });

  it('fusion rows reflect pick order and search filtering', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleFusion', id: 'overgrowth' });
    view.dispatch({ type: 'toggleFusion', id: 'maggot' });
    const vm = view.dispatch({ type: 'search', section: 'fusions', query: 'maggot' });
    expect(vm.fusionRows.get('overgrowth')!.slot).toBe(1);
    expect(vm.fusionRows.get('maggot')!.slot).toBe(2);
    expect(vm.fusionRows.get('maggot')!.filtered).toBe(false);
    expect(vm.fusionRows.get('flash')!.filtered).toBe(true);
  });

  it('the evolve-instead-of-fuse note rides the composed fusion', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleFusion', id: 'bleed' });
    const vm = view.dispatch({ type: 'toggleFusion', id: 'poison' });
    if (vm.fusionPanel.state === 'composed') {
      expect(vm.fusionPanel.fusion.evolvesInstead!.name).toBe('Virus');
    }
  });

  it('the composed panel reports when the plan balls are at their limit', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleFusion', id: 'black-hole' });
    const vm = view.dispatch({ type: 'toggleFusion', id: 'sun' });
    if (vm.fusionPanel.state === 'composed') expect(vm.fusionPanel.planFull).toBe(false);
    for (const id of ['flash', 'glacier', 'maggot', 'flicker', 'burn']) view.dispatch({ type: 'togglePlanItem', id });
    const vm2 = view.derive();
    if (vm2.fusionPanel.state === 'composed') expect(vm2.fusionPanel.planFull).toBe(true);
    // a planned pair of the same pair frees nothing — but removing one ball does
    view.dispatch({ type: 'togglePlanItem', id: 'burn' });
    const vm3 = view.derive();
    if (vm3.fusionPanel.state === 'composed') expect(vm3.fusionPanel.planFull).toBe(false);
  });
});

describe('view state: plan limits (End game upgrades toggle)', () => {
  it('defaults: upgrades on, limits 2 chars / 5 balls / 5 passives, empty plan', () => {
    const vm = createViewState().derive();
    expect(vm.plan.upgradesOn).toBe(true);
    expect(vm.plan.limits).toEqual({ chars: 2, balls: 5, passives: 5 });
    expect(vm.plan.counts).toEqual({ chars: 0, balls: 0, passives: 0 });
    expect(vm.plan.overLimit).toBe(false);
  });

  it('toggleUpgrades flips the toggle and shrinks the limits to 1/4/4', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'toggleUpgrades' });
    expect(vm.plan.upgradesOn).toBe(false);
    expect(vm.plan.limits).toEqual({ chars: 1, balls: 4, passives: 4 });
    const vm2 = view.dispatch({ type: 'toggleUpgrades' });
    expect(vm2.plan.upgradesOn).toBe(true);
    expect(vm2.plan.limits).toEqual({ chars: 2, balls: 5, passives: 5 });
  });

  it('a second character with upgrades off is a no-op and the hint reports full', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleUpgrades' });
    view.dispatch({ type: 'toggleChar', id: 'the-warrior' });
    const vm = view.dispatch({ type: 'toggleChar', id: 'the-shade' });
    expect(vm.selectedChars.map((c) => c.id)).toEqual(['the-warrior']);
    expect(vm.slotHint).toBe('selection full — deselect one first');
  });

  it('toggling upgrades off with two characters keeps both, marks the second over limit', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleChar', id: 'the-warrior' });
    view.dispatch({ type: 'toggleChar', id: 'the-shade' });
    const vm = view.dispatch({ type: 'toggleUpgrades' });
    expect(vm.plan.characters.map((c) => c.character.id)).toEqual(['the-warrior', 'the-shade']);
    expect(vm.plan.characters[0].overLimit).toBe(false);
    expect(vm.plan.characters[1].overLimit).toBe(true);
    expect(vm.plan.overLimit).toBe(true);
  });

  it('an over-limit character can still be removed by re-click', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleChar', id: 'the-warrior' });
    view.dispatch({ type: 'toggleChar', id: 'the-shade' });
    view.dispatch({ type: 'toggleUpgrades' });
    const vm = view.dispatch({ type: 'toggleChar', id: 'the-shade' });
    expect(vm.plan.characters.map((c) => c.character.id)).toEqual(['the-warrior']);
    expect(vm.plan.overLimit).toBe(false);
  });
});

describe('view state: plan items (balls/passives, pick order, limits)', () => {
  it('togglePlanItem adds balls and passives in pick order, split by namespace', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'togglePlanItem', id: 'flash' });
    expect(vm.plan.balls.map((e) => e.item.id)).toEqual(['flash']);
    expect(vm.plan.passives).toHaveLength(0);
    const vm2 = view.dispatch({ type: 'togglePlanItem', id: 'wagon-wheel' });
    expect(vm2.plan.passives.map((e) => e.item.id)).toEqual(['wagon-wheel']);
    expect(vm2.plan.balls.map((e) => e.item.id)).toEqual(['flash']);
  });

  it('re-clicking a plan item removes it, keeping the others in pick order', () => {
    const view = createViewState();
    view.dispatch({ type: 'togglePlanItem', id: 'flash' });
    view.dispatch({ type: 'togglePlanItem', id: 'glacier' });
    const vm = view.dispatch({ type: 'togglePlanItem', id: 'flash' });
    expect(vm.plan.balls.map((e) => e.item.id)).toEqual(['glacier']);
  });

  it('adding past the active ball limit is a no-op (5 with upgrades on)', () => {
    const view = createViewState();
    for (const id of ['flash', 'glacier', 'maggot', 'flicker', 'burn']) view.dispatch({ type: 'togglePlanItem', id });
    const vm = view.dispatch({ type: 'togglePlanItem', id: 'vampire' });
    expect(vm.plan.balls.map((e) => e.item.id)).toHaveLength(5);
    expect(vm.plan.balls.some((e) => e.item.id === 'vampire')).toBe(false);
  });

  it('the passive limit is enforced separately (4 with upgrades off)', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleUpgrades' });
    for (const id of ['wagon-wheel', 'ardent-tire', 'deadeyes-cross', 'deadeyes-impaler']) {
      view.dispatch({ type: 'togglePlanItem', id });
    }
    const vm = view.dispatch({ type: 'togglePlanItem', id: 'magnet' });
    expect(vm.plan.passives).toHaveLength(4);
  });

  it('toggling upgrades off with 5 balls keeps all, marks the 5th over limit', () => {
    const view = createViewState();
    for (const id of ['flash', 'glacier', 'maggot', 'flicker', 'burn']) view.dispatch({ type: 'togglePlanItem', id });
    const vm = view.dispatch({ type: 'toggleUpgrades' });
    expect(vm.plan.balls.map((e) => e.item.id)).toHaveLength(5);
    expect(vm.plan.balls[4].overLimit).toBe(true);
    expect(vm.plan.balls[3].overLimit).toBe(false);
    expect(vm.plan.hint).toContain('Over the limit');
  });

  it('planHint clears when the over-limit pick is removed', () => {
    const view = createViewState();
    for (const id of ['flash', 'glacier', 'maggot', 'flicker', 'burn']) view.dispatch({ type: 'togglePlanItem', id });
    view.dispatch({ type: 'toggleUpgrades' });
    const vm = view.dispatch({ type: 'togglePlanItem', id: 'burn' });
    expect(vm.plan.overLimit).toBe(false);
    expect(vm.plan.hint).toBe('');
  });

  it('plan entries carry verdicts against the selected characters', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleChar', id: 'the-ballbearer' });
    const vm = view.dispatch({ type: 'togglePlanItem', id: 'wagon-wheel' });
    expect(vm.plan.passives[0].verdict).toMatchObject({ verdict: 'red' });
  });

  it('unknown ids are ignored', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'togglePlanItem', id: 'not-a-real-id' });
    expect(vm.plan.balls).toHaveLength(0);
    expect(vm.plan.passives).toHaveLength(0);
  });
});

describe('view state: clearPlan', () => {
  it('clears characters, balls, passives and resets the toggle to on', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleChar', id: 'the-warrior' });
    view.dispatch({ type: 'togglePlanItem', id: 'flash' });
    view.dispatch({ type: 'togglePlanItem', id: 'wagon-wheel' });
    view.dispatch({ type: 'toggleUpgrades' });
    const vm = view.dispatch({ type: 'clearPlan' });
    expect(vm.plan.counts).toEqual({ chars: 0, balls: 0, passives: 0 });
    expect(vm.plan.upgradesOn).toBe(true);
    expect(vm.selectedChars).toHaveLength(0);
  });

  it('leaves fusion picks, the item highlight, and search queries alone', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleFusion', id: 'flash' });
    view.dispatch({ type: 'toggleItem', id: 'glacier' });
    view.dispatch({ type: 'search', section: 'balls', query: 'vamp' });
    const vm = view.dispatch({ type: 'clearPlan' });
    expect(vm.fusionPanel).toMatchObject({ state: 'pending' });
    expect(vm.tiles.get('glacier')!.selected).toBe(true);
    expect(vm.tiles.get('burn')!.filtered).toBe(true);
  });
});

describe('view state: hydrate (restored plan from storage)', () => {
  it('restores characters, balls, passives and the toggle in pick order', () => {
    const view = createViewState();
    const vm = view.dispatch({
      type: 'hydrate',
      plan: {
        upgradesOn: false,
        chars: ['the-warrior', 'the-shade'],
        balls: ['flash', 'glacier'],
        passives: ['wagon-wheel'],
        fused: [],
      },
    });
    expect(vm.plan.upgradesOn).toBe(false);
    expect(vm.plan.characters.map((c) => c.character.id)).toEqual(['the-warrior', 'the-shade']);
    expect(vm.plan.balls.map((e) => e.item.id)).toEqual(['flash', 'glacier']);
    expect(vm.plan.passives.map((e) => e.item.id)).toEqual(['wagon-wheel']);
  });

  it('filters unknown ids and duplicates', () => {
    const view = createViewState();
    const vm = view.dispatch({
      type: 'hydrate',
      plan: {
        upgradesOn: true,
        chars: ['the-warrior', 'ghost', 'the-warrior'],
        balls: ['flash', 'not-a-ball', 'flash'],
        passives: ['wagon-wheel', 'not-a-passive'],
        fused: [],
      },
    });
    expect(vm.plan.characters.map((c) => c.character.id)).toEqual(['the-warrior']);
    expect(vm.plan.balls.map((e) => e.item.id)).toEqual(['flash']);
    expect(vm.plan.passives.map((e) => e.item.id)).toEqual(['wagon-wheel']);
  });

  it('keeps over-limit selections without trimming (marked over limit instead)', () => {
    const view = createViewState();
    const vm = view.dispatch({
      type: 'hydrate',
      plan: {
        upgradesOn: false,
        chars: ['the-warrior', 'the-shade'],
        balls: ['flash', 'glacier', 'maggot', 'flicker', 'burn'],
        passives: [],
        fused: [],
      },
    });
    expect(vm.plan.characters[1].overLimit).toBe(true);
    expect(vm.plan.balls[4].overLimit).toBe(true);
    expect(vm.plan.overLimit).toBe(true);
  });

  it('planSnapshot round-trips through hydrate', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleChar', id: 'the-warrior' });
    view.dispatch({ type: 'togglePlanItem', id: 'flash' });
    view.dispatch({ type: 'toggleUpgrades' });
    const snapshot = view.planSnapshot();
    const restored = createViewState();
    restored.dispatch({ type: 'hydrate', plan: snapshot });
    expect(restored.planSnapshot()).toEqual(snapshot);
  });
});

describe('view state: fused pairs in the plan', () => {
  it('togglePlanFusion adds a pair in compose order, counted as one ball slot', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'togglePlanFusion', a: 'flash', b: 'glacier' });
    expect(vm.plan.fused).toHaveLength(1);
    expect(vm.plan.fused[0].a.id).toBe('flash');
    expect(vm.plan.fused[0].b.id).toBe('glacier');
    expect(vm.plan.fused[0].name).toBe('Flash × Glacier');
    expect(vm.plan.counts.balls).toBe(1);
  });

  it('pair identity is order-insensitive: the reverse composition toggles it off', () => {
    const view = createViewState();
    view.dispatch({ type: 'togglePlanFusion', a: 'flash', b: 'glacier' });
    const vm = view.dispatch({ type: 'togglePlanFusion', a: 'glacier', b: 'flash' });
    expect(vm.plan.fused).toHaveLength(0);
    expect(vm.plan.counts.balls).toBe(0);
  });

  it('re-adding the same pair (same order) toggles it off', () => {
    const view = createViewState();
    view.dispatch({ type: 'togglePlanFusion', a: 'flash', b: 'glacier' });
    const vm = view.dispatch({ type: 'togglePlanFusion', a: 'flash', b: 'glacier' });
    expect(vm.plan.fused).toHaveLength(0);
  });

  it('a fused pair counts toward the ball limit: 4 singles + 1 fused fills the 5 limit', () => {
    const view = createViewState();
    for (const id of ['flash', 'glacier', 'maggot', 'flicker']) view.dispatch({ type: 'togglePlanItem', id });
    view.dispatch({ type: 'togglePlanFusion', a: 'burn', b: 'vampire' });
    const vm = view.dispatch({ type: 'togglePlanItem', id: 'wind' });
    expect(vm.plan.balls.some((e) => e.item.id === 'wind')).toBe(false);
    expect(vm.plan.counts.balls).toBe(5);
  });

  it('togglePlanFusion past the ball limit is a no-op', () => {
    const view = createViewState();
    for (const id of ['flash', 'glacier', 'maggot', 'flicker', 'burn']) view.dispatch({ type: 'togglePlanItem', id });
    const vm = view.dispatch({ type: 'togglePlanFusion', a: 'vampire', b: 'wind' });
    expect(vm.plan.fused).toHaveLength(0);
    expect(vm.plan.counts.balls).toBe(5);
  });

  it('fused entries carry per-component verdicts and the over-limit mark', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleChar', id: 'the-ballbearer' });
    for (const id of ['flash', 'glacier', 'maggot', 'flicker']) view.dispatch({ type: 'togglePlanItem', id });
    view.dispatch({ type: 'togglePlanFusion', a: 'vampire', b: 'wind' });
    // 5 slots filled; shrinking the limits marks the pair (5th slot) over limit
    const vm = view.dispatch({ type: 'toggleUpgrades' });
    expect(vm.plan.fused[0].overLimit).toBe(true);
    expect(vm.plan.fused[0].verdicts).toHaveLength(2);
  });

  it('clearPlan clears fused pairs too', () => {
    const view = createViewState();
    view.dispatch({ type: 'togglePlanFusion', a: 'flash', b: 'glacier' });
    const vm = view.dispatch({ type: 'clearPlan' });
    expect(vm.plan.fused).toHaveLength(0);
    expect(vm.plan.counts.balls).toBe(0);
  });

  it('hydrate validates fused pairs: unknown/non-ball/degenerate/duplicate pairs are dropped', () => {
    const view = createViewState();
    const vm = view.dispatch({
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
    expect(vm.plan.fused).toHaveLength(1);
    expect(vm.plan.fused[0].a.id).toBe('flash');
    expect(vm.plan.fused[0].b.id).toBe('glacier');
  });

  it('planSnapshot includes fused pairs and round-trips through hydrate', () => {
    const view = createViewState();
    view.dispatch({ type: 'togglePlanFusion', a: 'flash', b: 'glacier' });
    const snapshot = view.planSnapshot();
    expect(snapshot.fused).toEqual([{ a: 'flash', b: 'glacier' }]);
    const restored = createViewState();
    restored.dispatch({ type: 'hydrate', plan: snapshot });
    expect(restored.planSnapshot()).toEqual(snapshot);
  });
});

describe('view state: selection box (balls/passives screens)', () => {
  it('no selection: both boxes are null', () => {
    const vm = createViewState().derive();
    expect(vm.selectionBoxes.balls).toBeNull();
    expect(vm.selectionBoxes.passives).toBeNull();
  });

  it('a selected ball fills the balls box (plan + fusion labels) and leaves the passives box null', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'toggleItem', id: 'flash' });
    expect(vm.selectionBoxes.passives).toBeNull();
    const box = vm.selectionBoxes.balls!;
    expect(box.item.id).toBe('flash');
    expect(box.plan).toBe('add');
    expect(box.fusion).toBe('add');
  });

  it('a selected passive fills the passives box (plan only, no fusion button)', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'toggleItem', id: 'wagon-wheel' });
    expect(vm.selectionBoxes.balls).toBeNull();
    expect(vm.selectionBoxes.passives!.item.id).toBe('wagon-wheel');
    expect(vm.selectionBoxes.passives!.plan).toBe('add');
    expect(vm.selectionBoxes.passives!.fusion).toBeNull();
  });

  it('an item already in the plan shows the remove label; at the limit shows disabled', () => {
    const view = createViewState();
    view.dispatch({ type: 'togglePlanItem', id: 'flash' });
    const vm = view.dispatch({ type: 'toggleItem', id: 'flash' });
    expect(vm.selectionBoxes.balls!.plan).toBe('remove');
    for (const id of ['glacier', 'maggot', 'flicker', 'burn']) view.dispatch({ type: 'togglePlanItem', id });
    const vm2 = view.dispatch({ type: 'toggleItem', id: 'vampire' });
    expect(vm2.selectionBoxes.balls!.plan).toBe('disabled');
    // removing one frees the slot again (selection unchanged — derive only)
    view.dispatch({ type: 'togglePlanItem', id: 'flash' });
    const vm3 = view.derive();
    expect(vm3.selectionBoxes.balls!.plan).toBe('add');
  });

  it('fusion label: picked ball shows remove, full picks show disabled, Baby Ball is unfusable', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleFusion', id: 'flash' });
    const vm = view.dispatch({ type: 'toggleItem', id: 'flash' });
    expect(vm.selectionBoxes.balls!.fusion).toBe('remove');
    view.dispatch({ type: 'toggleFusion', id: 'glacier' });
    const vm2 = view.dispatch({ type: 'toggleItem', id: 'maggot' });
    expect(vm2.selectionBoxes.balls!.fusion).toBe('disabled');
    const vm3 = view.dispatch({ type: 'toggleItem', id: 'baby-ball' });
    expect(vm3.selectionBoxes.balls!.fusion).toBe('unfusable');
  });

  it('selection persists after adding to plan or fusion (box stays, highlight stays)', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleItem', id: 'flash' });
    const vm = view.dispatch({ type: 'togglePlanItem', id: 'flash' });
    expect(vm.tiles.get('flash')!.selected).toBe(true);
    expect(vm.selectionBoxes.balls!.item.id).toBe('flash');
    const vm2 = view.dispatch({ type: 'toggleFusion', id: 'flash' });
    expect(vm2.tiles.get('flash')!.selected).toBe(true);
    expect(vm2.selectionBoxes.balls!.item.id).toBe('flash');
  });

  it('adding to fusion from the selection box shows in the fusion screen slot badges', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleItem', id: 'flash' });
    const vm = view.dispatch({ type: 'toggleFusion', id: 'flash' });
    expect(vm.fusionRows.get('flash')!.slot).toBe(1);
  });
});

describe('view state: synergy verdicts ride the view model', () => {
  it('selected character drives verdict on tiles (The Ballbearer wildcard)', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'toggleChar', id: 'the-ballbearer' });
    // verdicts carry the note — the tile badge tooltip and toast need it
    expect(vm.tiles.get('wagon-wheel')!.verdict).toMatchObject({ verdict: 'red' }); // passive + wildcard
    expect(vm.tiles.get('silver-bullet')!.verdict).toMatchObject({ verdict: 'green' }); // single-target green
    expect(vm.tiles.get('bleed')!.verdict).toBeNull(); // neutral
  });

  it('verdicts clear when the character is deselected', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleChar', id: 'the-ballbearer' });
    const vm = view.dispatch({ type: 'toggleChar', id: 'the-ballbearer' });
    expect(vm.tiles.get('wagon-wheel')!.verdict).toBeNull();
  });
});
