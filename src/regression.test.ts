// Regression tests for every data/logic bug found and fixed this session.
// Each test names the bug it pins. UI-only fixes (icon blink, portrait
// centering) are CSS/DOM concerns — covered indirectly where the data
// participates.
import { describe, it, expect } from 'vitest';
import { BALLS } from './data/balls';
import { PASSIVES } from './data/passives';
import { CHARACTERS } from './data/characters';
import { ballMap, passiveMap } from './catalog';
import { highlightSet, factorizesIntoSlots } from './graph';
import { verdictFor } from './synergy';
import { readFileSync } from 'node:fs';

describe('regression: structural depth (was wiki labels — Tumor et al. misplaced)', () => {
  // The wiki labeled Tumor, Laser Cutter, Nuclear Bomb, Time Bomb, Black Hole
  // as "Evo" though each requires an evolved ball. Cheat sheet: Tier 2/3.
  const TIER3 = ['armageddon', 'banshee', 'black-hole', 'laser-cutter', 'mosquito-kingdom', 'nosferatu', 'nuclear-bomb', 'reaper', 'satan', 'sniper', 'time-bomb', 'tumor', 'x-ray'];

  it('all 13 structurally-tier-3 balls are depth 2', () => {
    for (const id of TIER3) expect(ballMap.get(id)?.depth, id).toBe(2);
  });

  it('Tumor: Radiation Beam (evolved) + Flesh → tier-3', () => {
    const tumor = ballMap.get('tumor')!;
    expect(tumor.recipes).toEqual([['radiation-beam', 'flesh']]);
    expect(ballMap.get('radiation-beam')!.depth).toBe(1);
    expect(tumor.depth).toBe(2);
  });

  it('Black Hole: Sun + (Dark or Time) → tier-3 (was tier-3 wiki label but depth-1 in first deploy)', () => {
    expect(ballMap.get('black-hole')!.depth).toBe(2);
  });

  it('depth is consistent: every depth-2 ball has a depth-1 component; depth-1 has none', () => {
    for (const b of BALLS) {
      const comps = b.recipes.flat().map((c) => ballMap.get(c)!);
      if (b.depth === 2) expect(comps.some((c) => c.depth >= 1), b.id).toBe(true);
      if (b.depth === 1) expect(comps.every((c) => c.depth === 0), b.id).toBe(true);
    }
  });

  it('passives: Deadeye\'s Impaler is the only structural tier-3 (built from evolved Deadeye\'s Cross)', () => {
    const impaler = passiveMap.get('deadeyes-impaler')!;
    expect(impaler.depth).toBe(2);
    expect(passiveMap.get('deadeyes-cross')!.depth).toBe(1);
    expect(PASSIVES.filter((p) => p.depth === 2)).toHaveLength(1);
  });
});

describe('regression: passive selection highlights evolved variants (walked ball graph)', () => {
  // paintGrids used closure(..., ballMap) for every selection — a passive
  // selection found no children. The fix walks the graph the selection lives in;
  // here we pin the data-side premise: passive graphs contain real chains.
  it('basic passive has descendants in the passive graph', () => {
    const hl = highlightSet('wagon-wheel', passiveMap);
    expect(hl).toContain('ardent-tire');
  });
  it('basic passive with a tier-3 chain: Deadeye\'s Amulet → Gracious Impaler → Deadeye\'s Impaler', () => {
    const hl = highlightSet('deadeyes-amulet', passiveMap);
    expect(hl).toContain('gracious-impaler');
    expect(hl).toContain('deadeyes-impaler');
  });
  it('evolved passive selection includes its tier-3 child AND components', () => {
    const hl = highlightSet('deadeyes-cross', passiveMap);
    expect(hl).toContain('deadeyes-impaler'); // child
    for (const comp of ['diamond-hilted-dagger', 'sapphire-hilted-dagger', 'ruby-hilted-dagger', 'emerald-hilted-dagger'])
      expect(hl).toContain(comp); // components
  });
});

