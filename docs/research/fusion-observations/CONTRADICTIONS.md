# Fusion-observation corpus — contradiction register

Research contract: **contradictions are records, not errors.** When sources
disagree, both observations stay in the corpus (`confidence: "contradicted"`),
this file records the conflict, and the curated layer
(`fusion-pairs.json`) marks the affected pair `status: "contradicted"` or
`order.matters_functionally: "disputed"`.

Scope: conflicts **within** the fused-ball observation corpus
(`fusion-observations/*.jsonl`, 1,035 observations over **370 distinct pair
keys** — the validator's exact count across all 11 files; an earlier hand
estimate of "~250" was simply low, because 224 pairs have exactly one
observation and sit outside the handful of heavily-discussed pairs).
Game-evolution recipe disputes (the Bleed+Poison→Virus build change, etc.) live
in `../game-mechanics.md` and are out of scope here.

**Curated-layer totals** (`fusion-pairs.json`, 370 pairs):
status `verified` 31 · `inferred` 96 · `unverified` 218 · `contradicted` 25.
Order: `yes` 15 · `no` 74 · `disputed` 26 · `unknown` 255.
42 pairs are contradicted **or** order-disputed. This register documents those
conflicts; the remaining 328 pairs have no contradiction to record.

**Access date for all web sources: 2026-10-04.** Source content dates as cited.
Ordering background and the reconciliation argument: `../fusion-mechanics.md` §3.

---

## How to read an entry

- **Conflicting claims** — the two (or more) positions, verbatim or as
  minimally-elided quotes, each with URL and date.
- **Evidence weight** — controlled test > single anecdote; site-author
  playtest > community report; game files > prose.
- **Current best reading** — the working model for the companion site. Not a
  resolution of the record; the weaker claim stays in the corpus.

Weighting scale used throughout: **playtest (author)** > **controlled community
test** > **mechanism-backed wiki/game-file claim** > **structured community
guide** > **single anecdote** > **second-hand report**.

---

## 1. Order matters vs order does not

**The headline conflict of the corpus.**

### Claim A — order does NOT affect function
- **Reddit PSA #1** (Leorium, 2025-11-11, 89 points, ~60 pairs tested in BOTH
  orders; controlled method: solo Sisyphus, autofire off, one special ball, no
  passives; spawn families re-tested on the Fungus boss):
  > "RESULTS: AxB vs BxA has 0 difference as to the actual ball effect.
  > However, it does change the visuals on the ball and the color of the damage
  > numbers."
  — <https://www.reddit.com/r/BALLxPIT/comments/1ouhlp1/psa_fusion_order_does_not_matter/>
- **wiki.gg Fusion Mechanics** (oldid 4217, 2026-09-19):
  > "the order of the fused balls does not change the functional stats/abilities
  > of the resulting ball, its name will be different and its appearance *may*
  > be different"
  — <https://ballxpit.wiki.gg/wiki/Fusion_Mechanics>
- **al-gest.com's own commenter** (anonymous, 2025-12-01), under the article
  that prescribes order for 8 pairs:
  > 「融合する順番は効果に影響ないですよ。説明の順番が異なるだけで性能は同じでした。」
  — *the order of fusion does not affect the effect; only the description order
  differs.* <https://al-gest.com/ballpit/ballpit-best-fusion/>
- **Steam** (Shajirr, 2026-01-26): "Order of fusion doesn't matter, only the
  icon changes (icon from first pick, color from the second)". Hope Thief
  (2025-12-24): identical outcome "regardless of selection order".
- Site-author playtests (2026-10-01) match the status-vs-spawn rule with no
  order variable needed.

### Claim B — order DOES affect function
- **Reddit PSA #2** (Leorium reposting official Discord, 2025-11-24) — the
  *narrow* exception: same-property pairs, first-selected's variant wins.
  <https://www.reddit.com/r/BALLxPIT/comments/1p5pil0/psa_2_fusion_order_additional_info/>
- **namu.wiki** (2026-08-26) — the *second* narrow exception: both-cooldown
  pairs, first-selected's cooldown wins. Worked example Black Hole × Timestop
  (5 s vs 20 s). <https://namu.moe/w/BALL%20x%20PIT/%EB%B3%BC>
- **al-gest.com** (矢部明雄, 2025-10-25) — identical boilerplate for 8 pairs:
  > 「必ず『閃光×繫茂』の順番で融合するようにしましょう。」
  No mechanism given anywhere on the page.
- **mmemo.jp** (Asukalon, 2025-11-03) — 11-row 融合1→融合2 table with the header
  rule 「逆の場合目的とする能力にならない場合があります」. States its tables are
  transcribed from al-gest — **one source lineage, not two confirmations**.
  <https://mmemo.jp/archives/14525>
- **u/beastlike** (Reddit 1p2ihjw, 2025-11-20): Flash must be first in
  Flash × Overgrowth. Rebutted in-thread by u/FemurFiend ("It's been tested
  extensively, it does not matter which order you fuse them in").
- **Creative Game Life** (2026-02-02): "The order matters. The first ball you
  select usually dictates the primary firing behavior… the second adds the
  status effect." Sits in the **evolution-recipe** section — likely an
  evolution/fusion conflation.
  <https://creativegamelife.com/ball-x-pit-kenny-sun-devolver-digital-guide>
- **Tappin** (Steam, 2025-11-05) and **Dexile** (Steam "Maggot Lasers",
  2025-10-19) give *opposite* directions (status-first vs AOE-first).
- **Lexifer452** (Reddit 1ouhlp1 thread): more explosions from
  Maggot × Nuclear Bomb than Nuclear Bomb × Maggot. Rebutted by Leorium in
  the same thread.

### Evidence weight
The only **controlled both-orders test** in the public record is PSA #1 (Claim
A). Every Claim-B item is either (a) a folk rule with no mechanism and no test
(al-gest/mmemo, beastlike, Creative Game Life, Tappin, Dexile), (b) a
self-hedged anecdote (Lexifer452), or (c) one of the two narrow exceptions that
PSA #2 and namu identify *and that PSA #1's own scope did not cover*
(same-property pairs; both-cooldown pairs). PSA #1 tested effect differences,
not base-ball pool recursion and not same-property resolution.

