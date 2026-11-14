// Fusion-knowledge invariants — the evidence behind the composer, tested at
// the questions callers ask: how a ball applies its effects, whether one
// component's channel carries the other's, and which reported facts a pair
// triggers. The corpus's general_rules_notes are the fixture: every class a
// note describes is either encoded behind this interface or explicitly listed
// as out of scope, so a new note forces a decision.
import { describe, it, expect } from 'vitest';
import { BALLS } from './data/balls';
import { ballMap } from './catalog';
import { BALL_KIT } from './ball-kit';
import * as knowledge from './fusion-knowledge';
import {
  FUSION_FACTS,
  channelsOf,
  factsFor,
  statusChannel,
  wireFor,
  type Channel,
  type StatusChannel,
} from './fusion-knowledge';
import { loadCorpus } from './corpus';
import { caveatContext as ctx, noteOf } from './test-support/facts';

const ball = (id: string) => ballMap.get(id)!;

describe('one application-channel classification per ball', () => {
  // Golden classification: a future level-3 text edit must not silently
  // reclassify a ball. Balls absent from this map are expected to have no
  // application channel (the stat balls and the unmodeled catalog).
  const GOLDEN_GROUPS: Record<string, readonly string[]> = {
    'on-hit': [
      'banished-flame', 'berserk', 'bleed', 'black-hole', 'bomb', 'burn',
      'charm', 'dark', 'elemental', 'flash', 'freeze', 'freeze-ray',
      'frozen-flame', 'heart-swallower', 'hedgehog', 'hemorrhage', 'incubus',
      'ivy', 'laser-beam', 'light', 'lovestruck', 'maggot', 'misfortune',
      'mudslide', 'noxious', 'nuclear-bomb', 'overgrowth', 'phantom', 'poison',
      'radiation-beam', 'sacrifice', 'sandstorm', 'siren',
      'soul-sucker', 'succubus', 'tumor', 'vampire-lord', 'venom', 'virus',
      'wind', 'wraith', 'x-ray', 'zombie',
    ],
    'spawn': [
      'blizzard', 'egg-sac', 'fireworks', 'glacier', 'lightning-rod', 'magma',
      'mosquito-king', 'mosquito-kingdom', 'mosquito-swarm', 'swamp', 'time',
      'time-bomb', 'voluptuous-egg-sac',
    ],
    'field': ['ash', 'banshee', 'petrify', 'timestop'],
    'per-second+field': ['brimstone', 'inferno', 'satan', 'sun'],
    'per-second+spawn': ['leech'],
  };
  const GOLDEN: Record<string, readonly Channel[]> = {};
  for (const [spec, ids] of Object.entries(GOLDEN_GROUPS)) {
    for (const id of ids) GOLDEN[id] = spec.split('+') as Channel[];
  }

  it('pins the classification of every catalog ball (golden)', () => {
    for (const b of BALLS) expect(channelsOf(b), b.id).toEqual(GOLDEN[b.id] ?? []);
  });

  it('every classification uses the channel vocabulary once', () => {
    const vocabulary = new Set<Channel>(['on-hit', 'per-second', 'spawn', 'field']);
    for (const b of BALLS) {
      const channels = channelsOf(b);
      expect(new Set(channels).size, `${b.id}: duplicate channel`).toBe(channels.length);
      for (const c of channels) expect(vocabulary.has(c), `${b.id}: unknown channel ${c}`).toBe(true);
    }
  });

  it('explicit evidence wins over the text heuristic (Timestop is a field effect)', () => {
    expect(channelsOf(ball('timestop'))).toEqual(['field']);
    expect(statusChannel(ball('timestop'))).toBe('field');
  });

  it('reads the kit table first and falls back to the text heuristic', () => {
    for (const [id, kit] of Object.entries(BALL_KIT)) {
      expect(channelsOf(ball(id)), `${id}: kit channels`).toEqual(kit.channels);
    }
    // Flash has no recorded kit; its on-hit channel comes from the text
    // heuristic, and the wire model still sees it.
    expect(BALL_KIT['flash']).toBeUndefined();
    expect(channelsOf(ball('flash'))).toEqual(['on-hit']);
  });

  it('a non-status ball can have application channels but no wire channel', () => {
    expect(channelsOf(ball('dark'))).toEqual(['on-hit']);
    expect(statusChannel(ball('dark'))).toBeNull();
    expect(channelsOf(ball('egg-sac'))).toEqual(['spawn']);
    expect(statusChannel(ball('egg-sac'))).toBeNull();
  });

  it('statusChannel is the wire projection of channelsOf for every status ball', () => {
    const collapse = (channels: readonly Channel[]): StatusChannel =>
      channels.includes('spawn') ? 'spawn'
        : channels.includes('field') || channels.includes('per-second') ? 'field'
          : channels.includes('on-hit') ? 'hit' : null;
    for (const b of BALLS) {
      const expected = b.tags.includes('status-effect') ? collapse(channelsOf(b)) : null;
      expect(statusChannel(b), b.id).toBe(expected);
    }
  });

  it('classifies the representative balls the wire model depends on', () => {
    expect(statusChannel(ball('blizzard'))).toBe('spawn'); // explicit evidence
    expect(statusChannel(ball('glacier'))).toBe('spawn'); // text: spikes
    expect(statusChannel(ball('berserk'))).toBe('hit'); // override beats "every second"
    expect(statusChannel(ball('sun'))).toBe('field'); // per-second + field
    expect(statusChannel(ball('flash'))).toBe('hit');
    expect(statusChannel(ball('timestop'))).toBe('field'); // evidence beats the hit default
    expect(statusChannel(ball('iron'))).toBeNull(); // not a status ball
  });
});

