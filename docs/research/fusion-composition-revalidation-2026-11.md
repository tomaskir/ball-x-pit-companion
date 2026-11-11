# Fusion composition rules — re-validation (November 2026)

Research ticket: **#6 — Re-validate composition and cross-wire rules against
current sources** (`tomaskir/ball-x-pit-companion`). Merged branch
`research/composition-rules`. Research date **2026-11-11**.

This is a source-only re-validation. No playtest was run for this ticket; every
claim below is either (a) an in-game tooltip / game-file observation already in
the corpus, (b) a current-wiki mechanism claim, or (c) a community report,
labelled as such. The existing fact base is
[`fusion-mechanics.md`](./fusion-mechanics.md); the evidence corpus is
[`fusion-observations/`](./fusion-observations/). This file does **not** edit
either — it records what still holds, what has changed, and what the current
model should say.

> **Status — landed (2026-11-11).** This is a dated research snapshot. The
> recommendations in §4 were applied: `freeze-ray` was removed from
> `SPAWN_BOUND_IDS`, the spawn exclusion was split into
> `SPAWN_NO_INHERITANCE_IDS` / `SPAWN_STATUS_ONLY_IDS` with trigger and
> degradation caveats, the Satan rationale was reframed to the trigger model,
> and Assassin/Warp notes were added. Where this file says "the current model"
> or "the current code", read `docs/research/fusion-mechanics.md` and
> `src/fusion.ts`; inline corrections are marked **Update (2026-11-11)**.

## Version tags used below

| Tag | Meaning |
| --- | --- |
| **v1.301** | Naturalist build / fact-base snapshot (wiki fetched 2026-09-13). |
| **v1.5** | The wiki's update numbering for the Naturalist update (2026-08-06); the live build at research date is still 1.301. |
| **Nov 2026** | Community reports dated 2026-11-06..09, on v1.5, **before** the paid DLC. |
| **DLC** | *Risen Ballbylon*, release date 2026-11-12 — **not released at research date**, so no DLC-era composition evidence exists yet. |
| **unknown** | Corpus rows whose source did not pin a build. |

## Sources checked for this re-validation

