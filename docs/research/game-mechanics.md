# Ball x Pit — Game mechanics fact base

Research for the ball-x-pit-companion site data files: the source the data
pipeline (`scripts/parse-wiki.ts`) parses into `src/data/`.

**Primary sources** (fetched 2026-09-13):

- Balls: <https://ballxpit.wiki.gg/wiki/Balls>
- Passives: <https://ballxpit.wiki.gg/wiki/Passives>
- Characters: <https://ballxpit.wiki.gg/wiki/Characters>
- Fusion rules: <https://ballxpit.wiki.gg/wiki/Fusion_Mechanics> (redirects into Balls)

**Cross-check source**: "the-ultimate-guide-of-evolutions-{1,2}.{webp,png}"
("Ultimate Guide of Evolutions" by CoupDeGlace, game version 1.301, Naturalist update,
dated Aug 13 2026; local copies were kept in a gitignored `references/` directory
and are not part of the repo). Image 1 is the tier-grouped recipe list; image 2 is the full
21×21 base-ball fusion matrix plus Tier-2/Tier-3/Passive/Elemental summaries.
Both sources agree — no contradictions found. The wiki pages carry a `{{Stub}}`
notice and a TODO about damage types, so numbers below are wiki-as-of-date and
should be re-verified on game updates.

**Datamined source**: *BALL x PIT v1.308, Risen Ballbylon* (Unity 6000.0.62f1,
IL2CPP), extracted 2026-11-13 from `game-data/BALLxPIT/`; the decoded package
(`game-data/extracted/`) is not committed. DLC rows below are the v1.308
datamine; all other rows are wiki v1.301.

**Terminology note**: the datamined catalog distinguishes **Base Balls** (25,
offered on level-up), **Evolved Balls** (89, made from 2+ specific level-3 balls
in the Fusion Reactor), and
**Fused Balls** (any other 2-ball combo). This fact base covers the named
evolutions only; property-stacking fusions are modeled separately by the
site's editorial composer (`docs/research/fusion-mechanics.md`, `src/fusion.ts`).
The site's "tier" grouping = evolution depth: Basic / Evolved (level-2) / Tier-3.
Intermediate evolved balls that feed further evolutions are marked
**Evo-intermediate** below.

---

## 1. Balls

### 1.1 Base Balls (25)

All base balls are "Basic" tier. Unlock "default" = available from the start.
Rows for the 4 DLC base balls (Beast, Force, Water, Wood) are from the v1.308
datamine; all other rows are wiki v1.301. DLC unlock conditions are unknown.

| Ball | On-hit effect | Status trigger(s) | Status effect | Effect text (wiki) | Character(s) | Unlock | Edition |
|---|---|---|---|---|---|---|---|
| Beast | Attach | On-Hit | Attach | Attaches to enemies, dealing 50–100 damage per second until it's dead. | The Scandalmonger | — | dlc-risen-ballbylon |
| Bleed | — | On-Hit | Bleed | Inflicts 2 stacks of bleed. Bleeding enemies receive 1 damage per stack when hit by a ball (max 8 stacks). | The Warrior, The False Messiah | default | base-game |
| Brood Mother | Spawn | On-Hit, Spawn | Baby Ball Spawn | Has a 25% chance of birthing a baby ball each time it hits an enemy. | The Cohabitants | default | base-game |
| Burn | — | On-Hit | Burn | Add 1 stack of burn on hit for 3 seconds (max 3 stacks). Burnt units are dealt 4–8 damage per stack per second. | The Itchy Finger | default | base-game |
| Cell | Spawn | On-Hit | Clone | Splits into a clone on hit 2 times. | — | Clear The FUNGALxFOREST | base-game |
| Charm | — | On-Hit | Charm | Each hit has a 4% chance of charming the enemy for 5 seconds. Charmed units walk up the board and attack enemies. | The Carouser | Clear The HEAVENLYxGATES | base-game |
| Dark | Destroy | On-Hit | — | Deals 3.0x damage but destroys itself after hitting an enemy. Has a 3 second cooldown before it can be shot again. | The Shade | Clear The BONExYARD | base-game |
| Earthquake | AOE | On-Hit, AOE | — | Deals 5–13 damage to nearby units in a 3x3 tile square. | The Makeshift Sisyphus, The Tunneller | default | base-game |
| Egg Sac | Destroy, Spawn | On-Hit, Baby Ball | Baby Ball Spawn | Explodes into 2–4 baby balls on hitting an enemy. Has a 3 second cooldown before it can be shot again. | The Flagellant | default | base-game |
| Flesh | — | On-Hit | — | Speed increases by 25% per bounce. | — | Clear The GORYxGRASSLANDS | base-game |
| Force | Pass Through | On-Hit | — | Pierces enemies. Damage increases by 10% each time it hits an enemy (max 200%). | The Scrupulous Scoundrel, The Sentinel | — | dlc-risen-ballbylon |
| Freeze | — | On-Hit | Freeze | Has a 4% chance to freeze enemies for 5.0 seconds. Frozen enemies receive 25% more damage. | The Repentant | default | base-game |
| Ghost | Pass Through | On-Hit | — | Passes through enemies. | The Empty Nester | default | base-game |
| Iron | — | On-Hit | — | Deals double damage but moves 40% slower. | The Shieldbearer, The Tactician | default | base-game |
| Laser (Horizontal) | AOE | On-Hit, AOE | — | Deals 9–18 damage to all enemies in the same row. | The Tiptoer | default | base-game |
| Laser (Vertical) | AOE | On-Hit, AOE | — | Deals 9–18 damage to all enemies in the same column. | The Cogitator | default | base-game |
| Light | — | On-Hit | Blind | Blinds enemies on hit for 3 seconds. Blinded units have a hard time detecting you and have a 50% chance of missing when they attack. | The Physicist | Clear The LIMINALxDESERT | base-game |
| Lightning | AOE | On-Hit, AOE | — | Deals 1–20 damage to up to 3 nearby enemies. | The Juggler, The Falconer | default | base-game |
| Poison | — | On-Hit | Poison | Applies 1 stack of poison on hit (max 5 stacks). Poison lasts for 6 seconds and each stack deals 1–4 damage per second. | The Embedded | default | base-game |
| Stone | — | On-Hit | — | Initially deals 300% damage. Damage erodes by 40% each time hitting an enemy (minimum 50%). | — | Clear The SNOWYxSHORES | base-game |
| Time | Destroy | On-Hit, AOE | Time Snare | Explodes into a time snare upon hitting an enemy, which stays on the field for 2.0 seconds and freezes enemies inside it. | — | Clear The SMOLDERINGxDEPTHS | base-game |
| Vampire | — | On-Hit | Heal | Each hit has a 4.5% chance of healing 1 health. | The Spendthrift | default | base-game |
| Water | Spawn, AOE | On-Hit, AOE | Baby Ball Spawn | Explodes into 3–5 baby water balls on hitting an enemy, dealing 30–80 damage to nearby enemies. Baby water balls deal reduced damage to an area around them on hit. Has a 3 second cooldown before it can be shot again. | — | — | dlc-risen-ballbylon |
| Wind | Pass Through | On-Hit | Slow | Passes through enemies and slows them down by 30% for 5 seconds, but deals 25% less damage. | The Radical | default | base-game |
| Wood | AOE | On-Hit, AOE | — | Deals 3–8 damage to nearby enemies. AOE damage increases by 10% each hit (max 200%). | The Potager | — | dlc-risen-ballbylon |

Plus the **Baby Ball** (not a special ball): base attack ball, no special abilities;
all characters start with a few except The Empty Nester and The Makeshift Sisyphus.

### 1.2 Evolved Balls (89)

