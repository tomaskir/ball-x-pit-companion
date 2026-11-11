// Focused tests for the renderer's build seam, without mounting the island:
// createSeam captures the island's callback, emitAction reports through it,
// and the toast's verdict is read from the last view model paint() captured
// (not from a second live-state callback). destroy() tears the toast adapter
// down. The behavioral half (clicks reaching emit) lives in
// src/renderer.test.ts; this pins the seam itself.
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { createSeam } from './seam';
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
  it('emitAction reports through the callback the seam captured', () => {
    const emit = vi.fn();
    const seam = createSeam({ emit });
    try {
      seam.emitAction({ type: 'toggleItem', id: 'flash' });
      expect(emit).toHaveBeenCalledWith({ type: 'toggleItem', id: 'flash' });
    } finally {
      seam.destroy();
    }
  });

  it('two seams never rebind each other', () => {
    const first = vi.fn();
    const second = vi.fn();
    const seamA = createSeam({ emit: first });
    const seamB = createSeam({ emit: second });
    try {
      seamA.emitAction({ type: 'swapFusion' });
      expect(first).toHaveBeenCalledWith({ type: 'swapFusion' });
      expect(second).not.toHaveBeenCalled();
      seamB.emitAction({ type: 'toggleChar', id: 'the-warrior' });
      expect(second).toHaveBeenCalledWith({ type: 'toggleChar', id: 'the-warrior' });
      expect(first).toHaveBeenCalledTimes(1);
    } finally {
      seamA.destroy();
      seamB.destroy();
    }
  });

  it('attachToast binds an anchor to the seam-owned toast adapter', () => {
    const seam = createSeam({ emit: () => {} });
    const a = anchor();
    try {
      seam.attachToast(a, () => itemFor('flash') ?? null);
      a.dispatchEvent(new MouseEvent('mouseenter'));
      expect(document.querySelector('body > .toast')).toBeTruthy();
    } finally {
      seam.destroy();
      a.remove();
    }
    expect(document.querySelector('body > .toast')).toBeNull();
  });

  it('destroy removes the toast adapter\'s document-level dismissal listener', () => {
    const remove = vi.spyOn(document, 'removeEventListener');
    const seam = createSeam({ emit: () => {} });
    try {
      seam.destroy();
      expect(remove).toHaveBeenCalledWith('pointerdown', expect.any(Function));
    } finally {
      remove.mockRestore();
    }
  });

  it('the toast verdict is the painted tile verdict from the last captured view model', () => {
    const seam = createSeam({ emit: () => {} });
    const a = anchor();
    try {
      const vm = withVerdicts();
      const [id, tile] = [...vm.tiles].find(([, t]) => t.verdict !== null)!;
      seam.capture(vm);
      seam.attachToast(a, () => itemFor(id) ?? null);
      a.dispatchEvent(new MouseEvent('mouseenter'));
      const line = document.querySelector<HTMLElement>('body > .toast .verdicts span')!;
      expect(line).toBeTruthy();
      expect(line.textContent).toContain(tile.verdict!.verdict);
      if (tile.verdict!.note) expect(line.textContent).toContain(tile.verdict!.note);
    } finally {
      seam.destroy();
      a.remove();
    }
  });

  it('a later capture(null) drops the previous view model (no stale toast verdict)', () => {
    const seam = createSeam({ emit: () => {} });
    const a = anchor();
    try {
      const vm = withVerdicts();
      const [id] = [...vm.tiles].find(([, t]) => t.verdict !== null)!;
      seam.capture(vm);
      seam.capture(null);
      seam.attachToast(a, () => itemFor(id) ?? null);
      a.dispatchEvent(new MouseEvent('mouseenter'));
      expect(document.querySelector('body > .toast .verdicts')).toBeNull();
    } finally {
      seam.destroy();
      a.remove();
    }
  });
});
