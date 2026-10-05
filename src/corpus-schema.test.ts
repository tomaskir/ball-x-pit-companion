// Corpus schema gate — the harvest corpus (docs/research/fusion-observations/)
// is tracked and consumed by src/corpus.test.ts, so its schema rot must fail
// `npm test` rather than wait for the next manual validator run. The checks
// are the validator's own; this test just invokes them (the CLI remains the
// occasional-refresh entry point — scripts/harvest/validate-observations.ts).
import { readFileSync } from 'node:fs';
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
