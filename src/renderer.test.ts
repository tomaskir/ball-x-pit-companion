// Regression tests for the renderer's DOM contracts that pure view-model
// tests cannot see. The fusion-panel bug (see regression.test.ts) lived in
// the buildFusionPanel skeleton: nth-of-type selectors that matched nothing,
// silently leaving the panel frozen. These tests parse the renderer's own
// skeleton against the selectors it queries, and — through jsdom — paint a
// full state sequence through paint() itself, asserting what the user sees.
// The build seam (buildAll's options object) is pinned behaviorally too:
// clicking a real tile / char card / chip / fusion row calls emit with the
// right action type and id.
// @vitest-environment jsdom
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { buildAll, paint, FUSION_PANEL_SKELETON, FUSION_PANEL_SELECTORS } from './renderer';
import { createViewState, type ViewModel, type Action } from './view-state';
import { BUILD_GRAPH_ROWS } from './build-graph';
import { ballMap } from './catalog';
import { iconUrl } from './icon-url';
import { mountShell } from './test-support/containers';

describe('fusion panel skeleton (renderer.ts)', () => {
  it('every selector buildFusionPanel queries resolves in its own skeleton', () => {
    // the skeleton and the selector map are named exports — the same values
    // buildFusionPanel paints and queries — so a drift here is exactly the
    // bug class being pinned
    const root = document.createElement('div');
    root.innerHTML = FUSION_PANEL_SKELETON;
    const missing = Object.values(FUSION_PANEL_SELECTORS).filter((s) => !root.querySelector(s));
    expect(missing, `selectors matching nothing: ${missing.join(', ')}`).toEqual([]);
  });

  it('the two head icons are real <img> elements (never-recreate invariant)', () => {
    const root = document.createElement('div');
    root.innerHTML = FUSION_PANEL_SKELETON;
    expect(root.querySelectorAll('.fusion-head img')).toHaveLength(2);
    expect(root.querySelector<HTMLImageElement>('.icon-a')!.tagName).toBe('IMG');
    expect(root.querySelector<HTMLImageElement>('.icon-b')!.tagName).toBe('IMG');
  });
});

// ---------- behavior: paint() through a state sequence ----------

// The panel is the last module buildAll() builds; the grids/cards before it
// need their index.astro containers — provided (with the static plan toolbar)
// by the shared test-support shell.


/** Drive the real view-state + renderer pair: dispatch and paint each step —
 *  the same path the island runs. Returns the last view model. */
function drive(...steps: Action[]): ViewModel {
  let vm: ViewModel | null = null;
  for (const action of steps) {
    vm = view.dispatch(action);
    paint(vm);
  }
  return vm!;
}

let view: ReturnType<typeof createViewState>;
const flash = () => ballMap.get('flash')!;
const glacier = () => ballMap.get('glacier')!;

beforeAll(() => {
  mountShell();
  buildAll({ emit: () => {} });
});

beforeEach(() => {
  view = createViewState();
  paint(view.derive()); // initial paint: panel must start empty
});

const panel = () => document.getElementById('fusionPanel')!;
const q = <T extends HTMLElement>(s: string) => panel().querySelector<T>(s)!;

