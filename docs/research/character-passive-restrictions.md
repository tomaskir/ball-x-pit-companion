# Character–passive restrictions

Which passives each character can actually be offered, datamined from the
Risen Ballbylon build. This is a **research snapshot** (2026-11-13) and is not
parsed by the data pipeline. It supersedes the "no confirmed per-character
lockout" conclusion in `passive-availability.md` for the DLC build.

Game build: `Balls_Data/BuildVersion.txt` = **1.308**, 2026-10-12
(`game-data/BALLxPIT`). The repo's checked-in `src/data/` is the older
pre-DLC wiki snapshot (71 passives, 23 characters); this document covers the
DLC build (116 passives, 31 characters).

## Bottom line

There are **two different character-dependent mechanisms**, and they should
not be conflated:

1. **A hard per-character allow-list for the 45 DLC passives.** Every DLC
   passive is usable by exactly one character, except four that are shared by
   two characters each (Crystal Decanter and Liquid Flame for Carouser and
   Scandalmonger; Cracked Cinderblock and Handheld Rupture for Sisyphus and
   Wallbreaker). The rule is an allow-list, not an exclusion list: a
   character outside the list is never offered the passive. Evolved DLC
   passives inherit the restriction from their recipe components, so the
   base-tier lock gates the higher tiers.
2. **Character-stat gates on a handful of base-game passives.** These are not
   per-item allow-lists; they test the character's stats/props (baby-ball
   capability, brick-breaker, gravity, shotgun, turn-based) or the current
   ball loadout. They apply to every character equally in form, but the
   character's own stats decide the outcome.

Everything else in the base-game passive pool is character-independent. The
only character with a blanket slot-count exclusion is **The Ballbearer**
(zero passive slots). **The Hoary Hoarder** is the inverse (double passive
slots).

The offer pool applies the rule in `LevelUpUI.PopulateUpgrades` by calling
`PassiveInfo.CanBeUsed()` on every new passive; the encyclopedia uses the
same rule (`IsCharSpecific()` + `CanBeUsed(CharType)`) to display which
characters can use a character-specific passive. `CanBeUsed()` also requires
the passive's level to be unlocked (`IsUnlocked` / `GetRequiredLevel`); that
gate is character-independent and not covered further here.

## Method

- `game-data/BALLxPIT/GameAssembly.dll` + `Balls_Data/il2cpp_data/Metadata/global-metadata.dat`
  dumped with Il2CppDumper v6.7.46 (`dump.cs`, `script.json`).
- Method bodies disassembled with `objdump -d -M intel`:
  - `PassiveInfo.CanBeUsed(CharType)` — RVA `0x4D30A0`
  - `PassiveInfo.CanBeUsed()` — RVA `0x4D2610`
  - `PassiveInfo.IsCharSpecific()` — RVA `0x4D3630`
  - `LevelUpUI.PopulateUpgrades()` — RVA `0x555030`
  - `EncyclopediaUI.HoverItem(EncyclopediaItem)` — RVA `0x514FF0`
  - `CharBattleInst.HasProp(CharProp)` / `HasProp(StatPropType)` — RVA `0x4C2B60` / `0x4C2C40`
    (backed by `CharInfo.HasProp` at `0x4C4500` / `0x4C4560`)
- Passive/character data cross-checked against the Odin-decoded assets
  (`.scratch/decoded.json`) and the exported `MonoBehaviour` YAML.

## The DLC allow-list

`CanBeUsed(CharType ct)` is a jump table on `PassiveInfo.Type` for types
72–111. Each case compares `ct` with one or two `CharType` values and returns
equality. Types 95–110 (and 112–116, which fall through the range check) use
the recursive branch instead; see "Evolved passives inherit" below.

