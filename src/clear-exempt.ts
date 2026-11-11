// Clear-exemption module: the one home for "does this click own the
// interaction?" — the marker every interactive region stamps on itself at
// creation time, and the predicate the island's empty-space handler asks.
//
// The rule lives next to the markup that creates it: a painter calls
// markClearExempt(el) on the element it builds (a tile, a character card, a
// chip, a fusion row, the fusion panel, a selection box, the toast), and
// index.astro carries the same marker declaratively on its static regions
// (the header and the per-screen search inputs). The island never keeps a
// copy of the region list — it asks isClearExempt(target), so a new
// interactive region cannot be forgotten in a selector somewhere else.
//
// This module answers only the DOM question. The policy — the plan screen
// never clears, and Esc has its own narrower input rule — stays in
// src/companion-core.ts (shouldClear composes this predicate with the
// section rule).
//
// The marker is a data attribute, not a class: it is behavior, not styling,
// so the stylesheet's class vocabulary stays untouched.

/** The attribute marking a region whose clicks own the interaction. */
export const CLEAR_EXEMPT_ATTR = 'data-clear-exempt';

/** Mark el and its subtree as owning clicks: an empty-space click inside it
 *  must not clear the active section's selection. Idempotent. */
export function markClearExempt(el: Element): void {
  el.setAttribute(CLEAR_EXEMPT_ATTR, '');
}

/** Whether target lies inside a marked region. Non-element targets (the
 *  document, text nodes) are never exempt. */
export function isClearExempt(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest(`[${CLEAR_EXEMPT_ATTR}]`);
}
