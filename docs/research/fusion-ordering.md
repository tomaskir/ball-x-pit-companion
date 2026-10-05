# Ball x Pit — When does fusion order matter?

Research question: **when fusing two balls in the Fusion Reactor, when does the
order of the two components matter, and when does it not?** The site author
remembered "a list of pairs where order mattered". Conflicting evidence exists:
Reddit PSA #1 says order never affects function; Reddit PSA #2 (Discord-sourced)
says order matters for same-property pairs; the Japanese guide al-gest.com
prescribes one specific order for 8 named pairs; namu.wiki gives a hard
cooldown rule; and a long tail of Steam/Reddit anecdotes claims order effects
in every direction. This document resolves what can be resolved and records
what cannot.

Harvest of source observations: `fusion-observations/ordering.jsonl` (38
records). Companion source survey: `fusion-evidence-sources.md`. Background:
`fusion-completeness.md`, `CONTEXT.md`.

**Access date for all web sources: 2026-10-04** (source content dates as cited).

---

## 1. The question in context

A fused ball = two unfused level-3 balls merged in the Fusion Reactor, named
"A X B", composed at runtime from the two components (no fusion table exists in
game data — `fusion-completeness.md`). The fused name **always** reflects the
order in which the balls were selected ("A X B" with A = first), and the sprite
sometimes differs (wiki.gg: "Spider Queen X Vampire Lord has a completely
different sprite from Vampire Lord X Spider Queen", while "Egg Sac X Poison
looks the same as Poison X Egg Sac").

The open question is narrower: **does order change what the fused ball
DOES?** Four sub-questions map onto the evidence:

1. Is function commutative (A×B ≡ B×A)?
2. If not, what is the rule (same-property? cooldown? trigger priority?)
3. Is there a list of order-sensitive pairs? Where?
4. Do the famous order-matters claims (al-gest's 8, Brood Mother babies,
   Maggot × Nuclear Bomb explosion counts) survive controlled testing?

---

## 2. Findings

### 2a. The controlled result: order is cosmetic, function is commutative

The single strongest evidence is Reddit PSA #1 (Leorium, 2025-11-11, 89 points,
~60 pairs tested **in both orders** with a controlled method — solo Sisyphus,
autofire off, one special ball, no passives; baby-ball families tested on the
Fungus boss):

> "RESULTS: AxB vs BxA has 0 difference as to the actual ball effect. However,
> it does change the visuals on the ball and the color of the damage numbers.
> Example, Flash x Overgrowth will have a green 'Flash' ball, but Overgrowth x
> Flash will have a blue 'Overgrowth' ball."
> — <https://www.reddit.com/r/BALLxPIT/comments/1ouhlp1/psa_fusion_order_does_not_matter/>

The tested set explicitly included Maggot × {11 partners}, Spider Queen × {8},
Shotgun × {5} "to see if the baby balls carried the additional fusion effect" —
i.e. the exact question the Brood Mother order claim raises — and found no
functional order difference. The author's own rebuttals in the thread dismiss
the Maggot × Nuclear Bomb explosion-count and laser + Maggot anecdotes ("There
is 0 difference in fusion order including ball cooldown when fusing, bomb, nuke,
black hole and etc").

Independent corroborations of commutativity:

- wiki.gg Fusion Mechanics (oldid 4217, 2026-09-19): "the order of the fused
  balls does not change the functional stats/abilities of the resulting ball,
  its name will be different and its appearance *may* be different".
- al-gest.com's own comment section (anonymous, 2025-12-01), under the article
  that prescribes order for 8 pairs: 「融合する順番は効果に影響ないですよ。
  説明の順番が異なるだけで性能は同じでした。」 — *"The order of fusion does
  not affect the effect. Only the order of the description differs; the
  performance was the same."*
- u/FemurFiend, thread 1p2ihjw (2025-11-20), in direct reply to an
  order-matters claim about Flash × Overgrowth: "It's been tested extensively,
  it does not matter which order you fuse them in so I'm not sure where you
  came up with that." **(Note: the Flash × Overgrowth order claim in that
  thread is by u/beastlike, not FemurFiend — a mis-attribution exists in
  `english.jsonl:86`, which splices beastlike's claim text under FemurFiend's
  praise sentence. FemurFiend is on the order-does-NOT-matter side. Correct
  records are in `ordering.jsonl`.)**
