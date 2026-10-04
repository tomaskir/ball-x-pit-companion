// Regression tests for the renderer's DOM contracts that pure view-model
// tests cannot see. The fusion-panel bug (see regression.test.ts) lived in
// the buildFusionPanel skeleton: nth-of-type selectors that matched nothing,
// silently leaving the panel frozen. These tests parse the renderer's own
// skeleton against the selectors it queries — no browser needed.
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** The skeleton HTML from buildFusionPanel — kept in sync by extracting it
 *  from the source (a drift here is exactly the bug class being pinned). */
function skeletonHtml(): string {
  // Under the jsdom environment import.meta.url is an http URL (jsdom's URL
  // global wins), so join the repo-relative path from the process CWD — the
  // repo root, both locally and in CI (`vitest run` from the repo root).
  const src = readFileSync('src/renderer.ts', 'utf8');
  const m = src.match(/root\.innerHTML = `([\s\S]*?)`;/);
  if (!m) throw new Error('buildFusionPanel skeleton not found in renderer.ts');
  return m[1];
}

describe('fusion panel skeleton (renderer.ts)', () => {
  it('every selector buildFusionPanel queries resolves in its own skeleton', () => {
    const root = document.createElement('div');
    root.innerHTML = skeletonHtml();
    const q = (s: string) => root.querySelector(s);
    // the exact selector list from buildFusionPanel
    const selectors = [
      '.fusion-hint', '.fusion-head',
      '.icon-a', '.name-a', '.fusion-times', '.icon-b', '.name-b',
      '.fusion-evo', '.eff-a', '.eff-b', '.fusion-cross', '.fusion-notes',
    ];
    const missing = selectors.filter((s) => !q(s));
    expect(missing, `selectors matching nothing: ${missing.join(', ')}`).toEqual([]);
  });

  it('the two head icons are real <img> elements (never-recreate invariant)', () => {
    const root = document.createElement('div');
    root.innerHTML = skeletonHtml();
    expect(root.querySelectorAll('.fusion-head img')).toHaveLength(2);
    expect(root.querySelector<HTMLImageElement>('.icon-a')!.tagName).toBe('IMG');
    expect(root.querySelector<HTMLImageElement>('.icon-b')!.tagName).toBe('IMG');
  });
});
