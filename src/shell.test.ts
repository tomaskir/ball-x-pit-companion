// Behavioral tests for the shell adapter alone: createShell({ ports,
// dispatch, snapshot }) wires the shipped shell markup (index.astro, through
// the same parsed-shell seam styles.test.ts uses) with stub ports and a
// dispatch spy — no island mount, no renderer, no view state. The pins are
// the shell's whole contract: theme transport, tab routing, per-screen
// search, the plan toolbar, the share flash timer, the document-level clear
// policy, and a destroy() that leaves nothing wired.
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createShell, type ShellPorts, type Shell } from './shell';
import type { Action } from './view-state';
import { decodeShared, type SharedSnapshot } from './plan-codec';
import { shellDoc } from './test-support/styles';

const emptyShared: SharedSnapshot = { plan: { upgradesOn: true, balls: [], passives: [], fused: [] }, chars: [] };

function stubPorts(init: {
  stored?: Record<string, string>;
  copy?: ShellPorts['copy'];
} = {}) {
  const store = new Map(Object.entries(init.stored ?? {}));
  const setHash = vi.fn();
  const promptCopy = vi.fn();
  const ports: ShellPorts = {
    storage: {
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => { store.set(k, String(v)); },
    },
    location: {
      origin: () => 'https://example.com',
      pathname: () => '/ball-x-pit-companion/',
      setHash,
    },
    copy: init.copy ?? (() => undefined),
    promptCopy,
    prefersLight: () => false,
  };
  return { ports, store, setHash, promptCopy };
}

let shell: Shell | null = null;

beforeEach(() => {
  document.body.innerHTML = shellDoc().body.innerHTML;
});

afterEach(() => {
  shell?.destroy();
  shell = null;
  vi.useRealTimers();
});

function mount(ports: ShellPorts, dispatch = vi.fn<(action: Action) => void>(), snapshot = () => emptyShared) {
  shell = createShell({ ports, dispatch, snapshot });
  return { dispatch, shell };
}

const sectionView = (s: string) => document.querySelector<HTMLElement>(`.section-view[data-section="${s}"]`)!;
const tab = (s: string) => document.querySelector<HTMLElement>(`.tab-btn[data-section="${s}"]`)!;

// ---------- theme ----------

