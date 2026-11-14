// Tests for the edition-gate module: the content filter's pure rules. The
// gate is content visibility, not a game-version switch — a recipe is
// available iff every component's edition is enabled, and a fusion is
// visible iff both components are.
import { describe, it, expect } from 'vitest';
import {
  DEFAULT_EDITIONS,
  availableRecipes,
  fusionVisible,
  isEdition,
  isEditionEnabled,
  isVisible,
  recipeAvailable,
  visibleItems,
} from './edition-gate';
import { ballMap, passiveMap } from './catalog';
import { BALLS } from './data/balls';

const BASE = ['base-game'] as const;
const BOTH = ['base-game', 'dlc-risen-ballbylon'] as const;

describe('edition gate: vocabulary and visibility', () => {
  it('defaults to base-game only', () => {
    expect(DEFAULT_EDITIONS).toEqual(['base-game']);
  });

  it('recognizes exactly the vocabulary', () => {
    expect(isEdition('base-game')).toBe(true);
    expect(isEdition('dlc-risen-ballbylon')).toBe(true);
    expect(isEdition('future-edition')).toBe(false);
    expect(isEdition(5)).toBe(false);
  });

  it('an entity is visible iff its own edition is enabled', () => {
    const beast = ballMap.get('beast')!; // DLC
    const bleed = ballMap.get('bleed')!; // base
    expect(isVisible(BASE, beast)).toBe(false);
    expect(isVisible(BASE, bleed)).toBe(true);
    expect(isVisible(BOTH, beast)).toBe(true);
    expect(isEditionEnabled([], bleed.edition)).toBe(false);
  });

  it('visibleItems filters in input order', () => {
    const visible = visibleItems(BALLS, BASE);
    expect(visible.some((ball) => ball.id === 'bleed')).toBe(true);
    expect(visible.some((ball) => ball.id === 'beast')).toBe(false);
    expect(visible.every((ball) => ball.edition === 'base-game')).toBe(true);
  });
});

describe('edition gate: recipes', () => {
  const resolveBall = (id: string) => ballMap.get(id);
  const resolvePassive = (id: string) => passiveMap.get(id);

  it('a recipe is available iff every component edition is enabled', () => {
    // Blizzard = Freeze + (Wind or Lightning or Water); Water is DLC.
    const freezeWind = ['freeze', 'wind'];
    const freezeWater = ['freeze', 'water'];
    expect(recipeAvailable(freezeWind, BASE, resolveBall)).toBe(true);
    expect(recipeAvailable(freezeWater, BASE, resolveBall)).toBe(false);
    expect(recipeAvailable(freezeWater, BOTH, resolveBall)).toBe(true);
  });

  it('an unresolved component makes the recipe unavailable', () => {
    expect(recipeAvailable(['freeze', 'not-a-ball'], BOTH, resolveBall)).toBe(false);
  });

  it('an empty recipe (a base entity) is trivially available', () => {
    expect(recipeAvailable([], BASE, resolveBall)).toBe(true);
  });

  it('availableRecipes keeps the surviving recipes in order', () => {
    const blizzard = ballMap.get('blizzard')!;
    expect(availableRecipes(blizzard, BASE, resolveBall)).toEqual([
      ['freeze', 'wind'],
      ['freeze', 'lightning'],
    ]);
    expect(availableRecipes(blizzard, BOTH, resolveBall)).toEqual(blizzard.recipes);
  });

  it('a base ball whose extra recipe hides stays visible with its base recipe', () => {
    // Blizzard is base content; only its Water recipe hides with the expansion
    // off — the ball itself stays.
    expect(isVisible(BASE, ballMap.get('blizzard')!)).toBe(true);
    expect(availableRecipes(ballMap.get('blizzard')!, BASE, resolveBall)).toHaveLength(2);
  });

  it('passive recipes use the passive namespace', () => {
    // Deadeye's Impaler = Deadeye's Cross + Gracious Impaler (both passives)
    const impaler = passiveMap.get('deadeyes-impaler')!;
    expect(availableRecipes(impaler, BASE, resolvePassive)).toEqual(impaler.recipes);
  });
});

describe('edition gate: fusion visibility', () => {
  it('a fusion is visible iff both components are enabled', () => {
    const beast = ballMap.get('beast')!; // DLC
    const bleed = ballMap.get('bleed')!; // base
    expect(fusionVisible(bleed, bleed, BASE)).toBe(true);
    expect(fusionVisible(bleed, beast, BASE)).toBe(false);
    expect(fusionVisible(beast, bleed, BASE)).toBe(false);
    expect(fusionVisible(beast, bleed, BOTH)).toBe(true);
  });
});
