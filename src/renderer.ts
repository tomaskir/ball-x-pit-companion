// Renderer module: all DOM painting for the island. One interface:
// buildAll(options) builds the static DOM once (grids, character cards, the
// fusion panel, the plan screen skeleton), then paint(viewModel) repaints
// state on it — never recreating <img> elements (rebuilding would blink the
// icons; the plan's entries and the character chips are the one accepted
// exception, rebuilding only when their selection changes — the chips' diff
// pattern). The island (src/companion.ts)
// keeps only event listening, theme, hash routing, and plan persistence; the
// ViewModel it paints comes from src/view-state.ts — the fusion panel rides
// the named fusionPanel state (empty / pending / composed) and paintFusion
// switches on it; the plan rides vm.plan and paintPlan paints per section;
// the renderer holds no domain data of its own. The icon-URL join comes
// from src/icon-url.ts.
//
// The build seam is the options object: { getVerdict, emit }. getVerdict
// supplies the toast's per-item verdict against the current character
// selection; emit is how built-in click handlers report selection toggles
// back to the island — emit(action) hands over the whole view-state
// ToggleAction (the island dispatches it verbatim). The
// renderer never dispatches DOM events or touches view state: emit is just
// a callback the island supplies (it dispatches and paints); hover/tap
// toast listeners stay internal to the renderer.
import { BALLS } from './data/balls';
import { PASSIVES } from './data/passives';
import { CHARACTERS, type Character } from './data/characters';
import { ballMap, itemFor, type Item } from './catalog';
import { fusionBalls } from './fusion';
import { recipeHtml } from './graph';
import { iconUrl } from './icon-url';
import type { Verdict } from './synergy';
import type { SelectionBoxState, ToggleAction, ViewModel } from './view-state';

const DEPTH_LABELS = ['Basic', 'Evolved', 'Tier-3'] as const;

/** Icons are stored in data as base-relative ("icons/balls/x.png"); the
 *  join with the configured base URL lives in src/icon-url.ts. */
const icon = (p: string) => iconUrl(import.meta.env.BASE_URL, p);

/** The build seam, captured once by buildAll: the toast's verdict lookup
 *  (the island passes its view-state's verdictFor so hover always reads the
 *  current selection) and the click→island callback (the island dispatches
 *  the named view-state action and paints). */
