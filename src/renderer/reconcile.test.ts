// Unit tests for the renderer's reconcile seam — the painted-key map shared
// by every painter's built-once/repaint-in-place pattern. Extracted from
// src/renderer.ts so the seam is testable without mounting the whole island.
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { clearPaintedKey, paintedKey, reconcile, setPaintedKey } from './reconcile';

describe('renderer reconcile seam', () => {
  it('repaints only when the key changes, and records the painted key', () => {
    const el = document.createElement('div');
    let paints = 0;
    reconcile(el, 'a', () => { paints++; });
    expect(paints).toBe(1);
    expect(paintedKey(el)).toBe('a');

    reconcile(el, 'a', () => { paints++; });
    expect(paints, 'a matching key leaves the built DOM untouched').toBe(1);

    reconcile(el, 'b', () => { paints++; });
    expect(paints).toBe(2);
    expect(paintedKey(el)).toBe('b');
  });

  it('a matching key leaves the built DOM (and its <img>) in place', () => {
    const el = document.createElement('div');
    el.innerHTML = '<img src="a.png">';
    reconcile(el, 'k', () => { el.innerHTML = '<img src="b.png">'; });
    const img = el.querySelector('img');
    reconcile(el, 'k', () => { el.innerHTML = '<img src="c.png">'; });
    expect(el.querySelector('img')).toBe(img);
    expect(img!.getAttribute('src')).toBe('b.png');
  });

  it('setPaintedKey/clearPaintedKey are the explicit channel once-built handlers read', () => {
    const el = document.createElement('div');
    expect(paintedKey(el)).toBeUndefined();
    setPaintedKey(el, 'flash|glacier');
    expect(paintedKey(el)).toBe('flash|glacier');
    clearPaintedKey(el);
    expect(paintedKey(el)).toBeUndefined();
  });
});
