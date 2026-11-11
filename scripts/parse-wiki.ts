#!/usr/bin/env node
/**
 * CLI over fact-bases.ts: parses the hand-maintained fact bases into
 * src/data/parsed.json, which emit-data.ts turns into the generated data
 * files. Run:
 *   node --experimental-strip-types scripts/parse-wiki.ts
 *
 * The parsers themselves are exported from fact-bases.ts and unit-tested
 * there; this file only reads the sources, reports counts, and writes.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { parseFactBases } from './fact-bases.ts';

const OUT = new URL('../src/data/', import.meta.url);

const parsed = parseFactBases({
  mechanics: readFileSync(new URL('../docs/research/game-mechanics.md', import.meta.url), 'utf8'),
  pairings: readFileSync(new URL('../docs/research/character-pairings.md', import.meta.url), 'utf8'),
  level3: readFileSync(new URL('../docs/research/level-3-effects.md', import.meta.url), 'utf8'),
});

// ---------- report ----------
console.log(`balls: ${parsed.balls.length} (depth0=${parsed.balls.filter(b => b.depth === 0).length}, depth1=${parsed.balls.filter(b => b.depth === 1).length}, depth2=${parsed.balls.filter(b => b.depth === 2).length})`);
console.log(`passives: ${parsed.passives.length} (depth0=${parsed.passives.filter(p => p.depth === 0).length}, evolved=${parsed.passives.filter(p => p.depth > 0).length})`);
console.log(`characters: ${parsed.characters.length}`);
console.log(`level-3 effect texts: ${Object.keys(parsed.level3).length}`);

writeFileSync(new URL('./parsed.json', OUT), JSON.stringify(parsed, null, 2));
console.log('wrote src/data/parsed.json');
