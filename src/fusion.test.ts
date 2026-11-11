// Fusion composer tests — the editorial fusion model (see fusion.ts header).
import { describe, it, expect } from 'vitest';
import { fusionName, abstractDamage, crossWire, evolvesInstead, fuse } from './fusion';
import { ballMap } from './catalog';
import {
  expectBerserkIsOnHitStatus,
  expectBlackHoleSunOrderIndependent,
  expectEqualValuesAreNotCollisions,
  expectFirstPickCooldownWins,
  expectFreezeRayFlashWires,
  expectFreezeRaySunFieldAuraDoesNotWire,
  expectKillEffectsRideAoeCarriers,
  expectLevel3OvergrowthThresholdApplies,
  expectOrderResolutionPropertyUnion,
  expectSandstormIsPassThrough,
  expectSatanDebuffOnlyCannotCarryOnHitStatuses,
  expectSpawnBoundTraitsStayUnwired,
  expectSpawnCarriersCarrySpawnBoundStatuses,
  expectStatusOnlyCarrierCaveats,
  expectStatusOnlyCarriersWireOnHitStatuses,
  expectVesTwoHopSpawnChainDropsProperty,
} from './test-support/pins';

const ball = (id: string) => ballMap.get(id)!;

describe('fusionName', () => {
  it('is "A × B" with the first-selected ball first (site display; English game name is "A X B")', () => {
    expect(fusionName(ball('flash'), ball('glacier'))).toBe('Flash × Glacier');
    expect(fusionName(ball('glacier'), ball('flash'))).toBe('Glacier × Flash');
  });
});

describe('abstractDamage', () => {
  it('abstracts damage rolls to X damage', () => {
    expect(abstractDamage('Damages all enemies on screen for 1–3 damage after hitting an enemy.'))
      .toBe('Damages all enemies on screen for X damage after hitting an enemy.');
    expect(abstractDamage('Explodes, dealing 150–300 damage to nearby enemies.'))
      .toBe('Explodes, dealing X damage to nearby enemies.');
    expect(abstractDamage('Deals 3.0x damage but destroys itself after hitting an enemy.'))
      .toBe('Deals X damage but destroys itself after hitting an enemy.');
    expect(abstractDamage('Initially deals 300% damage.'))
      .toBe('Initially deals X damage.');
  });

  it('abstracts bare rolls after deals/dealt/dealing', () => {
    expect(abstractDamage('Cursed enemies are dealt 150–300 after being hit 6 times.'))
      .toBe('Cursed enemies are dealt X after being hit 6 times.');
    expect(abstractDamage('Petrifies all enemies within its sightline for 1.5 seconds, dealing 50–120.'))
      .toBe('Petrifies all enemies within its sightline for 1.5 seconds, dealing X.');
  });

  it('keeps durations, stacks, cooldowns, percentages and health', () => {
    const t = abstractDamage(
      'Inflicts 3 stacks of bleed. When hitting an enemy with 12+ stacks of bleed, consumes all stacks to deal 20% of their current health.'
    );
    expect(t).toContain('3 stacks');
    expect(t).toContain('12+ stacks');
    expect(t).toContain('20% of their current health');
    expect(abstractDamage('Has a 3 second cooldown before it can be shot again.'))
      .toBe('Has a 3 second cooldown before it can be shot again.');
    expect(abstractDamage('Blinds enemies on hit for 2 seconds.')).toContain('2 seconds');
    expect(abstractDamage('Heals 1 health.')).toBe('Heals 1 health.');
  });
});

describe('crossWire', () => {
  it('spawn + status: spawned balls get the status (Overgrowth × Maggot)', () => {
    expect(crossWire(ball('overgrowth'), ball('maggot'))).toEqual({
      line: 'Spawned balls from Maggot have the same properties as Overgrowth.',
      disputed: false,
      spawnerId: 'maggot',
    });
  });

  it('AOE + status: the AOE hits apply the status (Overgrowth × Flash)', () => {
    expect(crossWire(ball('flash'), ball('overgrowth'))).toEqual({
      line: 'Area-of-effect damage from Flash inflicts the status effect of Overgrowth.',
      disputed: false,
      spawnerId: null,
    });
  });

  it('no cross-wire when neither channel carries (Flash × Glacier)', () => {
    // Glacier's freeze lives on spawned spikes, not a status on the ball;
    // Flash carries no status and Glacier is not a status ball.
    expect(crossWire(ball('flash'), ball('glacier'))).toEqual({ line: null, disputed: false, spawnerId: null });
  });

  it('status × status: no cross-wire line', () => {
    expect(crossWire(ball('freeze'), ball('poison'))).toEqual({ line: null, disputed: false, spawnerId: null });
  });

  it('corpus-disputed kill pair keeps the wire line and flags disputed (flicker × reaper)', () => {
    // CONTRADICTIONS.md §10e: both polarities reported — fuse() turns this
    // into a caveat note; the wire line itself stays.
    expect(crossWire(ball('flicker'), ball('reaper'))).toEqual({
      line: 'Area-of-effect damage from Flicker triggers the instant kill of Reaper.',
      disputed: true,
      spawnerId: null,
    });
  });

  it('undisputed kill pair reports disputed: false (Black Hole × Sun)', () => {
    const r = crossWire(ball('black-hole'), ball('sun'));
    expect(r.line).toContain('instant kill of Black Hole');
    expect(r.disputed).toBe(false);
  });
});

