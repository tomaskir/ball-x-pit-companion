// Tests for the plan-codec module: the one persistence currency —
// SharedSnapshot ⇄ v2 wire code ⇄ normalized. The codec normalizes shape
// only; deeper validation (unknown ids, degenerate pairs) is plan-state's
// hydrate. The transport (planLink / takeShareParam) is share.test.ts's.
import { describe, it, expect } from 'vitest';
import { encodeShared, decodeShared, normalizeShared, type SharedSnapshot } from './plan-codec';

const shared: SharedSnapshot = {
  plan: {
    upgradesOn: false,
    balls: ['flash', 'glacier'],
    passives: ['wagon-wheel'],
    fused: [{ a: 'nosferatu', b: 'vampire-lord' }],
  },
  chars: ['the-warrior', 'the-shade'],
  editions: ['base-game', 'dlc-risen-ballbylon'],
};

/** The decoded wire payload behind a code — the codec's short-key shape. */
const wireOf = (code: string): Record<string, unknown> =>
  JSON.parse(atob(code.replace(/-/g, '+').replace(/_/g, '/')));

describe('plan codec: encodeShared / decodeShared', () => {
  it('round-trips a full SharedSnapshot', () => {
    expect(decodeShared(encodeShared(shared))).toEqual(shared);
  });

  it('produces a URL-safe code (no +, /, or =)', () => {
    const code = encodeShared(shared);
    expect(code).not.toMatch(/[+/=]/);
  });

  it('encodes the v2 wire: { v: 2, u, b, p, f, c, e }', () => {
    const wire = wireOf(encodeShared(shared));
    expect(wire.v).toBe(2);
    expect(wire.e).toEqual(['base-game', 'dlc-risen-ballbylon']);
    expect(wire.c).toEqual(['the-warrior', 'the-shade']);
    expect(wire.u).toBe(false);
    expect(wire.b).toEqual(['flash', 'glacier']);
    expect(wire.p).toEqual(['wagon-wheel']);
    expect(wire.f).toEqual([['nosferatu', 'vampire-lord']]);
  });

  it('decode rejects garbage, wrong versions, and empty strings', () => {
    expect(decodeShared('not-a-code')).toBeNull();
    expect(decodeShared('')).toBeNull();
    expect(decodeShared(encodeShared(shared) + '!!!')).toBeNull(); // broken base64
    const wrongVersion = JSON.stringify({ v: 99, u: true, c: [], b: [], p: [], f: [] });
    expect(decodeShared(btoa(wrongVersion))).toBeNull();
  });

  it('decode fills defaults for missing fields (forward tolerance within v2)', () => {
    const decoded = decodeShared(btoa(JSON.stringify({ v: 2 })));
    expect(decoded).toEqual({
      plan: { upgradesOn: true, balls: [], passives: [], fused: [] },
      chars: [],
      editions: ['base-game'],
    });
  });

  it('decode drops non-string ids and malformed fused pairs', () => {
    const messy = JSON.stringify({ v: 2, u: true, c: ['the-warrior', 42], b: [], p: [], f: [['flash', 'glacier'], ['x'], 'nope'], e: ['base-game'] });
    const decoded = decodeShared(btoa(messy))!;
    expect(decoded.chars).toEqual(['the-warrior']);
    expect(decoded.plan.fused).toEqual([{ a: 'flash', b: 'glacier' }]);
  });

  it('decode accepts fused pairs as {a, b} objects too (old v1 codes)', () => {
    const decoded = decodeShared(btoa(JSON.stringify({ v: 1, f: [{ a: 'flash', b: 'glacier' }] })))!;
    expect(decoded.plan.fused).toEqual([{ a: 'flash', b: 'glacier' }]);
  });

  it('decodes a literal pre-codec v1 share code as base-game only (old links keep working)', () => {
    // Produced by the old encodePlan before the codec extraction — the v1
    // wire format is public, so this must never stop decoding. v1 predates
    // the edition filter, so it carries no editions and means base-game.
    const oldCode = 'eyJ2IjoxLCJ1IjpmYWxzZSwiYyI6WyJ0aGUtd2FycmlvciJdLCJiIjpbImZsYXNoIl0sInAiOltdLCJmIjpbWyJmbGFzaCIsImdsYWNpZXIiXV19';
    expect(decodeShared(oldCode)).toEqual({
      plan: { upgradesOn: false, balls: ['flash'], passives: [], fused: [{ a: 'flash', b: 'glacier' }] },
      chars: ['the-warrior'],
      editions: ['base-game'],
    });
  });

  it('a v1 payload carrying an e key still decodes as base-game (v1 means base)', () => {
    const decoded = decodeShared(btoa(JSON.stringify({ v: 1, e: ['base-game', 'dlc-risen-ballbylon'] })))!;
    expect(decoded.editions).toEqual(['base-game']);
  });

  it('a v2 payload with both editions unchecked preserves the empty list', () => {
    const decoded = decodeShared(btoa(JSON.stringify({ v: 2, e: [] })))!;
    expect(decoded.editions).toEqual([]);
  });
});

