// Tests for the pick-list module through its one interface:
// createPickList({ hasRoom, resolve, key }) →
// { toggle(input), restore(source), list(), has(input) }.
// The seam is "input in, picked items out": the module owns the sticky
// toggle semantics, the capacity guard, the resolution guard, and
// duplicate-free restore. Consumers hand in their own identity (`key`) and
// capacity (`hasRoom`), so the same module serves flat id lists and
// object-shaped pairs.
import { describe, it, expect } from 'vitest';
import { createPickList } from './pick-list';

/** A flat id list with a capacity of 2 — the character/fusion-pick shape. */
const idList = (capacity = 2) =>
  createPickList<string, string>({
    resolve: (id) => (['a', 'b', 'c', 'd'].includes(id) ? id : undefined),
    key: (id) => id,
    hasRoom: (list) => list.length < capacity,
  });

describe('pick list: sticky toggle', () => {
  it('toggles a resolved item in and out', () => {
    const list = idList();
    list.toggle('a');
    expect(list.list()).toEqual(['a']);
    list.toggle('a');
    expect(list.list()).toEqual([]);
  });

  it('keeps pick order across toggles', () => {
    const list = idList();
    list.toggle('b');
    list.toggle('a');
    list.toggle('b');
    list.toggle('b');
    expect(list.list()).toEqual(['a', 'b']);
  });

  it('adding past capacity is a no-op — one must be deselected first', () => {
    const list = idList(2);
    list.toggle('a');
    list.toggle('b');
    list.toggle('c');
    expect(list.list()).toEqual(['a', 'b']);
  });

  it('rejects ids resolve does not accept', () => {
    const list = idList();
    list.toggle('unknown');
    expect(list.list()).toEqual([]);
    expect(list.has('unknown')).toBe(false);
  });

  it('list() returns a snapshot copy — a later toggle does not mutate it', () => {
    const list = idList();
    list.toggle('a');
    const captured = list.list();
    list.toggle('b');
    expect(captured).toEqual(['a']);
    expect(list.list()).toEqual(['a', 'b']);
  });

  it('has() answers membership through the same resolution', () => {
    const list = idList();
    list.toggle('a');
    expect(list.has('a')).toBe(true);
    expect(list.has('b')).toBe(false);
    expect(list.has('unknown')).toBe(false);
  });
});

describe('pick list: restore', () => {
  it('replaces the list and keeps source order', () => {
    const list = idList();
    list.toggle('d');
    list.restore(['b', 'a']);
    expect(list.list()).toEqual(['b', 'a']);
  });

  it('drops unknown entries and duplicates — first occurrence wins', () => {
    const list = idList();
    list.restore(['a', 'unknown', 'b', 'a']);
    expect(list.list()).toEqual(['a', 'b']);
  });

  it('keeps over-capacity selections — restore validates only', () => {
    const list = idList(2);
    list.restore(['a', 'b', 'c', 'd']);
    expect(list.list()).toEqual(['a', 'b', 'c', 'd']);
  });

  it('restoring an empty source empties the list', () => {
    const list = idList();
    list.toggle('a');
    list.restore([]);
    expect(list.list()).toEqual([]);
  });
});

describe('pick list: object-shaped items and custom identity', () => {
  /** Unordered pairs — identity is the sorted key, so the reverse input
   *  toggles the same item (the plan's fused-pair shape). */
  const pairList = () =>
    createPickList<{ a: string; b: string }, { a: string; b: string }>({
      resolve: (p) => (p.a !== p.b && ['a', 'b', 'c'].includes(p.a) && ['a', 'b', 'c'].includes(p.b) ? { ...p } : undefined),
      key: (p) => [p.a, p.b].sort().join('+'),
      hasRoom: (list) => list.length < 2,
    });

  it('toggle matches by key, not by object identity', () => {
    const list = pairList();
    list.toggle({ a: 'a', b: 'b' });
    list.toggle({ a: 'b', b: 'a' });
    expect(list.list()).toEqual([]);
  });

  it('has() matches by key too', () => {
    const list = pairList();
    list.toggle({ a: 'a', b: 'b' });
    expect(list.has({ a: 'b', b: 'a' })).toBe(true);
    expect(list.has({ a: 'a', b: 'c' })).toBe(false);
  });

  it('restore dedupes by key, keeping the first compose order', () => {
    const list = pairList();
    list.restore([{ a: 'b', b: 'a' }, { a: 'a', b: 'b' }, { a: 'a', b: 'c' }]);
    expect(list.list()).toEqual([{ a: 'b', b: 'a' }, { a: 'a', b: 'c' }]);
  });

  it('rejects pairs resolve does not accept', () => {
    const list = pairList();
    list.toggle({ a: 'a', b: 'a' });
    list.toggle({ a: 'a', b: 'unknown' });
    expect(list.list()).toEqual([]);
  });
});
