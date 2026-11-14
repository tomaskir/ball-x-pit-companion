# Ball x Pit Companion

**🔗 Live site: [tomaskir.github.io/ball-x-pit-companion](https://tomaskir.github.io/ball-x-pit-companion/)**

A fan-made companion for **BALL x PIT**, the breakout-style survival roguelite by
Kenny Sun and Friends (Devolver Digital, October 2025). It maps every ball
evolution recipe from the Fusion Reactor as a searchable graph, with per-character
synergy verdicts, as a static site that works offline.

## What it does

- **All 115 balls**: 25 base balls, Baby Ball, and 89 evolved balls (75
  level-2 + 14 tier-3) from the Fusion Reactor, grouped Basic / Evolved /
  Tier-3. Every tile shows its fusion recipe inline in compact notation
  (`Iron + (Ghost/Dark)`).
- **Evolution chains, not just pair lookups.** Click any ball to highlight its
  whole recipe graph at once: components, alternate recipes, and everything it
  can evolve into, multi-step chains included (e.g. Burn → Sun → Black Hole).
- **All 116 passives**: 77 base + 39 evolved, with their evolution recipes.
- **Character synergy checker.** Pick up to 2 of the 31 characters and every
  ball/passive gets a red/green verdict from tag overlap, with an explanation
  on hover. Red wins when two characters disagree, so clashes surface first
  (e.g. The Empty Nester and The Makeshift Sisyphus have no baby balls →
  everything that spawns or scales with them goes red).
- **Character reference**: all 31 characters with base ball and quirk text.
- **Plan screen**: build a run loadout of characters, balls, passives, and
  fused pairs against the game's slot limits (with the End game upgrades
  toggle and per-character quirks), see per-entry synergy verdicts and
  over-limit marks, and get a build graph of every component to farm. Share a
  plan as a link.
- **Base / expansion content filter.** Two checkboxes per screen (one per
  edition, base-game on by default) hide expansion content across the Balls,
  Passives, Fusions, Characters, and Plan screens. Hidden content is dropped,
  not dimmed, and a header notice reports what a toggle removed.
- **Fusions screen**: pick any two unfused level-3 balls and see the composed
  fused ball — merged effect text, cross-wire interactions (e.g. a spawn,
  AOE, or field carrier delivering the partner's on-hit status), order
  side-effects, and caveats. The game has no fusion table, so composition
  follows community-observed rules validated against a 370-pair evidence
  corpus; this is the site's editorial model, not game data (see
  [`docs/research/fusion-mechanics.md`](docs/research/fusion-mechanics.md)).
- **Search per screen** by name or effect text. Selections survive switching
  between screens. Dark and light themes. No backend, no tracking. One static
  page.

## Data

Base-game data was transcribed from [ballxpit.wiki.gg](https://ballxpit.wiki.gg)
on 2026-09-13 (game v1.301, *Naturalist* update) and cross-checked against the
community "Ultimate Guide of Evolutions" charts; both sources agree. The
*Risen Ballbylon* expansion rows (24 balls, 45 passives, 8 characters, 24
level-3 texts) are datamined from BALL x PIT v1.308 (extracted 2026-11-13). The
full fact base, including per-entity effect text, lives in
[`docs/research/game-mechanics.md`](docs/research/game-mechanics.md); the
site's synergy tag model is hand-maintained in `scripts/editorial.ts`.

Counts: 115 balls, 116 passives, 31 characters, 114 level-3 texts, and a
30-tag editorial vocabulary. The Matchmaker forbids 43 pairs over the 30
pairable characters (the False Messiah pairs with nobody).

Numbers are wiki/datamine as of those dates; the wiki itself carries stub
notices, so re-verify on game patches. The synergy verdicts are this site's own
editorial model derived from character quirk text, not playtested.

## Development

```sh
npm install
npm run dev       # astro dev
npm test          # vitest run, also the CI gate (includes tsc --noEmit)
npm run build     # astro build → dist/
```

Domain vocabulary lives in [`GLOSSARY.md`](GLOSSARY.md); contributor and agent
rules live in [`AGENTS.md`](AGENTS.md).

### Architecture

Static Astro 5 page + one vanilla-TS interactive island, decomposed into
single-responsibility modules:

| Module | Responsibility |
|---|---|
| `src/companion.ts` | Island: composition root — startup/disposal, plan persistence, hash routing |
| `src/view-state.ts` | All state and derivations: `dispatch(action) → ViewModel` |
| `src/renderer.ts` | All DOM painting: build once, repaint in place (icons never blink) |
| `src/edition-gate.ts` | Content-filter rules: edition visibility, recipe/fusion gating |
| `src/passive-availability.ts` | Per-character passive allow-list and stat-gate rules |
| `src/slot-limits.ts` | Plan capacity and per-character slot quirks |
| `src/plan-state.ts` | Plan state and derivations |
| `src/build-graph.ts` | Plan build-graph derivation and layout |
| `src/fusion.ts` | Pure fusion composer: `fuse(a, b)` → composed fused-ball text |
| `src/graph.ts` | Pure evolution-graph helpers: depth, highlight walks, recipe notation |
| `src/catalog.ts` | Indexed ball/passive collections; namespace resolution |
| `src/synergy.ts` | Red/green verdict logic from tag overlap |
| `src/icon-url.ts` | Base-URL × icon-path join |

`GLOSSARY.md` is the domain glossary; module headers carry the same vocabulary.
Architectural invariants (namespace separation, structural depth, recipe-notation
factorization) are documented there and enforced by the test suite.

### Data pipeline

The data files in `src/data/` are **generated**, don't edit them by hand:

1. `docs/research/game-mechanics.md`, the hand-maintained fact base (wiki
   tables for the base game, the v1.308 datamine for the expansion).
2. `node --experimental-strip-types scripts/parse-wiki.ts` → `src/data/parsed.json`.
   Evolution depth is computed structurally from recipe graphs, not from wiki labels.
3. `node --experimental-strip-types scripts/emit-data.ts` → `src/data/*.ts`.
   Synergy tags and per-character verdicts are hand-maintained in
   `scripts/editorial.ts`; the emitter validates every cross-reference before
   writing.

The fusion model is separate: `src/fusion.ts` composes fused-ball text from
the two components' effect text using community-observed rules, validated
against the 370-pair evidence corpus in
[`docs/research/fusion-observations/`](docs/research/fusion-observations/) —
an executable spec (`src/corpus.test.ts`). The corpus predates the expansion
balls, so it covers the base-game catalog only. The distilled mechanics live in
[`docs/research/fusion-mechanics.md`](docs/research/fusion-mechanics.md).

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`) runs the test suite on every
push to `main` and every PR, then builds with Astro and deploys to GitHub Pages.

## Credits & license

Code: [MIT](LICENSE) © 2026 Tomas Kirnak.

Game icons in `public/icons/` (293 PNGs) are the base-game wiki art from
[ballxpit.wiki.gg](https://ballxpit.wiki.gg) plus the *Risen Ballbylon*
sprites extracted from the v1.308 game assets; details and per-directory
counts in [`public/icons/CREDITS.md`](public/icons/CREDITS.md). Ball x Pit game
art is © Kenny Sun (Kenomi LLC) and wiki.gg contributors; icons are used without
permission, solely for identification in this non-commercial fan tool, and
remain the property of their original owners. Not affiliated with the rights
holder.

Other useful resources: [ballxpit.wiki.gg](https://ballxpit.wiki.gg) (community
wiki) · [r/BALLxPIT](https://www.reddit.com/r/BALLxPIT/) ·
[Steam Community guides](https://steamcommunity.com/app/2062430/guides).
