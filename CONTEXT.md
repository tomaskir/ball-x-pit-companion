# Context

Domain glossary for the Ball x Pit companion site. This file is self-contained:
it names the concepts the code uses and carries the data those concepts stand on.
Workflow guidance lives in `AGENTS.md`; the game-data fact base is
`docs/research/game-mechanics.md`.

## Game vs site terminology

The wiki (ballxpit.wiki.gg) distinguishes two mechanics that fan sites conflate:

- **Evolution** — combining 2+ specific level-3 balls in the Fusion Reactor into
  a new *named* Evolved Ball (69 of them as of pre-DLC game v1.301). Modeled
  from the fact base.
- **Fusion** — merging any two unfused level-3 balls into a property-stacking
  ball with no unique identity. Modeled **editorially** on the Fusions screen:
  the game stores no fusion table (see `docs/research/fusion-mechanics.md`),
  so `src/fusion.ts` composes fused-ball text from the two components' effect
  text using community-observed rules — damage rolls abstracted to "X" (fused
  numbers are not derivable from public sources). Component paragraphs use the
  level-3 overlay (`src/data/level-3.ts`); order resolves through
  `src/fusion-properties.ts` (property-set union, first-pick scalar precedence;
  canonical statement: `docs/research/fusion-mechanics.md` §3). This is the
  site's model, not game data.

Other wiki terms used verbatim: **Base Balls** (21), **Baby Ball** (not special),
**Base Passives** (54), **Evolved Passives** (17), **Fusion Reactor**.

## Terms

- **Evolution graph** — the OR-of-ANDs recipe graph (`recipes: string[][]`).
  Ball and passive graphs are strictly separate; ids never collide across
  them.
- **Namespace** — which of the two strictly-separate collections (balls,
  passives) an id lives in. Namespace resolution is decided in one place,
  `src/catalog.ts`; callers pass the id or item only.
- **Pair key** — unordered-pair identity: the two ids sorted and joined with
  `+`, so the reverse composition is the same pair. One home: `src/pair.ts`
  (`pairKey(a, b)`, `pairKeyOf(ids)` for the array shape, `parsePair(key)`);
  the fusion composer and property model, the plan's fused pairs, the
  renderer's plan-entry identity, corpus validation, and the build graph's
  `fusion:` node ids all consume it (`fusionNodeId` / `fusionNodePair` in
  `src/build-graph.ts` build on it). The order-preserving counterpart is
  `composeKey(a, b)` ("a>b", first pick first), used where display order
  must survive while identity stays unordered (the plan's fused-entry
  content key).
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
- **Fact-base parser** — an exported pure function in `scripts/fact-bases.ts`
  that turns one hand-maintained markdown fact base into data
  (`parseRecipes`, `parseGameMechanics`, `parsePairings`, `parseLevel3`;
  `parseFactBases` composes them). Markdown tables are read through the one
  scanner in `scripts/markdown-table.ts`, which returns body rows keyed by the
  table's header cells (`column(row, 'Effect text (wiki)')`) — parsers name
  the columns they read instead of hardcoding indices.
- **Generated-data contract** — `scripts/generated-data.ts`: `emitData`
  (parsed + editorial → in-memory data), `renderGenerated` (data → the five
  file contents), and `validateGenerated` (the one invariant list). The
  `emit-data.ts` CLI runs validate before write; `src/data.test.ts` runs the
  same list against the checked-in data.
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
- **Pick list** — the sticky selection invariant, one module: a list where
  re-toggling a member deselects it, adding past capacity is a no-op, inputs
  the list's `resolve` rejects (unknown ids, non-fusable balls) are ignored,
  and restore filters unknown entries and duplicates (first occurrence wins)
  without trimming for capacity. Identity is the list's `key` (the plan's
  fused pairs use the unordered pair key); capacity is the list's `hasRoom`
  callback, which may read another list (the fused pairs share the ball
  slots). Module: `src/pick-list.ts` (`createPickList({ hasRoom, resolve,
  key })` → `{ toggle, restore, list, has }`); consumers: the character
  slots and fusion picks in `src/view-state.ts`, the plan's balls, passives,
  and fused pairs in `src/plan-state.ts`.