describe('evolvesInstead', () => {
  it('flags 2-component evolution recipes (Bleed + Poison → Virus)', () => {
    expect(evolvesInstead(ball('bleed'), ball('poison'))?.name).toBe('Virus');
    expect(evolvesInstead(ball('poison'), ball('bleed'))?.name).toBe('Virus');
  });

  it('flags alternate 2-component recipes (Vampire + Dark → Vampire Lord)', () => {
    expect(evolvesInstead(ball('vampire'), ball('dark'))?.name).toBe('Vampire Lord');
  });

  it('does not block 3-component recipes (Nosferatu)', () => {
    // Nosferatu needs vampire-lord + spider-queen + mosquito-king; any 2 of
    // them can still fuse.
    expect(evolvesInstead(ball('spider-queen'), ball('mosquito-king'))).toBeNull();
    expect(evolvesInstead(ball('vampire-lord'), ball('spider-queen'))).toBeNull();
    expect(evolvesInstead(ball('vampire-lord'), ball('mosquito-king'))).toBeNull();
  });
});

describe('fuse', () => {
  it('composes name, paragraphs in selection order, and caveats', () => {
    const r = fuse(ball('glacier'), ball('flash'))!;
    expect(r.name).toBe('Glacier × Flash');
    expect(r.paragraphs[0]).toContain('glacial spikes');
    expect(r.paragraphs[1]).toContain('blind them');
    expect(r.notes).toEqual(['Composition is modeled from community-observed rules; verify against the game.']);
  });

  it('returns null for self-fusion', () => {
    expect(fuse(ball('flash'), ball('flash'))).toBeNull();
  });

  it('reports evolutions instead of fusing them', () => {
    const r = fuse(ball('bleed'), ball('poison'))!;
    expect(r.evolvesInstead?.name).toBe('Virus');
    const plain = fuse(ball('flash'), ball('glacier'))!;
    expect(plain.evolvesInstead).toBeNull();
  });

  it('composes the playtest pairs with the expected cross-wire lines', () => {
    // playtest ground truth (docs/research/fusion-observations/playtest.jsonl):
    // Overgrowth × Flash cross-wires; Flicker × Radiation Beam cross-wires;
    // Flash × Glacier does not.
    const og = fuse(ball('overgrowth'), ball('flash'))!;
    expect(og.crossWire).toContain('Flash');
    expect(og.crossWire).toContain('Overgrowth');
    const fr = fuse(ball('flicker'), ball('radiation-beam'))!;
    expect(fr.crossWire).not.toBeNull();
    const fg = fuse(ball('flash'), ball('glacier'))!;
    expect(fg.crossWire).toBeNull();
  });
});

