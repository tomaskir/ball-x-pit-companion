// Catalog module: the ball and passive collections, indexed, with namespace
// resolution. "Which namespace does this id live in?" is the codebase's
// central invariant (ticket 03: graphs strictly separate, ids never collide)
// — it is decided here and nowhere else. Callers pass the id or item only.
// Explicit .ts extensions: src/corpus.ts imports this module from the
// harvest CLI, which runs under Node's type stripping (extensionless
// specifiers do not resolve there). Vite and tsc accept them.
import { type Ball } from './data/balls.ts';
import { type Passive } from './data/passives.ts';
import { localizedBalls, localizedPassives } from './i18n/index.ts';
import { byId, type Graph } from './graph.ts';

// 展示层索引建立在本地化集合上：中文站点的 name/effects 在进入索引前替换，
// 因此渲染器与融合合成都直接拿到目标语言的数据。
export const ballMap = byId(localizedBalls());
export const passiveMap = byId(localizedPassives());

/** An item from either namespace — both operands live here, so the union
 *  does too (synergy re-exports it for its callers). */
export type Item = Ball | Passive;

export const isPassive = (id: string): boolean => passiveMap.has(id);

/** The graph the id's namespace lives in — highlight walks and closures
 *  must never cross namespaces (ticket 05 bug was exactly this). */
export const graphFor = (id: string): Graph => (isPassive(id) ? passiveMap : ballMap);

/** The item for an id, either namespace. Undefined for unknown ids. */
export const itemFor = (id: string): Item | undefined => (isPassive(id) ? passiveMap.get(id) : ballMap.get(id));
