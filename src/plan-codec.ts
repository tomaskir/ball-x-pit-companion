// Plan-codec module: the ONE home for the plan persistence codec. It wraps
// the three shapes the plan travels in — PlanSnapshot (the plan's own fields,
// owned by plan-state.ts), the wire format (short keys, base64url in share
// links), and the normalized SharedSnapshot ({ plan, chars, editions }) the
// share link and localStorage carry. One field list (FIELDS, keyed by keyof
// PlanSnapshot) drives encode, decode, and normalize: adding a plan field
// needs one row here, and the compiler rejects the table until it exists.
// The codec normalizes shape only — deeper validation (unknown ids,
// degenerate pairs) stays in plan-state's hydrate.
//
// The transport currency splits the plan from the shared character selection
// and the edition filter: PlanSnapshot no longer carries `chars`. plan-state
// restores its half, view-state restores the chars and editions, so neither
// module has to know the other's fields. The wire bumped to v2 when the
// edition filter arrived ({v:2,u,b,p,f,c,e}); v1 links still decode and are
// treated as base-game only. Legacy flat localStorage snapshots
// ({ upgradesOn, chars, balls, passives, fused }) still load.
import { type Edition } from './data/editions';
import { DEFAULT_EDITIONS, canonicalEditions, isEdition } from './edition-gate';
import type { PlanFused, PlanSnapshot } from './plan-state';

/** The transport currency: the plan's own fields, the shared character
 *  selection, and the enabled editions. The share link carries all three;
 *  localStorage splits them across the plan key and the editions key. */
export interface SharedSnapshot { plan: PlanSnapshot; chars: string[]; editions: Edition[]; }

/** One persisted plan field: its wire key, its normalizer (raw → value),
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

/** The wire keys for SharedSnapshot's non-plan halves (not plan fields, so
 *  they live outside FIELDS). */
const CHARS_WIRE = 'c';
const EDITIONS_WIRE = 'e';

/**
 * Normalize the enabled-edition list. A missing value (v1 links, legacy
 * storage, the pre-filter nested shape) means base-game only; an explicit
 * empty array is valid — both checkboxes unchecked — and stays empty.
 * Unknown values are dropped, and the result is canonical vocabulary order.
 */
export function normalizeEditions(raw: unknown): Edition[] {
  if (!Array.isArray(raw)) return [...DEFAULT_EDITIONS];
  return canonicalEditions(raw.filter(isEdition));
}

const normalizePlan = (raw: Record<string, unknown>): PlanSnapshot =>
  Object.fromEntries(FIELD_KEYS.map((key) => [key, fields[key].normalize(raw[key])])) as unknown as PlanSnapshot;

/** Unwrap the short wire keys into PlanSnapshot field names. */
const fromWire = (wire: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(FIELD_KEYS.map((key) => [key, wire[fields[key].wire]]));

/** Encode the plan's fields as the v2 wire (short keys + the version). */
const toWire = (plan: PlanSnapshot): Record<string, unknown> => ({
  v: 2,
  ...Object.fromEntries(FIELD_KEYS.map((key) => [fields[key].wire, fields[key].encode(plan[key])])),
});

/** Normalize a stored or transported payload to the SharedSnapshot currency.
 *  Accepts the nested shape ({ plan, chars, editions }) new storage writes,
 *  the legacy flat shape old storage holds, and the v1/v2 wire shape. A v1
 *  payload has no editions — it is treated as base-game only. Non-object
 *  input is garbage → null. Shape only — hydrate validates ids. */
export function normalizeShared(raw: unknown): SharedSnapshot | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const obj = raw as Record<string, unknown>;
  const isV1 = obj.v === 1;
  // nested shape: { plan, chars, editions } — what storage writes now
  if (typeof obj.plan === 'object' && obj.plan !== null && !Array.isArray(obj.plan)) {
    return {
      plan: normalizePlan(obj.plan as Record<string, unknown>),
      chars: stringIds(obj.chars),
      editions: isV1 ? [...DEFAULT_EDITIONS] : normalizeEditions(obj.editions),
    };
  }
  // flat shape: legacy storage (long keys) or the wire (short keys)
  const flat = 'v' in obj ? fromWire(obj) : obj;
  return {
    plan: normalizePlan(flat),
    chars: stringIds(obj.chars ?? obj[CHARS_WIRE]),
    editions: isV1 ? [...DEFAULT_EDITIONS] : normalizeEditions(obj.editions ?? obj[EDITIONS_WIRE]),
  };
}

/** Encode a SharedSnapshot as the v2 URL-safe code: base64url (URL-safe
 *  alphabet, no padding) over the short-key wire JSON. */
export function encodeShared(shared: SharedSnapshot): string {
  const wire = {
    ...toWire(shared.plan),
    [CHARS_WIRE]: shared.chars,
    [EDITIONS_WIRE]: shared.editions,
  };
  return btoa(JSON.stringify(wire)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Decode a v1 or v2 code back to a SharedSnapshot; null for anything that
 *  is not a recognized code (garbage base64, wrong version). v1 codes carry
 *  no editions and decode as base-game only. */
export function decodeShared(code: string): SharedSnapshot | null {
  try {
    const parsed: unknown = JSON.parse(atob(code.replace(/-/g, '+').replace(/_/g, '/')));
    const version = typeof parsed === 'object' && parsed !== null ? (parsed as { v?: unknown }).v : undefined;
    if (version !== 1 && version !== 2) return null;
    return normalizeShared(parsed);
  } catch {
    return null;
  }
}
