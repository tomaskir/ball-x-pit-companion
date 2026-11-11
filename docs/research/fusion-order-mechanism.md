# Fusion order — candidate mechanism model (Nov 2026)

Research for wayfinder ticket
[#5](https://github.com/tomaskir/ball-x-pit-companion/issues/5):
determine whether the two functional order classes currently modelled in
`docs/research/fusion-mechanics.md` §3 — **same-property pairs** and
**both-cooldown pairs** — are special cases of a broader mechanism, and
reconcile same-status blending (Leech + Sacrifice) with first-pick dominance
(Banished Flame × Sun).

**Researched:** 2026-11-11 (source-only; no playtest capability).
**Catalog under audit:** `src/data/balls.ts` / `docs/research/game-mechanics.md`,
tagged "2026-09-13, game v1.301".
**Corpus:** `docs/research/fusion-observations/` (1,035 observations / 370
pairs; access date 2026-10-04). The Nov 2026 Reddit posts below were new
material at research time, not in the raw 2026-10-04 wave; they were later
ingested into the curated layer.

> **Status — landed (2026-11-11).** This is a dated research snapshot. Its
> candidate model was adopted: `docs/research/fusion-mechanics.md` §3 now
> states the property-collision model, and `src/fusion-properties.ts`
> implements it. Where this file describes "the current model" or "current
> code" (§6), read the landed state in those files; the research record below
> is preserved. Inline corrections are marked **Update (2026-11-11)**.

---

## 0. Method and evidence hierarchy

Sources were weighted per the ticket:

1. **Tier 1** — current-version game files, in-game tooltip screenshots,
   controlled tests.
2. **Tier 2** — recent community reports (Nov 2026, free-update era;
   pre-Risen Ballbylon).
3. **Tier 3** — older wiki snapshots and guides.

Every observation is version-tagged. Confidence labels used below:

- **Observed** — game file, in-game screenshot, or a controlled test's
  reported method/result.
- **Reported** — a community claim (including the Nov 2026 posts); not
  independently verified here.
- **Inferred** — a synthesis across multiple reports; no direct observation.
- **Unverified** — single-source or untested.

**No playtest capability.** Nothing in this note was confirmed by running the
game. The mechanism model is a *candidate* inferred from convergent reports,
not game data.

---

## 1. Answer in brief

**Candidate mechanism model: property-set union with first-pick scalar
precedence** (the community's "overlapping properties" / "single-value
property" model).

- A ball's kit is a set of **property keys** (statuses, application channels,
  range, min/max damage, cooldown, status stack cap, status duration,
  per-stack damage, bonus-damage multiplier, spawn variant, freeze duration,
  etc.).
- Fusion **unions** the two property sets. Properties only one ball carries
  survive unchanged.
- When both balls carry the **same property key** (a *collision*), the fused
  ball can store only one value for that key. The **first-selected ball's
  value wins**; the second ball's variant of that key is excluded.
- When there is **no collision**, function is commutative — the result of the
  controlled both-orders test (PSA #1) and the majority of pairs.
- The two current classes are **not two rules**. They are two visible
  instances of the same collision rule:
  - *same-property pairs* = pairs sharing any scalar key;
  - *both-cooldown pairs* = the subset sharing the `cooldown` key.
- **Same-status "blending" is not a competing numeric rule.** The two balls
  contribute different application channels (set-valued properties), which
  union; the shared scalar limits (stack cap, duration, damage) still resolve
  to one value by first pick. The namu Leech + Sacrifice example is
  order-agnostic in its text and is consistent with first-pick on the shared
  bleed cap (see §3.4).
- A small residual class of **per-pair anomalies** is not explained by the
  property model (Nuke × Wraith direction, Black Hole × Sun direction —
  later resolved by the 2026-11-11 pass — and Banshee curse override). Keep
  these as reported exceptions/bugs, not as a
  competing general rule.

The model is **inferred**, not datamined: the public game-file dumps contain
no fusion table and no visible property-merge code (§4 row 20, §5.3).

---

## 2. Definitions

- **Property key** — a named slot a ball can carry: `range`, `cooldown`,
  `min_damage`/`max_damage`, `poison_max_stacks`, `burn_length`,
  `burn_damage_per_stack`, `freeze_length`, `bonus_damage_pct`,
  `spawn_variant`, `radiation_length`, `bleed_max_stacks`, etc.
- **Set-valued property** — a property whose value is a set: which statuses a
  ball applies, which application channels it uses (on-hit, per-second,
  spawn, field), which spawn type it produces. These **union**.
- **Scalar property** — a single number attached to a key (cooldown seconds,
  range tiles, max stacks, duration, per-stack damage, bonus-damage %). These
  are **single-valued** on collision.
- **Collision** — both components carry the same property key.
- **First-pick precedence** — on a scalar collision, the first-selected
  ball's value is stored; the second's is discarded.
- **Selection order** — the order the player clicks the two balls in the
  Fusion Reactor. This is the operative variable; it is **not** acquisition
  order (see §4 row 8).

The set/scalar split is the synthesis that makes the community model
internally consistent. The community sources state the collision rule
directly ("fused balls can't have the same property twice", "the fused result
can only store one value") and list property tags separately from their
values; the split is an **inferred** refinement, not a verbatim source claim.

---

## 3. The model

### 3.1 Core rule

For components A (first-selected) and B (second-selected):

```
result.properties = union(A.properties, B.properties)
for each key k in intersect(A.properties, B.properties):
    result[k] = A[k]          # first pick wins
```

Equivalently: *a fused ball is A's kit plus B's non-overlapping kit.* The
first ball is the "dominant" / "catalyst" component for every shared scalar
property; the second contributes only what the first does not already have.

This is exactly how the community describes it:

> "Balls have properties, fused balls can't have the same property twice so
> it inherits from the first ball picked always." — Abject_Nerve_1052,
> 2026-02-04 [S4]

> "if both balls have overlapping properties the fused result can only store
> one value, so the value of overlapping properties prefers the first ball
> chosen." — Abject_Nerve_1052, property spreadsheet [S5]

> "Essentially for any balls that have the same property it prefers the first
> ball chosen … I think in most cases if the balls don't have overlapping
> properties it doesnt seem to matter, i.e. notice no difference between
> Flash x Overgrowth, Overgrowth x Flash, Hemorrhage x Maggot, Maggot x
> Hemorrhage, etc." — Abject_Nerve_1052, 2025-11-23 [S4]

### 3.2 The two old classes are special cases

| Current class | What it really is | Examples |
|---|---|---|
| Same-property pairs | Any shared scalar key | Mosquito Swarm × Mosquito King (spawn variant); Radiation Beam × Nuclear Bomb (radiation duration); Noxious × Poison (poison max stacks); Nuke × Overgrowth (range); Erosion × Stone/Drill/Assassin/Steel (bonus-damage %); Banished Flame × Sun (burn stack cap/duration/damage); Freeze Ray × Blizzard (freeze duration); Noxious × Brimstone (poison/burn caps); Time × Nuke (bubble/range size) |
| Both-cooldown pairs | The shared `cooldown` key | The 7-ball cooldown class (Black Hole, Bomb, Dark, Egg Sac, Voluptuous Egg Sac, Nuclear Bomb, Timestop), C(7,2) = 21 unordered pairs |

The "same-property" class is therefore not a list of three pairs; it is the
whole set of pairs with a scalar collision. The current
`SAME_PROPERTY_PAIRS` set in `src/fusion.ts` at research time was a small, evidence-backed
subset, not the full class. The "both-cooldown" class is the subset where the
shared key happens to be `cooldown`.

### 3.3 The majority case: no collision → commutative

PSA #1's controlled test (~60 pairs, both orders, solo Sisyphus, autofire off,
one special ball, no passives) found:

> "AxB vs BxA has 0 difference as to the actual ball effect. However, it does
> change the visuals on the ball and the color of the damage numbers." —
> Leorium, 2025-11-11 [S1]

That result is **not** in tension with the property model. PSA #1 explicitly
did not test same-property pairs — its author says so in PSA #2:

> "Funny enough, none of these combinations were in my original testing
> because I didn't even think of trying to fuse 2 balls that did the exact
> same thing." — Leorium, 2025-11-24 [S2]

So PSA #1 measured the **no-collision** majority and found commutativity.
The property model predicts exactly that. The two results are complementary,
not contradictory.

### 3.4 Same-status blending vs first-pick dominance (the ticket's question)

The ticket asks how **Leech + Sacrifice** (same-status blending, max 20) can
coexist with **Banished Flame × Sun** (BF × Sun; first-pick dominance).

**BF × Sun is a scalar collision.** Both balls apply the same burn-type
status. The Nov 2026 report describes first-pick dominance on all three shared
scalars:

> "Banished Flame and literally any ball that inflicts the burn status
> effect. … whichever ball is used first has its traits become… the
> 'dominant' traits … if Banished Flame is used as the Catalyst, Sun will
> adopt quite literally EVERYTHING from Banished Flame with the exception of
> the damage it does upon expiring. Sun will gain Banished Flame's 8 stack
> limit for the burn statuse effect, it will deal the same amount of damage
> darkflame (Banished Flame's status effect) does per stack per second and
> adopt Banished Flame's 2 second duration … if Sun is used as the Catalyst,
> darkflame adopts the same damage amount per stack per second, 5 stack limit
> and 8 second duration." — Expensive_Sail_5138, 2026-11-09 [S7]

This is **numeric** first-pick dominance: stack cap, duration and per-stack
damage all take the first pick. It directly falsifies the candidate model
"shared numeric properties blend while categorical/identity properties take
the first pick" (ticket candidate 2). Numbers do not blend when they are the
same scalar key.

**Leech + Sacrifice is a set union, not a scalar blend.** namu rule 5 says:

> "Same status from different balls = the stacking limits/effects are
> adjusted. Ex.: Leech (3/sec, max 48) + Sacrifice (6 on-hit, max 20) =
> fused ball (6 on-hit + 6/sec, max 20)." — namu.wiki, 2026-08-26 [S3]

Read through the property model:

- Leech and Sacrifice apply bleed through **different channels** — per-second
  vs on-hit. Channels are set-valued, so both survive: the fused ball has
  both an on-hit and a per-second bleed channel.
- The **shared scalar** is the bleed stack cap (and the bleed damage value).
  The result's max 20 is Sacrifice's value. The source does **not state the
  order**, so this is consistent with Sacrifice-first + first-pick on the
  shared cap. The per-second channel's rate (6, not Leech's 3) is also
  consistent with the dominant bleed value being applied to the unioned
  channel.
- The corpus annotation "symmetric/blended, NOT first ball wins" is an
  **interpretation**, not a verbatim claim. The source only says "adjusted."
  No controlled test has established that Leech + Sacrifice is symmetric.

**Resolution.** The two observations operate on different axes:

| Axis | Rule | Example |
|---|---|---|
| Set-valued properties (statuses, channels, spawn types) | Union — both survive | Leech's per-second bleed + Sacrifice's on-hit bleed |
| Scalar properties (cap, duration, damage, cooldown, range, bonus %) | Single value — first pick wins | BF × Sun burn cap/duration/damage; Noxious × Poison max stacks; Timestop × Egg Sac cooldown |

So "same-status blending" is the union of **different channels**; it is not a
counterexample to first-pick dominance on a **shared scalar**. The
`fusion-mechanics.md` §3 wording at research time — "Same-status-different-numbers
pairs instead *blend*" — was imprecise and should be read as "same status
through different channels → both channels kept; shared scalar key → first
pick wins." **Update (2026-11-11):** the canonical §3 now states this
refinement directly; the old wording is gone.

**Residual uncertainty.** The namu example's order is unstated, and no
controlled test has run Leech + Sacrifice in both orders. If a test showed the
same max 20 with Leech first, the shared-cap rule would be "min" or a
special-case adjustment rather than first-pick. Until then, first-pick is the
parsimonious reading because it is the rule observed everywhere else.

### 3.5 What the model does not explain

These are reported exceptions, not evidence for a different general rule:

- **Nuke × Wraith vs Wraith × Nuke** — different behavior *without* overlapping
  properties (Abject_Nerve_1052, 2025-12-25 [S4]; repeated 2026-01-13,
  2026-04-21). Likely a per-pair bug/one-off.
- **Black Hole × Sun direction** — one Nov 2026 commenter says Black Hole × Sun
  is "terrible" while Sun × Black Hole "DOES insta kill everything"
  (mattkk177, 2026-11-06 [S6]); another says both orders kill all non-boss
  enemies every second (JarlOctaviusoEdynbro, 2026-11-06 [S8]). No shared
  property is obvious; unresolved. **Resolved (2026-11-11):** the resolution
  pass cleared the order question (PSA #1 both-orders test; cross-wire real,
  non-boss-only); `black-hole+sun` is `verified` / order `no`.
- **Banshee curse override** — "Banshee's curse application to the whole field
  has overridden some other curse effects I have tried" (icemage_999,
  2026-11-09 [S8]). A possible same-property (curse) collision, but untested
  and the free-update era.
- **Spider Queen × Vampire Lord hit damage** — the two order tooltips show
  identical ability numbers but different hit damage (234–421 vs 556–1030)
  [S9]. Could be run context (upgrades/buffs) or a real order-dependent stat;
  the corpus keeps both records unresolved.
- **Fused stat scaling** — fused tooltips recompute/scaled component numbers
  (e.g. Egg Sac × Poison: poison max 5→8, duration 6→9, dps 1–4→10–25; baby
  balls 2–4→3–5) [S9]. The property model predicts *which variant* is
  selected, not the final numbers. Damage-number derivation remains out of
  scope and non-derivable.

---

## 4. Evidence table

Source labels are expanded in §8. "Tier" follows the ticket's hierarchy.

| # | Claim / observation | Source | Date | Version tag | Tier | Confidence | Bearing |
|---|---|---|---|---|---|---|---|
| 1 | Controlled both-orders test (~60 pairs; solo Sisyphus, autofire off, 1 special ball, no passives): AxB vs BxA = 0 functional difference; visuals/damage-number color only | S1 | 2025-11-11 | Launch build, pre-DLC; version not stated | 1 (controlled test) | Reported (method stated) | Supports no-collision commutativity; explicitly excluded same-property pairs |
| 2 | Same-property pairs: first-selected's variant wins; the game "can't process the exact same effect applying 2 different ways from a single trigger"; declared the only exception to order-doesn't-matter | S2 | 2025-11-24 | Pre-DLC; version not stated | 3 (Discord-testing repost, same author as S1) | Reported | Supports scalar collision; names Mosquito Swarm × King, Radiation Beam × Nuclear Bomb |
| 3 | Both-cooldown pairs: first-selected's cooldown wins; Black Hole × Timestop = 5 s vs 20 s | S3 | 2026-08-26 | v1.301-era; version not stated | 3 (wiki) | Reported | Supports `cooldown` key collision |
| 4 | Same-status-different-balls: limits/effects adjusted; Leech + Sacrifice = on-hit 6 + per-sec 6 + max 20 | S3 | 2026-08-26 | v1.301-era | 3 (wiki) | Reported | Supports set-union + shared-cap adjustment; order unstated |
| 5 | "Balls have properties, fused balls can't have the same property twice so it inherits from the first ball picked always"; property spreadsheet; hidden properties discoverable by putting the hidden-property ball first | S4, S5 | 2025-11-23 → 2026-04-25 | Pre-DLC → Regal → Shadow; versions not stated | 3 (older community reports, mechanism-explicit) | Reported | **Core model statement**; convergent across 6 months |
| 6 | Nuke × Overgrowth = 5×5 vs 3×3 range; Noxious × Poison = 3 vs 8 max poison stacks; Storm × Earthquake makes Earthquake 2×2 | S4 | 2026-01-13, 2026-04-21, 2026-04-25 | Regal/Shadow-era | 3 | Reported | Scalar collisions: range, max stacks, hidden range |
| 7 | "If both share a property will take the value from the first"; "exceptions, i.e. Nuke x Wraith and Wraith x Nuke behave differently" | S4 | 2025-12-25 | Pre-DLC | 3 | Reported | Core model + residual anomaly |
| 8 | Fusion order is determined by click/selection order, not acquisition order | S6, S7; Steam players in the corpus (Shajirr, al-gest, etc.) | 2025-10-25 → 2026-11-09 | Multiple | 2 (Nov 2026) / 3 | Reported | Resolves the wiki's acquisition-order claim |
| 9 | Timestop × Egg Sac: Timestop first = 30 s cooldown; Egg Sac first = 3 s | S7 | 2026-11-09 | Post-Naturalist v1.301, pre-Risen Ballbylon | 2 | Reported | **Current-version confirmation of cooldown first-pick** (report says 30 s; wiki L3 is 20 s — direction consistent, exact value uncertain) |
| 10 | Erosion × Stone/Drill/Assassin/Steel: first-selected's bonus-damage % wins (400/100/50/15%); Erosion first keeps 5% and forces the second's bonus to 5% | S7 | 2026-11-09 | Post-Naturalist v1.301 | 2 | Reported | **Current-version numeric first-pick**; matches v1.301 L3 values (Erosion 5%, Stone 400%, Drill 100%, Assassin 50%, Steel 15%) [S13] |
| 11 | Banished Flame × any burn ball: first-selected's burn stack cap, duration and per-stack damage dominate; BF first → Sun adopts BF's 8 stacks/2 s/darkflame damage; Sun first → darkflame adopts Sun's 5 stacks/8 s/damage | S7 | 2026-11-09 | Post-Naturalist v1.301 | 2 | Reported | **The ticket's BF × Sun case**; numeric first-pick, not blend; matches L3 BF max 8, Sun 8 s [S13] |
| 12 | Base-ball pool: first-selected base ball is removed from the level-up/fusion pool for the run ("shadow banish"); second-selected returns | S4, S6, S7, S8 | 2025-11-23 → 2026-11-09 | Multiple | 2 / 3 | Reported | Separate order effect, not a fusion property; well-corroborated |
| 13 | Freeze Ray × Blizzard: Freeze Ray first = 13 s freeze; Blizzard first = 1.3 s | S7 | 2026-11-09 | Post-Naturalist v1.301 | 2 | Reported | Scalar collision (freeze duration); matches L3 13 s / 1.3 s [S13] |
| 14 | Noxious × Brimstone: Brimstone first = poison/burn cap 4; Noxious first = cap 3 | S7 | 2026-11-09 | Post-Naturalist v1.301 | 2 | Reported | Scalar collision (status caps) |
| 15 | Time scales its bubble size to the ball it is fused to when Time is second (Nuke × Time = huge bubble); Banshee's curse overrides other curse effects | S8 (icemage_999) | 2026-11-09 | Post-Naturalist v1.301 | 2 | Reported | Scalar collision (range/size); free-update-era residual |
| 16 | Flash × Freeze Ray order matters (Flash first = freeze on beam; Freeze Ray first = freeze on screen flash) | S6 | 2026-11-06 | Post-Naturalist v1.301 | 2 | Reported, then **self-retracted** 2026-11-07 ("You're right, my bad") | Challenged by S7's test: function same; freeze spread depends on the freeze-type ball, not order. Does not support a general order rule |
| 17 | Flash × Freeze Ray function is the same both ways; freeze spread depends on the freeze-type ball used (Freeze/Freeze Ray/Wraith work with Flash; Glacier/Blizzard do not), regardless of order | S7 | 2026-11-09 | Post-Naturalist v1.301 | 2 | Reported | Supports trigger-channel model over order folklore |
| 18 | In-game tooltips, Egg Sac × Poison vs Poison × Egg Sac: ability numbers identical (poison max 8/9 s/10–25; baby balls 3–5); hit damage 84–135 vs 85–137 | S9 | 2026-02-03 | Version not stated | 1 (in-game screenshot) | Observed | Supports no-collision commutativity for different property keys |
| 19 | In-game tooltips, Spider Queen × Vampire Lord vs reverse: ability numbers identical; hit damage 234–421 vs 556–1030; sprite differs | S9 | 2026-02-03 | Version not stated | 1 (in-game screenshot) | Observed | Unresolved order-dependent stat / run-context difference; not a general rule |
| 20 | Game files (build 1.288 and 1.301): no fusion table, no fused-effect field; a fused ball is one ball instance carrying a `combined` list of absorbed HeroTypes; no property-merge code visible | S10 | 2026-02-19, 2026-09-29 | 1.288, 1.301 | 1 (game files) | Observed | Bounds the model: inferred from behavior, not datamined |
| 21 | wiki.gg: "the order of the fused balls does not change the functional stats/abilities"; "the priority of which effects and stats are combined are dependent on the component balls involved"; "the only way to change the order … is … acquisition" | S11 | 2026-09-19 | 1.301 (oldid 4217) | 3 (wiki snapshot) | Reported | Blanket order claim contradicted by S2/S4/S7; "priority component-dependent" supports the model; acquisition-order claim contradicted by S6/S7 |
| 22 | Repo playtests (2026-10-01, v1.301): Overgrowth × Flash cross-wires; Flicker × Radiation Beam cross-wires; Flash × Glacier does not | S12 | 2026-10-01 | 1.301 | 1 (playtest) | Observed | Neutral on order; supports trigger-channel model |
| 23 | Nov 2026 framing: "It really used to not matter. The new balls are what causes it to matter" | S8 (Sobotoc4311) | 2026-11-09 | Post-Naturalist v1.301 | 2 | Reported | **Challenged**: the property model was documented in Nov 2025 (S4) and PSA #2 (S2); the DLC added more property-bearing balls, increasing collision count, but not the mechanism |
| 24 | Level-3 audit: the Nov 2026 report's numbers match v1.301 level-3 values (BF max 8; Sun 8 s; Erosion 5%; Stone 400%; Drill 100%; Assassin 50%; Steel 15%; Freeze Ray 13 s; Blizzard 1.3 s; Poison max 8) | S13 | 2026-11-11 | 1.301 | 3 (wiki per-level data; cross-check) | Reported (wiki) | Confirms the Nov 2026 posts are v1.301 L3, not a newer build |

---

## 5. Version-tagging and evidence quality

### 5.1 Version timeline

| Source | Date | Version tag | Notes |
|---|---|---|---|
| PSA #1 / PSA #2 | 2025-11-11 / 2025-11-24 | Launch build, pre-DLC; exact version not stated | Controlled test + Discord repost; excludes same-property pairs |
| Abject_Nerve_1052 property posts | 2025-11-23 → 2026-04-25 | Pre-DLC → Regal (Jan 2026) → Shadow (Apr 2026); versions not stated | The most explicit mechanism statements; convergent across 6 months |
| namu.wiki | 2026-08-26 (en mirror 2026-10-26) | v1.301-era; version not stated | Cooldown rule + 7 composition rules |
| wiki.gg Fusion Mechanics | 2026-09-19 (oldid 4217) | 1.301 | Blanket order claim + acquisition-order claim |
| Game files | 2026-02-19 / 2026-09-29 | 1.288 / 1.301 | No fusion table; no merge code |
| Nov 2026 Reddit posts | 2026-11-06 / 2026-11-09 | Post-Naturalist v1.301, pre-Risen Ballbylon (2026-11-12); exact build not stated | Current-version community reports |
| Ticket #3 level-3 audit | 2026-11-11 | 1.301 | Confirms the Nov 2026 numbers are L3 values |

### 5.2 Why the Nov 2026 numbers are not a new build

The Nov 2026 report's figures (BF max 8, Sun 8 s, Erosion 5%, Stone 400%,
Drill 100%, Assassin 50%, Steel 15%, Freeze Ray 13 s, Blizzard 1.3 s, Poison
max 8) match the **level-3** values of the current v1.301 wiki tables, not a
post-v1.301 balance patch [S13]. The catalog in `src/data/balls.ts` is
**level-1** text, so its smaller numbers (BF max 6, Sun 6 s, Erosion 3%,
Stone 300%, Drill 50%, Assassin 30%, Steel 10%, Freeze Ray 10 s, Blizzard
0.8 s, Poison max 5) are not the fusion-relevant values. This is the subject
of the concurrent ticket-#3 research (merged branch
`research/effect-text-currency`, `docs/research/effect-text-currency.md`).

