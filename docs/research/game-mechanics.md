# Ball x Pit — Game mechanics fact base

Research for the ball-x-pit-companion site data files. Resolves
[`.scratch/ball-x-pit-companion/issues/02-game-mechanics-research.md`](../../.scratch/ball-x-pit-companion/issues/02-game-mechanics-research.md).

**Primary sources** (fetched 2026-09-13):

- Balls: <https://ballxpit.wiki.gg/wiki/Balls>
- Passives: <https://ballxpit.wiki.gg/wiki/Passives>
- Characters: <https://ballxpit.wiki.gg/wiki/Characters>
- Fusion rules: <https://ballxpit.wiki.gg/wiki/Fusion_Mechanics> (redirects into Balls)

**Cross-check source**: `references/the-ultimate-guide-of-evolutions-{1,2}.{webp,png}`
("Ultimate Guide of Evolutions" by CoupDeGlace, game version 1.301, Naturalist update,
dated Aug 13 2026). Image 1 is the tier-grouped recipe list; image 2 is the full
21×21 base-ball fusion matrix plus Tier-2/Tier-3/Passive/Elemental summaries.
Both sources agree — no contradictions found. The wiki pages carry a `{{Stub}}`
notice and a TODO about damage types, so numbers below are wiki-as-of-date and
should be re-verified on game updates.

**Terminology note**: the wiki distinguishes **Base Balls** (21, offered on level-up),
**Evolved Balls** (69, made from 2+ specific level-3 balls in the Fusion Reactor), and
**Fused Balls** (any other 2-ball combo — out of scope for the site, see map.md).
The site's "tier" grouping = evolution depth: Basic / Evolved (level-2) / Tier-3.
Intermediate evolved balls that feed further evolutions are marked
**Evo-intermediate** below.

---

## 1. Balls

### 1.1 Base Balls (21)

All base balls are "Basic" tier. Unlock "default" = available from the start.

| Ball | On-hit effect | Status trigger(s) | Status effect | Effect text (wiki) | Character(s) | Unlock |
|---|---|---|---|---|---|---|
| Bleed | — | On-Hit | Bleed | Inflicts 2 stacks of bleed. Bleeding enemies receive 1 damage per stack when hit by a ball (max 8 stacks). | The Warrior, The False Messiah | default |
| Brood Mother | Spawn | On-Hit, Spawn | Baby Ball Spawn | Has a 25% chance of birthing a baby ball each time it hits an enemy. | The Cohabitants | default |
| Burn | — | On-Hit | Burn | Add 1 stack of burn on hit for 3 seconds (max 3 stacks). Burnt units are dealt 4–8 damage per stack per second. | The Itchy Finger | default |
| Cell | Spawn | On-Hit | Clone | Splits into a clone on hit 2 times. | — | Clear The FUNGALxFOREST |
| Charm | — | On-Hit | Charm | Each hit has a 4% chance of charming the enemy for 5 seconds. Charmed units walk up the board and attack enemies. | The Carouser | Clear The HEAVENLYxGATES |
| Dark | Destroy | On-Hit | — | Deals 3.0x damage but destroys itself after hitting an enemy. Has a 3 second cooldown before it can be shot again. | The Shade | Clear The BONExYARD |
| Earthquake | AOE | On-Hit, AOE | — | Deals 5–13 damage to nearby units in a 3x3 tile square. | The Makeshift Sisyphus, The Tunneller | default |
| Egg Sac | Destroy, Spawn | On-Hit, Baby Ball | Baby Ball Spawn | Explodes into 2–4 baby balls on hitting an enemy. Has a 3 second cooldown before it can be shot again. | The Flagellant | default |
| Flesh | — | On-Hit | — | Speed increases by 25% per bounce. | — | Clear The GORYxGRASSLANDS |
| Freeze | — | On-Hit | Freeze | Has a 4% chance to freeze enemies for 5.0 seconds. Frozen enemies receive 25% more damage. | The Repentant | default |
| Ghost | Pass Through | On-Hit | — | Passes through enemies. | The Empty Nester | default |
| Iron | — | On-Hit | — | Deals double damage but moves 40% slower. | The Shieldbearer, The Tactician | default |
| Laser (Horizontal) | AOE | On-Hit, AOE | — | Deals 9–18 damage to all enemies in the same row. | The Tiptoer | default |
| Laser (Vertical) | AOE | On-Hit, AOE | — | Deals 9–18 damage to all enemies in the same column. | The Cogitator | default |
| Light | — | On-Hit | Blind | Blinds enemies on hit for 3 seconds. Blinded units have a hard time detecting you and have a 50% chance of missing when they attack. | The Physicist | Clear The LIMINALxDESERT |
| Lightning | AOE | On-Hit, AOE | — | Deals 1–20 damage to up to 3 nearby enemies. | The Juggler, The Falconer | default |
| Poison | — | On-Hit | Poison | Applies 1 stack of poison on hit (max 5 stacks). Poison lasts for 6 seconds and each stack deals 1–4 damage per second. | The Embedded | default |
| Stone | — | On-Hit | — | Initially deals 300% damage. Damage erodes by 40% each time hitting an enemy (minimum 50%). | — | Clear The SNOWYxSHORES |
| Time | Destroy | On-Hit, AOE | Time Snare | Explodes into a time snare upon hitting an enemy, which stays on the field for 20 seconds and freezes enemies inside it. | — | Clear The SMOLDERINGxDEPTHS |
| Vampire | — | On-Hit | Heal | Each hit has a 4.5% chance of healing 1 health. | The Spendthrift | default |
| Wind | Pass Through | On-Hit | Slow | Passes through enemies and slows them down by 30% for 5 seconds, but deals 25% less damage. | The Radical | default |

