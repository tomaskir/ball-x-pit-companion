# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this repo is

A fan-made companion site for the game **Ball x Pit** (© Kenomi LLC / Kenny Sun):
an evolution-recipes browser, a character-synergy checker, a character-quirk
reference, and a fusion composer. Static Astro 5 site with one vanilla-TS
interactive island, deployed to GitHub Pages at
https://tomaskir.github.io/ball-x-pit-companion/.

Not an npm package (`"private": true`). Code is MIT-licensed; game art in
`public/icons/` is not — see `public/icons/CREDITS.md` before touching assets.

## Repo map

- `src/pages/index.astro` — static page shell (header, tabs, per-screen search, footer disclaimer).
- `src/companion.ts` — the **island**: event listening, theme, hash routing only.
- `src/view-state.ts` — all state + derivations; `dispatch(action) → ViewModel`. The test surface.
- `src/renderer.ts` — all DOM painting; `buildAll({ getVerdict, emit })` once, then `paint(vm)` in place.
- `src/renderer/` — internal painters behind that facade (grids, characters, chips, fusion screen, plan, build graphs, selection box) sharing `reconcile.ts` (the painted-key seam), `seam.ts` (the emit callback and toast adapter), and `dom.ts`/`labels.ts` (icon, verdict badge, and display-text helpers).
- `src/fusion.ts` — pure fusion composer (`fuse(a, b)`); the site's editorial model of fusion, not game data.
- `src/fusion-properties.ts` — pure order model: hand-maintained level-3 scalar property table and `resolveProperties(a, b)` (property-set union, first-pick scalar precedence); application channels come from `channelsOf` in `fusion-knowledge.ts`.
- `src/fusion-knowledge.ts` — the hand-maintained fusion evidence: classification tables (Destroy/cooldown/pierce/kill classes, spawn inheritance, the one application-channel classifier `channelsOf`), predicates, and the one reported-fact table (`FUSION_FACTS`: caveat prose plus reported exceptions); `fusion.ts` composes, this module answers "what class is this ball in?" and carries the reported facts.
- `src/fusion-panel.ts` — the fusion screen's panel derivation: the named 3-state machine (empty / pending / composed), the composed state's result/exception display rows and section visibility, the order presentation, and the panel hint. `deriveFusionPanel(picks, plan)`; view-state embeds the result.
- `src/pair.ts` — unordered-pair identity (`pairKey`, `pairKeyOf`, `parsePair`); the one home for the "reverse composition is the same pair" invariant.
- `src/graph.ts` — pure evolution-graph helpers (depth, highlight walks, recipe notation).
- `src/build-graph.ts` — pure Plan-screen build-graph derivation + layout (`deriveBuildGraph`/`layoutBuildGraph`); the renderer only paints it.
- `src/catalog.ts` — ball/passive collections indexed; **namespace resolution lives here and nowhere else**.
- `src/corpus.ts` — the fusion-observation corpus module: curated `fusion-pairs.json` loading (`loadCorpus` → pairs / `pair(key)` / `wirePairs()`) and raw `.jsonl` validation (`validateCorpus`); the seam both corpus tests and the harvest CLI cross.
- `src/synergy.ts` — red/green verdict from tag overlap.
- `src/icon-url.ts` — the base-URL × icon-path join.
- `src/styles/global.css` — the island's stylesheet; `src/styles.test.ts` pins markup/CSS coupling.
- `src/data/{balls,passives,characters,tags,level-3}.ts` — **generated** data files.
- `scripts/parse-wiki.ts`, `scripts/emit-data.ts`, `scripts/slug.ts` — the data pipeline.
- `scripts/harvest/validate-observations.ts` — thin CLI over `src/corpus.ts` (prints findings, sets the exit code).
- `docs/research/game-mechanics.md` — the hand-maintained fact base the parser consumes.
- `docs/research/character-pairings.md` — the Matchmaker pairing-restriction fact base (also parsed).
- `docs/research/passive-availability.md` — the passive-availability fact base (hard/soft/slot classification, offer-pool gates, unverified per-character leads; not parsed).
- `docs/research/fusion-mechanics.md` — the distilled fusion fact base (not parsed; `src/fusion.ts` implements it).
- `docs/research/fusion-observations/` — the fusion evidence corpus (append-only raw layer: the undated 2026-10-04 files plus dated per-source waves, `pending/` staging).
- `docs/research/fusion-observations/CONTRADICTION-RESOLUTION-2026-11-11.md` — the dated source-only resolution pass applied to the curated layer.
- `docs/research/fusion-claim-register.md` — the claim audit trail (historical snapshot; counts predate the 2026-11-11 pass).
- `docs/research/fusion-order-mechanism.md`, `fusion-order-claims-nov-2026.md`, `fusion-composition-revalidation-2026-11.md`, `effect-text-currency.md`, `mosquito-king-spawn.md`, `brood-mother-spawn.md` — dated research snapshots whose recommendations have landed; read their status banners first.
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
node --experimental-strip-types scripts/parse-wiki.ts   # fact bases → src/data/parsed.json
node --experimental-strip-types scripts/emit-data.ts    # parsed.json + tag maps → src/data/*.ts
```

(The flag is required on Node ≤ 22, which CI pins; Node ≥ 24 strips types by default.)

## Data flow — what is hand-edited vs generated

Hand-edited:
- `docs/research/game-mechanics.md` — wiki-sourced fact base (fetched 2026-09-13,
  game v1.301). Effect text is verbatim from ballxpit.wiki.gg.
- `docs/research/character-pairings.md` — the Matchmaker pairing-restriction
  fact base (game data, also parsed; sources and contradictions documented
  in the file).
- `docs/research/level-3-effects.md` — the level-3 effect-text fact base
  (wiki per-level tables, v1.301 pre-DLC; parsed into `src/data/level-3.ts`).
  The fusion composer consumes it; the catalog stays level-1.
- Tag/verdict assignments live **inside `scripts/emit-data.ts`** (`TAGS`,
  `BALL_TAGS`, `PASSIVE_TAGS`, `CHAR_VERDICTS`) — this is the only place the
  editorial synergy model is set.

Generated — never edit by hand:
- `src/data/parsed.json`, `src/data/balls.ts`, `src/data/passives.ts`,
  `src/data/characters.ts`, `src/data/tags.ts`, `src/data/level-3.ts`.

`emit-data.ts` validates on every run (recipes resolve within namespace, tags in
vocabulary, every character has a verdict entry, base balls resolve, level-3
texts cover all 90 fusable balls) and exits non-zero on violation.

## Architectural invariants — do not break

1. **Namespace separation.** Ball and passive graphs are strictly separate; ids
   never collide. All "which namespace does this id live in?" questions go
   through `src/catalog.ts`. Highlight walks and closures must never cross
   namespaces (this was a real bug — see `regression.test.ts`).
2. **Never recreate `<img>` elements.** `buildAll()` builds grids once;
   `paint(viewModel)` only toggles classes/badges. Rebuilding blinks icons.
3. **The renderer is paint-only.** Clicks come back through the build seam's
   `emit(action)` callback, which the island wires to `dispatch` + `paint`;
   the renderer never dispatches DOM events and its view-state imports are
   types only (pinned in `src/regression.test.ts`, wired behaviorally in
   `src/renderer.test.ts`).
4. **Depth is structural, not wiki labels.** `resolveDepths` in `graph.ts`
   computes 0/1/2 from recipe structure with a cycle guard; the parser calls it
   once per namespace. Wiki "Evo/Tier-3" labels are loose — don't trust them.
5. **Recipe notation factorization.** The compact `x+(y/z)` tile notation is
   faithful only because every multi-recipe entity factorizes into per-slot
   alternates (`factorizesIntoSlots`). The renderer only injects icon markup.
6. **Icon paths are base-relative.** The site deploys under
   `/ball-x-pit-companion/`; `iconUrl` throws on a leading `/`.
7. **Synergy rules.** Characters carry `{ tag, verdict, note }`; the
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
  `src/corpus.ts`), and `data.test.ts` pins the
  level-3 overlay to the catalog (90 fusable balls) and the property table's
  scalar values to the level-3 text. Changing the composer, the corpus, the
  property table, or the wiki effect text must keep all of them green — a
  disagreement is a content decision, not a test to relax. The distilled
  model behind the composer is `docs/research/fusion-mechanics.md`
  (hand-maintained, like `game-mechanics.md` but not parsed).
- New pure logic goes in `graph.ts`/`view-state.ts` with unit tests first where
  practical (TDD has been the pattern for graph work).

## Workflow conventions

- **Commit messages**: imperative subject lines. Observed house style: `feat: …`,
  `refactor: …`, `fix…`, `Extract <module>: <one-line why>` for module
  extractions, and `Address review findings: <what>` for review follow-ups.
  TDD commits note `(TDD)`.
- **Design-decision provenance**: the durable record is `CONTEXT.md` plus the
  module headers themselves; keep both accurate when changing a module's
  contract. Some comments cite numbered decision "tickets" (e.g. #7, #8,
  #12); these resolve to closed GitHub issues, but the issue bodies are not a
  substitute for the module headers. Treat the numbers as historical labels
  and don't add new ones.
- **Concurrent sessions**: if other agent sessions may be working in this repo
  at the same time, use the `concurrent-agents` skill — work in your own
  worktree, integrate via rebase + fast-forward, never edit the shared checkout.
- Prefer small, single-responsibility modules with one public interface each;
  the codebase is deliberately structured that way (see CONTEXT.md). When a
  module grows a second responsibility, extract rather than accrete.

## Content caveats

- Game data is wiki-as-of-2026-09-13 (pre-DLC game v1.301); the wiki pages
  carry `{{Stub}}` notices. The overview catalog is level-1 text; fusion
  consumes the level-3 overlay (`src/data/level-3.ts`). Re-verify numbers on
  game patches — see the uncertainty summary at the end of
  `docs/research/game-mechanics.md`.
- The synergy tag list and per-character verdicts are this site's **editorial
  model**, not game data — playtest-unverified. Changes there are content
  decisions, not just code.

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`tomaskir/ball-x-pit-companion`), managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical roles map to `needs-assessment`, `needs-more-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.
