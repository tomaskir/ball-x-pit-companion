// Fusion module: pure composition of a fused ball from its two components.
// The game has no fusion table — a fused ball is computed at runtime by
// stacking the two components' effects. This module mirrors that composer
// over the level-3 effect text (falling back to the catalog's level-1 text):
//   - name is "A × B" in selection order (site display; the English game name
//     is "A X B" and the separator is localized)
//   - effect paragraphs concatenate per component, in selection order
//   - a cross-wire line is emitted when one component's channel can carry the
//     other's effect; crossWire() returns { line, disputed, spawnerId }:
//     disputed marks a corpus-contradicted kill wire (flicker × reaper);
//     spawnerId names the carrier whose spawn channel produced the line. Both
//     feed the caveat rules in fusion-knowledge.ts
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
// Destroy/cooldown/pierce/kill classes, spawn inheritance) and the one
// reported-fact table (caveat prose plus reported exceptions) live in
// fusion-knowledge.ts; this module owns only the composition algorithm and
// names no pair.
// Canonical statement of the composition rules and order model:
// docs/research/fusion-mechanics.md §2-§3; evidence corpus:
// docs/research/fusion-observations/ (counts derive from fusion-pairs.json).
// It is the site's editorial model of fusion, not game data.
import { BALLS, type Ball } from './data/balls';
import { resolveProperties, type ResolvedProperties } from './fusion-properties';
import {
  aoeRank,
  applyFacts,
  componentText,
  dealsDamage,
  isAoeExcluded,
  isDamageRidingStatus,
  isDisputedKillPair,
  isKillEffect,
  isStatusOnlySpawner,
  spawnable,
  statusChannel,
  type FusionException,
} from './fusion-knowledge';

/** Balls offered by the fusion pick list: every ball except Baby Ball, which
 *  is not a fusable upgrade entity (research: docs/research/fusion-*.md).
 *  The single home of the fusable-ball rule — renderer and view-state both
 *  consume it. */
export function fusionBalls(): Ball[] {
  return BALLS.filter((b) => b.id !== 'baby-ball');
}

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
  /** The spawn carrier whose spawn channel produced the line, or null when the
   *  line came from another channel (AOE / kill). fuse() uses it to attach the
   *  spawn-inheritance caveats. */
  spawnerId: string | null;
}

export function crossWire(a: Ball, b: Ball): CrossWireResult {
  const NO_WIRE: CrossWireResult = { line: null, disputed: false, spawnerId: null };
  const isStatus = (b: Ball) => statusChannel(b) === 'hit';

  // spawn carrier + partner's on-hit status (tooltip: Overgrowth × Maggot).
  // Status-only carriers (Brood Mother, Mosquito King) wire here; their
  // reported inheritance is degraded/probabilistic (fuse() caveats it).
  const [spawner, st] = spawnable(a) && isStatus(b) ? [a, b]
    : spawnable(b) && isStatus(a) ? [b, a] : [null, null];
  if (spawner && st) return { line: `Spawned balls from ${spawner.name} have the same properties as ${st.name}.`, disputed: false, spawnerId: spawner.id };

  // AOE carrier + partner's on-hit status (tooltip: Overgrowth × Flash)
  const aoeCarrier = (b: Ball) => aoeRank(b) > 0 && !isAoeExcluded(b);
  /** An on-timer/field-aura carrier cannot trigger a status applied on the
   *  hit event (trigger matrix: AOE = On-Hit NO / On-Damage YES / On-Timer
   *  NO). It can carry the corpus-evidenced damage-riding statuses; Freeze
   *  Ray × Sun is the evidenced negative (the beam carries Sun's burn
   *  instead). */
  const canCarryStatus = (carrier: Ball, st: Ball) =>
    !(statusChannel(carrier) === 'field' && statusChannel(st) === 'hit' && !isDamageRidingStatus(st));
  const [carrier, st2] = aoeCarrier(a) && aoeRank(a) > aoeRank(b) && isStatus(b) && canCarryStatus(a, b) ? [a, b]
    : aoeCarrier(b) && aoeRank(b) > aoeRank(a) && isStatus(a) && canCarryStatus(b, a) ? [b, a] : [null, null];
  if (carrier && st2) return { line: `Area-of-effect damage from ${carrier.name} inflicts the status effect of ${st2.name}.`, disputed: false, spawnerId: null };

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
  const [kCarrier, killer] = isKillEffect(b) && !isKillEffect(a) && killCarrierOk(a, b) ? [a, b]
    : isKillEffect(a) && !isKillEffect(b) && killCarrierOk(b, a) ? [b, a] : [null, null];
  if (kCarrier && killer) {
    return {
      line: `Area-of-effect damage from ${kCarrier.name} triggers the instant kill of ${killer.name}.`,
      disputed: isDisputedKillPair(a, b),
      spawnerId: null,
    };
  }

  // spawn carrier + partner's spawn-bound status (Glacier × Maggot — the
  // babies inherit the fused kit, spikes included; namu rule 6, corpus
  // glacier+maggot / cell+glacier / blizzard+spider-queen). Status-only
  // carriers (Brood Mother, Mosquito King) inherit on-hit statuses but not
  // spawn-bound traits, so they are filtered here (issue #20).
  const spawnStatus = (b: Ball) => statusChannel(b) === 'spawn';
  const spawnBoundCarrier = (b: Ball) => spawnable(b) && !isStatusOnlySpawner(b);
  const [sp2, sst] = spawnBoundCarrier(a) && spawnStatus(b) ? [a, b]
    : spawnBoundCarrier(b) && spawnStatus(a) ? [b, a] : [null, null];
  if (sp2 && sst) return { line: `Spawned balls from ${sp2.name} have the same properties as ${sst.name}, including its spawned effects.`, disputed: false, spawnerId: sp2.id };
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
  const facts = applyFacts(a, b, { spawnerId: wire.spawnerId, disputed: wire.disputed });
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
