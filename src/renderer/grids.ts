// The Balls/Passives grids: tiles are built once; state changes (selection,
// search, characters) only repaint classes/badges on the existing DOM —
// rebuilding would recreate the <img> elements and blink the icons
// (invariant 2). Internal to the renderer facade; the tile registry belongs to
// the renderer instance (createGrids), so two renderers never share tiles.
import { BALLS } from '../data/balls';
import { PASSIVES } from '../data/passives';
import { itemFor, type Item } from '../catalog';
import { recipeHtml } from '../graph';
import type { PainterSeam } from './seam';
import { markClearExempt } from '../clear-exempt';
import { DEPTH_LABELS } from '../depth-labels';
import { icon, verdictBadge } from './dom';
import type { ViewModel } from '../view-state';

/** One renderer instance's grid painters. */
export interface Grids {
  /** Build both item grids once (safe to call again: the registry resets). */
  build(): void;
  /** Repaint selection/search/verdict state on the existing tiles. */
  paint(vm: ViewModel): void;
  /** Drop the tile registry (destroy()). */
  destroy(): void;
}

export function createGrids({ emitAction, attachToast }: PainterSeam): Grids {
  const tiles = new Map<string, { tile: HTMLElement; item: Item }>();

  function buildGrid(gridId: string, items: Item[]) {
    const wrap = document.getElementById(gridId)!;
    wrap.innerHTML = '';

    for (let depth = 0 as 0 | 1 | 2; depth <= 2; depth++) {
      const tier = items.filter((i) => i.depth === depth);
      if (!tier.length) continue;
      const head = document.createElement('h2');
      head.className = 'tier-heading';
      head.textContent = `${DEPTH_LABELS[depth]} (${tier.length})`;
      wrap.appendChild(head);
      const grid = document.createElement('div');
      grid.className = 'tile-grid';
      for (const item of tier) {
        const tile = document.createElement('button');
        tile.className = 'tile';
        tile.dataset.id = item.id;
        // the tile owns its click — an empty-space clear must not fire for it
        markClearExempt(tile);
        // evolved/tier-3 tiles show recipe components inline. All multi-recipe
        // evolutions factorize into per-slot alternates (verified over the whole
        // dataset), so slots render as x+(y/z); single-slot alternates as (x/z).
        const comps = item.depth > 0 ? `<span class="comps">${recipeMarkup(item)}</span>` : '';
        tile.innerHTML = `<img src="${icon(item.icon)}" alt="${item.name}" width="48" height="48" loading="lazy"><span class="nm">${item.name}</span>${comps}`;
        tile.addEventListener('click', (e) => {
          e.stopPropagation();
          emitAction({ type: 'toggleItem', id: item.id });
        });
        attachToast(tile, () => item);
        tiles.set(item.id, { tile, item });
        grid.appendChild(tile);
      }
      wrap.appendChild(grid);
    }
  }

  function build() {
    tiles.clear();
    buildGrid('ballsGrid', BALLS);
    buildGrid('passivesGrid', PASSIVES);
  }

  function paint(vm: ViewModel) {
    for (const { tile, item } of tiles.values()) {
      const t = vm.tiles.get(item.id);
      if (!t) continue;
      tile.classList.remove('selected', 'related', 'dimmed', 'filtered');
      if (t.selected) tile.classList.add('selected');
      else if (t.related) tile.classList.add('related');
      else if (t.dimmed) tile.classList.add('dimmed');
      if (t.filtered) tile.classList.add('filtered');

      // verdict badge: replace in place (cheap, no img recreation)
      tile.querySelector('.ind')?.remove();
      if (t.verdict) tile.appendChild(verdictBadge(t.verdict));
    }
  }

  return {
    build,
    paint,
    destroy() {
      tiles.clear();
    },
  };
}

/** The compact per-slot notation lives in graph.ts beside its
 *  factorizesIntoSlots invariant; this adapter supplies the icon markup
 *  (BASE_URL join) for a component id — null for unknown ids, which the
 *  notation renders as the raw id. */
const recipeMarkup = (item: { recipes: string[][] }): string =>
  recipeHtml(item.recipes, (id) => {
    const comp = itemFor(id);
    return comp ? `<img src="${icon(comp.icon)}" alt="${comp.name}" title="${comp.name}" width="28" height="28">` : null;
  });