- **Character slot** — the selected-character list holds at most the plan's
  active character limit (2 with end-game upgrades, 1 without). Selection is
  sticky (shared with fusion picks): re-clicking a pick deselects it; adding
  past the active limit is a no-op — one must be deselected first, and the
  hint says so ("selection full — deselect one first"). One selected
  character shows the "pick a second character…" hint — only when two are
  allowed. **Pairing restrictions** (game data, the Matchmaker's forbidden
  pairs — `docs/research/character-pairings.md`): with exactly one character
  held, a forbidden partner's card is blocked (dimmed, "can't pair with …"
  tooltip); selecting it is a no-op. The relation is symmetric and lives on
  the character as `cannotPair` (generated; the False Messiah pairs with
  nobody). A forbidden pair that arrives hydrated (Share link /
  localStorage) is kept and marked red on the plan's character entries
  (`pairInvalid`) — same never-trim philosophy as over-limit; live
  selection can never produce one. State: `src/view-state.ts`
  (`toggleChar` action). The header
  chips are the selection's top-bar view; their X button is the only removal
  (the chip body is inert).
- **Plan screen** — the final-build planner: the user's end-of-run selection
  of characters, balls, and passives, shown with count badges against the
  active limits, per-entry synergy verdicts, and over-limit marks. The
  plan's characters are the shared `selectedChars` (one selection feeds
  verdicts, chips, and the plan); balls/passives ride `planBalls` /
  `planPassives` in pick order (`togglePlanItem` — the catalog resolves the
  namespace, and the pick list rejects unknown ids) — pick order is the
  storage order; the paint order is derived:
  entries sort by **complexity** (`graph.complexity` — how many base
  entities the final form contains, counted recursively; a fused pair's is
  the sum of its components', e.g. Freeze Ray × Time Bomb = 2+3 = 5), most
  complex left, ties in pick order (stable sort). **Fused pairs** ride `planFused` (`togglePlanFusion`): a pair
  counts as ONE ball slot, its identity is order-insensitive (sorted ids —
  the reverse composition is the same planned pair), the pick list's
  resolution guard rejects unknown and non-fusable components (Baby Ball),
  compose order is kept for display, and its plan entry matches the
  single-ball shape: two
  compact icons side by side (36px) with the composed name — which carries
  the "×" between components — beside them, plus one per-component verdict
  badge on each icon. The **End game upgrades**
  toggle (on by default) sets the limits: 2/5/5 with it, 1/4/4 without; it
  lives in the plan toolbar's right edge (Clear and Share left, toggle
  right, one row) as static shell markup in `index.astro` — the shell
  adapter wires its change event through the same dispatch path as the other
  toolbar buttons, and `paintPlan` only reflects the checked state on it
  (the renderer builds no shell chrome). **Share** (shell chrome, shell-wired) encodes the current
  plan via `src/plan-codec.ts` (`encodeShared`) into a versioned base64url
  code in the hash (`#/plan?p=<code>`) and copies the link; opening it
  hydrates the plan — the link IS the plan, it replaces the recipient's
  stored plan. The parameter is read once at startup (`takeShareParam`) and
  then stripped from the URL (the link is one-shot — a Clear plus reload
  does not resurrect the sender's plan; the strip happens only when the
  parameter actually decoded); `decodeShared` returns null for anything that
  is not a v1 code and the stored plan is used instead. The shell keeps the
  clipboard transport; the island keeps `history.replaceState` and the
  location reads — the link's URL half is `src/share.ts`, the codec is
  `src/plan-codec.ts`.
  Over-limit selections are kept and marked (red), never trimmed. The plan
  persists to localStorage through **`src/plan-session.ts`** (`restore` at
  startup → `hydrate` action; `save` after every dispatch, skipping the write
  when the plan is unchanged) and is wiped only by the toolbar's Clear button —
  Esc/empty-space never touch it. The persistence currency is
  **`SharedSnapshot { plan, chars }`**: `plan` is the plan's own fields
  (`PlanSnapshot`, owned by `src/plan-state.ts`), `chars` is the shared
  selection (owned by `src/view-state.ts`); the codec declares the plan's
  field list once and normalizes shape, while `hydrate` keeps the deeper
  validation (unknown ids, degenerate pairs). Module: state in
  `src/plan-state.ts` (`createPlanState` — the `PlanState` derivation, the
  `PlanSnapshot` currency, and the capacity/toggle invariants), forwarded and
  embedded into the ViewModel by `src/view-state.ts`; painting in
  `src/renderer.ts` (`buildPlan`/`paintPlan`, plus the build graphs —
  see **Build graph**).