One numeric discrepancy remains: the Nov 2026 report says Timestop has a
**30 s** cooldown, while the v1.301 L3 table says **20 s** (L1 = 30 s). The
*direction* of the rule (first pick wins) is confirmed by namu's worked
example (Black Hole × Timestop = 5 s vs 20 s, both L3 values) and by the
report's Egg Sac-first = 3 s case. Treat the exact 30 s figure as a report
error or an L1 reading; the rule is unaffected.

### 5.3 What is observed vs reported vs inferred

- **Observed:** game-file structure (no fusion table; `combined` list);
  in-game tooltip screenshots (ability numbers, paragraph order); repo
  playtests (cross-wire only).
- **Reported:** every behavioral order claim — PSA #1/#2, namu, the Abject
  property posts, the Nov 2026 posts, the wiki's order statement — plus the
  community-maintained wiki per-level values used for the L3 cross-check.
- **Inferred:** the property-set-union / first-pick model itself, and the
  set/scalar distinction. The game files do not expose the merge code, so the
  model is a synthesis of convergent reports, not a datamined rule.
- **Unverified:** Leech + Sacrifice order-dependence; Nuke × Wraith mechanism;
  Banshee curse override; Spider Queen × Vampire
  Lord hit-damage difference; whether the save's `NumCombos` matrix records
  directed pairs.

