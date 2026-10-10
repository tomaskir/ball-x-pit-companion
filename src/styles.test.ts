// Regression: the fusion panel toggles visibility via the hidden attribute,
// but author display rules (.fusion-head { display: flex }) override the UA's
// [hidden] rule — the panel then shows torn states (hint + stale head). The
// global [hidden] { display: none !important } base rule is the fix; this
// test pins it to the stylesheet actually shipped.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('global stylesheet', () => {
  it('forces the hidden attribute to beat author display rules', () => {
    const css = readFileSync('src/styles/global.css', 'utf8');
    expect(css).toMatch(/\[hidden\]\s*\{\s*display:\s*none\s*!important/);
  });

  it('fusion list keeps the scrollbar visible and separated from the rows', () => {
    const css = readFileSync('src/styles/global.css', 'utf8');
    const block = css.match(/\.fusion-list\s*\{[^}]*\}/)![0];
    expect(block).toContain('overflow-y: scroll');
    // `thin` — the custom-rendered Firefox scrollbar has a fixed size and
    // never expands on hover (the classic `auto` scrollbar does, overlapping
    // the row borders). `stable` is not a valid scrollbar-width value.
    expect(block).toContain('scrollbar-width: thin');
    expect(block).toContain('padding-right: 12px');
    // the list must never push the page past the viewport (was a whole-page
    // scroll: max-height was 100vh-140px against a ~190px chrome+footer; the
    // per-screen search box above the list adds ~42px — 100vh-232px)
    expect(block).toContain('max-height: calc(100vh - 232px)');
    // rows keep clearance from the scrollbar gutter (Firefox hover-expansion)
    expect(css).toMatch(/\.fusion-list > \.fusion-row\s*\{[^}]*margin-right: 6px/);
  });

  it('GitHub repo link matches the theme toggle button sizing', () => {
    const css = readFileSync('src/styles/global.css', 'utf8');
    // the sizing props live in one shared rule for both controls; padding is
    // square (4px) — both buttons hold a single 16px glyph, no side text
    const shared = css.match(/#themeToggle,\s*\n\.repo-link\s*\{[^}]*\}/)![0];
    for (const prop of ['border-radius: 4px', 'padding: 4px;']) {
      expect(shared, `shared rule has ${prop}`).toContain(prop);
    }
    // bug: the toggle's emoji glyph is not square, so the button tracked the
    // glyph and drifted away from .repo-link's 26×26 box — the box is pinned
    const toggle = css.match(/#themeToggle\s*\{[^}]*\}/)![0];
    for (const prop of ['width: 26px', 'height: 26px']) {
      expect(toggle, `theme toggle pins ${prop}`).toContain(prop);
    }
    // bug: .repo-link had a hover border effect the toggle lacked — the two
    // buttons are a visual pair, one glowing on hover read as inconsistent
    expect(css).not.toMatch(/\.repo-link:hover/);
  });

  it('repo link sits in the header-right cluster, right of the theme toggle', () => {
    // placement is a DOM fact — pin it against the page shell, not the CSS
    const html = readFileSync('src/pages/index.astro', 'utf8');
    const cluster = html.match(/<div class="header-right">[\s\S]*?<\/div>/)![0];
    const toggleAt = cluster.indexOf('id="themeToggle"');
    const repoAt = cluster.indexOf('class="repo-link"');
    expect(toggleAt).toBeGreaterThan(-1);
    expect(repoAt).toBeGreaterThan(toggleAt);
  });

  it('top menu: title, separator, then Balls/Fusions/Passives/Characters/Plan with group separators', () => {
    // pins the requested menu order and the title↔button vertical alignment
    // (the h1's default heading line-height made it taller than .tab-btn)
    const html = readFileSync('src/pages/index.astro', 'utf8');
    const nav = html.match(/<nav class="tabs"[\s\S]*?<\/nav>/)![0];
    const order = [...nav.matchAll(/data-section="(\w+)"/g)].map((m) => m[1]);
    expect(order).toEqual(['balls', 'fusions', 'passives', 'characters', 'plan']);
    // separators inside the nav split the four groups (Plan sits in its own
    // group behind a separator)…
    expect(nav.match(/tab-sep/g)!.length).toBe(3);
    // …and one more sits between the title and the nav
    const titleEnd = html.indexOf('</h1>');
    const navStart = html.indexOf('<nav class="tabs"');
    expect(html.slice(titleEnd, navStart)).toContain('tab-sep');
    const css = readFileSync('src/styles/global.css', 'utf8');
    expect(css).toMatch(/header h1\s*\{[^}]*line-height:\s*1\.45/);
  });

  it('every section-view carries its own search box with a matching data-section', () => {
    // per-screen search is a shell contract: one .screen-search per
    // section-view, data-section naming that section (the island reads it —
    // a typo'd value silently kills that screen's search)
    const html = readFileSync('src/pages/index.astro', 'utf8');
    const sections = ['balls', 'passives', 'characters', 'fusions'];
    for (const s of sections) {
      const view = html.match(new RegExp(`<div class="section-view"[^>]*data-section="${s}"[\\s\\S]*?(?=<div class="section-view"|</main>)`))![0];
      const input = view.match(/<input class="screen-search" data-section="([a-z]+)"/);
      expect(input, `${s} view has a .screen-search`).not.toBeNull();
      expect(input![1], `${s} search box names its section`).toBe(s);
    }
  });

  it('both picked slots highlight identically (slot-2 was visually subtle)', () => {
    const css = readFileSync('src/styles/global.css', 'utf8');
    const merged = css.match(/\.fusion-row\.slot-1,\s*\.fusion-row\.slot-2\s*\{[^}]*\}/);
    expect(merged, 'slot-1 and slot-2 share one highlight rule').not.toBeNull();
    expect(merged![0]).toContain('border-color: var(--gold)');
    expect(merged![0]).toContain('box-shadow: 0 0 6px var(--glow)');
  });
});
