// Fact-base parsers — the pure, exported half of the data pipeline. Each
// parser takes the markdown text (parsePairings also takes the parsed
// characters) and returns data; none touches the filesystem, so the tests
// can pin the recipe grammar, the pairing expansion, and the level-3 table
// without running the CLI.
//
// Inputs (hand-maintained):
// - docs/research/game-mechanics.md — balls, passives, characters. Base-roster
//   effect text is verbatim from the wiki; DLC rows are the v1.308 datamine
//   normalized to display values.
// - docs/research/character-pairings.md — the Matchmaker pairing
//   restrictions (game data) into each character's `cannotPair`.
// - docs/research/level-3-effects.md — level-3 effect text for the fusion
//   composer (`level3`; Baby Ball has no per-level table and is omitted).
import { slug } from './slug.ts';
import { resolveDepths } from '../src/graph.ts';
import { parseMarkdownTable, column, type TableRow } from './markdown-table.ts';
import { EDITIONS, type Edition } from './editions.ts';

export interface ParsedBall {
  name: string;
  depth: 0 | 1 | 2;
  recipes: string[][];
  onhit: string;
  effect: string;
  edition: Edition;
}

export interface ParsedPassive {
  name: string;
  depth: 0 | 1 | 2;
  recipes: string[][];
  effect: string;
  edition: Edition;
}

export interface ParsedCharacter {
  name: string;
  baseBall: string | null;
  quirk: string;
  /** Matchmaker-forbidden partners (display names, symmetric). */
  cannotPair?: string[];
  edition: Edition;
}

export interface ParsedFactBases {
  balls: ParsedBall[];
  passives: ParsedPassive[];
  characters: ParsedCharacter[];
  level3: Record<string, string>;
}

export interface FactBaseSources {
  mechanics: string;
  pairings: string;
  level3: string;
}

/** Strip the wiki's bold markers and surrounding whitespace. */
const clean = (s: string): string => s.replace(/\*\*/g, '').trim();

const EDITION_VOCABULARY = new Set<string>(EDITIONS);

/**
 * Read a row's Edition cell. An absent (or blank) cell means base-game: the
 * column was added with the expansion onboarding, and the pre-expansion rows
 * never carried one. An unknown value is a content error, not a default.
 */
function editionOf(row: TableRow): Edition {
  const raw = (row['Edition'] ?? '').trim();
  if (raw === '') return 'base-game';
  if (!EDITION_VOCABULARY.has(raw)) throw new Error(`unknown edition "${raw}"`);
  return raw as Edition;
}

/**
 * Resolve structural depth for a namespace's evolved entities. Depth
 * resolution (cache + cycle guard + structuralDepth tier rule) lives in
 * graph.ts — one resolver per namespace, called here for balls and passives.
 */
function withStructuralDepth<T extends { name: string; recipes: string[][] }>(entries: T[]): (T & { depth: 0 | 1 | 2 })[] {
  const ids = new Set(entries.map((e) => slug(e.name)));
  const depths = resolveDepths(
    entries.map((e) => slug(e.name)),
    ids,
    (id) => entries.find((e) => slug(e.name) === id)?.recipes ?? [],
  );
  return entries.map((e) => ({ ...e, depth: depths.get(slug(e.name))! }));
}

/** Split a recipe cell into recipes: string[][] (OR-of-ANDs). */
export function parseRecipes(cell: string): string[][] {
  // e.g. "Iron + (Ghost or Dark)" ; "Burn + Wind + Freeze + Earthquake"
  // "Deadeye's Cross + Gracious Impaler" — component may itself be an evolved ball.
  const c = clean(cell).replace(/\s*\(\s*4-way\s*\)/i, '');
  const alts = c.split(' or ').map((s) => s.replace(/[()]/g, '').trim());
  // "A or B" as full-cell alternates vs "(X or Y)" inside a slot.
  if (alts.length > 1 && !c.includes('+')) {
    // whole-cell alternates (not present in current data, but tolerated)
    return alts.map((a) => [slug(a)]);
  }
  // slots separated by "+"
  const slots = c.split('+').map((s) => s.trim());
  let recipes: string[][] = [[]];
  for (const slot of slots) {
    const m = slot.match(/^\((.*)\)$/);
    const opts = m ? m[1].split(/\bor\b/).map((o) => o.trim()) : [slot];
    recipes = recipes.flatMap((r) => opts.map((o) => [...r, slug(clean(o))]));
  }
  return recipes;
}