Plus the **Baby Ball** (not a special ball): base attack ball, no special abilities;
all characters start with a few except The Empty Nester and The Makeshift Sisyphus.

### 1.2 Evolved Balls (69)

Depth column: **Evo** = level-2 evolution (from base balls only); **Evo-int** =
evolved ball that also feeds a further evolution; **Tier-3** = evolution requiring
evolved balls as components. Recipes are order-independent; "(X or Y)" marks an
alternate component.

| Ball | Depth | Recipe(s) | On-hit | Status effects | Effect text (wiki) |
|---|---|---|---|---|---|
| Armageddon | Tier-3 | Inferno + Storm | Destroy, AOE | — | Creates a meteor shower upon hitting an enemy. The meteor shower lasts for 5 seconds and deals 30–50 damage/second to enemies within a 3 tile radius. |
| Assassin | Evo | Iron + (Ghost or Dark) | Pass Through | — | Passes through the front of enemies, but not the back. Backstabs deal 30% bonus damage. |
| Banished Flame | Evo | Dark + Burn | — | Darkflame | Add 1 stack of darkflame on hit for 2 seconds (max 6 stacks). Darkflame deals 1–30 damage per stack per second. When the darkflame goes out, it deals 1–100 to the enemy. |
| Banshee | Tier-3 | Phantom + Wraith | — | Curse | Curses all enemies while on the field when launched. Cursed enemies are dealt 150–300 after being hit 6 times. |
| Berserk | Evo | Charm + (Bleed or Burn) | — | Berserk | Each hit has a 30% chance of causing enemies to go berserk for 6 seconds. Berserk enemies deal 15–24 damage to adjacent enemies every second. |
| Black Hole | Tier-3 | Sun + (Dark or Time) | Destroy | Instant Kill | Instantly kills the first non-boss enemy that it hits, but destroys itself afterwards. Has a 7 second cooldown before it can be shot again. |
| Blizzard | Evo | Freeze + (Wind or Lightning) | — | Freeze (AOE) | Freezes all enemies within a 2 tile radius for 0.8 seconds, dealing 1–50 damage. |
| Bomb | Evo | Burn + Iron | Destroy | — | Explodes when hitting an enemy, dealing 150–300 damage to nearby enemies. Has a 3 second cooldown before it can be shot again. |
| Brimstone | Evo | Burn + (Stone or Poison) | — | Burn, Poison | Applies 1 stack of burn and poison every second to all enemies within a 2 tile radius (max 4 stacks). |
| Catapult | Evo | Stone + Egg Sac | — | Baby Ball Spawn | Launches 3–5 stone baby balls every 1.5 seconds, which are destroyed after hitting anything. |
| Drill | Evo | Earthquake + Iron | Pass Through | — | Pierces enemies and deals 50% bonus damage until reaching the back of the field. |
| Elemental | Evo (4-way) | Burn + Wind + Freeze + Earthquake | — | Burn, Slow, Freeze | Applies a random status effect (burn, slow, or freeze) to nearby enemies on hit. |
| Erosion | Evo | Time + Wind | Pass Through | ? | Passes through enemies. Deals 3% of enemy's current health as bonus damage on hit. |
| Fireworks | Evo | Burn + Egg Sac | Destroy | Firework Spawn, Burn | Explodes into 3–6 fireworks. Fireworks target random enemies, dealing 20–30 damage and applying 1 stack of burn. |
| Flash | Evo | Lightning + Light | — | Blind (full screen) | Damages all enemies on screen for 1–3 damage after hitting an enemy and blinds them for 2 seconds. |
| Flesh Mound | Evo | Brood Mother + Flesh | — | Fleshy Baby Ball Spawn | Emits a fleshy baby ball in a random direction every 1.0 seconds. |
| Flicker | Evo | Light + Dark | — | — | Deals 1–7 damage to every enemy on screen every 1.4 seconds. |
| Freeze Ray | Evo | Freeze + (Laser H or Laser V) | — | Freeze | Emits a freeze ray when hitting an enemy, dealing 20–50 to all enemies in its path, with a 10% chance of freezing them for 10.0 seconds. |
| Frozen Flame | Evo | Burn + Freeze | — | Frostburn | Add 1 stack of frostburn on hit for 20 seconds (max 4 stacks). Frostburnt units are dealt 8–12 damage per stack per second and receive 25% more damage from other sources. |
| Glacier | Evo | Freeze + (Earthquake or Stone) | — | Freeze | Releases glacial spikes over time that deal 15–30 to enemies that touch them and freeze them for 2.0 seconds. This ball and its glacial spikes also deal 6–12 damage to nearby units. |
| Heart Swallower | Evo (int → Reaper) | Bleed + Ghost | — | Lifesteal, Attack Down | Saps enemies on hit, with a 40% chance of stealing 1 health and reducing their attack damage by 20%. |
| Hemorrhage | Evo | Bleed + (Iron or Flesh) | — | Bleed | Inflicts 3 stacks of bleed. When hitting an enemy with 12+ stacks of bleed, consumes all stacks to deal 20% of their current health. |
| Holy Laser | Evo (int → X Ray) | Laser (Horizontal) + Laser (Vertical) | — | — | Deals 24–36 damage to all enemies in the same row and column. |
| Incubus | Evo (int → Satan) | Charm + Dark | — | Charm, Curse | Each hit has a 4% chance of charming the enemy for 9 seconds. Charmed enemies curse nearby enemies. Cursed enemies are dealt 100–200 after being hit 5 times. |
| Inferno | Evo (int → Armageddon) | Burn + (Wind or Time) | — | Burn | Applies 1 stack of burn every second to all enemies within a 2 tile radius. Burn lasts for 6 seconds, dealing 3–7 damage per stack per second. |
| Landslide | Evo | Stone + Earthquake | Destroy | Landslide | Creates a landslide and destroys self upon hitting an enemy. The landslide lasts for 5 seconds and deals 20–30 damage per second to enemies within a 2 tile radius. |
| Laser Beam | Evo (int → X Ray) | Light + (Laser H or Laser V) | — | Blind | Emits a laser beam on hit that deals 30–42 damage and blinds enemies for 8 seconds. |
| Laser Cutter | Evo | (Laser H or Laser V) + Steel | ? | — | Constantly emits a laser in front of it, which deals 100–150 damage per second. |
| Leech | Evo | Brood Mother + Bleed | — | Leech, Bleed | Attaches up to 1 leech onto enemies it hits, which adds 2 stacks of bleed per second (max 24 stacks). |
| Lightning Bug | Evo | Lightning + Brood Mother | Spawn | Lightning bug spawn | Spawns a lightning bug each time it hits an enemy. Lightning bugs attack a random enemy, dealing 1–80 damage to up to 3 nearby enemies. |
| Lightning Rod | Evo | Lightning + Iron | — | Lightning Rod | Plants a lightning rod into enemies it hits. These enemies are struck by lightning every 3.0 seconds, dealing 1–30 damage to up to 8 nearby enemies. |
| Lovestruck | Evo | Charm + (Light or Lightning or Time) | — | Lovestruck | Inflicts lovestruck on hit enemies for 20 seconds. Lovestruck units have a 50% chance of healing you for 5 health when they attack. |
| Maggot | Evo | Brood Mother + Cell | Spawn | Infest, Baby Ball Spawn | Infests enemies on hit with maggots. When they die, they explode into 1–2 baby balls. |
| Magma | Evo | Burn + Earthquake | — | Burn | Emits lava blobs over time. Enemies who walk into lava blobs are dealt 15–30 damage and gain 1 stack of burn (max 3 stacks). This ball and its lava blobs also deal 6–12 damage to nearby units. |
| Mosquito King | Evo (int → Nosferatu, Mosquito Kingdom) | Vampire + Brood Mother | Spawn | Mosquito Spawn, Lifesteal | Spawns a mosquito each time it hits an enemy. Mosquitos attack a random enemy, dealing 80–120 damage each. If a mosquito kills an enemy, they steal 1 health. |
| Mosquito Kingdom | Tier-3 | Mosquito King + Mosquito Swarm | Spawn | Mosquito Spawn, Lifesteal | Spawns 1–2 mosquitos each time it hits an enemy. Mosquitos attack a random enemy, dealing 100–150 damage each. If a mosquito kills an enemy, they steal 2 health. |
| Mosquito Swarm | Evo (int → Mosquito Kingdom) | Vampire + Egg Sac | Destroy, Spawn | Mosquito Spawn, Lifesteal | Explodes into 3–6 mosquitos. Mosquitos attack random enemies, dealing 80–120 damage each. If a mosquito kills an enemy, they steal 1 health. |
| Nosferatu | **Tier-3 (3-way)** | Vampire Lord + Spider Queen + Mosquito King | Spawn | Vampire Bat Spawn | Spawns a vampire bat each bounce. Vampire bats fly towards a random enemy, dealing 132–176 damage on hit, turning into a Vampire Lord. |
| Noxious | Evo | Wind + (Poison or Dark) | Pass Through | Poison | Passes through enemies and applies 3 stacks of poison to nearby enemies within a 2 tile radius. Poison lasts for 4 seconds and each stack deals 1–3 damage per second. |
| Nuclear Bomb | Evo | Bomb + Poison | Destroy, AOE | Radiation (full-screen AOE) | Explodes when hitting an enemy, dealing 300–500 damage to nearby enemies and applying 1 stack of radiation to everyone present indefinitely (max 5 stacks). Each stack of radiation increases damage received by 10%. Has a 3 second cooldown. |
| Offspring | Evo | Cell + Flesh | Spawn | Clone | Splits into a clone on hit 4 times. |
| Overgrowth | Evo | Earthquake + Cell | — | Overgrowth | Applies 1 stack of overgrowth. Upon reaching 3, consume all stacks and deal 150–200 damage to all enemies in a 3x3 tile square. |
| Petrify | Evo | Stone + Flesh | — | Petrify | Petrifies all enemies within its sightline for 1.5 seconds when first launched, dealing 50–120. |
| Phantom | Evo (int → Banshee) | Dark + Ghost | — | Curse | Curses enemies on hit. Cursed enemies are dealt 100–200 damage after being hit 5 times. |
| Radiation Beam | Evo (int → Tumor) | (Laser H or Laser V) + (Poison or Cell) | — | Radiation | Emits a radiation beam on hit that deals 24–48 damage and applies 1 stack of radiation (max 5 stacks, +10% damage taken per stack, 15 s). |
| Reaper | Tier-3 | Soul Sucker + Heart Swallower | — | Instant Kill | Has a 10% chance to kill enemies on impact, healing you for 5 health. |
| Sacrifice | Evo | Bleed + Dark | — | Bleed, Curse | Inflicts 4 stacks of bleed (max 15 stacks) and applies curse to hit enemies. Cursed enemies are dealt 50–100 after being hit 5 times. |
| Sandstorm | Evo | (Earthquake or Stone) + Wind | Pass Through | Blind | Goes through enemies and is surrounded by a raging storm dealing 10–20 damage per second and blinding nearby enemies for 3 seconds. |
| Satan | Tier-3 | Incubus + Succubus | — | Burn, Berserk | While active, adds 1 stack of burn to all active enemies per second (max 5 stacks, 10–20 damage per stack per second) and makes them go berserk (15–24 damage to adjacent enemies every second). |
| Shotgun | Evo (int → Sniper) | Iron + Egg Sac | Spawn | Baby Ball Spawn | Shoots 3–7 iron baby balls after hitting a wall. Iron baby balls move at 200% speed but are destroyed upon hitting anything. |
| Sniper | Tier-3 | Shotgun + Assassin | Pass Through, Spawn | Sniper Baby Ball Spawn | Pierces enemies and shoots 3–7 sniper baby balls after hitting a wall. Sniper baby balls pierce enemies but are destroyed upon hitting a wall. |
| Soul Sucker | Evo (int → Reaper) | Vampire + Ghost | Pass Through | Lifesteal, Attack Down | Passes through enemies and saps them, with a 30% chance of stealing 1 health and reducing their attack damage by 20%. |
| Spider Queen | Evo (int → Nosferatu) | Brood Mother + Egg Sac | Spawn | Baby Ball Spawn | Has a 25% chance of birthing an Egg Sac each time it hits an enemy. |
| Steel | Evo (int → Laser Cutter) | Iron + Stone | — | — | Initially deals double damage but moves 50% slower. Damage increases by 10% each time it hits an enemy (max 300%). |
| Storm | Evo (int → Armageddon) | Lightning + Wind | — | — | Emits lightning to strike nearby enemies every second, dealing 1–40 damage. |
| Succubus | Evo (int → Satan) | Charm + Vampire | — | Charm | Each hit has a 4% chance of charming the enemy for 9 seconds. Heals 1 when hitting a charmed enemy. |
| Sun | Evo (int → Black Hole) | Burn + Light | — | Blind, Burn | Blinds all enemies in view and adds 1 stack of burn every second (max 5 stacks). Burn lasts for 6 seconds and deals 6–12 damage per stack per second. |
| Swamp | Evo | Poison + Earthquake | — | Slow, Poison | Leaves behind tar blobs over time. Enemies who walk into tar blobs are dealt 15–30, are slowed by 50% for 7 seconds and gain 1 stack of poison (max 8 stacks). This ball and its tar blobs also deal 6–12 damage to nearby units. |
| Time Bomb | Evo | Time + Bomb | — | Time Bomb Spawn, Time Snare | Throws a time bomb every few seconds, which explodes after a delay, dealing 80–120 damage to nearby enemies. |
| Timestop | Evo | Time + Freeze | Destroy | Timestop | Freezes everything on the field for 5.0 seconds but destroys itself after hitting an enemy. Has a 30 second cooldown. |
| Tumor | Evo | Radiation Beam + Flesh | — | Tumor | Applies tumor on hit. Enemies with a tumor die after 40 seconds (except for bosses). |
| Vampire Lord | Evo (int → Nosferatu) | Vampire + (Bleed **or** Dark) | — | Bleed, Heal | Each hit inflicts 3 stacks of bleed. Heals 1 health and consumes all stacks when hitting an enemy with at least 10 stacks of bleed. |
| Venom | Evo | Poison + Freeze | — | Venom, Slow | Applies 1 stack of venom on hit (max 8 stacks). Each stack deals 3–6 damage per second and slows down enemies. |
| Virus | Evo | Poison + (Bleed or Ghost or Cell) | — | Disease | Applies 1 stack of disease to units it hits (max 8 stacks). Disease lasts 6 seconds; each stack deals 3–6 damage per second, and diseased units have a 15% chance per second of passing a stack to nearby enemies. |
| Voluptuous Egg Sac | Evo | Egg Sac + Cell | Destroy, Spawn | Baby Ball Spawn | Explodes into 2–3 egg sacs on hitting an enemy. Has a 3 second cooldown. |
| Warp | Evo | Time + Light | — | — | After each hit, warps to a random spot on the field and speeds up by 5%. |
| Wraith | Evo (int → Banshee) | Freeze + Ghost | Pass Through | Freeze | Freezes any enemy it passes through for 0.8 seconds. |
| X Ray | Tier-3 | Holy Laser + Laser Beam | — | Radiation | Emits an X-shaped laser on hit, which deals 50–75 damage to enemies and applies 1 stack of radiation (max 5 stacks; +10% damage taken per stack). |
| Zombie | Evo | Vampire + Flesh | — | Zombie Infection, Zombie Spawn | Infects enemies on hit, giving them a 40% chance to turn into a friendly zombie on death. |

