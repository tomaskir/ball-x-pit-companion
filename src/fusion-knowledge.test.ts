// Fusion-knowledge invariants — the evidence tables behind the composer.
// The corpus's general_rules_notes are the fixture: every class a note
// describes is either encoded by a table/predicate here or explicitly listed
// as out of scope, so a new note forces a decision.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { BALLS } from './data/balls';
import { ballMap } from './catalog';
import {
  AOE_EXCLUDED_IDS,
  ASSASSIN_BACK_ARMOR_CAVEAT,
  BASE_BALL_IDS,
  BASE_BALL_POOL_CAVEAT,
  BROOD_MOTHER_FLASH_REPORT_FRAGMENT,
  BROOD_MOTHER_INHERITANCE_CAVEAT,
  BROOD_MOTHER_TRIGGER_CAVEAT,
  CHANNEL_OVERRIDES,
  COOLDOWN_CLASS_IDS,
  DARK_MULTIPLIER_CAVEAT,
  DESTROY_CLASS_IDS,
  DESTROY_PAIR_CAVEAT,
  DISPUTED_KILL_CAVEAT,
  EGG_SAC_INHERITANCE_CAVEAT,
  FREEZE_RAY_SUN_CAVEAT,
  FUSION_FACTS,
  HIT_ONCE_CAVEAT,
  KILL_DISPUTED_PAIRS,
  KILL_EFFECT_IDS,
  MOSQUITO_KING_TRIGGER_CAVEAT,
  ON_DAMAGE_STATUS_IDS,
  PIERCE_IDS,
  SPAWN_BOUND_IDS,
  SPAWN_COMPENSATES_DESTROY_CAVEAT,
  SPAWN_NO_INHERITANCE_IDS,
  SPAWN_STATUS_ONLY_IDS,
  WARP_PASS_THROUGH_CAVEAT,
  aoeRank,
  applyFacts,
  channelOverride,
  isAoeExcluded,
  isCooldownClass,
  isDamageRidingStatus,
  isDestroyClass,
  isDisputedKillPair,
  isKillEffect,
  isPierce,
  isSpawnBound,
  isStatusOnlySpawner,
  spawnable,
  statusChannel,
  type CaveatContext,
} from './fusion-knowledge';

const ball = (id: string) => ballMap.get(id)!;

const TABLES: Record<string, ReadonlySet<string>> = {
  DESTROY_CLASS_IDS,
  COOLDOWN_CLASS_IDS,
  PIERCE_IDS,
  KILL_EFFECT_IDS,
  SPAWN_BOUND_IDS,
  ON_DAMAGE_STATUS_IDS,
  SPAWN_NO_INHERITANCE_IDS,
  SPAWN_STATUS_ONLY_IDS,
  AOE_EXCLUDED_IDS,
  BASE_BALL_IDS,
};

