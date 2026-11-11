// Share-code module: the share-link URL transport as pure functions over
// plain strings — the full `…#/plan?p=<code>` link (planLink) and the
// one-shot read of the ?p= parameter out of a location hash
// (takeShareParam). The island keeps only transport: it passes location
// parts in, copies the link, and hands strippedHash to
// history.replaceState. The codec itself (SharedSnapshot ⇄ v1 wire) lives
// in src/plan-codec.ts; anything that does not parse as a v1 code decodes
// to null — the caller then ignores the parameter and falls back to the
// stored plan.
//
// takeShareParam returns `{ shared, strippedHash }` (not just a snapshot)
// because the one-shot rule strips the parameter only when it actually
// decodes: the pair travels together so the caller cannot strip without
// having decoded, and a null shared means "leave the URL alone".
import { decodeShared, encodeShared, type SharedSnapshot } from './plan-codec';

/** The full share URL: `<origin><pathname>#/plan?p=<code>`. The island calls
 *  this with location.origin/location.pathname so the module stays
 *  environment-free. */
export function planLink(origin: string, pathname: string, shared: SharedSnapshot): string {
  return `${origin}${pathname}#/plan?p=${encodeShared(shared)}`;
}

export interface ShareParam {
  /** The decoded plan + shared selection, or null when the parameter is
   *  present but is not a valid v1 code — the caller then uses the stored
   *  plan instead. */
  shared: SharedSnapshot | null;
  /** The hash with the query stripped (`#/plan`), for the one-shot
   *  history.replaceState — applied only when shared is non-null. */
  strippedHash: string;
}

/** The one-shot read of a share parameter out of a location hash: everything
 *  after the first `?` is the query, `p` carries the code. Returns null when
 *  the hash carries no parameter at all; a present-but-undecodable parameter
 *  comes back as `{ shared: null, … }` so the caller can tell the two
 *  apart (only a decoded snapshot earns the strip). */
export function takeShareParam(hash: string): ShareParam | null {
  const [base, query] = hash.split('?');
  const param = new URLSearchParams(query ?? '').get('p');
  if (param === null) return null;
  return { shared: decodeShared(param), strippedHash: base };
}
