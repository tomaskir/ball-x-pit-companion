// Island-core module: the startup decisions behind src/companion.ts as pure
// functions over plain values — which section a location hash routes to
// (sectionFromHash), whether an Esc keypress or empty-space click clears the
// active section's selection (shouldClear), and which theme a stored value
// plus OS preference resolve to (themeFromStorage). The island and its shell
// adapter keep the transport: they read real events/storage, call these, and
// apply the results to the DOM. Keeping the decisions here makes them unit-testable
// independently of the DOM — and companion.ts itself is now callable too
// (startIsland(ports), with the environment injected as ports), so the
// island's wiring is pinned behaviorally in src/companion.test.ts.
//
// The "did this click land in an interactive region?" question is DOM-shaped
// and lives in src/clear-exempt.ts: the painters call markClearExempt(el) on
// the regions they create, the shell carries the same data attribute on its
// static regions, and the island asks isClearExempt(target). shouldClear
// composes that answer with the section rule below — it never keeps a region
// list of its own.
import type { Section } from './view-state';

// ---------- routing ----------

/** The sections a hash may route to — typed as view-state's `Section` (its
 *  owner) so adding one there without updating this list is a compile error. */
const SECTIONS: Section[] = ['balls', 'passives', 'characters', 'fusions', 'plan'];

/** Which section a location hash routes to, or null when the hash names no
 *  known section (an unknown hash must not switch screens). The empty hash
 *  routes to balls — the landing screen. A share parameter riding the hash
 *  (`#/plan?p=<code>`) is ignored here: routing reads the section only; the
 *  parameter is handled once at startup (share.ts's takeShareParam). */
export function sectionFromHash(hash: string): Section | null {
  const path = hash.replace(/^#\/?/, '').split('?')[0];
  if (!path) return 'balls';
  return SECTIONS.includes(path as Section) ? (path as Section) : null;
}

// ---------- Esc / empty-space clear policy ----------

/** The Esc exemption is narrower than the click one: inside a search input
 *  Esc clears the query (the browser's native type=search behavior) and must
 *  not also wipe the screen's selection — but Esc over a tile still clears.
 *  (The click exemption is not a selector at all: the regions carry
 *  src/clear-exempt.ts's marker, and the island asks isClearExempt.) */
export const ESC_EXEMPT_SELECTOR = 'input';

/** Whether an Esc keypress or empty-space click clears the active section's
 *  selection: it does unless the section is plan (its selection is deliberate
 *  work — only the Clear button wipes it) or the event landed inside an
 *  interactive region (the island supplies that boolean from
 *  src/clear-exempt.ts's isClearExempt — the marker lives with the markup
 *  that creates it, so no region list can drift here). */
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
