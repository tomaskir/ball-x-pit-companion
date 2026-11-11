# Research: validating the Nov 2026 r/BALLxPIT fusion-order claims

**Ticket:** wayfinder research #2 — validate the functional claims in the Nov 2026
r/BALLxPIT post *"Fusion Order did not matter a year ago, it certainly DOES matter now"*.
**Status:** research complete, source-only (no playtest capability).
**Date:** 2026-11-11. **Branch:** `research/reddit-order-claims` (merged;
commit `3c559f2`).
**Version scope:** game **v1.301** (the Naturalist update, released 2026-08-06) — the
current build on the post's date (2026-11-09). No patch was announced between
2026-08-06 and 2026-11-09 (Steam news feed); the paid *Risen Ballbylon* DLC releases
2026-11-12, **after** the post. The wiki pages cited below were last edited
2026-09-15..2026-11-01, i.e. the same build.

This file is research, not a fact-base rewrite. The frozen raw corpus
(`fusion-observations/*.jsonl`) is untouched; none of the claim pairs below appear
in it.

> **Status — landed (2026-11-11).** This is a dated research snapshot. Its
> findings were applied: the composer now reads the level-3 overlay
> (`src/data/level-3.ts`), the order model is the property-collision rule
> (`docs/research/fusion-mechanics.md` §3, `src/fusion-properties.ts`), and
> Freeze Ray is no longer spawn-bound (`src/fusion.ts`). Where this file
> describes "the site's current model" or the catalog's L1 text (§2, §5, §6),
> read the landed state; inline corrections are marked **Update
> (2026-11-11)**.

---

## 1. The post under test

| Field | Value |
|---|---|
| Title | Fusion Order did not matter a year ago, it certainly DOES matter now |
| Subreddit | r/BALLxPIT |
| Author | u/Expensive_Sail_5138 |
| Date | 2026-11-09 (03:45 UTC) |
| URL | https://www.reddit.com/r/BALLxPIT/comments/1xrhisk/fusion_order_did_not_matter_a_year_ago_it/ |
| Score / comments at capture | 76 / 4 |
| Build | v1.301 (pre-*Risen Ballbylon*) |

