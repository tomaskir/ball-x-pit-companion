// Fusion module: pure composition of a fused ball from its two components.
// The game has no fusion table — a fused ball is computed at runtime by
// stacking the two components' effects (see docs/research/fusion-completeness.md).
// This module mirrors that composer over the catalog's effect text:
//   - name is "A × B" in selection order (function is order-independent)
//   - effect paragraphs concatenate per component, in name order
//   - a cross-wire line is emitted when one component's channel can carry the
//     other's effect: spawn/AOE carrier + on-hit status, AOE carrier + kill-
//     on-hit (Black Hole × Sun), spawn carrier + spawn-bound status (Glacier
//     × Maggot) — per the community composition rules (namu's 7 rules; the
//     status-vs-spawn split) validated against the 1,035-observation corpus
//     in docs/research/fusion-observations/
//   - order side-effects and fixed composition caveats (both-cooldown pairs,
//     same-property pairs, Destroy × Destroy, hit-once dominance over
//     pass-through, spawn compensating Destroy, Dark's multiplier) are notes
//     (docs/research/fusion-ordering.md; fusion-pairs.json general_rules_notes)
//   - damage rolls are abstracted to "X" (fused numbers are not derivable)
// It is the site's editorial model of fusion, not game data.
import { BALLS, type Ball } from './data/balls';

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
 *  freeze comes from spawned icicles (icemage_999); Freeze Ray's freeze is
 *  bound to the beam path (Sun's AOE does not apply it — corpus). */
const SPAWN_BOUND_IDS = new Set(['blizzard', 'freeze-ray']);
/** Spawn carriers whose spawned balls do NOT inherit the partner's property
 *  (corpus): Voluptuous Egg Sac spawns Egg Sacs that spawn balls — the
 *  property drops at the second hop (Steam, playtest-confirmed by posters);
 *  Brood Mother's spawn channel does not carry the partner at all; Mosquito
 *  King's spawn-on-hit does not fire from the partner's screen hits. */
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

/** Order side-effects (docs/research/fusion-ordering.md): the only two
 *  functionally order-sensitive pair classes. Both are reported (Discord
 *  PSA #2 / namu.wiki), never playtested here — notes carry that caveat.
 *  The cooldown class is also the hit-once class (both from the game-file
 *  I2 effect-text dump: these are exactly the balls whose text lists a
 *  cooldown). */
const COOLDOWN_CLASS_IDS = new Set(['black-hole', 'bomb', 'dark', 'egg-sac', 'nuclear-bomb', 'timestop', 'voluptuous-egg-sac']);
/** Same-property pairs (PSA #2): both components implement the SAME exact
 *  property — the first-selected ball's variant wins. Known worked examples
 *  from the corpus: Mosquito Swarm × Mosquito King (spawn variant),
 *  Nuclear Bomb × Radiation Beam (radiation duration 15 s vs infinite),
 *  Noxious × Poison (max poison stacks differ by order). */
const SAME_PROPERTY_PAIRS = new Set(['mosquito-king+mosquito-swarm', 'nuclear-bomb+radiation-beam', 'noxious+poison']);

/** Fixed composition caveats from the corpus (general_rules_notes): reported
 *  interactions beyond naive text concatenation. */
const DESTROY_CLASS_IDS = new Set(['dark', 'egg-sac', 'time', 'armageddon', 'black-hole', 'bomb', 'fireworks', 'landslide', 'mosquito-swarm', 'nuclear-bomb', 'timestop', 'voluptuous-egg-sac']);
const HIT_ONCE_COOLDOWN_IDS = COOLDOWN_CLASS_IDS;
const PIERCE_IDS = new Set(['ghost', 'wind', 'assassin', 'drill', 'erosion', 'noxious', 'sniper', 'soul-sucker', 'wraith']);

function statusChannel(b: Ball): StatusChannel {
  if (!b.tags.includes('status-effect')) return null;
  if (SPAWN_BOUND_IDS.has(b.id)) return 'spawn';
  if (SPAWN_BOUND.test(b.effects)) return 'spawn';
  if (FIELD_AURA.test(b.effects)) return 'field';
  return 'hit';
}

/** AOE carriers with no damage rolls cannot carry a kill-on-hit effect.
 *  Timestop freezes but deals no damage; its pairs don't wire (corpus). */
const dealsDamage = (b: Ball) => /\b\d+(?:\.\d+)?(?:[–-]\d+(?:\.\d+)?)?(?:x|%)?(?= damage)|\bdeals?\b/i.test(b.effects);

/** Fused balls improve some of their components' numbers — the game recomputes
 *  stats at merge time. No formula fits all cases (thresholds shrink by 1,
 *  spawn counts gain +1 per bound, chances jump irregularly), so these are
 *  the *observed* per-ball overrides, transcribed from in-game fused tooltips
 *  (docs/research/fusion-observations/images.jsonl; Steam/reddit corroborate
 *  the Overgrowth threshold). Each entry is a [from, to] replacement applied
 *  to the component's effect text — exact-substring, so a wiki rewording
 *  fails loudly (the override stops applying) rather than corrupting text. */
const FUSED_STATS: Record<string, [string, string][]> = {
  // Overgrowth × Maggot / Overgrowth × Flash tooltips: threshold 3 → 2
  overgrowth: [
    ['Upon reaching 3, consume all stacks', 'Upon reaching 2, consume all stacks'],
  ],
  // Egg Sac X Poison / VES × Nuclear Bomb tooltips
  'egg-sac': [
    ['Explodes into 2–4 baby balls', 'Explodes into 3–5 baby balls'],
  ],
  // Overgrowth × Maggot tooltip
  maggot: [
    ['they explode into 1–2 baby balls', 'they explode into 2–3 baby balls'],
  ],
  // Voluptuous Egg Sac × Nuclear Bomb tooltip
  'voluptuous-egg-sac': [
    ['Explodes into 2–3 egg sacs', 'Explodes into 3–4 egg sacs'],
  ],
  // Spider Queen X Vampire Lord tooltip (both orders)
  'spider-queen': [
    ['Has a 25% chance of birthing', 'Has a 45% chance of birthing'],
  ],
  // Spider Queen X Vampire Lord tooltip: threshold 10 → 9
  'vampire-lord': [
    ['hitting an enemy with at least 10 stacks', 'hitting an enemy with at least 9 stacks'],
  ],
  // Satan × Reaper tooltip
  reaper: [
    ['Has a 10% chance to kill enemies on impact, healing you for 5 health.',
     'Has a 15% chance to kill enemies on impact, healing you for 7 health.'],
  ],
  // Egg Sac X Poison tooltip
  poison: [
    ['(max 5 stacks). Poison lasts for 6 seconds and each stack deals 1–4 damage per second',
     '(max 8 stacks). Poison lasts for 9 seconds and each stack deals X damage per second'],
  ],
  // Satan × Reaper tooltip
  satan: [
    ['(max 5 stacks), dealing 10–20 damage per stack per second',
     '(max 5 stacks), dealing X damage per stack per second'],
    ['makes them go berserk (15–24 damage to adjacent enemies every second)',
     'makes them go berserk (X damage to adjacent enemies every second)'],
  ],
  // Bleed X Freeze tooltip (partial — the freeze half was below the frame)
  bleed: [
    // narrow replacement: only the stacks change (the 1-damage-per-stack tick
    // is an unchanged mechanic constant, not a fused roll)
    ['Inflicts 2 stacks of bleed. Bleeding enemies receive 1 damage per stack when hit by a ball (max 8 stacks).',
     'Inflicts 4 stacks of bleed. Bleeding enemies receive 1 damage per stack when hit by a ball (max 14 stacks).'],
  ],
};

/** Apply the observed fused-stat overrides for one component. Replacements
 *  that do not match (wiki rewording) are skipped — the base text shows and
 *  the mismatch is visible in review, never silently corrupting. */
function applyFusedStats(ballId: string, text: string): string {
  for (const [from, to] of FUSED_STATS[ballId] ?? []) {
    if (text.includes(from)) text = text.replace(from, to);
  }
  return text;
}

const hasSpawn = (b: Ball) => b.tags.some((t) => t === 'spawns-baby-balls' || t === 'spawns-allies' || t === 'clone');
const spawnable = (b: Ball) => hasSpawn(b) && !SPAWN_EXCLUDED_IDS.has(b.id);
/** Unordered pair key ("a+b", sorted) — same-property lookup. */
const pairId = (a: Ball, b: Ball) => [a.id, b.id].sort().join('+');

/** Cross-wire line when one component's channel can carry the other's effect.
 *  Role-named like the game's tooltip ("Spawned balls from X … as Y"), not
 *  order-named. Conservative: only patterns with tooltip or corpus evidence —
 *  spawn-carrier × on-hit status, AOE-carrier × on-hit status, AOE-carrier ×
 *  kill-on-hit (Black Hole × Sun), and spawn-carrier × spawn-bound status
 *  (Glacier × Maggot: babies inherit the whole kit including its spikes). */
/** Set by crossWire() when the emitted kill cross-wire is corpus-disputed
 *  (both polarities reported; fuse() turns this into a caveat note). */
let killDisputed = false;

export function crossWire(a: Ball, b: Ball): string | null {
  killDisputed = false;
  const isKill = (b: Ball) => KILL_EFFECT_IDS.has(b.id);
  const isStatus = (b: Ball) => statusChannel(b) === 'hit';

  // spawn carrier + partner's on-hit status (tooltip: Overgrowth × Maggot)
  const [spawner, st] = spawnable(a) && isStatus(b) ? [a, b]
    : spawnable(b) && isStatus(a) ? [b, a] : [null, null];
  if (spawner && st) return `Spawned balls from ${spawner.name} have the same properties as ${st.name}.`;

  // AOE carrier + partner's on-hit status (tooltip: Overgrowth × Flash)
  const rank = (b: Ball) => (b.tags.includes('screen-clear') ? 2 : b.tags.includes('aoe') ? 1 : 0);
  const aoeCarrier = (b: Ball) => rank(b) > 0 && !AOE_EXCLUDED_IDS.has(b.id);
  const [carrier, st2] = aoeCarrier(a) && rank(a) > rank(b) && isStatus(b) ? [a, b]
    : aoeCarrier(b) && rank(b) > rank(a) && isStatus(a) ? [b, a] : [null, null];
  if (carrier && st2) return `Area-of-effect damage from ${carrier.name} inflicts the status effect of ${st2.name}.`;

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
    killDisputed = KILL_DISPUTED_PAIRS.has(pairId(a, b));
    return `Area-of-effect damage from ${kCarrier.name} triggers the instant kill of ${killer.name}.`;
  }

  // spawn carrier + partner's spawn-bound status (Glacier × Maggot — the
  // babies inherit the fused kit, spikes included; namu rule 6, corpus
  // glacier+maggot / cell+glacier / blizzard+spider-queen). spawnable()
  // filters the excluded carriers (VES, Brood Mother, Mosquito King), so
  // their broken hop yields null here.
  const spawnStatus = (b: Ball) => statusChannel(b) === 'spawn';
  const [sp2, sst] = spawnable(a) && spawnStatus(b) ? [a, b]
    : spawnable(b) && spawnStatus(a) ? [b, a] : [null, null];
  if (sp2 && sst) return `Spawned balls from ${sp2.name} have the same properties as ${sst.name}, including its spawned effects.`;
  return null;
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
  /** Component effect paragraphs, in name order, damage rolls abstracted. */
  paragraphs: [string, string];
  /** Cross-wire line, or null when no channel carries the partner's effect. */
  crossWire: string | null;
  /** Set when the pair Evolves instead of Fusing. */
  evolvesInstead: { id: string; name: string } | null;
  /** Display caveats — this composition is the site's model, not game data. */
  notes: string[];
}

