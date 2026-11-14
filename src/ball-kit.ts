// The per-ball fusion kit: the one hand-maintained table carrying each ball's
// level-3 scalar properties, its application channels, and the game's AOE flag
// together. Three readers consume it — the order model (`resolveProperties` in
// fusion-properties.ts) unions kits, the cross-wire model (`channelsOf` /
// `statusChannel` in fusion-knowledge.ts) classifies application channels, and
// the AOE carrier rank (`aoeRank`) reads the flag. Keeping the columns in one
// entry means adding a ball or changing a channel is a one-table edit; no test
// has to keep two tables aligned.
//
// Values are level-3 and are hand-maintained here so the model is testable and
// independent of the catalog's level-1 text. Every value not marked
// `source: 'reported'` must appear verbatim in the generated level-3 overlay
// (src/data/level-3.ts); data.test.ts enforces that. Base-game rows are v1.301
// wiki text; Risen Ballbylon rows are the v1.308 datamined L3 display values
// (docs/research/risen-fusion.md).
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
  /** Game `AOETypes` non-empty. Present = authoritative (the game flag wins
   *  over the editorial `aoe` tag); absent = the tag fallback applies. Every
   *  Risen Ballbylon ball carries an explicit flag, so the new balls never
   *  depend on the heuristic. */
  aoe?: boolean;
  /** Level-3 scalar properties; a shared key is a collision. */
  scalars: ScalarProperty[];
  /** Application channels; empty means explicitly none. */
  channels: readonly Channel[];
}

const scalar = (key: string, label: string, value: string, source?: 'reported'): ScalarProperty =>
  source ? { key, label, value, source } : { key, label, value };

/** One scalar-key helper per recorded property, so the table reads as data. */
const property = (key: string, label: string) =>
  (value: string, source?: 'reported') => scalar(key, label, value, source);

const cooldown = property('cooldown', 'Cooldown');
const burnMax = property('burn-max-stacks', 'Burn max stacks');
const burnDuration = property('burn-duration', 'Burn duration');
const burnDamage = property('burn-per-stack-damage', 'Burn damage per stack');
const bonusDamage = property('bonus-damage', 'Bonus damage');
const freezeDuration = property('freeze-duration', 'Freeze duration');
const poisonMax = property('poison-max-stacks', 'Poison max stacks');
const poisonDamage = property('poison-per-stack-damage', 'Poison damage per stack');
const radiationDuration = property('radiation-duration', 'Radiation duration');
const radiationMax = property('radiation-max-stacks', 'Radiation max stacks');
const mosquitoSpawn = property('mosquito-spawn', 'Mosquito spawn');
const bleedMax = property('bleed-max-stacks', 'Bleed max stacks');
const range = property('range', 'Range');

// Risen Ballbylon scalar vocabulary (docs/research/risen-fusion.md §6).
const damagePerSecond = property('damage-per-second', 'Damage per second');
const aoeDamage = property('aoe-damage', 'AOE damage');
const charmChance = property('charm-chance', 'Charm chance');
const charmDuration = property('charm-duration', 'Charm duration');
const earthquakeDamage = property('earthquake-damage', 'Earthquake damage');
const fallDamage = property('fall-damage', 'Fall damage');
const slowPct = property('slow-pct', 'Slow');
const slowDuration = property('slow-duration', 'Slow duration');
const lightningDamage = property('lightning-damage', 'Lightning damage');
const maxDamagePct = property('max-damage-pct', 'Max damage');
const overgrowthMax = property('overgrowth-max-stacks', 'Overgrowth max stacks');
const overgrowthBurst = property('overgrowth-burst-damage', 'Overgrowth burst damage');
const damageDecay = property('damage-decay', 'Damage decay');
const minDamagePct = property('min-damage-pct', 'Min damage');
const emissionLength = property('emission-length', 'Emission length');
const curseDamage = property('curse-damage', 'Curse damage');
const curseDelay = property('curse-delay', 'Curse delay');
const steamLifetime = property('steam-lifetime', 'Steam lifetime');
const steamDamage = property('steam-damage', 'Steam damage');
const damageMultiplier = property('damage-multiplier', 'Damage multiplier');
const landslideDuration = property('landslide-duration', 'Landslide duration');
const landslideDamage = property('landslide-damage', 'Landslide damage');
const selfSpeedReduction = property('self-speed-reduction', 'Self speed reduction');
const lifestealChance = property('lifesteal-chance', 'Lifesteal chance');
const lifestealHeal = property('lifesteal-heal', 'Lifesteal heal');
const waterDamage = property('water-damage', 'Water damage');
const fieldDuration = property('field-duration', 'Field duration');
const spawnCount = property('spawn-count', 'Spawn count');
const packSize = property('pack-size', 'Pack size');
const bleedAmount = property('bleed-amount', 'Bleed amount');
const hitLimit = property('hit-limit', 'Hit limit');
const healAmount = property('heal-amount', 'Heal amount');
const birthChance = property('birth-chance', 'Birth chance');

