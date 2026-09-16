// Slug invariants, pinned through the module's interface (was: two divergent
// copies in parse-wiki.ts / emit-data.ts).
import { describe, it, expect } from 'vitest';
import { slug } from './slug.ts';

describe('slug: apostrophes are dropped, not slugified as separators', () => {
  // Icons use "archers-effigy"; an old copy slugified to "archer-s-effigy".
  it("Archer's Effigy → archers-effigy", () => {
    expect(slug("Archer's Effigy")).toBe('archers-effigy');
  });
  it("other apostrophe names: Deadeye's Cross, Lover's Quiver, Traitor's Cowl", () => {
    expect(slug("Deadeye's Cross")).toBe('deadeyes-cross');
    expect(slug("Lover's Quiver")).toBe('lovers-quiver');
    expect(slug("Traitor's Cowl")).toBe('traitors-cowl');
  });
});

describe('slug: Laser H/V abbreviations resolve to full ids', () => {
  // Recipe cells use "Laser H or Laser V"; icons are laser-horizontal/vertical.
  it('Laser H → laser-horizontal', () => {
    expect(slug('Laser H')).toBe('laser-horizontal');
  });
  it('Laser V → laser-vertical', () => {
    expect(slug('Laser V')).toBe('laser-vertical');
  });
  it('Laser (horizontal) → laser-horizontal', () => {
    expect(slug('Laser (horizontal)')).toBe('laser-horizontal');
  });
});

describe('slug: dagger abbreviations', () => {
  it('Diamond/Sapphire/Ruby/Emerald → *-hilted-dagger', () => {
    expect(slug('Diamond')).toBe('diamond-hilted-dagger');
    expect(slug('Sapphire')).toBe('sapphire-hilted-dagger');
    expect(slug('Ruby')).toBe('ruby-hilted-dagger');
    expect(slug('Emerald')).toBe('emerald-hilted-dagger');
  });
});

describe('slug: general kebab-case normalization', () => {
  it('lowercases and joins on single dashes', () => {
    expect(slug('Vampire Lord')).toBe('vampire-lord');
    expect(slug('The Hoary Hoarder')).toBe('the-hoary-hoarder');
  });
  it('strips leading/trailing separators', () => {
    expect(slug('  Black Hole ')).toBe('black-hole');
  });
});