Depth column: **Evo** = level-2 evolution (from base balls only); **Evo-int** =
evolved ball that also feeds a further evolution; **Tier-3** = evolution requiring
evolved balls as components. Recipes are order-independent; "(X or Y)" marks an
alternate component. Rows for the 20 DLC evolved balls and the 6 changed recipes
(Blizzard, Venom, Overgrowth, Spider Queen, Storm, Swamp) are from the v1.308
datamine; all other rows are wiki v1.301. Recipes that cannot be factorized
into a slot alternate use adjacent duplicate rows (Overgrowth, Swamp).

| Ball | Depth | Recipe(s) | On-hit | Status effects | Effect text (wiki) | Edition |
|---|---|---|---|---|---|---|
| Armageddon | Tier-3 | Inferno + Storm | Destroy, AOE | — | Creates a meteor shower upon hitting an enemy. The meteor shower lasts for 5 seconds and deals 30–50 damage/second to enemies within a 3 tile radius. | base-game |
| Ash | Evo | Wood + Burn | Pass Through | Burn | Goes through enemies and leaves behind a trail of ash for the first 5.0 seconds after being launched. Ash lasts for 6.0 seconds and applies 1 stack of burn per second (max 4 stacks). Burn lasts for 6 seconds. Burnt units are dealt 2–5 damage per stack per second. | dlc-risen-ballbylon |
| Assassin | Evo | Iron + (Ghost or Dark) | Pass Through | — | Passes through the front of enemies, but not the back. Backstabs deal 30% bonus damage. | base-game |
| Banished Flame | Evo | Dark + Burn | — | Darkflame | Add 1 stack of darkflame on hit for 2 seconds (max 6 stacks). Darkflame deals 1–30 damage per stack per second. When the darkflame goes out, it deals 1–100 to the enemy. | base-game |
| Banshee | Tier-3 | Phantom + Wraith | — | Curse | Curses all enemies while on the field when launched. Cursed enemies are dealt 150–300 after being hit 6 times. | base-game |
| Berserk | Evo | Charm + (Bleed or Burn) | — | Berserk | Each hit has a 30% chance of causing enemies to go berserk for 6 seconds. Berserk enemies deal 15–24 damage to adjacent enemies every second. | base-game |
| Black Hole | Tier-3 | Sun + (Dark or Time) | Destroy | Instant Kill | Instantly kills the first non-boss enemy that it hits, but destroys itself afterwards. Has a 7 second cooldown before it can be shot again. | base-game |
| Blizzard | Evo | Freeze + (Wind or Lightning or Water) | — | Freeze (AOE) | Freezes all enemies within a 2 tile radius for 0.8 seconds, dealing 1–50 damage. | base-game |
| Bomb | Evo | Burn + Iron | Destroy | — | Explodes when hitting an enemy, dealing 150–300 damage to nearby enemies. Has a 3 second cooldown before it can be shot again. | base-game |
| Brimstone | Evo | Burn + (Stone or Poison) | — | Burn, Poison | Applies 1 stack of burn and poison every second to all enemies within a 2 tile radius (max 4 stacks). Burn deals 1–4 damage per stack per second and poison deals 2–3 damage per stack per second. | base-game |
| Bullet | Evo | Iron + Force | Pass Through | — | Pierces enemies. Initially deals 1000% damage. Damage erodes by 200% each time hitting an enemy (minimum 100%). | dlc-risen-ballbylon |
| Catapult | Evo | Stone + Egg Sac | — | Baby Ball Spawn | Launches 3–5 stone baby balls every 1.5 seconds, which are destroyed after hitting anything. | base-game |
| Drill | Evo | Earthquake + Iron | Pass Through | — | Pierces enemies and deals 50% bonus damage until reaching the back of the field. | base-game |
| Elemental | Evo (4-way) | Burn + Wind + Freeze + Earthquake | — | Burn, Slow, Freeze | Applies a random status effect (burn, slow, or freeze) to nearby enemies on hit. | base-game |
| Erosion | Evo | Time + Wind | Pass Through | ? | Passes through enemies. Deals 3% of enemy's current health as bonus damage on hit. | base-game |
| Fireworks | Evo | Burn + Egg Sac | Destroy | Firework Spawn, Burn | Explodes into 3–6 fireworks. Fireworks target random enemies, dealing 20–30 damage and applying 1 stack of burn. | base-game |
| Flash | Evo | Lightning + Light | — | Blind (full screen) | Damages all enemies on screen for 1–3 damage after hitting an enemy and blinds them for 2 seconds. | base-game |
| Flesh Mound | Evo | Brood Mother + Flesh | — | Fleshy Baby Ball Spawn | Emits a fleshy baby ball in a random direction every 1.0 seconds. | base-game |
| Flicker | Evo | Light + Dark | — | — | Deals 1–7 damage to every enemy on screen every 1.4 seconds. | base-game |
| Freeze Ray | Evo | Freeze + (Laser H or Laser V) | — | Freeze | Emits a freeze ray when hitting an enemy, dealing 20–50 to all enemies in its path, with a 10% chance of freezing them for 10.0 seconds. | base-game |
| Frozen Flame | Evo | Burn + Freeze | — | Frostburn | Add 1 stack of frostburn on hit for 20 seconds (max 4 stacks). Frostburnt units are dealt 8–12 damage per stack per second and receive 25% more damage from other sources. | base-game |
| Fruit | Evo | Wood + Cell | Destroy | Heal | Destroyed after hitting 3 enemies, but heals you by 5 if it returns to you. | dlc-risen-ballbylon |
| Gale | Evo | Force + Wind | AOE | Knock-Up | Knocks enemies into the air briefly, allowing balls to pass under them. Enemies are hurt for 100–150 damage upon falling back to the ground. | dlc-risen-ballbylon |
| Glacier | Evo | Freeze + (Earthquake or Stone) | — | Freeze | Releases glacial spikes over time that deal 15–30 to enemies that touch them and freeze them for 2.0 seconds. This ball and its glacial spikes also deal 6–12 damage to nearby units. | base-game |
| Heart Swallower | Evo (int → Reaper) | Bleed + Ghost | — | Lifesteal, Attack Down | Saps enemies on hit, with a 40% chance of stealing 1 health and reducing their attack damage by 20%. | base-game |
| Hedgehog | Evo | Beast + Bleed | Spawn | Bleed, Baby Ball Spawn | Inflicts 3 stacks of bleed (max 10 stacks) and emits 1–3 spiky baby balls on hitting an enemy. | dlc-risen-ballbylon |
| Hemorrhage | Evo | Bleed + (Iron or Flesh) | — | Bleed | Inflicts 3 stacks of bleed. When hitting an enemy with 12+ stacks of bleed, consumes all stacks to deal 20% of their current health. | base-game |
| Holy Laser | Evo (int → X Ray) | Laser (Horizontal) + Laser (Vertical) | — | — | Deals 24–36 damage to all enemies in the same row and column. | base-game |
| Incubus | Evo (int → Satan) | Charm + Dark | — | Charm, Curse | Each hit has a 4% chance of charming the enemy for 9 seconds. Charmed enemies curse nearby enemies. Cursed enemies are dealt 100–200 after being hit 5 times. | base-game |
| Inferno | Evo (int → Armageddon) | Burn + (Wind or Time) | — | Burn | Applies 1 stack of burn every second to all enemies within a 2 tile radius. Burn lasts for 6 seconds, dealing 3–7 damage per stack per second. | base-game |
| Ironwood | Evo | Iron + Wood | AOE | — | Deals 10–15 damage to nearby enemies. AOE damage increases by 15% each hit (max 300%). | dlc-risen-ballbylon |
| Ivy | Evo | Wood + Poison | AOE | Ivy | Applies 1 stack of ivy. Each stack deals 1–4 damage per second. Upon reaching 5, consume all stacks and deal 100–150 damage to all nearby enemies. | dlc-risen-ballbylon |
| Kaiju | Evo | Beast + Earthquake | AOE | — | Moves slowly and deals triple damage. Deals 50–130 damage to nearby units every second. | dlc-risen-ballbylon |
| Landslide | Evo | Stone + Earthquake | Destroy | Landslide | Creates a landslide and destroys self upon hitting an enemy. The landslide lasts for 5 seconds and deals 20–30 damage per second to enemies within a 2 tile radius. | base-game |
| Laser Beam | Evo (int → X Ray) | Light + (Laser H or Laser V) | — | Blind | Emits a laser beam on hit that deals 30–42 damage and blinds enemies for 8 seconds. | base-game |
| Laser Cutter | Evo | (Laser H or Laser V) + Steel | ? | — | Constantly emits a laser in front of it, which deals 100–150 damage per second. | base-game |
| Leech | Evo | Brood Mother + Bleed | — | Leech, Bleed | Attaches up to 1 leech onto enemies it hits, which adds 2 stacks of bleed per second (max 24 stacks). | base-game |
| Lightning Bug | Evo | Lightning + Brood Mother | Spawn | Lightning bug spawn | Spawns a lightning bug each time it hits an enemy. Lightning bugs attack a random enemy, dealing 1–80 damage to up to 3 nearby enemies. | base-game |
| Lightning Rod | Evo | Lightning + Iron | — | Lightning Rod | Plants a lightning rod into enemies it hits. These enemies are struck by lightning every 3.0 seconds, dealing 1–30 damage to up to 8 nearby enemies. | base-game |
| Lovestruck | Evo | Charm + (Light or Lightning or Time) | — | Lovestruck | Inflicts lovestruck on hit enemies for 20 seconds. Lovestruck units have a 50% chance of healing you for 5 health when they attack. | base-game |
| Maggot | Evo | Brood Mother + Cell | Spawn | Infest, Baby Ball Spawn | Infests enemies on hit with maggots. When they die, they explode into 1–2 baby balls. | base-game |
| Magma | Evo | Burn + Earthquake | — | Burn | Emits lava blobs over time. Enemies who walk into lava blobs are dealt 15–30 damage and gain 1 stack of burn (max 3 stacks). This ball and its lava blobs also deal 6–12 damage to nearby units. | base-game |
| Misfortune | Evo | Dark + Force | Destroy, AOE | Curse | Deals 5.0x damage and curses all enemies on first hit, destroying self afterwards. Cursed enemies are dealt 20–40 damage after being hit 5 times. 4 second cooldown. | dlc-risen-ballbylon |
| Mosquito King | Evo (int → Nosferatu, Mosquito Kingdom) | Vampire + Brood Mother | Spawn | Mosquito Spawn, Lifesteal | Spawns a mosquito each time it hits an enemy. Mosquitos attack a random enemy, dealing 80–120 damage each. If a mosquito kills an enemy, they steal 1 health. | base-game |
| Mosquito Kingdom | Tier-3 | Mosquito King + Mosquito Swarm | Spawn | Mosquito Spawn, Lifesteal | Spawns 1–2 mosquitos each time it hits an enemy. Mosquitos attack a random enemy, dealing 100–150 damage each. If a mosquito kills an enemy, they steal 2 health. | base-game |
| Mosquito Swarm | Evo (int → Mosquito Kingdom) | Vampire + Egg Sac | Destroy, Spawn | Mosquito Spawn, Lifesteal | Explodes into 3–6 mosquitos. Mosquitos attack random enemies, dealing 80–120 damage each. If a mosquito kills an enemy, they steal 1 health. | base-game |
| Mudslide | Tier-3 | (Landslide or Sandstorm) + Water | Destroy, AOE | Slow, Field | Creates a mudslide and destroys self upon hitting an enemy. The landslide lasts for 5 seconds and deals 30–40 damage per second to enemies and slowing them within a 2 tile radius. | dlc-risen-ballbylon |
| Nosferatu | **Tier-3 (3-way)** | Vampire Lord + Spider Queen + Mosquito King | Spawn | Vampire Bat Spawn | Spawns a vampire bat each bounce. Vampire bats fly towards a random enemy, dealing 132–176 damage on hit, turning into a Vampire Lord. | base-game |
| Noxious | Evo | Wind + (Poison or Dark) | Pass Through | Poison | Passes through enemies and applies 3 stacks of poison to nearby enemies within a 2 tile radius. Poison lasts for 4 seconds and each stack deals 1–3 damage per second. | base-game |
| Nuclear Bomb | Evo | Bomb + Poison | Destroy, AOE | Radiation (full-screen AOE) | Explodes when hitting an enemy, dealing 300–500 damage to nearby enemies and applying 1 stack of radiation to everyone present indefinitely (max 5 stacks). Each stack of radiation increases damage received by 10%. Has a 3 second cooldown. | base-game |
| Offspring | Evo | Cell + Flesh | Spawn | Clone | Splits into a clone on hit 4 times. | base-game |
| Overgrowth | Evo | Earthquake + Cell | — | Overgrowth | Applies 1 stack of overgrowth. Upon reaching 3, consume all stacks and deal 150–200 damage to all enemies in a 3x3 tile square. | base-game |
| Overgrowth | Evo | Time + Wood | — | Overgrowth | Applies 1 stack of overgrowth. Upon reaching 3, consume all stacks and deal 150–200 damage to all enemies in a 3x3 tile square. | base-game |
| Petrify | Evo | Stone + Flesh | — | Petrify | Petrifies all enemies within its sightline for 1.5 seconds when first launched, dealing 50–120. | base-game |
| Phantom | Evo (int → Banshee) | Dark + Ghost | — | Curse | Curses enemies on hit. Cursed enemies are dealt 100–200 damage after being hit 5 times. | base-game |
| Radiation Beam | Evo (int → Tumor) | (Laser H or Laser V) + (Poison or Cell) | — | Radiation | Emits a radiation beam on hit that deals 24–48 damage and applies 1 stack of radiation (max 5 stacks, +10% damage taken per stack, 15 s). | base-game |
| Reaper | Tier-3 | Soul Sucker + Heart Swallower | — | Instant Kill | Has a 10% chance to kill enemies on impact, healing you for 5 health. | base-game |
| Rot | Evo | Water + Wood | Destroy | — | Deals 20% of enemy's current health as bonus damage but destroys itself after hitting an enemy. 5 second cooldown. | dlc-risen-ballbylon |
| Sacrifice | Evo | Bleed + Dark | — | Bleed, Curse | Inflicts 4 stacks of bleed (max 15 stacks) and applies curse to hit enemies. Cursed enemies are dealt 50–100 after being hit 5 times. | base-game |
| Sandstorm | Evo | (Earthquake or Stone) + Wind | Pass Through | Blind | Goes through enemies and is surrounded by a raging storm dealing 10–20 damage per second and blinding nearby enemies for 3 seconds. | base-game |
| Satan | Tier-3 | Incubus + Succubus | — | Burn, Berserk | While active, adds 1 stack of burn to all active enemies per second (max 5 stacks, 10–20 damage per stack per second) and makes them go berserk (15–24 damage to adjacent enemies every second). | base-game |
| Shotgun | Evo (int → Sniper) | Iron + Egg Sac | Spawn | Baby Ball Spawn | Shoots 3–7 iron baby balls after hitting a wall. Iron baby balls move at 200% speed but are destroyed upon hitting anything. | base-game |
| Siren | Evo | Water + (Charm or Ghost) | Pass Through | Charm | Goes through enemies. Each hit has a 6% chance of charming the enemy for 9 seconds. | dlc-risen-ballbylon |
| Sniper | Tier-3 | Shotgun + Assassin | Pass Through, Spawn | Sniper Baby Ball Spawn | Pierces enemies and shoots 3–7 sniper baby balls after hitting a wall. Sniper baby balls pierce enemies but are destroyed upon hitting a wall. | base-game |
| Soul Sucker | Evo (int → Reaper) | Vampire + Ghost | Pass Through | Lifesteal, Attack Down | Passes through enemies and saps them, with a 30% chance of stealing 1 health and reducing their attack damage by 20%. | base-game |
| Spider Queen | Evo (int → Nosferatu) | (Brood Mother or Beast) + Egg Sac | Spawn | Baby Ball Spawn | Has a 25% chance of birthing an Egg Sac each time it hits an enemy. | base-game |
| Stalagmite | Evo | Force + Earthquake | AOE | Knock-Up | Deals 20–25 damage to nearby units in a 3x3 tile square and knocks them into the air briefly, allowing balls to pass under them. | dlc-risen-ballbylon |
| Steam | Evo | Water + Burn | Pass Through | Field | Goes through enemies and leaves behind a trail of steam for the first 6.0 seconds after being launched. Steam lasts for 8.0 seconds and deals 20–40 damage per second. | dlc-risen-ballbylon |
| Steel | Evo (int → Laser Cutter) | Iron + Stone | — | — | Initially deals double damage but moves 50% slower. Damage increases by 10% each time it hits an enemy (max 300%). | base-game |
| Storm | Evo (int → Armageddon) | Lightning + (Wind or Water) | — | — | Emits lightning to strike nearby enemies every second, dealing 1–40 damage. | base-game |
| Succubus | Evo (int → Satan) | Charm + Vampire | — | Charm | Each hit has a 4% chance of charming the enemy for 9 seconds. Heals 1 when hitting a charmed enemy. | base-game |
| Sun | Evo (int → Black Hole) | Burn + Light | — | Blind, Burn | Blinds all enemies in view and adds 1 stack of burn every second (max 5 stacks). Burn lasts for 6 seconds and deals 6–12 damage per stack per second. | base-game |
| Swamp | Evo | Earthquake + Poison | — | Slow, Poison | Leaves behind tar blobs over time. Enemies who walk into tar blobs are dealt 15–30, are slowed by 50% for 7 seconds and gain 1 stack of poison (max 8 stacks). This ball and its tar blobs also deal 6–12 damage to nearby units. | base-game |
| Swamp | Evo | Poison + Water | — | Slow, Poison | Leaves behind tar blobs over time. Enemies who walk into tar blobs are dealt 15–30, are slowed by 50% for 7 seconds and gain 1 stack of poison (max 8 stacks). This ball and its tar blobs also deal 6–12 damage to nearby units. | base-game |
| Thunderbird | Evo | Lightning + Beast | Attach, AOE | Attach | Attaches to enemies, dealing 80–120 damage per second while emitting lightning that deals 1–40 damage to nearby enemies. | dlc-risen-ballbylon |
| Time Bomb | Evo | Time + Bomb | — | Time Bomb Spawn, Time Snare | Throws a time bomb every few seconds, which explodes after a delay, dealing 80–120 damage to nearby enemies. | base-game |
| Timestop | Evo | Time + Freeze | Destroy | Timestop | Freezes everything on the field for 5.0 seconds but destroys itself after hitting an enemy. Has a 30 second cooldown. | base-game |
| Tsunami | Evo | Water + Earthquake | Pass Through, Destroy, AOE | — | Goes through enemies and deals 80–150 damage in a large area, but is destroyed upon hitting an edge of the field. | dlc-risen-ballbylon |
| Tumor | Evo | Radiation Beam + Flesh | — | Tumor | Applies tumor on hit. Enemies with a tumor die after 40 seconds (except for bosses). | base-game |
| Vampire Lord | Evo (int → Nosferatu) | Vampire + (Bleed **or** Dark) | — | Bleed, Heal | Each hit inflicts 3 stacks of bleed. Heals 1 health and consumes all stacks when hitting an enemy with at least 10 stacks of bleed. | base-game |
| Venom | Evo | (Freeze or Beast) + Poison | — | Venom, Slow | Applies 1 stack of venom on hit (max 8 stacks). Each stack deals 3–6 damage per second and slows down enemies. | base-game |
| Virus | Evo | Poison + (Bleed or Ghost or Cell) | — | Disease | Applies 1 stack of disease to units it hits (max 8 stacks). Disease lasts 6 seconds; each stack deals 3–6 damage per second, and diseased units have a 15% chance per second of passing a stack to nearby enemies. | base-game |
| Voluptuous Egg Sac | Evo | Egg Sac + Cell | Destroy, Spawn | Baby Ball Spawn | Explodes into 2–3 egg sacs on hitting an enemy. Has a 3 second cooldown. | base-game |
| Warp | Evo | Time + Light | — | — | After each hit, warps to a random spot on the field and speeds up by 5%. | base-game |
| Water Bug | Evo | Water + Brood Mother | Spawn | Baby Ball Spawn | Births a baby ball each time it hits an enemy. | dlc-risen-ballbylon |
| Waterfall | Evo | Water + Force | Destroy, AOE | Field | Creates a waterfall and destroys self upon hitting an enemy. The waterfall lasts for 8.0 seconds and deals 10–15 damage per second to enemies within a 2 tile radius. | dlc-risen-ballbylon |
| Werewolf | Evo | Beast + Vampire | Attach | Attach, Lifesteal | Attaches to enemies, dealing 100–150 damage per second until it's dead. 30% chance to heal you for 3 when target dies. | dlc-risen-ballbylon |
| Wolfpack | Evo | Beast + Brood Mother | Attach, Spawn | Attach | Spawns with 2 other copies. Attaches to enemies, dealing 50–100 damage per second until it's dead. | dlc-risen-ballbylon |
| Wraith | Evo (int → Banshee) | Freeze + Ghost | Pass Through | Freeze | Freezes any enemy it passes through for 0.8 seconds. | base-game |
| X Ray | Tier-3 | Holy Laser + Laser Beam | — | Radiation | Emits an X-shaped laser on hit, which deals 50–75 damage to enemies and applies 1 stack of radiation (max 5 stacks; +10% damage taken per stack). | base-game |
| Zombie | Evo | Vampire + Flesh | — | Zombie Infection, Zombie Spawn | Infects enemies on hit, giving them a 40% chance to turn into a friendly zombie on death. | base-game |

