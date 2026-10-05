// Validate fusion-observation harvest files against the schema contract.
// Occasional refresh tool — not part of the data pipeline (AGENTS.md).
//
// Usage (repo root):
//   node --experimental-strip-types scripts/harvest/validate-observations.ts
//
// Checks, per line of each docs/research/fusion-observations/*.jsonl file:
//   - parses as JSON
//   - matches schema.json (required fields, enums, shapes)
//   - pair ids exist in src/data/balls.ts
//   - aliases.json values are real ball ids
//   - pair is sorted alphabetically
//   - confidence "rule-derived" is discouraged in harvest files (warns)

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const obsDir = join(root, "docs/research/fusion-observations");

const KINDS = ["effect-text", "behavior-claim", "composition-rule", "screenshot", "name-only"];
const CLAIM_TYPES = ["cross-wire", "no-cross-wire", "priority", "bug", "order", "other"];
const SOURCE_TYPES = ["reddit", "steam", "youtube", "namu", "wiki", "bilibili", "discord-repost", "playtest", "other"];
const CONFIDENCES = ["observed", "reported", "contradicted", "rule-derived"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Ball ids from the catalog (generated file, read not imported — no .ts import
// machinery needed for a script).
const ballsSrc = readFileSync(join(root, "src/data/balls.ts"), "utf8");
const ballIds = new Set([...ballsSrc.matchAll(/"id": "([^"]+)"/g)].map((m) => m[1]));

const aliases = JSON.parse(readFileSync(join(obsDir, "aliases.json"), "utf8"));
for (const [alias, id] of Object.entries(aliases.aliases)) {
  if (!ballIds.has(id)) {
    console.error(`aliases.json: alias "${alias}" → unknown ball id "${id}"`);
    process.exitCode = 1;
  }
}
for (const id of Object.keys(aliases.canonical)) {
  if (!ballIds.has(id)) {
    console.error(`aliases.json: canonical key "${id}" is not a ball id`);
    process.exitCode = 1;
  }
}

const only = process.argv[2];
const files = readdirSync(obsDir)
  .filter((f) => f.endsWith(".jsonl"))
  .filter((f) => (only ? f === only || f === `${only}.jsonl` : true));
let total = 0;
let errors = 0;
const pairCounts = new Map<string, number>();

function err(file: string, lineNo: number, msg: string) {
  console.error(`${file}:${lineNo}: ${msg}`);
  errors++;
  process.exitCode = 1;
}

for (const file of files) {
  const lines = readFileSync(join(obsDir, file), "utf8").split("\n");
  lines.forEach((line, i) => {
    const lineNo = i + 1;
    if (!line.trim()) return;
    total++;
    let obs: any;
    try {
      obs = JSON.parse(line);
    } catch {
      err(file, lineNo, "not valid JSON");
      return;
    }

    if (!Array.isArray(obs.pair) || obs.pair.length !== 2) {
      if (obs.kind === "composition-rule") {
        // Global rules may omit pair (schema.json: required only for other kinds).
      } else {
        err(file, lineNo, "pair must be exactly 2 ids");
      }
    } else {
      for (const id of obs.pair) {
        if (!ballIds.has(id)) err(file, lineNo, `pair id "${id}" not in catalog`);
      }
      const sorted = [...obs.pair].sort();
      if (obs.pair[0] !== sorted[0] || obs.pair[1] !== sorted[1]) {
        err(file, lineNo, `pair not sorted alphabetically: ${obs.pair.join(", ")}`);
      }
      if (obs.pair[0] === obs.pair[1]) err(file, lineNo, "pair cannot fuse a ball with itself");
      const key = sorted.join("+");
      pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
    }

    if (!KINDS.includes(obs.kind)) err(file, lineNo, `bad kind: ${obs.kind}`);
    if (typeof obs.text !== "string" || !obs.text.length) err(file, lineNo, "text must be a non-empty string");
    if (!CONFIDENCES.includes(obs.confidence)) err(file, lineNo, `bad confidence: ${obs.confidence}`);
    if (obs.confidence === "rule-derived") {
      console.warn(`${file}:${lineNo}: warn — confidence "rule-derived" is for Phase 2, rare in harvest files`);
    }

    const src = obs.source;
    if (!src || typeof src !== "object") {
      err(file, lineNo, "source missing");
    } else {
      if (!SOURCE_TYPES.includes(src.type)) err(file, lineNo, `bad source.type: ${src.type}`);
      if (typeof src.url !== "string" || src.url.length < 8) err(file, lineNo, "source.url missing/short");
      if (!DATE_RE.test(src.date ?? "")) err(file, lineNo, "source.date must be YYYY-MM-DD");
      if (src.access_date !== undefined && !DATE_RE.test(src.access_date)) err(file, lineNo, "source.access_date must be YYYY-MM-DD");
    }

    if (obs.kind === "behavior-claim") {
      const claims = obs.claims;
      if (!Array.isArray(claims) || !claims.length) {
        err(file, lineNo, "behavior-claim must carry at least one claim");
      } else {
        for (const c of claims) {
          if (!CLAIM_TYPES.includes(c?.type)) err(file, lineNo, `bad claim.type: ${c?.type}`);
          if (typeof c?.detail !== "string" || !c.detail.length) err(file, lineNo, "claim.detail must be non-empty");
        }
      }
    }

    if (obs.order_as_named !== undefined) {
      if (!Array.isArray(obs.order_as_named) || obs.order_as_named.length !== 2) {
        err(file, lineNo, "order_as_named must be 2 names");
      }
    }
    if (obs.game_version !== undefined && typeof obs.game_version !== "string") {
      err(file, lineNo, "game_version must be a string");
    }
    if (obs.in_game_name !== undefined && typeof obs.in_game_name !== "string") {
      err(file, lineNo, "in_game_name must be a string");
    }
  });
}

console.log(`${total} observations across ${files.length} file(s), ${pairCounts.size} distinct pairs`);
if (errors) console.error(`${errors} error(s)`);
else console.log("OK");