### 5.4 Source-weight notes

- **PSA #1 is the only controlled both-orders test** in the public record. It
  is strong for the no-collision majority but explicitly did not test
  same-property pairs, and it predates the free-update balls. It cannot refute the
  property model; it is the model's complement.
- **The Abject property posts** are older (Tier 3 by date) but are the most
  mechanism-explicit and are independently convergent with the Nov 2026
  reports on the same rule. They are the strongest *reported* evidence for
  the model.
- **The Nov 2026 posts** are current-version but are self-reported playtests,
  not controlled tests. The "Fusion Order Matters" post's central example
  (Flash × Freeze Ray) was self-retracted the next day; the "did not matter a
  year ago" post is more careful and supplies the Timestop/Erosion/BF × Sun
  examples.
- **The wiki.gg blanket claim** ("order does not change functional
  stats/abilities") is contradicted by the property-collision evidence and by
  its own "priority … dependent on the component balls involved" sentence.
  Its acquisition-order claim is contradicted by click-order evidence.
- **Tooltips are runtime-assembled** from the components' templates and are
  known to be wrong in places (CONTRADICTIONS.md §7), so they are not
  reliable for the mechanism. They are useful for the no-collision
  commutativity check (identical ability numbers both ways) and for the
  unresolved Spider Queen × Vampire Lord hit-damage difference.

---

## 6. Reconciliation with the current model and implementation

**Update (2026-11-11):** this section describes the pre-landing state. The
property model is now canonical in `fusion-mechanics.md` §3 and implemented in
`src/fusion-properties.ts`; `SAME_PROPERTY_PAIRS` was removed, and the
composer reads the level-3 overlay (`src/data/level-3.ts`). The bullets below
are retained as the research record.

- `docs/research/fusion-mechanics.md` §3 currently lists **two functional
  order classes** (same-property; both-cooldown) plus presentation and pool
  recursion. The research supports **generalizing the two classes into one
  property-collision rule**, with the two classes as visible subsets.
- §3's sentence "Same-status-different-numbers pairs instead *blend* (rule 5
  above)" should be refined: **different channels → union; shared scalar key
  → first pick**. The Leech + Sacrifice example is not evidence of symmetric
  numeric blending; its order is unstated and its max 20 is consistent with
  Sacrifice-first.
