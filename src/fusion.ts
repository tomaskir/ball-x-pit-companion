// Fusion module: pure composition of a fused ball from its two components.
// The game has no fusion table — a fused ball is computed at runtime by
// stacking the two components' effects (see docs/research/fusion-mechanics.md).
// This module mirrors that composer over the catalog's effect text:
//   - name is "A × B" in selection order (function is order-independent)
//   - effect paragraphs concatenate per component, in name order
//   - a cross-wire line is emitted when one component's channel can carry the
//     other's effect: spawn/AOE carrier + on-hit status, AOE carrier + kill-
//     on-hit (Black Hole × Sun), spawn carrier + spawn-bound status (Glacier
//     × Maggot) — per the community composition rules (namu's 7 rules; the
//     status-vs-spawn split) validated against the 1,035-observation corpus
//     in docs/research/fusion-observations/. crossWire() returns
//     { line, disputed }: disputed marks a corpus-contradicted kill wire
//     (flicker × reaper), which fuse() turns into a caveat note.
//   - order is property-set union with first-pick scalar precedence: the
//     resolver in fusion-properties.ts returns the union and the shared-key
//     collisions (first pick wins). The collisions and reported exceptions
//     are structured for the panel's "Fused result" / "Reported exceptions"
//     sections (#8), not duplicated as notes. Fixed composition caveats
//     (Destroy × Destroy, hit-once dominance over pass-through, spawn
//     compensating Destroy, Dark's multiplier, Assassin/Warp trait priority)
//     stay notes (docs/research/fusion-mechanics.md §2e/§3;
//     fusion-pairs.json general_rules_notes).
//   - effect paragraphs use level-3 text (the fusion screen consumes L3
//     balls; decision #12) from the generated src/data/level-3.ts overlay,
//     falling back to the level-1 catalog text.
//   - damage rolls are abstracted to "X" (fused numbers are not derivable)
// It is the site's editorial model of fusion, not game data.
import { BALLS, type Ball } from './data/balls';
import { LEVEL_3_EFFECTS } from './data/level-3';
import {
  exceptionsFor,
  pairKey,
  resolveProperties,
  type FusionException,
  type PropertyCollision,
  type ResolvedProperties,
} from './fusion-properties';

/** Balls offered by the fusion pick list: every ball except Baby Ball, which
 *  is not a fusable upgrade entity (research: docs/research/fusion-*.md).
 *  The single home of the fusable-ball rule — renderer and view-state both
 *  consume it. */
export function fusionBalls(): Ball[] {
  return BALLS.filter((b) => b.id !== 'baby-ball');
}

/** "A × B" — the game uses U+00D7, first-selected ball first. */
export const fusionName = (a: Ball, b: Ball): string => `${a.name} × ${b.name}`;

/** Abstract damage rolls to "X damage" / "X". Durations, stacks, cooldowns,
 *  percentages and health numbers stay — they carry the mechanic's identity. */
export function abstractDamage(text: string): string {
  return text
    // rolls right before " damage" ("1–3 damage", "3.0x damage", "300% damage")
    .replace(/\b\d+(?:\.\d+)?(?:[–-]\d+(?:\.\d+)?)?(?:x|%)?(?= damage)/gi, 'X')
    // bare numeric rolls after deals/dealt/dealing ("dealt 150–300 after…").
    // Percentages and multipliers are left alone ("deal 20% of their current
    // health", "25% less damage") — those are mechanics, not damage rolls.
    .replace(/\b(?:deals?|dealt|dealing) \d+(?:\.\d+)?(?:[–-]\d+(?:\.\d+)?)?(?![\dx%]|\.\d)/gi, (m) =>
      m.replace(/\d+(?:\.\d+)?(?:[–-]\d+(?:\.\d+)?)?$/, 'X')
    );
}

/** How a status effect is applied — the split that decides cross-wiring.
 *  'hit'   — from the ball's own hits; a fused partner's hits can carry it.
 *  'spawn' — bound to spawned sub-entities (spikes, blobs, fireworks…);
 *            partner hits cannot fire it (playtest: Flash × Glacier).
 *  'field' — a continuous aura while on the field; independent of hits.
 *  null    — no status effect. */
type StatusChannel = 'hit' | 'spawn' | 'field' | null;

