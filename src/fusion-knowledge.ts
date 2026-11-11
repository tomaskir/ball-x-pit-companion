// Fusion knowledge: the hand-maintained evidence tables behind the composer.
// src/fusion.ts owns the composition algorithm; this module owns the
// classification facts that algorithm reads — the Destroy/cooldown/pierce/
// kill classes, the status-channel model (text heuristics plus
// community-evidenced exceptions), the spawn-inheritance classes, and the
// reported caveat prose. Keeping the evidence here makes a research landing a
// one-table edit and lets every predicate be unit-tested directly
// (src/fusion-knowledge.test.ts); the corpus's general_rules_notes are the
// fixture the tables are checked against.
//
// Every id is a ball id in src/data/balls.ts. Nothing here composes: the
// predicates answer "what class is this ball in?", and the caveat constants
// are the reported copy fuse() emits beside the composed result.
import { BALLS, type Ball } from './data/balls';
import { LEVEL_3_EFFECTS } from './data/level-3';
import { pairKey } from './pair';

/** Level-3 component text for fusion (decision #12). The catalog keeps
 *  level-1 text for the browser; the fusion screen consumes L3 balls. */
export const componentText = (b: Ball): string => LEVEL_3_EFFECTS[b.id] ?? b.effects;

/** How a status effect is applied — the split that decides cross-wiring.
 *  'hit'   — from the ball's own hits; a fused partner's hits can carry it.
 *  'spawn' — bound to spawned sub-entities (spikes, blobs, fireworks…);
 *            partner hits cannot fire it (playtest: Flash × Glacier).
 *  'field' — a continuous aura while on the field; independent of hits.
 *  null    — no status effect. */
export type StatusChannel = 'hit' | 'spawn' | 'field' | null;

/** Status lives on spawned sub-entities (icicles, blobs, rods, bombs…). */
const SPAWN_BOUND_TEXT = /\b(spikes?|blobs?|tar blobs?|leech|fireworks?|time bomb|lightning rod|time snare|snares?)/i;
/** Status is a continuous field aura, not a hit effect. */
const FIELD_AURA_TEXT = /\b(while on the field|when launched|while active|every second|per second to all|all enemies in view|within its sightline)/i;

/** Community-evidenced exceptions to the text-derived channel: Blizzard's
 *  freeze comes from spawned icicles (icemage_999). Freeze Ray is NOT
 *  spawn-bound: its freeze is on-hit/AOE and spreads with Flash (Nov 2026
 *  community test + wiki taxonomy, pre-DLC v1.301). Sun's field aura still
 *  does not apply it (corpus freeze-ray+sun — the beam carries Sun's burn,
 *  not the reverse). */
export const SPAWN_BOUND_IDS: ReadonlySet<string> = new Set(['blizzard']);

/** Text-derived channel exceptions. Berserk is applied on hit (40% at L3),
 *  not a field aura — the "every second" phrase describes the berserk
 *  debuff's tick. */
export const CHANNEL_OVERRIDES: Readonly<Record<string, StatusChannel>> = { berserk: 'hit' };

/** Statuses the corpus shows a field-aura carrier applying. The trigger
 *  matrix says AOE applies statuses on the damage event, not the hit event,
 *  so a field aura (on-timer) can carry damage-riding statuses but not
 *  statuses bound to a hit. These four are the corpus-evidenced
 *  damage-riding set (Sun × Overgrowth/Virus/Hemorrhage/Succubus). Every
 *  other on-hit status is blocked for a field-aura carrier — Freeze Ray's
 *  freeze is the evidenced negative (Sun × Freeze Ray). */
export const ON_DAMAGE_STATUS_IDS: ReadonlySet<string> = new Set(['overgrowth', 'virus', 'hemorrhage', 'succubus']);

/** Spawn carriers whose spawned balls do NOT inherit the partner's property at
 *  all (corpus): Voluptuous Egg Sac spawns Egg Sacs that spawn balls — the
 *  property drops at the second hop (Steam, playtest-confirmed by posters).
 *  The only hard spawn-inheritance exclusion (issue #20). */
