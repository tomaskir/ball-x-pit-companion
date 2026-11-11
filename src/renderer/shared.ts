// Shared renderer helpers for the internal painters: the base-relative icon
// URL join (src/icon-url.ts owns the join), the depth display labels, and
// the plan-limit tooltip shared by the fusion panel and the selection box.
import { iconUrl } from '../icon-url';

export const DEPTH_LABELS = ['Basic', 'Evolved', 'Tier-3'] as const;

/** Icons are stored in data as base-relative ("icons/balls/x.png"); the
 *  join with the configured base URL lives in src/icon-url.ts. */
export const icon = (p: string) => iconUrl(import.meta.env.BASE_URL, p);

/** Disabled buttons suppress mouse events, so a title on the button itself
 *  never shows — the title rides the nearest container instead (with
 *  pointer-events:none letting the hover reach it). */
export const PLAN_LIMIT_TITLE = 'Plan limit reached';
