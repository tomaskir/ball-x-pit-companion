# Risen Ballbylon — level-3 text validation (R9 / #35)

> **Status — landed (2026-11-14).** This is a dated research snapshot. Its
> corrections landed in `docs/research/level-3-effects.md` via T20
> ([#46](https://github.com/tomaskir/ball-x-pit-companion/issues/46)) and the
> 24 DLC rows via T11
> ([#37](https://github.com/tomaskir/ball-x-pit-companion/issues/37)); read
> the landed texts in `src/data/level-3.ts`. The record below is kept for
> provenance.

Researched 2026-11-13 (source-only; no playtest capability). Answers
wayfinder ticket [#35](https://github.com/tomaskir/ball-x-pit-companion/issues/35).
The datamined build is *Risen Ballbylon* (Unity 6000.0.62f1, extracted
2026-11-13); the existing transcription is the wiki's v1.301 pre-DLC per-level
tables (last rebuilt 2026-09-15/17).

## 1. Question and scope

Compare the 90 existing level-3 texts in `docs/research/level-3-effects.md`
against the datamined values in `game-data/extracted/level3-candidates.json`
and `game-data/extracted/extract.json`. Identify **value** differences (not
formatting), decide per entry which source is more trustworthy, and recommend
corrections for T20. The 24 DLC balls are out of scope for T20; their flagged
values are covered in Appendix A because the ticket names Werewolf, Bullet, and
Misfortune.

## 2. Sources

| Source | What it is | Version / date |
|---|---|---|
| `docs/research/level-3-effects.md` | Wiki per-level `{{BallStat}}` transcription, 90 fusable balls | v1.301 / v1.5 Naturalist, pre-DLC; pages rebuilt 2026-09-15/17 |
| `game-data/extracted/level3-candidates.json` | `PropertiesByLvl[2]` rendered through each ball's `desc_template` | *Risen Ballbylon* release build, extracted 2026-11-13 |
| `game-data/extracted/extract.json` | Raw `propertiesByLvl` + `desc_template` + `level1_text` / `level3_text` per ball | same build |
| `game-data/extracted/SUMMARY.md` | Extraction review notes, including the formatting flags | 2026-11-13 |
| Live wiki API (`ballxpit.wiki.gg/api.php`) | Current revision timestamps and wikitext for the two discrepant pages | queried 2026-11-13 |

The wiki pages for the two discrepant balls have a single revision,
2026-09-15T19:34–19:36Z ("Cargo: rebuild from `{{BallData}}` (P3b)") — i.e. the
level tables predate the 2026-11-12 DLC release. The datamined build is the
release build extracted the next day.

## 3. Method

1. Parsed the main table of `level-3-effects.md` (91 rows; 90 fusable + Baby
   Ball, which has no table).
2. Mapped each row to the `level3-candidates.json` key with the same slug rule
   the extraction package used (`Laser (Horizontal)` → `laser-horizontal`,
   apostrophes dropped, non-alphanumerics → `-`). All 90 fusable rows mapped;
   Baby Ball correctly has no candidate.
3. Normalized typography (`×`→`x`, en dash→`-`, `Max`→`max`, slash spacing,
   terminal period) and compared. Rows whose normalized text matched are
   **identical**; rows whose numeric tokens differed are **numeric-diff**; rows
   whose numbers matched but prose differed are **prose-only**.
4. For every numeric-diff row, recovered the raw field from `extract.json`
   (`desc_template` placeholder → property key) and derived the display divisor
   from the 90-ball corpus itself (§4).
5. Cross-checked the two non-divisor discrepancies against the live wiki
   revision history and the site's level-1 catalog.

## 4. Headline

| Class | Count | Meaning |
|---|---:|---|
| Identical after normalization | 66 | No action |
| Numeric difference explained by a display divisor | 19 | Keep the wiki text; the datamined raw value is the same value in game units |
| Prose-only difference (missing `%` in the extract) | 3 | Keep the wiki text; it is more polished |
| **Genuine value discrepancy** | **2** | **Correct the fact base** (Hemorrhage, Vampire Lord) |
| **Total** | **90** | |

The extraction's field mapping is validated by the 88 balls that agree after
applying the divisor rule. The two genuine discrepancies are the only values
that no divisor explains.

## 5. The divisor rule, derived per field

The "flagged tenths values are divided by 10" decision is correct for some
fields and wrong for others. The corpus gives a field-by-field answer; do not
apply a blanket ÷10.

| Field | Raw L3 examples | Wiki display | Divisor |
|---|---|---|---|
| `kFreezeLength` | Blizzard 13, Freeze 80, Freeze Ray 130, Glacier 30, Wraith 18 | 1.3, 8.0, 13.0, 3.0, 1.8 s | **÷10** |
| `kTimeSnareLength` | Time 30, Timestop 60 | 3.0, 6.0 s | **÷10** |
| `kSpawnRate` | Catapult 15, Flesh Mound 6 | 1.5, 0.6 s | **÷10** |
| `kFlickerCycle` | Flicker 12 | 1.2 s | **÷10** |
| `kLightningRodCycleLen` | Lightning Rod 25 | 2.5 s | **÷10** |
| `kPetrifyLen` | Petrify 20 | 2.0 s | **÷10** |
| `kCharmChance` | Charm 50, Incubus 50, Succubus 50 | 5% | **÷10** |
| `kLifeStealChance` | Heart Swallower 700, Soul Sucker 500, Vampire 60 | 70%, 50%, 6% | **÷10** |
| `kDamageMultiplier` | Dark 500 | 5.0x | **÷100** |
| `kBonusDamagePct` | Stone 400, Assassin 50, Drill 100, Erosion 5 | 400%, 50%, 100%, 5% | **÷1** |
| `kReduceDmgPct` | Heart Swallower 40 | 40% | **÷1** |
| `kFreezePct` | Freeze 7 | 7% | **÷1** |
| `kAccelerationPct` | Flesh 40 | 40% | **÷1** |
| `kBaseSpeedPct` | Shotgun 200, Warp 10 | 200%, 10% | **÷1** |
| `kCooldownLength` | Dark 3, Timestop 20 | 3 s, 20 s | **÷1** |
| `kBurnLength` | Burn 5, Brimstone 6, Inferno 10, Sun 8 | 5, 6, 10, 8 s | **÷1** |
| `kLandslideLen` | Landslide 5 | 5 s | **÷1** |
| `kBleedAmt` | Bleed 4, Sacrifice 6, Leech 3 | 4, 6, 3 | **÷1** |
| `kHemorrhagePct` | Hemorrhage 20 | 30% (wiki) | ÷1 — **discrepancy** |

Consequences for the ticket's named flags:

- **Time values** — ÷10 for the fields above. `kBurnLength`, `kCooldownLength`,
  and `kLandslideLen` are whole seconds and must not be divided.
- **Werewolf 300%** — `kLifeStealChance`; ÷10. L1 300 → 30%, L3 400 → 40%.
- **Bullet 1200%** — `kBonusDamagePct`; **÷1**, not ÷10. The display is
  **1200%** (erode 200%, minimum 100%). Precedent: Stone 400 → 400%.
- **Misfortune 600x** — `kDamageMultiplier`; **÷100**, not ÷10. The display is
  **6.0x**. Precedent: Dark 500 → 5.0x.

## 6. Per-ball diff table (the 24 differing entries)

The 66 identical entries are listed in §9. "Fragment" shows only the differing
value; the full texts are in `level-3-effects.md`.

| Ball | Wiki L3 fragment | Datamined raw fragment | Field | Divisor | Display value | Verdict |
|---|---|---|---|---|---|---|
| Blizzard | 1.3 seconds | 13 seconds | `kFreezeLength` | ÷10 | 1.3 s | keep wiki |
| Catapult | 1.5 seconds | 15 seconds | `kSpawnRate` | ÷10 | 1.5 s | keep wiki |
| Charm | 5% | 50 | `kCharmChance` | ÷10 | 5% | keep wiki |
| Dark | 5.0x | 500x | `kDamageMultiplier` | ÷100 | 5.0x | keep wiki |
| Flesh Mound | 0.6 seconds | 6 seconds | `kSpawnRate` | ÷10 | 0.6 s | keep wiki |
| Flicker | 1.2 seconds | 12 seconds | `kFlickerCycle` | ÷10 | 1.2 s | keep wiki |
| Freeze | 8.0 seconds | 80 seconds | `kFreezeLength` | ÷10 | 8.0 s | keep wiki |
| Freeze Ray | 13.0 seconds | 130 seconds | `kFreezeLength` | ÷10 | 13.0 s | keep wiki |
| Glacier | 3.0 seconds | 30 seconds | `kFreezeLength` | ÷10 | 3.0 s | keep wiki |
| Heart Swallower | 70% | 700% | `kLifeStealChance` | ÷10 | 70% | keep wiki |
| **Hemorrhage** | **30%** | **20%** | `kHemorrhagePct` | ÷1 | **20%** | **correct to 20%** |
| Incubus | 5% | 50% | `kCharmChance` | ÷10 | 5% | keep wiki |
| Lightning Rod | 2.5 seconds | 25 seconds | `kLightningRodCycleLen` | ÷10 | 2.5 s | keep wiki |
| Petrify | 2.0 seconds | 20 seconds | `kPetrifyLen` | ÷10 | 2.0 s | keep wiki |
| Soul Sucker | 50% | 500% | `kLifeStealChance` | ÷10 | 50% | keep wiki |
| Succubus | 5% | 50% | `kCharmChance` | ÷10 | 5% | keep wiki |
| Time | 3.0 seconds | 30 seconds | `kTimeSnareLength` | ÷10 | 3.0 s | keep wiki |
| Timestop | 6.0 seconds | 60 seconds | `kTimeSnareLength` | ÷10 | 6.0 s | keep wiki |
| Vampire | 6% | 60% | `kLifeStealChance` | ÷10 | 6% | keep wiki |
| **Vampire Lord** | **3 stacks** | **4 stacks** | `kBleedAmt` | ÷1 | **4 stacks** | **correct to 4** |
| Wraith | 1.8 seconds | 18 seconds | `kFreezeLength` | ÷10 | 1.8 s | keep wiki |
| Flesh | 40% | 40 | `kAccelerationPct` | ÷1 | 40% | keep wiki (`%` sign) |
| Shotgun | 200% | 200 | `kBaseSpeedPct` | ÷1 | 200% | keep wiki (`%` sign) |
| Warp | 10% | 10 | `kBaseSpeedPct` | ÷1 | 10% | keep wiki (`%` sign) |

## 7. Recommended corrections for T20 (#46)

### 7.1 Hemorrhage — 30% → 20%

Current fact-base row:

> Inflicts 4 stacks of bleed. When hitting an enemy with 12 stacks of bleed or
> more, consumes all stacks of bleed to deal **30%** of their current health.

Datamined L3 (`kHemorrhagePct = 20`):

> Inflicts 4 stacks of bleed. When hitting an enemy with 12 stacks of bleed or
> more, consumes all stacks of bleed to deal **20%** of their current health.

Evidence and confidence:

- The field is a plain percentage (`÷1`); no divisor explains the gap.
- The live wiki page is a single 2026-09-15 revision (pre-DLC) and says
  20/20/30 in both the per-level table and the combined description. The
  datamined build is the 2026-11-12 release build and says 15/15/20. The most
  likely explanation is a DLC rebalance; a wiki transcription error cannot be
  ruled out, but either way the datamined build is the current game value.
- **Confidence: medium-high.** Direct asset value, post-DLC build, field mapping
  validated on 88 other balls.
- **Out of T20 scope but worth flagging:** the site's level-1 catalog
  (`src/data/balls.ts`, from `game-mechanics.md`) says 20%, while the datamined
  L1 is 15%. A fully consistent refresh would update the L1 catalog too; T20 is
  L3-only, so leave it and note it for the next catalog refresh.

### 7.2 Vampire Lord — 3 stacks → 4 stacks

Current fact-base row:

> Each hit inflicts **3 stacks** of bleed. Heals 1 health and consumes all
> stacks when hitting an enemy with at least 9 stacks of bleed.

Datamined L3 (`kBleedAmt = 4`):

> Each hit inflicts **4 stacks** of bleed. Heals 1 health and consumes all
> stacks when hitting an enemy with at least 9 stacks of bleed.

Evidence and confidence:

- `kBleedAmt` is a plain count (`÷1`): Bleed raw 4 → wiki 4, Sacrifice 6 → 6,
  Leech 3 → 3.
- The wiki page is a single 2026-09-15 revision and says 3/3/3 stacks with a
  combined description of "3 stacks" (no progression). The datamined build says
  3/4/4. The threshold (10/10/9) agrees between both sources; only the stack
  count differs.
- **Confidence: medium-high.** Same reasoning as Hemorrhage. The threshold note
  in `level-3-effects.md` §2 ("10 → 9") stays correct.

### 7.3 Everything else — no change

Keep the wiki text for all 22 other differing entries. The 19 divisor cases
already carry the correct display value; the 3 prose-only cases are more
polished in the wiki (the extract omits the `%` sign). The 66 identical entries
need no action.

### 7.4 Regeneration

After the two edits, run the two-stage pipeline from the repo root:

```sh
node --experimental-strip-types scripts/parse-wiki.ts
node --experimental-strip-types scripts/emit-data.ts
npm test
```

`src/data.test.ts` pins coverage (90 entries), not the exact strings, so the two
edits do not require test changes. `src/fusion.test.ts` reads Vampire Lord's
threshold (9), not its stack count, and Hemorrhage's role as a damage-riding
ball, not its percentage — both unaffected.

## 8. Which source wins, per class

- **Identical (66):** either; no action.
- **Divisor cases (19):** the wiki is more polished and already shows the
  correct display value. The datamined raw value is the same value in game
  units. **Keep the wiki.**
- **Prose-only cases (3: Flesh, Shotgun, Warp):** the extract drops the `%`
  sign; the wiki is more polished and semantically complete. **Keep the wiki.**
- **Genuine discrepancies (2: Hemorrhage, Vampire Lord):** the datamined build
  is the current game value (post-DLC, direct asset) and the wiki level tables
  are pre-DLC. **Take the datamined value.**

## 9. The 66 identical entries

Armageddon, Assassin, Banished Flame, Banshee, Berserk, Black Hole, Bleed, Bomb,
Brimstone, Brood Mother, Burn, Cell, Drill, Earthquake, Egg Sac, Elemental,
Erosion, Fireworks, Flash, Frozen Flame, Ghost, Holy Laser, Inferno, Iron,
Landslide, Laser (Horizontal), Laser (Vertical), Laser Beam, Laser Cutter,
Leech, Light, Lightning, Lightning Bug, Lovestruck, Maggot, Magma, Mosquito
King, Mosquito Kingdom, Mosquito Swarm, Nosferatu, Noxious, Nuclear Bomb,
Offspring, Overgrowth, Phantom, Poison, Radiation Beam, Reaper, Sacrifice,
Sandstorm, Satan, Sniper, Spider Queen, Steel, Stone, Storm, Sun, Swamp, Time
Bomb, Tumor, Venom, Virus, Voluptuous Egg Sac, Wind, X Ray, Zombie.

## Appendix A — DLC-ball flagged values (for T11 / #37, not T20)

These are outside T20's 90-entry scope but the ticket names Werewolf, Bullet,
and Misfortune. The same field-divisor table applies.

| Ball | Raw L3 | Field | Rule | Display | Note |
|---|---|---|---|---|---|
| Werewolf | 400 | `kLifeStealChance` | ÷10 | **40%** | L1 300 → 30%. Confirmed by Heart Swallower 700 → 70%. |
| Bullet | 1200 | `kBonusDamagePct` | ÷1 | **1200%** | **Not ÷10.** Stone 400 → 400% precedent. Erode 200%, minimum 100% unchanged. |
| Misfortune | 600 | `kDamageMultiplier` | ÷100 | **6.0x** | **Not ÷10.** Dark 500 → 5.0x precedent. |
| Siren | 75 | `kCharmChance` | ÷10 | **7.5%** | **Flag:** the extraction's rendered text says 75%; `kCharmChance` is tenths (Charm/Incubus/Succubus 50 → 5%). 7.5% is also the plausible balance point (Charm is 5%). Needs T11 review. |
| Ash | 50 / 60 / 8 | `kEmissionLength` / `kSteamLifetime` / `kBurnLength` | ÷10 / ÷10 / ÷1 | 5.0 s / 6.0 s / 8 s | `kBurnLength` is whole seconds (Burn 5 → 5 s). The template omits the unit for `kEmissionLength` ("for the first 50"), so 5.0 s vs 50% is unresolved; SUMMARY flags the unit as unclear. |
| Steam | 60 / 80 | `kEmissionLength` / `kSteamLifetime` | ÷10 | 6.0 s / 8.0 s | No existing precedent for these two fields; the ÷10 reading is the SUMMARY's magnitude argument (80 s would be implausible for a trail). **Medium confidence.** |
| Waterfall | 80 | `kDuration` | ÷10 | 8.0 s | Same caveat as Steam; no field precedent. **Medium confidence.** |
| Mudslide | 5 | `kLandslideLen` | ÷1 | 5 s | Landslide 5 → 5 s precedent. |

The extraction's `level3-candidates.json` is raw template substitution, so every
value in Appendix A needs the rule applied before it can be onboarded. The
`_tenth` placeholder branch in `.scratch/extract_final.py` is dead code — no
ball template uses a `_tenth` placeholder — which is why the candidates file
contains raw tenths values.

## Appendix B — confidence and open questions

| Claim | Confidence | Basis |
|---|---|---|
| 66 identical, 19 divisor, 3 prose-only, 2 genuine | High | Exhaustive normalized diff of all 90 rows |
| Divisor table per field | High | 88-ball cross-check; each ÷10/÷100/÷1 rule has multiple witnesses |
| Hemorrhage L3 = 20% | Medium-high | Direct post-DLC asset value; wiki pre-DLC; no divisor explains the gap |
| Vampire Lord L3 = 4 stacks | Medium-high | Same; threshold agrees, stack count does not |
| Werewolf L3 = 40% | High | `kLifeStealChance` ÷10, three witnesses |
| Bullet = 1200%, Misfortune = 6.0x | High | Field precedents (Stone, Dark) |
| Siren = 7.5% | Medium | Field precedent is strong; no DLC tooltip to confirm |
| Ash/Steam/Waterfall time ÷10 | Medium | No field precedent; magnitude argument from SUMMARY |
| Ash `kEmissionLength` unit | Low | Template omits the unit; 5.0 s vs 50% unresolved |

Open questions that need the game or a post-DLC wiki update:

1. Confirm the DLC rebalance of Hemorrhage (20/20/30 → 15/15/20) and Vampire
   Lord (3/3/3 → 3/4/4) against an in-game tooltip or a post-DLC wiki revision.
2. Confirm Siren's charm chance (7.5% vs 75%).
3. Confirm the Ash/Steam/Waterfall time units and Ash's `kEmissionLength` unit.

## Sources

- `docs/research/level-3-effects.md` (the 90 existing entries).
- `game-data/extracted/level3-candidates.json` (rendered L3 text, 114 keys).
- `game-data/extracted/extract.json` (`desc_template`, `propertiesByLvl`,
  `level1_text`, `level3_text`).
- `game-data/extracted/SUMMARY.md` §"Formatting flags (human pass needed)".
- Live wiki API, queried 2026-11-13:
  - `action=cargoquery&tables=BallStatsByLevel&fields=_pageName,level,damage,effect&where=_pageName IN ("Hemorrhage","Vampire Lord")`
  - `action=query&prop=revisions&rvprop=content|timestamp|comment&titles=Hemorrhage|Vampire Lord`
- Site catalog: `src/data/balls.ts` (L1 effects), `src/data/level-3.ts`
  (generated L3 overlay), `src/data.test.ts` (coverage pins).