Count check: 89 evolved balls in the datamined catalog (87 two-component +
Nosferatu as the only 3-way + Elemental as the only 4-way). Cross-checked against
the pre-DLC reference image: the matrix shows the same base-roster pairings,
including the "or" alternates and the single "Elemental" 4-way row at the bottom.

**Fusion rules worth encoding** (from Balls + Fusion Mechanics pages):

- Evolutions require level-3 (max level) component balls, combined in the Fusion Reactor.
- Order of components never changes the result for evolved balls.
- If two balls can evolve into an evolved ball, they cannot be merely fused — except
  pairs whose only shared evolution needs 3+ balls (Nosferatu, Elemental components).
- Fusing two Destroy balls may lose one of their abilities (community-noted caveat).
- Fused-ball fusion (no unique result) is modeled separately by the site's
  editorial composer (`docs/research/fusion-mechanics.md`, `src/fusion.ts`),
  not by this fact base.

---

## 2. Passives

77 base passives + 39 evolved passives. Passives can be leveled to 3 in-run and
evolved in the Fusion Reactor (but not fused). Some base passives only appear if a
requirement is met (noted).

### 2.1 Base Passives (77)

Rows for the 23 DLC base passives are from the v1.308 datamine; all other rows
are wiki v1.301. DLC passives are character-gated by the allow-list in
[character-passive-restrictions.md](character-passive-restrictions.md); their
unlock conditions are unknown.

