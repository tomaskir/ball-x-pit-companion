// Tests for the plan-session module: the persisted state's lifecycle as pure
// functions over injected ports — restore (share-beats-stored precedence, the
// one-shot strip, corrupt-storage tolerance) and save (serialization plus the
// skip-unchanged rule). The state persists under two keys: the plan + shared
// selection under PLAN_KEY, the edition filter under EDITIONS_KEY. No jsdom:
// the storage adapter is an in-memory Map and the hash is a plain string. The
// island's wiring is pinned behaviorally in src/companion.test.ts; the codec
// and URL transport in their own tests.
import { describe, it, expect, vi } from 'vitest';
import { EDITIONS_KEY, PLAN_KEY, restore, save } from './plan-session';
import { encodeShared, type SharedSnapshot } from './plan-codec';

const empty: SharedSnapshot = { plan: { upgradesOn: true, balls: [], passives: [], fused: [] }, chars: [], editions: ['base-game'] };
const stored: SharedSnapshot = {
  plan: { upgradesOn: false, balls: ['flash'], passives: [], fused: [] },
  chars: ['the-warrior'],
  editions: ['base-game'],
};
const shared: SharedSnapshot = {
  plan: {
    upgradesOn: true,
    balls: ['glacier'],
    passives: ['wagon-wheel'],
    fused: [{ a: 'flash', b: 'glacier' }],
  },
  chars: ['the-shade'],
  editions: ['base-game', 'dlc-risen-ballbylon'],
};

/** The in-memory storage adapter: a Map plus read/write spies so tests can
 *  pin whether a read or a write happened. */
function memoryStorage(init: Record<string, string> = {}) {
  const store = new Map(Object.entries(init));
  const getItem = vi.fn((key: string) => store.get(key) ?? null);
  const setItem = vi.fn((key: string, value: string) => { store.set(key, value); });
  return {
    storage: { getItem, setItem },
    store,
    getItem,
    setItem,
    planWrites: () => setItem.mock.calls.filter(([key]) => key === PLAN_KEY).length,
    editionWrites: () => setItem.mock.calls.filter(([key]) => key === EDITIONS_KEY).length,
  };
}

describe('plan session: save → restore round-trip', () => {
  it('restores exactly what save wrote, with no strip', () => {
    const t = memoryStorage();
    save(t.storage, shared);
    expect(restore({ storage: t.storage, hash: '' })).toEqual({
      shared,
      editions: shared.editions,
      stripUrl: null,
      fromShare: false,
    });
  });

  it('save splits the state across the plan key and the editions key', () => {
    const t = memoryStorage();
    save(t.storage, shared);
    expect(t.store.get(PLAN_KEY)).toBe(JSON.stringify({ plan: shared.plan, chars: shared.chars }));
    expect(t.store.get(EDITIONS_KEY)).toBe(JSON.stringify(shared.editions));
  });

  it('restores the edition filter even when there is no stored plan', () => {
    const t = memoryStorage({ [EDITIONS_KEY]: JSON.stringify(['base-game', 'dlc-risen-ballbylon']) });
    expect(restore({ storage: t.storage, hash: '' })).toEqual({
      shared: null,
      editions: ['base-game', 'dlc-risen-ballbylon'],
      stripUrl: null,
      fromShare: false,
    });
  });
});

describe('plan session: save skips unchanged state', () => {
  it('a second save of the same snapshot does not write again', () => {
    const t = memoryStorage();
    save(t.storage, shared);
    const writes = t.setItem.mock.calls.length;
    save(t.storage, shared);
    expect(t.setItem).toHaveBeenCalledTimes(writes);
  });

  it('a changed plan writes the plan key only (editions unchanged)', () => {
    const t = memoryStorage();
    save(t.storage, shared);
    save(t.storage, { ...shared, chars: [] });
    expect(t.planWrites()).toBe(2);
    expect(t.editionWrites()).toBe(1);
  });

  it('a changed edition filter writes the editions key only (plan unchanged)', () => {
    const t = memoryStorage();
    save(t.storage, shared);
    save(t.storage, { ...shared, editions: ['base-game'] });
    expect(t.planWrites()).toBe(1);
    expect(t.editionWrites()).toBe(2);
  });

  it('a fresh browser does not persist the default state (nothing to store)', () => {
    const t = memoryStorage();
    save(t.storage, empty);
    expect(t.setItem).not.toHaveBeenCalled();
  });

  it('an explicit clear of a stored plan does write (the clear must persist)', () => {
    const t = memoryStorage({ [PLAN_KEY]: JSON.stringify({ plan: shared.plan, chars: shared.chars }) });
    save(t.storage, empty);
    expect(t.planWrites()).toBe(1);
    expect(t.store.get(PLAN_KEY)).toBe(JSON.stringify({ plan: empty.plan, chars: empty.chars }));
  });

  it('storage that throws never breaks the caller', () => {
    const storage = {
      getItem: () => { throw new Error('denied'); },
      setItem: () => { throw new Error('full'); },
    };
    expect(() => save(storage, shared)).not.toThrow();
  });

  it('an unreadable slot still attempts the write (a failed read cannot prove unchanged)', () => {
    const setItem = vi.fn();
    const storage = {
      getItem: () => { throw new Error('denied'); },
      setItem,
    };
    save(storage, shared);
    expect(setItem).toHaveBeenCalledWith(PLAN_KEY, JSON.stringify({ plan: shared.plan, chars: shared.chars }));
    expect(setItem).toHaveBeenCalledWith(EDITIONS_KEY, JSON.stringify(shared.editions));
  });
});

