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
