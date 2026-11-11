// Focused test for the character-chips painter: it needs only its two
// containers, not the island shell or buildAll() — the locality win of the
// renderer split. The reconcile seam is pinned here too: a repaint with the
// same selection keeps the built chips.
// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { paintCharChips } from './chips';
import { createViewState } from '../view-state';

beforeEach(() => {
  document.body.innerHTML = '<p id="slotHint"></p><div id="charChips"></div>';
});

describe('character chips painter (no island mount)', () => {
  it('paints the chip strip and slot hint from the view model alone', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'toggleChar', id: 'the-warrior' });
    paintCharChips(vm);
    expect(document.getElementById('slotHint')!.textContent).toBe(vm.slotHint);
    const chips = [...document.querySelectorAll<HTMLElement>('#charChips .chip')];
    expect(chips).toHaveLength(1);
    expect(chips[0].textContent).toContain('The Warrior');
    expect(chips[0].querySelector('.chip-x')).toBeTruthy();
  });

  it('keeps the built chips when the selection is unchanged, rebuilds when it changes', () => {
    const view = createViewState();
    paintCharChips(view.dispatch({ type: 'toggleChar', id: 'the-warrior' }));
    const chip = document.querySelector('#charChips .chip');

    paintCharChips(view.derive()); // same selection → reconcile leaves the DOM
    expect(document.querySelector('#charChips .chip')).toBe(chip);

    paintCharChips(view.dispatch({ type: 'toggleChar', id: 'the-shade' }));
    expect(document.querySelectorAll('#charChips .chip')).toHaveLength(2);
    expect(document.querySelector('#charChips .chip')).not.toBe(chip);
  });
});