- `src/fusion.ts` currently hard-codes `COOLDOWN_CLASS_IDS` and
  `SAME_PROPERTY_PAIRS` (three pairs) and emits notes for them. The research
  suggests a property-key model, but the catalog has **no property table**;
  implementing the general rule would require a property map (a content /
  implementation decision, out of scope for this ticket). No source or data
  file was changed.
- The existing notes remain correct for the narrow classes; they
  under-describe the general rule. A future implementation could add a
  property table and emit a "shared property — first pick wins" note for any
  colliding key, not just the hard-coded sets.

---

## 7. Open questions / what would settle it

1. **One controlled both-orders test of BF × Sun at L3** (and Erosion ×
   Stone) would upgrade the model from reported to observed. The Nov 2026
   report is a careful self-test, but not controlled.
2. **A game-file dump of the property/merge code** (not just `UpgradeInfo`)
   would confirm single-value storage. The public dumps stop at the
   `combined` list.
3. **Leech + Sacrifice in both orders** would settle whether the shared cap
   is first-pick or min. The namu example is order-agnostic.
4. **Nuke × Wraith / Wraith × Nuke** mechanism — the clearest residual
   anomaly; no shared property is known.
5. **Black Hole × Sun direction** — resolved by the 2026-11-11 pass (order
   `no`; cross-wire real, non-boss-only); retained here as the research
   question that prompted it.
