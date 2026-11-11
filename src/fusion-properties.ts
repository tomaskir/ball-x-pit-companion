// Fusion property model — the order-mechanics decision (#7). The canonical
// statement of the order model is docs/research/fusion-mechanics.md §3; this
// module implements it.
//
// A ball's kit is a set of property keys. Fusion unions the sets. On a shared
// scalar key the first-selected ball's value wins; the second's variant is
// excluded. Set-valued application channels union. This is the site's
// editorial model, not game data: the game files expose no property-merge
// code (docs/research/fusion-mechanics.md §4).
//
// The module has two public contracts:
// - `resolveProperties(a, b)` — the general rule: union the kits, resolve
//   shared scalar keys to the first pick, and report the collisions.
// - `FUSION_EXCEPTIONS` / `exceptionsFor(a, b)` — the reported anomalies the
//   general rule deliberately does not encode (Nuke × Wraith, Time bubble,
//   Banshee). Each carries its source and confidence for the presentation's
//   "Reported exceptions" section (#8).
//
// Values are level-3 (v1.301, pre-DLC) and are hand-maintained here so the
// model is testable and independent of the catalog's level-1 text. Every
// value not marked `source: 'reported'` must appear verbatim in the generated
// level-3 overlay (src/data/level-3.ts); data.test.ts enforces that.
//
// `Channel` here is the property-model application channel. It is related to,
// but not the same as, `fusion.ts`'s cross-wire `StatusChannel` (which also
// models the spawn-bound/field split for wire emission).
//
// Evidence bar (decision #7): a pair or rule enters the model with tier 1–2
// evidence — game files, in-game tooltips, controlled tests, or multiple
// independent current-version reports. Single reports become caveats, and a
// collision on a pair without direct evidence is marked `reported`.
import type { Ball } from './data/balls';
import { pairKey } from './pair';

/** How a ball applies its status/effect. Channels are set-valued: fusion
 *  unions them, so different application channels survive together. */
export type Channel = 'on-hit' | 'per-second' | 'spawn' | 'field';

export interface ScalarProperty {
  /** Stable key; a shared key is a collision. */
  key: string;
  /** Display label for the presentation's collision rows. */
  label: string;
  /** Level-3 value, verbatim from the L3 fact base unless `source` says
   *  otherwise. */
  value: string;
  /** `reported` marks a value from a community report rather than the L3
   *  fact base (e.g. a range the wiki text does not state). */
  source?: 'reported';
}

export interface BallProperties {
  channels: Channel[];
  scalars: ScalarProperty[];
}

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

const EMPTY: BallProperties = { channels: [], scalars: [] };

const scalar = (key: string, label: string, value: string, source?: 'reported'): ScalarProperty =>
  source ? { key, label, value, source } : { key, label, value };

const cooldown = (value: string) => scalar('cooldown', 'Cooldown', value);
const burnMax = (value: string) => scalar('burn-max-stacks', 'Burn max stacks', value);
const burnDuration = (value: string) => scalar('burn-duration', 'Burn duration', value);
const burnDamage = (value: string) => scalar('burn-per-stack-damage', 'Burn damage per stack', value);
const bonusDamage = (value: string) => scalar('bonus-damage', 'Bonus damage', value);
const freezeDuration = (value: string) => scalar('freeze-duration', 'Freeze duration', value);
const poisonMax = (value: string) => scalar('poison-max-stacks', 'Poison max stacks', value);
const poisonDamage = (value: string) => scalar('poison-per-stack-damage', 'Poison damage per stack', value);
const radiationDuration = (value: string) => scalar('radiation-duration', 'Radiation duration', value);
const radiationMax = (value: string) => scalar('radiation-max-stacks', 'Radiation max stacks', value);
const mosquitoSpawn = (value: string) => scalar('mosquito-spawn', 'Mosquito spawn', value);
const bleedMax = (value: string) => scalar('bleed-max-stacks', 'Bleed max stacks', value);
const range = (value: string, source?: 'reported') => scalar('range', 'Range', value, source);