describe('plan codec: normalizeShared (localStorage shapes)', () => {
  it('accepts the nested shape new storage writes', () => {
    expect(normalizeShared(shared)).toEqual(shared);
  });

  it('accepts the legacy flat shape old storage holds (editions default to base-game)', () => {
    const legacy = {
      upgradesOn: false,
      chars: ['the-warrior'],
      balls: ['flash'],
      passives: ['wagon-wheel'],
      fused: [{ a: 'flash', b: 'glacier' }],
    };
    expect(normalizeShared(legacy)).toEqual({
      plan: { upgradesOn: false, balls: ['flash'], passives: ['wagon-wheel'], fused: [{ a: 'flash', b: 'glacier' }] },
      chars: ['the-warrior'],
      editions: ['base-game'],
    });
  });

  it('accepts the v1 wire shape (short keys) as base-game only', () => {
    expect(normalizeShared({ v: 1, u: false, c: ['the-shade'], b: ['flash'], p: [], f: [] })).toEqual({
      plan: { upgradesOn: false, balls: ['flash'], passives: [], fused: [] },
      chars: ['the-shade'],
      editions: ['base-game'],
    });
  });

  it('accepts the v2 wire shape (short keys) with its editions', () => {
    expect(normalizeShared({ v: 2, u: false, c: ['the-shade'], b: ['flash'], p: [], f: [], e: ['dlc-risen-ballbylon'] })).toEqual({
      plan: { upgradesOn: false, balls: ['flash'], passives: [], fused: [] },
      chars: ['the-shade'],
      editions: ['dlc-risen-ballbylon'],
    });
  });

  it('returns null for non-object garbage', () => {
    expect(normalizeShared(null)).toBeNull();
    expect(normalizeShared(undefined)).toBeNull();
    expect(normalizeShared(5)).toBeNull();
    expect(normalizeShared('nope')).toBeNull();
  });

  it('defaults missing fields (upgradesOn on, empty lists, base-game)', () => {
    expect(normalizeShared({})).toEqual({
      plan: { upgradesOn: true, balls: [], passives: [], fused: [] },
      chars: [],
      editions: ['base-game'],
    });
  });

  it('drops non-array and non-string ids', () => {
    const parsed = normalizeShared({ chars: 'the-warrior', balls: [1, 'flash', null], passives: {}, fused: [] })!;
    expect(parsed.chars).toEqual([]);
    expect(parsed.plan.balls).toEqual(['flash']);
    expect(parsed.plan.passives).toEqual([]);
  });

  it('accepts fused pairs as [a, b] tuples and {a, b} objects', () => {
    expect(normalizeShared({ fused: [['nosferatu', 'vampire-lord'], ['x'], 'nope', [1, 2]] })!.plan.fused)
      .toEqual([{ a: 'nosferatu', b: 'vampire-lord' }]);
    expect(normalizeShared({ fused: [{ a: 'nosferatu', b: 'vampire-lord' }, { a: 'x' }, null] })!.plan.fused)
      .toEqual([{ a: 'nosferatu', b: 'vampire-lord' }]);
  });

  it('drops unknown editions and canonicalizes the vocabulary order', () => {
    const parsed = normalizeShared({ editions: ['dlc-risen-ballbylon', 'future-edition', 'base-game', 'base-game'] })!;
    expect(parsed.editions).toEqual(['base-game', 'dlc-risen-ballbylon']);
  });

  it('a non-array editions value defaults to base-game; an explicit empty array stays empty', () => {
    expect(normalizeShared({ editions: 'base-game' })!.editions).toEqual(['base-game']);
    expect(normalizeShared({ editions: [] })!.editions).toEqual([]);
  });
});
