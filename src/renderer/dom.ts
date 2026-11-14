// Shared DOM helpers for the internal painters: the base-relative icon URL
// join (src/icon-url.ts owns the join), the verdict badge markup the grids
// and plan entries both paint, and the content filter's empty-screen hint
// element the grids, characters, and fusion list all build.
import { iconUrl } from '../icon-url';
import type { Verdict } from '../synergy';
import { EMPTY_HINT } from './labels';

/** Icons are stored in data as base-relative ("icons/balls/x.png"); the
 *  join with the configured base URL lives in src/icon-url.ts. */
export const icon = (p: string) => iconUrl(import.meta.env.BASE_URL, p);

/** The verdict badge the tiles and the plan entries both paint — one
 *  spelling of the class/title contract. */
export function verdictBadge(v: Verdict): HTMLElement {
  const badge = document.createElement('span');
  badge.className = `ind ${v.verdict}`;
  badge.textContent = '!';
  badge.title = v.note ?? v.verdict;
  return badge;
}

/** The content filter's empty-screen hint: built once (hidden), toggled by
 *  paint. One spelling of the class/text contract for every screen. */
export function emptyFilterHint(): HTMLElement {
  const hint = document.createElement('p');
  hint.className = 'empty-filter-hint';
  hint.textContent = EMPTY_HINT;
  hint.hidden = true;
  return hint;
}
