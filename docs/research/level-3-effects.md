# Level-3 effect text — all 91 balls

Research for wayfinder ticket
[#22](https://github.com/tomaskir/ball-x-pit-companion/issues/22):
transcribe the level-3 effect text for every ball in the catalog, ready for the
parser wiring in #13.

**Researched:** 2026-11-11 (source-only; no playtest capability). All effect
text below is **reported** from the wiki's per-level tables; it is not
playtest-verified.
**Version tag:** v1.301 / v1.5 (Naturalist update), pre-DLC. *Risen Ballbylon*
releases 2026-11-12; re-verify after.

**Primary source:** each ball's individual page on <https://ballxpit.wiki.gg>,
specifically the per-level `{{BallData}}` table rendered from `{{BallStat}}`
calls (e.g. <https://ballxpit.wiki.gg/wiki/Sun>). The wiki's `BallStatsByLevel`
Cargo table stores exactly those `{{BallStat}}` rows; both were queried through
the MediaWiki API on 2026-11-11 and agree for all 90 balls that have a table.
The pages were rebuilt from `{{BallData}}` on 2026-09-15/17; the six later
edits (Berserk, Erosion, Glacier, Iron, Nuclear Bomb, Stone) touch only
Strategies/Trivia, not the level tables.

**Method:** `action=cargoquery&tables=BallStatsByLevel` for all 270 rows
(90 balls × 3 levels), cross-checked row-for-row against the `{{BallStat|3|…}}`
call in each page's wikitext. 90/90 level-3 rows matched. Baby Ball has no
`{{BallStat}}` table (it is the non-fusable base attack ball).

**Wording conventions:** effect text is verbatim from the per-level table,
normalized to the same typography as `docs/research/game-mechanics.md`: numeric
ranges use an en dash (`4–6`), `Max` becomes `max`, ` / ` becomes `/`, and a
terminal period is added. Grammar is left as the wiki has it (e.g. "Emit",
"Damage", "cause"); see §2 for the quirks this exposes.

**Coverage:** 91 balls listed. 90 have a level-3 table; 88 of those differ from
level 1; 2 have no L3 diff (Elemental, Ghost); 1 has no table (Baby Ball).

## Table

| Ball | Level-3 effect text | Notes |
|---|---|---|
| Armageddon | Creates a meteor shower upon hitting an enemy. The meteor shower lasts for 5 seconds and deals 50–70 damage/second to enemies within a 3 tile radius. | — |
| Assassin | Passes through the front of enemies, but not the back. Backstabs deal 50% bonus damage. | — |
| Baby Ball | — | No table — not fusable (base attack ball). |
| Banished Flame | Add 1 stack of darkflame on hit for 2 seconds (max 8 stacks). Darkflame deals 1–35 damage per stack per second. When the darkflame goes out, it deals 1–100 to the enemy. | — |
| Banshee | Curses all enemies while on the field when launched. Cursed enemies are dealt 250–400 after being hit 6 times. | — |
| Berserk | Each hit has a 40% chance of causing enemies to go berserk for 9 seconds. Berserk enemies deal 23–32 damage to adjacent enemies every second. | — |
| Black Hole | Instantly kills the first non-boss enemy that it hits, but destroys itself afterwards. Has a 5 second cooldown before it can be shot again. | — |
| Bleed | Inflicts 4 stacks of bleed. Bleeding enemies receive 1 damage per stack when hit by a ball (max 14 stacks). | — |
| Blizzard | Freezes all enemies within a 2 tile radius for 1.3 seconds, dealing 1–70 damage. | — |
| Bomb | Explodes when hitting an enemy, dealing 200–400 damage to nearby enemies. Has a 3 second cooldown before it can be shot again. | L2 = L3 (no further L3 change). |
| Brimstone | Applies 1 stack of burn and poison every second to all enemies within a 2 tile radius (max 4 stacks). Burn deals 1–7 damage per stack per second and poison deals 3–5 damage per stack per second. | Full damage clause; the fact-base truncation was fixed 2026-11-11. |
| Brood Mother | Has a 45% chance of birthing a baby ball each time it hits an enemy. | — |
| Burn | Add 1 stack of burn on hit for 5 seconds (max 5 stacks). Burnt units are dealt 7–11 damage per stack per second. | — |
| Catapult | Launches 4–6 stone baby balls every 1.5 seconds, which are destroyed after hitting anything. | — |
| Cell | Splits into a clone on hit 4 times. | — |
| Charm | Each hit has a 5% chance of charming the enemy for 7 seconds. Charmed units walk up the board and attack enemies. | — |
| Dark | Deals 5.0x damage but destroys itself after hitting an enemy. Has a 3 second cooldown before it can be shot again. | — |
| Drill | Pierces enemies and deals 100% bonus damage until reaching the back of the field. | — |
| Earthquake | Deals 9–17 damage to nearby units in a 4x4 tile square. | — |
| Egg Sac | Explodes into 3–5 baby balls on hitting an enemy. Has a 3 second cooldown before it can be shot again. | — |
| Elemental | Applies a random status effect (burn, slow, or freeze) to nearby enemies on hit. | No L3 diff. |
| Erosion | Passes through enemies. Deals 5% of enemy's current health as bonus damage on hit. | — |
| Fireworks | Explodes into 4–8 fireworks. Fireworks target random enemies, dealing 20–30 damage and applying 1 stack of burn. Burnt units are dealt 10–14 damage per stack per second. | — |
| Flash | Damage all enemies on screen for 2–4 damage after hitting an enemy and blind them for 3 seconds. | Wiki: 'Damage' (imperative). |
| Flesh | Speed increases by 40% per bounce. | — |
| Flesh Mound | Emits a fleshy baby ball in a random direction every 0.6 seconds. | — |
| Flicker | Deals 2–10 damage to every enemy on screen every 1.2 seconds. | — |
| Freeze | Has a 7% chance to freeze enemies for 8.0 seconds. Frozen enemies receive 25% more damage. | — |
| Freeze Ray | Emits a freeze ray when hitting an enemy, dealing 25–65 to all enemies in its path, with a 10% chance of freezing them for 13.0 seconds. | — |
| Frozen Flame | Add 1 stack of frostburn on hit for 30 seconds (max 5 stacks). Frostburnt units are dealt 10–16 damage per stack per second and receive 25% more damage from other sources. | — |
| Ghost | Passes through enemies. | No L3 diff. |
| Glacier | Releases glacial spikes over time that deal 25–40 to enemies that touch them and freeze them for 3.0 seconds. This ball and its glacial spikes also deal 6–12 damage to nearby units. | — |
| Heart Swallower | Saps enemies on hit, with a 70% chance of stealing 1 health and reducing their attack damage by 40%. Lifesteal chance only applies once per enemy. | — |
| Hemorrhage | Inflicts 4 stacks of bleed. When hitting an enemy with 12 stacks of bleed or more, consumes all stacks of bleed to deal 30% of their current health. | — |
| Holy Laser | Deals 30–60 damage to all enemies in the same row and column. | — |
| Incubus | Each hit has a 5% chance of charming the enemy for 9 seconds. Charmed enemies curse nearby enemies. Cursed enemies are dealt 150–250 after being hit 5 times. | — |
| Inferno | Applies 1 stack of burn every second to all enemies within a 2 tile radius. Burn lasts for 10 seconds, dealing 6–10 damage per stack per second. | — |
| Iron | Deals double damage but moves 30% slower. | — |
| Landslide | Creates a landslide and destroys self upon hitting an enemy. The landslide lasts for 5 seconds and deals 30–40 damage/second to enemies within a 2 tile radius. | Wiki says 'damage / second'. |
| Laser (Horizontal) | Deals 13–34 damage to all enemies in the same row. | — |
| Laser (Vertical) | Deals 13–34 damage to all enemies in the same column. | — |
| Laser Beam | Emit a laser beam on hit that deals 46–66 damage and blinds enemies for 8 seconds. | Wiki: 'Emit'. |
| Laser Cutter | Constantly emits a laser in front of it, which deals 140–210 per second. | Wiki omits 'damage' after the range. |
| Leech | Attaches up to 1 leech onto enemies it hits, which adds 3 stacks of bleed per second (max 48 stacks). | — |
| Light | Blinds enemies on hit for 7 seconds. Blinded units have a hard time detecting you and have a 50% chance of missing when they attack. | — |
| Lightning | Deals 1–30 damage to up to 5 nearby enemies. | — |
| Lightning Bug | Spawns a lightning bug each time it hits an enemy. Lightning bugs attack a random enemy, dealing 1–100 damage to up to 4 nearby enemies. | — |
| Lightning Rod | Plants a lightning rod into enemies it hits. These enemies are struck by lightning every 2.5 seconds, dealing 1–40 damage to up to 8 nearby enemies. | — |
| Lovestruck | Inflicts lovestruck on hit enemies for 30 seconds. Lovestruck units have a 50% chance of healing you for 8 health when they attack. | — |
| Maggot | Infest enemies on hit with maggots. When they die, they explode into 2–3 baby balls. | Wiki: 'Infest' (imperative). |
| Magma | Emits lava blobs over time. Enemies who walk into lava blobs are dealt 20–35 damage and gain 1 stack of burn (max 3 stacks). Burn lasts for 3 seconds, dealing 5–10 damage per stack per second. This ball and its lava blobs also deal 6–12 damage to nearby units. | — |
| Mosquito King | Spawns a mosquito each time it hits an enemy. Mosquitos attack a random enemy, dealing 100–150 damage each. If a mosquito kills an enemy, they steal 2 health. | — |
| Mosquito Kingdom | Spawns 2–3 mosquitos each time it hits an enemy. Mosquitos attack a random enemy, dealing 100–150 damage each. If a mosquito kills an enemy, they steal 2 health. | — |
| Mosquito Swarm | Explodes into 4–8 mosquitos. Mosquitos attack random enemies, dealing 100–150 damage each. If a mosquito kills an enemy, they steal 1 health. | — |
| Nosferatu | Spawns a vampire bat each bounce. Vampire bats fly towards a random enemy, dealing 180–272 damage on hit, turning into a Vampire Lord. | — |
| Noxious | Passes through enemies and applies 3 stacks of poison to nearby enemies within a 2 tile radius. Poison lasts for 6 seconds and each stack deals 2–5 damage per second. | — |
| Nuclear Bomb | Explodes when hitting an enemy, dealing 400–700 damage to nearby enemies and applying 1 stack of radiation to everyone present indefinitely (max 5 stacks). Each stack of radiation increases damage received by 15%. Has a 3 second cooldown. | — |
| Offspring | Splits into a clone on hit 6 times. | — |
| Overgrowth | Applies 1 stack of overgrowth. Upon reaching 2, consume all stacks and deal 180–250 damage to all enemies in a 3x3 tile square. | L3 threshold 3 → 2. |
| Petrify | Petrifies all enemies within its sightline for 2.0 seconds when first launched, dealing 80–180. | — |
| Phantom | Curse enemies on hit. Cursed enemies are dealt 200–300 damage after being hit 5 times. | Wiki: 'Curse' (imperative). |
| Poison | Applies 1 stack of poison on hit (max 8 stacks). Poison lasts for 9 seconds and each stack deals 2–5 damage per second. | — |
| Radiation Beam | Emit a radiation beam on hit that deals 36–72 damage and applies 1 stack of radiation (max 5 stacks). Radiation lasts for 15 seconds and cause enemies to receive 10% more damage from all sources per stack. | Wiki: 'Emit … cause'. |
| Reaper | Has a 15% chance to kill enemies on impact, healing you for 7 health. | — |
| Sacrifice | Inflicts 6 stacks of bleed (max 20 stacks) and applies curse to hit enemies. Cursed enemies are dealt 75–125 after being hit 5 times. | — |
| Sandstorm | Goes through enemies and is surrounded by a raging storm dealing 15–30 damage per second and blinding nearby enemies for 4 seconds. | — |
| Satan | While active, add 1 stack of burn to all active enemies per second (max 5 stacks), dealing 15–30 damage per stack per second and make them go berserk, dealing 21–30 damage to adjacent enemies every second. | Wiki: 'make them go berserk'. |
| Shotgun | Shoots 5–9 iron baby balls after hitting a wall. Iron baby balls move at 200% speed but are destroyed upon hitting anything. | — |
| Sniper | Pierces enemies and shoots 5–9 sniper baby balls after hitting a wall. Sniper baby balls pierce enemies but are destroyed upon hitting a wall. | — |
| Soul Sucker | Passes through enemies and saps them, with a 50% chance of stealing 1 health and reducing their attack damage by 40%. Lifesteal chance only applies once per enemy. | — |
| Spider Queen | Has a 45% chance of birthing an Egg Sac each time it hits an enemy. | — |
| Steel | Initially deals double damage but moves 50% slower. Damage increases by 15% each time it hits an enemy (max 400%). | — |
| Stone | Initially deals 400% damage. Damage erodes by 30% each time hitting an enemy (minimum 50%). | — |
| Storm | Emits lightning to strike nearby enemies every second, dealing 1–80 damage. | — |
| Succubus | Each hit has a 5% chance of charming the enemy for 12 seconds. Heals 1 when hitting a charmed enemy. | — |
| Sun | Blind all enemies in view and add 1 stack of burn every second (max 5 stacks). Burn lasts for 8 seconds and deals 9–15 damage per stack per second. | — |
| Swamp | Leaves behind tar blobs over time. Enemies who walk into tar blobs are dealt 25–40, are slowed by 50% for 7 seconds and gain 1 stack of poison (max 8 stacks). Each stack of poison deals 2–4 damage per second. This ball and its tar blobs also deal 6–12 damage to nearby units. | — |
| Time | Explodes into a time snare upon hitting an enemy, which stays on the field for 3.0 seconds and freezes enemies inside it. | Overview said 20 s (typo); fixed to 2.0 s in the fact base 2026-11-11; per-level 3.0 s. |
| Time Bomb | Throws a time bomb every few seconds, which explodes after a delay, dealing 140–240 damage to nearby enemies. | — |
| Timestop | Freezes everything on the field for 6.0 seconds but destroys itself after hitting an enemy. Has a 20 second cooldown before it can be shot again. | — |
| Tumor | Applies tumor on hit. Enemies with a tumor die after 30 seconds (except for bosses). | — |
| Vampire | Each hit has a 6% chance of healing 2 health. | — |
| Vampire Lord | Each hit inflicts 3 stacks of bleed. Heals 1 health and consumes all stacks when hitting an enemy with at least 9 stacks of bleed. | L3 threshold 10 → 9. |
| Venom | Applies 1 stack of venom on hit (max 12 stacks). Each stack deals 4–7 damage per second and slows down enemies. | — |
| Virus | Applies 1 stack of disease to units it hits (max 8 stacks). Disease lasts for 6 seconds. Each stack of disease deals 5–9 damage per second and diseased units have a 25% chance of passing a stack to undiseased nearby enemies each second. | — |
| Voluptuous Egg Sac | Explodes into 3–4 egg sacs on hitting an enemy. Has a 3 second cooldown before it can be shot again. | — |
| Warp | After each hit, warps to a random spot on the field and speeds up by 10%. | — |
| Wind | Passes through enemies and slows them down by 45% for 8 seconds, but deals 25% less damage. | — |
| Wraith | Freezes any enemy it passes through for 1.8 seconds. | — |
| X Ray | Emits an X-shaped laser on hit, which deals 60–95 damage to enemies and applies 1 stack of radiation (max 5 stacks). Radiation causes enemies to receive 10% more damage from all sources per stack. | — |
| Zombie | Infects enemies on hit, giving them a 60% chance to turn into a friendly zombie on death. | — |

## 1. Coverage and notes

- 91 catalog balls: 21 base + 69 evolved + 1 baby.
- 90/90 fusable balls have a complete 3-row per-level table (levels 1, 2, 3);
  no duplicate levels, no empty effect cells, no placeholder text.
- 2 balls have **no L3 diff** (effect text identical at L1/L2/L3): Elemental,
  Ghost. Both also have identical damage at all levels.
- 1 ball has an L2/L3 plateau: Bomb (L1 150–300 → L2/L3 200–400; the L2→L3
  upgrade changes nothing).
- 1 ball has **no per-level table**: Baby Ball. It is the non-fusable base
  attack ball (`ball_class = baby`), has no special ability, and is not a fusion
  component; listed with "—" for completeness.
- No page has an ambiguous or missing *value*. Every level-3 numeric value also
  appears in the page's own `stat_combined_description` (the slash-separated
  L1/L2/L3 summary), so no L3 value is orphaned or contradicted by the page's
  summary. The quirks in §2 are wording issues, not data gaps.

## 2. Wiki wording quirks (transcribed verbatim)

| Ball | Quirk |
|---|---|
| Laser Cutter | Per-level text omits the noun "damage": "deals 140–210 per second". The Balls overview table reads "deals 100–150 damage per second" (the L1 value); the meaning is unambiguous. |
| Radiation Beam | "Emit a radiation beam … and cause enemies to receive …" (no -s on either verb). The fact base reads "Emits". |
| Laser Beam | "Emit a laser beam …" (no -s). The fact base reads "Emits". |
| Flash | "Damage all enemies …" (imperative). The fact base reads "Damages". |
| Maggot | "Infest enemies …" (imperative). The fact base reads "Infests". |
| Phantom | "Curse enemies …" (imperative). The fact base reads "Curses". |
| Satan | "… and make them go berserk" (subject-verb agreement). Transcribed verbatim. |
| Landslide | Per-level text says "damage / second"; the overview/fact base says "damage per second". Same value; normalized to "damage/second" here. |
| Overgrowth | L3 threshold drops from 3 to 2 stacks. Real, confirmed by the combined description "3/3/2", not a typo. |
| Vampire Lord | L3 bleed threshold drops from 10 to 9 stacks. Real, confirmed by the combined description "10/10/9". |

## 3. Cross-check against `effect-text-currency.md`

Branch `research/effect-text-currency`, commit `8558d47` (2026-11-11). That
file transcribed the L2/L3 values for 32 fusion-relevant balls. All 32 agree
with the per-level table; **no value disagreements**.

| Ball | effect-text-currency L3 claim | Per-level L3 value | Match |
|---|---|---|---|
| Sun | max 5; 8 s; 9–15 | max 5; 8 s; 9–15 | yes |
| Banished Flame | max 8; 1–35 | max 8; 1–35 | yes |
| Egg Sac | 3–5 baby balls; 3 s cd | 3–5; 3 s cd | yes |
| Timestop | freeze 6.0 s; 20 s cd | 6.0 s; 20 s cd | yes |
| Erosion | 5% current HP | 5% | yes |
| Stone | 400%; erode 30% | 400%; erode 30% | yes |
| Drill | 100% bonus | 100% | yes |
| Assassin | 50% backstab | 50% | yes |
| Steel | 15%/hit; max 400% | 15%; max 400% | yes |
| Freeze Ray | 25–65; 13.0 s | 25–65; 13.0 s | yes |
| Blizzard | 1.3 s; 1–70 | 1.3 s; 1–70 | yes |
| Noxious | 6 s; 2–5 | 6 s; 2–5 | yes |
| Brimstone | burn 1–7; poison 3–5 | burn 1–7; poison 3–5 | yes |
| Time | 3.0 s | 3.0 s | yes |
| Banshee | 250–400 | 250–400 | yes |
| Frozen Flame | 30 s; max 5; 10–16 | 30 s; max 5; 10–16 | yes |
| Dark | 5.0×; 3 s cd | 5.0x; 3 s cd | yes |
| Black Hole | 5 s cd | 5 s cd | yes |
| Bomb | 200–400; 3 s cd | 200–400; 3 s cd | yes |
| Nuclear Bomb | 400–700; +15% | 400–700; 15% | yes |
| Voluptuous Egg Sac | 3–4 egg sacs | 3–4 | yes |
| Burn | 5 s; max 5; 7–11 | 5 s; max 5; 7–11 | yes |
| Poison | max 8; 9 s; 2–5 | max 8; 9 s; 2–5 | yes |
| Freeze | 7%; 8.0 s | 7%; 8.0 s | yes |
| Light | 7 s | 7 s | yes |
| Wind | 45%; 8 s | 45%; 8 s | yes |
| Iron | 30% slower | 30% | yes |
| Earthquake | 9–17; 4×4 | 9–17; 4x4 | yes |
| Phantom | 200–300 | 200–300 | yes |
| Wraith | 1.8 s | 1.8 s | yes |
| Laser (Horizontal) | 13–34 | 13–34 | yes |
| Laser (Vertical) | 13–34 | 13–34 | yes |

The only differences are typographic: `effect-text-currency.md` uses ASCII
hyphens in some tables and `×` for multipliers; this file follows the fact
base's en dash and ASCII `x`.

## 4. Discrepancies with the existing fact base / overview table

The existing fact base (`docs/research/game-mechanics.md`) was parsed from the
wiki's Balls overview table, which carries the level-1 description. The
per-level tables agree with it on all but these wording/level cases:

| Ball | Fact base / overview | Per-level table | Nature |
|---|---|---|---|
| Time | At audit time the overview said the snare stays 20 s; corrected to 2.0 s in the fact base on 2026-11-11. | 2.0 / 2.5 / 3.0 s. | Overview typo; per-level is primary. Already flagged in `effect-text-currency.md` §3. |
| Brimstone | At audit time the fact base dropped the burn/poison damage clause; corrected 2026-11-11. | Full clause present. | Fact-base truncation; already flagged. |
| Laser Cutter | Overview says "deals 100–150 damage per second". | L3 says "deals 140–210 per second". | Level scaling (L1 vs L3); per-level also omits the noun "damage". |
| Landslide | Overview says "damage per second". | "damage / second". | Wording only. |
| Tumor | Overview says "Applies tumor on hit. Enemies with a tumor die after 40 seconds…". | "Applies tumor on hit. Enemies with a tumor die after 30 seconds…". | Value scales 40 s (L1) → 30 s (L3); punctuation also differs. |
| Radiation Beam | Fact base says "Emits". | "Emit". | Grammar only. |
| Flash | Fact base says "Damages". | "Damage". | Grammar only. |

No other overview-vs-per-level differences after normalizing dashes, `max`,
slash spacing, and terminal periods (Tumor's 40 s → 30 s is the one value
change).

## 5. Sources

- Per-ball pages: `https://ballxpit.wiki.gg/wiki/<Page_Name>` (e.g. `Sun`,
  `Laser_(Horizontal)`, `X_Ray`). The page name is the `Ball` column value with
  spaces replaced by underscores; parentheses are kept.
- MediaWiki API queries (2026-11-11):
  - `action=cargoquery&tables=BallStatsByLevel&fields=_pageName,level,damage,effect&limit=500`
  - `action=query&prop=revisions&rvprop=content&rvslots=main` for every ball page
    (cross-check of `{{BallStat}}` rows).
- Wiki rebuild provenance: page revision comments "Cargo: rebuild from
  `{{BallData}}` (P3b)", 2026-09-15/17 (e.g. Sun revision 2026-09-15T19:36:20Z).
- Cross-check: `docs/research/effect-text-currency.md` @ `8558d47`.
