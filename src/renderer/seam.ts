// The build seam, captured once by buildAll: the click→island callback
// (emit — the island dispatches the named view-state action and paints) and
// the toast adapter (src/toast.ts), whose verdict lookup reads the latest
// ViewModel paint() captured — the same verdict the tiles were painted
// with, so hover and paint cannot disagree and the seam needs no second
// callback into live view state. Every internal painter reports clicks
// through emitAction and binds hover anchors through attachToast, so the
// seam has one home and the facade (src/renderer.ts) stays the only public
// interface.
import { createToast, type ToastAdapter } from '../toast';
import type { Item } from '../catalog';
import type { ToggleAction, ViewModel } from '../view-state';

/** The click→island callback's shape — one home for the emit signature. */
export type Emit = (action: ToggleAction) => void;

let emit: Emit = () => {};
let toast: ToastAdapter | null = null;
/** The view model paint() last handed in — the toast's only verdict source. */
let latest: ViewModel | null = null;

export interface SeamOptions {
  emit: Emit;
}

/** Capture the island's callback and (re)create the toast adapter. The
 *  previous adapter is destroyed so its document-level dismissal listener
 *  never leaks; the previous view model is dropped so a re-run never shows
 *  a stale verdict. */
export function initSeam({ emit: onEmit }: SeamOptions): void {
  toast?.destroy();
  latest = null;
  toast = createToast({
    getVerdict: (item: Item) => latest?.tiles.get(item.id)?.verdict ?? null,
  });
  emit = onEmit;
}

/** Capture the view model paint() is about to paint. The toast reads its
 *  verdict from here at hover time — the painted tile's own verdict. */
export function captureViewModel(vm: ViewModel): void {
  latest = vm;
}

/** Report a built-in click action back to the island. */
export function emitAction(action: ToggleAction): void {
  emit(action);
}

/** Bind an anchor to the toast adapter: hover/tap shows the toast for the
 *  item getItem() returns at show time, mouseleave hides. */
export function attachToast(anchor: HTMLElement, getItem: () => Item | null): void {
  toast?.bind(anchor, getItem);
}
