// The Balls/Passives grids: tiles are built once; state changes (selection,
// search, characters, the edition filter) only repaint classes/attributes on
// the existing DOM — rebuilding would recreate the <img> elements and blink
// the icons (invariant 2). The edition filter hides a tile with the hidden
// attribute (absent, not dimmed) and repaints each tier heading's count; a
// grid with no visible tile shows the one filter hint. Internal to the
// renderer facade; the tile registry belongs to the renderer instance
// (createGrids), so two renderers never share tiles.
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

/** One tier's heading (the edition filter repaints the count and hides the
 *  heading when the tier has no visible items). */
interface GridSection {
  heading: HTMLElement;
  depth: 0 | 1 | 2;
}

interface GridEls {
  empty: HTMLElement;
  sections: GridSection[];
}

/** The one empty-screen hint — the content filter leaves nothing to show. */
const EMPTY_HINT = 'No content matches the current filters.';

export function createGrids({ emitAction, attachToast }: PainterSeam): Grids {
  const tiles = new Map<string, { tile: HTMLElement; item: Item }>();
  const grids = new Map<string, GridEls>();

  function buildGrid(gridId: string, items: Item[]) {
    const wrap = document.getElementById(gridId)!;
    wrap.innerHTML = '';

    // the empty-screen hint is built once and toggled by paint — the content
    // filter hides every tile without removing any <img>
    const empty = document.createElement('p');
    empty.className = 'empty-filter-hint';
    empty.textContent = EMPTY_HINT;
    empty.hidden = true;
    wrap.appendChild(empty);

    const sections: GridSection[] = [];
    for (let depth = 0 as 0 | 1 | 2; depth <= 2; depth++) {
      const tier = items.filter((i) => i.depth === depth);
      if (!tier.length) continue;
      const head = document.createElement('h2');
      head.className = 'tier-heading';
      head.textContent = `${DEPTH_LABELS[depth]} (${tier.length})`;
      wrap.appendChild(head);
      sections.push({ heading: head, depth });
      const grid = document.createElement('div');
      grid.className = 'tile-grid';
      for (const item of tier) {
        const tile = document.createElement('button');
        tile.className = 'tile';
        tile.dataset.id = item.id;
        // the tile owns its click — an empty-space clear must not fire for it
        markClearExempt(tile);
        // evolved/tier-3 tiles show recipe components inline. Multi-recipe
        // evolutions that factorize into per-slot alternates render as x+(y/z);
        // single-slot alternates as (x/z). The few that do not factorize
        // (Overgrowth, Swamp) render as explicit or-separated recipes.
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
    grids.set(gridId, { empty, sections });
  }

  function build() {
    tiles.clear();
    grids.clear();
    buildGrid('ballsGrid', BALLS);
    buildGrid('passivesGrid', PASSIVES);
  }

  /** Repaint one grid's headings and empty hint from its edition-visible
   *  collection (the view model derives it; the renderer never re-gates). */
  function paintGrid(gridId: string, visible: readonly { depth: 0 | 1 | 2 }[]) {
    const els = grids.get(gridId);
    if (!els) return;
    let anyVisible = false;
    for (const section of els.sections) {
      const count = visible.filter((item) => item.depth === section.depth).length;
      section.heading.textContent = `${DEPTH_LABELS[section.depth]} (${count})`;
      section.heading.hidden = count === 0;
      if (count > 0) anyVisible = true;
    }
    els.empty.hidden = anyVisible;
  }

  function paint(vm: ViewModel) {
    paintGrid('ballsGrid', vm.visible.balls);
    paintGrid('passivesGrid', vm.visible.passives);

    for (const { tile, item } of tiles.values()) {
      const t = vm.tiles.get(item.id);
      if (!t) continue;
      // the edition filter: hidden content is absent, not dimmed
      tile.hidden = t.hidden;
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
      grids.clear();
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
