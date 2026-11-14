# Risen Ballbylon — per-character slot limits and two-character resolution

Research ticket: [#52](https://github.com/tomaskir/ball-x-pit-companion/issues/52)
(research for S7 [#53](https://github.com/tomaskir/ball-x-pit-companion/issues/53)).
Access date: 2026-11-14. Build: **BALL x PIT v1.308, Risen Ballbylon**,
Unity 6000.0.62f1, IL2CPP (metadata v31).

Sources (all gitignored, read-only):

- `game-data/BALLxPIT/GameAssembly.dll` — the IL2CPP binary. Method RVAs and
  file offsets are from Il2CppDumper; disassembly is `objdump -d`.
- `game-data/BALLxPIT/Balls_Data/il2cpp_data/Metadata/global-metadata.dat` —
  type/field/method names.
- `game-data/extracted/extract.json`, `REPORT.md`, `SUMMARY.md` — the decoded
  package (114 balls / 116 passives / 31 characters). It contains the quirk
  **text** but no slot fields.
- AssetRipper export at `.scratch/export/ExportedProject/` — decompiled
  `Assembly-CSharp` class shapes and the serialized `CharInfo` /
  `BuildingInfo` assets. The decompiler emits field declarations and method
  signatures with empty bodies (IL2CPP has no IL), so the assets prove the
  data model; the algorithms come from the binary.
- Il2CppDumper output at `.scratch/tools/il2cppdumper/dump.cs` — signatures
  and RVAs used to locate the code.
- Prior research: `docs/research/risen-matchmaker-pairs.md` (pair gate),
  `docs/research/passive-availability.md` and
  `docs/research/character-passive-restrictions.md` (the zero/double slot
  claims and their open questions).

This file is hand-maintained research, not parsed by the pipeline.

> **Status — findings.** The two slot quirks are implemented as two
> `CharProp` values on the combined battle character, read by two static
> getters (`StatUtl.GetMaxHeroes` for ball slots, `StatUtl.GetMaxPassives`
> for passive slots). Base limits are **4 ball + 4 passive = 8 equipment
> slots**; the two slot buildings raise them to **5 + 5 = 10**. The
> Ballbearer gets **2× the ball-slot count and 0 passives** (8/0 base,
> 10/0 upgraded). The Hoary Hoarder gets **2 ball slots and the rest as
> passives** (2/6 base, 2/8 upgraded). No other character changes slot
> counts. The two slot-changing characters are also a **forbidden Matchmaker
> pair**, so no legal two-character selection changes both; if the gate is
> bypassed, the props are unioned and the Ballbearer's rule wins by check
> order. Confidence is **high** (code-level; no playtest).

---

## 1. Direct answers

| Question | Answer |
|---|---|
| Base ball / passive slots | **4 ball + 4 passive = 8** total equipment slots. |
| Upgraded ball / passive slots | **5 ball + 5 passive = 10** total (Bag Maker +1 ball, Carpenter +1 passive). |
| The Ballbearer, base | **8 ball / 0 passive** (`2 × 4`). |
| The Ballbearer, upgraded | **10 ball / 0 passive** (`2 × 5`). |
| The Hoary Hoarder, base | **2 ball / 6 passive** (`4 − 2 + 4`). |
| The Hoary Hoarder, upgraded | **2 ball / 8 passive** (`5 − 2 + 5`). |
| Total equipment slots redistributed | **8** base, **10** upgraded. The Hoarder's total is always the global total; the Ballbearer's is `2 × NumBallSlots`, which equals the global total only while ball and passive counts are equal. |
| Two-character resolution | **Game-level incompatibility** for Ballbearer + Hoarder: the Matchmaker rejects the pair (`CanCombinePropInternal`, prop 22 vs 14). If forced, the combined character's props are a **union** and the slot getters use a **fixed priority** — `kDoubleBalls` is checked first — so **the Ballbearer's rule wins** (ball doubled, passive 0). Not most-restrictive, not first-picked. |
| Other characters changing slot counts | **None.** Only `kDoubleBalls` (22) and `kDoublePassives` (14) affect slots, and only Backpacker (The Ballbearer) and Packrat (The Hoary Hoarder) carry them. |
| Ballbearer + Carpenter | The Carpenter's `+1` passive slot is **ignored**: `GetMaxPassives` returns 0 before any building math. |
| Ballbearer + Bag Maker | The Bag Maker's `+1` ball slot is **doubled**: `2 × NumBallSlots` (4→8, 5→10). |
| Hoarder + either upgrade | Both upgrades add `+1` passive slot, including the Bag Maker's ball slot (it is converted by the `+ NumBallSlots` term). |

---

## 2. The slot-limit code

The game has two independent counters on `BuildingMgr`:

```csharp
public int NumBallSlots;    // 0x104
public int NumPassiveSlots; // 0x108
```

(`dump.cs` lines 37510–37511; `BuildingMgr` RVA `0x4B67F0` for
`CalculateBonuses`.)

There is **no** single `EquipmentSlots` field. The Hoarder's quirk text
("any remaining equipment slots become passive slots") is implemented as the
sum of the two counters, which is the "equipment slots" the text refers to.

### 2.1 Ball slots — `StatUtl.GetMaxHeroes` (RVA `0x3C76D0`)

The name is a misnomer; the method reads `BuildingMgr.NumBallSlots`. The
disassembly (VA `0x1803C76D0`) is:

```asm
; if CharBattleInst.I.HasProp(kDoubleBalls)  -> 2 * NumBallSlots
1803c7719:  mov $0x16,%edx                 ; CharProp.kDoubleBalls = 22
1803c771e:  call 0x1804c2b60               ; CharBattleInst.HasProp(CharProp)
1803c7725:  jne 0x1803c7779
; else if HasProp(kDoublePassives)          -> 2
1803c7740:  mov $0xe,%edx                  ; CharProp.kDoublePassives = 14
1803c7745:  call 0x1804c2b60
1803c774c:  jne 0x1803c776f                ; mov $0x2,%eax; ret
; else                                     -> NumBallSlots
1803c7764:  mov 0x104(%rax),%eax           ; BuildingMgr.NumBallSlots
```

So:

```text
ballSlots =
  kDoubleBalls    ? 2 * NumBallSlots
  : kDoublePassives ? 2
  : NumBallSlots
```

### 2.2 Passive slots — `StatUtl.GetMaxPassives` (RVA `0x3C77B0`)

Disassembly (VA `0x1803C77B0`):

```asm
; if HasProp(kDoubleBalls)                  -> 0
1803c77f9:  mov $0x16,%edx                  ; kDoubleBalls
1803c77fe:  call 0x1804c2b60
1803c7805:  jne 0x1803c787b                ; xor %eax,%eax; ret
; else if HasProp(kDoublePassives)          -> NumPassiveSlots - 2 + NumBallSlots
1803c7820:  mov $0xe,%edx                   ; kDoublePassives
1803c7825:  call 0x1804c2b60
1803c782c:  jne 0x1803c784f
; else                                     -> NumPassiveSlots
1803c7844:  mov 0x108(%rax),%eax
; Hoarder branch (target of the second jne)
1803c7865:  mov 0x108(%r8),%eax             ; NumPassiveSlots
1803c786c:  add $0xfffffffe,%eax            ; - 2
1803c786f:  add 0x104(%r8),%eax             ; + NumBallSlots
```

So:

```text
passiveSlots =
  kDoubleBalls     ? 0
  : kDoublePassives ? NumPassiveSlots - 2 + NumBallSlots
  : NumPassiveSlots
```

The `- 2` is the two ball slots the Hoarder keeps; the `+ NumBallSlots`
term is what converts the *ball-slot* upgrade into a passive slot as well.
The Ballbearer's early `return 0` is why the Carpenter's `+1` passive slot
does nothing for it.

### 2.3 The character props

`CharProp` (`dump.cs` line 38131; decompiled at
`.scratch/export/ExportedProject/Assets/Scripts/Assembly-CSharp/CharProp.cs`):

```csharp
kDoublePassives = 14,
...
kDoubleBalls = 22,
```

Each `CharInfo` asset serializes its `Props` list as a little-endian
`int32[]` hex string. The two relevant assets:

- `.scratch/export/ExportedProject/Assets/MonoBehaviour/Backpacker.asset`
  (`Name: The Ballbearer`, `Type: 21`): `Props: 16000000` → `[22]` =
  `kDoubleBalls`.
- `.scratch/export/ExportedProject/Assets/MonoBehaviour/Packrat.asset`
  (`Name: The Hoary Hoarder`, `Type: 18`): `Props: 0e000000` → `[14]` =
  `kDoublePassives`.

No other character asset contains either value. The full table is in
Appendix A.

---

## 3. Base and upgraded slot counts

`BuildingMgr.CalculateBonuses` (RVA `0x4B67F0`) resets the counters and
applies building bonuses:

```asm
1804b6b4f:  movl $0x4,0x104(%rdi)   ; NumBallSlots = 4
1804b6b59:  movq $0x4,0x108(%rdi)   ; NumPassiveSlots = 4 (and BonusBallChoiceLvl = 0)
```

The switch on `BuildingType` (jump table at VA `0x1804B7450`, cases
`0x14`–`0x1B`) has exactly two slot cases:

| BuildingType | Value | Asset | Effect | Code |
|---|---|---|---|---|
| `kBagMaker` | 24 | `BagMaker.asset` — `Desc: Add 1 ball slot` | `NumBallSlots += 1` | `incl 0x104(%rdi)` at `0x1804B70E9` |
| `kCarpenter` | 25 | `Carpenter.asset` — `Desc: Add 1 passive slot` | `NumPassiveSlots += 1` | `incl 0x108(%rdi)` at `0x1804B70F4` |

No other increment to either counter exists in `CalculateBonuses`, and no
other building's `Desc` mentions slots. Both buildings are base-game
(`MinVersion: 0`, `DLCVersion: 0`), so "end-game upgrades" in the site's
sense means **both built**:

| State | Ball | Passive | Total |
|---|---|---|---|
| No Bag Maker, no Carpenter | 4 | 4 | **8** |
| Bag Maker + Carpenter | 5 | 5 | **10** |

The site already models these as `LIMITS.off = { chars: 1, balls: 4,
passives: 4 }` and `LIMITS.on = { chars: 2, balls: 5, passives: 5 }`
(`src/plan-state.ts` lines 103–107). The `chars` half comes from the
Matchmaker building (`BuildingType 62`, `MatchMaker.asset` — `Desc: Allows
you to bring two characters into a run, combining their abilities.`), not
from the slot counters.

### 3.1 Resulting character limits

| Character | State | Ball | Passive | Total |
|---|---|---|---|---|
| The Ballbearer | base | **8** | **0** | 8 |
| The Ballbearer | upgraded | **10** | **0** | 10 |
| The Hoary Hoarder | base | **2** | **6** | 8 |
| The Hoary Hoarder | upgraded | **2** | **8** | 10 |
| Any other character | base | 4 | 4 | 8 |
| Any other character | upgraded | 5 | 5 | 10 |

A note on asymmetric upgrades (the site's toggle is all-or-nothing, but the
formulas are general):

- Ballbearer: `2 × NumBallSlots`; with only the Bag Maker, 10 ball / 0
  passive (total 10, while the global total is 9); with only the Carpenter,
  8 ball / 0 passive (total 8, global 9). The quirk doubles the ball-slot
  counter, it does not redistribute a fixed total.
- Hoarder: `NumPassiveSlots - 2 + NumBallSlots`; the total always equals
  `NumBallSlots + NumPassiveSlots` (9 with either single upgrade, 8/10 with
  neither/both).

---

## 4. Two-character resolution

### 4.1 The pair is forbidden

The only two characters that change slots are The Ballbearer and The Hoary
Hoarder, and the Matchmaker rejects that exact pair. The gate is the prop
matrix, not the explicit character matrix:

- `CharInfo.CanCombinePropInternal` (RVA `0x4C3B10`) rejects prop pair
  `(22, 14)`:

  ```asm
  1804c3b82:  lea -0x16(%rdx),%ecx    ; p1 - 22
  1804c3b87:  je  0x1804c3bd0         ; p1 == kDoubleBalls
  ...
  1804c3bd0:  cmp $0xe,%r8d           ; p2 == kDoublePassives?
  1804c3bd4:  setne %al               ; allowed only if p2 != 14
  ```

- `CharInfo.CanCombineProp` (RVA `0x4C3C10`) calls it in both directions, so
  the relation is symmetric.

This matches `docs/research/risen-matchmaker-pairs.md` §4, which lists
"The Ballbearer — The Hoary Hoarder" among the 43 forbidden pairs, and §5
item 3, which flags it as a missing row in the current community table.
The site's `src/data/characters.ts` does not yet carry the pair: for these
two characters, `cannotPair` currently lists only the False Messiah. T23 is
the correction ticket. The enforcement mechanism already exists —
`view-state.ts`'s `toggleChar` breaks on `cannotPair`, and
`src/plan-state.ts` line 227 marks a hydrated forbidden pair `pairInvalid` —
so once T23 adds the row, live selection is blocked and only a hydrated/share
link pair can reach the Plan.

**Consequence:** there is no legal two-character selection in which both
characters change slots. The practical rule is **game-level
incompatibility**, not union/most-restrictive/first-picked.

### 4.2 If the gate is bypassed: union of props, Ballbearer wins

The combined character is built by `SaveMgr.StartNewBattle` (RVA `0x4D7FF0`),
which calls `CharBattleInst.InitInternal(first)` and then
`CharBattleInst.AddCombo(next)` for each additional character
(call sites `0x1804D85F9` and `0x1804D8A66`).

- `InitInternal` (RVA `0x4C3010`) allocates `_hasProp` (offset `0x28`) and
  sets `true` for each prop of the first character.
- `AddCombo` (RVA `0x4C00D0`) walks the added character's `CharInfo.Props`
  (offset `0x88`) and sets `_hasProp[prop] = true`; it never clears an
  existing entry (the store is at `0x1804C0478`). This is a **union**.
- `SetCombo` (RVA `0x4C3890`) is the two-argument form: `InitInternal(c1)`
  then `AddCombo(c2)`.

`GetMaxHeroes` and `GetMaxPassives` read the combined instance through
`HasProp` (RVA `0x4C2B60`, which returns `_hasProp[prop] != 0`). With both
props present:

- `GetMaxHeroes` checks `kDoubleBalls` first → `2 × NumBallSlots`.
- `GetMaxPassives` checks `kDoubleBalls` first → `0`.

So the forced outcome is **10 ball / 0 passive** (upgraded) or **8 / 0**
(base) — the Ballbearer's rule. Order of selection does not matter: the
getters use `HasProp`, not `Type` or `CombinedTypes`. The result is not a
numeric union or a most-restrictive minimum; it is an early-return priority
with `kDoubleBalls` ahead of `kDoublePassives`.

---

## 5. Other characters

Only `kDoubleBalls` and `kDoublePassives` appear in the slot getters. A scan
of all 31 `CharInfo` assets (Appendix A) finds those two values only on
Backpacker and Packrat. No other character changes ball or passive slot
counts. The Potager's `kAllInOne` changes how equipped balls are *fired*
(fused into one), not how many can be equipped; The Empty Nester's
`kMultiHero` changes how a shot is duplicated, not the slot count.

---

## 6. Implications for S7 (#53)

- **Model the two rules as formulas over the active global limits**, not as
  fixed per-character numbers: Ballbearer `balls = 2 × globalBalls,
  passives = 0`; Hoarder `balls = 2, passives = globalPassives − 2 +
  globalBalls`. With the site's binary upgrade toggle this yields the table
  in §3.1.
- **The pair is invalid.** Add it to `cannotPair` (T23) so live selection is
  blocked; a hydrated/share-link pair should stay `pairInvalid` (the house
  rule: keep, mark, never trim). If the Plan still needs a number for an
  invalid pair, mirror the game's forced priority (Ballbearer wins) rather
  than inventing a most-restrictive rule; but the pair should not be
  presented as a legal build.
- **The Carpenter edge case is resolved.** The open question in
  `docs/research/passive-availability.md` ("Does the Carpenter's +1 passive
  slot grant the Ballbearer a usable passive slot?") is answered **no**:
  `GetMaxPassives` returns 0 before the building bonus is considered. The
  Bag Maker's `+1` ball slot is doubled for the Ballbearer.
- **The Hoarder's "double passive slots" wording is imprecise.** It is
  `total equipment − 2`, not a fixed double; with the site's toggle it is
  6 base / 8 upgraded. Both the Bag Maker and the Carpenter add `+1` to the
  Hoarder's passive count.
- **The site's existing global limits are correct** (4/4 and 5/5) and match
  the datamine; S7 only adds the per-character overlay.

---

## 7. Confidence and open questions

| Claim | Confidence | Basis |
|---|---|---|
| Base 4 ball / 4 passive | High | `CalculateBonuses` immediate stores at `0x1804B6B4F` / `0x1804B6B59` |
| Bag Maker +1 ball, Carpenter +1 passive | High | Building assets' `Desc` + the two `incl` cases in the `BuildingType` switch |
| Ballbearer `2 × NumBallSlots`, 0 passive | High | `GetMaxHeroes` / `GetMaxPassives` disassembly; `Backpacker.asset` prop 22 |
| Hoarder `2` ball, `NumPassiveSlots − 2 + NumBallSlots` passive | High | `GetMaxHeroes` / `GetMaxPassives` disassembly; `Packrat.asset` prop 14 |
| Only these two characters change slots | High | All 31 `CharInfo` assets scanned; only two slot props exist |
| Ballbearer + Hoarder is a forbidden pair | High | `CanCombinePropInternal` rejects (22,14); prior research §4 lists it |
| Forced pair → union, Ballbearer wins | High | `AddCombo` sets `_hasProp`; getters check `kDoubleBalls` first |
| No playtest | — | Static decode only; the formulas are read from code, not observed in a run |

Open questions:

1. **Does the game ever bypass the pair gate?** Cheats/mods or a future
   patch could allow the pair; the forced behavior above is the code path,
   but no normal UI reaches it.
2. **`HasProp` has a scene-3 short-circuit.** In `GameScene.kGame` (3),
   `HasProp` can return `false` based on a `GameMgr`-side static check
   (VA `0x1804C2B98`–`0x1804C2C11`). The condition was not decoded; it does
   not change the slot formulas in the normal path, but a mode that
   suppresses all props would also suppress the slot quirks. Low impact for
   the Plan, which models the character-select/build state, not an in-run
   mode.
3. **The site's "end-game upgrades" toggle bundles three buildings**
   (Matchmaker, Bag Maker, Carpenter). The datamine separates them. S7
   should keep the site's binary toggle unless it wants to model partial
   upgrades; the formulas above support either.

---

## Appendix A — all 31 characters' `Props`

Read from `.scratch/export/ExportedProject/Assets/MonoBehaviour/*.asset`
(`Props:` is a little-endian `int32[]`). The two slot props are marked.

| CharType | Character | Props |
|---:|---|---|
| 0 | The Warrior | — |
| 1 | The Repentant | `kBackRecall` (5) |
| 2 | The Itchy Finger | `kAlwaysShoot` (9), `kAimless` (8) |
| 3 | The Tunneller | `kScreenWrap` (12) |
| 4 | The Tiptoer | `kSneaky` (19) |
| 5 | The Cogitator | `kAutopickUpgrades` (1) |
| 6 | The Tactician | — |
| 7 | The Spendthrift | `kShotgun` (10) |
| 8 | The Embedded | `kPierceUntilWall` (18) |
| 9 | The Radical | `kAI` (0), `kAutopickUpgrades` (1) |
| 10 | The Empty Nester | `kMultiHero` (11) |
| 11 | The Shade | — |
| 12 | The Cohabitants | `kMirror` (2) |
| 13 | The Physicist | `kGravity` (4) |
| 14 | The Shieldbearer | `kBrickBreaker` (3) |
| 15 | The Makeshift Sisyphus | `kNoBallDamage` (13) |
| 16 | The Flagellant | `kBackBallBounce` (7) |
| 17 | The Juggler | `kLobBalls` (15) |
| 18 | **The Hoary Hoarder** | **`kDoublePassives` (14)** |
| 19 | The Falconer | — |
| 20 | The Carouser | `kReturnOrbit` (16) |
| 21 | **The Ballbearer** | **`kDoubleBalls` (22)** |
| 22 | The False Messiah | — |
| 23 | The Sentinel | — |
| 24 | The Wallbreaker | `kWallWrap` (23) |
| 25 | The Recollector | `kBoomerang` (24) |
| 26 | The Scandalmonger | `kReturnAimOrbit` (25) |
| 27 | The Scrupulous Scoundrel | `k45Bounce` (17) |
| 28 | The Potager | `kAllInOne` (26) |
| 29 | The Right Hand Man | `kRightHand` (20) |
| 30 | The Conduit | `kPlayerAOE` (27) |

---

## Appendix B — reproduction

1. Dump the metadata with Il2CppDumper
   (`game-data/BALLxPIT/GameAssembly.dll` +
   `Balls_Data/il2cpp_data/Metadata/global-metadata.dat`). The output is
   `.scratch/tools/il2cppdumper/dump.cs`; the relevant signatures are
   `BuildingMgr.NumBallSlots`/`NumPassiveSlots` (lines 37510–37511),
   `StatUtl.GetMaxHeroes`/`GetMaxPassives` (lines 20465–20468),
   `CharBattleInst` (lines 37917–37943), `CharProp` (line 38131), and
   `CharInfo.CanCombine*` (lines 38267–38279).
2. Disassemble the `il2cpp` PE section with `objdump -d` at the RVAs in
   §2–§4. The file-offset mapping is `file offset = VA − 0x180000C00`.
3. Read the character and building assets from the AssetRipper export:
   `Assets/MonoBehaviour/{Backpacker,Packrat,BagMaker,Carpenter,MatchMaker}.asset`.
4. Cross-check the quirk text against
   `game-data/extracted/extract.json` (`characters[].gameplay`); it carries
   the prose but no slot fields.

The helper used for this pass is a throwaway Python/`objdump` workflow (not
committed); the RVAs and asset values above are the reproducible artifact.
