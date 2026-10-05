// Renderer module: all DOM painting for the island. One interface:
// buildAll() builds the static DOM once (grids, character cards), then
// paint(viewModel) repaints state on it — never recreating <img> elements
// (rebuilding would blink the icons). The island (src/companion.ts) keeps
// only event listening, theme, and hash routing; the ViewModel it paints
// comes from src/view-state.ts (including the resolved fusion picks — the
// renderer holds no domain data of its own); the icon-URL join comes from
// src/icon-url.ts.
import { BALLS } from './data/balls';
import { PASSIVES } from './data/passives';
import { CHARACTERS, type Character } from './data/characters';
import { ballMap, itemFor, type Item } from './catalog';
import { fusionBalls } from './fusion';
import { recipeHtml } from './graph';
import { iconUrl } from './icon-url';
import type { Verdict } from './synergy';
import type { ViewModel } from './view-state';

const DEPTH_LABELS = ['Basic', 'Evolved', 'Tier-3'] as const;

/** Icons are stored in data as base-relative ("icons/balls/x.png"); the
 *  join with the configured base URL lives in src/icon-url.ts. */
const icon = (p: string) => iconUrl(import.meta.env.BASE_URL, p);

/** Verdict lookup for the toast, injected at build time: the island passes
 *  its view-state's verdictFor so hover always reads the current selection. */
let toastVerdict: (item: Item) => Verdict | null = () => null;

// ---------- grids ----------

// Tiles are built once; state changes (selection, search, characters) only
// repaint classes/badges on the existing DOM — rebuilding would recreate the
// <img> elements and blink the icons.
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
      // evolved/tier-3 tiles show recipe components inline. All multi-recipe
      // evolutions factorize into per-slot alternates (verified over the whole
      // dataset), so slots render as x+(y/z); single-slot alternates as (x/z).
      const comps = item.depth > 0 ? `<span class="comps">${recipeMarkup(item)}</span>` : '';
      tile.innerHTML = `<img src="${icon(item.icon)}" alt="${item.name}" width="48" height="48" loading="lazy"><span class="nm">${item.name}</span>${comps}`;
      tile.addEventListener('click', (e) => {
        e.stopPropagation();
        document.dispatchEvent(new CustomEvent('tile-select', { detail: item.id }));
      });
      attachToast(tile, () => item);
      tiles.set(item.id, { tile, item });
      grid.appendChild(tile);
    }
    wrap.appendChild(grid);
  }
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
      badge.className = `ind ${t.verdict.verdict}`;
      badge.textContent = '!';
      badge.title = t.verdict.note ?? t.verdict.verdict;
      tile.appendChild(badge);
    }
  }
}

// ---------- characters ----------

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
    card.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('char-select', { detail: ch.id }));
    });
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

function paintCharCards(vm: ViewModel) {
  for (const { ch, card } of charCards) {
    const c = vm.charCards.get(ch.id)!;
    card.classList.toggle('selected', c.selected);
    card.classList.toggle('filtered', c.filtered);
  }
}

// ---------- character chips ----------

// Chips rebuild only when the character selection changes — paint() diffs
// against the last painted set so search/selection repaints skip the rebuild.
let paintedCharIds: string[] = [];

function renderCharChips(vm: ViewModel) {
  document.getElementById('slotHint')!.textContent = vm.slotHint;
  const ids = vm.selectedChars.map((c) => c.id);
  if (ids.length === paintedCharIds.length && ids.every((id, i) => id === paintedCharIds[i])) return;
  paintedCharIds = ids;
  const wrap = document.getElementById('charChips')!;
  wrap.innerHTML = '';
  for (const ch of vm.selectedChars) {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.innerHTML = `<img src="${icon(ch.sprite)}" alt="" width="22" height="22"><span>${ch.name}</span>`;
    chip.title = 'Click to remove';
    chip.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('char-select', { detail: ch.id }));
    });
    wrap.appendChild(chip);
  }
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
  // recipes are OR-of-ANDs — same compact per-slot notation as the tiles
  const comps = item.recipes.length ? recipeMarkup(item) : '';
  const v = toastVerdict(item);
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

