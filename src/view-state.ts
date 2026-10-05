// View-state module: the island's state (item selection, character slots,
// fusion picks, search query) and every derivation the island used to
// hand-wire between its event handlers. One interface:
// dispatch(action) → ViewModel — 'clear' is section-scoped (the active
// section's selection only), 'clearAll' wipes every section (tab switch).
// The island (src/companion.ts) keeps only event listening, theme, and hash
// routing; painting lives in src/renderer.ts. Fusion composition lives in
// src/fusion.ts. The view model carries resolved items, not bare ids:
// fusionSlots holds the picked Ball objects so the renderer never re-derives
// them.
import { BALLS, type Ball } from './data/balls';
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
  /** Hint for the character screen: "pick a second character…" while one is
   *  held, "selection full — deselect one first" when two are held. */
  slotHint: string;
  /** The two picks in selection order, as the resolved Ball items; empty
   *  slots are null. (The renderer paints the panel from these directly —
   *  it never re-derives the picks from its row registry.) */
  fusionSlots: [Ball | null, Ball | null];
  /** Composed fused ball for the two picks, or null until both are picked. */
  fusion: FusionResult | null;
  /** Hint for the fusion panel's pending states, mirroring slotHint's
   *  pick-a-second / selection-full wording for balls. */
  fusionHint: string;
}
export type Section = 'balls' | 'passives' | 'characters' | 'fusions';
export type Action =
  | { type: 'toggleItem'; id: string }
  | { type: 'toggleChar'; id: string }
  | { type: 'toggleFusion'; id: string }
  | { type: 'search'; query: string }
  /** Esc / empty-space click: clears the named section's selection only. */
  | { type: 'clear'; section: Section }
  /** Tab switch: clears every section's selection. */
  | { type: 'clearAll' };

/** Balls offered by the fusion pick list: all fusable upgrade entities.
 *  Baby Ball is not one (research: it is not an upgrade entity). */
const FUSION_BALLS = fusionBalls();

/** Both max-2 selections (characters, fusion picks) show this when full —
 *  the sticky-toggle semantics are shared, so is the wording. */
const SELECTION_FULL = 'selection full — deselect one first';

/** Shared max-2 sticky-toggle semantics for characters and fusion picks:
 *  re-clicking a member deselects it; a third member while two are held is
 *  a no-op — one must be deselected first. Mutates `list` in place. */
function stickyToggle<T>(list: T[], id: string, match: (x: T) => boolean, make: () => T | undefined) {
  const idx = list.findIndex(match);
  if (idx >= 0) list.splice(idx, 1);
  else if (list.length < 2) {
    const x = make();
    if (x) list.push(x);
  }
}

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
      slotHint:
        selectedChars.length === 1 ? 'pick a second character…'
        : selectedChars.length === 2 ? SELECTION_FULL
        : '',
      fusionSlots: [a, b],
      fusion: a && b ? fuse(a, b) : null,
      fusionHint:
        fusionPicks.length === 0 ? 'Pick two balls to see their fusion.'
        : fusionPicks.length === 1 ? '…pick a second ball.'
        : SELECTION_FULL,
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
        // Character slots and fusion picks share stickyToggle's max-2
        // sticky semantics (re-click deselects; a third pick is a no-op).
        case 'toggleChar':
          stickyToggle(selectedChars, action.id, (c) => c.id === action.id,
            () => CHARACTERS.find((c) => c.id === action.id));
          break;
        case 'toggleFusion':
          stickyToggle(fusionPicks, action.id, (id) => id === action.id, () => action.id);
          break;
        case 'search': query = action.query; break;
        case 'clear':
          if (action.section === 'balls' || action.section === 'passives') selectedId = null;
          else if (action.section === 'characters') selectedChars.length = 0;
          else fusionPicks.length = 0;
          break;
        case 'clearAll':
          selectedId = null;
          selectedChars.length = 0;
          fusionPicks.length = 0;
          break;
      }
      return derive();
    },
  };
}
