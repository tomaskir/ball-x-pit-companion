// Validate fusion-observation harvest files against the schema contract.
// Occasional refresh tool — not part of the data pipeline (AGENTS.md) — but
// the schema checks also run as a vitest gate (src/corpus-schema.test.ts):
// corpus schema rot fails `npm test` instead of waiting for the next manual
// refresh. The checks live in src/corpus.ts (the corpus module); this file's
// CLI is a thin wrapper that prints the findings and sets the exit code.
//
// Usage (repo root):
//   node --experimental-strip-types scripts/harvest/validate-observations.ts
//
// Checks, per line of each top-level docs/research/fusion-observations/*.jsonl
// wave file (the pending/ staging directory is skipped):
//   - parses as JSON
//   - matches schema.json (required fields, enums, shapes)
//   - pair ids exist in the catalog (src/catalog.ts)
//   - aliases.json values are real ball ids
//   - pair is sorted alphabetically
//   - confidence "rule-derived" is discouraged in harvest files (warns)
// The curated fusion-pairs.json layer is checked for shape as well.

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateCorpus } from "../../src/corpus.ts";

function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
  const findings = validateCorpus(root);
  const errors = findings.filter((f) => !f.warning);
  for (const f of findings) {
    const at = f.line === undefined ? f.file : `${f.file}:${f.line}`;
    (f.warning ? console.warn : console.error)(`${at}: ${f.message}`);
  }
  console.log(`${errors.length ? `${errors.length} error(s)` : "OK"}`);
  if (errors.length) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) main();
