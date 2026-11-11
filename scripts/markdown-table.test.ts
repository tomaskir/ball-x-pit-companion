// The one markdown-table scanner, pinned directly (was: three copied loops in
// parse-wiki.ts with different error messages and separator handling).
import { describe, it, expect } from 'vitest';
import { parseMarkdownTable } from './markdown-table.ts';

const md = [
  '# Doc',
  '',
  'Some prose.',
  '',
  '| Ball | Effect |',
  '|---|---|',
  '| Iron | Double damage |',
  '|  Wind  |  Slow  |',
  '',
  '| Other | Table |',
  '|---|---|',
  '| x | y |',
].join('\n');

describe('parseMarkdownTable', () => {
  it('finds the first table by header and returns trimmed body cells', () => {
    expect(parseMarkdownTable(md, /^\| Ball \| Effect \|/)).toEqual([
      ['Iron', 'Double damage'],
      ['Wind', 'Slow'],
    ]);
  });

  it('stops at the first non-table line', () => {
    const rows = parseMarkdownTable(md, /^\| Ball \| Effect \|/);
    expect(rows).toHaveLength(2);
    expect(rows.flat()).not.toContain('x');
  });

  it('throws when the header is absent', () => {
    expect(() => parseMarkdownTable(md, /^\| Nope \|/)).toThrow('table not found');
  });

  it('uses the custom label in the error', () => {
    expect(() => parseMarkdownTable(md, /^\| Nope \|/, 'pairing table')).toThrow('table not found: pairing table');
  });

  it('returns an empty body when the table has no rows', () => {
    const empty = '| A | B |\n|---|---|\n\n';
    expect(parseMarkdownTable(empty, /^\| A \| B \|/)).toEqual([]);
  });
});
