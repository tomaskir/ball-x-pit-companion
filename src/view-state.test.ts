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

  it('rejects unknown and non-fusable ids — Baby Ball is never a fusion pick', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'toggleFusion', id: 'baby-ball' });
    expect(vm.fusionPanel).toEqual({ state: 'empty' });
    expect(vm.fusionHint).toBe('Pick two balls to see their fusion.');
    const vm2 = view.dispatch({ type: 'toggleFusion', id: 'not-a-ball' });
    expect(vm2.fusionPanel).toEqual({ state: 'empty' });
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

describe('view state: fusion panel order presentation (decision #8)', () => {
  const composed = (view: ReturnType<typeof createViewState>, a: string, b: string) => {
    view.dispatch({ type: 'toggleFusion', id: a });
    const vm = view.dispatch({ type: 'toggleFusion', id: b });
    expect(vm.fusionPanel.state).toBe('composed');
    return vm.fusionPanel as Extract<typeof vm.fusionPanel, { state: 'composed' }>;
  };

  it('a shared-property collision makes the pair order-sensitive and names the property', () => {
    const fp = composed(createViewState(), 'egg-sac', 'timestop');
    expect(fp.fusion.resolved.collisions.length).toBeGreaterThan(0);
    expect(fp.orderSensitive).toBe(true);
    expect(fp.orderNotice).toContain('Order matters');
    expect(fp.orderNotice).toContain('Cooldown');
  });

  it('a pair with no shared properties is not order-sensitive and carries no notice', () => {
    const fp = composed(createViewState(), 'flash', 'glacier');
    expect(fp.fusion.resolved.collisions).toHaveLength(0);
    expect(fp.orderSensitive).toBe(false);
    expect(fp.orderNotice).toBe('');
  });

  it('an order-dependent reported exception makes the pair order-sensitive', () => {
    const fp = composed(createViewState(), 'nuclear-bomb', 'wraith');
    expect(fp.fusion.resolved.collisions).toHaveLength(0);
    expect(fp.orderSensitive).toBe(true);
    expect(fp.orderNotice).toContain('Order matters');
    expect(fp.orderNotice).toMatch(/exception/i);
  });

  it('a reported exception that is not order-dependent leaves the pair non-order-sensitive', () => {
    const fp = composed(createViewState(), 'banshee', 'flash');
    expect(fp.orderSensitive).toBe(false);
    expect(fp.orderNotice).toBe('');
  });

  it('an evolve-instead pair is never order-sensitive', () => {
    const fp = composed(createViewState(), 'bleed', 'poison');
    expect(fp.orderSensitive).toBe(false);
    expect(fp.orderNotice).toBe('');
  });

  it('swapFusion reverses the picks and recomputes the resolved result', () => {
    const view = createViewState();
    const before = composed(view, 'egg-sac', 'timestop');
    expect(before.fusion.name).toBe('Egg Sac × Timestop');
    const after = view.dispatch({ type: 'swapFusion' });
    expect(after.fusionPanel.state).toBe('composed');
    const fp = after.fusionPanel as Extract<typeof after.fusionPanel, { state: 'composed' }>;
    expect(fp.fusion.name).toBe('Timestop × Egg Sac');
    // the view-layer order presentation recomputed for the reversed pair
    expect(fp.orderSensitive).toBe(true);
    expect(fp.orderNotice).toContain('Cooldown');
    // the pair's plan identity is order-insensitive, so the plan mark survives
    expect(fp.planned).toBe(before.planned);
  });

  it('swapFusion is a no-op with fewer than two picks', () => {
    const view = createViewState();
    expect(view.dispatch({ type: 'swapFusion' }).fusionPanel).toEqual({ state: 'empty' });
    view.dispatch({ type: 'toggleFusion', id: 'flash' });
    const vm = view.dispatch({ type: 'swapFusion' });
    expect(vm.fusionPanel).toEqual({ state: 'pending', first: ballMap.get('flash')! });
  });
});