6. **Post-Risen Ballbylon re-check** (DLC releases 2026-11-12, one day after
   this research): 24 new balls may add new property collisions and new
   anomalies. Re-run the order check against the post-DLC build.

---

## 8. Sources

- **[S1]** Leorium, "PSA - Fusion Order Does NOT Matter", Reddit
  r/BALLxPIT, 2025-11-11.
  <https://www.reddit.com/r/BALLxPIT/comments/1ouhlp1/psa_fusion_order_does_not_matter/>
- **[S2]** Leorium (reposting Ball x Pit Discord testing), "PSA 2 - Fusion
  Order Additional Info", Reddit r/BALLxPIT, 2025-11-24.
  <https://www.reddit.com/r/BALLxPIT/comments/1p5pil0/psa_2_fusion_order_additional_info/>
- **[S3]** namu.wiki contributors, "BALL x PIT/볼", 2026-08-26 (namu.moe
  mirror; English mirror 2026-10-26).
  <https://namu.moe/w/BALL%20x%20PIT/%EB%B3%BC> ·
  <https://en.namu.wiki/w/BALL%20x%20PIT/%EB%B3%BC>
- **[S4]** Abject_Nerve_1052 property-model comments:
  - 2025-11-23, "Ball Proc Questions":
    <https://www.reddit.com/r/BALLxPIT/comments/1p51lxh/ball_proc_questions>
  - 2025-12-25, "Some questions about how some things work in this game":
    <https://www.reddit.com/r/BALLxPIT/comments/1pvi9bn/some_questions_about_how_some_things_work_in_this>
  - 2026-01-13, "Does order matter?":
    <https://www.reddit.com/r/BALLxPIT/comments/1qbqkw5/does_order_matter>
  - 2026-02-04, "fusion order":
    <https://www.reddit.com/r/BALLxPIT/comments/1qvs857/fusion_order>
  - 2026-04-21 and 2026-04-25, "Does the order in which you select balls to
    be fused matter?":
    <https://www.reddit.com/r/BALLxPIT/comments/1srjxm5/does_the_order_in_which_you_select_balls_to_be>
