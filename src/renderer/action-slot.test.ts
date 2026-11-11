// Unit tests for the renderer's action-slot adapter — the once-built click
// channel, extracted from the reconcile seam so the diff cache carries no
// action payload. Tested without mounting the whole island.
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { bindAction } from './action-slot';

describe('renderer action slot', () => {
  it('emits the typed action set most recently, after repaints refresh it', () => {
    const el = document.createElement('button');
    const emit = vi.fn();
    const slot = bindAction(el, emit);

    slot.set({ type: 'togglePlanItem', id: 'flash' });
    el.click();
    expect(emit).toHaveBeenLastCalledWith({ type: 'togglePlanItem', id: 'flash' });

    // the element is built once; the pair changes under it
    slot.set({ type: 'togglePlanFusion', a: 'flash', b: 'glacier' });
    el.click();
    expect(emit).toHaveBeenLastCalledWith({ type: 'togglePlanFusion', a: 'flash', b: 'glacier' });
  });

  it('carries the action object itself — no string round-trip', () => {
    const el = document.createElement('button');
    const emit = vi.fn();
    const slot = bindAction(el, emit);
    const action = { type: 'togglePlanFusion', a: 'glacier', b: 'flash' } as const;
    slot.set(action);
    el.click();
    expect(emit).toHaveBeenCalledWith(action);
    expect(emit.mock.calls[0][0]).toBe(action);
  });

  it('emits nothing before an action is set and after clear()', () => {
    const el = document.createElement('button');
    const emit = vi.fn();
    const slot = bindAction(el, emit);

    el.click();
    expect(emit).not.toHaveBeenCalled();

    slot.set({ type: 'toggleFusion', id: 'flash' });
    slot.clear();
    el.click();
    expect(emit, 'a cleared slot leaves no stale payload').not.toHaveBeenCalled();
  });
});
