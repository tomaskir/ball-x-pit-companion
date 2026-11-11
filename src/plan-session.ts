// Plan-session module: the plan's persistence lifecycle as pure functions
// over injected ports — the save/load/share policy the island used to hold.
// restore({ storage, hash }) → { shared, stripUrl } owns the startup
// precedence (a decodable share parameter beats the stored plan — the link IS
// the plan), the one-shot strip (stripUrl is the hash to replace the location
// with, query removed, or null when the URL must be left alone; only a
// decoded parameter earns the strip), and corrupt-storage tolerance (garbage
// reads as "no stored plan", never an exception). save(storage, shared) owns
// serialization and skips the write when storage already holds that exact
// serialization — and when nothing is stored and the snapshot is the codec's
// default (a fresh browser's no-op dispatch creates no entry). Dispatches
// that do not touch the plan (search keystrokes, Esc clears) therefore do not
// write.
//
// The island keeps only transport: it hands in the real storage and hash,
// applies stripUrl through history.replaceState, and calls save after each
// dispatch. The codec (SharedSnapshot ⇄ v1 wire) is src/plan-codec.ts's; the
// share-parameter read is src/share.ts's.
import { normalizeShared, type SharedSnapshot } from './plan-codec';
import { takeShareParam } from './share';

/** The localStorage key the plan persists under — exported so tests pin the
 *  key name behaviorally instead of hard-coding it. */
export const PLAN_KEY = 'ball-x-pit-plan';

/** The storage port: localStorage in the browser, an in-memory adapter in
 *  tests. Reads may return garbage; restore tolerates it. */
export type PlanStorage = Pick<Storage, 'getItem' | 'setItem'>;

export interface RestoredPlan {
  /** The plan to hydrate with, or null when there is nothing to restore
   *  (no share parameter and no readable stored plan). */
  shared: SharedSnapshot | null;
  /** The hash to replace the location with (`#/plan`, query stripped) for
   *  the one-shot share strip, or null when the URL must be left alone. */
  stripUrl: string | null;
}

/** The serialization an absent storage slot is equivalent to: the codec's
 *  defaults. Writing it would persist nothing new, so save skips it (a fresh
 *  browser's first search keystroke must not create a storage entry). */
const DEFAULT_RAW = JSON.stringify(normalizeShared({}));

/** Read the stored plan, tolerating every failure mode: unreadable storage,
 *  unparseable JSON, and JSON of the wrong shape all read as "no stored
 *  plan". Shape normalization is the codec's (it also reads legacy flat
 *  snapshots); deeper id validation stays in plan-state's hydrate. */
function readStored(storage: PlanStorage): SharedSnapshot | null {
  try {
    const raw = storage.getItem(PLAN_KEY);
    if (!raw) return null;
    return normalizeShared(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** The startup restore: a decodable share parameter wins over the stored
 *  plan and carries the hash to strip the URL to; otherwise the stored plan
 *  is used and the URL is untouched. A present-but-undecodable parameter
 *  falls through to storage (no strip — the parameter never decoded). */
export function restore({ storage, hash }: { storage: PlanStorage; hash: string }): RestoredPlan {
  const share = takeShareParam(hash);
  if (share?.shared) return { shared: share.shared, stripUrl: share.strippedHash };
  return { shared: readStored(storage), stripUrl: null };
}

/** Persist the plan, skipping the write when storage already holds this
 *  exact serialization (and when nothing is stored and the snapshot is the
 *  codec's default). A failed read counts as "unknown", so the write is still
 *  attempted; storage failures (full, unavailable) are swallowed — the plan
 *  still works, it just will not persist. */
export function save(storage: PlanStorage, shared: SharedSnapshot): void {
  const raw = JSON.stringify(shared);
  let stored: string | null | undefined;
  try {
    stored = storage.getItem(PLAN_KEY);
  } catch {
    stored = undefined; // unreadable — cannot prove it is unchanged, so write
  }
  if (stored === raw || (stored === null && raw === DEFAULT_RAW)) return;
  try {
    storage.setItem(PLAN_KEY, raw);
  } catch {
    // storage full/unavailable — the plan still works, it just won't persist
  }
}
