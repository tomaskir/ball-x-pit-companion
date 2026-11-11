// Unit tests for the renderer's reconcile seam — the content-diff cache every
// painter's built-once/repaint-in-place pattern shares. Extracted from
// src/renderer.ts so the seam is testable without mounting the whole island.
// The once-built action channel is its own module (action-slot.test.ts).
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { reconcile } from './reconcile';

describe('renderer reconcile seam', () => {
  it('repaints only when the key changes, and records the painted key', () => {
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
    const el = document.createElement('div');
    el.innerHTML = '<img src="a.png">';
    reconcile(el, 'k', () => { el.innerHTML = '<img src="b.png">'; });
    const img = el.querySelector('img');
    reconcile(el, 'k', () => { el.innerHTML = '<img src="c.png">'; });
    expect(el.querySelector('img')).toBe(img);
    expect(img!.getAttribute('src')).toBe('b.png');
  });
});