/**
 * Hand-maintained level-3 kit table. Only properties that participate in the
 * fusion model are recorded; an unlisted ball has no recorded properties.
 * Keep scalar values verbatim from docs/research/level-3-effects.md
 * (data.test.ts checks the non-reported ones).
 */
export const BALL_KIT: Record<string, BallKit> = {
  // --- cooldown class (the game-file I2 effect-text dump: exactly the balls
  // whose text lists a cooldown) ---
  'black-hole': {
    scalars: [cooldown('5 second'), damageMultiplier('6.0x', 'reported')],
    channels: ['on-hit'],
  },
  'bomb': { aoe: true, scalars: [cooldown('3 second')], channels: ['on-hit'] },
  'dark': { scalars: [cooldown('3 second'), damageMultiplier('5.0x')], channels: ['on-hit'] },
  'egg-sac': { scalars: [cooldown('3 second'), spawnCount('3–5')], channels: ['spawn'] },
  'nuclear-bomb': {
    aoe: true,
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
  'magma': { aoe: true, scalars: [burnMax('max 3 stacks'), burnDuration('3 seconds'), burnDamage('5–10'), earthquakeDamage('6–12')], channels: ['spawn'] },
  'satan': { scalars: [burnMax('max 5 stacks'), burnDamage('15–30')], channels: ['per-second', 'field'] },
  'fireworks': { scalars: [burnDamage('10–14')], channels: ['spawn'] },

  // --- bonus-damage stat swaps (Erosion × Stone/Drill/Assassin/Steel) ---
  // No application channel: these are stat swaps, not effect carriers.
  'erosion': { scalars: [bonusDamage('5%')], channels: [] },
  'stone': { scalars: [bonusDamage('400%'), damageDecay('30%'), minDamagePct('50%')], channels: [] },
  'drill': { scalars: [bonusDamage('100%')], channels: [] },
  'assassin': { scalars: [bonusDamage('50%')], channels: [] },
  'steel': {
    scalars: [bonusDamage('15%'), maxDamagePct('400%'), damageMultiplier('double'), selfSpeedReduction('50%')],
    channels: [],
  },
  'iron': { scalars: [damageMultiplier('double'), selfSpeedReduction('30%')], channels: [] },

  // --- freeze duration (Freeze Ray × Blizzard is the reported pair) ---
  'freeze-ray': { aoe: true, scalars: [freezeDuration('13.0 seconds')], channels: ['on-hit'] },
  'blizzard': { scalars: [freezeDuration('1.3 seconds'), lightningDamage('1–70')], channels: ['spawn'] },
  'freeze': { scalars: [freezeDuration('8.0 seconds')], channels: ['on-hit'] },
  'wraith': { scalars: [freezeDuration('1.8 seconds')], channels: ['on-hit'] },
  'glacier': { aoe: true, scalars: [freezeDuration('3.0 seconds'), earthquakeDamage('6–12')], channels: ['spawn'] },
  'time': { scalars: [freezeDuration('3.0 seconds')], channels: ['spawn'] },

  // --- poison stack caps and per-stack damage (Noxious × Poison / × Brimstone) ---
  'poison': { scalars: [poisonMax('max 8 stacks'), poisonDamage('2–5')], channels: ['on-hit'] },
  // Noxious's L3 text states the applied count ("applies 3 stacks"), not a
  // cap; the Nov 2026 report treats it as the cap against Brimstone's max 4.
  'noxious': { scalars: [poisonMax('3 stacks'), poisonDamage('2–5')], channels: ['on-hit'] },
  'swamp': {
    aoe: true,
    scalars: [poisonMax('max 8 stacks'), poisonDamage('2–4'), slowPct('50%'), slowDuration('7 seconds'), earthquakeDamage('6–12')],
    channels: ['spawn'],
  },

  // --- radiation duration (Radiation Beam × Nuclear Bomb) ---
  'radiation-beam': { aoe: true, scalars: [radiationDuration('15 seconds'), radiationMax('max 5 stacks')], channels: ['on-hit'] },
  'x-ray': { aoe: true, scalars: [radiationMax('max 5 stacks')], channels: ['on-hit'] },

  // --- mosquito spawn variant (Mosquito Swarm × Mosquito King) ---
  'mosquito-king': { scalars: [mosquitoSpawn('a mosquito'), lifestealHeal('2')], channels: ['spawn'] },
  'mosquito-kingdom': { scalars: [mosquitoSpawn('2–3 mosquitos'), lifestealHeal('2')], channels: ['spawn'] },
  'mosquito-swarm': { scalars: [mosquitoSpawn('4–8 mosquitos'), lifestealHeal('1')], channels: ['spawn'] },

  // --- bleed stack caps and applied amounts (Leech × Sacrifice: different
  // channels union, the shared cap resolves to the first pick) ---
  'bleed': { scalars: [bleedMax('max 14 stacks'), bleedAmount('4 stacks')], channels: ['on-hit'] },
  'sacrifice': {
    scalars: [bleedMax('max 20 stacks'), bleedAmount('6 stacks'), curseDamage('75–125'), curseDelay('5')],
    channels: ['on-hit'],
  },
  'leech': { scalars: [bleedMax('max 48 stacks'), bleedAmount('3 stacks')], channels: ['per-second', 'spawn'] },
  'hemorrhage': { scalars: [bleedAmount('4 stacks')], channels: ['on-hit'] },
  'vampire-lord': { scalars: [bleedAmount('4 stacks'), lifestealHeal('1')], channels: ['on-hit'] },

  // --- charm (Charm × Incubus/Succubus) ---
  'charm': { scalars: [charmChance('5%'), charmDuration('7 seconds')], channels: ['on-hit'] },
  'incubus': {
    scalars: [charmChance('5%'), charmDuration('9 seconds'), curseDamage('150–250'), curseDelay('5')],
    channels: ['on-hit'],
  },
  'succubus': { scalars: [charmChance('5%'), charmDuration('12 seconds'), lifestealHeal('1')], channels: ['on-hit'] },

  // --- slow (Wind × Swamp/Elemental) ---
  'wind': {
    scalars: [slowPct('45%'), slowDuration('8 seconds'), damageMultiplier('0.75x', 'reported')],
    channels: ['on-hit'],
  },
  // Elemental's L3 text names the statuses but states no slow values; the
  // game's kSlowPct/kSlowLen are recorded as reported.
  'elemental': { aoe: true, scalars: [slowPct('40%', 'reported'), slowDuration('5 seconds', 'reported')], channels: ['on-hit'] },

  // --- curse (Banshee × Incubus/Phantom/Sacrifice) ---
  'banshee': { scalars: [curseDamage('250–400'), curseDelay('6')], channels: ['field'] },
  'phantom': { scalars: [curseDamage('200–300'), curseDelay('5')], channels: ['on-hit'] },

  // --- earthquake damage (Earthquake × Glacier/Magma/Swamp) ---
  // The entries below exist for the new scalar keys; their `channels` mirror
  // the pre-existing text classification so the wire model does not drift.
  'earthquake': { aoe: true, scalars: [earthquakeDamage('9–17')], channels: [] },
  'storm': { scalars: [lightningDamage('1–80')], channels: [] },
  'lightning': { aoe: true, scalars: [lightningDamage('1–30')], channels: [] },
  'lightning-bug': { aoe: true, scalars: [lightningDamage('1–100')], channels: [] },
  'lightning-rod': { scalars: [lightningDamage('1–40')], channels: ['spawn'] },

  // --- spawn counts and birth chances (Egg Sac × Catapult/Sniper/Maggot/
  // Shotgun; Brood Mother and Spider Queen collide with Water Bug) ---
  'brood-mother': { scalars: [birthChance('45%')], channels: [] },
  'spider-queen': { scalars: [birthChance('45%')], channels: [] },
  'catapult': { scalars: [spawnCount('4–6')], channels: [] },
  'sniper': { scalars: [spawnCount('5–9')], channels: [] },
  'maggot': { scalars: [spawnCount('2–3')], channels: ['on-hit'] },
  'shotgun': { scalars: [spawnCount('5–9')], channels: [] },

  // --- lifesteal (Heart Swallower × Soul Sucker/Vampire) ---
  'heart-swallower': {
    scalars: [lifestealChance('70%'), lifestealHeal('1'), damageDecay('40%')],
    channels: ['on-hit'],
  },
  'soul-sucker': {
    scalars: [lifestealChance('50%'), lifestealHeal('1'), damageDecay('40%')],
    channels: ['on-hit'],
  },
  'vampire': { scalars: [lifestealChance('6%'), lifestealHeal('2')], channels: [] },

  // --- AOE range (Nuke × Overgrowth: first pick's range wins) ---
  'overgrowth': { scalars: [range('3x3 tile'), overgrowthMax('2'), overgrowthBurst('180–250')], channels: ['on-hit'] },

  // --- landslide (Landslide × Mudslide: shared duration/damage keys) ---
  'landslide': { scalars: [landslideDuration('5 seconds'), landslideDamage('30–40')], channels: [] },

  // =====================================================================
  // Risen Ballbylon (DLC v1.308). Values are the datamined L3 display values;
  // `aoe` is the game's AOETypes flag and is explicit for every new ball.
  // =====================================================================
  'ash': {
    aoe: false,
    scalars: [
      burnMax('max 4 stacks'), burnDuration('8 seconds'), burnDamage('4–7'),
      emissionLength('5.0 seconds'), steamLifetime('6.0 seconds'), range('2', 'reported'),
    ],
    channels: ['field'],
  },
  'beast': { aoe: false, scalars: [damagePerSecond('100–200')], channels: ['per-second'] },
  'bullet': {
    aoe: false,
    scalars: [bonusDamage('1200%'), damageDecay('200%'), minDamagePct('100%')],
    channels: [],
  },
  'force': { aoe: false, scalars: [bonusDamage('15%'), maxDamagePct('300%')], channels: [] },
  'fruit': { aoe: false, scalars: [hitLimit('4'), healAmount('6')], channels: [] },
  'gale': { aoe: false, scalars: [fallDamage('150–200')], channels: [] },
  'hedgehog': {
    aoe: false,
    scalars: [bleedMax('max 14 stacks'), bleedAmount('5 stacks'), spawnCount('2–4')],
    channels: ['on-hit'],
  },
  'ironwood': {
    aoe: true,
    scalars: [aoeDamage('15–20'), bonusDamage('15%'), maxDamagePct('300%'), range('3', 'reported')],
    channels: [],
  },
  'ivy': {
    aoe: false,
    scalars: [overgrowthMax('4'), overgrowthBurst('130–200'), poisonDamage('1–4'), range('3', 'reported')],
    channels: ['on-hit'],
  },
  'kaiju': {
    aoe: false,
    scalars: [
      damageMultiplier('triple'), earthquakeDamage('70–180'),
      selfSpeedReduction('80%', 'reported'), range('5', 'reported'),
    ],
    channels: ['per-second'],
  },
  'misfortune': {
    aoe: true,
    scalars: [damageMultiplier('6.0x'), cooldown('4 second'), curseDamage('20–40'), curseDelay('5')],
    channels: ['on-hit'],
  },
  // Mudslide's slow-duration is dropped: the text's "5 seconds" is the
  // landslide's duration, not the slow's.
  'mudslide': {
    aoe: false,
    scalars: [landslideDuration('5 seconds'), landslideDamage('40–50'), slowPct('30%', 'reported'), range('2 tile')],
    channels: ['on-hit'],
  },
  'rot': { aoe: false, scalars: [bonusDamage('30%'), cooldown('5 second')], channels: [] },
  'siren': { aoe: false, scalars: [charmChance('7.5%'), charmDuration('12 seconds')], channels: ['on-hit'] },
  'stalagmite': { aoe: true, scalars: [earthquakeDamage('25–30'), range('4x4 tile')], channels: [] },
  'steam': {
    aoe: false,
    scalars: [steamDamage('30–60'), emissionLength('6.0 seconds'), steamLifetime('8.0 seconds')],
    channels: ['field'],
  },
  'thunderbird': {
    aoe: false,
    scalars: [damagePerSecond('120–200'), lightningDamage('1–80'), range('2', 'reported')],
    channels: ['per-second'],
  },
  'tsunami': { aoe: false, scalars: [waterDamage('90–170'), range('2', 'reported')], channels: [] },
  'water': {
    aoe: true,
    scalars: [spawnCount('4–6'), waterDamage('40–110'), cooldown('3 second'), range('3', 'reported')],
    channels: ['spawn'],
  },
  'water-bug': { aoe: false, scalars: [birthChance('100%', 'reported')], channels: ['spawn'] },
  'waterfall': {
    aoe: false,
    scalars: [fieldDuration('8.0 seconds'), waterDamage('20–25'), range('2 tile')],
    channels: ['field'],
  },
  'werewolf': {
    aoe: false,
    scalars: [damagePerSecond('150–200'), lifestealChance('40%'), lifestealHeal('3')],
    channels: ['per-second'],
  },
  'wolfpack': {
    aoe: false,
    scalars: [damagePerSecond('100–200'), packSize('2')],
    channels: ['spawn', 'per-second'],
  },
  'wood': {
    aoe: true,
    scalars: [aoeDamage('6–11'), bonusDamage('10%'), maxDamagePct('200%'), range('3', 'reported')],
    channels: [],
  },
};