describe('fusion panel behavior (jsdom, through paint())', () => {
  it('empty state: hint visible, everything else hidden', () => {
    expect(q('.fusion-hint').hidden).toBe(false);
    expect(q('.fusion-hint').textContent).toBe(view.derive().fusionHint);
    expect(q('.fusion-head').hidden).toBe(true);
    expect(q('.fusion-evo').hidden).toBe(true);
    expect(q('.fusion-body').hidden).toBe(true);
    expect(q('.fusion-notes').hidden).toBe(true);
  });

  it('pending state: head shows the first ball, second icon slot display:none, hint updates', () => {
    const vm = drive({ type: 'toggleFusion', id: 'flash' });
    const iconA = q<HTMLImageElement>('.icon-a');
    const iconB = q<HTMLImageElement>('.icon-b');
    expect(q('.fusion-head').hidden).toBe(false);
    expect(q('.fusion-times').textContent).toBe('+ ?');
    expect(iconA.getAttribute('src')).toBe(iconUrl('/', flash().icon));
    expect(iconA.alt).toBe(flash().name);
    expect(q('.name-a').textContent).toBe(flash().name);
    // the src-less <img> broken-image-box fix: slot hidden entirely
    expect(iconB.style.display).toBe('none');
    expect(q('.name-b').textContent).toBe('');
    expect(q('.fusion-hint').hidden).toBe(false);
    expect(q('.fusion-hint').textContent).toBe(vm.fusionHint);
    expect(q('.fusion-evo').hidden).toBe(true);
    expect(q('.fusion-body').hidden).toBe(true);
    expect(q('.fusion-notes').hidden).toBe(true);
  });

  it('composed state: full panel — head, evo slot, body, cross, notes', () => {
    drive({ type: 'toggleFusion', id: 'flash' }, { type: 'toggleFusion', id: 'glacier' });
    const iconB = q<HTMLImageElement>('.icon-b');
    expect(q('.fusion-head').hidden).toBe(false);
    expect(q('.fusion-times').textContent).toBe('×');
    expect(iconB.style.display).toBe('');
    expect(iconB.getAttribute('src')).toBe(iconUrl('/', glacier().icon));
    expect(iconB.alt).toBe(glacier().name);
    expect(q('.name-b').textContent).toBe(glacier().name);
    expect(q('.fusion-hint').hidden).toBe(true);
    expect(q('.fusion-evo').hidden).toBe(true); // Flash × Glacier does not evolve
    expect(q('.fusion-body').hidden).toBe(false);
    expect(q('.eff-a').textContent!.length).toBeGreaterThan(0);
    expect(q('.eff-b').textContent!.length).toBeGreaterThan(0);
    expect(q('.fusion-notes').hidden).toBe(false);
  });

  it('evolve-instead pair shows the evo line and hides the fusion texts', () => {
    drive({ type: 'toggleFusion', id: 'bleed' }, { type: 'toggleFusion', id: 'poison' });
    expect(q('.fusion-evo').hidden).toBe(false);
    expect(q('.fusion-evo').textContent).toContain('Virus');
    // the pair does not fuse — the composed effect paragraphs, cross-wire,
    // and notes would be made-up content, so only balls + warning show
    expect(q('.fusion-body').hidden).toBe(true);
    expect(q('.fusion-cross').hidden).toBe(true);
    expect(q('.fusion-notes').hidden).toBe(true);
  });

  it('paint leaves nothing stale when a composed pair gives way to an evolve pair or to pending/empty', () => {
    // cross-wire pair first (its cross line and notes show)…
    drive({ type: 'toggleFusion', id: 'black-hole' }, { type: 'toggleFusion', id: 'sun' });
    expect(q('.fusion-cross').hidden).toBe(false);
    expect(q('.fusion-notes').hidden).toBe(false);
    // …then an evolve-instead pair: the whole composed body must go
    drive(
      { type: 'toggleFusion', id: 'black-hole' },
      { type: 'toggleFusion', id: 'sun' },
      { type: 'toggleFusion', id: 'bleed' },
      { type: 'toggleFusion', id: 'poison' },
    );
    expect(q('.fusion-evo').hidden).toBe(false);
    expect(q('.fusion-body').hidden).toBe(true);
    expect(q('.fusion-cross').hidden).toBe(true);
    expect(q('.fusion-notes').hidden).toBe(true);

    // …then back to pending: the composed pieces clear and the first ball stays
    let vm = drive({ type: 'toggleFusion', id: 'bleed' }); // deselect → pending poison
    expect(q('.fusion-head').hidden).toBe(false);
    expect(q('.name-a').textContent).toBe('Poison');
    expect(q('.fusion-times').textContent).toBe('+ ?');
    expect(q<HTMLImageElement>('.icon-b').style.display).toBe('none');
    expect(q('.name-b').textContent).toBe('');
    expect(q('.fusion-hint').textContent).toBe(vm.fusionHint);
    expect(q('.fusion-body').hidden).toBe(true);
    expect(q('.fusion-notes').hidden).toBe(true);

    // …then empty: the head goes too
    vm = drive({ type: 'toggleFusion', id: 'poison' }); // deselect → empty
    expect(q('.fusion-hint').textContent).toBe(vm.fusionHint);
    expect(q('.fusion-head').hidden).toBe(true);
    expect(q('.fusion-body').hidden).toBe(true);
    expect(q('.fusion-notes').hidden).toBe(true);

    // …then a fresh pending pick repaints the head in place
    drive({ type: 'toggleFusion', id: 'glacier' });
    expect(q('.name-a').textContent).toBe(glacier().name);
    expect(q<HTMLImageElement>('.icon-a').getAttribute('src')).toBe(iconUrl('/', glacier().icon));
  });

  it('cross-wire pair shows the cross line', () => {
    const vm = drive({ type: 'toggleFusion', id: 'black-hole' }, { type: 'toggleFusion', id: 'sun' });
    const fp = vm.fusionPanel as Extract<typeof vm.fusionPanel, { state: 'composed' }>;
    expect(q('.fusion-cross').hidden).toBe(false);
    expect(q('.fusion-cross').textContent).toBe(fp.fusion.crossWire);
  });

  it('head <img> elements are never recreated across a full sequence', () => {
    const iconA = q<HTMLImageElement>('.icon-a');
    const iconB = q<HTMLImageElement>('.icon-b');
    drive(
      { type: 'toggleFusion', id: 'flash' },
      { type: 'toggleFusion', id: 'glacier' },
      { type: 'toggleFusion', id: 'glacier' },
      { type: 'toggleFusion', id: 'flash' },
      { type: 'toggleFusion', id: 'maggot' },
    );
    expect(q<HTMLImageElement>('.icon-a')).toBe(iconA);
    expect(q<HTMLImageElement>('.icon-b')).toBe(iconB);
  });
});

// ---------- behavior: the build seam's emit callback ----------

// Clicking a built tile / char card / chip / fusion row must report the
// selection toggle through the emit callback the island supplies at build
// time — the seam that replaced the untyped CustomEvent bus.
describe('build seam: clicks call emit (jsdom)', () => {
  it('tile click emits toggleItem with the item id', () => {
    const emit = vi.fn();
    buildAll({ emit });
    const tile = document.querySelector<HTMLElement>('#ballsGrid .tile[data-id="flash"]')!;
    expect(tile).toBeTruthy();
    tile.click();
    expect(emit).toHaveBeenCalledWith({ type: 'toggleItem', id: 'flash' });
  });

  it('char card click emits toggleChar with the character id', () => {
    const emit = vi.fn();
    buildAll({ emit });
    const card = document.querySelector<HTMLElement>('#charactersGrid .char-card')!;
    card.click();
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith({ type: 'toggleChar', id: card.dataset.id ?? expect.any(String) });
  });

  it('the chip X button emits toggleChar; the chip body is inert (removal is X-only)', () => {
    const emit = vi.fn();
    buildAll({ emit });
    // chips only exist once a character is selected — paint the selection first
    const view = createViewState();
    paint(view.dispatch({ type: 'toggleChar', id: 'the-warrior' }));
    const chip = document.querySelector<HTMLElement>('#charChips .chip')!;
    expect(chip).toBeTruthy();
    chip.click();
    expect(emit).not.toHaveBeenCalled();
    const x = chip.querySelector<HTMLElement>('.chip-x')!;
    expect(x).toBeTruthy();
    x.click();
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith({ type: 'toggleChar', id: 'the-warrior' });
  });

  it('fusion row click emits toggleFusion with the ball id', () => {
    const emit = vi.fn();
    buildAll({ emit });
    const row = document.querySelector<HTMLElement>('#fusionList .fusion-row[data-id="flash"]')!;
    expect(row).toBeTruthy();
    row.click();
    expect(emit).toHaveBeenCalledWith({ type: 'toggleFusion', id: 'flash' });
  });

  it('the emit callback actually reaches view state (the island path)', () => {
    // the island's emit: dispatch + paint — clicking a tile must select it
    const view = createViewState();
    buildAll({ emit: (action) => paint(view.dispatch(action)) });
    document.querySelector<HTMLElement>('#ballsGrid .tile[data-id="flash"]')!.click();
    paint(view.derive());
    expect(document.querySelector('#ballsGrid .tile[data-id="flash"]')!.classList.contains('selected')).toBe(true);
  });

  it('the toast verdict is the tile verdict paint() painted (one channel)', () => {
    // paint(vm) captures the view model the seam's toast reads, so hovering
    // a tile must show exactly the badge paintTiles just painted on it.
    buildAll({ emit: () => {} });
    const view = createViewState();
    const vm = view.dispatch({ type: 'toggleChar', id: 'the-ballbearer' });
    paint(vm);
    const badge = document.querySelector<HTMLElement>('#ballsGrid .tile .ind')!;
    expect(badge).toBeTruthy();
    const tile = badge.closest<HTMLElement>('.tile')!;
    const verdict = vm.tiles.get(tile.dataset.id!)!.verdict!;
    expect(verdict).not.toBeNull();
    expect(badge.classList.contains(verdict.verdict)).toBe(true);

    tile.dispatchEvent(new MouseEvent('mouseenter'));
    const line = document.querySelector<HTMLElement>('body > .toast .verdicts span')!;
    expect(line.classList.contains(verdict.verdict)).toBe(true);
    expect(line.textContent).toContain(verdict.verdict);
    if (verdict.note) expect(line.textContent).toContain(verdict.note);
  });
});

