// The once-built action channel: a built-once element's click listener reads
// the typed action it acts on from an action slot, refreshed by every repaint.
// Separate from reconcile's diff cache — reconcile decides when to repaint,
// the slot carries what the last repaint made the element act on. The payload
// is the whole view-state ToggleAction, never a string split by convention.
// Internal to the renderer facade.
import type { Emit } from './seam';
import type { ToggleAction } from '../view-state';

/** The typed action an element's once-built click listener reports,
 *  refreshed by every repaint. `clear()` leaves the element inert so no
 *  stale payload survives a repaint that has nothing to act on. */
export interface ActionSlot {
  set(action: ToggleAction): void;
  clear(): void;
}

/** Bind el's click listener to an action slot. The listener is added once;
 *  every repaint refreshes the slot with the action the element now acts on.
 *  Nothing is emitted until an action is set. */
export function bindAction(el: HTMLElement, emit: Emit): ActionSlot {
  let action: ToggleAction | null = null;
  el.addEventListener('click', () => {
    if (action) emit(action);
  });
  return {
    set(next) { action = next; },
    clear() { action = null; },
  };
}
