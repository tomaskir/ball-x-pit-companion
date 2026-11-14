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
  return recipe.every((id) => {
    const component = resolve(id);
    return component !== undefined && enabled.includes(component.edition);
  });
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
 * Highlight walks, complexity, and the build graph all read the same gated
 * shape, so a hidden component can never appear in a visible item's chain.
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
