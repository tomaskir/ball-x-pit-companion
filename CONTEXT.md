# Context

Domain glossary for the Ball x Pit companion site. Data provenance and
design decisions live in `.scratch/ball-x-pit-companion/map.md` and
`docs/research/game-mechanics.md`; this file names the concepts the code uses.

## Terms

- **Evolution graph** — the OR-of-ANDs recipe graph (`recipes: string[][]`).
  Ball and passive graphs are strictly separate; ids never collide across
  them (ticket 03).
- **Recipe notation** — the compact per-slot rendering of multi-recipe
  entities: "a+(b/c)", "(a/b)+(c/d)", "a+b+c". Faithful only because every
  multi-recipe entity factorizes into per-slot alternates
  (`factorizesIntoSlots`); Module: `src/graph.ts` (`recipeSlots(recipes)`,
  `recipeHtml(recipes, renderComponent)`) — the invariant and its rendering
  live in one place. The renderer injects the icon markup; unknown ids
  render as the raw id.
- **Catalog** — the ball and passive collections, indexed, plus namespace
  resolution. Module: `src/catalog.ts` (`ballMap`, `passiveMap`,
  `isPassive(id)`, `itemFor(id)`, `graphFor(id)`). "Which namespace does
  this id live in?" is decided here and nowhere else; callers pass the id
  or item only.
- **Depth** — evolution tier computed from recipe structure, not wiki labels:
  0 = basic, 1 = evolved (recipe includes a base ball only), 2 = tier-3
  (recipe includes an evolved component). Rule and recursion (tier rule,
  cache, cycle guard) live in `src/graph.ts` (`structuralDepth`,
  `resolveDepths`); the parser calls `resolveDepths` once per namespace.
- **Slug** — name→id normalization (apostrophes dropped, kebab-case,
  abbreviation table for Laser H/V and hilted daggers). Single source of
  truth: `scripts/slug.ts`; both pipeline scripts import it.
- **Synergy verdict** — red/green indicator for an item against the selected
  characters, from tag overlap. Rules: characters carry
  `{ tag, verdict, note }`; the `*passives` wildcard matches every passive;
  with two characters selected, **red wins** and notes join with ` · `.
  Module: `src/synergy.ts` (`verdictFor(item, selectedChars)`) — namespace
  resolution (ball vs passive) is internal, callers pass the item only.
- **Island** — the single interactive script `src/companion.ts` mounted by
  the Astro page. Owns event listening, theme, and hash routing only;
  painting, verdict logic, graph math, and data live in their own modules.
  (The renderer attaches hover/tap listeners for toasts — the island owns
  the events that *dispatch to view state*.)
- **Renderer** — all DOM painting for the island. Module: `src/renderer.ts`
  (recipe notation comes from `src/graph.ts`; the renderer only injects
  icon markup — see **Recipe notation**; the icon-URL join comes from
  `src/icon-url.ts`) — one interface:
  `buildAll(getVerdict)` (builds grids and character cards
  once, at startup) + `paint(viewModel)` (repaints state on the existing
  DOM; never recreates `<img>` elements — that would blink icons). Tiles,
  character cards, chips, and toasts live here; the ViewModel is its input
  and the test surface stays `view-state.ts`.
- **View state** — the island's state (item selection, character slots,
  search query) and every derivation from it (highlight walks, filters,
  verdict badges). Module: `src/view-state.ts` — one interface:
  `createViewState()` → `dispatch(action) → ViewModel`, plus `derive()`
  (same view model without a state change, for initial paint) and
  `verdictFor(item)` (full verdict with note, for the toast). The island
  listens to DOM events, dispatches, and hands the returned view model to
  the renderer; the view model is the test surface.
