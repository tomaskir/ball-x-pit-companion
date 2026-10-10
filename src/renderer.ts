// Renderer module: all DOM painting for the island. One interface:
// buildAll(options) builds the static DOM once (grids, character cards, the
// fusion panel, the plan screen skeleton), then paint(viewModel) repaints
// state on it — never recreating <img> elements (rebuilding would blink the
// icons; the plan's entries and the character chips are the one accepted
// exception, rebuilding only when their content key changes — the reconcile
// seam below). The toast subsystem is an adapter from src/toast.ts — the
// renderer creates it once at build time and only binds anchors to it.
// The island (src/companion.ts) is transport only — event
// listening, storage/history/clipboard, with the routing, clear-policy, and
// theme decisions in src/companion-core.ts and the share-link lifecycle in
// src/share.ts (plan persistence to localStorage is the island's own job);
// the ViewModel it paints comes from src/view-state.ts — the fusion panel rides
// the named fusionPanel state (empty / pending / composed) and paintFusion
// switches on it; the plan rides vm.plan and paintPlan paints per section;
// the renderer holds no domain data of its own. The icon-URL join comes
// from src/icon-url.ts.
//
// The build seam is the options object: { getVerdict, emit }. getVerdict
// supplies the toast adapter's per-item verdict against the current
// character selection; emit is how built-in click handlers report selection
// toggles back to the island — emit(action) hands over the whole view-state
// ToggleAction (the island dispatches it verbatim). The
// renderer never dispatches DOM events or touches view state: emit is just
// a callback the island supplies (it dispatches and paints); hover/tap
// toast listeners stay internal to the renderer (binding anchors to the
// toast adapter).
import { BALLS } from './data/balls';
import { PASSIVES } from './data/passives';
import { CHARACTERS, type Character } from './data/characters';
import { ballMap, itemFor, type Item } from './catalog';
import { fusionBalls } from './fusion';
import { BUILD_GRAPH_METRICS } from './build-graph';
import { recipeHtml } from './graph';
import { iconUrl } from './icon-url';
import { createToast, type ToastAdapter } from './toast';
import type { Verdict } from './synergy';
import type { PlanBallEntry, SelectionBoxState, ToggleAction, ViewModel } from './view-state';

const DEPTH_LABELS = ['Basic', 'Evolved', 'Tier-3'] as const;

/** Icons are stored in data as base-relative ("icons/balls/x.png"); the
 *  join with the configured base URL lives in src/icon-url.ts. */
const icon = (p: string) => iconUrl(import.meta.env.BASE_URL, p);

/** The build seam, captured once by buildAll: the click→island callback
 *  (the island dispatches the named view-state action and paints). The
 *  toast's verdict lookup rides the same seam into src/toast.ts's adapter. */
let emit: (action: ToggleAction) => void = () => {};

// ---------- reconcile ----------

// One seam for the renderer's built-once/repaint-in-place pattern — the
// content-diff bookkeeping four sites used to hand-roll (the chips' id-array
// compare, the plan's serialized whole-plan key, the panel icons' src
// compares, the selection boxes' stashed item id). A container's painted
// key is the identity of what was last painted on it, held in a WeakMap:
// nothing leaks into the DOM, and a container rebuilt by buildAll starts
// unpainted. reconcile() repaints only when the key changed — a match
// leaves the built DOM (especially <img>) untouched. The once-built buttons
// (the selection boxes', the fusion panel's plan toggle) read what they act
// on through the same map: the painted key IS the item/pair the buttons act
// on — one channel, refreshed by every repaint, never a second stashed one.
const paintedKeys = new WeakMap<HTMLElement, string>();

/** The content key last painted on el — what once-built handlers read. */
const paintedKey = (el: HTMLElement): string | undefined => paintedKeys.get(el);

/** Repaint el's content: run repaint unless key matches the last painted
 *  one. */
function reconcile(el: HTMLElement, key: string, repaint: () => void): void {
  if (paintedKeys.get(el) === key) return;
  repaint();
  paintedKeys.set(el, key);
}

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
    // Matchmaker pairing restriction: dimmed, not-allowed cursor, and a
    // tooltip naming the held character. The card stays clickable (the
    // dispatch is a no-op) so the native tooltip keeps working — disabled
    // elements suppress mouse events.
    card.classList.toggle('blocked', c.blocked);
    card.title = c.blockedBy ? `can't pair with ${c.blockedBy}` : '';
  }
}