- **Build graph** — the Plan screen's layered "how do I build this" view
  (one collapsible panel per namespace, under the plan sections): every
  planned item plus its full component ancestry as ONE deduped graph —
  fixed rows Base → Evolved → Tier-3, plus a Fusions row for balls only
  (passives have no fusions). Nodes are one per id with a copies-needed
  count: min-sum/max-sum over alternate paths — a mandatory recipe slot
  adds {1,1}, a per-slot alternate {0,1} — so shared bases sum across
  targets and alternates read as ranges ("0-1", "1-2"); a ball both
  planned and demanded by a planned fusion counts twice (physical copies).
  Planned targets are styled `final` in place; a planned pair that Evolves
  instead of Fusing is just a way of building the evolved ball, so it
  becomes a single target of the result. SVG connector edges run
  component → builder (alternates included — the line shows the possible
  path). Fusion-row node ids carry the `fusion:` prefix: the row lives
  outside the catalog namespace (the no-collision invariant). Clicking a
  node focuses it — the node plus its full upstream AND downstream chains
  light, the rest dims (a base ball has no upstream, a fusion no
  downstream; "both directions" covers both). **Done marks** track a run:
  evolved/T3/fusion nodes carry a green check (`toggleGraphDone`, its own
  button inside the node card — the card itself is a div so interactive
  elements never nest); a done node stops contributing demand, so all
  counts read REMAINING copies this run, and a node whose remaining demand
  hit zero only through done marks is suppressed (dimmed, no check — base
  balls free themselves this way). Done/suppressed nodes read as disabled
  and sort to the right of everything still needed in their row. Done
  marks, focus, and collapse flags
  are session-only (never persisted; clearPlan wipes the marks).
  Over-limit entries stay out
  of the graph; a panel with nothing to show carries a hint. Pure
  derivation + layout in
  `src/build-graph.ts`: `deriveBuildGraphView(planState, { focus, done,
  collapsed })` owns the graph's inputs (targets, including Evolves-instead
  resolution), both namespace graphs, focus validation, the related-set
  walk, and the row model (row counts, fusion row index, labels);
  `deriveBuildGraph`/`layoutBuildGraph` are its pure parts, unit-tested in
  `src/build-graph.test.ts`. `src/view-state.ts` only embeds the result
  (`vm.buildGraph`; focus, collapse, and done marks ride
  `toggleGraphFocus`/`toggleGraphCollapse`/`toggleGraphDone` through the
  build seam); painting in `src/renderer.ts` (`paintBuildGraphs` — the
  canvas rebuilds through the reconcile seam on structural change only
  (which nodes/edges exist — the key is order-insensitive, so a pure
  reorder is not a rebuild); counts, done/suppressed state, positions,
  edge paths, and the focus highlight repaint in place by `data-id`, so a
  done-mark toggle never recreates the graph's imgs).
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
  compose order). Plan membership and capacity are queried from the plan
  state (`has`, `counts`, `limits` — see **Plan state**), never read from
  plan internals. Module: state in `src/view-state.ts`
  (`SelectionBoxState`, derived per screen), painting in `src/renderer.ts`
  (`buildSelectionBox`/`paintSelectionBoxes`).
- **Toast** — the hover/tap detail popup with icon, full effect text, recipe,
  tags, and the item's current verdict. Its verdict function is injected at
  creation and reads the view model `paint(vm)` last captured, so hover
  shows exactly the verdict the tile was painted with (no second read into
  live view state). Module: `src/toast.ts` (`createToast({ getVerdict })` →
  `{ showFor(anchor, item), hide(), bind(anchor, getItem), destroy() }`) —
  the whole lifecycle (build, show, hide, position, one-at-a-time
  replacement, anchor binding, and the document-level outside-tap
  dismissal) lives there; the renderer creates the adapter once per
  `buildAll` and only binds anchors (tiles and base-ball chips) to it. The
  dismissal is the adapter's own document `pointerdown` listener — a tap
  outside the toast and outside the bound anchors hides it (the touch
  dismissal the old renderer comment promised but never wired); it neither
  dispatches nor interferes with the island's empty-space clear policy.