- **[S5]** Abject_Nerve_1052, property spreadsheet (community-derived ball
  property table), accessed 2026-11-11.
  <https://docs.google.com/spreadsheets/d/1W44VaMXdNcElMxqxpaxHEE6pvda0yVADNFk_sc76qGg/edit?usp=sharing>
- **[S6]** mattkk177, "Fusion Order Matters", Reddit r/BALLxPIT, 2026-11-06;
  self-retraction comment 2026-11-07 ("You're right, my bad").
  <https://www.reddit.com/r/BALLxPIT/comments/1xpkoe0/fusion_order_matters/>
- **[S7]** Expensive_Sail_5138, "Fusion Order did not matter a year ago, it
  certainly DOES matter now", Reddit r/BALLxPIT, 2026-11-09.
  <https://www.reddit.com/r/BALLxPIT/comments/1xrhisk/fusion_order_did_not_matter_a_year_ago_it/>
- **[S8]** Nov 2026 comment threads on [S6] and [S7], notably icemage_999
  (2026-11-06, 2026-11-09), Expensive_Sail_5138 (2026-11-06),
  JarlOctaviusoEdynbro (2026-11-06), Sobotoc4311 (2026-11-09). Same URLs as
  [S6]/[S7].
- **[S9]** In-game fused-tooltip screenshots transcribed in
  `docs/research/fusion-observations/images.jsonl`: Egg Sac × Poison and
  Poison × Egg Sac (2026-02-03), Spider Queen × Vampire Lord and Vampire Lord
  × Spider Queen (2026-02-03), Overgrowth × Maggot (2026-03-03), Satan ×
  Reaper (2026-06-21).