// ---------- fusion screen ----------

// Fusion rows are built once (never recreate <img> — same invariant as the
// grids); pick order and filtering repaint classes in place. The pick list
// mirrors the game's Fusion Reactor: any two of the fusable upgrade entities.
// Purely a DOM-row registry — the picked balls themselves ride the view
// model (vm.fusionSlots carries the resolved items).
const fusionRowEls = new Map<string, HTMLElement>();
// Panel skeleton is built once with icon-bearing slots; paint() toggles the
// pieces in place — never recreating <img> (same invariant as the grids).
let fusionPanel: {
  root: HTMLElement;
  hint: HTMLElement;
  head: HTMLElement;
  iconA: HTMLImageElement;
  nameA: HTMLElement;
  op: HTMLElement;
  iconB: HTMLImageElement;
  nameB: HTMLElement;
  evo: HTMLElement;
  body: HTMLElement;
  effA: HTMLElement;
  effB: HTMLElement;
  cross: HTMLElement;
  notes: HTMLElement;
} | null = null;

function buildFusionList() {
  const wrap = document.getElementById('fusionList')!;
  wrap.innerHTML = '';
  // tier order (structural depth), name within tier — mirroring the Balls page
  const balls = fusionBalls();
  for (let depth = 0 as 0 | 1 | 2; depth <= 2; depth++) {
    const tier = balls.filter((b) => b.depth === depth);
    if (!tier.length) continue;
    const head = document.createElement('h3');
    head.className = 'fusion-list-heading';
    head.textContent = `${DEPTH_LABELS[depth]} (${tier.length})`;
    wrap.appendChild(head);
    for (const ball of tier) {
      const row = document.createElement('button');
      row.className = 'fusion-row';
      row.dataset.id = ball.id;
      row.innerHTML = `<img src="${icon(ball.icon)}" alt="${ball.name}" width="36" height="36" loading="lazy"><span class="nm">${ball.name}</span>`;
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        document.dispatchEvent(new CustomEvent('fusion-select', { detail: ball.id }));
      });
      fusionRowEls.set(ball.id, row);
      wrap.appendChild(row);
    }
  }
}

function buildFusionPanel() {
  const root = document.getElementById('fusionPanel')!;
  root.innerHTML = `
    <p class="fusion-hint">Pick two balls to see their fusion.</p>
    <div class="fusion-head" hidden>
      <img class="icon-a" alt="" width="48" height="48"><span class="name-a fusion-name"></span>
      <span class="fusion-times">×</span>
      <img class="icon-b" alt="" width="48" height="48"><span class="name-b fusion-name"></span>
    </div>
    <p class="fusion-evo" hidden></p>
    <div class="fusion-body" hidden>
      <p class="fusion-eff eff-a"></p>
      <p class="fusion-eff eff-b"></p>
      <p class="fusion-cross" hidden></p>
    </div>
    <ul class="fusion-notes" hidden></ul>`;
  const q = (s: string) => root.querySelector(s)!;
  fusionPanel = {
    root,
    hint: q('.fusion-hint') as HTMLElement,
    head: q('.fusion-head') as HTMLElement,
    iconA: q('.icon-a') as HTMLImageElement,
    nameA: q('.name-a') as HTMLElement,
    op: q('.fusion-times') as HTMLElement,
    iconB: q('.icon-b') as HTMLImageElement,
    nameB: q('.name-b') as HTMLElement,
    evo: q('.fusion-evo') as HTMLElement,
    body: q('.fusion-body') as HTMLElement,
    effA: q('.eff-a') as HTMLElement,
    effB: q('.eff-b') as HTMLElement,
    cross: q('.fusion-cross') as HTMLElement,
    notes: q('.fusion-notes') as HTMLElement,
  };
}

/** Repaint pick order, filtering, and the fusion panel. The panel is a
 *  3-state machine — the ViewModel names the state (vm.fusionPanel) and this
 *  switch paints per state: which hooks show, and what they show. Text nodes
 *  update in place; the two head <img> elements are created exactly once
 *  (build time). */
