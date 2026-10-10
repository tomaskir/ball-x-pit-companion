// Share-code module: encodes a PlanSnapshot into a compact URL-safe string
// (and back). One interface: encodePlan(plan) → code, decodePlan(code) →
// PlanSnapshot | null. The island builds share links as
// `…#/plan?p=<code>` and decodes the parameter on startup; the code is
// versioned (v1) so a future format can coexist with old links, and
// anything that does not parse as a v1 code decodes to null — the island
// then ignores the parameter and falls back to the stored plan. Field
// validation lives in `parsePlanSnapshot` — the single PlanSnapshot
// normalizer, shared with the island's localStorage loader; deeper
// validation (unknown ids, degenerate pairs) is `hydrate`'s job in
// view-state.
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

/** The single PlanSnapshot normalizer, shared by decodePlan (share codes)
 *  and the island's localStorage loader (companion.ts). Filters id arrays
 *  to strings, guards fused pairs, defaults upgradesOn to true. Fused pairs
 *  are accepted in both transports' shapes — [a, b] tuples (the v1 wire
 *  format) and {a, b} objects (what planSnapshot() serializes to storage) —
 *  and come back as {a, b}. Non-object input is garbage → null. */
export function parsePlanSnapshot(raw: unknown): PlanSnapshot | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const p = raw as Partial<PlanSnapshot>;
  const ids = (x: unknown): string[] =>
    (Array.isArray(x) ? x : []).filter((id): id is string => typeof id === 'string');
  const pairs = (x: unknown): PlanFused[] =>
    (Array.isArray(x) ? x : [])
      .filter((q): q is [string, string] | PlanFused =>
        (Array.isArray(q) && q.length === 2 && q.every((s) => typeof s === 'string')) ||
        (typeof q === 'object' && q !== null && typeof (q as PlanFused).a === 'string' && typeof (q as PlanFused).b === 'string'))
      .map((q) => (Array.isArray(q) ? { a: q[0], b: q[1] } : { a: (q as PlanFused).a, b: (q as PlanFused).b }));
  return {
    upgradesOn: typeof p.upgradesOn === 'boolean' ? p.upgradesOn : true,
    chars: ids(p.chars),
    balls: ids(p.balls),
    passives: ids(p.passives),
    fused: pairs(p.fused),
  };
}

export function decodePlan(code: string): PlanSnapshot | null {
  try {
    const parsed: unknown = JSON.parse(atob(code.replace(/-/g, '+').replace(/_/g, '/')));
    if (typeof parsed !== 'object' || parsed === null || (parsed as Partial<PlanCodeV1>).v !== 1) return null;
    // unwrap the short wire keys into snapshot fields, then normalize once
    const wire = parsed as Partial<PlanCodeV1>;
    return parsePlanSnapshot({ upgradesOn: wire.u, chars: wire.c, balls: wire.b, passives: wire.p, fused: wire.f });
  } catch {
    return null;
  }
}
