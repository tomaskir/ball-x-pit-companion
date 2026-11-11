// Pair module: unordered-pair identity — "the reverse composition is the
// same pair". A pair's key is its two ids sorted and joined with '+', so
// `pairKey(a, b) === pairKey(b, a)`. The key format lives here and nowhere
// else: the fusion property model's confirmed/exception lookups, the plan's
// fused-pair identity, and the build graph's `fusion:` node ids all consume
// it, and the build graph parses those ids back through `parsePair`.
//
// The separator is an implementation detail of the key, not of any caller:
// changing it is one edit in this module.

/** Separator between the two ids in a pair key. */
const SEPARATOR = '+';

/** Unordered pair key ("a+b", ids sorted) — the reverse composition is the
 *  same pair. */
export const pairKey = (a: string, b: string): string => [a, b].sort().join(SEPARATOR);

/** The two ids of a pair key, or null when `key` is not one (wrong number
 *  of parts, or an empty id). */
export function parsePair(key: string): [string, string] | null {
  const parts = key.split(SEPARATOR);
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return [parts[0], parts[1]];
}
