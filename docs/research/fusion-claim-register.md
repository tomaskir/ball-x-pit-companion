# Fusion claim register — audit (wayfinder ticket #4)

**Researched:** 2026-11-11. **Mode:** source-only; no playtest capability.
**Version scope:** game **v1.301** (Naturalist update, 2026-08-06) — the current
build at research time. The paid *Risen Ballbylon* DLC releases **2026-11-12**,
one day after this audit; re-verify every version-tagged row after release.
**Catalog under audit:** `docs/research/game-mechanics.md` / `src/data/balls.ts`,
tagged "2026-09-13, game v1.301".

This register inventories the fusion claims in the files named by the ticket and
classifies each as **current**, **stale**, **duplicated**, **conflicting**, or
**unsupported**, with a recommended action (**keep / delete / supersede /
re-verify**). It is an audit, not a rewrite: no fact base, corpus, code, or test
file was changed. Pair-level curated data is audited at the aggregate level and
for every pair referenced by `src/fusion.ts` or the tests; the remaining 370-pair
entries are data rows, not claims to re-litigate one by one.

> **Status — historical snapshot (2026-11-11).** This audit predates the
> 2026-11-11 resolution pass (issue #19) and spawn-channel pass (issue #20).
> Its counts, line references, and "current/stale" verdicts describe the files
> as of the audit date; the line numbers have since shifted. The counts quoted
> in the tables below (31/96/218/25 etc.) are the pre-resolution-wave values
> and were already superseded when this audit was committed — do not use them.
> Current curated counts: 49 verified / 97 inferred / 218 unverified /
> 6 contradicted over 370 pairs, with 4 order-disputed. The applied outcomes
> are recorded in `fusion-observations/CONTRADICTIONS.md` §13–§14 and
> `fusion-observations/fusion-pairs.json`. Read this file as the audit trail,
> not as current state.

## Evidence hierarchy used

1. Current-version game files / in-game tooltip screenshots / controlled tests.
2. Recent community reports, Nov 2026 DLC-era (including the 2026-11-09
   r/BALLxPIT post `1xrhisk`).
3. Older wiki snapshots and guides.

Version tags: `v1.301` = current build; `1.288` / `1.301` = game-file build
cited; `L1` / `L3` = the ball level the text describes. **Fusion consumes level-3
balls**, so L1 catalog text is stale for fusion even when it is correct for the
wiki overview table.

## Headline findings

1. **The central order claim is stale.** `fusion-mechanics.md` §3, the corpus
   `order_notes`, `GLOSSARY.md`, `README.md`, and the tests say order is
   functional only for same-property and both-cooldown pairs. The 2026-11-09
   post (v1.301) says the year-old "order does not matter" PSA was correct at
   the time but is **obsolete after the three free DLCs**, and the wiki's own
   *Erosion*/*Stone* pages (2026-10-01) document a pair-specific order effect.
2. **Freeze Ray is the one behavioural disagreement.** The repo says Freeze
   Ray's freeze is beam-path-bound and never rides a partner's hits
   (`SPAWN_BOUND_IDS`, §2c, the `freeze-ray+sun` resolution). The Nov 2026 post
   reports **Freeze Ray × Flash does spread freeze** (both orders), while
   Glacier and Blizzard do not. This needs a model decision, not a silent edit.
3. **`FUSED_STATS` is a level-3 correction layer, not a fusion-stat model.**
   Every non-damage value in the table (Overgrowth 3→2, Egg Sac 2–4→3–5,
   Maggot 1–2→2–3, VES 2–3→3–4, Spider Queen 25→45%, Vampire Lord 10→9,
   Reaper 10→15% / 5→7, Poison max 5→8 / 6→9 s, Bleed 2→4 / max 8→14) is the
   **level-3 base value** from the individual wiki pages, not a merge-time
   recomputation. Once the catalog carries L3 text the entries become no-ops;
   the `satan` entry is already redundant with `abstractDamage`.
4. **The catalog is L1-only; fusion needs L3.** The site currently renders L1
   cooldowns/durations for fusion (Timestop 30 s vs L3 20 s; Black Hole 7 s vs
   5 s; Erosion 3% vs 5%; Freeze Ray 10 s vs 13 s; Sun 6 s vs 8 s; etc.).
   This is the largest source of user-visible staleness.
5. **The same-property class is incomplete.** The Nov 2026 post adds
   Banished Flame × burn balls, Erosion × Stone/Drill/Assassin/Steel (Stone
   explicitly documented on the wiki), Noxious × Brimstone, and Freeze Ray ×
   Blizzard. The code's three-pair set is a subset.
6. **Corpus counts are imprecise.** 1,035 raw observations, but only **977 are
   pair-filed over 370 pairs**; 58 are global `composition-rule` rows with no
   pair. "~3% of the pair space" is arithmetically wrong (370 / C(90,2) ≈ 9.2%;
   370 / 7,836 ≈ 4.7%).
7. **Code-constant provenance gaps.** `PIERCE_IDS` omits Sandstorm (fact-base
   Pass Through) and disagrees with the corpus `pass-through-catalog`; the
   `FIELD_AURA` regex misclassifies Berserk as a field aura; `fusionName`'s
   comment "the game uses U+00D7" is unsupported — the English game name is
   "A X B" and the separator is localized.
8. **Heavy duplication.** The order model, `FUSED_STATS` values, cross-wire
   rules, corpus counts, and name format are each repeated in 4–7 places. The
   audit recommends one canonical home per claim.

## Status key

- **current** — supported by current-version evidence; no newer replacement.
- **stale** — overwritten or overshadowed by newer evidence; supersede/delete.
- **duplicated** — same claim repeated elsewhere; consolidate to one home.
- **conflicting** — repo claims disagree with each other or with newer evidence.
- **unsupported** — no cited evidence, or the cited evidence does not say it.

---

## A. `docs/research/fusion-mechanics.md`

| ID | Location | Claim | Status | Newer source / note | Action |
|---|---|---|---|---|---|
| FM-01 | §1 L28–30 | Fusion = 2 unfused L3 balls; base+base, evolved+evolved, base+evolved; no self-fusion | current | Wiki *Fusion Mechanics* (oldid 4217, 2026-09-19); official achievement | keep |
| FM-02 | §1 L31–33 | A 2-component evolution recipe Evolves instead; 3+-component recipes do not block fusion | current | Wiki *Fusion Mechanics*; `evolvesInstead` implements it | keep |
| FM-03 | §1 L34–35 | Fused ball is terminal (no re-fuse, no evolve, not an evolution component) | current | Game-files 1.301 `PopulateUpgrades`; namu; TVTropes | keep |
| FM-04 | §1 L36–39 | Name "A × B" (A first); icon/colour/sprite/paragraph order follow selection order | current | Wiki; Steam; corpus `name-format`; separator is localized (English " X ") | keep; correct the "×" framing (FM-09/FU-03) |
| FM-05 | §1 L40–43 | Fused-ball level on creation (L1 vs L3) and sub-L3 fusion are disputed | conflicting | In-game fused tooltips in `images.jsonl` all say **Level 3**; effect-text research (ticket #3) confirms fusion consumes L3 | re-verify; supersede the level half with "L3 (tooltip evidence)" if no contrary controlled test |
| FM-06 | §1.1 L45–62 | No fusion table; 1.288 dump has evolution recipes only; 1.301 bridge shows ordered pairs with no result text; tooltip assembled at runtime; trust behaviour over tooltip | current | `game-files.jsonl` (1.288, 2026-02-19; 1.301, 2026-09-29); Satan × Hemorrhage and Assassin × VES mismatches | keep; version-tag; re-verify after DLC |
| FM-07 | §1.1 L63–67 | A complete fusion list is a derivation; pair space ≈ C(90,2) minus evolution pairs; exact counts (7836/7921) unverified | current | Wiki arithmetic is editor-derived; no game count | keep |
| FM-08 | §1.1 L68–70 | Fused-ball numbers are not derivable; site abstracts damage to "X" | current | No formula; corpus has observed fused numbers (e.g. 653–907, 58–116) but no derivation | keep; clarify "observable but not derivable" |
| FM-09 | §1.1 L71–74 | The game recomputes component stats at merge time; observed per-ball overrides are in `FUSED_STATS` | stale | The non-damage values are the **L3 base values** (wiki per-level tables), not merge-time recomputation; only damage rolls are fused-specific and abstracted | supersede: migrate catalog to L3, delete redundant entries (FU-17) |
| FM-10 | §2a L85–94 | Seven composition rules (namu.wiki) | current | namu 2026-08-26; rules 1–4, 6–7 corroborated by tooltips/corpus | keep rules 1–4, 6–7 |
| FM-11 | §2a rule 5 L91–92 | Same status, different numbers → limits/effects **blend** (Leech + Sacrifice, max 20) | conflicting | Nov 2026 post: Banished Flame × Sun — first-selected burn profile **dominates** (stack cap, DPS, duration), not blended; ticket #2 calls it same-property first-wins | re-verify scope; ticket #5/#7 decision |
| FM-12 | §2b L96–101 | Status-vs-spawn: on-hit statuses ride partner hits; spawn-bound effects do not; three site-author playtests | current | `playtest.jsonl` (2026-10-01); TVTropes/Steam corroboration | keep |
| FM-13 | §2c L103–114 | Trigger-channel limits: Satan debuff-only; Reaper kill channels; Blizzard/Freeze Ray positional | conflicting | Satan and Reaper parts current (corpus); the **Freeze Ray** sentence ("neither rides a partner's hits") is contradicted by the Nov 2026 post (Freeze Ray × Flash spreads freeze) | keep Satan/Reaper/Blizzard; re-verify/supersede Freeze Ray |
| FM-14 | §2d L116–121 | Spawn exceptions: VES two-hop, Brood Mother, Mosquito King | current | Corpus §3; Steam; Reddit | keep |
| FM-15 | §2e L123–139 | Fixed trait priorities: hit-once+cooldown dominant; Assassin/Warp; Destroy×Destroy; spawn compensates Destroy; Dark multiplier; 9999 display cap | current | Wiki; Steam; corpus `general_rules_notes`; 9999 is a display cap (CONTRADICTIONS §8) | keep |
| FM-16 | §3 L143–162 | Order: always cosmetic; same-property first-wins; both-cooldown first-wins; **otherwise order does not matter** | stale | Nov 2026 post (2026-11-09): old PSA obsolete after DLC balls; wiki *Erosion*/*Stone* (2026-10-01) document a pair-specific order effect; ticket #2 confirms BF×burn, Erosion×bonus, pool recursion | supersede the "otherwise" clause; keep the two named classes as subsets |
| FM-17 | §3 L164–168 | Pool recursion: first-selected base ball is consumed; scope disputed | current | Three independent Reddit reports (2026-02-26, 2026-04-21, 2026-11-06); Nov 2026 post | keep |
| FM-18 | §3 L170–178 | Japanese guide's 8-pair fixed order is folklore; all 8 are cross-property; controlled test showed no difference | conflicting | The specific refutation stands, but the blanket "neither real order rule applies" rests on the stale two-class model; Nov 2026 post and wiki Erosion/Stone show real order effects | keep the specific refutation; drop the generalisation |
| FM-19 | §4 L182–196 | Game-file evidence and limits: no fusion semantics; save matrix unverified; first-selected vs acquisition order unresolved | current | `game-files.jsonl` 1.288/1.301; Nov 2026 post assumes click order (weak evidence for click-order) | keep; version-tag; re-verify after DLC |
| FM-20 | §5 L199–207 | Known bugs: fusion offer missing with two L3 balls; Nosferatu run-breaking; screen-type interactions | current | Multiple Steam/Reddit threads | keep; re-verify after DLC |
| FM-21 | §6 L211–225 | Corpus maintenance: raw layer frozen; 25 contradicted / 26 order-disputed; counts; refresh routes; validator | current | Counts verified against `fusion-pairs.json`; validator passes | keep; correct the count wording (FM-22) |
| FM-22 | §6 L215–218 | "1,035 observations over 370 distinct pairs" | stale | 1,035 total; **977 pair-filed**; 58 global `composition-rule` rows have no pair; curated `obs_count` sum = 977 | correct wording |
| FM-23 | Uncertainty L231–233 | The two functional order rules are reported, never playtested here; one playtest each would upgrade them | stale | Nov 2026 post adds more order effects; "two" is outdated | supersede with the current order model |
| FM-24 | Uncertainty L234–235 | Satan × Hemorrhage needs one boss playtest | current | No newer source | keep |
| FM-25 | Uncertainty L236 | Fused-ball level and sub-L3 fusion remain disputed | conflicting | In-game tooltips say Level 3; sub-L3 still disputed | re-verify/supersede the level half |
| FM-26 | Uncertainty L237–238 | Stat-merge formula unknown; only `FUSED_STATS` overrides are observed | stale | `FUSED_STATS` values are L3 base values; fused damage numbers are observed in tooltips but not derivable | supersede: distinguish L3 base vs fused damage |
| FM-27 | Uncertainty L239–240 | Save `NumCombos` symmetry unverified | current | No completed-matrix dump | keep |
| FM-28 | Uncertainty L241–242 | Corpus coverage is ~3% of the pair space | stale | 370 / C(90,2) ≈ 9.2%; 370 / 7,836 ≈ 4.7% | correct the arithmetic |
| FM-29 | Uncertainty L243–244 | Demo-era claims may describe different builds | current | Corpus register §10i | keep |

---

## B. `docs/research/fusion-observations/fusion-pairs.json` (curated layer)

| ID | Location | Claim | Status | Newer source / note | Action |
|---|---|---|---|---|---|
| FP-01 | top level | `generated: 2026-10-04`; 370 pairs; status 31 verified / 96 inferred / 218 unverified / 25 contradicted; order 15 yes / 74 no / 26 disputed / 255 unknown; 42 contradicted-or-order-disputed | current | Counts re-verified by jq; corpus access date 2026-10-04 | keep counts; mark the layer "not current for Nov 2026 order claims" |
| FP-02 | `rules.namu-seven-composition-rules` rules 1–4, 6–7 | AOE/range, AOE+status, AOE+spawn, different statuses, status+spawn, spawn+spawn | current | namu 2026-08-26; tooltips/corpus | keep |
| FP-03 | `rules.namu-seven-composition-rules` rule 5 | Same status from different balls → limits/effects blended, not first-wins (Leech + Sacrifice) | conflicting | Nov 2026 BF × Sun first-selected profile dominates; scope unresolved | re-verify; ticket #5/#7 |
| FP-04 | `rules.status-vs-spawn` | On-hit statuses ride partner hits; spawn-bound effects do not; three playtests | current | `playtest.jsonl`; TVTropes/Steam | keep |
| FP-05 | `rules.aoe-x-status-tvtropes` | Fusions combine one parent's status with the other's AOE | current | TVTropes 2026-09-21 | keep |
| FP-06 | `rules.self-sustaining-loop` | Infestation × Holy Cross re-applies both effects | current | TVTropes 2026-09-21 | keep |
| FP-07 | `rules.maggot-does-not-depower` | Maggot babies inherit full power; Spider Queen's chain depowers | current | TVTropes 2026-08-20 | keep |
| FP-08 | `rules.two-hop-spawn-exception` | VES → Egg Sac → baby loses the partner's spawn-bound property | current | Steam 2025-10-25; corpus §3 | keep |
| FP-09 | `rules.name-format` | Fused name "A X B", A first; separator localized; tooltips use both X and × | current | Wiki; ballbylon-helper; `game-files.jsonl` | keep; fix the code's U+00D7 overclaim (FU-03) |
| FP-10 | `rules.fused-balls-terminal` | Fused balls cannot fuse/evolve again | current | namu; TVTropes; game-files 1.301 | keep |
| FP-11 | `rules.fused-balls-level-on-creation` | L1 vs L3 on creation is contradicted | conflicting | In-game fused tooltips say Level 3; ticket #3 confirms L3 components | re-verify; supersede the level half |
| FP-12 | `rules.trigger-channel-limits` | Trigger channel decides inheritance; Satan debuff-only; Reaper channels; Blizzard positional | current | Bilibili; YouTube; Reddit; Steam | keep; re-scope the Freeze Ray part (FP-04/FM-13) |
| FP-13 | `rules.fixed-trait-priority` | Component priority is fixed/commutative; hit-once+cooldown dominant over pass-through | current | Wiki; Steam CPT Chthonbeard | keep; fix `PIERCE_IDS` (FU-14) |
| FP-14 | `rules.merge-model` | Fusion vs evolution; fused balls cannot evolve; evolved×evolved can fuse; both L3; sub-L3 disputed | current | TVTropes; Steam achievement; namu | keep |
| FP-15 | `rules.name-sprite-order-always` | Name and sprite order always matter cosmetically | current | Wiki; Steam; Reddit PSA #1 | keep |
| FP-16 | `order_notes` | "For STATS, COOLDOWNS, PROCS and CROSS-WIRING, order is functionally irrelevant except for the two documented exceptions" | stale | Nov 2026 post; wiki Erosion/Stone | supersede with the current order model |
| FP-17 | `general_rules_notes.base-ball-pool-recursion` | First-selected base ball is consumed; scope disputed | current | Three Reddit reports + Nov 2026 post | keep |
| FP-18 | `general_rules_notes.same-property-first-wins` | Same exact property → first-selected's variant wins; examples Mosquito Swarm×King, Radiation Beam×Nuke | current | PSA #2; Nov 2026 post extends to BF×burn, Erosion×bonus, Noxious×Brimstone, Freeze Ray×Blizzard | keep; extend the set |
| FP-19 | `general_rules_notes.cooldown-first-wins` | Both-cooldown pairs: first-selected's cooldown wins; 7-ball class; 21 pairs | current | namu; game-file I2 dump; Nov 2026 post confirms Egg Sac×Timestop (but its 30 s figure is L1) | keep |
| FP-20 | `general_rules_notes.pass-through-catalog` | Pass-through: Storm, Noxious, Sandstorm, Phantom, Soul Sucker, Wraith, Ghost, Wind; Assassin partial | conflicting | Fact base lists Ghost, Wind, Assassin, Drill, Erosion, Noxious, Sandstorm, Sniper, Soul Sucker, Wraith; corpus list omits Drill/Erosion/Sniper and adds Storm/Phantom | reconcile; ticket #6 |
| FP-21 | `general_rules_notes.fused-orbs-not-evolution-components` | Fused orbs cannot be evolution components | current | Reddit 2026-02-23 | keep |
| FP-22 | `general_rules_notes.destroy-pair-may-lose-one-effect` | Two Destroy balls may lose one effect | current | Wiki; ballbylon-helper | keep |
| FP-23 | `general_rules_notes.spawn-compensates-destroy` | Cell × Bomb = indestructible bomb | current | Steam 2025-10-20 | keep |
| FP-24 | `general_rules_notes.evolution-components-not-always-retained` | Evolution components' properties are not auto-retained (Inferno/Wind, etc.) | current | Reddit 2025-12-28 | keep |
| FP-25 | `general_rules_notes.game-file-negatives` | No fusion table; no fused-name/effect fields; 1.288/1.301 evidence | current | `game-files.jsonl` | keep; version-tag; re-verify after DLC |
| FP-26 | `general_rules_notes.no-order-semantics-in-game-files` | No order semantics visible in dumps; `NumCombos` symmetry unverified | current | `game-files.jsonl` 1.301 | keep; version-tag |
| FP-27 | `general_rules_notes.pair-space-arithmetic-unverified` | 7836 vs 7921 are editor arithmetic; treat exact counts as unverified | current | Wiki pages | keep |
| FP-28 | `general_rules_notes.damage-cap-9999` | 9999 is a display cap, not a real cap | current | Steam Xersin/Grampire; CONTRADICTIONS §8 | keep |
| FP-29 | `pairs` aggregate | 370 pair entries; 723 claims; 977 `obs_count`; 9 pairs carry both wire polarities | current | Counts re-verified; the Nov 2026 post's eight claim pairs are **not** in the corpus | keep data; ingest the Nov 2026 post (NS-01) |
| FP-30 | specific pairs used by code | `mosquito-king+mosquito-swarm` (inferred/yes/1 claim), `nuclear-bomb+radiation-beam` (unverified/yes/0 claims), `noxious+poison` (contradicted/unknown/1 claim), `black-hole+timestop` (unverified/yes/1 claim), `bomb+dark` (inferred/yes/3 claims) | conflicting | The same-property note rests on a general rule, not always on pair-specific claims; `noxious+poison` is marked contradicted and order-unknown while the code treats it as same-property | re-verify pair metadata; ticket #9 |

---

## C. `docs/research/fusion-observations/CONTRADICTIONS.md`

| ID | Location | Claim | Status | Newer source / note | Action |
|---|---|---|---|---|---|
| CC-01 | §1 L43–139 | Headline order conflict; current best reading: function commutative for the overwhelming majority; three genuine order effects (presentation, same-property, both-cooldown, pool recursion) | stale | Nov 2026 post (2026-11-09) says the old PSA is obsolete after DLC balls; wiki Erosion/Stone (2026-10-01) document an order effect; ticket #2 confirms BF×burn, Erosion×bonus, pool recursion | supersede the "current best reading" with the Nov 2026 model |
| CC-02 | §1 L99–106 | "The only controlled both-orders test in the public record is PSA #1" | stale | Nov 2026 post reports its own testing; Nov 6 "Fusion Order Matters" post | correct/qualify |
| CC-03 | §1 L126–129 | al-gest/mmemo's 8–11 pairs are contradicted folklore; do not model them | conflicting | The specific rows remain folklore, but the blanket dismissal rests on the stale two-class model; some order effects are now documented | keep the specific rows; add the newer order classes |
| CC-04 | §2 L142–202 | Base-ball pool recursion: first-selected base ball consumed; scope disputed | current | Three Reddit reports + Nov 2026 post | keep |
| CC-05 | §3 L206–249 | Status-vs-spawn reconciliation: spawned statuses inherit, spawn-bound traits do not; VES two-hop; trigger-channel exclusions | current | Playtests; tooltips; Steam | keep; re-scope Freeze Ray (CC-09) |
| CC-06 | §4 L253–296 | Satan × Hemorrhage: %HP cross-wire does not fire; tooltip wrong | current | Bilibili mechanism; Reddit negative test; no newer source | keep; one boss playtest would settle |
| CC-07 | §5 L300–340 | Landslide × Mosquito Swarm: kill-gated, not a cross-wire failure | current | Reddit; namu | keep |
| CC-08 | §6 L344–377 | Nosferatu × Reaper: unresolved sentiment; Nosferatu fusions bug-prone | current | Reddit/Steam | keep; re-verify after DLC |
| CC-09 | §7 L381–407 | Tooltip-vs-behaviour mismatches; tooltip assembled at runtime; trust behaviour | current | Game files; Satan×Hemorrhage; Assassin×VES | keep; the Freeze Ray row is Sun-specific, not a blanket rule |
| CC-10 | §8 L410–441 | 9999 is a display cap | current | Steam Xersin/Grampire | keep |
| CC-11 | §9 L445–469 | Fusion offer may not appear with exactly two L3 balls; general UI bug | current | Three Steam/Reddit threads | keep; re-verify after DLC |
| CC-12 | §10a–j L475–562 | Pair-space arithmetic; fused level; sub-L3; Black Hole×Maggot; Flicker×Reaper; Earthquake×Flash; Black Hole×Satan; attribution splice; Magma×Blizzard; Sun×Black Hole | current except §10b | §10b fused level: in-game tooltips say Level 3 | keep §10a, c–j; re-verify §10b |
| CC-13 | §11 L566–625 | 25 contradicted pairs; 17 order-only-disputed; three single-flagged pairs | current | Counts re-verified | keep |
| CC-14 | §12 L629–647 | Cross-cutting: order functionally irrelevant except the two exceptions | stale | Nov 2026 post; wiki Erosion/Stone | supersede |
| CC-15 | Known issues A–C, E–G L652–758, L780–811 | Anchor rows (17); game-file globals pinned to representative pairs; english.jsonl:86 splice; names_seen hygiene; obs_count semantics; unresolved items 2–6 | current | Corpus audit | keep |
| CC-16 | Known issue D L761–778 | "5 complete fused tooltips ... 6 counting both orders" | stale | `images.jsonl` has **6 complete effect-text rows over 4 distinct pairs** (Egg Sac×Poison both orders, Spider Queen×Vampire Lord both orders, Overgrowth×Maggot, Satan×Reaper) and 2 partial (Bleed×Freeze, VES×Nuclear Bomb) | correct the count |
| CC-17 | Known issue G item 1 L801–803 | One playtest each upgrades the two order exceptions | stale | Nov 2026 post adds more order effects; "two" is outdated | supersede with the current order model |

---

## D. `src/fusion.ts`

| ID | Location | Claim | Status | Newer source / note | Action |
|---|---|---|---|---|---|
| FU-01 | header L1–20 | No fusion table; name "A × B"; function order-independent; paragraphs "in name order"; cross-wire rules; notes; damage abstracted | conflicting | "Function order-independent" is stale (Nov 2026 post); "in name order" is ambiguous — the code uses **selection order** (docs §1 says selection order); "A × B" is the site convention, not the English game name | supersede the order/name wording |
| FU-02 | L23–29 | `fusionBalls()` excludes Baby Ball; "not a fusable upgrade entity" | current | Fact base L62: Baby Ball is "not a special ball"; wiki says fusions use Special Balls | keep; cite `game-mechanics.md` instead of `fusion-*.md` |
| FU-03 | L31–32 | "the game uses U+00D7" | unsupported | `game-files.jsonl`: English fan re-derivation uses " X "; Chinese uses fullwidth "×"; separator localized | correct the comment; keep the site's × as a display choice |
| FU-04 | L34–46 | `abstractDamage()` abstracts damage rolls to X; keeps durations/stacks/cooldowns/percentages/health | current | Editorial policy; tests pin it | keep |
| FU-05 | L48–59 | Status channel classification: hit / spawn / field / null; `SPAWN_BOUND` and `FIELD_AURA` regexes | unsupported (partial) | `FIELD_AURA` matches Berserk's "every second" damage tick, but Berserk is applied on hit (30% chance), not a field aura; `statusChannel(berserk)` returns `field` | re-verify; fix the regex or add an explicit exception |
| FU-06 | L60–63 | `SPAWN_BOUND_IDS = {blizzard, freeze-ray}` | conflicting | Nov 2026 post: Freeze Ray × Flash spreads freeze; Blizzard does not; the blanket freeze-ray exclusion is contradicted | re-verify; likely `{blizzard}` only, with a partner-dependent Freeze Ray rule |
| FU-07 | L64–69 | `SPAWN_EXCLUDED_IDS = {VES, brood-mother, mosquito-king}` | current | Corpus §3; Steam; Reddit | keep |
| FU-08 | L70–75 | `AOE_EXCLUDED_IDS = {satan}`; Satan carries Black Hole's kill but not Reaper's | current | Corpus §4/§10g; Bilibili | keep |
| FU-09 | L76–82 | `KILL_EFFECT_IDS = {black-hole, reaper}`; Timestop absent (no damage) | current | Corpus; test pins Iron/Timestop negative | keep |
| FU-10 | L84–90 | `COOLDOWN_CLASS_IDS` = 7 balls; note "first-selected cooldown wins (reported, untested here)" | current | namu; game-file I2 dump; Nov 2026 post confirms Egg Sac×Timestop (post's 30 s is L1; L3 is 20 s) | keep; fix the displayed L1 cooldown numbers (FM-09) |
| FU-11 | L91–96 | `SAME_PROPERTY_PAIRS` = 3 pairs (Mosquito, Nuke×Radiation, Noxious×Poison) | stale | Nov 2026 post adds BF×burn, Erosion×Stone/Drill/Assassin/Steel, Noxious×Brimstone, Freeze Ray×Blizzard; wiki Erosion/Stone explicitly documents Stone-first 400% | supersede with a general same-property rule (ticket #7) |
| FU-12 | L98–100 | `DESTROY_CLASS_IDS` = 12 balls | current | Matches the fact-base `Destroy` type (game-mechanics.md L45–138); the comment says "from the corpus general_rules_notes", but the enumeration is from the fact base | keep; fix provenance comment |
| FU-13 | L101 | `HIT_ONCE_COOLDOWN_IDS = COOLDOWN_CLASS_IDS` | current | Same as FU-10 | keep |
| FU-14 | L102 | `PIERCE_IDS` = ghost, wind, assassin, drill, erosion, noxious, sniper, soul-sucker, wraith | conflicting | Fact-base Pass Through adds **Sandstorm**; corpus `pass-through-catalog` names Storm, Sandstorm, Phantom and omits Drill/Erosion/Sniper; the set is neither | reconcile; ticket #6 |
| FU-15 | L104–110 | `statusChannel()` returns null without the `status-effect` tag | current | Deliberate model boundary (corpus BEYOND_MODEL: Erosion %HP, Vampire lifesteal) | keep; document |
| FU-16 | L112–114 | `dealsDamage()` regex; kill carriers must deal damage | current | Gated by AOE rank; test pins Iron×Reaper null | keep |
| FU-17 | L116–180 | `FUSED_STATS` per-ball overrides, "transcribed from in-game fused tooltips" | stale / duplicated | All non-damage values are L3 base values (wiki per-level tables): Overgrowth 2, Maggot 2–3, Spider Queen 45%, Vampire Lord 9, Reaper 15%/7, Bleed 4/max 14, Egg Sac 3–5, VES 3–4, Poison max 8/9 s. The `satan` entry abstracts L1 numbers and is redundant with `abstractDamage` | supersede: migrate catalog to L3; delete entries that equal L3 base; keep only genuine fused overrides (none non-damage found); delete `satan` |
| FU-18 | L182–190 | `applyFusedStats()` exact-substring replacement; skips on mismatch | current | `data.test.ts` gate keeps it loud | keep; update after L3 migration |
| FU-19 | L192–193 | `hasSpawn` / `spawnable` | current | Corpus spawn classes | keep |
| FU-20 | L194–195 | `pairId()` sorted unordered key | current | Same-property lookup | keep |
| FU-21 | L217–220 | Spawn carrier + partner's on-hit status → wire line | current | Overgrowth×Maggot tooltip; corpus | keep |
| FU-22 | L222–227 | AOE carrier + partner's on-hit status → wire line; strict rank comparison | current | Overgrowth×Flash; corpus; carrier-rank refusals in BEYOND_MODEL | keep |
| FU-23 | L229–255 | AOE carrier + kill-on-hit; Satan special case; `KILL_DISPUTED_PAIRS = {flicker+reaper}` | current | Black Hole×Sun; corpus §10e | keep |
| FU-24 | L257–265 | Spawn carrier + spawn-bound status → wire line | current | Glacier×Maggot; Blizzard×Spider Queen; corpus | keep; Freeze Ray classification issue (FU-06) |
| FU-25 | L269–280 | `evolvesInstead()` blocks 2-component recipes only | current | Wiki; test pins 3-component Nosferatu | keep |
| FU-26 | L295–345 | `fuse()` notes: cooldown, same-property, pool, Dark, Destroy, hit-once, spawn, disputed | current except order framing | The notes themselves are current; the "two order side-effects" framing is stale | keep notes; update the framing (FU-01/FU-11) |

---

## E. `GLOSSARY.md`

| ID | Location | Claim | Status | Newer source / note | Action |
|---|---|---|---|---|---|
| CT-01 | L12–21 | Fusion vs evolution distinction; fusion = 2 unfused L3 balls, property-stacking, no unique identity; no fusion table; site model; damage abstracted to X | current | Wiki; game files | keep |
| CT-02 | L14 | 69 evolved balls "as of game v1.301" | current | v1.301 pre-DLC; DLC adds 24 balls on 2026-11-12 | keep; version-tag; update after DLC |
| CT-03 | L300–316 | Fusion composer: name "A × B"; paragraphs "in name order"; cross-wire line; **two order side-effects**; fixed caveats; evolve-instead | conflicting | "In name order" is ambiguous (code uses selection order); "two order side-effects" is stale (Nov 2026 post adds more) | supersede the order/name wording |
| CT-04 | L314–316 | The full 370-pair observation corpus lives in `fusion-observations/`; validation methodology in `fusion-mechanics.md` / `CONTRADICTIONS.md` | current | Corpus counts verified | keep |
| CT-05 | L320–335 | Data provenance: fact base is a verbatim wiki transcription (2026-09-13, v1.301) | stale (incomplete) | The wiki overview is **L1**; individual pages gained per-level tables on 2026-09-15; fusion needs L3 (ticket #3) | supersede with the L1/L3 provenance note |
| CT-06 | L334–335 | Counts: 91 balls, 71 passives, 23 characters, 17 tags | current | v1.301 pre-DLC | keep; version-tag; update after DLC |
| CT-07 | L16–21 | Fused numbers are not derivable; site abstracts to X | current | No formula; observed numbers exist | keep; clarify "observable but not derivable" |
| CT-08 | L17–18 | The game stores no fusion table | current | Game files 1.288/1.301 | keep; version-tag |
| CT-09 | L20–21 | The site's model is editorial, not game data | current | — | keep |
| CT-10 | L314–316 | Validation methodology in `fusion-mechanics.md` / `CONTRADICTIONS.md` | current | — | keep |

---

## F. Tests

| ID | Location | Claim | Status | Newer source / note | Action |
|---|---|---|---|---|---|
| TS-01 | `fusion.test.ts` L9–12 | `fusionName` is "A × B" with the first-selected ball first (U+00D7) | current | Site display convention; the English game name is "A X B" | keep; fix the code comment (FU-03) |
| TS-02 | `fusion.test.ts` L34–45 | `abstractDamage` keeps durations/stacks/cooldowns/percentages/health | current | Editorial policy | keep |
| TS-03 | `fusion.test.ts` L48–87 | Cross-wire tests: spawn+status, AOE+status, no-wire, status×status, flicker×reaper, Black Hole×Sun | current | Playtests; corpus | keep; add a Freeze Ray×Flash case after the model decision |
| TS-04 | `fusion.test.ts` L89–106 | `evolvesInstead` blocks 2-component recipes; 3-component Nosferatu does not | current | Wiki; catalog | keep |
| TS-05 | `fusion.test.ts` L108–140 | `fuse` name/paragraphs/caveats; self-fusion null; evolve-instead; playtest pairs | current | — | keep |
| TS-06 | `fusion.test.ts` L142–202 | "fused-stat overrides (observed, from transcribed tooltips)" — Overgrowth 3→2, Egg Sac 2–4→3–5, Maggot 1–2→2–3, Reaper 10→15/5→7 | stale (framing) | These are L3 base values, not fusion-specific overrides (wiki per-level tables) | re-frame as L3 component values; move source of truth to the catalog |
| TS-07 | `fusion.test.ts` L166–189 | No hard-coded fused damage values in `FUSED_STATS` | current | Editorial policy | keep |
| TS-08 | `fusion.test.ts` L191–195 | "overrides are per-ball, not global (unrelated balls keep base numbers)" — Freeze 4%, Light 3 s | stale | Freeze L3 = 7%/8 s; Light L3 = 7 s; the test pins L1 values | update to L3 or re-scope the test |
| TS-09 | `fusion.test.ts` L204–271 | Cross-wire exclusions: VES, Freeze Ray×Sun, Brood Mother, Mosquito King, Satan, Blizzard, positives, kill carriers, Timestop, Satan×Black Hole, spawn-bound statuses | conflicting (one row) | The Freeze Ray×Sun case is current for Sun, but the test name "Freeze Ray freeze is beam-path-bound" generalises beyond the evidence; Nov 2026 post says Freeze Ray×Flash spreads freeze | re-scope the Freeze Ray test |
| TS-10 | `fusion.test.ts` L273–290 | Order side-effects: both-cooldown first-wins; same-property first-wins | stale (incomplete) | Nov 2026 post adds BF×burn, Erosion×bonus, Noxious×Brimstone, Freeze Ray×Blizzard | extend/replace with the current order model |
| TS-11 | `fusion.test.ts` L292–337 | Composition caveats: Destroy, hit-once, spawn compensates, Dark, Iron×Reaper, Noxious×Poison, pool, flicker×reaper | current | Corpus; fact base | keep |
| TS-12 | `corpus.test.ts` L50–65 | 370-pair curated layer; every id resolves; wire sets non-vacuous | current | Verified | keep |
| TS-13 | `corpus.test.ts` L68–119 | 13 no-wire pairs; 9 disputed pairs resolved per `CONTRADICTIONS.md` | current | Verified | keep; re-scope the freeze-ray+sun comment |
| TS-14 | `corpus.test.ts` L121–172 | 67 IMPLEMENTED pairs wire; line is order-independent; subset of corpus wire pairs | current | Verified | keep |
| TS-15 | `corpus.test.ts` L174–242 | 42 BEYOND_MODEL pairs stay null; 131 total wire/no-wire/disputed | current | Verified (109 wire + 13 no-wire + 9 disputed = 131) | keep |
| TS-16 | `data.test.ts` L16–31 | Counts: 91 balls (21 base + Baby Ball + 69 evolved), 71 passives, 23 characters | current | v1.301 pre-DLC | keep; version-tag; update after DLC |
| TS-17 | `data.test.ts` L178–193 | Every `FUSED_STATS` `from` is a substring of the current catalog text | current | Coupled to the L1 catalog; will need updating with the L3 migration | keep; update with FU-17 |
| TS-18 | `data.test.ts` L84–107 | Complexity examples; icon counts 91/71/23/23 | current | v1.301 pre-DLC | keep; version-tag |

---

## G. `docs/research/fusion-observations/README.md` (harvest brief)

| ID | Location | Claim | Status | Newer source / note | Action |
|---|---|---|---|---|---|
| RD-01 | L13–16 | Fused ball = 2 unfused L3 balls; "A X B"; no fusion table | current | Wiki; game files | keep |
| RD-02 | L28 | "One observation = one source saying one thing about one pair" | stale (imprecise) | 58 global `composition-rule` rows have no pair | clarify the exception |
| RD-03 | L48–66 | Rule hypothesis #2: "fusion order does not affect function — name and sprite only; exception: same-property pairs" | stale | Nov 2026 post: old PSA obsolete after DLC balls; wiki Erosion/Stone documents an order effect | supersede with the Nov 2026 model |
| RD-04 | L68–79 | Source-specific notes (Reddit blocked, Steam, YouTube, namu, Fandom) | current | — | keep |

---

## H. `AGENTS.md`

| ID | Location | Claim | Status | Newer source / note | Action |
|---|---|---|---|---|---|
| AG-01 | L144–146 | Game data is wiki-as-of-2026-09-13 (v1.301); re-verify numbers on patches | stale (incomplete) | The wiki overview is L1; individual pages gained per-level tables on 2026-09-15; fusion needs L3 | add the L1/L3 caveat |
| AG-02 | L157–164 | The fusion corpus is an executable spec; changing the composer/corpus/wiki text must keep three tests green | current | — | keep |

---

## I. Newer-source gaps not represented in the repo

The 2026-11-09 r/BALLxPIT post `1xrhisk` (v1.301, pre-DLC) is newer than the
corpus access date (2026-10-04). None of its eight claim pairs appears in
`fusion-observations/*.jsonl`. Ticket #2 validated the claims; this table records
what the audit recommends the repo do with them.

| ID | Claim | Status | Evidence / note | Action |
|---|---|---|---|---|
| NS-01 | The Nov 2026 post itself | missing | https://www.reddit.com/r/BALLxPIT/comments/1xrhisk/fusion_order_did_not_matter_a_year_ago_it/ (2026-11-09) | ingest into the corpus (ticket #10) |
| NS-02 | Egg Sac × Timestop: first-selected cooldown wins; Egg Sac first → 3 s; Timestop first → 20 s (post says 30 s, which is L1) | confirmed (mechanism) | namu; wiki L3; ticket #2 | add pair-specific corpus row; keep the code note; fix displayed L1 cooldowns |
| NS-03 | Banished Flame × any burn ball: first-selected burn/darkflame profile dominates (stack cap, DPS, duration) | confirmed (reported) | wiki L3 BF/Sun; same-property rule; ticket #2 | add to the same-property model; corpus row |
| NS-04 | Erosion × Stone/Drill/Assassin/Steel: first-selected bonus-damage stat replaces Erosion's 5% | confirmed (Stone explicit) | wiki *Erosion*/*Stone* Strategies (2026-10-01); ticket #2 | add to the same-property model; corpus row |
| NS-05 | Freeze Ray × Blizzard: Blizzard gains Freeze Ray's 13 s freeze | unresolved | ticket #2; no direct pair evidence | re-verify; corpus row |
| NS-06 | Noxious × Brimstone: Brimstone first → Noxious spreads 4 stacks of poison and burn | unresolved | ticket #2; no direct pair evidence | re-verify; corpus row |
| NS-07 | Time × X: Time's bubble size scales to the ball in position 2 | unresolved | single comment (icemage_999); Bilibili general radius claim | re-verify; corpus row |
| NS-08 | Banshee: whole-field curse overrides some other curse effects | unresolved | single tentative comment | re-verify; corpus row |
| NS-09 | Freeze Ray × Flash: Flash spreads Freeze Ray's freeze (both orders); Glacier and Blizzard do not | conflicting with repo | Nov 2026 post; ticket #2 flags it as the main disagreement | re-verify; likely supersede `SPAWN_BOUND_IDS` freeze-ray exclusion (FU-06) |
| NS-10 | Base-ball pool recursion: first-selected base ball never reappears | confirmed (reported) | three Reddit reports + Nov 2026 post | keep the code note; corpus row |

---

## J. Duplication map (consolidation targets)

| Claim | Repeated in | Canonical home recommendation |
|---|---|---|
| Order model (two classes vs broader) | `fusion-mechanics.md` §3; `fusion-pairs.json` `order_notes`; `CONTRADICTIONS.md` §1/§12; `README.md` #2; `GLOSSARY.md` fusion composer; `fusion.ts` header/`SAME_PROPERTY_PAIRS`; `fusion.test.ts` order tests | `fusion-mechanics.md` §3 (one canonical statement); code/tests reference it |
| `FUSED_STATS` values | `fusion.ts` table; `fusion.test.ts` tests; `data.test.ts` substring gate; `fusion-mechanics.md` §1.1/uncertainty | `src/data/balls.ts` L3 text + one test; delete the table once migrated |
| Cross-wire rules | `fusion-mechanics.md` §2b–2e; `fusion-pairs.json` rules; `fusion.ts` constants/comments; `GLOSSARY.md`; `corpus.test.ts` | `fusion-mechanics.md` §2 + `fusion.ts` constants; tests pin behavior |
| Corpus counts | `fusion-mechanics.md`; `CONTRADICTIONS.md`; `fusion-pairs.json`; `corpus.test.ts`; `fusion.ts` header | derive from `fusion-pairs.json`; cite once |
| Name format | `fusion-mechanics.md` §1; `fusion-pairs.json` `name-format`; `fusion.ts` `fusionName`; `GLOSSARY.md`; `fusion.test.ts` | `fusion-mechanics.md` §1 + one code comment |
| Freeze Ray classification | `fusion-mechanics.md` §2c; `fusion-pairs.json` `trigger-channel-limits`; `fusion.ts` `SPAWN_BOUND_IDS`; `fusion.test.ts`; `corpus.test.ts` `NULL_RESOLVED` | one model decision (ticket #7), then one home |

---

## K. Recommended actions, mapped to the map's tickets

- **Ticket #5 / #7 (order mechanism/model):** decide whether the same-property
  rule generalises to BF×burn, Erosion×bonus, Noxious×Brimstone, Freeze
  Ray×Blizzard; decide how rule 5 (same-status blending) coexists with
  first-pick dominance; decide the Freeze Ray channel. Then supersede
  FM-15/FM-16/FP-16/CC-01/CC-14/RD-03/CT-03/FU-01/FU-11/TS-10.
- **Ticket #6 (composition/cross-wire re-validation):** reconcile the
  pass-through catalog (FP-20/FU-14); re-scope the Freeze Ray trigger-channel
  claim (FM-13/FP-12/CC-09/FU-06/TS-09); confirm the Destroy class provenance
  (FU-12).
- **Ticket #9 (delete/supersede/keep):** apply this register's actions. Highest
  value: migrate the catalog to L3 text (ticket #3's findings), delete the
  redundant `FUSED_STATS` entries (FU-17/TS-06/TS-08), fix the count errors
  (FM-22/FM-28/CC-16), and delete the stale "two order side-effects" wording
  (CT-03/FU-01).
- **Ticket #10 (corpus ingestion):** ingest the Nov 2026 post and the ticket #2
  verdicts (NS-01–NS-10); mark the curated layer's order metadata as needing a
  refresh.
- **Ticket #3 (effect-text currency):** already supplies the L3 values; this
  audit confirms the catalog is L1-only and that the fusion model depends on L3.

## Sources

- `docs/research/fusion-mechanics.md` (accessed 2026-10-01..04, v1.301).
- `docs/research/fusion-observations/fusion-pairs.json` (generated 2026-10-04).
- `docs/research/fusion-observations/CONTRADICTIONS.md` (access date 2026-10-04).
- `docs/research/fusion-observations/*.jsonl` (1,035 rows; validator OK).
- `docs/research/fusion-observations/images.jsonl` (fused tooltip screenshots,
  23 rows, source dates 2025-10-15..2026-09-13).
- `docs/research/fusion-observations/game-files.jsonl` (builds 1.288 and 1.301).
- `docs/research/fusion-observations/playtest.jsonl` (2026-10-01).
- `src/fusion.ts`, `src/fusion.test.ts`, `src/corpus.test.ts`, `src/data.test.ts`.
- `GLOSSARY.md`, `AGENTS.md`, `docs/research/fusion-observations/README.md`.
- Wiki per-level pages: [Overgrowth](https://ballxpit.wiki.gg/wiki/Overgrowth),
  [Maggot](https://ballxpit.wiki.gg/wiki/Maggot),
  [Spider Queen](https://ballxpit.wiki.gg/wiki/Spider_Queen),
  [Vampire Lord](https://ballxpit.wiki.gg/wiki/Vampire_Lord),
  [Reaper](https://ballxpit.wiki.gg/wiki/Reaper),
  [Bleed](https://ballxpit.wiki.gg/wiki/Bleed),
  [Satan](https://ballxpit.wiki.gg/wiki/Satan),
  [Fusion Mechanics](https://ballxpit.wiki.gg/wiki/Fusion_Mechanics)
  (oldid 4217, 2026-09-19).
- Nov 2026 post: [Fusion Order did not matter a year ago, it certainly DOES
  matter now](https://www.reddit.com/r/BALLxPIT/comments/1xrhisk/fusion_order_did_not_matter_a_year_ago_it/)
  (u/Expensive_Sail_5138, 2026-11-09, v1.301).
- Ticket #2 findings: `docs/research/fusion-order-claims-nov-2026.md`
  (branch `research/reddit-order-claims`, commit `3c559f2`).
- Ticket #3 findings: `docs/research/effect-text-currency.md`
  (branch `research/effect-text-currency`, commit `8558d47`).
