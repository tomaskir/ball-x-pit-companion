# Pending observations — DLC staging

Rows here name ball ids that are **not yet in the catalog**
(`src/data/balls.ts`), so they cannot pass the schema gate. The validator
skips this directory; `npm test` stays green.

Stage a wave as `pending/<wave>.jsonl` (same schema as a top-level wave file,
one JSON object per line). Do not add curated-layer entries for staged pairs.

Promotion is mechanical once the catalog includes the ids:

1. Add the community names to `../aliases.json` and re-run the data pipeline
   so the ids exist in `src/data/balls.ts`.
2. Move the file to the top level as `<source>-<wave>.jsonl` (one file per
   source; split the staged rows if a file mixes sources).
3. Re-run `node --experimental-strip-types scripts/harvest/validate-observations.ts`
   and `npm test`; both must pass before the wave enters the curated layer.

The raw layer is append-only: promotion moves rows, it does not edit them.