// The plan's own semantics (limits, toggles, capacity, hydrate filtering,
// fused-pair identity) are unit-tested in src/plan-state.test.ts through
// createPlanState(); what stays here is the integration: the plan actions
// forwarding through the one dispatch, the shared selectedChars feeding the
// plan, and the ViewModel still carrying the plan fields for the renderer.
describe('view state: plan actions forward to the plan state (integration)', () => {
  it('plan actions reach vm.plan through the same dispatch (the ViewModel still carries plan fields for the renderer)', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'togglePlanItem', id: 'flash' });
    expect(vm.plan.balls.filter((e) => e.kind === 'single').map((e) => e.item.id)).toEqual(['flash']);
    const vm2 = view.dispatch({ type: 'togglePlanFusion', a: 'glacier', b: 'maggot' });
    expect(vm2.plan.balls.filter((e) => e.kind === 'fused').map((p) => p.name)).toEqual(['Glacier × Maggot']);
    expect(vm2.plan.counts.balls).toBe(2); // a fused pair is ONE ball slot
    const vm3 = view.dispatch({ type: 'toggleUpgrades' });
    expect(vm3.plan.limits).toEqual({ chars: 1, balls: 4, passives: 4 });
    const vm4 = view.dispatch({ type: 'clearPlan' });
    expect(vm4.plan.counts).toEqual({ chars: 0, balls: 0, passives: 0 });
    expect(vm4.plan.upgradesOn).toBe(true);
  });

  it('the shared selectedChars feed the plan: character picks become plan entries with verdicts', () => {
    const view = createViewState();
    // plan the passive first: The Ballbearer's zero passive slots would block
    // a live add (the quirk capacity is exercised in its own tests below)
    view.dispatch({ type: 'togglePlanItem', id: 'wagon-wheel' });
    const vm = view.dispatch({ type: 'toggleChar', id: 'the-ballbearer' });
    expect(vm.plan.characters.map((c) => c.character.id)).toEqual(['the-ballbearer']);
    expect(vm.plan.passives[0].verdict).toMatchObject({ verdict: 'red' });
    // deselecting the character updates the plan's verdicts on the next derive
    const vm2 = view.dispatch({ type: 'toggleChar', id: 'the-ballbearer' });
    expect(vm2.plan.characters).toHaveLength(0);
    expect(vm2.plan.passives[0].verdict).toBeNull();
  });

  it('plan limits gate the character slots (the character limit rides the plan\'s upgrade toggle)', () => {
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

  it('fused pairs alone can fill the ball capacity: the composed panel reports planFull', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleUpgrades' }); // limit 4
    for (const [a, b] of [['flash', 'glacier'], ['maggot', 'flicker'], ['burn', 'vampire'], ['wind', 'poison']] as const) {
      view.dispatch({ type: 'togglePlanFusion', a, b });
    }
    view.dispatch({ type: 'toggleFusion', id: 'bleed' });
    const vm = view.dispatch({ type: 'toggleFusion', id: 'poison' });
    expect(vm.fusionPanel.state).toBe('composed');
    if (vm.fusionPanel.state === 'composed') expect(vm.fusionPanel.planFull).toBe(true);
    expect(vm.plan.counts.balls).toBe(4);
  });
});

