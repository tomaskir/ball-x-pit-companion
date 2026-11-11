// Focused tests for the renderer's build seam, without mounting the island:
// initSeam captures the island's callback, emitAction reports through it,
// and the toast's verdict is read from the last view model paint() captured
// (not from a second live-state callback). The behavioral half (clicks
// reaching emit) lives in src/renderer.test.ts; this pins the seam itself.
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { attachToast, captureViewModel, emitAction, initSeam } from './seam';
import { createViewState } from '../view-state';
import { itemFor } from '../catalog';

/** An anchor in the document (the toast positions off its rect). */
const anchor = () => {
  const el = document.createElement('button');
  document.body.appendChild(el);
  return el;
};

/** A view model whose tiles carry at least one verdict. */
const withVerdicts = () => createViewState().dispatch({ type: 'toggleChar', id: 'the-ballbearer' });

describe('renderer build seam', () => {
  it('emitAction before any init is a no-op (safe before buildAll)', () => {
    expect(() => emitAction({ type: 'swapFusion' })).not.toThrow();
  });

  it('emitAction reports through the callback initSeam captured', () => {
    const emit = vi.fn();
    initSeam({ emit });
    emitAction({ type: 'toggleItem', id: 'flash' });
    expect(emit).toHaveBeenCalledWith({ type: 'toggleItem', id: 'flash' });
  });

  it('a later initSeam replaces the captured callback (buildAll re-runs)', () => {
    const first = vi.fn();
    const second = vi.fn();
    initSeam({ emit: first });
    initSeam({ emit: second });
    emitAction({ type: 'swapFusion' });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith({ type: 'swapFusion' });
  });

  it('the toast verdict is the painted tile verdict from the last captured view model', () => {
    initSeam({ emit: () => {} });
    const vm = withVerdicts();
    const [id, tile] = [...vm.tiles].find(([, t]) => t.verdict !== null)!;
    captureViewModel(vm);
    const a = anchor();
    attachToast(a, () => itemFor(id) ?? null);
    a.dispatchEvent(new MouseEvent('mouseenter'));
    const line = document.querySelector<HTMLElement>('body > .toast .verdicts span')!;
    expect(line).toBeTruthy();
    expect(line.textContent).toContain(tile.verdict!.verdict);
    if (tile.verdict!.note) expect(line.textContent).toContain(tile.verdict!.note);
  });

  it('a later initSeam drops the previous view model (no stale toast verdict)', () => {
    initSeam({ emit: () => {} });
    const vm = withVerdicts();
    const [id] = [...vm.tiles].find(([, t]) => t.verdict !== null)!;
    captureViewModel(vm);
    initSeam({ emit: () => {} });
    const a = anchor();
    attachToast(a, () => itemFor(id) ?? null);
    a.dispatchEvent(new MouseEvent('mouseenter'));
    expect(document.querySelector('body > .toast .verdicts')).toBeNull();
  });
});
