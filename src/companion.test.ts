// Behavioral tests for the island itself: startIsland(ports) drives the real
// startup sequence — share param vs stored plan precedence, the one-shot
// strip, corrupt-storage survival, save-on-every-dispatch, theme, routing,
// and the clipboard fallback chain — through jsdom with stub ports. This is
// the pin that was missing while companion.ts was a top-level side effect
// (jsdom-hostile to import); the environment touchpoints are injected ports,
// so matchMedia (absent in jsdom) is a stub like everything else.
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { startIsland, PLAN_KEY, type IslandPorts } from './companion';
import { encodePlan } from './share';
import type { PlanSnapshot } from './view-state';

// ---------- jsdom shell: the parts of index.astro the island touches ----------

const SHELL = `
  <header>
    <nav>
      <button class="tab-btn active" data-section="balls">Balls</button>
      <button class="tab-btn" data-section="passives">Passives</button>
      <button class="tab-btn" data-section="plan">Plan</button>
    </nav>
    <button id="themeToggle" aria-label="Toggle theme">☀️</button>
  </header>
  <main>
    <div class="section-view" data-section="balls">
      <input class="screen-search" data-section="balls" id="search-balls" type="search" />
      <div id="ballsGrid"></div>
    </div>
    <div class="section-view" data-section="passives" hidden>
      <input class="screen-search" data-section="passives" id="search-passives" type="search" />
      <div id="passivesGrid"></div>
    </div>
    <div class="section-view" data-section="characters" hidden>
      <input class="screen-search" data-section="characters" id="search-characters" type="search" />
      <div id="charactersGrid"></div>
    </div>
    <div class="section-view" data-section="fusions" hidden>
      <input class="screen-search" data-section="fusions" id="search-fusions" type="search" />
      <div id="fusionList"></div>
      <div id="fusionPanel"></div>
    </div>
    <div class="section-view" data-section="plan" hidden>
      <button id="planClear">Clear plan</button>
      <button id="planShare">Share</button>
      <input type="checkbox" id="planUpgrades" checked />
      <div id="planView"></div>
    </div>
  </main>
  <div id="charChips"></div>
  <span id="slotHint"></span>
  <div id="selection-balls" hidden></div>
  <div id="selection-passives" hidden></div>
`;

function mountShell() {
  document.body.innerHTML = SHELL;
}

// ---------- stub ports ----------

const emptyPlan: PlanSnapshot = { upgradesOn: true, chars: [], balls: [], passives: [], fused: [] };

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
  const promptCopy = vi.fn();
  const ports: IslandPorts = {
    storage: {
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => { store.set(k, String(v)); },
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
    promptCopy,
    setHashValue: (h: string) => { hash = h; },
    savedPlan: (): PlanSnapshot | null => {
      const raw = store.get(PLAN_KEY);
      return raw ? (JSON.parse(raw) as PlanSnapshot) : null;
    },
  };
}

let stop: (() => void) | null = null;

beforeEach(() => {
  mountShell();
});

afterEach(() => {
  // the island's document/window listeners must not leak between tests
  stop?.();
  stop = null;
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
    const stored: PlanSnapshot = { ...emptyPlan, balls: ['wagon-wheel'] };
    const shared: PlanSnapshot = { upgradesOn: false, chars: ['the-warrior'], balls: ['flash'], passives: [], fused: [] };
    const t = stubPorts({ stored: { [PLAN_KEY]: JSON.stringify(stored) }, hash: `#/plan?p=${encodePlan(shared)}` });

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
    // wagon-wheel is a passive id — the plan's passive count shows it
    const stored: PlanSnapshot = { ...emptyPlan, passives: ['wagon-wheel'] };
    const t = stubPorts({ stored: { [PLAN_KEY]: JSON.stringify(stored) }, hash: '#/plan?p=not-a-real-code' });

    start(t.ports);

    expect(t.replaceState).not.toHaveBeenCalled();
    expect(t.savedPlan()).toEqual(stored);
    expect(planCounts()).toEqual(['0 / 2', '0 / 5', '1 / 5']);
  });

  it('no param at all: stored plan used, URL untouched', () => {
    const stored: PlanSnapshot = { ...emptyPlan, passives: ['wagon-wheel'] };
    const t = stubPorts({ stored: { [PLAN_KEY]: JSON.stringify(stored) }, hash: '#/plan' });

    start(t.ports);

    expect(t.replaceState).not.toHaveBeenCalled();
    expect(t.savedPlan()).toEqual(stored);
    expect(planCounts()).toEqual(['0 / 2', '0 / 5', '1 / 5']);
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
    expect(t.savedPlan()).toEqual({ ...emptyPlan, balls: ['flash'] });
  });

  it('parseable JSON of the wrong shape: same survival (parsePlanSnapshot rejects it)', () => {
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
    expect(t.savedPlan()!.balls).toEqual(['flash']);

    addFlashToPlan(); // toggle off — the save happens on every dispatch
    expect(t.savedPlan()!.balls).toEqual([]);
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
    const stored: PlanSnapshot = { ...emptyPlan, balls: ['flash'] };
    const t = stubPorts({ stored: { [PLAN_KEY]: JSON.stringify(stored) } });
    start(t.ports);

    document.getElementById('planClear')!.click();
    expect(t.savedPlan()).toEqual(emptyPlan);
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

  it('a tab click (header) does not clear the destination screen\'s remembered selection', () => {
    const t = stubPorts();
    selectFlash(t);
    document.querySelector<HTMLElement>('.tab-btn[data-section="passives"]')!.click();
    t.setHashValue('#/balls');
    window.dispatchEvent(new Event('hashchange'));
    expect(flashTile().classList.contains('selected')).toBe(true);
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
