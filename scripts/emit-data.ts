#!/usr/bin/env node
/**
 * CLI over generated-data.ts: emits src/data/{tags,balls,passives,characters,
 * level-3}.ts from parsed.json (produced by parse-wiki.ts) + the editorial
 * maps in editorial.ts. Validation runs before any write, so a failing
 * invariant leaves the generated files untouched. Run:
 *   node --experimental-strip-types scripts/emit-data.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { EDITORIAL } from './editorial.ts';
import { runEmitData } from './generated-data.ts';
import type { ParsedFactBases } from './fact-bases.ts';

const OUT = new URL('../src/data/', import.meta.url);
const parsed: ParsedFactBases = JSON.parse(readFileSync(new URL('./parsed.json', OUT), 'utf8'));

const code = runEmitData(parsed, EDITORIAL, (name, content) => {
  writeFileSync(new URL(name, OUT), content);
});
process.exit(code);
