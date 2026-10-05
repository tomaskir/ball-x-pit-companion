# Ball x Pit — Can a complete fusion list be sourced programmatically?

Research question: the site models the 69 named **Evolutions** from a hand-maintained
fact base, but not **Fusions** (merging any two unfused level-3 balls into a
property-stacking ball). Can a complete, machine-readable list of all fusions be
obtained — by datamining, scraping, or derivation — without manually playing?

**Access date for all web sources: 2026-10-01.**

---

## 1. What the fusion mechanic actually is

- Fused Balls are made by fusing 2 "unfused" level-3 Special Balls in the Fusion
  Reactor. You can fuse base+base, evolved+evolved, or base+evolved. A ball cannot
  be fused with itself, and a pair that can **Evolve** cannot be fused instead —
  except pairs whose only shared evolution needs 3+ balls (Nosferatu, Elemental
  components).
  Source: <https://ballxpit.wiki.gg/wiki/Fusion_Mechanics> (page created 2026-08-13,
  count formula corrected 2026-09-19, oldid 4217).
- **No unique identity.** "Fused Balls will have the name and effects of their fused
  balls combined" — e.g. Bleed + Freeze → "Bleed X Freeze". Order does not change
  the *functional* stats/abilities, but changes the *name* and sometimes the sprite
  (Spider Queen X Vampire Lord vs Vampire Lord X Spider Queen look different).
  Same source.
- **Deterministic given the pair.** The wiki states order-independence of function
  and gives no randomness in the merge; the game's own fusion menu presents a
  preview of the result before confirming. No community source found claiming
  non-determinism. (The one order-*sensitive* thing players report is which ball's
  "slot" survives — see the priority caveat below.)
- **Fused balls of evolved balls exist.** Steam achievement "Fusion Evolution —
  Fuse two evolved balls"
  (<https://steamcommunity.com/stats/2062430/achievements>), and the wiki's Balls
  page: "Some Evolved Balls can be … still further fused (or even evolved again)
  with other balls." So the space is pairs over all 90 special balls (21 base +
  69 evolved; Baby Ball excluded — it is not an upgrade entity), not just base
  balls.
- **Scale.** The wiki's own arithmetic: `(90*89) − 89 = 7921` "potential functionally
  different fused balls" (an earlier revision said `−87*2 = 7836`; the numbers are
  the editor's back-of-envelope, not game data — unordered C(90,2) = 4005, minus
  pairs reserved for evolutions). Treat the exact count as unverified; the point is
  it is ~4k pairs, i.e. fully enumerable by a program but not by hand.
- **Does the game enumerate fusions?** No fused-ball table exists in the UI. The
  in-game Encyclopedia catalogs balls/passives/enemies *encountered* and the pause
  menu tracks per-pair fusion discovery counts in the save (see §2), but there is no
  codex page listing fusion results.

## 2. Primary/technical sources (the strong finding)

**The game is Unity (editor 6000.0.62f1), and its data has already been extracted —
twice, by independent people.**

### 2a. send0xx/ball-x-pit-craft-atlas — full AssetRipper dump (best source)

- Repo: <https://github.com/send0xx/ball-x-pit-craft-atlas> (last push 2026-02-20).
  `data/game_data.json` (180 KB) is a normalized dump straight from the game build:
  meta says `game_bundle_version 1.288`, Unity `6000.0.62f1`, company "Kenny Sun".
- Extraction method is documented in the repo's `docs/NOTES.md`: AssetRipper 1.3.10
  against the local Steam install (`Balls_Data`), core source
  `Assembly-CSharp/UpgradeInfo.cs` (fields `Name`, `Desc`, `Slug`,
  **`MergeComponents`**, `Evolutions`, `Icon`), localization from
  `I2Languages.asset`. The extraction scripts themselves were deleted from the repo
  during cleanup, but the method and the decompiled class model are documented.
- What it contains: 161 entities (90 balls + 71 passives) with internal slugs
  (`hupg_bleed`, `pass_irononesie`, …), bilingual names, template effect text,
  icon sprite names, Unity `path_id`s, and **107 recipes** (`result` + `components`).
