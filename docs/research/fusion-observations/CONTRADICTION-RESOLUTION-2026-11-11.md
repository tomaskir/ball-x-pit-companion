# Contradicted / order-disputed corpus pairs — source-only resolution attempt

**Issue:** tomaskir/ball-x-pit-companion#19 (part of #1)
**Research date:** 2026-11-11
**Scope:** the 25 pairs with `status: "contradicted"` and the 26 pairs with
`order.matters_functionally: "disputed"` in
`docs/research/fusion-observations/fusion-pairs.json` — **42 unique pairs**.
**Method:** source-only re-check of current sources against each recorded
conflict. No playtest capability. Raw corpus (`*.jsonl`) untouched.
**Companion documents:** `CONTRADICTIONS.md` (the conflict register),
`../fusion-mechanics.md` (the distilled model), `README.md` (harvest contract).

> **Status — applied (2026-11-11).** This is the dated resolution record. The
> curated-layer changes it recommends were applied to `fusion-pairs.json`
> (commit `4eeceb7`); the pre-pass counts in this file (25 contradicted / 26
> order-disputed) are the starting state, not current counts. Current:
> 6 contradicted / 4 order-disputed. `CONTRADICTIONS.md` §13 is the applied
> record.

## Verdict legend

| Verdict | Meaning |
|---|---|
| **Resolved — tested** | A controlled both-orders test, or a direct current-version test of the pair, picks a side. |
| **Resolved — rule/model** | A current-version composition rule (same-property, both-cooldown, base-ball pool, trigger channel) picks a side; the pair itself was not individually tested. |
| **Resolved — reconciled** | The two claims describe different channels/conditions and are both true; the apparent contradiction dissolves. |
| **Still inconclusive** | No newer/stronger evidence picks a side. Keep both claims (the map's default). |
| **De-scoped** | The pair's `contradicted` marker came from a *global* dispute, not a pair-specific claim; the pair is cleared and the global dispute stays open. |

Sub-labels used in the table: `tested/rule` (a controlled test plus a
current-version rule both point the same way), `tested/recent` (a recent
direct re-test), `reconciled/mechanism` (the reconciliation is backed by the
current effect text). They are grouped under their parent verdict in the
summary counts.

**Confidence tags** follow the corpus schema: `observed` (the source ran a
controlled test / direct observation), `reported` (self-reported community
claim), `rule-derived` (our application of a documented rule, not a source
claim about this pair).

## Version tags used below

- **`v1.301`** — game v1.301, wiki.gg snapshot 2026-09-13/19, corpus access
  2026-10-04. This is the baseline the corpus was built on.
- **`v1.3xx+3FD`** — the v1.3xx build band after the three **free** updates:
  Regal (2026-01-26), Shadow (2026-04), Naturalist (2026-08-06; build v1.301).
  The 2026-11-09 Reddit synthesis and the 2026-08/09 reports are in this band.
- **`pre-RB`** — before *Risen Ballbylon*, the paid expansion. It is announced
  for **2026-11-12** (Nintendo Life / GoNintendo; one Gematsu announcement
  said Nov 6). As of this research date it is **not live**, so there are no
  post-Risen-Ballbylon observations. The "Nov 2026 free-update-era" reports
  below are about the three **free** updates, not the paid expansion.
- **`demo-era`** — 2025-06 demo / early access.
- **`unknown`** — community report without a version.

## Headline findings

1. **The order question has a new, stronger synthesis (2026-11-09).**
   `Expensive_Sail_5138`, "Fusion Order did not matter a year ago, it certainly
   DOES matter now" (Reddit `1xrhisk`, 2026-11-09, score 76, `v1.3xx+3FD`),
   re-tested the old PSA's own claims and lists the mechanisms where order
   *does* matter now: **base-ball banish**, **both-cooldown pairs**,
   **same-property dominance**, and **new DLC-ball interactions** (Time,
   Banshee, Banished Flame, Erosion, Brimstone). It explicitly says the old
   "order does NOT matter" PSA was correct *at the time* and became
   misleading only because the free updates added new balls. It also
   re-tested **Freeze Ray × Flash**: the description changes with order, the
   function does not; freeze spread depends on the **freeze-type ball**
   (Freeze / Freeze Ray / Wraith work with Flash; Glacier / Blizzard do not),
   not on fusion order. In-thread corroboration from `icemage_999` (the
   status-vs-spawn rule's author): "It definitely does and everything
   mentioned is correct as far as I know."
2. **The base-ball pool polarity is resolved.** The first-selected **base**
   ball is banished from the level-up/fusion pool; the second-selected base
   ball can reappear. New corroboration: the 2026-11-09 post (tested,
   `v1.3xx+3FD`), the 2026-05-30 "Free 5th Banish" PSA (Android current
   version, `v1.3xx+3FD`), and the 2026-02-26 Egg-Sac/Blizzard post. This
   confirms Abject_Nerve_1052 / Personal_Ad9690 and shows the harvest's
   "opposite polarity" annotation of SpaceCatNL was a misreading.
3. **The 9999-cap dispute is still live, and the corpus's "display cap" best
   reading is now contested by a newer mechanism-backed claim.** A 2026-09-08
   thread (`1wah802`, `v1.3xx+3FD`) has `tsuruki23` arguing 9999 is a **real
   per-hit cap** and using it to explain Hemorrhage's endless-mode falloff,
   while `TheBeyond` argues it is a display cap and `CommanderRedJonkks`
   (2026-09-13) says it *feels* like a real cap. This is newer than the
   corpus's decisive Xersin report (2025-10-28) and points the other way.
   **Do not mark the 9999 question resolved.**
4. **Satan × Hemorrhage resolves to "no %HP cross-wire."** The current wiki
   effect text is the missing mechanism: Satan is **debuff-only** (burn +
   berserk, no damage judgment), while Hemorrhage's 20%/30% current-health
   proc requires a **hit** on an enemy already at 12+ bleed stacks. Satan's
   per-second burn application is not a hit, so the proc cannot fire. This
   matches the Bilibili mechanism claim and the OP's careful negative test;
   the 14k-DPS positive is a build-dependent total (Satan's burn/berserk
   alone). The fused tooltip's "area of affect from Satan also applies
   hemorrhage" remains a tooltip-vs-behaviour mismatch.
5. **Flicker × Reaper resolves to cross-wire.** A 2026-08-07 direct re-test
   ("I just tested it tonight and Flicker Reaper does still work the same")
   plus 2026-05/08 reports and the wiki's Reaper text (15% on-impact kill,
   bosses included) outweigh the single "only direct hits" negative report.
   The wiki trigger matrix is consistent if Reaper's kill is treated as an
   on-damage/on-impact proc (AOE + On-Damage = YES), not an on-hit status.
6. **Most al-gest / mmemo "must fuse in this order" rows are presentation-only
   folklore.** They are cross-property pairs with no mechanism; the controlled
   both-orders tests, the current wiki, and the 2026-11-09 synthesis all put
   them outside the order-matters mechanism classes. They resolve to "order
   does not change the fusion's function" (name/sprite/description order
   only). The raw records stay; the curated layer can clear the disputes.