describe('level-3 component text (decision #12)', () => {
  it('uses level-3 values, not the level-1 catalog', () => {
    expectLevel3OvergrowthThresholdApplies();
    const r = fuse(ball('overgrowth'), ball('flash'))!;
    expect(r.paragraphs[0]).not.toContain('reaching 3');
    // Flash L1 "Damages ... 1–3"; L3 "Damage ... 2–4"
    expect(r.paragraphs[1]).toContain('Damage all enemies on screen for X damage');
    expect(r.paragraphs[1]).not.toContain('Damages all enemies');
  });

  it('uses L3 spawn counts (Egg Sac 3–5, Maggot 2–3, VES 3–4)', () => {
    expect(fuse(ball('egg-sac'), ball('poison'))!.paragraphs.find((p) => p.includes('baby balls')))
      .toContain('Explodes into 3–5 baby balls');
    expect(fuse(ball('maggot'), ball('overgrowth'))!.paragraphs.find((p) => p.includes('Infest')))
      .toContain('explode into 2–3 baby balls');
    expect(fuse(ball('voluptuous-egg-sac'), ball('bomb'))!.paragraphs.find((p) => p.includes('egg sacs')))
      .toContain('Explodes into 3–4 egg sacs');
  });

  it('uses L3 proc values (Reaper 15%/7, Spider Queen 45%, Vampire Lord 9)', () => {
    const reaper = fuse(ball('reaper'), ball('satan'))!;
    const rp = reaper.paragraphs.find((p) => p.includes('kill enemies on impact'))!;
    expect(rp).toContain('15% chance');
    expect(rp).toContain('healing you for 7 health');
    expect(fuse(ball('spider-queen'), ball('flash'))!.paragraphs.find((p) => p.includes('birthing')))
      .toContain('45% chance');
    expect(fuse(ball('vampire-lord'), ball('flash'))!.paragraphs.find((p) => p.includes('at least')))
      .toContain('9 stacks');
  });

  it('damage rolls still abstract to X after the L3 swap', () => {
    const r = fuse(ball('overgrowth'), ball('flash'))!;
    expect(r.paragraphs[0]).toContain('deal X damage to all enemies');
  });

  it('unrelated balls keep their L3 numbers', () => {
    const r = fuse(ball('freeze'), ball('light'))!;
    expect(r.paragraphs[0]).toContain('7% chance to freeze');
    expect(r.paragraphs[1]).toContain('Blinds enemies on hit for 7 seconds');
  });
});