Count check: 69 evolved balls in the wiki table (68 two-component + Elemental as a
4-way; Nosferatu is the only 3-way). Cross-checked against the reference image:
the matrix shows the same pairings, including the "or" alternates and the single
"Elemental" 4-way row at the bottom.

**Fusion rules worth encoding** (from Balls + Fusion Mechanics pages):

- Evolutions require level-3 (max level) component balls, combined in the Fusion Reactor.
- Order of components never changes the result for evolved balls.
- If two balls can evolve into an evolved ball, they cannot be merely fused — except
  pairs whose only shared evolution needs 3+ balls (Nosferatu, Elemental components).
- Fusing two Destroy balls may lose one of their abilities (community-noted caveat).
- Fused-ball fusion (no unique result) is out of scope for the site per map.md.

---

## 2. Passives

54 base passives + 17 evolved passives. Passives can be leveled to 3 in-run and
evolved in the Fusion Reactor (but not fused). Some base passives only appear if a
requirement is met (noted).

### 2.1 Base Passives (54)

| Passive | Effect text (wiki) | Appearance requirement | Unlock |
|---|---|---|---|
| Archer's Effigy | Every 7–12 rows, spawn a stone archer with 160 health on your side. Shoots arrows at enemies, dealing 10–20 each. Immune to ball damage. | — | Clear The SNOWYxSHORES |
| Artificial Heart | Friendly pieces gain 100% more health | needs another "friendly pieces" passive | default |
| Baby Rattle | Gain 1.5x baby balls, but your aim becomes scattered | — | default |
| Bandage Roll | Shoot 1–2 baby balls each time you're healed | — | default |
| Bottled Tornado | When you catch a special ball, automatically shoot 1–3 new baby balls in random directions | — | default |
| Breastplate | Decrease damage taken by 10% | — | default |
| Crown of Thorns | Destroy the 2 nearest enemies when you are hit from close range | — | default |
| Cursed Elixir | When a poisoned enemy dies, 10% chance to come back as a zombie with 240 health | needs a Poison-applying ball | Clear The BONExYARD |
| Deadeye's Amulet | Critical hits deal 10–15 bonus damage | — | Clear The LIMINALxDESERT |
| Diamond Hilted Dagger | Increase crit chance to 20% when hitting enemies in the front | — | default |
| Dynamite | Every 5–10 rows, spawn an enemy with dynamite attached. Destroying them deals 200–500 damage to nearby enemies | — | Clear The SMOLDERINGxDEPTHS |
| Emerald Hilted Dagger | Increase crit chance to 20% when hitting enemies on their right side | — | default |
| Ethereal Cloak | Balls go through enemies and deal 25% bonus damage until they hit the back of the field | — | default |
| Everflowing Goblet | You can heal past your max health at 20% efficiency | — | default |
| Eye of the Beholder | 10% chance to dodge incoming attacks | — | default |
| Fleet Feet | Increase movement speed by 10% and move at full speed while shooting | — | default |
| Frozen Spike | When an enemy is frozen, they emit a chill to nearby enemies that deals 10–20 damage | needs a Freeze-applying ball | default |
| Gemspring | Every 7–11 rows, spawn a Gemspring. Damaging it drops an increasing amount of XP gems | — | Clear The SMOLDERINGxDEPTHS |
| Ghostly Corset | Balls go through enemies and deal 20% bonus damage when hitting them from the side | — | Clear The HEAVENLYxGATES |
| Ghostly Shield | Balls go through allies and heal them for 2 health | needs an "allies" passive | Clear The HEAVENLYxGATES |
| Golden Bull | Every 7–11 rows, spawn a golden bull with 400 health; accrues 10 gold/minute; moves up the field blocking/attacking | — | Clear The SNOWYxSHORES |
| Hand Fan | Slow down enemies in the same column as you by 50% | — | Clear The GORYxGRASSLANDS |
| Hand Mirror | Projectiles have a 50% chance to reflect upon hitting you, dealing 20–40 damage if they hit an enemy | — | Clear The GORYxGRASSLANDS |
| Healer's Effigy | Every 7–12 rows, spawn a stone healer with 100 health; heals you 10 health/minute | — | Clear The SNOWYxSHORES |
| Hourglass | Balls deal 150% damage, but damage decays by 30% each bounce (min 50%) | — | default |
| Iron Onesie | Balls deal 0.5% more damage for each baby ball on the field | — | default |
| Kiss of Death | Charmed enemies have a 10% chance of dying after recovering | needs a Charm-applying ball | default |
| Lover's Quiver | Projectiles have a 40% chance to heal you for 1 health instead of hurting you | — | Clear The GORYxGRASSLANDS |
| Magic Staff | Increase area-of-effect damage (earthquake, laser, lightning) by 20% | — | default |
| Magnet | Increase range at which you pick up items and catch balls by 1.0 tiles | — | default |
| Midnight Oil | Balls that hit flaming enemies light on fire and deal 10–20 bonus fire damage on the next hit | needs a Burn-applying ball | default |
| Platinum Dumbbell | Balls deal 12% bonus damage until they hit the back of the field | — | unclear ("Clear ?") |
| Pressure Valve | Enemies explode on death, dealing 20–30 damage to adjacent enemies | — | Clear The BONExYARD |
| Protective Charm | Gain a shield that blocks the next damage; recharges after 60 seconds | — | Clear The FUNGALxFOREST |
| Radiant Feather | Increases ball launch speed by 20%, but you get knocked back a little each shot | — | default |
| Reacher's Spear | Increase crit chance to 20% when hitting enemies in the same column as you | — | default |
| Rubber Headband | Balls start at 70% speed but increase by 20% each bounce (max 200%) | — | default |
| Ruby Hilted Dagger | Increase crit chance to 15% when hitting enemies in the back | — | default |
| Sapphire Hilted Dagger | Increase crit chance to 30% when hitting enemies on their left side | — | default |
| Shortbow | Increase fire rate by 15% | — | default |
| Silver Blindfold | Increase crit chance to 20% when hitting blinded enemies | — | Clear The LIMINALxDESERT |
| Silver Bullet | Balls deal 20% bonus damage until they hit a wall | — | default |
| Slingshot | 25% chance to launch a baby ball when you pick up a gem | — | default |
| Spiked Collar | Deal 30–50 to enemies the first time you get into their melee attack range | — | Clear The FUNGALxFOREST |
| Stone Effigy | Every 7–12 rows, spawn a stone soldier with 200 health; moves up the field blocking/attacking | — | default |
| Sword Breaker | Balls deal 40% less damage, but gain 1% damage for each enemy on the field | — | unclear ("?") |
| Traitor's Cowl | Stone allies can now be damaged by your balls, but you heal 2 health when a ball hits one | needs a "stone allies" passive | Clear The HEAVENLYxGATES |
| Turret | Floats around your character and shoots a baby ball at enemies every 2.0 seconds | — | default |
| Upturned Hatchet | Balls deal 80% more damage after hitting the back of the field, otherwise damage reduced by 20% | — | default |
| Vampiric Sword | Each kill heals you by 5, but each shot you take deals 2 damage to you | — | Clear The LIMINALxDESERT |
| Voodoo Doll | Curse has a 10% chance of killing enemies | needs a Curse-applying ball | Clear The BONExYARD |
| Wagon Wheel | Each time a ball hits a wall, it deals 30% extra damage on the next hit | — | Clear The SMOLDERINGxDEPTHS |
| War Horn | All baby balls deal 20% more damage | — | default |
| Wretched Onion | Deal 6–12 per second to enemies within 2 tiles | — | Clear The FUNGALxFOREST |

