// Catalog module: the ball and passive collections, indexed, with namespace
// resolution. "Which namespace does this id live in?" is the codebase's
// central invariant (ticket 03: graphs strictly separate, ids never collide)
// — it is decided here and nowhere else. Callers pass the id or item only.
import { BALLS, type Ball } from './data/balls';
import { PASSIVES, type Passive } from './data/passives';
import { byId, type Graph, type GraphItem } from './graph';
import type { Item } from './synergy';

export const ballMap = byId(BALLS);
export const passiveMap = byId(PASSIVES);

export const isPassive = (id: string): boolean => passiveMap.has(id);

/** The graph the id's namespace lives in — highlight walks and closures
 *  must never cross namespaces (ticket 05 bug was exactly this). */
export const graphFor = (id: string): Graph => (passiveMap.has(id) ? passiveMap : ballMap);

/** The item for an id, either namespace. Undefined for unknown ids. */
export const itemFor = (id: string): Item | undefined => (passiveMap.get(id) ?? ballMap.get(id)) as Item | undefined;

export type { Ball, Passive, GraphItem, Item };
