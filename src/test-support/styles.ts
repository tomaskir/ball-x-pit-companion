// Test support: structured access to the shipped stylesheet and the page
// shell. styles.test.ts and the regression aliases consume this instead of
// regexing source text — CSS rules are parsed into selector → declarations
// maps (robust to nested braces, comments containing `}`, and selector
// order), and index.astro is parsed with a real DOM parser (jsdom), so tests
// assert rules and elements, not source slices. Read-only: nothing here is
// imported by production code.
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

/** One parsed CSS rule. `media` is the enclosing at-rule prelude (null at
 *  the top level); the mobile overrides live under their @media prelude, the
 *  base rules under null — queries disambiguate the same way the cascade
 *  does. */
export interface CssRule {
  selectors: string[]; // the comma-split selector list, whitespace-collapsed
  decls: Map<string, string>; // property → value (`!important` kept in the value)
  media: string | null;
}

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Split on `sep` at paren/bracket depth 0 (selectors like `:not([data-theme])`
 *  and values like `minmax(160px, 1fr)` must not split). */
function splitTopLevel(text: string, sep: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of text) {
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    if (ch === sep && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts;
}

function parseDecls(body: string): Map<string, string> {
  const decls = new Map<string, string>();
  for (const part of splitTopLevel(body, ';')) {
    const i = part.indexOf(':');
    if (i === -1) continue;
    const prop = part.slice(0, i).trim().toLowerCase();
    const value = part.slice(i + 1).replace(/\s+/g, ' ').trim();
    if (prop) decls.set(prop, value);
  }
  return decls;
}

function parseBlock(text: string, media: string | null, out: CssRule[]): void {
  let i = 0;
  while (i < text.length) {
    const open = text.indexOf('{', i);
    if (open === -1) break;
    const prelude = text.slice(i, open).replace(/\s+/g, ' ').trim();
    let depth = 1;
    let j = open + 1;
    while (j < text.length && depth > 0) {
      if (text[j] === '{') depth++;
      else if (text[j] === '}') depth--;
      j++;
    }
    const body = text.slice(open + 1, j - 1);
    if (prelude.startsWith('@media')) {
      parseBlock(body, prelude, out); // flatten: inner rules keep their own selectors
    } else if (prelude.startsWith('@')) {
      // other at-rules (@keyframes, @font-face, …) — none carry pins
    } else {
      const selectors = splitTopLevel(prelude, ',')
        .map((s) => s.replace(/\s+/g, ' ').trim())
        .filter(Boolean);
      if (selectors.length) out.push({ selectors, decls: parseDecls(body), media });
    }
    i = j;
  }
}

/** Parse a stylesheet's text into its rule list (source order; @media inner
 *  rules flattened with their prelude recorded on `media`). */
export function parseCss(cssText: string): CssRule[] {
  const out: CssRule[] = [];
  parseBlock(stripComments(cssText), null, out);
  return out;
}

let stylesheet: CssRule[] | null = null;
/** The shipped stylesheet's rules. Path is repo-relative — the repo root is
 *  the process CWD both locally and in CI (`vitest run` from the root). */
export function globalCss(): CssRule[] {
  if (!stylesheet) stylesheet = parseCss(readFileSync('src/styles/global.css', 'utf8'));
  return stylesheet;
}

/** Every rule whose selector list contains exactly `selector`. Filters to
 *  top-level rules unless a media prelude is given — the base rule and its
 *  mobile override are different cascade entries. */
export function rulesFor(rules: CssRule[], selector: string, media: string | null = null): CssRule[] {
  return rules.filter((r) => r.media === media && r.selectors.includes(selector));
}

let shell: Document | null = null;
/** index.astro's shell parsed as a DOM document (frontmatter stripped — it is
 *  build-time TypeScript, not markup). */
export function shellDoc(): Document {
  if (!shell) {
    const astro = readFileSync('src/pages/index.astro', 'utf8').replace(/^---[\s\S]*?---/, '');
    shell = new JSDOM(astro).window.document;
  }
  return shell;
}