// ---------- behavior: the plan screen (jsdom, through paint()) ----------

const planView = () => document.getElementById('planView')!;
const planQ = <T extends HTMLElement>(s: string) => planView().querySelector<T>(s)!;
// the End game upgrades toggle is static shell markup (index.astro), outside planView
const upgradesToggle = () => document.getElementById('planUpgrades') as HTMLInputElement;

describe('plan screen behavior (jsdom, through paint())', () => {
  it('empty plan: toggle checked, counts 0 / limit, empty hints visible, no entries', () => {
    paint(view.derive());
    const toggle = upgradesToggle();
    expect(toggle.checked).toBe(true);
    const counts = [...planView().querySelectorAll<HTMLElement>('.plan-count')].map((el) => el.textContent);
    expect(counts).toEqual(['0 / 2', '0 / 5', '0 / 5']);
    const empties = [...planView().querySelectorAll<HTMLElement>('.plan-empty')];
    expect(empties.every((el) => !el.hidden && el.textContent!.length > 0)).toBe(true);
    expect(planView().querySelectorAll('.plan-entry')).toHaveLength(0);
  });

  it('plan entries render with icons, names, and X remove buttons (each section complexity-ordered)', () => {
    drive(
      { type: 'toggleChar', id: 'the-warrior' },
      { type: 'togglePlanItem', id: 'flash' },
      { type: 'togglePlanItem', id: 'wagon-wheel' },
    );
    const entries = [...planView().querySelectorAll<HTMLElement>('.plan-entry')];
    expect(entries).toHaveLength(3);
    expect(entries[0].querySelector('img')!.getAttribute('src')).toContain('the-warrior');
    expect(entries[0].textContent).toContain('The Warrior');
    // character entries stack name over base chip in a body column
    expect(entries[0].querySelector('.plan-body .plan-base')).toBeTruthy();
    expect(entries[1].textContent).toContain('Flash');
    expect(entries[2].textContent).toContain('Wagon Wheel');
    // every entry has a remove button wired through the seam
    drive(
      { type: 'toggleChar', id: 'the-warrior' },
      { type: 'togglePlanItem', id: 'flash' },
      { type: 'togglePlanItem', id: 'wagon-wheel' },
    );
    const emit = vi.fn();
    buildAll({ emit });
    drive({ type: 'toggleChar', id: 'the-warrior' }, { type: 'togglePlanItem', id: 'flash' });
    const xs = [...planView().querySelectorAll<HTMLElement>('.plan-entry .plan-x')];
    expect(xs).toHaveLength(2);
    xs[1].click();
    expect(emit).toHaveBeenCalledWith({ type: 'togglePlanItem', id: 'flash' });
    xs[0].click();
    expect(emit).toHaveBeenCalledWith({ type: 'toggleChar', id: 'the-warrior' });
  });

  it('the upgrades toggle is shell chrome: paint reflects state on the static element; the island wires change → toggleUpgrades', () => {
    // paint alone reflects the state on the static shell element (the
    // renderer builds nothing here and never emits)
    drive({ type: 'toggleUpgrades' });
    const toggle = upgradesToggle();
    expect(toggle.checked).toBe(false);
    expect([...planView().querySelectorAll<HTMLElement>('.plan-count')].map((el) => el.textContent))
      .toEqual(['0 / 1', '0 / 4', '0 / 4']);
    // the island's wiring (companion.ts's update()): change → dispatch + paint
    toggle.addEventListener('change', () => paint(view.dispatch({ type: 'toggleUpgrades' })));
    toggle.click();
    expect(toggle.checked).toBe(true);
    expect([...planView().querySelectorAll<HTMLElement>('.plan-count')].map((el) => el.textContent))
      .toEqual(['0 / 2', '0 / 5', '0 / 5']);
  });

  it('over-limit entries get the over-limit class and the hint shows', () => {
    drive(
      { type: 'toggleChar', id: 'the-warrior' },
      { type: 'toggleChar', id: 'the-shade' },
      { type: 'toggleUpgrades' },
    );
    const entries = [...planView().querySelectorAll<HTMLElement>('.plan-entry')];
    expect(entries[0].classList.contains('over-limit')).toBe(false);
    expect(entries[1].classList.contains('over-limit')).toBe(true);
    expect(planQ('.plan-hint').hidden).toBe(false);
    expect(planQ('.plan-hint').textContent).toContain('Over the limit');
  });

  it('plan entry badges reflect verdicts against the selected characters', () => {
    drive({ type: 'togglePlanItem', id: 'wagon-wheel' });
    expect(planView().querySelector('.plan-entry .ind')).toBeNull();
    drive({ type: 'toggleChar', id: 'the-ballbearer' });
    // Wagon Wheel vs The Ballbearer's *passives wildcard → red
    expect(planView().querySelector('.plan-entry .ind.red')).toBeTruthy();
  });

  it('fused badges land by pair identity, not grid position (was slice(-plan.fused.length))', () => {
    // The fused-badge pass used to derive "the fused entries are the last N
    // children" positionally. Interleave the balls grid — fused entry moved
    // ahead of the single balls — and repaint: the badges must still land on
    // the pair's own entry.
    drive(
      { type: 'toggleChar', id: 'the-ballbearer' }, // green on both components (aoe)
      { type: 'togglePlanItem', id: 'flash' },
      { type: 'togglePlanItem', id: 'glacier' },
      { type: 'togglePlanFusion', a: 'flash', b: 'glacier' },
    );
    const grid = planView().querySelector<HTMLElement>('.plan-section[data-plan="balls"] .plan-grid')!;
    const entryNamed = (name: string) =>
      [...grid.querySelectorAll<HTMLElement>('.plan-entry')]
        .find((e) => e.querySelector('.plan-name')!.textContent === name)!;
    const fused = entryNamed('Flash × Glacier');
    // one green badge per component icon, and no entry-level badge
    expect(fused.querySelectorAll('.plan-icon .ind')).toHaveLength(2);
    expect(fused.querySelectorAll('.plan-icon .ind.green')).toHaveLength(2);
    expect(fused.querySelector(':scope > .ind')).toBeNull();

    // interleave: the fused entry is no longer the last child
    grid.insertBefore(fused, grid.firstElementChild);
    paint(view.derive()); // same entry set → no rebuild; badges must re-land by identity
    expect(fused.querySelectorAll('.plan-icon .ind')).toHaveLength(2);
    expect(fused.querySelectorAll('.plan-icon .ind.green')).toHaveLength(2);
    expect(fused.querySelector(':scope > .ind')).toBeNull();
    // the single balls keep their own verdict badges
    expect(entryNamed('Flash').querySelector('.ind.green')).toBeTruthy();
    expect(entryNamed('Glacier').querySelector('.ind.green')).toBeTruthy();
  });

  it('fused pairs render as one entry: both icons, ×, name, one X (emits togglePlanFusion)', () => {
    const emit = vi.fn();
    buildAll({ emit });
    drive({ type: 'togglePlanFusion', a: 'flash', b: 'glacier' });
    const entries = [...planView().querySelectorAll<HTMLElement>('.plan-entry')];
    expect(entries).toHaveLength(1);
    expect(entries[0].textContent).toContain('Flash × Glacier');
    // two compact icons beside the name — same shape as single-ball entries
    expect(entries[0].querySelector('.plan-body')).toBeNull();
    expect(entries[0].querySelectorAll('.plan-icon')).toHaveLength(2);
    const imgs = [...entries[0].querySelectorAll('img')];
    expect(imgs.some((i) => i.getAttribute('src')!.includes('flash'))).toBe(true);
    expect(imgs.some((i) => i.getAttribute('src')!.includes('glacier'))).toBe(true);
    entries[0].querySelector<HTMLElement>('.plan-x')!.click();
    expect(emit).toHaveBeenCalledWith({ type: 'togglePlanFusion', a: 'flash', b: 'glacier' });
  });

  it('a fused entry keeps an unordered identity while a compose-order change repaints the name', () => {
    // The pair's identity is unordered (src/pair.ts); compose order is
    // display content. A reversed hydrate must keep the same entry identity
    // yet repaint the name — the ordered key this replaced made a swap look
    // like a different pair.
    const plan = (a: string, b: string) => ({
      plan: { upgradesOn: true, balls: [], passives: [], fused: [{ a, b }] },
      chars: [],
    });
    const grid = () => planView().querySelector<HTMLElement>('.plan-section[data-plan="balls"] .plan-grid')!;

    drive({ type: 'hydrate', shared: plan('flash', 'glacier') });
    const first = grid().querySelector<HTMLElement>('.plan-entry')!;
    expect(first.querySelector('.plan-name')!.textContent).toBe('Flash × Glacier');
    expect(first.dataset.entry).toBe('fused:flash+glacier');

    // same compose order: the built entry (and its imgs) stays put
    const img = first.querySelector('img');
    paint(view.derive());
    expect(grid().querySelector('.plan-entry')).toBe(first);
    expect(grid().querySelector('img')).toBe(img);

    // reversed compose order: same unordered identity, repainted display
    drive({ type: 'hydrate', shared: plan('glacier', 'flash') });
    const second = grid().querySelector<HTMLElement>('.plan-entry')!;
    expect(second.querySelector('.plan-name')!.textContent).toBe('Glacier × Flash');
    expect(second.dataset.entry).toBe('fused:flash+glacier');
  });
});