describe('cross-wire exclusions (corpus no-cross-wire evidence)', () => {
  it('VES two-hop spawn chain drops the property (Steam: Assassin × VES, Hemorrhage × VES)', () => {
    expectVesTwoHopSpawnChainDropsProperty();
  });

  it('Freeze Ray × Sun: the field aura does not apply the freeze (the beam carries Sun\'s burn)', () => {
    expectFreezeRaySunFieldAuraDoesNotWire();
  });

  it('Freeze Ray × Flash: the on-hit AOE spreads the freeze (Nov 2026 test)', () => {
    expectFreezeRayFlashWires();
  });

  it('a field-aura carrier cannot trigger an on-hit status (Sun × Poison)', () => {
    // General rule: Sun's on-timer field aura cannot fire a hit-bound status.
    // The corpus-evidenced damage-riding statuses still wire (Sun ×
    // Overgrowth/Virus/Hemorrhage/Succubus); Poison is not one of them.
    expect(fuse(ball('sun'), ball('poison'))!.crossWire).toBeNull();
    expect(fuse(ball('poison'), ball('sun'))!.crossWire).toBeNull();
    expect(fuse(ball('sun'), ball('overgrowth'))!.crossWire).not.toBeNull();
  });

  it('Berserk is an on-hit status, not a field aura (channel override)', () => {
    // Berserk's "every second" phrase describes the debuff's tick; the ball
    // itself applies berserk on hit, so an AOE carrier can spread it.
    expectBerserkIsOnHitStatus();
  });

  it('status-only spawn carriers wire on-hit statuses (Brood Mother × Flash, Mosquito King × Virus)', () => {
    // Issue #20: the blanket spawn exclusion was too strong. Brood Mother
    // and Mosquito King inherit the partner's on-hit status; spawn-bound
    // traits stay unwired (see the next test).
    expectStatusOnlyCarriersWireOnHitStatuses();
  });

  it('Brood Mother × Flash carries the degradation and trigger caveats, Flash sentence deduped', () => {
    expectStatusOnlyCarrierCaveats();
    const notes = fuse(ball('brood-mother'), ball('flash'))!.notes.join(' ');
    // both caveats share the launch-week sentence; it must appear once
    expect(notes.match(/launch-week report claims Flash × Brood Mother produced none/g)).toHaveLength(1);
  });

  it('Mosquito King × Virus has no trigger caveat (Virus is not AOE)', () => {
    const notes = fuse(ball('mosquito-king'), ball('virus'))!.notes.join(' ');
    expect(notes).not.toMatch(/spawn is an on-hit effect/);
  });

  it('trigger caveats fire for AOE partners even when the pair does not wire', () => {
    // Brood Mother × Sun: Sun's field aura is not an on-hit status, so no
    // wire — but its screen-clear damage still suppresses the on-hit spawn.
    const bm = fuse(ball('brood-mother'), ball('sun'))!;
    expect(bm.crossWire).toBeNull();
    expect(bm.notes.join(' ')).toMatch(/spawn fires on hit, so a screen-wide\/AOE partner produces fewer babies/);
    // Mosquito King × Glacier: Glacier's freeze is spawn-bound, so no wire.
    const mk = fuse(ball('mosquito-king'), ball('glacier'))!;
    expect(mk.crossWire).toBeNull();
    expect(mk.notes.join(' ')).toMatch(/spawn is an on-hit effect/);
  });

  it('status-only carriers do not inherit spawn-bound traits (Brood Mother / Mosquito King × Glacier)', () => {
    expectSpawnBoundTraitsStayUnwired();
  });

  it('Egg Sac as spawner carries the weaker-clone caveat in both inheritance branches', () => {
    const onHit = fuse(ball('egg-sac'), ball('hemorrhage'))!;
    expect(onHit.crossWire).not.toBeNull();
    expect(onHit.notes.join(' ')).toMatch(/Egg Sac's babies inherit the partner's properties, but the inherited effect is weaker than a full clone/);
    const spawnBound = fuse(ball('egg-sac'), ball('glacier'))!;
    expect(spawnBound.crossWire).not.toBeNull();
    expect(spawnBound.notes.join(' ')).toMatch(/weaker than a full clone/);
  });

  it('Satan field judgment is debuff-only — cannot carry on-hit statuses', () => {
    expectSatanDebuffOnlyCannotCarryOnHitStatuses();
  });

  it('Blizzard freeze stays icicle-bound (status-vs-spawn, both Flash pairs)', () => {
    expect(fuse(ball('blizzard'), ball('flash'))!.crossWire).toBeNull();
  });

  it('positive controls keep wiring (playtest + tooltip pairs)', () => {
    expect(fuse(ball('overgrowth'), ball('flash'))!.crossWire).not.toBeNull();
    expect(fuse(ball('flicker'), ball('radiation-beam'))!.crossWire).not.toBeNull();
    expect(fuse(ball('overgrowth'), ball('maggot'))!.crossWire).not.toBeNull();
  });

  it('kill effects ride AOE carriers (Black Hole × Sun — the corpus meta pair)', () => {
    // corpus: black-hole+sun 7 cross-wire claims, black-hole+flash 6 —
    // "Sun's screen-wide hits apply Black Hole's instant-kill to every
    // non-boss enemy". Previously the composer emitted nothing: Black Hole's
    // kill is not a status effect.
    expectKillEffectsRideAoeCarriers();
    expect(fuse(ball('black-hole'), ball('flash'))!.crossWire).toContain('instant kill');
    expect(fuse(ball('reaper'), ball('flash'))!.crossWire).toContain('Reaper');
    expect(fuse(ball('flicker'), ball('reaper'))!.crossWire).not.toBeNull();
    expect(fuse(ball('armageddon'), ball('reaper'))!.crossWire).not.toBeNull();
  });

  it('kill carriers are damage-dealing AOE only (Timestop freezes, deals no damage)', () => {
    expect(fuse(ball('black-hole'), ball('timestop'))!.crossWire).toBeNull();
  });

  it('Satan carries Black Hole\'s kill but not Reaper\'s (corpus: both directions tested)', () => {
    // black-hole+satan: 3 cross-wire claims ("Satan's aoe will inflict the
    // instant kill from Black Hole", Steam build guide).
    expect(fuse(ball('black-hole'), ball('satan'))!.crossWire).toContain('Black Hole');
    // reaper+satan: no-cross-wire — "Reaper's instant-kill is NOT triggered
    // by Satan's AOE" (on-impact kill vs debuff-only judgment).
    expect(fuse(ball('reaper'), ball('satan'))!.crossWire).toBeNull();
  });

  it('spawn carriers carry spawn-bound statuses too (Glacier × Maggot, Blizzard × Spider Queen)', () => {
    // corpus: glacier+maggot 2 CW, cell+glacier 2, blizzard+spider-queen 2,
    // magma+cell, swamp+cell, inferno+spider-queen — namu rule 6: the spawned
    // balls carry the fused kit including its spawned spikes/blobs.
    expectSpawnCarriersCarrySpawnBoundStatuses();
    expect(fuse(ball('blizzard'), ball('spider-queen'))!.crossWire).toContain('Spider Queen');
    expect(fuse(ball('cell'), ball('glacier'))!.crossWire).not.toBeNull();
    expect(fuse(ball('magma'), ball('cell'))!.crossWire).not.toBeNull();
    expect(fuse(ball('swamp'), ball('cell'))!.crossWire).not.toBeNull();
  });
});

