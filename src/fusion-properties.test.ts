// Fusion property model tests — the order-mechanics decision (#7).
import { describe, it, expect } from 'vitest';
import {
  BALL_PROPERTIES,
  FUSION_EXCEPTIONS,
  exceptionsFor,
  pairKey,
  resolveProperties,
} from './fusion-properties';
import { ballMap } from './catalog';

const ball = (id: string) => ballMap.get(id)!;

describe('property table', () => {
  it('every key resolves to a catalog ball', () => {
    for (const id of Object.keys(BALL_PROPERTIES)) expect(ballMap.has(id), id).toBe(true);
  });

  it('every entry has unique scalar keys and known channels', () => {
    const channels = new Set(['on-hit', 'per-second', 'spawn', 'field']);
    for (const [id, props] of Object.entries(BALL_PROPERTIES)) {
      const keys = props.scalars.map((s) => s.key);
      expect(new Set(keys).size, `${id}: duplicate scalar key`).toBe(keys.length);
      for (const c of props.channels) expect(channels.has(c), `${id}: unknown channel ${c}`).toBe(true);
      for (const s of props.scalars) expect(s.value.length, `${id} ${s.key}: empty value`).toBeGreaterThan(0);
    }
  });

  it('the only reported (non-L3) value is the Nuke range', () => {
    const reported = Object.entries(BALL_PROPERTIES).flatMap(([id, p]) =>
      p.scalars.filter((s) => s.source === 'reported').map((s) => `${id}:${s.key}`),
    );
    expect(reported).toEqual(['nuclear-bomb:range']);
  });
});

describe('resolveProperties', () => {
  it('unions application channels', () => {
    const r = resolveProperties(ball('leech'), ball('sacrifice'));
    expect(r.channels).toEqual(expect.arrayContaining(['per-second', 'spawn', 'on-hit']));
  });

  it('unions scalars; different keys do not collide', () => {
    const r = resolveProperties(ball('poison'), ball('freeze'));
    expect(r.scalars.map((s) => s.key)).toEqual(['poison-max-stacks', 'freeze-duration']);
    expect(r.collisions).toEqual([]);
  });

  it('table-driven: shared scalar keys resolve to the first pick', () => {
    const cases = [
      { a: 'egg-sac', b: 'timestop', key: 'cooldown', winner: 'egg-sac', value: '3 second', loser: 'timestop', loserValue: '20 second' },
      { a: 'banished-flame', b: 'sun', key: 'burn-max-stacks', winner: 'banished-flame', value: 'max 8 stacks', loser: 'sun', loserValue: 'max 5 stacks' },
      { a: 'erosion', b: 'stone', key: 'bonus-damage', winner: 'erosion', value: '5%', loser: 'stone', loserValue: '400%' },
      { a: 'mosquito-swarm', b: 'mosquito-king', key: 'mosquito-spawn', winner: 'mosquito-swarm', value: '4–8 mosquitos', loser: 'mosquito-king', loserValue: 'a mosquito' },
      { a: 'radiation-beam', b: 'nuclear-bomb', key: 'radiation-duration', winner: 'radiation-beam', value: '15 seconds', loser: 'nuclear-bomb', loserValue: 'indefinitely' },
      { a: 'noxious', b: 'poison', key: 'poison-max-stacks', winner: 'noxious', value: '3 stacks', loser: 'poison', loserValue: 'max 8 stacks' },
      { a: 'leech', b: 'sacrifice', key: 'bleed-max-stacks', winner: 'leech', value: 'max 48 stacks', loser: 'sacrifice', loserValue: 'max 20 stacks' },
    ];
    for (const c of cases) {
      expect(resolveProperties(ball(c.a), ball(c.b)).collisions, `${c.a} × ${c.b}`).toContainEqual(
        expect.objectContaining({
          key: c.key, winner: c.winner, value: c.value, loser: c.loser, loserValue: c.loserValue,
        }),
      );
    }
  });

  it('a shared scalar key resolves to the first pick', () => {
    const ab = resolveProperties(ball('egg-sac'), ball('timestop'));
    expect(ab.collisions).toEqual([{
      key: 'cooldown',
      label: 'Cooldown',
      winner: 'egg-sac',
      winnerName: 'Egg Sac',
      value: '3 second',
      loser: 'timestop',
      loserName: 'Timestop',
      loserValue: '20 second',
      reported: false,
    }]);
    const ba = resolveProperties(ball('timestop'), ball('egg-sac'));
    expect(ba.collisions[0]).toMatchObject({
      winner: 'timestop', value: '20 second', loser: 'egg-sac', loserValue: '3 second',
    });
  });

  it('equal values are not a functional collision', () => {
    // Bomb and Dark both list a 3 second cooldown; Poison and Swamp both cap
    // poison at 8 stacks. Order cannot change the value.
    expect(resolveProperties(ball('bomb'), ball('dark')).collisions).toEqual([]);
    expect(resolveProperties(ball('poison'), ball('swamp')).collisions).toEqual([]);
  });

  it('marks collisions without direct tier 1–2 evidence as reported', () => {
    expect(resolveProperties(ball('egg-sac'), ball('timestop')).collisions[0].reported).toBe(false);
    expect(resolveProperties(ball('freeze-ray'), ball('blizzard')).collisions[0].reported).toBe(true);
    expect(resolveProperties(ball('noxious'), ball('brimstone')).collisions[0].reported).toBe(true);
  });

  it('unlisted balls have empty kits', () => {
    const r = resolveProperties(ball('flash'), ball('iron'));
    expect(r.channels).toEqual([]);
    expect(r.scalars).toEqual([]);
    expect(r.collisions).toEqual([]);
  });

  it('pairKey is order-insensitive', () => {
    expect(pairKey(ball('egg-sac'), ball('timestop'))).toBe('egg-sac+timestop');
    expect(pairKey(ball('timestop'), ball('egg-sac'))).toBe('egg-sac+timestop');
  });
});

