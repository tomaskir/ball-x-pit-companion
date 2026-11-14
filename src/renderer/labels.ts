// Shared display text for the internal painters: the plan-limit tooltip
// (fusion panel and selection box), the plan toggle's add/remove wording
// (selection box and fusion panel), and the content filter's empty-screen
// hint (grids, characters, fusion list). The structural-depth labels live in
// src/depth-labels.ts (shared with the build graph's row model).
/** Disabled buttons suppress mouse events, so a title on the button itself
 *  never shows — the title rides the nearest container instead (with
 *  pointer-events:none letting the hover reach it). */
export const PLAN_LIMIT_TITLE = 'Plan limit reached';

/** The plan toggle's two states, shared by the selection box's buttons and
 *  the fusion panel's composed-pair button. */
export const PLAN_TOGGLE_LABELS = { add: 'Add to plan', remove: 'Remove from plan' } as const;

/** The content filter's one empty-screen hint — the grids, the character
 *  screen, and the fusion pick list all paint this same line. */
export const EMPTY_HINT = 'No content matches the current filters.';
