// View-state module: the island's state (item selection, character slots,
// fusion picks, search query, section) and every derivation the island used
// to hand-wire between its event handlers. One interface:
// dispatch(action) → ViewModel. The island (src/companion.ts) keeps only
// event listening, theme, and hash routing; painting lives in
// src/renderer.ts. Fusion composition lives in src/fusion.ts.
import { BALLS } from './data/balls';
import { PASSIVES } from './data/passives';
import { CHARACTERS, type Character } from './data/characters';
import { highlightSet } from './graph';
import { ballMap, itemFor, graphFor } from './catalog';
import { fusionBalls, fuse, type FusionResult } from './fusion';
import { verdictFor, type Item, type Verdict } from './synergy';

export interface TileState { selected: boolean; related: boolean; dimmed: boolean; filtered: boolean; verdict: Verdict | null; }
export interface CharCardState { selected: boolean; filtered: boolean; }
/** Pick state of one ball row on the fusion screen: slot = pick order (1
 *  first, 2 second), null when not picked. Baby Ball is not a fusable
 *  upgrade entity and is excluded from the list. */
export interface FusionRowState { slot: 1 | 2 | null; filtered: boolean; }
export interface ViewModel {
  tiles: Map<string, TileState>;
  charCards: Map<string, CharCardState>;
  fusionRows: Map<string, FusionRowState>;
  selectedChars: Character[];
  slotHint: string;
  /** The two picks in selection order; empty slots are null. */
  fusionSlots: [string | null, string | null];
  /** Composed fused ball for the two picks, or null until both are picked. */
  fusion: FusionResult | null;
}
export type Action =
  | { type: 'toggleItem'; id: string }
  | { type: 'toggleChar'; id: string }
  | { type: 'toggleFusion'; id: string }
  | { type: 'search'; query: string }
  | { type: 'clear' };

/** Balls offered by the fusion pick list: all fusable upgrade entities.
 *  Baby Ball is not one (research: it is not an upgrade entity). */
const FUSION_BALLS = fusionBalls();

export function createViewState() {
  let selectedId: string | null = null;
  let query = '';
  const selectedChars: Character[] = [];
  /** Fusion picks in selection order, at most 2. */
  const fusionPicks: string[] = [];

  const derive = (): ViewModel => {
    const tiles = new Map<string, TileState>();
    const charCards = new Map<string, CharCardState>();
    const fusionRows = new Map<string, FusionRowState>();
    const related = selectedId ? highlightSet(selectedId, graphFor(selectedId)) : new Set<string>();
    const q = query.trim().toLowerCase();
    for (const item of [...BALLS, ...PASSIVES]) {
      const v = verdictFor(item, selectedChars);
      tiles.set(item.id, {
        selected: selectedId === item.id,
        related: !!selectedId && selectedId !== item.id && related.has(item.id),
        dimmed: !!selectedId && !related.has(item.id),
        filtered: !!q && !(item.name.toLowerCase().includes(q) || item.effects.toLowerCase().includes(q)),
        verdict: v,
      });
    }
    for (const ch of CHARACTERS) {
      charCards.set(ch.id, {
        selected: selectedChars.some((c) => c.id === ch.id),
        filtered: !!q && !(ch.name.toLowerCase().includes(q) || ch.quirk.toLowerCase().includes(q) || (ch.baseBallId && itemFor(ch.baseBallId)?.name.toLowerCase().includes(q) || false)),
      });
    }
    for (const b of FUSION_BALLS) {
      const pick = fusionPicks.indexOf(b.id);
      fusionRows.set(b.id, {
        slot: pick === 0 ? 1 : pick === 1 ? 2 : null,
        filtered: !!q && !b.name.toLowerCase().includes(q),
      });
    }
    const a = fusionPicks[0] ? ballMap.get(fusionPicks[0]) : null;
    const b = fusionPicks[1] ? ballMap.get(fusionPicks[1]) : null;
    return {
      tiles,
      charCards,
      fusionRows,
      selectedChars,
      slotHint: selectedChars.length === 1 ? 'pick a second character…' : '',
      fusionSlots: [fusionPicks[0] ?? null, fusionPicks[1] ?? null],
      fusion: a && b ? fuse(a, b) : null,
    };
  };

  return {
    /** Verdict for one item against the current selection — the toast needs
     *  the full verdict (note included), not just the tile's badge color. */
    verdictFor(item: Item) {
      return verdictFor(item, selectedChars);
    },
    /** Current view model without a state change — initial paint. */
    derive(): ViewModel {
      return derive();
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
        // Fusion picks are clear-and-restart: re-clicking a pick deselects it
        // (the other becomes the pending first pick), clicking a third ball
        // drops both and starts a new pair with that ball.
        case 'toggleFusion': {
          const idx = fusionPicks.indexOf(action.id);
          if (idx >= 0) fusionPicks.splice(idx, 1);
          else if (fusionPicks.length >= 2) fusionPicks.splice(0, 2, action.id);
          else fusionPicks.push(action.id);
          break;
        }
        case 'search': query = action.query; break;
        case 'clear': selectedId = null; break;
      }
      return derive();
    },
  };
}