describe('view state: character slot quirks (integration)', () => {
  it('The Ballbearer blocks live passive adds and reports 0 / 0', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleChar', id: 'the-ballbearer' });
    const vm = view.dispatch({ type: 'togglePlanItem', id: 'wagon-wheel' });
    expect(vm.plan.counts.passives).toBe(0);
    expect(vm.plan.limits).toEqual({ chars: 2, balls: 10, passives: 0 });
    expect(vm.plan.passivesEmptyHint).toBe('The Ballbearer has no passive slots.');
  });

  it('The Hoary Hoarder caps live ball adds at 2 and grows passives to 8', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleChar', id: 'the-hoary-hoarder' });
    for (const id of ['flash', 'glacier', 'maggot']) view.dispatch({ type: 'togglePlanItem', id });
    const vm = view.derive();
    expect(vm.plan.counts.balls).toBe(2);
    expect(vm.plan.limits).toEqual({ chars: 2, balls: 2, passives: 8 });
  });

  it('the selection box disables a passive add under The Ballbearer', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleChar', id: 'the-ballbearer' });
    const passive = view.dispatch({ type: 'toggleItem', id: 'wagon-wheel' });
    expect(passive.selectionBoxes.passives!.plan).toBe('disabled');
    const ball = view.dispatch({ type: 'toggleItem', id: 'flash' });
    expect(ball.selectionBoxes.balls!.plan).toBe('add');
  });

  it('the fusion panel reads the quirk-overlaid ball capacity', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleChar', id: 'the-hoary-hoarder' });
    view.dispatch({ type: 'toggleFusion', id: 'flash' });
    const vm = view.dispatch({ type: 'toggleFusion', id: 'glacier' });
    expect(vm.fusionPanel.state).toBe('composed');
    if (vm.fusionPanel.state === 'composed') {
      // Hoarder: 2 ball slots — a pair fills the plan at 0 used, so not full
      // yet; one planned ball makes it full.
      expect(vm.fusionPanel.planFull).toBe(false);
    }
    view.dispatch({ type: 'togglePlanItem', id: 'flash' });
    view.dispatch({ type: 'togglePlanItem', id: 'glacier' });
    const full = view.derive();
    if (full.fusionPanel.state === 'composed') expect(full.fusionPanel.planFull).toBe(true);
  });
});