describe('plan session: restore precedence and the one-shot strip', () => {
  it('a decodable share parameter beats the stored state and yields the strip target', () => {
    const t = memoryStorage({ [PLAN_KEY]: JSON.stringify(stored), [EDITIONS_KEY]: JSON.stringify(stored.editions) });
    const hash = `#/plan?p=${encodeShared(shared)}`;

    expect(restore({ storage: t.storage, hash })).toEqual({
      shared,
      editions: shared.editions,
      stripUrl: '#/plan',
      fromShare: true,
    });
    // the share link wins without even reading storage
    expect(t.getItem).not.toHaveBeenCalled();
  });

  it('a present-but-undecodable parameter falls back to the stored state and strips nothing', () => {
    const t = memoryStorage({ [PLAN_KEY]: JSON.stringify({ plan: stored.plan, chars: stored.chars }), [EDITIONS_KEY]: JSON.stringify(stored.editions) });
    expect(restore({ storage: t.storage, hash: '#/plan?p=not-a-real-code' })).toEqual({
      shared: stored,
      editions: stored.editions,
      stripUrl: null,
      fromShare: false,
    });
  });

  it('no parameter: the stored state is used and the URL is untouched', () => {
    const t = memoryStorage({ [PLAN_KEY]: JSON.stringify({ plan: stored.plan, chars: stored.chars }), [EDITIONS_KEY]: JSON.stringify(stored.editions) });
    expect(restore({ storage: t.storage, hash: '#/plan' })).toEqual({
      shared: stored,
      editions: stored.editions,
      stripUrl: null,
      fromShare: false,
    });
  });

  it('the strip target keeps the section route and drops only the query', () => {
    const t = memoryStorage();
    const { stripUrl } = restore({ storage: t.storage, hash: `#/plan?p=${encodeShared(shared)}` });
    expect(stripUrl).toBe('#/plan');
  });

  it('an empty strip target is a real strip, not "leave the URL alone"', () => {
    // a hashless URL still decodes; the island must apply the empty hash
    // rather than test stripUrl for truthiness
    const t = memoryStorage();
    const { stripUrl } = restore({ storage: t.storage, hash: `?p=${encodeShared(shared)}` });
    expect(stripUrl).toBe('');
  });

  it('loads a legacy flat stored shape (pre-codec storage keeps working)', () => {
    const legacy = { upgradesOn: false, chars: ['the-warrior'], balls: ['flash'], passives: [], fused: [] };
    const t = memoryStorage({ [PLAN_KEY]: JSON.stringify(legacy) });
    expect(restore({ storage: t.storage, hash: '' }).shared).toEqual(stored);
  });
});

describe('plan session: corrupt storage never breaks startup', () => {
  it('unparseable JSON reads as no stored plan and default editions', () => {
    const t = memoryStorage({ [PLAN_KEY]: '{oops' });
    expect(restore({ storage: t.storage, hash: '' })).toEqual({
      shared: null,
      editions: ['base-game'],
      stripUrl: null,
      fromShare: false,
    });
  });

  it('parseable JSON of the wrong shape reads as no stored plan', () => {
    const t = memoryStorage({ [PLAN_KEY]: '"just a string"' });
    expect(restore({ storage: t.storage, hash: '' }).shared).toBeNull();
  });

  it('corrupt editions read as the default filter', () => {
    const t = memoryStorage({ [EDITIONS_KEY]: '{oops' });
    expect(restore({ storage: t.storage, hash: '' }).editions).toEqual(['base-game']);
  });

  it('a throwing getItem reads as no stored plan', () => {
    const storage = { getItem: () => { throw new Error('denied'); }, setItem: () => {} };
    expect(() => restore({ storage, hash: '' })).not.toThrow();
    expect(restore({ storage, hash: '' }).shared).toBeNull();
  });
});