/** Status lives on spawned sub-entities (icicles, blobs, rods, bombs…). */
const SPAWN_BOUND = /\b(spikes?|blobs?|tar blobs?|leech|fireworks?|time bomb|lightning rod|time snare|snares?)/i;
/** Status is a continuous field aura, not a hit effect. */
const FIELD_AURA = /\b(while on the field|when launched|while active|every second|per second to all|all enemies in view|within its sightline)/i;
/** Community-evidenced exceptions to the text-derived channel: Blizzard's
 *  freeze comes from spawned icicles (icemage_999). Freeze Ray is NOT
 *  spawn-bound: its freeze is on-hit/AOE and spreads with Flash (Nov 2026
 *  community test + wiki taxonomy). Sun's field aura still does not apply it
 *  (corpus freeze-ray+sun — the beam carries Sun's burn, not the reverse). */
const SPAWN_BOUND_IDS = new Set(['blizzard']);
/** Text-derived channel exceptions. Berserk is applied on hit (40% at L3),
 *  not a field aura — the "every second" phrase describes the berserk
 *  debuff's tick. */
const CHANNEL_OVERRIDES: Record<string, StatusChannel> = { berserk: 'hit' };
/** Statuses the corpus shows a field-aura carrier applying. The trigger
 *  matrix says AOE applies statuses on the damage event, not the hit event,
 *  so a field aura (on-timer) can carry damage-riding statuses but not
 *  statuses bound to a hit. These four are the corpus-evidenced
 *  damage-riding set (Sun × Overgrowth/Virus/Hemorrhage/Succubus). Every
 *  other on-hit status is blocked for a field-aura carrier — Freeze Ray's
 *  freeze is the evidenced negative (Sun × Freeze Ray). */
const ON_DAMAGE_STATUS_IDS = new Set(['overgrowth', 'virus', 'hemorrhage', 'succubus']);
/** Spawn carriers whose spawned balls do NOT inherit the partner's property
 *  (corpus): Voluptuous Egg Sac spawns Egg Sacs that spawn balls — the
 *  property drops at the second hop (Steam, playtest-confirmed by posters).
 *  Brood Mother and Mosquito King stay excluded here pending the #20
 *  decision; #17/#18 research says the blanket exclusion is too strong
 *  (Brood Mother degraded/probabilistic; Mosquito King's spawn trigger and
 *  inheritance are separate channels). */
const SPAWN_EXCLUDED_IDS = new Set(['voluptuous-egg-sac', 'brood-mother', 'mosquito-king']);
/** AOE carriers with no damage hits to carry a status: Satan's screen
 *  judgment is debuff-only (Bilibili) — it cannot trigger on-hit statuses
 *  like Hemorrhage's %-damage, nor Reaper's on-impact kill (corpus:
 *  reaper+satan no-cross-wire). It DOES carry Black Hole's instant kill
 *  (corpus: black-hole+satan, 3 claims). */
const AOE_EXCLUDED_IDS = new Set(['satan']);
/** Kill-on-hit effects that ride damage-dealing AOE carriers (the corpus's
 *  biggest documented cross-wire class: Black Hole × Sun is its single
 *  most-discussed pair — "Sun's screen-wide hits apply Black Hole's
 *  instant-kill to every non-boss enemy"; Reaper's on-impact kill works with
 *  Flash/Flicker/Armageddon). Timestop is deliberately absent: it deals no
 *  damage, and the corpus shows its pairs don't wire. */
const KILL_EFFECT_IDS = new Set(['black-hole', 'reaper']);

/** The hit-once class (game-file I2 effect-text dump: exactly the balls whose
 *  text lists a cooldown). Order resolution itself now lives in the property
 *  resolver (fusion-properties.ts); this set remains for the fixed
 *  hit-once-dominates-pass-through caveat. */
const COOLDOWN_CLASS_IDS = new Set(['black-hole', 'bomb', 'dark', 'egg-sac', 'nuclear-bomb', 'timestop', 'voluptuous-egg-sac']);

/** Fixed composition caveats from the corpus (general_rules_notes): reported
 *  interactions beyond naive text concatenation. */
