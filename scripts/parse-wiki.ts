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
import { slug } from './slug.ts';
import { structuralDepth } from '../src/graph.ts';

const SRC = new URL('../docs/research/game-mechanics.md', import.meta.url);
const OUT = new URL('../src/data/', import.meta.url);

const md = readFileSync(SRC, 'utf8');

// ---------- helpers ----------

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
// Depth is computed from recipe structure, not the wiki's loose Evo/Tier-3
// labels (which put e.g. Tumor — built from evolved Radiation Beam — in "Evo"):
//   depth 1 (Tier-2) = recipe includes an evolved ball as a component
//   depth 2 (Tier-3) = recipe includes a tier-2 ball as a component
const evoRows = parseTable(/^\| Ball \| Depth \|/m);
const evo = evoRows.map(([name, , recipeCell, onhit, , effect]) => ({
  name: clean(name),
  recipes: parseRecipes(recipeCell),
  onhit: clean(onhit),
  effect: clean(effect),
}));
const evoIds = new Set(evo.map((e) => slug(e.name)));
// depthOf(component) is the component's own tier; this entity sits one above.
// The tier rule itself lives in graph.ts (structuralDepth) — the parser only
// supplies the recursive component resolver (cache + cycle guard).
const depthOf = (id, cache = new Map()) => {
  if (!evoIds.has(id)) return 0; // base ball component
  if (cache.has(id)) return cache.get(id);
  cache.set(id, 1); // guard against cycles
  const ent = evo.find((e) => slug(e.name) === id);
  const d = structuralDepth(ent.recipes, (c) => evoIds.has(c), (c) => depthOf(c, cache));
  cache.set(id, d);
  return d;
};
for (const ent of evo) {
  const depth = depthOf(slug(ent.name));
  balls.push({ name: ent.name, depth, recipes: ent.recipes, onhit: ent.onhit, effect: ent.effect });
}

// ---------- passives ----------
const passives = [];
// Base passives (depth 0): Passive | Effect text | Appearance requirement | Unlock
for (const [name, effect] of parseTable(/^\| Passive \| Effect text \(wiki\) \|/m)) {
  passives.push({ name: clean(name), depth: 0, recipes: [], effect: clean(effect) });
}
// Evolved passives (depth 1|2): Passive | Recipe | Effect text — same
// structural depth computation as balls.
const evoPassives = parseTable(/^\| Passive \| Recipe \|/m);
const evoPas = evoPassives.map(([name, recipeCell, effect]) => ({
  name: clean(name),
  recipes: parseRecipes(recipeCell),
  effect: clean(effect),
}));
const evoPasIds = new Set(evoPas.map((e) => slug(e.name)));
// Same resolver shape as depthOf — structuralDepth carries the tier rule.
const depthOfPas = (id, cache = new Map()) => {
  if (!evoPasIds.has(id)) return 0;
  if (cache.has(id)) return cache.get(id);
  cache.set(id, 1);
  const ent = evoPas.find((e) => slug(e.name) === id);
  const d = structuralDepth(ent.recipes, (c) => evoPasIds.has(c), (c) => depthOfPas(c, cache));
  cache.set(id, d);
  return d;
};
for (const ent of evoPas) {
  const depth = depthOfPas(slug(ent.name));
  passives.push({ name: ent.name, depth, recipes: ent.recipes, effect: ent.effect });
}

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
