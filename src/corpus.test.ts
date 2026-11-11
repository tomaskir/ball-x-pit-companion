// Corpus conformance: the fusion-observation corpus is the spec the composer
// was validated against (commit history: full-corpus manual pass). These tests
// keep that validation from drifting — a composer change or a corpus refresh
// that breaks agreement fails `npm test` instead of silently diverging.
//
// The corpus is editorial research (docs/research/fusion-observations/), not
// game data; the composer is its conservative implementation. The corpus shape
// lives in src/corpus.ts (loadCorpus / pair / wirePairs); the contract encoded
// here (derive the sets with the queries in the comments):
//   - no-cross-wire claims  → crossWire() is null
//   - disputed pairs (both polarities in the corpus) → resolved per
//     CONTRADICTIONS.md: either null, or wired WITH the contradiction note
//   - cross-wire claims the model implements → crossWire() non-null
//   - cross-wire claims the model deliberately does not implement → null,
//     listed in BEYOND_MODEL so a future corpus refresh re-reviews them
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { fuse } from './fusion';
import { ballMap } from './catalog';
import { loadCorpus } from './corpus';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const corpus = loadCorpus(repoRoot);
const { pairs, pair, pairCount } = corpus;
const { wire, noWire, disputed } = corpus.wirePairs();

const ball = (id: string) => {
  const b = ballMap.get(id);
  if (!b) throw new Error(`corpus pair id "${id}" is not a catalog ball`);
  return b;
};

// Editorial boundary lists. They are the composer's spec, not corpus shape,
// so they stay in this test rather than moving into src/corpus.ts. Module
// scope so the coverage test can see all of them.

// Disputed pairs the composer resolves by wiring an undisputed channel (or
// the disputed one with a caveat). A corpus refresh that flips one of these
// must be reviewed here.
const DISPUTED_WIRED = [
  'black-hole+maggot', // §10d — undisputed AOE×status channel only
  'flicker+overgrowth', // §3/§5 — undisputed AOE×status channel
  'flicker+reaper', // §10e — disputed wire kept WITH the contradiction note
  'landslide+maggot', // §3/§5 — undisputed AOE×status channel
];

// Disputed pairs the composer resolves to no wire; the second element is the
// CONTRADICTIONS.md section that justifies the resolution.
const NULL_RESOLVED: [string, string][] = [
  ['earthquake+flash', '§10f — kits coexist, neither inherits the other\'s scope'],
  ['freeze-ray+sun', '§7 — Sun\'s field aura does not apply the freeze'],
  ['hemorrhage+satan', '§4 — Satan\'s judgment is debuff-only, cannot fire the %HP proc'],
  ['hemorrhage+voluptuous-egg-sac', '§3 — VES two-hop chain drops the property'],
  ['nuclear-bomb+voluptuous-egg-sac', '§3 — VES two-hop chain drops the property'],
];

// The subset of corpus cross-wire pairs whose claims fit one of the four
// implemented channels (spawn carrier × on-hit status, AOE carrier × on-hit
// status, AOE carrier × kill-on-hit, spawn carrier × spawn-bound status).
// Derived once from the full-corpus validation pass; a composer regression on
// any of these pairs now fails here.
const IMPLEMENTED = [
  'armageddon+reaper', 'black-hole+flash', 'black-hole+nuclear-bomb', 'black-hole+satan',
  'black-hole+sun', 'bleed+flash', 'bleed+lightning', 'blizzard+maggot', 'blizzard+spider-queen',
  'burn+flash', 'cell+glacier', 'cell+hemorrhage', 'cell+magma', 'cell+nuclear-bomb', 'cell+swamp',
  'egg-sac+hemorrhage', 'egg-sac+nuclear-bomb', 'egg-sac+poison', 'flash+freeze', 'flash+hemorrhage',
  'flash+maggot', 'flash+mosquito-swarm', 'flash+overgrowth', 'flash+poison', 'flash+reaper',
  'flash+sandstorm', 'flash+succubus', 'flash+virus', 'flash+wraith', 'flash+zombie',
  'flicker+frozen-flame', 'flicker+hemorrhage', 'flicker+radiation-beam', 'flicker+virus',
  'freeze-ray+maggot', 'glacier+maggot', 'glacier+shotgun', 'glacier+spider-queen',
  'hemorrhage+holy-laser', 'hemorrhage+maggot', 'hemorrhage+magma', 'hemorrhage+nosferatu',
  'hemorrhage+sun', 'holy-laser+maggot', 'laser-beam+maggot', 'laser-horizontal+maggot',
  'laser-horizontal+poison', 'laser-horizontal+wind', 'laser-vertical+maggot', 'maggot+noxious',
  'maggot+nuclear-bomb', 'maggot+overgrowth', 'maggot+phantom', 'maggot+poison', 'maggot+reaper',
  'maggot+soul-sucker', 'maggot+succubus', 'maggot+virus', 'maggot+wraith',
  'mosquito-king+virus', 'mosquito-swarm+nuclear-bomb', 'nuclear-bomb+overgrowth', 'nuclear-bomb+shotgun', 'overgrowth+sun',
  'reaper+sun', 'spider-queen+vampire-lord', 'succubus+sun', 'sun+virus',
];