// ---------- behavior: the selection box (jsdom, through paint()) ----------

describe('selection box behavior (jsdom, through paint())', () => {
  it('hidden when nothing is selected; shows name + buttons for a selected ball', () => {
    paint(view.derive());
    expect(document.getElementById('selection-balls')!.hidden).toBe(true);
    drive({ type: 'toggleItem', id: 'flash' });
    const box = document.getElementById('selection-balls')!;
    expect(box.hidden).toBe(false);
    expect(box.textContent).toContain('Selection:');
    expect(box.textContent).toContain('Flash');
    const buttons = [...box.querySelectorAll<HTMLElement>('.selection-btn')];
    expect(buttons).toHaveLength(2);
    expect(buttons[0].textContent).toBe('Add to plan');
    expect(buttons[1].textContent).toBe('Add to fusion');
  });

  it('buttons emit togglePlanItem / toggleFusion through the seam', () => {
    const emit = vi.fn();
    buildAll({ emit });
    drive({ type: 'toggleItem', id: 'flash' });
    const buttons = [...document.getElementById('selection-balls')!.querySelectorAll<HTMLElement>('.selection-btn')];
    buttons[0].click();
    expect(emit).toHaveBeenCalledWith({ type: 'togglePlanItem', id: 'flash' });
    buttons[1].click();
    expect(emit).toHaveBeenCalledWith({ type: 'toggleFusion', id: 'flash' });
  });

  it('a selected passive: passives box filled, no fusion button; balls box hidden', () => {
    drive({ type: 'toggleItem', id: 'wagon-wheel' });
    expect(document.getElementById('selection-passives')!.hidden).toBe(false);
    expect(document.getElementById('selection-balls')!.hidden).toBe(true);
    const buttons = [...document.getElementById('selection-passives')!.querySelectorAll<HTMLElement>('.selection-btn')];
    expect(buttons).toHaveLength(1);
    expect(buttons[0].textContent).toBe('Add to plan');
  });

  it('label states: in plan → Remove from plan; fusion picks full → disabled Add to fusion', () => {
    drive(
      { type: 'toggleItem', id: 'flash' },
      { type: 'togglePlanItem', id: 'flash' },
      { type: 'toggleFusion', id: 'glacier' },
      { type: 'toggleFusion', id: 'maggot' },
    );
    const box = document.getElementById('selection-balls')!;
    const buttons = [...box.querySelectorAll<HTMLElement>('.selection-btn')];
    expect(buttons[0].textContent).toBe('Remove from plan');
    expect(buttons[1].textContent).toBe('Add to fusion');
    expect((buttons[1] as HTMLButtonElement).disabled).toBe(true);
  });
});

