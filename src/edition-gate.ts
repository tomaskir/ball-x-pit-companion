// Edition-gate module: the content filter's pure rules. The filter's state
// is the enabled-edition list (view-state owns it); this module answers the
// three questions every screen asks of it, in one place:
//   - is an entity visible? (its own edition is enabled)
//   - is a recipe available? (every component's edition is enabled)
//   - is a fusion visible? (both components are enabled)
// Recipes and level-3 texts carry no edition of their own — they inherit
// from their components/ball. The gate is content visibility, not a
// game-version switch: base-game corrections always apply.
//
// The vocabulary itself is generated data (src/data/editions.ts); the
// default — a first visit shows base-game content only — is a domain
// decision and lives here.
import { EDITIONS, type Edition } from './data/editions';
import type { GraphItem } from './graph';

/** A first visit shows base-game content only. */
export const DEFAULT_EDITIONS: readonly Edition[] = ['base-game'];

/** The enabled list in canonical vocabulary order, deduped. Every state
 *  transition and the codec use this one ordering rule. */
export function canonicalEditions(enabled: readonly Edition[]): Edition[] {
  const set = new Set(enabled);
  return EDITIONS.filter((edition) => set.has(edition));
}

/** Whether a raw value names a known edition (the codec's shape guard). */
export const isEdition = (value: unknown): value is Edition =>
  typeof value === 'string' && (EDITIONS as readonly string[]).includes(value);

/** The one "is this edition enabled?" test. */
export const isEditionEnabled = (enabled: readonly Edition[], edition: Edition): boolean =>
  enabled.includes(edition);

/** An entity carrying its edition (balls, passives, characters). */
export interface Editioned {
  edition: Edition;
}

/** Whether an entity's own edition is enabled. */
export const isVisible = (enabled: readonly Edition[], entity: Editioned): boolean =>
  isEditionEnabled(enabled, entity.edition);

/** The entities whose own edition is enabled, in input order. */
export const visibleItems = <T extends Editioned>(items: readonly T[], enabled: readonly Edition[]): T[] =>
  items.filter((item) => isVisible(enabled, item));

/** Whether a component id resolves and its edition is enabled — the one
 *  component-visibility predicate behind both recipe gates. An unresolved
 *  component counts as hidden: the filter cannot show what it cannot resolve. */
const componentVisible = (
  resolve: (id: string) => Editioned | undefined,
  enabled: readonly Edition[],
  id: string,
): boolean => {
  const component = resolve(id);
  return component !== undefined && enabled.includes(component.edition);
};

/**
 * A recipe is available iff every component's edition is enabled. An
 * unresolved component makes the recipe unavailable: the filter cannot show
 * a recipe whose component it cannot resolve.
 */
export function recipeAvailable(
  recipe: readonly string[],
  enabled: readonly Edition[],
  resolve: (id: string) => Editioned | undefined,
): boolean {
  return recipe.every((id) => componentVisible(resolve, enabled, id));
}

/** An item's recipes that survive the edition gate, in recipe order. */
export function availableRecipes<T extends { recipes: string[][] }>(
  item: T,
  enabled: readonly Edition[],
  resolve: (id: string) => Editioned | undefined,
): string[][] {
  return item.recipes.filter((recipe) => recipeAvailable(recipe, enabled, resolve));
}

/** A fusion is visible iff both components' editions are enabled. */
export function fusionVisible(a: Editioned, b: Editioned, enabled: readonly Edition[]): boolean {
  return enabled.includes(a.edition) && enabled.includes(b.edition);
}

/**
 * One namespace's graph with every item's recipes gated: the items and their
 * order are unchanged, only recipes with a hidden component are removed.
 * The build graph (including its complexity) reads this gated shape, so a
 * hidden component can never appear in a visible item's build chain.
 */
export function gatedGraph<T extends GraphItem & Editioned>(
  graph: Map<string, T>,
  enabled: readonly Edition[],
): Map<string, T> {
  const gated = new Map<string, T>();
  for (const [id, item] of graph) {
    gated.set(id, { ...item, recipes: availableRecipes(item, enabled, (component) => graph.get(component)) });
  }
  return gated;
}

/**
 * The highlight walk's graph: only visible items, with each recipe narrowed
 * to its visible components (a recipe left with no visible component is
 * dropped). Unlike `gatedGraph`, which drops a whole recipe when any
 * component is hidden — a build path must be fully available — the highlight
 * walk keeps the visible half: a visible component still relates to its
 * visible sibling (Baby Armor's Hand Me Downs while Iron Onesie is filtered
 * out). Hidden ids never enter the walk, in either direction. This is not a
 * build shape: a visible evolved item may keep `depth > 0` with no visible
 * recipe left, so consumers must not infer base-ness from empty recipes.
 */
export function visibleGraph<T extends GraphItem & Editioned>(
  graph: Map<string, T>,
  enabled: readonly Edition[],
): Map<string, T> {
  const resolve = (id: string) => graph.get(id);
  const visible = new Map<string, T>();
  for (const [id, item] of graph) {
    if (!isVisible(enabled, item)) continue;
    const recipes = item.recipes
      .map((recipe) => recipe.filter((component) => componentVisible(resolve, enabled, component)))
      .filter((recipe) => recipe.length > 0);
    visible.set(id, { ...item, recipes });
  }
  return visible;
}