/**
 * Hand-maintained level-3 property table. Only properties that participate in
 * the fusion model are recorded; an unlisted ball has no recorded properties.
 * Keep values verbatim from docs/research/level-3-effects.md (data.test.ts
 * checks the non-reported ones).
 */
export const BALL_PROPERTIES: Record<string, BallProperties> = {
  // --- cooldown class (the game-file I2 effect-text dump: exactly the balls
  // whose text lists a cooldown) ---
  'black-hole': { channels: ['on-hit'], scalars: [cooldown('5 second')] },
  'bomb': { channels: ['on-hit'], scalars: [cooldown('3 second')] },
  'dark': { channels: ['on-hit'], scalars: [cooldown('3 second')] },
  'egg-sac': { channels: ['spawn'], scalars: [cooldown('3 second')] },
  'nuclear-bomb': {
    channels: ['on-hit'],
    scalars: [cooldown('3 second'), radiationDuration('indefinitely'), radiationMax('max 5 stacks'), range('5x5 tiles', 'reported')],
  },
  'timestop': { channels: ['field'], scalars: [cooldown('20 second'), freezeDuration('6.0 seconds')] },
  'voluptuous-egg-sac': { channels: ['spawn'], scalars: [cooldown('3 second')] },

  // --- burn profiles (first pick's cap/duration/damage dominate) ---
  'banished-flame': { channels: ['on-hit'], scalars: [burnMax('max 8 stacks'), burnDuration('2 seconds'), burnDamage('1–35')] },
  'burn': { channels: ['on-hit'], scalars: [burnMax('max 5 stacks'), burnDuration('5 seconds'), burnDamage('7–11')] },
  'sun': { channels: ['per-second', 'field'], scalars: [burnMax('max 5 stacks'), burnDuration('8 seconds'), burnDamage('9–15')] },
  'brimstone': {
    channels: ['per-second', 'field'],
    scalars: [burnMax('max 4 stacks'), burnDamage('1–7'), poisonMax('max 4 stacks'), poisonDamage('3–5')],
  },
  'inferno': { channels: ['per-second', 'field'], scalars: [burnDuration('10 seconds'), burnDamage('6–10')] },
  'magma': { channels: ['spawn'], scalars: [burnMax('max 3 stacks'), burnDuration('3 seconds'), burnDamage('5–10')] },
  'satan': { channels: ['per-second', 'field'], scalars: [burnMax('max 5 stacks'), burnDamage('15–30')] },
  'fireworks': { channels: ['spawn'], scalars: [burnDamage('10–14')] },

  // --- bonus-damage stat swaps (Erosion × Stone/Drill/Assassin/Steel) ---
  'erosion': { channels: [], scalars: [bonusDamage('5%')] },
  'stone': { channels: [], scalars: [bonusDamage('400%')] },
  'drill': { channels: [], scalars: [bonusDamage('100%')] },
  'assassin': { channels: [], scalars: [bonusDamage('50%')] },
  'steel': { channels: [], scalars: [bonusDamage('15%')] },

  // --- freeze duration (Freeze Ray × Blizzard is the reported pair) ---
  'freeze-ray': { channels: ['on-hit'], scalars: [freezeDuration('13.0 seconds')] },
  'blizzard': { channels: ['spawn'], scalars: [freezeDuration('1.3 seconds')] },
  'freeze': { channels: ['on-hit'], scalars: [freezeDuration('8.0 seconds')] },
  'wraith': { channels: ['on-hit'], scalars: [freezeDuration('1.8 seconds')] },
  'glacier': { channels: ['spawn'], scalars: [freezeDuration('3.0 seconds')] },
  'time': { channels: ['spawn'], scalars: [freezeDuration('3.0 seconds')] },

  // --- poison stack caps (Noxious × Poison / × Brimstone) ---
  'poison': { channels: ['on-hit'], scalars: [poisonMax('max 8 stacks')] },
  // Noxious's L3 text states the applied count ("applies 3 stacks"), not a
  // cap; the Nov 2026 report treats it as the cap against Brimstone's max 4.
  'noxious': { channels: ['on-hit'], scalars: [poisonMax('3 stacks')] },
  'swamp': { channels: ['spawn'], scalars: [poisonMax('max 8 stacks')] },

  // --- radiation duration (Radiation Beam × Nuclear Bomb) ---
  'radiation-beam': { channels: ['on-hit'], scalars: [radiationDuration('15 seconds'), radiationMax('max 5 stacks')] },
  'x-ray': { channels: ['on-hit'], scalars: [radiationMax('max 5 stacks')] },

  // --- mosquito spawn variant (Mosquito Swarm × Mosquito King) ---
  'mosquito-king': { channels: ['spawn'], scalars: [mosquitoSpawn('a mosquito')] },
  'mosquito-kingdom': { channels: ['spawn'], scalars: [mosquitoSpawn('2–3 mosquitos')] },
  'mosquito-swarm': { channels: ['spawn'], scalars: [mosquitoSpawn('4–8 mosquitos')] },

  // --- bleed stack caps (Leech × Sacrifice: different channels union, the
  // shared cap resolves to the first pick) ---
  'bleed': { channels: ['on-hit'], scalars: [bleedMax('max 14 stacks')] },
  'sacrifice': { channels: ['on-hit'], scalars: [bleedMax('max 20 stacks')] },
  'leech': { channels: ['per-second', 'spawn'], scalars: [bleedMax('max 48 stacks')] },

  // --- AOE range (Nuke × Overgrowth: first pick's range wins) ---
  'overgrowth': { channels: ['on-hit'], scalars: [range('3x3 tile')] },
};

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
 * Channels union; scalar keys union; a shared key whose values differ is a
 * collision won by `a`. Equal values are not a functional collision (order
 * cannot matter when the value is the same).
 */