// ---------- character chips ----------

// Chips rebuild only when the character selection changes — reconcile diffs
// the painted id set on the chip strip, so search/selection repaints skip
// the rebuild.
function renderCharChips(vm: ViewModel) {
  document.getElementById('slotHint')!.textContent = vm.slotHint;
  const wrap = document.getElementById('charChips')!;
  reconcile(wrap, vm.selectedChars.map((c) => c.id).join(','), () => {
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
  });
}

// ---------- toast ----------

// The toast lifecycle (build, show, hide, position, one-at-a-time
// replacement, and the document-level outside-tap dismissal) lives in
// src/toast.ts — the renderer only creates the adapter at build time and
// binds anchors to it (attachToast's free functions and module vars are
// gone). Re-created per buildAll; the previous instance is destroyed so its
// document-level dismissal listener never leaks.
let toast: ToastAdapter | null = null;

/** Bind an anchor to the toast adapter: hover/tap shows the toast for the
 *  item getItem() returns at show time, mouseleave hides, and a tap
 *  elsewhere on the document dismisses (the adapter owns that listener). */
function attachToast(anchor: HTMLElement, getItem: () => Item | null) {
  toast?.bind(anchor, getItem);
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

/** The fusion panel's skeleton, painted once into #fusionPanel at build time.
 *  Exported as data so the tests (renderer.test.ts) pin the skeleton's shape
 *  against the very string buildFusionPanel paints — a named seam instead of
 *  scraping this file's source for the first root.innerHTML literal. A pure
 *  string; it carries no behavior and does not touch the paint-only rule. */
export const FUSION_PANEL_SKELETON = `
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

function buildFusionPanel() {
  const root = document.getElementById('fusionPanel')!;
  root.innerHTML = FUSION_PANEL_SKELETON;
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
  // the composed fusion's plan toggle reports through the build seam. The
  // button is built once; the picks change under it — the compose order it
  // acts on rides the reconcile seam's painted key ("a|b"), the same channel
  // the selection box's once-built buttons read their item through.
  fusionPanel.planBtn.addEventListener('click', () => {
    const key = paintedKey(fusionPanel.planBtn);
    if (!key) return;
    const [a, b] = key.split('|');
    emit({ type: 'togglePlanFusion', a, b });
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
  // the plan toggle exists only in the composed state — and not at all for
  // evolve-instead pairs (they do not fuse, so there is nothing to plan)
  p.planBtn.hidden = fp.state !== 'composed' || !!fp.fusion.evolvesInstead;
  // the once-built plan button reads its compose order from its painted key
  // (see the click handler) — set on every composed paint, cleared otherwise
  // so no stale pair survives a trip through empty/pending
  if (fp.state === 'composed') paintedKeys.set(p.planBtn, `${fp.a.id}|${fp.b.id}`);
  else paintedKeys.delete(p.planBtn);

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
    // the head icons re-point only when their ball changes — reconcile's
    // key is the icon path, so a match leaves the <img> untouched
    const srcA = icon(fp.first.icon);
    reconcile(p.iconA, srcA, () => { p.iconA.src = srcA; });
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
  const srcA = icon(a.icon);
  reconcile(p.iconA, srcA, () => { p.iconA.src = srcA; });
  p.iconA.alt = a.name;
  p.nameA.textContent = a.name;
  p.hint.hidden = true;
  p.iconB.style.display = '';
  const srcB = icon(b.icon);
  reconcile(p.iconB, srcB, () => { p.iconB.src = srcB; });
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

// The plan screen's skeleton is built once; entries rebuild only when their
// section's entry set changed (reconcile's diff — the one accepted exception
// to never-recreate, since entry sets are dynamic). Badges and over-limit
// marks repaint in place every paint, found by each entry's stamped
// identity, so a character toggle (which changes verdicts but not the entry
// set) never rebuilds.
//
// Below the three sections sit the build graphs (one per namespace) — the
// same built-once/repaint-through-reconcile pattern: the canvas rebuilds
// only when the derived graph's content key changed; focus/related/dimmed
// highlight repaint in place, found by each node's data-id.
interface GraphSectionEls {
  section: HTMLElement;
  toggle: HTMLButtonElement;
  empty: HTMLElement;
  cols: HTMLElement;
  canvas: HTMLElement;
  svg: SVGSVGElement;
}

let planEls: {
  hint: HTMLElement;
  sections: {
    characters: { count: HTMLElement; empty: HTMLElement; grid: HTMLElement };
    balls: { count: HTMLElement; empty: HTMLElement; grid: HTMLElement };
    passives: { count: HTMLElement; empty: HTMLElement; grid: HTMLElement };
  };
  graphs: { balls: GraphSectionEls; passives: GraphSectionEls };
} | null = null;

const PLAN_EMPTY_HINTS = {
  characters: 'Pick characters on the Characters screen — they appear here.',
  balls: 'Balls you pick on the Balls screen will appear here.',
  passives: 'Passives you pick on the Passives screen will appear here.',
} as const;

const GRAPH_EMPTY_HINTS = {
  balls: 'Balls or fused pairs in your plan will show every step to build them here.',
  passives: 'Passives in your plan will show every step to build them here.',
} as const;

const GRAPH_TITLES = { balls: 'Ball build graph', passives: 'Passive build graph' } as const;
const GRAPH_ROW_LABELS = {
  balls: [...DEPTH_LABELS, 'Fusions'],
  passives: [...DEPTH_LABELS],
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
      </section>`).join('')}
    ${(['balls', 'passives'] as const).map((ns) => `
      <section class="plan-graph" data-graph="${ns}">
        <button class="plan-graph-toggle" type="button" aria-expanded="true">
          <span class="plan-graph-title">${GRAPH_TITLES[ns]}</span>
          <span class="plan-graph-caret" aria-hidden="true">▾</span>
        </button>
        <div class="plan-graph-body">
          <p class="plan-graph-empty">${GRAPH_EMPTY_HINTS[ns]}</p>
          <div class="plan-graph-cols">
            <div class="plan-graph-rowlabels" aria-hidden="true">
              ${GRAPH_ROW_LABELS[ns].map((l) => `<span class="plan-graph-rowlabel" style="height:${BUILD_GRAPH_METRICS.rowH}px">${l}</span>`).join('')}
            </div>
            <div class="plan-graph-scroll"><div class="plan-graph-canvas"><svg class="plan-graph-edges" aria-hidden="true"></svg></div></div>
          </div>
        </div>
      </section>`).join('')}`;
  const q = (s: string) => root.querySelector(s)!;
  const section = (key: string) => {
    const el = q(`.plan-section[data-plan="${key}"]`);
    return {
      count: el.querySelector('.plan-count') as HTMLElement,
      empty: el.querySelector('.plan-empty') as HTMLElement,
      grid: el.querySelector('.plan-grid') as HTMLElement,
    };
  };
  const graphSection = (ns: 'balls' | 'passives'): GraphSectionEls => {
    const el = q(`.plan-graph[data-graph="${ns}"]`);
    const toggle = el.querySelector('.plan-graph-toggle') as HTMLButtonElement;
    // the collapse toggle reports through the build seam like every other
    // built-in click handler
    toggle.addEventListener('click', () => emit({ type: 'toggleGraphCollapse', which: ns }));
    return {
      section: el as HTMLElement,
      toggle,
      empty: el.querySelector('.plan-graph-empty') as HTMLElement,
      cols: el.querySelector('.plan-graph-cols') as HTMLElement,
      canvas: el.querySelector('.plan-graph-canvas') as HTMLElement,
      svg: el.querySelector('.plan-graph-edges') as SVGSVGElement,
    };
  };
  planEls = {
    hint: q('.plan-hint') as HTMLElement,
    sections: { characters: section('characters'), balls: section('balls'), passives: section('passives') },
    graphs: { balls: graphSection('balls'), passives: graphSection('passives') },
  };
}

function planEntry(inner: string, onRemove: () => void): HTMLElement {
  const entry = document.createElement('div');
  entry.className = 'plan-entry';
  entry.innerHTML = `${inner}<button class="plan-x" aria-label="Remove">×</button>`;
  entry.querySelector('.plan-x')!.addEventListener('click', () => onRemove());
  return entry;
}

/** A plan entry's identity: the reconcile key material and the data-entry
 *  stamp the badge repaint looks entries up by — one spelling, both uses. */
const entryKey = (prefix: string, id: string) => `${prefix}:${id}`;
/** A merged ball-grid entry's identity — one spelling shared by the
 *  reconcile diff, the entry stamp, and the badge lookup. */
const ballEntryKey = (e: PlanBallEntry): string =>
  e.kind === 'single' ? entryKey('ball', e.item.id) : entryKey('fused', `${e.a.id}+${e.b.id}`);

/** One single-ball/passive entry, stamped with its identity. */
const itemEntry = (item: Item, prefix: string, onRemove: () => void): HTMLElement => {
  const entry = planEntry(
    `<img src="${icon(item.icon)}" alt="${item.name}" width="48" height="48" loading="lazy"><span class="plan-name">${item.name}</span>`,
    onRemove,
  );
  entry.dataset.entry = entryKey(prefix, item.id);
  return entry;
};

function paintPlan(vm: ViewModel) {
  if (!planEls) return;
  const plan = vm.plan;
  const { sections } = planEls;
  // the End game upgrades toggle is static shell markup (index.astro, next
  // to Clear and Share) — the renderer only reflects the state on it; its
  // change event is wired by the island, like the other toolbar buttons
  const upgrades = document.getElementById('planUpgrades') as HTMLInputElement | null;
  if (upgrades) upgrades.checked = plan.upgradesOn;
  planEls.hint.textContent = plan.hint;
  planEls.hint.hidden = !plan.hint;

  // each section's entries rebuild only when that section's entry set
  // changed — reconcile diffs the entry identities. Every built entry is
  // stamped with its identity (data-entry) so the badge repaint below finds
  // entries by key, never by grid position.
  reconcile(sections.characters.grid, plan.characters.map((e) => entryKey('char', e.character.id)).join(','), () => {
    sections.characters.grid.replaceChildren(...plan.characters.map(({ character: ch }) => {
      const base = ch.baseBallId ? ballMap.get(ch.baseBallId) : null;
      // the body is a column: name over base chip — the sprite and X stay
      // put while the name wraps at word boundaries
      const entry = planEntry(
        `<img src="${icon(ch.sprite)}" alt="${ch.name}" width="48" height="48" loading="lazy">` +
        `<span class="plan-body"><span class="plan-name">${ch.name}</span>` +
        (base ? `<span class="plan-base" title="Base ball"><img src="${icon(base.icon)}" alt="${base.name}" width="20" height="20">${base.name}</span>` : '') +
        `</span>`,
        () => emit({ type: 'toggleChar', id: ch.id }),
      );
      entry.dataset.entry = entryKey('char', ch.id);
      return entry;
    }));
  });
  reconcile(
    sections.balls.grid,
    // the merged ball grid is already in paint order (plan-state derived it:
    // complexity, most complex left) — the keys just follow it
    plan.balls.map(ballEntryKey).join(','),
    () => {
      sections.balls.grid.replaceChildren(
        ...plan.balls.map((e) => {
          if (e.kind === 'single') {
            return itemEntry(e.item, 'ball', () => emit({ type: 'togglePlanItem', id: e.item.id }));
          }
          // fused pairs: both icons side by side (compact, so the composed name
          // fits beside them — same shape as the single-ball entries), name right,
          // one X for the pair — a pair is ONE entry (one ball slot). The name
          // carries the "×" between the components. Each icon sits in a wrapper
          // so the per-component verdict badge can ride it.
          const entry = planEntry(
            `<span class="plan-icons">` +
            `<span class="plan-icon"><img src="${icon(e.a.icon)}" alt="${e.a.name}" width="36" height="36" loading="lazy"></span>` +
            `<span class="plan-icon"><img src="${icon(e.b.icon)}" alt="${e.b.name}" width="36" height="36" loading="lazy"></span>` +
            `</span>` +
            `<span class="plan-name">${e.name}</span>`,
            () => emit({ type: 'togglePlanFusion', a: e.a.id, b: e.b.id }),
          );
          entry.dataset.entry = ballEntryKey(e);
          return entry;
        }),
      );
    },
  );
  reconcile(sections.passives.grid, plan.passives.map((e) => entryKey('passive', e.item.id)).join(','), () => {
    sections.passives.grid.replaceChildren(...plan.passives.map((e) => itemEntry(e.item, 'passive', () => emit({ type: 'togglePlanItem', id: e.item.id }))));
  });

  // counts and empty hints
  for (const [count, limit, els] of [
    [plan.counts.chars, plan.limits.chars, sections.characters],
    [plan.counts.balls, plan.limits.balls, sections.balls],
    [plan.counts.passives, plan.limits.passives, sections.passives],
  ] as const) {
    els.count.textContent = `${count} / ${limit}`;
    els.empty.hidden = count > 0;
  }

  // over-limit marks and verdict badges — repaint in place, found by each
  // entry's stamped identity (never grid position, so fused pairs stay put
  // however the grid orders them). Characters and fused pairs carry no
  // entry-level verdict — the null verdict paints no badge; fused pairs get
  // their per-component badges below.
  const makeBadge = (v: Verdict) => {
    const badge = document.createElement('span');
    badge.className = `ind ${v.verdict}`;
    badge.textContent = '!';
    badge.title = v.note ?? v.verdict;
    return badge;
  };
  const entryIndex = (grid: HTMLElement) =>
    new Map([...grid.querySelectorAll<HTMLElement>('.plan-entry')].map((el) => [el.dataset.entry ?? '', el]));
  const repaintEntry = (entry: HTMLElement | undefined, e: { overLimit: boolean; pairInvalid?: boolean; verdict?: Verdict | null }) => {
    if (!entry) return;
    entry.classList.toggle('over-limit', e.overLimit);
    // a hydrated Matchmaker-forbidden pair: kept, marked red — same
    // never-trim philosophy as over-limit
    entry.classList.toggle('invalid-pair', !!e.pairInvalid);
    entry.title = e.pairInvalid ? "these two can't team up in a run" : '';
    entry.querySelectorAll('.ind').forEach((b) => b.remove());
    if (e.verdict) entry.appendChild(makeBadge(e.verdict));
  };
  const charEntries = entryIndex(sections.characters.grid);
  plan.characters.forEach((e) => repaintEntry(charEntries.get(entryKey('char', e.character.id)), e));
  const ballEntries = entryIndex(sections.balls.grid);
  // the merged ball grid: singles take an entry-level verdict badge, fused
  // pairs one verdict badge per component icon
  plan.balls.forEach((e) => {
    if (e.kind === 'single') {
      repaintEntry(ballEntries.get(ballEntryKey(e)), e);
      return;
    }
    const entry = ballEntries.get(ballEntryKey(e));
    if (!entry) return;
    repaintEntry(entry, e);
    e.verdicts.forEach((v, j) => {
      if (!v) return;
      const wrap = entry.querySelectorAll<HTMLElement>('.plan-icon')[j];
      if (!wrap) return;
      wrap.appendChild(makeBadge(v));
    });
  });
  const passiveEntries = entryIndex(sections.passives.grid);
  plan.passives.forEach((e) => repaintEntry(passiveEntries.get(entryKey('passive', e.item.id)), e));
}

// ---------- plan build graphs ----------

// The two build-graph panels paint from vm.buildGraph's laid-out models
// (src/build-graph.ts derives and lays out; this only paints). The canvas
// rebuilds only when the graph's structure changed (reconcile's diff —
// nodes and edges are dynamic content, same exception as the plan entries);
// everything else — counts, done/suppressed, positions, edge paths, the
// focus highlight — repaints in place, found by each node's data-id and
// each edge's stamped endpoints.

/** One edge's identity: the stamped endpoints, shared by the reconcile key,
 *  the path lookup, and the DOM dataset stamp — one spelling, all uses. */
const edgeKey = (from: string, to: string): string => `${from}>${to}`;

/** Position one node card inside the canvas — the single geometry write,
 *  used by the rebuild and the in-place repaint alike so they cannot
 *  drift. */
function placeNode(el: HTMLElement, n: { x: number; y: number; w: number }): void {
  el.style.left = `${n.x}px`;
  el.style.top = `${n.y}px`;
  el.style.width = `${n.w}px`;
  el.style.height = `${BUILD_GRAPH_METRICS.nodeH}px`;
}
function paintBuildGraphs(vm: ViewModel) {
  if (!planEls) return;
  const bg = vm.buildGraph;
  for (const ns of ['balls', 'passives'] as const) {
    const els = planEls.graphs[ns];
    const layout = bg[ns];
    els.section.classList.toggle('collapsed', bg.collapsed[ns]);
    els.toggle.setAttribute('aria-expanded', String(!bg.collapsed[ns]));
    const empty = layout.nodes.length === 0;
    els.empty.hidden = !empty;
    els.cols.hidden = empty;
    if (empty) {
      // clear through reconcile too — a plan that empties must not leave the
      // previous graph's nodes behind (the svg edge layer lives inside the
      // canvas, so the clear removes everything but it)
      reconcile(els.canvas, '', () => {
        for (const el of [...els.canvas.children]) if (el !== els.svg) el.remove();
        els.svg.replaceChildren();
        els.canvas.style.width = '';
        els.canvas.style.height = '';
      });
      continue;
    }

    // the key is STRUCTURE only — which nodes and which edges exist, sorted
    // so a pure reorder (done marks move disabled nodes right) is NOT a
    // rebuild: per-node state AND positions repaint in place below, so a
    // done-mark toggle never recreates the canvas's <img>s
    const key =
      layout.nodes.map((n) => `${n.id}|${n.final ? 1 : 0}`).sort().join(',') +
      '#' +
      layout.edges.map((e) => edgeKey(e.from, e.to)).sort().join(',');
    reconcile(els.canvas, key, () => {
      // rebuild = replace: clear the previous node cards first (the svg edge
      // layer lives inside the canvas and stays) — appending would stack a
      // second graph under the first
      for (const child of [...els.canvas.children]) if (child !== els.svg) child.remove();
      els.canvas.style.width = `${layout.width}px`;
      els.canvas.style.height = `${layout.height}px`;
      els.svg.setAttribute('width', String(layout.width));
      els.svg.setAttribute('height', String(layout.height));
      els.svg.setAttribute('viewBox', `0 0 ${layout.width} ${layout.height}`);
      els.svg.replaceChildren(...layout.edges.map((e) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', e.path);
        path.dataset.from = e.from;
        path.dataset.to = e.to;
        return path;
      }));
      for (const n of layout.nodes) {
        // a div, not a button: done-able nodes carry their own check button
        // inside (no nested interactive elements)
        const el = document.createElement('div');
        el.className =
          `build-node${n.final ? ' final' : ''}${n.row === 3 ? ' fused' : ''}` +
          `${n.done ? ' done' : ''}${n.suppressed ? ' suppressed' : ''}`;
        el.dataset.id = n.id;
        placeNode(el, n);
        // icons ride one row wrapper — the fused pair's two icons sit side by
        // side (bare second img would stack under the first in the column)
        const imgs = n.row === 3
          ? `<img src="${icon(n.icon)}" alt="" width="28" height="28"><img src="${icon(n.icon2!)}" alt="" width="28" height="28">`
          : `<img src="${icon(n.icon)}" alt="${n.name}" width="28" height="28">`;
        // the done check: evolved/T3/fusion nodes only — base balls dim
        // automatically when their remaining demand hits zero. State
        // (label, hidden) paints in place below; the button exists whenever
        // the node kind does.
        const check = n.row > 0 ? '<button class="build-check" type="button" hidden>✓</button>' : '';
        el.innerHTML = `<span class="build-icons">${imgs}</span><span class="build-name">${n.name}</span><span class="build-count"></span>${check}`;
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          emit({ type: 'toggleGraphFocus', id: n.id });
        });
        el.querySelector('.build-check')?.addEventListener('click', (e) => {
          e.stopPropagation();
          emit({ type: 'toggleGraphDone', id: n.id });
        });
        els.canvas.appendChild(el);
      }
    });

    // per-node state repaints in place, found by data-id (never a rebuild —
    // the graph's <img>s stay put through done toggles and focus changes);
    // positions update too, because done toggles reorder rows
    const nodeById = new Map(layout.nodes.map((n) => [n.id, n]));
    for (const el of els.canvas.querySelectorAll<HTMLElement>('.build-node')) {
      const id = el.dataset.id ?? '';
      const n = nodeById.get(id);
      if (!n) continue;
      placeNode(el, n);
      // focus highlight
      el.classList.toggle('focused', bg.focus === id);
      el.classList.toggle('related', bg.focus !== null && bg.focus !== id && bg.related.has(id));
      el.classList.toggle('dimmed', bg.focus !== null && !bg.related.has(id));
      // remaining copies: "n" when every path needs that many, "min-max"
      // when alternates widen it, "0" once done marks freed every path
      const countEl = el.querySelector('.build-count');
      if (countEl) countEl.textContent = n.min === n.max ? `${n.min}` : `${n.min}-${n.max}`;
      el.classList.toggle('done', n.done);
      el.classList.toggle('suppressed', n.suppressed);
      // the check's state: a suppressed node needs no check — it already
      // sits at zero through other nodes' done marks
      const check = el.querySelector<HTMLButtonElement>('.build-check');
      if (check) {
        check.hidden = n.suppressed;
        check.ariaLabel = n.done ? 'Mark as not done' : 'Mark as done';
        check.title = n.done ? 'Not done yet' : 'Done this run';
      }
    }
    // edges: paths follow their endpoints' new positions after a reorder;
    // an edge lights when both endpoints sit in the focused chain
    const edgePath = new Map(layout.edges.map((e) => [edgeKey(e.from, e.to), e.path]));
    for (const path of els.svg.querySelectorAll<SVGPathElement>('path')) {
      const d = edgePath.get(edgeKey(path.dataset.from ?? '', path.dataset.to ?? ''));
      if (d) path.setAttribute('d', d);
      const lit = bg.focus !== null && bg.related.has(path.dataset.from ?? '') && bg.related.has(path.dataset.to ?? '');
      path.classList.toggle('lit', lit);
    }
  }
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
  // The click handlers read the currently painted item's id from the root's
  // painted key (the buttons are built once; the selection changes under
  // them) — see the reconcile seam.
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
    const id = paintedKey(root);
    if (id) emit({ type: 'togglePlanItem', id });
  });
  fusionBtn?.addEventListener('click', () => {
    const id = paintedKey(root);
    if (id) emit({ type: 'toggleFusion', id });
  });
  selectionBoxes[screen] = { root, name: root.querySelector('.selection-name') as HTMLElement, planBtn, fusionBtn };
}

function paintSelectionBoxes(vm: ViewModel) {
  for (const screen of ['balls', 'passives'] as const) {
    const els = selectionBoxes[screen];
    if (!els) continue;
    const state = vm.selectionBoxes[screen];
    els.root.hidden = !state;
    // the painted key is the item the once-built buttons act on; a null
    // state clears it so no stale id survives the hidden box
    if (state) paintedKeys.set(els.root, state.item.id);
    else paintedKeys.delete(els.root);
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
 *  `getVerdict` supplies the toast adapter's per-item verdict against the
 *  current character selection; `emit` is how the built-in click handlers
 *  report selection toggles back — the island dispatches the whole
 *  ToggleAction and paints. The renderer stays paint-only: it never
 *  dispatches DOM events and never touches view state. */
export interface BuildOptions {
  getVerdict: (item: Item) => Verdict | null;
  emit: (action: ToggleAction) => void;
}

/** Build all static DOM once: balls grid, passives grid, character cards,
 *  fusion pick list, plan screen skeleton — and the toast adapter (from
 *  src/toast.ts), which the grid tiles and base-ball chips bind to. Call
 *  once at startup, before the first paint(). */
export function buildAll({ getVerdict, emit: onEmit }: BuildOptions): void {
  toast?.destroy();
  toast = createToast({ getVerdict });
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
 *  and the plan's entries rebuild only when their section's entry set
 *  changes (the reconcile seam). */
export function paint(vm: ViewModel): void {
  paintTiles(vm);
  paintCharCards(vm);
  renderCharChips(vm);
  paintFusion(vm);
  paintPlan(vm);
  paintBuildGraphs(vm);
  paintSelectionBoxes(vm);
}
