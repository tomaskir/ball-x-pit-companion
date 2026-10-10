// Test support: the stylesheet pins that more than one test file asserts.
// styles.test.ts owns each contract and regression.test.ts aliases it — both
// call the same named assertion here, so one CSS refactor updates one pin,
// not two regex copies. Each assertion keeps the bug's name in its failure
// messages.
import { expect } from 'vitest';
import { globalCss, rulesFor } from './styles';

/** The global `[hidden] { display: none !important }` base rule — author
 *  display rules (e.g. .fusion-head's flex) must never beat the hidden
 *  attribute (was torn panel state: hint + stale head after deselect). */
export function expectHiddenBeatsAuthorDisplay(): void {
  const rules = rulesFor(globalCss(), '[hidden]');
  expect(rules, 'a base [hidden] rule exists').not.toHaveLength(0);
  expect(rules.map((r) => r.decls.get('display')), '[hidden] forces display:none !important')
    .toContain('none !important');
}

/** The fusion pick list's scrollbar is permanent (overflow-y: scroll) and
 *  fixed-size (scrollbar-width: thin — Firefox's thin scrollbar never
 *  expands on hover), separated from the rows by a reserved gutter, and the
 *  list never pushes the page past the viewport (max-height budgets the
 *  chrome + per-screen search box). */
export function expectFusionListScrollbarPermanentAndSeparated(): void {
  const css = globalCss();
  const base = rulesFor(css, '.fusion-list');
  expect(base, 'a top-level .fusion-list rule exists').not.toHaveLength(0);
  const block = base[0].decls;
  expect(block.get('overflow-y')).toBe('scroll');
  expect(block.get('scrollbar-width')).toBe('thin');
  expect(block.get('padding-right')).toBe('12px');
  // 100vh minus header/footer/search chrome (~232px) — was 100vh-140px, a
  // whole-page scroll
  expect(block.get('max-height')).toBe('calc(100vh - 232px)');
  // rows keep clearance from the scrollbar gutter (Firefox hover-expansion)
  const row = rulesFor(css, '.fusion-list > .fusion-row');
  expect(row.map((r) => r.decls.get('margin-right')), '.fusion-row clears the gutter')
    .toContain('6px');
}

/** Both picked fusion slots share ONE highlight rule (slot-2 was visually
 *  subtle: dim border, no glow — read as "not highlighted"). */
export function expectSlotHighlightsIdentical(): void {
  const shared = rulesFor(globalCss(), '.fusion-row.slot-1').filter((r) =>
    r.selectors.includes('.fusion-row.slot-2'));
  expect(shared, 'slot-1 and slot-2 share one highlight rule').toHaveLength(1);
  expect(shared[0].decls.get('border-color')).toBe('var(--gold)');
  expect(shared[0].decls.get('box-shadow')).toBe('0 0 6px var(--glow)');
}
