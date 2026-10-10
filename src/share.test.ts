// Tests for the share-code module: PlanSnapshot ⇄ URL-safe string. The
// island builds share links from the code and decodes the ?p= parameter on
// startup; anything that does not parse as a v1 code decodes to null.
import { describe, it, expect } from 'vitest';
import { encodePlan, decodePlan } from './share';
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