### 2.2 Evolved Passives (17)

| Passive | Recipe | Effect text (wiki) |
|---|---|---|
| Ardent Tire | Wagon Wheel + Rubber Headband | Each bounce increases ball speed by 10% and damage by 5%. |
| Argent Stopwatch | Hourglass + Silver Bullet | Balls deal 200% damage, but damage decays by 20% each bounce (minimum 100%). |
| Arrow of Fate | Lover's Quiver + Hand Mirror | Projectiles no longer hurt you. Shoot 1–2 baby balls when hit by a projectile. |
| Cornucopia | Baby Rattle + War Horn | Each time baby balls are created, spawn 0–1 additional baby balls. |
| Deadeye's Cross | Diamond + Sapphire + Ruby + Emerald Hilted Dagger (**4-way**) | Increase critical hit chance to 60%. |
| Deadeye's Impaler | Deadeye's Cross + Gracious Impaler | Increase critical hit chance to 5%. Critical hits instantly kill non-boss enemies. |
| Full Metal Rapier | Iron Onesie + Sword Breaker | Balls deal 1% more damage for each baby ball and enemy on the field. |
| Gracious Impaler | Reacher's Spear + Deadeye's Amulet | Critical hits have a 5% chance to instantly kill enemies. |
| Grotesque Artillery | Turret + Hand Fan | Floats around your character and shoots a random level 1 unevolved special ball at enemies every 8.0 seconds. |
| Inglorious Hammer | Platinum Dumbbell + Upturned Hatchet | When balls hit a wall or the back of the field, they hit a random enemy with 50% bonus damage. |
| Odiferous Shell | Wretched Onion + Breastplate | When you touch enemies, they have a 50% chance of instantly dying. |
| Phantom Regalia | Ghostly Corset + Ethereal Cloak | Balls go through enemies until they hit the back wall. Balls deal 50% more damage when going through enemies. |
| Remote Detonator | Pressure Valve + Magnet | Enemies spawn a level 1 bomb ball upon dying. |
| Soul Reaver | Vampiric Sword + Everflowing Goblet | Each kill heals you by 1 and you can heal past your max health at 30% efficiency. |
| Tormenters Mask | Spiked Collar + Crown of Thorns | Enemies have a 10% chance of dying immediately the first time they detect you. |
| Windweaver | Bottled Tornado + Slingshot | Shoot a level 1 wind ball every time you pick up a gem. |
| Wings of the Anointed | Radiant Feather + Fleet Feet | Balls move 40% faster and you move 20% faster. No longer affected by environmental hazards on the ground. |