describe('view state: The Potager fusion block (integration)', () => {
  const withPotager = () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleEdition', edition: 'dlc-risen-ballbylon' });
    view.dispatch({ type: 'toggleChar', id: 'the-potager' });
    return view;
  };

  it('blocks a live fusing-pair add and marks a hydrated pair fusion-invalid', () => {
    const view = withPotager();
    view.dispatch({ type: 'toggleFusion', id: 'flash' });
    view.dispatch({ type: 'toggleFusion', id: 'glacier' });
    const blocked = view.dispatch({ type: 'togglePlanFusion', a: 'flash', b: 'glacier' });
    expect(blocked.plan.counts.balls).toBe(0);
    expect(blocked.fusionPanel.state).toBe('composed');
    if (blocked.fusionPanel.state === 'composed') expect(blocked.fusionPanel.fusionBlocked).toBe(true);

    const hydrated = view.dispatch({
      type: 'hydrate',
      shared: {
        plan: { upgradesOn: true, balls: [], passives: [], fused: [{ a: 'flash', b: 'glacier' }] },
        chars: ['the-potager'],
        editions: ['base-game', 'dlc-risen-ballbylon'],
      },
    });
    const pair = hydrated.plan.balls.find((e) => e.kind === 'fused');
    expect(pair && pair.kind === 'fused' && pair.fusionInvalid).toBe(true);
    expect(hydrated.plan.fusionInvalidHint).toContain("The Potager can't fuse balls");
  });

  it('an evolve-instead pair is not blocked (it evolves, not fuses)', () => {
    const view = withPotager();
    view.dispatch({ type: 'toggleFusion', id: 'bleed' });
    const vm = view.dispatch({ type: 'toggleFusion', id: 'poison' });
    expect(vm.fusionPanel.state).toBe('composed');
    if (vm.fusionPanel.state === 'composed') expect(vm.fusionPanel.fusionBlocked).toBe(false);
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

  it('the plan label counts fused pairs as ball slots (mixed single + fused at the boundary)', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleUpgrades' }); // limit 4
    view.dispatch({ type: 'togglePlanFusion', a: 'flash', b: 'glacier' });
    view.dispatch({ type: 'togglePlanFusion', a: 'maggot', b: 'flicker' });
    view.dispatch({ type: 'togglePlanItem', id: 'burn' });
    const vm = view.dispatch({ type: 'toggleItem', id: 'vampire' });
    // 2 pairs + 1 single = 3 of 4 slots — one left
    expect(vm.selectionBoxes.balls!.plan).toBe('add');
    view.dispatch({ type: 'togglePlanItem', id: 'wind' });
    const vm2 = view.derive();
    expect(vm2.selectionBoxes.balls!.plan).toBe('disabled');
    // removing a fused pair frees its slot
    view.dispatch({ type: 'togglePlanFusion', a: 'flash', b: 'glacier' });
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

describe('view state: Matchmaker pairing restrictions (game data, character-pairings.md)', () => {
  it('with one character held, a forbidden partner is blocked and names the held character', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleChar', id: 'the-repentant' });
    const vm = view.derive();
    expect(vm.charCards.get('the-shieldbearer')).toMatchObject({ blocked: true, blockedBy: 'The Repentant' });
    // an allowed partner is not blocked
    expect(vm.charCards.get('the-warrior')).toMatchObject({ blocked: false, blockedBy: null });
  });

  it('selecting a forbidden second character is a no-op (the game darkens them)', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleChar', id: 'the-repentant' });
    const vm = view.dispatch({ type: 'toggleChar', id: 'the-shieldbearer' });
    expect(vm.selectedChars.map((c) => c.id)).toEqual(['the-repentant']);
  });

  it('blocking is symmetric: whichever character is picked first', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleChar', id: 'the-shieldbearer' });
    const vm = view.dispatch({ type: 'toggleChar', id: 'the-repentant' });
    expect(vm.selectedChars.map((c) => c.id)).toEqual(['the-shieldbearer']);
    expect(vm.charCards.get('the-repentant')!.blocked).toBe(true);
  });

  it('the false messiah can never be a second character, and takes none', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleChar', id: 'the-warrior' });
    let vm = view.dispatch({ type: 'toggleChar', id: 'the-false-messiah' });
    expect(vm.selectedChars.map((c) => c.id)).toEqual(['the-warrior']);
    vm = view.dispatch({ type: 'toggleChar', id: 'the-warrior' }); // deselect
    vm = view.dispatch({ type: 'toggleChar', id: 'the-false-messiah' }); // messiah first
    expect(vm.selectedChars.map((c) => c.id)).toEqual(['the-false-messiah']);
    expect(vm.charCards.get('the-warrior')!.blocked).toBe(true); // no partner either
  });

  it('blocking follows the current selection: deselecting frees the partner', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleChar', id: 'the-repentant' });
    view.dispatch({ type: 'toggleChar', id: 'the-repentant' });
    const vm = view.derive();
    expect(vm.charCards.get('the-shieldbearer')!.blocked).toBe(false);
  });

  it('with upgrades off (limit 1) nothing is blocked — no second pick exists', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleUpgrades' });
    view.dispatch({ type: 'toggleChar', id: 'the-repentant' });
    const vm = view.derive();
    expect(vm.charCards.get('the-shieldbearer')!.blocked).toBe(false);
  });

  it('a hydrated invalid pair is kept and marked pair-invalid, never trimmed', () => {
    const view = createViewState();
    const vm = view.dispatch({
      type: 'hydrate',
      shared: {
        plan: { upgradesOn: true, balls: [], passives: [], fused: [] },
        chars: ['the-repentant', 'the-shieldbearer'],
        editions: ['base-game'],
      },
    });
    expect(vm.plan.characters.map((c) => c.character.id)).toEqual(['the-repentant', 'the-shieldbearer']);
    expect(vm.plan.characters[0].pairInvalid).toBe(true);
    expect(vm.plan.characters[1].pairInvalid).toBe(true);
    expect(vm.plan.overLimit).toBe(false); // a valid count — the mark is about the pair
  });

  it('a valid hydrated pair is not marked', () => {
    const view = createViewState();
    const vm = view.dispatch({
      type: 'hydrate',
      shared: {
        plan: { upgradesOn: true, balls: [], passives: [], fused: [] },
        chars: ['the-warrior', 'the-shade'],
        editions: ['base-game'],
      },
    });
    expect(vm.plan.characters[0].pairInvalid).toBe(false);
    expect(vm.plan.characters[1].pairInvalid).toBe(false);
  });
});

