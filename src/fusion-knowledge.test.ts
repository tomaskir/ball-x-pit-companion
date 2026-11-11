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
  BASE_BALL_IDS,
  CHANNEL_OVERRIDES,
  COOLDOWN_CLASS_IDS,
  DESTROY_CLASS_IDS,
  KILL_DISPUTED_PAIRS,
  KILL_EFFECT_IDS,
  ON_DAMAGE_STATUS_IDS,
  PIERCE_IDS,
  SPAWN_BOUND_IDS,
  SPAWN_NO_INHERITANCE_IDS,
  SPAWN_STATUS_ONLY_IDS,
  aoeRank,
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
