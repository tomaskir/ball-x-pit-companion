# Context

Domain glossary for the Ball x Pit companion site. This file is self-contained:
it names the concepts the code uses and carries the data those concepts stand on.
Workflow guidance lives in `AGENTS.md`; the game-data fact base is
`docs/research/game-mechanics.md`.

## Game vs site terminology

The wiki (ballxpit.wiki.gg) distinguishes two mechanics that fan sites conflate:

- **Evolution** — combining 2+ specific level-3 balls in the Fusion Reactor into
  a new *named* Evolved Ball (69 of them as of game v1.301). Modeled from the
  fact base.
- **Fusion** — merging any two unfused level-3 balls into a property-stacking
  ball with no unique identity. Modeled **editorially** on the Fusions screen:
  the game stores no fusion table (see `docs/research/fusion-mechanics.md`),
  so `src/fusion.ts` composes fused-ball text from the two components' effect
  text using community-observed rules — damage rolls abstracted to "X" (fused
  numbers are not derivable from public sources). This is the site's model,
  not game data.

Other wiki terms used verbatim: **Base Balls** (21), **Baby Ball** (not special),
**Base Passives** (54), **Evolved Passives** (17), **Fusion Reactor**.

## Terms

- **Evolution graph** — the OR-of-ANDs recipe graph (`recipes: string[][]`).
  Ball and passive graphs are strictly separate; ids never collide across
  them.
- **Namespace** — which of the two strictly-separate collections (balls,
  passives) an id lives in. Namespace resolution is decided in one place,
  `src/catalog.ts`; callers pass the id or item only.
- **Recipe notation** — the compact per-slot rendering of multi-recipe
  entities: "a+(b/c)", "(a/b)+(c/d)", "a+b+c". Faithful only because every
  multi-recipe entity factorizes into per-slot alternates
  (`factorizesIntoSlots`); Module: `src/graph.ts` (`recipeSlots(recipes)`,
  `recipeHtml(recipes, renderComponent)`) — the invariant and its rendering
  live in one place. The renderer injects the icon markup; unknown ids
  render as the raw id.
- **Catalog** — the ball and passive collections, indexed, plus namespace
  resolution. Module: `src/catalog.ts` (`ballMap`, `passiveMap`,
  `isPassive(id)`, `itemFor(id)`, `graphFor(id)`).
- **Depth** — evolution tier computed from recipe structure, not wiki labels:
  0 = basic, 1 = evolved (recipe includes a base ball only), 2 = tier-3
  (recipe includes an evolved component). Rule and recursion (tier rule,
  cache, cycle guard) live in `src/graph.ts` (`structuralDepth`,
  `resolveDepths`); the parser calls `resolveDepths` once per namespace.
  Display names in the renderer (`DEPTH_LABELS`): Basic / Evolved / Tier-3.
- **Slug** — name→id normalization (apostrophes dropped, kebab-case,
  abbreviation table for Laser H/V and hilted daggers). Single source of
  truth: `scripts/slug.ts`; both pipeline scripts import it.
- **Tag** — one of the 17 entries in the synergy vocabulary
  (`src/data/tags.ts`): `aoe`, `single-target`, `spawns-baby-balls`,
  `spawns-allies`, `status-effect`, `pass-through`, `destroy-on-hit`,
  `lifesteal`, `self-damage`, `ball-speed`, `bounce-scaling`, `crit`,
  `wall-bounce`, `baby-ball-scaling`, `screen-clear`, `clone`,
  `friendly-fire-risk`. The vocabulary is the site's own editorial model —
  the game defines no tag system — so tag assignments and verdicts are
  content decisions, not game data.
- **Synergy verdict** — red/green indicator for an item against the selected
  characters, from tag overlap. Rules: characters carry
  `{ tag, verdict, note }`; the `*passives` wildcard matches every passive
  (only The Ballbearer uses it); with two characters selected, **red wins**
  and notes join with ` · `. Module: `src/synergy.ts`
  (`verdictFor(item, selectedChars)`) — namespace resolution is internal,
  callers pass the item only.
- **Character slot** — the selected-character list holds at most the plan's
  active character limit (2 with end-game upgrades, 1 without). Selection is
  sticky (shared with fusion picks): re-clicking a pick deselects it; adding
  past the active limit is a no-op — one must be deselected first, and the
  hint says so ("selection full — deselect one first"). One selected
  character shows the "pick a second character…" hint — only when two are
  allowed. State: `src/view-state.ts` (`toggleChar` action). The header
  chips are the selection's top-bar view; their X button is the only removal
  (the chip body is inert).