describe('theme transport', () => {
  it('applies the OS preference at creation and flips + persists on click', () => {
    const t = stubPorts();
    mount(t.ports);

    expect(document.documentElement.dataset.theme).toBe('dark');
    document.getElementById('themeToggle')!.click();
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(t.store.get('theme')).toBe('light');
  });

  it('a stored theme wins over the OS preference', () => {
    const t = stubPorts({ stored: { theme: 'light' } });
    mount(t.ports);
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});

// ---------- routing ----------

describe('tab routing', () => {
  it('a tab click mirrors the switch into the location and the DOM', () => {
    const t = stubPorts();
    mount(t.ports);

    tab('plan').click();

    expect(t.setHash).toHaveBeenCalledWith('#/plan');
    expect(sectionView('plan').hidden).toBe(false);
    expect(sectionView('balls').hidden).toBe(true);
    expect(tab('plan').classList.contains('active')).toBe(true);
    expect(tab('balls').classList.contains('active')).toBe(false);
  });

  it('showSection(s, false) switches the DOM without touching the hash (hashchange-driven routing)', () => {
    const t = stubPorts();
    const { shell: s } = mount(t.ports);

    s.showSection('passives', false);

    expect(t.setHash).not.toHaveBeenCalled();
    expect(sectionView('passives').hidden).toBe(false);
    expect(tab('passives').classList.contains('active')).toBe(true);
  });
});

// ---------- search ----------

describe('per-screen search', () => {
  it('an input dispatches a section-scoped search action', () => {
    const t = stubPorts();
    const { dispatch } = mount(t.ports);
    const input = document.getElementById('search-characters') as HTMLInputElement;

    input.value = 'warrior';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(dispatch).toHaveBeenCalledWith({ type: 'search', section: 'characters', query: 'warrior' });
  });
});

// ---------- plan toolbar ----------

describe('plan toolbar', () => {
  it('Clear dispatches clearPlan', () => {
    const t = stubPorts();
    const { dispatch } = mount(t.ports);
    document.getElementById('planClear')!.click();
    expect(dispatch).toHaveBeenCalledWith({ type: 'clearPlan' });
  });

  it('the End game upgrades toggle dispatches toggleUpgrades', () => {
    const t = stubPorts();
    const { dispatch } = mount(t.ports);
    document.getElementById('planUpgrades')!.dispatchEvent(new Event('change', { bubbles: true }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'toggleUpgrades' });
  });
});

// ---------- share ----------

describe('share button', () => {
  const shareBtn = () => document.getElementById('planShare')!;

  it('copy resolves: no prompt, the button flashes "Copied!" then restores', async () => {
    vi.useFakeTimers();
    const t = stubPorts({ copy: () => Promise.resolve() });
    mount(t.ports);

    shareBtn().click();
    await Promise.resolve(); // let the .then(flash) run
    expect(t.promptCopy).not.toHaveBeenCalled();
    expect(shareBtn().textContent).toBe('Copied!');

    vi.advanceTimersByTime(1500);
    expect(shareBtn().textContent).toBe('Share');
  });

  it('copy API absent (undefined): the prompt fallback carries the link', () => {
    const t = stubPorts({ copy: () => undefined });
    mount(t.ports);

    shareBtn().click();
    expect(t.promptCopy).toHaveBeenCalledWith(expect.stringContaining('#/plan?p='));
  });

  it('copy rejects: the prompt fallback carries the link', async () => {
    const t = stubPorts({ copy: () => Promise.reject(new Error('denied')) });
    mount(t.ports);

    shareBtn().click();
    // the rejection travels then → catch: two microtasks
    await Promise.resolve();
    await Promise.resolve();
    expect(t.promptCopy).toHaveBeenCalledWith(expect.stringContaining('#/plan?p='));
  });

  it('encodes the snapshot supplied at click time', () => {
    const t = stubPorts({ copy: () => undefined });
    const shared: SharedSnapshot = { plan: { upgradesOn: false, balls: ['flash'], passives: [], fused: [] }, chars: ['the-warrior'] };
    let current = emptyShared;
    mount(t.ports, vi.fn(), () => current);
    // the plan can change between mount and click — Share must encode the
    // snapshot at click time, not one captured at creation
    current = shared;

    shareBtn().click();
    // the link IS the snapshot: decode the copied URL's payload back
    const url = t.promptCopy.mock.calls[0][0] as string;
    expect(url).toContain('#/plan?p=');
    expect(decodeShared(url.split('p=')[1])).toEqual(shared);
  });
});

// ---------- clear policy ----------

describe('document-level clear policy', () => {
  it('an empty-space click clears the active section\'s selection', () => {
    const t = stubPorts();
    const { dispatch } = mount(t.ports);

    document.body.click();
    expect(dispatch).toHaveBeenCalledWith({ type: 'clear', section: 'balls' });
  });

  it('a click inside a clear-exempt region does not clear', () => {
    const t = stubPorts();
    const { dispatch } = mount(t.ports);

    document.getElementById('search-balls')!.click();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('Esc clears outside inputs and is exempt inside them', () => {
    const t = stubPorts();
    const { dispatch } = mount(t.ports);

    document.getElementById('search-balls')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(dispatch).not.toHaveBeenCalled();

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'clear', section: 'balls' });
  });

  it('the plan screen never clears', () => {
    const t = stubPorts();
    const { dispatch, shell: s } = mount(t.ports);
    s.showSection('plan', false);

    document.body.click();
    expect(dispatch).not.toHaveBeenCalled();
  });
});

// ---------- disposal ----------

describe('destroy', () => {
  it('removes every element listener the shell added', () => {
    // copy returns undefined, so a leaked Share listener would call the
    // prompt fallback — the assertion below catches it
    const t = stubPorts({ copy: () => undefined });
    const { dispatch, shell: s } = mount(t.ports);

    s.destroy();

    tab('plan').click();
    expect(t.setHash).not.toHaveBeenCalled();

    document.getElementById('themeToggle')!.click();
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(t.store.has('theme')).toBe(false);

    const input = document.getElementById('search-balls') as HTMLInputElement;
    input.value = 'flash';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    document.getElementById('planClear')!.click();
    document.getElementById('planUpgrades')!.dispatchEvent(new Event('change', { bubbles: true }));
    document.getElementById('planShare')!.click();
    expect(dispatch).not.toHaveBeenCalled();
    expect(t.promptCopy).not.toHaveBeenCalled();
  });

  it('removes the document listeners too', () => {
    const t = stubPorts();
    const { dispatch, shell: s } = mount(t.ports);

    s.destroy();

    document.body.click();
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('clears a pending share flash timer and restores the idle label', async () => {
    vi.useFakeTimers();
    const t = stubPorts({ copy: () => Promise.resolve() });
    const { shell: s } = mount(t.ports);

    document.getElementById('planShare')!.click();
    await Promise.resolve();
    expect(document.getElementById('planShare')!.textContent).toBe('Copied!');

    s.destroy();
    expect(document.getElementById('planShare')!.textContent).toBe('Share');
    vi.advanceTimersByTime(2000); // no timer left to fire
    expect(document.getElementById('planShare')!.textContent).toBe('Share');
  });

  it('ignores a clipboard promise that settles after teardown', async () => {
    let resolveCopy!: () => void;
    const copy = () => new Promise<void>((resolve) => { resolveCopy = resolve; });
    const t = stubPorts({ copy });
    const { shell: s } = mount(t.ports);

    document.getElementById('planShare')!.click();
    s.destroy();
    resolveCopy();
    await Promise.resolve();

    expect(document.getElementById('planShare')!.textContent).toBe('Share');
  });

  it('is idempotent', () => {
    const t = stubPorts();
    const { shell: s } = mount(t.ports);
    s.destroy();
    expect(() => s.destroy()).not.toThrow();
  });
});
