// Island-core module: the startup decisions behind src/companion.ts as pure
// functions over plain values — which section a location hash routes to
// (sectionFromHash), whether an Esc keypress or empty-space click clears the
// active section's selection (shouldClear), and which theme a stored value
// plus OS preference resolve to (themeFromStorage). The island keeps the
// transport: it reads real events/storage, calls these, and applies the
// results to the DOM. Keeping the decisions here makes them unit-testable —
// companion.ts's top-level init() makes it jsdom-hostile to import.
import type { Section } from './view-state';

// ---------- routing ----------

/** The sections initRouting accepts — the same union as view-state's
 *  `Section`; this module deliberately does not re-declare it. */
export type { Section } from './view-state';

/** Which section a location hash routes to, or null when the hash names no
 *  known section (an unknown hash must not switch screens). The empty hash
 *  routes to balls — the landing screen. A share parameter riding the hash
 *  (`#/plan?p=<code>`) is ignored here: routing reads the section only; the
 *  parameter is handled once at startup (share.ts's takeShareParam). */
export function sectionFromHash(hash: string): Section | null {
  const path = hash.replace(/^#\/?/, '').split('?')[0];
  if (!path) return 'balls';
  if (['balls', 'passives', 'characters', 'fusions', 'plan'].includes(path)) return path as Section;
  return null;
}

// ---------- Esc / empty-space clear policy ----------

/** Regions whose clicks own the interaction, so an empty-space click there
 *  must not clear the active section's selection: tiles/cards/chips are the
 *  selections themselves, the fusion panel and toasts are interactive, and —
 *  the cross-screen-remembering bug (2026-10-05) — `header` covers the tab
 *  buttons: a tab click must not wipe the destination screen's remembered
 *  selection. `.screen-search` covers clicking a search box to type. */
export const CLEAR_EXEMPT_SELECTOR =
  '.tile, .char-card, .chip, .toast, .fusion-row, .fusion-panel, header, .screen-search';

/** The Esc exemption is narrower than the click one: inside a search input
 *  Esc clears the query (the browser's native type=search behavior) and must
 *  not also wipe the screen's selection — but Esc over a tile still clears. */
export const ESC_EXEMPT_SELECTOR = 'input';

/** Whether an Esc keypress or empty-space click clears the active section's
 *  selection: it does unless the section is plan (its selection is deliberate
 *  work — only the Clear button wipes it) or the event landed inside one of
 *  the exempt regions above (the island supplies that boolean via
 *  `closest(...)` — the selectors stay data here so the policy is testable). */
export function shouldClear(section: Section, inExemptRegion: boolean): boolean {
  return section !== 'plan' && !inExemptRegion;
}

// ---------- theming ----------

/** Which theme to apply at startup: a stored 'dark'/'light' wins; anything
 *  else (absent or garbage) falls through to the OS preference. The island
 *  supplies the matchMedia result — this stays DOM-free. */
export function themeFromStorage(stored: string | null, prefersLight: boolean): 'dark' | 'light' {
  if (stored === 'light' || stored === 'dark') return stored;
  return prefersLight ? 'light' : 'dark';
}