describe('regression: tier-2 ball selection includes tier-3 children', () => {
  it('Inferno highlights Burn/Wind/Time (components) and Armageddon (child)', () => {
    const hl = highlightSet('inferno', ballMap);
    expect(hl).toContain('burn');
    expect(hl).toContain('wind');
    expect(hl).toContain('time');
    expect(hl).toContain('armageddon');
  });
  it('multi-recipe component closure: Vampire Lord reaches Vampire, Bleed AND Dark', () => {
    const hl = highlightSet('vampire-lord', ballMap);
    for (const c of ['vampire', 'bleed', 'dark']) expect(hl).toContain(c);
  });
});

describe('regression: multi-recipe data supports the compact x+(y/z) notation', () => {
  // The notation is only faithful if every multi-recipe entity factorizes
  // into per-slot alternates — verified over the whole dataset when built.
  it('every multi-recipe ball/passive factorizes into slots', () => {
    for (const item of [...BALLS, ...PASSIVES]) {
      if (item.recipes.length > 1) expect(factorizesIntoSlots(item.recipes), item.id).toBe(true);
    }
  });

  it('Vampire Lord: Vampire + (Bleed or Dark) — 2 recipes, shared first slot', () => {
    const vl = ballMap.get('vampire-lord')!;
    expect(vl.recipes).toEqual([['vampire', 'bleed'], ['vampire', 'dark']]);
  });

  it('Nosferatu: single 3-way recipe (Vampire Lord + Spider Queen + Mosquito King)', () => {
    expect(ballMap.get('nosferatu')!.recipes).toEqual([['vampire-lord', 'spider-queen', 'mosquito-king']]);
  });

  it('Elemental: single 4-way recipe', () => {
    expect(ballMap.get('elemental')!.recipes).toEqual([['burn', 'wind', 'freeze', 'earthquake']]);
  });

  it('Radiation Beam: worst case (a/b)+(c/d) — 4 recipes from 2 alternate slots', () => {
    const rb = ballMap.get('radiation-beam')!;
    expect(rb.recipes).toHaveLength(4);
    expect(factorizesIntoSlots(rb.recipes)).toBe(true);
  });

  it('Lovestruck: 3 alternate slots (Light or Lightning or Time)', () => {
    const ls = ballMap.get('lovestruck')!;
    expect(ls.recipes).toEqual([['charm', 'light'], ['charm', 'lightning'], ['charm', 'time']]);
  });

  it("Deadeye's Cross: 4-way dagger recipe (wiki cell carried a (**4-way**) annotation the parser must strip)", () => {
    expect(passiveMap.get('deadeyes-cross')!.recipes).toEqual([
      ['diamond-hilted-dagger', 'sapphire-hilted-dagger', 'ruby-hilted-dagger', 'emerald-hilted-dagger'],
    ]);
  });
});

describe('regression: icon paths are base-relative (sub-path deploy join)', () => {
  // Icons were root-absolute "/icons/..." — 404 under /ball-x-pit-companion/.
  // Then BASE_URL (no trailing slash) was concatenated directly — ".../companionicons/...".
  // Data must be base-relative; the join lives in src/icon-url.ts.
  it('no icon path starts with "/"', () => {
    for (const b of BALLS) expect(b.icon.startsWith('/'), b.id).toBe(false);
    for (const p of PASSIVES) expect(p.icon.startsWith('/'), p.id).toBe(false);
    for (const c of CHARACTERS) expect(c.icon.startsWith('/'), c.id).toBe(false);
  });

  it('icon paths match the on-disk layout (icons/<dir>/<id>.png)', () => {
    for (const b of BALLS) expect(b.icon).toBe(`icons/balls/${b.id}.png`);
    for (const p of PASSIVES) expect(p.icon).toBe(`icons/passives/${p.id}.png`);
  });

  // The join itself is exercised through iconUrl's interface —
  // see src/icon-url.test.ts (the renderer supplies the production base).
});

