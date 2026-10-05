# Fusion observations — harvest corpus

Shared brief for research agents harvesting **fused-ball evidence** for the
Ball x Pit companion site. Read this file before writing anything.

Domain background: `../../../CONTEXT.md`, `../fusion-completeness.md`
(mechanics + why there is no fusion table), `../fusion-evidence-sources.md`
(source survey + the 105 pairs already found). Game-evolution fact base:
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
5. **Pin the game version when known** (`game_version`), else `"unknown"`.
   Recipes and effects move between builds (see the Bleed+Poison→Virus dispute).
6. **No asset downloads.** Record image/video URLs only. No pirated game files.

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

## Output

Each agent writes one `<source>.jsonl` file in this directory (one JSON object
per line, matching `schema.json`), plus a short summary of counts in its final
report. Validate before finishing:

```sh
node --experimental-strip-types scripts/harvest/validate-observations.ts
```

Do not write to `src/data/` (generated-only) or `scripts/` (the harvest scripts
are a separate step). Durable artifacts are the JSONL files in this directory.