/** One entity plus the recipes accumulated across its adjacent duplicate rows. */
interface RecipeGroup {
  row: TableRow;
  recipes: string[][];
}

/** Identity key for a recipe: its component slugs in order. */
const recipeKey = (recipe: string[]): string => recipe.join('\u0000');

/**
 * Collapse adjacent rows that share `nameColumn` into one entity. The
 * onboarding contract writes recipes that cannot be factorized into a slot
 * alternate as adjacent duplicate rows (one row per recipe, every non-recipe
 * cell repeated verbatim); this unions their recipes in row order, dedupes
 * identical recipes, and throws when any other cell differs. A repeated name
 * that is not adjacent is a separate entity (the fact base does not use that
 * form).
 */
function groupRecipeRows(
  rows: TableRow[],
  nameColumn: string,
  recipeColumn: string,
  label: string,
): RecipeGroup[] {
  const groups: RecipeGroup[] = [];
  for (const row of rows) {
    const name = clean(column(row, nameColumn));
    const last = groups[groups.length - 1];
    if (last && clean(column(last.row, nameColumn)) === name) {
      for (const key of Object.keys(row)) {
        if (key === recipeColumn) continue;
        if (last.row[key] !== row[key]) {
          throw new Error(`${label}: duplicate row for ${name} differs in "${key}"`);
        }
      }
      for (const recipe of parseRecipes(column(row, recipeColumn))) {
        if (!last.recipes.some((existing) => recipeKey(existing) === recipeKey(recipe))) {
          last.recipes.push(recipe);
        }
      }
    } else {
      groups.push({ row, recipes: parseRecipes(column(row, recipeColumn)) });
    }
  }
  return groups;
}

/** Parse one evolved table and collapse its adjacent duplicate recipe rows. */
function parseEvolvedRows(
  md: string,
  headerRe: RegExp,
  nameColumn: string,
  recipeColumn: string,
  label: string,
): RecipeGroup[] {
  return groupRecipeRows(parseMarkdownTable(md, headerRe, label), nameColumn, recipeColumn, label);
}

/** Parse the game-mechanics fact base: balls, passives, characters. */
export function parseGameMechanics(md: string): {
  balls: ParsedBall[];
  passives: ParsedPassive[];
  characters: ParsedCharacter[];
} {
  // ---------- balls ----------
  const balls: ParsedBall[] = [];

  // Base balls (depth 0): table 1.1 — columns: Ball | On-hit | Status trigger | Status effect | Effect text | Character(s) | Unlock
  for (const row of parseMarkdownTable(md, /^\| Ball \| On-hit effect \|/, 'ball table')) {
    balls.push({
      name: clean(column(row, 'Ball')),
      depth: 0,
      recipes: [],
      onhit: clean(column(row, 'On-hit effect')),
      effect: clean(column(row, 'Effect text (wiki)')),
      edition: editionOf(row),
    });
  }
  balls.push({ name: 'Baby Ball', depth: 0, recipes: [], onhit: '', effect: 'Base attack ball, no special abilities. All characters start with a few except The Empty Nester and The Makeshift Sisyphus.', edition: 'base-game' });

  // Evolved balls (depth 1|2): table 1.2 — columns: Ball | Depth | Recipe(s) | On-hit | Status effects | Effect text
  // Depth is computed from recipe structure, not the wiki's loose Evo/Tier-3
  // labels (which put e.g. Tumor — built from evolved Radiation Beam — in "Evo"):
  //   depth 1 (Tier-2) = recipe includes an evolved ball as a component
  //   depth 2 (Tier-3) = recipe includes a tier-2 ball as a component
  const evo = parseEvolvedRows(
    md,
    /^\| Ball \| Depth \|/,
    'Ball',
    'Recipe(s)',
    'evolved ball table',
  ).map(({ row, recipes }) => ({
    name: clean(column(row, 'Ball')),
    recipes,
    onhit: clean(column(row, 'On-hit')),
    effect: clean(column(row, 'Effect text (wiki)')),
    edition: editionOf(row),
  }));
  for (const ent of withStructuralDepth(evo)) {
    balls.push({ name: ent.name, depth: ent.depth, recipes: ent.recipes, onhit: ent.onhit, effect: ent.effect, edition: ent.edition });
  }

  // ---------- passives ----------
  const passives: ParsedPassive[] = [];
  // Base passives (depth 0): Passive | Effect text | Appearance requirement | Unlock
  for (const row of parseMarkdownTable(md, /^\| Passive \| Effect text \(wiki\) \|/, 'passive table')) {
    passives.push({ name: clean(column(row, 'Passive')), depth: 0, recipes: [], effect: clean(column(row, 'Effect text (wiki)')), edition: editionOf(row) });
  }
  // Evolved passives (depth 1|2): Passive | Recipe | Effect text — same
  // structural depth computation as balls.
  const evoPas = parseEvolvedRows(
    md,
    /^\| Passive \| Recipe \|/,
    'Passive',
    'Recipe',
    'evolved passive table',
  ).map(({ row, recipes }) => ({
    name: clean(column(row, 'Passive')),
    recipes,
    effect: clean(column(row, 'Effect text (wiki)')),
    edition: editionOf(row),
  }));
  for (const ent of withStructuralDepth(evoPas)) {
    passives.push({ name: ent.name, depth: ent.depth, recipes: ent.recipes, effect: ent.effect, edition: ent.edition });
  }

  // ---------- characters ----------
  const characters: ParsedCharacter[] = [];
  // Character | Base ball | Ability | Unlock | Synergy facts
  for (const row of parseMarkdownTable(md, /^\| Character \| Base ball \|/, 'character table')) {
    const baseBall = column(row, 'Base ball');
    characters.push({
      name: clean(column(row, 'Character')),
      baseBall: baseBall.trim() === '*none*' ? null : clean(baseBall),
      quirk: clean(column(row, 'Ability (wiki text, abridged)')),
      edition: editionOf(row),
    });
  }

  return { balls, passives, characters };
}

