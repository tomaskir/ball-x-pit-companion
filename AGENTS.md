# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this repo is

A fan-made companion site for the game **Ball x Pit** (© Kenomi LLC / Kenny Sun):
an evolution-recipes browser, a character-synergy checker, and a character-quirk
reference. Static Astro 5 site with one vanilla-TS interactive island, deployed
to GitHub Pages at https://tomaskir.github.io/ball-x-pit-companion/.

Not an npm package (`"private": true`). Code is MIT-licensed; game art in
`public/icons/` is not — see `public/icons/CREDITS.md` before touching assets.

## Repo map

- `src/pages/index.astro` — static page shell (header, tabs, search, footer disclaimer).
- `src/companion.ts` — the **island**: event listening, theme, hash routing only.
- `src/view-state.ts` — all state + derivations; `dispatch(action) → ViewModel`. The test surface.
- `src/renderer.ts` — all DOM painting; `buildAll()` once, then `paint(vm)` in place.
- `src/graph.ts` — pure evolution-graph helpers (depth, highlight walks, recipe notation).
- `src/catalog.ts` — ball/passive collections indexed; **namespace resolution lives here and nowhere else**.
- `src/synergy.ts` — red/green verdict from tag overlap.
- `src/icon-url.ts` — the base-URL × icon-path join.
- `src/data/{balls,passives,characters,tags}.ts` — **generated** data files.
- `scripts/parse-wiki.ts`, `scripts/emit-data.ts`, `scripts/slug.ts` — the data pipeline.
- `docs/research/game-mechanics.md` — the hand-maintained fact base the parser consumes.
- `CONTEXT.md` — domain glossary; read it first. Module headers carry the same vocabulary.

## Commands

```sh
npm test          # vitest run — the ONLY quality gate (includes tsc --noEmit as a test)
npm run dev       # astro dev
npm run build     # astro build
npm run preview   # astro preview
```

There is no lint step. CI (`.github/workflows/deploy.yml`) runs `npm ci` +
`npm test` on every push to `main` and every PR to `main`, then builds and
deploys to GitHub Pages. `npm test` failing means deploy does not happen.

Regenerating data (two-stage pipeline, run from repo root):

```sh
node --experimental-strip-types scripts/parse-wiki.ts   # fact base → src/data/parsed.json
node --experimental-strip-types scripts/emit-data.ts    # parsed.json + tag maps → src/data/*.ts
```

(The flag is required on Node ≤ 22, which CI pins; Node ≥ 24 strips types by default.)

## Data flow — what is hand-edited vs generated

Hand-edited:
- `docs/research/game-mechanics.md` — wiki-sourced fact base (fetched 2026-09-13,
  game v1.301). Effect text is verbatim from ballxpit.wiki.gg.
- Tag/verdict assignments live **inside `scripts/emit-data.ts`** (`TAGS`,
  `BALL_TAGS`, `PASSIVE_TAGS`, `CHAR_VERDICTS`) — this is the only place the
  editorial synergy model is set.

Generated — never edit by hand:
- `src/data/parsed.json`, `src/data/balls.ts`, `src/data/passives.ts`,
  `src/data/characters.ts`, `src/data/tags.ts`.

`emit-data.ts` validates on every run (recipes resolve within namespace, tags in
vocabulary, every character has a verdict entry, base balls resolve) and exits
non-zero on violation.

## Architectural invariants — do not break

1. **Namespace separation.** Ball and passive graphs are strictly separate; ids
   never collide. All "which namespace does this id live in?" questions go
   through `src/catalog.ts`. Highlight walks and closures must never cross
   namespaces (this was a real bug — see `regression.test.ts`).
2. **Never recreate `<img>` elements.** `buildAll()` builds grids once;
   `paint(viewModel)` only toggles classes/badges. Rebuilding blinks icons.
3. **Depth is structural, not wiki labels.** `resolveDepths` in `graph.ts`
   computes 0/1/2 from recipe structure with a cycle guard; the parser calls it
   once per namespace. Wiki "Evo/Tier-3" labels are loose — don't trust them.
4. **Recipe notation factorization.** The compact `x+(y/z)` tile notation is
   faithful only because every multi-recipe entity factorizes into per-slot
   alternates (`factorizesIntoSlots`). The renderer only injects icon markup.
5. **Icon paths are base-relative.** The site deploys under
   `/ball-x-pit-companion/`; `iconUrl` throws on a leading `/`.
6. **Synergy rules.** Characters carry `{ tag, verdict, note }`; the
   `*passives` wildcard matches every passive; with two characters selected
   **red wins** and notes join with ` · `.

## Testing conventions

- Vitest 5. `npm test` is the gate; typecheck is a test (`src/typecheck.test.ts`).
- `src/regression.test.ts` pins every data/logic bug found so far, one test per
  bug, each naming the bug. When you fix a bug, add a regression test there
  (or in the module's test file) that names it.
- Data invariants (counts, schema, icon-on-disk checks) live in `src/data.test.ts`.
- The fusion corpus is an executable spec: `src/corpus.test.ts` checks the
  composer against `docs/research/fusion-observations/fusion-pairs.json`,
  `src/corpus-schema.test.ts` gates the corpus's own schema (via
  `scripts/harvest/validate-observations.ts`), and a `data.test.ts` test
  pins every `FUSED_STATS` override to the current catalog effect text.
  Changing the composer, the corpus, or the wiki effect text must keep all
  three green — a disagreement is a content decision, not a test to relax.
- New pure logic goes in `graph.ts`/`view-state.ts` with unit tests first where
  practical (TDD has been the pattern for graph work).

## Workflow conventions

- **Commit messages**: imperative subject lines. Observed house style: `feat: …`,
  `refactor: …`, `fix…`, `Extract <module>: <one-line why>` for module
  extractions, and `Address review findings: <what>` for review follow-ups.
  TDD commits note `(TDD)`.
- **Design-decision provenance**: the durable record is `CONTEXT.md` plus the
  module headers themselves; keep both accurate when changing a module's
  contract. Some comments still cite numbered decision "tickets" from an early
  planning phase whose files were never committed — treat those numbers as
  historical labels with no backing document, and don't add new ones.
- **Concurrent sessions**: if other agent sessions may be working in this repo
  at the same time, use the `concurrent-agents` skill — work in your own
  worktree, integrate via rebase + fast-forward, never edit the shared checkout.
- Prefer small, single-responsibility modules with one public interface each;
  the codebase is deliberately structured that way (see CONTEXT.md). When a
  module grows a second responsibility, extract rather than accrete.

## Content caveats

- Game data is wiki-as-of-2026-09-13 (game v1.301); the wiki pages carry
  `{{Stub}}` notices. Re-verify numbers on game patches — see the uncertainty
  summary at the end of `docs/research/game-mechanics.md`.
- The synergy tag list and per-character verdicts are this site's **editorial
  model**, not game data — playtest-unverified. Changes there are content
  decisions, not just code.
