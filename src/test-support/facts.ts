// Test support: evaluate the reported-fact table's copy for a pair. The copy
// stays in the one table; tests assert which facts fire and in what order.
import { ballMap } from '../catalog';
import { FUSION_FACTS, type CaveatContext } from '../fusion-knowledge';

/** The composition context the composer passes to `factsFor()`. */
export const caveatContext = (over: Partial<CaveatContext> = {}): CaveatContext =>
  ({ spawnerId: null, disputed: false, ...over });

/** The table's note text for a fact id, evaluated with the given context. */
export const noteOf = (id: string, a: string, b: string, c = caveatContext()): string => {
  const fact = FUSION_FACTS.find((f) => f.id === id);
  if (!fact || fact.kind !== 'note') throw new Error(`missing note fact: ${id}`);
  const ball = (x: string) => ballMap.get(x)!;
  return typeof fact.note === 'function' ? fact.note(ball(a), ball(b), c) : fact.note;
};
