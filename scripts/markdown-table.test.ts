// The one markdown-table scanner, pinned directly (was: three copied loops in
// parse-wiki.ts with different error messages and separator handling).
import { describe, it, expect } from 'vitest';
import { parseMarkdownTable, column } from './markdown-table.ts';

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
  it('finds the first table by header and returns rows keyed by header cell', () => {
    expect(parseMarkdownTable(md, /^\| Ball \| Effect \|/)).toEqual([
      { Ball: 'Iron', Effect: 'Double damage' },
      { Ball: 'Wind', Effect: 'Slow' },
    ]);
  });

  it('reads a column by name, not position', () => {
    const shifted = ['| Ball | Effect | Notes |', '|---|---|---|', '| Iron | Double damage | inserted |'].join('\n');
    const [row] = parseMarkdownTable(shifted, /^\| Ball \| Effect \|/);
    expect(row['Effect']).toBe('Double damage');
    expect(row['Notes']).toBe('inserted');
  });

  it('reads a column by name after a reorder', () => {
    const reordered = ['| Ball | Notes | Effect |', '|---|---|---|', '| Iron | inserted | Double damage |'].join('\n');
    const [row] = parseMarkdownTable(reordered, /^\| Ball \| Notes \|/);
    expect(row['Effect']).toBe('Double damage');
  });

  it('stops at the first non-table line', () => {
    const rows = parseMarkdownTable(md, /^\| Ball \| Effect \|/);
    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.Ball)).not.toContain('x');
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

  it('accepts alignment separators', () => {
    const aligned = '| A | B |\n|:---|---:|\n| 1 | 2 |';
    expect(parseMarkdownTable(aligned, /^\| A \| B \|/)).toEqual([{ A: '1', B: '2' }]);
  });

  it('throws when the separator row is missing', () => {
    const missing = '| A | B |\n| 1 | 2 |';
    expect(() => parseMarkdownTable(missing, /^\| A \| B \|/, 't')).toThrow('missing separator after header: t');
  });

  it('trims pipes and cells, with or without a trailing pipe', () => {
    const noTrailing = '| A | B |\n|---|---|\n|  1 |  2';
    expect(parseMarkdownTable(noTrailing, /^\| A \| B \|/)).toEqual([{ A: '1', B: '2' }]);
  });

  it('accepts an indented body row instead of silently ending the table', () => {
    const indented = '| A | B |\n|---|---|\n  | 1 | 2 |\n| 3 | 4 |';
    expect(parseMarkdownTable(indented, /^\| A \| B \|/)).toEqual([
      { A: '1', B: '2' },
      { A: '3', B: '4' },
    ]);
  });

  it('handles CRLF line endings', () => {
    const crlf = '| A | B |\r\n|---|---|\r\n| 1 | 2 |\r\n';
    expect(parseMarkdownTable(crlf, /^\| A \| B \|/)).toEqual([{ A: '1', B: '2' }]);
  });

  it('throws on an empty header cell', () => {
    const empty = '| A |  |\n|---|---|\n| 1 | 2 |';
    expect(() => parseMarkdownTable(empty, /^\| A \|  \|/, 't')).toThrow('empty header cell: t');
  });

  it('throws on duplicate header cells', () => {
    const dup = '| A | A |\n|---|---|\n| 1 | 2 |';
    expect(() => parseMarkdownTable(dup, /^\| A \| A \|/, 't')).toThrow('duplicate header cell "A": t');
  });

  it('throws on a row whose cell count differs from the header', () => {
    const ragged = '| A | B |\n|---|---|\n| 1 |';
    expect(() => parseMarkdownTable(ragged, /^\| A \| B \|/, 't')).toThrow('row/header cell mismatch (1 vs 2): t');
  });

  it('column() fails loudly when the named column is gone', () => {
    const [row] = parseMarkdownTable(md, /^\| Ball \| Effect \|/);
    expect(column(row, 'Ball')).toBe('Iron');
    expect(() => column(row, 'Effect text (wiki)')).toThrow('missing column "Effect text (wiki)"');
  });
});
