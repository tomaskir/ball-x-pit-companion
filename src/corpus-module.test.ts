// Unit tests for src/corpus.ts — the corpus module's own seam, on fixtures.
// The real corpus is exercised by corpus.test.ts (conformance) and
// corpus-schema.test.ts (the gate); these tests pin the module's contract:
// curated loading, the wire/no-wire/disputed partition, raw-layer parsing,
// and schema.json as the source of the enforced enums.
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { loadCorpus, loadRawObservations, validateCorpus } from './corpus';
import { pairKeyOf } from './pair';

const realSchema = JSON.parse(
  readFileSync(new URL('../docs/research/fusion-observations/schema.json', import.meta.url), 'utf8')
);

interface FixtureOptions {
  schema?: any;
  pairs?: any;
  jsonl?: Record<string, string>;
  aliases?: any;
}

const roots: string[] = [];

/** Build a throwaway repo root with just the corpus files the module reads.
 *  Ball ids still come from the real catalog (the module imports it), so
 *  fixtures use real ids and `risen-ballbylon` as the uncataloged one. */
function fixture(options: FixtureOptions = {}): string {
  const root = mkdtempSync(join(tmpdir(), 'corpus-module-'));
  roots.push(root);
  const obsDir = join(root, 'docs/research/fusion-observations');
  mkdirSync(obsDir, { recursive: true });
  writeFileSync(join(obsDir, 'schema.json'), JSON.stringify(options.schema ?? realSchema));
  writeFileSync(
    join(obsDir, 'aliases.json'),
    JSON.stringify(options.aliases ?? { aliases: {}, canonical: {} })
  );
  writeFileSync(
    join(obsDir, 'fusion-pairs.json'),
    JSON.stringify(options.pairs ?? { generated: '2026-11-11', pair_count: 0, pairs: {} })
  );
  for (const [name, content] of Object.entries(options.jsonl ?? {})) {
    const path = join(obsDir, name);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

const curatedPair = (
  components: [string, string],
  claims: { type: string; detail?: string; confidence?: string }[] = [],
  superseded: any[] = []
) => ({
  components,
  claims: claims.map((claim) => ({ detail: 'detail', ...claim })),
  superseded,
  status: 'unverified',
});

const curated = (entries: Record<string, any>) => ({
  generated: '2026-11-11',
  pair_count: Object.keys(entries).length,
  pairs: entries,
});

const row = (overrides: Record<string, any> = {}) =>
  JSON.stringify({
    pair: ['flash', 'freeze'],
    kind: 'name-only',
    text: 'Fusion named in a post.',
    source: { type: 'reddit', url: 'https://example.com/post', date: '2026-11-13' },
    confidence: 'reported',
    ...overrides,
  }) + '\n';

describe('loadCorpus', () => {
  it('returns typed pairs, pair(key), pairCount and the derived partition', () => {
    const root = fixture({
      pairs: curated({
        'bleed+flash': curatedPair(['bleed', 'flash'], [{ type: 'cross-wire' }, { type: 'no-cross-wire' }]),
        'burn+flash': curatedPair(['burn', 'flash'], [{ type: 'no-cross-wire' }]),
        'flash+freeze': curatedPair(['flash', 'freeze'], [{ type: 'cross-wire' }]),
        'flash+poison': curatedPair(['flash', 'poison'], [{ type: 'other' }]),
      }),
    });

    const corpus = loadCorpus(root);
    expect(corpus.pairCount).toBe(4);
    expect(Object.keys(corpus.pairs)).toHaveLength(4);
    expect(corpus.pair('flash+freeze')!.components).toEqual(['flash', 'freeze']);
    expect(corpus.pair('missing+pair')).toBeUndefined();
    expect(corpus.wirePairs()).toEqual({
      wire: ['flash+freeze'],
      noWire: ['burn+flash'],
      disputed: ['bleed+flash'],
    });
    expect(corpus.findings).toEqual([]);
  });

  it('reports a malformed pair entry as a finding instead of throwing from wirePairs()', () => {
    // Regression: readCurated assigned the raw entry before checking it, so a
    // null pair reached hasClaim() and wirePairs() threw a TypeError.
    const root = fixture({
      pairs: { generated: '2026-11-11', pair_count: 1, pairs: { 'flash+freeze': null } },
    });

    const corpus = loadCorpus(root);
    expect(corpus.findings.map((finding) => finding.message)).toContain('pair "flash+freeze" must be an object');
    expect(() => corpus.wirePairs()).not.toThrow();
    expect(corpus.wirePairs()).toEqual({ wire: [], noWire: [], disputed: [] });
  });

  it('reports curated shape findings: count, key order, catalog ids, superseded dates', () => {
    const root = fixture({
      pairs: {
        generated: '2026-11-11',
        pair_count: 99,
        pairs: {
          'flash+freeze': curatedPair(['flash', 'freeze'], [{ type: 'cross-wire' }]),
          'freeze+flash': curatedPair(['freeze', 'flash']),
          'flash+not-a-ball': curatedPair(['flash', 'not-a-ball']),
          'burn+flash': {
            ...curatedPair(['burn', 'flash']),
            superseded: [{ claim: 'x', source: 'y', superseded_by: 'not-a-date' }],
          },
        },
      },
    });

    const messages = loadCorpus(root).findings.map((finding) => finding.message);
    expect(messages).toContain('pair_count 99 does not match 4 pairs');
    expect(messages).toContain('pair key "freeze+flash" is not its sorted components "flash+freeze"');
    expect(messages).toContain('pair "flash+not-a-ball" component "not-a-ball" not in catalog');
    expect(messages).toContain('pair "burn+flash" superseded.superseded_by must be YYYY-MM-DD');
  });

  it("accepts the pair module's canonical key spelling for curated pairs and raw rows", () => {
    // The validator's canonical spelling is src/pair.ts's, not a local
    // sort().join('+') — the module is the one home for pair identity.
    const components: [string, string] = ['freeze', 'flash'];
    const canonical = pairKeyOf(components);
    expect(canonical).toBe('flash+freeze'); // independent literal
    const root = fixture({
      pairs: curated({ [canonical]: curatedPair(components) }),
      jsonl: { 'reddit-2026-11-13.jsonl': row({ pair: components }) },
    });
    // curated: the module's key is accepted as canonical
    expect(loadCorpus(root).findings).toEqual([]);
    // raw: the same components in reverse are not the module's canonical order
    expect(validateCorpus(root).map((finding) => finding.message)).toContain(
      'pair not sorted alphabetically: freeze, flash'
    );
  });

  it('rejects a curated self-pair, mirroring the raw-layer check', () => {
    const root = fixture({
      pairs: curated({ 'flash+flash': curatedPair(['flash', 'flash']) }),
    });
    expect(loadCorpus(root).findings.map((finding) => finding.message)).toContain(
      'pair "flash+flash" cannot fuse a ball with itself'
    );
  });
});

describe('loadRawObservations', () => {
  it('parses top-level waves and skips pending/', () => {
    const root = fixture({
      jsonl: {
        'reddit-2026-11-13.jsonl': row(),
        'pending/risen-ballbylon-2026-11-13.jsonl': row({ pair: ['flash', 'risen-ballbylon'] }),
      },
    });

    const raw = loadRawObservations(root);
    expect(raw.findings).toEqual([]);
    expect(raw.observations).toHaveLength(1);
    expect(raw.observations[0]).toMatchObject({ file: 'reddit-2026-11-13.jsonl', line: 1 });
  });

  it('reports a non-object JSON row as a line finding instead of crashing', () => {
    // Regression: JSON.parse('null') returns null, which validateObservation
    // dereferenced — collapsing the whole raw layer into one unreadable
    // directory-level finding and losing the file:line.
    const root = fixture({ jsonl: { 'reddit-2026-11-13.jsonl': 'null\n' + row() } });
    const raw = loadRawObservations(root);
    expect(raw.findings).toContainEqual(
      expect.objectContaining({ file: 'reddit-2026-11-13.jsonl', line: 1, message: 'row must be a JSON object' })
    );
    expect(raw.observations).toHaveLength(1);
  });

  it('validates claims on non-behavior-claim rows when present', () => {
    const root = fixture({
      jsonl: { 'reddit-2026-11-13.jsonl': row({ kind: 'name-only', claims: [{ type: 'nonsense', detail: 'x' }] }) },
    });
    expect(validateCorpus(root).map((finding) => finding.message)).toContain('bad claim.type: nonsense');
  });

  it('reports catalog, ordering and enum violations', () => {
    const root = fixture({
      jsonl: {
        'reddit-2026-11-13.jsonl':
          row({ pair: ['freeze', 'flash'] }) +
          row({ pair: ['flash', 'risen-ballbylon'] }) +
          row({ kind: 'nonsense' }),
      },
    });

    const messages = validateCorpus(root).map((finding) => finding.message);
    expect(messages).toContain('pair not sorted alphabetically: freeze, flash');
    expect(messages).toContain('pair id "risen-ballbylon" not in catalog');
    expect(messages).toContain('bad kind: nonsense');
  });

  it('takes its enums from schema.json', () => {
    const widened = structuredClone(realSchema);
    widened.properties.kind.enum.push('custom-kind');
    const accepted = fixture({ schema: widened, jsonl: { 'reddit-2026-11-13.jsonl': row({ kind: 'custom-kind' }) } });
    expect(validateCorpus(accepted).map((finding) => finding.message)).not.toContain('bad kind: custom-kind');

    const narrowed = structuredClone(realSchema);
    narrowed.properties.source.properties.type.enum = narrowed.properties.source.properties.type.enum.filter(
      (type: string) => type !== 'reddit'
    );
    const rejected = fixture({ schema: narrowed, jsonl: { 'reddit-2026-11-13.jsonl': row() } });
    expect(validateCorpus(rejected).map((finding) => finding.message)).toContain('bad source.type: reddit');
  });

  it('enforces additionalProperties from schema.json', () => {
    const root = fixture({ jsonl: { 'reddit-2026-11-13.jsonl': row({ unexpected: true }) } });
    expect(validateCorpus(root).map((finding) => finding.message)).toContain('unknown field: unexpected');
  });

  it('validates aliases.json against the catalog', () => {
    const root = fixture({
      aliases: {
        aliases: { nuke: 'nuclear-bomb', bogus: 'not-a-ball' },
        canonical: { flash: 'Flash', 'not-a-ball': 'Nope' },
      },
    });
    const messages = validateCorpus(root).map((finding) => finding.message);
    expect(messages).toContain('alias "bogus" → unknown ball id "not-a-ball"');
    expect(messages).toContain('canonical key "not-a-ball" is not a ball id');
    expect(messages).not.toContain('alias "nuke" → unknown ball id "nuclear-bomb"');
  });
});

describe('validateCorpus', () => {
  it('combines curated-layer and raw-layer findings', () => {
    const root = fixture({
      pairs: { generated: '2026-11-11', pair_count: 5, pairs: {} },
      jsonl: { 'reddit-2026-11-13.jsonl': row({ kind: 'nonsense' }) },
    });

    const messages = validateCorpus(root).map((finding) => finding.message);
    expect(messages).toContain('pair_count 5 does not match 0 pairs');
    expect(messages).toContain('bad kind: nonsense');
  });
});