// ---------- plan build graphs ----------

describe('view state: plan build graphs', () => {
  const fusionId = 'fusion:freeze-ray+time-bomb';

  it('a planned fusion aggregates the full build graph, fusion row included', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'togglePlanFusion', a: 'freeze-ray', b: 'time-bomb' });
    const g = vm.buildGraph.balls;
    const ids = g.nodes.map((n) => n.id);
    // the user's example, end to end: bases, intermediates, the T3, the pair
    for (const id of ['freeze', 'laser-horizontal', 'laser-vertical', 'burn', 'iron', 'time', 'freeze-ray', 'bomb', 'time-bomb', fusionId]) {
      expect(ids, id).toContain(id);
    }
    expect(g.nodes.find((n) => n.id === fusionId)!.final).toBe(true);
    // the passive graph stays empty — namespaces strictly separate
    expect(vm.buildGraph.passives.nodes).toHaveLength(0);
  });

  it('over-limit entries stay out of the graph', () => {
    const view = createViewState();
    // live selection can never exceed the limit (sticky toggle blocks it) —
    // over-limit arrives hydrated, kept and marked, never trimmed
    const vm = view.dispatch({
      type: 'hydrate',
      shared: {
        plan: {
          upgradesOn: false,
          balls: ['bomb', 'inferno', 'frozen-flame', 'elemental', 'time-bomb'],
          passives: [],
          fused: [],
        },
        chars: [],
        editions: ['base-game'],
      },
    });
    // paint order is complexity-sorted, so the marked tail entry is the
    // least complex pick (Frozen Flame), not the last-picked one
    expect(vm.plan.balls[4].overLimit).toBe(true);
    const tail = vm.plan.balls[4];
    expect(tail.kind === 'single' && tail.item.id).toBe('frozen-flame');
    expect(vm.buildGraph.balls.nodes.some((n) => n.id === 'frozen-flame')).toBe(false);
    expect(vm.buildGraph.balls.nodes.some((n) => n.id === 'time-bomb')).toBe(true);
  });

  it('a planned pair that evolves instead becomes a single target of the evolved ball', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'togglePlanFusion', a: 'freeze', b: 'laser-horizontal' });
    const g = vm.buildGraph.balls;
    expect(g.nodes.find((n) => n.id === 'freeze-ray')!.final).toBe(true);
    expect(g.nodes.some((n) => n.row === 3)).toBe(false);
  });

  it('focus walks both directions; a fusion focus lights the pair chain; re-click clears', () => {
    const view = createViewState();
    view.dispatch({ type: 'togglePlanFusion', a: 'freeze-ray', b: 'time-bomb' });
    let vm = view.dispatch({ type: 'toggleGraphFocus', id: 'burn' });
    expect(vm.buildGraph.focus).toBe('burn');
    expect(vm.buildGraph.related.has('bomb')).toBe(true); // downstream
    expect(vm.buildGraph.related.has(fusionId)).toBe(true); // rides in via bomb
    vm = view.dispatch({ type: 'toggleGraphFocus', id: fusionId });
    expect(vm.buildGraph.related.has('freeze')).toBe(true); // upstream
    vm = view.dispatch({ type: 'toggleGraphFocus', id: fusionId });
    expect(vm.buildGraph.focus).toBe(null);
    expect(vm.buildGraph.related.size).toBe(0);
  });

  it('focus on an id outside the graph highlights nothing', () => {
    const view = createViewState();
    view.dispatch({ type: 'togglePlanFusion', a: 'freeze-ray', b: 'time-bomb' });
    const vm = view.dispatch({ type: 'toggleGraphFocus', id: 'bleed' });
    expect(vm.buildGraph.focus).toBe(null);
    expect(vm.buildGraph.related.size).toBe(0);
  });

  it('passives build their own graph; collapse flags are session-only panel state', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'togglePlanItem', id: 'deadeyes-impaler' });
    expect(vm.buildGraph.passives.nodes.some((n) => n.id === 'deadeyes-impaler' && n.final)).toBe(true);
    expect(vm.buildGraph.balls.nodes).toHaveLength(0);
    const vm2 = view.dispatch({ type: 'toggleGraphCollapse', which: 'balls' });
    expect(vm2.buildGraph.collapsed).toEqual({ balls: true, passives: false });
    const vm3 = view.dispatch({ type: 'toggleGraphCollapse', which: 'balls' });
    expect(vm3.buildGraph.collapsed.balls).toBe(false);
  });
});

