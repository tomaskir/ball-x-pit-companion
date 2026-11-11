# Brood Mother spawn-channel inheritance — research findings

**Issue:** [#17](https://github.com/tomaskir/ball-x-pit-companion/issues/17)
(`wayfinder:research`) · **Research date:** 2026-11-11 · **Mode:** source-only,
no playtest capability.

**Current-build tag.** At research time the live build is the **Naturalist
Update era** (2026-08-06); the repo's fact base was fetched 2026-09-13 at game
**v1.301**. The paid **Risen Ballbylon** expansion is scheduled for
**2026-11-12**, i.e. not live on the research date, so no post-DLC reports
exist yet. Every observation below is version-tagged.

**Evidence hierarchy used** (per the issue): current-version game files /
in-game tooltip screenshots / controlled tests > recent community reports
(Nov 2026, free-update era; pre-Risen Ballbylon) > older wiki snapshots and
guides. Claims that were not directly observed are marked **reported**.

> **Status — landed (2026-11-11).** This is a dated research snapshot. Its
> recommended model landed: `src/fusion.ts` now has
> `SPAWN_NO_INHERITANCE_IDS` (Voluptuous Egg Sac) and
> `SPAWN_STATUS_ONLY_IDS` (Brood Mother, Mosquito King), with the degradation
> and trigger caveats. Where this file describes the old
> `SPAWN_EXCLUDED_IDS` or "the current code", read the landed state; inline
> corrections are marked **Update (2026-11-11)**.

---

## Bottom line

1. **Yes — in the current build, Brood Mother's spawn channel carries the
   partner's properties.** The current wiki (revision 2026-09-15) and the
   current namu.wiki page (2026-10-26) both say the spawned baby balls inherit
   the combined ball's effects; 2026 community builds use
   `Hemorrhage × Brood Mother` as a status-spread engine, which only makes
   sense if the babies carry the partner's on-hit status. This is the
   best-evidenced reading, but it is **reported**, not directly observed here.
2. **The behaviour is degraded/partial and probabilistic, not absent.**
   Brood Mother's spawn is a 25/35/45% on-hit chance. namu calls the result
   "deteriorated special baby balls" (weaker than Cell's full-power clones);
   TVTropes reports diminishing returns for Spider Queen's multi-hop babies
   while Maggot's babies keep full features; the demo-era Bilibili guide says
   inheritance happens "in most cases". The single "absent" report — Flash,
   launch week, 2025-10-21 — has **zero replies**, is uncorroborated, and is
   explainable as a trigger-channel limit (Spawn is an On-Hit effect; Flash's
   screen-wide attack is an AOE trigger), not as a broken spawn channel. No
   current-version source reports absence.
3. **Recommended composer model: (a) inheritance wire + "degraded/unreliable"
   caveat.** Remove Brood Mother from the hard `SPAWN_EXCLUDED_IDS`, emit the
   spawn-carrier wire for on-hit status partners, and add a caveat covering
   degradation, probabilistic spawning, the on-hit trigger, and the Flash
   outlier. Keep Brood Mother out of the *spawn-bound-status* wire branch
   (Glacier/Blizzard) until direct evidence exists. Details in
   [Recommendation](#recommendation-for-srcfusionts).

---

## Evidence

### Tier 1 — current-version game files / in-game tooltip screenshots / controlled tests

**No Brood Mother-specific game-file dump or in-game fused-tooltip screenshot
was found.** The repo corpus has no `effect_texts` rows for any
`brood-mother+*` pair and no Brood Mother fused-tooltip image
(`docs/research/fusion-observations/fusion-pairs.json`; `images.jsonl` has no
Brood Mother row). The two fused screenshots that do exist are gameplay/meme
images, not tooltips:

| Source | Date | Version | What it shows |
|---|---|---|---|
| Steam screenshot "Brood Mother X Rad Beam is silly" — <https://steamcommunity.com/sharedfiles/filedetails/?id=3593083469> (image: `https://images.steamusercontent.com/ugc/11910208564753258658/D57B75F2EE6474634026180F02CAA31F8E73C584/`) | 2025-10-24 | launch era | Gameplay frame with many baby balls and green beam lines. Consistent with babies carrying a beam effect, but no tooltip/name; **visual only, not proof**. |
| Reddit post image "Brood Mother x Laser" — <https://i.redd.it/rd12zh6dye0g1.png> | 2025-11-10 | launch era | IQ-bell-curve meme, not a tooltip. Existence evidence only. |

The closest thing to a controlled test is the Reddit thread below
(`williamatherton`, 2025-11-10), which reports testing baby-ball fusions with
Sun/Flash/Flicker/Nuke/Black Hole and all ice/earthquake evolutions. It is a
community test, not a current-version lab test, and its **order** claim was
later retracted — but the inheritance observation itself was not retracted.

### Tier 2 — current-era secondary sources (Naturalist era, 2026-08/10)

These are current for the live build but are wiki/guide sources, not game
files or tooltips.

| Source | Date | Version tag | Confidence | Claim |
|---|---|---|---|---|
| BALL x PIT Wiki, *Brood Mother* (rev 4084) — <https://ballxpit.wiki.gg/wiki/Brood_Mother?oldid=4084> | rev 2026-09-15 | Naturalist era / v1.301-era | reported (wiki) | "When combined with other balls, the direct damage is increased and both effects will be triggered by the ball. **Baby Balls spawned from the combined ball will also trigger the effects of the combined ball.**" And: "The baby balls will inherit the effects of the combined ball which can help give balls will single target effects a pseudo-AOE." |
| BALL x PIT Wiki, *Balls* (rev 4002) — <https://ballxpit.wiki.gg/wiki/Balls?oldid=4002> | rev 2026-09-10 | Naturalist era | reported (wiki) | "Some Special Balls, especially Fused Balls can spawn Baby Balls **inheriting their ablilities**, unlike characters's regular Baby Balls." Trigger matrix: "On-Hit Effects — Destroy, Pass Through, AOE, **Spawn** — **On-Hit only**"; "Spawn: Spawn Clones, Baby balls or Summons. **Spawns can provide bonus triggers.**" |
| namu.wiki (English mirror), *BALL x PIT/Ball* — <https://en.namu.wiki/w/BALL%20x%20PIT/%EB%B3%BC> (Korean: <https://namu.wiki/w/BALL%20x%20PIT/%EB%B3%BC>) | 2026-10-26 | Naturalist era | reported (wiki) | Brood Mother: "While using Broodmother itself as a Fusion Material is quite effective…" Egg Sac: "As a fusion material, divided baby balls have the characteristics of special balls, but **like the brood mother, they produce deteriorated special baby balls**, which makes them worse than cells. However, the situation is better with the characteristic of immediately creating a large amount of rethrows after the cooldown rather than the brood mother that is created with probability." Maggot: "the characteristics of the ball that became the fusion material are inherited by the split ball…" Spider Queen: "the balls can be spread in an instant by inheriting the area attack/status effect of the fused side, including the created egg sac and the baby ball…" VES: "all of the created egg sacs, including the baby ball from which the egg sac was disassembled, can inherit the range attack/status granting of the fused side…" Offspring: "the Broodmother lineage generates Baby Balls that inherit effects…" |
| TVTropes, *BALL x PIT — YMMV* — <https://tvtropes.org/pmwiki/pmwiki.php/YMMV/BallXPit> | accessed 2026-11-11 (page text current) | Naturalist era | reported (wiki) | "Maggot… When an infested block dies it releases a baby ball with **all the effects of the parent**, including infesting. What makes Maggot powerful is it gets _all_ features from the parent. Something like spider queen gives a form of Diminishing Returns for Balance as **only the egg sack has the full power of the parent balls and the babies have a weaker effect. Maggot doesn't depower.**" |

**Reading the current-era sources together:** inheritance is real, but it is
not a clean full-power copy. The degradation is parent-dependent: Maggot's
on-death babies are reported full-power; Spider Queen/VES multi-hop babies
diminish; Brood Mother's own probabilistic babies are called "deteriorated"
relative to Cell's clones.

### Tier 3 — launch-era and 2026 community reports

| Source | Date | Version tag | Confidence | Claim |
|---|---|---|---|---|
| Steam, Ninjilla, "The Cohabitants — BroodMother as a Force Multiplier" — <https://steamcommunity.com/app/2062430/discussions/0/595162291941622293/> | 2025-10-09/10 | pre-release/launch week | reported (single player, with DPS numbers) | "The BroodMother is awesome. **When you fuse it with another ball, the baby balls the fused version makes take on the effects of the other ball.** With the Cohabitants, I just wiped the floor by combining the broodmother and horizontal lasers (admittedly at Fast+), plus an inferno." Follow-up: "BroodMother x Horizontal Laser: 30 launches, 150 dps, ~60k damage / BroodMother: 90 launches, 30 dps, ~6k damage / Laser: 60 launches, 60 dps, ~6k damage." |
| Steam, Noobc0re, "Flash + Brood Mother" (Bugs & Technical Issues) — <https://steamcommunity.com/app/2062430/discussions/1/595163560549548636/> | 2025-10-21 | launch build | reported (single post, **0 replies**) | "My guess is that Brood Mother as a whole is buggered. But definitely **When fused with flash it produces no extra balls, and sure as hell no balls with the properties of flash.**" |
| Reddit, u/williamatherton, "With regards to baby ball lasers…" — <https://www.reddit.com/r/BALLxPIT/comments/1otb9ig/with_regards_to_baby_ball_lasers_the_farther_i_go/> | 2025-11-10 | launch era | reported (community test) | "**Tested: baby ball fusions with sun/flash/flicker/nuke/black hole and all ice/earthquake fusions.**" And: "the created baby balls take on the effects of the AOE ball (assuming the baby ball spawning ball is chosen first during fusion)." |
| Reddit, same author, full retraction — <https://www.reddit.com/r/BALLxPIT/comments/1otb9ig/_/o9st6ue/> | 2026-03-11 | post-launch, pre-Naturalist | reported | "This is old and outdated. **Order only impacts color and visual effects for the balls. Order does not impact game effects.**" (Retracts the order-gating, not the inheritance observation.) |
| Steam, Sentient_Toaster, "some ideas" — <https://steamcommunity.com/app/2062430/discussions/0/759556365113126649/#c759556365113181950> | 2026-02-28 | Regal era (2026-01-26) | reported | "**4x sources of hemo spam (e.g. flash, double shotgun, brood mother)**" — treats Brood Mother as a source of Hemorrhage (on-hit bleed/%-HP) application. |
| Steam, Sentient_Toaster, "200.000m depth" — <https://steamcommunity.com/app/2062430/discussions/0/759556365113128057/#c759556695324112993> | 2026-02-28 | Regal era | reported | 25 km+ build list includes "**Hemorrhage x Brood Mother**". |
| Steam, Xaelon, "What is your favorite custom fusion?" — <https://steamcommunity.com/app/2062430/discussions/0/689741692082941941/#c841755189080848506> | 26 May (year inferred as 2026 from thread context) | Shadow era (2026-04-27) | reported | "**Mixing Nuke with any ball that clones other balls (egg sac, broodmother, cell, etc) is also very fun.** Maggot might be the most fun of the lot imo." |
| YouTube, "BALL x PIT Fusion Mechanics: What Actually Works!" — <https://youtube.com/watch?v=SRcNWzJIML0> | 2026-01-12 | Regal era | reported (video demonstration) | "**the baby balls inherit the effect of the main effect ball**… I combined the baby maker spider queen with the effect blizzard, filling the entire screen with baby blizzards that freeze and destroy everything." |
| YouTube, "New Balls, New Characters, Same Ball x Pit Addiction! — Shadow Update GAMEPLAY" — <https://youtube.com/watch?v=Sn2UvPM4TXU> | 2026-04-28 | Shadow era | reported (video demonstration) | Fused Brood Mother × Time: "I wonder how it would work if we did fusion with broodmother and time cuz then does that mean that each baby ball would have the time effect? … So time in broodmother… Upon hitting an enemy which stays on the field for 30 seconds and freezes enemies inside of it. **45% chance of birthing a baby ball.**" Confirms the spawn property survives the fusion; the transcript does **not** explicitly confirm the babies inherit Time Snare. |
| Bilibili, 果厨一枚Ray212, "【BALL x PIT】全弹珠图鉴&进化配方" — <https://www.bilibili.com/opus/1082211929042190342> | 2025-10-12 | **demo build** (pre-release) | reported (guide) | "育母 融合后会赋予育母生产小弹珠的特性，并且生产出的弹珠**在大部分情况下**也会继承另一种球的特性。" — "Brood Mother: fusion grants the property of producing small balls, and the produced balls **in most cases** also inherit the other ball's properties." |

### Version/context notes

- **No Brood Mother-specific fix** appears in the accessible patch notes.
  The wiki *Game Updates* page lists the last past update as the Naturalist
  Update (2026-08-06) and the next as Risen Ballbylon (2026-11-12); the
  "Changes to pre-existing game content" / "Bug Fixes" sections are `{TODO}`.
  <https://ballxpit.wiki.gg/wiki/Game_Updates>
- The repo's catalog entry for Brood Mother is unchanged in the current data:
  "Has a 25% chance of birthing a baby ball each time it hits an enemy."
  (`src/data/balls.ts`, generated from the v1.301 fact base).
- The launch-week positive report (2025-10-09) predates the 2025-10-15
  release and may be a pre-release/review build; the negative Flash report
  (2025-10-21) is post-release. Build-dependence for the Flash interaction is
  therefore possible but **unverified**.

---

## Analysis

### Q1 — Does Brood Mother's spawn channel carry the partner's properties at all in the current build?

**Yes, per the current-era evidence.** The two current (Naturalist-era)
secondary sources — the wiki revision of 2026-09-15 and namu.wiki of
2026-10-26 — both state that spawned baby balls inherit the combined ball's
effects. The 2026 community reports are consistent: `Hemorrhage × Brood
Mother` is used as a status-spread engine in 25 km+ builds (Feb 2026), and
`Nuke × Brood Mother` is recommended for spawn-multiplication (May 2026).
The only contrary report is the isolated launch-week Flash post, which has no
replies and is not a controlled test.

The strongest *direct* evidence for inheritance is not a tooltip but the
pattern of play: Hemorrhage is an on-hit status (bleed stacks + %-HP proc). If
Brood Mother's babies did not carry the partner's on-hit status, a
`Hemorrhage × Brood Mother` fusion would not be a recognised "hemo spam"
source. That is an inference from reported builds, not a measurement.

**Caveat:** no current-version game-file dump or in-game fused-tooltip
screenshot for Brood Mother was available, so this is **reported**, not
observed. The wiki itself warns that fused tooltips are runtime-assembled and
can overpromise (see `docs/research/fusion-mechanics.md` §1.1), so even a
tooltip would not settle it without a behaviour test.

### Q2 — Is the behaviour degraded/probabilistic, absent, or build-dependent?

**Degraded/partial and probabilistic, not absent.**

- **Probabilistic:** the spawn is a per-hit chance — 25% / 35% / 45% at
  levels 1/2/3. The fused Brood Mother × Time tooltip observed in the April
  2026 video still shows the 45% spawn chance. A low spawn rate can look like
  "no extra balls" in a short observation window, especially if the partner's
  screen-clear effect kills enemies before the ball's own hits land.
- **Degraded:** namu explicitly calls Brood Mother's (and Egg Sac's) fused
  babies "deteriorated special baby balls" and says they are worse than
  Cell's clones. TVTropes independently reports diminishing returns for
  Spider Queen's multi-hop babies ("only the egg sack has the full power of
  the parent balls and the babies have a weaker effect"), while Maggot's
  on-death babies keep "all the features from the parent". The degradation is
  therefore **parent/channel-dependent**, not a blanket "no inheritance".
- **Partial ("in most cases"):** the demo-era Bilibili guide's "in most
  cases" wording suggests some properties do not inherit. The current wiki's
  trigger matrix gives a mechanism: Spawn is an **On-Hit** effect, while
  statuses can be triggered by On-Hit, AOE, On-Timer, On-Shoot, or Spawn.
  Properties that live on a different trigger channel (e.g. pass-through,
  destroy, screen-wide AOE) are not guaranteed to ride the spawn.
- **Absent?** Only the 2025-10-21 Steam Flash post claims no spawns at all.
  It is a single, uncorroborated, zero-reply report from launch week; the
  poster explicitly says "My guess is that Brood Mother as a whole is
  buggered." The same period has a positive Brood Mother × Horizontal Laser
  report with DPS numbers (2025-10-09/10), and the 2025-11-10 Reddit test
  includes Flash among the baby-ball fusions that "take on the effects of the
  AOE ball". The negative report is best treated as an outlier — possibly a
  launch-build bug, possibly a trigger-channel misunderstanding — not as the
  current behaviour.
- **Build-dependent?** Possible for the Flash interaction specifically
  (launch build vs later builds; the Reddit author notes he was on Switch and
  "maybe it got updated"), but there is **no current-version report of
  absence** and no patch note documenting a change. The current-era sources
  describe inheritance as working. Treat build-dependence as unverified.

### Q3 — Which composer model should `src/fusion.ts` use?

**Model (a): inheritance wire + "degraded/unreliable" caveat.**

- **(c) hard exclusion is contradicted** by the current wiki, namu, TVTropes,
  the 2026 Hemorrhage/Nuke builds, and the Reddit Flash test. The repo's
  then-current `SPAWN_EXCLUDED_IDS` entry for `brood-mother` and the
  `fusion-mechanics.md` §2d sentence "Brood Mother's spawn channel does not
  carry the partner's property at all" encoded the launch-week outlier as if
  it were settled. It is not. **Update (2026-11-11):** both were replaced by
  the status-only/degraded model.
- **(b) no wire + caveat understates the evidence.** The inheritance is
  well-enough evidenced to show a wire; hiding it would make the composer
  less useful than the current community understanding.
- **(a) matches the evidence shape:** a real inheritance channel with
  degraded/partial/probabilistic behaviour and one documented contrary
  report. The wire communicates the channel; the caveat communicates the
  uncertainty and the degradation.

---

## Recommendation for `src/fusion.ts`

**Update (2026-11-11):** this recommendation landed for Brood Mother. The
companion Mosquito King ticket went further and moved `mosquito-king` to
`SPAWN_STATUS_ONLY_IDS` rather than keeping it hard-excluded; the caveats are
emitted by `spawnInheritanceCaveats()`.

### Model

Treat Brood Mother as a **degraded spawn carrier**, not a hard-excluded one.

1. **Split the exclusion set.** The current single
   `SPAWN_EXCLUDED_IDS = {voluptuous-egg-sac, brood-mother, mosquito-king}`
   conflates three different findings:
   - `voluptuous-egg-sac` — two-hop chain drops the property (keep hard
     exclusion; corpus: Assassin × VES, Hemorrhage × VES).
   - `mosquito-king` — spawn-on-hit does not fire from the partner's screen
     hits. **Update (2026-11-11):** the companion ticket moved this to the
     status-only set, not a hard exclusion (`mosquito-king-spawn.md`).
   - `brood-mother` — inheritance is reported but degraded/probabilistic
     (move to a `DEGRADED_SPAWN_IDS` set).
2. **Wire on-hit statuses.** In `crossWire()`, allow a
   `DEGRADED_SPAWN_IDS` carrier through the existing spawn-carrier +
   on-hit-status branch. The standard line
   (`Spawned balls from Brood Mother have the same properties as X.`) is
   acceptable if the caveat carries the degradation; a more honest variant
   is `Spawned balls from Brood Mother inherit X's properties, but the
   inherited effect is weaker (reported).`
3. **Do not wire spawn-bound statuses for Brood Mother yet.** The strong
   spawn-bound evidence is for **Maggot** (Brood Mother + Cell) and
   **Spider Queen/VES** as spawn parents, not for Brood Mother direct ×
   Glacier/Blizzard. Keep Brood Mother out of the spawn-bound-status branch
   until a direct test exists. (The current code's single set cannot express
   this split; a second set or a `degraded` flag is the minimal change.)
4. **Add a caveat note in `fuse()`** whenever Brood Mother is a component and
   an inheritance wire is emitted, e.g.:

   > Brood Mother's babies inherit the partner's properties, but the
   > inherited effect is degraded/weaker and the spawn is probabilistic
   > (25/35/45% per hit). The spawn is an on-hit trigger, so screen-wide/AOE
   > partner effects may not produce babies. One launch-week report claims
   > Flash × Brood Mother produced no babies (suspected bug, unverified).

5. **Update the pinning tests and comments** if the recommendation is
   accepted:
   - `src/fusion.test.ts` — replace "Brood Mother spawn channel does not
     carry the partner property" with a positive control for an on-hit
     status partner (e.g. Brood Mother × Bleed/Burn/Hemorrhage) and, if the
     conservative scope is chosen, a negative control for a spawn-bound
     status partner (e.g. Brood Mother × Glacier).
   - `src/regression.test.ts` — remove `['brood-mother', 'flash']` from the
     no-wire exclusion list; add a regression test naming the corrected
     model.
   - `src/corpus.test.ts` — update the "excluded carriers" comment.
   - `docs/research/fusion-mechanics.md` §2d — replace the "does not carry
     the partner's property at all" sentence with the degraded-inheritance
     finding and cite this file.

### Why not a different line for every pair?

The composer already has a `disputed` bit for corpus-contradicted kill
wires. A `degraded` bit (or a caveat key) is the analogous mechanism here:
the wire stays visible, the uncertainty is explicit, and the model does not
pretend the inheritance is full-power.

---

## What would change this recommendation

- **A current-version game-file dump or a controlled current-build test**
  showing Brood Mother's babies do **not** inherit an on-hit status would
  move the model to (b) or (c). The launch-week Flash post alone is not
  enough.
- **A current-build test showing full-power inheritance** (no degradation)
  would simplify the caveat and possibly allow the spawn-bound-status branch.
- **A post-Risen-Ballbylon (after 2026-11-12) report** changing the
  behaviour would need re-tagging; this file is pre-DLC.
- **A direct Brood Mother × Glacier/Blizzard test** would settle whether the
  spawn-bound-status branch should include Brood Mother.

---

## Limitations

- **No playtest capability.** Every behavioural claim here is reported from
  a source; none was observed first-hand.
- **No current-version game files or fused-tooltip screenshots** for Brood
  Mother were available. The corpus has no `effect_texts` or tooltip image
  for any `brood-mother+*` pair. The current-era wiki/namu are secondary.
- **DLC not live.** Risen Ballbylon releases 2026-11-12; no post-DLC reports
  exist as of 2026-11-11. The findings are for the Naturalist-era build.
- **The "degraded" mechanism is not quantified.** namu says "deteriorated";
  TVTropes says Spider Queen's babies are weaker; neither gives numbers.
  The composer should not fabricate a percentage.
- **The Flash outlier is not resolved.** It may be a launch-build bug, a
  trigger-channel misunderstanding, or a real Flash-specific exception. The
  recommendation keeps it as a caveat rather than a hard exclusion.
- **Raw corpus untouched.** No `docs/research/fusion-observations/*.jsonl`
  or `src/data/` files were edited.

---

## Source list (all URLs)

1. BALL x PIT Wiki, *Brood Mother* (rev 4084, 2026-09-15) —
   <https://ballxpit.wiki.gg/wiki/Brood_Mother?oldid=4084>
2. BALL x PIT Wiki, *Balls* (rev 4002, 2026-09-10) —
   <https://ballxpit.wiki.gg/wiki/Balls?oldid=4002>
3. BALL x PIT Wiki, *Game Updates* (accessed 2026-11-11) —
   <https://ballxpit.wiki.gg/wiki/Game_Updates>
4. namu.wiki, *BALL x PIT/Ball* (English mirror, 2026-10-26) —
   <https://en.namu.wiki/w/BALL%20x%20PIT/%EB%B3%BC>; Korean original —
   <https://namu.wiki/w/BALL%20x%20PIT/%EB%B3%BC>
5. TVTropes, *BALL x PIT — YMMV* (accessed 2026-11-11) —
   <https://tvtropes.org/pmwiki/pmwiki.php/YMMV/BallXPit>
6. Steam, Ninjilla, "The Cohabitants — BroodMother as a Force Multiplier"
   (2025-10-09/10) —
   <https://steamcommunity.com/app/2062430/discussions/0/595162291941622293/>
7. Steam, Noobc0re, "Flash + Brood Mother" (2025-10-21) —
   <https://steamcommunity.com/app/2062430/discussions/1/595163560549548636/>
8. Reddit, u/williamatherton, "With regards to baby ball lasers…"
   (2025-11-10) —
   <https://www.reddit.com/r/BALLxPIT/comments/1otb9ig/with_regards_to_baby_ball_lasers_the_farther_i_go/>
9. Reddit, same author, full retraction (2026-03-11) —
   <https://www.reddit.com/r/BALLxPIT/comments/1otb9ig/_/o9st6ue/>
10. Steam, Sentient_Toaster, "some ideas" (2026-02-28) —
    <https://steamcommunity.com/app/2062430/discussions/0/759556365113126649/#c759556365113181950>
11. Steam, Sentient_Toaster, "200.000m depth" (2026-02-28) —
    <https://steamcommunity.com/app/2062430/discussions/0/759556365113128057/#c759556695324112993>
12. Steam, Xaelon, "What is your favorite custom fusion?" (2026-05-26) —
    <https://steamcommunity.com/app/2062430/discussions/0/689741692082941941/#c841755189080848506>
13. YouTube, "BALL x PIT Fusion Mechanics: What Actually Works!"
    (2026-01-12) — <https://youtube.com/watch?v=SRcNWzJIML0>
14. YouTube, "New Balls, New Characters, Same Ball x Pit Addiction! — Shadow
    Update GAMEPLAY" (2026-04-28) —
    <https://youtube.com/watch?v=Sn2UvPM4TXU>
15. Bilibili, 果厨一枚Ray212, "【BALL x PIT】全弹珠图鉴&进化配方"
    (2025-10-12, demo build) —
    <https://www.bilibili.com/opus/1082211929042190342>
16. Steam screenshot, "Brood Mother X Rad Beam is silly" (2025-10-24) —
    <https://steamcommunity.com/sharedfiles/filedetails/?id=3593083469>
17. Repo fact base: `docs/research/game-mechanics.md` (fetched 2026-09-13,
    game v1.301); `src/data/balls.ts` (generated).