Two evolution chains exist: Dagger quartet → Deadeye's Cross → Deadeye's Impaler
(two-stage), and Reacher's Spear + Deadeye's Amulet → Gracious Impaler → (with
Deadeye's Cross) → Deadeye's Impaler. The passive graph is shallower than the ball
graph; only Deadeye's Impaler is a tier-3-equivalent.

---

## 3. Characters (23)

Unlock = build the named house; blueprints drop in the named level. The Warrior is
the default. The False Messiah is PC-exclusive via the Twitch extension.

| Character | Base ball | Ability (wiki text, abridged) | Unlock | Synergy-relevant facts |
|---|---|---|---|---|
| The Warrior | Bleed | Default character, no special gameplay quirks. | available at start | no quirk — neutral to all tags |
| The Itchy Finger | Burn | Scattered aim, shoots twice as fast, auto-launches balls; full speed while shooting. | Sheriff's Office (BONExYARD) | scattered aim degrades aimed single-target play |
| The Repentant | Freeze | Balls deal +5% damage per bounce; on hitting the back wall they return, damaging enemies passed through. | Haunted House (BONExYARD) | rewards bounce-scaling balls |
| The Cohabitants | Brood Mother | Each launched ball is mirrored by a copy; balls deal half damage. | Cozy Home (BONExYARD) | doubles spawns/AOE coverage |
| The Cogitator | Laser (Vertical) | Automatically chooses upgrades. | Villa (SNOWYxSHORES) | removes upgrade agency |
| The Embedded | Poison | Balls always pierce enemies until they hit a wall. | Veteran's Hut (SNOWYxSHORES) | innate pass-through |
| The Shade | Dark | Balls shoot from the back; base crit chance 10%. | Mausoleum (LIMINALxDESERT) | rewards backstabs (Assassin synergy) |
| The Shieldbearer | Iron | Large shield bounces back balls that hit it. | Iron Fortress (FUNGALxFOREST) | reclaims balls; anti-Destroy synergy |
| The Spendthrift | Vampire | Shoots all balls at once in a wide arc. | Mansion (FUNGALxFOREST) | volley fire, no per-ball aim |
| The Juggler | Lightning | Lobs balls at a target position; no bouncing until landing. | Theater (GORYxGRASSLANDS) | aimed placement |
| The Empty Nester | Ghost | **No baby balls.** Each shot shoots multiple instances of one equipped special ball. | Single Family Home (SNOWYxSHORES) | **red for spawns-baby-balls tags** |
| The Flagellant | Egg Sac | Balls bounce normally off the bottom of the screen. | Monastery (GORYxGRASSLANDS) | keeps balls in play |
| The Makeshift Sisyphus | Earthquake | **No baby balls.** No direct hit damage; AOE and status damage ×4. | Rocky Hill (LIMINALxDESERT) | **red for single-target; green for aoe/status** |
| The Physicist | Light | Balls are affected by gravity toward the back of the screen. | Laboratory (FUNGALxFOREST) | trajectory quirk |
| The Tactician | Iron | Battles become turn-based. | Captain's Quarters (SMOLDERINGxDEPTHS) | changes pacing entirely |
| The Radical | Wind | Plays the game and chooses upgrades automatically (AI plays). | Campground (HEAVENLYxGATES) | no player agency |
| The Falconer | Lightning | Balls shot from two falcons on the sides of the screen. | Falconry Hut (HEAVENLYxGATES) | side-entry trajectories |
| The Carouser | Charm | Balls can briefly orbit the player on return trajectory. | Party House (VASTxVOID) | keeps balls near |
| The Tunneller | Earthquake | Balls wrap around top and bottom of the screen. | Stone Domain (SMOLDERINGxDEPTHS) | vertical wrap |
| The Tiptoer | Laser (Horizontal) | Undetectable by enemies (except bosses/minibosses); drastically less health. | Hidden Temple (SMOLDERINGxDEPTHS) | survival via stealth |
| The Hoary Hoarder | *none* | Only 2 ball slots; remaining equipment slots become passive slots. | Unstable Tower (HEAVENLYxGATES) | **no base ball** — passive-heavy builds |
| The Ballbearer | Stone | Twice as many ball slots, but no passive slots. | Ball House (VASTxVOID) | ball-heavy, **zero passives** |
| The False Messiah | Bleed | Twitch audience votes on choices and random events. | Twitch extension (PC only) | interactive stream quirk |

The wiki states 23 playable characters; the table lists 23 rows including Warrior
and False Messiah. (Map note said ~21 — the count has grown with updates.)

**AoE-incompatible / tag-relevant characters** (for verdict rules):
The Empty Nester and The Makeshift Sisyphus have **no baby balls** → any
`spawns-baby-balls` tag is red for them; baby-ball-scaling passives (Baby Rattle,
War Horn, Iron Onesie, Cornucopia, Full Metal Rapier, Slingshot, Bottled Tornado,
Bandage Roll) are also red for them. The Makeshift Sisyphus has no direct hit
damage → `single-target`-only balls are red, `aoe`/status is green (×4). The
Ballbearer runs no passives → all passive tags effectively dead. The Hoary Hoarder
has no base ball → base-ball-dependent tags n/a.

---

## 4. Proposed synergy tag list

Tags attach to balls and passives; characters carry `{tag, verdict: green|red, note}`
rules. Indicators render from tag overlap; red wins with 2 characters selected.

Proposed tags:

| Tag | Meaning | Example carriers |
|---|---|---|
| `aoe` | damages multiple enemies / area damage | Earthquake, Laser H/V, Lightning, Bomb, Nuclear Bomb, Flash, Flicker, Armageddon, Magic Staff |
| `single-target` | pure single-hit damage, no area or status | Dark, Iron, Stone, Steel, Drill, Assassin |
| `spawns-baby-balls` | creates baby balls | Brood Mother, Egg Sac, Catapult, Shotgun, Maggot, Cornucopia, Baby Rattle, Turret, Slingshot |
| `spawns-allies` | spawns summons/friendly units | Cell, Offspring, Lightning Bug, Mosquito family, Zombie, Cursed Elixir, Archer's/Stone/Healer's Effigy, Golden Bull |
| `status-effect` | applies status effects (poison/burn/freeze/curse/…) | Bleed, Burn, Poison, Freeze, Charm, Vampire Lord, Brimstone, Venom, Virus |
| `pass-through` | pierces enemies | Ghost, Wind, Ethereal Cloak, Phantom Regalia, Drill, Noxious, Erosion, Wraith, Soul Sucker |
| `destroy-on-hit` | ball is consumed on hit | Dark, Egg Sac, Time, Bomb, Landslide, Black Hole, Timestop, Fireworks, Mosquito Swarm |
| `lifesteal` / `healing` | heals the player | Vampire, Succubus, Mosquito family, Vampiric Sword, Soul Reaver, Bandage Roll |
| `self-damage` | costs player health | Vampiric Sword |
| `ball-speed` | scales ball speed | Flesh, Warp, Rubber Headband, Ardent Tire, Wings of the Anointed, Radiant Feather |
| `bounce-scaling` | scales with bounces | Steel, Hourglass, Ardent Tire, Repentant (green) |
| `crit` | crit chance/damage | daggers, Deadeye line, Shade (green) |
| `wall-bounce` | interacts with walls | Wagon Wheel, Silver Bullet, Inglorious Hammer, Upturned Hatchet |
| `baby-ball-scaling` | scales off baby-ball count | Iron Onesie, War Horn, Full Metal Rapier |
| `screen-clear` | full-screen effect | Flash, Flicker, Sun, Timestop, Nuclear Bomb (partial) |
| `clone` | spawns clones of the ball | Cell, Offspring |
| `friendly-fire-risk` | can hurt player allies/mechanics | Traitor's Cowl interactions |

Per-character verdicts (proposed starting set; refine during implementation):

| Character | Green tags | Red tags |
|---|---|---|
| The Warrior | (none — neutral) | (none) |
| The Itchy Finger | `spawns-baby-balls` (more shots) | `single-target` (scattered aim) |
| The Repentant | `bounce-scaling` | `destroy-on-hit` (no bounces to scale) |
| The Cohabitants | `aoe`, `spawns-baby-balls`, `spawns-allies` | `single-target` (half damage) |
| The Cogitator | (none) | (none) |
| The Embedded | `pass-through`, `status-effect` | `wall-bounce` (balls never hit wall) |
| The Shade | `crit`, `single-target` | (none) |
| The Shieldbearer | `destroy-on-hit` (ball returns) | (none) |
| The Spendthrift | `aoe` (wide arc) | (none) |
| The Juggler | `aoe` (aimed landing) | `bounce-scaling` (no bouncing until landing) |
| The Empty Nester | `single-target`, `aoe` (multi-shot) | `spawns-baby-balls`, `baby-ball-scaling` (**no baby balls**) |
| The Flagellant | `spawns-baby-balls` | (none) |
| The Makeshift Sisyphus | `aoe`, `status-effect` (×4 damage) | `single-target`, `spawns-baby-balls` (**no baby balls, no direct hits**) |
| The Physicist | (none) | (none) |
| The Tactician | (none) | (none) |
| The Radical | (none) | (none) |
| The Falconer | `aoe` (two lanes) | (none) |
| The Carouser | (none) | (none) |
| The Tunneller | `aoe` | (none) |
| The Tiptoer | `single-target` (stealth safety) | (none) |
| The Hoary Hoarder | `status-effect`, `crit` (passive-heavy) | `spawns-baby-balls` (fewer slots) — uncertain, needs playtesting |
| The Ballbearer | `single-target`, `aoe` (more balls) | all passive-side tags (**no passive slots**) |
| The False Messiah | (none) | (none) |

Marked **uncertain**: the verdict table above is a proposal derived from quirk text,
not playtested. Wiki pages do not define a synergy-tag system — this is the site's
own model (per map.md), so verdicts are editorial.

---

## 5. Icon sources

Icons live on the wiki at predictable URLs. Verified patterns (all tested 200):

- Ball / passive / evolved icons: `https://ballxpit.wiki.gg/images/<Name>.png`
  — e.g. [`https://ballxpit.wiki.gg/images/Bleed.png`](https://ballxpit.wiki.gg/images/Bleed.png),
  [`https://ballxpit.wiki.gg/images/Vampire_Lord.png`](https://ballxpit.wiki.gg/images/Vampire_Lord.png),
  [`https://ballxpit.wiki.gg/images/Archer%27s_Effigy.png`](https://ballxpit.wiki.gg/images/Archer%27s_Effigy.png),
  [`https://ballxpit.wiki.gg/images/Laser_(Horizontal).png`](https://ballxpit.wiki.gg/images/Laser_(Horizontal).png)
- Character icons: `https://ballxpit.wiki.gg/images/The_<Name>_mini.png`
  — e.g. [`https://ballxpit.wiki.gg/images/The_Warrior_mini.png`](https://ballxpit.wiki.gg/images/The_Warrior_mini.png),
  [`https://ballxpit.wiki.gg/images/The_Hoary_Hoarder_mini.png`](https://ballxpit.wiki.gg/images/The_Hoary_Hoarder_mini.png)
- Spaces become underscores; apostrophes become `%27`. Parentheses are literal.
- Canonical resolver (follows redirect to the hashed URL):
  `https://ballxpit.wiki.gg/wiki/Special:FilePath/<File_name>` — e.g.
  `https://ballxpit.wiki.gg/wiki/Special:FilePath/Bleed.png`
- The wiki templates reference icons as `[[File:<Name>.png]]` for every
  ball/passive/character, so the `<Name>.png` pattern covers the full inventory.
  Baby Ball: `https://ballxpit.wiki.gg/images/Baby_Ball.png` (verified 200).

Licensing note: wiki.gg media is game art (Kenny Sun's Ball x Pit). Self-hosting
the icons on a fan companion site is presumably fair use, but the site should carry
a credit line ("Ball x Pit © Kenny Sun; icons from ballxpit.wiki.gg"). Flagging as
a decision for the licensing ticket — not resolved here.

**Sourcing pipeline suggestion**: batch-download via `Special:FilePath/<Name>.png`
(redirects to the canonical `/images/` URL) with a polite rate limit; the wiki is
Cloudflare-protected against burst traffic (we got 403-challenged on rapid hits —
keep ~3–5 s between requests, and a descriptive User-Agent helped).

---

## Uncertainty summary

- Damage/status numbers are wiki-as-of-2026-09-13, game v1.301; wiki pages carry a
  `{{Stub}}` template and a TODO about damage types — re-verify on game patches.
- `Erosion` status effect is listed as "?" on the wiki; `Laser Cutter` on-hit/status
  triggers are "?" too; `Overgrowth` AOE is marked "AOE?".
- `Platinum Dumbbell` and `Sword Breaker` unlock conditions are unknown ("Clear ?").
- The synergy tag list and per-character verdicts are the site's own model —
  editorial, needs playtesting validation.
- Character count (23) and evolved-ball count (69) are current as of the
  Naturalist update; the map.md note said ~21 characters / 42 evolutions — both
  have grown, so the data model should tolerate additions.
