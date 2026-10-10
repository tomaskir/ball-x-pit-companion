# Character pairing restrictions (Matchmaker)

Which characters the game refuses to team up in a two-character (Matchmaker)
run. This is **game data** — the game hard-codes the darkened-out pairs on
the character select screen — unlike the synergy tags/verdicts, which are the
site's editorial model. Consumed by the data pipeline: `scripts/parse-wiki.ts`
reads the table below into `parsed.json`, and `scripts/emit-data.ts` emits it
as `cannotPair` on each character in `src/data/characters.ts`.

The wiki's own Matchmaker page has an "Allowable Character Combinations"
section that is still a `{?TODO}` stub (checked 2026-10-10), so the pair list
is reconstructed from community sources.

## Sources

- **S1 — DCRage, "BALL x PIT - Character Guide" (GameFAQs)**,
  <https://gamefaqs.gamespot.com/switch/539489-ball-x-pit/faqs/82265>
  (Switch mirror; same FAQ id across platforms). Version 2.0, updated
  2026-07-25 — the only source that enumerates the full non-compatible pair
  list ("Pairing/Non-Pairing" section). The page is Cloudflare-gated; the
  quotations below were recovered from search-engine snippets of the page.
  The same guide's v1.1 (updated 2026-01-31, PS5 mirror
  `/ps5/551362-ball-x-pit/faqs/82265`) predates the Shadow/Naturalist
  characters and omits some pairs — see "Version drift".
- **S2 — r/BALLxPIT "Finished a challenge to do all 107 character combos"**
  (posted ~Jan 2026), <https://reddit.com/r/BALLxPIT/comments/1pnejsk/> with
  the author's public spreadsheet
  <https://docs.google.com/spreadsheets/d/1dAHW1SfWicBHwvRPmGr2NjwWMUC_P6VCtgy658NI5og/edit>.
  The author play-tested **every** pair of the then-16-character roster and
  marked the rejected ones "CAN'T COMBO" in a 16×16 matrix. Empirical, but
  predates The Radical, The Falconer, The Carouser, The Tunneller, The
  Tiptoer, The Ballbearer and The Hoary Hoarder. Sanity check: C(16,2) = 120
  pairs − 13 rejected = 107, exactly the count in the post's title.
- **S3 — wiki.gg Matchmaker page**,
  <https://ballxpit.wiki.gg/wiki/Matchmaker> (oldid 3376, checked 2026-10-10):
  "The False Messiah … cannot otherwise have a second character on runs
  without enabling the character choice vote, and they cannot be selected as
  the second character to any other."
- **S4 — Naturalist Update patch notes (2026-08-06)**, via Steam news
  aggregators: "Fixed invalid message that shows when you try to matchmake
  the Warrior with the False Messiah." Together with S1 v2.0 ("The
  Warrior — No restrictions"), the Warrior × False Messiah pair is allowed as
  of the Naturalist update.

## The pair list (site model, current roster)

Relation is symmetric: if A cannot pair with B, B cannot pair with A. The
game enforces this on the Matchmaker select screen by darkening the
incompatible partners and rejecting them with a message.

| Character | Cannot pair with | Sources |
|---|---|---|
| The Itchy Finger | The Tactician | S1, S2 |
| The Repentant | The Shieldbearer, The Flagellant, The Tunneller | S1 (Tunneller: v2.0 only), S2 |
| The Cohabitants | The Makeshift Sisyphus, The Spendthrift, The Juggler, The Falconer | S1 (Falconer: v2.0 only), S2 |
| The Cogitator | The Radical | S1 |
| The Shade | The Makeshift Sisyphus, The Falconer | S1 (Falconer: v2.0 only), S2 |
| The Makeshift Sisyphus | The Cohabitants, The Shade, The Spendthrift | S1, S2 |
| The Shieldbearer | The Repentant, The Flagellant, The Physicist, The Tactician | S1, S2 |
| The Spendthrift | The Cohabitants, The Makeshift Sisyphus | S1, S2 |
| The Flagellant | The Repentant, The Shieldbearer, The Physicist, The Tactician | S2, S1 (Repentant/Shieldbearer/Physicist; see contradiction 1) |
| The Juggler | The Cohabitants | S1, S2 |
| The Physicist | The Shieldbearer, The Flagellant | S2, S1 (Shieldbearer/Flagellant entries) |
| The Tactician | The Itchy Finger, The Shieldbearer, The Flagellant | S2, S1 (Itchy Finger/Shieldbearer entries) |
| The Radical | The Cogitator | S1 |
| The Falconer | The Cohabitants, The Shade | S1 |
| The Tunneller | The Repentant | S1 (v2.0 only) |
| The False Messiah | *all* — cannot be a second character, and takes no partner (outside the vote mechanic) | S3, S4 |

No restrictions (any partner): **The Warrior, The Embedded, The Empty
Nester, The Carouser, The Tiptoer, The Hoary Hoarder, The Ballbearer.**

That is 17 forbidden pairs over the 22 pairable characters, plus the False
Messiah's special rule.

## Contradictions and caveats

1. **Flagellant × Juggler.** S1's Flagellant entry lists The Juggler as
   non-compatible, but S2's matrix ran that pair successfully, and S1's own
   Juggler entry lists only The Cohabitants (S1 is otherwise symmetric).
   The empirical matrix wins: Flagellant × Juggler is **allowed**; S1's
   Flagellant entry is treated as containing an error (its remaining items —
   Shieldbearer, Physicist — match S2 exactly, and its Tactician item is cut
   off in every retrievable snippet while S2 confirms Flagellant × Tactician).
2. **Version drift.** S1 v1.1 (2026-01-31) omits Repentant–Tunneler; v2.0
   (2026-07-25) includes it. The Tunneller shipped in the Shadow Update
   (2026-04-27), so v1.1 simply predates the character — not a mechanic
   change. No pair present in v1.1 is absent from v2.0.
3. **Warrior × False Messiah** was rejected with an "invalid" message before
   the Naturalist update and is allowed after it (S4, S1 v2.0). The site
   models the post-Naturalist state.
4. **Unverified tails.** S1's per-character entries for The Carouser, The
   Tiptoer, The Hoary Hoarder and The Ballbearer were never retrievable
   (snippet truncation + Cloudflare gate). No other source names any
   restriction for them, and S2 ran all their era-peers with no rejections,
   so they are modeled as unrestricted. Re-verify against S1 when the page
   is reachable.
5. **False Messiah nuance.** S3 notes Messiah *can* gain a second character
   by enabling the character-choice vote (flagged as possibly unintended).
   The site models the normal path: Messiah pairs with nobody, in either
   slot. If a future patch makes Messiah pairable, this is the one row to
   revisit.
6. **Reasons are not sourced.** Neither the wiki nor S1 states *why* each
   pair is rejected. The patterns are suggestive (Repentant/Flagellant/
   Shieldbearer/Physicist all rewrite ball return trajectories; Cohabitants/
   Falconer/Spendthrift/Juggler all rewrite launching), but the site records
   the *what*, not a theory of the *why*.

## Maintenance

New characters and patch notes are the risk points. When the wiki grows a
character or the game ships an update, re-check S1's latest revision (the
FAQ is versioned; the Risen Ballbylon mirrors carry the same FAQ id) and this
file's table together. `npm test` pins the emitted pair list's shape
(symmetry, id resolution, the False Messiah rule) in `src/data.test.ts`.
