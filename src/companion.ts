// Interactive island: DOM listening and painting only. All state (item
// selection, character slots, search, section) and every derivation
// (highlight walks, filters, verdicts) live in src/view-state.ts behind one
// dispatch(action) → ViewModel interface. Decisions: tickets 03/05/06/07
// (see .scratch/ball-x-pit-companion/map.md).
import { BALLS } from './data/balls';
import { PASSIVES } from './data/passives';
import { CHARACTERS } from './data/characters';
import { byId } from './graph';
import { createViewState, type ViewModel } from './view-state';
import type { Item } from './synergy';

const DEPTH_LABELS = ['Basic', 'Evolved', 'Tier-3'] as const;

const ballMap = byId(BALLS);
const passiveMap = byId(PASSIVES);

const view = createViewState();

/** Icons are stored in data as base-relative ("icons/balls/x.png"); the site
 *  deploys under a sub-path, so prefix with the configured base URL
 *  (BASE_URL has no trailing slash — join with one). */
const icon = (p: string) => import.meta.env.BASE_URL.replace(/\/$/, '') + '/' + p;

// ---------- state ----------
// `section` is pure UI routing (hash sync) — not part of the view model.

let section: 'balls' | 'passives' | 'characters' = 'balls';

// ---------- theming ----------

function initTheme() {
  const root = document.documentElement;
  const stored = localStorage.getItem('theme');
  const apply = (t: 'dark' | 'light') => {
    root.dataset.theme = t;
    (document.getElementById('themeToggle') as HTMLButtonElement).textContent = t === 'dark' ? '☀️' : '🌙';
  };
  apply(stored === 'light' || stored === 'dark' ? stored : matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  document.getElementById('themeToggle')!.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    apply(next);
  });
}

// ---------- routing ----------

function initRouting() {
  const apply = () => {
    const hash = location.hash.replace(/^#\/?/, '') || 'balls';
    if (['balls', 'passives', 'characters'].includes(hash)) showSection(hash as typeof section, false);
  };
  addEventListener('hashchange', apply);
  apply();
}

function showSection(s: typeof section, updateHash = true) {
  section = s;
  if (updateHash) location.hash = `#/${s}`;
  for (const el of document.querySelectorAll<HTMLElement>('.section-view')) el.hidden = el.dataset.section !== s;
  for (const btn of document.querySelectorAll<HTMLElement>('.tab-btn')) btn.classList.toggle('active', btn.dataset.section === s);
  repaint(view.dispatch({ type: 'clear' }));
}

// ---------- character selection ----------

function renderCharChips(vm: ViewModel) {
  const wrap = document.getElementById('charChips')!;
  wrap.innerHTML = '';
  document.getElementById('slotHint')!.textContent = vm.slotHint;
  for (const ch of vm.selectedChars) {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.innerHTML = `<img src="${icon(ch.sprite)}" alt="" width="22" height="22"><span>${ch.name}</span>`;
    chip.title = 'Click to remove';
    chip.addEventListener('click', () => repaint(view.dispatch({ type: 'toggleChar', id: ch.id })));
    wrap.appendChild(chip);
  }
}

// Character cards are built once; selection repaints classes in place.
let charCards: { ch: typeof CHARACTERS[number]; card: HTMLElement }[] = [];

function buildCharacters() {
  const wrap = document.getElementById('charactersGrid')!;
  wrap.innerHTML = '';
  charCards = [];
  for (const ch of CHARACTERS) {
    const card = document.createElement('div');
    card.className = 'char-card';
    const base = ch.baseBallId ? ballMap.get(ch.baseBallId) : null;
    card.innerHTML = `
      <img src="${icon(ch.icon)}" alt="${ch.name}" width="96" height="96" loading="lazy">
      <div class="char-name">${ch.name}</div>
      <div class="char-quirk">${ch.quirk}</div>
      ${base
        ? `<div class="char-base" title="Base ball"><img src="${icon(base.icon)}" alt="${base.name}" width="24" height="24"><span>${base.name}</span></div>`
        : '<div class="char-base none">no base ball</div>'}`;
    card.addEventListener('click', () => repaint(view.dispatch({ type: 'toggleChar', id: ch.id })));
    // hovering the base-ball chip shows that ball's toast
    const baseChip = card.querySelector('.char-base');
    if (baseChip) {
      baseChip.addEventListener('mouseenter', (e) => e.stopPropagation());
      baseChip.addEventListener('mouseleave', (e) => e.stopPropagation());
      attachToast(baseChip as HTMLElement, () => (base ? base : null));
    }
    charCards.push({ ch, card });
    wrap.appendChild(card);
  }
}

// ---------- grids ----------

// Tiles are built once; state changes (selection, search, characters) only
// repaint classes/badges on the existing DOM — rebuilding would recreate the
// <img> elements and blink the icons.
const tiles = new Map<string, { tile: HTMLElement; item: (typeof BALLS)[number] | (typeof PASSIVES)[number] }>();

function buildGrid(gridId: string, items: (typeof BALLS)[number][] | (typeof PASSIVES)[number][], isPassive: boolean) {
  const wrap = document.getElementById(gridId)!;
  wrap.innerHTML = '';
  const map = isPassive ? passiveMap : ballMap;

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
      // evolved/tier-3 tiles show recipe components inline. All multi-recipe
      // evolutions factorize into per-slot alternates (verified over the whole
      // dataset), so slots render as x+(y/z); single-slot alternates as (x/z).
      const comps = item.depth > 0 ? `<span class="comps">${recipeHtml(item, map)}</span>` : '';
      tile.innerHTML = `<img src="${icon(item.icon)}" alt="${item.name}" width="48" height="48" loading="lazy"><span class="nm">${item.name}</span>${comps}`;
      tile.addEventListener('click', (e) => {
        e.stopPropagation();
        repaint(view.dispatch({ type: 'toggleItem', id: item.id }));
      });
      attachToast(tile, () => item);
      tiles.set(item.id, { tile, item });
      grid.appendChild(tile);
    }
    wrap.appendChild(grid);
  }
}