- **Current wiki, Fusion Mechanics** — revision 4217, 2026-09-19
  (<https://ballxpit.wiki.gg/wiki/Fusion_Mechanics>). The trigger matrix and
  the "status effects cannot trigger other abilities" rule live here.
- **Current wiki, Balls** — revision 4002, 2026-09-10
  (<https://ballxpit.wiki.gg/wiki/Balls>). Per-ball On-Hit / Status-Trigger
  taxonomy, including Freeze Ray, Blizzard, Glacier, Satan, Reaper, Black Hole.
- **Current wiki, Game Updates** — revision 4223
  (<https://ballxpit.wiki.gg/wiki/Game_Updates>). Confirms v1.5 Naturalist
  (2026-08-06) is the last free update; *Risen Ballbylon* is 2026-11-12.
- **Reddit r/BALLxPIT 1xrhisk**, "Fusion Order did not matter a year ago, it
  certainly DOES matter now", u/Expensive_Sail_5138, **2026-11-09**
  (<https://www.reddit.com/r/BALLxPIT/comments/1xrhisk/fusion_order_did_not_matter_a_year_ago_it/>).
  The source of the **Freeze Ray × Flash correction**.
- **Reddit r/BALLxPIT 1xpkoe0**, "Fusion Order Matters", u/mattkk177,
  **2026-11-06**
  (<https://www.reddit.com/r/BALLxPIT/comments/1xpkoe0/fusion_order_matters/>).
  The claim the 1xrhisk post tested and partly disproved.
- **GameFAQs, DCRage, Special Ball and Evolution Guide v4.0**, updated
  2026-08-14 (<https://gamefaqs.gamespot.com/ps5/715485-ball-x-pit-risen-ballbylon/faqs/82305>).
  Current v1.5 effect text; explicitly says fusions are not listed and
  "combines the powers of both balls".
- **Existing corpus** (`fusion-observations/*.jsonl`, access 2026-10-04) and
  `CONTRADICTIONS.md` — the prior evidence base, re-read for the ticket's
  specific claims.
- **No newer game-file dump than build 1.301 was found.** The game-file
  findings (no fusion table, runtime-composed tooltip, `NumCombos` save
  matrix) remain the latest public evidence; the DLC may add balls but no
  evidence of a fusion table was found.

---

## 1. Headline findings

### 1.1 The Freeze Ray × Flash correction (the ticket's named change)

The model at research time (`fusion-mechanics.md` §2c; `src/fusion.ts`
`SPAWN_BOUND_IDS`) said:

> "Blizzard's freeze is positional (spawned icicles), Freeze Ray's freeze is
> bound to the beam path — neither rides a partner's hits."

**Update (2026-11-11):** the model was corrected as recommended.
`fusion-mechanics.md` §2c now says Freeze Ray's freeze is on-hit/AOE and
spreads through Flash, and `src/fusion.ts`'s `SPAWN_BOUND_IDS` is
`{blizzard}` only.

**That is now contradicted by a newer, more careful community test.** The
2026-11-09 post (v1.5, Nov 2026) tested the pair after an earlier 2026-11-06
post claimed the two orders behaved differently. The correction, verbatim:

> "the freeze effect seems to actually be dependent on the freeze type ball
> used rather than the fusion order. **Freeze, Freeze Ray and Wraith all work
> with Flash to spread freeze, Glacier and Blizzard do not**, this is the case
> regardless of fusion order."

The proof offered is a stacked-enemy observation:

> "a stacked enemy (just to be clear, I mean the enemies ON TOP of other
> enemies) becoming frozen by Flash x Freeze Ray, something that is straight
> up impossible for the Freeze Ray to do on its own."

The 2026-11-06 claim it disproves was:

> "Flash x Freeze Ray is different than Freeze Ray x Flash. Flash x Freeze Ray
> applies the flash effect to the beam, which sucks. Freeze Ray x Flash applies
> the freeze affect to the screen flash aoe, which is great."

The correction says the description changes but the behaviour does not; the
freeze source (Freeze / Freeze Ray / Wraith vs Glacier / Blizzard) is what
matters, not the order.

**Current-wiki corroboration.** The Balls page (rev 4002, 2026-09-10)
classifies Freeze Ray's freeze trigger as **On-Hit + AOE**, not Spawn. That is
consistent with the correction. The same table also classifies Blizzard as
On-Hit + AOE, which the tested behaviour contradicts — a reminder that the
wiki taxonomy is a guide, not a contract; **behaviour wins over the
taxonomy/tooltip** (the same principle already in §1.1 of the fact base).

**Consequence for the model:** `freeze-ray` should come out of
`SPAWN_BOUND_IDS`. With the current tags (`flash`: aoe + screen-clear;
`freeze-ray`: aoe + status-effect), removing it makes `statusChannel(freeze-ray)`
return `'hit'`, so the AOE-carrier + on-hit-status branch fires for
Flash × Freeze Ray. Blizzard and Glacier stay spawn-bound and correctly do not
fire.

**Caveat:** the correction tested **Flash**, not **Sun**. Removing
`freeze-ray` from `SPAWN_BOUND_IDS` would also make the model assert
Freeze Ray × Sun cross-wires, which the corpus marked **contradicted** at the
time (`freeze-ray+sun`, 2 observations). That pair needs either a separate
exception or an explicit "disputed" note; the correction does not settle it.

**Update (2026-11-11):** the pair was resolved as a direction note, not a
cross-wire: the beam applies Sun's burn, not the reverse. `freeze-ray+sun` is
now `verified` in the curated layer, and `fuse()` emits the direction caveat.

### 1.2 Brood Mother's blanket exclusion is too strong

The fact base says "Brood Mother's spawn channel does not carry the partner's
property at all" (§2d), and `src/fusion.ts` puts `brood-mother` in
`SPAWN_EXCLUDED_IDS`. The corpus does **not** support "at all":

- **Positive (v1.301 / unknown):**
  - gonugame.com (2026-01-25): fusing an evolution ball with Brood Mother makes
    the baby balls born on enemy-hit "also carry a portion of the evolution
    ball's effect" — "extremely strong."
  - Bilibili (2025-10-12): the produced balls "in most cases also inherit the
    other ball's property."
  - GameRant commenter (2025-11-30): "Any multiball effect (brood mother, egg
    sac, cell, and their evolutions) … the baby balls inherit from the other
    ball properties."
- **Negative (v1.301 / unknown):**
  - Steam, Noobc0re (2025-10-21): Brood Mother × Flash "produces no extra balls,
    and sure as hell no balls with the properties of flash"; the poster also
    suspects "Brood Mother as a whole is buggered."
- **Mechanism-backed middle ground:**
  - namu.wiki (2026-08-26): Brood Mother's babies are a "downgraded
    special-baby-ball creation" — i.e. the property is carried, but degraded
    and probabilistic.

**Best reading:** Brood Mother is a **degraded/probabilistic** spawn carrier,
not a clean exclusion. The blanket "does not carry at all" should be softened
to "carries unreliably / at reduced strength," and the model should not claim
a definite no-cross-wire. Confidence: **Reported, mixed** (v1.301–v1.5).

**Update (2026-11-11):** landed. `SPAWN_STATUS_ONLY_IDS` models Brood Mother
as a status-only carrier with degradation and trigger caveats, and
`fusion-mechanics.md` §2d no longer claims a blanket exclusion.

### 1.3 Mosquito King: the exclusion conflates two different channels

The fact-base sentence is accurate: "Mosquito King's spawn-on-hit does not fire
from the partner's screen hits." The **code's** `SPAWN_EXCLUDED_IDS` comment
generalises that to "spawned balls do NOT inherit the partner's property,"
which the corpus does not support:

- **Negative (trigger channel):** Steam, PHAELANX (2025-12-30): Mosquito King's
  spawn-on-hit does **not** fire from Flash's screen-wide hits. This is about
  the *spawn trigger*, not inheritance.
- **Positive (inheritance):** GameRant (2025-10-26): Mosquito King × Virus —
  the mosquito swarm "carries Virus's disease spread"; Virus becomes "deadly
  when fused with … any of the mosquito-based balls."

**Best reading:** split the two claims. Mosquito King's **spawn trigger** does
not ride a partner's screen hits; its **spawned mosquitoes** can carry a
partner's status (Virus). A blanket `spawnable()` exclusion hides the positive
case. Confidence: **Reported** (v1.301).

**Update (2026-11-11):** landed. `SPAWN_NO_INHERITANCE_IDS` (Voluptuous Egg
Sac only) and `SPAWN_STATUS_ONLY_IDS` (Brood Mother, Mosquito King) split the
two meanings; the trigger caveat is emitted for screen-clear partners.

### 1.4 The trigger-channel model is now more formal on the wiki

The current Fusion Mechanics page (rev 4217, 2026-09-19) states the trigger
matrix:

| Trigger type | On-Hit | On-Damage | On-Timer |
| --- | --- | --- | --- |
| Spawn | YES | YES | NO |
| AOE | NO | YES | NO |
| Status Effect | NO | NO | NO |

And the Balls page (rev 4002, 2026-09-10) gives the per-ball taxonomy:

- **On-Hit Effects** — Destroy, Pass Through, AOE, Spawn — trigger **On-Hit
  only**.
- **Status Effects** — Poison, Burn, Freeze, etc. — can be triggered by
  **On-Hit, On-Damage, On-Timer, On-Shoot, Spawn**.
- "AOE: when balls deal damage." "Spawned balls don't count as 'shoot'."
- "Status Effects include Instant Death (from black hole), Poison, Burn,
  Freeze etc."

The two pages are not perfectly consistent about whether AOE is an "On-Hit
Effect" or an "On-Damage" trigger. The operational reading that fits the
observed behaviour: **AOE applies statuses on the damage event, not the hit
event**; a status effect itself cannot trigger another ability. This is a
cleaner mechanism for the Satan/Reaper/Black Hole cases than the current
`AOE_EXCLUDED_IDS` special case:

- Satan's burn/berserk are **status effects** (On-Hit/On-Timer), and status
  effects cannot trigger other abilities. So Satan cannot fire Hemorrhage's
  %HP proc or Reaper's on-impact kill.
- Black Hole's **instant death is classified as a status effect** on the Balls
  page, so Satan's AOE (a status trigger) *can* apply it. That is why
  Black Hole × Satan works while Reaper × Satan does not.
- Reaper's kill is an **On-Hit** effect, so it needs a hit; Flash/Flicker
  hits and baby balls can supply one, Satan's debuff-only AOE cannot.

This reframing keeps the current behaviour but replaces the ad hoc
"Satan is excluded except for Black Hole" rule with the wiki's trigger model.
Confidence: **Reported / mechanism-backed** (v1.301–v1.5).

### 1.5 Nothing newer contradicts the remaining fixed-trait rules

The other ticket items — hit-once + cooldown dominance, Assassin back-pierce,
Warp-before-pierce, Destroy × Destroy, spawn compensates Destroy, Dark's
multiplier, the 9999 display cap — still stand at their prior confidence. The
only new item in the Nov 2026 post is an **order-dependent Erosion** finding
(Stone/Drill/Assassin/Steel as the first pick overwrite Erosion's %-HP bonus),
which is outside the non-order composition model but worth recording as a
related priority interaction. See §3.4.

---

## 2. Updated rule table (confidence / version)

Confidence scale: **Observed** = site-author playtest or controlled community
test with reproduction; **Reported** = multiple independent reports or a
mechanism-backed wiki/game-file claim; **Single-source** = one unreproduced
report; **Disputed** = sources disagree and both sides are retained.

| # | Rule | Evidence (version, date) | Confidence | Status vs current model |
| --- | --- | --- | --- | --- |
| 1 | **AOE + AOE / different AOE** → both AOE patterns coexist; one AOE does not trigger the other. | Steam (2025-11-10, unknown): "it simply does both AOE attacks wherever a ball hits"; Lightning × Laser does not create a laser per lightning hit. namu rule 1 (2026-08-26, v1.5). | Reported | Holds; text concatenation already shows both. |
| 2 | **AOE + status** → enemies damaged by the AOE also suffer the status. | Wiki Fusion Mechanics matrix (2026-09-19, v1.301/v1.5): AOE On-Damage YES. Wiki Balls: "AOE: when balls deal damage." namu rule 2 (2026-08-26). Corpus: Overgrowth × Flash, Flash × Hemorrhage, etc. | Reported / mechanism-backed | Holds; `crossWire` AOE+status branch. |
| 3 | **AOE + spawn** → created balls inherit the AOE/range. | namu rule 3 (2026-08-26, v1.5). Corpus: Maggot × Laser, Holy Laser × Maggot, Glacier × Maggot. | Reported | Partially modelled (spawn+status line); range inheritance not separately emitted. |
| 4 | **Different statuses** → both apply simultaneously. | namu rule 4 (2026-08-26, v1.5); corpus (Bleed + Poison, Burn + Poison, etc.). | Reported | Holds; effect paragraphs concatenate. |
| 5 | **Same status, different numbers** → blended. | namu rule 5 (2026-08-26, v1.5): Leech + Sacrifice keeps both channels, max 20. | Reported | Refined: channels union, shared scalar key takes the first pick; no general blend formula. |
| 6 | **Status + spawn** → created balls also carry the status. | namu rule 6 (2026-08-26, v1.5); fused tooltips (Overgrowth × Maggot); corpus. | Reported / tooltip-backed | Holds; spawn+status branch. Spawn-bound *traits* (pass-through, positional freeze) do not carry. |
| 7 | **Spawn + spawn** → both effects, amounts adjusted. | namu rule 7 (2026-08-26, v1.5); corpus Brood Mother + Egg Sac, Cell + Egg Sac. | Reported | Holds; text concatenation. |
| 8 | **Status-vs-spawn cross-wire** — a partner's on-hit status rides the fused ball's hits; spawn-bound statuses do not. | Reddit icemage_999 (2026-07-02, v1.5); site-author playtests (2026-10-01): Overgrowth × Flash wires, Flicker × Radiation Beam wires, Flash × Glacier does not. | **Observed** (site-author playtest) | Holds for the three tested cases. |
| 9 | **Freeze Ray's freeze is on-hit/AOE and DOES spread with Flash**; Glacier and Blizzard do not. | Reddit 1xrhisk (2026-11-09, v1.5, Nov 2026) — tested, stacked-enemy proof; wiki Balls taxonomy Freeze Ray = On-Hit + AOE (2026-09-10). | Reported (one careful community test + wiki taxonomy) | **CHANGE:** remove `freeze-ray` from `SPAWN_BOUND_IDS`. Blizzard/Glacier stay spawn-bound. |
| 10 | **Satan's AOE is debuff-only** — cannot fire Hemorrhage's %HP or Reaper's on-impact kill; can apply Black Hole's instant kill. | Bilibili (2026-08-07, v1.5) mechanism; corpus 1stoyll (2026-04-23..27); wiki Balls taxonomy; wiki Fusion Mechanics "Status Effect cannot trigger other abilities" (2026-09-19); corpus Black Hole × Satan (3 claims). | Reported / mechanism-backed | Behaviour holds; rationale should be reframed to the trigger model. |
| 11 | **Reaper's kill** fires from Flash/Flicker hits and baby balls, not Satan's AOE. | Corpus Fishnabuboo (2026-06-22, unknown); Reddit (2026-05-05/08, v1.5) Reaper × Flash/Flicker/Sun; CONTRADICTIONS §10e (Flicker × Reaper disputed). | Reported; Flicker × Reaper **Disputed** | Holds. |
| 12 | **VES two-hop drop** — VES → Egg Sacs → baby balls loses the partner property at the second hop. | Steam ZedsDeadBaby (2025-10-25, unknown); Assassin × VES (two reporters, 2025-10-25); Hemorrhage × VES (Doryan, 2026-02-15); Nuclear Bomb × VES split. | Reported (multiple independent) | Holds; keep `voluptuous-egg-sac` excluded. |
| 13 | **Brood Mother spawn channel** — degraded/probabilistic, not a clean no-carry. | Positive: gonugame (2026-01-25), Bilibili (2025-10-12), GameRant commenter (2025-11-30). Negative: Steam Noobc0re (2025-10-21). Middle: namu (2026-08-26) "downgraded special-baby-ball creation." | **Reported, mixed** | **FLAG:** "does not carry at all" is too strong; model as degraded/unreliable. |
| 14 | **Mosquito King spawn-on-hit** does not fire from a partner's screen hits, but its mosquitoes can carry a partner status (Virus). | Negative: Steam PHAELANX (2025-12-30). Positive: GameRant (2025-10-26) Mosquito King × Virus. | Reported | **FLAG:** blanket `SPAWN_EXCLUDED_IDS` conflates trigger with inheritance. |
| 15 | **Hit-once + cooldown is dominant over pass-through.** | Steam CPT Chthonbeard (2025-10-25, unknown); Sacrifice × Ghost tooltip mismatch (CONTRADICTIONS §7). | Reported | Holds. |
| 16 | **Assassin's "cannot pierce the back" wins over a partner's pierce.** | namu (2026-08-26, v1.5). | Reported | Holds; `fuse()` now emits the Assassin note (2026-11-11). |
| 17 | **Warp is cast before a partner's pierce.** | namu (2026-08-26, v1.5). | Reported | Holds; `fuse()` now emits the Warp note (2026-11-11). |
| 18 | **Destroy × Destroy** may lose one of the two effects. | Wiki Balls (2026-09-10, v1.5); ballbylon `engine.js` (2026-09-26). | Reported | Holds. |
| 19 | **Spawn compensates Destroy** — Cell × Bomb is an "indestructible bomb"; Cell × Nuke/Black Hole clones survive the first destruction. | Wiki Balls (2026-09-10); al-gest (2025-10-27); Reddit 1qpdiou (2026-01-28). | Reported (multiple) | Holds. |
| 20 | **Dark's damage multiplier carries** (3–5×; 5× at level 3). | namu (2026-08-26, v1.5); Bilibili (2026-08-07, v1.5); Reddit (2025-10-20/21). | Reported | Holds. |
| 21 | **9999 is a display cap, not a real per-hit cap.** | Steam Xersin (2025-10-28, unknown): pre-cap range 14616–25580, displayed 9999; Steam Grampire (2025-10-20); TVTropes (2026-09-21) dissents (real cap). | Reported; display-cap reading better evidenced | Holds; do not treat on-screen 9999 as an upper bound. |

---

## 3. Detailed findings by ticket bullet

### 3.1 The seven composition rules

The namu seven rules (2026-08-26, v1.5) are still the best structured statement,
and the current wiki's trigger matrix is a formalisation of the same model:

1. **AOE + AOE** → both ranges/patterns. The corpus adds a negative refinement:
   one AOE does **not** trigger the other (Lightning × Laser does not spawn a
   laser per lightning hit). The fused ball has both patterns, independently.
2. **AOE + status** → the status applies to everything the AOE damages. This
   is the load-bearing cross-wire rule; the wiki calls the AOE a status trigger
   "when balls deal damage."
3. **AOE + ball creation** → created balls have the same range. Supported by
   the Maggot/Laser and Holy Laser/Maggot reports. The current model emits the
   spawn+status line but does not separately model range inheritance.
4. **Different statuses** → both apply. No new contradiction.
5. **Same status, different numbers** → blended (Leech + Sacrifice, max 20).
   The model handles observed cases through effect text + the property
   resolver, not a general formula.
6. **Status + ball creation** → created balls carry the status. Tooltip-backed
   (Overgrowth × Maggot) and corpus-backed. The important boundary: spawned
   entities inherit **statuses**, not **spawn-bound traits** (pass-through,
   positional freeze).
7. **Spawn + spawn** → both effects, amounts adjusted. Brood Mother + Egg Sac /
   Cell + Egg Sac family.

**Confidence:** Reported; no rule in this set is contradicted by the newer
sources. The DLC (2026-11-12) may add new balls that exercise these rules; no
DLC-era evidence exists yet.

### 3.2 Status-vs-spawn and trigger-channel limits

The current model's three-way split (`hit` / `spawn` / `field`) is directionally
right but coarser than the current wiki's five triggers (On-Hit, AOE/On-Damage,
On-Timer, On-Shoot, Spawn). The practical consequences:

- **Satan** — its burn/berserk are status effects applied on a timer; status
  effects cannot trigger other abilities. It therefore cannot fire
  Hemorrhage's %HP proc or Reaper's on-impact kill. It *can* apply Black Hole's
  instant kill because the wiki classifies instant death as a status effect
  (and Black Hole's kill is a status/on-hit effect that the AOE can apply).
  The current special case is behaviourally correct; the rationale should be
  the trigger model, not "Satan is an AOE exclusion."
- **Reaper** — its kill is an On-Hit effect. Flash/Flicker hits and baby balls
  supply hits; Satan's debuff-only AOE does not. The corpus's Flicker × Reaper
  polarity dispute (CONTRADICTIONS §10e) remains open.
- **Freeze Ray** — the current "beam path, positional" reading is contradicted
  by the Nov 2026 test. Freeze Ray's freeze is On-Hit/AOE and spreads with
  Flash. **This is the ticket's named correction.**
- **Blizzard / Glacier** — spawn-bound freeze; do not spread with Flash. The
  Nov 2026 test confirms both, and the wiki's Blizzard taxonomy (On-Hit + AOE)
  is the outlier; behaviour wins.
- **Wraith** — the Nov 2026 test adds it to the "works with Flash" set
  (Freeze, Freeze Ray, Wraith). Wraith's freeze is pass-through/on-hit, so this
  is consistent with the status-vs-spawn rule. The current model's
  `statusChannel` for Wraith: its effect text "Freezes any enemy it passes
  through" does not match the spawn regex, so it is `'hit'` — good.
- **Erosion** — the Nov 2026 post explicitly says Flash/Flicker do not work
  with Erosion because Erosion is an on-hit effect, not a status effect. This
  is a useful confirmation that the cross-wire is status-only.

### 3.3 Spawn-channel exceptions

- **Voluptuous Egg Sac (two-hop drop)** — strongest exception. VES spawns Egg
  Sacs, which themselves spawn baby balls; a partner property is lost at the
  second hop. Evidence: Assassin × VES (two independent reporters, 2025-10-25),
  Hemorrhage × VES (2026-02-15), Nuclear Bomb × VES split. Keep excluded.
- **Brood Mother** — mixed/degraded, not a clean exclusion. See §1.2.
- **Mosquito King** — the negative is about the spawn **trigger** not firing
  from a partner's screen hits; the positive is that its mosquitoes carry a
  partner **status** (Virus). See §1.3.

### 3.4 Fixed trait priorities

- **Hit-once + cooldown dominates pass-through** — reported (Steam CPT
  Chthonbeard, 2025-10-25). The cooldown class is the seven balls whose effect
  text lists a cooldown: Black Hole, Bomb, Dark, Egg Sac, Voluptuous Egg Sac,
  Nuclear Bomb, Timestop. Note the separate `time` ball is **not** in the
  cooldown class.
- **Assassin's back-pierce priority** — reported (namu, 2026-08-26): "cannot
  pierce the back" wins over a partner's "pierces enemies." The code at the
  time emitted no note for this; it only used `PIERCE_IDS` for the
  hit-once/cooldown note. **Update (2026-11-11):** `fuse()` now emits the
  Assassin note.
- **Warp before pierce** — reported (namu, 2026-08-26): Warp is cast first and
  can waste a partner's pierce. Not emitted at the time. **Update
  (2026-11-11):** `fuse()` now emits the Warp note.
- **Destroy × Destroy** — reported (wiki Balls, 2026-09-10; ballbylon,
  2026-09-26): two self-destruct balls may lose one effect.
- **Spawn compensates Destroy** — reported (wiki Balls, 2026-09-10; al-gest,
  2025-10-27; Reddit 1qpdiou, 2026-01-28): Cell × Bomb is the canonical
  "indestructible bomb"; Cell × Nuke/Black Hole clones survive the first
  destruction.
- **Dark's multiplier** — reported (namu, 2026-08-26; Bilibili, 2026-08-07):
  Dark raises the partner's damage 3–5× (5× at level 3). The current note is
  correct.
- **9999 display cap** — reported/observed (Xersin, 2025-10-28; Grampire,
  2025-10-20). The pre-cap damage range 14616–25580 with 9999 pop-ups is the
  decisive observation. TVTropes' "real cap" claim is the weaker side.
- **New related finding (order-dependent, not commutative): Erosion.** The
  Nov 2026 post reports that if Stone, Drill, Assassin or Steel is the first
  pick, Erosion's %-HP bonus is replaced by that ball's bonus (400% Stone /
  100% Drill / 50% Assassin / 15% Steel); if Erosion is first, it keeps its 5%
  and the partner's bonus becomes 5%. This is a same-property priority
  interaction, not a non-order composition rule; record it for the order
  research, do not fold it into the commutative model.

### 3.5 Claims contradicted by newer evidence

**Update (2026-11-11):** the first three rows landed (§1.1–§1.3). The 9999
row was reopened by the resolution pass — the display-vs-real dispute is still
live (`CONTRADICTIONS.md` §13). Flicker × Reaper was resolved to cross-wire by
the same pass (2026-08-07 re-test).

| Claim | Newer evidence | Status |
| --- | --- | --- |
| Freeze Ray's freeze is positional/beam-bound and does not ride a partner's hits (`fusion-mechanics.md` §2c; `SPAWN_BOUND_IDS`). | Reddit 1xrhisk, 2026-11-09 (v1.5): Freeze Ray × Flash spreads freeze; stacked-enemy proof. Wiki Balls taxonomy: Freeze Ray = On-Hit + AOE. | **Contradicted — change the model.** |
| Brood Mother's spawn channel "does not carry the partner's property at all" (`fusion-mechanics.md` §2d; `SPAWN_EXCLUDED_IDS`). | Positive JP/CN/GameRant reports; namu's "degraded special-baby-ball creation." | **Too strong — soften to degraded/unreliable.** |
| Mosquito King is a blanket spawn exclusion (`SPAWN_EXCLUDED_IDS` comment). | Negative is trigger-specific (Flash screen hits); positive is inheritance (Virus). | **Conflated — split the claims.** |
| 9999 is a real per-hit cap (TVTropes, 2026-09-21). | Xersin's pre-cap range 14616–25580 with 9999 displays; Grampire. | **Display-cap reading wins; keep both records.** |
| Flicker × Reaper kill polarity. | Three positive vs one negative; no new test. | **Still disputed.** |
| Satan × Hemorrhage %HP cross-wire. | Bilibili mechanism + negative test vs 14k-DPS sentiment. | **Still disputed; negative reading better evidenced.** |
| Nuclear Bomb × VES babies carry the nuke. | Tooltip/positive vs negative reports. | **Still disputed.** |
| Black Hole × Maggot babies carry instant kill. | Positive chain-reaction reports vs spawn-bound negative. | **Still disputed; trigger model predicts no.** |

---

## 4. Implications for `src/fusion.ts` (research only — no code change in this ticket)

**Update (2026-11-11):** recommendations 1–5 landed in `src/fusion.ts`; the
bullets below are the research record.

1. **Remove `freeze-ray` from `SPAWN_BOUND_IDS`.** Update the comment to cite
   the Nov 2026 correction. With the current tags this makes the AOE+status
   branch fire for Flash × Freeze Ray. Keep `blizzard`; Glacier is caught by
   the `spikes` regex.
2. **Decide the Freeze Ray × Sun consequence.** The same change makes the model
   assert Sun × Freeze Ray cross-wires, which the corpus still marks
   contradicted. Either add a Sun-specific exception/note or leave the pair
   disputed; the Nov 2026 test did not cover Sun.
3. **Reconsider `SPAWN_EXCLUDED_IDS`.** Split "spawn trigger does not fire from
   a partner's screen hits" (Mosquito King × Flash) from "spawned units do not
   inherit the partner's property" (VES two-hop). Brood Mother should be
   modelled as degraded/unreliable, not a hard no.
4. **Reframe the Satan rationale.** Keep the behaviour (Satan cannot carry
   Hemorrhage/Reaper; can carry Black Hole's instant kill) but explain it via
   the wiki trigger model: status effects cannot trigger other abilities;
   instant death is classified as a status effect; Reaper's kill is On-Hit.
5. **Consider notes for Assassin back-pierce and Warp-before-pierce.** They are
   reported fixed priorities but currently unmodelled; if added, they are
   notes, not cross-wire lines.
6. **Do not touch the other rules.** The seven composition rules, the
   status-vs-spawn split for the tested cases, VES two-hop, hit-once/cooldown,
   Destroy × Destroy, spawn-compensates-Destroy, Dark's multiplier, and the
   9999 display cap all still hold at their prior confidence.
7. **Test gates.** Any change must keep `src/corpus.test.ts`,
   `src/corpus-schema.test.ts`, and the level-3 overlay gate green.
   A disagreement between the composer and the corpus is a content decision,
   not a test to relax.

## 5. Open questions / what would upgrade confidence

1. **One current-build (v1.5+) playtest of Freeze Ray × Flash in both orders**
   on a stacked enemy. The Nov 2026 post is the best current evidence but is a
   single community test, not a multi-trial controlled test.
2. **Freeze Ray × Sun** — does the correction generalise from Flash to Sun?
   The corpus still holds both polarities; the Nov 2026 test did not cover it.
3. **Brood Mother inheritance** — one controlled test with a status partner
   (e.g. Brood Mother × Hemorrhage) to distinguish "degraded but present" from
   "absent."
4. **Mosquito King × Virus vs Mosquito King × Flash** — separate the spawn
   trigger from the inheritance channel.
5. **DLC-era re-run** — *Risen Ballbylon* releases 2026-11-12 with 24 new balls;
   re-check the rules once DLC observations exist. No DLC-era evidence exists
   at research date.
6. **Completed save's `NumCombos` matrix** — still unverified whether the game
   records directed fusion pairs (order map).
7. **A current-version game-file dump** — no dump newer than build 1.301 was
   found; if one appears, re-check the "no fusion table / runtime-composed
   tooltip" finding and the trigger taxonomy against the actual data.

---

## 6. Source list

| Source | Date | Version | Used for |
| --- | --- | --- | --- |
| <https://ballxpit.wiki.gg/wiki/Fusion_Mechanics> (rev 4217) | 2026-09-19 | v1.301 / v1.5 | Trigger matrix; status effects cannot trigger abilities; order statement. |
| <https://ballxpit.wiki.gg/wiki/Balls> (rev 4002) | 2026-09-10 | v1.301 / v1.5 | Per-ball On-Hit / Status-Trigger taxonomy; Destroy caveat; spawn-compensates-Destroy; effect text. |
| <https://ballxpit.wiki.gg/wiki/Game_Updates> (rev 4223) | current | v1.5 | Naturalist = last free update; Risen Ballbylon = 2026-11-12. |
| <https://www.reddit.com/r/BALLxPIT/comments/1xrhisk/fusion_order_did_not_matter_a_year_ago_it/> | 2026-11-09 | v1.5 (Nov 2026) | **Freeze Ray × Flash correction**; Freeze/Wraith vs Glacier/Blizzard; Erosion; order findings. |
| <https://www.reddit.com/r/BALLxPIT/comments/1xpkoe0/fusion_order_matters/> | 2026-11-06 | v1.5 (Nov 2026) | The claim the correction tested (Flash × Freeze Ray order). |
| <https://gamefaqs.gamespot.com/ps5/715485-ball-x-pit-risen-ballbylon/faqs/82305> | 2026-08-14 | v1.5 | Current effect text; fusions not listed; result level 1 claim (contradicted by in-game fused tooltips showing Level 3 — `fusion-mechanics.md` §1). |
| <https://namu.moe/w/BALL%20x%20PIT/%EB%B3%BC> | 2026-08-26 | v1.5 | Seven composition rules; Assassin back-pierce; Warp-before-pierce; Dark multiplier; Brood Mother degraded spawn. |
| <https://www.bilibili.com/opus/1124449565113581573> | 2026-08-07 | v1.5 | Satan debuff-only mechanism; Dark 5×. |
| <https://steamcommunity.com/app/2062430/discussions/0/595163560549992754/> | 2025-10-25 | unknown | Hit-once + cooldown dominance; Sacrifice × Ghost. |
| <https://steamcommunity.com/app/2062430/discussions/0/595163560549993977/> | 2025-10-25 | unknown | VES two-hop; Assassin × VES. |
| <https://steamcommunity.com/app/2062430/discussions/0/595163560549548636/> | 2025-10-21 | unknown | Brood Mother negative (Flash). |
| <https://steamcommunity.com/app/2062430/discussions/0/693123052112846362/> | 2025-12-30 | unknown | Mosquito King spawn-on-hit negative (Flash). |
| <https://steamcommunity.com/app/2062430/discussions/0/671725387533788367/> | 2025-10-28 | unknown | 9999 display cap (14616–25580 pre-cap). |
| <https://gamerant.com/ball-x-pit-evolutions-tier-list-best-balls> | 2025-10-26 / 2025-11-30 | unknown | Mosquito King × Virus positive; Brood Mother general inheritance. |
| <https://gonugame.com/ball-pit-build/> | 2026-01-25 | unknown | Brood Mother positive (JP). |
| <https://www.bilibili.com/opus/1082211929042190342> | 2025-10-12 | unknown | Brood Mother positive (CN). |
| <https://raw.githubusercontent.com/sakiooi1/ballbylon-helper/HEAD/engine.js> | 2026-09-26 | unknown | Destroy × Destroy warning. |
| <https://www.reddit.com/r/BALLxPIT/comments/1qpdiou/i_am_become_death_destroyer_of_ballxpit> | 2026-01-28 | v1.5 | Spawn compensates Destroy (Cell). |
| <https://www.reddit.com/r/BALLxPIT/comments/1ulsapv/flash_x_blizzard_fusion_question> | 2026-07-02 | v1.5 | Status-vs-spawn; Blizzard icicle explanation. |
| `docs/research/fusion-observations/CONTRADICTIONS.md` | 2026-10-04 | mixed | Existing contradiction register; Flicker × Reaper, Satan × Hemorrhage, Nuke × VES, Black Hole × Maggot, 9999. |

---

*Research-only artifact. It records the evidence and the recommended rule
table; it does not change `src/fusion.ts`, `docs/research/fusion-mechanics.md`,
or any generated data file.*