describe('knowledge tables', () => {
  it('every id resolves in the ball catalog', () => {
    for (const [name, ids] of Object.entries(TABLES)) {
      for (const id of ids) expect(ballMap.has(id), `${name}: ${id}`).toBe(true);
    }
    for (const id of Object.keys(CHANNEL_OVERRIDES)) expect(ballMap.has(id), `CHANNEL_OVERRIDES: ${id}`).toBe(true);
    for (const key of KILL_DISPUTED_PAIRS) {
      for (const id of key.split('+')) expect(ballMap.has(id), `KILL_DISPUTED_PAIRS: ${id}`).toBe(true);
    }
  });

  it('tables are Sets (duplicates collapse at construction) and the spawn classes stay disjoint', () => {
    for (const [name, ids] of Object.entries(TABLES)) {
      // A duplicate id cannot survive a Set literal; asserting the container
      // type documents the invariant the exported tables rely on.
      expect(ids, `${name} must be a Set`).toBeInstanceOf(Set);
      expect([...ids], `${name} yielded duplicate ids`).toHaveLength(ids.size);
    }
    // A carrier cannot be both hard-excluded from inheritance and status-only.
    for (const id of SPAWN_NO_INHERITANCE_IDS) expect(SPAWN_STATUS_ONLY_IDS.has(id)).toBe(false);
  });

  it('BASE_BALL_IDS is exactly the depth-0 set', () => {
    const depthZero = BALLS.filter((b) => b.depth === 0).map((b) => b.id).sort();
    expect([...BASE_BALL_IDS].sort()).toEqual(depthZero);
    // The corpus note names these base balls explicitly.
    for (const id of ['wind', 'egg-sac', 'brood-mother', 'burn', 'cell']) expect(BASE_BALL_IDS.has(id)).toBe(true);
  });

  it('predicates match their tables for every catalog ball', () => {
    for (const b of BALLS) {
      expect(isDestroyClass(b)).toBe(DESTROY_CLASS_IDS.has(b.id));
      expect(isCooldownClass(b)).toBe(COOLDOWN_CLASS_IDS.has(b.id));
      expect(isPierce(b)).toBe(PIERCE_IDS.has(b.id));
      expect(isKillEffect(b)).toBe(KILL_EFFECT_IDS.has(b.id));
      expect(isStatusOnlySpawner(b)).toBe(SPAWN_STATUS_ONLY_IDS.has(b.id));
      expect(isAoeExcluded(b)).toBe(AOE_EXCLUDED_IDS.has(b.id));
      expect(isDamageRidingStatus(b)).toBe(ON_DAMAGE_STATUS_IDS.has(b.id));
      expect(channelOverride(b)).toBe(CHANNEL_OVERRIDES[b.id]);
    }
  });

  it('KILL_DISPUTED_PAIRS is unordered', () => {
    for (const key of KILL_DISPUTED_PAIRS) {
      const [x, y] = key.split('+');
      expect(isDisputedKillPair(ball(x), ball(y))).toBe(true);
      expect(isDisputedKillPair(ball(y), ball(x))).toBe(true);
    }
    expect(isDisputedKillPair(ball('flicker'), ball('reaper'))).toBe(true);
    expect(isDisputedKillPair(ball('reaper'), ball('flicker'))).toBe(true);
    expect(isDisputedKillPair(ball('flash'), ball('reaper'))).toBe(false);
  });
});

describe('classification predicates', () => {
  it('statusChannel applies the id exception, the override, then the text', () => {
    expect(statusChannel(ball('blizzard'))).toBe('spawn'); // SPAWN_BOUND_IDS
    expect(statusChannel(ball('glacier'))).toBe('spawn'); // text: spikes
    expect(statusChannel(ball('berserk'))).toBe('hit'); // override beats "every second"
    expect(statusChannel(ball('sun'))).toBe('field'); // field aura
    expect(statusChannel(ball('flash'))).toBe('hit');
    expect(statusChannel(ball('iron'))).toBeNull(); // not a status ball
  });

  it('isSpawnBound covers the id exception and the text heuristic', () => {
    expect(isSpawnBound(ball('blizzard'))).toBe(true); // SPAWN_BOUND_IDS
    expect(isSpawnBound(ball('glacier'))).toBe(true); // text: spikes
    expect(isSpawnBound(ball('flash'))).toBe(false);
    expect(isSpawnBound(ball('sun'))).toBe(false);
  });

  it('spawnable admits status-only carriers but not the two-hop exclusion', () => {
    expect(spawnable(ball('cell'))).toBe(true);
    expect(spawnable(ball('brood-mother'))).toBe(true);
    expect(spawnable(ball('voluptuous-egg-sac'))).toBe(false);
    expect(spawnable(ball('flash'))).toBe(false);
  });

  it('aoeRank orders screen-clear above aoe above none', () => {
    expect(aoeRank(ball('flash'))).toBe(2);
    expect(aoeRank(ball('glacier'))).toBe(1);
    expect(aoeRank(ball('iron'))).toBe(0);
  });
});

