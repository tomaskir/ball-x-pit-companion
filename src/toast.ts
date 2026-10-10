// Toast adapter module: the whole toast lifecycle in one place — build,
// show, hide, position, one-at-a-time replacement, anchor binding
// (mouseenter/touchstart show, mouseleave hide), and the document-level
// outside-tap dismissal. Extracted from src/renderer.ts, which kept the
// only renderer subsystem with its own mutable module state and no tests;
// the renderer now creates the adapter once at build time and only binds
// anchors to it. The verdict lookup is injected at creation (the build
// seam's getVerdict), so a shown toast always reads the current character
// selection.
//
// The dismissal is the adapter's own document-level pointerdown listener —
// not the island's empty-space clear policy (companion-core's shouldClear),
// which it neither dispatches nor interferes with: hiding the toast on an
// outside tap is all it does. A pointerdown inside the toast itself, or
// inside a bound anchor (the anchor's own show must win), is ignored.
// Toast content is built fresh per show (current behavior — the
// never-recreate-<img> invariant is a grids rule); icons go through
// icon-url.ts's base-relative join.
import { recipeHtml } from './graph';
import { itemFor, type Item } from './catalog';
import { iconUrl } from './icon-url';
import type { Verdict } from './synergy';

export interface ToastOptions {
  /** Per-item verdict against the current character selection (the build
   *  seam's getVerdict). */
  getVerdict: (item: Item) => Verdict | null;
  /** Base URL for the icon join; defaults to the deploy base. */
  baseUrl?: string;
}

export interface ToastAdapter {
  /** Build and show the toast for item, positioned off anchor. One toast
   *  at a time — a second show replaces the first. */
  showFor(anchor: HTMLElement, item: Item): void;
  /** Remove the toast, if shown. No-op otherwise. */
  hide(): void;
  /** Bind an anchor: hover/tap shows the toast for the item getItem()
   *  returns at show time, mouseleave hides. */
  bind(anchor: HTMLElement, getItem: () => Item | null): void;
  /** Hide any shown toast and remove the document-level dismissal listener
   *  (buildAll re-creates the adapter; tests tear it down). */
  destroy(): void;
}

export function createToast({ getVerdict, baseUrl = import.meta.env.BASE_URL }: ToastOptions): ToastAdapter {
  const icon = (p: string) => iconUrl(baseUrl, p);

  let toastEl: HTMLElement | null = null;
  const anchors: HTMLElement[] = [];

  function buildToast(item: Item) {
    const el = document.createElement('div');
    el.className = 'toast';
    // recipes are OR-of-ANDs — same compact per-slot notation as the tiles
    const comps = item.recipes.length ? recipeHtml(item.recipes, (id) => {
      const comp = itemFor(id);
      return comp ? `<img src="${icon(comp.icon)}" alt="${comp.name}" title="${comp.name}" width="28" height="28">` : null;
    }) : '';
    const v = getVerdict(item);
    el.innerHTML = `
      <h4><img src="${icon(item.icon)}" alt="" width="20" height="20">${item.name}</h4>
      <p class="eff">${item.effects}</p>
      ${comps ? `<div class="rec">${comps}</div>` : ''}
      ${v ? `<div class="verdicts"><span class="${v.verdict}">${v.verdict === 'red' ? '▲ red' : '✓ green'}${v.note ? ` — ${v.note}` : ''}</span></div>` : ''}
      ${item.tags.length ? `<div class="tags">${item.tags.map((t) => `<span>${t}</span>`).join('')}</div>` : ''}`;
    return el;
  }

  function positionToast(tile: HTMLElement, toast: HTMLElement) {
    const r = tile.getBoundingClientRect();
    const tw = toast.offsetWidth, th = toast.offsetHeight;
    let x = r.left + r.width / 2 - tw / 2;
    let y = r.bottom + 8;
    x = Math.max(8, Math.min(x, window.innerWidth - tw - 8));
    if (y + th > window.innerHeight - 8) y = Math.max(8, r.top - th - 8);
    toast.style.left = `${x}px`;
    toast.style.top = `${y}px`;
  }

  function showFor(anchor: HTMLElement, item: Item) {
    hide();
    toastEl = buildToast(item);
    document.body.appendChild(toastEl);
    positionToast(anchor, toastEl);
  }

  function hide() {
    toastEl?.remove();
    toastEl = null;
  }

  function bind(anchor: HTMLElement, getItem: () => Item | null) {
    anchors.push(anchor);
    anchor.addEventListener('mouseenter', () => {
      const item = getItem();
      if (item) showFor(anchor, item);
    });
    anchor.addEventListener('mouseleave', hide);
    // mobile: tap shows toast, next tap elsewhere dismisses (the document
    // pointerdown listener below)
    anchor.addEventListener('touchstart', () => {
      const item = getItem();
      if (item) showFor(anchor, item);
    }, { passive: true });
  }

  // Outside-tap dismissal: any pointerdown that is not inside the toast
  // itself and not inside a bound anchor (whose own show must win —
  // pointerdown fires before touchstart) hides the toast.
  const onDocPointerDown = (e: Event) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (toastEl?.contains(target)) return;
    if (anchors.some((a) => a.contains(target))) return;
    hide();
  };
  document.addEventListener('pointerdown', onDocPointerDown);

  return {
    showFor,
    hide,
    bind,
    destroy: () => {
      hide();
      document.removeEventListener('pointerdown', onDocPointerDown);
    },
  };
}
