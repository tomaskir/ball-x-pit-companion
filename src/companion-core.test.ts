// Unit tests for the island's startup decisions, extracted from
// src/companion.ts into a DOM-free core (src/companion-core.ts) so they can
// be tested without importing the island (whose top-level init() makes it
// jsdom-hostile). The wiring in companion.ts applies these decisions to real
// events; here only the decisions themselves are pinned.
import { describe, it, expect } from 'vitest';
import { sectionFromHash, shouldClear, themeFromStorage, ESC_EXEMPT_SELECTOR } from './companion-core';

describe('sectionFromHash (hash routing)', () => {
  it('reads the section from a plain hash, with or without the slash', () => {
    expect(sectionFromHash('#/plan')).toBe('plan');
    expect(sectionFromHash('#plan')).toBe('plan');
    expect(sectionFromHash('#/fusions')).toBe('fusions');
  });

  it('ignores a share parameter riding the hash (#/plan?p=…)', () => {
    expect(sectionFromHash('#/plan?p=eyJ2')).toBe('plan');
    expect(sectionFromHash('#/plan?x=1')).toBe('plan');
  });

  it('defaults the empty hash to balls (the landing screen)', () => {
    expect(sectionFromHash('')).toBe('balls');
    expect(sectionFromHash('#')).toBe('balls');
    expect(sectionFromHash('#/')).toBe('balls');
    expect(sectionFromHash('#?p=eyJ2')).toBe('balls');
  });

  it('returns null for unknown sections — the hash must not switch screens', () => {
    expect(sectionFromHash('#/nope')).toBeNull();
    expect(sectionFromHash('#/BALLS')).toBeNull();
  });
});

describe('shouldClear (Esc / empty-space clear policy)', () => {
  it('clears the active section on empty space', () => {
    expect(shouldClear('balls', false)).toBe(true);
    expect(shouldClear('characters', false)).toBe(true);
  });

  it('never clears the plan screen — its selection is deliberate work', () => {
    expect(shouldClear('plan', false)).toBe(false);
  });

  it('does not clear inside an exempt region (tab click, search box, tile…)', () => {
    expect(shouldClear('balls', true)).toBe(false);
    expect(shouldClear('plan', true)).toBe(false);
  });

  // The click exemption is no longer a selector here: the regions carry
  // src/clear-exempt.ts's marker, and the island asks isClearExempt. The
  // predicate is pinned against the real built DOM (every interactive
  // region) in src/companion.test.ts, and the load-bearing regions are also
  // pinned behaviorally there.
  it('the Esc exemption covers only inputs (Esc in a search box clears the query, not the selection)', () => {
    expect(ESC_EXEMPT_SELECTOR).toBe('input');
  });
});

describe('themeFromStorage (theme init)', () => {
  it('a stored theme wins', () => {
    expect(themeFromStorage('dark', true)).toBe('dark');
    expect(themeFromStorage('light', false)).toBe('light');
  });

  it('without a stored theme, the OS preference decides', () => {
    expect(themeFromStorage(null, true)).toBe('light');
    expect(themeFromStorage(null, false)).toBe('dark');
  });

  it('a garbage stored value falls through to the OS preference', () => {
    expect(themeFromStorage('blue', true)).toBe('light');
    expect(themeFromStorage('blue', false)).toBe('dark');
  });
});