### Current best reading
Function is commutative for the overwhelming majority of pairs. Three genuine
order effects exist:

1. **Presentation, always** — name, icon, colour, damage-number colour,
   description paragraph order. (This is almost certainly what al-gest's 8
   warnings and the remembered "list of pairs where order matters" encode.)
2. **Same-property pairs** — first-selected's variant of the shared property
   wins. Known pairs: Mosquito Swarm × Mosquito King, Radiation Beam × Nuclear
   Bomb. (namu rule 5 *blends* same-status-different-numbers instead —
   Leech + Sacrifice keeps both channels, max 20.)
3. **Both-cooldown pairs** — first-selected's cooldown wins. Cooldown class =
   {Black Hole, Bomb, Dark, Egg Sac, Voluptuous Egg Sac, Nuclear Bomb,
   Timestop}. 21 unordered pairs. (Note: catalogue id is `timestop`; the
   separate `time` ball is **not** in the cooldown class.)
4. **Base-ball pool recursion** — order decides which base ball stops appearing
   in the level-up/fusion pool. Not a fusion effect; see §2.

al-gest/mmemo's 8–11 pairs are **contradicted folklore** (all cross-property,
none same-property, none both-cooldown; several directly refuted by PSA #1's
both-orders tests and by al-gest's own commenter). Keep the rows; do not model
them.

**Unresolved:** "first-selected" vs "acquisition order". wiki.gg claims "the
only way to change the order of fused balls is to change the order in which
they're acquired, and one cannot manually select the order of balls for fusion
at this time", while Steam players, al-gest ("fuse A then B") and the
BallxPitBridge's ordered `h1/h2` + `idx1/idx2` slots all describe click-order
selection. Worth one UI observation. Also unresolved: ClipClap35's
"sun x black hole is worse" anecdote vs mmemo prescribing Sun first (the
anecdote's *bad* case) — the two order-matters sources disagree on direction.

---

## 2. Base-ball pool recursion — which slot consumes the ball

**Alleged polarity dispute. On the verbatim texts, the two sides agree.**

### Claim A — FIRST-selected is consumed
- **Abject_Nerve_1052** (Reddit 1srjxm5/ohfrd4o, 2026-04-21):
  > "If one component in the fusion is a base ball (Wind, Egg Sac, Broodmother,
  > Burn, etc.) If it is the first option chosen it will not show up again as an
  > upgrade, if it is the second option chosen you can get another copy.
  > (I.e. wraith x egg sac = can get another egg sac. Egg sac x wraith = no more
  > egg sac show up in level up menu)"
  — <https://www.reddit.com/r/BALLxPIT/comments/1srjxm5/_/ohfrd4o/>
- **Personal_Ad9690** (same thread, ohsnrmg, 2026-04-23):
  > "it does disallow the first selected ball from reappearing in a FUSION (I.e.
  > ghost x egg sac means ghost doesn't come back. Egg sac x ghost means egg sac
  > doesn't come back)"
  — <https://www.reddit.com/r/BALLxPIT/comments/1srjxm5/_/ohsnrmg/>

### Claim B — SECOND-selected is consumed (as read by the harvest annotator)
- **SpaceCatNL** (Reddit 1qquxsm/o2taynm, 2026-01-31):
  > "It's because you put egg sac second. If you fuse it as first slot you won't
  > get it again that run"
  — <https://www.reddit.com/r/BALLxPIT/comments/1qquxsm/_/o2taynm/>
- **SpaceCatNL** (1qquxsm/o2kx31t, 2026-01-30): "Change the order and make sure
  you use them as the second choice when fusing."
- **AstroTravellin** (1qquxsm/o2uj67m, 2026-01-31): "Yep. Just tested and you're
  right."

### Evidence weight
Two independent threads, four authors, and a reproduction. But note the
polarity:

| Statement | Implies |
|---|---|
| Abject: "wraith x egg sac = can get another egg sac. Egg sac x wraith = no more egg sac" | **first**-selected is consumed |
| SpaceCatNL: "put egg sac second" → comes back; "fuse it as first slot" → gone | **first**-selected is consumed |
| Personal_Ad9690: "ghost x egg sac means ghost doesn't come back" | **first**-selected is consumed |

### Current best reading
**There is no polarity contradiction in the source texts.** All three verbatim
quotes say the same thing: *the first-selected base ball is consumed and does
not return*. The "contradiction" is an artifact of the harvest annotations
(`reddit.jsonl` rows 254/256/257 label SpaceCatNL's statement as "the OPPOSITE
polarity of Abject_Nerve_1052"), which misread "put egg sac second" as naming
the consumed slot rather than the surviving slot.

What *is* genuinely disputed is **scope**:
- Abject_Nerve_1052 qualifies the rule to **base balls** (Wind, Egg Sac, Brood
  Mother, Burn, …).
- Personal_Ad9690 generalises to **any** first-selected ball (his example uses
  Ghost, which is not a base ball).

Both records stay. Recommended site model: first-selected base ball is
consumed; treat the "any ball" generalisation as unverified.

**Related, also unresolved:** MarcusXbox (Reddit 1qxzefm/o4ry0fx, 2026-02-11)
observes "BlackHole/egg and egg/BlackHole don't have the same cooldown in your
picture" — a *different* order effect from the namu cooldown rule (which
applies to both-cooldown pairs; Black Hole + Egg Sac **is** a both-cooldown
pair, so this is consistent with namu rather than contradictory to it). Left
as a single-source observation.

---

## 3. Status-vs-spawn rule vs spawn-channel cross-wires

**Rule under test** (icemage_999, Reddit 1ulsapv, 2026-07-02): a partner's
*on-hit status effect* fires from the fused ball's other hits; effects bound to
*spawned sub-entities* do not. Playtest-confirmed three ways by the site
author: Overgrowth X Flash cross-wires, Flicker X Radiation Beam cross-wires,
Flash X Glacier does not.

### Conflicting observations

