# Passive availability by character

> **Update 2026-11-13:** the DLC build (v1.308) was datamined. It does contain
> a hard per-character allow-list for the 45 DLC passives, plus character-stat
> gates on several base-game passives. See
> `character-passive-restrictions.md`. The "no confirmed per-character lockout"
> bottom line below applies to the pre-DLC / wiki-sourced scope of this
> snapshot; the DLC mechanism is now confirmed.
>
> **Status — landed (2026-11-14).** The confirmed mechanisms landed via T24
> ([#50](https://github.com/tomaskir/ball-x-pit-companion/issues/50)): the
> allow-lists are authored in `docs/research/game-mechanics.md` §2.3 and the
> rules live in `src/passive-availability.ts`. The record below is kept for
> provenance.

Which passives a character can actually be offered or equip, and why. This is a
**research snapshot** (compiled 2026-11-11), not parsed by the data pipeline.
It exists to answer the question "which passives are unavailable to which
characters?" without conflating three different mechanisms:

- **Hard-unavailable** — the game never offers/equips the passive (offer-pool
  gate or zero slots).
- **Soft-unavailable** — the passive can be equipped but its effect is dead or
  near-dead for that character.
- **Slot-count restriction** — the character has fewer (or zero) passive slots,
  so some/all passives cannot be carried regardless of item identity.

Game scope: v1.301 pre-DLC plus the Naturalist Update (2026-08-06), the final
free update. The wiki self-flags that some passive appearance requirements are
"still being discovered by the community, so some of this information could be
incorrect."

## Bottom line

Documented sources establish **no confirmed per-character passive lockout
list**. Passive availability is governed by:

1. the passive being unlocked,
2. a free passive slot existing, and
3. any extra appearance requirement being met — a matching-status ball or a
   prerequisite passive.

All three are character-independent. The only character that is hard-blocked
from passives is **The Ballbearer**, and that is a slot-count consequence (zero
passive slots), not an item-specific rule. **The Hoary Hoarder** is the inverse:
two ball slots but double passive slots, so no passive is denied to it on slot
grounds.

Community code-mining reports a handful of character-specific pool exclusions
(crit passives for Sisyphus, Baby Rattle/Cornucopia for Empty Nester/Sisyphus,
Magnet for Shieldbearer/Tactician). These are **unverified**, from an older
build, and partly contradicted by the wiki and by adversarial verification. They
are recorded below as leads, not facts.

## The offer mechanism

The wiki's Passives page states: "Most Base Passives can be offered as long as
the player has a passive slot available, however, some passives do have extra
requirements for them to be offered, mainly (but not restricted to) passives
that are related to specific status effects, which require you to have a ball
that can apply that specific status effect to enemies for the passive to be
offered." PlayerEcho states the same three conditions explicitly: unlocked, a
free passive slot, and (for status passives) a ball applying that status.

Consequence: a character with zero passive slots cannot receive any passive
offer. That is why the Ballbearer's exclusion is hard rather than soft.

## Confirmed hard-unavailable gates (character-independent)

These are withheld from the offer pool until the run's loadout satisfies the
requirement. They apply to every character equally.

| Passive | Requirement | Source |
|---|---|---|
| Cursed Elixir | A ball that applies **Poison** | S1, S5 (Poison analogue) |
| Frozen Spike | A ball that applies **Freeze** | S1 |
| Kiss of Death | A ball that applies **Charm** | S1, S20 |
| Midnight Oil | A ball that applies **Burn** | S1, S20 |
| Voodoo Doll | A ball that applies **Curse** | S1, S5 |
| Traitor's Cowl | At least one other passive granting **stone allies** (e.g. Archer's Effigy) | S1, S4, S18, S19 |
| Artificial Heart | Another **friendly-pieces** passive | S1 (wiki-only) |
| Ghostly Shield | An **allies** passive | S1 (wiki-only) |

The five status-ball gates are the closest thing to a real "some passives are
not available" rule, but they key off the **ball loadout**, not the character.
The Hoary Hoarder's two ball slots can still satisfy them; the Ballbearer can
never satisfy the prerequisite-passive gates because it has no passive slots.

## Per-character table

"None confirmed" means no source documents a hard lockout for that character;
soft interactions with the character's quirk may still exist and are noted.
This table is the **pre-DLC / wiki-sourced** view; for the DLC build's
datamined allow-list and stat gates, see `character-passive-restrictions.md`.

| Character | Passive slots | Confirmed restriction | Notes |
|---|---|---|---|
| The Warrior | normal | none confirmed | neutral |
| The Itchy Finger | normal | none confirmed | scattered aim may make aim-dependent passives worse (soft, editorial) |
| The Repentant | normal | none confirmed | bounce passives are the synergy-positive case |
| The Cohabitants | normal | none confirmed | mirrored balls double spawn passives |
| The Cogitator | normal | none confirmed | auto-picks upgrades |
| The Embedded | normal | none confirmed | innate pass-through may make pass-through passives redundant (soft) |
| The Shade | normal | none confirmed | **lead:** Ethereal Cloak claimed excluded (S15, unverified) |
| The Shieldbearer | normal | none confirmed | **lead:** Magnet and Radiant Feather claimed excluded (S14, S15, unverified) |
| The Spendthrift | normal | none confirmed | — |
| The Juggler | normal | none confirmed | no bouncing until landing; bounce passives soft-dead |
| The Empty Nester | normal | none confirmed | **soft/contested:** baby-ball passives; wiki says "rendered essentially useless", not locked (S6) |
| The Flagellant | normal | none confirmed | — |
| The Makeshift Sisyphus | normal | none confirmed | **soft/contested:** baby-ball passives; **lead:** crit/dagger exclusion claimed, refuted 1-2 (S14, S16) |
| The Physicist | normal | none confirmed | gravity trajectory may affect aim-dependent passives (soft) |
| The Tactician | normal | none confirmed | **lead:** Magnet claimed excluded (S14, unverified) |
| The Radical | normal | none confirmed | AI plays |
| The Falconer | normal | none confirmed | — |
| The Carouser | normal | none confirmed | — |
| The Tunneller | normal | none confirmed | — |
| The Tiptoer | normal | none confirmed | — |
| The Hoary Hoarder | **double** (2 ball slots) | none — no passive denied on slot grounds | two ball slots may fail the status-ball gates; no starting ball |
| The Ballbearer | **zero** | **all 71 passives** — hard-unavailable by slot count | cannot equip any passive, base or evolved; Carpenter/Antique Shop edge cases unresolved |
| The False Messiah | normal | none confirmed | Twitch-vote quirk |

Slot counts are upgrade-dependent and source-variable: vanilla baseline 4 ball +
4 passive (IGN, Nexus Mods), fully upgraded 5/5 (GameRant); Hoary Hoarder 2 ball
+ up to 8 passive; Ballbearer 8–10 ball / 0 passive. "Double" and "half" are
exact only against a stated baseline.

## Unverified character-specific claims (leads, not facts)

Source S14 (r/BALLxPIT, 2026-04-25) and S15 (r/BALLxPIT, 2026-05-14) report
per-character pool exclusions. S15's author derived character flags with Ghidra,
says the data is from an older build, and adds "I could be mistaken."

| Character | Passive(s) claimed excluded | Source | Verification outcome |
|---|---|---|---|
| The Makeshift Sisyphus | crit passives, including the hilted daggers | S14, S16 | refuted 1-2; wiki lists no character requirement |
| The Empty Nester | Baby Rattle, Cornucopia | S14 | refuted 0-3 |
| The Makeshift Sisyphus | Baby Rattle, Cornucopia | S14 | refuted 0-3 |
| The Shieldbearer | Magnet | S14 | unverified |
| The Tactician | Magnet | S14 | unverified |
| The Shade | Ethereal Cloak | S15 | unverified |
| The Shieldbearer | Radiant Feather (Wings of the Anointed component) | S15 | unverified |
| The Itchy Finger | fire-rate passives (Shortbow?) | S15 code flag `kFireRate` | unverified, hedged by source |

Code flags named in S15: `kFollowerDamage` (all except Empty Nester and
Sisyphus), `kBrickBreaker` (Shieldbearer), `kFireRate` (all except maybe Itchy
Finger), `kNoBallDaamge`, `AimMode.kBack`, `TimeMode.kTurnBased` (Tactician).
The general mechanism — character-level flags rather than map-level — is
plausible, but the per-item mapping is not confirmed for the current build.

## Contradictions and caveats

1. **Empty Nester baby-ball passives.** The wiki says baby-ball passives are
   "rendered essentially useless" and recommends banishing them with the
   Exorcist — implying they are offered, i.e. soft-unavailable. GameFAQs S21
   goes further: baby-ball-generating passives and special balls "will still
   trigger baby balls" on her. A Steam user calls the in-game description
   "a bit misleading." Adversarial verification split 2-1 on the quirk
   description, and the run's own refuted list contains a 1-2 vote against the
   "not hard-locked" reading — internally inconsistent. Treat as unresolved;
   soft-at-most is the better-supported reading, but do not encode it as fact.
2. **Sisyphus crit/dagger exclusion.** S14 and S16 claim the daggers are not
   offered to Sisyphus; verification refuted the claim 1-2, and the wiki's
   54-row passive table has no character column. Unconfirmed.
3. **Passive count.** This research brief said 56 passives; at research time
   the repo and wiki had 54 base + 17 evolved = 71 (`src/data/passives.ts`
   had 71 entries: depth 0 = 54, depth 1 = 16, depth 2 = 1). The DLC build now
   has 116 (77 base + 39 evolved).
4. **Character count.** The brief said 24 while listing 23; the repo and wiki
   have 23.
5. **Status-ball gate breadth.** Several guides say the gate accepts only
   evolved balls (e.g. Phantom/Sacrifice/Incubus for Curse), which would widen
   the effective exclusion. The wiki wording says "a ball that can apply that
   specific status effect" without the evolved qualifier. Unverified.
6. **Hard-unavailable is an interpretation.** It rests on the wiki's
   "appearance requirement"/"offered" wording and the offer-pool mechanism,
   strongly supported but with no official in-game confirmation.

## Open questions

- Does the Carpenter's +1 passive slot grant the Ballbearer a usable passive
  slot, or is it converted to a ball slot? No source resolves this; PlayerEcho's
  "can ignore this page" implies no.
- Does the Antique Shop's start-of-battle passive choice bypass the Ballbearer's
  zero slots?
- What is the complete, current-build per-character exclusion list behind the
  code-mined flags, and do crit passives really leave Sisyphus's pool?
- Do baby-ball passives hard-lock or merely soft-fail on Empty Nester and
  Sisyphus?
- Do the status-ball gates accept any status-applying ball or only evolved ones?

## Sources

- **S1** — BALL x PIT Wiki, "Passives", <https://ballxpit.wiki.gg/wiki/Passives>
  (last revision 2026-08-27, oldid 3256; fetched 2026-11-11).
- **S2** — BALL x PIT Wiki, "Characters", <https://ballxpit.wiki.gg/wiki/Characters>
  (oldid 3609, last revision 2026-09-05; fetched 2026-11-11).
- **S3** — BALL x PIT Wiki, "The Hoary Hoarder",
  <https://ballxpit.wiki.gg/wiki/The_Hoary_Hoarder> (oldid 3999; fetched 2026-11-11).
- **S4** — BALL x PIT Wiki, "Traitor's Cowl",
  <https://ballxpit.wiki.gg/wiki/Traitor%27s_Cowl> (oldid 2955, created 2026-08-22).
- **S5** — BALL x PIT Wiki, "Voodoo Doll",
  <https://ballxpit.wiki.gg/wiki/Voodoo_Doll> (2026-08-22).
- **S6** — BALL x PIT Wiki, "The Empty Nester",
  <https://ballxpit.wiki.gg/wiki/The_Empty_Nester>.
- **S7** — Steam store page, "BALL x PIT",
  <https://store.steampowered.com/app/2062430/BALL_x_PIT>.
- **S8** — PlayStation Blog, "Ball x Pit final update: The Naturalist arrives
  August 6", 2026-07-28,
  <https://blog.playstation.com/2026/07/28/ball-x-pit-final-update-the-naturalist-arrives-august-6>.
- **S9** — SteamDB patch notes, Naturalist Update, 2026-08-06,
  <https://steamdb.info/patchnotes/23150541>.
- **S10** — Dexerto, "Ball x Pit all characters", 2026-08-06,
  <https://dexerto.com/wikis/ball-x-pit/all-characters-how-to-unlock-them-2>.
- **S11** — GameRant, "Ball x Pit Naturalist update new balls, passives,
  evolutions", 2026-08-07,
  <https://gamerant.com/ball-x-pit-naturalist-update-new-balls-passives-evolutions>.
- **S12** — PlayerEcho, "Ball x Pit passives", 2026-09-12,
  <https://playerecho.com/ball-x-pit/passives>.
- **S13** — PlayerEcho, "Ball x Pit best characters and stats", 2026-09-06,
  <https://playerecho.com/ball-x-pit/best-characters-and-stats>.
- **S14** — r/BALLxPIT, "Radiant Feather and Tactician", 2026-04-25,
  <https://www.reddit.com/r/BALLxPIT/comments/1svlo1z/radiant_feather_and_tactician/>.
- **S15** — r/BALLxPIT, "Items restricted on certain characters", 2026-05-14,
  <https://www.reddit.com/r/BALLxPIT/comments/1tco7h9/items_restricted_on_certain_characters/>.
- **S16** — r/BALLxPIT, "Tips for Deadeye's Cross", 2025-12-27,
  <https://www.reddit.com/r/BALLxPIT/comments/1pwks3c/tips_for_deadeyes_cross/>.
- **S17** — Steam Community discussion, 2025-10-26,
  <https://steamcommunity.com/app/2062430/discussions/0/595163936630852037>.
- **S18** — ballxpit.org, "Secret passive items",
  <https://ballxpit.org/guides/secret-passive-items>.
- **S19** — Steam Community discussion (Traitor's Cowl requirement),
  <https://steamcommunity.com/app/2062430/discussions/0/624436764982998544>.
- **S20** — dood.gg per-passive pages, e.g.
  <https://dood.gg/en/ball-x-pit/passives/kiss-of-death>.
- **S21** — DCRage, "BALL x PIT - Character Guide" (GameFAQs), v2.0, 2026-07-25,
  <https://gamefaqs.gamespot.com/pc/539487-ball-x-pit/faqs/82265>.

## Relationship to the existing fact base

`docs/research/game-mechanics.md` already records the Ballbearer/Hoary Hoarder
slot quirks (§3, lines 284–285) and the eight appearance requirements (§2.1,
lines 174–223). This file adds the per-character question, the hard/soft/slot
classification, and the verification status of the community claims. It does
not change the site's editorial synergy model: the Ballbearer's `*passives` red
verdict and the Empty Nester/Sisyphus baby-ball red verdicts are editorial
judgements, not hard game rules, and remain as they are.

If the site later wants to surface passive availability, the data model would
need a new field on `Passive` (e.g. `requires: { status?: string; passiveClass?:
string }`) and a character slot-capacity field — a content decision, not a
mechanical consequence of this research.