const DESTROY_CLASS_IDS = new Set(['dark', 'egg-sac', 'time', 'armageddon', 'black-hole', 'bomb', 'fireworks', 'landslide', 'mosquito-swarm', 'nuclear-bomb', 'timestop', 'voluptuous-egg-sac']);
const HIT_ONCE_COOLDOWN_IDS = COOLDOWN_CLASS_IDS;
const PIERCE_IDS = new Set(['ghost', 'wind', 'assassin', 'drill', 'erosion', 'noxious', 'sandstorm', 'sniper', 'soul-sucker', 'wraith']);

/** Level-3 component text for fusion (decision #12). The catalog keeps
 *  level-1 text for the browser; the fusion screen consumes L3 balls. */
const componentText = (b: Ball): string => LEVEL_3_EFFECTS[b.id] ?? b.effects;

function statusChannel(b: Ball): StatusChannel {
  if (!b.tags.includes('status-effect')) return null;
  const override = CHANNEL_OVERRIDES[b.id];
  if (override) return override;
  const text = componentText(b);
  if (SPAWN_BOUND_IDS.has(b.id)) return 'spawn';
  if (SPAWN_BOUND.test(text)) return 'spawn';
  if (FIELD_AURA.test(text)) return 'field';
  return 'hit';
}

/** AOE carriers with no damage rolls cannot carry a kill-on-hit effect.
 *  Timestop freezes but deals no damage; its pairs don't wire (corpus). */
const dealsDamage = (b: Ball) => /\b\d+(?:\.\d+)?(?:[–-]\d+(?:\.\d+)?)?(?:x|%)?(?= damage)|\bdeals?\b/i.test(componentText(b));

const hasSpawn = (b: Ball) => b.tags.some((t) => t === 'spawns-baby-balls' || t === 'spawns-allies' || t === 'clone');
const spawnable = (b: Ball) => hasSpawn(b) && !SPAWN_EXCLUDED_IDS.has(b.id);

/** Cross-wire line when one component's channel can carry the other's effect.
 *  Role-named like the game's tooltip ("Spawned balls from X … as Y"), not
 *  order-named. Conservative: only patterns with tooltip or corpus evidence —
 *  spawn-carrier × on-hit status, AOE-carrier × on-hit status, AOE-carrier ×
 *  kill-on-hit (Black Hole × Sun), and spawn-carrier × spawn-bound status
 *  (Glacier × Maggot: babies inherit the whole kit including its spikes). */
/** Cross-wire result: the emitted line (or null) plus whether the emitted kill
 *  cross-wire is corpus-disputed (both polarities reported; fuse() turns the
 *  bit into a caveat note). The disputed bit travels with the line instead of
 *  a module-level flag, so every caller gets both results from one call. */
export interface CrossWireResult {
  line: string | null;
  disputed: boolean;
}