- **Build seam** — the options object `buildAll({ emit })` hands the
  island's callback to the renderer at build time: `emit(action)` is how
  built-in click handlers report actions back — selection toggles and the
  fusion order swap (the whole view-state `ToggleAction`, which the island
  dispatches verbatim and paints). `paint(vm)` captures the latest view
  model in the seam, which is where the toast's verdict comes from. The
  renderer stays paint-only —
  it never dispatches DOM events and never depends on view state at runtime
  (its view-state imports are types only; pinned in `src/regression.test.ts`,
  the emit wiring behaviorally in `src/renderer.test.ts`).
- **Island** — the single interactive script `src/companion.ts` mounted by
  the Astro page. Composition root for the shell adapter, the renderer, and
  view state: owns hash routing and the plan persistence transport only;
  painting, verdict logic, graph math, and data live in their own modules.
  The save/load/share lifecycle is **`src/plan-session.ts`**:
  `restore({ storage, hash }) → { shared, stripUrl }` owns the startup
  precedence (a decodable share parameter beats the stored plan), the
  one-shot strip (only a decoded parameter earns it), and corrupt-storage
  tolerance (garbage reads as "no stored plan", never an exception);
  `save(storage, shared)` owns serialization and skips the write when
  storage already holds that exact serialization — and when nothing is
  stored and the snapshot is the codec's default, so a fresh browser's no-op
  dispatch creates no entry and search keystrokes and Esc clears do not
  rewrite the plan. The island hands in the real storage and hash, applies
  `stripUrl` through `history.replaceState`, and dispatches `hydrate` when
  `restore` returns a plan.
  (The renderer attaches hover/tap listeners for toasts; tile/card/row
  clicks come back through the build seam's `emit`, which the island wires
  to dispatch + paint. Esc and empty-space clicks clear the active
  section's selection; nothing is cleared on a tab switch, so selections
  survive switching away and back — cross-screen remembering.) The static
  shell's controls — theme, tabs, per-screen search, the plan toolbar
  (Clear, End game upgrades, Share), and the document-level Esc /
  empty-space handlers — live in **`src/shell.ts`**:
  `createShell({ ports, dispatch, snapshot })` returns
  `{ showSection, destroy }`, keeps every listener and the share flash
  timer in one registry, and `destroy()` removes them all. The decisions
  behind the routing, the clear policy, and theme resolution are pure
  functions in **`src/companion-core.ts`** (`sectionFromHash`,
  `shouldClear`, `themeFromStorage`) — the island and shell are their
  transport, reading real events/storage and applying the results to the
  DOM. The click-exemption question is DOM-shaped and lives in
  **`src/clear-exempt.ts`**: the painters and the shell stamp
  `markClearExempt(el)` on each interactive region at creation time, and
  `shouldClear` composes the shell's `isClearExempt(target)` answer with
  the section rule — no region list lives in the policy. The startup
  sequence itself is callable: **`startIsland(ports)`**
  composes shell + renderer + view state with injected **ports** for every
  environment touchpoint (storage, location/history, clipboard, the OS
  color-scheme query) and returns a disposer for everything it wired; a
  second `startIsland` on the same document disposes the first instead of
  double-wiring. The module top level keeps only a guard that calls
  `startIsland(realPorts())` when the mount point (`#ballsGrid`) exists, so
  the browser path is unchanged and jsdom imports and drives the island
  with stub ports (`src/companion.test.ts` — startup precedence, the
  one-shot strip, corrupt-storage survival, save-on-every-dispatch, the
  clipboard fallback chain, and total disposal are all pinned behaviorally
  there; `src/shell.test.ts` pins the shell wiring without an island
  mount).