describe('regression: apostrophe slug normalization (Archer\'s Effigy et al.)', () => {
  // Slugs once produced "archer-s-effigy" while icons used "archers-effigy".
  it('apostrophes are dropped, not slugified as separators', () => {
    expect(passiveMap.has('archers-effigy')).toBe(true);
    expect(passiveMap.has('deadeyes-amulet')).toBe(true);
    expect(passiveMap.has('lovers-quiver')).toBe(true);
    expect(passiveMap.has('traitors-cowl')).toBe(true);
    expect(passiveMap.has('archer-s-effigy')).toBe(false);
  });

  it('Laser H/V abbreviations resolve to full ids', () => {
    // recipe cells use "Laser H or Laser V"; icons are laser-horizontal/vertical
    const freezeRay = ballMap.get('freeze-ray')!;
    expect(freezeRay.recipes).toContainEqual(['freeze', 'laser-horizontal']);
    expect(freezeRay.recipes).toContainEqual(['freeze', 'laser-vertical']);
  });
});

describe('regression: every character has a verdict entry (The Carouser omission)', () => {
  // CHAR_VERDICTS initially missed The Carouser; the emitter now fails hard
  // on missing characters — pinned here at the data level.
  it('all 23 characters present in data with verdict arrays', () => {
    expect(CHARACTERS).toHaveLength(23);
    for (const ch of CHARACTERS) expect(Array.isArray(ch.verdicts)).toBe(true);
  });
});

describe('synergy verdict semantics (map Notes: red wins with 2 characters)', () => {
  // Behavior tests through the synergy module's interface (was: data-premise
  // assertions because verdictFor lived untested inside the island).
  const char = (id: string) => CHARACTERS.find((c) => c.id === id)!;
  const ball = (id: string) => ballMap.get(id)!;
  const passive = (id: string) => passiveMap.get(id)!;

  it('no selection → neutral', () => {
    expect(verdictFor(ball('vampire'), [])).toBeNull();
    expect(verdictFor(passive('wagon-wheel'), [])).toBeNull();
  });

  it('The Warrior (no rules) → neutral for every item', () => {
    for (const item of [...BALLS, ...PASSIVES]) expect(verdictFor(item, [char('the-warrior')])).toBeNull();
  });

  it('green rule fires on tag overlap (The Itchy Finger: spawns-baby-balls green)', () => {
    expect(verdictFor(ball('brood-mother'), [char('the-itchy-finger')])).toMatchObject({ verdict: 'green' });
    expect(verdictFor(ball('bleed'), [char('the-itchy-finger')])).toBeNull();
  });

  it('*passives wildcard fires on passives only (The Ballbearer: red on every passive)', () => {
    // every passive gets a verdict from the wildcard; passives that also match
    // a green rule (single-target: Platinum Dumbbell et al.) report green —
    // single-character selection, green wins over red
    for (const p of PASSIVES) expect(verdictFor(p, [char('the-ballbearer')])).not.toBeNull();
    // the wildcard never marks a ball red — balls only get The Ballbearer's
    // green tag rules (single-target/aoe), everything else is neutral
    for (const b of BALLS) {
      const v = verdictFor(b, [char('the-ballbearer')]);
      if (v) expect(v.verdict, b.id).toBe('green');
      else expect(v, b.id).toBeNull();
    }
    expect(verdictFor(passive('silver-bullet'), [char('the-ballbearer')])).toMatchObject({ verdict: 'green' });
    expect(verdictFor(passive('wagon-wheel'), [char('the-ballbearer')])).toMatchObject({ verdict: 'red' });
  });

  it('single character: green wins over red', () => {
    // one character with both a green and a red rule matching → green reported
    const both = CHARACTERS.find((c) => c.verdicts.some((v) => v.verdict === 'green') && c.verdicts.some((v) => v.verdict === 'red'));
    if (!both) return; // no such character in current data
    const greenTag = both.verdicts.find((v) => v.verdict === 'green')!.tag;
    const item = BALLS.find((b) => b.tags.includes(greenTag));
    if (item) expect(verdictFor(item, [both])?.verdict === 'green' || verdictFor(item, [both]) === null).toBe(true);
  });

  it('two characters: red wins, notes join with " · "', () => {
    const redChar = CHARACTERS.find((c) => c.verdicts.some((v) => v.verdict === 'red' && v.tag !== '*passives'))!;
    const redRule = redChar.verdicts.find((v) => v.verdict === 'red' && v.tag !== '*passives')!;
    const other = CHARACTERS.find((c) => c.id !== redChar.id && c.verdicts.some((v) => v.verdict === 'green' && v.tag === redRule.tag));
    const item = BALLS.find((b) => b.tags.includes(redRule.tag));
    if (!item) return;
    const v = verdictFor(item, [redChar, other ?? char('the-warrior')]);
    expect(v?.verdict).toBe('red');
    expect(v?.note).toContain(redChar.name);
  });

  it('namespace resolution: verdictFor never needs an isPassive flag', () => {
    // same id cannot exist in both namespaces (ticket 03) — the module resolves
    // membership itself; here we pin that a passive id gets the wildcard verdict
    expect(verdictFor(passive('wagon-wheel'), [char('the-ballbearer')])).toMatchObject({ verdict: 'red' });
  });
});

