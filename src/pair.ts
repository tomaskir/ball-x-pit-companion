// Pair module: unordered-pair identity — "the reverse composition is the
// same pair". A pair's key is its two ids sorted and joined with '+', so
// `pairKey(a, b) === pairKey(b, a)`; `pairKeyOf(ids)` is the same key from
// the array shape callers already hold, and `sortedPairIds(ids)` is that
// canonical order itself. Pair keys are constructed here and
// nowhere else: the fusion model's confirmed-pair and exception lookups, the
// plan's fused-pair identity, the renderer's plan-entry identity, corpus
// validation, and the build graph's `fusion:` node ids all consume it, and
// the build graph parses those ids back through `parsePair`.
//
// The order-preserving counterpart is `composeKey`/`parseComposeKey` ("a>b",
// first pick first): display order survives where identity must stay
// unordered. Neither separator occurs in a slug.
//
// The knowledge tables (CONFIRMED_PAIRS, FUSION_FACTS, KILL_DISPUTED_PAIRS)
// and the wildcard form `<id>+*` still carry literal keys; changing the
// separator would need those data entries updated too.

/** Separator between the two ids in a pair key. */
const SEPARATOR = '+';

/** Separator between the two ids in a compose-order key. */
const COMPOSE_SEPARATOR = '>';

/** The two ids in canonical (sorted) order — the order every pair key
 *  encodes. Exposed for callers that compare an input's order against the
 *  canonical one without round-tripping through a key. */
export const sortedPairIds = (ids: readonly string[]): string[] => [...ids].sort();

/** Unordered pair key ("a+b", ids sorted) from the two ids in an array — the
 *  shape callers already hold (corpus components, plan entries). */
export const pairKeyOf = (ids: readonly string[]): string => sortedPairIds(ids).join(SEPARATOR);

/** Unordered pair key ("a+b", ids sorted) — the reverse composition is the
 *  same pair. */
export const pairKey = (a: string, b: string): string => pairKeyOf([a, b]);

/** The two ids of a pair key, or null when `key` is not one (wrong number
 *  of parts, or an empty id). */
export function parsePair(key: string): [string, string] | null {
  const parts = key.split(SEPARATOR);
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return [parts[0], parts[1]];
}

/** Compose-order key ("a>b", first pick first) — the order-preserving
 *  counterpart to `pairKey`. Used where the displayed composition order must
 *  survive (the plan's fused-entry content key); pair identity stays
 *  unordered. */
export const composeKey = (a: string, b: string): string => `${a}${COMPOSE_SEPARATOR}${b}`;

/** The two ids of a compose-order key in composition order, or null when
 *  `key` is not one (wrong number of parts, or an empty id). */
export function parseComposeKey(key: string): [string, string] | null {
  const parts = key.split(COMPOSE_SEPARATOR);
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return [parts[0], parts[1]];
}
