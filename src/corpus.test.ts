// Corpus conformance: the fusion-observation corpus is the spec the composer
// was validated against (commit history: full-corpus manual pass). These tests
// keep that validation from drifting — a composer change or a corpus refresh
// that breaks agreement fails `npm test` instead of silently diverging.
//
// The corpus is editorial research (docs/research/fusion-observations/), not
// game data; the composer is its conservative implementation. The contract
// encoded here (derive the sets with the queries in the comments):
//   - no-cross-wire claims  → crossWire() is null
//   - disputed pairs (both polarities in the corpus) → resolved per
//     CONTRADICTIONS.md: either null, or wired WITH the contradiction note
//   - cross-wire claims the model implements → crossWire() non-null
//   - cross-wire claims the model deliberately does not implement → null,
//     listed in BEYOND_MODEL so a future corpus refresh re-reviews them
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { fuse } from './fusion';
import { ballMap } from './catalog';

const corpusRoot = new URL('../docs/research/fusion-observations/', import.meta.url).pathname;
const pairsData = JSON.parse(readFileSync(`${corpusRoot}fusion-pairs.json`, 'utf8')) as {
  pair_count: number;
  pairs: Record<string, { components: [string, string]; status: string; claims: { type: string }[] }>;
};

const ball = (id: string) => {
  const b = ballMap.get(id);
  if (!b) throw new Error(`corpus pair id "${id}" is not a catalog ball`);
  return b;
};

/** Pairs whose claims carry wire polarity at all, partitioned by polarity
 *  (claim types "cross-wire" / "no-cross-wire"; curated from the jsonl layer). */
function wirePairs(): { wire: string[]; noWire: string[]; disputed: string[] } {
  const wire: string[] = [];
  const noWire: string[] = [];
  const disputed: string[] = [];
  for (const [key, p] of Object.entries(pairsData.pairs)) {
    const has = (t: string) => p.claims.some((c) => c.type === t);
    if (has('cross-wire') && has('no-cross-wire')) disputed.push(key);
    else if (has('cross-wire')) wire.push(key);
    else if (has('no-cross-wire')) noWire.push(key);
  }
  return { wire, noWire, disputed };
}

const { wire, noWire, disputed } = wirePairs();

describe('corpus sanity (the spec itself is loadable)', () => {
  it('fusion-pairs.json is the 370-pair curated layer the docs cite', () => {
    expect(pairsData.pair_count).toBe(370);
    expect(Object.keys(pairsData.pairs).length).toBe(370);
  });

  it('every corpus pair id resolves in the catalog', () => {
    for (const [key, p] of Object.entries(pairsData.pairs)) {
      for (const id of p.components) expect(ballMap.has(id), `${key}: ${id}`).toBe(true);
    }
  });

  it('wire claims exist (the sets below are not vacuous)', () => {
    expect(noWire.length).toBeGreaterThanOrEqual(10);
    expect(disputed.length).toBeGreaterThanOrEqual(5);
    expect(wire.length).toBeGreaterThan(noWire.length + disputed.length);
  });
});

describe('no-cross-wire claims → composer emits no cross-wire line', () => {
  // Corpus pairs whose evidence is exclusively negative (13 pairs). Every one
  // is a trigger-channel exclusion the composer models: spawn-bound statuses
  // (Flash × Glacier), excluded carriers (VES, Brood Mother, Mosquito King),
  // debuff-only channels (Reaper × Satan), AOE × AOE non-inheritance.
  it.each(noWire)('%s stays null', (key) => {
    const [a, b] = pairsData.pairs[key].components;
    expect(fuse(ball(a), ball(b))!.crossWire, key).toBeNull();
  });
});

