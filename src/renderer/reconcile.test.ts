// Unit tests for the renderer's reconcile seam — the content-diff cache every
// painter's built-once/repaint-in-place pattern shares. The cache is created
// per renderer instance (createReconcile), so two renderers never share
// painted keys. The once-built action channel is its own module
// (action-slot.test.ts).
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { createReconcile } from './reconcile';

describe('renderer reconcile seam', () => {
  it('repaints only when the key changes, and records the painted key', () => {
    const { reconcile } = createReconcile();
    const el = document.createElement('div');
    let paints = 0;
    reconcile(el, 'a', () => { paints++; });
    expect(paints).toBe(1);

    reconcile(el, 'a', () => { paints++; });
    expect(paints, 'a matching key leaves the built DOM untouched').toBe(1);

    reconcile(el, 'b', () => { paints++; });
    expect(paints).toBe(2);
  });

  it('a matching key leaves the built DOM (and its <img>) in place', () => {
    const { reconcile } = createReconcile();
    const el = document.createElement('div');
    el.innerHTML = '<img src="a.png">';
    reconcile(el, 'k', () => { el.innerHTML = '<img src="b.png">'; });
    const img = el.querySelector('img');
    reconcile(el, 'k', () => { el.innerHTML = '<img src="c.png">'; });
    expect(el.querySelector('img')).toBe(img);
    expect(img!.getAttribute('src')).toBe('b.png');
  });

  it('two reconcilers keep independent caches (renderer instances do not share)', () => {
    const a = createReconcile();
    const b = createReconcile();
    const el = document.createElement('div');
    let paints = 0;
    a.reconcile(el, 'k', () => { paints++; });
    b.reconcile(el, 'k', () => { paints++; });
    expect(paints, 'the second instance has not painted this element').toBe(2);
  });

  it('reset drops the cache, so the next paint runs again', () => {
    const reconciler = createReconcile();
    const el = document.createElement('div');
    let paints = 0;
    reconciler.reconcile(el, 'k', () => { paints++; });
    reconciler.reconcile(el, 'k', () => { paints++; });
    expect(paints).toBe(1);
    reconciler.reset();
    reconciler.reconcile(el, 'k', () => { paints++; });
    expect(paints).toBe(2);
  });
});
