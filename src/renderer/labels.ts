// Shared display text for the internal painters: the structural-depth
// labels, the plan-limit tooltip (fusion panel and selection box), and the
// plan toggle's add/remove wording (selection box and fusion panel).
export const DEPTH_LABELS = ['Basic', 'Evolved', 'Tier-3'] as const;

/** Disabled buttons suppress mouse events, so a title on the button itself
 *  never shows — the title rides the nearest container instead (with
 *  pointer-events:none letting the hover reach it). */
export const PLAN_LIMIT_TITLE = 'Plan limit reached';

/** The plan toggle's two states, shared by the selection box's buttons and
 *  the fusion panel's composed-pair button. */
export const PLAN_TOGGLE_LABELS = { add: 'Add to plan', remove: 'Remove from plan' } as const;