describe('reported-fact table (one home for caveats and exceptions)', () => {
  const ctx = (over: Partial<CaveatContext> = {}): CaveatContext =>
    ({ spawnerId: null, disputed: false, ...over });

  it('fact ids are unique and every exception carries source and confidence', () => {
    const ids = FUSION_FACTS.map((f) => f.id);
    expect(new Set(ids).size, 'duplicate fact id').toBe(ids.length);
    for (const f of FUSION_FACTS) {
      if (f.kind !== 'exception') continue;
      expect(f.exception.source.length, `${f.id}: empty source`).toBeGreaterThan(0);
      expect(['reported', 'unverified', 'contradicted']).toContain(f.exception.confidence);
    }
  });

  it('class caveats fire from predicates, not pair names', () => {
    // A base ball adds the pool note first (table order).
    expect(applyFacts(ball('dark'), ball('flash'), ctx()).notes)
      .toEqual([BASE_BALL_POOL_CAVEAT, DARK_MULTIPLIER_CAVEAT]);
    expect(applyFacts(ball('assassin'), ball('ghost'), ctx()).notes)
      .toEqual([BASE_BALL_POOL_CAVEAT, ASSASSIN_BACK_ARMOR_CAVEAT]);
    expect(applyFacts(ball('warp'), ball('ghost'), ctx()).notes)
      .toEqual([BASE_BALL_POOL_CAVEAT, WARP_PASS_THROUGH_CAVEAT]);
    expect(applyFacts(ball('bomb'), ball('dark'), ctx()).notes)
      .toEqual([BASE_BALL_POOL_CAVEAT, DARK_MULTIPLIER_CAVEAT, DESTROY_PAIR_CAVEAT]);
    expect(applyFacts(ball('black-hole'), ball('ghost'), ctx()).notes)
      .toEqual([BASE_BALL_POOL_CAVEAT, HIT_ONCE_CAVEAT]);
    expect(applyFacts(ball('bomb'), ball('cell'), ctx()).notes)
      .toEqual([BASE_BALL_POOL_CAVEAT, SPAWN_COMPENSATES_DESTROY_CAVEAT]);
  });

  it('the base-ball pool note is class-driven and order-independent', () => {
    expect(applyFacts(ball('wraith'), ball('burn'), ctx()).notes).toEqual([BASE_BALL_POOL_CAVEAT]);
    expect(applyFacts(ball('burn'), ball('wraith'), ctx()).notes).toEqual([BASE_BALL_POOL_CAVEAT]);
    // Egg Sac is also a cooldown ball and Wraith is pass-through: table order
    // puts the pool note first, the hit-once caveat second.
    expect(applyFacts(ball('wraith'), ball('egg-sac'), ctx()).notes)
      .toEqual([BASE_BALL_POOL_CAVEAT, HIT_ONCE_CAVEAT]);
    expect(applyFacts(ball('flash'), ball('glacier'), ctx()).notes).toEqual([]);
  });

  it('the Freeze Ray × Sun direction is a table row', () => {
    expect(applyFacts(ball('freeze-ray'), ball('sun'), ctx()).notes).toEqual([FREEZE_RAY_SUN_CAVEAT]);
    expect(applyFacts(ball('sun'), ball('freeze-ray'), ctx()).notes).toEqual([FREEZE_RAY_SUN_CAVEAT]);
  });

  it('spawn-inheritance caveats read the wire context', () => {
    expect(applyFacts(ball('brood-mother'), ball('flash'), ctx({ spawnerId: 'brood-mother' })).notes)
      .toEqual([BASE_BALL_POOL_CAVEAT, BROOD_MOTHER_INHERITANCE_CAVEAT, `${BROOD_MOTHER_TRIGGER_CAVEAT}.`]);
    // No inheritance wire: the trigger caveat carries the Flash sentence.
    expect(applyFacts(ball('brood-mother'), ball('sun'), ctx()).notes)
      .toEqual([BASE_BALL_POOL_CAVEAT, `${BROOD_MOTHER_TRIGGER_CAVEAT}; ${BROOD_MOTHER_FLASH_REPORT_FRAGMENT}`]);
    expect(applyFacts(ball('egg-sac'), ball('glacier'), ctx({ spawnerId: 'egg-sac' })).notes)
      .toEqual([BASE_BALL_POOL_CAVEAT, EGG_SAC_INHERITANCE_CAVEAT]);
    expect(applyFacts(ball('mosquito-king'), ball('glacier'), ctx()).notes)
      .toEqual([MOSQUITO_KING_TRIGGER_CAVEAT]);
  });

  it('the disputed kill note reads the wire context', () => {
    expect(applyFacts(ball('flicker'), ball('reaper'), ctx({ disputed: true })).notes)
      .toEqual([DISPUTED_KILL_CAVEAT]);
    expect(applyFacts(ball('flicker'), ball('reaper'), ctx()).notes).toEqual([]);
  });

  it('exceptions come from the same table and keep their matching rules', () => {
    expect(applyFacts(ball('nuclear-bomb'), ball('wraith'), ctx()).exceptions.map((e) => e.pair))
      .toEqual(['nuclear-bomb+wraith']);
    expect(applyFacts(ball('wraith'), ball('nuclear-bomb'), ctx()).exceptions.map((e) => e.pair))
      .toEqual(['nuclear-bomb+wraith']);
    expect(applyFacts(ball('time'), ball('flash'), ctx()).exceptions.map((e) => e.pair)).toEqual(['time+*']);
    expect(applyFacts(ball('banshee'), ball('flash'), ctx()).exceptions.map((e) => e.pair)).toEqual(['banshee+*']);
    expect(applyFacts(ball('flash'), ball('glacier'), ctx()).exceptions).toEqual([]);
  });

  it('marks only the reports that say the two orders differ as order-dependent', () => {
    const exceptions = FUSION_FACTS.filter((f) => f.kind === 'exception').map((f) => f.exception);
    expect(exceptions.map((e) => e.pair).sort()).toEqual(['banshee+*', 'nuclear-bomb+wraith', 'time+*']);
    expect(Object.fromEntries(exceptions.map((e) => [e.pair, e.orderDependent]))).toEqual({
      'nuclear-bomb+wraith': true, // "the two orders behave differently"
      'time+*': true, // "the size follows the second pick"
      'banshee+*': false, // no order claim
    });
  });
});

