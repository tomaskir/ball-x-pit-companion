// The content filter's tier-heading repaint, shared by the catalog grids and
// the fusion pick list: each heading counts the items still shown at its
// structural depth and hides when the tier has none. The caller supplies the
// visible collection (the view model's edition-filtered list, further
// narrowed by search where the screen hides non-matches); the helper only
// paints. Internal to the renderer facade.
import { DEPTH_LABELS } from '../depth-labels';

/** One tier's heading and the structural depth it counts. */
export interface TierHeading {
  heading: HTMLElement;
  depth: 0 | 1 | 2;
}

/** Repaint every heading from the visible collection; returns whether any
 *  tier has visible items (the screen's empty-hint flag). */
export function paintTierHeadings(
  sections: readonly TierHeading[],
  visible: readonly { depth: 0 | 1 | 2 }[],
): boolean {
  let anyVisible = false;
  for (const section of sections) {
    const count = visible.filter((item) => item.depth === section.depth).length;
    section.heading.textContent = `${DEPTH_LABELS[section.depth]} (${count})`;
    section.heading.hidden = count === 0;
    if (count > 0) anyVisible = true;
  }
  return anyVisible;
}
