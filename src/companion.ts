// Interactive island: section tabs, depth-grouped grids, click-to-highlight
// evolution graphs, hover/tap toast, character selection with synergy
// indicators, search dimming, theming, hash routing.
// Decisions: tickets 03/05/06/07 (see .scratch/ball-x-pit-companion/map.md).
import { BALLS, type Ball } from './data/balls';
import { PASSIVES, type Passive } from './data/passives';
import { CHARACTERS, type Character } from './data/characters';

type Item = Ball | Passive;

const DEPTH_LABELS = ['Basic', 'Evolved', 'Tier-3'] as const;

const byId = (items: Item[]) => new Map(items.map((i) => [i.id, i]));
const ballMap = byId(BALLS);
const passiveMap = byId(PASSIVES);

/** Icons are stored in data as base-relative ("icons/balls/x.png"); the site
 *  deploys under a sub-path, so prefix with the configured base URL
 *  (BASE_URL has no trailing slash — join with one). */
const icon = (p: string) => import.meta.env.BASE_URL.replace(/\/$/, '') + '/' + p;

// ---------- graph helpers (multi-recipe aware) ----------

/** All recipes flattened: component ids this item is made from. */
function componentsOf(item: Item): string[] {
  return [...new Set(item.recipes.flat())];
}

/** Items this item can evolve into (any recipe satisfied). */
function childrenOf(id: string, map: Map<string, Item>): Item[] {
  return [...map.values()].filter((it) => it.recipes.some((r) => r.includes(id)));
}

/** Recursive closure: id → ids of all descendants (multi-level) or components. */
function closure(ids: string[], map: Map<string, Item>, down: boolean): Set<string> {
  const seen = new Set<string>();
  const queue = [...ids];
  while (queue.length) {
    const id = queue.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    if (down) {
      for (const child of childrenOf(id, map)) queue.push(child.id);
    } else {
      const item = map.get(id);
      if (item) queue.push(...componentsOf(item));
    }
  }
  return seen;
}

// ---------- synergy ----------

interface Verdict { verdict: 'red' | 'green'; note?: string }

/** Verdict of one item against the selected characters. Null = neutral. */
function verdictFor(item: Item, isPassive: boolean, selected: Character[]): Verdict | null {
  const verdicts: Verdict[] = [];
  for (const ch of selected) {
    for (const rule of ch.verdicts) {
      const wildcard = rule.tag === '*passives' && isPassive;
      if (wildcard || item.tags.includes(rule.tag)) verdicts.push({ verdict: rule.verdict, note: rule.note ? `${ch.name}: ${rule.note}` : undefined });
    }
  }
  if (!verdicts.length) return null;
  if (selected.length === 2 && verdicts.some((v) => v.verdict === 'red')) return { verdict: 'red', note: verdicts.filter((v) => v.verdict === 'red').map((v) => v.note).filter(Boolean).join(' · ') };
  const greens = verdicts.filter((v) => v.verdict === 'green');
  return greens.length ? greens[0] : verdicts[0];
}

// ---------- state ----------

let section: 'balls' | 'passives' | 'characters' = 'balls';
let selectedId: string | null = null;
const selectedChars: Character[] = [];
let query = '';

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
  clearSelection();
  renderAll();
}

// ---------- character selection ----------

function toggleCharacter(ch: Character) {
  const idx = selectedChars.findIndex((c) => c.id === ch.id);
  if (idx >= 0) selectedChars.splice(idx, 1);
  else {
    if (selectedChars.length >= 2) selectedChars.shift();
    selectedChars.push(ch);
  }
  renderCharChips();
  paintCharacters();
  paintGrids();
}

function renderCharChips() {
  const wrap = document.getElementById('charChips')!;
  wrap.innerHTML = '';
  const hint = document.getElementById('slotHint')!;
  hint.textContent = selectedChars.length === 1 ? 'pick a second character…' : '';
  for (const ch of selectedChars) {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.innerHTML = `<img src="${icon(ch.sprite)}" alt="" width="22" height="22"><span>${ch.name}</span>`;
    chip.title = 'Click to remove';
    chip.addEventListener('click', () => toggleCharacter(ch));
    wrap.appendChild(chip);
  }
}