- **Renderer** — all DOM painting for the island. Module: `src/renderer.ts`
  (recipe notation comes from `src/graph.ts`; the renderer only injects
  icon markup — see **Recipe notation**; the icon-URL join comes from
  `src/icon-url.ts`) — one interface:
  `buildAll({ emit })` (builds grids, character cards, the
  fusion pick list, the fusion panel skeleton — the named
  `FUSION_PANEL_SKELETON` export, which the tests pin directly instead of
  scraping source, plus its `FUSION_PANEL_SELECTORS` hook map, the one source
  for both the panel's queries and the skeleton test — and the plan screen
  skeleton
  once, at startup) +
  `paint(viewModel)` (repaints state on the existing DOM; never recreates
  `<img>` elements — that would blink icons; the fusion panel's head icons
  are built once and repainted in place; the plan's entries and the
  character chips rebuild only when their content key changes — the
  renderer's internal **reconcile seam** (`reconcile.ts`, one painted-key
  map shared by the chips, the plan sections, the panel icons, the fusion
  result rows and exceptions, and the build graphs), which is the diff
  cache only). Once-built click handlers get the action they act on from a
  separate **action-slot adapter** (`action-slot.ts`, `bindAction(el, emit)
  → { set(action), clear() }`): the slot holds the whole typed
  `ToggleAction` and its click listener, refreshed by every repaint, so no
  handler splits a string to reassemble an action and no second stashed
  state lives beside it.
  Tiles, character cards, chips, toasts, the fusion screen,
  and the plan screen live here; the ViewModel is its input and
  the test surface stays `view-state.ts`. The renderer holds no domain data
  of its own and builds no shell chrome (the plan toolbar — Clear, Share,
  and the End game upgrades toggle — is static `index.astro` markup wired by
  the shell adapter, `src/shell.ts`): its fusion-row map is purely a DOM-row
  registry, and the
  fusion panel paints by switching on the view model's named `fusionPanel`
  state — per state, which hooks show and what they show (behavior pinned
  in `src/renderer.test.ts` through jsdom). The order presentation is
  components-first: below the component paragraphs sit the built-once
  "Fused result" rows (property label, final value, winning ball, `· reported`
  on unverified rows), the separate "Reported exceptions" section, and — for
  order-sensitive pairs — a warning line directly above the action row's
  `[Swap order] [Add to plan]`. The "Fused result" section appears only when
  the pair has shared-property collisions; a pair with no shared properties
  shows no result section at all (and no swap unless an exception makes it
  order-sensitive). The swap button is built once and
  hidden unless `orderSensitive`; it emits `swapFusion` through the build
  seam. The facade composes internal painters under `src/renderer/`
  (grids, characters, chips, fusion-screen, plan, build-graphs,
  selection-box) that share the reconcile seam (`reconcile.ts` — the
  content-diff cache), the action-slot adapter (`action-slot.ts` — the
  once-built click channel), the build seam (`seam.ts` — the emit callback
  and toast adapter), and the DOM/label helpers (`dom.ts`, `labels.ts`); the
  public interface stays `buildAll`/`paint`.
- **Plan state** — the plan screen's state and derivation as their own
  module: the End game upgrades toggle, the planned balls/passives/fused
  pairs, and the resolved `PlanState` the renderer paints. Module:
  `src/plan-state.ts` — one interface: `createPlanState()` →
  `dispatch(planAction)` / `derive(selectedChars) → PlanState` /
  `snapshot() → PlanSnapshot`, plus the membership queries the
  rest of the app reads instead of plan internals (`has(id)`,
  `hasPair(a, b)`) and `limits()`. The seam is "selectedChars in, PlanState
  out": the plan's characters are the shared `selectedChars`, owned by
  `src/view-state.ts` — plan-state never mutates them (clearPlan clears
  them in view-state). `PlanSnapshot` carries only the plan's own fields;
  the persistence currency is `src/plan-codec.ts`'s
  `SharedSnapshot { plan, chars }`, which pairs it with the shared
  selection. The codec declares the plan's field list once and normalizes
  shape; `hydrate` applies it through a field-keyed restore table and keeps
  the deeper validation (unknown ids, degenerate pairs). The ball
  grid the renderer paints is one merged, complexity-ordered list
  (`PlanBallEntry`: a single or a fused pair — a pair is ONE entry), not
  two lists the renderer concatenates. The three lists are pick lists
  (`src/pick-list.ts`): the sticky toggle, capacity guard, resolution guard,
  and duplicate-free restore live there, not here. The ball-slot rule (a
  fused pair counts as ONE slot) is one internal definition, not one per
  call site; it is the fused list's `hasRoom` callback. `isFusable` (the one
  fusable-set definition) lives beside `fusionBalls()` in `src/fusion.ts`.