- **Verified against this repo's fact base** (I ran the comparison): the dump's 90
  ball recipes cover every pairing in `game-mechanics.md` §1.2 with zero
  contradictions — including all "or" alternates (each alternate is its own recipe
  row), the Elemental 4-way, and the Nosferatu 3-way. It also includes all
  Naturalist-era balls (Flesh/Stone/Time chains, Tumor, Zombie, …), so build 1.288
  is *not* missing the August 2026 content despite the version string. It also
  contains `Bleed + Poison → Virus` — the pairing the 9puz guide
  (<https://9puz.com/4558-ball-x-pit-evolution-guide>, 2026-08-16) calls "disputed"
  in October-2025 community sheets — so the game data itself settles that dispute
  for build 1.288.
- **Crucially, what it does NOT contain: any fusion table.** There is no per-pair
  fused-ball data in the dump — only `MergeComponents` (evolution recipes). This is
  positive evidence that **the game does not store fusion results as a table**;
  fused balls are computed at runtime by stacking the two components' properties.

### 2b. jellyhani/ball-x-pit-companion — live BepInEx reader (runtime ground truth)

- Repo: <https://github.com/jellyhani/ball-x-pit-companion> (active, game build
  23150541, game 1.301, bridge protocol 1.18.0). A Windows overlay that installs
  BepInEx (IL2CPP) into the user's own game and reads the game's live state.
- `tools/bepinex/BallxPitBridge/Plugin.cs` (92 KB, in-repo) serializes the game's
  `InfoDB` to JSON on connect (`BuildCatalog()`): every ball/passive with
  `IsInGame`, per-level properties (`PropertiesByLvl`), and the **evolution recipe
  table from `UpgradeInfo.MergeComponents`** — the same data as 2a but read from
  the running game at whatever version the user owns, i.e. a refresh path that
  never touches copyrighted assets in the repo.
- It also reads the **save's fusion-discovery records** (`MetaSaveData.HeroStats` →
  `NumObtained`, `IsMerged`, and a per-ball `NumCombos` map of which other balls it
  has been fused with, and how often). The game itself therefore tracks fusion
  pairs in the save — but as discovery counters, not as result definitions.
- Their engineering doc (`docs/reference/GAME_DATA_CONTRACT.ko.md`) is explicit
  about the limit that matters here: fused-ball effective numbers are **unfinished
  territory even for the runtime reader** — "복합 볼의 실효 수치와 미래 DPS는 미완성
  영역" and the bridge does not resolve fused-ball stats through the normal
  per-level property getters. The game's auto-select AI *does* expose a per-combo
  score and a "bad combo" flag (`GetComboScore`, `IsBadCombo`), which the overlay
  uses — so pair-quality judgments exist in code, but not a stat-merge formula
  anyone has decoded.

### 2c. Smaller machine-readable community datasets

- `LayneHsu/ballxpit-query-tool` (`data/gameData.js`, 112 KB): hand-curated
  evolutions + damage-type/status taxonomies with internal ids matching the game's
  slugs; no fusion data.
- `fsiceangel/ballxpit` ("Fusion Atlas", `data/gamedata.json`): a merge of the 2a
  dump with a second wiki-derived repo and zh-CN localisation; same 107 recipes,
  nothing extra about fusions.
- `sushi-sama/BallXPit-Analyser` (`balls_db.json`), `RioAraki/BallXPitWebHelper`
  (fandom-sourced), `Emil007/bxp`, etc. — all evolution-only, several explicitly
  wiki-derived. Nothing in the ecosystem carries a fusion table, because none
  exists to carry.

### 2d. Is the wiki generated from game files?

No. The wiki's ball tables are hand-written wikitext (`Template:BallTableRow` is a
dumb two-parameter icon+link template; no Cargo tables, no Lua data modules beyond
`Module:Mbox`). The Fusion Mechanics page is prose + one example image, not a
table — consistent with there being no table to write.

## 3. Community aggregations

| Source | What it covers | Complete? | Machine-readable? |
|---|---|---|---|
| wiki.gg Fusion Mechanics | Rules + 1 example | Rules only, no list | Wikitext via API |
| wiki.gg Balls page | Evolutions + fusion rules prose | Evolutions yes | Wikitext (already parsed by this repo) |
| send0xx craft-atlas dump | All 107 evolution recipes from game files | Yes (build 1.288) | **JSON, yes** |
| jellyhani bridge | Live catalog incl. recipes + save fusion counters | Yes, any user's build | JSON, but requires owning the game on Windows |
| 9puz evolution guide (2026-08-16) | All evolution routes through Naturalist | Evolutions only | No (prose tables) |
| ballxpit.net / ballxpit.org / gamerblurb / dexerto | "42 fusions" style lists | **Stale and wrong** (42 was the launch-era count; current is 69; several also invent recipes, e.g. "Void Sphere = Dark+Dark+Dark") | No |
| Steam guides / r/BALLxPIT | Tips, achievement help | No fusion enumeration found | No |

No fan tool, spreadsheet, calculator, or Discord-pinned resource enumerating fused
balls was found. The community consensus treatment of fusions is qualitative
("stack two evolved movesets", "spawn ability can compensate Destroy", wiki's
general trigger-rules table).

