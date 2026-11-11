// One seam for the renderer's built-once/repaint-in-place pattern — the
// content-diff bookkeeping every internal painter shares. A container's
// painted key is the identity of what was last painted on it, held in a
// WeakMap: nothing leaks into the DOM, and a container rebuilt by build()
// starts unpainted. reconcile() repaints only when the key changed — a match
// leaves the built DOM (especially <img>) untouched. The cache is per
// renderer instance (createReconcile), so two renderers never share painted
// keys; reset() drops it on destroy(). The once-built action channel is
// separate (action-slot.ts): it holds the typed action a built-once handler
// reports, so this map is the diff cache only.

/** The diff-cache function the painters call. */
export type Reconcile = (el: HTMLElement, key: string, repaint: () => void) => void;

/** One renderer instance's reconcile cache. */
export interface Reconciler {
  reconcile: Reconcile;
  /** Drop every painted key (destroy()). */
  reset(): void;
}

/** Create the reconcile cache for one renderer instance. */
export function createReconcile(): Reconciler {
  let paintedKeys = new WeakMap<HTMLElement, string>();
  return {
    reconcile(el, key, repaint) {
      if (paintedKeys.get(el) === key) return;
      repaint();
      paintedKeys.set(el, key);
    },
    reset() {
      paintedKeys = new WeakMap();
    },
  };
}