/** Compose the fused ball for two distinct catalog balls. Returns null for
 *  the same ball twice (the game forbids self-fusion). */
export function fuse(a: Ball, b: Ball): FusionResult | null {
  if (a.id === b.id) return null;
  const evo = evolvesInstead(a, b);
  const notes = ['Composition is modeled from community-observed rules; verify against the game.'];

  // Order side-effects (fusion-ordering.md §3): both-cooldown pairs and
  // same-property pairs take the first-selected ball's variant/cooldown.
  const pairKey = pairId(a, b);
  if (COOLDOWN_CLASS_IDS.has(a.id) && COOLDOWN_CLASS_IDS.has(b.id)) {
    notes.push(`Both balls list a cooldown — the first-selected ball's cooldown wins (reported, untested here).`);
  }
  if (SAME_PROPERTY_PAIRS.has(pairKey)) {
    notes.push(`Same-property pair — the first-selected ball's variant of the shared property wins (reported, untested here).`);
  }

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

  const wire = crossWire(a, b);
  if (killDisputed) {
    notes.push('Corpus contradiction — reports disagree on whether the instant kill fires from the partner\'s hits here (see docs/research/fusion-observations/CONTRADICTIONS.md).');
  }

  return {
    name: fusionName(a, b),
    paragraphs: [applyFusedStats(a.id, a.effects), applyFusedStats(b.id, b.effects)].map(abstractDamage) as [string, string],
    crossWire: wire,
    evolvesInstead: evo ? { id: evo.id, name: evo.name } : null,
    notes,
  };
}
