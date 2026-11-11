# Fusion observations — harvest corpus

Shared brief for research agents harvesting **fused-ball evidence** for the
Ball x Pit companion site. Read this file before writing anything.

Domain background: `../../../CONTEXT.md`, `../fusion-mechanics.md` (fusion
mechanics distilled: why there is no fusion table, composition rules, order
verdict, and the source survey behind it). Game-evolution fact base:
`../game-mechanics.md`.

## What we are collecting

A fused ball = two unfused level-3 balls merged in the Fusion Reactor, named
"A X B", no unique identity. There is **no fusion table in the game** — the
game composes the two components at runtime. So we collect **observations**:
anything any source says about any pair.

Observation kinds (see `schema.json`):

- `effect-text` — the fused ball's in-game tooltip / effect description, verbatim.
- `behavior-claim` — a source's claim about how the fusion behaves (cross-wires,
  doesn't, priority, bug).
- `composition-rule` — a stated rule about how effects combine in general.
- `screenshot` — a fused-ball image URL (existence/appearance evidence; do not
  download images).
- `name-only` — the pair was named in play context (existence evidence only).

One observation = one source saying one thing about one pair. Do not dedupe
across sources; consolidation happens later.

## The contract

1. **Verbatim quotes.** `text` is exactly what the source says (tooltip text,
   post wording, rule wording). Never paraphrase a quote. Put your own summary
   in `claims[].detail` if needed.
2. **Every claim keeps its URL and date.** An observation without `source` is
   worthless. If a claim is second-hand (a comment quoting Discord, say), the
   `source` is the page you found it on and `confidence` is `reported`.
3. **Contradictions are records, not errors.** If sources disagree (order
   matters vs doesn't), write both observations. Do not resolve conflicts.
4. **Normalize names through `aliases.json`.** Community posts say "Hemo",
   "Nuke", "Dracula". The pair's canonical ids must be real catalog ids; the
   raw wording goes in `in_game_name` / `order_as_named`.
5. **Tag the game version.** Every new observation sets `game_version` to the
   build it describes; `"unknown"` is reserved for genuinely unknown builds,
   not a skip-default. Recipes and effects move between builds (see the
   Bleed+Poison→Virus dispute).
6. **No asset downloads.** Record image/video URLs only. No pirated game files.
7. **Dated per-source wave files.** Each harvest wave writes
   `<source>-<YYYY-MM-DD>.jsonl` at the top level of this directory, where the
   date is the harvest access date (the wave date). Per-source files keep
   parallel agents from colliding. The original undated files
   (`reddit.jsonl`, `steam.jsonl`, …) are the **2026-10-04** wave and stay
   untouched; existing citations such as `english.jsonl:86` remain valid.
8. **The raw layer is append-only.** Existing `.jsonl` files are never edited.
   A correction is a new observation in a later wave plus a
   `CONTRADICTIONS.md` entry; supersession happens only in the curated layer.
   This includes disclosed mistakes (the `english.jsonl:86` attribution
   splice stays as-is).
9. **Exact duplicates are suppressed within a wave.** If `source.url`, `text`
   and `source.date` are identical to a row already in the same wave, do not
   file it again. Cross-source duplicates are kept — do not dedupe across
   sources or across waves.
10. **Uncataloged balls go to `pending/`.** Rows naming ids that are not yet
    in `src/data/balls.ts` (DLC additions) are staged in `pending/<wave>.jsonl`.
    The schema gate skips `pending/`, so `npm test` stays green. Promotion is
    mechanical once the catalog includes the ids: add the aliases, move the
    file to `<source>-<wave>.jsonl` at the top level, and re-run the gate. No
    curated-layer entries until promoted.

## Rule hypotheses — test every behavior claim against these

These are the leading composition rules; a claim that confirms or contradicts
them is worth more than a bare name. Mark agreement/disagreement in
`claims[].detail` where relevant.

1. **Status-vs-spawn (icemage_999, Reddit thread 1ulsapv):** a partner's
   *on-hit status effect* fires from the fused ball's other hits; effects bound
   to *spawned sub-entities* (icicles, spikes, babies) do not. Predicts:
   Overgrowth X Flash cross-wires, Flicker X Radiation Beam cross-wires,
   Flash X Glacier does not. All three playtest-confirmed by the site author.
2. **Order (PSA threads 1ouhlp1, 1p5pil0):** fusion order does not affect
   function — name and sprite only. Exception: same-property pairs resolve by
   order (first-selected ball's version wins). Sourced from the official
   Discord via repost.
3. **Trigger matrix (wiki.gg Fusion Mechanics + namu.wiki):** combination
   semantics depend on trigger types (On-Hit / On-Damage / On-Timer ×
   Spawn / AOE / Status). namu.wiki has the most granular statement (7 rules);
   page is Cloudflare-blocked — quote only what you can actually retrieve.

## Source-specific notes (from the prior survey — don't rediscover these)

- **Reddit:** www.reddit.com is blocked; use Arctic Shift
  (`https://arctic-shift.photon-reddit.com/api/...`). Heavily rate-limited —
  multi-minute cooldowns between calls. PullPush works but cuts off bulk use.
- **Steam:** community pages are open HTML; screenshot search is per-query —
  sweep the ~25 meta ball names + "fusion" + "x", not all 90×2.
- **YouTube:** descriptions/chapters name pairs; `ytInitialData` parses. No
  video downloads. Transcripts via timedtext are optional depth.
- **namu.wiki:** Cloudflare-blocked for direct fetch; search snippets or a
  browser session are the only routes. Quote faithfully if retrieved.
- **Fandom mirror:** scrape blocked from this network.

## Curated layer (`fusion-pairs.json`)

`fusion-pairs.json` is a per-wave snapshot: `generated` is the wave date and
`claims` is the current best reading. Each pair also carries a `superseded`
array recording claims a later wave dropped:

```json
"superseded": [
  { "claim": "<the dropped reading>", "source": "<URL or file:line>", "superseded_by": "YYYY-MM-DD" }
]
```

`superseded_by` is the wave date that replaced the claim. The array is empty
for the current 2026-10-04 wave. Raw rows are never removed; supersession is
recorded only here, so the audit stays machine-readable in the consumed layer.
`CONTRADICTIONS.md` keeps one dated section per wave.

## Output

Each agent writes one `<source>-<YYYY-MM-DD>.jsonl` file in this directory (one
JSON object per line, matching `schema.json`), plus a short summary of counts
in its final report. Validate before finishing:

```sh
node --experimental-strip-types scripts/harvest/validate-observations.ts
```

Do not write to `src/data/` (generated-only) or `scripts/` (the harvest scripts
are a separate step). Durable artifacts are the JSONL files in this directory.