- **[S10]** Game-file evidence in
  `docs/research/fusion-observations/game-files.jsonl`: craft-atlas NOTES
  (build 1.288, 2026-02-19) and jellyhani BallxPitBridge `Plugin.cs` (build
  1.301, 2026-09-29).
- **[S11]** BALL x PIT Wiki editors, "Fusion Mechanics", oldid 4217,
  2026-09-19 (v1.301).
  <https://ballxpit.wiki.gg/wiki/Fusion_Mechanics?oldid=4217>
- **[S12]** Repo author playtests, 2026-10-01 (v1.301), transcribed in
  `docs/research/fusion-observations/playtest.jsonl`.
- **[S13]** Concurrent ticket-#3 research, `docs/research/effect-text-currency.md`
  (branch `research/effect-text-currency`, 2026-11-11), and the wiki per-level
  ball pages it cites (e.g. Banished Flame, Sun, Erosion, Stone, Drill,
  Assassin, Steel, Freeze Ray, Blizzard, Poison, Timestop, Noxious,
  Brimstone). The level-3 values in §5.2 come from that audit.
- **[S14]** Repo synthesis: `docs/research/fusion-mechanics.md` §3;
  `docs/research/fusion-observations/CONTRADICTIONS.md`;
  `docs/research/fusion-observations/fusion-pairs.json`
  (`order_notes`, `general_rules_notes.same-property-first-wins`,
  `general_rules_notes.cooldown-first-wins`).