- **Plan screen** — the final-build planner: the user's end-of-run selection
  of characters, balls, and passives, shown with count badges against the
  active limits, per-entry synergy verdicts, and over-limit marks. The
  plan's characters are the shared `selectedChars` (one selection feeds
  verdicts, chips, and the plan); balls/passives ride `planBalls` /
  `planPassives` in pick order (`togglePlanItem` — the catalog resolves the
  namespace). **Fused pairs** ride `planFused` (`togglePlanFusion`): a pair
  counts as ONE ball slot, its identity is order-insensitive (sorted ids —
  the reverse composition is the same planned pair), compose order is kept
  for display, and its plan entry matches the single-ball shape: two
  compact icons side by side (36px) with the composed name — which carries
  the "×" between components — beside them, plus one per-component verdict
  badge on each icon. The **End game upgrades**
  toggle (on by default) sets the limits: 2/5/5 with it, 1/4/4 without; it
  lives in the plan toolbar's right edge (`#planUpgradesSlot` — Clear and
  Share left, toggle right, one row), built by the renderer into the
  shell's slot. **Share** (shell chrome, island-wired) encodes the current
  plan via `src/share.ts` into a versioned base64url code in the hash
  (`#/plan?p=<code>`) and copies the link; opening it hydrates the plan —
  the link IS the plan, it replaces the recipient's stored plan. The
  parameter is read once at startup and then stripped from the URL (the
  link is one-shot — a Clear plus reload does not resurrect the sender's
  plan); `decodePlan` returns null for anything that is not a v1
  code and the stored plan is used instead.
  Over-limit selections are kept and marked (red), never trimmed. The plan
  persists to localStorage (island's job: `hydrate` action on startup, save
  on every dispatch) and is wiped only by the toolbar's Clear button —
  Esc/empty-space never touch it. Module: state in `src/view-state.ts`
  (`PlanState`), painting in `src/renderer.ts` (`buildPlan`/`paintPlan`).
- **Selection box** — the balls/passives screens' view of the current
  single-item selection: shown in the screen toolbar (top left, search
  stays right; drops below the search row on mobile) only while an item of
  that screen's namespace is selected. `Selection: <name>` plus buttons:
  balls get `Add to plan` + `Add to fusion`, passives only `Add to plan`.
  Labels toggle (remove) when the item is already in the plan / fusion
  picks, and disable at the active limit (fusion also disables when both
  picks are held; Baby Ball is `unfusable` — it can never be picked).
  Selection survives adding. The fusion screen's composed panel carries the
  same plan toggle, centered below the body (`togglePlanFusion` with the
  compose order). Module: state in `src/view-state.ts`
  (`SelectionBoxState`, derived per screen), painting in `src/renderer.ts`
  (`buildSelectionBox`/`paintSelectionBoxes`).
- **Toast** — the hover/tap detail popup with icon, full effect text, recipe,
  tags, and the item's current verdict. Its verdict function is injected at
  build time (`buildAll({ getVerdict, emit })`), so hover always reads the
  current selection. Lives in `src/renderer.ts`.
- **Build seam** — the options object `buildAll({ getVerdict, emit })` hands
  the island's two callbacks to the renderer at build time: `getVerdict`
  feeds the toast, `emit(action)` is how built-in click handlers report
  selection toggles back (the whole view-state `ToggleAction`, which the
  island dispatches verbatim and paints). The renderer stays paint-only —
  it never dispatches DOM events and never depends on view state at runtime
  (its view-state imports are types only; pinned in `src/regression.test.ts`,
  the emit wiring behaviorally in `src/renderer.test.ts`).
- **Island** — the single interactive script `src/companion.ts` mounted by
  the Astro page. Owns event listening, theme, hash routing, and plan
  persistence (localStorage read→`hydrate` at startup, save on every
  dispatch) only; painting, verdict logic, graph math, and data live in
  their own modules.
  (The renderer attaches hover/tap listeners for toasts; tile/card/row
  clicks come back through the build seam's `emit`, which the island wires
  to dispatch + paint. Esc and empty-space clicks clear the active
  section's selection; nothing is cleared on a tab switch, so selections
  survive switching away and back — cross-screen remembering.)
