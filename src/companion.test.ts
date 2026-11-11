// Behavioral tests for the island itself: startIsland(ports) drives the real
// startup sequence — share param vs stored plan precedence, the one-shot
// strip, corrupt-storage survival, save-on-every-dispatch, theme, routing,
// and the clipboard fallback chain — through jsdom with stub ports. This is
// the pin that was missing while companion.ts was a top-level side effect
// (jsdom-hostile to import); the environment touchpoints are injected ports,
// so matchMedia (absent in jsdom) is a stub like everything else.
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { startIsland, type IslandPorts } from './companion';
import { PLAN_KEY } from './plan-session';
import { encodeShared, type SharedSnapshot } from './plan-codec';
import { isClearExempt } from './clear-exempt';
import { shellDoc } from './test-support/styles';

// ---------- jsdom shell: the real index.astro markup ----------

// The island's shell is the shipped page, not a hand-copied subset: a
// missing container or a missing clear-exemption marker in index.astro must
// fail here, not pass against a test-only replica. (The renderer builds the
// rest of the DOM — grids, cards, rows, panel, selection boxes — through
// buildAll, so every behavioral pin below runs against the real built DOM.)
function mountIslandShell() {
  document.body.innerHTML = shellDoc().body.innerHTML;
}

// ---------- stub ports ----------

const emptyShared: SharedSnapshot = { plan: { upgradesOn: true, balls: [], passives: [], fused: [] }, chars: [] };

/** Stub ports over an in-memory store + fake URL. `replaceState` is a mock so
 *  tests can pin the one-shot strip; `setHash` updates the fake hash the way
 *  `location.hash = …` would (the hashchange event itself is fired by tests). */
function stubPorts(init: {
  stored?: Record<string, string>;
  hash?: string;
  copy?: IslandPorts['copy'];
} = {}) {
  const store = new Map(Object.entries(init.stored ?? {}));
  let hash = init.hash ?? '';
  const replaceState = vi.fn();
  const setHash = vi.fn((h: string) => { hash = h; });
  const setItem = vi.fn((k: string, v: string) => { store.set(k, String(v)); });
  const promptCopy = vi.fn();
  const ports: IslandPorts = {
    storage: {
      getItem: (k) => store.get(k) ?? null,
      setItem,
    },
    location: {
      hash: () => hash,
      origin: () => 'https://example.com',
      pathname: () => '/ball-x-pit-companion/',
      setHash,
      replaceState,
    },
    copy: init.copy ?? (() => undefined),
    promptCopy,
    prefersLight: () => false,
  };
  return {
    ports,
    store,
    replaceState,
    setHash,
    setItem,
    promptCopy,
    setHashValue: (h: string) => { hash = h; },
    savedPlan: (): SharedSnapshot | null => {
      const raw = store.get(PLAN_KEY);
      return raw ? (JSON.parse(raw) as SharedSnapshot) : null;
    },
    /** How many times the plan key was written — the skip-unchanged pin. */
    planWrites: () => setItem.mock.calls.filter(([key]) => key === PLAN_KEY).length,
  };
}

let stop: (() => void) | null = null;

beforeEach(() => {
  mountIslandShell();
});

afterEach(() => {
  // the island's document/window listeners must not leak between tests
  stop?.();
  stop = null;
  vi.useRealTimers();
});

function start(ports: IslandPorts) {
  stop = startIsland(ports);
}

const planCounts = () =>
  [...document.querySelectorAll<HTMLElement>('#planView .plan-count')].map((el) => el.textContent);
const flashTile = () => document.querySelector<HTMLElement>('#ballsGrid .tile[data-id="flash"]')!;
/** A real plan change through the emit seam: select Flash, then "Add to plan"
 *  (a tile click alone is the screen selection — toggleItem — not the plan). */
const addFlashToPlan = () => {
  flashTile().click();
  document.querySelector<HTMLElement>('#selection-balls .selection-btn')!.click();
};

