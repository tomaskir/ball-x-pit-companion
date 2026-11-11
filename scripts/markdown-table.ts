// The one markdown-table scanner used by every fact-base parser. It was
// copied three times in parse-wiki.ts (game mechanics, pairings, level-3);
// the copies differed only in their error text, so the scanner lives here
// now and the parsers only say which header they want.
//
// Rows are keyed by the table's own header cells: a parser names the columns
// it reads, so a column inserted or reordered after the matched header prefix
// cannot shift values underneath it. The scanner owns header parsing,
// separator detection, and pipe trimming.
//
// Escaped pipes (`\|`) are not supported — no fact base uses them.

/** One body row, keyed by the table's header cells. */
export type TableRow = Readonly<Partial<Record<string, string>>>;

/** Strip the outer pipes and trim each cell. A missing trailing pipe is tolerated. */
function splitRow(line: string): string[] {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|')) throw new Error(`not a table row: ${line}`);
  const inner = trimmed.endsWith('|') ? trimmed.slice(1, -1) : trimmed.slice(1);
  return inner.split('|').map((cell) => cell.trim());
}

/** A separator row: pipes, dashes, alignment colons, and whitespace only. */
function isSeparator(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.includes('-') && /^\|?[\s:|-]+\|?$/.test(trimmed);
}

/**
 * Find the first table whose header line matches `headerRe`, parse its
 * header, skip the separator row, and return the body rows keyed by header
 * cell. Stops at the first non-table line.
 *
 * Throws when no matching header exists, when a header cell is empty or
 * duplicated, when the separator row is missing, or when a body row's cell
 * count differs from the header's — a ragged row is a content error, not a
 * value to guess at.
 */
export function parseMarkdownTable(md: string, headerRe: RegExp, label = String(headerRe)): TableRow[] {
  const lines = md.split('\n');
  let idx = 0;
  while (idx < lines.length && !headerRe.test(lines[idx])) idx++;
  if (idx === lines.length) throw new Error(`table not found: ${label}`);

  const columns = splitRow(lines[idx]);
  const seen = new Set<string>();
  for (const header of columns) {
    if (header === '') throw new Error(`empty header cell: ${label}`);
    if (seen.has(header)) throw new Error(`duplicate header cell "${header}": ${label}`);
    seen.add(header);
  }

  idx++;
  if (idx === lines.length || !isSeparator(lines[idx])) throw new Error(`missing separator after header: ${label}`);
  idx++;

  const rows: TableRow[] = [];
  for (; idx < lines.length; idx++) {
    const line = lines[idx];
    if (!line.trimStart().startsWith('|')) break;
    const cells = splitRow(line);
    if (cells.length !== columns.length) {
      throw new Error(`row/header cell mismatch (${cells.length} vs ${columns.length}): ${label}`);
    }
    rows.push(Object.fromEntries(columns.map((header, i) => [header, cells[i]])));
  }
  return rows;
}

/** Read one named column, failing loudly when the header no longer has it. */
export function column(row: TableRow, name: string): string {
  const value = row[name];
  if (value === undefined) throw new Error(`missing column "${name}" (have: ${Object.keys(row).join(', ')})`);
  return value;
}