// ---------- behavior: the fusion panel's Add to plan button ----------

describe('fusion panel plan button (jsdom, through paint())', () => {
  it('hidden in empty/pending states; visible with Add to plan when composed', () => {
    drive({ type: 'toggleFusion', id: 'flash' });
    expect(q('.fusion-plan-btn').hidden).toBe(true);
    drive({ type: 'toggleFusion', id: 'glacier' });
    expect(q('.fusion-plan-btn').hidden).toBe(false);
    expect(q('.fusion-plan-btn').textContent).toBe('Add to plan');
  });

  it('hidden entirely for an evolve-instead pair (the pair does not fuse)', () => {
    drive({ type: 'toggleFusion', id: 'bleed' }, { type: 'toggleFusion', id: 'poison' });
    expect(q('.fusion-plan-btn').hidden).toBe(true);
  });

  it('disabled with a tooltip when the plan balls are at their limit', () => {
    drive(
      { type: 'toggleFusion', id: 'black-hole' },
      { type: 'toggleFusion', id: 'sun' },
      { type: 'togglePlanItem', id: 'flash' },
      { type: 'togglePlanItem', id: 'glacier' },
      { type: 'togglePlanItem', id: 'maggot' },
      { type: 'togglePlanItem', id: 'flicker' },
      { type: 'togglePlanItem', id: 'burn' },
    );
    const btn = q<HTMLButtonElement>('.fusion-plan-btn');
    expect(btn.hidden).toBe(false);
    expect(btn.disabled).toBe(true);
    // the tooltip rides the row — a title on the disabled button never shows
    expect(btn.parentElement!.title).toContain('limit');
    expect(btn.textContent).toBe('Add to plan');
  });

  it('the plan button reads the CURRENT compose order after a repaint with a different pair', () => {
    // The button is built once; the picks change under it. Its handler must
    // read the compose order through the same channel every repaint updates
    // (the action-slot adapter) — the bug class the old stashed
    // fusionPanelState module variable enabled was a second channel that a
    // repaint path could forget to refresh.
    const emit = vi.fn();
    buildAll({ emit });
    drive({ type: 'toggleFusion', id: 'flash' }, { type: 'toggleFusion', id: 'glacier' });
    q<HTMLElement>('.fusion-plan-btn').click();
    expect(emit).toHaveBeenCalledWith({ type: 'togglePlanFusion', a: 'flash', b: 'glacier' });
    drive(
      { type: 'toggleFusion', id: 'flash' },
      { type: 'toggleFusion', id: 'glacier' },
      { type: 'toggleFusion', id: 'black-hole' },
      { type: 'toggleFusion', id: 'sun' },
    );
    q<HTMLElement>('.fusion-plan-btn').click();
    expect(emit).toHaveBeenCalledWith({ type: 'togglePlanFusion', a: 'black-hole', b: 'sun' });
  });

  it('click emits togglePlanFusion with the compose order; planned pair shows Remove from plan', () => {
    const emit = vi.fn();
    buildAll({ emit });
    drive({ type: 'toggleFusion', id: 'flash' }, { type: 'toggleFusion', id: 'glacier' });
    q<HTMLElement>('.fusion-plan-btn').click();
    expect(emit).toHaveBeenCalledWith({ type: 'togglePlanFusion', a: 'flash', b: 'glacier' });
    drive({ type: 'togglePlanFusion', a: 'flash', b: 'glacier' });
    expect(q('.fusion-plan-btn').textContent).toBe('Remove from plan');
  });
});

// ---------- behavior: order presentation (decision #8) ----------

