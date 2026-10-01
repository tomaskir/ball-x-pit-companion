// View-state module: the island's state (item selection, character slots,
// search query, section) and every derivation the island used to hand-wire
// between its event handlers. One interface: dispatch(action) → ViewModel.
// The island (src/companion.ts) keeps only DOM listening and painting.
import { BALLS } from './data/balls';
import { PASSIVES } from './data/passives';
import { CHARACTERS, type Character } from './data/characters';
import { byId, highlightSet, type Graph, type GraphItem } from './graph';
import { verdictFor, type Item } from './synergy';

const ballMap = byId(BALLS);
const passiveMap = byId(PASSIVES);

export interface TileState { selected: boolean; related: boolean; dimmed: boolean; filtered: boolean; verdict: string | null; verdictNote: string | null; }
export interface CharCardState { selected: boolean; filtered: boolean; }
export interface ViewModel {
  tiles: Map<string, TileState>;
  charCards: Map<string, CharCardState>;
  selectedChars: Character[];
  slotHint: string;
}
export type Action =
  | { type: 'toggleItem'; id: string }
  | { type: 'toggleChar'; id: string }
  | { type: 'search'; query: string }
  | { type: 'clear' };

/** All ids share one highlight namespace (ball and passive graphs are
 *  separate but ids never collide — ticket 03). */
const graphFor = (id: string): Graph => (passiveMap.has(id) ? passiveMap : ballMap);

export function createViewState() {
  let selectedId: string | null = null;
  let query = '';
  const selectedChars: Character[] = [];

  const derive = (): ViewModel => {
    const tiles = new Map<string, TileState>();
    const charCards = new Map<string, CharCardState>();
    const related = selectedId ? highlightSet(selectedId, graphFor(selectedId)) : new Set<string>();
    const q = query.trim().toLowerCase();
    for (const item of [...BALLS, ...PASSIVES]) {
      const v = verdictFor(item, selectedChars);
      tiles.set(item.id, {
        selected: selectedId === item.id,
        related: !!selectedId && selectedId !== item.id && related.has(item.id),
        dimmed: !!selectedId && !related.has(item.id),
        filtered: !!q && !(item.name.toLowerCase().includes(q) || item.effects.toLowerCase().includes(q)),
        verdict: v?.verdict ?? null,
        verdictNote: v?.note ?? null,
      });
    }
    for (const ch of CHARACTERS) {
      charCards.set(ch.id, {
        selected: selectedChars.some((c) => c.id === ch.id),
        filtered: !!q && !(ch.name.toLowerCase().includes(q) || ch.quirk.toLowerCase().includes(q) || (ballMap.get(ch.baseBallId ?? '')?.name.toLowerCase().includes(q) ?? false)),
      });
    }
    return { tiles, charCards, selectedChars, slotHint: selectedChars.length === 1 ? 'pick a second character…' : '' };
  };

  return {
    /** Verdict for one item against the current selection — the toast needs
     *  the full verdict (note included), not just the tile's badge color. */
    verdictFor(item: Item) {
      return verdictFor(item, selectedChars);
    },
    dispatch(action: Action): ViewModel {
      switch (action.type) {
        case 'toggleItem': selectedId = selectedId === action.id ? null : action.id; break;
        case 'toggleChar': {
          const idx = selectedChars.findIndex((c) => c.id === action.id);
          if (idx >= 0) selectedChars.splice(idx, 1);
          else {
            if (selectedChars.length >= 2) selectedChars.shift();
            const ch = CHARACTERS.find((c) => c.id === action.id);
            if (ch) selectedChars.push(ch);
          }
          break;
        }
        case 'search': query = action.query; break;
        case 'clear': selectedId = null; break;
      }
      return derive();
    },
  };
}

export type { Item };