export const SPAWN_NO_INHERITANCE_IDS: ReadonlySet<string> = new Set(['voluptuous-egg-sac']);

/** Spawn carriers whose reported inheritance is status-only: their babies
 *  carry the partner's on-hit status, but not spawn-bound traits (Glacier /
 *  Blizzard stay unwired for both). Brood Mother's inheritance is degraded and
 *  probabilistic; Mosquito King's spawn is an on-hit effect (issue #20). */
export const SPAWN_STATUS_ONLY_IDS: ReadonlySet<string> = new Set(['brood-mother', 'mosquito-king']);

/** AOE carriers with no damage hits to carry a status: Satan's screen
 *  judgment is debuff-only (Bilibili) — it cannot trigger on-hit statuses
 *  like Hemorrhage's %-damage, nor Reaper's on-impact kill (corpus:
 *  reaper+satan no-cross-wire). It DOES carry Black Hole's instant kill
 *  (corpus: black-hole+satan, 3 claims). */
export const AOE_EXCLUDED_IDS: ReadonlySet<string> = new Set(['satan']);

/** Kill-on-hit effects that ride damage-dealing AOE carriers (the corpus's
 *  biggest documented cross-wire class: Black Hole × Sun is its single
 *  most-discussed pair — "Sun's screen-wide hits apply Black Hole's
 *  instant-kill to every non-boss enemy"; Reaper's on-impact kill works with
 *  Flash/Flicker/Armageddon). Timestop is deliberately absent: it deals no
 *  damage, and the corpus shows its pairs don't wire. */
export const KILL_EFFECT_IDS: ReadonlySet<string> = new Set(['black-hole', 'reaper']);

/** The hit-once class (game-file I2 effect-text dump: exactly the balls whose
 *  text lists a cooldown). Order resolution itself lives in the property
 *  resolver (fusion-properties.ts); this set remains for the fixed
 *  hit-once-dominates-pass-through caveat. */
export const COOLDOWN_CLASS_IDS: ReadonlySet<string> = new Set(['black-hole', 'bomb', 'dark', 'egg-sac', 'nuclear-bomb', 'timestop', 'voluptuous-egg-sac']);

/** Fixed composition caveats from the corpus (general_rules_notes): reported
 *  interactions beyond naive text concatenation. */
export const DESTROY_CLASS_IDS: ReadonlySet<string> = new Set(['dark', 'egg-sac', 'time', 'armageddon', 'black-hole', 'bomb', 'fireworks', 'landslide', 'mosquito-swarm', 'nuclear-bomb', 'timestop', 'voluptuous-egg-sac']);

export const PIERCE_IDS: ReadonlySet<string> = new Set(['ghost', 'wind', 'assassin', 'drill', 'erosion', 'noxious', 'sandstorm', 'sniper', 'soul-sucker', 'wraith']);

/** Pairs whose kill cross-wire is corpus-contradicted (both polarities
 *  reported, unresolved — CONTRADICTIONS.md §10e). Keys are canonical
 *  (pairKey sorts the ids), so the predicate is unordered. */
export const KILL_DISPUTED_PAIRS: ReadonlySet<string> = new Set(['flicker+reaper']);

/** Base balls (depth 0), computed once. Pool recursion (CONTRADICTIONS.md §2):
 *  the first-selected base ball is consumed from the level-up/fusion pool. */
export const BASE_BALL_IDS: ReadonlySet<string> = new Set(BALLS.filter((b) => b.depth === 0).map((b) => b.id));

export const isDestroyClass = (b: Ball): boolean => DESTROY_CLASS_IDS.has(b.id);
export const isCooldownClass = (b: Ball): boolean => COOLDOWN_CLASS_IDS.has(b.id);
export const isPierce = (b: Ball): boolean => PIERCE_IDS.has(b.id);
export const isKillEffect = (b: Ball): boolean => KILL_EFFECT_IDS.has(b.id);
export const isStatusOnlySpawner = (b: Ball): boolean => SPAWN_STATUS_ONLY_IDS.has(b.id);
export const isAoeExcluded = (b: Ball): boolean => AOE_EXCLUDED_IDS.has(b.id);
export const isDamageRidingStatus = (b: Ball): boolean => ON_DAMAGE_STATUS_IDS.has(b.id);
export const isDisputedKillPair = (a: Ball, b: Ball): boolean => KILL_DISPUTED_PAIRS.has(pairKey(a.id, b.id));

