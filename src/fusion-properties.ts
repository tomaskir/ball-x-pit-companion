// Fusion property model — the order-mechanics decision (#7). The canonical
// statement of the order model is docs/research/fusion-mechanics.md §3; this
// module implements it. This is the site's editorial model, not game data:
// the game files expose no property-merge code
// (docs/research/fusion-mechanics.md §4).
//
// The module's public contract is `resolveProperties(a, b)` — the general
// rule: union the kits, resolve shared scalar keys to the first pick, and
// report the collisions. The reported anomalies the general rule deliberately
// does not encode (Nuke × Wraith, Time bubble, Banshee) live with the rest of
// the reported fusion facts in `fusion-knowledge.ts` (`FUSION_FACTS`), so a
// research landing edits one table.
//
// Each ball's kit — its level-3 scalars and its application channels — lives
// in one hand-maintained table, `BALL_KIT` in ball-kit.ts. This module only
// resolves two kits; the cross-wire model reads the same table through
// `channelsOf` / `statusChannel` in fusion-knowledge.ts, so the two cannot
// drift.
//
// Evidence bar (decision #7): a pair or rule enters the model with tier 1–2
// evidence — game files, in-game tooltips, controlled tests, or multiple
// independent current-version reports. Single reports become caveats, and a
// collision on a pair without direct evidence is marked `reported`.
import type { Ball } from './data/balls';
import { BALL_KIT, type BallKit, type Channel, type ScalarProperty } from './ball-kit';
import { pairKey } from './pair';

export type { ScalarProperty } from './ball-kit';

export interface PropertyCollision {
  key: string;
  label: string;
  /** First-selected ball — its value wins. */
  winner: string;
  winnerName: string;
  value: string;
  /** Second-selected ball — its variant of the shared key is excluded. */
  loser: string;
  loserName: string;
  loserValue: string;
  /** True when the pair lacks direct tier 1–2 evidence; the presentation
   *  marks these rows "· reported". */
  reported: boolean;
}

export interface ResolvedProperties {
  /** Union of both kits' application channels. */
  channels: Channel[];
  /** Union of both kits' scalar properties, collisions resolved to the first
   *  pick's value. */
  scalars: ScalarProperty[];
  /** Shared scalar keys whose values differ (equal values are not a
   *  functional collision). */
  collisions: PropertyCollision[];
}

const EMPTY_KIT: BallKit = { scalars: [], channels: [] };

/** Pairs whose collision is backed by direct tier 1–2 evidence. Every other
 *  collision is a prediction of the general rule and is marked `reported`.
 *  Stone is confirmed by the wiki's own Erosion strategy note ("Stone x
 *  Erosion (select Stone first) … 400%"); Erosion × Drill/Assassin/Steel rest
 *  on the Nov 2026 report alone and stay `reported`. */
const CONFIRMED_PAIRS = new Set([
  'egg-sac+timestop',
  'banished-flame+sun',
  'erosion+stone',
  'black-hole+timestop',
  'mosquito-king+mosquito-swarm',
  'nuclear-bomb+radiation-beam',
  'noxious+poison',
  'leech+sacrifice',
]);

/**
 * Resolve two kits in selection order: `a` is the first-selected ball.
 * Channels union from the recorded kits; scalar keys union; a shared key whose
 * values differ is a collision won by `a`. Equal values are not a functional
 * collision (order cannot matter when the value is the same). A ball the kit
 * table does not record contributes nothing — its classification still exists
 * in `channelsOf` for the wire model.
 */
export function resolveProperties(a: Ball, b: Ball): ResolvedProperties {
  const pa = BALL_KIT[a.id] ?? EMPTY_KIT;
  const pb = BALL_KIT[b.id] ?? EMPTY_KIT;

  const channels = [...new Set([...pa.channels, ...pb.channels])];
  const scalars: ScalarProperty[] = [...pa.scalars];
  const collisions: PropertyCollision[] = [];
  const confirmed = CONFIRMED_PAIRS.has(pairKey(a.id, b.id));

  for (const sb of pb.scalars) {
    const sa = pa.scalars.find((s) => s.key === sb.key);
    if (!sa) {
      scalars.push(sb);
      continue;
    }
    if (sa.value === sb.value) continue;
    collisions.push({
      key: sa.key,
      label: sa.label,
      winner: a.id,
      winnerName: a.name,
      value: sa.value,
      loser: b.id,
      loserName: b.name,
      loserValue: sb.value,
      reported: !confirmed,
    });
  }

  return { channels, scalars, collisions };
}