describe('module surface', () => {
  it('keeps the capability predicates private behind wireFor', () => {
    // Production only crosses the oracle; a public predicate could pass its
    // own test while the oracle's rank/branch layering is wrong.
    for (const name of ['canCarry', 'canInheritSpawn', 'canCarryKill']) {
      expect(knowledge).not.toHaveProperty(name);
    }
  });
});

describe('wireFor (the cross-wire oracle)', () => {
  it('spawn carrier + on-hit status: the spawned balls inherit the status (Overgrowth × Maggot)', () => {
    const w = wireFor(ball('overgrowth'), ball('maggot'))!;
    expect(w.kind).toBe('spawn-carries-on-hit');
    expect(w.carrier.id).toBe('maggot');
    expect(w.status.id).toBe('overgrowth');
    expect(w.spawnerId).toBe('maggot');
    expect(w.disputed).toBe(false);
  });

  it('AOE carrier + on-hit status: the AOE hits apply the status (Overgrowth × Flash)', () => {
    const w = wireFor(ball('flash'), ball('overgrowth'))!;
    expect(w.kind).toBe('aoe-carries-on-hit');
    expect(w.carrier.id).toBe('flash');
    expect(w.status.id).toBe('overgrowth');
    expect(w.spawnerId).toBeNull();
  });

  it('AOE carrier + kill-on-hit: the AOE triggers the kill (Black Hole × Sun)', () => {
    for (const w of [wireFor(ball('black-hole'), ball('sun')), wireFor(ball('sun'), ball('black-hole'))]) {
      expect(w!.kind).toBe('aoe-carries-kill');
      expect(w!.carrier.id).toBe('sun');
      expect(w!.status.id).toBe('black-hole');
      expect(w!.disputed).toBe(false);
      expect(w!.spawnerId).toBeNull();
    }
  });

  it('a corpus-disputed kill pair keeps the wire and flags disputed (Flicker × Reaper)', () => {
    const w = wireFor(ball('flicker'), ball('reaper'))!;
    expect(w.kind).toBe('aoe-carries-kill');
    expect(w.disputed).toBe(true);
  });

  it('spawn carrier + spawn-bound status: the babies inherit the spawned effects (Cell × Glacier)', () => {
    const w = wireFor(ball('cell'), ball('glacier'))!;
    expect(w.kind).toBe('spawn-carries-spawn-bound');
    expect(w.carrier.id).toBe('cell');
    expect(w.status.id).toBe('glacier');
    expect(w.spawnerId).toBe('cell');
  });

  it('no wire when neither channel carries (Flash × Glacier, status × status)', () => {
    expect(wireFor(ball('flash'), ball('glacier'))).toBeNull();
    expect(wireFor(ball('freeze'), ball('poison'))).toBeNull();
  });

  it('the spawn branch outranks the AOE branch (Maggot × Flash wires as a spawn carrier)', () => {
    // Both branches could fire: Maggot is a spawn carrier and Flash is an AOE
    // carrier. Branch priority makes the spawn carrier win.
    const w = wireFor(ball('maggot'), ball('flash'))!;
    expect(w.kind).toBe('spawn-carries-on-hit');
    expect(w.carrier.id).toBe('maggot');
  });

  it('the AOE branch outranks the spawn-bound branch (Glacier × Maggot)', () => {
    // Glacier is an AOE carrier and Maggot is an on-hit status ball, so the
    // AOE branch fires before the spawn-bound branch can consider Maggot.
    const w = wireFor(ball('glacier'), ball('maggot'))!;
    expect(w.kind).toBe('aoe-carries-on-hit');
    expect(w.carrier.id).toBe('glacier');
  });

  it('the AOE on-hit branch outranks the kill branch (Black Hole × Overgrowth)', () => {
    // Both branches could fire: Black Hole is a kill-on-hit ball and an AOE
    // carrier, and Overgrowth is an on-hit status. Branch order makes the
    // on-hit wire win.
    const w = wireFor(ball('black-hole'), ball('overgrowth'))!;
    expect(w.kind).toBe('aoe-carries-on-hit');
    expect(w.carrier.id).toBe('black-hole');
    expect(w.status.id).toBe('overgrowth');
  });

  it('is unordered: reversing the picks yields the same wire', () => {
    for (const [a, b] of [
      ['overgrowth', 'maggot'],
      ['flash', 'overgrowth'],
      ['black-hole', 'sun'],
      ['flicker', 'reaper'],
      ['cell', 'glacier'],
    ]) {
      const ab = wireFor(ball(a), ball(b));
      const ba = wireFor(ball(b), ball(a));
      expect(ab!.kind, `${a}+${b}`).toBe(ba!.kind);
      expect(ab!.carrier.id, `${a}+${b}`).toBe(ba!.carrier.id);
      expect(ab!.status.id, `${a}+${b}`).toBe(ba!.status.id);
      expect(ab!.disputed, `${a}+${b}`).toBe(ba!.disputed);
      expect(ab!.spawnerId, `${a}+${b}`).toBe(ba!.spawnerId);
    }
  });

  it('corpus exclusions stay unwired', () => {
    // VES's two-hop spawn chain drops the property.
    expect(wireFor(ball('hemorrhage'), ball('voluptuous-egg-sac'))).toBeNull();
    expect(wireFor(ball('nuclear-bomb'), ball('voluptuous-egg-sac'))).toBeNull();
    // Sun's field aura does not apply Freeze Ray's freeze.
    expect(wireFor(ball('freeze-ray'), ball('sun'))).toBeNull();
    // A field-aura carrier cannot trigger an on-hit status (Sun × Poison).
    expect(wireFor(ball('sun'), ball('poison'))).toBeNull();
    // Status-only carriers do not inherit spawn-bound traits.
    expect(wireFor(ball('brood-mother'), ball('glacier'))).toBeNull();
    expect(wireFor(ball('mosquito-king'), ball('glacier'))).toBeNull();
    // Timestop is a field effect, not an on-hit status carrier.
    expect(wireFor(ball('bleed'), ball('timestop'))).toBeNull();
    expect(wireFor(ball('cell'), ball('timestop'))).toBeNull();
    // Blizzard's freeze stays icicle-bound.
    expect(wireFor(ball('blizzard'), ball('flash'))).toBeNull();
  });

  it('positive controls keep wiring', () => {
    expect(wireFor(ball('flash'), ball('freeze-ray'))).not.toBeNull();
    expect(wireFor(ball('flash'), ball('berserk'))).not.toBeNull();
    expect(wireFor(ball('brood-mother'), ball('flash'))).not.toBeNull();
    expect(wireFor(ball('mosquito-king'), ball('virus'))).not.toBeNull();
    expect(wireFor(ball('blizzard'), ball('spider-queen'))).not.toBeNull();
    expect(wireFor(ball('black-hole'), ball('flash'))).not.toBeNull();
    expect(wireFor(ball('reaper'), ball('flash'))).not.toBeNull();
    expect(wireFor(ball('armageddon'), ball('reaper'))).not.toBeNull();
    expect(wireFor(ball('black-hole'), ball('satan'))).not.toBeNull();
  });

  it('the kill branch requires a real damage-dealing AOE carrier', () => {
    expect(wireFor(ball('iron'), ball('reaper'))).toBeNull();
    expect(wireFor(ball('timestop'), ball('reaper'))).toBeNull();
    expect(wireFor(ball('reaper'), ball('satan'))).toBeNull();
    expect(wireFor(ball('timestop'), ball('black-hole'))).toBeNull();
    expect(wireFor(ball('iron'), ball('black-hole'))).toBeNull();
    // A kill ball cannot carry another kill ball's effect (kill × kill).
    expect(wireFor(ball('black-hole'), ball('reaper'))).toBeNull();
    // Satan's debuff-only judgment still carries Black Hole's kill (corpus).
    const satan = wireFor(ball('satan'), ball('black-hole'))!;
    expect(satan.kind).toBe('aoe-carries-kill');
    expect(satan.carrier.id).toBe('satan');
    expect(satan.status.id).toBe('black-hole');
  });

  it('the AOE on-hit branch carries only damage-riding statuses through a field aura', () => {
    // Sun's field aura carries the corpus-evidenced damage-riding statuses…
    expect(wireFor(ball('sun'), ball('overgrowth'))!.kind).toBe('aoe-carries-on-hit');
    // …but not a status bound to the hit event (Freeze Ray × Sun).
    expect(wireFor(ball('sun'), ball('poison'))).toBeNull();
    // Satan is excluded as a status carrier; Iron is not AOE.
    expect(wireFor(ball('satan'), ball('hemorrhage'))).toBeNull();
    expect(wireFor(ball('iron'), ball('poison'))).toBeNull();
  });

  it('the spawn branches exclude VES and skip spawn-bound traits for status-only carriers', () => {
    expect(wireFor(ball('overgrowth'), ball('voluptuous-egg-sac'))).toBeNull();
    // A partner with no status, or a field aura, has nothing to inherit.
    expect(wireFor(ball('cell'), ball('iron'))).toBeNull();
    expect(wireFor(ball('cell'), ball('sun'))).toBeNull();
    expect(wireFor(ball('brood-mother'), ball('flash'))!.kind).toBe('spawn-carries-on-hit');
    expect(wireFor(ball('brood-mother'), ball('glacier'))).toBeNull();
  });

  it('rank gating: an AOE carrier must outrank the status ball it carries', () => {
    // Equal-rank AOE carriers do not carry each other (Overgrowth ×
    // Radiation Beam): the rank check is strict.
    expect(wireFor(ball('overgrowth'), ball('radiation-beam'))).toBeNull();
    // The higher-ranked carrier wins the direction (Flash > Overgrowth).
    expect(wireFor(ball('overgrowth'), ball('flash'))!.carrier.id).toBe('flash');
    // The kill branch has no rank comparison: both balls are screen-clear.
    expect(wireFor(ball('black-hole'), ball('sun'))!.kind).toBe('aoe-carries-kill');
  });
});

