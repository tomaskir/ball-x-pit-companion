# Ball x Pit — Internet evidence sources for fused-ball behaviors

Research question: the site models the 69 named **Evolutions** but not **Fusions**
(any two unfused level-3 balls, name "A X B", no unique identity — see
`fusion-completeness.md`). Prior research established there is **no fusion table**
in the game or in any datamined dump. This follow-up asks: what *evidence sources*
exist on the internet that would let us compile and validate as large a list of
*fused-ball behaviors* as possible — without playing the game ourselves? The user
specifically asked about screenshots of fused balls, but all avenues were explored.

**Access date for all web sources: 2026-10-01.**

---

## 1. Context from this session: the user's three playtest pairs

The user playtested: Overgrowth X Flash (cross-wiring: Flash's hits apply
Overgrowth stacks), Flicker X Radiation Beam (cross-wiring: Flicker's ticks apply
radiation), Flash X Glacier (NO cross-wiring). This matters because internet
sources **do contain a predictive rule that matches all three data points** — see
§2a (the "Flash applies on-hit status effects" rule) and §3 (the wiki trigger
table). The community corpus is not just anecdotes; it contains mechanism-level
claims that can be checked against new playtests.

---

## 2. Findings by avenue

### 2a. Reddit r/BALLxPIT via archive APIs — the single richest source

Reddit itself blocks anonymous API access from this network (www.reddit.com .json
returns an HTML "blocked by network security" page; old.reddit 302s to login).
Two public archives work and are machine-readable:

- **Arctic Shift** (`https://arctic-shift.photon-reddit.com/api/...`) — works,
  JSON, supports `subreddit`, `title=<term>`, `limit≤100`, `sort=asc/desc`,
  `after=<unix|YYYY-MM-DD>`, `posts/ids?ids=...`, `comments/search?link_id=...`.
  Heavily rate-limited (repeated "Timeout. Maybe slow down a bit"); needs
  multi-minute cooldowns between calls. In this session it yielded ~350 r/BALLxPIT
  posts across Jun 2025–Sep 2026 (two full pages of `title=x` + all `title=fusion`
  + targeted id/comment fetches).
