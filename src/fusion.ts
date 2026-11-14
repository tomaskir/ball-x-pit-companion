// Fusion module: pure composition of a fused ball from its two components.
// The game has no fusion table — a fused ball is computed at runtime by
// stacking the two components' effects. This module mirrors that composer
// over the level-3 effect text (falling back to the catalog's level-1 text):
//   - name is "A × B" in selection order (site display; the English game name
//     is "A X B" and the separator is localized)
//   - effect paragraphs concatenate per component, in selection order
//   - a cross-wire line is emitted when one component's channel can carry the
//     other's effect. The branch priority and the class evidence live in
//     fusion-knowledge.ts (`wireFor(a, b) → Wire | null`); this module owns
//     only the line templates. crossWire() returns { line, disputed,
//     spawnerId }: disputed marks a corpus-contradicted kill wire (flicker ×
//     reaper); spawnerId names the carrier whose spawn channel produced the
//     line. Both feed the caveat rules in fusion-knowledge.ts
//   - order is property-set union with first-pick scalar precedence: the
//     resolver in fusion-properties.ts returns the union and the shared-key
//     collisions (first pick wins). The collisions and reported exceptions
//     are structured for the panel's "Fused result" / "Reported exceptions"
//     sections (#8), not duplicated as notes
//   - effect paragraphs use level-3 text (the fusion screen consumes L3
//     balls; decision #12) from the generated src/data/level-3.ts overlay,
//     falling back to the level-1 catalog text
//   - damage rolls are abstracted to "X" (fused numbers are not derivable)
// The classification evidence behind these rules (status channels,
// Destroy/cooldown/pierce/kill classes, spawn inheritance), the cross-wire
// branch priority, and the one reported-fact table (caveat prose plus
// reported exceptions) live in fusion-knowledge.ts; this module owns the
// composition algorithm, the cross-wire line templates, and names no pair.
// Canonical statement of the composition rules and order model:
// docs/research/fusion-mechanics.md §2-§3; evidence corpus:
// docs/research/fusion-observations/ (counts derive from fusion-pairs.json).
// It is the site's editorial model of fusion, not game data.
import { BALLS, type Ball } from './data/balls';
import { resolveProperties, type ResolvedProperties } from './fusion-properties';
import {
  componentText,
  factsFor,
  wireFor,
  type FusionException,
  type Wire,
} from './fusion-knowledge';

/** Balls offered by the fusion pick list: every ball except Baby Ball, which
 *  is not a fusable upgrade entity (research: docs/research/fusion-*.md).
 *  The single home of the fusable-ball rule — renderer and view-state both
 *  consume it. */
export function fusionBalls(): Ball[] {
  return BALLS.filter((b) => b.id !== 'baby-ball');
}

/** Fusable upgrade entities, indexed once — Baby Ball is not one. The one
 *  fusable-set definition, derived from `fusionBalls()` above so the rule
 *  and its membership test stay together. Consumers: the fusion pick list's
 *  resolution guard, the plan's fused-pair guard, and the selection box's
 *  "unfusable" label. */
const FUSABLE = new Set(fusionBalls().map((b) => b.id));
export const isFusable = (id: string): boolean => FUSABLE.has(id);

/** "A × B" — the site's display choice (the English game name is "A X B";
 *  the separator is localized), first-selected ball first. */
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

/** Cross-wire result: the emitted line (or null) plus whether the emitted kill
 *  cross-wire is corpus-disputed (both polarities reported; fuse() turns the
 *  bit into a caveat note). The disputed bit travels with the line instead of
 *  a module-level flag, so every caller gets both results from one call. */
export interface CrossWireResult {
  line: string | null;
  disputed: boolean;
  /** The spawn carrier whose spawn channel produced the line, or null when the
   *  line came from another channel (AOE / kill). fuse() uses it to attach the
   *  spawn-inheritance caveats. */
  spawnerId: string | null;
}

/** Render the wire the oracle found, or the no-wire result. Role-named like
 *  the game's tooltip ("Spawned balls from X … as Y"), not order-named. The
 *  five branches and their priority live in fusion-knowledge.ts. */
export function crossWire(a: Ball, b: Ball): CrossWireResult {
  const wire = wireFor(a, b);
  if (!wire) return { line: null, disputed: false, spawnerId: null };
  return { line: wireLine(wire), disputed: wire.disputed, spawnerId: wire.spawnerId };
}

/** The five cross-wire line templates. Which branch fires — and in what
 *  priority — is fusion-knowledge.ts's call; this module only renders it. */
function wireLine(wire: Wire): string {
  switch (wire.kind) {
    case 'spawn-carries-on-hit':
      return `Spawned balls from ${wire.carrier.name} have the same properties as ${wire.status.name}.`;
    case 'aoe-carries-on-hit':
      return `Area-of-effect damage from ${wire.carrier.name} inflicts the status effect of ${wire.status.name}.`;
    case 'field-carries-on-hit':
      return `The trail or field from ${wire.carrier.name} inflicts the status effect of ${wire.status.name}.`;
    case 'aoe-carries-kill':
      return `Area-of-effect damage from ${wire.carrier.name} triggers the instant kill of ${wire.status.name}.`;
    case 'spawn-carries-spawn-bound':
      return `Spawned balls from ${wire.carrier.name} have the same properties as ${wire.status.name}, including its spawned effects.`;
  }
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
  /** Component effect paragraphs (level-3 text), in selection order, damage
   *  rolls abstracted. */
  paragraphs: [string, string];
  /** Cross-wire line, or null when no channel carries the partner's effect. */
  crossWire: string | null;
  /** Set when the pair Evolves instead of Fusing. */
  evolvesInstead: { id: string; name: string } | null;
  /** Display caveats — this composition is the site's model, not game data. */
  notes: string[];
  /** Property-set union with first-pick scalar precedence (decision #7);
   *  `resolved.collisions` are the shared scalar keys whose values differ —
   *  the first pick wins. */
  resolved: ResolvedProperties;
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

  // Every reported caveat and exception comes from the evidence table in
  // fusion-knowledge.ts. The table's predicates read the pair and the
  // computed wire state; fuse() names no pair and no class.
  const wire = crossWire(a, b);
  const facts = factsFor(a, b, { spawnerId: wire.spawnerId, disputed: wire.disputed });
  notes.push(...facts.notes);

  return {
    name: fusionName(a, b),
    paragraphs: [componentText(a), componentText(b)].map(abstractDamage) as [string, string],
    crossWire: wire.line,
    evolvesInstead: evo ? { id: evo.id, name: evo.name } : null,
    notes,
    resolved,
    exceptions: facts.exceptions,
  };
}