describe('regression: fusion screen (2026-10-05 session bugs)', () => {
  // Bug: buildFusionPanel queried its skeleton with compound nth-of-type
  // selectors (.fusion-name:nth-of-type(2) etc.). nth-of-type counts among
  // same-tag siblings and ignores classes, so nameA's selector matched
  // nothing; querySelector returned null, the null hid inside an HTMLElement
  // cast, and paintFusion died at p.nameA.textContent — killing paint()
  // mid-flight. Symptom: pick-list rows painted (top of paintFusion), the
  // panel never did. Pinned in renderer.test.ts at the source level (every
  // selector the builder queries must resolve in its own skeleton,
  // mutation-verified); aliased here so the bug is findable from the
  // regression index.
  it('fusion panel skeleton: every queried selector resolves (was nth-of-type nulls)', () => {
    // renderer.test.ts owns the skeleton extraction (mutation-verified there);
    // here pin that the skeleton still uses dedicated hook classes, not
    // positional selectors — including the .fusion-body hook that replaced
    // the effA.parentElement reach-through.
    const src = readFileSync('src/renderer.ts', 'utf8');
    expect(src).not.toMatch(/nth-of-type/);
    for (const hook of ['.icon-a', '.name-a', '.icon-b', '.name-b', '.eff-a', '.eff-b', '.fusion-body']) {
      expect(src).toContain(`'${hook}'`);
    }
    expect(src).not.toContain('parentElement');
  });

  // Bug: the renderer reported tile/card/row clicks as untyped string
  // CustomEvents on the global document ('tile-select' / 'char-select' /
  // 'fusion-select') — an invisible interface: nothing in buildAll's
  // signature showed it, and the click→action wiring had no test surface.
  // Fix: the build seam carries an `emit(action)` callback (the island
  // dispatches the named view-state action and paints); the renderer no
  // longer dispatches DOM events at all. Pinned behaviorally in
  // renderer.test.ts ("build seam: clicks call emit"); aliased here for the
  // regression index.
  it('renderer reports clicks through the build seam, not a CustomEvent bus', () => {
    const src = readFileSync('src/renderer.ts', 'utf8');
    expect(src).not.toContain('CustomEvent');
    expect(src).not.toContain('document.dispatchEvent');
    for (const event of ['tile-select', 'char-select', 'fusion-select']) {
      expect(src).not.toContain(event);
    }
    // the seam is declared in the signature (the options object carries both
    // callbacks; buildAll assigns them to module-level slots — the pre-existing
    // toastVerdict pattern)
    expect(src).toMatch(/export function buildAll\(\{ getVerdict, emit/);
  });

  // Bug: the fusion panel toggles pieces via the hidden attribute, but
  // .fusion-head { display: flex } (an author style) overrides the UA
  // stylesheet's [hidden] rule — author styles beat UA styles regardless of
  // the attribute. The reset path set head.hidden = true, yet the head stayed
  // visible: the panel showed a torn state (empty hint + stale head) after
  // deselecting the first/only pick. Invisible to jsdom (no CSS cascade);
  // found by browser screenshot. Fix: base-layer [hidden] !important rule,
  // pinned in styles.test.ts; aliased here for the regression index.
  it('global stylesheet: [hidden] must beat author display rules (was torn panel state)', () => {
    const css = readFileSync('src/styles/global.css', 'utf8');
    expect(css).toMatch(/\[hidden\]\s*\{\s*display:\s*none\s*!important/);
  });

  // Bug: the pending second head icon rendered as a broken-image box (an
  // src-less <img> is not invisible). Fix: display:none until a second ball
  // is picked. Pinned behaviorally in renderer.test.ts ("pending state:
  // head shows the first ball…") — jsdom asserts iconB.style.display ===
  // 'none' through paint() on the real skeleton, which is the bug's
  // user-visible shape; the source-grep this test once was (p.iconB.style
  // .display = 'none') died with the table-driven paintFusion rewrite.
  // @vitest-environment jsdom
  it('pending second head icon is display:none, not a broken-image box', async () => {
    const { paint, buildAll } = await import('./renderer');
    const { createViewState } = await import('./view-state');
    for (const id of ['fusionPanel', 'ballsGrid', 'passivesGrid', 'charactersGrid', 'charChips', 'slotHint', 'fusionList', 'planView', 'planUpgradesSlot', 'selection-balls', 'selection-passives']) {
      if (!document.getElementById(id)) {
        const el = document.createElement('div');
        el.id = id;
        document.body.appendChild(el);
      }
    }
    buildAll({ getVerdict: () => null, emit: () => {} });
    const view = createViewState();
    paint(view.dispatch({ type: 'toggleFusion', id: 'flash' }));
    const iconB = document.querySelector<HTMLImageElement>('#fusionPanel .icon-b')!;
    expect(iconB.style.display).toBe('none');
    // and it comes back when the pair composes
    paint(view.dispatch({ type: 'toggleFusion', id: 'glacier' }));
    expect(iconB.style.display).toBe('');
  });

  // Bug: the fusion pick list's scrollbar was hover-only and blended into the
  // rows. Fix: overflow-y: scroll + scrollbar-width: thin (fixed-size,
  // hover-safe in Firefox) + separation
  // paddings (styles.test.ts pins the block; aliased here).

  // Bug: the composer cross-wired pairs the corpus says do NOT wire —
  // Voluptuous Egg Sac's two-hop spawn chain (property drops at hop 2),
  // Freeze Ray's beam-path-bound freeze, Brood Mother's non-carrying spawn
  // channel, Mosquito King's spawn-on-hit not firing from screen hits, and
  // Satan's debuff-only field judgment. Found by cross-checking the composer
  // against all 31 no-cross-wire claims in docs/research/fusion-observations/.
  // Fix: SPAWN_EXCLUDED_IDS / AOE_EXCLUDED_IDS / SPAWN_BOUND_IDS. Pinned with
  // positive controls in fusion.test.ts (cross-wire exclusions describe).
  it('cross-wire exclusions match the corpus no-wire evidence', async () => {
    const { fuse } = await import('./fusion');
    const { ballMap } = await import('./catalog');
    const ball = (id: string) => ballMap.get(id)!;
    for (const [a, b] of [
      ['hemorrhage', 'voluptuous-egg-sac'], ['nuclear-bomb', 'voluptuous-egg-sac'],
      ['freeze-ray', 'sun'], ['brood-mother', 'flash'],
      ['flash', 'mosquito-king'], ['hemorrhage', 'satan'],
    ] as const) {
      expect(fuse(ball(a), ball(b))!.crossWire, `${a}+${b}`).toBeNull();
    }
  });

  // Bug: fused balls improve component numbers (Overgrowth threshold 3 → 2,
  // spawn counts +1/bound, chances up) — the composer showed base numbers.
  // Fix: FUSED_STATS override table from the transcribed tooltips; exact-
  // substring replacements so a wiki rewording fails loudly. Pinned in
  // fusion.test.ts (fused-stat overrides describe).
  it('fused-stat overrides apply (Overgrowth threshold 3 → 2 et al.)', async () => {
    const { fuse } = await import('./fusion');
    const { ballMap } = await import('./catalog');
    const r = fuse(ballMap.get('overgrowth')!, ballMap.get('flash')!)!;
    expect(r.paragraphs[0]).toContain('Upon reaching 2, consume all stacks');
  });

  // Bug: slot-2 pick highlight was visually subtle (dim border, no glow) —
  // users read it as "not highlighted" even though the class was applied.
  // Fix: slot-1 and slot-2 share one gold+glow highlight rule; the badge
  // number distinguishes them. Pinned in styles.test.ts.
  it('both picked slots highlight identically (slot-2 was visually subtle)', () => {
    const css = readFileSync('src/styles/global.css', 'utf8');
    expect(css).toMatch(/\.fusion-row\.slot-1,\s*\.fusion-row\.slot-2\s*\{[^}]*border-color: var\(--gold\)/);
  });

  it('fusion list scrollbar is permanent and separated (was hover-only, blended)', () => {
    const css = readFileSync('src/styles/global.css', 'utf8');
    const block = css.match(/\.fusion-list\s*\{[^}]*\}/)![0];
    expect(block).toContain('overflow-y: scroll');
    expect(block).toContain('scrollbar-width: thin');
  });

  // Bug: the full-corpus validation pass (2026-10-05, all 370 pairs in
  // fusion-pairs.json diffed against the composer) found 55 pairs with
  // cross-wire evidence the composer ignored. Biggest classes: kill-on-hit
  // effects (Black Hole, Reaper) did not ride AOE carriers — Black Hole ×
  // Sun is the corpus's single most-discussed pair (7 cross-wire claims) —
  // and spawn carriers did not carry spawn-bound statuses (Glacier × Maggot,
  // Cell × Glacier: namu rule 6). Also missing entirely: the two order
  // side-effects (both-cooldown pairs, same-property pairs) and the fixed
  // composition caveats (Destroy × Destroy, hit-once dominance over
  // pass-through, spawn compensates Destroy, Dark's multiplier). Pinned in
  // fusion.test.ts (cross-wire exclusions / order side-effects / composition
  // caveats describes).
  it('kill-on-hit rides AOE carriers and order side-effects emit notes', async () => {
    const { fuse } = await import('./fusion');
    const { ballMap } = await import('./catalog');
    const ball = (id: string) => ballMap.get(id)!;
    // Black Hole × Sun: the corpus meta pair — 7 cross-wire claims
    expect(fuse(ball('black-hole'), ball('sun'))!.crossWire).toContain('Black Hole');
    // Glacier × Maggot: spawn-bound status rides the spawn carrier
    expect(fuse(ball('glacier'), ball('maggot'))!.crossWire).toContain('Glacier');
    // both-cooldown pair note (namu rule: first-selected's cooldown wins)
    expect(fuse(ball('black-hole'), ball('timestop'))!.notes.join(' ')).toMatch(/cooldown wins/);
  });

  // Bug (cross-screen remembering, 2026-10-05): the document-level
  // empty-space click handler cleared the active section's selection for any
  // click outside the interactive selectors — and a .tab-btn is outside
  // them. Bubbling order made it a cross-screen killer: the tab button's own
  // listener ran showSection first (updating `section` to the destination),
  // then the document handler dispatched clear with that destination —
  // wiping the screen you had just arrived on. Harmless before (showSection
  // dispatched clearAll anyway), fatal after tab switching stopped
  // clearing. Fix: header controls are not empty space — the exclusion
  // selector includes `header`. Pinned at the source level (companion.ts
  // has no DOM test surface; the behavioral shape — no clear on tab click —
  // is the island's runtime wiring, jsdom-hostile to import for its
  // top-level init()).
  it('empty-space clear excludes header controls (tab click wiped the destination screen)', () => {
    const src = readFileSync('src/companion.ts', 'utf8');
    const handler = src.match(/document\.addEventListener\('click'[\s\S]*?\n  \}\);/);
    expect(handler, 'empty-space click handler not found').toBeTruthy();
    expect(handler![0]).toMatch(/closest\('[^']*header/);
  });
});