describe('view state: build-graph done marks', () => {
  it('a done node stops contributing demand; clearPlan wipes the marks', () => {
    const view = createViewState();
    view.dispatch({ type: 'togglePlanFusion', a: 'freeze-ray', b: 'time-bomb' });
    let vm = view.dispatch({ type: 'toggleGraphDone', id: 'freeze-ray' });
    const n = (id: string) => vm.buildGraph.balls.nodes.find((x) => x.id === id)!;
    expect(n('freeze-ray')!.done).toBe(true);
    expect(n('freeze')!.min).toBe(0);
    vm = view.dispatch({ type: 'toggleGraphDone', id: 'freeze-ray' });
    expect(n('freeze-ray')!.done).toBe(false);
    expect(n('freeze')!.min).toBe(1);
    view.dispatch({ type: 'toggleGraphDone', id: 'freeze-ray' });
    vm = view.dispatch({ type: 'clearPlan' });
    // marks are session state for the plan's graph — a wiped plan has
    // nothing left to track
    expect(vm.buildGraph.balls.nodes).toHaveLength(0);
    const vm2 = view.dispatch({ type: 'togglePlanFusion', a: 'freeze-ray', b: 'time-bomb' });
    expect(vm2.buildGraph.balls.nodes.find((x) => x.id === 'freeze-ray')!.done).toBe(false);
  });
});

// ---------- the edition filter (content visibility, not a version switch) ----------

describe('view state: edition filter state and derived collections', () => {
  it('defaults to base-game only: DLC content is hidden, not dimmed', () => {
    const vm = createViewState().derive();
    expect(vm.enabledEditions).toEqual(['base-game']);
    expect(vm.tiles.get('bleed')!.hidden).toBe(false);
    expect(vm.tiles.get('beast')!.hidden).toBe(true); // DLC ball
    expect(vm.charCards.get('the-warrior')!.hidden).toBe(false);
    expect(vm.charCards.get('the-potager')!.hidden).toBe(true); // DLC character
    expect(vm.fusionRows.get('flash')!.hidden).toBe(false);
    expect(vm.fusionRows.get('beast')!.hidden).toBe(true);
    expect(vm.visible.balls.some((b) => b.id === 'beast')).toBe(false);
    expect(vm.visible.characters.some((c) => c.id === 'the-potager')).toBe(false);
    expect(vm.visible.fusionBalls.some((b) => b.id === 'beast')).toBe(false);
  });

  it('toggling the expansion on reveals DLC content and its recipes', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'toggleEdition', edition: 'dlc-risen-ballbylon' });
    expect(vm.enabledEditions).toEqual(['base-game', 'dlc-risen-ballbylon']);
    expect(vm.tiles.get('beast')!.hidden).toBe(false);
    expect(vm.charCards.get('the-potager')!.hidden).toBe(false);
    expect(vm.visible.balls.some((b) => b.id === 'beast')).toBe(true);
    // Blizzard's Water recipe becomes available with the expansion on
    expect(vm.availableRecipes.get('blizzard')).toEqual(ballMap.get('blizzard')!.recipes);
  });

  it('availableRecipes hides a recipe with a disabled component while the item stays', () => {
    const vm = createViewState().derive();
    expect(vm.tiles.get('blizzard')!.hidden).toBe(false);
    expect(vm.availableRecipes.get('blizzard')).toEqual([
      ['freeze', 'wind'],
      ['freeze', 'lightning'],
    ]);
  });

  it('an explicit empty edition list is valid (both checkboxes unchecked)', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleEdition', edition: 'base-game' });
    const vm = view.derive();
    expect(vm.enabledEditions).toEqual([]);
    expect([...vm.tiles.values()].every((t) => t.hidden)).toBe(true);
    expect(vm.visible.balls).toHaveLength(0);
  });
});

