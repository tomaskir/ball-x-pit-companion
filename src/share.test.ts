// Tests for the share-code module: PlanSnapshot ⇄ URL-safe string. The
// island builds share links from the code and decodes the ?p= parameter on
// startup; anything that does not parse as a v1 code decodes to null.
import { describe, it, expect } from 'vitest';
import { encodePlan, decodePlan, parsePlanSnapshot } from './share';
import type { PlanSnapshot } from './view-state';

const plan: PlanSnapshot = {
  upgradesOn: false,
  chars: ['the-warrior', 'the-shade'],
  balls: ['flash', 'glacier'],
  passives: ['wagon-wheel'],
  fused: [{ a: 'nosferatu', b: 'vampire-lord' }],
};

describe('share code: encodePlan / decodePlan', () => {
  it('round-trips a full plan snapshot', () => {
    expect(decodePlan(encodePlan(plan))).toEqual(plan);
  });

  it('produces a URL-safe code (no +, /, or =)', () => {
    const code = encodePlan(plan);
    expect(code).not.toMatch(/[+/=]/);
  });

  it('decode rejects garbage, wrong versions, and empty strings', () => {
    expect(decodePlan('not-a-code')).toBeNull();
    expect(decodePlan('')).toBeNull();
    expect(decodePlan(encodePlan(plan) + '!!!')).toBeNull(); // broken base64
    const wrongVersion = JSON.stringify({ v: 99, u: true, c: [], b: [], p: [], f: [] });
    expect(decodePlan(btoa(wrongVersion))).toBeNull();
  });

  it('decode fills defaults for missing fields (forward tolerance within v1)', () => {
    const minimal = JSON.stringify({ v: 1 });
    const decoded = decodePlan(btoa(minimal));
    expect(decoded).toEqual({ upgradesOn: true, chars: [], balls: [], passives: [], fused: [] });
  });

  it('decode drops non-string ids and malformed fused pairs', () => {
    const messy = JSON.stringify({ v: 1, u: true, c: ['the-warrior', 42], b: [], p: [], f: [['flash', 'glacier'], ['x'], 'nope'] });
    const decoded = decodePlan(btoa(messy))!;
    expect(decoded.chars).toEqual(['the-warrior']);
    expect(decoded.fused).toEqual([{ a: 'flash', b: 'glacier' }]);
  });
});

describe('parsePlanSnapshot', () => {
  it('passes a valid snapshot through unchanged', () => {
    expect(parsePlanSnapshot(plan)).toEqual(plan);
  });

  it('returns null for non-object garbage', () => {
    expect(parsePlanSnapshot(null)).toBeNull();
    expect(parsePlanSnapshot(undefined)).toBeNull();
    expect(parsePlanSnapshot(5)).toBeNull();
    expect(parsePlanSnapshot('nope')).toBeNull();
  });

  it('defaults missing fields (upgradesOn on, empty lists)', () => {
    expect(parsePlanSnapshot({})).toEqual({ upgradesOn: true, chars: [], balls: [], passives: [], fused: [] });
    expect(parsePlanSnapshot({ upgradesOn: false })).toEqual({ upgradesOn: false, chars: [], balls: [], passives: [], fused: [] });
  });

  it('drops non-array and non-string ids', () => {
    const parsed = parsePlanSnapshot({ chars: 'the-warrior', balls: [1, 'flash', null], passives: {}, fused: [] })!;
    expect(parsed.chars).toEqual([]);
    expect(parsed.balls).toEqual(['flash']);
    expect(parsed.passives).toEqual([]);
  });

  it('accepts fused pairs as [a, b] tuples (share-code shape)', () => {
    const parsed = parsePlanSnapshot({ fused: [['nosferatu', 'vampire-lord'], ['x'], 'nope', [1, 2]] })!;
    expect(parsed.fused).toEqual([{ a: 'nosferatu', b: 'vampire-lord' }]);
  });

  it('accepts fused pairs as {a, b} objects (localStorage shape)', () => {
    const parsed = parsePlanSnapshot({ fused: [{ a: 'nosferatu', b: 'vampire-lord' }, { a: 'x' }, null] })!;
    expect(parsed.fused).toEqual([{ a: 'nosferatu', b: 'vampire-lord' }]);
  });

  it('feeds decodePlan (v1 code with object-shaped fused pairs still decodes)', () => {
    const decoded = decodePlan(btoa(JSON.stringify({ v: 1, f: [{ a: 'flash', b: 'glacier' }] })))!;
    expect(decoded.fused).toEqual([{ a: 'flash', b: 'glacier' }]);
  });
});
