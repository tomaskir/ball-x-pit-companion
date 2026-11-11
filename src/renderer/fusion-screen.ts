// The fusion screen: the pick list (built once, never recreate <img> — same
// invariant as the grids; pick order and filtering repaint classes in place)
// and the composed panel. The pick list mirrors the game's Fusion Reactor:
// any two of the fusable upgrade entities. Purely a DOM-row registry — the
// panel's picks, state, and composed fusion ride the view model
// (vm.fusionPanel). Internal to the renderer facade; the skeleton and its
// hook-selector map are exported as pure data so the tests pin the same
// values this module paints and queries.
import { fusionBalls } from '../fusion';
import { emitAction } from './seam';
import { clearPaintedKey, paintedKey, reconcile, setPaintedKey } from './reconcile';
import { DEPTH_LABELS, PLAN_LIMIT_TITLE, PLAN_TOGGLE_LABELS } from './labels';
import { icon } from './dom';
import type { ViewModel } from '../view-state';

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
  result: HTMLElement;
  resultRows: HTMLElement;
  resultEmpty: HTMLElement;
  exceptions: HTMLElement;
  exceptionsList: HTMLElement;
  orderNotice: HTMLElement;
  swapBtn: HTMLButtonElement;
  planBtn: HTMLButtonElement;
  planRow: HTMLElement;
} | null = null;

