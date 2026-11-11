# Effect-text currency — fusion-relevant balls (Nov 2026)

Research for wayfinder ticket
[#3](https://github.com/tomaskir/ball-x-pit-companion/issues/3):
establish the current game version and re-verify the catalog effect text for
the balls implicated in fusion-order / fusion-composition claims.

**Researched:** 2026-11-11 (source-only; no playtest capability).
**Catalog under audit:** `src/data/balls.ts` / `docs/research/game-mechanics.md`,
tagged "2026-09-13, game v1.301".

---

## 1. Current game version

| Fact | Value | Source |
|---|---|---|
| Current game version | **v1.301** | Store listing "version 1.301, updated 2026-07-29" ([appworthy mirror](https://appworthy.org/app/ball-x-pit)); NXBrew update list "BALL x PIT [v1.301]" (2026-09-21, [nxbrew.net](https://nxbrew.net/latest-updates-11-new-updates-added)) |
| Current content update | **The Naturalist Update**, 2026-08-06 — the final free update | [Game Updates](https://ballxpit.wiki.gg/wiki/Game_Updates); [Devolver/Steam news](https://store.steampowered.com/news/group/6638525/view/675128454624051532) |
| Next content | **Risen Ballbylon** paid DLC, release **2026-11-12** (the day after this research) | [Steam DLC page](https://store.steampowered.com/app/4008250); [Gematsu](https://gematsu.com/2026/09/ball-x-pit-expansion-risen-ballbylon-announced) |

**Conclusion:** the catalog's `v1.301` tag is correct and still current at
research time. The DLC is not yet live, so no DLC-era effect text exists to
verify. The wiki's "1.1–1.5" headings on the Game Updates page are MediaWiki
section numbers, **not** game versions. Re-verify after 2026-11-12: the DLC
adds 24 balls and may rebalance existing ones.

---

## 2. Root cause of the discrepancy

The catalog was parsed from the wiki's **Balls overview table**, which carries
one description per ball. That description is the **level-1** text. The
individual wiki ball pages were restructured on **2026-09-15** — two days after
the catalog fetch — to add a per-level table (levels 1/2/3); e.g. the
[Sun revision history](https://ballxpit.wiki.gg/wiki/Sun?action=history)
(`Cargo: rebuild from {{BallData}} (P3b)`, Coolshell, 2026-09-15T19:36:20Z).

This matters because **fusion requires both components at level 3**, and the
game's fused tooltips use the **level-3** component text. The repo already
encodes that fact: `FUSED_STATS` in `src/fusion.ts` overrides the catalog's
level-1 strings with level-3 values (Egg Sac `2–4` → `3–5`; Voluptuous Egg Sac
`2–3` → `3–4`; Poison `max 5 / 6 s / 1–4` → `max 8 / 9 s / X`), and
`docs/research/fusion-observations/fusion-pairs.json` cites a
**"game-file I2 effect-text dump"** for the cooldown class and uses level-3
cooldowns in its worked example (Black Hole × Timestop = 5 s / 20 s, not the
catalog's 7 s / 30 s).

So the catalog is not merely "old": it is **level-1-only**, while the fusion
model needs level-3 values. Two entries are outright wrong even at level 1
(Time, Brimstone).

---

## 3. Diff table — catalog vs current level 1 (same level)

All values below are from the current individual wiki pages, which are the
per-level tables rebuilt 2026-09-15/17 from the wiki's `{{BallData}}` records.
"Current L1" is the level-1 value, i.e. the direct comparison to the catalog.

| Ball | Catalog (v1.301, L1) | Current L1 (v1.301) | Diff | Source |
|---|---|---|---|---|
| Sun | max 5 stacks; burn 6 s; 6–12 dmg/stack/s | max 5 stacks; burn 6 s; 6–12 dmg/stack/s | none | [Sun](https://ballxpit.wiki.gg/wiki/Sun) |
| Banished Flame | max 6 stacks; darkflame 1–30; pop 1–100 | max 6 stacks; darkflame 1–30; pop 1–100 | none | [Banished Flame](https://ballxpit.wiki.gg/wiki/Banished_Flame) |
| Egg Sac | 2–4 baby balls; 3 s cooldown | 2–4 baby balls; 3 s cooldown | none | [Egg Sac](https://ballxpit.wiki.gg/wiki/Egg_Sac) |
| Timestop | freeze 5.0 s; 30 s cooldown | freeze 5.0 s; 30 s cooldown | none | [Timestop](https://ballxpit.wiki.gg/wiki/Timestop) |
| Erosion | 3% current HP | 3% current HP | none | [Erosion](https://ballxpit.wiki.gg/wiki/Erosion) |
| Stone | 300% initial; erode 40%; min 50% | 300% initial; erode 40%; min 50% | none | [Stone](https://ballxpit.wiki.gg/wiki/Stone) |
| Drill | 50% bonus | 50% bonus | none | [Drill](https://ballxpit.wiki.gg/wiki/Drill) |
| Assassin | 30% backstab | 30% backstab | none | [Assassin](https://ballxpit.wiki.gg/wiki/Assassin) |
| Steel | +10%/hit; max 300% | +10%/hit; max 300% | none | [Steel](https://ballxpit.wiki.gg/wiki/Steel) |
| Freeze Ray | 20–50; 10% freeze; 10.0 s | 20–50; 10% freeze; 10.0 s | none | [Freeze Ray](https://ballxpit.wiki.gg/wiki/Freeze_Ray) |
| Blizzard | 0.8 s freeze; 1–50 | 0.8 s freeze; 1–50 | none | [Blizzard](https://ballxpit.wiki.gg/wiki/Blizzard) |
| Noxious | 3 poison stacks; 4 s; 1–3 | 3 poison stacks; 4 s; 1–3 | none | [Noxious](https://ballxpit.wiki.gg/wiki/Noxious) |
| **Brimstone** | "…(max 4 stacks)." — **no damage clause** | "…(max 4 stacks). Burn deals 1–4 dmg/stack/s and poison deals 2–3 dmg/stack/s." | **catalog truncated** | [Brimstone](https://ballxpit.wiki.gg/wiki/Brimstone); [Balls overview](https://ballxpit.wiki.gg/wiki/Balls) |
| **Time** | snare stays **20 seconds** | snare stays **2.0 seconds** | **wrong (10×)** | [Time](https://ballxpit.wiki.gg/wiki/Time); gameplay: [Shadow Update video, 2026-04-27](https://youtube.com/watch?v=Sn2UvPM4TXU) ("2 seconds"); [FuxoLogy, 2026-08-07](https://fuxology.com/how-to-get-all-ball-x-pit-evolutions) ("2.0 seconds") |
| Banshee | 150–300 after 6 hits | 150–300 after 6 hits | none | [Banshee](https://ballxpit.wiki.gg/wiki/Banshee) |
| Frozen Flame | 20 s; max 4; 8–12; +25% | 20 s; max 4; 8–12; +25% | none | [Frozen Flame](https://ballxpit.wiki.gg/wiki/Frozen_Flame) |

**Direct level-1 defects: 2** — Time (20 s → 2.0 s) and Brimstone (missing
burn/poison damage clause). The Time error originates in the wiki's Balls
overview table, which still says "20 seconds" while its own Time page says
2.0 s; the gameplay video and FuxoLogy corroborate 2.0 s. The Brimstone
truncation is a transcription loss in `game-mechanics.md` (the Balls overview
page has the full clause).

---

## 4. Level-2/3 values — the fusion-relevant diff

Fusion consumes level-3 balls, so these are the values the fused tooltip and
the site's fusion model should reflect. Catalog values are the level-1 column
above.

### 4.1 Named balls

| Ball | Current L2 | Current L3 | Catalog understates at L3 |
|---|---|---|---|
| Sun | max 5; 8 s; 6–12 | max 5; 8 s; **9–15** | duration 6→8 s; dmg 6–12→9–15 |
| Banished Flame | max 6; 1–35 | **max 8**; **1–35** | stacks 6→8; dmg 1–30→1–35 |
| Egg Sac | 2–5 baby balls | **3–5** baby balls | count 2–4→3–5 (cooldown 3 s unchanged) |
| Timestop | freeze 5.0 s; **20 s** cd | freeze **6.0 s**; **20 s** cd | freeze 5→6 s; cooldown 30→20 s |
| Erosion | 4% current HP | **5%** current HP | 3→5% |
| Stone | 350%; erode 35% | **400%**; erode **30%** | 300→400%; 40→30% |
| Drill | 75% bonus | **100%** bonus | 50→100% |
| Assassin | 40% backstab | **50%** backstab | 30→50% |
| Steel | 15%/hit; max 300% | 15%/hit; **max 400%** | 10→15%; 300→400% |
| Freeze Ray | 25–65; 10.0 s | 25–65; **13.0 s** | 20–50→25–65; 10→13 s |
| Blizzard | 1.3 s; 1–50 | 1.3 s; **1–70** | 0.8→1.3 s; 1–50→1–70 |
| Noxious | 4 s; 2–5 | **6 s**; 2–5 | 4→6 s; 1–3→2–5 |
| Brimstone | burn 1–7; poison 2–3 | burn 1–7; **poison 3–5** | catalog has no damage clause at all |
| Time | 2.5 s | **3.0 s** | 20 s→3.0 s |
| Banshee | 200–350 | **250–400** | 150–300→250–400 |
| Frozen Flame | 20 s; max 4; 10–16 | **30 s**; **max 5**; 10–16 | 20→30 s; 4→5 stacks; 8–12→10–16 |

### 4.2 Additional cooldown-class balls (the audit surfaced these)

The fusion corpus defines the cooldown class as 7 balls: Black Hole, Bomb,
Dark, Egg Sac, Voluptuous Egg Sac, Nuclear Bomb, Timestop
(`fusion-pairs.json`, "cooldown-first-wins"). Egg Sac and Timestop are above;
the other five:

| Ball | Catalog (L1) | Current L2 | Current L3 | Diff at L3 |
|---|---|---|---|---|
| Dark | 3.0× damage; 3 s cd | 4.0×; 3 s | **5.0×**; 3 s | multiplier 3.0→5.0 |
| Black Hole | 7 s cooldown | 6 s | **5 s** | cooldown 7→5 s |
| Bomb | 150–300; 3 s cd | 200–400; 3 s | 200–400; 3 s | damage 150–300→200–400 |
| Nuclear Bomb | 300–500; +10%; 3 s cd | 400–700; +10% | 400–700; **+15%** | damage 300–500→400–700; amp 10→15% |
| Voluptuous Egg Sac | 2–3 egg sacs; 3 s cd | 2–4 | **3–4** | count 2–3→3–4 |

Sources: [Dark](https://ballxpit.wiki.gg/wiki/Dark),
[Black Hole](https://ballxpit.wiki.gg/wiki/Black_Hole),
[Bomb](https://ballxpit.wiki.gg/wiki/Bomb),
[Nuclear Bomb](https://ballxpit.wiki.gg/wiki/Nuclear_Bomb),
[Voluptuous Egg Sac](https://ballxpit.wiki.gg/wiki/Voluptuous_Egg_Sac).

### 4.3 Base balls that feed the named balls (spot-check)

Every base ball checked is also level-1-only. Fusion-relevant L3 values:

| Ball | Catalog (L1) | Current L3 | Diff at L3 |
|---|---|---|---|
| Burn | 3 s; max 3; 4–8 | **5 s; max 5; 7–11** | all three scale |
| Poison | max 5; 6 s; 1–4 | **max 8; 9 s; 2–5** | all three scale |
| Freeze | 4%; 5.0 s | **7%; 8.0 s** | chance and duration |
| Light | 3 s blind | **7 s** | duration |
| Wind | 30%; 5 s | **45%; 8 s** | slow and duration |
| Iron | 40% slower | **30% slower** | speed penalty |
| Earthquake | 5–13; 3×3 | **9–17; 4×4** | damage and area |
| Phantom | 100–200 | **200–300** | damage |
| Wraith | 0.8 s | **1.8 s** | freeze duration |
| Laser (H/V) | 9–18 | **13–34** | damage |

Sources: the individual wiki pages for each ball (same `{{BallData}}`
level tables).

---

## 5. Stale balls

### 5.1 Wrong at level 1 — fix regardless of the level-model decision

1. **Time** — catalog says the snare stays 20 s; current L1 is **2.0 s**
   (L2 2.5 s, L3 3.0 s). The 20 s figure is a typo in the wiki's Balls
   overview table, corroborated as 2 s by an April 2026 gameplay video and an
   August 2026 guide.
2. **Brimstone** — catalog drops the burn/poison damage clause entirely;
   current L1 is "Burn deals 1–4 dmg/stack/s and poison deals 2–3
   dmg/stack/s" (L2 burn 1–7; L3 poison 3–5).

### 5.2 Level-1-only — stale for fusion (level 3)

Every ball in the ticket's list has level-2/3 scaling, so its single catalog
string is stale for fusion:

**Sun, Banished Flame, Egg Sac, Timestop, Erosion, Stone, Drill, Assassin,
Steel, Freeze Ray, Blizzard, Noxious, Brimstone, Time, Banshee, Frozen
Flame.**

Plus the cooldown class the audit surfaced — **Dark, Black Hole, Bomb,
Nuclear Bomb, Voluptuous Egg Sac** — and the base components **Burn, Poison,
Freeze, Light, Wind, Iron, Earthquake, Phantom, Wraith, Laser (Horizontal),
Laser (Vertical)**.

The ticket's four "known discrepancies" resolve as follows:

| Claim | Resolution |
|---|---|
| Sun: catalog 5 stacks / 6 s; Reddit 5 stacks / 8 s | Both right at different levels. L1 = 6 s; L2/L3 = 8 s. Reddit's value is L2/3. |
| Banished Flame: catalog max 6 / 2 s; Reddit max 8 / 2 s | Both right at different levels. L1/L2 = max 6; L3 = max 8. Reddit's value is L3. |
| Timestop: catalog 30 s; Reddit 30 s | No discrepancy at L1 — both 30 s. At L3 (fusion-relevant) it is **20 s**. |
| Egg Sac: catalog 3 s cooldown | Correct at all levels. The level scaling is the baby-ball count (2–4 / 2–5 / 3–5), not the cooldown. |

---

## 6. Impact on the fusion model

- `docs/research/fusion-mechanics.md` §3's worked example — "Black Hole ×
  Timestop fires every 5 s one way, every 20 s the other" — is **already
  level-3-correct** (Black Hole L3 = 5 s, Timestop L3 = 20 s). The catalog's
  7 s / 30 s are level-1 values and must not be used to "correct" it.
- `src/fusion.ts`'s `FUSED_STATS` overrides are level-3 corrections of the
  level-1 catalog text (Egg Sac 3–5, Voluptuous Egg Sac 3–4, Poison max 8 /
  9 s). If the catalog is migrated to level-3 text, those overrides become
  no-ops and the `data.test.ts` substring pin must be updated with them.
- The "Noxious × Poison (max stacks)" same-property claim depends on Poison's
  **L3 max 8**, not the catalog's max 5.
- No fusion-order claim in the corpus is contradicted by the current values;
  the only functional corrections are numeric (cooldowns/durations), not
  order rules.

---

## 7. Evidence quality and limitations

- **No playtest / game-file access.** The strongest accessible source is the
  wiki's per-level `{{BallData}}` tables (community-maintained, rebuilt
  2026-09-15/17). They are not first-party. The repo's fusion corpus cites a
  "game-file I2 effect-text dump" for the cooldown class and level-3 worked
  example, which independently corroborates the level-3 cooldown values.
- **Cross-checks used:** Reddit "Missing Evolutions Series #008: Ghost"
  (2025-12-28) lists level-scaled values (Wraith 0.8/1.3/1.8 s; Assassin
  30/40/50%); a Dec 2025 tier list cites "Sun level 1: 6–12 … max 5 stacks";
  the April 2026 Shadow Update gameplay video and an August 2026 guide both
  give Time's snare as 2 s.
- **DLC caveat:** Risen Ballbylon releases 2026-11-12, one day after this
  research. It adds 24 balls and may rebalance existing ones. Re-run this
  audit against the post-DLC build before treating any value as final.
- Damage-number derivation is out of scope; this note records tooltip text
  only.

---

## 8. Sources

- Wiki: [Balls overview](https://ballxpit.wiki.gg/wiki/Balls) (the catalog's
  parse source) and the individual ball pages linked above.
- Wiki: [Game Updates](https://ballxpit.wiki.gg/wiki/Game_Updates) (Naturalist
  = final free update, 2026-08-06; Risen Ballbylon planned 2026-11-12).
- Steam: [BALL x PIT](https://store.steampowered.com/app/2062430/BALL_x_PIT),
  [Risen Ballbylon DLC](https://store.steampowered.com/app/4008250).
- Version 1.301: [appworthy listing](https://appworthy.org/app/ball-x-pit),
  [NXBrew update list](https://nxbrew.net/latest-updates-11-new-updates-added).
- Repo: `docs/research/game-mechanics.md`,
  `docs/research/fusion-mechanics.md`,
  `docs/research/fusion-observations/fusion-pairs.json`, `src/fusion.ts`.
