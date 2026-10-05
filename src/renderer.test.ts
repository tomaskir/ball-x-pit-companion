// Regression tests for the renderer's DOM contracts that pure view-model
// tests cannot see. The fusion-panel bug (see regression.test.ts) lived in
// the buildFusionPanel skeleton: nth-of-type selectors that matched nothing,
// silently leaving the panel frozen. These tests parse the renderer's own
// skeleton against the selectors it queries, and — through jsdom — paint a
// full state sequence through paint() itself, asserting what the user sees.
// @vitest-environment jsdom
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
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
const CONTAINERS = ['ballsGrid', 'passivesGrid', 'charactersGrid', 'charChips', 'slotHint', 'fusionList', 'fusionPanel'];

/** Drive the real view-state + renderer pair: build once, then dispatch and
 *  paint each step — the same path the island runs. */
function drive(steps: Action[]): ViewModel {
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
  buildAll(() => null);
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
    const vm = view.dispatch({ type: 'toggleFusion', id: 'flash' });
    paint(vm);
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
    let vm = view.dispatch({ type: 'toggleFusion', id: 'flash' });
    vm = view.dispatch({ type: 'toggleFusion', id: 'glacier' });
    paint(vm);
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

  it('evolve-instead pair shows the evo line', () => {
    let vm = view.dispatch({ type: 'toggleFusion', id: 'bleed' });
    vm = view.dispatch({ type: 'toggleFusion', id: 'poison' });
    paint(vm);
    expect(q('.fusion-evo').hidden).toBe(false);
    expect(q('.fusion-evo').textContent).toContain('Virus');
  });

  it('cross-wire pair shows the cross line', () => {
    let vm = view.dispatch({ type: 'toggleFusion', id: 'black-hole' });
    vm = view.dispatch({ type: 'toggleFusion', id: 'sun' });
    paint(vm);
    expect(q('.fusion-cross').hidden).toBe(false);
    expect(q('.fusion-cross').textContent).toContain('Black Hole');
  });

  it('full sequence empty → pending → composed → back to pending repaints every piece in place', () => {
    // composed first (so the pending state must actively clear stale content)
    let vm = view.dispatch({ type: 'toggleFusion', id: 'flash' });
    vm = view.dispatch({ type: 'toggleFusion', id: 'glacier' });
    paint(vm);
    expect(q('.fusion-body').hidden).toBe(false);
    expect(q('.fusion-notes').hidden).toBe(false);

    vm = view.dispatch({ type: 'toggleFusion', id: 'glacier' }); // deselect → pending
    paint(vm);
    expect(q('.fusion-head').hidden).toBe(false);
    expect(q('.name-a').textContent).toBe(flash().name);
    expect(q('.fusion-times').textContent).toBe('+ ?');
    expect(q<HTMLImageElement>('.icon-b').style.display).toBe('none');
    expect(q('.name-b').textContent).toBe('');
    expect(q('.fusion-hint').textContent).toContain('pick a second ball');
    expect(q('.fusion-evo').hidden).toBe(true);
    expect(q('.fusion-body').hidden).toBe(true);
    expect(q('.fusion-notes').hidden).toBe(true);

    vm = view.dispatch({ type: 'toggleFusion', id: 'flash' }); // deselect → empty
    paint(vm);
    expect(q('.fusion-hint').textContent).toContain('Pick two balls');
    expect(q('.fusion-head').hidden).toBe(true);
    expect(q('.fusion-body').hidden).toBe(true);
    expect(q('.fusion-notes').hidden).toBe(true);

    vm = view.dispatch({ type: 'toggleFusion', id: 'glacier' }); // new pending
    paint(vm);
    expect(q('.name-a').textContent).toBe(glacier().name);
    expect(q<HTMLImageElement>('.icon-a').getAttribute('src')).toBe(iconUrl('/', glacier().icon));
  });

  it('head <img> elements are never recreated across a full sequence', () => {
    const iconA = q<HTMLImageElement>('.icon-a');
    const iconB = q<HTMLImageElement>('.icon-b');
    for (const id of ['flash', 'glacier', 'glacier', 'flash', 'maggot']) {
      paint(view.dispatch({ type: 'toggleFusion', id }));
    }
    expect(q<HTMLImageElement>('.icon-a')).toBe(iconA);
    expect(q<HTMLImageElement>('.icon-b')).toBe(iconB);
  });

  it('drive() helper runs dispatch+paint pairs', () => {
    const vm = drive([
      { type: 'toggleFusion', id: 'flash' },
      { type: 'toggleFusion', id: 'glacier' },
    ]);
    expect(vm.fusionPanel.state).toBe('composed');
  });
});
