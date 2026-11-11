// The build seam, captured once by buildAll: the click→island callback
// (emit — the island dispatches the named view-state action and paints) and
// the toast adapter (src/toast.ts), whose verdict lookup rides the same
// seam. Every internal painter reports clicks through emitAction and binds
// hover anchors through attachToast, so the seam has one home and the facade
// (src/renderer.ts) stays the only public interface.
import { createToast, type ToastAdapter } from '../toast';
import type { Item } from '../catalog';
import type { Verdict } from '../synergy';
import type { ToggleAction } from '../view-state';

let emit: (action: ToggleAction) => void = () => {};
let toast: ToastAdapter | null = null;

export interface SeamOptions {
  getVerdict: (item: Item) => Verdict | null;
  emit: (action: ToggleAction) => void;
}

/** Capture the island's callbacks and (re)create the toast adapter. The
 *  previous adapter is destroyed so its document-level dismissal listener
 *  never leaks. */
export function initSeam({ getVerdict, emit: onEmit }: SeamOptions): void {
  toast?.destroy();
  toast = createToast({ getVerdict });
  emit = onEmit;
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
