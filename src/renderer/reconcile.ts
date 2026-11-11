// One seam for the renderer's built-once/repaint-in-place pattern — the
// content-diff bookkeeping every internal painter shares. A container's
// painted key is the identity of what was last painted on it, held in a
// WeakMap: nothing leaks into the DOM, and a container rebuilt by buildAll
// starts unpainted. reconcile() repaints only when the key changed — a match
// leaves the built DOM (especially <img>) untouched. The once-built buttons
// (the selection boxes', the fusion panel's plan toggle) read what they act
// on through the same map: the painted key IS the item/pair the buttons act
// on — one channel, refreshed by every repaint, never a second stashed one.
const paintedKeys = new WeakMap<HTMLElement, string>();

/** The content key last painted on el — what once-built handlers read. */
export const paintedKey = (el: HTMLElement): string | undefined => paintedKeys.get(el);

/** Record a painted key explicitly — for once-built handlers that act on a
 *  key which is not a repaint diff (the fusion panel's plan toggle, the
 *  selection boxes). */
export function setPaintedKey(el: HTMLElement, key: string): void {
  paintedKeys.set(el, key);
}

/** Clear a container's painted key so no stale identity survives it. */
export function clearPaintedKey(el: HTMLElement): void {
  paintedKeys.delete(el);
}

/** Repaint el's content: run repaint unless key matches the last painted
 *  one. */
export function reconcile(el: HTMLElement, key: string, repaint: () => void): void {
  if (paintedKeys.get(el) === key) return;
  repaint();
  paintedKeys.set(el, key);
}