describe('fusion panel order presentation (jsdom, through paint())', () => {
  it('order-sensitive pair: result rows name label/value/winner, warning + swap show', () => {
    drive({ type: 'toggleFusion', id: 'egg-sac' }, { type: 'toggleFusion', id: 'timestop' });
    expect(q('.fusion-result').hidden).toBe(false);
    const rows = [...panel().querySelectorAll<HTMLElement>('.fusion-result-row')];
    expect(rows).toHaveLength(1);
    expect(rows[0].textContent).toContain('Cooldown');
    expect(rows[0].textContent).toContain('3 second');
    expect(rows[0].textContent).toContain('Egg Sac');
    // confirmed row: no unverified marker
    expect(rows[0].textContent).not.toContain('· reported');
    expect(q('.fusion-order-notice').hidden).toBe(false);
    expect(q('.fusion-order-notice').textContent).toContain('Order matters');
    expect(q('.fusion-order-notice').textContent).toContain('Cooldown');
    expect(q('.fusion-swap-btn').hidden).toBe(false);
    expect(q('.fusion-plan-btn').hidden).toBe(false);
  });

  it('an unverified collision row carries the compact · reported marker', () => {
    drive({ type: 'toggleFusion', id: 'freeze-ray' }, { type: 'toggleFusion', id: 'blizzard' });
    const row = panel().querySelector<HTMLElement>('.fusion-result-row')!;
    expect(row.textContent).toContain('Freeze duration');
    expect(row.textContent).toContain('13.0 seconds');
    expect(row.textContent).toContain('· reported');
  });

  it('non-order pair with no shared properties hides the result section, warning, and swap', () => {
    drive({ type: 'toggleFusion', id: 'flash' }, { type: 'toggleFusion', id: 'glacier' });
    expect(q('.fusion-result').hidden).toBe(true);
    expect(panel().querySelectorAll('.fusion-result-row')).toHaveLength(0);
    expect(q('.fusion-order-notice').hidden).toBe(true);
    expect(q('.fusion-swap-btn').hidden).toBe(true);
    expect(q('.fusion-plan-btn').hidden).toBe(false);
  });

  it('a shared scalar with equal values is not a conflict, so the result section stays hidden', () => {
    // Bomb × Dark share Cooldown at the same value: a shared property, but
    // no winner to show — the section is for conflicts only.
    drive({ type: 'toggleFusion', id: 'bomb' }, { type: 'toggleFusion', id: 'dark' });
    expect(q('.fusion-result').hidden).toBe(true);
    expect(panel().querySelectorAll('.fusion-result-row')).toHaveLength(0);
    expect(q('.fusion-order-notice').hidden).toBe(true);
    expect(q('.fusion-swap-btn').hidden).toBe(true);
  });

  it('an order-dependent exception hides the empty result section but shows the exceptions and swap', () => {
    drive({ type: 'toggleFusion', id: 'nuclear-bomb' }, { type: 'toggleFusion', id: 'wraith' });
    expect(q('.fusion-result').hidden).toBe(true);
    expect(q('.fusion-exceptions').hidden).toBe(false);
    expect(q('.fusion-exceptions-list').textContent).toContain('Order-sensitive one-off');
    expect(q('.fusion-order-notice').hidden).toBe(false);
    expect(q('.fusion-swap-btn').hidden).toBe(false);
  });

  it('a non-order exception hides the empty result section, shows the section but no swap', () => {
    drive({ type: 'toggleFusion', id: 'banshee' }, { type: 'toggleFusion', id: 'flash' });
    expect(q('.fusion-result').hidden).toBe(true);
    expect(q('.fusion-exceptions').hidden).toBe(false);
    expect(q('.fusion-exceptions-list').textContent).toContain('Whole-field curse override');
    expect(q('.fusion-order-notice').hidden).toBe(true);
    expect(q('.fusion-swap-btn').hidden).toBe(true);
  });

  it('evolve-instead pair hides the result block, exceptions, warning, and swap', () => {
    drive({ type: 'toggleFusion', id: 'bleed' }, { type: 'toggleFusion', id: 'poison' });
    expect(q('.fusion-evo').hidden).toBe(false);
    expect(q('.fusion-result').hidden).toBe(true);
    expect(q('.fusion-exceptions').hidden).toBe(true);
    expect(q('.fusion-order-notice').hidden).toBe(true);
    expect(q('.fusion-swap-btn').hidden).toBe(true);
  });

  it('the result rows and component paragraphs use level-3 values', () => {
    drive({ type: 'toggleFusion', id: 'erosion' }, { type: 'toggleFusion', id: 'stone' });
    // Erosion's level-1 text says 3%; the level-3 overlay says 5% — the
    // fusion screen consumes L3 for both the paragraph and the resolved row
    expect(q('.eff-a').textContent).toContain("5% of enemy's current health");
    const row = panel().querySelector<HTMLElement>('.fusion-result-row')!;
    expect(row.textContent).toContain('5%');
    expect(row.textContent).toContain('Erosion');
  });

  it('the swap button emits swapFusion; through the island path it reverses the picks', () => {
    const emit = vi.fn();
    buildAll({ emit });
    drive({ type: 'toggleFusion', id: 'egg-sac' }, { type: 'toggleFusion', id: 'timestop' });
    q<HTMLElement>('.fusion-swap-btn').click();
    expect(emit).toHaveBeenCalledWith({ type: 'swapFusion' });

    // the island's emit: dispatch + paint — the panel recomputes in place
    const view = createViewState();
    buildAll({ emit: (action) => paint(view.dispatch(action)) });
    paint(view.dispatch({ type: 'toggleFusion', id: 'egg-sac' }));
    paint(view.dispatch({ type: 'toggleFusion', id: 'timestop' }));
    q<HTMLElement>('.fusion-swap-btn').click();
    expect(q('.name-a').textContent).toBe('Timestop');
    expect(q('.name-b').textContent).toBe('Egg Sac');
    expect(panel().querySelector<HTMLElement>('.fusion-result-row')!.textContent).toContain('20 second');
  });

  it('swapping repaints in place: the head <img>s and the result block are never recreated', () => {
    drive({ type: 'toggleFusion', id: 'egg-sac' }, { type: 'toggleFusion', id: 'timestop' });
    const iconA = q<HTMLImageElement>('.icon-a');
    const iconB = q<HTMLImageElement>('.icon-b');
    const result = q('.fusion-result');
    drive({ type: 'swapFusion' });
    expect(q<HTMLImageElement>('.icon-a')).toBe(iconA);
    expect(q<HTMLImageElement>('.icon-b')).toBe(iconB);
    expect(q('.fusion-result')).toBe(result);
    // result rows are text-only — no <img> inside the block to blink
    expect(panel().querySelectorAll('.fusion-result img')).toHaveLength(0);
  });
});

// ---------- behavior: Matchmaker pairing restrictions (jsdom) ----------

const charCard = (name: string) =>
  [...document.querySelectorAll<HTMLElement>('#charactersGrid .char-card')].find((c) => c.textContent!.includes(name))!;

describe('pairing restrictions in the DOM (jsdom, through paint())', () => {
  it('a forbidden partner card gets the blocked class and a tooltip naming the held character', () => {
    paint(view.dispatch({ type: 'toggleChar', id: 'the-repentant' }));
    const card = charCard('The Shieldbearer');
    expect(card.classList.contains('blocked')).toBe(true);
    expect(card.title).toBe("can't pair with The Repentant");
    // an allowed partner stays clean
    const ok = charCard('The Warrior');
    expect(ok.classList.contains('blocked')).toBe(false);
    expect(ok.title).toBe('');
  });

  it('deselecting clears every blocked mark and tooltip', () => {
    paint(view.dispatch({ type: 'toggleChar', id: 'the-repentant' }));
    paint(view.dispatch({ type: 'toggleChar', id: 'the-repentant' }));
    const card = charCard('The Shieldbearer');
    expect(card.classList.contains('blocked')).toBe(false);
    expect(card.title).toBe('');
  });

  it('a hydrated invalid pair marks both plan character entries invalid-pair', () => {
    paint(view.dispatch({
      type: 'hydrate',
      shared: {
        plan: { upgradesOn: true, balls: [], passives: [], fused: [] },
        chars: ['the-repentant', 'the-shieldbearer'],
      },
    }));
    const entries = [...planView().querySelectorAll<HTMLElement>('.plan-section[data-plan="characters"] .plan-entry')];
    expect(entries).toHaveLength(2);
    expect(entries.every((e) => e.classList.contains('invalid-pair'))).toBe(true);
    expect(entries[0].title).toBe("these two can't team up in a run");
  });

  it('a valid pair leaves the plan character entries unmarked', () => {
    paint(view.dispatch({
      type: 'hydrate',
      shared: {
        plan: { upgradesOn: true, balls: [], passives: [], fused: [] },
        chars: ['the-warrior', 'the-shade'],
      },
    }));
    const entries = [...planView().querySelectorAll<HTMLElement>('.plan-section[data-plan="characters"] .plan-entry')];
    expect(entries.every((e) => !e.classList.contains('invalid-pair') && e.title === '')).toBe(true);
  });
});

