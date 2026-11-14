// Plan-session module: the persisted state's lifecycle as pure functions
// over injected ports — the save/load/share policy the island used to hold.
// restore({ storage, hash }) → { shared, editions, stripUrl, fromShare } owns
// the startup precedence (a decodable share parameter beats the stored plan
// and editions — the link IS the state), the one-shot strip (stripUrl is the
// hash to replace the location with, query removed, or null when the URL must
// be left alone; only a decoded parameter earns the strip), and
// corrupt-storage tolerance (garbage reads as "no stored plan"/"default
// editions", never an exception). save(storage, shared) owns serialization
// and skips the write when storage already holds that exact serialization —
// and when nothing is stored and the snapshot is the codec's default (a
// fresh browser's no-op dispatch creates no entry). Dispatches that do not
// touch the plan (search keystrokes, Esc clears) therefore do not write.
//
// The state persists under two keys: the plan + shared character selection
// under PLAN_KEY, and the enabled editions under EDITIONS_KEY (their own key,
// as the content-filter spec requires). The share link carries all three
// together; opening one persists the received editions and plan (share beats
// stored).
//
// The island keeps only transport: it hands in the real storage and hash,
// applies stripUrl through history.replaceState, and calls save after each
// dispatch. The codec (SharedSnapshot ⇄ v2 wire) is src/plan-codec.ts's; the
// share-parameter read is src/share.ts's.
import { normalizeEditions, normalizeShared, type SharedSnapshot } from './plan-codec';
import { takeShareParam } from './share';
import type { Edition } from './data/editions';

/** The localStorage key the plan persists under — exported so tests pin the
 *  key name behaviorally instead of hard-coding it. */
export const PLAN_KEY = 'ball-x-pit-plan';
/** The edition filter's own localStorage key (separate from the plan). */
export const EDITIONS_KEY = 'ball-x-pit-editions';

/** The storage port: localStorage in the browser, an in-memory adapter in
 *  tests. Reads may return garbage; restore tolerates it. */
export type PlanStorage = Pick<Storage, 'getItem' | 'setItem'>;

export interface RestoredPlan {
  /** The plan to hydrate with, or null when there is nothing to restore
   *  (no share parameter and no readable stored plan). */
  shared: SharedSnapshot | null;
  /** The enabled editions to start from — the share's when a share decoded,
   *  otherwise the stored editions (default base-game). Returned even when
   *  there is no plan to restore: the filter applies to the whole app. */
  editions: Edition[];
  /** The hash to replace the location with (`#/plan`, query stripped) for
   *  the one-shot share strip, or null when the URL must be left alone. */
  stripUrl: string | null;
  /** True when the state came from a share parameter — the loss notice fires
   *  for a share restore that drops entries, but not for a plain startup
   *  restore. */
  fromShare: boolean;
}

/** The serializations an absent storage slot is equivalent to: the codec's
 *  defaults. Writing them would persist nothing new, so save skips them (a
 *  fresh browser's first search keystroke must not create a storage entry). */
const DEFAULT_SHARED = normalizeShared({})!;
const DEFAULT_PLAN_RAW = JSON.stringify({ plan: DEFAULT_SHARED.plan, chars: DEFAULT_SHARED.chars });
const DEFAULT_EDITIONS_RAW = JSON.stringify(DEFAULT_SHARED.editions);

/** Read and parse one stored slot, tolerating every failure mode: unreadable
 *  storage, unparseable JSON, and an absent slot all read as null. */
function readJson(storage: PlanStorage, key: string): unknown {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Read the stored plan; shape normalization is the codec's (it also reads
 *  legacy flat snapshots), and deeper id validation stays in plan-state's
 *  hydrate. Garbage reads as "no stored plan". */
function readStored(storage: PlanStorage): SharedSnapshot | null {
  return normalizeShared(readJson(storage, PLAN_KEY));
}

/** Read the stored editions; any failure reads as the default (base-game). */
function readEditions(storage: PlanStorage): Edition[] {
  return normalizeEditions(readJson(storage, EDITIONS_KEY));
}

/** Write one key, skipping when storage already holds the exact value (or
 *  when nothing is stored and the value is the default). A failed read counts
 *  as "unknown", so the write is still attempted; storage failures (full,
 *  unavailable) are swallowed — the state still works, it just will not
 *  persist. */
function writeIfChanged(storage: PlanStorage, key: string, raw: string, defaultRaw: string): void {
  let stored: string | null | undefined;
  try {
    stored = storage.getItem(key);
  } catch {
    stored = undefined; // unreadable — cannot prove it is unchanged, so write
  }
  if (stored === raw || (stored === null && raw === defaultRaw)) return;
  try {
    storage.setItem(key, raw);
  } catch {
    // storage full/unavailable — the state still works, it just won't persist
  }
}

/** The startup restore: a decodable share parameter wins over the stored
 *  state and carries the hash to strip the URL to; otherwise the stored plan
 *  and editions are used and the URL is untouched. A present-but-undecodable
 *  parameter falls through to storage (no strip — the parameter never
 *  decoded). */
export function restore({ storage, hash }: { storage: PlanStorage; hash: string }): RestoredPlan {
  const share = takeShareParam(hash);
  if (share?.shared) {
    return {
      shared: share.shared,
      editions: share.shared.editions,
      stripUrl: share.strippedHash,
      fromShare: true,
    };
  }
  const editions = readEditions(storage);
  const stored = readStored(storage);
  return {
    shared: stored ? { ...stored, editions } : null,
    editions,
    stripUrl: null,
    fromShare: false,
  };
}

/** Persist the state, skipping each write when storage already holds that
 *  exact serialization (and when nothing is stored and the value is the
 *  codec's default). The plan key carries the plan + shared selection; the
 *  editions key carries the filter alone. */
export function save(storage: PlanStorage, shared: SharedSnapshot): void {
  writeIfChanged(storage, PLAN_KEY, JSON.stringify({ plan: shared.plan, chars: shared.chars }), DEFAULT_PLAN_RAW);
  writeIfChanged(storage, EDITIONS_KEY, JSON.stringify(shared.editions), DEFAULT_EDITIONS_RAW);
}