describe('view state: edition filter drop semantics', () => {
  /** Enable the expansion, then populate every kind of selection. */
  const withDlcContent = () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleEdition', edition: 'dlc-risen-ballbylon' });
    view.dispatch({ type: 'toggleChar', id: 'the-potager' }); // DLC character
    view.dispatch({ type: 'toggleFusion', id: 'beast' }); // DLC ball
    view.dispatch({ type: 'togglePlanItem', id: 'beast' }); // DLC plan ball
    view.dispatch({ type: 'togglePlanFusion', a: 'beast', b: 'bleed' }); // pair with a DLC component
    view.dispatch({ type: 'togglePlanItem', id: 'wagon-wheel' }); // base passive stays
    return view;
  };

  it('toggling the expansion off drops hidden chars, fusion picks, plan entries, and fused pairs', () => {
    const view = withDlcContent();
    const vm = view.dispatch({ type: 'toggleEdition', edition: 'dlc-risen-ballbylon' });
    expect(vm.selectedChars).toHaveLength(0);
    expect(vm.fusionPanel).toEqual({ state: 'empty' });
    expect(vm.plan.balls).toHaveLength(0);
    expect(vm.plan.passives.map((e) => e.item.id)).toEqual(['wagon-wheel']);
    // 1 char + 1 fusion pick + 1 plan ball + 1 fused pair
    expect(vm.editionDroppedCount).toBe(4);
  });

  it('a fused pair with one hidden component is dropped as one entry', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleEdition', edition: 'dlc-risen-ballbylon' });
    view.dispatch({ type: 'togglePlanFusion', a: 'beast', b: 'bleed' });
    const vm = view.dispatch({ type: 'toggleEdition', edition: 'dlc-risen-ballbylon' });
    expect(vm.plan.balls).toHaveLength(0);
    expect(vm.editionDroppedCount).toBe(1);
  });

  it('re-enabling the expansion does not restore anything', () => {
    const view = withDlcContent();
    view.dispatch({ type: 'toggleEdition', edition: 'dlc-risen-ballbylon' });
    const vm = view.dispatch({ type: 'toggleEdition', edition: 'dlc-risen-ballbylon' });
    expect(vm.selectedChars).toHaveLength(0);
    expect(vm.plan.balls).toHaveLength(0);
    expect(vm.plan.passives.map((e) => e.item.id)).toEqual(['wagon-wheel']);
  });

  it('the loss count clears on the next action', () => {
    const view = withDlcContent();
    expect(view.dispatch({ type: 'toggleEdition', edition: 'dlc-risen-ballbylon' }).editionDroppedCount).toBe(4);
    expect(view.dispatch({ type: 'search', section: 'balls', query: '' }).editionDroppedCount).toBe(0);
  });

  it('toggling an edition on reports no loss', () => {
    const view = createViewState();
    expect(view.dispatch({ type: 'toggleEdition', edition: 'dlc-risen-ballbylon' }).editionDroppedCount).toBe(0);
  });

  it('a hidden catalog selection is dropped silently (no hidden-but-live state)', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleEdition', edition: 'dlc-risen-ballbylon' });
    view.dispatch({ type: 'toggleItem', id: 'beast' });
    const vm = view.dispatch({ type: 'toggleEdition', edition: 'dlc-risen-ballbylon' });
    expect(vm.selectionBoxes.balls).toBeNull();
    expect(vm.editionDroppedCount).toBe(0); // the transient selection is not an "entry"
  });
});