// ---------- plan build graphs (jsdom, through paint()) ----------

describe('plan build graphs (jsdom, through paint())', () => {
  const FID = 'fusion:freeze-ray+time-bomb';
  const graphEl = (ns: 'balls' | 'passives') =>
    document.querySelector<HTMLElement>(`.plan-graph[data-graph="${ns}"]`)!;
  const canvas = (ns: 'balls' | 'passives') =>
    graphEl(ns).querySelector<HTMLElement>('.plan-graph-canvas')!;

  it('both panels exist with toggles, row labels, and empty hints; canvases hide when empty', () => {
    paint(view.derive());
    const graphs = [...planView().querySelectorAll<HTMLElement>('.plan-graph')];
    expect(graphs.map((g) => g.dataset.graph)).toEqual(['balls', 'passives']);
    // balls get the fusion row label, passives don't (no passive fusions) —
    // both read the build-graph row model, one definition
    const labels = (ns: 'balls' | 'passives') =>
      [...graphEl(ns).querySelectorAll<HTMLElement>('.plan-graph-rowlabel')].map((l) => l.textContent);
    expect(labels('balls')).toEqual([...BUILD_GRAPH_ROWS.balls.labels]);
    expect(labels('passives')).toEqual([...BUILD_GRAPH_ROWS.passives.labels]);
    expect(graphs[0].querySelectorAll('.plan-graph-rowlabel')).toHaveLength(4);
    expect(graphs[1].querySelectorAll('.plan-graph-rowlabel')).toHaveLength(3);
    for (const ns of ['balls', 'passives'] as const) {
      expect(graphEl(ns).querySelector<HTMLElement>('.plan-graph-empty')!.hidden).toBe(false);
      expect(graphEl(ns).querySelector<HTMLElement>('.plan-graph-cols')!.hidden).toBe(true);
      expect(canvas(ns).querySelectorAll('.build-node')).toHaveLength(0);
    }
  });

  it('a planned fusion paints the layered graph: counts, final styling, pair icons, edges', () => {
    drive({ type: 'togglePlanFusion', a: 'freeze-ray', b: 'time-bomb' });
    const nodes = [...canvas('balls').querySelectorAll<HTMLElement>('.build-node')];
    const byId = (id: string) => nodes.find((n) => n.dataset.id === id)!;
    expect(byId('freeze')!.querySelector('.build-count')!.textContent).toBe('1');
    expect(byId('laser-horizontal')!.querySelector('.build-count')!.textContent).toBe('0-1');
    expect(byId('freeze-ray')!.classList.contains('final')).toBe(false);
    expect(byId('freeze-ray')!.querySelector('.build-name')!.textContent).toBe('Freeze Ray');
    const fusion = byId(FID)!;
    expect(fusion.classList.contains('final')).toBe(true);
    expect(fusion.classList.contains('fused')).toBe(true);
    expect(fusion.querySelectorAll('img')).toHaveLength(2);
    expect(fusion.querySelector('.build-name')!.textContent).toBe('Freeze Ray × Time Bomb');
    const svg = graphEl('balls').querySelector<SVGSVGElement>('.plan-graph-edges')!;
    expect(svg.querySelectorAll('path').length).toBeGreaterThanOrEqual(7);
  });

  it('clicking a node emits toggleGraphFocus through the seam; focus lights the chain in place', () => {
    const emit = vi.fn();
    buildAll({ emit });
    drive({ type: 'togglePlanFusion', a: 'freeze-ray', b: 'time-bomb' });
    canvas('balls').querySelector<HTMLElement>('.build-node[data-id="burn"]')!.click();
    expect(emit).toHaveBeenCalledWith({ type: 'toggleGraphFocus', id: 'burn' });
    // through the real view-state: the focused node, its downstream chain,
    // and the fusion riding in via its component — the rest dims
    drive({ type: 'toggleGraphFocus', id: 'burn' });
    const byId = (id: string) => canvas('balls').querySelector<HTMLElement>(`.build-node[data-id="${id}"]`)!;
    expect(byId('burn').classList.contains('focused')).toBe(true);
    expect(byId('bomb').classList.contains('related')).toBe(true);
    expect(byId(FID).classList.contains('related')).toBe(true);
    expect(byId('freeze').classList.contains('dimmed')).toBe(true);
    // the lit edges are exactly the focused chain's:
    // burn→bomb, bomb→time-bomb, time-bomb→fusion
    const lit = [...graphEl('balls').querySelectorAll<SVGPathElement>('path.lit')];
    expect(lit.map((p) => `${p.dataset.from}>${p.dataset.to}`).sort())
      .toEqual(['bomb>time-bomb', 'burn>bomb', `time-bomb>${FID}`]);
    drive({ type: 'toggleGraphFocus', id: 'burn' });
    expect(byId('burn').classList.contains('focused')).toBe(false);
    expect(byId('freeze').classList.contains('dimmed')).toBe(false);
  });

  it('the collapse toggle emits toggleGraphCollapse; paint reflects the collapsed panel', () => {
    const emit = vi.fn();
    buildAll({ emit });
    drive({ type: 'togglePlanFusion', a: 'freeze-ray', b: 'time-bomb' });
    graphEl('balls').querySelector<HTMLButtonElement>('.plan-graph-toggle')!.click();
    expect(emit).toHaveBeenCalledWith({ type: 'toggleGraphCollapse', which: 'balls' });
    drive({ type: 'toggleGraphCollapse', which: 'balls' });
    const section = graphEl('balls');
    expect(section.classList.contains('collapsed')).toBe(true);
    expect(section.querySelector('.plan-graph-toggle')!.getAttribute('aria-expanded')).toBe('false');
    drive({ type: 'toggleGraphCollapse', which: 'balls' });
    expect(section.classList.contains('collapsed')).toBe(false);
  });
});

