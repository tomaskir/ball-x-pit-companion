// Unit tests for the clear-exemption marker/predicate. The predicate is
// pinned against the real built DOM in src/companion.test.ts (every
// interactive region the painters and shell produce), and the load-bearing
// regions are also pinned behaviorally there (clicking them must not clear
// the selection); these pin the predicate's own semantics — the marker
// covers the subtree, and non-element targets are never exempt.
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { CLEAR_EXEMPT_ATTR, markClearExempt, isClearExempt } from './clear-exempt';

describe('clear-exempt marker', () => {
  it('marks an element and covers its subtree', () => {
    const region = document.createElement('div');
    const child = document.createElement('button');
    region.appendChild(child);
    document.body.appendChild(region);

    expect(isClearExempt(region)).toBe(false);
    markClearExempt(region);
    expect(region.hasAttribute(CLEAR_EXEMPT_ATTR)).toBe(true);
    expect(isClearExempt(region)).toBe(true);
    expect(isClearExempt(child)).toBe(true);

    region.remove();
  });

  it('does not exempt elements outside a marked region', () => {
    const marked = document.createElement('div');
    const outside = document.createElement('div');
    markClearExempt(marked);
    document.body.append(marked, outside);

    expect(isClearExempt(outside)).toBe(false);

    marked.remove();
    outside.remove();
  });

  it('non-element targets are never exempt', () => {
    expect(isClearExempt(null)).toBe(false);
    expect(isClearExempt(document)).toBe(false);
  });
});