---

## Per-pair verdict table

Columns: **C** = in the 25 contradicted set; **O** = in the 26
order-disputed set. "Winning claim" is the side the evidence now favours.
Source dates are content dates; all were accessed 2026-11-11.

| # | Pair | C/O | Verdict | Winning claim | Source (version, confidence) |
|---|---|---|---|---|---|
| 1 | `black-hole+flash` | O | **Resolved — rule/model** | The pair's own fusion order does not change function (cross-property: BH instant-kill + Flash AOE). The Despair claim is about the order in which two *different* fusions (Flash-family vs Flicker-family) were made, not this pair's fusion order; it stays unverified as a separate multi-fusion interaction. | Wiki.gg Fusion Mechanics oldid 4217, 2026-09-19 (`v1.301`, `observed` for the general statement); PSA #1 2025-11-11 (`observed`); 2026-11-09 synthesis (`v1.3xx+3FD`, `reported`). |
| 2 | `black-hole+maggot` | C+O | **Still inconclusive** | Behaviour: 3 cross-wire reports (babies inherit BH screen-clear) vs 2 independent no-cross-wire reports (spawn-bound destroy-on-hit does not transfer). Order: the back-to-back-run difference (Maggot-first cleared, BH-first stopped) is a specific anecdote with a proposed self-destruct mechanism, not covered by a controlled test. No new pair-specific evidence. | Keep both; `CONTRADICTIONS.md` §10d. No current source resolves it. |
| 3 | `black-hole+nuclear-bomb` | C | **Resolved — rule/model** | Order **does** matter: both components are cooldown-class, so the **first-selected ball's cooldown wins**. Behaviour: Nuke's explosion applies BH's instant-kill; BH's kill is non-boss-only, so boss damage is weak — the "bosses die in a few seconds" claim is an outlier. | namu.wiki 2026-08-26 (`v1.301`, `reported`); 2026-11-09 synthesis, Timestop × Egg Sac worked example (`v1.3xx+3FD`, `reported`); wiki.gg Black Hole text (non-boss only). |
| 4 | `black-hole+satan` | C | **Resolved — reconciled** | The cross-wire is real and strong (Satan's AOE applies BH's instant-kill; "all mobs except bosses die as soon as they spawn"). The one "breaks spawns / freezes enemies / can't kill anything" report is a high-spawn performance/spawn-table bug, not a contradiction of the cross-wire. | Positive reports + Steam build guide 2026-08-11 (`v1.3xx+3FD`, `reported`) vs one negative bug report (2026-08-24); `CONTRADICTIONS.md` §10g. |
| 5 | `black-hole+sun` | C+O | **Resolved — tested** | Order does **not** change function (PSA #1's bonus both-orders test). Behaviour: Sun's screen-wide hits apply BH's instant-kill to **non-boss** enemies; bosses are not instant-killed; the fusion-offer bug is a general UI bug, not pair-specific. | PSA #1 2025-11-11 (`observed`); 2026-02-13 and 2026-01-25 reports (`v1.3xx+3FD`, `reported`); wiki.gg BH text; `CONTRADICTIONS.md` §9. |
| 6 | `blizzard+magma` | O | **Still inconclusive** | Demo-era specific numerical claim (Magma-first = blue, 4-tile freeze; Blizzard-first = red, 2-tile), re-affirmed 2025-10-22, vs PSA #1's general finding. No current-build both-orders test. The 2026-11-09 synthesis does not cover this pair. | Keep both; `CONTRADICTIONS.md` §10i. One current-build playtest would settle it. |
| 7 | `brood-mother+laser-vertical` | O | **Resolved — tested** | Order does **not** change baby-ball inheritance for this pair: Leorium's targeted re-test of Vertical Laser found 0 difference. The spawn-ball-first rule is refuted for this pair. (Brood Mother is a base ball, so first-selected Brood Mother is separately banished from the pool.) | Leorium targeted re-test, Reddit `1ouhlp1` thread (`observed`); 2026-11-09 base-ball rule (`v1.3xx+3FD`, `reported`). |
| 8 | `cell+nuclear-bomb` | O | **Resolved — rule/model** | The mmemo "Nuke × Cell" order claim is bare folklore; the pair is cross-property (Cell spawn + Nuke explosion), so order does not change the fusion's ability. Cell is a base ball, so **first-selected Cell is banished** from the pool (a separate, real order effect). | PSA #1 2025-11-11 (`observed`); 2026-11-09 synthesis (`v1.3xx+3FD`, `reported`); base-ball PSA 2026-05-30. |
| 9 | `earthquake+flash` | C+O | **Resolved — tested** | Order does **not** change function (targeted controlled test: both orders worked exactly the same). Behaviour: the two kits **coexist independently** — EQ stays 3×3, Flash stays board-wide; neither inherits the other's scope. The "both AOE wherever a ball hits" report is coexistence, not inheritance. | Leorium targeted re-test, Reddit `1ouhlp1` thread (`observed`); `CONTRADICTIONS.md` §10f. |
| 10 | `egg-sac+ghost` | C+O | **Resolved — tested/rule** | The **first-selected base ball is banished** from the level-up/fusion pool; the second-selected base ball can reappear. The "opposite polarity" was a harvest annotation error: all verbatim texts say the first-selected ball is consumed. | 2026-11-09 synthesis (`v1.3xx+3FD`, `observed` by author tests); 2026-05-30 PSA + icemage_999 "first ball in a Fusion is always effectively Banished" (`reported`); 2026-02-26 post; `CONTRADICTIONS.md` §2. |
| 11 | `egg-sac+hemorrhage` | O | **Resolved — tested/rule** | Same base-ball rule: Egg Sac first → Egg Sac banished; Egg Sac second → Egg Sac returns. The fusion's combat effect is commutative. | 2026-11-09 synthesis (`v1.3xx+3FD`, `observed`); 2026-05-30 PSA; 2026-02-26 post. |
| 12 | `egg-sac+holy-laser` | C | **Still inconclusive** | A single flagged observation (Egg Sac babies inherit Holy Laser's penetrating coverage). No pair-specific conflict and no current source adds evidence. | Keep as record; `CONTRADICTIONS.md` §11. |
| 13 | `egg-sac+maggot` | O | **Resolved — tested/rule** | Same base-ball rule: Egg Sac first → Egg Sac banished; Egg Sac second → Egg Sac returns. The fusion's combat effect is commutative. | 2026-11-09 synthesis (`v1.3xx+3FD`, `observed`); 2026-05-30 PSA; 2026-02-26 post. |
| 14 | `egg-sac+poison` | O | **Resolved — tested/rule** | Same base-ball rule: Egg Sac first → Egg Sac banished; Egg Sac second → Egg Sac returns. The tooltip's spawner/property-donor roles are stable regardless of order. | 2026-11-09 synthesis (`v1.3xx+3FD`, `observed`); 2026-05-30 PSA; 2026-02-26 post; wiki.gg tooltip transcriptions. |
| 15 | `flash+flicker` | O | **Resolved — rule/model** | Order changes the **description text** (which ball is the AOE carrier) but **not the function**. The 2026-11-09 re-test of the analogous Freeze Ray × Flash found exactly this pattern: description changes, enemies behave the same. | 2026-11-09 synthesis (`v1.3xx+3FD`, `observed`); wiki.gg Fusion Mechanics 2026-09-19 (`observed` general statement); PSA #1 2025-11-11. |
| 16 | `flash+hemorrhage` | C+O | **Resolved — tested** | Order does **not** change function (PSA #1 explicitly tested Hemo × Flash both orders). Cross-wire is well established (Flash's screen hits apply Hemorrhage bleed/%HP). The **9999-cap sub-dispute is not resolved** — see the global note; it is not pair-specific. | PSA #1 2025-11-11 (`observed`); wiki.gg Hemorrhage text; 2026-09-08/13 9999 thread (`v1.3xx+3FD`, `reported`, split). |
| 17 | `flash+overgrowth` | C+O | **Resolved — tested** | Order does **not** change function (PSA #1 explicitly tested Flash × Overgrowth both orders; Leorium refuted the "wrong order gives Overgrowth-blind in a 3×3" claim; al-gest's own commenter agrees). The al-gest/mmemo order mandate is presentation-only folklore. | PSA #1 2025-11-11 (`observed`); Leorium refutation (`observed`); al-gest commenter 2025-12-01 (`reported`); 2026-11-09 synthesis. |
| 18 | `flicker+hemorrhage` | O | **Resolved — tested** | Order does **not** change function (PSA #1 explicitly tested Hemo × Flicker both orders). The cross-wire (Flicker's ticks apply Hemorrhage bleed/%HP) is consistent with the status-vs-spawn rule. | PSA #1 2025-11-11 (`observed`); 2026-11-09 synthesis. |
| 19 | `flicker+overgrowth` | C+O | **Resolved — reconciled** | Overgrowth **stacks do cross-wire** (Flicker's screen ticks apply them). The "cannot apply dizzy" claim is a **different channel**: Flicker has no dizzy of its own, so the fused ball cannot gain one. Both are true. Order does not change function (cross-property). | Corpus + wiki.gg trigger matrix (`AOE + On-Damage = YES`); al-gest/kamigame (`reported`); PSA #1 general finding. |
| 20 | `flicker+reaper` | C | **Resolved — tested/recent** | **Cross-wire: Flicker's periodic screen damage fires Reaper's 15% instant-kill**, including on bosses. A 2026-08-07 direct re-test says "Flicker Reaper does still work the same"; 2026-05/08 reports agree. The single "only direct hits" negative is outweighed. | Reddit `1vi8se9` 2026-08-07 (`v1.3xx+3FD`, `observed`); Reddit `1vm0nxn` 2026-08-12; Reddit `1t6vmao` 2026-05-08 (`reported`); wiki.gg Reaper text (15% on-impact, bosses included). |
| 21 | `freeze-ray+sun` | C | **Resolved — reconciled** | The two records agree once the direction is read correctly: **the beam is the carrier** — Freeze Ray × Sun puts Sun's **burn** on the beam; Sun's AOE does **not** apply Freeze Ray's freeze. The 2026-11-09 freeze-type model (Freeze/Freeze Ray/Wraith spread freeze via Flash; Glacier/Blizzard do not) is consistent: Sun's burn application is a status, not a damage hit. | Corpus records + wiki.gg trigger matrix (`AOE + On-Hit = NO`, `AOE + On-Damage = YES`); 2026-11-09 synthesis (`v1.3xx+3FD`, `observed`). |
| 22 | `glacier+shotgun` | O | **Resolved — rule/model** | The al-gest "Glacier × Shotgun" order mandate is bare folklore; the pair is cross-property (Glacier freeze/spikes + Shotgun spawn), so order does not change the fusion's ability. The spawn-channel cross-wire (Shotgun's wall-bounce emits Glacier spikes) is a separate, reported behaviour. | PSA #1 2025-11-11 (`observed` general finding); 2026-11-09 synthesis mechanism list (this pair is outside it); al-gest reader 2025-10-27 (`reported`). |
| 23 | `hemorrhage+satan` | C | **Resolved — reconciled/mechanism** | **No %HP cross-wire.** Satan is debuff-only (burn + berserk, no damage judgment); Hemorrhage's 20%/30% current-health proc requires a **hit** on an enemy at 12+ bleed stacks, and Satan's per-second burn application is not a hit. The 14k-DPS positive is a build-dependent total, not a measurement of the %HP proc. The tooltip's "area of affect from Satan also applies hemorrhage" is a tooltip-vs-behaviour mismatch. | Wiki.gg Satan + Hemorrhage effect text (oldids 4138/4106, 2026-09, `observed` text); Bilibili mechanism 2026-08-07 (`reported`); OP careful negative 2026-04-23 (`reported`); Reddit `1t1qvfx` 2026-05-02 ("doesn't appear to be working"). |
| 24 | `hemorrhage+sun` | O | **Resolved — tested** | Order does **not** change function (PSA #1 explicitly tested Hemo × Sun both orders). The cross-wire (Sun's screen-wide hits apply Hemorrhage bleed) is consistent. | PSA #1 2025-11-11 (`observed`); 2026-11-09 synthesis. |
| 25 | `hemorrhage+voluptuous-egg-sac` | C | **Resolved — reconciled** | **Partial cross-wire:** Voluptuous Egg Sac babies **do apply bleed**, but they do **not** fire Hemorrhage's consume-and-%HP proc. The proc is bound to the main ball. Multiple repeatable tests; the one vague "babies carry Hemorrhage bleed for mass clear" claim is consistent with the bleed part. | Reddit `1ppi8nk` 2025-12-18 (`observed` repeatable test); Steam `595163560549993977` 2025-10-25 (two reporters); wiki.gg Hemorrhage text (hit + 12 stacks). |
| 26 | `holy-laser+maggot` | C+O | **Resolved — tested** | Order does **not** change function (the baby-ball both-orders test included this pair; the OP rebutted the order concern). The cross-wire is strong and bidirectional: Maggot babies fire Holy Laser beams, and the beams spread Infest. | Leorium baby-ball test, Reddit `1ouhlp1` thread (`observed`); corpus cross-wire reports; `CONTRADICTIONS.md` §1/§3. |
| 27 | `holy-laser+shotgun` | C | **Still inconclusive** | A single flagged observation (Shotgun × Holy Laser as a spawn-support example), with an acknowledged ambiguity against the Egg Sac × Holy Laser sentence. No pair-specific conflict and no current source adds evidence. | Keep as record; `CONTRADICTIONS.md` §11. |
| 28 | `iron+nuclear-bomb` | C | **De-scoped** | The pair's only pair-specific claim is Xersin's **pre-cap damage range 14616–25580 with displayed 9999**. The `contradicted` marker came from the **global** 9999-cap dispute, which is still live (2026-09-08/13 split). Clear the pair to `inferred`; keep the global note `contradicted`. | Xersin Steam 2025-10-28 (`reported`); 2026-09-08/13 9999 thread (`v1.3xx+3FD`, `reported`). |
| 29 | `landslide+maggot` | C | **Resolved — reconciled** | **Cross-wire confirmed:** Maggot babies **do trigger Landslide**. The OP's hypothesis that babies would not was refuted by two independent reports; namu also rates the pair well. | Abject_Nerve_1052, Reddit `1qxzefm/o41vmz3` 2026-02-07 (`reported`); willostyllos 2026-01-27; namu.wiki 2026-08-26. |
| 30 | `landslide+mosquito-swarm` | C | **Resolved — reconciled** | **Kill-gated, not a missing cross-wire.** Mosquito Swarm's proc fires only when the mosquito lands the killing blow; mosquitoes rarely do, so the cross-wire looks dead. The Maggot counter-examples show the Landslide × spawn channel works. | Reddit `1qxzefm` 2026-02-07 (counter-claim + mechanism, `reported`); wiki.gg Mosquito Swarm text ("If a mosquito kills an enemy…", `observed` text); `CONTRADICTIONS.md` §5. |
| 31 | `laser-vertical+maggot` | O | **Resolved — tested** | Order does **not** change function: Leorium's targeted re-test of Vertical Laser found 0 difference. The "laser+maggot differs from maggot+laser" impression is refuted. | Leorium targeted re-test, Reddit `1ouhlp1` thread (`observed`). |
| 32 | `maggot+nuclear-bomb` | C+O | **Partially resolved** | **Cross-wire resolved:** Maggot babies carry Nuclear Bomb's explosion (many reports). **Order still inconclusive:** two mechanism-backed anecdotes claim an explosion-count/order difference (Lexifer452; the 2025-11-01 "infest-first vs explode-first" post), and PSA #1 did not test this pair. | Cross-wire: corpus + 2025-11-01 post (`reported`). Order: keep both; `CONTRADICTIONS.md` §1. |
| 33 | `magma+shotgun` | O | **Resolved — rule/model** | The al-gest/mmemo "Magma × Shotgun" order mandate is bare folklore; the pair is cross-property (Magma burn/lava + Shotgun spawn), so order does not change the fusion's ability. | PSA #1 2025-11-11 (`observed` general finding); 2026-11-09 synthesis mechanism list (outside it); al-gest (`reported`). |
| 34 | `nosferatu+reaper` | C | **Still inconclusive** | A sentiment conflict ("infinite combo" vs "underwhelming"), not a mechanism dispute. The negative-damage-counter overflow is real but does not resolve the sentiment. No current source picks a side. | Keep both; `CONTRADICTIONS.md` §6. |
| 35 | `nosferatu+satan` | C | **Still inconclusive** | Build/patch-dependent: multiple 0-damage/run-break reports (Steam bug thread; 2026-02-20 Reddit "breaks everything"; 2026-01-25 "underwhelming") vs one 47M-damage-at-293 m report. The outcome appears build/patch-dependent; no controlled test. | Keep both; `CONTRADICTIONS.md` §6. |
| 36 | `noxious+poison` | C | **Resolved — tested/rule** | Order **does** matter: same-property pair, so the **first-selected ball's max poison stacks win** (Noxious × Poison = 3 stacks; Poison × Noxious = 8). | PSA #2 2025-11-24 (`reported`); Reddit `1qbqkw5` 2026-01-13 (`reported`); 2026-11-09 same-property dominance (`v1.3xx+3FD`, `observed` for Banished Flame/burn; Noxious/Brimstone example). |
| 37 | `nuclear-bomb+overgrowth` | O | **Resolved — tested/rule** | Order **does** matter: same-property pair (range), so the **first-selected ball's range wins** (Nuke × Overgrowth = 5×5; Overgrowth × Nuke = 3×3). | PSA #2 2025-11-24 (`reported`); Reddit `1qbqkw5` 2026-01-13 (`reported`); 2026-11-09 same-property dominance. |
| 38 | `nuclear-bomb+shotgun` | O | **Resolved — rule/model** | The mmemo "Shotgun × Nuke" order mandate is bare folklore; the pair is cross-property (Shotgun spawn + Nuke explosion), so order does not change the fusion's ability. The spawn-channel cross-wire (each baby becomes a bomb) is a separate, reported behaviour. | PSA #1 2025-11-11 (`observed` general finding); 2026-11-09 synthesis mechanism list (outside it); mmemo (`reported`). |
| 39 | `nuclear-bomb+voluptuous-egg-sac` | C | **Resolved — reconciled** | **Cross-wire:** Voluptuous Egg Sac's egg sacs/babies **do become nukes** (tooltip + multiple reports; the al-gest reader describes splitting up to 12 times). One no-cross-wire report is an outlier. **Order:** both components are cooldown-class, so the first-selected ball's cooldown wins. | Tooltip + al-gest reader 2025-11-07 (`reported`); corpus reports; 2026-11-09 both-cooldown rule (`v1.3xx+3FD`, `reported`). |
| 40 | `nuclear-bomb+wraith` | O | **Still inconclusive** | A specific "these two orders behave differently, and the white text is incorrect" exception, repeated by Abject_Nerve_1052 and derived posts, but with no mechanism and no controlled test. It is not bare al-gest folklore, so the model does not clear it. | Keep both; `CONTRADICTIONS.md` §1/§7. |
| 41 | `overgrowth+sun` | O | **Resolved — tested** | Order does **not** change function (PSA #1 explicitly tested Sun × Overgrowth both orders). The cross-wire (Sun's screen-wide burn applies Overgrowth stacks) is consistent. | PSA #1 2025-11-11 (`observed`); 2026-11-09 synthesis. |
| 42 | `vampire+vampire-lord` | C | **Still inconclusive** | A single flagged observation: Vampire Lord's spawned bats do **not** inherit the fusion material's traits (an explicit non-inheritance exception). No pair-specific conflict and no current source adds evidence. | Keep as record; `CONTRADICTIONS.md` §11. |

### Summary counts

| Verdict | Pairs |
|---|---|
| Resolved — tested (incl. `tested/rule`, `tested/recent`) | 17 |
| Resolved — rule/model | 7 |
| Resolved — reconciled (incl. `reconciled/mechanism`) | 8 |
| **Resolved (total)** | **32** |
| Partially resolved (cross-wire resolved, order still inconclusive) | 1 (`maggot+nuclear-bomb`) |
| De-scoped (global dispute stays open) | 1 (`iron+nuclear-bomb`) |
| Still inconclusive | 8 (`black-hole+maggot`, `blizzard+magma`, `egg-sac+holy-laser`, `holy-laser+shotgun`, `nosferatu+reaper`, `nosferatu+satan`, `nuclear-bomb+wraith`, `vampire+vampire-lord`) |

**Bottom line:** 32 of 42 pairs now have a defensible side; 1 is partially
resolved; 1 is de-scoped; 8 remain genuinely inconclusive. The unresolved set
is dominated by single-observation flags, sentiment conflicts, and two
specific order exceptions (`blizzard+magma`, `nuclear-bomb+wraith`). Nothing
in the unresolved set is contradicted by the new sources; the default
keep-both-claims treatment remains correct for them.

---

## Curated-layer update (applied 2026-11-11)

These were recommendations at research time; the curated-layer changes below
were applied to `fusion-pairs.json` in the 2026-11-11 pass (commit `4eeceb7`).
The raw corpus stays append-only and was not edited. The field changes are
retained here as the applied record.

### 1. `general_rules_notes` updates

**`base-ball-pool-recursion`** — add the 2026-11-09 and 2026-05-30 sources;
resolve the scope dispute:

```json
{
  "title": "Base-ball pool recursion (order affects pool availability, not the fusion's effect)",
  "source": "https://www.reddit.com/r/BALLxPIT/comments/1xrhisk/fusion_order_did_not_matter_a_year_ago_it/",
  "date": "2026-11-09",
  "confidence": "reported",
  "statement": "If one component is a BASE ball (Wind, Egg Sac, Brood Mother, Burn, Cell, etc.), the FIRST-SELECTED base ball is consumed and will not appear again in the level-up/fusion pool that run; the second-selected base ball can reappear. Confirmed by the 2026-11-09 synthesis ('if a base ball ... is used as the Catalyst in a fusion, that ball will NOT appear ... ever again for that run ... if you do want the base ball to appear again, just make sure you don't use it as the Catalyst'), the 2026-05-30 Android PSA (F2PBTW_YT) and icemage_999's 'The first ball in a Fusion is always effectively Banished. This is true in all versions', and the 2026-02-26 Egg Sac/Blizzard post. This resolves the alleged polarity dispute: all verbatim texts say the first-selected ball is consumed; the harvest annotation of SpaceCatNL was a misreading.",
  "scope_dispute": "RESOLVED for base balls: the first-selected base ball is consumed. Personal_Ad9690's generalisation to any first-selected ball (his Ghost example) is unverified; Ghost is not a base ball. Treat the 'any ball' version as reported-only."
}
```

**`same-property-first-wins`** — add the 2026-11-09 corroboration:

```json
{
  "source": "https://www.reddit.com/r/BALLxPIT/comments/1xrhisk/fusion_order_did_not_matter_a_year_ago_it/",
  "date": "2026-11-09",
  "confidence": "reported",
  "statement": "Same-property pairs take the first-selected ball's variant. The 2026-11-09 synthesis adds: Banished Flame as Catalyst makes Sun adopt Banished Flame's burn stack limit/damage/duration; Noxious as Catalyst spreads 4 stacks of poison and burn with Brimstone. This corroborates PSA #2 and the Nuke × Overgrowth / Noxious × Poison examples."
}
```

**`cooldown-first-wins`** — add the 2026-11-09 worked example:

```json
{
  "source": "https://www.reddit.com/r/BALLxPIT/comments/1xrhisk/fusion_order_did_not_matter_a_year_ago_it/",
  "date": "2026-11-09",
  "confidence": "reported",
  "statement": "Both-cooldown pairs take the first-selected ball's cooldown. 2026-11-09 worked example: Timestop × Egg Sac keeps Timestop's 30 s cooldown; Egg Sac × Timestop gives Timestop Egg Sac's 3 s cooldown. This independently corroborates namu.wiki's Black Hole × Timestop example and the first-selected rule."
}
```

**`damage-cap-9999`** — keep `confidence: "contradicted"`; add the newer split:

```json
{
  "source": "https://www.reddit.com/r/BALLxPIT/comments/1wah802/in_endless_are_there_any_mechanics_that/",
  "date": "2026-09-08",
  "confidence": "contradicted",
  "statement": "The display-vs-real cap dispute is still live. The corpus's 'display cap' reading rests on Xersin (2025-10-28: pre-cap range 14616-25580, displayed 9999). A newer 2026-09-08/13 thread splits: tsuruki23 argues 9999 is a REAL per-hit cap and uses it to explain Hemorrhage's endless-mode falloff; TheBeyond argues display cap; CommanderRedJonkks (2026-09-13) says it feels like a real cap. No controlled test. Do not treat the display-cap reading as settled."
}
```

### 2. Per-pair `status` / `order.matters_functionally` changes

Legend: `→` = recommended new value. `status` values are the schema's
`verified` / `inferred` / `unverified` / `contradicted`; `order` values are
`yes` / `no` / `disputed` / `unknown`.

| Pair | `status` | `order.matters_functionally` | Note for `order.detail` |
|---|---|---|---|
| `black-hole+flash` | `verified` (unchanged) | `disputed` → **`no`** | Pair's own fusion order is commutative; Despair's claim is a separate multi-fusion interaction, not this pair's order. |
| `black-hole+maggot` | `contradicted` (unchanged) | `disputed` (unchanged) | Behaviour and order both still open; no new pair-specific evidence. |
| `black-hole+nuclear-bomb` | `contradicted` → **`verified`** | `yes` (unchanged) | Both-cooldown rule confirmed; BH kill is non-boss-only. |
| `black-hole+satan` | `contradicted` → **`verified`** | `unknown` (unchanged) | Cross-wire real; high-spawn breakage is a separate performance bug. |
| `black-hole+sun` | `contradicted` → **`verified`** | `disputed` → **`no`** | PSA #1 bonus both-orders test; cross-wire non-boss-only; fusion-offer bug is general. |
| `blizzard+magma` | `unverified` (unchanged) | `disputed` (unchanged) | Demo-era numerical claim; no current-build test. |
| `brood-mother+laser-vertical` | `inferred` (unchanged) | `disputed` → **`no`** | Targeted re-test found 0 difference; base-ball pool banish is separate. |
| `cell+nuclear-bomb` | `verified` (unchanged) | `disputed` → **`no`** | Cross-property; Cell-first additionally banishes Cell. |
| `earthquake+flash` | `contradicted` → **`verified`** | `disputed` → **`no`** | Targeted controlled test; kits coexist independently. |
| `egg-sac+ghost` | `contradicted` → **`verified`** | `disputed` → **`no`** | First-selected base ball banished (pool rule); fusion effect commutative. |
| `egg-sac+hemorrhage` | `verified` (unchanged) | `disputed` → **`no`** | First-selected base ball banished; fusion effect commutative. |
| `egg-sac+holy-laser` | `contradicted` (unchanged) | `unknown` (unchanged) | Single observation; no resolution possible. |
| `egg-sac+maggot` | `inferred` (unchanged) | `disputed` → **`no`** | First-selected base ball banished; fusion effect commutative. |
| `egg-sac+poison` | `verified` (unchanged) | `disputed` → **`no`** | First-selected base ball banished; fusion effect commutative. |
| `flash+flicker` | `inferred` (unchanged) | `disputed` → **`no`** | Description text changes only; function same (2026-11-09 analogous re-test). |
| `flash+hemorrhage` | `contradicted` → **`verified`** | `disputed` → **`no`** | PSA #1; 9999 cap is a global open question, not pair-specific. |
| `flash+overgrowth` | `contradicted` → **`verified`** | `disputed` → **`no`** | PSA #1 + Leorium refutation; al-gest/mmemo folklore presentation-only. |
| `flicker+hemorrhage` | `verified` (unchanged) | `disputed` → **`no`** | PSA #1. |
| `flicker+overgrowth` | `contradicted` → **`verified`** | `disputed` → **`no`** | Overgrowth stacks cross-wire; dizzy is a different channel; order commutative. |
| `flicker+reaper` | `contradicted` → **`verified`** | `unknown` (unchanged) | 2026-08-07 re-test confirms cross-wire. |
| `freeze-ray+sun` | `contradicted` → **`verified`** | `unknown` (unchanged) | Beam carries Sun's burn; Sun's AOE does not carry freeze. |
| `glacier+shotgun` | `inferred` (unchanged) | `disputed` → **`no`** | Cross-property; al-gest folklore presentation-only. |
| `hemorrhage+satan` | `contradicted` → **`verified`** | `unknown` (unchanged) | No %HP cross-wire (debuff-only Satan + hit-required Hemorrhage proc); tooltip mismatch. |
| `hemorrhage+sun` | `inferred` (unchanged) | `disputed` → **`no`** | PSA #1. |
| `hemorrhage+voluptuous-egg-sac` | `contradicted` → **`verified`** | `unknown` (unchanged) | Babies apply bleed but not the %HP proc. |
| `holy-laser+maggot` | `contradicted` → **`verified`** | `disputed` → **`no`** | Baby-ball both-orders test; cross-wire confirmed. |
| `holy-laser+shotgun` | `contradicted` (unchanged) | `unknown` (unchanged) | Single observation; no resolution possible. |
| `iron+nuclear-bomb` | `contradicted` → **`inferred`** | `unknown` (unchanged) | De-scoped: pair-specific claim is a pre-cap range; global 9999 dispute stays contradicted. |
| `landslide+maggot` | `contradicted` → **`verified`** | `unknown` (unchanged) | Cross-wire confirmed (babies trigger Landslide). |
| `landslide+mosquito-swarm` | `contradicted` → **`verified`** | `unknown` (unchanged) | Kill-gated, not a missing cross-wire. |
| `laser-vertical+maggot` | `inferred` (unchanged) | `disputed` → **`no`** | Targeted re-test found 0 difference. |
| `maggot+nuclear-bomb` | `contradicted` → **`verified`** | `disputed` (unchanged) | Cross-wire resolved; order still open (two mechanism-backed anecdotes). |
| `magma+shotgun` | `unverified` (unchanged) | `disputed` → **`no`** | Cross-property; al-gest/mmemo folklore presentation-only. |
| `nosferatu+reaper` | `contradicted` (unchanged) | `unknown` (unchanged) | Sentiment conflict; no mechanism resolution. |
| `nosferatu+satan` | `contradicted` (unchanged) | `unknown` (unchanged) | Build/patch-dependent bug; both claims credible. |
| `noxious+poison` | `contradicted` → **`verified`** | `unknown` → **`yes`** | Same-property: first-selected max stacks win. |
| `nuclear-bomb+overgrowth` | `verified` (unchanged) | `disputed` → **`yes`** | Same-property: first-selected range wins. |
| `nuclear-bomb+shotgun` | `inferred` (unchanged) | `disputed` → **`no`** | Cross-property; mmemo folklore presentation-only. |
| `nuclear-bomb+voluptuous-egg-sac` | `contradicted` → **`verified`** | `yes` (unchanged) | Babies become nukes; both-cooldown first-selected rule. |
| `nuclear-bomb+wraith` | `inferred` (unchanged) | `disputed` (unchanged) | Specific order exception, no mechanism/test; keep both. |
| `overgrowth+sun` | `verified` (unchanged) | `disputed` → **`no`** | PSA #1. |
| `vampire+vampire-lord` | `contradicted` (unchanged) | `unknown` (unchanged) | Single observation; no resolution possible. |

**Expected curated-layer totals after the update:** `status` contradicted
25 → **6** (the six still-inconclusive *contradicted* pairs:
`black-hole+maggot`, `egg-sac+holy-laser`, `holy-laser+shotgun`,
`nosferatu+reaper`, `nosferatu+satan`, `vampire+vampire-lord`; the other two
still-inconclusive pairs were `unverified`/`inferred`). The 18 cleared
contradicted pairs become `verified`; `iron+nuclear-bomb` becomes `inferred`.
Expected totals: verified 31 → **49**, inferred 96 → **97**, unverified **218**
(unchanged), contradicted 25 → **6**. Order `disputed` 26 → **4**
(`black-hole+maggot`, `blizzard+magma`, `maggot+nuclear-bomb`,
`nuclear-bomb+wraith`). Of the other 22 order-disputed pairs, 21 move to `no`
and 1 (`nuclear-bomb+overgrowth`, same-property) moves to `yes`. Separately,
`noxious+poison` moves `unknown` → `yes` (same-property), and the two
already-`yes` both-cooldown pairs stay `yes`. Expected order totals: yes
15 → **17**, no 74 → **95**, disputed 26 → **4**, unknown 255 → **254**.

### 3. Dated `CONTRADICTIONS.md` section (ready to paste)

```markdown
## 13. Source-only resolution pass — 2026-11-11 (issue #19)

Re-checked the 42 contradicted/order-disputed pairs against sources current
to 2026-11-11. **32 resolved, 1 partially resolved, 1 de-scoped, 8 still
inconclusive.** Raw corpus untouched; this section records the outcome and the
curated-layer changes.

### 13a. New evidence that moved the map

- **Order synthesis, 2026-11-09** (`Expensive_Sail_5138`, Reddit `1xrhisk`,
  v1.3xx + 3 free DLCs): the old "order does NOT matter" PSA was correct at
  the time and became misleading only because the free updates added new
  balls. Order now matters for (1) base-ball banish, (2) both-cooldown pairs,
  (3) same-property dominance, (4) specific DLC-ball interactions (Time,
  Banshee, Banished Flame, Erosion, Brimstone). It re-tested Freeze Ray ×
  Flash: description changes, function does not; freeze spread depends on the
  freeze-type ball, not order. Corroborated in-thread by icemage_999.
- **Base-ball banish** confirmed by the 2026-11-09 post, the 2026-05-30
  Android PSA (`1ts1v87`), and the 2026-02-26 Egg Sac/Blizzard post
  (`1rfpa04`). The first-selected **base** ball is consumed; the alleged
  polarity dispute in §2 was a harvest-annotation error. The "any ball"
  generalisation remains unverified.
- **9999 cap still open.** A 2026-09-08/13 thread (`1wah802`) splits between
  a real per-hit cap (tsuruki23, mechanism-backed) and a display cap
  (TheBeyond); CommanderRedJonkks says it feels real. This is newer than the
  corpus's Xersin report and points the other way. Keep §8's contradiction.
- **Satan × Hemorrhage** resolves to no %HP cross-wire: the current wiki
  effect text shows Satan is debuff-only and Hemorrhage's proc requires a hit
  at 12+ bleed stacks. See §4; the tooltip mismatch stays.
- **Flicker × Reaper** resolves to cross-wire: a 2026-08-07 direct re-test
  ("Flicker Reaper does still work the same") plus 2026-05/08 reports.
- **Base-game order folklore** (al-gest/mmemo rows) resolves to
  presentation-only for cross-property, non-cooldown, non-base-ball pairs.

### 13b. Resolved pairs

`black-hole+flash` (order no), `black-hole+nuclear-bomb` (order yes; cross-wire
non-boss-only), `black-hole+satan` (cross-wire real; break is a high-spawn
bug), `black-hole+sun` (order no; cross-wire non-boss-only), `brood-mother+
laser-vertical` (order no), `cell+nuclear-bomb` (order no; Cell-first
banished), `earthquake+flash` (order no; kits coexist), `egg-sac+ghost`,
`egg-sac+hemorrhage`, `egg-sac+maggot`, `egg-sac+poison` (first-selected base
ball banished), `flash+flicker` (description-only), `flash+hemorrhage` (order
no; 9999 global open), `flash+overgrowth` (order no), `flicker+hemorrhage`
(order no), `flicker+overgrowth` (stacks cross-wire; no dizzy), `flicker+
reaper` (cross-wire), `freeze-ray+sun` (beam carries burn; AOE does not carry
freeze), `glacier+shotgun` (order no), `hemorrhage+satan` (no %HP cross-wire),
`hemorrhage+sun` (order no), `hemorrhage+voluptuous-egg-sac` (bleed yes, %HP
no), `holy-laser+maggot` (order no; cross-wire), `landslide+maggot`
(cross-wire), `landslide+mosquito-swarm` (kill-gated), `laser-vertical+maggot`
(order no), `magma+shotgun` (order no), `noxious+poison` (order yes),
`nuclear-bomb+overgrowth` (order yes), `nuclear-bomb+shotgun` (order no),
`nuclear-bomb+voluptuous-egg-sac` (cross-wire; order yes), `overgrowth+sun`
(order no).

### 13c. Partially resolved / de-scoped

- `maggot+nuclear-bomb` — cross-wire confirmed; order still inconclusive
  (Lexifer452's explosion-count claim and the 2025-11-01 "infest-first vs
  explode-first" mechanism-backed anecdote; PSA #1 did not test the pair).
- `iron+nuclear-bomb` — de-scoped: the pair-specific claim is Xersin's
  pre-cap range; the 9999 dispute is global (§8) and stays contradicted.

### 13d. Still inconclusive (keep both claims)

`black-hole+maggot` (babies carry BH instant-kill vs spawn-bound channel says
no; order anecdote), `blizzard+magma` (demo-era 4-tile vs 2-tile claim; no
current-build test), `egg-sac+holy-laser` (single observation), `holy-laser+
shotgun` (single observation), `nosferatu+reaper` (sentiment), `nosferatu+
satan` (build/patch-dependent bug), `nuclear-bomb+wraith` (specific order
exception, no mechanism/test), `vampire+vampire-lord` (single observation).

### 13e. Follow-up implementation tickets

- **Curated-layer update** — apply the `fusion-pairs.json` `status`/`order`
  changes and the four `general_rules_notes` updates in
  `CONTRADICTION-RESOLUTION-2026-11-11.md` §"Recommended curated-layer
  update". Keep the raw JSONL untouched.
- **9999-cap ticket** — one controlled test (or a game-file check of the
  damage-application path) to settle display vs real cap. Until then, do not
  use on-screen 9999 pop-ups as an upper bound, and do not assert a display
  cap either.
- **Two order exceptions** — one current-build both-orders test each for
  `blizzard+magma` and `nuclear-bomb+wraith` would close the two specific
  demo-era / one-off order exceptions. (The other two remaining order
  disputes, `black-hole+maggot` and `maggot+nuclear-bomb`, need baby-inheritance
  and explosion-count tests respectively.)
- **Behaviour tickets** — `black-hole+maggot` (one controlled baby-inheritance
  test), `nosferatu+satan` (one controlled run on a fixed build), and the
  `nosferatu+reaper` sentiment (not resolvable by test; leave as record).
- **Risen Ballbylon re-check** — the paid expansion launches 2026-11-12 with
  24 new balls. Re-run this resolution pass after the DLC is live; the
  order-matters mechanism list will grow.
```

---

## Residual uncertainty and what would settle the remaining pairs

| Pair | What is still missing |
|---|---|
| `black-hole+maggot` | A controlled baby-inheritance test: spawn Maggot babies from a BH × Maggot fusion and check whether the babies instant-kill. The positive reports may be the main ball's own screen-clear. |
| `blizzard+magma` | One current-build both-orders test measuring the freeze radius (4-tile vs 2-tile). The existing claim is demo-era. |
| `egg-sac+holy-laser` | Any second source naming the pair; currently a single flagged observation. |
| `holy-laser+shotgun` | Any second source; currently a single flagged observation with an acknowledged ambiguity. |
| `maggot+nuclear-bomb` (order) | A controlled both-orders test counting mushroom clouds/explosions. Two mechanism-backed anecdotes claim a difference; PSA #1 did not test the pair. |
| `nosferatu+reaper` | Not resolvable by test — it is a sentiment conflict. Keep as record. |
| `nosferatu+satan` | A controlled run on a fixed build/patch, or a game-file check of the Nosferatu fusion path. The 0-damage bug and the 47M report may both be real under different conditions. |
| `nuclear-bomb+wraith` | A controlled both-orders test; the "behave differently / white text incorrect" claim is specific but single-lineage. |
| `vampire+vampire-lord` | Any second source; currently a single flagged observation. |

## Source list (new to this pass, with dates and versions)

All URLs accessed 2026-11-11. "New" means not already cited in the target
pair's `claims[]`; some may exist elsewhere in the corpus.

1. Expensive_Sail_5138, "Fusion Order did not matter a year ago, it certainly
   DOES matter now", Reddit `1xrhisk`, **2026-11-09**, `v1.3xx+3FD`, score 76.
   <https://www.reddit.com/r/BALLxPIT/comments/1xrhisk/fusion_order_did_not_matter_a_year_ago_it/>
2. F2PBTW_YT, "PSA: Free 5th Banish method", Reddit `1ts1v87`,
   **2026-05-30**, `v1.3xx+3FD`, score 16 (Android current version).
   <https://www.reddit.com/r/BALLxPIT/comments/1ts1v87/psa_free_5th_banish_method/>
3. "Is there a limit to the number of times you can get a specific ball?",
   Reddit `1rfpa04`, **2026-02-26**, `v1.3xx+3FD`.
   <https://www.reddit.com/r/BALLxPIT/comments/1rfpa04/is_there_a_limit_to_the_number_of_times_you_can>
4. "In Endless, are there any mechanics that eventually reduce the
   effectiveness of Hemorrhage dealing 30% of a unit's current Health?",
   Reddit `1wah802`, **2026-09-08**, `v1.3xx+3FD`; comments by tsuruki23
   (2026-09-08), TheBeyond (2026-09-08), CommanderRedJonkks (2026-09-13).
   <https://www.reddit.com/r/BALLxPIT/comments/1wah802/in_endless_are_there_any_mechanics_that/>
5. "Did they nerf Reaper insta-kill in the endgame?", Reddit `1vi8se9`,
   **2026-08-07**, `v1.3xx+3FD`.
   <https://www.reddit.com/r/BALLxPIT/comments/1vi8se9/did_they_nerf_reaper_instakill_in_the_endgame>
6. "This is my favorite subreddit by a mile", Reddit `1vm0nxn`,
   **2026-08-12**, `v1.3xx+3FD`.
   <https://www.reddit.com/r/BALLxPIT/comments/1vm0nxn/this_is_my_favorite_subreddit_by_a_mile>
7. "Should I go with maggots or gamble waitin for Sun/Flicker", Reddit
   `1t6vmao`, **2026-05-08**, `v1.3xx+3FD`.
   <https://www.reddit.com/r/BALLxPIT/comments/1t6vmao/should_i_go_with_maggots_or_gamble_waitin_for>
8. "Worst Combos?", Reddit `1t1qvfx`, **2026-05-02**, `v1.3xx+3FD`.
   <https://www.reddit.com/r/BALLxPIT/comments/1t1qvfx/worst_combos>
9. "Finally got the endless run I wanted", Reddit `1qw1ook`, **2026-02-04**,
   `v1.3xx+3FD`.
   <https://www.reddit.com/r/BALLxPIT/comments/1qw1ook/finally_got_the_endless_run_i_wanted>
10. "Suffering from success (two ultimate balls that pit against each other)",
    Reddit `1r3qjc0`, **2026-02-13**, `v1.3xx+3FD`.
    <https://www.reddit.com/r/BALLxPIT/comments/1r3qjc0/suffering_from_success_two_ultimate_balls_that>
11. "If you ever are struggling", Reddit `1qmadnz`, **2026-01-25**,
    `v1.3xx+3FD`.
    <https://www.reddit.com/r/BALLxPIT/comments/1qmadnz/if_you_ever_are_struggling>
12. "Fusion Nosfaratu with something seems to break everything??", Reddit
    `1r9npqr`, **2026-02-20**, `v1.3xx+3FD`.
    <https://www.reddit.com/r/BALLxPIT/comments/1r9npqr/fusion_nosfaratu_with_something_seems_to_break>
13. "Can someone explain non-evolution fusion to me?", Reddit `1ola7jc`,
    **2025-11-01**, `unknown`.
    <https://www.reddit.com/r/BALLxPIT/comments/1ola7jc/can_someone_explain_nonevolution_fusion_to_me>
14. "Does order matter?", Reddit `1qbqkw5`, **2026-01-13**, `unknown`.
    <https://www.reddit.com/r/BALLxPIT/comments/1qbqkw5/does_order_matter>
15. "Does the order in which you select balls to be fused matter?", Reddit
    `1srjxm5`, **2026-04-21**, `unknown`.
    <https://www.reddit.com/r/BALLxPIT/comments/1srjxm5/does_the_order_in_which_you_select_balls_to_be>
16. "Questions about evolutions", Reddit `1spmw90`, **2026-04-19**,
    `unknown`.
    <https://www.reddit.com/r/BALLxPIT/comments/1spmw90/questions_about_evolutions>
17. "Some questions about how some things work in this game", Reddit
    `1pvi9bn`, **2025-12-25**, `unknown`.
    <https://www.reddit.com/r/BALLxPIT/comments/1pvi9bn/some_questions_about_how_some_things_work_in_this>
18. "Does order of fusions impact how it works?", Reddit `1ojeqxp`,
    **2025-10-29**, `unknown`.
    <https://www.reddit.com/r/BALLxPIT/comments/1ojeqxp/does_order_of_fusions_impact_how_it_works>
19. BALL x PIT Wiki, "Fusion Mechanics", oldid 4217, **2026-09-19**,
    `v1.301` (order statement + trigger matrix).
    <https://ballxpit.wiki.gg/wiki/Fusion_Mechanics?oldid=4217>
20. BALL x PIT Wiki ball pages, oldids 4099-4138, **2026-09** (`v1.301`
    effect text): Satan, Hemorrhage, Flicker, Reaper, Mosquito Swarm, Maggot,
    Landslide.
    <https://ballxpit.wiki.gg/wiki/Satan>, `/Hemorrhage`, `/Flicker`,
    `/Reaper`, `/Mosquito_Swarm`, `/Maggot`, `/Landslide`.
21. Nintendo Life, "Ball x Pit's Next DLC Arrives This November, And It's
    Huge", **2026-09-21** (Risen Ballbylon, 2026-11-12, 24 new balls).
    <https://nintendolife.com/news/2026/09/ball-x-pits-next-dlc-arrives-this-november-and-its-huge>