- Steam (Shajirr, 2026-01-26): "Order of fusion doesn't matter, only the icon
  changes (icon from first pick, color from the second)"; Hope Thief
  (2025-12-24): identical outcome "regardless of selection order".
- Site-author playtests are consistent: Overgrowth X Flash (Overgrowth first)
  cross-wires, Flicker X Radiation Beam cross-wires, Flash X Glacier does not —
  exactly as the status-vs-spawn composition rule predicts, with no order
  variable needed.

So for **name, sprite, damage-number color (and apparently tooltip paragraph
order): order matters. For stats, cooldowns, procs and cross-wiring: order does
not matter**, with the exceptions in §2b–2c.

### 2b. The real order rule #1: same-property pairs (first ball's variant wins)

Reddit PSA #2 (Leorium reposting **official Discord** testing, 2025-11-24,
38 points):

> "Through community testing, there are in fact (very, very limited) certain
> scenarios where FUSION ORDER DOES MATTER simply because of the limits of the
> game. […] Balls with the same exact property that are fused together take the
> parent (ball 'A') property and exclude the second balls (ball B) specific
> properties that are the exact same. […] Other examples would be 2 balls that
> both inflict burn, bleed or poison. This is the only exclusion to the fusion
> order doesn't matter rule because the game simply can't process the exact same
> effect applying 2 different ways from a single trigger."
> — <https://www.reddit.com/r/BALLxPIT/comments/1p5pil0/psa_2_fusion_order_additional_info/>

Two worked examples (the only fully specified order-matters pairs found in any
source):

