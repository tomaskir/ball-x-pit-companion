// Regression: the fusion panel toggles visibility via the hidden attribute,
// but author display rules (.fusion-head { display: flex }) override the UA's
// [hidden] rule — the panel then shows torn states (hint + stale head). The
// global [hidden] { display: none !important } base rule is the fix; this
// test pins it to the stylesheet actually shipped.
//
// Assertions read the stylesheet and the page shell through the structured
// seam in src/test-support/styles.ts (parsed rules, DOM-parsed shell) — not
// regex slices of the source text.
import { describe, it, expect } from 'vitest';
import { globalCss, rulesFor, shellDoc } from './test-support/styles';
import {
  expectHiddenBeatsAuthorDisplay,
  expectFusionListScrollbarPermanentAndSeparated,
  expectSlotHighlightsIdentical,
} from './test-support/pins';

describe('global stylesheet', () => {
  it('forces the hidden attribute to beat author display rules', () => {
    expectHiddenBeatsAuthorDisplay();
  });

  it('fusion list keeps the scrollbar visible and separated from the rows', () => {
    expectFusionListScrollbarPermanentAndSeparated();
  });

  it('GitHub repo link matches the theme toggle button sizing', () => {
    const css = globalCss();
    // the sizing props live in one shared rule for both controls; padding is
    // square (4px) — both buttons hold a single 16px glyph, no side text
    const shared = rulesFor(css, '#themeToggle').filter((r) => r.selectors.includes('.repo-link'));
    expect(shared, '#themeToggle and .repo-link share one rule').toHaveLength(1);
    expect(shared[0].decls.get('border-radius')).toBe('4px');
    expect(shared[0].decls.get('padding')).toBe('4px');
    // bug: the toggle's emoji glyph is not square, so the button tracked the
    // glyph and drifted away from .repo-link's 26×26 box — the box is pinned
    const toggle = rulesFor(css, '#themeToggle').find((r) => r.decls.has('width'))!;
    expect(toggle, 'a #themeToggle rule pins the box').toBeTruthy();
    expect(toggle.decls.get('width')).toBe('26px');
    expect(toggle.decls.get('height')).toBe('26px');
    // bug: .repo-link had a hover border effect the toggle lacked — the two
    // buttons are a visual pair, one glowing on hover read as inconsistent
    const hover = css.filter((r) => r.selectors.some((s) => s.startsWith('.repo-link') && s.includes(':hover')));
    expect(hover, '.repo-link has no hover rule').toHaveLength(0);
  });

  it('repo link sits in the header-right cluster, right of the theme toggle', () => {
    // placement is a DOM fact — pin it against the parsed page shell
    const cluster = shellDoc().querySelector('.header-right')!;
    expect(cluster).toBeTruthy();
    const toggle = cluster.querySelector('#themeToggle');
    const repo = cluster.querySelector('.repo-link');
    expect(toggle).toBeTruthy();
    expect(repo).toBeTruthy();
    // repo link follows the toggle in the cluster (DOCUMENT_POSITION_PRECEDING = 2 —
    // the node environment has no Node global)
    expect(repo!.compareDocumentPosition(toggle!) & 2).toBeTruthy();
  });

  it('top menu: title, separator, then Balls/Fusions/Passives/Characters/Plan with group separators', () => {
    // pins the requested menu order and the title↔button vertical alignment
    // (the h1's default heading line-height made it taller than .tab-btn)
    const doc = shellDoc();
    const nav = doc.querySelector('nav.tabs')!;
    expect(nav).toBeTruthy();
    const order = [...nav.querySelectorAll<HTMLElement>('[data-section]')].map((el) => el.dataset.section);
    expect(order).toEqual(['balls', 'fusions', 'passives', 'characters', 'plan']);
    // separators inside the nav split the four groups (Plan sits in its own
    // group behind a separator)…
    expect(nav.querySelectorAll('.tab-sep')).toHaveLength(3);
    // …and one more sits between the title and the nav
    expect(nav.previousElementSibling!.classList.contains('tab-sep')).toBe(true);
    expect(doc.querySelector('header h1')).toBeTruthy();
    const h1 = rulesFor(globalCss(), 'header h1');
    expect(h1.some((r) => r.decls.get('line-height') === '1.45'), 'header h1 pins line-height 1.45').toBe(true);
  });

  it('every section-view carries its own search box with a matching data-section', () => {
    // per-screen search is a shell contract: one .screen-search per
    // section-view, data-section naming that section (the island reads it —
    // a typo'd value silently kills that screen's search)
    const doc = shellDoc();
    const sections = ['balls', 'passives', 'characters', 'fusions'];
    for (const s of sections) {
      const view = doc.querySelector(`.section-view[data-section="${s}"]`);
      expect(view, `${s} view exists`).toBeTruthy();
      const input = view!.querySelectorAll<HTMLInputElement>('.screen-search');
      expect(input.length, `${s} view has a .screen-search`).toBe(1);
      expect(input[0].dataset.section, `${s} search box names its section`).toBe(s);
    }
  });

  it('both picked slots highlight identically (slot-2 was visually subtle)', () => {
    expectSlotHighlightsIdentical();
  });
});
