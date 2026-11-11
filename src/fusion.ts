// Fusion module: pure composition of a fused ball from its two components.
// The game has no fusion table — a fused ball is computed at runtime by
// stacking the two components' effects (see docs/research/fusion-mechanics.md).
// This module mirrors that composer over the level-3 effect text (falling back
// to the catalog's level-1 text):
//   - name is "A × B" in selection order (site display; the English game name
//     is "A X B" and the separator is localized)
//   - effect paragraphs concatenate per component, in selection order
//   - a cross-wire line is emitted when one component's channel can carry the
//     other's effect: spawn/AOE carrier + on-hit status, AOE carrier + kill-
//     on-hit (Black Hole × Sun), spawn carrier + spawn-bound status (Glacier
//     × Maggot) — per the community composition rules (namu's 7 rules; the
//     status-vs-spawn split) validated against the observation corpus in
//     docs/research/fusion-observations/ (counts derive from
//     fusion-pairs.json). Spawn inheritance is split (issue #20): Voluptuous
//     Egg Sac is a hard exclusion (two-hop drop); Brood Mother and Mosquito
//     King are status-only carriers (on-hit statuses wire, spawn-bound traits
//     do not), with reported degradation/trigger caveats emitted by fuse().
//     crossWire() returns { line, disputed, spawnerId }: disputed marks a
//     corpus-contradicted kill wire (flicker × reaper), which fuse() turns
//     into a caveat note; spawnerId names the carrier whose spawn channel
//     produced the line, so fuse() can attach the inheritance caveats.
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
// The classification evidence behind these rules (status channels,
// Destroy/cooldown/pierce/kill classes, spawn inheritance, caveat prose) lives
// in fusion-knowledge.ts; this module owns only the composition algorithm.
// It is the site's editorial model of fusion, not game data.
import { BALLS, type Ball } from './data/balls';
import {
  exceptionsFor,
  resolveProperties,
  type FusionException,
  type ResolvedProperties,
} from './fusion-properties';
import {
  BASE_BALL_IDS,
  BROOD_MOTHER_FLASH_REPORT_FRAGMENT,
  BROOD_MOTHER_INHERITANCE_CAVEAT,
  BROOD_MOTHER_TRIGGER_CAVEAT,
  EGG_SAC_INHERITANCE_CAVEAT,
  MOSQUITO_KING_TRIGGER_CAVEAT,
  aoeRank,
  componentText,
  dealsDamage,
  isAoeExcluded,
  isCooldownClass,
  isDamageRidingStatus,
  isDestroyClass,
  isDisputedKillPair,
  isKillEffect,
  isPierce,
  isStatusOnlySpawner,
  spawnable,
  statusChannel,
} from './fusion-knowledge';
import { pairKey } from './pair';

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

/** Spawn-inheritance caveats for a composed pair (issue #20). Inheritance
 *  degradation is wire-only: it qualifies a line the panel actually shows.
 *  The trigger limit is a property of the carrier + AOE partner, wire or not. */
function spawnInheritanceCaveats(a: Ball, b: Ball, wire: CrossWireResult): string[] {
  const notes: string[] = [];
  if (wire.spawnerId === 'brood-mother') notes.push(BROOD_MOTHER_INHERITANCE_CAVEAT);
  if (wire.spawnerId === 'egg-sac') notes.push(EGG_SAC_INHERITANCE_CAVEAT);
  const partnerOf = (id: string) => (a.id === id ? b : b.id === id ? a : null);
  const broodPartner = partnerOf('brood-mother');
  const mosquitoPartner = partnerOf('mosquito-king');
  if (broodPartner && aoeRank(broodPartner) > 0) {
    // Both caveats fire for Brood Mother × Flash; the inheritance caveat
    // already carries the Flash sentence, so the trigger caveat drops it.
    notes.push(wire.spawnerId === 'brood-mother'
      ? `${BROOD_MOTHER_TRIGGER_CAVEAT}.`
      : `${BROOD_MOTHER_TRIGGER_CAVEAT}; ${BROOD_MOTHER_FLASH_REPORT_FRAGMENT}`);
  }
  if (mosquitoPartner && aoeRank(mosquitoPartner) > 0) notes.push(MOSQUITO_KING_TRIGGER_CAVEAT);
  return notes;
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

  // Pool recursion (CONTRADICTIONS.md §2): not a fusion effect, but the
  // first-selected base ball is consumed from the level-up/fusion pool.
  if (BASE_BALL_IDS.has(a.id) || BASE_BALL_IDS.has(b.id)) {
    notes.push(`Pool note — the first-selected base ball is consumed and does not reappear in the level-up/fusion pool this run (reported).`);
  }

  // Fixed composition caveats (corpus general rules; commutative, not order).
  if (a.id === 'dark' || b.id === 'dark') {
    notes.push(`Dark's damage multiplier carries into the fusion — Dark is prized as fusion material for exactly this (reported).`);
  }
  if (isDestroyClass(a) && isDestroyClass(b)) {
    notes.push('Both balls self-destruct — fusing two Destroy-class balls may lose one of the two effects (reported).');
  }
  if ((isCooldownClass(a) && isPierce(b)) || (isCooldownClass(b) && isPierce(a))) {
    notes.push(`Hit-once + cooldown is dominant: the fused ball keeps it and loses the partner's pass-through (reported).`);
  }
  if ((isDestroyClass(a) && spawnable(b)) || (isDestroyClass(b) && spawnable(a))) {
    notes.push('Spawn can compensate Destroy — spawned clones/babies keep the fused ball alive (reported; Cell × Bomb is the known example).');
  }
  // Fixed trait priorities (commutative — not order effects).
  if ((a.id === 'assassin' && isPierce(b)) || (b.id === 'assassin' && isPierce(a))) {
    notes.push(`Assassin's back-armor rule wins over the partner's pass-through — the fused ball cannot pierce the back (reported; commutative, not an order effect).`);
  }
  if ((a.id === 'warp' && isPierce(b)) || (b.id === 'warp' && isPierce(a))) {
    notes.push(`Warp is cast before the partner's pass-through (reported; commutative, not an order effect).`);
  }

  // Freeze Ray × Sun: the corpus resolves the direction — the beam applies
  // Sun's burn, not the reverse (the AOE branch correctly emits no wire).
  if (pairKey(a.id, b.id) === 'freeze-ray+sun') {
    notes.push(`Reported direction — Freeze Ray's beam applies Sun's burn; Sun's field aura does not apply Freeze Ray's freeze.`);
  }

  const wire = crossWire(a, b);
  notes.push(...spawnInheritanceCaveats(a, b, wire));

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
    exceptions,
  };
}
