// The per-ball fusion kit: the one hand-maintained table carrying each ball's
// level-3 scalar properties and its application channels together. Two readers
// consume it — the order model (`resolveProperties` in fusion-properties.ts)
// unions kits, and the cross-wire model (`channelsOf` / `statusChannel` in
// fusion-knowledge.ts) classifies application channels. Keeping both columns
// in one entry means adding a ball or changing a channel is a one-table edit;
// no test has to keep two tables aligned.
//
// Values are level-3 (v1.301, pre-DLC) and are hand-maintained here so the
// model is testable and independent of the catalog's level-1 text. Every
// value not marked `source: 'reported'` must appear verbatim in the generated
// level-3 overlay (src/data/level-3.ts); data.test.ts enforces that.
//
// An empty `channels` array is an explicit "no application channel" (the
// bonus-damage stat balls), not a missing entry. A ball absent from this table
// has no recorded kit; `channelsOf` falls back to its status-text heuristic,
// and `resolveProperties` contributes nothing for it.

/** The fusion models' application-channel vocabulary. Channels are
 *  set-valued: a ball can apply effects through more than one. */
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

export interface BallKit {
  /** Level-3 scalar properties; a shared key is a collision. */
  scalars: ScalarProperty[];
  /** Application channels; empty means explicitly none. */
  channels: readonly Channel[];
}

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
 * Hand-maintained level-3 kit table. Only properties that participate in the
 * fusion model are recorded; an unlisted ball has no recorded properties.
 * Keep scalar values verbatim from docs/research/level-3-effects.md
 * (data.test.ts checks the non-reported ones).
 */
export const BALL_KIT: Record<string, BallKit> = {
  // --- cooldown class (the game-file I2 effect-text dump: exactly the balls
  // whose text lists a cooldown) ---
  'black-hole': { scalars: [cooldown('5 second')], channels: ['on-hit'] },
  'bomb': { scalars: [cooldown('3 second')], channels: ['on-hit'] },
  'dark': { scalars: [cooldown('3 second')], channels: ['on-hit'] },
  'egg-sac': { scalars: [cooldown('3 second')], channels: ['spawn'] },
  'nuclear-bomb': {
    scalars: [cooldown('3 second'), radiationDuration('indefinitely'), radiationMax('max 5 stacks'), range('5x5 tiles', 'reported')],
    channels: ['on-hit'],
  },
  'timestop': { scalars: [cooldown('20 second'), freezeDuration('6.0 seconds')], channels: ['field'] }, // a field freeze; the text heuristic's hit default is wrong
  'voluptuous-egg-sac': { scalars: [cooldown('3 second')], channels: ['spawn'] },

  // --- burn profiles (first pick's cap/duration/damage dominate) ---
  'banished-flame': { scalars: [burnMax('max 8 stacks'), burnDuration('2 seconds'), burnDamage('1–35')], channels: ['on-hit'] },
  'burn': { scalars: [burnMax('max 5 stacks'), burnDuration('5 seconds'), burnDamage('7–11')], channels: ['on-hit'] },
  'sun': { scalars: [burnMax('max 5 stacks'), burnDuration('8 seconds'), burnDamage('9–15')], channels: ['per-second', 'field'] },
  'brimstone': {
    scalars: [burnMax('max 4 stacks'), burnDamage('1–7'), poisonMax('max 4 stacks'), poisonDamage('3–5')],
    channels: ['per-second', 'field'],
  },
  'inferno': { scalars: [burnDuration('10 seconds'), burnDamage('6–10')], channels: ['per-second', 'field'] },
  'magma': { scalars: [burnMax('max 3 stacks'), burnDuration('3 seconds'), burnDamage('5–10')], channels: ['spawn'] },
  'satan': { scalars: [burnMax('max 5 stacks'), burnDamage('15–30')], channels: ['per-second', 'field'] },
  'fireworks': { scalars: [burnDamage('10–14')], channels: ['spawn'] },

  // --- bonus-damage stat swaps (Erosion × Stone/Drill/Assassin/Steel) ---
  // No application channel: these are stat swaps, not effect carriers.
  'erosion': { scalars: [bonusDamage('5%')], channels: [] },
  'stone': { scalars: [bonusDamage('400%')], channels: [] },
  'drill': { scalars: [bonusDamage('100%')], channels: [] },
  'assassin': { scalars: [bonusDamage('50%')], channels: [] },
  'steel': { scalars: [bonusDamage('15%')], channels: [] },

  // --- freeze duration (Freeze Ray × Blizzard is the reported pair) ---
  'freeze-ray': { scalars: [freezeDuration('13.0 seconds')], channels: ['on-hit'] },
  'blizzard': { scalars: [freezeDuration('1.3 seconds')], channels: ['spawn'] },
  'freeze': { scalars: [freezeDuration('8.0 seconds')], channels: ['on-hit'] },
  'wraith': { scalars: [freezeDuration('1.8 seconds')], channels: ['on-hit'] },
  'glacier': { scalars: [freezeDuration('3.0 seconds')], channels: ['spawn'] },
  'time': { scalars: [freezeDuration('3.0 seconds')], channels: ['spawn'] },

  // --- poison stack caps (Noxious × Poison / × Brimstone) ---
  'poison': { scalars: [poisonMax('max 8 stacks')], channels: ['on-hit'] },
  // Noxious's L3 text states the applied count ("applies 3 stacks"), not a
  // cap; the Nov 2026 report treats it as the cap against Brimstone's max 4.
  'noxious': { scalars: [poisonMax('3 stacks')], channels: ['on-hit'] },
  'swamp': { scalars: [poisonMax('max 8 stacks')], channels: ['spawn'] },

  // --- radiation duration (Radiation Beam × Nuclear Bomb) ---
  'radiation-beam': { scalars: [radiationDuration('15 seconds'), radiationMax('max 5 stacks')], channels: ['on-hit'] },
  'x-ray': { scalars: [radiationMax('max 5 stacks')], channels: ['on-hit'] },

  // --- mosquito spawn variant (Mosquito Swarm × Mosquito King) ---
  'mosquito-king': { scalars: [mosquitoSpawn('a mosquito')], channels: ['spawn'] },
  'mosquito-kingdom': { scalars: [mosquitoSpawn('2–3 mosquitos')], channels: ['spawn'] },
  'mosquito-swarm': { scalars: [mosquitoSpawn('4–8 mosquitos')], channels: ['spawn'] },

  // --- bleed stack caps (Leech × Sacrifice: different channels union, the
  // shared cap resolves to the first pick) ---
  'bleed': { scalars: [bleedMax('max 14 stacks')], channels: ['on-hit'] },
  'sacrifice': { scalars: [bleedMax('max 20 stacks')], channels: ['on-hit'] },
  'leech': { scalars: [bleedMax('max 48 stacks')], channels: ['per-second', 'spawn'] },

  // --- AOE range (Nuke × Overgrowth: first pick's range wins) ---
  'overgrowth': { scalars: [range('3x3 tile')], channels: ['on-hit'] },
};
