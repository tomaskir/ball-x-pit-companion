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
/** Community-evidenced exception: Blizzard's freeze comes from spawned
 *  icicles (icemage_999), not the ball — the wiki text does not say so. */
const SPAWN_BOUND_IDS = new Set(['blizzard']);

function statusChannel(b: Ball): StatusChannel {
  if (!b.tags.includes('status-effect')) return null;
  if (SPAWN_BOUND_IDS.has(b.id)) return 'spawn';
  if (SPAWN_BOUND.test(b.effects)) return 'spawn';
  if (FIELD_AURA.test(b.effects)) return 'field';
  return 'hit';
}

const hasSpawn = (b: Ball) => b.tags.some((t) => t === 'spawns-baby-balls' || t === 'spawns-allies' || t === 'clone');
const isAoeCarrier = (b: Ball) => b.tags.includes('screen-clear') || b.tags.includes('aoe');

/** Cross-wire line when one component's channel can carry the other's effect.
 *  Role-named like the game's tooltip ("Spawned balls from X … as Y"), not
 *  order-named. Conservative: only patterns with tooltip evidence —
 *  spawn-carrier × on-hit status, and AOE-carrier × on-hit status. */
export function crossWire(a: Ball, b: Ball): string | null {
  // spawn carrier + partner's on-hit status (tooltip: Overgrowth × Maggot)
  const [spawner, st] = hasSpawn(a) && statusChannel(b) === 'hit' ? [a, b]
    : hasSpawn(b) && statusChannel(a) === 'hit' ? [b, a] : [null, null];
  if (spawner && st) return `Spawned balls from ${spawner.name} have the same properties as ${st.name}.`;

  // AOE carrier + partner's on-hit status (tooltip: Overgrowth × Flash)
  const rank = (b: Ball) => (b.tags.includes('screen-clear') ? 2 : b.tags.includes('aoe') ? 1 : 0);
  const [carrier, st2] = rank(a) > rank(b) && statusChannel(b) === 'hit' ? [a, b]
    : rank(b) > rank(a) && statusChannel(a) === 'hit' ? [b, a] : [null, null];
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
    paragraphs: [abstractDamage(a.effects), abstractDamage(b.effects)],
    crossWire: crossWire(a, b),
    evolvesInstead: evo ? { id: evo.id, name: evo.name } : null,
    notes: [
      'Fused damage rolls are shown as X — the game’s fused numbers are not derivable from public sources.',
      'Composition is modeled from community-observed rules; verify against the game.',
    ],
  };
}
