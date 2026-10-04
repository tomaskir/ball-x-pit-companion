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
    // rows keep clearance from the scrollbar gutter (Firefox hover-expansion)
    expect(css).toMatch(/\.fusion-list > \.fusion-row\s*\{[^}]*margin-right: 6px/);
  });

  it('both picked slots highlight identically (slot-2 was visually subtle)', () => {
    const css = readFileSync('src/styles/global.css', 'utf8');
    const merged = css.match(/\.fusion-row\.slot-1,\s*\.fusion-row\.slot-2\s*\{[^}]*\}/);
    expect(merged, 'slot-1 and slot-2 share one highlight rule').not.toBeNull();
    expect(merged![0]).toContain('border-color: var(--gold)');
    expect(merged![0]).toContain('box-shadow: 0 0 6px var(--glow)');
  });
});
