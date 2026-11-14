// Fusion property model tests — the order-mechanics decision (#7).
import { describe, it, expect } from 'vitest';
import { resolveProperties } from './fusion-properties';
import { BALL_KIT } from './ball-kit';
import { channelsOf } from './fusion-knowledge';
import { ballMap } from './catalog';

const ball = (id: string) => ballMap.get(id)!;

describe('ball kit table', () => {
  it('every entry has unique scalar keys', () => {
    for (const [id, kit] of Object.entries(BALL_KIT)) {
      const keys = kit.scalars.map((s) => s.key);
      expect(new Set(keys).size, `${id}: duplicate scalar key`).toBe(keys.length);
      for (const s of kit.scalars) expect(s.value.length, `${id} ${s.key}: empty value`).toBeGreaterThan(0);
    }
  });

  it('carries channels in the same entry, including explicit none for the stat balls', () => {
    for (const [id, kit] of Object.entries(BALL_KIT)) {
      expect(Array.isArray(kit.channels), `${id}: channels must be an array`).toBe(true);
      expect(new Set(kit.channels).size, `${id}: duplicate channel`).toBe(kit.channels.length);
    }
    // An empty array is an explicit "no application channel", not a missing
    // entry: the bonus-damage stat swaps carry no effect.
    for (const id of ['erosion', 'stone', 'drill', 'assassin', 'steel']) {
      expect(BALL_KIT[id].channels, `${id}: stat ball has no application channel`).toEqual([]);
    }
  });

  it('pins every reported (non-L3) value', () => {
    const reported = Object.entries(BALL_KIT).flatMap(([id, kit]) =>
      kit.scalars.filter((s) => s.source === 'reported').map((s) => `${id}:${s.key}`),
    );
    // Values the L3 text does not state. Everything else is verbatim and
    // enforced by data.test.ts.
    expect(reported.sort()).toEqual([
      'ash:range',
      'black-hole:damage-multiplier',
      'elemental:slow-duration',
      'elemental:slow-pct',
      'ironwood:range',
      'ivy:range',
      'kaiju:range',
      'kaiju:self-speed-reduction',
      'mudslide:slow-pct',
      'nuclear-bomb:range',
      'thunderbird:range',
      'tsunami:range',
      'water-bug:birth-chance',
      'water:range',
      'wind:damage-multiplier',
      'wood:range',
    ].sort());
  });

  it('records a kit for all 24 Risen Ballbylon balls', () => {
    const dlcBalls = [
      'ash', 'beast', 'bullet', 'force', 'fruit', 'gale', 'hedgehog', 'ironwood',
      'ivy', 'kaiju', 'misfortune', 'mudslide', 'rot', 'siren', 'stalagmite',
      'steam', 'thunderbird', 'tsunami', 'water', 'water-bug', 'waterfall',
      'werewolf', 'wolfpack', 'wood',
    ];
    for (const id of dlcBalls) {
      expect(BALL_KIT[id], `${id}: missing kit`).toBeDefined();
      expect(typeof BALL_KIT[id].aoe, `${id}: explicit aoe flag`).toBe('boolean');
    }
    // Spot-check the S3 contract rows.
    expect(BALL_KIT['ash']).toMatchObject({ aoe: false, channels: ['field'] });
    expect(BALL_KIT['ash'].scalars.map((s) => [s.key, s.value])).toEqual([
      ['burn-max-stacks', 'max 4 stacks'],
      ['burn-duration', '8 seconds'],
      ['burn-per-stack-damage', '4–7'],
      ['emission-length', '5.0 seconds'],
      ['steam-lifetime', '6.0 seconds'],
      ['range', '2'],
    ]);
    expect(BALL_KIT['misfortune']).toMatchObject({ aoe: true, channels: ['on-hit'] });
    expect(BALL_KIT['misfortune'].scalars.map((s) => [s.key, s.value])).toEqual([
      ['damage-multiplier', '6.0x'],
      ['cooldown', '4 second'],
      ['curse-damage', '20–40'],
      ['curse-delay', '5'],
    ]);
    expect(BALL_KIT['wolfpack'].channels).toEqual(['spawn', 'per-second']);
    expect(BALL_KIT['mudslide'].scalars.map((s) => s.key)).not.toContain('slow-duration');
  });
});

describe('resolveProperties', () => {
  it('unions application channels', () => {
    const r = resolveProperties(ball('leech'), ball('sacrifice'));
    expect(r.channels).toEqual(['per-second', 'spawn', 'on-hit']);
  });

  it('channels come from the recorded kits, scoped to kit balls', () => {
    // Flash has a classifier channel (on-hit) but no recorded kit, so the
    // order model contributes no channels for it; the wire model still sees
    // its channel through channelsOf.
    expect(channelsOf(ball('flash'))).toEqual(['on-hit']);
    expect(resolveProperties(ball('flash'), ball('iron')).channels).toEqual([]);
    // A kit ball's channels are its kit's channels.
    expect(resolveProperties(ball('leech'), ball('sacrifice')).channels)
      .toEqual([...new Set([...BALL_KIT['leech'].channels, ...BALL_KIT['sacrifice'].channels])]);
  });

  it('unions scalars; different keys do not collide', () => {
    const r = resolveProperties(ball('poison'), ball('freeze'));
    expect(r.scalars.map((s) => s.key)).toEqual(['poison-max-stacks', 'poison-per-stack-damage', 'freeze-duration']);
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
    // Bomb and Dark both list a 3 second cooldown; Sniper and Shotgun both
    // spawn 5–9 baby balls. Order cannot change the value.
    expect(resolveProperties(ball('bomb'), ball('dark')).collisions).toEqual([]);
    expect(resolveProperties(ball('sniper'), ball('shotgun')).collisions).toEqual([]);
  });

  it('marks collisions without direct tier 1–2 evidence as reported', () => {
    expect(resolveProperties(ball('egg-sac'), ball('timestop')).collisions[0].reported).toBe(false);
    expect(resolveProperties(ball('freeze-ray'), ball('blizzard')).collisions[0].reported).toBe(true);
    expect(resolveProperties(ball('noxious'), ball('brimstone')).collisions[0].reported).toBe(true);
  });

  it('unlisted balls have empty kits', () => {
    const r = resolveProperties(ball('flash'), ball('ghost'));
    expect(r.channels).toEqual([]);
    expect(r.scalars).toEqual([]);
    expect(r.collisions).toEqual([]);
  });
});
