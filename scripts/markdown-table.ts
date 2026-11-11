// The one markdown-table scanner used by every fact-base parser. It was
// copied three times in parse-wiki.ts (game mechanics, pairings, level-3);
// the copies differed only in their error text, so the scanner lives here
// now and the parsers only say which header they want.

/**
 * Find the first table whose header line matches `headerRe`, skip the header
 * and separator rows, and return the body rows as trimmed cell arrays. Stops
 * at the first non-table line. Throws when no matching header exists.
 */
export function parseMarkdownTable(md: string, headerRe: RegExp, label = String(headerRe)): string[][] {
  const lines = md.split('\n');
  let idx = 0;
  while (idx < lines.length && !headerRe.test(lines[idx])) idx++;
  if (idx === lines.length) throw new Error(`table not found: ${label}`);
  idx += 2; // skip header + separator
  const rows: string[][] = [];
  for (; idx < lines.length; idx++) {
    const line = lines[idx];
    if (!line.startsWith('|')) break;
    rows.push(line.split('|').slice(1, -1).map((c) => c.trim()));
  }
  return rows;
}