| Passive | Type | Kind | Recipe | Usable by |
|---|---:|---|---|---|
| Rusted Blade | 72 | base | — | The Warrior |
| Teardrop Necklace | 73 | base | — | The Repentant |
| Silver Revolver | 74 | base | — | The Itchy Finger |
| Wrapped Explosive | 75 | base | — | The Embedded |
| Unkempt Cradle | 76 | base | — | The Cohabitants |
| Kris Knife | 77 | base | — | The Shade |
| Juggler's Club | 78 | base | — | The Juggler |
| Lucky Coin | 79 | base | — | The Spendthrift |
| Hand Me Downs | 80 | base | — | The Empty Nester |
| Spiked Discipline | 81 | base | — | The Flagellant |
| Fractured Boulder | 82 | base | — | The Makeshift Sisyphus |
| Test Tube | 83 | base | — | The Physicist |
| Steel Bulwark | 84 | base | — | The Shieldbearer |
| Hand Drill | 85 | base | — | The Tunneller |
| Kunai | 86 | base | — | The Tiptoer |
| Crystal Decanter | 87 | base | — | The Carouser, The Scandalmonger |
| Bent Spyglass | 88 | base | — | The Sentinel |
| Cracked Cinderblock | 89 | base | — | The Makeshift Sisyphus, The Wallbreaker |
| Refracting Glass | 90 | base | — | The Recollector |
| Goniometer | 91 | base | — | The Scrupulous Scoundrel |
| Ancient Ladle | 92 | base | — | The Potager |
| Eldritch Gauntlet | 93 | base | — | The Right Hand Man |
| Charged Bracelet | 94 | base | — | The Conduit |
| Vampire's Kiss | 95 | evolved | Rusted Blade + Vampiric Sword | The Warrior |
| Teardrop Dagger | 96 | evolved | Teardrop Necklace + Sapphire Hilted Dagger | The Repentant |
| Peacemaker | 97 | evolved | Silver Revolver + Silver Bullet | The Itchy Finger |
| Volatile Explosive | 98 | evolved | Wrapped Explosive + Pressure Valve | The Embedded |
| Cradle of Filth | 99 | evolved | Unkempt Cradle + Baby Rattle | The Cohabitants |
| Shadow Blade | 100 | evolved | Kris Knife + Ruby Hilted Dagger | The Shade |
| Juggler's Wheel | 101 | evolved | Juggler's Club + Wagon Wheel | The Juggler |
| Baby Armor | 102 | evolved | Hand Me Downs + Iron Onesie | The Empty Nester |
| Relentless Whip | 103 | evolved | Spiked Discipline + Bottled Tornado | The Flagellant |
| Levitating Rock | 104 | evolved | Fractured Boulder + Magic Staff | The Makeshift Sisyphus |
| Spiked Shield | 105 | evolved | Steel Bulwark + Spiked Collar | The Shieldbearer |
| Reacher's Drill | 106 | evolved | Hand Drill + Reacher's Spear | The Tunneller |
| Blood Kunai | 107 | evolved | Kunai + Everflowing Goblet | The Tiptoer |
| Sands of Time | 108 | evolved | Test Tube + Hourglass | The Physicist |
| Liquid Flame | 109 | evolved | Crystal Decanter + Midnight Oil | The Carouser, The Scandalmonger |
| Eyeless Spyglass | 110 | evolved | Bent Spyglass + Silver Blindfold | The Sentinel |
| Handheld Rupture | 111 | evolved (explicit override) | Cracked Cinderblock + Fractured Boulder | The Makeshift Sisyphus, The Wallbreaker |
| Refracted Echo | 112 | evolved | Refracting Glass + Dynamite | The Recollector |
| Tilted Dagger | 113 | evolved | Goniometer + Emerald Hilted Dagger | The Scrupulous Scoundrel |
| Mystic Dipper | 114 | evolved | Ancient Ladle + Magic Staff | The Potager |
| Eldritch Dagger | 115 | evolved | Eldritch Gauntlet + Diamond Hilted Dagger | The Right Hand Man |
| Charged Bow | 116 | evolved | Charged Bracelet + Shortbow | The Conduit |

### Evolved passives inherit

For a passive whose type is not in the explicit switch (types 95–110 and
112–116), `CanBeUsed(ct)` walks `UpgradeInfo.MergeComponents`: every
component that is itself a passive must return true for the same `ct`, or the
evolved passive returns false. The effective allowed set is therefore the
**intersection of the components' allowed sets**.

Examples:

- Vampire's Kiss = Rusted Blade (Warrior-only) + Vampiric Sword (all) →
  Warrior only.
- Liquid Flame = Crystal Decanter (Carouser/Scandalmonger) + Midnight Oil
  (all) → Carouser or Scandalmonger.