It is a follow-up to **"Fusion Order Matters"** (u/mattkk177, 2026-11-06,
https://www.reddit.com/r/BALLxPIT/comments/1xpkoe0/fusion_order_matters/), which the
post says it fact-checked. The post also rebuts the year-old PSA
**"PSA - Fusion Order Does NOT Matter"** (u/Leorium, 2025-11-11,
https://www.reddit.com/r/BALLxPIT/comments/1ouhlp1/psa_fusion_order_does_not_matter/),
which is already the corpus's `reddit.jsonl` rows 1–16.

The post's own thesis is narrower than its title: order is functional for
**same-property pairs** and **cooldown-bearing pairs**, and for the **base-ball pool
recursion**; otherwise it is cosmetic. That was the same shape as the site's
model at research time (`docs/research/fusion-mechanics.md` §3), extended to
free-update-era balls (the paid *Risen Ballbylon* DLC was not live). The
canonical §3 now generalises the two classes to the property-collision rule.

---

## 2. The level-1 vs level-3 trap (read this before the numbers)

Most of the post's numbers look "wrong" against `docs/research/game-mechanics.md`
and the wiki's *Balls* overview — because those tables carry **level-1** effect text,
while a fusion consumes **level-3** balls. The individual wiki ball pages carry the
per-level table. Once compared at level 3, **every component number in the post
matches the wiki** except Timestop's cooldown (see claim 1).

| Ball | Fact base / overview (L1) | Individual wiki page (L3) | Post |
|---|---|---|---|
| Erosion | 3% current health | **5%** | 5% ✓ |
| Stone | 300% initial | **400%** | 400% ✓ |
| Drill | 50% bonus | **100%** | 100% ✓ |
| Assassin | 30% backstab | **50%** | 50% ✓ |
| Steel | max 300% | **15%/hit, max 400%** | 15% ✓ |
| Banished Flame | max 6 stacks | **max 8 stacks, 2 s, 1–35/stack/s** | 8 stacks, 2 s ✓ |
| Sun | max 5 stacks, 6 s, 6–12/stack/s | **max 5 stacks, 8 s, 9–15/stack/s** | 5 stacks, 8 s ✓ |
| Freeze Ray | 10.0 s freeze | **13.0 s freeze** | 13 s ✓ |
| Brimstone | max 4 stacks | **max 4 stacks** | 4 stacks ✓ |
| Egg Sac | 3 s cooldown | **3 s cooldown** | 3 s ✓ |
| Timestop | 30 s cooldown | **20 s cooldown** | 30 s ✗ |

Sources: individual wiki pages (`/wiki/Erosion`, `/wiki/Stone`, `/wiki/Drill`,
`/wiki/Assassin`, `/wiki/Steel`, `/wiki/Banished_Flame`, `/wiki/Sun`,
`/wiki/Freeze_Ray`, `/wiki/Brimstone`, `/wiki/Egg_Sac`, `/wiki/Timestop`), revisions
2026-09-15..2026-10-01; fact base `docs/research/game-mechanics.md` (v1.301,
fetched 2026-09-13).

**Consequence for this repo:** the site's catalog/composer uses the fact base's L1
text for these balls, so a fused ball rendered by `src/fusion.ts` would show L1 stack
caps/durations, not the L3 values the game actually uses. That is a content decision
for a separate ticket, not something this research changes.

**Update (2026-11-11):** this landed. The composer now reads the level-3
overlay (`src/data/level-3.ts`), so fused text uses L3 values; the paragraph
above records the pre-migration state.

---

## 3. Verdict table

| # | Claim | Verdict | Key source(s) | Version | Confidence |
|---|---|---|---|---|---|
| 1 | **Egg Sac × Timestop**: Egg Sac first → 3 s cooldown; Timestop first → keeps 30 s | **CONFIRMED (mechanism); 30 s figure CONTRADICTED** | namu cooldown rule; wiki Egg Sac (3 s) + Timestop L3 (**20 s**); Black Hole L3 5 s matches namu's worked example | v1.301 | High on mechanism; medium on the reverse-order number |
| 2 | **Banished Flame × burn ball (Sun)**: first-selected burn profile dominates stack cap / per-stack DPS / duration | **CONFIRMED (reported)** | wiki L3 stats for BF (8/2 s/1–35) and Sun (5/8 s/9–15); same-property first-wins rule (independent Reddit reports 2026-02-04, 2026-04-21) | v1.301 | Medium-high |
| 3 | **Erosion × Stone/Drill/Assassin/Steel**: first-selected ball's bonus-damage stat replaces Erosion's 5% | **CONFIRMED** | wiki *Erosion* and *Stone* Strategies: "Stone x Erosion (select Stone first) … 400% … (Erosion x Stone: only … 5%)"; L3 stats for Drill 100 / Assassin 50 / Steel 15 | v1.301 | High for Stone; medium for Drill/Assassin/Steel |
| 4 | **Freeze Ray × Blizzard**: Freeze Ray first → Blizzard gains Freeze Ray's 13 s freeze | **UNRESOLVED (plausible)** | Freeze Ray L3 = 13 s; same-property rule; no direct pair evidence | v1.301 | Low-medium |
| 5 | **Noxious × Brimstone**: Brimstone first → Noxious spreads 4 stacks of poison and burn | **UNRESOLVED (plausible)** | Brimstone L3 max 4 stacks; Noxious applies 3; same-property rule; no direct pair evidence | v1.301 | Low-medium |
| 6 | **Time × X**: Time's bubble size scales to the ball in position 2 | **UNRESOLVED** | Single comment (u/icemage_999); Bilibili corpus claim says Time expands the time-stop radius when fused, but not position-2 specificity | v1.301 | Low |
| 7 | **Banshee**: whole-field curse overrides some other curse effects | **UNRESOLVED** | Single comment, self-admittedly not tested extensively | v1.301 | Low |
| 8 | **Base-ball pool recursion**: first-selected base ball never reappears in the level-up/fusion pool | **CONFIRMED (reported)** | 3 independent Reddit reports (2026-02-26, 2026-04-21, 2026-11-06) + existing model §3 | v1.301 | High (reported; no playtest here) |

Verdicts: **confirmed** = the functional mechanism is supported by current-version
sources and/or multiple independent reports; **contradicted** = a current-version
source contradicts it; **unresolved** = no current-version source confirms or
contradicts it.

---

## 4. Claim-by-claim

### 4.1 Egg Sac × Timestop — mechanism confirmed, 30 s figure wrong

**Post:** "if it's Timestop x Egg Sac … Timestop retains its pathetic 30 second
cooldown. However, if it's Egg Sac x Timestop instead, then Timestop gains Egg Sac's
incredibly short cooldown time of 3 SECONDS!"

**What the sources say.** The both-cooldown rule is already in the model
(`fusion-mechanics.md` §3) and in the corpus: namu.wiki (2026-08-26) states that
when two balls each list a cooldown, the **first-selected ball's cooldown wins**, with
the worked example "Black Hole x Timestop fires every 5 seconds, whereas Timestop x
Black Hole fires every 20 seconds." The wiki's per-level tables give Black Hole L3 =
**5 s** and Timestop L3 = **20 s**, so namu's example uses level-3 cooldowns. Egg Sac
is **3 s** at every level.

**Assessment.** The direction is confirmed: Egg Sac first → 3 s; Timestop first →
Timestop's cooldown. The post's **30 s is Timestop's level-1 value**; the level-3
value (the only one fusable) is **20 s**, and the established Black Hole × Timestop
example already uses 20 s. The post may be reading the fused tooltip, which is
assembled from component templates and can display a base-tier number, or simply
misremembering the L1 stat. Treat the mechanism as confirmed and the 30 s figure as
an error (correct: 20 s).

### 4.2 Banished Flame × burn ball — confirmed (reported)

**Post:** Banished Flame first → Sun adopts BF's 8-stack cap, BF's per-stack DPS and
BF's 2 s duration (except the expiry damage); Sun first → darkflame adopts Sun's
per-stack DPS, 5-stack cap and 8 s duration. The post adds that **Frozen Flame does
not** behave this way.

**What the sources say.** The wiki's L3 tables give BF = max 8 stacks, 2 s, 1–35
damage/stack/s; Sun = max 5 stacks, 8 s, 9–15 damage/stack/s. Every number in the
post matches. The mechanism is the same-property first-wins rule already documented
in the model and independently reported for other pairs (Reddit 2026-02-04: "fused
balls can't have the same property twice so it inherits from the first ball picked
always"; Reddit 2026-04-21: "If balls have overlapping properties always takes the
property from the first ball selected … Noxious x posion and posion x noxious have
different max poison stacks").

**Assessment.** The component numbers are verified and the mechanism is an extension
of an established rule to the burn/darkflame family. No source directly tests
Banished Flame × Sun, so it stays **reported**, not observed. The Frozen Flame
exception is the post's own observation and is uncorroborated.

### 4.3 Erosion × Stone/Drill/Assassin/Steel — confirmed (Stone explicitly)

**Post:** with Stone/Drill/Assassin/Steel first, Erosion's current-health bonus is
replaced by that ball's bonus (Stone 400%, Drill 100%, Assassin 50%, Steel 15%);
with Erosion first it keeps 5% and the partner's bonus becomes 5%.

**What the sources say.** The wiki's *Erosion* page (revid 4233, 2026-10-01) says
verbatim in Strategies: **"Great Fusion: Stone x Erosion (select Stone first on
Fusion): deals 400% of enemy's hp as damage. (Erosion x Stone: only deal 5%
damage.)"** The *Stone* page carries the same note. The L3 stats are Erosion 5%,
Stone 400%, Drill 100%, Assassin 50%, Steel 15%/hit — all matching the post.

**Assessment.** This is the strongest claim: the Stone case is stated explicitly by a
current-version wiki page, and the other three follow the same same-property
mechanism with verified L3 numbers. Note the wiki's *Balls* overview still shows
Erosion 3% (the L1 value), which is why the claim looks contradictory at first
glance.

### 4.4 Freeze Ray × Blizzard — unresolved (plausible)

**Post:** "Freeze Ray x Blizzard giving Blizzard Freeze Ray's 13 second freeze time."

**What the sources say.** Freeze Ray L3 = 13.0 s freeze; Blizzard L3 = 1.3 s freeze.
Under the same-property rule, Freeze Ray first would make the fused freeze 13 s. No
source directly tests this pair. The post elsewhere says Blizzard does **not** spread
freeze through Flash (positional freeze), which is a separate cross-wire question.

**Assessment.** Plausible and numerically consistent, but unsourced for this pair.
**Unresolved.**

### 4.5 Noxious × Brimstone — unresolved (plausible)

**Post:** "Noxious spreading 4 stacks of poison and burn when Brimstone is used as the
Catalyst."

**What the sources say.** Brimstone L3 applies 1 stack of burn and poison per second
(max **4 stacks**); Noxious L3 applies 3 stacks of poison. Under the same-property
rule, Brimstone first would set the poison cap to 4 and add burn. The independent
Reddit report (2026-04-21) confirms the rule for Noxious × Poison ("different max
poison stacks"). No source directly tests Noxious × Brimstone.

**Assessment.** Plausible and numerically consistent. **Unresolved.**

### 4.6 Time × X — unresolved

**Comment (u/icemage_999, 2026-11-09):** "Time scales its bubble size to the ball it
is fused to if it is in position 2 (Nuke x Time generates a huge time bubble that
covers half the playing field width)."

**What the sources say.** The corpus has one relevant non-English claim (Bilibili,
2026-08-07): "when Time is fused with other balls the time-stop radius expands" —
general, not position-specific. The wiki's Time page gives the snare duration
(3.0 s at L3) but says nothing about size scaling by partner or position.

**Assessment.** The general "Time's bubble expands when fused" idea has one
independent report; the **position-2 specificity is uncorroborated**. **Unresolved.**
(Also note the wiki's *Balls* overview says the snare lasts 20 s while the individual
page's level table says 2.0/2.5/3.0 s — a separate wiki inconsistency, not part of
this claim.)

### 4.7 Banshee — unresolved

**Comment (u/icemage_999, 2026-11-09):** "Banshee's curse application to the whole
field has overridden some other curse effects I have tried, though I have not tested
extensively."

**What the sources say.** Nothing in the corpus or wiki addresses curse-effect
override. The wiki gives Banshee's L3 numbers (250–400 after 6 hits) but no fusion
priority note.

**Assessment.** Single, explicitly tentative anecdote. **Unresolved.**

### 4.8 Base-ball pool recursion — confirmed (reported)

**Post:** "if a base ball like those two are used as the Catalyst in a fusion, that
ball will NOT appear as a selection when selecting an upgrade upon leveling up ever
again for that run, effectively acting as a 'Shadow Banish'."

**What the sources say.** Three independent Reddit reports:
- 2026-02-26 (https://www.reddit.com/r/BALLxPIT/comments/1rfpa04/): "If you click Egg
  Sac first then Blizzard, egg sac is no longer in the pool … If you click blizzard
  second, its type would be 'Blizzard' and Egg Sac would be back in the upgrade pool."
- 2026-04-21 (https://www.reddit.com/r/BALLxPIT/comments/1srjxm5/): "If one component
  in the fusion is a base ball … If it is the first option chosen it will not show up
  again as an upgrade … (wraith x egg sac = can get another egg sac. Egg sac x wraith
  = no more egg sac show up in level up menu)"; a second commenter extends it to any
  first-selected ball ("ghost x egg sac means ghost doesn't come back").
- 2026-11-06 (the "Fusion Order Matters" thread): the same rule, with the "shadow
  Banish" framing.

The existing model already records this as **reported**, with the scope (base balls
only vs any ball) disputed and the base-ball reading better evidenced.

**Assessment.** **Confirmed as reported.** The post's base-ball framing matches the
better-evidenced reading; the "any ball" scope remains disputed. No playtest here, so
it does not upgrade to observed.

---

## 5. The retraction: Freeze Ray × Flash

The post **retracts** the Nov 6 post's headline example. The Nov 6 post claimed:

> "Flash x Freeze Ray is different than Freeze Ray x Flash. Flash x Freeze Ray applies
> the flash effect to the beam, which sucks. Freeze Ray x Flash applies the freeze
> affect to the screen flash aoe, which is great."

The Nov 9 post says its own testing **disproved** this:

> "… a process that rather ironically disproved the post maker's original claim that
> Freeze Ray x Flash is different from Flash x Freeze Ray … if you actually watch the
> enemies you'll see that they function exactly the same, proven by a stacked enemy …
> becoming frozen by Flash x Freeze Ray … the freeze effect seems to actually be
> dependent on the freeze type ball used rather than the fusion order. Freeze, Freeze
> Ray and Wraith all work with Flash to spread freeze, Glacier and Blizzard do not,
> this is the case regardless of fusion order."

**Verdict on the retracted claim:** **CONTRADICTED by the post itself.** The Nov 6
order claim should not be carried forward.

**Important for this repo:** the Nov 9 replacement finding — that **Freeze Ray ×
Flash does spread freeze** — contradicted the model at the time of this
research. `fusion-mechanics.md` §2c then said "Freeze Ray's freeze is bound to
the beam path — neither [Blizzard nor Freeze Ray] rides a partner's hits", and
§2b's playtest list did not include Freeze Ray × Flash. The Nov 2026 report says
the opposite for Freeze Ray (it *does* ride Flash's screen AOE; Glacier and
Blizzard do not).

**Update (2026-11-11):** resolved in the report's favour. `fusion-mechanics.md`
§2c now states Freeze Ray's freeze is on-hit/AOE and spreads through Flash, and
`src/fusion.ts`'s `SPAWN_BOUND_IDS` is `{blizzard}` only.

---

## 6. Cross-check against the site's current model

**Update (2026-11-11):** this table describes the model before the
property-collision rewrite. `fusion-mechanics.md` §3 no longer has §3.2/§3.3
subsections; the two classes are now subsets of the single collision rule.
The rows are retained as the research record.

| Model statement (`fusion-mechanics.md`) | This research |
|---|---|
| Both-cooldown class: first-selected cooldown wins (7 balls incl. Egg Sac, Timestop) | **Supported.** Claim 1 is an instance. |
| Same-property class: first-selected variant wins | **Supported and extended** to BF×Sun, Erosion×bonus-damage balls, Noxious×Brimstone, Freeze Ray×Blizzard. |
| §3 "Pool recursion": first-selected base ball is consumed; scope disputed | **Supported** by three independent reports; scope still disputed. |
| §2c Freeze Ray's freeze does not ride a partner's hits | **Contradicted** by the Nov 9 post (Freeze Ray × Flash spreads freeze). **Resolved (2026-11-11):** §2c now says it does ride Flash's AOE. |
| Wiki *Fusion Mechanics* general claim: "the order … does not change the functional stats/abilities" | **Stale/contradicted** by the wiki's own *Erosion*/*Stone* pages (2026-10-01) and by this post. |

---

## 7. Evidence inventory

**Primary (current-version component stats / explicit fusion notes):**
- `https://ballxpit.wiki.gg/wiki/Erosion` (revid 4233, 2026-10-01) — Stone × Erosion
  order note; L3 5%.
- `https://ballxpit.wiki.gg/wiki/Stone` (2026-10-01) — same note; L3 400%.
- Individual ball pages for L3 stats: `/wiki/Drill`, `/wiki/Assassin`, `/wiki/Steel`,
  `/wiki/Banished_Flame`, `/wiki/Sun`, `/wiki/Freeze_Ray`, `/wiki/Blizzard`,
  `/wiki/Noxious`, `/wiki/Brimstone`, `/wiki/Egg_Sac`, `/wiki/Timestop`,
  `/wiki/Black_Hole`, `/wiki/Time`, `/wiki/Banshee` (revisions 2026-09-15..2026-11-01).
- `https://ballxpit.wiki.gg/wiki/Fusion_Mechanics` (revid 4217, 2026-09-19) — the
  stale general "order does not matter" claim.
- `https://ballxpit.wiki.gg/wiki/Balls` (2026-09-10) — L1 overview numbers.

**Recent community reports (Nov 2026, free-update era; pre-Risen Ballbylon):**
- Post under test: `1xrhisk` (2026-11-09).
- Preceding post: `1xpkoe0` "Fusion Order Matters" (2026-11-06) — source of the
  retracted Freeze Ray × Flash claim and the pool-recursion comment.
- Comments by u/icemage_999 (Time, Banshee) on `1xrhisk`.

**Older corroboration (pre-DLC, still valid for the rules):**
- `1ouhlp1` "PSA - Fusion Order Does NOT Matter" (2025-11-11) — the baseline the post
  rebuts; already in the corpus.
- `1qvs857` "fusion order" (2026-02-04) — same-property first-wins rule.
- `1rfpa04` (2026-02-26) — base-ball pool recursion.
- `1srjxm5` (2026-04-21) — pool recursion + same-property rule.
- namu.wiki cooldown rule (2026-08-26) — already in the corpus (`ordering.jsonl`).
- Bilibili Time-radius claim (2026-08-07) — already in the corpus.

**Frozen corpus:** none of the eight claim pairs appears in
`docs/research/fusion-observations/*.jsonl`; these are all new pairs for the corpus.

---

## 8. Uncertainty summary

- Only **Stone × Erosion** has an explicit, current-version, pair-specific source
  (the wiki Strategies note). Every other "confirmed" verdict is a verified
  component-stat set plus the established same-property / cooldown rule, not a direct
  observation of the fused ball.
- The post's **30 s Timestop** figure is the level-1 value; the fusable level-3 value
  is **20 s**. The mechanism survives; the number does not.
- Claims 4–7 rest on a single post or a single comment. They are plausible and
  numerically consistent, but **unresolved**.
- The post's **Freeze Ray × Flash** replacement finding contradicts the site's model
  §2c; this is the most consequential disagreement and needs a content decision.
- No playtest capability was available. Nothing here upgrades a reported claim to
  observed.
- The paid *Risen Ballbylon* DLC (2026-11-12) may rebalance any of these numbers;
  re-verify after release.
