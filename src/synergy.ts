// Synergy verdict module: does an item (ball or passive) clash or cooperate
// with the selected characters? Extracted from the island (src/companion.ts)
// so the red-wins merge rule and the *passives wildcard have one testable
// interface — the island keeps only DOM painting.
//
// Namespace resolution is delegated to the catalog (src/catalog.ts): an item
// is a passive iff its id appears in PASSIVES (ball and passive graphs are
// strictly separate; ids never collide — ticket 03). Callers pass the item,
// not an isPassive flag.
import { isPassive, type Item } from './catalog';
import type { Character } from './data/characters';

export type { Item };

export interface Verdict { verdict: 'red' | 'green'; note?: string }

/** Verdict of one item against the selected characters. Null = neutral. */
export function verdictFor(item: Item, selected: Character[]): Verdict | null {
  const passive = isPassive(item.id);
  const verdicts: Verdict[] = [];
  for (const ch of selected) {
    for (const rule of ch.verdicts) {
      const wildcard = rule.tag === '*passives' && passive;
      if (wildcard || item.tags.includes(rule.tag)) verdicts.push({ verdict: rule.verdict, note: rule.note ? `${ch.name}: ${rule.note}` : undefined });
    }
  }
  if (!verdicts.length) return null;
  if (selected.length === 2 && verdicts.some((v) => v.verdict === 'red')) return { verdict: 'red', note: verdicts.filter((v) => v.verdict === 'red').map((v) => v.note).filter(Boolean).join(' · ') };
  const greens = verdicts.filter((v) => v.verdict === 'green');
  return greens.length ? greens[0] : verdicts[0];
}
