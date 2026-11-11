// Plan-codec module: the ONE home for the plan persistence codec. It wraps
// the three shapes the plan travels in — PlanSnapshot (the plan's own fields,
// owned by plan-state.ts), the v1 wire format (short keys, base64url in share
// links), and the normalized SharedSnapshot ({ plan, chars }) the share link
// and localStorage carry. One field list (FIELDS, keyed by keyof
// PlanSnapshot) drives encode, decode, and normalize: adding a plan field
// needs one row here, and the compiler rejects the table until it exists.
// The codec normalizes shape only — deeper validation (unknown ids,
// degenerate pairs) stays in plan-state's hydrate.
//
// The transport currency splits the plan from the shared character selection:
// PlanSnapshot no longer carries `chars`. plan-state restores its half and
// view-state restores the chars, so neither module has to know the other's
// field. v1 share links keep decoding; legacy flat localStorage snapshots
// ({ upgradesOn, chars, balls, passives, fused }) still load.
import type { PlanFused, PlanSnapshot } from './plan-state';

/** The transport currency: the plan's own fields plus the shared character
 *  selection. The share link and localStorage carry this; each module
 *  restores its own half. */
export interface SharedSnapshot { plan: PlanSnapshot; chars: string[]; }

/** One persisted plan field: its v1 wire key, its normalizer (raw → value),
 *  and its wire encoder (value → wire). Keyed by PlanSnapshot's fields, so
 *  the compiler forces a row for every field. */
interface FieldSpec<K extends keyof PlanSnapshot> {
  wire: string;
  normalize: (raw: unknown) => PlanSnapshot[K];
  encode: (value: PlanSnapshot[K]) => unknown;
}

const stringIds = (raw: unknown): string[] =>
  (Array.isArray(raw) ? raw : []).filter((id): id is string => typeof id === 'string');

/** Fused pairs arrive in both transports' shapes — [a, b] tuples (the v1
 *  wire format) and {a, b} objects (what storage serializes) — and come back
 *  as {a, b}. Malformed pairs are dropped. */
const fusedPairs = (raw: unknown): PlanFused[] =>
  (Array.isArray(raw) ? raw : [])
    .filter((q): q is [string, string] | PlanFused =>
      (Array.isArray(q) && q.length === 2 && q.every((s) => typeof s === 'string')) ||
      (typeof q === 'object' && q !== null && typeof (q as PlanFused).a === 'string' && typeof (q as PlanFused).b === 'string'))
    .map((q) => (Array.isArray(q) ? { a: q[0], b: q[1] } : { a: (q as PlanFused).a, b: (q as PlanFused).b }));

/** The single field list. `satisfies` over the mapped type makes a missing
 *  row (a new PlanSnapshot field) a compile error. */
const FIELDS = {
  upgradesOn: {
    wire: 'u',
    normalize: (raw: unknown): boolean => (typeof raw === 'boolean' ? raw : true),
    encode: (value: boolean): unknown => value,
  },
  balls: {
    wire: 'b',
    normalize: stringIds,
    encode: (value: string[]): unknown => value,
  },
  passives: {
    wire: 'p',
    normalize: stringIds,
    encode: (value: string[]): unknown => value,
  },
  fused: {
    wire: 'f',
    normalize: fusedPairs,
    encode: (value: PlanFused[]): unknown => value.map((pair) => [pair.a, pair.b]),
  },
} satisfies { [K in keyof PlanSnapshot]: FieldSpec<K> };

type FieldKey = keyof PlanSnapshot;
type AnyField = FieldSpec<FieldKey>;
const fields = FIELDS as Record<FieldKey, AnyField>;
const FIELD_KEYS = Object.keys(FIELDS) as FieldKey[];

/** The v1 wire key for the shared character selection (not a plan field —
 *  SharedSnapshot's other half, so it lives outside FIELDS). */
const CHARS_WIRE = 'c';

const normalizePlan = (raw: Record<string, unknown>): PlanSnapshot =>
  Object.fromEntries(FIELD_KEYS.map((key) => [key, fields[key].normalize(raw[key])])) as unknown as PlanSnapshot;

/** Unwrap the short wire keys into PlanSnapshot field names. */
const fromWire = (wire: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(FIELD_KEYS.map((key) => [key, wire[fields[key].wire]]));

/** Encode the plan's fields as the v1 wire (short keys + the version). */
const toWire = (plan: PlanSnapshot): Record<string, unknown> => ({
  v: 1,
  ...Object.fromEntries(FIELD_KEYS.map((key) => [fields[key].wire, fields[key].encode(plan[key])])),
});

/** Normalize a stored or transported payload to the SharedSnapshot currency.
 *  Accepts the nested shape ({ plan, chars }) new storage writes, the legacy
 *  flat shape old storage holds, and the v1 wire shape. Non-object input is
 *  garbage → null. Shape only — hydrate validates ids. */
export function normalizeShared(raw: unknown): SharedSnapshot | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const obj = raw as Record<string, unknown>;
  // nested shape: { plan, chars } — what storage writes now
  if (typeof obj.plan === 'object' && obj.plan !== null && !Array.isArray(obj.plan)) {
    return { plan: normalizePlan(obj.plan as Record<string, unknown>), chars: stringIds(obj.chars) };
  }
  // flat shape: legacy storage (long keys) or the v1 wire (short keys)
  const flat = 'v' in obj ? fromWire(obj) : obj;
  return { plan: normalizePlan(flat), chars: stringIds(obj.chars ?? obj[CHARS_WIRE]) };
}

/** Encode a SharedSnapshot as the v1 URL-safe code: base64url (URL-safe
 *  alphabet, no padding) over the short-key wire JSON. */
export function encodeShared(shared: SharedSnapshot): string {
  const wire = { ...toWire(shared.plan), [CHARS_WIRE]: shared.chars };
  return btoa(JSON.stringify(wire)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Decode a v1 code back to a SharedSnapshot; null for anything that is not
 *  a v1 code (garbage base64, wrong version). */
export function decodeShared(code: string): SharedSnapshot | null {
  try {
    const parsed: unknown = JSON.parse(atob(code.replace(/-/g, '+').replace(/_/g, '/')));
    if (typeof parsed !== 'object' || parsed === null || (parsed as { v?: unknown }).v !== 1) return null;
    return normalizeShared(parsed);
  } catch {
    return null;
  }
}