/** The ball's channel override, if the text heuristic is known to be wrong. */
export const channelOverride = (b: Ball): StatusChannel | undefined => CHANNEL_OVERRIDES[b.id];

/** Status lives on spawned sub-entities (id exception or text heuristic). */
export const isSpawnBound = (b: Ball): boolean =>
  SPAWN_BOUND_IDS.has(b.id) || SPAWN_BOUND_TEXT.test(componentText(b));

export function statusChannel(b: Ball): StatusChannel {
  if (!b.tags.includes('status-effect')) return null;
  const override = channelOverride(b);
  if (override) return override;
  if (isSpawnBound(b)) return 'spawn';
  if (FIELD_AURA_TEXT.test(componentText(b))) return 'field';
  return 'hit';
}

const hasSpawn = (b: Ball): boolean =>
  b.tags.some((t) => t === 'spawns-baby-balls' || t === 'spawns-allies' || t === 'clone');

/** A spawn carrier whose spawn channel can inherit the partner's effects.
 *  VES is the hard exclusion (two-hop drop); status-only carriers pass here
 *  and are filtered per branch instead. */
export const spawnable = (b: Ball): boolean => hasSpawn(b) && !SPAWN_NO_INHERITANCE_IDS.has(b.id);

/** AOE carrier rank: screen-clear > aoe > none. */
export const aoeRank = (b: Ball): number => (b.tags.includes('screen-clear') ? 2 : b.tags.includes('aoe') ? 1 : 0);

/** AOE carriers with no damage rolls cannot carry a kill-on-hit effect.
 *  Timestop freezes but deals no damage; its pairs don't wire (corpus). */
export const dealsDamage = (b: Ball): boolean =>
  /\b\d+(?:\.\d+)?(?:[–-]\d+(?:\.\d+)?)?(?:x|%)?(?= damage)|\bdeals?\b/i.test(componentText(b));

/** Reported spawn-inheritance caveats (issue #20). fuse() emits the
 *  inheritance caveats only when the wire actually uses the carrier's spawn
 *  channel; the trigger limits describe the carrier + AOE partner, wire or
 *  not. The Flash sentence is shared so it can be deduped when both Brood
 *  Mother caveats fire for the same pair. */
export const BROOD_MOTHER_FLASH_REPORT_FRAGMENT =
  'one launch-week report claims Flash × Brood Mother produced none (unverified).';
const BROOD_MOTHER_FLASH_REPORT_SENTENCE =
  BROOD_MOTHER_FLASH_REPORT_FRAGMENT.charAt(0).toUpperCase() + BROOD_MOTHER_FLASH_REPORT_FRAGMENT.slice(1);
export const BROOD_MOTHER_INHERITANCE_CAVEAT =
  `Reported - Brood Mother's babies inherit the partner's properties, but the inherited effect is weaker and the spawn is probabilistic (25/35/45% per hit). ${BROOD_MOTHER_FLASH_REPORT_SENTENCE}`;
export const EGG_SAC_INHERITANCE_CAVEAT =
  'Reported - Egg Sac\'s babies inherit the partner\'s properties, but the inherited effect is weaker than a full clone (namu.wiki).';
export const BROOD_MOTHER_TRIGGER_CAVEAT =
  'Reported - Brood Mother\'s spawn fires on hit, so a screen-wide/AOE partner produces fewer babies';
export const MOSQUITO_KING_TRIGGER_CAVEAT =
  'Reported - Mosquito King\'s spawn is an on-hit effect: the partner\'s screen-wide/AOE damage does not trigger it, so the fused ball spawns mosquitoes only from its own direct hits, not per AOE tick.';
