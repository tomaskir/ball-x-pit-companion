// Focused test for the character-chips painter: it needs only its two
// containers, not the island shell or a full renderer build — the locality
// win of the renderer split. The painter is created over a per-instance
// reconcile cache, and a repaint with the same selection keeps the built
// chips.
// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { createChips } from './chips';
import { createReconcile } from './reconcile';
import { createViewState } from '../view-state';

beforeEach(() => {
  document.body.innerHTML = '<p id="slotHint"></p><div id="charChips"></div>';
});

const chips = () => createChips({ emitAction: () => {}, reconcile: createReconcile().reconcile });

describe('character chips painter (no island mount)', () => {
  it('paints the chip strip and slot hint from the view model alone', () => {
    const view = createViewState();
    const vm = view.dispatch({ type: 'toggleChar', id: 'the-warrior' });
    chips().paint(vm);
    expect(document.getElementById('slotHint')!.textContent).toBe(vm.slotHint);
    const els = [...document.querySelectorAll<HTMLElement>('#charChips .chip')];
    expect(els).toHaveLength(1);
    expect(els[0].textContent).toContain('The Warrior');
    expect(els[0].querySelector('.chip-x')).toBeTruthy();
  });

  it('keeps the built chips when the selection is unchanged, rebuilds when it changes', () => {
    const painter = chips();
    const view = createViewState();
    painter.paint(view.dispatch({ type: 'toggleChar', id: 'the-warrior' }));
    const chip = document.querySelector('#charChips .chip');

    painter.paint(view.derive()); // same selection → reconcile leaves the DOM
    expect(document.querySelector('#charChips .chip')).toBe(chip);

    painter.paint(view.dispatch({ type: 'toggleChar', id: 'the-shade' }));
    expect(document.querySelectorAll('#charChips .chip')).toHaveLength(2);
    expect(document.querySelector('#charChips .chip')).not.toBe(chip);
  });
});