// Character cards are built once; selection repaints classes in place.
let charCards: { ch: Character; card: HTMLElement }[] = [];

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
    card.addEventListener('click', () => toggleCharacter(ch));
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

function paintCharacters() {
  const q = query.trim().toLowerCase();
  for (const { ch, card } of charCards) {
    card.classList.toggle('selected', selectedChars.some((c) => c.id === ch.id));
    // same dim/greyscale-in-place behavior as the grids (ticket 07)
    const match = !q
      || ch.name.toLowerCase().includes(q)
      || ch.quirk.toLowerCase().includes(q)
      || (ballMap.get(ch.baseBallId ?? '')?.name.toLowerCase().includes(q) ?? false);
    card.classList.toggle('filtered', !match);
  }
}

// ---------- grids ----------

// Tiles are built once; state changes (selection, search, characters) only
// repaint classes/badges on the existing DOM — rebuilding would recreate the
// <img> elements and blink the icons.
const tiles = new Map<string, { tile: HTMLElement; item: Item; isPassive: boolean }>();

function buildGrid(gridId: string, items: Item[], isPassive: boolean) {
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
        selectedId = selectedId === item.id ? null : item.id;
        paintGrids();
      });
      attachToast(tile, () => item);
      tiles.set(item.id, { tile, item, isPassive });
      grid.appendChild(tile);
    }
    wrap.appendChild(grid);
  }
}

/** Compact per-slot recipe notation: "a+(b/c)", "(a/b)+(c/d)", "a+b+c". */
function recipeHtml(item: Item, map: Map<string, Item>): string {
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
function paintGrids() {
  // highlight set from current selection (ball and passive ids never collide —
  // separate namespaces, separate graphs — so either map is fine for the walk)
  let related = new Set<string>();
  if (selectedId) {
    const sel = ballMap.get(selectedId) ?? passiveMap.get(selectedId);
    if (sel) {
      related = closure([selectedId], ballMap, sel.depth === 0);
      related.add(selectedId);
    }
  }

  const q = query.trim().toLowerCase();

  for (const { tile, item, isPassive } of tiles.values()) {
    tile.classList.remove('selected', 'related', 'dimmed', 'filtered');
    if (selectedId === item.id) tile.classList.add('selected');
    else if (selectedId && !related.has(item.id)) tile.classList.add('dimmed');
    else if (selectedId && related.has(item.id)) tile.classList.add('related');

    if (q && !(item.name.toLowerCase().includes(q) || item.effects.toLowerCase().includes(q))) tile.classList.add('filtered');

    // verdict badge: replace in place (cheap, no img recreation)
    tile.querySelector('.ind')?.remove();
    const v = verdictFor(item, isPassive, selectedChars);
    if (v) {
      const badge = document.createElement('span');
      badge.className = `ind ${v.verdict}`;
      badge.textContent = '!';
      badge.title = v.note ?? v.verdict;
      tile.appendChild(badge);
    }
  }
}

function clearSelection() {
  selectedId = null;
}

function renderAll() {
  paintGrids();
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
  const isPassive = !('onHit' in item) && item.depth !== undefined && PASSIVES.some((p) => p.id === item.id);
  const map = ballMap.has(item.id) && !isPassive ? ballMap : passiveMap;
  // recipes are OR-of-ANDs — same compact per-slot notation as the tiles
  const comps = item.recipes.length ? recipeHtml(item, map) : '';
  const v = verdictFor(item, isPassive, selectedChars);
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
  search.addEventListener('input', () => {
    query = search.value;
    paintGrids();
    paintCharacters();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { clearSelection(); renderAll(); }
  });
  document.addEventListener('click', (e) => {
    // empty space clears selection
    if (!(e.target as HTMLElement).closest('.tile, .char-card, .chip, .toast')) { clearSelection(); renderAll(); }
  });

  initRouting();
  buildGrid('ballsGrid', BALLS, false);
  buildGrid('passivesGrid', PASSIVES, true);
  paintGrids();
  renderCharChips();
  buildCharacters();
}

init();