export function crossWire(a: Ball, b: Ball): CrossWireResult {
  const NO_WIRE: CrossWireResult = { line: null, disputed: false };
  const isKill = (b: Ball) => KILL_EFFECT_IDS.has(b.id);
  const isStatus = (b: Ball) => statusChannel(b) === 'hit';

  // spawn carrier + partner's on-hit status (tooltip: Overgrowth × Maggot)
  const [spawner, st] = spawnable(a) && isStatus(b) ? [a, b]
    : spawnable(b) && isStatus(a) ? [b, a] : [null, null];
  if (spawner && st) return { line: `Spawned balls from ${spawner.name} have the same properties as ${st.name}.`, disputed: false };

  // AOE carrier + partner's on-hit status (tooltip: Overgrowth × Flash)
  const rank = (b: Ball) => (b.tags.includes('screen-clear') ? 2 : b.tags.includes('aoe') ? 1 : 0);
  const aoeCarrier = (b: Ball) => rank(b) > 0 && !AOE_EXCLUDED_IDS.has(b.id);
  /** An on-timer/field-aura carrier cannot trigger a status applied on the
   *  hit event (trigger matrix: AOE = On-Hit NO / On-Damage YES / On-Timer
   *  NO). It can carry the corpus-evidenced damage-riding statuses; Freeze
   *  Ray × Sun is the evidenced negative (the beam carries Sun's burn
   *  instead). */
  const canCarryStatus = (carrier: Ball, st: Ball) =>
    !(statusChannel(carrier) === 'field' && statusChannel(st) === 'hit' && !ON_DAMAGE_STATUS_IDS.has(st.id));
  const [carrier, st2] = aoeCarrier(a) && rank(a) > rank(b) && isStatus(b) && canCarryStatus(a, b) ? [a, b]
    : aoeCarrier(b) && rank(b) > rank(a) && isStatus(a) && canCarryStatus(b, a) ? [b, a] : [null, null];
  if (carrier && st2) return { line: `Area-of-effect damage from ${carrier.name} inflicts the status effect of ${st2.name}.`, disputed: false };

  // AOE carrier + partner's kill-on-hit (Black Hole × Sun — the corpus meta
  // pair; kamigame: "Black Hole's effect rides on Flash's screen-wide
  // attack"). The carrier must be a real AOE carrier (rank > 0, not
  // excluded) that deals damage — Timestop freezes but deals none, and its
  // pairs don't wire (corpus). The kill ball is often itself screen-clear
  // (Black Hole, Reaper), so no rank comparison. Satan is allowed as
  // carrier only for Black Hole's kill: its judgment is debuff-only, and
  // applying an instant-kill is a debuff, while Reaper's kill is a
  // damage-channel proc it cannot fire (corpus, both directions).
  const killCarrierOk = (carrier: Ball, killer: Ball) =>
    dealsDamage(carrier) && (
      // Satan is excluded as an AOE carrier for statuses, but its debuff-only
      // judgment does apply Black Hole's instant kill (corpus: 3 claims).
      killer.id === 'black-hole' && carrier.id === 'satan' ||
      aoeCarrier(carrier)
    );
  /** Pairs whose kill cross-wire is corpus-contradicted (both polarities
   *  reported, unresolved — CONTRADICTIONS.md §10e). */
  const KILL_DISPUTED_PAIRS = new Set(['flicker+reaper']);
  const [kCarrier, killer] = isKill(b) && !isKill(a) && killCarrierOk(a, b) ? [a, b]
    : isKill(a) && !isKill(b) && killCarrierOk(b, a) ? [b, a] : [null, null];
  if (kCarrier && killer) {
    return {
      line: `Area-of-effect damage from ${kCarrier.name} triggers the instant kill of ${killer.name}.`,
      disputed: KILL_DISPUTED_PAIRS.has(pairKey(a, b)),
    };
  }

  // spawn carrier + partner's spawn-bound status (Glacier × Maggot — the
  // babies inherit the fused kit, spikes included; namu rule 6, corpus
  // glacier+maggot / cell+glacier / blizzard+spider-queen). spawnable()
  // filters the excluded carriers (VES, Brood Mother, Mosquito King), so
  // their broken hop yields null here.
  const spawnStatus = (b: Ball) => statusChannel(b) === 'spawn';
  const [sp2, sst] = spawnable(a) && spawnStatus(b) ? [a, b]
    : spawnable(b) && spawnStatus(a) ? [b, a] : [null, null];
  if (sp2 && sst) return { line: `Spawned balls from ${sp2.name} have the same properties as ${sst.name}, including its spawned effects.`, disputed: false };
  return NO_WIRE;
}

/** If the pair is a 2-component evolution recipe the pair Evolves instead of
 *  Fusing (the Fusion Reactor will not offer it). 3+ component recipes do not
 *  block fusion. */
export function evolvesInstead(a: Ball, b: Ball): Ball | null {
  const ids = new Set([a.id, b.id]);
  for (const ball of BALLS) {
    for (const recipe of ball.recipes) {
      if (recipe.length === 2 && ids.has(recipe[0]) && ids.has(recipe[1])) return ball;
    }
  }
  return null;
}

export interface FusionResult {
  /** "A × B" — first-selected ball first. */
  name: string;
  /** Component effect paragraphs (level-3 text), in name order, damage rolls
   *  abstracted. */
  paragraphs: [string, string];
  /** Cross-wire line, or null when no channel carries the partner's effect. */
  crossWire: string | null;
  /** Set when the pair Evolves instead of Fusing. */
  evolvesInstead: { id: string; name: string } | null;
  /** Display caveats — this composition is the site's model, not game data. */
  notes: string[];
  /** Property-set union with first-pick scalar precedence (decision #7). */
  resolved: ResolvedProperties;
  /** Shared scalar keys whose values differ; the first pick wins. */
  collisions: PropertyCollision[];
  /** Reported anomalies outside the general rule (decision #7 / #8). */
  exceptions: FusionException[];
}