| Case | Claim | Source |
|---|---|---|
| **Overgrowth X Maggot** | Spawned balls DO inherit the partner's status — the fused tooltip literally says "Spawned balls from Maggot have the same properties as Overgrowth" | images.jsonl (Reddit 1rk5qdn tooltip screenshot, 2026-03-03); Steam Shajirr "Found a Fusion that went nuts" (2026-01-19) |
| **Blizzard X Spider Queen** | "Multiple mini blizzard work on their own" — spawned entities fire the partner's AOE | Steam DavidZhang (2025-10-15), screenshot + caption |
| **Assassin X Voluptuous Egg Sac** | Spawned Egg Sacs / babies do **NOT** inherit Assassin's pass-through, *even though the tooltip advertises it* | Steam ethyl acetate gaming (2025-10-25) |
| **Hemorrhage X Voluptuous Egg Sac** | Babies do **NOT** carry Hemorrhage's %-HP effect ("100% confirm with an easy to repeat test") | Reddit 1ppi8nk (2025-12-18) |
| **Nuclear Bomb X Voluptuous Egg Sac** | Split: babies become nukes (tooltip + several reports) vs babies do not carry the nuke effect | images.jsonl tooltip (2026-04-09) vs Reddit 1ppi8nk thread |

### Reconciliation — these are not all the same channel
The corpus contains **three** spawn-side channels, and the rule only excludes
one of them:

1. **Spawned-entity status** (Overgrowth on Maggot babies, Poison on Egg Sac
   babies) — **does** cross-wire. namu rule 6, confirmed by in-game tooltips.
