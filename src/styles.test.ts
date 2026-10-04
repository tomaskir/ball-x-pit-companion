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
    expect(block).toContain('scrollbar-width: stable');
    expect(block).toContain('padding-right: 8px');
  });
});
