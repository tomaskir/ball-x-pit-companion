# Risen Ballbylon — fusion data and behavior

Research ticket: [#33](https://github.com/tomaskir/ball-x-pit-companion/issues/33)
(research for S3 [#29](https://github.com/tomaskir/ball-x-pit-companion/issues/29)
and T16 [#42](https://github.com/tomaskir/ball-x-pit-companion/issues/42)).
Access date: 2026-11-13. Build: **BALL x PIT: Risen Ballbylon**, Unity
6000.0.62f1, IL2CPP (metadata v31).

Sources (all gitignored, read-only):

- `game-data/BALLxPIT/Balls_Data/il2cpp_data/Metadata/global-metadata.dat` —
  IL2CPP type/field/method names.
- `game-data/BALLxPIT/Balls_Data/*.assets` — raw Unity assets, parsed with
  UnityPy + the package's Odin parser.
- `game-data/extracted/extract.json` — the existing decoded package
  (114 balls / 116 passives / 31 characters).
- AssetRipper export at `.scratch/export/ExportedProject/` — decompiled
  `Assembly-CSharp` class shapes and `I2Languages.asset` localization. The
  decompiler emits **field declarations and method signatures with empty
  bodies** (IL2CPP has no IL), so this source proves the data model, not the
  algorithm.

This file is hand-maintained research, not parsed by the pipeline. It
supersedes nothing in `fusion-mechanics.md`; it extends that file's §1.1/§4
with the DLC build and corrects one build-scoped claim (see §2).

---

## 1. Direct answers

| Question | Answer |
|---|---|
| Does a **fusion table** exist? | **No.** No table of fused results, fused effects, or valid pairs. |
| Does **pair data** exist? | **No static pair data.** The only pair-shaped data is runtime/player state: `HeroCombo` ordered pairs in `LevelUpUI._availHCombos`, the player's `BattleSaveData.IgnoredFusions`, and per-ball discovery counters (`HeroMetaStats.NumCombos`). |
| Does **fusion-effect logic** exist? | **Yes, runtime composition logic** — `HeroInst.GetHitEffects()` / `GetSpecials()` union the components' structured effect lists; `HeroInst.CombineWith()` merges stats; `HeroInst.IsBadCombo()` scores/flag a pair; `HeroInfo.ApplyComboDetails()` / `GetComboIcon()` assemble the tooltip and icon. The method bodies are stubs in the export, so the exact algorithm is inferred from class shape + localization templates. There is **no per-pair effect data**. |
| Do the **new balls** get special fusion data? | **No.** They are ordinary `HeroInfo` assets with the same structured fields (`HitEffects`, `AOETypes`, `Specials`, `DmgType`). They enter the same runtime path. |
| New fusion observations without playtesting? | **No pair-specific observations.** The dump gives mechanism-backed evidence (structured channels + the game's own cross-wire tooltip templates), not observations. See §9. |

The single most load-bearing conclusion of `fusion-mechanics.md` §1.1 —
**there is no fusion table; the fused result is assembled at runtime** — is
confirmed on the Risen build.

---

## 2. Correction to the prior build-scoped claim

`fusion-mechanics.md` §1.1 says the strings "fuse/fusion/combo/order" appear
zero times in the datamined files. That is **not true of the Risen build's
IL2CPP metadata and decompiled scripts**: the metadata contains `Fusion`,
`FusionLog`, `RevealFusion`, `SkipRevealFusion`, `kFusionCount`,
`FusionOrbsVFXController`, `FuserPickupObj`, `ComboSelectItem`,
`HeroCombo`, `NumCombosFused`, `GetComboScore`, `IsBadCombo`, and many more.
The earlier claim was presumably scoped to the asset dump.

The durable claim is narrower and still holds: **the game has fusion UI,
runtime composition code, and player-state counters, but no fusion data
table.** Keep the conclusion, fix the evidence wording when that file is next
edited.

---

## 3. The runtime fusion model (what the class shapes prove)

Decompiled class shapes (`.scratch/export/ExportedProject/Assets/Scripts/Assembly-CSharp/`):

- `UpgradeInfo` (`UpgradeInfo.cs:23`) — `public UpgradeInfo[][] MergeComponents;`
  This is the **evolution recipe table only** (the same data the site already
  parses). `HasMergeCombo(h1, h2)` (`:119`) tests whether two upgrades form a
  2-component evolution; that is the "Evolves instead" rule.
- `HeroInfo` (`HeroInfo.cs:12-18`) — the per-ball structured effect model:
  `List<StatusEffectType> HitEffects`, `List<BallAOEType> AOETypes`,
  `List<BallSpecialType> Specials`, `DamageType DmgType`.
  `GetComboIcon(HeroInfo)` (`:86`), `ApplyComboDetails(HeroInfo, …)` (`:126`),
  and `HasSynergy(HeroInfo)` (`:91`) are the runtime tooltip/icon/synergy
  assembly.
- `UpgradeInst<T>` (`UpgradeInst.cs:11`) — `public List<HeroType> CombinedHeroes;`
  and `IsCombo()` (`:63`). A fused ball is one instance with a list of
  component hero types.
- `HeroInst : UpgradeInst<HeroInfo>` (`HeroInst.cs`) — the fused runtime ball:
  - `List<HeroStatData> StatData` (`:269`) — one stat block per component.
  - `GetHitEffects()` (`:335`) and `GetSpecials()` (`:351`) — iterator state
    machines with two nested loops (`_inf`, `_i`, `_cInf`, `_j`), i.e. they
    **union both components' lists**.
  - `CanCombine(HeroInst)` (`:377`), `CombineWith(HeroInst)` (`:382`),
    `IsBadComboInternal` / `IsBadCombo` (`:386`, `:391`),
    `HasComboComponent(UpgradeInfo)` (`:406`),
    `GetPendingComboIcon(HeroInst)` (`:430`).
  - `GetInfo(int idx)`, `GetNumInfo()`, `GetBaseInfo()`, `GetColorInfo()` —
    the component list and the first/second-pick roles.
- `HeroCombo` (`HeroCombo.cs:4-12`) — `struct { int Idx1; HeroType H1; int Idx2; HeroType H2; }`.
  This is an **ordered pair of (ball, evolution index)**. It is not a result
  definition.
- `BattleSaveData` (`BattleSaveData.cs:25,71-73`) — `List<HeroCombo> IgnoredFusions`
  (the player's "ignore this fusion" list), `NumCombosFused`, `NumEvosFused`.
- `HeroMetaStats` (`HeroMetaStats.cs:20`) — `public int[] NumCombos;`
  per-ball fusion-discovery counters. Counters only; no definitions.
- `LevelUpUI` (`LevelUpUI.cs:1738-1744`) — `_availMerges`, `_availHCombos`
  (`List<HeroCombo>`), `_fusionChoices` (`List<int>`); `GetTotalAvailFusions()`
  (`:1786`), `GetNumPossibleCombos()` (`:1841`), `GetComboScore(int, HeroCombo)`
  (`:2175`), `ApplyCombo()` (`:1960`), `_RevealFusion()` (`:2057`),
  `SelectComboComponent(ComboSelectItem)` (`:2062`), `ConfirmIgnoreFuser()`
  (`:2089`). The available-pair list is **computed at runtime** from the
  player's current balls and scored; it is not loaded from a table.
- `FuserOptionType` (`FuserOptionType.cs`) — `kFreeUpgrades`, `kCombo`, `kEvo`:
  the Fuser pickup offers free upgrades, a fusion, or an evolution.
- `InfoDB` (`InfoDB.cs:11`) — `HeroInfo[] Heroes`, `BaseHeroes`, `Passives`,
  `Chars`; no fusion table.

No `FusionInfo` / `ComboInfo` / `FusionRecipe` ScriptableObject class exists,
and no asset in the export is a fusion data asset. The only `HeroCombo`
containers are `BattleSaveData.IgnoredFusions` and `LevelUpUI._availHCombos`.

### 3.1 The game's own cross-wire templates

`I2Languages.asset` contains exactly four `*_combo_details` terms — the
game-authored descriptions of fused cross-wires:

| Loc term | English text | Site branch |
|---|---|---|
| `aoe_hiteff_combo_details` | "Area-of-effect damage from {[aoe]} also inflicts status effects from {[hiteff]}." | `aoe-carries-on-hit` |
| `ballspawner_combo_details` | "Spawned balls from {[spawner]} have the same properties as {[fused]}." | `spawn-carries-on-hit` |
| `glacier_combo_details` | "Glacial Spikes apply the hit effects from {[fused]} when touching an enemy." | `spawn-carries-spawn-bound` |
| `mosquito_combo_details` | "Mosquitoes also inflict hit effects from {[fused]} when hitting an enemy." | `spawn-carries-on-hit` (Mosquito special case) |

Also confirmed: `combo_name` = `{[NAME1]}<sprite name=x>{[NAME2]}` (the "A X B"
name), `error_combo_evo` ("These two balls already form an evolution, you
can't fuse them normally"), `error_combo_self` ("You can't fuse two balls of
the same type"), `tut_fusion` ("Fusion combines any two fully upgraded balls,
combining their properties into one ball. Balls can only be fused once."), and
`ignore_fuser_desc` ("Gain {[num]} gold instead of taking a fusion.").

**The DLC localization (`I2Languages_DLC.asset`) adds no new
`*_combo_details` template.** The Risen build's fusion tooltip logic is
unchanged: the same four branches cover the new balls.

There is no localization template for an "AOE carries instant kill" line; the
site's `aoe-carries-kill` branch remains a community/reported model, not a
game-advertised line.

---

## 4. The structured per-ball channel data (the useful find)

Every `HeroInfo` asset carries `HitEffects`, `AOETypes`, `Specials`, and
`DmgType` as plain Unity-serialized fields. These were **not** in the existing
`extract.json`; they are extractable from the raw `.assets` (the parser is in
`§11`). They are the authoritative channel classification the site's text
heuristic approximates.

Enum maps (from the decompiled enums):

- `StatusEffectType`: `kBurn 0, kFrozen 1, kPoison 2, kBleed 3, kLightningRod 4,
  kLeech 5, kDisease 6, kSlow 7, kCharm 8, kBerserk 9, kBlind 10, kCurse 11,
  kMaggot 12, kFrostburn 13, kRadiation 14, kLovestruck 15, kOvergrowth 16,
  kSap 17, kSprint 18, kDarkFlame 19, kVenom 20, kZombie 21, kTumor 22,
  kPetrify 23, kTimeSnared 24, **kIvy 25**, kNum 26`.
- `BallAOEType`: `kLightning 0, kLaserHorz 1, kLaserVert 2, kBomb 3,
  kEarthquake 4, kRay 5, kNuke 6, kFlash 7, kXRay 8, kWood 9, kNum 10`.
- `BallSpecialType`: existing values plus **`kSteamTrail 53, kTsunami 54,
  kDestroyOnWall 55, kWaterfall 56, kGale 57, kFruit 58, kBeast 59,
  kWolfpack 60, kKaiju 61, kHedgehog 62`**. (`kLavaTrail 5` is used only by
  Ash; `kGhost 0` is the pierce marker.)
- `DamageType`: unchanged (`kNormal 0 … kWater 17`).

The inverted maps for the new content:

- `kGhost` (pierce) — Ash, Bullet, Force, Gale, Siren, Steam, Tsunami (new)
  plus Erosion, Sniper, Ghost, Noxious, Phantom, Sandstorm, SoulSucker, Storm,
  Wind, Wraith (existing).
- `kBeast` (attach) — Beast, Werewolf, Wolfpack, Thunderbird.
- `kLavaTrail` — Ash only. `kSteamTrail` — Steam only.
- `kEggSac` (spawn) — Water (plus Egg Sac). `kBroodMother` (spawn) — Water Bug
  (plus Brood Mother). `kWolfpack` (spawn copies) — Wolfpack.
  `kHedgehog` (spawn spikes) — Hedgehog.
- `kLandslide` — Mudslide (plus Landslide). `kWaterfall` — Waterfall.
  `kTsunami` + `kDestroyOnWall` — Tsunami. `kKaiju` — Kaiju. `kGale` — Gale,
  Stalagmite. `kFruit` — Fruit.
- `kSteel` (damage ramp) — Force (plus Steel). `kStone` (damage decay) —
  Bullet (plus Stone). `kHealthPctDmg` — Rot (plus Erosion). `kDark` — Rot,
  Misfortune (plus Dark, Time Freeze). `kStorm` — Thunderbird (plus Storm).
- `kIvy` (new status) — Ivy only. `kSlow` — Mudslide (plus Wind).
  `kCharm` — Siren (plus Charm, Incubus, Succubus). `kCurse` — Misfortune
  (plus Banshee, Phantom, Sacrifice). `kBleed` — Hedgehog (plus Bleed,
  Hemorrhage, Leech, Sacrifice, Vampire Lord).

---

## 5. New balls — game channels and recommended kit channels

`BALL_KIT.channels` feeds `channelsOf` → `statusChannel` → the wire
predicates. It is **the status's application channel**, not every effect the
ball has. Non-status mechanics (attach, return, orbit, teleport, wall-trigger)
do not belong in `channels`; they are specials/tags, and `statusChannel`
returns `null` for a ball without the `status-effect` tag anyway.

| Ball | Game `HitEffects` | Game `AOETypes` | Game `Specials` | Recommended `channels` | `statusChannel` |
|---|---|---|---|---|---|
| Ash | — | — | kLavaTrail, kGhost | `['field']` | field (burn via trail) |
| Beast | — | — | kBeast | `['per-second']` | null |
| Bullet | — | — | kStone, kGhost | `[]` | null |
| Force | — | — | kSteel, kGhost | `[]` | null |
| Fruit | — | — | kFruit | `[]` | null |
| Gale | — | — | kGale, kGhost | `[]` | null |
| Hedgehog | kBleed | — | kHedgehog | `['on-hit']` | hit |
| Ironwood | — | kWood | — | `[]` | null |
| Ivy | kIvy | — | — | `['on-hit']` | hit |
| Kaiju | — | — | kKaiju | `['per-second']` | null |
| Misfortune | kCurse | kFlash | kDark | `['on-hit']` | hit |
| Mudslide | kSlow | — | kLandslide | `['on-hit']` | hit |
| Rot | — | — | kHealthPctDmg, kDark | `[]` | null |
| Siren | kCharm | — | kGhost | `['on-hit']` | hit |
| Stalagmite | — | kEarthquake | kGale | `[]` | null |
| Steam | — | — | kSteamTrail, kGhost | `['field']` | null (no status tag) |
| Thunderbird | — | — | kStorm, kBeast | `['per-second']` | null |
| Tsunami | — | — | kTsunami, kGhost, kDestroyOnWall | `[]` | null |
| Water | — | kBomb | kEggSac | `['spawn']` | null (no status tag) |
| Water Bug | — | — | kBroodMother | `['spawn']` | null |
| Waterfall | — | — | kWaterfall | `['field']` | null |
| Werewolf | — | — | kBeast | `['per-second']` | null |
| Wolfpack | — | — | kBeast, kWolfpack | `['spawn', 'per-second']` | null |
| Wood | — | kWood | — | `[]` | null |

Notes:

- **Ash is the one text-heuristic failure.** Its L3 text ("applies 1 stack of
  burn per second") does not match `FIELD_AURA_TEXT` (`every second`,
  `per second to all`, …), so without a kit entry `channelsOf` returns
  `['on-hit']` — wrong. The game data says `HitEffects = []`; the burn comes
  from the ash trail (`kLavaTrail`). Add the kit entry (and, as a belt-and-
  braces fallback, `CHANNEL_OVERRIDES.ash = 'field'`).
- **Mudslide's slow is on-hit** (`HitEffects = [kSlow]`), even though the prose
  describes the landslide slowing. Do not record `field` for Mudslide; the
  landslide is a separate damage special.
- **Hedgehog's spawn is a special, not a status channel.** Record `['on-hit']`
  for the bleed and rely on the `spawns-baby-balls` tag for the spawn carrier.
- **Steam/Waterfall/Kaiju/Beast** have no status; their `per-second`/`field`
  entries are inert for `statusChannel` but keep the kit faithful.
- **No new `Channel` value is needed.** `on-hit` / `per-second` / `spawn` /
  `field` cover every new status. Attach maps to `per-second`, trails to
  `field`; return/orbit/teleport/wall-trigger are not statuses and need no
  channel.

---

## 6. New scalar vocabulary and kit recommendations

The site's rule: record only properties that can collide (a shared key with a
different value is an order effect). Values not verbatim in the L3 text must
be `source: 'reported'` (the `data.test.ts` scalar-verbatim check).

### 6.1 New keys (proposed)

| Key | Game property | Collides with |
|---|---|---|
| `charm-chance` | `kCharmChance` | Charm, Incubus, Succubus |
| `charm-duration` | `kCharmLength` | Charm, Incubus, Succubus |
| `slow-pct` | `kSlowPct` | Wind, Swamp, Elemental |
| `slow-duration` | `kSlowLen` | Wind, Swamp, Elemental |
| `overgrowth-max-stacks` | `kMaxOvergrowthStacks` | Overgrowth |
| `overgrowth-burst-damage` | `kMin/MaxOvergrowthDamage` | Overgrowth |
| `emission-length` | `kEmissionLength` | Ash ↔ Steam |
| `steam-lifetime` | `kSteamLifetime` | Ash ↔ Steam |
| `steam-damage` | `kMin/MaxSteamDamage` | none (Steam only) |
| `landslide-duration` | `kLandslideLen` | Landslide |
| `landslide-damage` | `kMin/MaxLandslideDamage` | Landslide |
| `water-damage` | `kMin/MaxWaterDamage` | Tsunami, Water, Waterfall |
| `field-duration` | `kDuration` | none (Waterfall only) |
| `damage-per-second` | `kMin/MaxDamagePerSecond` | Beast, Werewolf, Wolfpack, Thunderbird |
| `pack-size` | `kPackSize` | none (Wolfpack only) |
| `aoe-damage` | `kMin/MaxAOEDamage` | Wood ↔ Ironwood |
| `earthquake-damage` | `kMin/MaxEarthquakeDamage` | Earthquake, Glacier, Magma, Swamp, Kaiju, Stalagmite |
| `fall-damage` | `kMin/MaxFallDamage` | none (Gale only) |
| `lightning-damage` | `kMin/MaxLightningDamage` | Blizzard, Lightning Bug, Lightning, Lightning Rod, Thunderbird, Storm |
| `max-damage-pct` | `kMaxDamagePct` | Steel, Force, Ironwood, Wood |
| `damage-decay` | `kReduceDmgPct` | Stone, Heart Swallower, Bullet, Soul Sucker |
| `min-damage-pct` | `kMinDamagePct` | Stone, Bullet |
| `curse-damage` | `kMin/MaxCurseDamage` | Banshee, Incubus, Phantom, Sacrifice |
| `curse-delay` | `kCurseDelay` | Banshee, Incubus, Phantom, Sacrifice |
| `damage-multiplier` | `kDamageMultiplier` | Black Hole, Dark, Steel, Iron, Kaiju, Misfortune, Wind |
| `self-speed-reduction` | `kReduceSpeedPct` | Steel, Iron, Kaiju |
| `lifesteal-chance` | `kLifeStealChance` | Heart Swallower, Soul Sucker, Vampire, Werewolf |
| `lifesteal-heal` | `kLifeStealHeal` | many |
| `spawn-count` | `kMin/MaxBabies` | Egg Sac, Catapult, Sniper, Maggot, Hedgehog, Water, Shotgun |
| `bleed-amount` | `kBleedAmt` | Bleed, Sacrifice, Leech, Hedgehog |
| `hit-limit` | `kHitLimit` | none (Fruit only) |
| `heal-amount` | `kHealAmt` | none (Fruit only) |

Existing keys reused: `cooldown` (`kCooldownLength`), `burn-max-stacks`,
`burn-duration`, `burn-per-stack-damage`, `bonus-damage` (`kBonusDamagePct`),
`bleed-max-stacks`, `range`, `poison-per-stack-damage`.

### 6.2 Recommended kit entries (new balls)

Only collision-relevant scalars are listed; `†` = value not verbatim in the
L3 text, mark `source: 'reported'`. Values are L3.

| Ball | Scalars |
|---|---|
| Ash | `burn-max-stacks('max 4 stacks')`, `burn-duration('8 seconds')`, `burn-per-stack-damage('4–7')`, `emission-length('50')`, `steam-lifetime('60 seconds')`, `range('2', reported)†` |
| Beast | `damage-per-second('100–200')` |
| Bullet | `bonus-damage('1200%')`, `damage-decay('200%')`, `min-damage-pct('100%')` |
| Force | `bonus-damage('15%')`, `max-damage-pct('300%')` |
| Fruit | `hit-limit('4')`, `heal-amount('6')` |
| Gale | `fall-damage('150–200')` |
| Hedgehog | `bleed-max-stacks('Max 14 stacks')`, `bleed-amount('5 stacks')`, `spawn-count('2–4')` |
| Ironwood | `aoe-damage('15–20')`, `bonus-damage('15%')`, `max-damage-pct('300%')`, `range('3', reported)†` |
| Ivy | `overgrowth-max-stacks('4')`, `overgrowth-burst-damage('130–200')`, `poison-per-stack-damage('1–4')`, `range('3', reported)†` |
| Kaiju | `damage-multiplier('triple')` (property 300), `earthquake-damage('70–180')`, `self-speed-reduction('80%', reported)†`, `range('5', reported)†` |
| Misfortune | `damage-multiplier('600x')`, `cooldown('4 second')`, `curse-damage('20–40')`, `curse-delay('5')` |
| Mudslide | `landslide-duration('5 seconds')`, `landslide-damage('40–50')`, `slow-pct('30%', reported)†`, `slow-duration('5 seconds')`, `range('2 tile')` |
| Rot | `bonus-damage('30%')`, `cooldown('5 second')` |
| Siren | `charm-chance('75%')`, `charm-duration('12 seconds')` |
| Stalagmite | `earthquake-damage('25–30')`, `range('4x4 tile')` |
| Steam | `steam-damage('30–60')`, `emission-length('60 seconds')`, `steam-lifetime('80 seconds')` |
| Thunderbird | `damage-per-second('120–200')`, `lightning-damage('1–80')`, `range('2', reported)†` |
| Tsunami | `water-damage('90–170')`, `range('2', reported)†` |
| Water | `spawn-count('4–6')`, `water-damage('40–110')`, `cooldown('3 second')`, `range('3', reported)†` |
| Water Bug | `birth-chance('100%', reported)†` (optional; no collision) |
| Waterfall | `field-duration('80 seconds')`, `water-damage('20–25')`, `range('2 tile')` |
| Werewolf | `damage-per-second('150–200')`, `lifesteal-chance('400%')`, `lifesteal-heal('3')` |
| Wolfpack | `damage-per-second('100–200')`, `pack-size('2')` |
| Wood | `aoe-damage('6–11')`, `bonus-damage('10%')`, `max-damage-pct('200%')`, `range('3', reported)†` |

Casing caveat: the game extract capitalizes "Max 14 stacks" / "Max 20 stacks"
while the site's current wiki-sourced L3 overlay lowercases them ("max 14
stacks"). The scalar-verbatim check is case-sensitive, so match whatever
casing the site's `src/data/level-3.ts` lands with for each new ball. Ash's
own text already lowercases "max 4 stacks".

Formatting caveat: Werewolf's `kLifeStealChance = 400` renders as "400%" in
the L3 text. The extract package flags this as a probable tenths/display
artifact (compare Heart Swallower's 700%). Record it verbatim for the
verbatim test, but do not treat 400% as a balance fact.

Cross-cutting kit updates (existing balls that must gain the new keys to make
the collisions real):

- `overgrowth` — add `overgrowth-max-stacks('2')`, `overgrowth-burst-damage('180–250')`.
- `landslide` — add `landslide-duration('5 seconds')`, `landslide-damage('30–40')`.
- `steel` — add `max-damage-pct('400%')`, `damage-multiplier('200%')`, `self-speed-reduction('50%')`.
- `dark` — add `damage-multiplier('500%')`.
- `stone` — add `damage-decay('30%')`, `min-damage-pct('50%')`.
- `storm` — add `lightning-damage('1–80')`; `blizzard` — add `lightning-damage('1–70')`.
- `poison`/`noxious`/`brimstone`/`swamp` — add `poison-per-stack-damage` (Ivy collides).
- `charm`/`incubus`/`succubus` — add `charm-chance`/`charm-duration`.
- `wind`/`swamp`/`elemental` — add `slow-pct`/`slow-duration`.
- `banshee`/`incubus`/`phantom`/`sacrifice` — add `curse-damage`/`curse-delay`.
- `bleed`/`sacrifice`/`leech` — add `bleed-amount`.
- `earthquake`/`glacier`/`magma`/`swamp` — add `earthquake-damage`.
- `egg-sac`/`catapult`/`sniper`/`maggot`/`shotgun` — add `spawn-count`.
- `heart-swallower`/`soul-sucker`/`vampire` — add `lifesteal-chance`/`lifesteal-heal`.

This is a larger kit expansion than the new balls alone; S3 should decide
whether to land it in one pass (faithful collisions) or start with the new
balls and the highest-value collisions (burn, charm, slow, ivy/overgrowth,
landslide, water, cooldown).

---

## 7. Class-set updates for `fusion-knowledge.ts`

The structured data gives authoritative markers for several hand-maintained
sets. Recommendations for T16:

- **Pierce** — the game's `kGhost` special is the authoritative marker.
  Derive `isPierce` from `specials.includes(kGhost)` where the structured data
  is available, or add the missing ids: `ash`, `bullet`, `force`, `gale`,
  `siren`, `steam`, `tsunami` (new) and `phantom`, `storm` (existing gaps).
- **Cooldown class** — add `water` (3 s), `misfortune` (4 s), `rot` (5 s).
- **Destroy class** — add `rot`, `misfortune` (kDark), `tsunami`
  (kDestroyOnWall), `waterfall`, `mudslide` (destroy self on hit). Also
  `time-freeze` (kDark) if the site's class is derived from kDark.
- **Spawn carriers** — `water` (kEggSac), `water-bug` (kBroodMother),
  `wolfpack` (kWolfpack), `hedgehog` (kHedgehog). These are full-inheritance
  carriers like Egg Sac, not status-only; add the editorial tags
  (`spawns-baby-balls` / `spawns-allies`) and let `spawnable()` handle them.
  No `SPAWN_STATUS_ONLY_IDS` or `SPAWN_NO_INHERITANCE_IDS` change.
- **AOE carriers** — `wood`, `ironwood` (kWood), `stalagmite` (kEarthquake),
  `misfortune` (kFlash), `water` (kBomb). The editorial `aoe` tag drives
  `aoeRank`; no new set.
- **Kill effect** — none new. `KILL_EFFECT_IDS` unchanged.
- **`ON_DAMAGE_STATUS_IDS`** — no new evidence for ivy; leave unchanged.
- **`CHANNEL_OVERRIDES`** — add `ash: 'field'` only if the kit entry is not
  used; the kit is the primary fix.

---

## 8. Cross-wire rules for the new mechanics

The existing four branches suffice; the game's four `*_combo_details`
templates map onto them (§3.1). The new mechanics:

| Mechanic | Balls | Channel | Cross-wire rule | Confidence |
|---|---|---|---|---|
| Attach (kBeast) | Beast, Werewolf, Wolfpack, Thunderbird | `per-second` | Attach damage is a per-second tick, not a hit; it should **not** carry an on-hit status. No new branch; treat like a field/AOE carrier. | inferred (class shape + trigger matrix); unverified |
| Field/trail (kLavaTrail, kSteamTrail) | Ash, Steam | `field` | A trail is a field carrier; only damage-riding statuses can ride (existing `canCarry`). Ash's own burn is field, so it does not ride a partner's hits. | inferred; unverified |
| Field (kWaterfall, kLandslide, kTsunami, kKaiju) | Waterfall, Mudslide, Tsunami, Kaiju | `field`/`per-second` | Same as field/trail. | inferred; unverified |
| Spawn (kEggSac, kBroodMother, kWolfpack, kHedgehog) | Water, Water Bug, Wolfpack, Hedgehog | `spawn` | `ballspawner_combo_details` is the game's own statement that spawned balls inherit the fused properties; the existing `spawn-carries-on-hit` branch applies. | game-advertised template |
| AOE (kWood, kEarthquake, kFlash, kBomb) | Wood, Ironwood, Stalagmite, Misfortune, Water | — | `aoe_hiteff_combo_details` is the game's own statement that AOE carries on-hit statuses; the existing `aoe-carries-on-hit` branch applies. | game-advertised template |
| Return | Fruit (heal on return); character Recollector; Teardrop passives | — | Trajectory mechanic, not a status. No branch. | n/a |
| Orbit | character Scandalmonger; Crystal Decanter, Liquid Flame | — | Trajectory mechanic, not a status. No branch. | n/a |
| Teleport | character Wallbreaker; Handheld Rupture warp | — | Trajectory mechanic, not a status. No branch. | n/a |
| Wall-triggered | Tsunami (kDestroyOnWall); Wrapped Explosive, Eldritch Dagger, Cracked Cinderblock passives | — | A special/passive trigger, not a status. No branch; Tsunami joins the destroy class. | n/a |

**No new `WireKind` is needed.** The site's four branches are exactly the
game's four advertised cross-wire templates (with the kill branch remaining
community-reported).

---

## 9. Corpus: can new observations be sourced?

**No pair-specific fusion observations** exist in the dump. The game
assembles the fused tooltip at runtime and stores no per-pair text; the
localization templates are generic. What the dump does provide is
**mechanism-backed** evidence:

- the structured `HitEffects` / `AOETypes` / `Specials` per ball (authoritative
  channel classification);
- the four game-authored cross-wire templates;
- the class shapes that prove the union/merge model.

These justify the **kit/channel** changes in S3/T16 but are not observations.
The raw corpus layer is append-only and observation-shaped; do **not** add
mechanism-backed rows to it. If the curated layer wants them, `inferred` is
the honest confidence, and the source is this file plus the game data — not a
community report.

**Recommendation: no DLC corpus wave from this dump.** A DLC wave needs
community/playtest observations (the usual harvest routes), which are not
present here.

---

## 10. Recommendations for S3 (#29) and T16 (#42)

**S3 (#29) — the contract:**

1. Confirm the no-table conclusion; fix the "strings appear zero times"
   wording in `fusion-mechanics.md` §1.1/§4 to "no fusion data table" (§2
   here).
2. Add `BALL_KIT` entries for all 24 new balls with the scalars in §6.2 and
   the channels in §5. Mark property-only values `source: 'reported'`.
3. Add the new scalar keys in §6.1 (or the subset S3 chooses) and the
   cross-cutting existing-ball updates in §6.2.
4. Add `ash: 'field'` to `CHANNEL_OVERRIDES` only if the kit entry is not
   used; the kit is preferred.
5. Update the class sets in §7 (pierce, cooldown, destroy, spawn, AOE).
6. Add no new `Channel` value and no new `WireKind`; document the attach/
   field/trail/return/orbit/teleport/wall-trigger decisions in the module
   header or glossary.
7. Corpus: no DLC wave; state that the kit/channel changes are
   mechanism-backed, not observed.
8. Glossary: refine "the game stores no fusion table" to note that the game
   *does* store structured per-ball effect channels and runtime ordered-pair
   state, but no fusion result table.

**T16 (#42) — the implementation:**

- Apply the S3 contract; add tests for the new kits and the new class-set
  members.
- Keep `data.test.ts`'s scalar-verbatim check green (`reported` for
  property-only values).
- Add a regression test naming the Ash misclassification (text heuristic says
  on-hit; game data says field) if the kit/override is the fix.
- No new wire branch tests are needed; add coverage that the new spawn/AOE
  carriers flow through the existing branches.

---

## 11. Reproduction

The extraction used the package's UnityPy + Odin pipeline
(`.scratch/scan_assets.py`, `.scratch/parse_unity.py`,
`.scratch/odin_parse.py`) plus a small continuation parser for the
`HeroInfo` fields after `Evolutions`:

```sh
# from the repo root, with UnityPy available (the package's .scratch/pylib)
python3 -I <script> game-data/BALLxPIT/Balls_Data <namesets.json> out.json
```

The parser reads `Type` (int32), `HitEffects` (int32 count + int32[]),
`AOETypes`, `Specials`, `DmgType`, then `BallColor` (4 floats), `RotType`,
`RotSpeed`, `IconPriority`. It parsed all 114 balls; the values cross-check
against the L3 text and the known existing balls (Burn, Sun, Glacier, Water,
Brood Mother, etc.).

The decompiled scripts are from the AssetRipper export
(`.scratch/export/ExportedProject/Assets/Scripts/Assembly-CSharp/`). The
localization is `.scratch/export/ExportedProject/Assets/Resources/I2Languages.asset`
and `I2Languages_DLC.asset`.

---

## Uncertainty summary

- **Fusion table/pair data: high confidence.** No data class, no asset, no
  table; the runtime state is `HeroCombo` lists and counters.
- **Runtime composition logic: medium-high confidence.** The class shapes and
  the four tooltip templates are direct evidence; the method bodies are
  stubs, so the exact merge algorithm (especially `IsBadCombo` and the
  first-pick scalar rule) is inferred, not read.
- **Structured channels: high confidence** for the extracted values (they
  cross-check against known balls and the L3 text). The mapping from
  `HitEffects` to the site's `Channel` vocabulary is a modeling decision, not
  a game label.
- **Ash's trail burn: medium-high.** `HitEffects = []` and `kLavaTrail` are
  direct; the exact trail-tick logic is not readable.
- **Attach/field/trail cross-wires: low.** No pair observations; the
  no-wire recommendation follows the trigger matrix and the class shape, not
  a test.
- **New corpus observations: none available.** Do not invent them.
