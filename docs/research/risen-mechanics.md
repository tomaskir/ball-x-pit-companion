# Risen Ballbylon — new-mechanics inventory and editorial tag mapping

Research for wayfinder ticket
[#34](https://github.com/tomaskir/ball-x-pit-companion/issues/34): inventory
the mechanics introduced by the *Risen Ballbylon* DLC content (24 balls, 45
passives, 8 characters) and recommend an editorial tag mapping for each, using
the site's existing 17-tag vocabulary (`scripts/editorial.ts` `TAGS`) where it
fits and proposing new tags where it does not.

**Researched:** 2026-11-13.
**Primary source:** `game-data/extracted/extract.json` (DLC datamine: every
entry with `dlc: 1` — 24 balls, 45 passives, 8 characters). Effect text quoted
from `level1_text` / `level3_text` (balls), `text` (passives), and `gameplay`
(characters).
**Draft under review:** `game-data/extracted/editorial-draft.md`.
**Status:** research snapshot; nothing here is applied to
`scripts/editorial.ts`. Feeds S2 (editorial mapping). `game-data/` is
untrusted read-only data and is not committed.

---

## 0. Bottom line

The draft's mapping is sound for the straightforward damage/status balls and
passives, but the existing vocabulary has no name for the DLC's
character-defining mechanics. The draft compensates by stretching
`single-target`, which is the weakest part of the proposal: it is used for
attach, return bonuses, orbit, backstab, loop bonuses, boss damage,
percent-health damage, bottom-wall triggers, and aim-direction effects — none
of which is "pure single-hit damage, no area or status" (the tag's own
description).

Recommend **11 new tags**: six core (`attach`, `field`, `return-trajectory`,
`orbit`, `teleport`, `fused-ball`) and five descriptive (`backstab`,
`aim-direction`, `diagonal`, `shield`, `knock-up`). The six core tags are
needed because four of the eight new characters (Recollector, Scandalmonger,
Wallbreaker, Potager) have no accurate verdict tag for their *defining*
mechanic without them — the draft can only name a side-effect (`pass-through`,
`aoe`, `wall-bounce`) or a weak proxy; `aim-direction` and `diagonal` cover the
Sentinel and Scrupulous Scoundrel.

Three draft mappings are actively misleading and should change even if no new
tag is adopted: `bounce-scaling` on Ironwood/Wood (per-hit, not per-bounce),
`ball-speed` on Kaiju (slow movement is a downside, not a scaling axis), and
`pass-through` on The Wallbreaker (teleport is not pierce).

---

## 1. Method and calibration

The existing tags are used as **coarse synergy axes**, not strict effect
descriptors. Calibrating against base (pre-DLC) content in the same
`extract.json`:

| Existing convention | Evidence |
|---|---|
| `single-target` = "direct-damage build" proxy, not literally one hit | `spiked-collar` ("deal 30–50 to enemies the first time you get into their melee range"), `silver-bullet` ("bonus damage until they hit a wall"), `platinum-dumbbell` ("bonus damage until they hit the back of the field"), `sword-breaker` ("1% damage for each enemy on the field") |
| `aoe` also tags AOE *amplifiers*, not only AOE damage | `magic-staff` ("Increase area-of-effect damage … by 20%") |
| `wall-bounce` covers any wall/back-of-field trigger | `upturned-hatchet` ("after hitting the back of the field"), `wagon-wheel` ("each time a ball hits a wall") |
| `ball-speed` covers movement speed too | `fleet-feet` ("Increase movement speed by 10%") |
| `bounce-scaling` = per-bounce scaling | `hourglass` ("damage decays by 30% each time they bounce"), `rubber-headband` ("increase by 20 each bounce") |
| `status-effect` = applies a status | `midnight-oil` (fire), `rusted-blade` (bleed) |

The draft is consistent with these conventions in most places. The
recommendations below therefore distinguish **new mechanics the model cannot
express** from **coarse-but-consistent proxy usage** that can stay.

---

## 2. Mechanic inventory and recommendation table

Legend: **Existing** = use an existing tag; **New** = add the proposed tag;
**No tag** = leave untagged (the mechanic is not a useful synergy axis yet).

| # | Mechanic | Carriers (DLC) | Draft mapping | Recommendation | Rationale |
|---|---|---|---|---|---|
| 1 | **Attach** — ball sticks to an enemy and deals damage per second until it dies | Beast, Thunderbird, Werewolf, Wolfpack | `single-target` (all four); Thunderbird also `aoe`; Werewolf also `lifesteal`; Wolfpack also `spawns-allies` | **New: `attach`** | Attach is damage-over-time on one target, not a single hit. It is the defining axis of four balls and the Beast starter. Keep `aoe` (Thunderbird lightning), `lifesteal` (Werewolf), `spawns-allies` (Wolfpack). Drop `single-target` or keep only as a coarse fallback. Retroactive carrier: base ball **Leech** ("Attaches up to 1 leech onto enemies"). |
| 2 | **Field / trail** — leaves a persistent damaging zone on the ground | Ash (ash trail + burn), Steam (steam trail), Waterfall (stationary waterfall), Mudslide (mudslide + slow) | `pass-through` + `status-effect` (Ash, Steam); `destroy-on-hit` + `aoe` (Waterfall, Mudslide); Mudslide also `status-effect` | **New: `field`** | None of the existing tags says "the ball leaves a lasting ground zone". `aoe` covers the damage shape but not the persistence; `pass-through` covers only how the ball travels. Keep the draft's other tags. |
| 3 | **Return trajectory** — ball travels back toward the player/cursor; bonuses on the return leg | The Recollector (character), Teardrop Necklace, Teardrop Dagger; conditional: Fruit (heals if it returns) | The Recollector `pass-through` + `single-target`; Teardrop Necklace `single-target`; Teardrop Dagger `single-target` + `ball-speed` | **New: `return-trajectory`** | The mechanic is a trajectory state, not a damage shape. The draft's `single-target` green for the Recollector ("return trajectory doubles hits on the same target") describes the return leg, not single-target damage. Keep `pass-through` (Recollector) and `ball-speed` (Dagger). |
| 4 | **Orbit** — balls circle the player / aim cursor | The Scandalmonger (character), Crystal Decanter, Liquid Flame ("Orbiting balls are always on fire"); possibly Hand Drill / Reacher's Drill ("each time a ball loops around") | Scandalmonger `aoe`; Crystal Decanter `single-target`; Liquid Flame `status-effect` | **New: `orbit`** | Crystal Decanter's `single-target` is simply wrong ("Balls deal 20% more damage when in orbit"). Scandalmonger's `aoe` is a consequence of orbiting, not the mechanic. Keep `status-effect` on Liquid Flame and add `orbit`. |
| 5 | **Teleport / warp** — ball jumps to the opposite side of the field | The Wallbreaker (character), Handheld Rupture ("whenever a special ball warps"); retroactive: base ball Warp | Wallbreaker `wall-bounce` + `pass-through`; Handheld Rupture `aoe` + `status-effect` | **New: `teleport`** | Teleport is not pierce; the draft's `pass-through` green overstates it. `wall-bounce` is defensible as the trigger (first wall hit), but the movement is the distinguishing mechanic. Handheld Rupture keys off "warp", so it is a teleport synergy, not a status applier. |
| 6 | **Perfect diagonals** — bounce angle constrained to / rewarded for 45° diagonals | The Scrupulous Scoundrel (character), Goniometer ("first bounce … based on how close to a perfect diagonal"), Tilted Dagger ("bounce horizontally") | Scoundrel `wall-bounce` + `single-target`; Goniometer `single-target` + `bounce-scaling`; Tilted Dagger `crit` + `wall-bounce` | **New: `diagonal`** (optional; could fold into `bounce-scaling`) | `bounce-scaling` is close for Goniometer but does not capture the angle constraint. Scoundrel's `single-target` red is a non sequitur: diagonal bounces do not make single-target damage worse. `wall-bounce` is defensible for the Scoundrel (bounces off walls) but not for Tilted Dagger's horizontal bounce. |
| 7 | **Wall interactions** — right wall / left wall / bottom wall / back of field triggers | The Right Hand Man (right = double damage, left = half + pierce), Eldritch Gauntlet (right wall), Eldritch Dagger (right wall explosion), Wrapped Explosive (first wall hit), Cracked Cinderblock (pass through wall), Spiked Discipline (bottom wall), Relentless Whip (bottom wall) | Right Hand Man `wall-bounce` + `pass-through`; Eldritch Dagger `aoe` + `wall-bounce`; Eldritch Gauntlet `wall-bounce`; Wrapped Explosive `aoe` + `wall-bounce`; Cracked Cinderblock `spawns-baby-balls` + `wall-bounce`; Spiked Discipline `single-target`; Relentless Whip `spawns-baby-balls` | **Existing: `wall-bounce`** for all wall triggers; **fix** Spiked Discipline to `wall-bounce`; **fix** Relentless Whip to add `wall-bounce`; keep Right Hand Man `pass-through` but note the left-wall + half-damage condition | The existing `wall-bounce` convention already covers back-of-field triggers (`upturned-hatchet`), so bottom-wall triggers fit. Do **not** add directional tags (`right-wall`, `bottom-wall`): the direction is a detail of one character, not a build axis. |
| 8 | **Centered AOE** — ball AOE is centered on the player | The Conduit (character) | `aoe` green, `single-target` red | **Existing: `aoe`** (keep the draft's green/red) | The tag already means "area damage"; centering it is a positioning consequence. The red `single-target` note is reasonable. |
| 9 | **Fused-ball-only** — all special balls fused into one; interacts with the combined ball | The Potager (character), Ancient Ladle ("your combined ball … births a copy of one of its components"), Mystic Dipper (same, stronger) | Potager `aoe` green; Ancient Ladle `spawns-baby-balls`; Mystic Dipper `spawns-baby-balls` + `aoe` | **New: `fused-ball`** | The draft's Potager `aoe` green ("Fusing every special ball into one stacks their effects") is misleading: a stacked ball is not necessarily AOE. The mechanic is fused-ball interaction. Keep `aoe` on Mystic Dipper (it explicitly grants +40% AOE damage). |
| 10 | **Baby-ball suppression** — character has no baby balls | The Potager (character) | `spawns-baby-balls` red | **Existing: `spawns-baby-balls`** (keep red) | The existing red-verdict convention already expresses anti-synergy (cf. The Empty Nester). No new tag. |
| 11 | **Backstab / flank** — bonus damage or crit when hitting from behind or the side | Kris Knife, Shadow Blade, Tilted Dagger (right side); retroactive: base ball Assassin | Kris Knife `single-target`; Shadow Blade `crit`; Tilted Dagger `crit` + `wall-bounce` | **New: `backstab`** | The mechanic recurs across the base game (Assassin) and the DLC. `single-target` loses it; `crit` captures only the crit variants. Description should say "behind or flank" to include Tilted Dagger. |
| 12 | **Aim direction** — effect depends on the direction the player is aiming | Bent Spyglass ("shot while aiming backwards"), Eyeless Spyglass ("while you're looking backwards"), The Sentinel ("aim and shoot in any direction") | Bent Spyglass `single-target`; Eyeless Spyglass `crit`; Sentinel `single-target` green | **New: `aim-direction`** | Bent Spyglass's `single-target` is wrong (it is a 60% damage bonus, not a single-hit shape). Sentinel's `single-target` green is weak: aiming any direction is a positioning mechanic. Keep `crit` on Eyeless Spyglass. |
| 13 | **Knock-up** — launches enemies into the air, letting balls pass under | Gale, Stalagmite | `aoe` (both) | **New: `knock-up`** | The pass-under effect changes ball trajectories and is not captured by `aoe`. Keep `aoe` for the fall/landing damage. |
| 14 | **Shield** — modifies or interacts with the player's shield | Steel Bulwark (+20% shield size), Spiked Shield (+50% size, eject spike on bounce); retroactive: Protective Charm | Steel Bulwark `[]`; Spiked Shield `aoe` | **New: `shield`** | Steel Bulwark is currently invisible to the synergy model. Spiked Shield's `aoe` covers the spike but not the shield. |
| 15 | **Percent-health damage** — bonus damage as a fraction of enemy current health | Rot (20–30%), Blood Kunai (0.6× current health); retroactive: Erosion | Rot `destroy-on-hit` + `single-target`; Blood Kunai `single-target` | **No tag** (keep `single-target` as proxy) | No character verdict keys off it and it is not a build axis yet. Flag as a candidate `percent-health` tag if a future character rewards it. |
| 16 | **Boss damage** — bonus damage to bosses/minibosses | Kunai | `single-target` | **No tag** (keep `single-target` as proxy) | Same reasoning as #15. |
| 17 | **Hit-count scaling** — damage erodes or grows per enemy hit | Bullet (erodes), Force (grows), Ironwood (AOE grows per hit), Wood (AOE grows per hit) | Bullet/Force `pass-through` + `single-target`; Ironwood/Wood `aoe` + `bounce-scaling` | **No tag**; **fix** Ironwood/Wood: drop `bounce-scaling` | `bounce-scaling` is per-bounce (`hourglass`, `rubber-headband`), not per-hit. Keep `aoe`; leave the scaling untagged. Optional `hit-scaling` if a future character rewards it. |
| 18 | **Gold / resources** | Lucky Coin (bonus gold; baby balls on pickup) | `spawns-baby-balls` | **No tag** (keep `spawns-baby-balls`) | The gold half is not a combat synergy axis. |
| 19 | **Status applications** — burn, bleed, charm, curse, slow, ivy stacks | Ash (burn), Hedgehog (bleed), Siren (charm), Misfortune (curse), Mudslide (slow), Ivy (ivy stacks), Rusted Blade (bleed), Vampire's Kiss (bleed) | `status-effect` | **Existing: `status-effect`** | All correct. |
| 20 | **Existing shapes** — explosions, clones, baby spawns, crit, lifesteal, pierce | Volatile Explosive, Refracted Echo, Refracting Glass, Hand Me Downs, Eyeless Spyglass/Shadow Blade/Reacher's Drill/Tilted Dagger, Werewolf/Vampire's Kiss, Peacemaker/Silver Revolver | `aoe`, `clone`, `spawns-baby-balls`, `crit`, `lifesteal`, `pass-through` | **Existing tags** | No change. |

---

## 3. Proposed new tags

| id | Description | Carriers (DLC) | Priority |
|---|---|---|---|
| `attach` | Ball attaches to an enemy and deals damage over time until it dies | Beast, Thunderbird, Werewolf, Wolfpack; retroactive Leech | Core |
| `field` | Leaves a persistent damaging zone or trail on the ground | Ash, Steam, Waterfall, Mudslide | Core |
| `return-trajectory` | Ball returns toward the player/cursor; bonuses apply on the return leg | The Recollector, Teardrop Necklace, Teardrop Dagger; conditional Fruit | Core |
| `orbit` | Ball orbits the player or aim cursor | The Scandalmonger, Crystal Decanter, Liquid Flame; loop passives if "loop" = orbit | Core |
| `teleport` | Ball teleports/warps across the field | The Wallbreaker, Handheld Rupture; retroactive Warp | Core |
| `fused-ball` | Interacts with the fused/combined ball | The Potager, Ancient Ladle, Mystic Dipper | Core |
| `backstab` | Bonus damage/crit when hitting an enemy from behind or the flank | Kris Knife, Shadow Blade, Tilted Dagger; retroactive Assassin | Descriptive |
| `aim-direction` | Effect depends on the direction the player is aiming | Bent Spyglass, Eyeless Spyglass, The Sentinel | Descriptive |
| `diagonal` | Bounce angle is constrained to / rewarded for perfect diagonals | The Scrupulous Scoundrel, Goniometer, Tilted Dagger | Descriptive |
| `shield` | Modifies or interacts with the player's shield | Steel Bulwark, Spiked Shield; retroactive Protective Charm | Descriptive |
| `knock-up` | Launches enemies into the air, letting balls pass under them | Gale, Stalagmite | Descriptive |

Vocabulary grows 17 → 28. If a leaner set is preferred, `diagonal` folds into
`bounce-scaling`, `knock-up` folds into `aoe`, and `shield` can stay untagged;
the six core tags should not be folded, because they are the only accurate
verdict axes for four of the eight new characters.

Adding any tag requires a `TAGS` entry in `scripts/editorial.ts`; the draft's
paste-ready `CHAR_VERDICTS` block must then be regenerated to use the new ids.

---

## 4. Where the draft is weak or misleading

1. **`single-target` is overloaded (biggest issue).** It is used for ~15 DLC
   entities whose effects are not single-hit damage: attach (Beast, Werewolf,
   Wolfpack, Thunderbird), return bonuses (Teardrop Necklace/Dagger), orbit
   (Crystal Decanter), backstab (Kris Knife), loop (Hand Drill), boss damage
   (Kunai), percent-health (Blood Kunai), bottom-wall (Spiked Discipline),
   aim direction (Bent Spyglass), diagonal (Goniometer). The existing content
   already uses `single-target` as a coarse direct-damage proxy, so this is an
   extension of an existing looseness — but for the new character-defining
   mechanics it erases the synergy signal. Use the new tags for those; keep
   `single-target` only where "direct damage" is genuinely the axis.
2. **`bounce-scaling` on Ironwood and Wood is wrong.** Both say "AOE damage
   increases by 15%/10% each **hit**", not each bounce. Drop it; keep `aoe`.
3. **`ball-speed` on Kaiju is misleading.** "Moves slowly" is a fixed downside,
   not a scaling axis. The tag means "scales ball speed" (cf. `fleet-feet`,
   `radiant-feather`). Drop it; add `single-target` for "deals triple damage".
4. **`pass-through` on The Wallbreaker overstates the mechanic.** The ball
   teleports to the opposite side; it does not pierce. Use `teleport` (and keep
   `wall-bounce` for the trigger).
5. **`pass-through` green on The Right Hand Man is conditional.** Only left-wall
   hits pierce, and they deal half damage. Keep the green verdict but state the
   condition in the note; do not present it as unconditional pierce.
6. **`wall-bounce` on Tilted Dagger and (arguably) the Scoundrel is a
   trajectory mechanic, not a wall trigger.** Tilted Dagger "bounce[s]
   horizontally"; the Scoundrel constrains bounce angles. Use `backstab` /
   `diagonal`; reserve `wall-bounce` for actual wall/back-of-field triggers.
7. **`status-effect` on Handheld Rupture, Fractured Boulder, and Levitating
   Rock tags amplifiers, not appliers.** These passives increase status-effect
   *damage*; they do not apply a status. The `magic-staff` → `aoe` precedent
   makes `aoe` consistent, but `status-effect` is a semantic stretch. Keep it
   for now (the model has no `status-scaling` tag), but note the drift.
8. **The Potager's `aoe` green is misleading.** "Fusing every special ball into
   one stacks their effects" is a fused-ball mechanic; the stacked ball is not
   necessarily AOE. Use `fused-ball` green; `aoe` at most as a secondary.
9. **The Scrupulous Scoundrel's `single-target` red is a non sequitur.** "No
   straight-line shots" does not make single-target damage worse. Drop the red
   verdict; use `diagonal` green + `wall-bounce` green.
10. **The Recollector's `single-target` green is weak.** The return trajectory
    doubles hits on *any* target; that is a return-trajectory synergy. Use
    `return-trajectory` green; keep `pass-through` green.
11. **The Sentinel's `single-target` green is weak.** "Aim any direction" is an
    aim-direction/positioning mechanic, not a single-target reward. Use
    `aim-direction` green.
12. **Steel Bulwark has no tag at all.** A pure shield-size passive is
    invisible to the model; add `shield`.
13. **Spiked Discipline's `single-target` is wrong.** It is a bottom-of-screen
    trigger; `wall-bounce` is the right existing tag (cf. `upturned-hatchet`).
14. **Relentless Whip misses its wall trigger.** Add `wall-bounce` alongside
    `spawns-baby-balls` (bottom-of-screen trigger).
15. **Ancient Ladle / Mystic Dipper's `spawns-baby-balls` is ambiguous.** They
    birth "a copy of one of [the combined ball's] components", not a generic
    baby ball. If the game treats the copy as a baby ball, the tag is
    defensible; otherwise `fused-ball` (+ `clone`) is more accurate. Needs
    playtest/observation.
16. **Misfortune misses `aoe`.** "Curses all enemies" is an area effect; the
    draft has only `destroy-on-hit` + `status-effect`. Minor.

---

## 5. Per-entity appendix

### Balls (24)

| Ball | Draft tags | Recommended tags | Change |
|---|---|---|---|
| Ash | pass-through, status-effect | pass-through, status-effect, **field** | + field |
| Beast | single-target | **attach** | replace single-target |
| Bullet | pass-through, single-target | pass-through, single-target | keep (hit-count erosion untagged) |
| Force | pass-through, single-target | pass-through, single-target | keep (hit-count growth untagged) |
| Fruit | destroy-on-hit, lifesteal | destroy-on-hit, lifesteal (optional: return-trajectory) | keep |
| Gale | aoe | aoe, **knock-up** | + knock-up |
| Hedgehog | spawns-baby-balls, status-effect | spawns-baby-balls, status-effect | keep |
| Ironwood | aoe, bounce-scaling | aoe | drop bounce-scaling |
| Ivy | status-effect, aoe | status-effect, aoe | keep |
| Kaiju | aoe, ball-speed | aoe, single-target | drop ball-speed, + single-target |
| Misfortune | destroy-on-hit, status-effect | destroy-on-hit, status-effect, aoe | + aoe |
| Mudslide | destroy-on-hit, aoe, status-effect | destroy-on-hit, aoe, status-effect, **field** | + field |
| Rot | destroy-on-hit, single-target | destroy-on-hit, single-target | keep (percent-health untagged) |
| Siren | pass-through, status-effect | pass-through, status-effect | keep |
| Stalagmite | aoe | aoe, **knock-up** | + knock-up |
| Steam | pass-through, aoe | pass-through, aoe, **field** | + field |
| Thunderbird | single-target, aoe | **attach**, aoe | replace single-target |
| Tsunami | pass-through, aoe, destroy-on-hit | pass-through, aoe, destroy-on-hit | keep |
| Water | spawns-baby-balls, aoe | spawns-baby-balls, aoe | keep |
| Water Bug | spawns-baby-balls | spawns-baby-balls | keep |
| Waterfall | destroy-on-hit, aoe | destroy-on-hit, aoe, **field** | + field |
| Werewolf | single-target, lifesteal | **attach**, lifesteal | replace single-target |
| Wolfpack | single-target, spawns-allies | **attach**, spawns-allies | replace single-target |
| Wood | aoe, bounce-scaling | aoe | drop bounce-scaling |

### Passives (45)

| Passive | Draft tags | Recommended tags | Change |
|---|---|---|---|
| Ancient Ladle | spawns-baby-balls | spawns-baby-balls, **fused-ball** | + fused-ball (see §4.15) |
| Baby Armor | spawns-baby-balls | spawns-baby-balls | keep |
| Bent Spyglass | single-target | **aim-direction** | replace single-target |
| Eyeless Spyglass | crit | crit, **aim-direction** | + aim-direction |
| Blood Kunai | single-target | single-target | keep (percent-health untagged) |
| Fractured Boulder | aoe, status-effect | aoe, status-effect | keep (amplifier caveat) |
| Steel Bulwark | — | **shield** | + shield |
| Charged Bow | aoe | aoe | keep |
| Charged Bracelet | aoe | aoe | keep |
| Cracked Cinderblock | spawns-baby-balls, wall-bounce | spawns-baby-balls, wall-bounce | keep |
| Unkempt Cradle | spawns-baby-balls | spawns-baby-balls | keep |
| Cradle of Filth | spawns-baby-balls | spawns-baby-balls | keep |
| Crystal Decanter | single-target | **orbit** | replace single-target |
| Spiked Discipline | single-target | **wall-bounce** | replace single-target |
| Eldritch Dagger | aoe, wall-bounce | aoe, wall-bounce | keep |
| Eldritch Gauntlet | wall-bounce | wall-bounce | keep |
| Goniometer | single-target, bounce-scaling | bounce-scaling, **diagonal** | replace single-target |
| Hand Drill | single-target | **orbit** (or return-trajectory) | replace single-target |
| Hand Me Downs | spawns-baby-balls | spawns-baby-balls | keep |
| Handheld Rupture | aoe, status-effect | aoe, status-effect, **teleport** | + teleport |
| Juggler's Club | aoe | aoe | keep |
| Juggler's Wheel | aoe | aoe | keep |
| Kris Knife | single-target | **backstab** | replace single-target |
| Kunai | single-target | single-target | keep (boss damage untagged) |
| Levitating Rock | aoe, status-effect | aoe, status-effect | keep (amplifier caveat) |
| Liquid Flame | status-effect | status-effect, **orbit** | + orbit |
| Lucky Coin | spawns-baby-balls | spawns-baby-balls | keep (gold untagged) |
| Mystic Dipper | spawns-baby-balls, aoe | spawns-baby-balls, aoe, **fused-ball** | + fused-ball |
| Peacemaker | pass-through, single-target | pass-through, single-target | keep |
| Silver Revolver | pass-through, single-target | pass-through, single-target | keep |
| Reacher's Drill | crit | crit, **orbit** (or return-trajectory) | + orbit |
| Refracted Echo | clone | clone | keep |
| Refracting Glass | spawns-baby-balls | spawns-baby-balls | keep |
| Relentless Whip | spawns-baby-balls | spawns-baby-balls, **wall-bounce** | + wall-bounce |
| Rusted Blade | status-effect | status-effect | keep |
| Sands of Time | ball-speed | ball-speed | keep |
| Shadow Blade | crit | crit, **backstab** | + backstab |
| Spiked Shield | aoe | **shield**, aoe | + shield |
| Teardrop Necklace | single-target | **return-trajectory** | replace single-target |
| Teardrop Dagger | single-target, ball-speed | **return-trajectory**, ball-speed | replace single-target |
| Test Tube | ball-speed | ball-speed | keep |
| Tilted Dagger | crit, wall-bounce | crit, **backstab** (optional: diagonal) | replace wall-bounce |
| Vampire's Kiss | status-effect, lifesteal | status-effect, lifesteal | keep |
| Volatile Explosive | aoe | aoe | keep |
| Wrapped Explosive | aoe, wall-bounce | aoe, wall-bounce | keep |

### Characters (8)

| Character | Draft verdicts | Recommended verdicts | Change |
|---|---|---|---|
| The Conduit | `aoe` green, `single-target` red | `aoe` green, `single-target` red | keep |
| The Potager | `aoe` green, `spawns-baby-balls` red | **`fused-ball`** green, `spawns-baby-balls` red (optional: `aoe` green) | replace aoe green with fused-ball |
| The Recollector | `pass-through` green, `single-target` green | **`return-trajectory`** green, `pass-through` green | replace single-target green |
| The Right Hand Man | `wall-bounce` green, `pass-through` green | `wall-bounce` green, `pass-through` green (note: left wall only, half damage) | keep, tighten note |
| The Scandalmonger | `aoe` green | **`orbit`** green (optional: `aoe` green) | add orbit |
| The Scrupulous Scoundrel | `wall-bounce` green, `single-target` red | **`diagonal`** green, `wall-bounce` green | drop single-target red |
| The Sentinel | `single-target` green | **`aim-direction`** green | replace single-target |
| The Wallbreaker | `wall-bounce` green, `pass-through` green | **`teleport`** green, `wall-bounce` green | replace pass-through |

---

## 6. Open questions / what is missing

- **"Loop" semantics.** Hand Drill ("each time a ball loops around") and
  Reacher's Drill ("after a ball loops around") may mean orbit around the
  player or a return-to-player loop. I recommend `orbit`; if observation shows
  it means the return leg, use `return-trajectory` instead. One tag should own
  it, not both.
- **Attach and single-target.** If the synergy model wants attach balls to
  count as direct-damage builds, keep `single-target` alongside `attach`; I
  recommend dropping it to keep the axis clean.
- **Ancient Ladle / Mystic Dipper component copy.** Whether the birthed
  component copy is a baby ball (and therefore `spawns-baby-balls`) needs
  playtest/observation. The effect text says "a copy of one of its components",
  not "a baby ball".
- **Directional wall tags.** I recommend *not* adding `right-wall` /
  `bottom-wall`; the existing `wall-bounce` convention covers them and the
  direction is a single-character detail. If a future character keys off a
  specific wall, revisit.
- **Percent-health / boss / hit-scaling / gold** are real mechanics but not
  build axes yet; left untagged deliberately. Add tags only when a character
  verdict or a second carrier makes them a synergy axis.
- **All verdicts are editorial and playtest-unverified** (per the repo's
  content caveats); this document recommends structure, not balance claims.
- **Draft regeneration.** If any new tag is adopted, the draft's paste-ready
  block must be regenerated against the new `TAGS` vocabulary; the current
  block would fail `validateEditorial` only if it used an unknown tag (it does
  not — it uses existing tags only), but its verdicts would not express the new
  mechanics.

---

## 7. Sources

- `game-data/extracted/extract.json` — DLC datamine; all `dlc: 1` entries
  (24 balls, 45 passives, 8 characters), plus `dlc: 0` entries used to
  calibrate existing tag conventions.
- `game-data/extracted/editorial-draft.md` — the draft under review.
- `scripts/editorial.ts` — `TAGS` (17-tag vocabulary), `BALL_TAGS`,
  `PASSIVE_TAGS`, `CHAR_VERDICTS`, `validateEditorial`.
- `GLOSSARY.md` — site vocabulary (Evolution vs Fusion; editorial model).
- `docs/research/passive-availability.md` — precedent for the
  hard/soft/slot distinction and the "editorial, not game data" caveat.
