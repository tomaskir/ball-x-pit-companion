#!/usr/bin/env node
/**
 * Parses docs/research/game-mechanics.md (research fact base) into
 * src/data/{balls,passives,characters}.ts. Run: node scripts/parse-wiki.ts
 *
 * Effect text is taken verbatim from the wiki tables. Tags are assigned
 * from the proposed synergy vocabulary (section 4 of the fact base),
 * derived from each entity's on-hit/status/effect columns.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const SRC = new URL('../docs/research/game-mechanics.md', import.meta.url);
const OUT = new URL('../src/data/', import.meta.url);

const md = readFileSync(SRC, 'utf8');

// ---------- helpers ----------
const slug = (name) => {
  const ABBREV = {
    'laser-h': 'laser-horizontal', 'laser-v': 'laser-vertical',
    'diamond': 'diamond-hilted-dagger', 'sapphire': 'sapphire-hilted-dagger',
    'ruby': 'ruby-hilted-dagger', 'emerald': 'emerald-hilted-dagger',
  };
  const s = name.toLowerCase()
    .replace(/'/g, '') // "Archer's Effigy" → archers-effigy (matches icon filenames)
    .replace(/\(horizontal\)/, 'horizontal').replace(/\(vertical\)/, 'vertical')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return ABBREV[s] ?? s;
};

const clean = (s) => s.replace(/\*\*/g, '').trim();

/** Parse a markdown table (by header prefix) into array of row objects. */
function parseTable(headerRe) {
  const lines = md.split('\n');
  const out = [];
  let idx = 0;
  while (idx < lines.length && !headerRe.test(lines[idx])) idx++;
  if (idx === lines.length) throw new Error(`table not found: ${headerRe}`);
  idx += 2; // skip header + separator
  for (; idx < lines.length; idx++) {
    const line = lines[idx];
    if (!line.startsWith('|')) break;
    const cells = line.split('|').slice(1, -1).map(c => c.trim());
    out.push(cells);
  }
  return out;
}

/** Split a recipe cell into recipes: string[][] (OR-of-ANDs). */
function parseRecipes(cell) {
  // e.g. "Iron + (Ghost or Dark)" ; "Burn + Wind + Freeze + Earthquake"
  // "Deadeye's Cross + Gracious Impaler" — component may itself be an evolved ball.
  const c = clean(cell).replace(/\s*\(\s*4-way\s*\)/i, '');
  const alts = c.split(' or ').map(s => s.replace(/[()]/g, '').trim());
  // "A or B" as full-cell alternates vs "(X or Y)" inside a slot.
  if (alts.length > 1 && !c.includes('+')) {
    // whole-cell alternates (not present in current data, but tolerated)
    return alts.map(a => [slug(a)]);
  }
  // slots separated by "+"
  const slots = c.split('+').map(s => s.trim());
  let recipes = [[]];
  for (const slot of slots) {
    const m = slot.match(/^\((.*)\)$/);
    const opts = m ? m[1].split(/\bor\b/).map(o => o.trim()) : [slot];
    recipes = recipes.flatMap(r => opts.map(o => [...r, slug(clean(o))]));
  }
  return recipes;
}

// ---------- balls ----------
const balls = [];

// Base balls (depth 0): table 1.1 — columns: Ball | On-hit | Status trigger | Status effect | Effect text | Character(s) | Unlock
for (const [name, onhit, , , effect] of parseTable(/^\| Ball \| On-hit effect \|/m)) {
  balls.push({ name: clean(name), depth: 0, recipes: [], onhit: clean(onhit), effect: clean(effect) });
}
balls.push({ name: 'Baby Ball', depth: 0, recipes: [], onhit: '', effect: 'Base attack ball, no special abilities. All characters start with a few except The Empty Nester and The Makeshift Sisyphus.' });

// Evolved balls (depth 1|2): table 1.2 — columns: Ball | Depth | Recipe(s) | On-hit | Status effects | Effect text
const TIER3 = new Set(['Armageddon', 'Banshee', 'Black Hole', 'Mosquito Kingdom', 'Nosferatu', 'Reaper', 'Satan', 'Sniper', 'X Ray']);
const evoRows = parseTable(/^\| Ball \| Depth \|/m);
for (const [name, depthCell, recipeCell, onhit, , effect] of evoRows) {
  const depth = TIER3.has(clean(name)) ? 2 : 1;
  balls.push({ name: clean(name), depth, recipes: parseRecipes(recipeCell), onhit: clean(onhit), effect: clean(effect) });
}

// ---------- passives ----------
const passives = [];
// Base passives (depth 0): Passive | Effect text | Appearance requirement | Unlock
for (const [name, effect] of parseTable(/^\| Passive \| Effect text \(wiki\) \|/m)) {
  passives.push({ name: clean(name), depth: 0, recipes: [], effect: clean(effect) });
}
// Evolved passives (depth 1): Passive | Recipe | Effect text
const evoPassives = parseTable(/^\| Passive \| Recipe \|/m);
for (const [name, recipeCell, effect] of evoPassives) {
  passives.push({ name: clean(name), depth: 1, recipes: parseRecipes(recipeCell), effect: clean(effect) });
}
// Deadeye's Impaler is tier-3-equivalent (built from Deadeye's Cross, itself evolved)
for (const p of passives) if (p.name === "Deadeye's Impaler") p.depth = 2;

// ---------- characters ----------
const characters = [];
// Character | Base ball | Ability | Unlock | Synergy facts
for (const [name, baseBall, ability] of parseTable(/^\| Character \| Base ball \|/m)) {
  characters.push({
    name: clean(name),
    baseBall: baseBall.trim() === '*none*' ? null : clean(baseBall),
    quirk: clean(ability),
  });
}

// ---------- report ----------
console.log(`balls: ${balls.length} (depth0=${balls.filter(b => b.depth === 0).length}, depth1=${balls.filter(b => b.depth === 1).length}, depth2=${balls.filter(b => b.depth === 2).length})`);
console.log(`passives: ${passives.length} (depth0=${passives.filter(p => p.depth === 0).length}, evolved=${passives.filter(p => p.depth > 0).length})`);
console.log(`characters: ${characters.length}`);

writeFileSync(new URL('./parsed.json', OUT), JSON.stringify({ balls, passives, characters }, null, 2));
console.log('wrote src/data/parsed.json');