// ---------- startup precedence: share param beats stored plan ----------

describe('startup precedence (share param vs stored plan)', () => {
  it('a decodable share param wins: it replaces the stored plan and the URL is stripped (one-shot)', () => {
    const stored: SharedSnapshot = { ...emptyShared, plan: { ...emptyShared.plan, balls: ['wagon-wheel'] } };
    const shared: SharedSnapshot = {
      plan: { upgradesOn: false, balls: ['flash'], passives: [], fused: [] },
      chars: ['the-warrior'],
    };
    const t = stubPorts({ stored: { [PLAN_KEY]: JSON.stringify(stored) }, hash: `#/plan?p=${encodeShared(shared)}` });

    start(t.ports);

    // the link IS the plan: the recipient's storage now holds the sender's plan
    expect(t.savedPlan()).toEqual(shared);
    // one-shot strip: replaceState to the bare hash, exactly once
    expect(t.replaceState).toHaveBeenCalledTimes(1);
    expect(t.replaceState).toHaveBeenCalledWith('/ball-x-pit-companion/#/plan');
    // the shared plan actually painted (The Warrior's entry is on the plan)
    expect(document.querySelector('#planView .plan-entry')!.textContent).toContain('The Warrior');
  });

  it('a present-but-undecodable param leaves the URL alone and uses the stored plan', () => {
    // legacy flat localStorage shape (pre-codec) still loads; wagon-wheel is
    // a passive id — the plan's passive count shows it
    const stored = { upgradesOn: true, chars: [], balls: [], passives: ['wagon-wheel'], fused: [] };
    const t = stubPorts({ stored: { [PLAN_KEY]: JSON.stringify(stored) }, hash: '#/plan?p=not-a-real-code' });

    start(t.ports);

    expect(t.replaceState).not.toHaveBeenCalled();
    expect(t.savedPlan()).toEqual({ plan: { upgradesOn: true, balls: [], passives: ['wagon-wheel'], fused: [] }, chars: [] });
    expect(planCounts()).toEqual(['0 / 2', '0 / 5', '1 / 5']);
  });

  it('no param at all: stored plan used, URL untouched', () => {
    const stored: SharedSnapshot = { ...emptyShared, plan: { ...emptyShared.plan, passives: ['wagon-wheel'] } };
    const t = stubPorts({ stored: { [PLAN_KEY]: JSON.stringify(stored) }, hash: '#/plan' });

    start(t.ports);

    expect(t.replaceState).not.toHaveBeenCalled();
    expect(t.savedPlan()).toEqual(stored);
    expect(planCounts()).toEqual(['0 / 2', '0 / 5', '1 / 5']);
  });
});

// ---------- hydrate before first paint ----------

describe('hydrate-before-first-paint ordering', () => {
  it('start() alone paints the stored plan — no event, no second paint needed', () => {
    // The ordering's observable consequence: the very first paint already
    // reflects the hydrated plan. If the island painted before hydrating,
    // the plan would show empty here until some later dispatch.
    const stored: SharedSnapshot = {
      plan: { upgradesOn: true, balls: ['flash'], passives: ['wagon-wheel'], fused: [] },
      chars: [],
    };
    const t = stubPorts({ stored: { [PLAN_KEY]: JSON.stringify(stored) }, hash: '' });

    start(t.ports);

    expect(planCounts()).toEqual(['0 / 2', '1 / 5', '1 / 5']);
    expect(t.savedPlan()).toEqual(stored);
  });
});

// ---------- corrupt storage must not break startup ----------