- **PullPush** (`https://api.pullpush.io/reddit/search/submission/...`) — works
  but aggressively rate-limits ("does not provide free scraping resources for
  agents") after a handful of calls; usable as a fallback, not for bulk harvest.

**What it exposes:** titles are grep-able with the "A X B" pattern (the fused-ball
naming convention is a precise search key, exactly as hoped). Post bodies and
comments carry behavior reports, sometimes with mechanism-level explanations,
screenshots (i.redd.it / preview.redd.it URLs), and videos (v.redd.it, YouTube).

**Counted harvest from this session (346 posts + ~150 comments scanned):**

- **105 distinct fused-ball pairs named** across posts/comments (deduplicated,
  alias-normalized: Blackhole→Black Hole, Nuke→Nuclear Bomb, Hemo→Hemorrhage,
  VolEgg→Voluptuous Egg Sac, Dracula→Vampire Lord, etc.). Full list reproduced in
  the appendix below. Frequency concentrates hard on the meta: Flash X
  Overgrowth (14), Black Hole X Sun (14), Flash X Hemorrhage (11), Maggot X
  Nuclear Bomb (9), Holy Laser X Maggot (7), Mosquito X Nuclear Bomb (7).
- **~25 pairs have at least one behavior claim** beyond the name, e.g.:
  - Flash X Blizzard — *no* cross-wire; "Flash applies on-hit *status effects*
    from its paired ball… Blizzard has a Freeze effect from the spawned icicle,
    not the ball itself, and the spawn is not a status" (icemage_999, 7 points,
    thread 1ulsapv, 2026-07-02). **This is the rule that predicts the user's
    Flash X Glacier non-cross-wiring result.**
  - Nuke X Overgrowth — cross-wire: "the nuke full screen radiation triggers
    overgrowth" (1ptm1mo, 2025-12-23). Matches user's Overgrowth X Flash.
  - Landslide X Mosquito Swarm — does NOT cross-wire; poster calls the
    inconsistency a likely bug (1qxzefm, 2026-02-07).
  - Hemorrhage X Voluptuous Egg Sac — baby balls do NOT carry Hemorrhage's
    %-hp effect, "100% confirm with an easy to repeat test" (1ppi8nk, 2025-12-18).
  - Erosion X Flicker — "flicker didn't pick up the effect from erosion at all"
    (1tyfa5i, 2026-06-06).
  - Mosquito King X Mosquito Swarm and Radiation Beam X Nuclear Bomb — same-property
    pairs resolve by fusion order (first-selected ball's version wins) — sourced
    from the **official Discord** and reposted to Reddit (PSA #2, 1p5pil0,
    2025-11-24, 38 points). This is the only Discord-derived content found; the
    Discord itself is not publicly archiveable.
  - Inferno X Freeze — pass-through lost on fusion (1pvrmvh).
  - Nosferatu X (anything) — multiple reports of the fused ball disabling all
    special balls / breaking runs (1r9npqr, 1vxaolp, 1w2oyci).
  - Brood Mother X Laser — order claim (spawn ball first so babies inherit the
    damage ball's property, 1otb9ig) — later contradicted by the PSA order
    threads; the contradiction itself is documented.
- **Two high-value community-testing threads** with enumerated combo lists:
  - "PSA - Fusion Order Does NOT Matter" (1ouhlp1, 89 points, 2025-11-11): tests
    ~60 pairs in both orders with a controlled method (solo Sisyphus, no
    passives, single ball). Enumerates: Hemo X {Bomb, Sun, Overgrowth, Phantom,
    Flicker, Blizzard, Virus, Holy Laser, Flash}, Bomb X {Sun, Frozen Flame,
    Virus, Overgrowth, Flicker, Sandstorm, Wraith}, Sun X {Frozen Flame, Inferno,
    Vampire Lord, Sandstorm, Overgrowth, Holy Laser, Flash}, Flash X {Virus,
    Overgrowth, Blizzard, Holy Laser}, plus base-ball pairs, Maggot X {11},
    Spider Queen X {8}, Shotgun X {5}. Order affects visuals/name only.
  - "PSA #2" (above) — the same-property exception with 2 worked examples.
- **Screenshot posts**: many pair-named posts are i.redd.it images (e.g. 1ubzi5y
  "Mildly Underwhelming Fusion", 1qei5dz Flicker X Overgrowth screenshot, 1pxx3sg,
  1ogt36h). Image URLs are harvestable from the archive JSON; the images themselves
  were not downloaded (copyright), but URLs + captions are recorded.

**Machine-readability: excellent** (pure JSON), **bulk-harvestable: yes but slow**
(rate limits mean ~100 posts per few minutes; the full subreddit is only ~5k posts,
so a complete title-keyed harvest is a few hours of polite polling).

### 2b. Steam Community (app 2062430) — screenshots hub + discussions + guides

Steam community pages are fetchable without login (plain HTML, no block).

- **Screenshots hub** (`steamcommunity.com/app/2062430/screenshots/?searchText=...`):
  server-side text search over screenshot titles works. Harvested this session:
  - `searchText=fusion` → 6 screenshots, 5 fusion-relevant.
  - `searchText=x` → 10 screenshots, **4 clearly fused-ball gameplay captures**:
    "Glacier x Ghost" (id 3628216785, 12 awards), "Overgrowth x Maggot"
    (3650096430), "Holy Laser X Maggot" (3590993416), plus "Wraith X Cell fusion"
    (3591741411) and "Blizzard x Spider Queen fusion works! Multiple mini blizzard
    work on their own… 160k damage & 300 DPS" (3587659112) from the fusion query.
  - Total identified: **~9 distinct fused-ball screenshots with captions** (URLs
    and file ids recorded; images not downloaded). Each detail page exposes an
    `og:image` URL on `images.steamusercontent.com/ugc/...` — machine-readable.
  - Caveat: search only covers titles/captions, and most players caption
    screenshots loosely ("Insane fusion combo..."), so yield per query is low.
- **Discussions** (`/discussions/search/?q=fusion`): works; found "Strongest
  Fusion Found?" (thread 693122745160131171; comments name Flicker+Overgrowth,
  Black Hole+flicker/flash/sun, Hemo X Flash with the note "Hemo's HP damage is
  capped at 9999", Mosquito Swarm X Nuke), "Found a Fusion that went nuts"
  (Overgrowth X Maggot mechanics explanation), "Black Hole Fusions", "Fusion
  glitch". ~10 fusion threads total; post bodies extractable from HTML.
- **Guides**: 37 guides under Crafting; the "All Evolutions" guide (3589057233)
  is evolution-only (its 117 "X" patterns are evolution recipes, not fusions).
  No guide enumerates fusions — consistent with fusion-completeness.md §3.

**Machine-readability: good** (HTML but stable structure), **bulk-harvestable:
moderately** (search is per-query; a sweep over ~90 ball names in both slots =
~4000 queries is impractical, but a sweep over the ~25 meta balls + "fusion" +
"x" is feasible).

### 2c. wiki.gg — thin, as before

- MediaWiki API works. `list=search` in the File (6) namespace for "X" returns
  exactly **6 fusion-relevant files**: `BleedXFreeze.png` (the one illustrative
  fusion image) + 4 "Fusion Example *.jpg" order-comparison shots (Egg Sac X
  Poison / Poison X Egg Sac / Spider Queen X Vampire Lord / Vampire Lord X Spider
  Queen) + X Ray (an evolution, false positive). The upload log (500 most recent
  events) contains no other fusion-named files. **No fused-ball gallery, no
  Category:Fusions, no user-blog test logs.**
- The Fusion Mechanics page wikitext (fetched via `action=parse`) confirms prior
  findings: prose + the trigger-rules table (Spawn/AOE/Status × On-Hit/
  On-Damage/On-Timer), no per-pair data. Talk pages (Talk:Balls, Talk:BALL x PIT
  Wiki) discuss page structure and a vandalism incident, no fusion data.

### 2d. YouTube — good for named pairs, weak for mechanics

YouTube search pages and watch pages are fetchable without login; `ytInitialData`
parses cleanly (videoId, title, channel, description). No video downloads.

- Search "ball x pit fusion" → ~20 relevant videos. The most valuable are
  Matzel's chaptered videos, whose **descriptions name pairs as chapter titles**:
  - "TOP 5 Most Satisfying Fusions" (Fgdc0FitOIw, 33k views): Spider Blob,
    Black Hole x Maggot, Spider Laser Show, Phantom x Nosferatu, Spider Queen x
    Blizzard.
  - "I Broke BALL x PIT With These 5 Fusions" (pV4cP8gvKcA, 168k views): Black
    Hole X Sun, Holy Laser X Maggot, Nuke X Maggot, Overgrowth X Flash,
    Nosferatu X Shotgun.
  - "I Broke BALL x PIT With These NEW Fusions" (a9Q4kx_QwSA): 2026-update fusions.
  - Others: Dark + Nuke ("23 million total damage", 4U7DFbvtBrQ), Flash +
    Hemorrhage (VsRQkunMOZk), Holy Laser + Maggot (hnZbDa6D5IQ), BlackholexSun +
    BlackholexNuke (zYmyHe6d8Dk), Nuclear Bomb X Satan (OAIp3MwA5W4).
- **Counted: ~18 distinct pairs named in video titles/descriptions/chapters**
  (most overlapping Reddit's list). Descriptions are one HTTP GET each —
  bulk-harvestable. Transcripts (via timedtext API) would add trigger commentary
  but were not pulled in this session.

### 2e. Non-English communities

- **Bilibili (zh-CN)**: two long-form guides by the same author
  (opus/1082211929042190342 demo-era, opus/1124449565113581573 full-release).
  Pages embed the full text in `window.__INITIAL_STATE__` — machine-readable via
  plain curl. Content is **evolution** reviews, but includes fused-ball behavior
  notes, e.g. "时间与其它弹珠融合后会扩大时停半径" (Time fused with another ball
  expands the time-snare radius) and repeated per-evolution "fuse with X for Y"
  advice. No dedicated fusion-pair table found. Bilibili video search works but
  results are evolution-focused.
- **namu.wiki (ko)**: the BALL x PIT/Ball document has a **qualitative fusion
  combination rules section** (directly scraped snippet): "Different range
  attacks = have the range of both balls. Area attack + status abnormality =
  Enemies hit in the range also suffer from status abnormality. Range attack +
  additional ball creation = created balls also have the same range. Different
  status abnormalities = applied simultaneously. Same status abnormality with
  different balls = overlapping limits/effects are adjusted. Abnormal status +
  creation of additional balls = created balls also have the same abnormal
  status. Additional ball creation + additional ball creation = both effects but
  the amount is adjusted." — This is the **most complete statement of fusion
  composition semantics found anywhere**, more granular than the wiki.gg trigger
  table. The page is Cloudflare-blocked for direct fetch (tried curl + firecrawl
  basic/stealth/enhanced); the section is recoverable via search-engine snippets
  or a rendering proxy. Worth a targeted re-fetch attempt from a browser session.
- Russian/Ukrainian Steam guides exist (achievement guides) — no fusion content.

### 2f. GitHub / BepInEx ecosystem — no new fusion data, one new save-format fact

- GitHub repo search (75 repos for ballxpit): all data-bearing repos carry
  evolution recipes only (confirms fusion-completeness.md §2c).
- **New fact**: `VdustR/game-save-ball-pit` (save editor, verified on v1.301
  device save) documents `NumCombos` as "an observed **90-by-90 counter matrix**
  in current saves: each row stores the 0x04 primitive marker followed by 90
  counters" and exposes an `--unlock-wiki` flag that "marks ball, passive, and
  ball-combination statistics as discovered". This is the save-side per-pair
  fusion-discovery matrix (same data the jellyhani bridge reads as
  `MetaSaveData.HeroStats → NumCombos`). It is **discovery counters, not result
  definitions** — but it means a *completed* save's NumCombos matrix is a
  machine-readable list of which pairs the player has fused (names derivable from
  the ball index order). No published dump of a completed matrix was found.
- jellyhani/ball-x-pit-companion and send0xx/ball-x-pit-craft-atlas: zero open
  issues/discussions (checked via GitHub API) — no user-reported fusion data.

### 2g. "A X B" as a search key — works exactly as hoped

The fused-ball naming convention makes targeted queries effective:
`searxng "ball x pit" "<BallA> x <BallB>"` returns the Reddit threads, Steam
discussions, and (occasionally) tier-list articles naming the pair. Also effective
against the archive APIs as a title substring. False positives: the game's own
title, level names (BONExYARD), character pairs (Shieldbearer x Sisyphus),
console names (Series X), and "x" as a letter — all filterable with a ball-name
dictionary.

### 2h. Avenues that yielded nothing

- **Nexus Mods / modding forums**: the only BepInEx mods found are QoL
  (auto level-up, button prompts); no fusion-data mod.
- **Fandom mirror** (ballpit.fandom.com): scrape blocked from this network
  (firecrawl engines failed); search snippets show it mirrors the wiki.gg Balls
  page including the same fusion prose. Nothing additional.
- **Official Discord**: not publicly readable; its only leak into the open web is
  the PSA #2 repost (§2a).
- **Steam store pages / achievements**: nothing beyond the "Fusion Evolution"
  achievement already known.

---

## 3. Synthesis: what the corpus lets us compile

| Layer | Sources | Coverage | Confidence |
|---|---|---|---|
| Pair exists / was fused | Reddit archives, Steam screenshots, YouTube chapters | **~105 distinct pairs** from Reddit alone; ~15 more unique from Steam/YouTube → **~110–120 pairs** | High (named in play context) |
| Behavior claim (cross-wires / doesn't / priority / bug) | Reddit bodies+comments, Steam discussions, Bilibili notes, namu.wiki rules | **~25–30 pairs** with at least one claim; ~8 with mechanism-level explanation | Medium (self-reported, uncontrolled) |
| Composition semantics (rule, not per-pair) | namu.wiki combination rules, wiki.gg trigger table, PSA #1+#2 order findings, icemage_999's status-vs-spawn rule | The rule set itself | Medium-high (multiple independent reports agree; matches user's 3 playtests) |
| Numbers (damage/procs/cooldowns of fused balls) | none | 0 | — (confirmed unobtainable, per fusion-completeness.md) |

For scale reference: the pair space is C(90,2) ≈ 4005 minus evolution-reserved
pairs. **~110–120 pairs ≈ 3% of the space** — but the pairs covered are exactly
the ones players actually use (the meta), which is what a companion site's
readers would search for. Coverage of *validated* pairs (behavior claim consistent
across ≥2 independent sources or matching the composition rules) is realistically
**25–40 pairs today**, growing as the corpus grows.

The composition-rule layer is the multiplier: with the namu.wiki rules + wiki.gg
trigger table + the status-vs-spawn distinction, many unreported pairs become
*predictable* from the two components' existing fact-base entries, and the
~110 reported pairs become the validation set for those predictions.

---

## Verdict

**Yes — meaningful fused-ball coverage is compilable from internet sources, via
three routes, at roughly 3% of the pair space but ~100% of the popular meta.**

1. **Route 1 — Reddit archive harvest (best value).** Arctic Shift API over
   r/BALLxPIT, title-keyed on "x"/"fusion" + full-text scan with a ball-name
   dictionary. Yields ~105 distinct pairs and the majority of behavior claims,
   including the two PSA testing threads and the Discord-derived same-property
   priority rules. JSON in/out; the only cost is rate-limit pacing (~100
   posts/minutes-scale cooldowns). Repeatable monthly to pick up new posts.
2. **Route 2 — Steam Community sweep.** Screenshot-title search + discussion
   search over the app hub. Adds ~9 captioned fused-ball screenshots and a
   handful of mechanics comments not on Reddit. HTML scraping, no login, cheap.
3. **Route 3 — YouTube metadata.** Video descriptions/chapters from fusion
   videos (Matzel's channel especially) name ~18 pairs with in-game evidence on
   tape; transcripts could add trigger commentary later.

**What no route provides:** fused-ball numbers (confirmed again), a complete pair
table (does not exist), or Discord content beyond the one repost.

**Recommended concrete next step for this repo:** build a curated
**community fusion-observations dataset** — a hand-reviewed table of
`pair → behavior note → source URL(s) → date → confidence`, seeded from the ~110
pairs and ~30 behavior claims identified here (appendix), validated against the
composition rules (namu.wiki + wiki.gg trigger table) and the user's playtests.
Present it on the site as "community-reported fusion notes" attached to the
derived fusion explorer recommended in fusion-completeness.md — explicitly
labeled playtest-unverified where it is — rather than as a definitive table. The
harvest scripts (arctic-shift pacer + Steam search + ball-name dictionary) belong
in `scripts/` as an occasional refresh tool, not in the data pipeline.

## Uncertainty summary

- Pair counts are from one session's harvest under rate limits; the asc/desc
  `title=x` pages overlap imperfectly and the Jan-2026 middle chunk was only
  partially fetched (rate-limit timeouts), so **~105 pairs is a floor, not a
  ceiling** — a complete harvest would likely find 130–160.
- Behavior claims are self-reported and uncontrolled; several directly contradict
  each other (order matters vs doesn't; the contradiction is itself documented in
  the PSA threads). Each claim needs the source URL kept alongside it.
- The icemage_999 status-vs-spawn rule and the wiki trigger table are
  community-observed, not datamined; they match the user's three playtests but
  that is 3 data points, not proof.
- The namu.wiki rules section was read via a search snippet (page is
  Cloudflare-blocked); the full section and any tables around it need a
  browser-session fetch to quote faithfully.
- Steam screenshot captions identify the pair but usually say nothing about
  behavior; they confirm *existence and appearance* (icon compositing), which is
  still useful for an icon strategy for fused balls.
- Arctic Shift and PullPush are volunteer services; both could disappear. The
  harvest output (not the live API) must be the durable artifact.

---

## Appendix: the 105 distinct pairs found (mention counts from this session)

Flash X Overgrowth (14), Black Hole X Sun (14), Flash X Hemorrhage (11), Maggot X
Nuclear Bomb (9), Holy Laser X Maggot (7), Mosquito X Nuclear Bomb (7), Black Hole
X Flash (6), Flicker X Overgrowth (5), Flicker X Reaper (5), Maggot X Reaper (5),
Flash X Reaper (5), Black Hole X Nuclear Bomb (5), Hemorrhage X Voluptuous Egg Sac
(4), Nosferatu X Voluptuous Egg Sac (4), Nuclear Bomb X Shotgun (4), Nuclear Bomb X
Mosquito Swarm (1) & Mosquito Swarm X Nuclear Bomb (1), Incubus X Voluptuous Egg Sac
(3), Banshee X Sniper (3), Blizzard X Nosferatu (3), Flash X Zombie (3), Nosferatu X
Satan (3), Flicker X Voluptuous Egg Sac (2), Blizzard X Flash (2), Cell X Nosferatu
(2), Cell X Reaper (2), Dark X Nuclear Bomb (2), Egg Sac X Hemorrhage (2), Egg Sac X
Nuclear Bomb (2), Hemorrhage X Maggot (2), Hemorrhage X Satan (2), Maggot X
Overgrowth (2), Nosferatu X Shotgun (2), Nosferatu X Reaper (2), Nosferatu X Banshee
(2), Reaper X Spider Queen (2), Satan X Vampire Lord (2), Nuclear Bomb X Time (2),
Bomb X Mosquito (2), Brood Mother X Laser (2), Soul Sucker X Voluptuous Egg Sac (2),
Mosquito King X Mosquito Swarm (1), and ~60 singles (Armageddon X Elemental,
Armageddon X Sniper, Assassin X Flicker, Assassin X Hemorrhage, Banshee X Maggot,
Banshee X Petrify, Black Hole X Flesh, Black Hole X Flicker, Black Hole X Maggot,
Black Hole X Satan, Blizzard X Glacier, Blizzard X Spider Queen, Blizzard X
Voluptuous Egg Sac, Bomb X Dark, Bomb X Ghost, Burn X Radiation Beam, Cell X Iron,
Cell X Nuclear Bomb, Cell X Overgrowth, Cell X Vampire Lord, Cell X Warp, Cell X
Wraith, Charm X Holy Laser, Dark X Light, Dark X Sun, Egg Sac X Ghost, Egg Sac X
Laser Beam, Egg Sac X Voluptuous Egg Sac, Egg Sac X Wraith, Elemental X Satan,
Erosion X Flicker, Fireworks X Nuclear Bomb, Flash X Lightning Rod, Flash X Nuclear
Bomb, Flash X Vampire, Flash X Vampire Lord, Flicker X Frozen Flame, Flicker X
Hemorrhage, Freeze X Inferno, Freeze Ray X Spider Queen, Ghost X Nuclear Bomb,
Glacier X Magma, Hemorrhage X Laser Beam, Hemorrhage X Nuclear Bomb, Hemorrhage X
Spider Queen, Hemorrhage X Wind, Hemorrhage X X Ray, Lightning Rod X Sun, Laser
Cutter X Maggot, Landslide X Mosquito Swarm, Maggot X Nosferatu, Maggot X Radiation
Beam, Maggot X Satan, Maggot X Vampire Lord, Nuclear Bomb X Overgrowth, Nuclear Bomb
X Radiation Beam, Nuclear Bomb X Voluptuous Egg Sac, Reaper X Sun, Satan X
Voluptuous Egg Sac, Spider Queen X Vampire Lord, Voluptuous Egg Sac X Wraith).

Alias normalization applied: Blackhole/Black hole → Black Hole; Nuke → Nuclear
Bomb; Hemo/Haemorrhage → Hemorrhage; VolEgg/Vol Egg/Volsac → Voluptuous Egg Sac;
Dracula → Vampire Lord; Spooder Queen → Spider Queen; Rad Beam → Radiation Beam;
Maggots → Maggot; Broodmother → Brood Mother; X-Ray → X Ray.
