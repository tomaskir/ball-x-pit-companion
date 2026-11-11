// Fusion knowledge: the hand-maintained evidence tables behind the composer.
// src/fusion.ts owns the composition algorithm; this module owns the
// classification facts that algorithm reads — the Destroy/cooldown/pierce/
// kill classes, the one application-channel classifier (`channelsOf`, which
// both the property model and the cross-wire model consume), the
// spawn-inheritance classes, and the reported-fact table (caveat prose plus
// reported exceptions). Keeping the
// evidence here makes a research landing a one-table edit and lets every
// predicate be unit-tested directly (src/fusion-knowledge.test.ts); the
// corpus's general_rules_notes are the fixture the tables are checked against.
//
// Every id is a ball id in src/data/balls.ts. Nothing here composes: the
// predicates answer "what class is this ball in?", and `FUSION_FACTS` /
// `factsFor()` are the reported copy and anomalies `fuse()` emits beside
// the composed result. `fuse()` applies the table; it never names a pair.
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

// ---------- one application-channel classification per ball ----------

/** The property model's application-channel vocabulary. Channels are
 *  set-valued: a ball can apply effects through more than one. */
export type Channel = 'on-hit' | 'per-second' | 'spawn' | 'field';

/** Explicit per-ball channel evidence — the property model's old hand-maintained
 *  `channels` column, moved here so one classifier answers for both models.
 *  The ids mirror BALL_PROPERTIES' keys (fusion-properties.test.ts pins that
 *  every kit ball has an entry). A listed ball is classified from evidence;
 *  every other ball falls back to the status-text heuristic. An empty array is
 *  an explicit "no application channel" (the bonus-damage stat balls), not a
 *  missing entry. */
export const CHANNEL_EVIDENCE: Readonly<Record<string, readonly Channel[]>> = {
  // --- cooldown class (the game-file I2 effect-text dump: exactly the balls
  // whose text lists a cooldown) ---
  'black-hole': ['on-hit'],
  'bomb': ['on-hit'],
  'dark': ['on-hit'],
  'egg-sac': ['spawn'],
  'nuclear-bomb': ['on-hit'],
  'timestop': ['field'], // a field freeze; the text heuristic's hit default is wrong
  'voluptuous-egg-sac': ['spawn'],

  // --- burn profiles ---
  'banished-flame': ['on-hit'],
  'burn': ['on-hit'],
  'sun': ['per-second', 'field'],
  'brimstone': ['per-second', 'field'],
  'inferno': ['per-second', 'field'],
  'magma': ['spawn'],
  'satan': ['per-second', 'field'],
  'fireworks': ['spawn'],

  // --- bonus-damage stat swaps: no application channel ---
  'erosion': [],
  'stone': [],
  'drill': [],
  'assassin': [],
  'steel': [],

  // --- freeze duration ---
  'freeze-ray': ['on-hit'],
  'blizzard': ['spawn'],
  'freeze': ['on-hit'],
  'wraith': ['on-hit'],
  'glacier': ['spawn'],
  'time': ['spawn'],

  // --- poison stack caps ---
  'poison': ['on-hit'],
  'noxious': ['on-hit'],
  'swamp': ['spawn'],

  // --- radiation ---
  'radiation-beam': ['on-hit'],
  'x-ray': ['on-hit'],

  // --- mosquito spawn variants ---
  'mosquito-king': ['spawn'],
  'mosquito-kingdom': ['spawn'],
  'mosquito-swarm': ['spawn'],

  // --- bleed stack caps ---
  'bleed': ['on-hit'],
  'sacrifice': ['on-hit'],
  'leech': ['per-second', 'spawn'],

  // --- AOE range ---
  'overgrowth': ['on-hit'],
};

/** The status vocabulary's single-channel spelling, used by the text fallback
 *  for an override. */
const CHANNEL_FROM_STATUS: Readonly<Record<'hit' | 'spawn' | 'field', Channel>> = {
  hit: 'on-hit',
  spawn: 'spawn',
  field: 'field',
};

/** The status-text fallback: one channel from the ball's L3 text, or none.
 *  Only status balls are classified this way; a ball without the status-effect
 *  tag has no text-derived application channel. */
