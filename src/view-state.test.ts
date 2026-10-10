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
    view.dispatch({ type: 'toggleChar', id: 'the-ballbearer' });
    const vm = view.dispatch({ type: 'togglePlanItem', id: 'wagon-wheel' });
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
      plan: {
        upgradesOn: true,
        chars: ['the-repentant', 'the-shieldbearer'],
        balls: [],
        passives: [],
        fused: [],
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
      plan: { upgradesOn: true, chars: ['the-warrior', 'the-shade'], balls: [], passives: [], fused: [] },
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
      plan: {
        upgradesOn: false,
        chars: [],
        balls: ['bomb', 'inferno', 'frozen-flame', 'elemental', 'time-bomb'],
        passives: [],
        fused: [],
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