## 4. Rule vs table

The fusion result **is a rule, not a table** — this is the second strong finding,
and it matches the absence of fusion data in the extracted game files:

- Fused ball = the two component balls' abilities combined; name is "A X B";
  function is order-independent; icon is composited.
- The wiki documents the *combination semantics* at the ability-type level
  (Balls page, "General Rules for Abilities": which trigger types survive merging,
  e.g. Spawn can compensate Destroy — "Cell(Clone) x Bomb(Destroy) is an
  'indestructible' bomb").
- What is **not** documented anywhere, and is the genuinely open problem: the
  **stat-priority resolution** — "The priority of which effects and stats are
  combined are dependent on the component balls involved" (Fusion Mechanics page).
  Damage ranges, proc chances, and cooldowns of a fused ball cannot currently be
  derived from public sources; even the BepInEx runtime project hasn't decoded it
  (§2b). The trigger/ability-type *structure*, however, is derivable from the two
  components' data, which we already have in the fact base.

So: a complete list of *which pairs fuse and what ability text results* is
derivable as C(90,2) minus evolution pairs, rendered from the component entries we
already model. A complete table of *fused-ball numbers* is not obtainable from any
public source today.

---

## Verdict

**Yes — with a precise scope.**

1. **Evolution recipes (the table kind):** fully obtainable and already obtained —
   `send0xx/ball-x-pit-craft-atlas` `data/game_data.json` is a machine-readable,
   game-file-derived dump whose 90 ball recipes I verified against our fact base
   with zero contradictions (it even settles the disputed Bleed+Poison→Virus
   recipe). Recommended use: as an **automated cross-check / refresh input** for
   `docs/research/game-mechanics.md` — extend `scripts/parse-wiki.ts` (or a new
   script) to diff the fact base against a vendored copy of that JSON. Caveat: it
   is build 1.288 and the extraction scripts were deleted from that repo; the
   refresh path for future patches is the jellyhani bridge's `BuildCatalog()`
   (requires owning the game) or re-running AssetRipper.
2. **Fusions (the combinatorial kind):** there is **no table to scrape, in the game
   or anywhere else** — the game computes fused balls at runtime from the two
   components. A "complete list of fusions" is therefore a **derivation**: the pair
   space over the 90-ball catalog (minus self-pairs and evolution-reserved pairs,
   per the wiki rules), with the fused ball's ability text composed from the two
   components' existing entries. If the site ever wants a fusion explorer, generate
   it from `src/data/balls.ts` + the composition rules; do not wait for a source
   table to appear.
3. **Fused-ball numbers (damage/procs/cooldowns of the merged ball):** NOT
   obtainable from any public source as of 2026-10-01. The wiki explicitly says
   merge priority is component-dependent and gives no formula; the most serious
   technical project in the community (jellyhani's runtime reader) lists fused-ball
   effective stats as unsolved. Any fusion feature on this site should present
   *ability composition*, not fabricated numbers.

**Recommended next step for this repo:** if fusion coverage is wanted, add a
derived fusion module (pair space + ability-text composition from the existing
catalog, with the wiki's trigger-rules table as the composition semantics), and
separately wire the craft-atlas JSON in as a fact-base validation source. Do not
attempt to scrape a fusion table — there isn't one.

## Uncertainty summary

- Fusion-count arithmetic on the wiki is inconsistent across revisions (7836 vs
  7921) and is editor-derived, not game data; treat any exact count as unverified.
- The exact stat-merge priority rules for fused balls are unknown publicly; the
  wiki's "General Rules for Abilities" tables are community-observed, not
  datamined, and carry no numbers.
- The craft-atlas dump is build 1.288 (extraction 2026-02-19); it matches the wiki's
  v1.301 content set (69 evolved balls, all Naturalist chains present), but a
  patch after February could still have changed recipes without the dump knowing.
  The wiki fact base (fetched 2026-09-13) and the dump agree today.
- The Bleed+Poison→Virus recipe is present in build-1.288 game data but called
  "disputed" by a post-Naturalist community guide; the version boundary of that
  dispute is unresolved (possibly removed in a later patch — re-verify in-client).
- Whether fused-ball *sprites* are composited at runtime or pre-authored per pair
  (the Spider Queen X Vampire Lord example) is unverified; irrelevant to data
  modeling but relevant if icons were ever wanted for fused balls (208 wiki icons
  would not cover 4k pairs).
- The game's per-pair "bad combo" / AI score fields exist in code (seen via the
  bridge plugin) but their semantics have not been published.