function paintFusion(vm: ViewModel) {
  for (const row of fusionRowEls.values()) {
    row.classList.remove('slot-1', 'slot-2', 'filtered');
  }
  for (const [id, state] of vm.fusionRows) {
    const row = fusionRowEls.get(id);
    if (!row) continue;
    if (state.slot === 1) row.classList.add('slot-1');
    else if (state.slot === 2) row.classList.add('slot-2');
    if (state.filtered) row.classList.add('filtered');
  }

  const p = fusionPanel;
  if (!p) return;
  const fp = vm.fusionPanel;

  // Pending states replace the body via hidden toggles; text nodes update in
  // place; the two head <img> elements are created exactly once (build time).
  if (fp.state === 'empty') {
    p.hint.textContent = vm.fusionHint;
    p.hint.hidden = false;
    p.head.hidden = true;
    p.evo.hidden = true;
    p.body.hidden = true;
    p.notes.hidden = true;
    return;
  }

  if (fp.state === 'pending') {
    p.head.hidden = false;
    p.op.textContent = '+ ?';
    if (p.iconA.getAttribute('src') !== icon(fp.first.icon)) p.iconA.src = icon(fp.first.icon);
    p.iconA.alt = fp.first.name;
    p.nameA.textContent = fp.first.name;
    // hide the second icon slot entirely — an src-less <img> renders as a
    // broken-image box
    p.iconB.style.display = 'none';
    p.nameB.textContent = '';
    p.hint.textContent = vm.fusionHint;
    p.hint.hidden = false;
    p.evo.hidden = true;
    p.body.hidden = true;
    p.notes.hidden = true;
    return;
  }
  // Both slots filled: the composed fusion replaces the hint entirely —
  // the "selection full" hint only matters in the pending states above.
  const { fusion: f, a, b } = fp;
  p.head.hidden = false;
  p.op.textContent = '×';
  if (p.iconA.getAttribute('src') !== icon(a.icon)) p.iconA.src = icon(a.icon);
  p.iconA.alt = a.name;
  p.nameA.textContent = a.name;
  p.hint.hidden = true;
  p.iconB.style.display = '';
  if (p.iconB.getAttribute('src') !== icon(b.icon)) p.iconB.src = icon(b.icon);
  p.iconB.alt = b.name;
  p.nameB.textContent = b.name;
  p.evo.hidden = !f.evolvesInstead;
  if (f.evolvesInstead) {
    p.evo.textContent = '';
    p.evo.append('⚠ These two Evolve into ');
    const strong = document.createElement('strong');
    strong.textContent = f.evolvesInstead.name;
    p.evo.append(strong, ' rather than fuse — the Fusion Reactor will not offer this pair.');
  }
  p.body.hidden = false;
  p.effA.textContent = f.paragraphs[0];
  p.effB.textContent = f.paragraphs[1];
  p.cross.hidden = !f.crossWire;
  if (f.crossWire) p.cross.textContent = f.crossWire;
  p.notes.hidden = false;
  p.notes.replaceChildren(...f.notes.map((n) => {
    const li = document.createElement('li');
    li.textContent = n;
    return li;
  }));
}

// ---------- interface ----------

/** Build all static DOM once: balls grid, passives grid, character cards,
 *  fusion pick list. Call once at startup, before the first paint().
 *  `getVerdict` supplies the toast's per-item verdict against the current
 *  character selection. */
export function buildAll(getVerdict: (item: Item) => Verdict | null): void {
  toastVerdict = getVerdict;
  buildGrid('ballsGrid', BALLS);
  buildGrid('passivesGrid', PASSIVES);
  buildCharacters();
  buildFusionList();
  buildFusionPanel();
}

/** Repaint state (selection/related/dimmed/filtered, verdict badges,
 *  character cards and chips, fusion picks and panel) on the existing DOM.
 *  Safe to call before buildAll() (no-op — nothing built yet). Idempotent;
 *  never recreates <img> elements — the fusion panel's skeleton (with its
 *  two head icons) is built once and repainted in place. */
export function paint(vm: ViewModel): void {
  paintTiles(vm);
  paintCharCards(vm);
  renderCharChips(vm);
  paintFusion(vm);
}