describe('corpus general_rules_notes coverage', () => {
  const corpus = JSON.parse(
    readFileSync(new URL('../docs/research/fusion-observations/fusion-pairs.json', import.meta.url), 'utf8'),
  ) as { general_rules_notes: Record<string, unknown> };

  /** Notes whose class a knowledge table or predicate encodes. Each check
   *  names the ids the note calls out, so a table that drifted would fail. */
  const ENCODED_CLASSES: Record<string, () => boolean> = {
    // "If one component is a BASE ball (Wind, Egg Sac, Brood Mother, Burn,
    // Cell, etc.)…"
    'base-ball-pool-recursion': () =>
      ['wind', 'egg-sac', 'brood-mother', 'burn', 'cell'].every((id) => BASE_BALL_IDS.has(id)),
    // "the composer's PIERCE_IDS follows the fact base plus Sandstorm."
    'pass-through-catalog': () =>
      ['ghost', 'wind', 'drill', 'erosion', 'noxious', 'sandstorm', 'sniper', 'soul-sucker', 'wraith', 'assassin']
        .every((id) => PIERCE_IDS.has(id)),
    // "When two self-destruct balls are fused, one of their explosion/
    // self-destruct effects may be lost."
    'destroy-pair-may-lose-one-effect': () => isDestroyClass(ball('bomb')) && isDestroyClass(ball('dark')),
    // "Cell(Clone) x Bomb(Destroy) is an indestructible bomb…"
    'spawn-compensates-destroy': () => isDestroyClass(ball('bomb')) && spawnable(ball('cell')),
  };

  /** Notes about the corpus's limits or the order model, not a ball class. */
  const NOT_CLASS_NOTES = new Set([
    'same-property-first-wins', // order model: fusion-properties.ts
    'cooldown-first-wins', // order model: fusion-properties.ts scalar precedence
    'fused-orbs-not-evolution-components',
    'evolution-components-not-always-retained',
    'game-file-negatives',
    'no-order-semantics-in-game-files',
    'pair-space-arithmetic-unverified',
    'damage-cap-9999',
  ]);

  it('every note is either represented by a table or explicitly out of scope', () => {
    for (const key of Object.keys(corpus.general_rules_notes)) {
      expect(ENCODED_CLASSES[key] ?? NOT_CLASS_NOTES.has(key), `unclassified corpus note: ${key}`).toBeTruthy();
    }
  });

  it('the encoded classes are present in the corpus and backed by the named ids', () => {
    for (const [key, represented] of Object.entries(ENCODED_CLASSES)) {
      expect(corpus.general_rules_notes[key], `${key} missing from corpus`).toBeDefined();
      expect(represented(), `${key} not represented by knowledge`).toBe(true);
    }
  });
});