describe('view state: edition filter on hydrate (share restore)', () => {
  const dlcShared = {
    plan: { upgradesOn: true, balls: ['beast'], passives: ['wagon-wheel'], fused: [{ a: 'beast', b: 'bleed' }] },
    chars: ['the-potager'],
    editions: ['base-game', 'dlc-risen-ballbylon'] as ('base-game' | 'dlc-risen-ballbylon')[],
  };

  it('a share with both editions keeps its DLC entries', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'hydrate', shared: dlcShared, notify: true });
    expect(vm.enabledEditions).toEqual(['base-game', 'dlc-risen-ballbylon']);
    expect(vm.selectedChars.map((c) => c.id)).toEqual(['the-potager']);
    expect(vm.plan.balls.some((e) => e.kind === 'single' && e.item.id === 'beast')).toBe(true);
    expect(vm.editionDroppedCount).toBe(0);
  });

  it('a share with base-game only drops its hidden entries and reports the loss', () => {
    const view = createViewState();
    const vm = view.dispatch({
      type: 'hydrate',
      shared: { ...dlcShared, editions: ['base-game'] },
      notify: true,
    });
    expect(vm.selectedChars).toHaveLength(0);
    expect(vm.plan.balls).toHaveLength(0);
    expect(vm.plan.passives.map((e) => e.item.id)).toEqual(['wagon-wheel']);
    // 1 char + 1 plan ball + 1 fused pair
    expect(vm.editionDroppedCount).toBe(3);
  });

  it('a plain startup restore enforces the invariant but does not fire the loss notice', () => {
    const view = createViewState();
    const vm = view.dispatch({
      type: 'hydrate',
      shared: { ...dlcShared, editions: ['base-game'] },
      notify: false,
    });
    expect(vm.plan.balls).toHaveLength(0);
    expect(vm.editionDroppedCount).toBe(0);
  });
});

describe('view state: the build graph honors gated recipes', () => {
  it('a hidden recipe leaves the build graph while the base ball stays', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'togglePlanItem', id: 'blizzard' });
    const ids = vm.buildGraph.balls.nodes.map((n) => n.id);
    expect(ids).toContain('blizzard');
    expect(ids).toContain('freeze');
    expect(ids).toContain('wind');
    expect(ids).toContain('lightning');
    expect(ids).not.toContain('water'); // Water is DLC — its recipe is unavailable
  });

  it('enabling the expansion brings the gated recipe back into the graph', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleEdition', edition: 'dlc-risen-ballbylon' });
    const vm = view.dispatch({ type: 'togglePlanItem', id: 'blizzard' });
    expect(vm.buildGraph.balls.nodes.map((n) => n.id)).toContain('water');
  });
});

describe('view state: the highlight walk honors gated recipes', () => {
  it('a hidden recipe component is not related; enabling the edition adds it', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'toggleItem', id: 'blizzard' });
    expect(vm.tiles.get('freeze')!.related).toBe(true);
    expect(vm.tiles.get('wind')!.related).toBe(true);
    expect(vm.tiles.get('water')!.related).toBe(false); // DLC component of a hidden recipe
    const vm2 = view.dispatch({ type: 'toggleEdition', edition: 'dlc-risen-ballbylon' });
    expect(vm2.tiles.get('water')!.related).toBe(true);
  });
});