/**
 * Parse the Matchmaker pairing table and expand the relation once. The doc
 * lists each forbidden pair once; the game darkens both directions, so the
 * symmetric expansion happens here — validation only checks the result.
 * `*all*` = the False Messiah's rule: pairs with nobody, in either slot.
 */
export function parsePairings(md: string, characters: ParsedCharacter[]): ParsedCharacter[] {
  const rows = parseMarkdownTable(md, /^\| Character \| Cannot pair with \|/, 'pairing table');
  const byName = new Map(characters.map((c) => [c.name, c]));
  const cannotPair = new Map<string, string[]>(characters.map((c) => [c.name, []]));

  for (const row of rows) {
    const name = clean(column(row, 'Character'));
    const cannotCell = column(row, 'Cannot pair with');
    const ch = byName.get(name);
    if (!ch) throw new Error(`pairing row for unknown character: ${name}`);
    const others = characters.filter((c) => c.name !== ch.name).map((c) => c.name);
    cannotPair.set(
      ch.name,
      cannotCell.startsWith('*all*')
        ? others
        : cannotCell.split(',').map((s) => clean(s)).filter((s) => s.length > 0),
    );
  }

  // the relation itself is symmetric (the game darkens both directions)
  for (const ch of characters) {
    for (const partner of cannotPair.get(ch.name)!) {
      const p = byName.get(partner);
      if (!p) throw new Error(`pairing row for ${ch.name}: unknown partner "${partner}"`);
      const partners = cannotPair.get(p.name)!;
      if (!partners.includes(ch.name)) partners.push(ch.name);
    }
  }

  return characters.map((c) => ({ ...c, cannotPair: cannotPair.get(c.name)! }));
}

/** Parse the level-3 effect-text table into id → text (Baby Ball is omitted). */
export function parseLevel3(md: string): Record<string, string> {
  const level3: Record<string, string> = {};
  for (const row of parseMarkdownTable(md, /^\| Ball \| Level-3 effect text \|/, 'level-3 table')) {
    const text = column(row, 'Level-3 effect text');
    // Baby Ball has no per-level table and is not fusable — the row is "—".
    if (!text || text === '—' || text === '-') continue;
    level3[slug(clean(column(row, 'Ball')))] = clean(text);
  }
  return level3;
}

/** Parse all three hand-maintained fact bases into the parsed.json shape. */
export function parseFactBases(sources: FactBaseSources): ParsedFactBases {
  const { balls, passives, characters } = parseGameMechanics(sources.mechanics);
  return {
    balls,
    passives,
    characters: parsePairings(sources.pairings, characters),
    level3: parseLevel3(sources.level3),
  };
}
