// Tests for the view-state module through its one interface:
// createViewState() → dispatch(action) → ViewModel. The island's repaint
// rules (which tiles are selected/related/dimmed/filtered, which chars are
// selected, what the chips show) concentrate here — testable without DOM.
import { describe, it, expect } from 'vitest';
import { createViewState } from './view-state';
import { graphFor } from './catalog';

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

describe('view state: character slots (max 2, FIFO eviction)', () => {
  it('first selection sets slotHint, selection marks the card', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'toggleChar', id: 'the-warrior' });
    expect(vm.slotHint).toBe('pick a second character…');
    expect(vm.charCards.get('the-warrior')!.selected).toBe(true);
    expect(vm.selectedChars).toHaveLength(1);
  });

  it('third selection evicts the first (FIFO)', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleChar', id: 'the-warrior' });
    view.dispatch({ type: 'toggleChar', id: 'the-shade' });
    const vm = view.dispatch({ type: 'toggleChar', id: 'the-tactician' });
    expect(vm.selectedChars.map((c) => c.id)).toEqual(['the-shade', 'the-tactician']);
    expect(vm.charCards.get('the-warrior')!.selected).toBe(false);
  });

  it('deselecting one character keeps the other', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleChar', id: 'the-warrior' });
    const vm = view.dispatch({ type: 'toggleChar', id: 'the-shade' });
    expect(vm.selectedChars).toHaveLength(2);
    expect(vm.slotHint).toBe('');
    const vm2 = view.dispatch({ type: 'toggleChar', id: 'the-warrior' });
    expect(vm2.selectedChars.map((c) => c.id)).toEqual(['the-shade']);
  });
});

describe('view state: search filter (ticket 07 semantics)', () => {
  it('filters tiles by name and effect text, non-matching get filtered', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'search', query: 'vampire' });
    expect(vm.tiles.get('vampire')!.filtered).toBe(false);
    expect(vm.tiles.get('vampire-lord')!.filtered).toBe(false); // name match
    // effect-text match: Nosferatu's effect mentions vampire bats but its name doesn't
    expect(vm.tiles.get('nosferatu')!.filtered).toBe(false);
    expect(vm.tiles.get('burn')!.filtered).toBe(true);
    expect(vm.tiles.get('inferno')!.filtered).toBe(true); // "Inferno" name
  });

  it('search also filters character cards by name, quirk, and base ball name', () => {
    const view = createViewState();
    // The Warrior's base ball is Bleed — base-ball-name match
    const vm = view.dispatch({ type: 'search', query: 'bleed' });
    expect(vm.charCards.get('the-warrior')!.filtered).toBe(false);
    expect(vm.tiles.get('burn')!.filtered).toBe(true);
  });

  it('search is case-insensitive and trims', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'search', query: '  VAMPIRE  ' });
    expect(vm.tiles.get('vampire')!.filtered).toBe(false);
  });

  it('clearing the query un-filters', () => {
    const view = createViewState();
    view.dispatch({ type: 'search', query: 'zzz-no-match' });
    const vm = view.dispatch({ type: 'search', query: '' });
    expect(vm.tiles.get('burn')!.filtered).toBe(false);
  });
});

describe('view state: clear action (Esc / empty-space click)', () => {
  it('clears item selection but keeps characters and query', () => {
    const view = createViewState();
    view.dispatch({ type: 'toggleItem', id: 'inferno' });
    view.dispatch({ type: 'toggleChar', id: 'the-warrior' });
    view.dispatch({ type: 'search', query: 'vamp' });
    const vm = view.dispatch({ type: 'clear' });
    expect(vm.tiles.get('inferno')!.selected).toBe(false);
    expect(vm.tiles.get('bleed')!.dimmed).toBe(false);
    expect(vm.selectedChars).toHaveLength(1);
    expect(vm.tiles.get('burn')!.filtered).toBe(true); // query survives
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
