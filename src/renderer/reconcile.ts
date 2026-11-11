// One seam for the renderer's built-once/repaint-in-place pattern — the
// content-diff bookkeeping every internal painter shares. A container's
// painted key is the identity of what was last painted on it, held in a
// WeakMap: nothing leaks into the DOM, and a container rebuilt by buildAll
// starts unpainted. reconcile() repaints only when the key changed — a match
// leaves the built DOM (especially <img>) untouched. The once-built action
// channel is separate (action-slot.ts): it holds the typed action a built-once
// handler reports, so this map is the diff cache only.
const paintedKeys = new WeakMap<HTMLElement, string>();

/** Repaint el's content: run repaint unless key matches the last painted
 *  one. */
export function reconcile(el: HTMLElement, key: string, repaint: () => void): void {
  if (paintedKeys.get(el) === key) return;
  repaint();
  paintedKeys.set(el, key);
}
