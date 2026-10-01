# Ball x Pit Companion

**🔗 Live site: [tomaskir.github.io/ball-x-pit-companion](https://tomaskir.github.io/ball-x-pit-companion/)**

A fan-made companion for **BALL x PIT**, the breakout-style survival roguelite by
Kenny Sun and Friends (Devolver Digital, October 2025). It maps every ball
evolution recipe from the Fusion Reactor as a searchable graph, with per-character
synergy verdicts, as a static site that works offline.

## What it does

- **All 91 balls**: the 21 base balls, Baby Ball, and all 69 Evolved Balls from
  the Fusion Reactor, grouped Basic / Evolved / Tier-3. Every tile shows its
  fusion recipe inline in compact notation (`Iron + (Ghost/Dark)`).
- **Evolution chains, not just pair lookups.** Click any ball to highlight its
  whole recipe graph at once: components, alternate recipes, and everything it
  can evolve into, multi-step chains included (e.g. Burn → Sun → Black Hole).
- **All 71 passives**: 54 base + 17 evolved, with their evolution recipes.
- **Character synergy checker.** Pick up to 2 of the 23 characters and every
  ball/passive gets a red/green verdict from tag overlap, with an explanation
  on hover. Red wins when two characters disagree, so clashes surface first
  (e.g. The Empty Nester and The Makeshift Sisyphus have no baby balls →
  everything that spawns or scales with them goes red).
- **Character reference**: all 23 characters with base ball, quirk text, and
  unlock context.
- **Search everything** by name or effect text. Dark and light themes.
  No backend, no tracking. One static page.

## Data

Game data was transcribed from [ballxpit.wiki.gg](https://ballxpit.wiki.gg) on
2026-09-13 (game v1.301, *Naturalist* update) and cross-checked against the
community "Ultimate Guide of Evolutions" charts; both sources agree. The full
fact base, including per-entity effect text and the site's synergy tag model,
lives in [`docs/research/game-mechanics.md`](docs/research/game-mechanics.md).

Numbers are wiki-as-of-date; the wiki itself carries stub notices, so re-verify
on game patches. The synergy verdicts are this site's own editorial model
derived from character quirk text, not playtested.

## Development

```sh
npm install
npm run dev       # astro dev
npm test          # vitest run, also the CI gate (includes tsc --noEmit)
npm run build     # astro build → dist/
```

### Architecture

Static Astro 5 page + one vanilla-TS interactive island, decomposed into
single-responsibility modules:

| Module | Responsibility |
|---|---|
| `src/companion.ts` | Island: event listening, theme, hash routing only |
| `src/view-state.ts` | All state and derivations: `dispatch(action) → ViewModel` |
| `src/renderer.ts` | All DOM painting: build once, repaint in place (icons never blink) |
| `src/graph.ts` | Pure evolution-graph helpers: depth, highlight walks, recipe notation |
| `src/catalog.ts` | Indexed ball/passive collections; namespace resolution |
| `src/synergy.ts` | Red/green verdict logic from tag overlap |
| `src/icon-url.ts` | Base-URL × icon-path join |

`CONTEXT.md` is the domain glossary; module headers carry the same vocabulary.
Architectural invariants (namespace separation, structural depth, recipe-notation
factorization) are documented there and enforced by the test suite.

### Data pipeline

The data files in `src/data/` are **generated**, don't edit them by hand:

1. `docs/research/game-mechanics.md`, the hand-maintained fact base (wiki tables).
2. `node --experimental-strip-types scripts/parse-wiki.ts` → `src/data/parsed.json`.
   Evolution depth is computed structurally from recipe graphs, not from wiki labels.
3. `node --experimental-strip-types scripts/emit-data.ts` → `src/data/*.ts`.
   Synergy tags and per-character verdicts are hand-maintained inside this
   script; it validates every cross-reference before writing.

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`) runs the test suite on every
push to `main` and every PR, then builds with Astro and deploys to GitHub Pages.

## Credits & license

Code: [MIT](LICENSE) © 2026 Tomas Kirnak.

Game icons in `public/icons/` (208 PNGs) were downloaded from
[ballxpit.wiki.gg](https://ballxpit.wiki.gg); details and per-directory counts
in [`public/icons/CREDITS.md`](public/icons/CREDITS.md). Ball x Pit game art is
© Kenny Sun (Kenomi LLC) and wiki.gg contributors; icons are used without
permission, solely for identification in this non-commercial fan tool, and
remain the property of their original owners. Not affiliated with the rights
holder.

Other useful resources: [ballxpit.wiki.gg](https://ballxpit.wiki.gg) (community
wiki) · [r/BALLxPIT](https://www.reddit.com/r/BALLxPIT/) ·
[Steam Community guides](https://steamcommunity.com/app/2062430/guides).