| Passive | Effect text (wiki) | Appearance requirement | Unlock | Edition |
|---|---|---|---|---|
| Ancient Ladle | Your combined ball has a 6% chance of birthing a copy of one of its components with each bounce. | — | — | dlc-risen-ballbylon |
| Archer's Effigy | Every 7–12 rows, spawn a stone archer with 160 health on your side. Shoots arrows at enemies, dealing 10–20 each. Immune to ball damage. | — | Clear The SNOWYxSHORES | base-game |
| Artificial Heart | Friendly pieces gain 100% more health | needs another "friendly pieces" passive | default | base-game |
| Baby Rattle | Gain 1.5x baby balls, but your aim becomes scattered | — | default | base-game |
| Bandage Roll | Shoot 1–2 baby balls each time you're healed | — | default | base-game |
| Bent Spyglass | Balls that are shot while aiming backwards deal 60% more damage. | — | — | dlc-risen-ballbylon |
| Bottled Tornado | When you catch a special ball, automatically shoot 1–3 new baby balls in random directions | — | default | base-game |
| Breastplate | Decrease damage taken by 10% | — | default | base-game |
| Charged Bracelet | Increase range of all ball area-of-effects by an extra 20%. | — | — | dlc-risen-ballbylon |
| Cracked Cinderblock | After a special ball passes through a wall, spawn 1–3 baby balls where it emerges. | — | — | dlc-risen-ballbylon |
| Crown of Thorns | Destroy the 2 nearest enemies when you are hit from close range | — | default | base-game |
| Crystal Decanter | Balls deal 20% more damage when in orbit. | — | — | dlc-risen-ballbylon |
| Cursed Elixir | When a poisoned enemy dies, 10% chance to come back as a zombie with 240 health | needs a Poison-applying ball | Clear The BONExYARD | base-game |
| Deadeye's Amulet | Critical hits deal 10–15 bonus damage | — | Clear The LIMINALxDESERT | base-game |
| Diamond Hilted Dagger | Increase crit chance to 20% when hitting enemies in the front | — | default | base-game |
| Dynamite | Every 5–10 rows, spawn an enemy with dynamite attached. Destroying them deals 200–500 damage to nearby enemies | — | Clear The SMOLDERINGxDEPTHS | base-game |
| Eldritch Gauntlet | Increase bonus damage after hitting the right wall by 20%. | — | — | dlc-risen-ballbylon |
| Emerald Hilted Dagger | Increase crit chance to 20% when hitting enemies on their right side | — | default | base-game |
| Ethereal Cloak | Balls go through enemies and deal 25% bonus damage until they hit the back of the field | — | default | base-game |
| Everflowing Goblet | You can heal past your max health at 20% efficiency | — | default | base-game |
| Eye of the Beholder | 10% chance to dodge incoming attacks | — | default | base-game |
| Fleet Feet | Increase movement speed by 10% and move at full speed while shooting | — | default | base-game |
| Fractured Boulder | Increase area-of-effect damage (such as earthquake, laser, and lightning) and status effect damage (such as burn and poison) by 10%. | — | — | dlc-risen-ballbylon |
| Frozen Spike | When an enemy is frozen, they emit a chill to nearby enemies that deals 10–20 damage | needs a Freeze-applying ball | default | base-game |
| Gemspring | Every 7–11 rows, spawn a Gemspring. Damaging it drops an increasing amount of XP gems | — | Clear The SMOLDERINGxDEPTHS | base-game |
| Ghostly Corset | Balls go through enemies and deal 20% bonus damage when hitting them from the side | — | Clear The HEAVENLYxGATES | base-game |
| Ghostly Shield | Balls go through allies and heal them for 2 health | needs an "allies" passive | Clear The HEAVENLYxGATES | base-game |
| Golden Bull | Every 7–11 rows, spawn a golden bull with 400 health; accrues 10 gold/minute; moves up the field blocking/attacking | — | Clear The SNOWYxSHORES | base-game |
| Goniometer | Balls' first bounce deals more damage based on how close to a perfect diagonal it is (up to 100%). | — | — | dlc-risen-ballbylon |
| Hand Drill | Each time a ball loops around, it deals 30% extra damage on the next hit. | — | — | dlc-risen-ballbylon |
| Hand Fan | Slow down enemies in the same column as you by 50% | — | Clear The GORYxGRASSLANDS | base-game |
| Hand Me Downs | Launch 1–2 baby balls randomly with each shot. | — | — | dlc-risen-ballbylon |
| Hand Mirror | Projectiles have a 50% chance to reflect upon hitting you, dealing 20–40 damage if they hit an enemy | — | Clear The GORYxGRASSLANDS | base-game |
| Healer's Effigy | Every 7–12 rows, spawn a stone healer with 100 health; heals you 10 health/minute | — | Clear The SNOWYxSHORES | base-game |
| Hourglass | Balls deal 150% damage, but damage decays by 30% each bounce (min 50%) | — | default | base-game |
| Iron Onesie | Balls deal 0.5% more damage for each baby ball on the field | — | default | base-game |
| Juggler's Club | Balls deal an extra 5–15 damage to nearby enemies upon first landing. | — | — | dlc-risen-ballbylon |
| Kiss of Death | Charmed enemies have a 10% chance of dying after recovering | needs a Charm-applying ball | default | base-game |
| Kris Knife | Backstabs deal 10–15 bonus damage until they hit the back of the field. | — | — | dlc-risen-ballbylon |
| Kunai | Balls deal 10–15 bonus damage to bosses and minibosses. | — | — | dlc-risen-ballbylon |
| Lover's Quiver | Projectiles have a 40% chance to heal you for 1 health instead of hurting you | — | Clear The GORYxGRASSLANDS | base-game |
| Lucky Coin | 30% bonus gold dropped. Launch 1–2 baby balls when picking up gold or other resources. | — | — | dlc-risen-ballbylon |
| Magic Staff | Increase area-of-effect damage (earthquake, laser, lightning) by 20% | — | default | base-game |
| Magnet | Increase range at which you pick up items and catch balls by 1.0 tiles | — | default | base-game |
| Midnight Oil | Balls that hit flaming enemies light on fire and deal 10–20 bonus fire damage on the next hit | needs a Burn-applying ball | default | base-game |
| Platinum Dumbbell | Balls deal 12% bonus damage until they hit the back of the field | — | unclear ("Clear ?") | base-game |
| Pressure Valve | Enemies explode on death, dealing 20–30 damage to adjacent enemies | — | Clear The BONExYARD | base-game |
| Protective Charm | Gain a shield that blocks the next damage; recharges after 60 seconds | — | Clear The FUNGALxFOREST | base-game |
| Radiant Feather | Increases ball launch speed by 20%, but you get knocked back a little each shot | — | default | base-game |
| Reacher's Spear | Increase crit chance to 20% when hitting enemies in the same column as you | — | default | base-game |
| Refracting Glass | After a special ball reaches its target position, spawn 1–2 baby balls from that position. | — | — | dlc-risen-ballbylon |
| Rubber Headband | Balls start at 70% speed but increase by 20% each bounce (max 200%) | — | default | base-game |
| Ruby Hilted Dagger | Increase crit chance to 15% when hitting enemies in the back | — | default | base-game |
| Rusted Blade | Whenever bleed is applied, add 2 extra stacks. | — | — | dlc-risen-ballbylon |
| Sapphire Hilted Dagger | Increase crit chance to 30% when hitting enemies on their left side | — | default | base-game |
| Shortbow | Increase fire rate by 15% | — | default | base-game |
| Silver Blindfold | Increase crit chance to 20% when hitting blinded enemies | — | Clear The LIMINALxDESERT | base-game |
| Silver Bullet | Balls deal 20% bonus damage until they hit a wall | — | default | base-game |
| Silver Revolver | Balls pierce and deal 50% extra damage to the first enemy they hit. | — | — | dlc-risen-ballbylon |
| Slingshot | 25% chance to launch a baby ball when you pick up a gem | — | default | base-game |
| Spiked Collar | Deal 30–50 to enemies the first time you get into their melee attack range | — | Clear The FUNGALxFOREST | base-game |
| Spiked Discipline | Each time a ball hits the bottom of the screen, it deals 50% extra damage on the next hit. | — | — | dlc-risen-ballbylon |
| Steel Bulwark | Increase shield size by 20%. | — | — | dlc-risen-ballbylon |
| Stone Effigy | Every 7–12 rows, spawn a stone soldier with 200 health; moves up the field blocking/attacking | — | default | base-game |
| Sword Breaker | Balls deal 40% less damage, but gain 1% damage for each enemy on the field | — | unclear ("?") | base-game |
| Teardrop Necklace | Balls deal 50% more damage when on a return trajectory. | — | — | dlc-risen-ballbylon |
| Test Tube | Balls deal more damage the faster they move (up to 100%). | — | — | dlc-risen-ballbylon |
| Traitor's Cowl | Stone allies can now be damaged by your balls, but you heal 2 health when a ball hits one | needs a "stone allies" passive | Clear The HEAVENLYxGATES | base-game |
| Turret | Floats around your character and shoots a baby ball at enemies every 2.0 seconds | — | default | base-game |
| Unkempt Cradle | Shots made while characters are facing each other have a 30% chance to shoot an extra baby ball straight forward. | — | — | dlc-risen-ballbylon |
| Upturned Hatchet | Balls deal 80% more damage after hitting the back of the field, otherwise damage reduced by 20% | — | default | base-game |
| Vampiric Sword | Each kill heals you by 5, but each shot you take deals 2 damage to you | — | Clear The LIMINALxDESERT | base-game |
| Voodoo Doll | Curse has a 10% chance of killing enemies | needs a Curse-applying ball | Clear The BONExYARD | base-game |
| Wagon Wheel | Each time a ball hits a wall, it deals 30% extra damage on the next hit | — | Clear The SMOLDERINGxDEPTHS | base-game |
| War Horn | All baby balls deal 20% more damage | — | default | base-game |
| Wrapped Explosive | The first time balls hit a wall, they emit an explosion, dealing 20–30 to nearby enemies. | — | — | dlc-risen-ballbylon |
| Wretched Onion | Deal 6–12 per second to enemies within 2 tiles | — | Clear The FUNGALxFOREST | base-game |

