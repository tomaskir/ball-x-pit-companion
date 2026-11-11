// Pick-list module: the sticky pick-list invariant, one home.
// One interface: createPickList({ hasRoom, resolve, key }) →
// { toggle(input), restore(source), list(), has(input) }.
//
// The invariant: re-toggling a member deselects it; adding while `hasRoom`
// says the list is full is a no-op (one must be deselected first); an input
// `resolve` rejects is ignored; restore filters unknown entries and
// duplicates (first occurrence wins) but never trims for capacity —
// over-limit selections are kept, the user decides what to remove.
//
// The module is generic over the stored item and the input shape, so the
// same semantics serve id lists (characters, fusion picks), resolved-item
// lists (the plan's balls/passives, stored as catalog objects), and
// object-shaped pairs (the plan's fused pairs, whose `key` is the unordered
// pair identity). `key` is the one identity
// definition per list; `hasRoom` reads the whole list, so a list can share
// capacity with another (the plan's fused pairs share the ball slots).
// `list()` returns a snapshot copy, so a view model that captured it cannot
// be mutated by a later toggle; replace the contents through `restore`.

/** The per-list policy: what inputs resolve to items, how items are
 *  identified, and whether the list has room for one more. */
export interface PickListSpec<T, S> {
  /** Whether one more item fits — reads the whole list, so a list can
   *  share its capacity with another (the plan's ball slots). */
  hasRoom(list: readonly T[]): boolean;
  /** The stored item for an input, or undefined to reject it (unknown ids,
   *  unfusable balls, degenerate pairs). */
  resolve(input: S): T | undefined;
  /** Identity of a stored item — duplicate detection and membership. */
  key(item: T): string;
}

/** The pick list's one interface. */
export interface PickList<T, S> {
  /** Sticky toggle: remove the matching member, else add the resolved
   *  input when there is room. Rejected inputs are a no-op. */
  toggle(input: S): void;
  /** Replace the list from persisted inputs (hydrate, clear, reorder):
   *  unknown entries dropped, duplicates dropped (first occurrence wins),
   *  capacity not enforced. */
  restore(source: readonly S[]): void;
  /** A snapshot copy of the list in pick order. */
  list(): readonly T[];
  /** Membership by the list's identity. */
  has(input: S): boolean;
}

export function createPickList<T, S>(spec: PickListSpec<T, S>): PickList<T, S> {
  const items: T[] = [];
  const indexOf = (key: string): number => items.findIndex((item) => spec.key(item) === key);

  return {
    toggle(input) {
      const item = spec.resolve(input);
      if (item === undefined) return;
      const idx = indexOf(spec.key(item));
      if (idx >= 0) items.splice(idx, 1);
      else if (spec.hasRoom(items)) items.push(item);
    },
    restore(source) {
      items.length = 0;
      for (const input of source) {
        const item = spec.resolve(input);
        if (item === undefined) continue;
        if (indexOf(spec.key(item)) < 0) items.push(item);
      }
    },
    list: () => [...items],
    has(input) {
      const item = spec.resolve(input);
      return item !== undefined && indexOf(spec.key(item)) >= 0;
    },
  };
}
