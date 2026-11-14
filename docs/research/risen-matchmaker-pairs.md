# Risen Ballbylon — Matchmaker pairing restrictions (Nov 2026)

Research for wayfinder ticket
[#32](https://github.com/tomaskir/ball-x-pit-companion/issues/32):
find the Matchmaker pairing restrictions for the eight Risen Ballbylon
characters — The Conduit, The Potager, The Recollector, The Right Hand Man,
The Scandalmonger, The Scrupulous Scoundrel, The Sentinel, and The
Wallbreaker — and state the `character-pairings.md` rows the DLC integration
ticket should add.

**Researched:** 2026-11-13 (datamine; no playtest capability).
**Source build:** **BALL x PIT v1.308**, Risen Ballbylon DLC, Unity
6000.0.62f1, IL2CPP (`game-data/BALLxPIT/`, extracted 2026-11-13).
**Existing fact base:** `docs/research/character-pairings.md` (community-
sourced, game v1.301 era).

> **Status — landed (2026-11-14).** This is a dated research snapshot. The
> DLC rows landed in `docs/research/character-pairings.md` via T13
> ([#39](https://github.com/tomaskir/ball-x-pit-companion/issues/39)) and the
> existing-roster corrections via T23
> ([#49](https://github.com/tomaskir/ball-x-pit-companion/issues/49)); read
> the landed relation in `src/data/characters.ts` (`cannotPair`). The record
> below is kept for provenance.
>
> **Findings.** The pair relation is **not** in
> `game-data/extracted/` (`extract.json`, `REPORT.md`, `SUMMARY.md` contain no
> pairing field). It is hard-coded in `GameAssembly.dll`. The v1.308 code was
> decoded; the eight new characters' restrictions are listed in §1 and the
> rows to add are in §2. Confidence is **high** (code-level, four call sites
> in the character-select UI, one error string). The datamine also disagrees
> with several rows of the current community-sourced table; those are listed
> in §4 and were handled as the separate T23 correction.

---

## 1. Answer — the eight new characters

The relation is symmetric. The False Messiah (CharType 22) is rejected in
both directions by the same function, so the `*all*` row in
`character-pairings.md` already covers every new character; the lists below
omit the Messiah.

| Character | Cannot pair with (v1.308 code) |
|---|---|
| The Conduit | *none* |
| The Potager | The Spendthrift, The Empty Nester |
| The Recollector | The Cohabitants, The Embedded, The Flagellant, The Juggler, The Physicist, The Repentant, The Right Hand Man, The Scrupulous Scoundrel, The Sentinel, The Shieldbearer, The Spendthrift, The Tunneller, The Wallbreaker |
| The Right Hand Man | The Recollector |
| The Scandalmonger | The Carouser, The Physicist, The Sentinel, The Tactician |
| The Scrupulous Scoundrel | The Physicist, The Recollector |
| The Sentinel | The Falconer, The Juggler, The Recollector, The Scandalmonger, The Shade |
| The Wallbreaker | The Recollector |

The Recollector is the most restricted DLC character (13 partners) because
its `kBoomerang` prop collides with a broad set of movement/launch props.
The Conduit (`kPlayerAOE`) has no collision in the prop matrix.

## 2. Rows T13 should add to `character-pairings.md`

Add a source entry to the Sources section:

> **S5 — Datamined IL2CPP, BALL x PIT v1.308 (Risen Ballbylon)**,
> `game-data/BALLxPIT/GameAssembly.dll` + `global-metadata.dat`, extracted
> 2026-11-13. Pair gate: `CharInfo.CanCombine` (RVA `0x4C3C70`), backed by
> `CharInfo.CanCombineChars` (`0x4C3A20`), `CharInfo.CanCombineProp` /
> `CanCombinePropInternal` (`0x4C3C10` / `0x4C3B10`). Called from
> `CharSelectUI.OnSelectClicked` (`0x5103F0`), `CharSelectUI.Activate`
> (`0x50D700`), `CharSelectUI.GoToLevelSelect` (`0x50EA80`), and
> `CharSelectItem.Init` (`0x50CF30`). Rejection text:
> `error_invalid_fusion` — "This character is not compatible with your main
> selected character."

Add these rows to the pair table:

```markdown
| The Potager | The Spendthrift, The Empty Nester | S5 |
| The Recollector | The Cohabitants, The Embedded, The Flagellant, The Juggler, The Physicist, The Repentant, The Right Hand Man, The Scrupulous Scoundrel, The Sentinel, The Shieldbearer, The Spendthrift, The Tunneller, The Wallbreaker | S5 |
| The Right Hand Man | The Recollector | S5 |
| The Scandalmonger | The Carouser, The Physicist, The Sentinel, The Tactician | S5 |
| The Scrupulous Scoundrel | The Physicist, The Recollector | S5 |
| The Sentinel | The Falconer, The Juggler, The Recollector, The Scandalmonger, The Shade | S5 |
| The Wallbreaker | The Recollector | S5 |
```

The Conduit needs **no row**: add it to the "No restrictions (any partner)"
prose instead. The parser initialises every character with an empty
`cannotPair` list and only overwrites characters that have a row, so omitting
The Conduit is equivalent to an empty row.

The eight characters must already exist in the roster
(`docs/research/game-mechanics.md` + `src/data/characters.ts`) before the
pairing parser can resolve these names; that is the rest of the DLC
integration, not this ticket.

## 3. Method and evidence

### 3.1 The extracted JSON has no pair data

`extract.json` character records carry exactly these fields:

```text
asset, dlc, flavor, gameplay, name, slug, starter_ball, stats
```

`REPORT.md` and `SUMMARY.md` describe the new characters but never mention
pairing. The exported `CharInfo` ScriptableObjects
(`.scratch/export/.../MonoBehaviour/*.asset`) likewise have no pairing field:
`Type`, `IsInGame`, `MinVersion`, `DLCVersion`, `Icon`, `MatchmadeIcons`,
`IconSmall`, `BaseAnimsPrinciple`, `Props`, `PrefabChar`, `PrefabCharSecond`,
`Name`, `FlavorDesc`, `GameplayDesc`, `Slug`, `StarterUpgrade`, `SFXOnShoot`,
UI fields, `Stats`, `BattleStatWeights`, `BattleStatTotalWeight`. The
restriction is code, not data.

### 3.2 The gate

`CharSelectUI.OnSelectClicked` (RVA `0x5103F0`) is the Matchmaker's
second-character confirm handler. When `IsSelectingFusion` is set, it calls
`CharInfo.CanCombine(UpgradeMgr.CurChar, selectedCharInfo)`; on `false` it
shows `error_invalid_fusion` and returns without proceeding. The same
predicate is used by `CharSelectItem.Init` and `CharSelectUI.Activate` to
gate incompatible entries (the UI styles them as unavailable), and by
`GoToLevelSelect` as a final guard. That is the game's `cannotPair` relation.

`CharInfo.CanCombine(this, inf)` applies, in order:

1. **Same object** → reject (`UnityEngine.Object.op_Equality`).
2. **Time-mode mismatch** → reject if both modes are non-zero and differ.
   `StatUtl.GetTimeMode` (`0x3C8CD0`) returns `kTurnBased` only for
   `kTactician` (CharType 6) and `kDefault` for everything else, so for two
   distinct characters this check never fires. It is recorded here for
   completeness, not as a source of pairs.
3. **Shade / Falconer / Sentinel mutual exclusion** — CharTypes 11, 19 and 23
   are three mutually exclusive categories.
4. **Prop matrix** — every `CharProp` of one character is checked against
   every `CharProp` of the other via `CanCombineProp`, which runs
   `CanCombinePropInternal(p1, p2)` and then `(p2, p1)`. Any rejection fails
   the pair.
5. **Explicit pair matrix** — `CharInfo.CanCombineChars(this.Type, inf.Type)`,
   which checks both directions.

### 3.3 The explicit pair matrix (`CanCombineChars`)

Decoded from the branch table at RVA `0x4C3A20`:

| Primary | Rejects |
|---|---|
| The Itchy Finger (2) | The Tactician (6) |
| The Tactician (6) | The Carouser (20), The Scandalmonger (26) |
| The Cohabitants (12) | The Falconer (19) |
| The Shieldbearer (14) | The Tactician (6) |
| The Makeshift Sisyphus (15) | The Cohabitants (12), The Spendthrift (7), The Shade (11) |
| The Flagellant (16) | The Tactician (6) |
| The False Messiah (22) | everyone, both directions |
| The Sentinel (23) | The Juggler (17), The Recollector (25), The Scandalmonger (26) |

The function checks the pair in both directions, so the relation is
symmetric. The False Messiah branch is an unconditional `return false` for
CharType 22, which is the code-level confirmation of the `*all*` row.

### 3.4 The prop matrix (`CanCombinePropInternal`)

`CharProp` values come from `CharProp.cs` / the IL2CPP dump. The directional
matrix was decoded from the jump table at RVA `0x4C3BD8` plus the `0x8694BC`
bitmask. The directional matrix is below; a pair is forbidden if either
direction rejects:

| Prop | Collides with |
|---|---|
| `kMirror` (2) | `kLobBalls` (15) |
| `kBrickBreaker` (3) | `kBackBallBounce` (7), `kScreenWrap` (12) |
| `kGravity` (4) | `kBrickBreaker` (3), `kBackBallBounce` (7) |
| `kBackRecall` (5) | `kBackBallBounce` (7), `kBrickBreaker` (3) |
| `kShotgun` (10) | `kMirror` (2) |
| `kScreenWrap` (12) | `kBackRecall` (5), `kBackBallBounce` (7) |
| `k45Bounce` (17) | `kGravity` (4) |
| `kDoubleBalls` (22) | `kDoublePassives` (14) |
| `kBoomerang` (24) | `kMirror` (2), `kBrickBreaker` (3), `kGravity` (4), `kBackRecall` (5), `kBackBallBounce` (7), `kShotgun` (10), `kScreenWrap` (12), `kLobBalls` (15), `k45Bounce` (17), `kPierceUntilWall` (18), `kRightHand` (20), `kWallWrap` (23) |
| `kReturnAimOrbit` (25) | `kReturnOrbit` (16), `kGravity` (4) |
| `kAllInOne` (26) | `kShotgun` (10), `kMultiHero` (11) |

Character-to-prop mapping for the relevant characters (from the exported
`CharInfo` assets' `Props` field):

| Character | Props |
|---|---|
| The Repentant | `kBackRecall` (5) |
| The Itchy Finger | `kAlwaysShoot` (9), `kAimless` (8) |
| The Tunneller | `kScreenWrap` (12) |
| The Tiptoer | `kSneaky` (19) |
| The Cogitator | `kAutopickUpgrades` (1) |
| The Tactician | — |
| The Spendthrift | `kShotgun` (10) |
| The Embedded | `kPierceUntilWall` (18) |
| The Radical | `kAI` (0), `kAutopickUpgrades` (1) |
| The Empty Nester | `kMultiHero` (11) |
| The Shade | — |
| The Cohabitants | `kMirror` (2) |
| The Physicist | `kGravity` (4) |
| The Shieldbearer | `kBrickBreaker` (3) |
| The Makeshift Sisyphus | `kNoBallDamage` (13) |
| The Flagellant | `kBackBallBounce` (7) |
| The Juggler | `kLobBalls` (15) |
| The Hoary Hoarder | `kDoublePassives` (14) |
| The Falconer | — |
| The Carouser | `kReturnOrbit` (16) |
| The Ballbearer | `kDoubleBalls` (22) |
| The False Messiah | — |
| The Sentinel | — |
| The Wallbreaker | `kWallWrap` (23) |
| The Recollector | `kBoomerang` (24) |
| The Scandalmonger | `kReturnAimOrbit` (25) |
| The Scrupulous Scoundrel | `k45Bounce` (17) |
| The Potager | `kAllInOne` (26) |
| The Right Hand Man | `kRightHand` (20) |
| The Conduit | `kPlayerAOE` (27) |

The Conduit's `kPlayerAOE` appears in no forbidden prop pair, which is why it
is unrestricted. The Sentinel has no props; its restrictions come entirely
from the explicit matrix and the Shade/Falconer/Sentinel category rule.

## 4. Full datamined matrix (appendix)

43 forbidden pairs among the 30 non-Messiah characters, plus the False
Messiah's 30 exclusions (the existing `*all*` row). This is the exact v1.308
relation:

```text
The Ballbearer — The Hoary Hoarder
The Carouser — The Scandalmonger, The Tactician
The Cohabitants — The Falconer, The Juggler, The Makeshift Sisyphus,
                  The Recollector, The Spendthrift
The Embedded — The Recollector
The Empty Nester — The Potager
The Falconer — The Sentinel, The Shade
The Flagellant — The Physicist, The Recollector, The Repentant,
                 The Shieldbearer, The Tactician, The Tunneller
The Itchy Finger — The Tactician
The Juggler — The Recollector, The Sentinel
The Makeshift Sisyphus — The Shade, The Spendthrift
The Physicist — The Recollector, The Scandalmonger,
                The Scrupulous Scoundrel, The Shieldbearer
The Potager — The Spendthrift
The Recollector — The Repentant, The Right Hand Man,
                  The Scrupulous Scoundrel, The Sentinel, The Shieldbearer,
                  The Spendthrift, The Tunneller, The Wallbreaker
The Repentant — The Shieldbearer, The Tunneller
The Scandalmonger — The Sentinel, The Tactician
The Sentinel — The Shade
The Shieldbearer — The Tactician, The Tunneller
```

## 5. Discrepancies with the current community-sourced table

The current `character-pairings.md` table (S1/S2, v1.301 era) has 17
non-Messiah pairs. Sixteen are confirmed by the v1.308 code. The differences:

1. **The Cogitator × The Radical is not enforced by v1.308.** The current
   table lists it (S1 only); the code's explicit matrix and prop matrix both
   allow it. The datamine is the primary source for the current build. This
   row should be removed or re-verified against S1's latest revision, not
   silently kept.
2. **Four non-Messiah pairs among existing characters are missing from the
   current table:** The Tunneller × The Shieldbearer, The Tunneller × The
   Flagellant, The Tactician × The Carouser, and The Ballbearer × The Hoary
   Hoarder.
3. **The "No restrictions" list is too broad.** The code restricts The
   Carouser (Tactician, Scandalmonger), The Hoary Hoarder (Ballbearer), The
   Ballbearer (Hoary Hoarder), The Embedded (Recollector), and The Empty
   Nester (Potager). The DLC-involving pairs (Carouser × Scandalmonger,
   Embedded × Recollector, Empty Nester × Potager) are covered by the §2
   rows; the existing-roster pairs (Carouser × Tactician, Hoary Hoarder ×
   Ballbearer) are corrections.
4. **All other current rows are confirmed**, including the False Messiah's
   `*all*` rule and the S1/S2 pairs that the code's prop matrix explains
   (Repentant/Flagellant/Shieldbearer/Physicist trajectory rewrites,
   Cohabitants/Juggler/Falconer/Spendthrift launching rewrites).

Recommendation: land the §2 rows with the DLC integration, and open a
separate correction ticket for the existing-roster rows in items 1–3. The
`character-pairings.md` file describes itself as game data; the datamine is
the stronger source, but the correction is a content decision that should be
reviewed on its own.

## 6. Confidence and caveats

- **Confidence: high** for the pair relation. The gate is identified by four
  call sites in the character-select UI and by the `error_invalid_fusion`
  string; the explicit matrix and prop matrix were decoded from the v1.308
  binary and cross-checked against the character assets' `Props` fields.
- **No playtest.** This is a static decode, not an in-game confirmation. The
  community table's S2 matrix was empirical for the pre-DLC roster; the code
  is authoritative for the current build but the two have not been reconciled
  in-game.
- **Version drift.** The site's catalog is v1.301; this decode is v1.308
  (Risen Ballbylon). The DLC characters only exist in v1.308+, so the new
  rows cannot be checked against the older build.
- **The prop matrix is the bulk of the relation.** Most restrictions are
  prop collisions, not named pairs. If a future patch changes a character's
  `Props` list, the pair list changes without any edit to the explicit
  matrix. Re-run this decode on each patch.
- **The TimeMode check is effectively inert** for distinct characters (only
  Tactician returns a non-default mode), so it is not a source of pairs.

## 7. Reproduction

1. Locate the gate: `strings`/Il2CppDumper on
   `game-data/BALLxPIT/Balls_Data/il2cpp_data/Metadata/global-metadata.dat`
   and `game-data/BALLxPIT/GameAssembly.dll`; `CharInfo.CanCombine` is at
   RVA `0x4C3C70`.
2. Disassemble the `il2cpp` PE section (VA `0x18037C000`, size
   `0x250DE71`). The string-literal slot for `error_invalid_fusion` is at
   RVA `0x32504E8` (VA `0x1832504E8`); the callers are
   `CharSelectUI.OnSelectClicked` and the three other character-select
   methods listed in §2.
3. Decode `CanCombineChars` (`0x4C3A20`): the branch table and the
   `0x8694BC` bitmask are the explicit and prop matrices in §3.3–3.4.
4. Read each character's `Props` from the exported `CharInfo` asset
   (`Props:` is a little-endian `int32[]`; e.g. `18000000` = `kBoomerang`).
5. Recompute the symmetric closure and add the False Messiah's `*all*` rule.

The helper used for this pass is a throwaway Python script (not committed);
the decoded matrices above are the reproducible artifact.
