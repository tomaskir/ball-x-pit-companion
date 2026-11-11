// The renderer's instance lifecycle: createRenderer owns the seam, the toast
// adapter, the reconcile cache, and every painter registry. These tests pin
// the guarantees the old process-global buildAll/paint pair could not make —
// paint before build is safe, a second build is safe, destroy tears the
// instance down, and two renderers never rebind each other's emit callback.
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRenderer, type BuildOptions, type Renderer } from '../renderer';
import { createViewState } from '../view-state';
import { mountShell } from '../test-support/containers';

let live: Renderer[] = [];

function make(options: BuildOptions = { emit: () => {} }): Renderer {
  const renderer = createRenderer(options);
  live.push(renderer);
  return renderer;
}

const tile = () => document.querySelector<HTMLElement>('#ballsGrid .tile[data-id="flash"]')!;

beforeEach(() => {
  mountShell();
});

afterEach(() => {
  for (const renderer of live) renderer.destroy();
  live = [];
});

describe('renderer lifecycle (jsdom)', () => {
  it('paint before build is a safe no-op', () => {
    const renderer = make();
    expect(() => renderer.paint(createViewState().derive())).not.toThrow();
    // nothing was built, so the shell's containers are still empty
    expect(document.querySelectorAll('#ballsGrid .tile')).toHaveLength(0);
  });

  it('a second build() is safe: containers reset, no duplicate DOM', () => {
    const renderer = make();
    renderer.build();
    const tileCount = document.querySelectorAll('#ballsGrid .tile').length;
    expect(tileCount).toBeGreaterThan(0);

    renderer.build();

    expect(document.querySelectorAll('#ballsGrid .tile')).toHaveLength(tileCount);
    expect(document.querySelectorAll('#fusionPanel')).toHaveLength(1);
    expect(document.querySelectorAll('#selection-balls')).toHaveLength(1);
    // the plan skeleton and its two graph panels were rebuilt, not appended twice
    expect(document.querySelectorAll('.plan-graph')).toHaveLength(2);
    // and the rebuilt instance still paints
    const vm = createViewState().dispatch({ type: 'toggleItem', id: 'flash' });
    renderer.paint(vm);
    expect(tile().classList.contains('selected')).toBe(true);
  });

  it('two renderer instances keep their own emit callbacks (no module-level rebinding)', () => {
    const emitA = vi.fn();
    const emitB = vi.fn();
    const first = make({ emit: emitA });
    first.build();
    const tileA = tile();

    // a second instance over a fresh shell — creating it must not rebind A
    document.body.innerHTML = '';
    mountShell();
    const second = make({ emit: emitB });
    second.build();
    const tileB = tile();
    expect(tileB).not.toBe(tileA);

    tileA.click();
    expect(emitA).toHaveBeenCalledWith({ type: 'toggleItem', id: 'flash' });
    expect(emitB).not.toHaveBeenCalled();

    tileB.click();
    expect(emitB).toHaveBeenCalledWith({ type: 'toggleItem', id: 'flash' });
    expect(emitA).toHaveBeenCalledTimes(1);
  });

  it('destroy hides the toast, removes its document listener, and clears the registries', () => {
    const emit = vi.fn();
    const renderer = make({ emit });
    renderer.build();
    tile().dispatchEvent(new MouseEvent('mouseenter'));
    expect(document.querySelector('body > .toast')).toBeTruthy();

    const remove = vi.spyOn(document, 'removeEventListener');
    try {
      renderer.destroy();
      expect(document.querySelector('body > .toast')).toBeNull();
      expect(remove).toHaveBeenCalledWith('pointerdown', expect.any(Function));
    } finally {
      remove.mockRestore();
    }

    // the seam is inert: built-once DOM handlers that outlive the renderer
    // cannot show a toast or emit an action
    tile().dispatchEvent(new MouseEvent('mouseenter'));
    expect(document.querySelector('body > .toast')).toBeNull();
    tile().click();
    expect(emit).not.toHaveBeenCalled();

    // registries cleared and built=false: a later paint is a safe no-op
    const vm = createViewState().dispatch({ type: 'toggleItem', id: 'flash' });
    expect(() => renderer.paint(vm)).not.toThrow();
    expect(tile().classList.contains('selected')).toBe(false);
    // destroy is idempotent
    expect(() => renderer.destroy()).not.toThrow();
  });

  it('destroy is terminal: a later build() is a no-op', () => {
    const renderer = make();
    renderer.build();
    renderer.destroy();

    // clear the built DOM, then try to rebuild through the dead instance
    document.getElementById('ballsGrid')!.innerHTML = '';
    expect(() => renderer.build()).not.toThrow();
    expect(document.querySelectorAll('#ballsGrid .tile')).toHaveLength(0);
  });
});
