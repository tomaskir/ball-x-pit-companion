# Mosquito King spawn channel — trigger vs inheritance

Research ticket: **#18 — Separate the two claims about Mosquito King as fusion
material** (`tomaskir/ball-x-pit-companion`). Branch
`research/mosquito-king-spawn`. Research date **2026-11-11**.

This is a source-only investigation. No playtest was run for this ticket; every
claim below is either (a) an in-game tooltip / game-file observation already in
the corpus, (b) a current-wiki mechanism claim, or (c) a community report,
labelled as such. The existing fact base is
[`fusion-mechanics.md`](./fusion-mechanics.md); the evidence corpus is
[`fusion-observations/`](./fusion-observations/). This file does **not** edit
either the raw corpus or the fact base — it records what the sources say and
what the composer model should do.

## The two claims, separated

| # | Claim | Verdict | Confidence |
| --- | --- | --- | --- |
| 1 | **Trigger** — Mosquito King's spawn-on-hit fires from a partner's screen-wide / AOE hits. | **No.** The spawn is an **On-Hit effect**; AOE damage is not a hit, so it does not trigger the spawn. The fused ball still spawns a mosquito when the *ball itself* directly hits an enemy. | **Reported + mechanism-backed** (no controlled test). |
| 2 | **Inheritance** — the spawned mosquitoes carry the partner's status / properties. | **Yes, reported.** The spawn channel can carry the partner's status (Virus's disease is the named case). | **Reported** (single guide + mechanism + family-level reports; not directly observed for Mosquito King). |

The two claims are independent. The Steam Flash × Mosquito King observation is
about the **trigger**, not about inheritance; the GameRant Mosquito King × Virus
claim is about **inheritance**, not about the trigger. A model that treats
either observation as evidence for the other will be wrong in one direction or
the other.

## Version tags used below

| Tag | Meaning |
| --- | --- |
| **v1.301 / v1.5** | Naturalist build (2026-08-06), the current version at research date. The wiki's update numbering calls it v1.5; the fact-base snapshot is v1.301. |
| **Nov 2026** | Community reports dated 2026-11-06..09, on v1.5, **before** the paid DLC. |
| **DLC** | *Risen Ballbylon*, release date 2026-11-12 — **not released at research date**, so no DLC-era evidence exists yet. |
| **unknown** | Corpus rows whose source did not pin a build. |

No current-version game-file dump newer than the build 1.288/1.301 material was
found. The game has **no fusion table** (`fusion-mechanics.md` §1.1), so game
files cannot answer fusion trigger/inheritance semantics directly; the
mechanism evidence is the current wiki's trigger taxonomy plus observations.

## Sources checked for this ticket

- **Current wiki, Mosquito King** — revision 4124, live 2026-11-11
  (<https://ballxpit.wiki.gg/wiki/Mosquito_King>). Infobox classifies the ball
  as **On-Hit Effects: Spawn**; **Status Effects: Spawn mosquito, Steal
  health**; **Status Effect Triggered By: On-Hit, Spawn**.
- **Current wiki, Balls** — revision 4002, 2026-09-10
  (<https://ballxpit.wiki.gg/wiki/Balls>). Per-ball On-Hit / Status-Trigger
  taxonomy; the explicit "On-Hit Effects … On-Hit only" rule.
- **Current wiki, Fusion Mechanics** — revision 4217, 2026-09-19
  (<https://ballxpit.wiki.gg/wiki/Fusion_Mechanics>). "Spawned units can inherit
  the original ball's abilities"; the trigger matrix.
- **Current wiki, Brood Mother** — revision 4084
  (<https://ballxpit.wiki.gg/wiki/Brood_Mother>). "Baby Balls spawned from the
  combined ball will also trigger the effects of the combined ball. The baby
  balls will inherit the effects of the combined ball."
- **Steam, PHAELANX** — 2025-12-30, unknown version
  (<https://steamcommunity.com/app/2062430/discussions/0/693123052112846362/>).
  Flash × Mosquito King: the AOE ticks do not spawn a mass of mosquitoes.
  (The live Steam page no longer renders the thread body without a session; the
  verbatim quote is preserved in `fusion-observations/steam.jsonl:23`.)
- **Reddit r/BALLxPIT 1spmw90**, "Questions about evolutions", u/Abject_Nerve_1052,
  **2026-04-19**, pre-Naturalist
  (<https://www.reddit.com/r/BALLxPIT/comments/1spmw90/questions_about_evolutions/>).
  "In general mosquitos spawn when a ball makes direct contact with an enemy,
  but can carry status."
- **Reddit r/BALLxPIT 1ojeqxp**, "Does order of fusions impact how it works?",
  u/williamatherton, **2025-10-29**
  (<https://www.reddit.com/r/BALLxPIT/comments/1ojeqxp/does_order_of_fusions_impact_how_it_works/>).
  "I've had it where spawned mosquitoes would apply the laser effect." The
  named pair in the thread is ambiguous (the OP's follow-up says "Spider Queen
  x Mosquito Queen"), so this is weak corroboration, not a clean Mosquito King
  observation.
- **GameRant**, "Ball x Pit Tier List (Best Evolutions)", **2025-10-26**
  (<https://gamerant.com/ball-x-pit-evolutions-tier-list-best-balls>).
  Mosquito King × Virus: "Effective in crowded areas or when fused with status
  spreading balls like Virus"; Virus becomes "deadly when fused with Flash,
  Flicker, or Sun, or any of the mosquito-based balls."
- **GameRant commenter Le Roux**, **2025-11-30**, same URL. "Any multiball
  effect (brood mother, egg sag, cell, and their evolutions) … the baby balls
  inherit from the other ball properties."
- **Existing corpus** (`fusion-observations/*.jsonl`, access 2026-10-04) and
  `CONTRADICTIONS.md` — re-read for the ticket's specific claims.
- **In-game fused tooltips already in the corpus** —
  `images.jsonl:2` (Egg Sac × Poison) and `images.jsonl:4` (Spider Queen ×
  Vampire Lord), both transcribed from wiki.gg tooltip screenshots
  (2026-02-03). Each contains an explicit line: "Spawned balls from X have the
  same properties as Y."

## 1. Trigger — does the spawn fire from a partner's screen-wide / AOE hits?

### 1.1 Verdict: no

Mosquito King's spawn is an **On-Hit effect**, not an on-damage effect. The
current wiki says so twice:

- **Mosquito King infobox** (rev 4124): "On-Hit Effects: **Spawn**"; "Status
  Effect Triggered By: **On-Hit, Spawn**."
- **Balls page** (rev 4002): "On-Hit Effects: can be triggered by hit only.
  On-Hit Effects include Destroy, Pass through, AOE, and **Spawn**." Its table
  repeats: "On-Hit Effects | Destroy, Pass Through, AOE, Spawn | **On-Hit
  only**."

A partner's screen-wide / AOE damage is a **damage** event, not a **hit** event.
The Fusion Mechanics matrix (rev 4217) says AOE cannot trigger On-Hit effects:

| Trigger type | On-Hit | On-Damage | On-Timer |
| --- | --- | --- | --- |
| Spawn | YES | YES | NO |
| AOE | **NO** | YES | NO |
| Status Effect | NO | NO | NO |

The operational reading that fits both the Balls page and the observed
behaviour: **AOE is a damage source, and a damage source cannot trigger an
On-Hit effect.** So Flash's screen-wide ticks do not spawn mosquitoes; only the
fused ball's own direct hits do.

### 1.2 Observed corroboration

- **Steam, PHAELANX (2025-12-30, unknown).** Flash × Mosquito King's tooltip
  says it hits all enemies every 3 seconds and spawns a mosquito each time it
  hits an enemy; the player reports that "every three seconds it does not spawn
  a massive amount of mosquitos to deal real damage." This is the trigger
  claim: the AOE ticks do not feed the spawn.
- **Reddit, Abject_Nerve_1052 (2026-04-19, pre-Naturalist).** "In general
  mosquitos spawn when a ball makes direct contact with an enemy, but can carry
  status." Direct contact is the trigger condition.
- **Reddit, u/Abject_Nerve_1052 (2025-11-23, "Ball Proc Questions").**
  Mosquito King × Mosquito Swarm "spawns one mosquito from the hit and one from
  the burst" — again the King's spawn is "from the hit."

### 1.3 The wiki's trigger matrix is ambiguous — and the ambiguity matters

The Fusion Mechanics matrix can be read two ways:

- **Target reading** (rows = the ability being triggered): Spawn can be
  triggered by On-Hit **and On-Damage**. This predicts that an AOE partner's
  damage *does* spawn mosquitoes — contradicted by the Steam observation.
- **Source reading** (rows = the ability doing the triggering): Spawn as a
  source can trigger On-Hit and On-Damage effects (i.e. spawned units inherit
  and can trigger the original ball's abilities); AOE as a source can trigger
  On-Damage effects but **not On-Hit** effects; Status Effect as a source
  cannot trigger anything.

The **source reading** is the one that makes the whole table consistent:
the Status Effect row ("NO / NO / NO") only makes sense as "a status effect
cannot trigger other abilities," which is exactly the sentence above the table
("Status Effect: Applies debuffs to targets. **Can not trigger other
ablilities.**"). It also matches the Balls page and the Steam observation.

**Flag for the project model:** the ticket #6 decision recorded the
**target** reading ("Spawn: on-hit/on-damage yes, on-timer no"). If the composer
uses that reading, it will predict AOE-triggered spawn, which the Flash ×
Mosquito King observation contradicts. The source reading should replace it:
**AOE cannot trigger an On-Hit effect (Spawn).** This is a mechanism-level
correction, not a new special case for Mosquito King.

## 2. Inheritance — do the mosquitoes carry the partner's status / properties?

### 2.1 Verdict: yes, reported

The current wiki states the inheritance rule directly:

- **Fusion Mechanics** (rev 4217): "Spawn: Spawns Clones, Baby balls or
  Summons. **Spawned units can inherit the original ball's abilities.**"
- **Balls page** (rev 4002): "Status Effects … can be triggered by hit, AOE,
  Timer, Shoot, and **Spawn**." Spawn is a status trigger, so a spawned unit can
  apply a status.
- **Brood Mother** (rev 4084): "Baby Balls spawned from the combined ball will
  also trigger the effects of the combined ball. The baby balls will inherit the
  effects of the combined ball."

The game's own fused tooltips show the mechanism in the composer's output. Two
in-corpus tooltip screenshots (in-game, `images.jsonl`, 2026-02-03) contain the
explicit line:

- Egg Sac × Poison: "**Spawned balls from Egg Sac have the same properties as
  Poison.**"
- Spider Queen × Vampire Lord: "**Spawned balls from Spider Queen have the same
  properties as Vampire Lord.**"

These are not Mosquito King pairs, but they establish that the game's fusion
composer emits a spawn-inheritance line for spawn parents, and that the
inherited property is the partner's status/effect.

### 2.2 Mosquito King-specific evidence

- **GameRant (2025-10-26, unknown).** Mosquito King is "Effective in crowded
  areas or when fused with status spreading balls like Virus"; Virus "becomes
  deadly when fused with Flash, Flicker, or Sun, or any of the mosquito-based
  balls." The corpus records this as a cross-wire claim for Mosquito King ×
  Virus (`fusion-pairs.json`, status `inferred`, 2 observations, both from this
  one source).
- **GameRant commenter Le Roux (2025-11-30, unknown).** "Any multiball effect
  (brood mother, egg sag, cell, and their evolutions) … the baby balls inherit
  from the other ball properties." Mosquito King is an evolution of Brood
  Mother, so it is inside "their evolutions."
- **Reddit, Abject_Nerve_1052 (2026-04-19, pre-Naturalist).** "In general
  mosquitos spawn when a ball makes direct contact with an enemy, **but can
  carry status**." The examples are Mosquito Swarm pairs (Nuke, Black Hole,
  Hemorrhage, Overgrowth), not Mosquito King — family-level evidence, not a
  direct King observation.
- **namu.wiki (2026-08-26, v1.5), rule 6.** "Status abnormality + additional
  ball creation = the created balls also apply the same status."
- **Bilibili (2025-10-12, unknown).** Brood Mother: "the produced balls in most
  cases also inherit the other ball's property."
- **gonugame.com (2026-01-25, unknown).** Fusing an evolution ball with Brood
  Mother makes the baby balls "also carry a portion of the evolution ball's
  effect" — hedged ("some combinations").
- **Reddit, williamatherton (2025-10-29).** "I've had it where spawned
  mosquitoes would apply the laser effect." The named pair is ambiguous (the
  follow-up says "Spider Queen x Mosquito Queen"), so this is weak
  corroboration only.

### 2.3 Counter-evidence and exceptions

- **Vampire Lord's bats do not inherit the material's traits** (namu.wiki,
  2026-08-26; `namu.jsonl:47`, confidence `contradicted`). This is an explicit
  exception to the general spawn-inheritance rule, not a Mosquito King
  observation.
- **Brood Mother × Flash negative bug report** (Steam, Noobc0re, 2025-10-21,
  unknown): "When fused with flash it produces no extra balls, and sure as hell
  no balls with the properties of flash"; the poster also suspects "Brood
  Mother as a whole is buggered." This is a bug report, not a clean
  no-inheritance rule, and it is contradicted by the current wiki's Brood
  Mother page and by the positive Brood Mother reports above.
- **Voluptuous Egg Sac two-hop drop** (multiple reports): VES spawns Egg Sacs
  that spawn balls; the partner property is lost at the second hop. This is a
  different spawn channel and does not apply to Mosquito King's one-hop
  mosquito spawn.
- **The fact base's blanket sentence** — "Brood Mother's spawn channel does not
  carry the partner's property at all" (`fusion-mechanics.md` §2d) and the
  `SPAWN_EXCLUDED_IDS` comment in `src/fusion.ts` — is **too strong**. The
  current wiki's Brood Mother page says the opposite, and the positive reports
  outnumber the one negative bug report. The blanket exclusion should not be
  inherited by Mosquito King.

### 2.4 What "properties" means here

The tooltip line says "same properties," which is broader than "same status."
But the evidence for Mosquito King specifically is about **statuses** (Virus's
disease; the family-level mosquito reports name Nuke/Black Hole/Hemorrhage/
Overgrowth, i.e. status/effect channels). The composer should wire **status
partners** (the existing `isStatus` branch), not spawn-bound traits such as
Glacier's positional freeze or pass-through. The general rule's boundary —
spawned units inherit statuses, not spawn-bound traits — is already the fact
base's §2b/§2c model and is not changed by this ticket.

## 3. Recommended composer model

**Recommendation: (a) inheritance wire with a trigger caveat when the partner is
a screen-clear / AOE carrier.**

### Why (a), not (b) or (c)

- **(b) Hard exclusion is wrong.** The current `SPAWN_EXCLUDED_IDS` contains
  `mosquito-king`, and its comment says the spawn channel does not inherit the
  partner's property. The sources do not support that: the negative Steam
  observation is about the **trigger** (AOE ticks do not spawn), while the
  inheritance evidence (GameRant Virus, the general spawn rule, the in-game
  tooltip mechanism) is positive. A hard exclusion discards a reported true
  effect and repeats the trigger/inheritance conflation.
- **(c) Split handling (wire only for non-screen-clear partners) is also
  wrong.** It treats the inheritance as conditional on the partner's trigger
  profile. But the inheritance is a property of the **spawn channel**: when a
  mosquito spawns, it carries the partner's status regardless of whether the
  partner is single-target or screen-clear. A screen-clear partner still
  produces a true wire; it just produces **fewer spawn events**, because the
  partner's AOE does not feed the trigger. Suppressing the wire for
  screen-clear partners would hide a true effect.
- **(a) keeps both facts.** Emit the inheritance wire, and add a caveat note
  when the partner is screen-clear / AOE explaining that the spawn fires only
  on the fused ball's direct hits, so the partner's AOE does not multiply the
  mosquito count.

### Implementation sketch (research only — no code change in this ticket)

1. **Remove `mosquito-king` from `SPAWN_EXCLUDED_IDS`.** Split the set's two
   meanings:
   - `SPAWN_NO_INHERITANCE_IDS` — genuinely no inheritance (keep
     `voluptuous-egg-sac`; the two-hop drop).
   - a trigger-caveat list — spawn carriers whose trigger does not ride a
     partner's screen hits (`mosquito-king`; Brood Mother is a
     degraded/unreliable case, not a hard exclusion).
2. **Let the existing spawn+status branch fire.** With `mosquito-king` out of
   the exclusion set, `crossWire()` will emit:
   `Spawned balls from Mosquito King have the same properties as <partner>.`
   for a status partner such as Virus. Mark the line as **reported**, not
   observed (the composer's `disputed` flag is for contradicted wires; this is
   a reported wire, so the UI's existing "· reported" treatment is the right
   channel).
3. **Add the trigger caveat note when the partner is screen-clear / AOE.**
   Reuse the existing `rank()` (screen-clear = 2, aoe = 1). Suggested wording:
   > "Mosquito King's spawn is an On-Hit effect: the partner's screen-wide/AOE
   > damage does not trigger it, so the fused ball spawns mosquitoes only from
   > its own direct hits, not per AOE tick (reported; Steam Flash × Mosquito
   > King)."
   The caveat is a **note**, not a `disputed` wire — the inheritance still
   holds.
4. **Do not wire spawn-bound traits.** Keep the status-only `isStatus` branch;
   do not emit the wire for Glacier/Blizzard-style positional effects.
5. **Correct the trigger-matrix reading in the model.** The ticket #6 decision's
   "Spawn: on-hit/on-damage yes" is the target reading; the source reading
   (AOE cannot trigger On-Hit effects) is the one that fits the Balls page and
   the Steam observation. Record the correction in the fact base when the
   decision ticket lands.
6. **Test gates.** Any change must keep `src/corpus.test.ts`,
   `src/corpus-schema.test.ts`, and the `FUSED_STATS` substring gate green. A
   composer/corpus disagreement is a content decision, not a test to relax.

## 4. Claim register for this ticket

| Claim | Evidence | Version | Confidence | Status |
| --- | --- | --- | --- | --- |
| Mosquito King's spawn is an On-Hit effect. | Wiki Mosquito King infobox (rev 4124); wiki Balls (rev 4002). | v1.301 / v1.5 | Reported / mechanism-backed | Current. |
| AOE damage does not trigger On-Hit effects (Spawn). | Wiki Balls "On-Hit only"; wiki Fusion Mechanics matrix (AOE On-Hit NO, source reading); Steam Flash × Mosquito King. | v1.301 / v1.5; unknown | Reported / mechanism-backed | Current; corrects the ticket #6 target reading. |
| Flash × Mosquito King does not spawn a mass of mosquitoes from the AOE ticks. | Steam PHAELANX, 2025-12-30. | unknown | Single-source report | Current; trigger-specific. |
| Mosquitoes spawn on direct contact. | Reddit Abject_Nerve_1052, 2026-04-19; Reddit 2025-11-23 "from the hit." | pre-Naturalist / unknown | Reported (multiple) | Current. |
| Spawned units can inherit the original ball's abilities. | Wiki Fusion Mechanics (rev 4217); wiki Brood Mother (rev 4084); in-game tooltips Egg Sac × Poison, Spider Queen × Vampire Lord. | v1.301 / v1.5; unknown | Reported / tooltip-backed | Current. |
| Mosquito King × Virus carries Virus's disease. | GameRant, 2025-10-26. | unknown | Single-source report | Current but weak; needs a tooltip/controlled test. |
| Mosquitoes can carry status (family-level). | Reddit Abject_Nerve_1052, 2026-04-19 (Mosquito Swarm examples); namu rule 6 (2026-08-26); Bilibili (2025-10-12); gonugame (2026-01-25). | pre-Naturalist / v1.5 / unknown | Reported | Current; supports the Mosquito King inference. |
| Brood Mother's spawn channel does not carry the partner at all. | Fact base §2d; Steam Noobc0re, 2025-10-21 (bug report). | unknown | Single-source report | **Too strong** — contradicted by the current wiki and positive reports; soften to degraded/unreliable. |
| Vampire Lord's bats do not inherit the material's traits. | namu.wiki, 2026-08-26. | v1.5 | Reported | Exception; does not apply to Mosquito King. |
| VES loses the partner property at the second hop. | Multiple reports (corpus). | unknown | Reported (multiple) | Current; keep VES excluded. |

## 5. Open questions / what would upgrade confidence

1. **A direct Mosquito King × Virus tooltip screenshot** (the game's fused
   tooltip should contain "Spawned balls from Mosquito King have the same
   properties as Virus" if the composer is consistent with the Egg Sac /
   Spider Queen tooltips). This is the single highest-value missing artifact.
2. **A controlled test of Mosquito King × Virus and Mosquito King × Flash** —
   count mosquitoes and check whether they apply disease/blind. This would
   separate the trigger from the inheritance directly.
3. **Whether "properties" includes non-status effects** (e.g. Flash's blind,
   Nuke's explosion) or only statuses. The composer currently wires status
   partners only; the family-level mosquito reports include Nuke/Black Hole/
   Hemorrhage/Overgrowth, which are status/effect channels, so the status-only
   wire is the conservative choice.
4. **Brood Mother's real behaviour** — one controlled test with a status
   partner (e.g. Brood Mother × Hemorrhage) to distinguish "degraded but
   present" from "absent."
5. **DLC-era re-run** — *Risen Ballbylon* releases 2026-11-12 with 24 new balls;
   re-check the trigger/inheritance model once DLC observations exist. No
   DLC-era evidence exists at research date.

## 6. Source list

| Source | Date | Version | Used for |
| --- | --- | --- | --- |
| <https://ballxpit.wiki.gg/wiki/Mosquito_King> (rev 4124) | live 2026-11-11 | v1.301 / v1.5 | Infobox: On-Hit Effects Spawn; Status Effect Triggered By On-Hit, Spawn; effect text. |
| <https://ballxpit.wiki.gg/wiki/Balls> (rev 4002) | 2026-09-10 | v1.301 / v1.5 | On-Hit Effects "On-Hit only"; Status Effects triggered by On-Hit, AOE, On-Timer, On-Shoot, Spawn. |
| <https://ballxpit.wiki.gg/wiki/Fusion_Mechanics> (rev 4217) | 2026-09-19 | v1.301 / v1.5 | "Spawned units can inherit the original ball's abilities"; trigger matrix; "Status Effect … cannot trigger other abilities." |
| <https://ballxpit.wiki.gg/wiki/Brood_Mother> (rev 4084) | current | v1.301 / v1.5 | Baby balls inherit the combined ball's effects. |
| <https://steamcommunity.com/app/2062430/discussions/0/693123052112846362/> | 2025-12-30 | unknown | Flash × Mosquito King: AOE ticks do not spawn a mass of mosquitoes. |
| <https://www.reddit.com/r/BALLxPIT/comments/1spmw90/questions_about_evolutions/> | 2026-04-19 | pre-Naturalist | Mosquitoes spawn on direct contact; can carry status. |
| <https://www.reddit.com/r/BALLxPIT/comments/1ojeqxp/does_order_of_fusions_impact_how_it_works/> | 2025-10-29 | unknown | Spawned mosquitoes apply the laser effect (pair ambiguous). |
| <https://www.reddit.com/r/BALLxPIT/comments/1p51lxh/ball_proc_questions/> | 2025-11-23 | unknown | Mosquito King × Mosquito Swarm: "one mosquito from the hit and one from the burst." |
| <https://gamerant.com/ball-x-pit-evolutions-tier-list-best-balls> | 2025-10-26 / 2025-11-30 | unknown | Mosquito King × Virus carries disease; general multiball inheritance rule. |
| <https://namu.moe/w/BALL%20x%20PIT/%EB%B3%BC> | 2026-08-26 | v1.5 | Rule 6 (status + spawn); Vampire Lord bat exception. |
| <https://www.bilibili.com/opus/1082211929042190342> | 2025-10-12 | unknown | Brood Mother babies inherit the other ball's property. |
| <https://gonugame.com/ball-pit-build/> | 2026-01-25 | unknown | Evolution ball + Brood Mother inheritance (hedged). |
| `docs/research/fusion-observations/images.jsonl:2,4` | 2026-02-03 | unknown | In-game tooltips: "Spawned balls from X have the same properties as Y." |
| `docs/research/fusion-observations/steam.jsonl:22` | 2025-10-21 | unknown | Brood Mother × Flash negative bug report. |
| `docs/research/fusion-observations/CONTRADICTIONS.md` | 2026-10-04 | mixed | Existing contradiction register; Mosquito Swarm kill-gating, Vampire Lord exception. |

---

*Research-only artifact. It records the evidence and the recommended composer
model; it does not change `src/fusion.ts`, `docs/research/fusion-mechanics.md`,
the raw corpus, or any generated data file.*