### 2.2 Evolved Passives (39)

Rows for the 22 DLC evolved passives are from the v1.308 datamine; all other
rows are wiki v1.301.

| Passive | Recipe | Effect text (wiki) | Edition |
|---|---|---|---|
| Ardent Tire | Wagon Wheel + Rubber Headband | Each bounce increases ball speed by 10% and damage by 5%. | base-game |
| Argent Stopwatch | Hourglass + Silver Bullet | Balls deal 200% damage, but damage decays by 20% each bounce (minimum 100%). | base-game |
| Arrow of Fate | Lover's Quiver + Hand Mirror | Projectiles no longer hurt you. Shoot 1–2 baby balls when hit by a projectile. | base-game |
| Baby Armor | Hand Me Downs + Iron Onesie | Each shot, launch 1–3 baby balls with the properties of the ball being shot. | dlc-risen-ballbylon |
| Blood Kunai | Kunai + Everflowing Goblet | Balls deal 0.6 of target's current health as bonus damage. | dlc-risen-ballbylon |
| Charged Bow | Charged Bracelet + Shortbow | Area-of-effects trigger at the nearest enemy. Increase range of all ball area-of-effects by an extra 30%. Increase fire rate by 20%. | dlc-risen-ballbylon |
| Cornucopia | Baby Rattle + War Horn | Each time baby balls are created, spawn 0–1 additional baby balls. | base-game |
| Cradle of Filth | Unkempt Cradle + Baby Rattle | Shots made while characters are facing each other have a 60% chance to shoot an extra baby ball in a random direction. | dlc-risen-ballbylon |
| Deadeye's Cross | Diamond + Sapphire + Ruby + Emerald Hilted Dagger (**4-way**) | Increase critical hit chance to 60%. | base-game |
| Deadeye's Impaler | Deadeye's Cross + Gracious Impaler | Increase critical hit chance to 5%. Critical hits instantly kill non-boss enemies. | base-game |
| Eldritch Dagger | Eldritch Gauntlet + Diamond Hilted Dagger | First hit after hitting a right wall creates an explosion that deals 30–50 damage to nearby enemies. | dlc-risen-ballbylon |
| Eyeless Spyglass | Bent Spyglass + Silver Blindfold | Increase crit chance to 300% while you're looking backwards. | dlc-risen-ballbylon |
| Full Metal Rapier | Iron Onesie + Sword Breaker | Balls deal 1% more damage for each baby ball and enemy on the field. | base-game |
| Gracious Impaler | Reacher's Spear + Deadeye's Amulet | Critical hits have a 5% chance to instantly kill enemies. | base-game |
| Grotesque Artillery | Turret + Hand Fan | Floats around your character and shoots a random level 1 unevolved special ball at enemies every 8.0 seconds. | base-game |
| Handheld Rupture | Cracked Cinderblock + Fractured Boulder | Whenever a special ball warps, emit an earthquake that deals 5–13 damage to nearby enemies. Increase area-of-effect damage and status effect damage by 20%. | dlc-risen-ballbylon |
| Inglorious Hammer | Platinum Dumbbell + Upturned Hatchet | When balls hit a wall or the back of the field, they hit a random enemy with 50% bonus damage. | base-game |
| Juggler's Wheel | Juggler's Club + Wagon Wheel | Balls deal an extra 15–25 damage to nearby enemies in a large area upon first landing. | dlc-risen-ballbylon |
| Levitating Rock | Fractured Boulder + Magic Staff | Increase area-of-effect damage (such as earthquake, laser, and lightning) and status effect damage (such as burn and poison) by 20%. | dlc-risen-ballbylon |
| Liquid Flame | Crystal Decanter + Midnight Oil | Balls that hit flaming enemies light on fire and deal 20–30 bonus fire damage on the next hit. Orbiting balls are always on fire. | dlc-risen-ballbylon |
| Mystic Dipper | Ancient Ladle + Magic Staff | Your combined ball has a 10% chance of birthing a copy of one of its components with each bounce. Increase area-of-effect damage by 40%. | dlc-risen-ballbylon |
| Odiferous Shell | Wretched Onion + Breastplate | When you touch enemies, they have a 50% chance of instantly dying. | base-game |
| Peacemaker | Silver Revolver + Silver Bullet | Balls pierce and deal 100% extra damage to the first enemy they hit. | dlc-risen-ballbylon |
| Phantom Regalia | Ghostly Corset + Ethereal Cloak | Balls go through enemies until they hit the back wall. Balls deal 50% more damage when going through enemies. | base-game |
| Reacher's Drill | Hand Drill + Reacher's Spear | After a ball loops around, increase its crit hit chance to 300%. | dlc-risen-ballbylon |
| Refracted Echo | Refracting Glass + Dynamite | After a special ball reaches its target position, 30% chance to spawn a clone from that position. | dlc-risen-ballbylon |
| Relentless Whip | Spiked Discipline + Bottled Tornado | Each time a special ball hits the bottom of the screen, it launches 0–2 baby balls with its properties. | dlc-risen-ballbylon |
| Remote Detonator | Pressure Valve + Magnet | Enemies spawn a level 1 bomb ball upon dying. | base-game |
| Sands of Time | Test Tube + Hourglass | Balls deal more damage the faster they move (up to 200%). | dlc-risen-ballbylon |
| Shadow Blade | Kris Knife + Ruby Hilted Dagger | Increase crit chance to 700% when hitting enemies in the back. | dlc-risen-ballbylon |
| Soul Reaver | Vampiric Sword + Everflowing Goblet | Each kill heals you by 1 and you can heal past your max health at 30% efficiency. | base-game |
| Spiked Shield | Steel Bulwark + Spiked Collar | Increase shield size by 50%. Whenever you bounce a special ball, eject a spike at a random enemy that deals 50–90. | dlc-risen-ballbylon |
| Teardrop Dagger | Teardrop Necklace + Sapphire Hilted Dagger | Balls deal 100% more damage and move 20 faster when on a return trajectory. | dlc-risen-ballbylon |
| Tilted Dagger | Goniometer + Emerald Hilted Dagger | When balls hit enemies on their right side, increase crit chance to 600% and bounce horizontally. | dlc-risen-ballbylon |
| Tormenters Mask | Spiked Collar + Crown of Thorns | Enemies have a 10% chance of dying immediately the first time they detect you. | base-game |
| Vampire's Kiss | Rusted Blade + Vampiric Sword | Whenever bleed is applied, add 3 extra stacks. Dealing bleed damage has a 2% chance of healing 1 health. | dlc-risen-ballbylon |
| Volatile Explosive | Wrapped Explosive + Pressure Valve | Enemies create a large explosion on death, dealing 40–60 damage to nearby enemies. | dlc-risen-ballbylon |
| Windweaver | Bottled Tornado + Slingshot | Shoot a level 1 wind ball every time you pick up a gem. | base-game |
| Wings of the Anointed | Radiant Feather + Fleet Feet | Balls move 40% faster and you move 20% faster. No longer affected by environmental hazards on the ground. | base-game |

