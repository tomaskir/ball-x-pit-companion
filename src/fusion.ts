// Fusion module: pure composition of a fused ball from its two components.
// The game has no fusion table — a fused ball is computed at runtime by
// stacking the two components' effects (see docs/research/fusion-completeness.md).
// This module mirrors that composer over the catalog's effect text:
//   - name is "A × B" in selection order (function is order-independent)
//   - effect paragraphs concatenate per component, in name order
//   - a cross-wire line is emitted when one component's channel can carry the
//     other's effect (spawn/AOE carrier + on-hit status), per the community
//     composition rules (namu's 7 rules; the status-vs-spawn split — see
//     docs/research/fusion-observations/ and the playtest notes)
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
 *  like Hemorrhage's %-damage. */
const AOE_EXCLUDED_IDS = new Set(['satan']);

function statusChannel(b: Ball): StatusChannel {
  if (!b.tags.includes('status-effect')) return null;
  if (SPAWN_BOUND_IDS.has(b.id)) return 'spawn';
  if (SPAWN_BOUND.test(b.effects)) return 'spawn';
  if (FIELD_AURA.test(b.effects)) return 'field';
  return 'hit';
}

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
const isAoeCarrier = (b: Ball) => b.tags.includes('screen-clear') || b.tags.includes('aoe');

/** Cross-wire line when one component's channel can carry the other's effect.
 *  Role-named like the game's tooltip ("Spawned balls from X … as Y"), not
 *  order-named. Conservative: only patterns with tooltip evidence —
 *  spawn-carrier × on-hit status, and AOE-carrier × on-hit status. */
export function crossWire(a: Ball, b: Ball): string | null {
  // spawn carrier + partner's on-hit status (tooltip: Overgrowth × Maggot)
  const spawnable = (b: Ball) => hasSpawn(b) && !SPAWN_EXCLUDED_IDS.has(b.id);
  const [spawner, st] = spawnable(a) && statusChannel(b) === 'hit' ? [a, b]
    : spawnable(b) && statusChannel(a) === 'hit' ? [b, a] : [null, null];
  if (spawner && st) return `Spawned balls from ${spawner.name} have the same properties as ${st.name}.`;

  // AOE carrier + partner's on-hit status (tooltip: Overgrowth × Flash)
  const rank = (b: Ball) => (b.tags.includes('screen-clear') ? 2 : b.tags.includes('aoe') ? 1 : 0);
  const aoeCarrier = (b: Ball) => rank(b) > 0 && !AOE_EXCLUDED_IDS.has(b.id);
  const [carrier, st2] = aoeCarrier(a) && rank(a) > rank(b) && statusChannel(b) === 'hit' ? [a, b]
    : aoeCarrier(b) && rank(b) > rank(a) && statusChannel(a) === 'hit' ? [b, a] : [null, null];
  if (carrier && st2) return `Area-of-effect damage from ${carrier.name} inflicts the status effect of ${st2.name}.`;
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
  return {
    name: fusionName(a, b),
    paragraphs: [applyFusedStats(a.id, a.effects), applyFusedStats(b.id, b.effects)].map(abstractDamage) as [string, string],
    crossWire: crossWire(a, b),
    evolvesInstead: evo ? { id: evo.id, name: evo.name } : null,
    notes: [
      'Composition is modeled from community-observed rules; verify against the game.',
    ],
  };
}
