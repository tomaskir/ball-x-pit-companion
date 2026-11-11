// Tests for the share-code module: the URL transport half of the share-link
// lifecycle — the full `#/plan?p=<code>` link and the one-shot read of the
// ?p= parameter out of a location hash. The codec itself (SharedSnapshot ⇄
// v1 wire) is plan-codec.test.ts's.
import { describe, it, expect } from 'vitest';
import { planLink, takeShareParam } from './share';
import { encodeShared, type SharedSnapshot } from './plan-codec';

const shared: SharedSnapshot = {
  plan: {
    upgradesOn: false,
    balls: ['flash', 'glacier'],
    passives: ['wagon-wheel'],
    fused: [{ a: 'nosferatu', b: 'vampire-lord' }],
  },
  chars: ['the-warrior', 'the-shade'],
};

describe('planLink', () => {
  it('builds the full #/plan?p=<code> URL from origin + pathname', () => {
    const url = planLink('https://tomaskir.github.io', '/ball-x-pit-companion/', shared);
    expect(url.startsWith('https://tomaskir.github.io/ball-x-pit-companion/#/plan?p=')).toBe(true);
  });

  it("the link's parameter decodes back to the shared snapshot", () => {
    const url = planLink('https://example.com', '/ball-x-pit-companion/', shared);
    expect(takeShareParam(new URL(url).hash)?.shared).toEqual(shared);
  });
});

describe('takeShareParam', () => {
  it('extracts and decodes the ?p= parameter, with the hash to strip back to', () => {
    const hash = `#/plan?p=${encodeShared(shared)}`;
    expect(takeShareParam(hash)).toEqual({ shared, strippedHash: '#/plan' });
  });

  it('returns null when the hash carries no parameter', () => {
    expect(takeShareParam('#/plan')).toBeNull();
    expect(takeShareParam('')).toBeNull();
  });

  it('a parameter that fails to decode yields a null shared (stored plan wins, no strip)', () => {
    expect(takeShareParam('#/plan?p=garbage')).toEqual({ shared: null, strippedHash: '#/plan' });
    expect(takeShareParam('#/plan?p=')).toEqual({ shared: null, strippedHash: '#/plan' });
  });

  it('strips only the query — the section route survives', () => {
    const taken = takeShareParam(`#/plan?p=${encodeShared(shared)}`)!;
    expect(taken.strippedHash).not.toContain('?');
    expect(taken.strippedHash.startsWith('#/plan')).toBe(true);
  });

  it('round-trips with planLink through a location hash', () => {
    const hash = new URL(planLink('https://example.com', '/x/', shared)).hash;
    expect(takeShareParam(hash)?.shared).toEqual(shared);
  });
});