describe('corrupt localStorage (startup survival)', () => {
  it('unparseable JSON: startup survives with an empty plan, and persistence still works after', () => {
    const t = stubPorts({ stored: { [PLAN_KEY]: '{oops' } });

    expect(() => start(t.ports)).not.toThrow();
    expect(planCounts()).toEqual(['0 / 2', '0 / 5', '0 / 5']);

    // the island is alive: dispatching a plan change persists a valid snapshot
    addFlashToPlan();
    expect(t.savedPlan()).toEqual({ ...emptyShared, plan: { ...emptyShared.plan, balls: ['flash'] } });
  });

  it('parseable JSON of the wrong shape: same survival (normalizeShared rejects it)', () => {
    const t = stubPorts({ stored: { [PLAN_KEY]: '"just a string"' } });

    expect(() => start(t.ports)).not.toThrow();
    expect(planCounts()).toEqual(['0 / 2', '0 / 5', '0 / 5']);
  });
});

// ---------- save on every dispatch ----------

describe('save-on-every-dispatch', () => {
  it('a plan change through the emit seam writes storage on every dispatch', () => {
    const t = stubPorts();
    start(t.ports);

    addFlashToPlan();
    expect(t.savedPlan()!.plan.balls).toEqual(['flash']);

    // the selection survives adding, so the same box still acts on Flash —
    // the button is now "Remove from plan". Toggling it off saves too.
    document.querySelector<HTMLElement>('#selection-balls .selection-btn[data-kind="plan"]')!.click();
    expect(t.savedPlan()!.plan.balls).toEqual([]);
  });

  it('a char card click persists too (toggleChar feeds the plan\'s characters)', () => {
    const t = stubPorts();
    start(t.ports);

    [...document.querySelectorAll<HTMLElement>('#charactersGrid .char-card')]
      .find((c) => c.textContent!.includes('The Warrior'))!
      .click();
    expect(t.savedPlan()!.chars).toEqual(['the-warrior']);
  });

  it('the Clear button wipes the stored plan (the only thing that does)', () => {
    const stored: SharedSnapshot = { ...emptyShared, plan: { ...emptyShared.plan, balls: ['flash'] } };
    const t = stubPorts({ stored: { [PLAN_KEY]: JSON.stringify(stored) } });
    start(t.ports);

    document.getElementById('planClear')!.click();
    expect(t.savedPlan()).toEqual(emptyShared);
  });
});

// ---------- unchanged plans are not rewritten ----------