- Refracted Echo = Refracting Glass (Recollector) + Dynamite (all) →
  Recollector only.

**Handheld Rupture is the one deliberate exception.** Its components would
intersect to Sisyphus only (Fractured Boulder is Sisyphus-only; Cracked
Cinderblock is Sisyphus or Wallbreaker), but type 111 has its own switch case
that allows **Sisyphus or Wallbreaker**. The game widens the evolution beyond
what the component intersection would give.

The recursion only propagates the **character allow-list**. It does not
re-check the base-game stat gates (War Horn, Baby Rattle, etc.); those are
checked when the component itself is offered. In practice the component must
still be obtained before the fusion is possible, so the stat gate propagates
through ownership rather than through `CanBeUsed(ct)`.

## Per-character view

"Signature passives" are the DLC passives that character alone can receive.
Four passives are shared by two characters each: Crystal Decanter and Liquid
Flame (Carouser and Scandalmonger), and Cracked Cinderblock and Handheld
Rupture (Sisyphus and Wallbreaker). "Base-game exclusions" are the
character-stat gates from the next section.

| Character | DLC signature passives | Base-game exclusions |
|---|---|---|
| The Warrior | Rusted Blade, Vampire's Kiss | — |
| The Repentant | Teardrop Necklace, Teardrop Dagger | — |
| The Itchy Finger | Silver Revolver, Peacemaker | — |
| The Tunneller | Hand Drill, Reacher's Drill | — |
| The Tiptoer | Kunai, Blood Kunai | — |
| The Cogitator | — | — |
| The Tactician | — | Radiant Feather, Shortbow |
| The Spendthrift | Lucky Coin | Shortbow |
| The Embedded | Wrapped Explosive, Volatile Explosive | — |
| The Radical | — | — |
| The Empty Nester | Hand Me Downs, Baby Armor | War Horn, Baby Rattle, Cornucopia |
| The Shade | Kris Knife, Shadow Blade | — |
| The Cohabitants | Unkempt Cradle, Cradle of Filth | — |
| The Physicist | Test Tube, Sands of Time | Upturned Hatchet |
| The Shieldbearer | Steel Bulwark, Spiked Shield | Radiant Feather, Magnet |
| The Makeshift Sisyphus | Fractured Boulder, Cracked Cinderblock, Levitating Rock, Handheld Rupture | War Horn, Baby Rattle, Cornucopia |
| The Flagellant | Spiked Discipline, Relentless Whip | — |
| The Juggler | Juggler's Club, Juggler's Wheel | — |
| The Hoary Hoarder | — | — |
| The Falconer | — | — |
| The Carouser | Crystal Decanter, Liquid Flame | — |
| The Ballbearer | — | **all passives** (zero passive slots) |
| The False Messiah | — | — |
| The Sentinel | Bent Spyglass, Eyeless Spyglass | — |
| The Wallbreaker | Cracked Cinderblock, Handheld Rupture | — |
| The Recollector | Refracting Glass, Refracted Echo | — |
| The Scandalmonger | Crystal Decanter, Liquid Flame | — |
| The Scrupulous Scoundrel | Goniometer, Tilted Dagger | — |
| The Potager | Ancient Ladle, Mystic Dipper | War Horn, Baby Rattle, Cornucopia |
| The Right Hand Man | Eldritch Gauntlet, Eldritch Dagger | — |
| The Conduit | Charged Bracelet, Charged Bow | — |

Characters with **no DLC signature passive** (Cogitator, Tactician, Radical,
Hoary Hoarder, Falconer, Ballbearer, False Messiah) cannot receive any DLC
passive at all, because every DLC passive is on someone else's allow-list.
They keep the full base-game passive pool (subject to the stat gates and, for
the Ballbearer, the zero-slot rule).