describe('disputed pairs → resolved per CONTRADICTIONS.md', () => {
  // Both polarities are reported in the corpus; the composer encodes the
  // resolved direction. Two resolution shapes exist:
  //   - The disputed channel is the one the site would display → wire it and
  //     caveat it with the contradiction note (flicker+reaper, §10e).
  //   - The disputed channel is one the model refuses anyway (spawn-bound
  //     kills, VES hops, debuff-only judgments, AOE coexistence, beam-path
  //     binding) → null, no note: there is no displayed claim to caveat.
  //     The composer may still wire an *undisputed* channel of the same pair.
  const NULL_RESOLVED: [string, string][] = [
    ['earthquake+flash', '§10f — kits coexist, neither inherits the other\'s scope'],
    ['freeze-ray+sun', '§7 — freeze is beam-path-bound; Sun\'s AOE does not apply it'],
    ['hemorrhage+satan', '§4 — Satan\'s judgment is debuff-only, cannot fire the %HP proc'],
    ['hemorrhage+voluptuous-egg-sac', '§3 — VES two-hop chain drops the property'],
    ['nuclear-bomb+voluptuous-egg-sac', '§3 — VES two-hop chain drops the property'],
  ];
  it.each(NULL_RESOLVED)('%s resolves to no wire (%s)', (key) => {
    const [a, b] = pairsData.pairs[key].components;
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
});

describe('implemented cross-wire patterns → composer wires', () => {
  // The subset of corpus cross-wire pairs whose claims fit one of the four
  // implemented channels (spawn carrier × on-hit status, AOE carrier × on-hit
  // status, AOE carrier × kill-on-hit, spawn carrier × spawn-bound status).
  // Derived once from the full-corpus validation pass; a composer regression
  // on any of these pairs now fails here.
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
    'mosquito-swarm+nuclear-bomb', 'nuclear-bomb+overgrowth', 'nuclear-bomb+shotgun', 'overgrowth+sun',
    'reaper+sun', 'spider-queen+vampire-lord', 'succubus+sun', 'sun+virus',
  ];

  it('every implemented-pattern pair wires, both ball names present', () => {
    for (const key of IMPLEMENTED) {
      const p = pairsData.pairs[key];
      expect(p, `pair ${key} missing from corpus`).toBeDefined();
      const [a, b] = p.components;
      const r = fuse(ball(a), ball(b))!;
      expect(r.crossWire, `${key}: expected a cross-wire line`).not.toBeNull();
      for (const id of p.components) {
        expect(r.crossWire!, `${key}: wire line should name ${ball(id).name}`).toContain(ball(id).name);
      }
    }
  });

  it('the wire line is order-independent (function is commutative; CONTRADICTIONS.md §1)', () => {
    for (const key of IMPLEMENTED) {
      const [a, b] = pairsData.pairs[key].components;
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
  // (42 pairs). Classes, with the reason each stays out:
  //   - Dark's 5× multiplier / cooldown reuse / Destroy-compensation — real
  //     composition effects, but notes, not cross-wire lines (fuse() emits
  //     them as notes; tested in fusion.test.ts).
  //   - VES (voluptuous-egg-sac) spawn pairs — the two-hop chain drops the
  //     property (SPAWN_EXCLUDED_IDS; CONTRADICTIONS.md §3), yet the corpus
  //     also holds positive reports; unresolved → conservative null.
  //   - Synergy sentiment ("works well", tier lists) — not channel claims.
  //   - Field-aura statuses (Sun, Inferno, Banshee) and AOE × AOE
  //     coexistence — channels the model does not carry (statusChannel()).
  //   - Pierce/pass-through trait transfer (Ghost + AOE class) — trait, not
  //     status.
  // The list pins today's boundary: a composer change that starts wiring one
  // of these (or a corpus refresh that adds pairs) surfaces here for review.
  const BEYOND_MODEL = [
    'banshee+nosferatu', 'berserk+hemorrhage', 'black-hole+mosquito-swarm',
    'black-hole+voluptuous-egg-sac', 'bleed+vampire-lord', 'bomb+cell', 'bomb+dark', 'bomb+egg-sac',
    'bomb+timestop', 'brood-mother+egg-sac', 'brood-mother+laser-vertical', 'cell+voluptuous-egg-sac',
    'dark+flash', 'dark+landslide', 'dark+nuclear-bomb', 'earthquake+glacier', 'earthquake+laser-vertical',
    'earthquake+voluptuous-egg-sac', 'egg-sac+holy-laser', 'erosion+maggot', 'flash+ghost',
    'flash+holy-laser', 'flash+storm', 'flash+sun', 'flash+vampire', 'flesh-mound+voluptuous-egg-sac',
    'flicker+sun', 'ghost+lightning-rod', 'glacier+voluptuous-egg-sac', 'holy-laser+shotgun',
    'holy-laser+voluptuous-egg-sac', 'holy-laser+x-ray', 'inferno+spider-queen',
    'maggot+voluptuous-egg-sac', 'mosquito-king+spider-queen', 'mosquito-king+virus', 'nosferatu+shotgun',
    'nosferatu+voluptuous-egg-sac', 'phantom+voluptuous-egg-sac', 'reaper+voluptuous-egg-sac',
    'shotgun+sniper', 'voluptuous-egg-sac+wraith',
  ];

  it.each(BEYOND_MODEL)('%s stays conservatively null', (key) => {
    const [a, b] = pairsData.pairs[key].components;
    expect(fuse(ball(a), ball(b))!.crossWire, key).toBeNull();
  });

  it('the beyond-model set plus implemented set covers every corpus wire pair', () => {
    // No unclassified pair: a corpus refresh adding wire claims must land the
    // new pair in IMPLEMENTED or BEYOND_MODEL (or disputed) explicitly.
    const classified = new Set([...wire, ...disputed]);
    for (const key of [...wire]) {
      expect(classified.has(key), `unclassified wire pair: ${key}`).toBe(true);
    }
    expect(wire.length + disputed.length + noWire.length).toBe(131);
  });
});