describe('exception table (decision #7 anomalies)', () => {
  it('holds the four named anomalies, each with a source and confidence', () => {
    expect(FUSION_EXCEPTIONS.map((e) => e.pair).sort()).toEqual([
      'banshee+*', 'black-hole+sun', 'nuclear-bomb+wraith', 'time+*',
    ]);
    for (const e of FUSION_EXCEPTIONS) {
      expect(e.source.length).toBeGreaterThan(0);
      expect(['reported', 'unverified', 'contradicted']).toContain(e.confidence);
    }
  });

  it('marks only the reports that say the two orders differ as order-dependent', () => {
    const flags = Object.fromEntries(FUSION_EXCEPTIONS.map((e) => [e.pair, e.orderDependent]));
    expect(flags).toEqual({
      'nuclear-bomb+wraith': true, // "the two orders behave differently"
      'black-hole+sun': true, // "order-matters sources disagree on which order…"
      'time+*': true, // "the size follows the second pick"
      'banshee+*': false, // no order claim
    });
  });

  it('matches exact pairs in either order and ball-wide wildcards', () => {
    expect(exceptionsFor(ball('nuclear-bomb'), ball('wraith')).map((e) => e.pair)).toEqual(['nuclear-bomb+wraith']);
    expect(exceptionsFor(ball('wraith'), ball('nuclear-bomb')).map((e) => e.pair)).toEqual(['nuclear-bomb+wraith']);
    expect(exceptionsFor(ball('time'), ball('flash')).map((e) => e.pair)).toEqual(['time+*']);
    expect(exceptionsFor(ball('banshee'), ball('flash')).map((e) => e.pair)).toEqual(['banshee+*']);
    expect(exceptionsFor(ball('flash'), ball('glacier'))).toEqual([]);
  });
});