Two evolution chains exist: Dagger quartet → Deadeye's Cross → Deadeye's Impaler
(two-stage), and Reacher's Spear + Deadeye's Amulet → Gracious Impaler → (with
Deadeye's Cross) → Deadeye's Impaler. The passive graph is shallower than the ball
graph; only Deadeye's Impaler is a tier-3-equivalent.

### 2.3 Passive allow-lists and stat gates

The two character-dependent mechanisms from
[character-passive-restrictions.md](character-passive-restrictions.md), kept
separate:

- **`Character(s)`** is the DLC allow-list (the v1.308 `PassiveInfo.CanBeUsed`
  switch). Only the 23 DLC base passives carry one; a character outside the
  list is never offered the passive. Evolved passives inherit the
  intersection of their components' allow-lists, so they are not authored
  here — the one exception is Handheld Rupture, whose explicit override
  widens the intersection to both Sisyphus and Wallbreaker.
- **`Excluded characters`** is the base-game character-stat gate (the
  no-arg `CanBeUsed`): a hard offer-pool exclusion, authored from the
  datamined stat/prop table. It is not an item allow-list and is not
  inherited by evolved passives (the game re-checks it only when the
  component itself is offered).

Blank cells (`—`) mean no restriction. The DLC allow-list applies only to
`dlc-risen-ballbylon` passives; the stat gates apply to `base-game` passives.
Loadout gates (status ball / friendly piece / stone ally) are the
"Appearance requirement" column above, not a character restriction.

| Passive | Character(s) | Excluded characters |
|---|---|---|
| Ancient Ladle | The Potager | — |
| Bent Spyglass | The Sentinel | — |
| Charged Bracelet | The Conduit | — |
| Cracked Cinderblock | The Makeshift Sisyphus, The Wallbreaker | — |
| Crystal Decanter | The Carouser, The Scandalmonger | — |
| Eldritch Gauntlet | The Right Hand Man | — |
| Fractured Boulder | The Makeshift Sisyphus | — |
| Goniometer | The Scrupulous Scoundrel | — |
| Hand Drill | The Tunneller | — |
| Hand Me Downs | The Empty Nester | — |
| Juggler's Club | The Juggler | — |
| Kris Knife | The Shade | — |
| Kunai | The Tiptoer | — |
| Lucky Coin | The Spendthrift | — |
| Refracting Glass | The Recollector | — |
| Rusted Blade | The Warrior | — |
| Silver Revolver | The Itchy Finger | — |
| Spiked Discipline | The Flagellant | — |
| Steel Bulwark | The Shieldbearer | — |
| Teardrop Necklace | The Repentant | — |
| Test Tube | The Physicist | — |
| Unkempt Cradle | The Cohabitants | — |
| Wrapped Explosive | The Embedded | — |
| Handheld Rupture | The Makeshift Sisyphus, The Wallbreaker | — |
| War Horn | — | The Empty Nester, The Makeshift Sisyphus, The Potager |
| Baby Rattle | — | The Empty Nester, The Makeshift Sisyphus, The Potager |
| Cornucopia | — | The Empty Nester, The Makeshift Sisyphus, The Potager |
| Radiant Feather | — | The Shieldbearer, The Tactician |
| Magnet | — | The Shieldbearer |
| Shortbow | — | The Spendthrift, The Tactician |
| Upturned Hatchet | — | The Physicist |

The Handheld Rupture row is the documented override: its components
(Cracked Cinderblock, Fractured Boulder) intersect to Sisyphus only, but the
game's explicit type-111 case allows both Sisyphus and Wallbreaker.

---

## 3. Characters (31)

Unlock = build the named house; blueprints drop in the named level. The Warrior is
the default. The False Messiah is PC-exclusive via the Twitch extension. Rows for
the 8 DLC characters are from the v1.308 datamine; all other rows are wiki v1.301.
DLC unlock conditions are unknown.

| Character | Base ball | Ability (wiki text, abridged) | Unlock | Synergy-relevant facts | Edition |
|---|---|---|---|---|---|
| The Warrior | Bleed | Default character, no special gameplay quirks. | available at start | no quirk — neutral to all tags | base-game |
| The Itchy Finger | Burn | Scattered aim, shoots twice as fast, auto-launches balls; full speed while shooting. | Sheriff's Office (BONExYARD) | scattered aim degrades aimed single-target play | base-game |
| The Repentant | Freeze | Balls deal +5% damage per bounce; on hitting the back wall they return, damaging enemies passed through. | Haunted House (BONExYARD) | rewards bounce-scaling balls | base-game |
| The Cohabitants | Brood Mother | Each launched ball is mirrored by a copy; balls deal half damage. | Cozy Home (BONExYARD) | doubles spawns/AOE coverage | base-game |
| The Cogitator | Laser (Vertical) | Automatically chooses upgrades. | Villa (SNOWYxSHORES) | removes upgrade agency | base-game |
| The Embedded | Poison | Balls always pierce enemies until they hit a wall. | Veteran's Hut (SNOWYxSHORES) | innate pass-through | base-game |
| The Shade | Dark | Balls shoot from the back; base crit chance 10%. | Mausoleum (LIMINALxDESERT) | rewards backstabs (Assassin synergy) | base-game |
| The Shieldbearer | Iron | Large shield bounces back balls that hit it. | Iron Fortress (FUNGALxFOREST) | reclaims balls; anti-Destroy synergy | base-game |
| The Spendthrift | Vampire | Shoots all balls at once in a wide arc. | Mansion (FUNGALxFOREST) | volley fire, no per-ball aim | base-game |
| The Juggler | Lightning | Lobs balls at a target position; no bouncing until landing. | Theater (GORYxGRASSLANDS) | aimed placement | base-game |
| The Empty Nester | Ghost | **No baby balls.** Each shot shoots multiple instances of one equipped special ball. | Single Family Home (SNOWYxSHORES) | **red for spawns-baby-balls tags** | base-game |
| The Flagellant | Egg Sac | Balls bounce normally off the bottom of the screen. | Monastery (GORYxGRASSLANDS) | keeps balls in play | base-game |
| The Makeshift Sisyphus | Earthquake | **No baby balls.** No direct hit damage; AOE and status damage ×4. | Rocky Hill (LIMINALxDESERT) | **red for single-target; green for aoe/status** | base-game |
| The Physicist | Light | Balls are affected by gravity toward the back of the screen. | Laboratory (FUNGALxFOREST) | trajectory quirk | base-game |
| The Tactician | Iron | Battles become turn-based. | Captain's Quarters (SMOLDERINGxDEPTHS) | changes pacing entirely | base-game |
| The Radical | Wind | Plays the game and chooses upgrades automatically (AI plays). | Campground (HEAVENLYxGATES) | no player agency | base-game |
| The Falconer | Lightning | Balls shot from two falcons on the sides of the screen. | Falconry Hut (HEAVENLYxGATES) | side-entry trajectories | base-game |
| The Carouser | Charm | Balls can briefly orbit the player on return trajectory. | Party House (VASTxVOID) | keeps balls near | base-game |
| The Tunneller | Earthquake | Balls wrap around top and bottom of the screen. | Stone Domain (SMOLDERINGxDEPTHS) | vertical wrap | base-game |
| The Tiptoer | Laser (Horizontal) | Undetectable by enemies (except bosses/minibosses); drastically less health. | Hidden Temple (SMOLDERINGxDEPTHS) | survival via stealth | base-game |
| The Hoary Hoarder | *none* | Only 2 ball slots; remaining equipment slots become passive slots. | Unstable Tower (HEAVENLYxGATES) | **no base ball** — passive-heavy builds | base-game |
| The Ballbearer | Stone | Twice as many ball slots, but no passive slots. | Ball House (VASTxVOID) | ball-heavy, **zero passives** | base-game |
| The False Messiah | Bleed | Twitch audience votes on choices and random events. | Twitch extension (PC only) | interactive stream quirk | base-game |
| The Conduit | Lightning | Area-of-effect damage from balls is centered on the player. | — | green for `aoe`; red for `direct-damage` (must stand near targets) | dlc-risen-ballbylon |
| The Potager | Wood | All equipped special balls are fused into one ball when shot. Cannot fuse balls normally, and has no baby balls. | — | green for `fused-ball`; **red for `spawns-baby-balls`** | dlc-risen-ballbylon |
| The Recollector | Time | Balls return to you after reaching your aim cursor, piercing enemies there and back. | — | green for `return-trajectory` and `pass-through` | dlc-risen-ballbylon |
| The Right Hand Man | Stone | After hitting the right wall, balls deal double damage. After hitting the left wall, balls deal half damage and go through enemies. | — | green for `wall-bounce`; `pass-through` green on left-wall hits only, at half damage | dlc-risen-ballbylon |
| The Scandalmonger | Beast | Balls can briefly orbit around the aim cursor when on a return trajectory. | — | green for `orbit` | dlc-risen-ballbylon |
| The Scrupulous Scoundrel | Force | Balls only bounce in perfect diagonals. | — | green for `diagonal` and `wall-bounce` | dlc-risen-ballbylon |
| The Sentinel | Force | Can aim and shoot in any direction (including behind you). | — | green for `aim-direction` | dlc-risen-ballbylon |
| The Wallbreaker | Earthquake | Balls teleport to the opposite side of the screen the first time hitting a wall. | — | green for `teleport` and `wall-bounce` | dlc-risen-ballbylon |

The datamined v1.308 build lists 31 playable characters; the table lists 31 rows
including Warrior and False Messiah. The pre-DLC wiki states 23. (Earlier planning
assumed ~21 — the count has grown with updates.)

**AoE-incompatible / tag-relevant characters** (for verdict rules):
The Empty Nester and The Makeshift Sisyphus have **no baby balls** → any
`spawns-baby-balls` tag is red for them; baby-ball-scaling passives (Baby Rattle,
War Horn, Iron Onesie, Cornucopia, Full Metal Rapier, Slingshot, Bottled Tornado,
Bandage Roll) are also red for them. The Makeshift Sisyphus has no direct hit
damage → `single-target`-only balls are red, `aoe`/status is green (×4). The
Ballbearer runs no passives → all passive tags effectively dead. The Hoary Hoarder
has no base ball → base-ball-dependent tags n/a.

**Matchmaker pairing restrictions**: some characters cannot team up in a
two-character run — the game darkens them on the select screen. That list is
game data with its own fact base: see [character-pairings.md](character-pairings.md)
(parsed into `cannotPair` on each character). It is separate from the
editorial tag/verdict model below.

---

## 4. Proposed synergy tag list

**Landed:** the shipped vocabulary and assignments live in `scripts/editorial.ts`
(`TAGS`, `BALL_TAGS`, `PASSIVE_TAGS`, `CHAR_VERDICTS`); this section is the
original proposal.

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
| `lifesteal` | heals the player | Vampire, Succubus, Mosquito family, Vampiric Sword, Soul Reaver, Bandage Roll |
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
own model, so verdicts are editorial.

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

- Two L1 effect texts were corrected from the wiki's per-level `{{BallData}}`
  tables (rebuilt 2026-09-15/17; see issue #3 research): **Time** snare
  20 s → 2.0 s (the overview table's typo; L2 2.5 s, L3 3.0 s), and
  **Brimstone**'s truncated damage clause restored (burn 1–4, poison 2–3 damage
  per stack per second at L1).
- Damage/status numbers are wiki-as-of-2026-09-13, game v1.301; wiki pages carry a
  `{{Stub}}` template and a TODO about damage types — re-verify on game patches.
- `Erosion` status effect is listed as "?" on the wiki; `Laser Cutter` on-hit/status
  triggers are "?" too; the wiki's Overgrowth AOE field is marked "AOE?".
- `Platinum Dumbbell` and `Sword Breaker` unlock conditions are unknown ("Clear ?").
- The synergy tag list and per-character verdicts are the site's own model —
  editorial, needs playtesting validation. The 8 DLC characters' verdict gists are
  the S2 editorial model, not game data.
- DLC effect text is the v1.308 datamine's L1 text normalized to display values
  with the field-specific divisor table in
  [risen-l3-refresh.md](risen-l3-refresh.md) §5 (never a blanket ÷10): Ash
  emission 5.0 s and lifetime 6.0 s, Steam 6.0/8.0 s, Waterfall 8.0 s, Siren charm
  6%, Werewolf lifesteal 30%, Misfortune 5.0x, Bullet 1000% / erode 200%. Ash's
  `kEmissionLength` unit is absent from the template; 5.0 seconds is the S4
  decision.
- DLC unlock conditions are unknown (`—` in every DLC row). DLC passives are
  character-gated by the allow-list in
  [character-passive-restrictions.md](character-passive-restrictions.md).
- The 6 changed recipes (Blizzard, Venom, Overgrowth, Spider Queen, Storm, Swamp)
  are from the v1.308 datamine; the pre-DLC wiki recipes are superseded.
- Character count (31) and evolved-ball count (89) are current as of the Risen
  Ballbylon update; earlier planning assumed ~21 characters / 42 evolutions — both
  have grown, so the data model should tolerate additions.
