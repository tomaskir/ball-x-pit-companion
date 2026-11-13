# Ball x Pit — Fusion mechanics

Distilled knowledge about **Fusions** — merging any two unfused level-3 balls
into a property-stacking ball with no unique identity. Companion to
`game-mechanics.md`, which covers the 69 named **Evolutions**; the wiki's own
terminology distinction is in `../../GLOSSARY.md`.

This file is hand-maintained (evidence accessed 2026-10-01..04 and
2026-11-09..11, game v1.301, **pre-DLC** — re-verify version-dependent claims
after the Risen Ballbylon release, 2026-11-12) and is **not parsed by the data
pipeline** — unlike
`game-mechanics.md`, no script consumes it. The fusion composer `src/fusion.ts`
implements the model described here, and `src/corpus.test.ts` gates that
implementation against the observation corpus (below), so a composer change, a
corpus refresh, or a change of mind here must keep the tests green. The
2026-11-11 audit trail behind these claims is
`fusion-claim-register.md` (a historical pre-resolution snapshot; see §6 of
this file for the current counts).

**Evidence base**: `fusion-observations/` — a harvest corpus of 1,035
observations: **977 pair-filed rows over 370 distinct pairs** (the other 58
are global `composition-rule` rows with no pair), from community sources
(forum archives, community hubs, video descriptions, non-English wikis,
datamined game files, and the site author's playtests), with a curated layer
(`fusion-pairs.json`: after the 2026-11-11 resolution pass, 49 verified / 97
inferred / 218 unverified / 6 contradicted) and a contradiction register
(`CONTRADICTIONS.md`). Raw community claims are kept verbatim there with
sources and dates; this file names no sites or users by policy.

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
- **Name**: the site displays `"A × B"` with A = first-selected. The English
  game name is `"A X B"`; the separator is localized, so `×` is the site's
  display choice. Icon usually comes from the first pick, colour from the
  second; the sprite *sometimes* differs by order; description paragraphs list
  components in selection order.
- The fused ball is **level 3 on creation** (in-game fused tooltips in
  `images.jsonl` all show Level 3); whether fusion below level 3 is possible
  at all is disputed (one tips column says yes-but-wasteful; the Korean wiki
  says level-3 only).

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

- A "complete fusion list" is a **derivation**: the unordered pair space is
  C(90,2) ≈ 4005 minus evolution-reserved pairs (the wiki's own ordered-pair
  counts — 7836 vs 7921 — are editor arithmetic; treat any exact count as
  unverified).
- **Fused-ball numbers (damage/procs/cooldowns of the merged ball) are not
  derivable from any public source.** The site abstracts damage rolls to "X"
  and presents ability composition, never fabricated numbers.
- Observed fused tooltips show per-ball values (thresholds −1, spawn counts
  +1, proc chances up) that match the **level-3 base values**, transcribed in
  `docs/research/level-3-effects.md` and generated into `src/data/level-3.ts`;
  the composer consumes that overlay (decision #12). No fused-specific
  override is evidenced; only damage rolls are fused-specific, and the site
  abstracts them to "X". The hand-maintained per-ball kit table that resolves
  shared keys lives in `src/ball-kit.ts`; `src/fusion-properties.ts` applies
  it.

---

## 2. Composition rules — how two kits combine

**This section is the canonical statement of the composition rules.**

The rules below are community-observed (not datamined) and are the site's
editorial model. Weighting used throughout the corpus: site-author playtest >
controlled community test > mechanism-backed claim > structured guide >
single anecdote > second-hand report.

### 2a. The seven composition rules (Korean wiki)

1. Different AOE/range attacks → the fused ball has the range of both.
2. AOE + status → enemies hit in the range also suffer the status.
3. AOE + additional ball creation → created balls have the same range.
4. Different statuses → both apply simultaneously.
5. Same status, different numbers → **different application channels union;
   a shared scalar key takes the first pick** (e.g. Leech + Sacrifice keeps
   both application channels, one stack cap — the first-selected ball's).
6. Status + ball creation → created balls also carry the status.
7. Ball creation + ball creation → both effects, amounts adjusted.

### 2b. Status-vs-spawn (the cross-wire rule)

A partner's **on-hit status effect** fires from the fused ball's other hits;
effects bound to **spawned sub-entities** (icicles, spikes, babies) do not.
Playtest-confirmed three ways by the site author: Overgrowth × Flash
cross-wires, Flicker × Radiation Beam cross-wires, Flash × Glacier does not.

### 2c. Trigger-channel limits (refinement of 2b)

Whether a partner's effect rides the other component depends on the **trigger
channel**, not just the effect kind. The governing reading is the **trigger
matrix's source reading** (issue #18, adopted in #20): **AOE damage cannot
trigger an On-Hit effect** — an AOE tick is not a hit — while **spawned units
can trigger the original's abilities** (a baby ball's hit is a hit). This
supersedes the earlier target reading recorded in #6.

- Satan's full-screen judgment is **debuff-only** (no damage judgment): it
  cannot fire Hemorrhage's %-HP proc nor Reaper's on-impact kill — but it
  *does* apply Black Hole's instant kill (an instant-kill is a debuff).
- Reaper's kill fires from Flash/Flicker hits and from baby balls, not from
  Satan's AOE.
- Blizzard's freeze is positional (spawned icicles) and does not ride a
  partner's hits. Freeze Ray's freeze is on-hit: it spreads through Flash's
  AOE (Freeze Ray × Flash), but Sun's field aura does not apply it
  (Freeze Ray × Sun) — the beam carries Sun's burn, not the reverse.

### 2d. Spawn-channel exceptions

- **Two-hop drop**: Voluptuous Egg Sac spawns Egg Sacs that spawn balls — a
  partner property is lost at the second hop (tooltip still advertises it).
  Voluptuous Egg Sac is the only hard spawn-inheritance exclusion.
- **Status-only spawn carriers**: Brood Mother and Mosquito King's babies
  inherit the partner's **on-hit status** (reported), but not spawn-bound
  traits (spikes, icicles, blobs) — so Glacier/Blizzard stay unwired for both
  carriers. Brood Mother's inheritance is degraded: the inherited effect is
  weaker and the spawn is probabilistic (25/35/45% per hit); one launch-week
  report claims Flash × Brood Mother produced none (unverified — the no-wire
  claim it supported is superseded, `CONTRADICTIONS.md` §14). Egg Sac's
  babies inherit the partner's properties, but the inherited effect is weaker
  than a full clone (reported, namu.wiki).
- **Trigger limit**: Brood Mother's and Mosquito King's spawns fire **on
  hit**, so a screen-wide/AOE partner produces fewer babies — the partner's
  AOE damage does not trigger the spawn, only the fused ball's own direct
  hits do.

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
- **9999 is at least a display cap; whether it is also a real per-hit cap is
  disputed.** Computed damage ranges above 9999 with per-hit pop-ups pinned at
  9999 have been observed, so on-screen numbers understate hard-hitting
  fusions. A newer 2026-09 thread argues for a real cap; no controlled test
  settles it — do not treat the display-cap reading as final
  (`CONTRADICTIONS.md` §8, §13).

---

## 3. Order — when does it matter?

**This section is the canonical statement of the order model.** The model is
the **property-collision** rule (supersedes the older two-class
"same-property / both-cooldown, otherwise irrelevant" claim):

1. **Always, cosmetically.** Name, icon, colour, damage-number colour,
   sometimes sprite, description paragraph order follow selection order.
2. **Functionally, order matters exactly where the two kits collide on a
   scalar property key.** A ball's kit is a set of property keys; fusion
   unions the sets. When both balls carry the *same scalar key* (cooldown,
   stack cap, duration, per-stack damage, bonus %, range, spawn variant, …)
   with different values, the first-selected ball's value wins and the
   second's is excluded. The old "same-property" and "both-cooldown" classes
   are subsets of this rule — `cooldown` is just one key. Known pairs:
   Mosquito Swarm × Mosquito King (spawn variant), Radiation Beam × Nuclear
   Bomb (radiation duration 15 s vs infinite), Noxious × Poison (max stacks),
   Banished Flame × Sun (burn cap/duration/damage), Erosion ×
   Stone/Drill/Assassin/Steel (bonus %), Egg Sac × Timestop (cooldown), Nuke ×
   Overgrowth (range), Freeze Ray × Blizzard (freeze duration, reported),
   Noxious × Brimstone (poison stacks, reported). Different application
   channels always union; only a shared scalar key resolves to the first pick
   (Leech × Sacrifice keeps both channels, one stack cap).
3. **Equal values are not a functional difference.** A shared key with the
   same value on both sides cannot make order matter.
4. **Otherwise order is irrelevant** for stats, abilities, and cross-wiring.
   Reported anomalies outside the rule (Nuke × Wraith, Time bubble, Banshee
   curse) stay reported exceptions, not a general order effect. The Nov 2026 report's Freeze Ray × Blizzard and
   Noxious × Brimstone collisions are predictions marked reported/unverified.

**Pool recursion** (order-adjacent, but not a fusion effect): the
**first-selected base ball** is consumed and does not reappear in the
level-up/fusion pool for the rest of the run; select it second to keep it.
Scope (base balls only vs any ball) is disputed; the base-ball reading is
better evidenced.

**Folklore, refuted.** A Japanese guide prescribes a fixed order for 8 of its
favourite pairs (transcribed as an 11-row table by a second page — one source
lineage, not two confirmations). All 8 are cross-property pairs with no
colliding scalar key, so the property-collision model predicts no functional
difference; the controlled test covered several in both orders with zero
difference; the guide's own comment section says only the description order
differs. Best explanation: the fused *name* follows selection order, and the
naming convention was converted into a functional caution without testing.
The specific refutation stands; the guide's blanket claim does not generalise
to pairs whose kits do collide.

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
- "First-selected" is **click/selection order**, per multiple community
  reports; the wiki's older claim that fusion order cannot be manually
  selected (acquisition order) is contradicted by the live game's ordered
  fusion slots. One direct UI observation would confirm it.

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

- The raw harvest layer (`fusion-observations/*.jsonl`) is **append-only**:
  existing files are never edited, and each refresh wave adds dated per-source
  files (`<source>-<YYYY-MM-DD>.jsonl`, date = harvest access date).
  Contradictions are records, not errors; both sides stay. Resolution happens
  only in the curated layer (`fusion-pairs.json`, whose per-pair `superseded`
  array records dropped claims) and this file.
- Rows naming balls not yet in the catalog are staged in
  `fusion-observations/pending/`; the schema gate skips that directory until
  promotion moves them into a dated wave.
- `CONTRADICTIONS.md` is the register of the 6 contradicted / 4
  order-disputed pairs (after the 2026-11-11 resolution pass) and the known
  corpus issues (anchor rows filed on stand-in pairs, `obs_count` semantics,
  one attribution splice not to cite). Read it before treating any pair's
  observation count as evidence weight.
- The claim audit behind this file is `fusion-claim-register.md` (2026-11-11,
  pre-DLC v1.301; a historical snapshot whose counts predate the 2026-11-11
  resolution pass): every fusion claim's status and disposition. §3 here is
  the canonical order-model statement; other files link to it instead of
  restating the model.
- Refresh routes (occasional, not part of the data pipeline): forum archive
  APIs keyed on the "A × B" naming convention (heavily rate-limited),
  community-hub screenshot/discussion search, video metadata. The durable
  artifact is the corpus itself, never the live APIs.
- Validate a refreshed corpus with
  `node --experimental-strip-types scripts/harvest/validate-observations.ts`.

---

## Uncertainty summary

- The property-collision rule is **reported, never playtested here** — one
  playtest each of a same-property pair (Mosquito Swarm × Mosquito King) and
  a both-cooldown pair (Black Hole × Timestop) would upgrade it to observed.
- One playtest of Satan × Hemorrhage on a boss would settle the cleanest
  tooltip-vs-behaviour mismatch (§1.1).
- Fused-ball level on creation is L3 (tooltip evidence); sub-level-3 fusion
  remains disputed (§1).
- The stat-merge formula for fused balls is unknown publicly; observed
  per-ball values match the level-3 base values
  (`docs/research/level-3-effects.md`), and only damage rolls are
  fused-specific (abstracted to "X").
- Whether the save format records directed fusion pairs (NumCombos symmetry)
  is unverified (§4).
- Corpus coverage is 370 distinct pairs ≈ 9.2% of C(90,2) (977 pair-filed
  observations; 58 global composition-rule rows have no pair), concentrated
  on the meta; pair counts from any single harvest session are a floor, not a
  ceiling.
- Demo-era claims (pre-release builds) may describe different builds; several
  contradictions in the register are of this kind.