let toastVerdict: (item: Item) => Verdict | null = () => null;
let emit: (action: ToggleAction) => void = () => {};

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
        emit({ type: 'toggleItem', id: item.id });
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
      emit({ type: 'toggleChar', id: ch.id });
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
    // the chip body is inert — removal is the X button's job only
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.innerHTML = `<img src="${icon(ch.sprite)}" alt="" width="22" height="22"><span>${ch.name}</span><button class="chip-x" aria-label="Remove ${ch.name}" title="Click × to remove">×</button>`;
    chip.querySelector('.chip-x')!.addEventListener('click', () => {
      emit({ type: 'toggleChar', id: ch.id });
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
// Purely a DOM-row registry — the panel's picks, state, and composed fusion
// ride the view model (vm.fusionPanel).
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
  planBtn: HTMLButtonElement;
  planRow: HTMLElement;
} | null = null;
/** The fusion panel state paintFusion last painted — the plan button's
 *  click handler reads the compose order from it (the button is built
 *  once; the picks change under it). */
let fusionPanelState: ViewModel['fusionPanel'] | null = null;

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
        emit({ type: 'toggleFusion', id: ball.id });
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
    <ul class="fusion-notes" hidden></ul>
    <div class="fusion-plan-row"><button class="fusion-plan-btn" hidden></button></div>`;
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
    planBtn: q('.fusion-plan-btn') as HTMLButtonElement,
    planRow: q('.fusion-plan-row') as HTMLElement,
  };
  // the composed fusion's plan toggle reports through the build seam
  fusionPanel.planBtn.addEventListener('click', () => {
    const fp = fusionPanelState;
    if (fp?.state === 'composed') emit({ type: 'togglePlanFusion', a: fp.a.id, b: fp.b.id });
  });
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
  fusionPanelState = fp;
  // the plan toggle exists only in the composed state — and not at all for
  // evolve-instead pairs (they do not fuse, so there is nothing to plan)
  p.planBtn.hidden = fp.state !== 'composed' || !!fp.fusion.evolvesInstead;

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
  p.planBtn.textContent = fp.planned ? 'Remove from plan' : 'Add to plan';
  const planAtLimit = !fp.planned && fp.planFull;
  p.planBtn.disabled = planAtLimit;
  // the title rides the row — a title on the disabled button never shows
  p.planBtn.title = '';
  p.planRow.title = planAtLimit ? PLAN_LIMIT_TITLE : '';
  p.evo.hidden = !f.evolvesInstead;
  if (f.evolvesInstead) {
    p.evo.textContent = '';
    p.evo.append('⚠ These two Evolve into ');
    const strong = document.createElement('strong');
    strong.textContent = f.evolvesInstead.name;
    p.evo.append(strong, ' rather than fuse — the Fusion Reactor will not offer this pair.');
    // the pair does not fuse — the composed paragraphs/cross/notes would be
    // made-up content; only the balls and the evolution warning show
    p.body.hidden = true;
    p.cross.hidden = true; // reset the attribute, not just the ancestor
    p.notes.hidden = true;
    return;
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

// ---------- plan screen ----------

// The plan screen's skeleton is built once; entries rebuild only when the
// selection or the upgrade toggle changes (the chips' diff pattern — the
// one accepted exception to never-recreate, since entry sets are dynamic).
// Badges and over-limit marks repaint in place every paint, so a character
// toggle (which changes verdicts but not the entry set) never rebuilds.
let planEls: {
  upgrades: HTMLInputElement;
  hint: HTMLElement;
  sections: {
    characters: { count: HTMLElement; empty: HTMLElement; grid: HTMLElement };
    balls: { count: HTMLElement; empty: HTMLElement; grid: HTMLElement };
    passives: { count: HTMLElement; empty: HTMLElement; grid: HTMLElement };
  };
} | null = null;
let paintedPlanKey = '';

const PLAN_EMPTY_HINTS = {
  characters: 'Pick characters on the Characters screen — they appear here.',
  balls: 'Balls you pick on the Balls screen will appear here.',
  passives: 'Passives you pick on the Passives screen will appear here.',
} as const;

function buildPlan() {
  const root = document.getElementById('planView')!;
  root.innerHTML = `
    <p class="plan-hint" hidden></p>
    ${(['characters', 'balls', 'passives'] as const).map((key) => `
      <section class="plan-section" data-plan="${key}">
        <h2 class="plan-heading"><span class="plan-title">${key[0].toUpperCase() + key.slice(1)}</span> <span class="plan-count"></span></h2>
        <p class="plan-empty">${PLAN_EMPTY_HINTS[key]}</p>
        <div class="plan-grid"></div>
      </section>`).join('')}`;
  // the End game upgrades toggle lives in the shell's plan toolbar (Clear
  // left, toggle right) — the renderer builds it into the slot
  const upgradesRoot = document.getElementById('planUpgradesSlot')!;
  upgradesRoot.innerHTML = `
    <label class="plan-upgrades">
      <input type="checkbox" id="planUpgrades">
      <span>End game upgrades</span>
    </label>`;
  const q = (s: string) => root.querySelector(s)!;
  const section = (key: string) => {
    const el = q(`.plan-section[data-plan="${key}"]`);
    return {
      count: el.querySelector('.plan-count') as HTMLElement,
      empty: el.querySelector('.plan-empty') as HTMLElement,
      grid: el.querySelector('.plan-grid') as HTMLElement,
    };
  };
  planEls = {
    upgrades: upgradesRoot.querySelector('#planUpgrades') as HTMLInputElement,
    hint: q('.plan-hint') as HTMLElement,
    sections: { characters: section('characters'), balls: section('balls'), passives: section('passives') },
  };
  // the upgrade toggle reports through the build seam, like every other
  // built-in click handler — the renderer never touches view state
  planEls.upgrades.addEventListener('change', () => {
    emit({ type: 'toggleUpgrades' });
  });
}

function planEntry(inner: string, onRemove: () => void): HTMLElement {
  const entry = document.createElement('div');
  entry.className = 'plan-entry';
  entry.innerHTML = `${inner}<button class="plan-x" aria-label="Remove">×</button>`;
  entry.querySelector('.plan-x')!.addEventListener('click', () => onRemove());
  return entry;
}

function paintPlan(vm: ViewModel) {
  if (!planEls) return;
  const plan = vm.plan;
  planEls.upgrades.checked = plan.upgradesOn;
  planEls.hint.textContent = plan.hint;
  planEls.hint.hidden = !plan.hint;

  // rebuild only when a section's entry set (or the toggle) changed — the
  // chips' diff pattern
  const key = `${plan.upgradesOn}|${plan.characters.map((c) => c.character.id).join(',')}|${plan.balls.map((e) => e.item.id).join(',')}|${plan.passives.map((e) => e.item.id).join(',')}|${plan.fused.map((f) => `${f.a.id}+${f.b.id}`).join(',')}`;
  if (key !== paintedPlanKey) {
    paintedPlanKey = key;
    const charEntries = plan.characters.map(({ character: ch }) => {
      const base = ch.baseBallId ? ballMap.get(ch.baseBallId) : null;
      // the body is a column: name over base chip — the sprite and X stay
      // put while the name wraps at word boundaries
      return planEntry(
        `<img src="${icon(ch.sprite)}" alt="${ch.name}" width="48" height="48" loading="lazy">` +
        `<span class="plan-body"><span class="plan-name">${ch.name}</span>` +
        (base ? `<span class="plan-base" title="Base ball"><img src="${icon(base.icon)}" alt="${base.name}" width="20" height="20">${base.name}</span>` : '') +
        `</span>`,
        () => emit({ type: 'toggleChar', id: ch.id }),
      );
    });
    const itemEntries = (entries: typeof plan.balls) => entries.map(({ item }) =>
      planEntry(
        `<img src="${icon(item.icon)}" alt="${item.name}" width="48" height="48" loading="lazy"><span class="plan-name">${item.name}</span>`,
        () => emit({ type: 'togglePlanItem', id: item.id }),
      ));
    // fused pairs: both icons side by side (compact, so the composed name
    // fits beside them — same shape as the single-ball entries), name right,
    // one X for the pair — a pair is ONE entry (one ball slot). The name
    // carries the "×" between the components. Each icon sits in a wrapper
    // so the per-component verdict badge can ride it.
    const fusedEntries = plan.fused.map(({ a, b, name }) =>
      planEntry(
        `<span class="plan-icons">` +
        `<span class="plan-icon"><img src="${icon(a.icon)}" alt="${a.name}" width="36" height="36" loading="lazy"></span>` +
        `<span class="plan-icon"><img src="${icon(b.icon)}" alt="${b.name}" width="36" height="36" loading="lazy"></span>` +
        `</span>` +
        `<span class="plan-name">${name}</span>`,
        () => emit({ type: 'togglePlanFusion', a: a.id, b: b.id }),
      ));
    planEls.sections.characters.grid.replaceChildren(...charEntries);
    planEls.sections.balls.grid.replaceChildren(...itemEntries(plan.balls), ...fusedEntries);
    planEls.sections.passives.grid.replaceChildren(...itemEntries(plan.passives));
  }

  // counts and empty hints
  for (const [count, limit, els] of [
    [plan.counts.chars, plan.limits.chars, planEls.sections.characters],
    [plan.counts.balls, plan.limits.balls, planEls.sections.balls],
    [plan.counts.passives, plan.limits.passives, planEls.sections.passives],
  ] as const) {
    els.count.textContent = `${count} / ${limit}`;
    els.empty.hidden = count > 0;
  }

  // over-limit marks and verdict badges — repaint in place, in entry order
  // (characters and fused pairs carry no entry-level verdict — the null
  // verdict paints no badge; fused pairs get per-component badges below)
  const makeBadge = (v: Verdict) => {
    const badge = document.createElement('span');
    badge.className = `ind ${v.verdict}`;
    badge.textContent = '!';
    badge.title = v.note ?? v.verdict;
    return badge;
  };
  const repaint = (grid: HTMLElement, entries: { overLimit: boolean; verdict?: Verdict | null }[]) => {
    [...grid.querySelectorAll<HTMLElement>('.plan-entry')].forEach((entry, i) => {
      const e = entries[i];
      if (!e) return;
      entry.classList.toggle('over-limit', e.overLimit);
      entry.querySelectorAll('.ind').forEach((b) => b.remove());
      if (e.verdict) entry.appendChild(makeBadge(e.verdict));
    });
  };
  repaint(planEls.sections.characters.grid, plan.characters);
  // the balls grid holds the single balls followed by the fused pairs
  repaint(planEls.sections.balls.grid, [...plan.balls, ...plan.fused]);
  repaint(planEls.sections.passives.grid, plan.passives);
  // fused pairs: one verdict badge per component icon
  const fusedEls = [...planEls.sections.balls.grid.querySelectorAll<HTMLElement>('.plan-entry')].slice(-plan.fused.length);
  plan.fused.forEach((f, i) => {
    const entry = fusedEls[i];
    if (!entry) return;
    f.verdicts.forEach((v, j) => {
      if (!v) return;
      const wrap = entry.querySelectorAll<HTMLElement>('.plan-icon')[j];
      if (!wrap) return;
      wrap.appendChild(makeBadge(v));
    });
  });
}

// ---------- selection box (balls/passives screens) ----------

// One box per item screen, built once into its index.astro container;
// paint() toggles hidden, the label, and the button labels/disabled states
// from vm.selectionBoxes. Buttons emit through the seam like every other
// built-in click handler.
interface SelectionBoxEls {
  root: HTMLElement;
  name: HTMLElement;
  planBtn: HTMLButtonElement;
  fusionBtn: HTMLButtonElement | null;
  /** The currently painted item's id — the click handlers read it (the
   *  buttons are built once; the selection changes under them). */
  itemId: string | null;
}
const selectionBoxes: Record<'balls' | 'passives', SelectionBoxEls | null> = { balls: null, passives: null };

const PLAN_BTN_LABELS: Record<SelectionBoxState['plan'], string> = {
  add: 'Add to plan',
  remove: 'Remove from plan',
  disabled: 'Add to plan',
};
const FUSION_BTN_LABELS: Record<Exclude<SelectionBoxState['fusion'], null>, string> = {
  add: 'Add to fusion',
  remove: 'Remove from fusion',
  disabled: 'Add to fusion',
  unfusable: 'Add to fusion',
};
const FUSION_BTN_TITLES: Record<Exclude<SelectionBoxState['fusion'], null>, string> = {
  add: '',
  remove: '',
  disabled: 'selection full — deselect one first',
  unfusable: 'Baby Ball cannot be fused',
};
/** Disabled buttons suppress mouse events, so a title on the button itself
 *  never shows — the title rides the nearest container instead (with
 *  pointer-events:none letting the hover reach it). */
const PLAN_LIMIT_TITLE = 'Plan limit reached';

function buildSelectionBox(screen: 'balls' | 'passives') {
  const root = document.getElementById(`selection-${screen}`)!;
  const withFusion = screen === 'balls';
  root.innerHTML = `
    <span class="selection-label">Selection: <b class="selection-name"></b></span>
    <button class="selection-btn" data-kind="plan"></button>
    ${withFusion ? '<button class="selection-btn" data-kind="fusion"></button>' : ''}`;
  const planBtn = root.querySelector<HTMLButtonElement>('.selection-btn[data-kind="plan"]')!;
  const fusionBtn = root.querySelector<HTMLButtonElement>('.selection-btn[data-kind="fusion"]');
  planBtn.addEventListener('click', () => {
    const id = selectionBoxes[screen]?.itemId;
    if (id) emit({ type: 'togglePlanItem', id });
  });
  fusionBtn?.addEventListener('click', () => {
    const id = selectionBoxes[screen]?.itemId;
    if (id) emit({ type: 'toggleFusion', id });
  });
  selectionBoxes[screen] = { root, name: root.querySelector('.selection-name') as HTMLElement, planBtn, fusionBtn, itemId: null };
}

function paintSelectionBoxes(vm: ViewModel) {
  for (const screen of ['balls', 'passives'] as const) {
    const els = selectionBoxes[screen];
    if (!els) continue;
    const state = vm.selectionBoxes[screen];
    els.root.hidden = !state;
    els.itemId = state?.item.id ?? null;
    if (!state) continue;
    els.name.textContent = state.item.name;
    els.planBtn.textContent = PLAN_BTN_LABELS[state.plan];
    els.planBtn.disabled = state.plan === 'disabled';
    if (els.fusionBtn && state.fusion) {
      els.fusionBtn.textContent = FUSION_BTN_LABELS[state.fusion];
      els.fusionBtn.disabled = state.fusion === 'disabled' || state.fusion === 'unfusable';
    }
    // disabled buttons suppress mouse events, so the tooltips ride the box
    const boxTitles = [
      state.plan === 'disabled' ? PLAN_LIMIT_TITLE : '',
      els.fusionBtn && state.fusion ? FUSION_BTN_TITLES[state.fusion] : '',
    ].filter(Boolean);
    els.root.title = boxTitles.join(' · ');
  }
}

// ---------- interface ----------

/** The build seam: everything the island injects at build time.
 *  `getVerdict` supplies the toast's per-item verdict against the current
 *  character selection; `emit` is how the built-in click handlers report
 *  selection toggles back — the island dispatches the whole ToggleAction
 *  and paints. The renderer stays paint-only: it never dispatches
 *  DOM events and never touches view state. */
export interface BuildOptions {
  getVerdict: (item: Item) => Verdict | null;
  emit: (action: ToggleAction) => void;
}

/** Build all static DOM once: balls grid, passives grid, character cards,
 *  fusion pick list, plan screen skeleton. Call once at startup, before the
 *  first paint(). */
export function buildAll({ getVerdict, emit: onEmit }: BuildOptions): void {
  toastVerdict = getVerdict;
  emit = onEmit;
  buildGrid('ballsGrid', BALLS);
  buildGrid('passivesGrid', PASSIVES);
  buildCharacters();
  buildFusionList();
  buildFusionPanel();
  buildPlan();
  buildSelectionBox('balls');
  buildSelectionBox('passives');
}

/** Repaint state (selection/related/dimmed/filtered, verdict badges,
 *  character cards and chips, fusion picks and panel, the plan screen) on
 *  the existing DOM. Safe to call before buildAll() (no-op — nothing built
 *  yet). Idempotent; never recreates <img> elements — the fusion panel's
 *  skeleton (with its two head icons) is built once and repainted in place,
 *  and the plan's entries rebuild only when the selection or upgrade toggle
 *  changes (the chips' diff pattern). */
export function paint(vm: ViewModel): void {
  paintTiles(vm);
  paintCharCards(vm);
  renderCharChips(vm);
  paintFusion(vm);
  paintPlan(vm);
  paintSelectionBoxes(vm);
}