export function resolveProperties(a: Ball, b: Ball): ResolvedProperties {
  const pa = BALL_PROPERTIES[a.id] ?? EMPTY;
  const pb = BALL_PROPERTIES[b.id] ?? EMPTY;

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

/** A reported anomaly outside the general rule. `pair` is an unordered pair
 *  key, or `<ballId>+*` for a ball-wide anomaly. */
export interface FusionException {
  pair: string;
  title: string;
  detail: string;
  source: string;
  confidence: 'reported' | 'unverified' | 'contradicted';
  /** True when the report says the two selection orders behave differently.
   *  The presentation shows the swap affordance only for these (#8). */
  orderDependent: boolean;
}

/** Anomalies the property model deliberately does not encode (decision #7).
 *  They are surfaced as structured data so the presentation can show a
 *  separate "Reported exceptions" section (#8). */
export const FUSION_EXCEPTIONS: FusionException[] = [
  {
    pair: 'nuclear-bomb+wraith',
    title: 'Order-sensitive one-off',
    detail: 'The two orders behave differently, and the fused tooltip misdescribes the result (reported).',
    source: 'Reddit (Abject_Nerve_1052), 2026-04-21; corpus nuclear-bomb+wraith',
    confidence: 'reported',
    orderDependent: true,
  },
  {
    pair: 'time+*',
    title: 'Time bubble radius',
    detail: 'Time fused with any partner reportedly expands the time-snare radius; one comment claims the size follows the second pick. Not verified.',
    source: 'Bilibili 2026-08-07; Reddit comment (icemage_999)',
    confidence: 'unverified',
    orderDependent: true,
  },
  {
    pair: 'banshee+*',
    title: 'Whole-field curse override',
    detail: "Banshee's whole-field curse reportedly overrides some partner curse effects; a single untested comment.",
    source: 'Reddit comment (icemage_999), Nov 2026',
    confidence: 'unverified',
    orderDependent: false,
  },
];

/** Exceptions that apply to this pair (exact pair or a ball-wide wildcard). */
export function exceptionsFor(a: Ball, b: Ball): FusionException[] {
  const key = pairKey(a.id, b.id);
  return FUSION_EXCEPTIONS.filter(
    (e) => e.pair === key || e.pair === `${a.id}+*` || e.pair === `${b.id}+*`,
  );
}