function textChannels(b: Ball): readonly Channel[] {
  if (!b.tags.includes('status-effect')) return [];
  const override = channelOverride(b);
  if (override) return [CHANNEL_FROM_STATUS[override]];
  if (isSpawnBound(b)) return ['spawn'];
  if (FIELD_AURA_TEXT.test(componentText(b))) return ['field'];
  return ['on-hit'];
}

/** The one classification: how a ball applies its effects. Explicit evidence
 *  wins; otherwise the status-text heuristic classifies status balls. The
 *  property model (`resolveProperties`) and the cross-wire model
 *  (`statusChannel`) both consume this, so the two cannot drift. */
export function channelsOf(b: Ball): readonly Channel[] {
  return CHANNEL_EVIDENCE[b.id] ?? textChannels(b);
}

/** The wire-relevant single channel: spawn-bound > field (including
 *  per-second auras) > on-hit > none. Only status balls have a wire channel —
 *  a ball without the status-effect tag returns null even when its
 *  classification has channels (Dark's on-hit cooldown, a spawn carrier's
 *  spawn channel). */
export function statusChannel(b: Ball): StatusChannel {
  if (!b.tags.includes('status-effect')) return null;
  const channels = channelsOf(b);
  if (channels.includes('spawn')) return 'spawn';
  if (channels.includes('field') || channels.includes('per-second')) return 'field';
  if (channels.includes('on-hit')) return 'hit';
  return null;
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

// ---------- reported-fact prose (the caveats fuse() emits) ----------

/** Pool recursion (CONTRADICTIONS.md §2): not a fusion effect, but the
 *  first-selected base ball is consumed from the level-up/fusion pool. */
export const BASE_BALL_POOL_CAVEAT =
  'Pool note — the first-selected base ball is consumed and does not reappear in the level-up/fusion pool this run (reported).';

/** Dark's multiplier carries into any fusion (namu.wiki). */
export const DARK_MULTIPLIER_CAVEAT =
  `Dark's damage multiplier carries into the fusion — Dark is prized as fusion material for exactly this (reported).`;

/** Two self-destruct balls may lose one effect. */
export const DESTROY_PAIR_CAVEAT =
  'Both balls self-destruct — fusing two Destroy-class balls may lose one of the two effects (reported).';

/** Hit-once (cooldown) dominates pass-through. */
export const HIT_ONCE_CAVEAT =
  `Hit-once + cooldown is dominant: the fused ball keeps it and loses the partner's pass-through (reported).`;

/** Spawned clones/babies keep the fused ball alive (Cell × Bomb). */
export const SPAWN_COMPENSATES_DESTROY_CAVEAT =
  'Spawn can compensate Destroy — spawned clones/babies keep the fused ball alive (reported; Cell × Bomb is the known example).';

/** Assassin's back-armor rule beats the partner's pass-through. */
export const ASSASSIN_BACK_ARMOR_CAVEAT =
  `Assassin's back-armor rule wins over the partner's pass-through — the fused ball cannot pierce the back (reported; commutative, not an order effect).`;

/** Warp is cast before the partner's pass-through. */
export const WARP_PASS_THROUGH_CAVEAT =
  `Warp is cast before the partner's pass-through (reported; commutative, not an order effect).`;

/** Freeze Ray × Sun: the corpus resolves the direction — the beam applies
 *  Sun's burn, not the reverse (the AOE branch correctly emits no wire). */
export const FREEZE_RAY_SUN_CAVEAT =
  `Reported direction — Freeze Ray's beam applies Sun's burn; Sun's field aura does not apply Freeze Ray's freeze.`;

/** Reported spawn-inheritance caveats (issue #20). The inheritance caveats
 *  fire only when the wire actually uses the carrier's spawn channel; the
 *  trigger limits describe the carrier + AOE partner, wire or not. The Flash
 *  sentence is shared so it can be deduped when both Brood Mother caveats
 *  fire for the same pair. */
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

/** Corpus contradiction note for a disputed kill cross-wire (CONTRADICTIONS.md
 *  §10e). */
export const DISPUTED_KILL_CAVEAT =
  'Corpus contradiction — reports disagree on whether the instant kill fires from the partner\'s hits here (see docs/research/fusion-observations/CONTRADICTIONS.md).';

// ---------- the reported-fact table ----------

/** Composition state a caveat rule may read. Rules that qualify a wire need
 *  the carrier that produced it; the disputed-kill note needs the wire's
 *  contradiction bit. */
export interface CaveatContext {
  /** Id of the spawn carrier whose spawn channel produced the cross-wire
   *  line, or null when the line came from another channel (or none). */
  spawnerId: string | null;
  /** True when the emitted kill cross-wire is corpus-contradicted. */
  disputed: boolean;
}

/** A reported fact about a class of pairs: prose emitted beside the composed
 *  result. `when` reads the pair and the composition context, so `fuse()`
 *  applies rules without naming pairs. */
export interface NoteFact {
  kind: 'note';
  /** Stable name (the corpus general_rules_notes key where one exists). */
  id: string;
  when: (a: Ball, b: Ball, ctx: CaveatContext) => boolean;
  /** The reported copy, or a function when it depends on context. */
  note: string | ((a: Ball, b: Ball, ctx: CaveatContext) => string);
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

/** A reported anomaly carried by the same table as the caveats. */
export interface ExceptionFact {
  kind: 'exception';
  id: string;
  exception: FusionException;
}

export type FusionFact = NoteFact | ExceptionFact;

/** The one home for reported fusion facts: class caveats, pair-direction
 *  caveats, spawn-inheritance caveats, and the reported exceptions. Table
 *  order is note order. A research landing edits this table (and, for a new
 *  class, its predicate) — never `fuse()`. */
export const FUSION_FACTS: readonly FusionFact[] = [
  // ---- class caveats (corpus general_rules_notes; commutative) ----
  {
    kind: 'note',
    id: 'base-ball-pool-recursion',
    when: (a, b) => BASE_BALL_IDS.has(a.id) || BASE_BALL_IDS.has(b.id),
    note: BASE_BALL_POOL_CAVEAT,
  },
  {
    kind: 'note',
    id: 'dark-multiplier',
    when: (a, b) => hasId(a, b, 'dark'),
    note: DARK_MULTIPLIER_CAVEAT,
  },
  {
    kind: 'note',
    id: 'destroy-pair-may-lose-one-effect',
    when: (a, b) => isDestroyClass(a) && isDestroyClass(b),
    note: DESTROY_PAIR_CAVEAT,
  },
  {
    kind: 'note',
    id: 'hit-once-dominates-pass-through',
    when: (a, b) => (isCooldownClass(a) && isPierce(b)) || (isCooldownClass(b) && isPierce(a)),
    note: HIT_ONCE_CAVEAT,
  },
  {
    kind: 'note',
    id: 'spawn-compensates-destroy',
    when: (a, b) => (isDestroyClass(a) && spawnable(b)) || (isDestroyClass(b) && spawnable(a)),
    note: SPAWN_COMPENSATES_DESTROY_CAVEAT,
  },
  {
    kind: 'note',
    id: 'assassin-back-armor-wins',
    when: (a, b) => idWithPiercePartner(a, b, 'assassin'),
    note: ASSASSIN_BACK_ARMOR_CAVEAT,
  },
  {
    kind: 'note',
    id: 'warp-cast-before-pass-through',
    when: (a, b) => idWithPiercePartner(a, b, 'warp'),
    note: WARP_PASS_THROUGH_CAVEAT,
  },
  // ---- pair-direction caveat ----
  {
    kind: 'note',
    id: 'freeze-ray-sun-direction',
    when: (a, b) => pairKey(a.id, b.id) === 'freeze-ray+sun',
    note: FREEZE_RAY_SUN_CAVEAT,
  },
  // ---- spawn-inheritance caveats (issue #20) ----
  {
    kind: 'note',
    id: 'brood-mother-inheritance',
    when: (_a, _b, ctx) => ctx.spawnerId === 'brood-mother',
    note: BROOD_MOTHER_INHERITANCE_CAVEAT,
  },
  {
    kind: 'note',
    id: 'egg-sac-inheritance',
    when: (_a, _b, ctx) => ctx.spawnerId === 'egg-sac',
    note: EGG_SAC_INHERITANCE_CAVEAT,
  },
  {
    kind: 'note',
    id: 'brood-mother-trigger-limit',
    when: (a, b) => aoePartner(a, b, 'brood-mother'),
    // Both caveats fire for Brood Mother × Flash; the inheritance caveat
    // already carries the Flash sentence, so the trigger caveat drops it.
    note: (_a, _b, ctx) => (ctx.spawnerId === 'brood-mother'
      ? `${BROOD_MOTHER_TRIGGER_CAVEAT}.`
      : `${BROOD_MOTHER_TRIGGER_CAVEAT}; ${BROOD_MOTHER_FLASH_REPORT_FRAGMENT}`),
  },
  {
    kind: 'note',
    id: 'mosquito-king-trigger-limit',
    when: (a, b) => aoePartner(a, b, 'mosquito-king'),
    note: MOSQUITO_KING_TRIGGER_CAVEAT,
  },
  // ---- corpus contradiction caveat ----
  {
    kind: 'note',
    id: 'disputed-kill-wire',
    when: (_a, _b, ctx) => ctx.disputed,
    note: DISPUTED_KILL_CAVEAT,
  },
  // ---- reported exceptions (decision #7 anomalies) ----
  {
    kind: 'exception',
    id: 'nuclear-bomb-wraith-order',
    exception: {
      pair: 'nuclear-bomb+wraith',
      title: 'Order-sensitive one-off',
      detail: 'The two orders behave differently, and the fused tooltip misdescribes the result (reported).',
      source: 'Reddit (Abject_Nerve_1052), 2026-04-21; corpus nuclear-bomb+wraith',
      confidence: 'reported',
      orderDependent: true,
    },
  },
  {
    kind: 'exception',
    id: 'time-bubble-radius',
    exception: {
      pair: 'time+*',
      title: 'Time bubble radius',
      detail: 'Time fused with any partner reportedly expands the time-snare radius; one comment claims the size follows the second pick. Not verified.',
      source: 'Bilibili 2026-08-07; Reddit comment (icemage_999)',
      confidence: 'unverified',
      orderDependent: true,
    },
  },
  {
    kind: 'exception',
    id: 'banshee-curse-override',
    exception: {
      pair: 'banshee+*',
      title: 'Whole-field curse override',
      detail: "Banshee's whole-field curse reportedly overrides some partner curse effects; a single untested comment.",
      source: 'Reddit comment (icemage_999), Nov 2026',
      confidence: 'unverified',
      orderDependent: false,
    },
  },
];

/** The facts a pair triggers: caveat notes in table order, plus the reported
 *  exceptions (exact pair or a ball-wide wildcard). `ctx` carries the
 *  computed wire state the rules may read. */
export interface AppliedFacts {
  notes: string[];
  exceptions: FusionException[];
}

export function factsFor(a: Ball, b: Ball, ctx: CaveatContext): AppliedFacts {
  const key = pairKey(a.id, b.id);
  const notes: string[] = [];
  const exceptions: FusionException[] = [];
  for (const fact of FUSION_FACTS) {
    if (fact.kind === 'note') {
      if (fact.when(a, b, ctx)) {
        notes.push(typeof fact.note === 'function' ? fact.note(a, b, ctx) : fact.note);
      }
    } else if (
      fact.exception.pair === key ||
      fact.exception.pair === `${a.id}+*` ||
      fact.exception.pair === `${b.id}+*`
    ) {
      exceptions.push(fact.exception);
    }
  }
  return { notes, exceptions };
}

/** The other ball when the pair contains `id`, else null. */
function partnerOf(a: Ball, b: Ball, id: string): Ball | null {
  return a.id === id ? b : b.id === id ? a : null;
}

/** True when either ball is `id`. */
const hasId = (a: Ball, b: Ball, id: string): boolean => partnerOf(a, b, id) !== null;

/** True when the pair contains `id` and the other ball is pass-through. */
const idWithPiercePartner = (a: Ball, b: Ball, id: string): boolean => {
  const partner = partnerOf(a, b, id);
  return partner !== null && isPierce(partner);
};

/** True when the pair contains `id` and its partner is an AOE carrier. */
const aoePartner = (a: Ball, b: Ball, id: string): boolean => {
  const partner = partnerOf(a, b, id);
  return partner !== null && aoeRank(partner) > 0;
};