- **View state** — the island's state (item selection, character slots,
  fusion picks, per-screen search queries) and every derivation from it
  (highlight walks, filters, verdict badges, the composed fusion, the
  selection boxes). Module: `src/view-state.ts`
  — one interface: `createViewState()` → `dispatch(action) → ViewModel`, plus
  `derive()` (same view model without a state change, for initial paint).
  The toast reads its verdict from the painted `tiles` map, not from a
  separate view-state accessor. The plan is
  not state of its own here any more — see **Plan state**: view-state
  forwards the plan actions verbatim and embeds the derived `PlanState` in
  the view model, handing the shared `selectedChars` in on every derive; it
  owns the chars half of the `SharedSnapshot` (restored on hydrate) and
  supplies `sharedSnapshot()` for persistence. Fusion picks
  are a pick list like the character slots (re-click deselects; a third
  pick while two are held is a no-op; unknown and non-fusable ids are
  rejected) — the same `src/pick-list.ts` module the plan's toggles use; the
  view model carries the fusion
  screen's panel state as a named 3-state machine (`fusionPanel`: `empty` /
  `pending` with the first resolved Ball / `composed` with both resolved
  Balls, the composed fusion from `src/fusion.ts`, the pair's `planned`
  mark, `planFull` — the plan's ball slots at their active limit, which
  disables the panel's plan toggle — the result presentation: `resultRows`
  (the composer's `collisions` mapped to display rows), `exceptions` (its
  reported exceptions mapped to display rows carrying `source`,
  `confidence`, and `orderDependent`), and the `showResult` /
  `showExceptions` visibility flags — and the order presentation:
  `orderSensitive`, `orderNotice`). That panel derivation and the fusion hint
  live in **Fusion panel** (`src/fusion-panel.ts`); view-state hands the
  picks and plan facts in and embeds the result, so the renderer switches
  on the state instead of re-deriving picks from hidden toggles.
  `swapFusion` reverses the two picks (a,b → b,a) and
  recomputes the panel; it is a no-op with fewer than two picks. The island listens to DOM events, dispatches, and
  hands the returned view model to the renderer; the view model is the test
  surface.
- **Fusion panel** — the fusion screen's panel derivation as its own module:
  the named 3-state machine (`empty` / `pending` / `composed`), the composed
  state's presentation (the "Fused result" and "Reported exceptions" display
  rows plus their section visibility, and the order-sensitive warning), and
  the panel's hint text. Module:
  `src/fusion-panel.ts` — one interface:
  `deriveFusionPanel(picks, plan) → { panel, hint }`. The seam is "pick order
  + plan facts in, panel state out": the module resolves the picks through
  the catalog, composes through `src/fusion.ts`, and reads only the plan
  facts it needs (`hasPair` for the `planned` mark, `ballSlots` for
  `planFull`). It never imports view-state (no runtime cycle); view-state
  embeds the result in the ViewModel (`fusionPanel`, `fusionHint`), so the
  renderer's named-state contract is unchanged.
