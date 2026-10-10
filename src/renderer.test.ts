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
import { readFileSync } from 'node:fs';
import { buildAll, paint } from './renderer';
import { createViewState, type ViewModel, type Action } from './view-state';
import { ballMap } from './catalog';
import { iconUrl } from './icon-url';

/** The skeleton HTML from buildFusionPanel — kept in sync by extracting it
 *  from the source (a drift here is exactly the bug class being pinned). */
function skeletonHtml(): string {
  // Under the jsdom environment import.meta.url is an http URL (jsdom's URL
  // global wins), so join the repo-relative path from the process CWD — the
  // repo root, both locally and in CI (`vitest run` from the repo root).
  const src = readFileSync('src/renderer.ts', 'utf8');
  const m = src.match(/root\.innerHTML = `([\s\S]*?)`;/);
  if (!m) throw new Error('buildFusionPanel skeleton not found in renderer.ts');
  return m[1];
}

describe('fusion panel skeleton (renderer.ts)', () => {
  it('every selector buildFusionPanel queries resolves in its own skeleton', () => {
    const root = document.createElement('div');
    root.innerHTML = skeletonHtml();
    const q = (s: string) => root.querySelector(s);
    // the exact selector list from buildFusionPanel
    const selectors = [
      '.fusion-hint', '.fusion-head',
      '.icon-a', '.name-a', '.fusion-times', '.icon-b', '.name-b',
      '.fusion-evo', '.fusion-body', '.eff-a', '.eff-b', '.fusion-cross', '.fusion-notes',
      '.fusion-plan-btn',
    ];
    const missing = selectors.filter((s) => !q(s));
    expect(missing, `selectors matching nothing: ${missing.join(', ')}`).toEqual([]);
  });

  it('the two head icons are real <img> elements (never-recreate invariant)', () => {
    const root = document.createElement('div');
    root.innerHTML = skeletonHtml();
    expect(root.querySelectorAll('.fusion-head img')).toHaveLength(2);
    expect(root.querySelector<HTMLImageElement>('.icon-a')!.tagName).toBe('IMG');
    expect(root.querySelector<HTMLImageElement>('.icon-b')!.tagName).toBe('IMG');
  });
});

// ---------- behavior: paint() through a state sequence ----------

// The panel is the last module buildAll() builds; the grids/cards before it
// need their index.astro containers — provide the minimal set.
const CONTAINERS = ['ballsGrid', 'passivesGrid', 'charactersGrid', 'charChips', 'slotHint', 'fusionList', 'fusionPanel', 'planView', 'planUpgradesSlot', 'selection-balls', 'selection-passives'];

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
  for (const id of CONTAINERS) {
    const el = document.createElement('div');
    el.id = id;
    document.body.appendChild(el);
  }
  buildAll({ getVerdict: () => null, emit: () => {} });
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
    expect(q('.fusion-hint').textContent).toContain('Pick two balls');
    expect(q('.fusion-head').hidden).toBe(true);
    expect(q('.fusion-evo').hidden).toBe(true);
    expect(q('.fusion-body').hidden).toBe(true);
    expect(q('.fusion-notes').hidden).toBe(true);
  });

  it('pending state: head shows the first ball, second icon slot display:none, hint updates', () => {
    drive({ type: 'toggleFusion', id: 'flash' });
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
    expect(q('.fusion-hint').textContent).toContain('pick a second ball');
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

  it('a fusing pair with a cross-wire line followed by an evolve-instead pair leaves nothing stale', () => {
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
  });

  it('cross-wire pair shows the cross line', () => {
    drive({ type: 'toggleFusion', id: 'black-hole' }, { type: 'toggleFusion', id: 'sun' });
    expect(q('.fusion-cross').hidden).toBe(false);
    expect(q('.fusion-cross').textContent).toContain('Black Hole');
  });

  it('full sequence empty → pending → composed → back to pending repaints every piece in place', () => {
    // composed first (so the pending state must actively clear stale content)
    drive({ type: 'toggleFusion', id: 'flash' }, { type: 'toggleFusion', id: 'glacier' });
    expect(q('.fusion-body').hidden).toBe(false);
    expect(q('.fusion-notes').hidden).toBe(false);

    drive({ type: 'toggleFusion', id: 'glacier' }); // deselect → pending
    expect(q('.fusion-head').hidden).toBe(false);
    expect(q('.name-a').textContent).toBe(flash().name);
    expect(q('.fusion-times').textContent).toBe('+ ?');
    expect(q<HTMLImageElement>('.icon-b').style.display).toBe('none');
    expect(q('.name-b').textContent).toBe('');
    expect(q('.fusion-hint').textContent).toContain('pick a second ball');
    expect(q('.fusion-evo').hidden).toBe(true);
    expect(q('.fusion-body').hidden).toBe(true);
    expect(q('.fusion-notes').hidden).toBe(true);

    drive({ type: 'toggleFusion', id: 'flash' }); // deselect → empty
    expect(q('.fusion-hint').textContent).toContain('Pick two balls');
    expect(q('.fusion-head').hidden).toBe(true);
    expect(q('.fusion-body').hidden).toBe(true);
    expect(q('.fusion-notes').hidden).toBe(true);

    drive({ type: 'toggleFusion', id: 'glacier' }); // new pending
    expect(q('.name-a').textContent).toBe(glacier().name);
    expect(q<HTMLImageElement>('.icon-a').getAttribute('src')).toBe(iconUrl('/', glacier().icon));
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
    buildAll({ getVerdict: () => null, emit });
    const tile = document.querySelector<HTMLElement>('#ballsGrid .tile[data-id="flash"]')!;
    expect(tile).toBeTruthy();
    tile.click();
    expect(emit).toHaveBeenCalledWith({ type: 'toggleItem', id: 'flash' });
  });

  it('char card click emits toggleChar with the character id', () => {
    const emit = vi.fn();
    buildAll({ getVerdict: () => null, emit });
    const card = document.querySelector<HTMLElement>('#charactersGrid .char-card')!;
    card.click();
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith({ type: 'toggleChar', id: card.dataset.id ?? expect.any(String) });
  });

  it('the chip X button emits toggleChar; the chip body is inert (removal is X-only)', () => {
    const emit = vi.fn();
    buildAll({ getVerdict: () => null, emit });
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
    buildAll({ getVerdict: () => null, emit });
    const row = document.querySelector<HTMLElement>('#fusionList .fusion-row[data-id="flash"]')!;
    expect(row).toBeTruthy();
    row.click();
    expect(emit).toHaveBeenCalledWith({ type: 'toggleFusion', id: 'flash' });
  });

  it('the emit callback actually reaches view state (the island path)', () => {
    // the island's emit: dispatch + paint — clicking a tile must select it
    const view = createViewState();
    buildAll({
      getVerdict: () => null,
      emit: (action) => paint(view.dispatch(action)),
    });
    document.querySelector<HTMLElement>('#ballsGrid .tile[data-id="flash"]')!.click();
    paint(view.derive());
    expect(document.querySelector('#ballsGrid .tile[data-id="flash"]')!.classList.contains('selected')).toBe(true);
  });
});