describe('reported-fact table (one home for caveats and exceptions)', () => {
  it('fact ids are unique and every exception carries source and confidence', () => {
    const ids = FUSION_FACTS.map((f) => f.id);
    expect(new Set(ids).size, 'duplicate fact id').toBe(ids.length);
    for (const f of FUSION_FACTS) {
      if (f.kind !== 'exception') continue;
      expect(f.exception.source.length, `${f.id}: empty source`).toBeGreaterThan(0);
      expect(['reported', 'unverified', 'contradicted']).toContain(f.exception.confidence);
    }
  });

  it('every exception pair id resolves in the ball catalog', () => {
    for (const f of FUSION_FACTS) {
      if (f.kind !== 'exception') continue;
      for (const id of f.exception.pair.split('+')) {
        if (id === '*') continue;
        expect(ballMap.has(id), `${f.id}: ${id}`).toBe(true);
      }
    }
  });

  it('every depth-0 ball triggers the base-ball pool note (and only those)', () => {
    const partner = ball('virus'); // depth 1, never a base ball
    for (const b of BALLS) {
      const notes = factsFor(b, partner, ctx()).notes;
      expect(notes.includes(noteOf('base-ball-pool-recursion', b.id, 'virus')), b.id)
        .toBe(b.depth === 0);
    }
  });

  it('class caveats fire from predicates, not pair names', () => {
    // A base ball adds the pool note first (table order).
    expect(factsFor(ball('dark'), ball('flash'), ctx()).notes)
      .toEqual([noteOf('base-ball-pool-recursion', 'dark', 'flash'), noteOf('dark-multiplier', 'dark', 'flash')]);
    expect(factsFor(ball('assassin'), ball('ghost'), ctx()).notes)
      .toEqual([noteOf('base-ball-pool-recursion', 'assassin', 'ghost'), noteOf('assassin-back-armor-wins', 'assassin', 'ghost')]);
    expect(factsFor(ball('warp'), ball('ghost'), ctx()).notes)
      .toEqual([noteOf('base-ball-pool-recursion', 'warp', 'ghost'), noteOf('warp-cast-before-pass-through', 'warp', 'ghost')]);
    expect(factsFor(ball('bomb'), ball('dark'), ctx()).notes)
      .toEqual([
        noteOf('base-ball-pool-recursion', 'bomb', 'dark'),
        noteOf('dark-multiplier', 'bomb', 'dark'),
        noteOf('destroy-pair-may-lose-one-effect', 'bomb', 'dark'),
      ]);
    expect(factsFor(ball('black-hole'), ball('ghost'), ctx()).notes)
      .toEqual([noteOf('base-ball-pool-recursion', 'black-hole', 'ghost'), noteOf('hit-once-dominates-pass-through', 'black-hole', 'ghost')]);
    expect(factsFor(ball('bomb'), ball('cell'), ctx()).notes)
      .toEqual([noteOf('base-ball-pool-recursion', 'bomb', 'cell'), noteOf('spawn-compensates-destroy', 'bomb', 'cell')]);
  });

  it('the base-ball pool note is class-driven and order-independent', () => {
    expect(factsFor(ball('wraith'), ball('burn'), ctx()).notes)
      .toEqual([noteOf('base-ball-pool-recursion', 'wraith', 'burn')]);
    expect(factsFor(ball('burn'), ball('wraith'), ctx()).notes)
      .toEqual([noteOf('base-ball-pool-recursion', 'burn', 'wraith')]);
    // Egg Sac is also a cooldown ball and Wraith is pass-through: table order
    // puts the pool note first, the hit-once caveat second.
    expect(factsFor(ball('wraith'), ball('egg-sac'), ctx()).notes)
      .toEqual([noteOf('base-ball-pool-recursion', 'wraith', 'egg-sac'), noteOf('hit-once-dominates-pass-through', 'wraith', 'egg-sac')]);
    expect(factsFor(ball('flash'), ball('glacier'), ctx()).notes).toEqual([]);
  });

  it('the Freeze Ray × Sun direction is a table row', () => {
    expect(factsFor(ball('freeze-ray'), ball('sun'), ctx()).notes)
      .toEqual([noteOf('freeze-ray-sun-direction', 'freeze-ray', 'sun')]);
    expect(factsFor(ball('sun'), ball('freeze-ray'), ctx()).notes)
      .toEqual([noteOf('freeze-ray-sun-direction', 'sun', 'freeze-ray')]);
  });

  it('spawn-inheritance caveats read the wire context', () => {
    expect(factsFor(ball('brood-mother'), ball('flash'), ctx({ spawnerId: 'brood-mother' })).notes)
      .toEqual([
        noteOf('base-ball-pool-recursion', 'brood-mother', 'flash'),
        noteOf('brood-mother-inheritance', 'brood-mother', 'flash', ctx({ spawnerId: 'brood-mother' })),
        noteOf('brood-mother-trigger-limit', 'brood-mother', 'flash', ctx({ spawnerId: 'brood-mother' })),
      ]);
    // No inheritance wire: the trigger caveat carries the Flash sentence.
    expect(factsFor(ball('brood-mother'), ball('sun'), ctx()).notes)
      .toEqual([
        noteOf('base-ball-pool-recursion', 'brood-mother', 'sun'),
        noteOf('brood-mother-trigger-limit', 'brood-mother', 'sun'),
      ]);
    expect(factsFor(ball('egg-sac'), ball('glacier'), ctx({ spawnerId: 'egg-sac' })).notes)
      .toEqual([
        noteOf('base-ball-pool-recursion', 'egg-sac', 'glacier'),
        noteOf('egg-sac-inheritance', 'egg-sac', 'glacier', ctx({ spawnerId: 'egg-sac' })),
      ]);
    expect(factsFor(ball('mosquito-king'), ball('glacier'), ctx()).notes)
      .toEqual([noteOf('mosquito-king-trigger-limit', 'mosquito-king', 'glacier')]);
  });

  it('the disputed kill note reads the wire context', () => {
    expect(factsFor(ball('flicker'), ball('reaper'), ctx({ disputed: true })).notes)
      .toEqual([noteOf('disputed-kill-wire', 'flicker', 'reaper', ctx({ disputed: true }))]);
    expect(factsFor(ball('flicker'), ball('reaper'), ctx()).notes).toEqual([]);
  });

  it('exceptions come from the same table and keep their matching rules', () => {
    expect(factsFor(ball('nuclear-bomb'), ball('wraith'), ctx()).exceptions.map((e) => e.pair))
      .toEqual(['nuclear-bomb+wraith']);
    expect(factsFor(ball('wraith'), ball('nuclear-bomb'), ctx()).exceptions.map((e) => e.pair))
      .toEqual(['nuclear-bomb+wraith']);
    expect(factsFor(ball('time'), ball('flash'), ctx()).exceptions.map((e) => e.pair)).toEqual(['time+*']);
    expect(factsFor(ball('banshee'), ball('flash'), ctx()).exceptions.map((e) => e.pair)).toEqual(['banshee+*']);
    expect(factsFor(ball('flash'), ball('glacier'), ctx()).exceptions).toEqual([]);
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
  const notes = loadCorpus().generalRules();

  /** Notes whose class a knowledge table, fact row, or wire branch encodes.
   *  Each check exercises the public behavior the note calls out, so a table
   *  that drifted would fail. */
  const FACT_IDS = new Set(FUSION_FACTS.map((f) => f.id));
  const ENCODED_CLASSES: Record<string, () => boolean> = {
    // "If one component is a BASE ball (Wind, Egg Sac, Brood Mother, Burn,
    // Cell, etc.)…"
    'base-ball-pool-recursion': () =>
      FACT_IDS.has('base-ball-pool-recursion') &&
      ['wind', 'egg-sac', 'brood-mother', 'burn', 'cell'].every((id) =>
        factsFor(ball(id), ball('flash'), ctx()).notes
          .includes(noteOf('base-ball-pool-recursion', id, 'flash'))),
    // "the composer's PIERCE_IDS follows the fact base plus Sandstorm."
    'pass-through-catalog': () =>
      ['ghost', 'wind', 'drill', 'erosion', 'noxious', 'sandstorm', 'sniper', 'soul-sucker', 'wraith', 'assassin']
        .every((id) => factsFor(ball('black-hole'), ball(id), ctx()).notes
          .includes(noteOf('hit-once-dominates-pass-through', 'black-hole', id))),
    // "When two self-destruct balls are fused, one of their explosion/
    // self-destruct effects may be lost."
    'destroy-pair-may-lose-one-effect': () =>
      FACT_IDS.has('destroy-pair-may-lose-one-effect') &&
      factsFor(ball('bomb'), ball('dark'), ctx()).notes
        .includes(noteOf('destroy-pair-may-lose-one-effect', 'bomb', 'dark')),
    // "Cell(Clone) x Bomb(Destroy) is an indestructible bomb…"
    'spawn-compensates-destroy': () =>
      FACT_IDS.has('spawn-compensates-destroy') &&
      factsFor(ball('bomb'), ball('cell'), ctx()).notes
        .includes(noteOf('spawn-compensates-destroy', 'bomb', 'cell')),
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
    for (const key of Object.keys(notes)) {
      expect(ENCODED_CLASSES[key] ?? NOT_CLASS_NOTES.has(key), `unclassified corpus note: ${key}`).toBeTruthy();
    }
  });

  it('the encoded classes are present in the corpus and backed by the named ids', () => {
    for (const [key, represented] of Object.entries(ENCODED_CLASSES)) {
      expect(notes[key], `${key} missing from corpus`).toBeDefined();
      expect(represented(), `${key} not represented by knowledge`).toBe(true);
    }
  });
});
