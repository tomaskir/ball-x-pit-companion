// Shared DOM helpers for the internal painters: the base-relative icon URL
// join (src/icon-url.ts owns the join) and the verdict badge markup the
// grids and plan entries both paint.
import { iconUrl } from '../icon-url';
import type { Verdict } from '../synergy';

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