- **Fusion composer** — pure composition of a fused ball from two components:
  name "A × B" (site display; the English game name is "A X B" and the
  separator is localized; first-selected first; canonical statement:
  `docs/research/fusion-mechanics.md` §1), component effect paragraphs
  in selection order with damage rolls abstracted to "X", a role-named
  cross-wire line when a channel can carry the partner's effect (spawn/AOE
  carrier × on-hit status; AOE carrier × kill-on-hit, e.g. Black Hole × Sun;
  spawn carrier × spawn-bound status, e.g. Glacier × Maggot), structured
  property-set union with first-pick scalar precedence (shared scalar keys
  collide; the first-selected value wins) and reported exceptions for the
  panel's Fused result / Reported exceptions sections, the fixed composition
  caveats (Destroy × Destroy, hit-once dominance over pass-through, spawn
  compensates Destroy, Dark's multiplier), the reported spawn-inheritance
  caveats (Brood Mother degradation + trigger limit, Mosquito King trigger
  limit, Egg Sac weaker clone), and the evolve-instead note for 2-component
  evolution recipes. Module: `src/fusion.ts` (`fuse(a, b)`,
  `fusionBalls()`, `fusionName`, `abstractDamage`, `crossWire(a, b) →
  { line, disputed, spawnerId }`, `evolvesInstead`); the composition rules and
  order model are stated canonically in `docs/research/fusion-mechanics.md`
  §2-§3, with §3 implemented by `src/fusion-properties.ts`, which resolves
  the per-ball kits in `src/ball-kit.ts` (level-3 scalars and application
  channels in one hand-maintained table). The evidence behind the composer's
  classifications lives in `src/fusion-knowledge.ts`, exposed as questions:
  `wireFor(a, b) → Wire | null` returns the structured cross-wire (branch,
  carrier, carried effect, disputed bit, spawner id) with the four branches,
  their priority, and the per-branch capability predicates kept private,
  alongside the one application-channel
  classifier `channelsOf` (reads the kit table and falls back to the
  status-text heuristic for unrecorded balls; the property model and the
  cross-wire model consume the same table, and it resolves Timestop to
  `field`, so a field freeze never carries an on-hit status), and the one
  reported-fact table (`FUSION_FACTS`: caveat prose plus the reported
  exceptions, each with source and confidence, resolved by `factsFor()`).
  `fusion.ts` composes and renders the wire line; the knowledge module
  classifies and carries the reported facts, and `fuse()` names no pair. This is the
  site's editorial model of fusion,
  not game data; the evidence and the observation
  corpus live in `docs/research/fusion-observations/` (counts derive from
  `fusion-pairs.json`; corpus shape and validation: `src/corpus.ts`
  (`loadCorpus`, `pair`, `wirePairs`, `generalRules`, `validateCorpus`); validation methodology:
  `docs/research/fusion-mechanics.md`,
  `docs/research/fusion-observations/CONTRADICTIONS.md`; claim audit
  (historical snapshot): `docs/research/fusion-claim-register.md`).
- **Ball kit** — one ball's fusion properties: its level-3 scalar values and
  its application channels, recorded together in the one hand-maintained
  table `BALL_KIT` (`src/ball-kit.ts`). The order model unions two kits
  (`resolveProperties`); the wire model reads the same channels through
  `channelsOf` / `statusChannel`. A ball absent from the table has no recorded
  kit and falls back to the status-text heuristic.
- **Spawn carrier** — a ball whose tags include a spawn tag
  (`spawns-baby-balls`, `spawns-allies`, `clone`). Its spawn channel can carry
  a partner's on-hit status across a fusion (the spawn branches of
  `wireFor()` in `src/fusion-knowledge.ts`). Voluptuous Egg Sac is the only hard exclusion: its two-hop
  chain drops the partner property.
- **Status-only spawn carrier** — a spawn carrier whose babies inherit only
  the partner's on-hit status, not spawn-bound traits (Brood Mother, Mosquito
  King). Their inheritance is reported; Brood Mother's is degraded;
  spawn-bound statuses (Glacier/Blizzard) stay unwired for both.
- **Trigger-matrix source reading** — the governing reading of the trigger
  matrix: AOE damage cannot trigger On-Hit effects (an AOE tick is not a hit),
  while spawned units can trigger the original's abilities. Supersedes the
  earlier target reading; canonical statement in
  `docs/research/fusion-mechanics.md` §2c.

## Data provenance

- **Fact base** — `docs/research/game-mechanics.md`: hand-maintained
  transcription of ballxpit.wiki.gg tables (fetched 2026-09-13, pre-DLC game
  v1.301 *Naturalist* update), cross-checked against the community "Ultimate
  Guide of Evolutions" charts. Effect text is verbatim from the wiki. The
  overview catalog is **level-1** text; fusion consumes the level-3 overlay
  `src/data/level-3.ts` (generated from `docs/research/level-3-effects.md`).
- **Pipeline** — `scripts/fact-bases.ts` parses the fact base, the Matchmaker
  pairing fact base `docs/research/character-pairings.md`, and the level-3
  overlay `docs/research/level-3-effects.md` (computing depth structurally);
  `scripts/parse-wiki.ts` writes the result to `src/data/parsed.json`.
  `scripts/generated-data.ts` turns that plus the hand-maintained maps in
  `scripts/editorial.ts` into `src/data/{tags,balls,passives,characters,
  level-3}.ts`, validating before writing. The six `src/data` outputs are
  generated — edit the fact bases or `scripts/editorial.ts`, never the
  generated files.
- **Icons** — 208 PNGs in `public/icons/`, downloaded from the wiki's
  MediaWiki API; provenance and the rights-holder disclaimer live in
  `public/icons/CREDITS.md`.
- **Counts** (pinned by `src/data.test.ts`, pre-DLC v1.301): 91 balls (21
  base + Baby Ball + 69 evolved), 71 passives (54 + 17), 23 characters, 17
  tags.