/** Compact per-slot recipe notation: "a+(b/c)", "(a/b)+(c/d)", "a+b+c". */
function recipeHtml(item: { recipes: string[][] }, map: Map<string, { icon: string; name: string }>): string {
  const img = (id: string) => {
    const comp = map.get(id);
    return comp ? `<img src="${icon(comp.icon)}" alt="${comp.name}" title="${comp.name}" width="28" height="28">` : id;
  };
  const width = item.recipes[0].length;
  // group recipes column-wise: recipes[i][slot]
  const slots: string[][] = [];
  for (let s = 0; s < width; s++) slots.push([...new Set(item.recipes.map((r) => r[s]))]);
  const single = item.recipes.length === 1;
  return slots
    .map((opts) => (single || opts.length === 1 ? img(opts[0]) : `<span class="alt">${opts.map(img).join('<span class="or">/</span>')}</span>`))
    .join('<span class="plus">+</span>');
}

/** Repaint selection/search/verdict state on the existing tiles. */
function paintTiles(vm: ViewModel) {
  for (const { tile, item } of tiles.values()) {
    const t = vm.tiles.get(item.id)!;
    tile.classList.remove('selected', 'related', 'dimmed', 'filtered');
    if (t.selected) tile.classList.add('selected');
    else if (t.related) tile.classList.add('related');
    else if (t.dimmed) tile.classList.add('dimmed');
    if (t.filtered) tile.classList.add('filtered');

    // verdict badge: replace in place (cheap, no img recreation)
    tile.querySelector('.ind')?.remove();
    if (t.verdict) {
      const badge = document.createElement('span');
      badge.className = `ind ${t.verdict}`;
      badge.textContent = '!';
      badge.title = t.verdictNote ?? t.verdict;
      tile.appendChild(badge);
    }
  }
}

function paintCharCards(vm: ViewModel) {
  for (const { ch, card } of charCards) {
    const c = vm.charCards.get(ch.id)!;
    card.classList.toggle('selected', c.selected);
    card.classList.toggle('filtered', c.filtered);
  }
}

function repaint(vm: ViewModel) {
  paintTiles(vm);
  paintCharCards(vm);
  renderCharChips(vm);
}

// ---------- toast ----------

let toastEl: HTMLElement | null = null;

function attachToast(anchor: HTMLElement, getItem: () => Item | null) {
  const show = () => {
    const item = getItem();
    if (!item) return;
    hideToast();
    toastEl = buildToast(item);
    document.body.appendChild(toastEl);
    positionToast(anchor, toastEl);
  };
  anchor.addEventListener('mouseenter', show);
  anchor.addEventListener('mouseleave', hideToast);
  // mobile: tap shows toast, next tap elsewhere dismisses
  anchor.addEventListener('touchstart', show, { passive: true });
}

function buildToast(item: Item) {
  const el = document.createElement('div');
  el.className = 'toast';
  const map = passiveMap.has(item.id) ? passiveMap : ballMap;
  // recipes are OR-of-ANDs — same compact per-slot notation as the tiles
  const comps = item.recipes.length ? recipeHtml(item, map) : '';
  const v = view.verdictFor(item);
  el.innerHTML = `
    <h4><img src="${icon(item.icon)}" alt="" width="20" height="20">${item.name}</h4>
    <p class="eff">${item.effects}</p>
    ${comps ? `<div class="rec">${comps}</div>` : ''}
    ${v ? `<div class="verdicts"><span class="${v.verdict}">${v.verdict === 'red' ? '▲ red' : '✓ green'}${v.note ? ` — ${v.note}` : ''}</span></div>` : ''}
    ${item.tags.length ? `<div class="tags">${item.tags.map((t) => `<span>${t}</span>`).join('')}</div>` : ''}`;
  return el;
}

function positionToast(tile: HTMLElement, toast: HTMLElement) {
  const r = tile.getBoundingClientRect();
  const tw = toast.offsetWidth, th = toast.offsetHeight;
  let x = r.left + r.width / 2 - tw / 2;
  let y = r.bottom + 8;
  x = Math.max(8, Math.min(x, innerWidth - tw - 8));
  if (y + th > innerHeight - 8) y = Math.max(8, r.top - th - 8);
  toast.style.left = `${x}px`;
  toast.style.top = `${y}px`;
}

function hideToast() {
  toastEl?.remove();
  toastEl = null;
}

// ---------- init ----------

function init() {
  initTheme();

  for (const btn of document.querySelectorAll<HTMLElement>('.tab-btn'))
    btn.addEventListener('click', () => showSection(btn.dataset.section as typeof section));

  const search = document.getElementById('search') as HTMLInputElement;
  search.addEventListener('input', () => repaint(view.dispatch({ type: 'search', query: search.value })));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') repaint(view.dispatch({ type: 'clear' }));
  });
  document.addEventListener('click', (e) => {
    // empty space clears selection
    if (!(e.target as HTMLElement).closest('.tile, .char-card, .chip, .toast')) repaint(view.dispatch({ type: 'clear' }));
  });

  initRouting();
  buildGrid('ballsGrid', BALLS, false);
  buildGrid('passivesGrid', PASSIVES, true);
  buildCharacters();
  repaint(view.dispatch({ type: 'search', query: '' }));
}

init();
