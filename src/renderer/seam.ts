// The build seam, created once per renderer instance: the click→island
// callback (emit — the island dispatches the named view-state action and
// paints) and the toast adapter (src/toast.ts), whose verdict and passive-
// availability lookups read the latest ViewModel paint() captured — the same
// state the tiles were painted with, so hover and paint cannot disagree and
// the seam needs no second callback into live view state. Every internal painter reports clicks
// through emitAction and binds hover anchors through attachToast, so the
// seam has one home and the facade (src/renderer.ts) stays the only public
// interface. The seam is an instance, not module state: two renderers on one
// document never rebind each other, and destroy() tears the toast adapter
// down.
import { createToast } from '../toast';
import type { Item } from '../catalog';
import type { ToggleAction, ViewModel } from '../view-state';

/** The click→island callback's shape — one home for the emit signature. */
export type Emit = (action: ToggleAction) => void;

export interface SeamOptions {
  emit: Emit;
}

/** What the internal painters need from the seam: report a click, bind a
 *  toast anchor. They never see (or own) the adapter's lifecycle. */
export interface PainterSeam {
  emitAction(action: ToggleAction): void;
  attachToast(anchor: HTMLElement, getItem: () => Item | null): void;
}

/** The renderer instance's seam. capture() records the view model paint() is
 *  about to paint (the toast's only verdict source; null drops a stale one);
 *  destroy() hides any shown toast, removes the adapter's document-level
 *  dismissal listener, and makes the seam inert (later emitAction/attachToast
 *  calls are no-ops). */
export interface Seam extends PainterSeam {
  capture(vm: ViewModel | null): void;
  destroy(): void;
}

/** Create the seam for one renderer instance: capture the island's callback,
 *  the latest painted view model, and the toast adapter this instance owns.
 *  destroy() makes the seam inert — built-once DOM handlers that outlive the
 *  renderer cannot emit or show toasts afterwards. */
export function createSeam({ emit }: SeamOptions): Seam {
  let latest: ViewModel | null = null;
  let destroyed = false;
  const toast = createToast({
    getVerdict: (item: Item) => latest?.tiles.get(item.id)?.verdict ?? null,
    getAvailability: (item: Item) => latest?.tiles.get(item.id)?.availability ?? null,
  });
  return {
    emitAction: (action) => {
      if (!destroyed) emit(action);
    },
    attachToast: (anchor, getItem) => {
      if (!destroyed) toast.bind(anchor, getItem);
    },
    capture: (vm) => {
      latest = vm;
    },
    destroy: () => {
      destroyed = true;
      latest = null;
      toast.destroy();
    },
  };
}