2. **Spawned-entity AOE/trait** (Assassin's pass-through, Blizzard's positional
   freeze on icicles) — **does not** cross-wire. This is the status-vs-spawn
   exclusion. The Assassin × VES case adds a *two-hop* failure: VES → Egg Sac →
   baby ball, so a spawn-bound property is lost at the intermediate hop
   (ZedsDeadBaby's mechanism, Steam 595163560549993977).
3. **Trigger-channel exclusions** — Satan's screen judgement is debuff-only
   (no damage judgement) so it cannot fire Hemorrhage's %HP; Reaper's kill is
   not triggered by Satan's AOE; Blizzard's freeze is positional, not on-hit.

So the naive reading ("spawned balls inherit the partner") is wrong, and the
naive exclusion ("nothing about spawned entities cross-wires") is also wrong.
The corpus supports a **trigger-channel** model, which is what
`fusion-pairs.json` → `rules.trigger-channel-limits` records.

### Current best reading
Status-vs-spawn is correct for *status effects* and for *spawn-bound traits*
(pass-through, positional AOE). Spawned entities inherit **statuses** (namu
rule 6, tooltip-confirmed) but not **spawn-bound traits**. The two-hop chain
VES → Egg Sac → baby is the documented exception. Keep both the Overgrowth X
Maggot and Assassin X VES rows; they describe different channels.

---

## 4. Satan X Hemorrhage — "doesn't apply" vs "14k DPS"

### Claim A — does NOT apply
- **Go-Nads1165** (Reddit 1stoyll, 2026-04-23):
  > "Does anyone know why Satan doesn't properly apply hemorrhage when fused?
  > The description makes it seem like it would work just as well as flash x
  > hemorrhage but I can't get it to apply the % damage effect."
  — <https://www.reddit.com/r/BALLxPIT/comments/1stoyll/>
- **果厨一枚Ray212** (Bilibili 1124449565113581573, 2026-08-07) — mechanism:
  > Satan's full-screen judgement only applies debuffs and has no damage
  > judgement, so it cannot trigger Hemorrhage's percentage damage.
  — <https://www.bilibili.com/opus/1124449565113581573>

### Claim B — DOES apply (or is strong regardless)
- **ravejesus420** (Reddit 1stoyll/osxpfsn, 2026-06-21):
  > "i mean idk about you but im getting 14k DPS with Satan x Hemorrhage, so if
  > thats not working then what the hell does working look like lmao"
  — <https://www.reddit.com/r/BALLxPIT/comments/1stoyll/_/osxpfsn/>
- **Lucas_Limao_170** (Reddit 1r9npqr/o6gp8d9, 2026-02-20): Satan x Hemorrhage +
  Flash x Hemorrhage is a stable infinite-mode clear that doesn't crash.

### Tooltip evidence (the third leg of the conflict)
- **Go-Nads1165** (1stoyll/oimtqre, 2026-04-27) quotes the fused white text:
  > "area of affect from Satan also applies hemorrhage"
  Used Satan **first** on every attempt. The tooltip promises the cross-wire.

### Evidence weight
The Bilibili claim is **mechanism-backed** and specific (Satan's channel is
debuff-only; %HP is a *damage* proc). The OP's report is a careful negative
test with a known-good comparator (Flash X Hemorrhage). ravejesus420's "14k
DPS" is a **build-dependent total**, not a measurement of the %HP proc — Satan
x Hemorrhage also carries Satan's burn + berserk, which alone produce high DPS.
14k DPS is also nowhere near a "30% current HP per second" boss-melt, which is
what a working Hemorrhage cross-wire delivers on Flash X Hemorrhage.

### Current best reading
**The %HP cross-wire does not fire.** The tooltip's "area of affect from Satan
also applies hemorrhage" is either (a) describing the *stack* application
(bleed stacks do apply; the *consume-and-%HP* proc does not) or (b) simply
wrong. The 14k-DPS report does not contradict the negative finding. This is
also the cleanest **tooltip-vs-behaviour** mismatch in the corpus (§7).

*Note:* the site author has not playtested this pair. One playtest on a boss
would settle it.

---

## 5. Landslide X Mosquito Swarm — bug vs works vs kill-gated

### Claim A — does not cross-wire (bug)
- **Jarcionek** (Reddit 1qxzefm, 2026-02-07):
  > "I was expecting the mosquito hits to create landslides too. Similarly to
  > how Mosquito Swam x Nuclear Bomb (or Black Sun) works. This is such a huge
  > inconsistency that it seems like a bug."
  — <https://www.reddit.com/r/BALLxPIT/comments/1qxzefm/>
- **Cruxis1712** (1qxzefm/o40iafj): the swarm and any baby-ball spawners do NOT
  trigger most AOE effects; speculates Landslide is new and AOE cross-wiring may
  not be incorporated yet (patch-lag hypothesis).

### Claim B — works, but is kill-gated
- **Unnamed** (1qxzefm/o4c…, 2026-02-07):
  > "It works, mosquito just sucks. I find that mosquitos rarely kill an enemy.
  > And mosquito's ability only procs when mosquito is what gets the kill."
- **Abject_Nerve_1052** (1qxzefm/o41vmz3): "It does work with Maggot, believe
  its a bug that it doesn't work with Mosquito Swarm." Also documents the
  **reload mechanic** (hidden Dexterity-based, diminishing returns) shared by
  Landslide, Mosquito Swarm and Fireworks — none of them has a cooldown.

### Counterpoint — baby balls DO trigger Landslide
- **Abject_Nerve_1052** (same comment): Landslide works with Maggot.
- **willostyllos** (Reddit v.redd.it/f2hovi8ldxfg1, 2026-01-27): "Landslide
  fused with Maggot is absolute chaos."
- **namu.wiki** (2026-08-26): fusing Landslide with split balls (Maggot/Cell)
  is "very good".

### Evidence weight
Two independent OP-side reports of non-cross-wire + one careful counter-claim
with a mechanism (kill-gating) + two independent reports that Landslide works
with Maggot. No controlled test.

### Current best reading
**Kill-gated, not a cross-wire failure.** Mosquito Swarm's proc fires only when
the mosquito lands the killing blow; mosquitoes rarely do, so the cross-wire
looks dead. The Maggot counter-examples show the Landslide × spawn channel is
not inherently broken. The "Landslide is new and unsupported" patch-lag
hypothesis is unverified. Sister case: **Hemorrhage X Voluptuous Egg Sac**
(§7) has the same shape — a proc that fires from the main ball but not from
babies — but there the negative is much better evidenced.

---

## 6. Nosferatu X Reaper — "infinite combo" vs "underwhelming"

### Claim A — infinite combo
- **Ok_Mess3353** (Reddit, screenshot i.redd.it/ecxzyonc6dlh1.png, 2026-08-24):
  "Nosferatu x reaper infinite combo"
- **YouTube** (channel video, description): "I combine two of the strongest
  balls in the game: Reaper and Nosferatu. Can this fusion completely break the
  run?"

### Claim B — underwhelming
- **Few_Comedian4245** (Reddit 1ubzi5y "Mildly Underwhelming Fusion",
  2026-06-21): the parallel disappointment case, with a full tooltip photo.
  Its caption references **Flash x Reaper** as the *working* comparator.
- **ProBunslayer** (1ubzi5y/ot043he): "Same with Nosferatu x Reaper unfortunately"

### Evidence weight
Both sides are single-source sentiment, not measurements. The screenshot is a
post title with no numbers. "Underwhelming" is subjective and build-dependent.

### Current best reading
**Unresolved sentiment conflict; not a mechanism dispute.** What the corpus
*does* establish about Reaper is better evidence for the trigger-channel model:
Reaper's instant-kill fires from Flash/Flicker hits and from baby balls, but
**not** from Satan's AOE (Fishnabuboo, YouTube 2026-06-22). Pair
`nosferatu+reaper` stays `contradicted` because the corpus holds both
sentiments; it is the weakest contradiction in this register.

**Sister case, better evidenced:** **Nosferatu X Satan** — Kriegen (Steam
2026-01-30) reports the fused ball deals **0 damage** and ends the run;
Chrattac reports the same for Nosferatu X X-Ray; TheUSGovernment (Steam
2026-03-18) reports **47M damage at 293 m** for the same pair. Two independent
"broken" reports vs one "huge damage" report. Also **Nosferatu X Sun**
disables all special balls (Reddit 1r9npqr). Best reading: Nosferatu fusions are
prone to run-breaking bugs and the outcome is build/patch-dependent.

---

## 7. Tooltip-vs-behaviour mismatches

A class of contradictions, not a single one. Each is a case where the fused
ball's own effect text promises something the game does not do.

| Pair | Tooltip says | Behaviour | Source |
|---|---|---|---|
| **Satan X Hemorrhage** | "area of affect from Satan also applies hemorrhage" | %HP proc does not fire (see §4) | Reddit 1stoyll/oimtqre 2026-04-27 |
| **Assassin X Voluptuous Egg Sac** | spawned balls behave like Assassins (pass-through) | spawned Egg Sacs/babies do **not** pass through | Steam 595163560549993977 2025-10-25 (two independent reporters) |
| **Nuclear Bomb X Wraith / Wraith X Nuclear Bomb** | white text identical for both orders | the two orders **behave differently**; the white text is "incorrect" | Reddit 1srjxm5/ohfrd4o 2026-04-21 (Abject_Nerve_1052) |
| **Sacrifice X Ghost** | (tooltip promises pass-through) | hit-once+cooldown is dominant; pass-through is lost | Steam 595163560549992754 2025-10-25 (CPT Chthonbeard) |
| **Inferno X Freeze** | — | Inferno never had pass-through to inherit (evolution components' traits are not auto-retained) | Reddit 1pvrmvh 2025-12-28 |

### Current best reading
The in-game fused tooltip is **composed at runtime from the two components'
templates** (confirmed by game-file inspection: no fused-effect field exists in
`UpgradeInfo`, no fusion table in `game_data.json`, the live save stores a
`combined` list of absorbed HeroTypes). It therefore *predicts* composition by
concatenation and cannot know about trigger-channel exclusions, two-hop spawn
chains, or fixed trait priorities. **Trust behaviour over the tooltip**; treat
the tooltip as the *components'* text, not the fused result's contract.

Related non-tooltip composition surprises (same root cause):
- Two Destroy balls may lose one explosion (wiki + ballbylon-helper).
- Cell(Clone) × Bomb(Destroy) = "indestructible bomb" — components interact
  beyond concatenation.

---

## 8. The 9999 damage cap — display cap vs real cap

### Claim A — 9999 is a real per-hit cap
- **TVTropes** (2026-09-21): "Damage-per-hit is capped at 9999. This is high
  enough that it's unlikely to be relevant for an initial playthrough."
  — <https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/BallXPit>
- **Xaelon** (Steam 2025-11-11): "I learned that Hemo's HP damage is capped at
  9999 that run."
- **ND - KZ** (Steam 2025-10-20): "this is how I find out the game dmg is
  capped at 9999".

### Claim B — 9999 is a display cap
- **Grampire** (Steam 624436764983026080, 2025-10-20):
  > "Flash+ hemo is the best and scales in ng layers forever. Game shows 9999
  > but it does more damage than this."
- **Xersin** (Steam 2025-10-28): "a Nuclear Bomb X Iron on Sisyphus had a damage
  range of 14616 to 25580 in a run today. Still hit 9999 on every single enemy."
  — the **pre-cap** range is above 9999 while the **displayed** pop-ups are 9999.
- **Scrambles the Death Dealer** (Steam 2026-01-07): Glacier X Maggot ice blobs
  "explode for 9999k damage" — a display artifact.

### Evidence weight
Xersin's report is the decisive one: it shows a computed damage range
*above* 9999 alongside per-enemy displays of exactly 9999. That is what a
display cap looks like. Grampire independently says damage scales past 9999 in
NG+ layers.

### Current best reading
**9999 is a display/number-format cap.** Real damage exceeds it. Any
"fused-ball DPS" number read off screen is capped at 9999 per hit and
understates builds that hit harder. Do not use on-screen 9999 pop-ups as an
upper bound on a fusion's damage.

---

## 9. Fusion offer missing with only 2 level-3 balls

### The reports (3 threads)
- **non existent** (Steam 595163936631074183, 2025-10-28):
  > "When Only 2 lvl 3 Balls are in inventory (Black Hole & Sun), the infuse
  > option doesn't appear when picking up fusion cell. Fusion of Sun x Black
  > Hole worked when I got another ball to level 3"
  Confirmed by 3 other commenters in-thread (Ephemeral, Sloopy_DE, "a homeless
  child").
- **roykl** (Steam 666096879249094498, 2025-11-10):
  > "Radiation laser + cell will not allow fusing unless a third LVL3 ball is in
  > inventory.(which does allow the fusion to be selected)"
- Black Hole fusions generally "can't be fused at all" reports (Reddit, 2026).

### Evidence weight
Four independent confirmations of the same UI behaviour across two Steam
threads. No controlled test, no mechanism.

### Current best reading
**A general UI/fusion-availability bug, not pair-specific.** When exactly two
level-3 balls exist, the fusion offer may fail to appear; a third level-3 ball
unblocks the offer. Both named pairs (Black Hole × Sun, Radiation Beam × Cell)
are filing instances of the general bug — the harvest marks
`cell+radiation-beam` as "not pair-specific". Recommend modelling as a known
game bug, not a property of either pair.

---

## 10. Further contradictions found in the corpus

### 10a. Pair-space arithmetic: 7836 vs 7921
- **Fusion_Mechanics** (2026-09-19): `(90*89) - 87*2 = 7836`
- **Balls** (2026-09-10): `(90*89) - 89 = 7921`
Both are editor arithmetic, not game data. **Best reading: treat any exact
fusion count as unverified.** (The 90×90 `NumCombos` save matrix is a separate
question — see `../fusion-mechanics.md` §4.)

### 10b. Fused-ball level on creation: level 1 vs level 3
- **TVTropes** (2026-09-21): "fusion balls are always level 1 on creation" —
  Black Hole needs 2 more levels when used as a fusion component.
- **namu.wiki** (2026-08-26): the fusion ball is "완성된다" (complete) at level 3.
- **kamigame** (2026-09-13): "融合後も装備はレベル3のままとなる" — the fused
  equipment stays at level 3.
**Best reading: unresolved.** namu + kamigame agree (two sources); TVTropes
dissents. Could be a reading of *component* level (both components are level 3
when fused) vs *result* level. One playtest settles it.

### 10c. Sub-level-3 fusion possible vs not
- **blueprintedgaming** (2026-09-06): fusing below Level 3 is possible but
  wasteful — "a weaker plain combination" that consumes both components.
- **namu.wiki** (2026-08-26): both target balls **must** be level 3.
**Best reading: namu is the better source (rule statement, not a tips column).
BPG's page also contains other loose claims. Unresolved.**

### 10d. Black Hole X Maggot — do babies carry instant-kill?
- **Positive:** "Maggot x Black Hole: endless chain reaction of baby black
  holes"; "Black Hole x Maggot is fairly powerful"; a third report of babies
  inheriting Black Hole's screen-clear.
- **Negative:** "Baby balls spawned by Maggot do NOT carry Black Hole's
  instant-kill" (two independent reports, spawn-bound channel).
**Best reading: the status-vs-spawn / trigger-channel model predicts NO
(instant-kill is not an on-hit status). The positive reports are likely
describing the main ball's own screen-clear, misattributed to babies. Keep
both; mark contradicted.**

### 10e. Flicker X Reaper — does Flicker's tick fire Reaper's kill?
- **Positive:** "Reaper x Flicker: Reaper's instant-kill works with Flicker's
  ticks" (three separate reports).
- **Negative:** "Flicker's screen ticks do NOT trigger Reaper's on-impact kill.
  Only direct hits." (one report)
**Best reading: majority + the author's playtest of Flicker X Radiation Beam
(a different proc) suggest periodic screen ticks *do* fire on-hit procs. But
Reaper's kill is an *on-impact* kill, which is a different channel from an
on-hit status. Genuinely open. Site author's flash+reaper / flicker+reaper
rows show both polarities.**

### 10f. Earthquake X Flash — partial cross-wire
- **Positive:** "it simply does both AOE attacks wherever a ball hits".
- **Negative:** "EQ's 3x3 does NOT become board-wide from Flash, and Flash's
  blind does NOT become EQ's 3x3."
**Best reading: both kits coexist independently on one ball — the same result
the author's Flash X Glacier playtest found. The "both AOE wherever a ball
hits" report is probably describing coexistence, not inheritance.**

### 10g. Black Hole X Satan — peak AFK vs run-breaking
- **Positive:** "Satan x Blackhole is peak afk gaming except for bosses"; "all
  mobs except bosses die as soon as they spawn"; Steam build guide (2026-08-11)
  documents "Satan's aoe will inflict the instant kill from Black Hole".
- **Negative:** "I did do a build with saran and blackhole that did actually
  break it tho. Has a werid interaction that breaks spawns and freezes the
  enemies at the top permanently but also cant kill anythinf." (lionthebrian,
  2026-08-24)
**Best reading: the cross-wire is real and strong; the breakage is a
scale/performance bug at high spawn rates (same family as Nosferatu X VolEgg
screen degradation). Both can be true.**

### 10h. Attribution splice in english.jsonl
`english.jsonl` row 86 attributes the Flash × Overgrowth *order-matters* claim
to u/FemurFiend. The Arctic Shift record shows it is **u/beastlike**, with
FemurFiend replying that order does **not** matter. Correct records live in
`ordering.jsonl`. **Do not cite `english.jsonl:86` for either side.** See
`../fusion-mechanics.md` §3 and its Uncertainty summary.

### 10i. Magma X Blizzard freeze radius (demo-era, possible build change)
Frankie (Steam, 2025-06-18) + Heidi Bumm (2025-06-21) report a real order
effect: Magma-first = blue ball, 4-tile freeze; Blizzard-first = red ball,
2-tile freeze. Re-affirmed 2025-10-22. Contradicted by PSA #1. **Both claims
are demo-era / early-access and may describe a different build.** Recorded as
`order.matters_functionally: "disputed"` on `blizzard+magma`. One current-build
playtest would resolve it.

### 10j. Sun X Black Hole direction
mmemo prescribes Sun **first**; ClipClap35 (Reddit 2025-11-27) reports
"sun x black hole" behaving *worse* (delayed insta-kill) than "black hole x
sun" — i.e. the prescribed order is the *bad* one. The anecdote is self-hedged
("I dont remember exactly"). Two order-matters sources disagree on direction.
**Unresolved.** Note the pair is also in mmemo's 3 extras (all involve a
cooldown-class ball), where namu's real rule may be what was actually observed.

---

## 11. Index of contradicted pairs (curated layer)

The 25 pairs whose `status` is `"contradicted"` in `fusion-pairs.json`. A pair
is marked contradicted when (a) the harvest filed at least one observation with
`confidence: "contradicted"` on that pair (pair-specific rows only), or (b) the
curated layer finds both a `cross-wire` and a `no-cross-wire` claim for the
same pair. Sections above cover the major ones; the rest are listed here so a
reader knows they exist.

| Pair | obs | What conflicts | Section |
|---|---|---|---|
| `black-hole+maggot` | 9 | babies carry instant-kill vs spawn-bound channel says no | §10d |
| `black-hole+nuclear-bomb` | 11 | self-destruct-ball order claim vs PSA #1 rebuttal | §1 |
| `black-hole+satan` | 7 | peak AFK mob-clear vs run-breaking spawn/freeze bug | §10g |
| `black-hole+sun` | 50 | screen-wide insta-kill praise vs "breaks the game" / fusion-offer bug | §9, §10g |
| `earthquake+flash` | 5 | "both AOE wherever a ball hits" vs "EQ's 3x3 does not go board-wide" | §10f |
| `egg-sac+ghost` | 5 | base-ball pool recursion polarity annotations | §2 |
| `egg-sac+holy-laser` | 1 | single flagged disagreement in the harvest | — |
| `flash+hemorrhage` | 32 | 9999 cap real vs display; order folklore vs PSA #1 | §8, §1 |
| `flash+overgrowth` | 59 | order matters (al-gest/beastlike) vs order does not (PSA #1) | §1 |
| `flicker+overgrowth` | 13 | Flicker carries partner's status vs "cannot apply dizzy" | §3 |
| `flicker+reaper` | 10 | Flicker ticks fire Reaper kill vs "only direct hits" | §10e |
| `freeze-ray+sun` | 2 | Sun's AOE applies Freeze Ray freeze vs positional-only | §7 |
| `hemorrhage+satan` | 6 | tooltip/14k DPS vs no %HP cross-wire | §4 |
| `hemorrhage+voluptuous-egg-sac` | 9 | babies carry Hemorrhage vs "100% confirmed they do not" | §3 |
| `holy-laser+maggot` | 28 | self-sustaining loop praised vs order/behaviour disputes | §1, §3 |
| `holy-laser+shotgun` | 1 | single flagged disagreement in the harvest | — |
| `iron+nuclear-bomb` | 2 | 9999 display cap vs pre-cap 14616–25580 range | §8 |
| `landslide+maggot` | 4 | baby balls trigger Landslide vs OP's "complete waste" hypothesis | §5 |
| `landslide+mosquito-swarm` | 6 | bug vs works vs kill-gated | §5 |
| `maggot+nuclear-bomb` | 27 | explosion-count order claim (Lexifer452) vs Leorium's rebuttal | §1 |
| `nosferatu+reaper` | 5 | infinite combo vs underwhelming | §6 |
| `nosferatu+satan` | 6 | 0-damage run-break vs 47M damage at 293 m | §6 |
| `noxious+poison` | 1 | max-poison-stacks order example (PSA #2 same-property) | §1 |
| `nuclear-bomb+voluptuous-egg-sac` | 6 | babies become nukes vs babies do not carry nuke | §3 |
| `vampire+vampire-lord` | 1 | single flagged disagreement in the harvest | — |

Note that several of these are **order disputes** rather than behaviour
disputes: `flash+overgrowth`, `flash+hemorrhage`, `maggot+nuclear-bomb`,
`black-hole+nuclear-bomb`, `black-hole+sun`, `holy-laser+maggot`, `egg-sac+ghost`
and `earthquake+flash` also carry `order.matters_functionally: "disputed"`.
26 pairs in total are order-disputed. The 17 that are *only* order-disputed (no
behaviour conflict) are therefore not in the table above: `black-hole+flash`,
`blizzard+magma`, `brood-mother+laser-vertical`, `cell+nuclear-bomb`,
`egg-sac+hemorrhage`, `egg-sac+maggot`, `egg-sac+poison`, `flash+flicker`,
`flicker+hemorrhage`, `glacier+shotgun`, `hemorrhage+sun`,
`laser-vertical+maggot`, `magma+shotgun`, `nuclear-bomb+overgrowth`,
`nuclear-bomb+shotgun`, `nuclear-bomb+wraith`, `overgrowth+sun`. The first and
largest group is the al-gest/mmemo order list (the Flash/Flicker/Sun ×
Overgrowth/Hemorrhage pairs appear in the table above because they *also* have
behaviour disputes; the remaining al-gest rows `glacier+shotgun`/`magma+shotgun`
and mmemo's extras `cell+nuclear-bomb`/`nuclear-bomb+shotgun` are here), plus
the Frankie/Heidi Magma × Blizzard case (§10i), plus pairs the harvest flagged
`confidence: "contradicted"` on an order claim. Those are covered by §1, §2 and
§10 rather than individually.

The three single-flagged pairs (`egg-sac+holy-laser`, `holy-laser+shotgun`,
`vampire+vampire-lord`) are kept as contradicted on the harvest's own
`confidence: "contradicted"` marker. Each is a lone observation; no pair-specific
reconciliation is possible from the corpus as it stands.

---

## 12. Cross-cutting: where the corpus agrees

Not contradictions, but useful boundaries on the above — the composition model
the companion site can treat as settled enough to document:

- Fused name format is `"A X B"`, A = first-selected. Language-dependent
  separator (`X` / `×`).
- A fused ball is **terminal**: cannot fuse again, cannot evolve, cannot be
  used as an evolution component. (namu + TVTropes + Reddit; supports the
  site's namespace-separation invariant.)
- Evolved × evolved fusion **is** possible (official Steam achievement
  "Fusion Evolution — Fuse two already-evolved balls together", 74.8% unlock).
- namu's **seven composition rules** + the status-vs-spawn rule + the AOE×status
  TVTropes rule cover most of the corpus. Fixed component-vs-component
  priorities (Assassin no-back-pierce, Warp-before-pierce, hit-once+cooldown
  dominant over pass-through) are **commutative** and should not be modelled as
  order effects.
- **No fusion table exists in the game data.** Fused display text is assembled
  at runtime. (Multiple independent game-file inspections.)

---
---

# Known corpus issues

The raw layer (`*.jsonl`) is frozen and contains disclosed workarounds. A
future reader needs to know these before treating a pair's `obs_count` as
pair-specific evidence.

## A. Anchor-pair rows (rule-only rows filed on a stand-in pair)

Some sources state a **general rule** while naming no pair (or naming only a
category). The harvest had to attach those rows to *some* pair key (the schema
requires one for `behavior-claim`), so they are filed on a disclosed **anchor
pair** — usually the thread's subject. The harvest annotator marked these in
`claims[].detail` with phrases like `FILING ANCHOR`, `stand-in`,
`not pair-specific`, `pair is an anchor`, `PAIR IS THREAD-CONTEXT-IMPLIED`.

**Census.** Counting rows whose `claims[].detail` carries an explicit
anchor/stand-in/not-pair-specific disclosure:

| File | Disclosed anchor rows |
|---|---|
| `reddit.jsonl` | 15 |
| `steam.jsonl` | 1 (`cell+radiation-beam`) |
| `namu.jsonl` | 1 (`maggot+poison`, 2026-08-26 "English gloss … Pair is illustrative") |
| **Total** | **17** |

The brief expected ~18 in `reddit.jsonl` alone. The exact count is
marker-phrasing dependent: rows that say only "GENERAL RULE" or "the claim is
general" without the words *anchor* / *stand-in* / *not pair-specific* bring
the reddit total to 22; a very narrow reading of the literal phrases "anchor" /
"not pair-specific" / "pair is an anchor" yields 8. **The list below uses the
15-row reddit census** (every row that either says "anchor"/"stand-in" or is a
`composition-rule` whose detail declares the claim general).

| # | File:line | Filed on | Kind | What the row really is |
|---|---|---|---|---|
| 1 | `reddit.jsonl:120` | `black-hole+nuclear-bomb` | behavior-claim | Order matters for self-destructing balls "in some fusions" — names no partner |
| 2 | `reddit.jsonl:125` | `flash+overgrowth` | behavior-claim | Independent tester corroborates PSA #1; no specific pair tested |
| 3 | `reddit.jsonl:126` | `flash+overgrowth` | composition-rule | "evolutions and fusions obey the Commutative property" — general |
| 4 | `reddit.jsonl:128` | `flash+overgrowth` | behavior-claim | General question about the tooltip's cross-wire line |
| 5 | `reddit.jsonl:178` | `flash+overgrowth` | composition-rule | "Delivery Method x Status Effect" general order rule |
| 6 | `reddit.jsonl:209` | `overgrowth+sun` | behavior-claim | "choose Sun first in this fusion" — **ambiguous anchor** (thread covers Black Hole × Sun too) |
| 7 | `reddit.jsonl:226` | `nosferatu+voluptuous-egg-sac` | behavior-claim | Corroborates the VolEgg bug; generalises to mass baby-ball builds |
| 8 | `reddit.jsonl:242` | `flash+overgrowth` | behavior-claim | "a x b vs b x a doesn't matter at all except for visuals" — categories tested, not pairs |
| 9 | `reddit.jsonl:247` | `flash+overgrowth` | composition-rule | "rest of cases is just visual" — the cleanest order reconciliation |
| 10 | `reddit.jsonl:250` | `flash+overgrowth` | behavior-claim | Answers the thread's general order question |
| 11 | `reddit.jsonl:251` | `flash+overgrowth` | behavior-claim | "it only affects the image" — general |
| 12 | `reddit.jsonl:254` | `cell+egg-sac` | behavior-claim | Diagnoses the pool bug; names no specific partner |
| 13 | `reddit.jsonl:257` | `egg-sac+ghost` | behavior-claim | Reproduces the order-dependent pool rule; names no pair |
| 14 | `reddit.jsonl:285` | `cell+voluptuous-egg-sac` | behavior-claim | Teasing reply about Maggot on the VolEgg × Cell thread |
| 15 | `reddit.jsonl:308` | `mosquito-king+vampire-lord` | composition-rule | "You can't use other fused orbs for evolutions" — general |
| 16 | `steam.jsonl:45` | `cell+radiation-beam` | behavior-claim | Same fusion-offer bug as Sun × Black Hole; explicitly "not pair-specific" |
| 17 | `namu.jsonl:34` | `maggot+poison` | behavior-claim | namu rule 6 gloss; pair is illustrative |

**Treatment in `fusion-pairs.json`:** these rows' claims are **not** counted as
pair-specific evidence. They live under each pair entry's `rules[]` array
(hoisted out of `claims[]`), and the general rules themselves are promoted to
the top-level `rules` / `general_rules_notes` objects. Pair `obs_count` still
includes them (obs_count = raw observations filed on that key), which is why
`flash+overgrowth` shows `obs_count: 59` but far fewer pair-specific claims.

**Related rows that are pair-specific but rule-shaped** (kept in `claims[]`
because they name the pair as an example *and* make a claim about it):
`reddit.jsonl:151` (Landslide × Mosquito Swarm + the general baby-ball claim),
`reddit.jsonl:157` (Glacier × VolEgg anti-synergy), `reddit.jsonl:165` (Egg Sac
× VolEgg non-combination), `reddit.jsonl:243` (Egg Sac × Wraith + the pool
rule), `reddit.jsonl:168` (Inferno × Freeze + the evolution-components rule).
These are usable as pair evidence *and* as rule evidence.

## B. `game-files.jsonl` — global rules pinned to representative pairs

The schema requires `pair` for every kind except `composition-rule` global
rules, and the game-file harvest has **no pairs to name** (its findings are
about the *presence/absence* of fusion data). It therefore pins most rows to
**representative pairs**:

- `bleed+freeze` — 24 rows. This is the wiki's canonical naming example ("fusing
  Bleed and Freeze will result in Bleed X Freeze"), so it was used as the
  stand-in for every global finding: no fusion table, no fused-name format
  string, no fused-effect field, `MergeComponents` = evolution-only, the live
  save's `combined` list, `NumCombos`, the pair-space arithmetic, `Loc()`/`desc_fill`
  text generation. **None of these are claims about Bleed × Freeze.**
- `dark+egg-sac` — 2 rows. The Destroy-class pair used for ballbylon's
  "fusing two Destroy balls may lose one effect" warning and the wiki's
  Destroy caveat.
- `bomb+cell` — 1 row. The Spawn-compensates-Destroy example (Cell × Bomb =
  "indestructible bomb").
- `laser-beam+sacrifice` — 1 row. jellyhani's `"A + B"` overlay separator (not
  the game's `"A X B"`).

**Treatment:** `game-files.jsonl` rows are hoisted to `rules[]` on those pairs
and, where global, to the top-level `rules` / `general_rules_notes` objects.
`bleed+freeze` in `fusion-pairs.json` has **6 pair-specific claims**, not 25
observations' worth — the other rows are the pinned globals.

Also note: `game-files.jsonl` rows 3–4 are `effect-text` for the **unfused**
I2Languages templates of Bleed and Freeze (`{[bleed_amt]}` etc.), not a fused
tooltip. They are recorded under `rules[]` as `effect-text-source` so a reader
does not mistake them for a Bleed X Freeze tooltip. The real Bleed X Freeze
tooltip lives in `images.jsonl` (and is `complete: false` — the panel is
scrolled).

## C. `english.jsonl:86` attribution splice (do not cite)

The Flash × Overgrowth order-matters quote in `english.jsonl` is filed under
u/FemurFiend's praise sentence. The Arctic Shift record shows the claim is
**u/beastlike's**, and FemurFiend is on the *order-does-not-matter* side. Both
correct records are in `ordering.jsonl`. The raw row is kept as-is (raw layer
is frozen); the curated layer draws from `ordering.jsonl` for this dispute.

## D. Effect-text completeness

Only 11 `effect-text` observations exist corpus-wide. Of those:

- `images.jsonl` rows 2–7 are full tooltip transcriptions (`complete: true`)
  except **row 1 (Bleed X Freeze)** — the panel is scrolled, the Freeze half is
  off-frame — and **row 8 (Voluptuous Egg Sac X Nuclear Bomb)** — the header and
  the start of the Nuclear Bomb line are scrolled off. Both are marked
  `complete: false`.
- `reddit.jsonl:260` (Satan X Hemorrhage) is a **quote of the tooltip's white
  line**, not a transcription of the whole panel. Recorded as `complete: false`
  and mirrored under `rules[]` as `effect-text-quote`.
- `game-files.jsonl:3–4` are unfused templates (see §B).

So the corpus contains **5 complete fused tooltips** (Egg Sac X Poison, Poison
X Egg Sac, Spider Queen X Vampire Lord, Vampire Lord X Spider Queen, Overgrowth
× Maggot, Satan × Reaper — 6 counting both orders of the same pairs) and two
partial ones. Everything else about fused effect text is behavioural claim.

## E. `names_seen` hygiene

`in_game_name` in the raw layer is used loosely: some harvest agents put
editorial labels there (`"(general tooltip question)"`, `"X X Y"` placeholder
text, Japanese page headings, full sentences). `fusion-pairs.json` filters
`names_seen` to strings that parse as a fused name (two name-like parts around
a separator, or one short name-like token). Community aliases that a source
genuinely wrote are kept (`Growth X Flash`, `Flash X Regrowth` — community
nicknames for Overgrowth). Editorial labels are dropped.

## F. `obs_count` semantics

`obs_count` = raw observations filed on that pair key in the harvest layer,
**including** anchor/representative rows (§A, §B) and `name-only` rows. It is
**not** a count of pair-specific evidence. For evidence weight use
`claims.length` + `source_types` + `status`. Top pairs by `obs_count` also
tend to be the pairs with the most anchor noise (`flash+overgrowth` 59 obs →
38 claims + 13 hoisted rules).

## G. Unresolved items a future session could close

1. **One playtest** each would upgrade the two order exceptions from "reported"
   to "observed": Mosquito Swarm × Mosquito King (same-property) and
   Black Hole × Timestop (both-cooldown).
2. **One playtest** of Satan × Hemorrhage on a boss settles §4.
3. **One playtest** settles fused-ball level on creation (§10b).
4. **One current-build playtest** of Magma × Blizzard in both orders settles
   §10i (demo-era claim).
5. **A completed save's `NumCombos` matrix** would reveal whether the game
   records directed pairs (order map) — `../fusion-mechanics.md` §4.
6. **One UI observation** settles "first-selected" vs "acquisition order"
   (`../fusion-mechanics.md` (Uncertainty summary)).
