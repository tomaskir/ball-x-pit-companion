# Context

Domain glossary for the Ball x Pit companion site. Data provenance and
design decisions live in `.scratch/ball-x-pit-companion/map.md` and
`docs/research/game-mechanics.md`; this file names the concepts the code uses.

## Terms

- **Evolution graph** — the OR-of-ANDs recipe graph (`recipes: string[][]`).
  Ball and passive graphs are strictly separate; ids never collide across
  them (ticket 03).
- **Depth** — evolution tier computed from recipe structure, not wiki labels:
  0 = basic, 1 = evolved (recipe includes a base ball only), 2 = tier-3
  (recipe includes an evolved component). Rule lives in `src/graph.ts`
  (`structuralDepth`); the parser resolves components recursively around it.
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
  the Astro page. Owns DOM painting only; verdict logic, graph math, and
  data live in their own modules.