// Corpus cross-wire pairs the composer deliberately does NOT implement.
// See the describe block below for the class-by-class rationale.
const BEYOND_MODEL = [
  'banshee+nosferatu', 'berserk+hemorrhage', 'black-hole+mosquito-swarm',
  'black-hole+voluptuous-egg-sac', 'bleed+vampire-lord', 'bomb+cell', 'bomb+dark', 'bomb+egg-sac',
  'bomb+timestop', 'brood-mother+egg-sac', 'brood-mother+laser-vertical', 'cell+voluptuous-egg-sac',
  'dark+flash', 'dark+landslide', 'dark+nuclear-bomb', 'earthquake+glacier', 'earthquake+laser-vertical',
  'earthquake+voluptuous-egg-sac', 'egg-sac+holy-laser', 'erosion+maggot', 'flash+ghost',
  'flash+holy-laser', 'flash+storm', 'flash+sun', 'flash+vampire', 'flesh-mound+voluptuous-egg-sac',
  'flicker+sun', 'ghost+lightning-rod', 'glacier+voluptuous-egg-sac', 'holy-laser+shotgun',
  'holy-laser+voluptuous-egg-sac', 'holy-laser+x-ray', 'inferno+spider-queen',
  'maggot+voluptuous-egg-sac', 'mosquito-king+spider-queen', 'nosferatu+shotgun',
  'nosferatu+voluptuous-egg-sac', 'phantom+voluptuous-egg-sac', 'reaper+voluptuous-egg-sac',
  'shotgun+sniper', 'voluptuous-egg-sac+wraith',
];

