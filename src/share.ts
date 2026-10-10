// Share-code module: encodes a PlanSnapshot into a compact URL-safe string
// (and back). One interface: encodePlan(plan) → code, decodePlan(code) →
// PlanSnapshot | null. The island builds share links as
// `…#/plan?p=<code>` and decodes the parameter on startup; the code is
// versioned (v1) so a future format can coexist with old links, and
// anything that does not parse as a v1 code decodes to null — the island
// then ignores the parameter and falls back to the stored plan. Field
// validation mirrors the island's localStorage loader; deeper validation
// (unknown ids, degenerate pairs) is `hydrate`'s job in view-state.
import type { PlanFused, PlanSnapshot } from './view-state';

/** The v1 wire format — short keys keep share URLs compact. */
interface PlanCodeV1 {
  v: 1;
  u: boolean;
  c: string[];
  b: string[];
  p: string[];
  /** Fused pairs as [a, b] tuples in compose order. */
  f: [string, string][];
}

export function encodePlan(plan: PlanSnapshot): string {
  const code: PlanCodeV1 = {
    v: 1,
    u: plan.upgradesOn,
    c: plan.chars,
    b: plan.balls,
    p: plan.passives,
    f: plan.fused.map((pair) => [pair.a, pair.b]),
  };
  // base64url: URL-safe alphabet, no padding
  return btoa(JSON.stringify(code)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodePlan(code: string): PlanSnapshot | null {
  try {
    const parsed = JSON.parse(atob(code.replace(/-/g, '+').replace(/_/g, '/'))) as Partial<PlanCodeV1>;
    if (parsed?.v !== 1) return null;
    const ids = (x: unknown): string[] =>
      (Array.isArray(x) ? x : []).filter((id): id is string => typeof id === 'string');
    const pairs = (x: unknown): PlanFused[] =>
      (Array.isArray(x) ? x : [])
        .filter((q): q is [string, string] => Array.isArray(q) && q.length === 2 && q.every((s) => typeof s === 'string'))
        .map(([a, b]) => ({ a, b }));
    return {
      upgradesOn: typeof parsed.u === 'boolean' ? parsed.u : true,
      chars: ids(parsed.c),
      balls: ids(parsed.b),
      passives: ids(parsed.p),
      fused: pairs(parsed.f),
    };
  } catch {
    return null;
  }
}