export function buildFusionList() {
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
        emitAction({ type: 'toggleFusion', id: ball.id });
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
    <section class="fusion-result" hidden>
      <h3 class="fusion-result-title">Fused result</h3>
      <ul class="fusion-result-rows"></ul>
      <p class="fusion-result-empty" hidden></p>
    </section>
    <section class="fusion-exceptions" hidden>
      <h3 class="fusion-exceptions-title">Reported exceptions</h3>
      <ul class="fusion-exceptions-list"></ul>
    </section>
    <ul class="fusion-notes" hidden></ul>
    <p class="fusion-order-notice" hidden></p>
    <div class="fusion-plan-row">
      <button class="fusion-swap-btn" type="button" hidden>Swap order</button>
      <button class="fusion-plan-btn" type="button" hidden></button>
    </div>`;

/** The fusion panel's hook selectors — the single source for both
 *  buildFusionPanel's queries and renderer.test.ts's skeleton check, so a
 *  renamed hook cannot drift between the panel and its test. Pure data. */
export const FUSION_PANEL_SELECTORS = {
  hint: '.fusion-hint',
  head: '.fusion-head',
  iconA: '.icon-a',
  nameA: '.name-a',
  times: '.fusion-times',
  iconB: '.icon-b',
  nameB: '.name-b',
  evo: '.fusion-evo',
  body: '.fusion-body',
  effA: '.eff-a',
  effB: '.eff-b',
  cross: '.fusion-cross',
  notes: '.fusion-notes',
  result: '.fusion-result',
  resultRows: '.fusion-result-rows',
  resultEmpty: '.fusion-result-empty',
  exceptions: '.fusion-exceptions',
  exceptionsList: '.fusion-exceptions-list',
  orderNotice: '.fusion-order-notice',
  swapBtn: '.fusion-swap-btn',
  planBtn: '.fusion-plan-btn',
  planRow: '.fusion-plan-row',
} as const;

export function buildFusionPanel() {
  const root = document.getElementById('fusionPanel')!;
  root.innerHTML = FUSION_PANEL_SKELETON;
  const q = (s: string) => root.querySelector(s)!;
  const sel = FUSION_PANEL_SELECTORS;
  fusionPanel = {
    root,
    hint: q(sel.hint) as HTMLElement,
    head: q(sel.head) as HTMLElement,
    iconA: q(sel.iconA) as HTMLImageElement,
    nameA: q(sel.nameA) as HTMLElement,
    op: q(sel.times) as HTMLElement,
    iconB: q(sel.iconB) as HTMLImageElement,
    nameB: q(sel.nameB) as HTMLElement,
    evo: q(sel.evo) as HTMLElement,
    body: q(sel.body) as HTMLElement,
    effA: q(sel.effA) as HTMLElement,
    effB: q(sel.effB) as HTMLElement,
    cross: q(sel.cross) as HTMLElement,
    notes: q(sel.notes) as HTMLElement,
    result: q(sel.result) as HTMLElement,
    resultRows: q(sel.resultRows) as HTMLElement,
    resultEmpty: q(sel.resultEmpty) as HTMLElement,
    exceptions: q(sel.exceptions) as HTMLElement,
    exceptionsList: q(sel.exceptionsList) as HTMLElement,
    orderNotice: q(sel.orderNotice) as HTMLElement,
    swapBtn: q(sel.swapBtn) as HTMLButtonElement,
    planBtn: q(sel.planBtn) as HTMLButtonElement,
    planRow: q(sel.planRow) as HTMLElement,
  };
  // the swap button is built once and hidden unless the pair is
  // order-sensitive; it reports the constant action through the seam
  fusionPanel.swapBtn.addEventListener('click', () => emitAction({ type: 'swapFusion' }));
  // the composed fusion's plan toggle reports through the build seam. The
  // button is built once; the picks change under it — the compose order it
  // acts on rides the reconcile seam's painted key ("a|b"), the same channel
  // the selection box's once-built buttons read their item through.
  fusionPanel.planBtn.addEventListener('click', () => {
    const key = paintedKey(fusionPanel.planBtn);
    if (!key) return;
    const [a, b] = key.split('|');
    emitAction({ type: 'togglePlanFusion', a, b });
  });
}

/** Repaint pick order, filtering, and the fusion panel. The panel is a
 *  3-state machine — the ViewModel names the state (vm.fusionPanel) and this
 *  switch paints per state: which hooks show, and what they show. Text nodes
 *  update in place; the two head <img> elements are created exactly once
 *  (build time). */
export function paintFusion(vm: ViewModel) {
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
  // States with no composed fusion hide the order-presentation blocks as one
  // unit: result rows, exceptions, warning line, swap button.
  const hideOrderPresentation = () => {
    p.result.hidden = true;
    p.exceptions.hidden = true;
    p.orderNotice.hidden = true;
    p.swapBtn.hidden = true;
  };
  // the plan toggle exists only in the composed state — and not at all for
  // evolve-instead pairs (they do not fuse, so there is nothing to plan)
  p.planBtn.hidden = fp.state !== 'composed' || !!fp.fusion.evolvesInstead;
  // the once-built plan button reads its compose order from its painted key
  // (see the click handler) — set on every composed paint, cleared otherwise
  // so no stale pair survives a trip through empty/pending
  if (fp.state === 'composed') setPaintedKey(p.planBtn, `${fp.a.id}|${fp.b.id}`);
  else clearPaintedKey(p.planBtn);

  // Pending states replace the body via hidden toggles; text nodes update in
  // place; the two head <img> elements are created exactly once (build time).
  if (fp.state === 'empty') {
    p.hint.textContent = vm.fusionHint;
    p.hint.hidden = false;
    p.head.hidden = true;
    p.evo.hidden = true;
    p.body.hidden = true;
    p.notes.hidden = true;
    hideOrderPresentation();
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
    hideOrderPresentation();
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
  p.planBtn.textContent = fp.planned ? PLAN_TOGGLE_LABELS.remove : PLAN_TOGGLE_LABELS.add;
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
    hideOrderPresentation();
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

  // "Fused result" — the shared-property collisions, resolved to the first
  // pick. Rows are text-only, so repainting never blinks an icon; the
  // reconcile key is the row content (a swap changes the winner/value).
  p.result.hidden = false;
  const collisions = f.resolved.collisions;
  const rowsKey = collisions.map((c) => `${c.key}|${c.winner}|${c.value}|${c.reported}`).join(',');
  reconcile(p.resultRows, rowsKey, () => {
    p.resultRows.replaceChildren(...collisions.map((c) => {
      const li = document.createElement('li');
      li.className = 'fusion-result-row';
      li.title = `${c.winnerName}'s ${c.value} wins over ${c.loserName}'s ${c.loserValue}`;
      const label = document.createElement('span');
      label.className = 'fusion-result-label';
      label.textContent = c.label;
      const value = document.createElement('span');
      value.className = 'fusion-result-value';
      value.textContent = c.value;
      const winner = document.createElement('span');
      winner.className = 'fusion-result-winner';
      winner.textContent = c.winnerName;
      li.append(label, ': ', value, ' — ', winner);
      // confirmed rows carry no marker; unverified ones a compact "· reported"
      if (c.reported) {
        const reported = document.createElement('span');
        reported.className = 'fusion-result-reported';
        reported.textContent = ' · reported';
        li.append(reported);
      }
      return li;
    }));
  });
  const noCollisions = collisions.length === 0;
  p.resultEmpty.hidden = !noCollisions;
  if (noCollisions) p.resultEmpty.textContent = fp.resultEmptyText;

  // "Reported exceptions" — anomalies outside the general rule, separate
  // from the result rows.
  p.exceptions.hidden = f.exceptions.length === 0;
  reconcile(p.exceptionsList, f.exceptions.map((e) => e.pair).join(','), () => {
    p.exceptionsList.replaceChildren(...f.exceptions.map((e) => {
      const li = document.createElement('li');
      li.className = 'fusion-exception';
      li.title = e.source;
      const title = document.createElement('span');
      title.className = 'fusion-exception-title';
      title.textContent = e.title;
      const detail = document.createElement('span');
      detail.className = 'fusion-exception-detail';
      detail.textContent = ` — ${e.detail}`;
      const confidence = document.createElement('span');
      confidence.className = 'fusion-exception-confidence';
      confidence.textContent = ` · ${e.confidence}`;
      li.append(title, detail, confidence);
      return li;
    }));
  });

  // The warning line sits directly above the action row; the swap affordance
  // exists only for order-sensitive pairs (decision #8).
  p.orderNotice.hidden = !fp.orderSensitive;
  p.orderNotice.textContent = fp.orderNotice;
  p.swapBtn.hidden = !fp.orderSensitive;
}