Minor AI interaction: `PassiveInfo.ShouldAIPick()` returns false for Vampiric
Sword (type 20), so AI-driven pickers (the Cogitator's auto-picker, the
Radical's AI) skip it. This is a pick preference, not an offer-pool gate.

Worked example — **The Empty Nester**:

- Base-game pool: everything except War Horn, Baby Rattle, and Cornucopia
  (the `kMultiHero` follower gate).
- DLC pool: Hand Me Downs and Baby Armor only. Every other DLC passive is on
  another character's allow-list, so it is never offered.
- Fusion consequence: Baby Armor is reachable (Hand Me Downs + Iron Onesie);
  Cradle of Filth is not (it needs Unkempt Cradle, which is Cohabitants-only),
  and Cornucopia is not (it needs Baby Rattle, which the follower gate
  removes).

## Base-game character-stat gates

These are checked in `PassiveInfo.CanBeUsed()` (no-arg) before it delegates to
`CanBeUsed(CharType)`. They are hard offer-pool gates: the passive is not
offered at all.

| Passive | Gate | Characters excluded |
|---|---|---|
| War Horn | `HasProp(StatPropType.kFollowerDamage)` = `!kMultiHero && !kNoBallDamage && !kAllInOne` | Empty Nester, Makeshift Sisyphus, Potager |
| Baby Rattle | same follower condition (`kNumFollowers`) | Empty Nester, Makeshift Sisyphus, Potager |
| Cornucopia | evolved from Baby Rattle + War Horn; effectively unavailable once both components are gated | Empty Nester, Makeshift Sisyphus, Potager |
| Radiant Feather | `HasProp(kBaseSpeed) && !HasProp(CharProp.kBrickBreaker) && TimeMode != kTurnBased` | Tactician (no Speed / turn-based), Shieldbearer (brick-breaker) |
| Magnet | `!HasProp(CharProp.kBrickBreaker)` | Shieldbearer |
| Shortbow | `HasProp(kFireRate) && !HasProp(CharProp.kShotgun) && TimeMode != kTurnBased` | Spendthrift (shotgun), Tactician (turn-based) |
| Upturned Hatchet | `!HasProp(CharProp.kGravity)` | Physicist |

Notes:

- `HasProp(StatPropType)` maps the stat prop to a `StatType`
  (`StatUtl.GetScalingStat`), then applies the character-specific switch. The
  only `StatType` a character lacks outright is Speed for the Tactician
  (`StatUtl.GetTimeMode(CharType)` returns `kTurnBased` only for
  `kTactician`).
- `kMultiHero` (Empty Nester), `kNoBallDamage` (Sisyphus), and `kAllInOne`
  (Potager) all fail the follower condition. This is the datamined
  confirmation of the old community claim that baby-ball passives are
  unavailable to Empty Nester and Sisyphus; it is a **hard gate**, not merely
  "useless".
- The old lead that Magnet is excluded for the Tactician is **refuted**: the
  Tactician has no `kBrickBreaker` prop.
- The old lead that Radiant Feather is excluded for the Shieldbearer is
  **confirmed**, and it is also excluded for the Tactician.
- The old lead that Ethereal Cloak is excluded for the Shade is **refuted**:
  Ethereal Cloak (type 23) has no case in `CanBeUsed()`.
- The old lead that crit/dagger passives are excluded for Sisyphus is
  **refuted**: the dagger passives (types 24–27) have no case.
- The old lead that fire-rate passives are excluded for the Itchy Finger is
  **refuted**: Shortbow's gate is shotgun/turn-based, and the Itchy Finger has
  neither prop.

`StatPropType` evaluation, for implementation:

- `StatUtl.GetScalingStat`: `kMaxHealth`/`kDefenseMult` → Endurance;
  `kHeroDamage` → Strength; `kNumFollowers`/`kFollowerDamage`/
  `kNumMultiHeroes` → Leadership; `kBaseSpeed`/`kMoveSpeed` → Speed;
  `kAcceleration`/`kCritChance`/`kFireRate`/`kReloadTime` → Dexterity;
  `kAOEDamageMult`/`kStatusEffectMult`/`kPassiveMult` → Intelligence.
- `HasStat(StatType)` is true for every stat except Speed on the Tactician.
- Special cases in `HasProp(StatPropType)`:
  `kHeroDamage` → `!kNoBallDamage`; `kNumFollowers` and `kFollowerDamage` →
  `!kMultiHero && !kNoBallDamage && !kAllInOne`; `kNumMultiHeroes` →
  `kMultiHero || kBrickBreaker`; `kFireRate` → `!kShotgun && !turnBased`;
  `kAcceleration`, `kReloadTime`, `kDefenseMult` are hidden and always true.

## Loadout gates (character-independent)

These check the current ball/passive loadout, not the character. They are
listed because they combine with the character gates when deciding whether a
passive is offered.

| Passive | Requirement |
|---|---|
| Cursed Elixir | a ball that applies Poison (`HasHitEffect(kPoison)`) |
| Frozen Spike | a ball that applies Frozen (`HasHitEffect(kFrozen)`) |
| Midnight Oil | a ball that applies Burn (`HasHitEffect(kBurn)`) |
| Voodoo Doll | a ball that applies Curse (`HasHitEffect(kCurse)`) |
| Kiss of Death | a ball that applies Charm (`HasHitEffect(kCharm)`) |
| Silver Blindfold | a ball that applies Blind (`HasHitEffect(kBlind)`) |
| Artificial Heart | an owned passive that creates a friendly piece (`ShouldNotHit`) |
| Ghostly Shield | an owned passive that creates a friendly piece (`ShouldNotHit`) |
| Traitor's Cowl | an owned passive that creates a stone ally (`IsStoneAlly`) |

The status gates are the same five status-ball gates documented in
`passive-availability.md`; the datamine confirms the exact `StatusEffectType`
values and adds Silver Blindfold (Blind), which the earlier wiki-only list did
not include.

## Slot-count gates

- **The Ballbearer** has zero passive slots (quirk text: "Has twice as many
  ball slots, but no passive slots"). No passive can be carried regardless of
  identity. This is a slot-count consequence, not an item-specific rule.
- **The Hoary Hoarder** has double passive slots (`CharProp.kDoublePassives`),
  so no passive is denied to it on slot grounds.
- Slot counts are meta-upgrade dependent; the baseline is upgrade-dependent,
  so "zero" for the Ballbearer and "double" for the Hoary Hoarder are the
  reliable character-level facts.

## Combined-character note

`CanBeUsed()` (no-arg) first checks the active character's `CharType`; if that
fails, it walks `CharBattleInst.CombinedTypes` and accepts the passive if any
combined type can use it. This is the character-combination mechanic (the
`SetCombo`/`AddCombo` path), not necessarily co-op. The loop stores the last
element's result, which is equivalent to "any combined type" only while the
list is short in the current build. Treat the rule as **usable by the active
character or any combined character type**.

## What this means for the site

- The DLC passive catalog should carry `characterIds` (the allow-list) and a
  derived `characterSpecific` flag. The encyclopedia already displays this in
  game.
- The plan/build-graph should reject or warn on a character + passive pairing
  outside the allow-list, and should propagate the restriction through fusion:
  a fused passive is unavailable if any passive component is unavailable.
- The base-game stat gates should be modelled separately from the DLC
  allow-list: they depend on character stats/props, not on item identity.
- The current `src/data/` is pre-DLC. Nothing in this document should be
  applied to the 71-passive catalog until the DLC data is integrated.

## Open questions

- Do the free-upgrade / Antique Shop / other non-level-up sources use the same
  `CanBeUsed()` gate? Only `LevelUpUI.PopulateUpgrades` calls it in this
  build; other sources may bypass it.
- The exact friendly-piece and stone-ally sets behind `ShouldNotHit` /
  `IsStoneAlly` need a full `GridPieceType` mapping to list which passives
  satisfy Artificial Heart, Ghostly Shield, and Traitor's Cowl.
- The combined-type loop's last-element behaviour should be re-checked if the
  game ever allows more than one combined character type.
- Slot counts are meta-upgrade dependent; the Ballbearer's zero and the Hoary
  Hoarder's double are character facts, but the exact baseline numbers are
  not in `CharInfo`.

## Sources

- `game-data/BALLxPIT/GameAssembly.dll` (build 1.308, 2026-10-12) and
  `game-data/BALLxPIT/Balls_Data/il2cpp_data/Metadata/global-metadata.dat`.
- Il2CppDumper v6.7.46 output (`dump.cs`, `script.json`).
- `.scratch/decoded.json` — Odin-decoded `PassiveInfo` / `HeroInfo` assets.
- `.scratch/export/ExportedProject/Assets/MonoBehaviour/Char*.asset` — the
  `CharInfo` props/stats used for the stat-gate table.
- `docs/research/passive-availability.md` — the earlier wiki/community
  snapshot; its per-character "leads" are reconciled above.