| Pair | First-selected wins | Mechanism |
|---|---|---|
| Mosquito Swarm × Mosquito King | Swarm-first → swarm mosquitos; King-first → king mosquitos | both explode into mosquitos on hit; spawn-type variant is exclusive |
| Radiation Beam × Nuclear Bomb | Beam-first → radiation lasts 15 s; Bomb-first → radiation forever | both apply radiation; duration variant is exclusive (matches both balls' game-file texts: `{[radiation_length]} seconds` vs "indefinitely") |

A closely related **Steam** articulation one month *earlier* (2025-10-22,
"the moon is beautiful, isn't it?"): "fusion order sometimes matters. If both
balls have a sort of on hit effect, first one you select will take priority" —
and it explicitly exempts Flash/Flicker (pure screen damage, no status of their
own). Same shape as the Discord rule, without the examples.

Contrast namu.wiki rule 5 for *same status, different numbers*: Leech + Sacrifice
keeps both application channels and **blends** the limits (on-hit 6 + per-sec 6,
max 20) — a symmetric adjustment, not "first wins". So the empirical picture is:
*exact same property variant* → exclusive, first-selected wins; *same status
channel with different parameters* → blended.

### 2c. The real order rule #2: cooldown-bearing pairs (first ball's cooldown wins)

namu.wiki (recovered via the namu.moe mirror; namu.wiki itself is
Cloudflare-blocked):

> "폭탄이나 블랙홀 등, 별도의 쿨타임이 기재되어 있는 다른 볼과 융합하면 먼저
> 고른 쪽의 쿨타임을 따른다. 예시로 블랙홀x시간정지의 경우 5초마다 발사하지만,
> 시간정지x블랙홀의 경우 20초마다 발사하는 식. 시간 정지를 융합 소재로 쓸
> 경우, 2번째로 골라야 한다."
> — *"When fusing with another ball that has its own separately listed cooldown
> (Bomb, Black Hole, etc.), the fused ball follows the FIRST-SELECTED ball's
> cooldown. Example: Black Hole × Timestop fires every 5 seconds, whereas
> Timestop × Black Hole fires every 20 seconds. If you want to use Timestop as
> fusion material, you must select it SECOND."*
> — <https://namu.moe/w/BALL%20x%20PIT/%EB%B3%BC> (2026-08-26)

This is a **numerical, functional** order effect with a worked example (5 s vs
20 s fire rate). The Bomb entry confirms the corollary from the other side:
fusing Bomb with Timestop "lets you throw Timestop with a 3-second cooldown".

The **order-sensitive pair list follows mechanically**: the game-file dump of
I2 effect texts (send0xx/ball-x-pit-craft-atlas `data/game_data.json`, build
1.288) shows exactly **7 balls whose description carries an explicit listed
cooldown** — Black Hole, Bomb, Dark, Egg Sac, Voluptuous Egg Sac, Nuclear Bomb,
Timestop. Pairs of two cooldown-class balls = C(7,2) = **21 unordered pairs (42
directed)** where fusion order is functional: {Black Hole, Bomb, Dark, Egg Sac,
Voluptuous Egg Sac, Nuclear Bomb, Timestop} × same. That is the only
*mechanism-derived* list of order-sensitive pairs in any source.

### 2d. Component-vs-component priority (fixed, NOT order)

Several sources describe one component's trait **dominating** the other's in a
way that is fixed by the trait types, not by selection order — i.e. "priority
rules" that look like order effects but are commutative:

- namu: Assassin's "cannot pierce the back" wins over a partner's pierce; Warp
  is *cast before* the partner's pierce ("워프가 먼저 시전되어").
- Steam (CPT Chthonbeard the Pirate, 2025-10-25), answering a direct
  "does pick order matter" question: "hit once and then cool-down" (Egg Sac,
  Dark, Bomb…) is a **dominant trait**; pass-through is **recessive** — the
  pairing keeps the hit-once+cooldown behavior and loses pass-through,
  regardless of order. (This is also the "Sacrifice X Ghost tooltip lies" bug
  discussion.)
- wiki.gg: "The priority of which effects and stats are combined are dependent
  on the component balls involved" — merge priority is **component-dependent**,
  not order-dependent. Much of the "order matters" folklore reads like this
  sentence misremembered.

### 2e. The list the author remembered: al-gest / mmemo

**al-gest.com** ("最強おすすめ融合ボール", 矢部明雄, published 2025-10-25,
modified 2025-11-02) gives, for each of its 8 recommended fusions, the identical
boilerplate:

> 「融合時の注意点として、必ず『閃光×繫茂』の順番で融合するようにしましょう。
> （『繫茂×閃光』の順番で融合しないように注意）」
> — *"As a caution when fusing: be sure to fuse in the order Flash X
> Overgrowth. (Be careful not to fuse in the order Overgrowth X Flash.)"*

The 8 pairs (all with the AOE/attack ball named **first**):

1. 閃光×繫茂 — Flash × Overgrowth
2. 明滅×繫茂 — Flicker × Overgrowth
3. 太陽×繫茂 — Sun × Overgrowth
4. 閃光×内出血 — Flash × Hemorrhage
5. 明滅×内出血 — Flicker × Hemorrhage
6. 太陽×内出血 — Sun × Hemorrhage
7. 氷河×散弾銃 — Glacier × Shotgun
8. マグマ×散弾銃 — Magma × Shotgun

**No mechanism is given anywhere on the page.** Nothing says what breaks in the
reverse order. The same boilerplate is repeated on al-gest's best-ball and
best-evolution pages (see `japanese.jsonl`).

**mmemo.jp** (Asukalon, PS5 play diary, 2025-11-03) is almost certainly "the
list" the author remembers: a 融合1 | 融合2 table with the header rule

> 「基本 融合1 -> 融合2 の順番で融合する。逆の場合目的とする能力にならない
> 場合があります。」
> — *"Basically, fuse in the order 融合1 → 融合2. In the reverse case, the
> intended ability may not be produced."*
> — <https://mmemo.jp/archives/14525>

Its 11 rows are al-gest's 8 pairs **plus 3 extras**: Nuclear Bomb × Cell, Sun ×
Black Hole, Shotgun × Nuclear Bomb. Crucially mmemo states its tables are
transcribed from al-gest ("al-gestさんの記事に早見表がありましたので、それを
転載") — so al-gest + mmemo are **one source lineage, not two confirmations**.
And all 3 mmemo-only extras involve a cooldown-class ball (Nuclear Bomb, Black
Hole) — where namu's real rule (§2c) actually applies.

**Reconciliation of al-gest's 8 pairs with the PSAs:** the 8 pairs are all
*cross-property* pairs (one status/stack ball × one screen-AOE ball; or one
spawn-freeze ball × one wall-spawner). None is a same-property pair, and none
pairs two cooldown-class balls (Flash/Flicker/Sun/Hemorrhage/Glacier/Magma/
Overgrowth/Shotgun carry no listed cooldown). Therefore **neither real order
rule applies to them**, and PSA #1 tested several of these exact pairs in both
orders (Flash × Overgrowth, Flash × Hemorrhage, Sun × Overgrowth, Hemo ×
Overgrowth) with zero functional difference. The most economical explanation:
al-gest's author observed that the fused **name and description paragraph order**
follow selection order (confirmed by his own commenter: "説明の順番が異なるだけ"
— only the description order differs), wrote each entry under its fused name,
and converted that naming convention into a functional caution without testing
the reverse. The 8 pairs are the guide's *recommendations*, not a tested
order-sensitivity list. They are functionally commutative.

The one place an al-gest/mmemo row is *not* obviously wrong is mmemo's extra
**Sun × Black Hole**: Sun is literally an ingredient of Black Hole (Sun+Dark),
the pair is recipe-overlapping — and a Reddit anecdote (ClipClap35, 2025-11-27)
reports "sun x black hole" behaving worse (delayed insta-kill) than
"black hole x sun". But even here the two order-matters sources **disagree on
direction** (mmemo prescribes Sun first = the anecdote's *bad* case), and the
anecdote is explicitly fuzzy ("I dont remember exactly"). Treat as unresolved.

### 2f. The order-folklore direction problem

Community "order" theories contradict each other on which ball should be first:

| Source | Direction prescribed |
|---|---|
| al-gest / mmemo (8–11 pairs) | AOE/attack ball **first** |
| beastlike (Reddit 1p2ihjw, Flash × Overgrowth) | spawner/AOE ball **first** |
| Dexile (Steam "Maggot Lasers", 2025-10-19) | status ball **first**, screen ball **second** ("The second ball's status will apply the first ball's status… you'll wanna do holy laser first then maggot") |
| Tappin (Steam, 2025-11-05) | damage/status ball **first** (Black Hole, Nuke, Overgrowth, maybe Hemo), multi-hit/screen **second** |
| Creative Game Life (2026-02-02) | first dictates primary firing behavior, second adds status — but this tip sits in the **evolution-recipe** section, likely an evolution/fusion conflation |
| namu (cooldown rule) | shorter-cooldown ball **first** (mechanism-backed) |
| PSA #2 (Discord) | first-selected's variant of the **same property** wins (mechanism-backed) |

Two mutually exclusive "AOE-first vs status-first" folk rules cannot both be
right, and the controlled test says neither is necessary. What *is* real in
these reports is mostly (a) fixed trait priorities (§2d), (b) the same-property
and cooldown exceptions (§2b–2c), and (c) genuine non-order quirks misread as
order effects — e.g. Black Hole × Flicker "inconsistency" is a timing
requirement ("needs to actually fly for 1.2 seconds for the Flicker effect to
kick in", Deadly_Laser, Steam), and multiple screen-type fusions in one build
reportedly interact/bug ("Black Hole X Flash Bug… it stops tossing"; Despair's
flicker-priority claim) regardless of order.

### 2g. Brood Mother "spawn ball first"

williamatherton (Reddit 1otb9ig, 2025-11-10): "always choose the baby ball
spawning ball first, THEN the damage ball second… This ensures that the baby
balls also have the power of the second ball." Uncontrolled single-report;
PSA #1 explicitly both-orders-tested the Maggot/Spider Queen/Shotgun spawn
families on the Fungus boss and found no order difference. Likely a
misobservation of namu rule 6 (status + spawn = babies carry the status,
order-independent) or of the status-vs-spawn rule. Marked contradicted.

### 2h. Game-file angle: no order semantics visible in dumps

- **craft-atlas `game_data.json`** (build 1.288): recipes = evolution
  `MergeComponents` only; the strings "fuse/fusion/combo/order" occur **zero**
  times. No fusion table, no fused-name/effect fields, no order field.
- **jellyhani BallxPitBridge `Plugin.cs`** (build 1.301): the live fuser screen's
  combos are serialized as **ordered pairs** — `h1/h2` (HeroType enums) plus
  `idx1/idx2` (slot indices) — so the game does present fusion choices as
  directed (first, second) pairs. Two call sites are directionally asymmetric in
  signature: `GetComboScore(loopIndex, hc)` and
  `heroes[hc.Idx1].IsBadCombo(heroes[hc.Idx2])`. This is *suggestive* of a
  directional "A into B" evaluation and is consistent with a game notion of
  "first component"; it is **not** proof that the two orders produce different
  fused balls (the bridge reads no result fields — none exist).
- **VdustR/game-save-ball-pit** (v1.301 device saves): `NumCombos` is an
  observed **90×90 counter matrix** of per-pair fusion-discovery counts. A
  square matrix does not prove symmetry — if the game incremented only
  `[A][B]` for A-fused-into-B, the matrix would encode order. **No published
  dump of a filled matrix exists**, so symmetry is unverified. Machine-readable
  order evidence would be one completed save away.
- The game's Fusion Reactor UI shows the combined result text **before
  confirming** (community reports of "the tooltip states that it will pass
  through"), so the "preview" is the composed description — not a stored
  per-pair result (which is why the description paragraph order can follow
  selection order without any functional difference).

---

## 3. Verdict

**When does order matter?**

1. **Always, cosmetically.** The fused name is "A X B" with A = first-selected;
   the icon usually comes from the first pick and the color from the second
   (Steam); the damage-number color changes (PSA #1); the sprite sometimes
   differs (wiki.gg); the description paragraphs list the components in
   selection order (al-gest commenter). "Order matters" is trivially true for
   identity/presentation. This is almost certainly what al-gest's 8-pair
   warnings and the remembered "list" really encode.
2. **Same-property pairs (function).** When both balls implement the *same
   exact property* (mosquito-explosion type; radiation stacks; both burn / both
   bleed / both poison variants), the first-selected ball's variant wins and the
   second's variant of that property is excluded (PSA #2, Discord). Known pairs:
   **Mosquito Swarm × Mosquito King** (spawn type), **Radiation Beam × Nuclear
   Bomb** (radiation duration: 15 s vs infinite). Same-status-different-numbers
   pairs (e.g. Leech + Sacrifice bleed) instead *blend* (namu rule 5).
3. **Cooldown-class pairs (function).** When both balls list their own cooldown
   (7 balls: Black Hole, Bomb, Dark, Egg Sac, Voluptuous Egg Sac, Nuclear Bomb,
   Timestop), the **first-selected ball's cooldown** is used (namu, with a
   worked example: Black Hole × Timestop = 5 s vs 20 s). 21 unordered pairs.
4. **Otherwise, order does NOT matter** for stats, abilities or cross-wiring
   (PSA #1 controlled testing; wiki.gg; multiple independent rebuttals;
   site-author playtests consistent). Fixed component-vs-component trait
   priorities (Assassin's no-back-pierce, Warp-before-pierce, hit-once-cooldown
   dominant over pierce) are commutative and should not be modeled as order
   effects.

**The list of pairs where order matters:** no authoritative enumerated list
exists. The circulating list is al-gest's 8 prescribed pairs (and mmemo's
11-row transcription of it) — best interpreted as *naming/recommendation
conventions for the guide's favorite fusions*, not as tested order sensitivity;
they fail the reconciliation test (all cross-property, no cooldown pairs,
several directly refuted by PSA #1's both-orders tests and by al-gest's own
commenter). The only mechanism-derived lists are (a) the 2-pair Discord
same-property list and (b) the 21-pair cooldown-class list derived from namu's
rule × the game-file cooldown class.

**Practical rule for the companion site:** model fusion as commutative
(function-wise), keep the name order as a presentation property, and document
two narrow exceptions: *same property → first-selected's variant wins* and
*both-have-listed-cooldown → first-selected's cooldown wins*. Label al-gest/
mmemo as contradicted folklore with citation.

---

## Uncertainty summary

- **No controlled test of the two exceptions exists in the public record.** PSA
  #2's same-property rule is second-hand from the official Discord (which is
  not publicly archiveable); namu's cooldown rule is a single wiki author's
  worked example, never independently repeated. Both are *mechanistically
  plausible* (the game file confirms the parameter differences: radiation
  duration 15 s vs indefinite; Black Hole 5 s vs Timestop 20 s cooldowns) and
  are the best candidates for a targeted site-author playtest. One playtest
  each would upgrade either rule from "reported" to "observed".
- **"First-selected" vs "acquisition order" is unresolved.** wiki.gg claims
  "the only way to change the order of fused balls is to change the order in
  which they're acquired, and one cannot manually select the order of balls for
  fusion at this time", but Steam players and the fusion UI describe clicking
  two balls in an order, and the bridge serializes ordered h1/h2 slots. If
  acquisition order is what the wiki means, then "first" in PSA #2 and namu
  means *first-acquired / first-listed slot*, and the al-gest/mmemo
  "fuse A then B" advice is advice about which ball to grab first in the run —
  which would also explain why guide writers present it as a per-pair recipe.
  Worth one UI observation.
- **NumCombos symmetry is unverified.** A completed save's 90×90 matrix would
  settle whether the save format records directed pairs; none was found. If it
  is asymmetric, it is a machine-readable order map of which pairs the player
  fused in which order (not a rule, but evidence of what the game tracks).
- **Contradiction set kept unresolved** (both records in `ordering.jsonl`):
  demo-era Magma × Blizzard 4-tile vs 2-tile freeze radius claim (Frankie +
  Heidi Bumm, Jun 2025, Steam) vs PSA #1; beastlike's Flash-first vs
  Dexile/Tappin's status-first folk rules; ClipClap35's Sun × Black Hole
  anecdote vs mmemo's opposite prescription; Maggot × Nuclear Bomb explosion
  count (Lexifer452) vs Leorium's rebuttal. Several are self-hedged or
  pre-release (demo-era Jun 2025 claims may describe a different build).
- **Attribution correction:** `english.jsonl:86` attributes the
  Flash × Overgrowth order claim to u/FemurFiend; the Arctic Shift record
  (`npxwsxg`) shows it is **u/beastlike**, with FemurFiend replying that order
  does not matter (`npz30u9`). Both corrected records are in `ordering.jsonl`.
- namu.wiki remains Cloudflare-blocked; all namu quotes here are from the
  namu.moe mirror (2026-08-26 snapshot) and were re-verified against a live
  fetch on 2026-10-04. The mirror's completeness for the cooldown rule is
  confirmed by two pages (Timestop entry + Bomb entry) agreeing.
- The wiki.gg "one cannot manually select the order" claim may reflect a UI
  change across builds; current-build behavior (ordered selection) is supported
  by the bridge's ordered pair slots but not by a dated patch note.