- **Renderer** — all DOM painting for the island. Module: `src/renderer.ts`
  (recipe notation comes from `src/graph.ts`; the renderer only injects
  icon markup — see **Recipe notation**; the icon-URL join comes from
  `src/icon-url.ts`) — one interface:
  `buildAll({ getVerdict, emit })` (builds grids, character cards, the
  fusion pick list, the fusion panel skeleton, and the plan screen skeleton
  once, at startup) +
  `paint(viewModel)` (repaints state on the existing DOM; never recreates
  `<img>` elements — that would blink icons; the fusion panel's head icons
  are built once and repainted in place; the plan's entries and the
  character chips rebuild only when their selection changes — the chips'
  diff pattern). Tiles, character cards, chips, toasts, the fusion screen,
  and the plan screen live here; the ViewModel is its input and
  the test surface stays `view-state.ts`. The renderer holds no domain data
  of its own: its fusion-row map is purely a DOM-row registry, and the
  fusion panel paints by switching on the view model's named `fusionPanel`
  state — per state, which hooks show and what they show (behavior pinned
  in `src/renderer.test.ts` through jsdom).
- **View state** — the island's state (item selection, character slots,
  fusion picks, the plan's selections and upgrade toggle, per-screen search
  queries) and every derivation from it (highlight walks, filters, verdict
  badges, the composed fusion, the plan's resolved entries). Module:
  `src/view-state.ts`
  — one interface: `createViewState()` → `dispatch(action) → ViewModel`, plus
  `derive()` (same view model without a state change, for initial paint) and
  `verdictFor(item)` (full verdict with note, for the toast). Fusion picks
  share the character slots' sticky semantics (re-click deselects; a third
  pick while two are held is a no-op); the view model carries the fusion
  screen's panel state as a named 3-state machine (`fusionPanel`: `empty` /
  `pending` with the first resolved Ball / `composed` with both resolved
  Balls, the composed fusion from `src/fusion.ts`, the pair's `planned`
  mark, and `planFull` — the plan's ball slots at their active limit, which
  disables the panel's plan toggle) — derived in one
  place, so the renderer switches on the state instead of re-deriving picks
  from hidden toggles. The island listens to DOM events, dispatches, and
  hands the returned view model to the renderer; the view model is the test
  surface.
- **Fusion composer** — pure composition of a fused ball from two components:
  name "A × B" (first-selected first), component effect paragraphs in name
  order with damage rolls abstracted to "X", a role-named cross-wire line
  when a channel can carry the partner's effect (spawn/AOE carrier × on-hit
  status; AOE carrier × kill-on-hit, e.g. Black Hole × Sun; spawn carrier ×
  spawn-bound status, e.g. Glacier × Maggot), notes for the two order
  side-effects (both-cooldown pairs, same-property pairs — first-selected
  wins) and the fixed composition caveats (Destroy × Destroy, hit-once
  dominance over pass-through, spawn compensates Destroy, Dark's
  multiplier), and the evolve-instead note for 2-component evolution
  recipes. Module: `src/fusion.ts` (`fuse(a, b)`, `fusionBalls()`,
  `fusionName`, `abstractDamage`, `crossWire(a, b) → { line, disputed }`,
  `evolvesInstead`) — the
  site's editorial model of fusion, not game data; the composition rules,
  their evidence, and the full 370-pair observation corpus live in
  `docs/research/fusion-observations/` (validation methodology:
  `../docs/research/fusion-mechanics.md`, `CONTRADICTIONS.md`).

## Data provenance

- **Fact base** — `docs/research/game-mechanics.md`: hand-maintained
  transcription of ballxpit.wiki.gg tables (fetched 2026-09-13, game v1.301
  *Naturalist* update), cross-checked against the community "Ultimate Guide
  of Evolutions" charts. Effect text is verbatim from the wiki.
- **Pipeline** — `scripts/parse-wiki.ts` (fact base → `src/data/parsed.json`,
  computing depth structurally) then `scripts/emit-data.ts`
  (`parsed.json` + the hand-maintained tag/verdict maps inside it →
  `src/data/{tags,balls,passives,characters}.ts`). The five `src/data`
  outputs are generated — edit the fact base or the maps in `emit-data.ts`,
  never the generated files.
- **Icons** — 208 PNGs in `public/icons/`, downloaded from the wiki's
  MediaWiki API; provenance and the rights-holder disclaimer live in
  `public/icons/CREDITS.md`.
- **Counts** (pinned by `src/data.test.ts`): 91 balls (21 base + Baby Ball +
  69 evolved), 71 passives (54 + 17), 23 characters, 17 tags.
