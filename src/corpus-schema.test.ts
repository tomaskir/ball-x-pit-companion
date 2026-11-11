// Corpus schema gate — the harvest corpus (docs/research/fusion-observations/)
// is tracked and consumed by src/corpus.test.ts, so its schema rot must fail
// `npm test` rather than wait for the next manual validator run. The checks
// are the validator's own; this test just invokes them (the CLI remains the
// occasional-refresh entry point — scripts/harvest/validate-observations.ts).
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { validateObservations } from '../scripts/harvest/validate-observations';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

describe('fusion-observation corpus schema (the gate)', () => {
  it('every jsonl line conforms to the schema contract', () => {
    const findings = validateObservations(repoRoot).filter((f) => !f.warning);
    expect(
      findings.map((f) => (f.line === undefined ? `${f.file}: ${f.message}` : `${f.file}:${f.line}: ${f.message}`)),
      'corpus schema violations'
    ).toEqual([]);
  });

  it('the corpus the gate just validated is the one corpus.test.ts reads', () => {
    // Guard against the two tests drifting onto different directories.
    const obsDir = fileURLToPath(new URL('../docs/research/fusion-observations/', import.meta.url));
    expect(readFileSync(`${obsDir}fusion-pairs.json`, 'utf8')).toContain('"pair_count"');
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
      mkdirSync(join(root, 'src/data'), { recursive: true });
      writeFileSync(join(root, 'src/data/balls.ts'), 'export const balls = [{ "id": "flash" }, { "id": "freeze" }];\n');
      writeFileSync(join(obsDir, 'aliases.json'), JSON.stringify({ aliases: {}, canonical: {} }));
      writeFileSync(join(obsDir, 'reddit-2026-11-13.jsonl'), row(['flash', 'freeze']));
      writeFileSync(join(obsDir, 'pending/risen-ballbylon-2026-11-13.jsonl'), row(['flash', 'risen-ballbylon']));

      expect(validateObservations(root)).toEqual([]);

      // Promotion = move the staged row into the top-level wave: the same row
      // now fails the gate until the catalog gains the id.
      writeFileSync(join(obsDir, 'reddit-2026-11-13.jsonl'), row(['flash', 'risen-ballbylon']));
      expect(validateObservations(root).map((f) => f.message)).toContain(
        'pair id "risen-ballbylon" not in catalog'
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