describe('order resolution (property-set union, first-pick precedence)', () => {
  it('both-cooldown pairs with different values: first-selected cooldown wins (namu.wiki)', () => {
    expectFirstPickCooldownWins();
    expectEqualValuesAreNotCollisions();
    const r = fuse(ball('black-hole'), ball('timestop'))!;
    // the panel's Fused-result rows carry the resolution — notes must not
    // duplicate it (decision #8)
    expect(r.notes.join(' ')).not.toMatch(/cooldown wins/i);
    // equal cooldowns still get no cooldown note
    expect(fuse(ball('bomb'), ball('dark'))!.notes.join(' ')).not.toMatch(/cooldown wins/i);
    // non-cooldown pairs get no cooldown note
    expect(fuse(ball('flash'), ball('glacier'))!.notes.join(' ')).not.toMatch(/cooldown wins/i);
  });

  it('same-property pairs: first-selected variant wins (PSA #2)', () => {
    const r = fuse(ball('mosquito-swarm'), ball('mosquito-king'))!;
    expect(r.notes.join(' ')).not.toMatch(/first-selected ball's variant/i);
    expect(r.collisions[0]).toMatchObject({
      key: 'mosquito-spawn', winner: 'mosquito-swarm', value: '4–8 mosquitos', loser: 'mosquito-king', loserValue: 'a mosquito',
    });
    expect(fuse(ball('radiation-beam'), ball('nuclear-bomb'))!.collisions[0]).toMatchObject({
      key: 'radiation-duration', value: '15 seconds', loserValue: 'indefinitely',
    });
  });

  it('reported pairs from the Nov 2026 claims collide', () => {
    expectOrderResolutionPropertyUnion();
    // Egg Sac × Timestop: 3 s vs 20 s cooldown
    expect(fuse(ball('egg-sac'), ball('timestop'))!.collisions[0]).toMatchObject({
      key: 'cooldown', value: '3 second', loserValue: '20 second',
    });
    // Banished Flame × Sun: cap, duration and per-stack damage all collide
    const bf = fuse(ball('banished-flame'), ball('sun'))!;
    expect(bf.collisions.every((c) => c.winner === 'banished-flame')).toBe(true);
    // Erosion × Stone/Drill/Assassin/Steel: first pick's bonus % wins
    for (const [id, value] of [['stone', '400%'], ['drill', '100%'], ['assassin', '50%'], ['steel', '15%']] as const) {
      expect(fuse(ball('erosion'), ball(id))!.collisions[0]).toMatchObject({
        key: 'bonus-damage', winner: 'erosion', value: '5%', loser: id, loserValue: value,
      });
      expect(fuse(ball(id), ball('erosion'))!.collisions[0]).toMatchObject({
        key: 'bonus-damage', winner: id, value, loser: 'erosion', loserValue: '5%',
      });
    }
    // Freeze Ray × Blizzard: 13 s vs 1.3 s — unresolved, marked reported
    expect(fuse(ball('freeze-ray'), ball('blizzard'))!.collisions[0]).toMatchObject({
      key: 'freeze-duration', value: '13.0 seconds', loserValue: '1.3 seconds', reported: true,
    });
    // Noxious × Brimstone: 3 vs max 4 poison stacks — unresolved, marked reported
    expect(fuse(ball('noxious'), ball('brimstone'))!.collisions[0]).toMatchObject({
      key: 'poison-max-stacks', reported: true,
    });
  });

  it('collisions are order-sensitive: reversing the picks reverses the winner', () => {
    const ab = fuse(ball('egg-sac'), ball('timestop'))!;
    const ba = fuse(ball('timestop'), ball('egg-sac'))!;
    expect(ab.collisions[0].winner).toBe('egg-sac');
    expect(ba.collisions[0].winner).toBe('timestop');
    expect(ba.collisions[0].value).toBe('20 second');
  });

  it('channel union keeps both application channels (Leech × Sacrifice)', () => {
    const r = fuse(ball('leech'), ball('sacrifice'))!;
    expect(r.resolved.channels).toEqual(expect.arrayContaining(['per-second', 'spawn', 'on-hit']));
    expect(r.collisions[0]).toMatchObject({
      key: 'bleed-max-stacks', value: 'max 48 stacks', loserValue: 'max 20 stacks',
    });
  });
});

describe('composition caveats (general_rules_notes)', () => {
  it('two Destroy-class balls may lose one self-destruct effect', () => {
    expect(fuse(ball('bomb'), ball('dark'))!.notes.join(' ')).toMatch(/Destroy/i);
  });

  it('hit-once + cooldown suppresses the partner\'s pass-through', () => {
    expect(fuse(ball('black-hole'), ball('ghost'))!.notes.join(' ')).toMatch(/pass-through/i);
    expect(fuse(ball('ghost'), ball('flash'))!.notes.join(' ')).not.toMatch(/pass-through/i);
  });

  it('spawn can compensate Destroy (Cell × Bomb = indestructible bomb)', () => {
    expect(fuse(ball('bomb'), ball('cell'))!.notes.join(' ')).toMatch(/Spawn/i);
  });

  it('Dark\'s damage multiplier carries into any fusion (namu.wiki)', () => {
    expect(fuse(ball('dark'), ball('flash'))!.notes.join(' ')).toMatch(/Dark's damage multiplier/);
    expect(fuse(ball('flash'), ball('sun'))!.notes.join(' ')).not.toMatch(/multiplier/);
  });

  it('kill cross-wire requires a real AOE carrier (Iron × Reaper must not wire)', () => {
    // review finding: the kill branch originally gated only on dealsDamage —
    // "Area-of-effect damage from Iron triggers the instant kill of Reaper"
    // for any ball whose text contains "deals". Iron/Stone/Steel/Drill are
    // single-target, not AOE carriers.
    expect(fuse(ball('iron'), ball('reaper'))!.crossWire).toBeNull();
    expect(fuse(ball('timestop'), ball('reaper'))!.crossWire).toBeNull();
  });

  it('Noxious × Poison is a same-property pair (corpus: max stacks differ by order)', () => {
    expect(fuse(ball('noxious'), ball('poison'))!.collisions[0]).toMatchObject({
      key: 'poison-max-stacks', winner: 'noxious', value: '3 stacks', loser: 'poison', loserValue: 'max 8 stacks',
    });
  });

  it('base-ball pool recursion note (first-selected base ball is consumed)', () => {
    expect(fuse(ball('wraith'), ball('egg-sac'))!.notes.join(' ')).toMatch(/base ball is consumed/);
    expect(fuse(ball('flash'), ball('glacier'))!.notes.join(' ')).not.toMatch(/base ball is consumed/);
  });

  it('corpus-disputed kill pairs carry a contradiction note (flicker × reaper)', () => {
    // CONTRADICTIONS.md §10e: three reports say Flicker's ticks fire
    // Reaper's kill, one says only direct hits do — genuinely open.
    // flash+reaper is corpus-verified, so no contradiction note there.
    expect(fuse(ball('flicker'), ball('reaper'))!.crossWire).not.toBeNull();
    expect(fuse(ball('flicker'), ball('reaper'))!.notes.join(' ')).toMatch(/reports disagree/);
    expect(fuse(ball('reaper'), ball('sun'))!.notes.join(' ')).not.toMatch(/reports disagree/);
  });

  it('Sandstorm is in the pass-through set (hit-once note)', () => {
    // fact-base Pass Through list: Ghost, Wind, Drill, Erosion, Noxious,
    // Sandstorm, Sniper, Soul Sucker, Wraith, Assassin.
    expectSandstormIsPassThrough();
  });

  it('fixed trait priorities are commutative notes (Assassin, Warp)', () => {
    expect(fuse(ball('assassin'), ball('ghost'))!.notes.join(' ')).toMatch(/back-armor/i);
    expect(fuse(ball('ghost'), ball('assassin'))!.notes.join(' ')).toMatch(/back-armor/i);
    expect(fuse(ball('warp'), ball('ghost'))!.notes.join(' ')).toMatch(/Warp is cast before/i);
    expect(fuse(ball('ghost'), ball('warp'))!.notes.join(' ')).toMatch(/Warp is cast before/i);
  });

  it('reported exceptions surface as structured data (the panel section, not notes)', () => {
    expectBlackHoleSunOrderIndependent();
    const nuke = fuse(ball('nuclear-bomb'), ball('wraith'))!;
    expect(nuke.exceptions.map((e) => e.pair)).toContain('nuclear-bomb+wraith');
    expect(nuke.notes.join(' ')).not.toMatch(/Reported exception/);
    expect(fuse(ball('time'), ball('flash'))!.exceptions.map((e) => e.pair)).toContain('time+*');
    expect(fuse(ball('banshee'), ball('flash'))!.exceptions.map((e) => e.pair)).toContain('banshee+*');
  });
});