describe('corpus sanity (the spec itself is loadable)', () => {
  it('fusion-pairs.json is the 370-pair curated layer the docs cite', () => {
    expect(pairCount).toBe(370);
    expect(Object.keys(pairs).length).toBe(370);
  });

  it('the corpus module reports no curated-layer shape findings', () => {
    expect(corpus.findings).toEqual([]);
  });

  it('every corpus pair id resolves in the catalog', () => {
    for (const [key, p] of Object.entries(pairs)) {
      for (const id of p.components) expect(ballMap.has(id), `${key}: ${id}`).toBe(true);
    }
  });

  it('every pair carries the ingestion-contract superseded array', () => {
    // Raw rows are append-only; a claim dropped by a later wave is recorded
    // here as { claim, source, superseded_by } (README, CONTRADICTIONS.md).
    for (const [key, p] of Object.entries(pairs)) {
      expect(Array.isArray(p.superseded), `${key}: superseded must be an array`).toBe(true);
      for (const s of p.superseded) {
        expect(typeof s.claim, `${key}: superseded.claim`).toBe('string');
        expect(typeof s.source, `${key}: superseded.source`).toBe('string');
        expect(s.superseded_by, `${key}: superseded.superseded_by`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it('wire claims exist (the sets below are not vacuous)', () => {
    expect(noWire.length).toBeGreaterThanOrEqual(10);
    expect(disputed.length).toBeGreaterThanOrEqual(5);
    expect(wire.length).toBeGreaterThan(noWire.length + disputed.length);
  });
});

describe('cross-wire exclusions → composer emits no line; superseded claims now wire', () => {
  // Corpus pairs whose evidence is exclusively negative (11 pairs). Every one
  // is a trigger-channel exclusion the composer models: spawn-bound statuses
  // (Flash × Glacier), the VES hard exclusion, debuff-only channels (Reaper ×
  // Satan), AOE × AOE non-inheritance. Two former no-wire pairs
  // (brood-mother+flash, flash+mosquito-king) are recorded as superseded in
  // the curated layer (issue #20) and are covered by the status-only test
  // below.
  it.each(noWire)('%s stays null', (key) => {
    const [a, b] = pair(key)!.components;
    expect(fuse(ball(a), ball(b))!.crossWire, key).toBeNull();
  });

  it('superseded no-wire claims now wire under the status-only model (issue #20)', () => {
    for (const key of ['brood-mother+flash', 'flash+mosquito-king']) {
      const p = pair(key)!;
      expect(p.superseded.length, `${key}: resolution not recorded in the curated layer`).toBeGreaterThan(0);
      const [a, b] = p.components;
      expect(fuse(ball(a), ball(b))!.crossWire, key).not.toBeNull();
    }
  });
});

describe('disputed pairs → resolved per CONTRADICTIONS.md', () => {
  // Both polarities are reported in the corpus; the composer encodes the
  // resolved direction. Two resolution shapes exist:
  //   - The disputed channel is the one the site would display → wire it and
  //     caveat it with the contradiction note (flicker+reaper, §10e).
  //   - The disputed channel is one the model refuses anyway (spawn-bound
  //     kills, VES hops, debuff-only judgments, AOE coexistence, Sun's
  //     field-aura binding) → null, no note: there is no displayed claim to
  //     caveat.
  //     The composer may still wire an *undisputed* channel of the same pair.
  it.each(NULL_RESOLVED)('%s resolves to no wire (%s)', (key) => {
    const [a, b] = pair(key)!.components;
    expect(fuse(ball(a), ball(b))!.crossWire, key).toBeNull();
  });

  it('flicker × reaper keeps the disputed wire WITH the contradiction note (§10e)', () => {
    const r = fuse(ball('flicker'), ball('reaper'))!;
    expect(r.crossWire).not.toBeNull();
    expect(r.notes.join(' ')).toMatch(/reports disagree/);
  });

  it('black-hole × maggot wires only the undisputed AOE×status channel, never babies-carry-kill (§10d)', () => {
    const r = fuse(ball('black-hole'), ball('maggot'))!;
    expect(r.crossWire).toContain('status effect of Maggot');
    expect(r.crossWire).not.toContain('instant kill');
  });

  it('flicker × overgrowth and landslide × maggot wire the undisputed AOE×status channel (§3/§5)', () => {
    // The corpus disputes on these pairs are about other channels (dizzy
    // application; baby balls triggering Landslide) — the AOE-carrier ×
    // on-hit-status direction is the confirmed one and needs no note.
    expect(fuse(ball('flicker'), ball('overgrowth'))!.crossWire).toContain('Overgrowth');
    expect(fuse(ball('landslide'), ball('maggot'))!.crossWire).toContain('Maggot');
  });

  it('every DISPUTED_WIRED and NULL_RESOLVED pair is in the corpus disputed set', () => {
    for (const key of DISPUTED_WIRED) expect(disputed, key).toContain(key);
    for (const key of NULL_RESOLVED.map(([k]) => k)) expect(disputed, key).toContain(key);
  });
});

describe('implemented cross-wire patterns → composer wires', () => {
  it('every implemented-pattern pair wires, both ball names present', () => {
    for (const key of IMPLEMENTED) {
      const p = pair(key);
      expect(p, `pair ${key} missing from corpus`).toBeDefined();
      const [a, b] = p!.components;
      const r = fuse(ball(a), ball(b))!;
      expect(r.crossWire, `${key}: expected a cross-wire line`).not.toBeNull();
      for (const id of p!.components) {
        expect(r.crossWire!, `${key}: wire line should name ${ball(id).name}`).toContain(ball(id).name);
      }
    }
  });

  it('the wire line is order-independent (cross-wiring is commutative; order only resolves shared scalar keys — fusion-mechanics.md §3)', () => {
    for (const key of IMPLEMENTED) {
      const [a, b] = pair(key)!.components;
      const ab = fuse(ball(a), ball(b))!.crossWire;
      const ba = fuse(ball(b), ball(a))!.crossWire;
      expect(ba, `${key}: reversed order changed the cross-wire`).toBe(ab);
    }
  });

  it('IMPLEMENTED is a subset of the corpus wire pairs (corpus refresh re-check)', () => {
    for (const key of IMPLEMENTED) {
      expect(wire.concat(disputed), key).toContain(key);
    }
  });
});

describe('cross-wire claims beyond the model → conservatively null', () => {
  // Corpus cross-wire pairs the composer deliberately does NOT implement
  // (41 pairs), by class:
  //   - VES (voluptuous-egg-sac) spawn pairs — the two-hop chain drops the
  //     property (SPAWN_NO_INHERITANCE_IDS; CONTRADICTIONS.md §3), yet the corpus
  //     also holds positive reports; unresolved → conservative null. The
  //     phantom/wraith VES claims ("hit effects DO trigger from VolEgg
  //     babies") are single-source against the VES exclusions and stay null.
  //   - Status-only spawn carriers (brood-mother, mosquito-king) paired with a
  //     partner that has no on-hit status to carry (brood-mother+egg-sac,
  //     brood-mother+laser-vertical, mosquito-king+spider-queen) — the spawn
  //     channel inherits on-hit statuses only, and these partners have none
  //     (issue #20).
  //   - Spawn × spawn compounding — two spawners, or a spawn carrier whose
  //     partner has no status/kill for a channel to carry: bomb+cell,
  //     bomb+egg-sac, nosferatu+shotgun, shotgun+sniper,
  //     mosquito-king+spider-queen. bomb+cell's claim is specifically
  //     "spawn compensates Destroy" — implemented as a fuse() note, not a
  //     wire line.
  //   - Dark's 5× multiplier / cooldown reuse (bomb+dark, bomb+timestop,
  //     dark+*) — real composition effects, but notes, not cross-wire lines
  //     (tested in fusion.test.ts).
  //   - Kill-on-hit via spawn carriers (black-hole+mosquito-swarm,
  //     reaper+voluptuous-egg-sac) — the model wires kills through
  //     damage-dealing AOE carriers only.
  //   - Field-aura statuses (Sun, Inferno, Banshee) — statusChannel()
  //     returns 'field'; the model carries only 'hit' statuses.
  //   - On-hit effects on balls without the status-effect tag (erosion's
  //     %HP, vampire's lifesteal) — no status channel exists to carry.
  //   - AOE × AOE coexistence/shaping (earthquake+laser-vertical,
  //     holy-laser+x-ray, earthquake+glacier) — kits coexist or reshape, no
  //     inheritance (§10f).
  //   - Pierce/pass-through trait transfer (flash+ghost,
  //     ghost+lightning-rod) — trait, not status.
  //   - Residual shapes: carrier-rank refusals (flash+storm, flash+holy-laser
  //     — the lower-rank AOE cannot carry the higher-rank one's status),
  //     contradicted/ambiguous single observations (egg-sac+holy-laser,
  //     holy-laser+shotgun), and synergy sentiment / tier lists
  //     (berserk+hemorrhage, bleed+vampire-lord, flash+vampire) — not
  //     channel claims the model could implement.
  // The list (module scope) pins today's boundary: a composer change that
  // starts wiring one of these (or a corpus refresh that adds pairs) surfaces
  // here for review.
  it.each(BEYOND_MODEL)('%s stays conservatively null', (key) => {
    const [a, b] = pair(key)!.components;
    expect(fuse(ball(a), ball(b))!.crossWire, key).toBeNull();
  });

  it('classifies every corpus wire/disputed pair (regression: the old coverage loop was vacuous)', () => {
    // No unclassified pair: a corpus refresh adding wire claims must land the
    // new pair in IMPLEMENTED, BEYOND_MODEL, NULL_RESOLVED or DISPUTED_WIRED
    // explicitly. The old assertion built `classified` from `wire` and then
    // looped over `wire`, so membership was always true; this one compares
    // the boundary set against the union of the editorial lists.
    const boundary = new Set([...wire, ...disputed]);
    const classified = new Set([
      ...IMPLEMENTED,
      ...BEYOND_MODEL,
      ...NULL_RESOLVED.map(([key]) => key),
      ...DISPUTED_WIRED,
    ]);

    for (const key of BEYOND_MODEL) {
      expect(boundary.has(key), `BEYOND_MODEL pair is not a wire/disputed pair: ${key}`).toBe(true);
    }
    for (const key of IMPLEMENTED) {
      expect(boundary.has(key), `IMPLEMENTED pair is not a wire/disputed pair: ${key}`).toBe(true);
    }
    for (const key of NULL_RESOLVED.map(([k]) => k)) {
      expect(boundary.has(key), `NULL_RESOLVED pair is not a wire/disputed pair: ${key}`).toBe(true);
    }
    for (const key of DISPUTED_WIRED) {
      expect(boundary.has(key), `DISPUTED_WIRED pair is not a wire/disputed pair: ${key}`).toBe(true);
    }
    for (const key of boundary) {
      expect(classified.has(key), `unclassified wire/disputed pair: ${key}`).toBe(true);
    }

    expect(wire.length + disputed.length + noWire.length).toBe(129);
  });
});