// ---------- behavior: the plan screen (jsdom, through paint()) ----------

const planView = () => document.getElementById('planView')!;
const planQ = <T extends HTMLElement>(s: string) => planView().querySelector<T>(s)!;
// the End game upgrades toggle lives in the shell's plan toolbar, outside planView
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

  it('plan entries render in pick order with icons, names, and X remove buttons', () => {
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
    buildAll({ getVerdict: () => null, emit });
    drive({ type: 'toggleChar', id: 'the-warrior' }, { type: 'togglePlanItem', id: 'flash' });
    const xs = [...planView().querySelectorAll<HTMLElement>('.plan-entry .plan-x')];
    expect(xs).toHaveLength(2);
    xs[1].click();
    expect(emit).toHaveBeenCalledWith({ type: 'togglePlanItem', id: 'flash' });
    xs[0].click();
    expect(emit).toHaveBeenCalledWith({ type: 'toggleChar', id: 'the-warrior' });
  });

  it('the upgrade toggle emits toggleUpgrades and repaints checked + limits', () => {
    const emit = vi.fn();
    buildAll({ getVerdict: () => null, emit });
    drive({ type: 'toggleUpgrades' });
    expect(emit).not.toHaveBeenCalled(); // paint alone must not emit
    const toggle = upgradesToggle();
    expect(toggle.checked).toBe(false);
    expect([...planView().querySelectorAll<HTMLElement>('.plan-count')].map((el) => el.textContent))
      .toEqual(['0 / 1', '0 / 4', '0 / 4']);
    toggle.click();
    expect(emit).toHaveBeenCalledWith({ type: 'toggleUpgrades' });
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

  it('fused pairs render as one entry: both icons, ×, name, one X (emits togglePlanFusion)', () => {
    const emit = vi.fn();
    buildAll({ getVerdict: () => null, emit });
    drive({ type: 'togglePlanFusion', a: 'flash', b: 'glacier' });
    const entries = [...planView().querySelectorAll<HTMLElement>('.plan-entry')];
    expect(entries).toHaveLength(1);
    expect(entries[0].textContent).toContain('Flash × Glacier');
    // icons row on top, full-width name below (long names wrap, not squeeze)
    expect(entries[0].querySelector('.plan-body .plan-icons')).toBeTruthy();
    const imgs = [...entries[0].querySelectorAll('img')];
    expect(imgs.some((i) => i.getAttribute('src')!.includes('flash'))).toBe(true);
    expect(imgs.some((i) => i.getAttribute('src')!.includes('glacier'))).toBe(true);
    entries[0].querySelector<HTMLElement>('.plan-x')!.click();
    expect(emit).toHaveBeenCalledWith({ type: 'togglePlanFusion', a: 'flash', b: 'glacier' });
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
    buildAll({ getVerdict: () => null, emit });
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

  it('click emits togglePlanFusion with the compose order; planned pair shows Remove from plan', () => {
    const emit = vi.fn();
    buildAll({ getVerdict: () => null, emit });
    drive({ type: 'toggleFusion', id: 'flash' }, { type: 'toggleFusion', id: 'glacier' });
    q<HTMLElement>('.fusion-plan-btn').click();
    expect(emit).toHaveBeenCalledWith({ type: 'togglePlanFusion', a: 'flash', b: 'glacier' });
    drive({ type: 'togglePlanFusion', a: 'flash', b: 'glacier' });
    expect(q('.fusion-plan-btn').textContent).toBe('Remove from plan');
  });
});
