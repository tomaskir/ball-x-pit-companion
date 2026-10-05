# Ball x Pit — Fusion mechanics

Distilled knowledge about **Fusions** — merging any two unfused level-3 balls
into a property-stacking ball with no unique identity. Companion to
`game-mechanics.md`, which covers the 69 named **Evolutions**; the wiki's own
terminology distinction is in `CONTEXT.md`.

This file is hand-maintained (evidence accessed 2026-10-01..04, game v1.301)
and is **not parsed by the data pipeline** — unlike `game-mechanics.md`, no
script consumes it. The fusion composer `src/fusion.ts` implements the model
described here, and `src/corpus.test.ts` gates that implementation against the
observation corpus (below), so a composer change, a corpus refresh, or a
change of mind here must keep the tests green.

**Evidence base**: `fusion-observations/` — a harvest corpus of 1,035
observations over **370 distinct pairs** from community sources (forum
archives, community hubs, video descriptions, non-English wikis, datamined
game files, and the site author's playtests), with a curated layer
(`fusion-pairs.json`: 31 verified / 96 inferred / 218 unverified / 25
contradicted) and a contradiction register (`CONTRADICTIONS.md`). Raw
community claims are kept verbatim there with sources and dates; this file
names no sites or users by policy.

---

## 1. What a fusion is

- Made by fusing **2 unfused level-3 balls** in the Fusion Reactor. Base+base,
  evolved+evolved, and base+evolved all work (evolved×evolved is confirmed by
  an official achievement). A ball cannot be fused with itself.
- A pair whose **2-component evolution recipe** exists Evolves instead — the
  reactor will not offer the fusion. Pairs whose only shared evolution needs
  3+ balls can still fuse.
- A fused ball is **terminal**: it cannot fuse again, cannot evolve, and is
  never an evolution component.
- **Name** is `"A × B"` with A = first-selected (separator is
  language-dependent). Icon usually comes from the first pick, colour from the
  second; the sprite *sometimes* differs by order; description paragraphs list
  components in selection order.
- Whether the fused ball is level 1 or level 3 on creation is **disputed**
  (two sources say complete at level 3, one says level 1); whether fusion
  below level 3 is possible at all is also disputed (one tips column says
  yes-but-wasteful; the Korean wiki says level-3 only).

### 1.1 There is no fusion table — the result is a rule, not a row

The single most load-bearing finding of the research:

- Datamined game files (build 1.288) contain **evolution recipes only**
  (`MergeComponents`); the strings "fuse/fusion/combo/order" appear zero
  times. The decompiled upgrade class has no fused-effect field.
- A runtime BepInEx reader (build 1.301) confirms the live game serialises
  fusion choices as ordered pairs with an AI score and a "bad combo" flag —
  but no result name and no result effect text. The save stores only
  per-pair fusion **discovery counters** (a 90×90 matrix), not definitions.
- The fused tooltip is therefore **assembled at runtime from the two
  components' templates**. It predicts composition by concatenation and cannot
  know about trigger-channel exclusions or fixed trait priorities —
  **trust observed behaviour over the tooltip** (documented mismatches:
  Satan × Hemorrhage promises a %-HP cross-wire that does not fire; Assassin ×
  Voluptuous Egg Sac advertises pass-through that spawned balls do not get).

Consequences:

- A "complete fusion list" is a **derivation**: the pair space is C(90,2) ≈
  4005 minus evolution-reserved pairs (the wiki's own counts — 7836 vs 7921 —
  are editor arithmetic; treat any exact count as unverified).
- **Fused-ball numbers (damage/procs/cooldowns of the merged ball) are not
  derivable from any public source.** The site abstracts damage rolls to "X"
  and presents ability composition, never fabricated numbers.
- The game *does* recompute some component stats at merge time. Observed
  per-ball overrides (thresholds −1, spawn counts +1, proc chances up) are
  transcribed in `FUSED_STATS` in `src/fusion.ts`, keyed by exact catalog
  substring so a wiki rewording fails loudly instead of corrupting text.

---

## 2. Composition rules — how two kits combine

The rules below are community-observed (not datamined) and are the site's
editorial model. Weighting used throughout the corpus: site-author playtest >
controlled community test > mechanism-backed claim > structured guide >
single anecdote > second-hand report.

### 2a. The seven composition rules (Korean wiki)

1. Different AOE/range attacks → the fused ball has the range of both.
2. AOE + status → enemies hit in the range also suffer the status.
3. AOE + additional ball creation → created balls have the same range.
4. Different statuses → both apply simultaneously.
5. Same status, different numbers → limits/effects are **blended** (e.g.
   Leech + Sacrifice keeps both application channels, max 20).
6. Status + ball creation → created balls also carry the status.
7. Ball creation + ball creation → both effects, amounts adjusted.

### 2b. Status-vs-spawn (the cross-wire rule)

A partner's **on-hit status effect** fires from the fused ball's other hits;
effects bound to **spawned sub-entities** (icicles, spikes, babies) do not.
Playtest-confirmed three ways by the site author: Overgrowth × Flash
cross-wires, Flicker × Radiation Beam cross-wires, Flash × Glacier does not.

### 2c. Trigger-channel limits (refinement of 2b)

Whether a partner's effect rides the other component depends on the **trigger
channel**, not just the effect kind:

- Satan's full-screen judgment is **debuff-only** (no damage judgment): it
  cannot fire Hemorrhage's %-HP proc nor Reaper's on-impact kill — but it
  *does* apply Black Hole's instant kill (an instant-kill is a debuff).
- Reaper's kill fires from Flash/Flicker hits and from baby balls, not from
  Satan's AOE.
- Blizzard's freeze is positional (spawned icicles), Freeze Ray's freeze is
  bound to the beam path — neither rides a partner's hits.

### 2d. Spawn-channel exceptions

- **Two-hop drop**: Voluptuous Egg Sac spawns Egg Sacs that spawn balls — a
  partner property is lost at the second hop (tooltip still advertises it).
- Brood Mother's spawn channel does not carry the partner's property at all.
- Mosquito King's spawn-on-hit does not fire from the partner's screen hits.

### 2e. Fixed trait priorities and caveats (commutative — not order effects)

- **Hit-once + cooldown is dominant**, pass-through recessive: pairing a
  cooldown ball (Egg Sac, Dark, Bomb, Black Hole, Timestop, Nuclear Bomb,
  Voluptuous Egg Sac) with a pass-through ball keeps hit-once+cooldown and
  loses pass-through, regardless of order.
- Assassin's "cannot pierce the back" wins over a partner's pierce; Warp is
  cast before a partner's pierce.
- **Destroy × Destroy**: fusing two self-destructing balls may lose one of the
  two effects.
- **Spawn compensates Destroy**: spawned clones/babies keep the fused ball
  alive (Cell × Bomb is the known "indestructible bomb" example).
- **Dark's damage multiplier carries into the fusion** — Dark is prized as
  fusion material for exactly this.
- **9999 is a display cap, not a real cap**: computed damage ranges above 9999
  with per-hit pop-ups pinned at 9999 have been observed; on-screen numbers
  understate hard-hitting fusions.

---

## 3. Order — when does it matter?

The controlled evidence (one community test of ~60 pairs in **both orders**,
plus the wiki and multiple independent reports, plus the site author's
playtests) says:

1. **Always, cosmetically.** Name, icon, colour, damage-number colour,
   sometimes sprite, description paragraph order follow selection order.
2. **Same-property pairs (function).** When both balls implement the *same
   exact property*, the first-selected ball's variant wins and the second's is
   excluded. Known pairs: Mosquito Swarm × Mosquito King (spawn variant),
   Radiation Beam × Nuclear Bomb (radiation duration 15 s vs infinite),
   Noxious × Poison (max stacks). Same-status-different-numbers pairs instead
   *blend* (rule 5 above).
3. **Both-cooldown pairs (function).** When both balls list their own cooldown
   (7 balls: Black Hole, Bomb, Dark, Egg Sac, Voluptuous Egg Sac, Nuclear
   Bomb, Timestop), the first-selected ball's cooldown wins. Worked example:
   Black Hole × Timestop fires every 5 s one way, every 20 s the other.
   21 unordered pairs.
4. **Otherwise order does not matter** for stats, abilities, or cross-wiring.

**Pool recursion** (order-adjacent, but not a fusion effect): the
**first-selected base ball** is consumed and does not reappear in the
level-up/fusion pool for the rest of the run; select it second to keep it.
Scope (base balls only vs any ball) is disputed; the base-ball reading is
better evidenced.

**Folklore, refuted.** A Japanese guide prescribes a fixed order for 8 of its
favourite pairs (transcribed as an 11-row table by a second page — one source
lineage, not two confirmations). All 8 are cross-property pairs, so neither
real order rule applies; the controlled test covered several in both orders
with zero difference; the guide's own comment section says only the
description order differs. Best explanation: the fused *name* follows
selection order, and the naming convention was converted into a functional
caution without testing. Community "which ball first" folk rules contradict
each other on direction and are unnecessary given the controlled result.

---

## 4. Game-file evidence and its limits

- Evolution recipes in the dump match this repo's fact base with zero
  contradictions (including all "or" alternates and the 3-/4-way recipes), so
  the dump doubles as a fact-base cross-check source.
- No fusion semantics are visible in any dump: no table, no order field, no
  fused-name format string.
- The save's 90×90 fusion-discovery counter matrix would be machine-readable
  evidence of directed pairs — but no published dump of a *completed* matrix
  exists, so whether the game records order is unverified.
- "First-selected" vs "acquisition order" is unresolved: the wiki once claimed
  fusion order cannot be manually selected, while the live game's ordered
  fusion slots describe click-order selection. One UI observation would settle
  it.

---

## 5. Known bugs and quirks

- **Fusion offer may not appear with exactly two level-3 balls** in inventory;
  a third level-3 ball unblocks it. Reported across independent threads on
  unrelated pairs — a general UI bug, not pair-specific.
- **Nosferatu fusions** are repeatedly reported as run-breaking (disabling all
  special balls, 0-damage states) — outcome appears build/patch-dependent.
- Multiple simultaneous screen-type fusions reportedly interact/bug out
  regardless of order.

---

## 6. Corpus maintenance

- The raw harvest layer (`fusion-observations/*.jsonl`) is **frozen** —
  contradictions are records, not errors; both sides stay. Resolution happens
  only in the curated layer (`fusion-pairs.json`) and this file.
- `CONTRADICTIONS.md` is the register of the 25 contradicted / 26
  order-disputed pairs and the known corpus issues (anchor rows filed on
  stand-in pairs, `obs_count` semantics, one attribution splice not to cite).
  Read it before treating any pair's observation count as evidence weight.
- Refresh routes (occasional, not part of the data pipeline): forum archive
  APIs keyed on the "A × B" naming convention (heavily rate-limited),
  community-hub screenshot/discussion search, video metadata. The durable
  artifact is the corpus itself, never the live APIs.
- Validate a refreshed corpus with
  `node --experimental-strip-types scripts/harvest/validate-observations.ts`.

---

## Uncertainty summary

- The two functional order rules (same-property, both-cooldown) are
  **reported, never playtested here** — one playtest each (Mosquito Swarm ×
  Mosquito King; Black Hole × Timestop) would upgrade them to observed.
- One playtest of Satan × Hemorrhage on a boss would settle the cleanest
  tooltip-vs-behaviour mismatch (§1.1).
- Fused-ball level on creation and sub-level-3 fusion remain disputed (§1).
- The stat-merge formula for fused balls is unknown publicly; only the
  per-ball overrides in `FUSED_STATS` are observed.
- Whether the save format records directed fusion pairs (NumCombos symmetry)
  is unverified (§4).
- Corpus coverage is ~3% of the pair space but concentrated on the meta; pair
  counts from any single harvest session are a floor, not a ceiling.
- Demo-era claims (pre-release builds) may describe different builds; several
  contradictions in the register are of this kind.