/** Compose the fused ball for two distinct catalog balls. Returns null for
 *  the same ball twice (the game forbids self-fusion). */
export function fuse(a: Ball, b: Ball): FusionResult | null {
  if (a.id === b.id) return null;
  const evo = evolvesInstead(a, b);
  const notes = ['Composition is modeled from community-observed rules; verify against the game.'];

  // Order resolution (fusion-mechanics.md §3, decision #7): property-set
  // union with first-pick scalar precedence. Each differing shared scalar key
  // is a collision won by the first-selected ball; the panel renders these as
  // the "Fused result" rows (#8), so they are not repeated as notes.
  const resolved = resolveProperties(a, b);

  // Pool recursion (CONTRADICTIONS.md §2): not a fusion effect, but the
  // first-selected base ball is consumed from the level-up/fusion pool.
  const BASE_BALL_IDS = new Set(BALLS.filter((b) => b.depth === 0).map((b) => b.id));
  if (BASE_BALL_IDS.has(a.id) || BASE_BALL_IDS.has(b.id)) {
    notes.push(`Pool note — the first-selected base ball is consumed and does not reappear in the level-up/fusion pool this run (reported).`);
  }

  // Fixed composition caveats (corpus general rules; commutative, not order).
  if (a.id === 'dark' || b.id === 'dark') {
    notes.push(`Dark's damage multiplier carries into the fusion — Dark is prized as fusion material for exactly this (reported).`);
  }
  if (DESTROY_CLASS_IDS.has(a.id) && DESTROY_CLASS_IDS.has(b.id)) {
    notes.push('Both balls self-destruct — fusing two Destroy-class balls may lose one of the two effects (reported).');
  }
  if ((HIT_ONCE_COOLDOWN_IDS.has(a.id) && PIERCE_IDS.has(b.id)) || (HIT_ONCE_COOLDOWN_IDS.has(b.id) && PIERCE_IDS.has(a.id))) {
    notes.push(`Hit-once + cooldown is dominant: the fused ball keeps it and loses the partner's pass-through (reported).`);
  }
  if ((DESTROY_CLASS_IDS.has(a.id) && spawnable(b)) || (DESTROY_CLASS_IDS.has(b.id) && spawnable(a))) {
    notes.push('Spawn can compensate Destroy — spawned clones/babies keep the fused ball alive (reported; Cell × Bomb is the known example).');
  }
  // Fixed trait priorities (commutative — not order effects).
  if ((a.id === 'assassin' && PIERCE_IDS.has(b.id)) || (b.id === 'assassin' && PIERCE_IDS.has(a.id))) {
    notes.push(`Assassin's back-armor rule wins over the partner's pass-through — the fused ball cannot pierce the back (reported; commutative, not an order effect).`);
  }
  if ((a.id === 'warp' && PIERCE_IDS.has(b.id)) || (b.id === 'warp' && PIERCE_IDS.has(a.id))) {
    notes.push(`Warp is cast before the partner's pass-through (reported; commutative, not an order effect).`);
  }

  // Freeze Ray × Sun: the corpus resolves the direction — the beam applies
  // Sun's burn, not the reverse (the AOE branch correctly emits no wire).
  if (pairKey(a, b) === 'freeze-ray+sun') {
    notes.push(`Reported direction — Freeze Ray's beam applies Sun's burn; Sun's field aura does not apply Freeze Ray's freeze.`);
  }

  const wire = crossWire(a, b);
  if (wire.disputed) {
    notes.push('Corpus contradiction — reports disagree on whether the instant kill fires from the partner\'s hits here (see docs/research/fusion-observations/CONTRADICTIONS.md).');
  }

  // Reported anomalies outside the general rule (decision #7). Structured for
  // the panel's separate "Reported exceptions" section (#8).
  const exceptions = exceptionsFor(a, b);

  return {
    name: fusionName(a, b),
    paragraphs: [componentText(a), componentText(b)].map(abstractDamage) as [string, string],
    crossWire: wire.line,
    evolvesInstead: evo ? { id: evo.id, name: evo.name } : null,
    notes,
    resolved,
    collisions: resolved.collisions,
    exceptions,
  };
}
