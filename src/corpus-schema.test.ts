// Corpus schema gate — the harvest corpus (docs/research/fusion-observations/)
// is tracked and consumed by src/corpus.test.ts, so its schema rot must fail
// `npm test` rather than wait for the next manual validator run. The checks
// live in src/corpus.ts (the corpus module); this test just invokes them (the
// CLI remains the occasional-refresh entry point —
// scripts/harvest/validate-observations.ts).
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { loadCorpus, validateCorpus } from './corpus';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const realSchema = readFileSync(join(repoRoot, 'docs/research/fusion-observations/schema.json'), 'utf8');

describe('fusion-observation corpus schema (the gate)', () => {
  it('every jsonl line conforms to the schema contract', () => {
    const findings = validateCorpus(repoRoot).filter((f) => !f.warning);
    expect(
      findings.map((f) => (f.line === undefined ? `${f.file}: ${f.message}` : `${f.file}:${f.line}: ${f.message}`)),
      'corpus schema violations'
    ).toEqual([]);
  });

  it('the curated corpus loads from the same root the gate validates', () => {
    // Guard against the two tests drifting onto different directories: both
    // now cross the same module seam with the same root. The 370 pin lives in
    // corpus.test.ts; this only proves the curated layer is the one the raw
    // gate just read.
    const corpus = loadCorpus(repoRoot);
    expect(corpus.findings).toEqual([]);
    expect(corpus.pair('flash+freeze')).toBeDefined();
  });
});

describe('pending/ staging is outside the schema gate', () => {
  // Regression: a pending row naming an uncataloged id (a DLC ball not yet in
  // src/data/balls.ts) must not fail the gate. Promotion moves the row to a
  // top-level dated wave, where the catalog check applies again.
  const row = (pair: [string, string]) =>
    JSON.stringify({
      pair,
      kind: 'name-only',
      text: 'Fusion named in a post.',
      source: { type: 'reddit', url: 'https://example.com/post', date: '2026-11-13' },
      confidence: 'reported',
    }) + '\n';

  it('skips pending/ but still validates top-level dated wave files', () => {
    const root = mkdtempSync(join(tmpdir(), 'corpus-gate-'));
    try {
      const obsDir = join(root, 'docs/research/fusion-observations');
      mkdirSync(join(obsDir, 'pending'), { recursive: true });
      writeFileSync(join(obsDir, 'schema.json'), realSchema);
      writeFileSync(join(obsDir, 'aliases.json'), JSON.stringify({ aliases: {}, canonical: {} }));
      writeFileSync(
        join(obsDir, 'fusion-pairs.json'),
        JSON.stringify({ generated: '2026-11-13', pair_count: 0, pairs: {} })
      );
      writeFileSync(join(obsDir, 'reddit-2026-11-13.jsonl'), row(['flash', 'freeze']));
      writeFileSync(join(obsDir, 'pending/risen-ballbylon-2026-11-13.jsonl'), row(['flash', 'risen-ballbylon']));

      expect(validateCorpus(root)).toEqual([]);

      // Promotion = move the staged row into the top-level wave: the same row
      // now fails the gate until the catalog gains the id.
      writeFileSync(join(obsDir, 'reddit-2026-11-13.jsonl'), row(['flash', 'risen-ballbylon']));
      expect(validateCorpus(root).map((f) => f.message)).toContain(
        'pair id "risen-ballbylon" not in catalog'
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
