# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this repo is

A fan-made companion site for the game **Ball x Pit** (© Kenomi LLC / Kenny Sun):
an evolution-recipes browser, a character-synergy checker, a character-quirk
reference, and a fusion composer. Static Astro 5 site with one vanilla-TS
interactive island, deployed to GitHub Pages at
https://tomaskir.github.io/ball-x-pit-companion/.

Public overview: `README.md`. Domain vocabulary: `GLOSSARY.md`.

Not an npm package (`"private": true`). Code is MIT-licensed; game art in
`public/icons/` is not — see `public/icons/CREDITS.md` before touching assets.

## Repo map

- `src/pages/index.astro` — static page shell (header with the edition-filter loss notice, tabs, per-screen search + edition checkboxes, footer disclaimer).
- `src/companion.ts` — the **island**: composition root for shell, renderer, and view state — plan persistence, hash routing, and the startup/disposal sequence only.
- `src/companion-core.ts` — pure startup decisions (`sectionFromHash`, `shouldClear`, `themeFromStorage`); the island and shell are their transport.
- `src/shell.ts` — the **shell adapter**: `createShell({ ports, dispatch, snapshot })` owns every static-shell control (theme, tabs, per-screen search, per-screen edition-filter checkboxes, plan toolbar, share, Esc/empty-space) in one listener registry and returns `{ showSection, destroy }`; `destroy` removes every listener and clears the share flash timer.
- `src/clear-exempt.ts` — the clear-exemption marker/predicate (`markClearExempt(el)` at each interactive region's creation site, `isClearExempt(target)` for the shell/island); the empty-space clear rule sits with the markup that creates it, not in a selector list.
- `src/view-state.ts` — all state + derivations; `dispatch(action) → ViewModel`. The test surface. Also owns the content filter's `enabledEditions` (default base-game), the drop-hidden invariant on toggle-off/hydrate, the dropped-entry count, the edition-filtered collections/recipes every screen paints, and each passive tile's availability (`unavailable`, `availability`) plus the selection box's `planReason`.
- `src/edition-gate.ts` — the content filter's pure rules: `DEFAULT_EDITIONS`, `canonicalEditions`, `isEditionEnabled`/`isVisible`, `recipeAvailable`/`availableRecipes` (a recipe needs every component's edition enabled), `fusionVisible` (both components), and `gatedGraph` (a namespace map with gated recipes). The vocabulary itself is generated (`src/data/editions.ts`).
- `src/passive-availability.ts` — the per-character passive-availability rules: the DLC allow-list (`characterIds`) and the base-game character-stat gates (`excludedCharacterIds`) stay separate; two selected characters use union semantics (available if either can use it); zero selected means no restriction. Zero passive slots (The Ballbearer) is reported from the slot limit for display only, never as a per-passive block (the Plan marks it over-limit). Loadout gates (`requirement`) are informational. `passiveAvailability(passive, { selectedChars, passiveSlots, zeroSlotsReason })` → `{ blocked, characterSpecific, characterLockReason, zeroSlots, unavailable, reason }`; `isCharacterSpecific(passive)`.
- `src/plan-state.ts` — the plan screen's state and derivation: `createPlanState()` → `dispatch(action, selectedChars)` / `derive(selectedChars)` / `snapshot()`, plus the membership queries (`has`, `hasPair`), `dropHidden(enabled)` (the filter's no-hidden-live-state rule), and `limits()` (the global limits; the character-overlaid limits ride `derive(...).limits`). Also derives The Potager's `fusionInvalid` mark and live-add block, the passive `passiveInvalid` mark and live-add block (from `src/passive-availability.ts`), the quirk-aware over-limit/empty hints, the separate fusion-invalid/passive-invalid hint lines, and the slot-quirk capacity guards.
- `src/slot-limits.ts` — the Plan's per-section capacity: `globalLimits(upgradesOn)` and `limitsFor(upgradesOn, selectedChars)`, with the hand-authored quirk map (`SLOT_RULES`: The Ballbearer doubles balls and zeroes passives; The Hoary Hoarder keeps 2 balls and turns the rest into passives). Formulas over the globals, not a fixed table; the illegal double-quirk pair resolves to The Ballbearer by map order (the game's check order).
- `src/plan-codec.ts` — the plan persistence codec: `PlanSnapshot ⇄ v2 wire ⇄ SharedSnapshot { plan, chars, editions }`, with the plan's field list declared once (compiler-checked against `keyof PlanSnapshot`). `encodeShared`/`decodeShared`/`normalizeShared`; v1 links still decode as base-game only; shape only, deeper id validation stays in `plan-state`'s `hydrate`. `src/share.ts` keeps the URL transport (`planLink`, `takeShareParam`).
- `src/plan-session.ts` — the persistence lifecycle over injected ports: `restore({ storage, hash }) → { shared, editions, stripUrl, fromShare }` owns share-beats-stored precedence, the one-shot strip, and corrupt-storage tolerance; `save(storage, shared)` owns serialization and skips unchanged state. The plan + shared selection persist under `ball-x-pit-plan`, the edition filter under its own `ball-x-pit-editions`. The island keeps the transport.
- `src/renderer.ts` — all DOM painting behind one instance lifecycle: `createRenderer({ emit })` → `{ build(), paint(vm), destroy() }`. The instance owns the seam, the toast adapter, the reconcile cache, and every painter registry; `paint(vm)` captures the latest view model for the toast's verdict.
- `src/renderer/` — internal painter factories behind that facade (grids, characters, chips, fusion screen, plan, build graphs, selection box, edition filter), each created over the instance's seam and reconcile cache (the edition-filter chrome needs neither): `reconcile.ts` (the content-diff cache), `action-slot.ts` (the once-built click channel: a typed `ToggleAction` refreshed by every repaint), `seam.ts` (the emit callback, the captured view model, and the toast adapter), and `dom.ts`/`labels.ts`/`tier-headings.ts` (icon, verdict badge, empty-filter hint, display text, and the shared tier-heading repaint). `edition-filter.ts` mirrors `enabledEditions` onto every screen's checkbox group and owns the header loss notice's timer; the painters hide filtered content with the `hidden` attribute (never dimming it) and repaint tier-heading counts and the empty-screen hint. No module-level mutable renderer state.
- `src/toast.ts` — the hover/tap detail popup adapter (`createToast`); created and torn down by the renderer instance.
- `src/fusion.ts` — pure fusion composer (`fuse(a, b)`); the site's editorial model of fusion, not game data.
- `src/ball-kit.ts` — the one per-ball kit table (`BALL_KIT`): level-3 scalars, application channels, and the game's AOE flag together, read by `channelsOf` (wire model), `resolveProperties` (order model), and `aoeRank` (carrier rank).
- `src/fusion-properties.ts` — pure order model: `resolveProperties(a, b)` over the per-ball kits (property-set union, first-pick scalar precedence).
- `src/fusion-knowledge.ts` — the hand-maintained fusion evidence behind a question-shaped interface: `wireFor(a, b) → Wire | null` (the five cross-wire branches, their priority, and the private capability predicates behind them), the one application-channel classifier `channelsOf` (reads `BALL_KIT`, falls back to the status-text heuristic) and `statusChannel`, plus the one reported-fact table (`FUSION_FACTS` / `factsFor`). Class sets, regexes, capability predicates, caveat prose, and branch priority stay private; `fusion.ts` renders the wire line and composes.
- `src/fusion-panel.ts` — the fusion screen's panel derivation: the named 3-state machine (empty / pending / composed), the composed state's result/exception display rows and section visibility, the order presentation, the Potager fusion block (`fusionBlocked`, evolve-instead exempt), and the panel hint. `deriveFusionPanel(picks, plan)`; view-state embeds the result.
- `src/pair.ts` — unordered-pair identity (`pairKey`, `pairKeyOf`, `parsePair`); the one home for the "reverse composition is the same pair" invariant.
- `src/pick-list.ts` — the sticky pick-list invariant (`createPickList({ hasRoom, resolve, key })` → `{ toggle, restore, list, has }`): re-click deselects, over-capacity adds are no-ops, rejected ids are ignored, restore dedupes first-occurrence-wins without trimming. Consumers: character slots and fusion picks in `view-state`, plan balls/passives/fused pairs in `plan-state`.
- `src/graph.ts` — pure evolution-graph helpers (depth, highlight walks, recipe notation).
- `src/build-graph.ts` — pure Plan-screen build-graph derivation + layout: `deriveBuildGraphView(planState, { focus, done, collapsed, editions })` owns the graph's inputs (targets, including Evolves-instead resolution; over-limit, passive-invalid, and Potager fusion-invalid entries excluded), both namespace graphs (recipes gated on the enabled editions), focus validation, the related-set walk, and the row model (row counts, fusion row index, labels); `deriveBuildGraph`/`layoutBuildGraph` are its pure parts. The renderer only paints it.
- `src/depth-labels.ts` — the structural-depth display labels shared by the catalog grids, the fusion screen, and the build-graph row model.
- `src/catalog.ts` — ball/passive collections indexed; **namespace resolution lives here and nowhere else**.
- `src/corpus.ts` — the fusion-observation corpus module: curated `fusion-pairs.json` loading (`loadCorpus` → `pair(key)` / `pairKeys()` / `wirePairs()` / `generalRules()`) and raw `.jsonl` validation (`validateCorpus`); the seam both corpus tests and the harvest CLI cross.
- `src/synergy.ts` — red/green verdict from tag overlap.
- `src/icon-url.ts` — the base-URL × icon-path join.
- `src/styles/global.css` — the island's stylesheet; `src/styles.test.ts` pins markup/CSS coupling.
- `src/test-support/` — shared test harness (`mount-island.ts`) and named pins (`pins.ts`); not production code.
- `src/data/{editions,balls,passives,characters,tags,level-3}.ts` — **generated** data files.
- `scripts/parse-wiki.ts`, `scripts/emit-data.ts` — thin CLIs over the data pipeline.
- `scripts/fact-bases.ts` — exported pure parsers (`parseRecipes`, `parseGameMechanics`, `parsePairings`, `parseLevel3`, `parseFactBases`); the test surface for the fact bases.
- `scripts/markdown-table.ts` — the one markdown-table scanner all three parsers share; returns rows keyed by header cell (`column(row, 'Name')`), so parsers never index by position.
- `scripts/editorial.ts` — the site's editorial synergy model (`TAGS`, `BALL_TAGS`, `PASSIVE_TAGS`, `CHAR_VERDICTS`); the only place it is set, plus `validateEditorial`, its one invariant list (bidirectional entity coverage, tag vocabulary, verdict-rule sanity, wildcard uniqueness), shared by the emit CLI and `src/data.test.ts`.
- `scripts/editions.ts` — the edition vocabulary (`EDITIONS` ordered list + `Edition` union): the source of truth for the generated `src/data/editions.ts` and the fact-base parser's vocabulary check.
- `scripts/generated-data.ts` — the generated-data contract (`emitData`, `renderGenerated`, `validateGenerated`, `runEmitData`) plus the passive allow-list derivation (base lists authored, evolved lists the components' intersection with the documented Handheld Rupture override); validation runs before any write and the same list is asserted in `src/data.test.ts`.
- `scripts/slug.ts` — shared name→id slugification.
- `scripts/harvest/validate-observations.ts` — thin CLI over `src/corpus.ts` (prints findings, sets the exit code).
- `docs/research/game-mechanics.md` — the hand-maintained fact base the parser consumes.
- `docs/research/character-pairings.md` — the Matchmaker pairing-restriction fact base (also parsed).
- `docs/research/passive-availability.md` — the passive-availability fact base (hard/soft/slot classification, offer-pool gates, unverified per-character leads; not parsed). Superseded for the DLC build by `character-passive-restrictions.md`.
- `docs/research/character-passive-restrictions.md` — datamined per-character passive allow-list (DLC v1.308), inherited restrictions on evolved passives, and the base-game character-stat gates; not parsed.
- `docs/research/fusion-mechanics.md` — the distilled fusion fact base (not parsed; `src/fusion.ts` implements it).
- `docs/research/fusion-observations/` — the fusion evidence corpus (append-only raw layer: the undated 2026-10-04 files plus dated per-source waves, `pending/` staging).
- `docs/research/fusion-observations/CONTRADICTION-RESOLUTION-2026-11-11.md` — the dated source-only resolution pass applied to the curated layer.
- `docs/research/fusion-claim-register.md` — the claim audit trail (historical snapshot; counts predate the 2026-11-11 pass).
- `docs/research/fusion-order-mechanism.md`, `fusion-order-claims-nov-2026.md`, `fusion-composition-revalidation-2026-11.md`, `effect-text-currency.md`, `mosquito-king-spawn.md`, `brood-mother-spawn.md` — dated research snapshots whose recommendations have landed; read their status banners first.
- `GLOSSARY.md` — domain glossary; read it first. Module headers carry the same vocabulary.

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
- Tag/verdict assignments live **inside `scripts/editorial.ts`** (`TAGS`,
  `BALL_TAGS`, `PASSIVE_TAGS`, `CHAR_VERDICTS`) — this is the only place the
  editorial synergy model is set.

Generated — never edit by hand:
- `src/data/parsed.json`, `src/data/editions.ts`, `src/data/balls.ts`,
  `src/data/passives.ts`, `src/data/characters.ts`, `src/data/tags.ts`,
  `src/data/level-3.ts`.

`scripts/generated-data.ts` validates on every run (recipes resolve within
namespace, tags in vocabulary, every character has a verdict entry, base balls
resolve, pairings are symmetric, level-3 texts cover all 90 fusable balls)
**before** writing any file, and the CLI exits non-zero on violation.
`src/data.test.ts` runs the same `validateGenerated` list against the
checked-in data, so the invariants are written once.

## Architectural invariants — do not break

1. **Namespace separation.** Ball and passive graphs are strictly separate; ids
   never collide. All "which namespace does this id live in?" questions go
   through `src/catalog.ts`. Highlight walks and closures must never cross
   namespaces (this was a real bug — see `regression.test.ts`).
2. **Never recreate `<img>` elements.** `renderer.build()` builds grids once;
   `renderer.paint(viewModel)` only toggles classes/badges. Rebuilding blinks icons.
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
- **Design-decision provenance**: the durable record is `GLOSSARY.md` plus the
  module headers themselves; keep both accurate when changing a module's
  contract. Some comments cite numbered decision "tickets" (e.g. #7, #8,
  #12); these resolve to closed GitHub issues, but the issue bodies are not a
  substitute for the module headers. Treat the numbers as historical labels
  and don't add new ones.
- **Concurrent sessions**: if other agent sessions may be working in this repo
  at the same time, use the `concurrent-agents` skill — work in your own
  worktree, integrate via rebase + fast-forward, never edit the shared checkout.
- Prefer small, single-responsibility modules with one public interface each;
  the codebase is deliberately structured that way (see GLOSSARY.md). When a
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
- The fusion corpus is append-only: corrections go in a new wave plus
  `docs/research/fusion-observations/CONTRADICTIONS.md`; never rewrite old rows.

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`tomaskir/ball-x-pit-companion`), managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical roles map to `needs-assessment`, `needs-more-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: the glossary is `GLOSSARY.md` at the repo root. See `docs/agents/domain.md`.