describe('plan build graphs: fused-node layout + done checks (jsdom, through paint())', () => {
  const FID = 'fusion:freeze-ray+time-bomb';
  const canvas = () => document.querySelector<HTMLElement>('.plan-graph[data-graph="balls"] .plan-graph-canvas')!;
  const byId = (id: string) => canvas().querySelector<HTMLElement>(`.build-node[data-id="${id}"]`)!;

  it('the fused pair node lays its two icons side by side in one row wrapper', () => {
    drive({ type: 'togglePlanFusion', a: 'freeze-ray', b: 'time-bomb' });
    const fusion = byId(FID)!;
    // regression: bare imgs stacked vertically in the flex column and the
    // name overflowed out of the fixed box
    const icons = fusion.querySelector('.build-icons')!;
    expect(icons.querySelectorAll('img')).toHaveLength(2);
    expect(fusion.querySelector('.build-name')!.textContent).toBe('Freeze Ray × Time Bomb');
  });

  it('evolved/T3/fusion nodes carry a done check; base balls do not; clicking emits toggleGraphDone', () => {
    const emit = vi.fn();
    buildAll({ emit });
    drive({ type: 'togglePlanFusion', a: 'freeze-ray', b: 'time-bomb' });
    expect(byId('freeze')!.querySelector('.build-check')).toBeNull();
    for (const id of ['freeze-ray', 'time-bomb', FID]) {
      expect(byId(id)!.querySelector('.build-check')).toBeTruthy();
    }
    byId('freeze-ray')!.querySelector<HTMLButtonElement>('.build-check')!.click();
    expect(emit).toHaveBeenCalledWith({ type: 'toggleGraphDone', id: 'freeze-ray' });
  });

  it('a done mark dims the node, frees its components, and unmarking restores them', () => {
    drive({ type: 'togglePlanFusion', a: 'freeze-ray', b: 'time-bomb' });
    drive({ type: 'toggleGraphDone', id: 'freeze-ray' });
    expect(byId('freeze-ray')!.classList.contains('done')).toBe(true);
    // Freeze's remaining demand hit zero → suppressed, count 0
    expect(byId('freeze')!.classList.contains('suppressed')).toBe(true);
    expect(byId('freeze')!.querySelector('.build-count')!.textContent).toBe('0');
    expect(byId('laser-horizontal')!.classList.contains('suppressed')).toBe(true);
    // untouched branch keeps its counts
    expect(byId('burn')!.querySelector('.build-count')!.textContent).toBe('1');
    drive({ type: 'toggleGraphDone', id: 'freeze-ray' });
    expect(byId('freeze-ray')!.classList.contains('done')).toBe(false);
    expect(byId('freeze')!.querySelector('.build-count')!.textContent).toBe('1');
  });
});

describe('plan build graphs: in-place done state (jsdom, through paint())', () => {
  const FID = 'fusion:freeze-ray+time-bomb';
  const canvas = () => document.querySelector<HTMLElement>('.plan-graph[data-graph="balls"] .plan-graph-canvas')!;
  const byId = (id: string) => canvas().querySelector<HTMLElement>(`.build-node[data-id="${id}"]`)!;

  it('a suppressed node hides its check; the done node keeps its vivid check', () => {
    drive({ type: 'togglePlanFusion', a: 'freeze-ray', b: 'time-bomb' });
    drive({ type: 'toggleGraphDone', id: FID });
    // the fusion is done; Freeze Ray is suppressed through it — no check
    expect(byId(FID)!.classList.contains('done')).toBe(true);
    expect(byId(FID)!.querySelector<HTMLButtonElement>('.build-check')!.hidden).toBe(false);
    expect(byId('freeze-ray')!.classList.contains('suppressed')).toBe(true);
    expect(byId('freeze-ray')!.querySelector<HTMLButtonElement>('.build-check')!.hidden).toBe(true);
  });

  it('done toggles repaint state in place — no build-node <img> is recreated (invariant 2)', () => {
    drive({ type: 'togglePlanFusion', a: 'freeze-ray', b: 'time-bomb' });
    const img = byId('freeze')!.querySelector('img')!;
    const xBefore = byId('freeze')!.style.left;
    drive({ type: 'toggleGraphDone', id: 'freeze-ray' });
    // the freed base moved right of the live ones — in place, same element
    expect(byId('freeze')!.querySelector('img')!).toBe(img);
    expect(parseInt(byId('freeze')!.style.left, 10)).toBeGreaterThan(parseInt(xBefore, 10));
    drive({ type: 'toggleGraphDone', id: 'freeze-ray' });
    expect(byId('freeze')!.querySelector('img')!).toBe(img);
    expect(byId('freeze')!.style.left).toBe(xBefore);
    expect(byId('freeze-ray')!.querySelector('.build-count')!.textContent).toBe('1');
  });
});

describe('plan build graphs: structural changes still rebuild (jsdom, through paint())', () => {
  const canvas = () => document.querySelector<HTMLElement>('.plan-graph[data-graph="balls"] .plan-graph-canvas')!;

  it('adding a planned ball rebuilds the canvas (new node + new imgs), not an in-place patch', () => {
    drive({ type: 'togglePlanFusion', a: 'freeze-ray', b: 'time-bomb' });
    const img = canvas().querySelector('.build-node[data-id="freeze"] img')!;
    expect(canvas().querySelectorAll('.build-node')).toHaveLength(10);
    drive({ type: 'togglePlanItem', id: 'holy-laser' });
    // a structural change: new nodes, new edges — the sorted key changes
    expect(canvas().querySelectorAll('.build-node').length).toBeGreaterThan(10);
    expect(canvas().querySelector('.build-node[data-id="freeze"] img')).not.toBe(img);
  });
});