describe('skip-unchanged saves', () => {
  const typeSearch = (value: string) => {
    const input = document.getElementById('search-balls') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const pressEscape = () =>
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

  it('search keystrokes and Esc clears do not rewrite a stored plan', () => {
    const stored: SharedSnapshot = { ...emptyShared, plan: { ...emptyShared.plan, balls: ['flash'] } };
    const t = stubPorts({ stored: { [PLAN_KEY]: JSON.stringify(stored) } });
    start(t.ports);
    const writes = t.planWrites();

    typeSearch('fl');
    typeSearch('flash');
    pressEscape();

    expect(t.planWrites()).toBe(writes);
  });

  it('a fresh browser does not create a storage entry on a search keystroke', () => {
    const t = stubPorts();
    start(t.ports);

    typeSearch('fl');
    pressEscape();

    expect(t.planWrites()).toBe(0);
  });

  it('a real plan change still writes', () => {
    const t = stubPorts();
    start(t.ports);
    const writes = t.planWrites();

    addFlashToPlan();

    expect(t.planWrites()).toBe(writes + 1);
  });
});

// ---------- theming ----------

describe('theme transport', () => {
  it('no stored theme + prefersLight false → dark; the toggle writes storage and flips', () => {
    const t = stubPorts();
    start(t.ports);

    expect(document.documentElement.dataset.theme).toBe('dark');
    document.getElementById('themeToggle')!.click();
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(t.store.get('theme')).toBe('light');
  });

  it('a stored theme wins over the OS preference', () => {
    const t = stubPorts({ stored: { theme: 'light' } });
    start(t.ports);
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});

// ---------- hash routing transport ----------

describe('hash routing', () => {
  it('a tab click navigates via the location port and shows the section', () => {
    const t = stubPorts();
    start(t.ports);

    document.querySelector<HTMLElement>('.tab-btn[data-section="plan"]')!.click();
    expect(t.setHash).toHaveBeenCalledWith('#/plan');
    expect(document.querySelector<HTMLElement>('.section-view[data-section="plan"]')!.hidden).toBe(false);
    expect(document.querySelector<HTMLElement>('.section-view[data-section="balls"]')!.hidden).toBe(true);
  });

  it('a hashchange event routes to the hashed section', () => {
    const t = stubPorts({ hash: '#/passives' });
    start(t.ports);
    expect(document.querySelector<HTMLElement>('.section-view[data-section="passives"]')!.hidden).toBe(false);

    // later navigation: the port's hash moves, the event re-applies it
    t.setHashValue('#/plan');
    window.dispatchEvent(new Event('hashchange'));
    expect(document.querySelector<HTMLElement>('.section-view[data-section="plan"]')!.hidden).toBe(false);
  });
});

// ---------- the clear policy, wired (was grep-only in regression.test.ts) ----------

describe('clear policy wiring (tab click wiped the destination screen, 2026-10-05)', () => {
  function selectFlash(t: ReturnType<typeof stubPorts>) {
    start(t.ports);
    flashTile().click();
    expect(flashTile().classList.contains('selected')).toBe(true);
  }
  const selectionBtn = (kind: 'plan' | 'fusion') =>
    document.querySelector<HTMLElement>(`#selection-balls .selection-btn[data-kind="${kind}"]`)!;
  const fusionRow = (id: string) =>
    document.querySelector<HTMLElement>(`#fusionList .fusion-row[data-id="${id}"]`)!;

  it('a tab click (header) does not clear the destination screen\'s remembered selection', () => {
    const t = stubPorts();
    selectFlash(t);
    // leave balls, then come back by clicking the balls tab: that click must
    // not wipe balls' remembered selection (the cross-screen bug — the
    // document handler ran after showSection, so `section` was the
    // destination). A hashchange would not exercise the click handler.
    document.querySelector<HTMLElement>('.tab-btn[data-section="passives"]')!.click();
    document.querySelector<HTMLElement>('.tab-btn[data-section="balls"]')!.click();
    expect(flashTile().classList.contains('selected')).toBe(true);
  });

  it('clicking a search input does not clear the selection', () => {
    const t = stubPorts();
    selectFlash(t);
    document.getElementById('search-balls')!.click();
    expect(flashTile().classList.contains('selected')).toBe(true);
  });

  it('clicking "Add to plan" leaves the selection intact (bug: .selection-box was not clear-exempt)', () => {
    // Bug: .selection-box was missing from the exempt selector, so the
    // button's click bubbled to the document handler and cleared the
    // selection in the same click that added the item — contradicting
    // CONTEXT.md's "Selection survives adding".
    const t = stubPorts();
    selectFlash(t);
    selectionBtn('plan').click();
    expect(flashTile().classList.contains('selected')).toBe(true);
    expect(t.savedPlan()!.plan.balls).toEqual(['flash']);
  });

  it('clicking "Add to fusion" leaves the selection intact', () => {
    const t = stubPorts();
    selectFlash(t);
    selectionBtn('fusion').click();
    expect(flashTile().classList.contains('selected')).toBe(true);
    expect(fusionRow('flash').classList.contains('slot-1')).toBe(true);
  });

  it('clicking a character card keeps the character selected', () => {
    const t = stubPorts({ hash: '#/characters' });
    start(t.ports);
    const card = [...document.querySelectorAll<HTMLElement>('#charactersGrid .char-card')]
      .find((c) => c.textContent!.includes('The Warrior'))!;
    card.click();
    expect(card.classList.contains('selected')).toBe(true);
    expect(t.savedPlan()!.chars).toEqual(['the-warrior']);
  });

  it('clicking a fusion row keeps the pick', () => {
    const t = stubPorts({ hash: '#/fusions' });
    start(t.ports);
    fusionRow('flash').click();
    expect(fusionRow('flash').classList.contains('slot-1')).toBe(true);
  });

  it('clicking the fusion panel\'s Add to plan keeps the composed picks', () => {
    const t = stubPorts({ hash: '#/fusions' });
    start(t.ports);
    fusionRow('flash').click();
    fusionRow('glacier').click();
    document.querySelector<HTMLElement>('#fusionPanel .fusion-plan-btn')!.click();
    expect(fusionRow('flash').classList.contains('slot-1')).toBe(true);
    expect(fusionRow('glacier').classList.contains('slot-2')).toBe(true);
  });

  it('clicking inside the toast does not clear the selection', () => {
    const t = stubPorts();
    selectFlash(t);
    flashTile().dispatchEvent(new MouseEvent('mouseenter'));
    const toast = document.querySelector<HTMLElement>('body > .toast')!;
    expect(toast).toBeTruthy();
    toast.click();
    expect(flashTile().classList.contains('selected')).toBe(true);
  });

  it('every interactive region in the real built DOM is clear-exempt', () => {
    // The predicate pin: query the elements the painters and the shell
    // actually produced and ask the predicate — not a copy of a selector
    // string. A marker dropped from any creation site fails here.
    const t = stubPorts({ hash: '#/characters' });
    start(t.ports);
    // create a chip (a selected character) and a toast (hover) through the
    // real renderer, so their markers ride the elements it builds
    [...document.querySelectorAll<HTMLElement>('#charactersGrid .char-card')]
      .find((c) => c.textContent!.includes('The Warrior'))!.click();
    flashTile().dispatchEvent(new MouseEvent('mouseenter'));
    const regions: [string, Element | null][] = [
      ['header', document.querySelector('header')],
      ['search input', document.getElementById('search-balls')],
      ['tile', flashTile()],
      ['character card', document.querySelector('#charactersGrid .char-card')],
      ['chip', document.querySelector('#charChips .chip')],
      ['fusion row', document.querySelector('#fusionList .fusion-row')],
      ['fusion panel', document.getElementById('fusionPanel')],
      ['selection box', document.getElementById('selection-balls')],
      ['toast', document.querySelector('body > .toast')],
    ];
    for (const [name, el] of regions) {
      expect(el, `${name} exists`).toBeTruthy();
      expect(isClearExempt(el), name).toBe(true);
    }
  });

  it('an empty-space click clears the active section\'s selection', () => {
    const t = stubPorts();
    selectFlash(t);
    document.body.click();
    expect(flashTile().classList.contains('selected')).toBe(false);
  });

  it('Esc in the search input clears only the query; Esc elsewhere clears the selection', () => {
    const t = stubPorts();
    selectFlash(t);
    const input = document.getElementById('search-balls')!;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(flashTile().classList.contains('selected')).toBe(true);
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(flashTile().classList.contains('selected')).toBe(false);
  });
});

// ---------- clipboard fallback chain ----------

describe('share button clipboard fallback chain', () => {
  const clickShare = () => document.getElementById('planShare')!.click();
  const shareUrl = () => expect.stringContaining('#/plan?p=');

  it('copy resolves: no prompt, the button flashes "Copied!"', async () => {
    const t = stubPorts({ copy: () => Promise.resolve() });
    start(t.ports);

    clickShare();
    expect(t.promptCopy).not.toHaveBeenCalled();
    await Promise.resolve(); // let the .then(flash) run
    expect(document.getElementById('planShare')!.textContent).toBe('Copied!');
  });

  it('copy API absent (undefined): the prompt fallback carries the link', () => {
    const t = stubPorts({ copy: () => undefined });
    start(t.ports);

    clickShare();
    expect(t.promptCopy).toHaveBeenCalledWith(shareUrl());
  });

  it('copy rejects: the prompt fallback carries the link', async () => {
    const t = stubPorts({ copy: () => Promise.reject(new Error('denied')) });
    start(t.ports);

    clickShare();
    // the rejection travels then → catch: two microtasks, so drain a macrotask
    await new Promise((r) => setTimeout(r, 0));
    // the rejection is handled by the chain — no unhandled rejection escapes
    expect(t.promptCopy).toHaveBeenCalledWith(shareUrl());
  });
});

// ---------- lifecycle: total disposal and re-start ----------

describe('island lifecycle (disposal and re-start)', () => {
  it('a second startIsland on the same document replaces the first — no double wiring', () => {
    const copy = vi.fn(() => undefined);
    const t = stubPorts({ copy });
    const first = startIsland(t.ports);
    const second = startIsland(t.ports);
    stop = second;

    // document-level clear listener: one dispatch. Select a character first
    // so the clear changes the persisted snapshot — plan-session skips a
    // no-op save, so a bare clear would write zero either way.
    document.querySelector<HTMLElement>('.tab-btn[data-section="characters"]')!.click();
    document.querySelector<HTMLElement>('#charactersGrid .char-card')!.click();
    t.setItem.mockClear();
    document.body.click();
    expect(t.setItem.mock.calls.filter(([k]) => k === PLAN_KEY)).toHaveLength(1);

    // element controls: one listener each
    document.querySelector<HTMLElement>('.tab-btn[data-section="plan"]')!.click();
    expect(t.setHash).toHaveBeenCalledTimes(2);
    document.getElementById('themeToggle')!.click();
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(t.setItem.mock.calls.filter(([k]) => k === 'theme')).toHaveLength(1);
    document.getElementById('planShare')!.click();
    expect(copy).toHaveBeenCalledTimes(1);

    // the replaced island's disposer must not tear down the live one
    first();
    document.querySelector<HTMLElement>('.tab-btn[data-section="balls"]')!.click();
    expect(t.setHash).toHaveBeenCalledTimes(3);
  });

  it('can be restarted after disposal', () => {
    const t = stubPorts();
    start(t.ports);
    stop!();
    stop = null;

    start(t.ports);
    document.querySelector<HTMLElement>('.tab-btn[data-section="plan"]')!.click();
    expect(t.setHash).toHaveBeenCalledTimes(1);
  });

  it('stop() removes every listener and timer the island added', async () => {
    vi.useFakeTimers();
    const copy = vi.fn(() => Promise.resolve());
    const t = stubPorts({ copy });
    start(t.ports);

    // wire the share flash so a timer is pending at teardown
    document.getElementById('planShare')!.click();
    await Promise.resolve();
    expect(document.getElementById('planShare')!.textContent).toBe('Copied!');

    stop!();
    stop = null;

    // the flash timer was cleared and the idle label restored
    expect(document.getElementById('planShare')!.textContent).toBe('Share');
    vi.advanceTimersByTime(2000);
    expect(document.getElementById('planShare')!.textContent).toBe('Share');

    // element listeners are inert
    document.querySelector<HTMLElement>('.tab-btn[data-section="plan"]')!.click();
    document.getElementById('themeToggle')!.click();
    document.getElementById('planClear')!.click();
    document.getElementById('planShare')!.click();
    const input = document.getElementById('search-balls') as HTMLInputElement;
    input.value = 'flash';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    // document listeners are inert
    document.body.click();
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    // the routing listener is inert
    t.setHashValue('#/plan');
    window.dispatchEvent(new Event('hashchange'));

    expect(t.setHash).not.toHaveBeenCalled();
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(t.store.has('theme')).toBe(false);
    expect(copy).toHaveBeenCalledTimes(1); // only the pre-teardown click
    expect(t.promptCopy).not.toHaveBeenCalled();
    expect(document.querySelector<HTMLElement>('.section-view[data-section="balls"]')!.hidden).toBe(false);
  });
});
