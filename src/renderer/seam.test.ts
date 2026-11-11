// Focused tests for the renderer's build seam, without mounting the island:
// initSeam captures the island's callbacks and emitAction reports through
// them. The behavioral half (clicks reaching emit) lives in
// src/renderer.test.ts; this pins the seam itself.
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { emitAction, initSeam } from './seam';

describe('renderer build seam', () => {
  it('emitAction before any init is a no-op (safe before buildAll)', () => {
    expect(() => emitAction({ type: 'swapFusion' })).not.toThrow();
  });

  it('emitAction reports through the callback initSeam captured', () => {
    const emit = vi.fn();
    initSeam({ getVerdict: () => null, emit });
    emitAction({ type: 'toggleItem', id: 'flash' });
    expect(emit).toHaveBeenCalledWith({ type: 'toggleItem', id: 'flash' });
  });

  it('a later initSeam replaces the captured callback (buildAll re-runs)', () => {
    const first = vi.fn();
    const second = vi.fn();
    initSeam({ getVerdict: () => null, emit: first });
    initSeam({ getVerdict: () => null, emit: second });
    emitAction({ type: 'swapFusion' });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith({ type: 'swapFusion' });
  });
});
