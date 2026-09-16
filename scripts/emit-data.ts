#!/usr/bin/env node
/**
 * Emits src/data/{tags,balls,passives,characters}.ts from parsed.json
 * (produced by parse-wiki.ts) + the tag/verdict assignments below,
 * which come from section 4 of docs/research/game-mechanics.md
 * (editorial model — see ticket 02/03 answers).
 * Run: node --experimental-strip-types scripts/emit-data.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { slug } from './slug.ts';

const parsed = JSON.parse(readFileSync(new URL('../src/data/parsed.json', import.meta.url), 'utf8'));

// ---- tag vocabulary (fact base §4) ----
const TAGS = {
  'aoe': 'Damages multiple enemies / area damage',
  'single-target': 'Pure single-hit damage, no area or status',
  'spawns-baby-balls': 'Creates baby balls',
  'spawns-allies': 'Spawns summons / friendly units',
  'status-effect': 'Applies status effects (poison, burn, freeze, curse, …)',
  'pass-through': 'Pierces enemies',
  'destroy-on-hit': 'Ball is consumed on hit',
  'lifesteal': 'Heals the player',
  'self-damage': 'Costs player health',
  'ball-speed': 'Scales ball speed',
  'bounce-scaling': 'Scales with bounces',
  'crit': 'Critical chance / damage',
  'wall-bounce': 'Interacts with walls',
  'baby-ball-scaling': 'Scales off baby-ball count',
  'screen-clear': 'Full-screen effect',
  'clone': 'Spawns clones of the ball',
  'friendly-fire-risk': 'Can hurt player allies / ally mechanics',
};

// ---- tag assignments ----
// Keyed by entity id; values are tag lists. Derived from the on-hit/status
// columns of the wiki tables (fact base §1/§2) and the example carriers in §4.
const BALL_TAGS = {
  // base balls
  'bleed': ['status-effect'],
  'brood-mother': ['spawns-baby-balls'],
  'burn': ['status-effect'],
  'cell': ['clone', 'spawns-allies'],
  'charm': ['status-effect'],
  'dark': ['single-target', 'destroy-on-hit'],
  'earthquake': ['aoe'],
  'egg-sac': ['destroy-on-hit', 'spawns-baby-balls'],
  'flesh': ['ball-speed'],
  'freeze': ['status-effect'],
  'ghost': ['pass-through'],
  'iron': ['single-target'],
  'laser-horizontal': ['aoe'],
  'laser-vertical': ['aoe'],
  'light': ['status-effect'],
  'lightning': ['aoe'],
  'poison': ['status-effect'],
  'stone': ['single-target'],
  'time': ['destroy-on-hit', 'status-effect'],
  'vampire': ['lifesteal'],
  'wind': ['pass-through', 'status-effect'],
  'baby-ball': [],
  // evolved / tier-3 balls
  'armageddon': ['aoe', 'destroy-on-hit'],
  'assassin': ['single-target', 'pass-through'],
  'banished-flame': ['status-effect'],
  'banshee': ['status-effect'],
  'berserk': ['status-effect'],
  'black-hole': ['destroy-on-hit', 'screen-clear'],
  'blizzard': ['aoe', 'status-effect'],
  'bomb': ['aoe', 'destroy-on-hit'],
  'brimstone': ['aoe', 'status-effect'],
  'catapult': ['spawns-baby-balls'],
  'drill': ['pass-through', 'single-target'],
  'elemental': ['aoe', 'status-effect'],
  'erosion': ['pass-through'],
  'fireworks': ['destroy-on-hit', 'spawns-baby-balls', 'status-effect'],
  'flash': ['aoe', 'screen-clear', 'status-effect'],
  'flesh-mound': ['spawns-baby-balls'],
  'flicker': ['aoe', 'screen-clear'],
  'freeze-ray': ['status-effect', 'aoe'],
  'frozen-flame': ['status-effect'],
  'glacier': ['aoe', 'status-effect'],
  'heart-swallower': ['lifesteal', 'status-effect'],
  'hemorrhage': ['status-effect'],
  'holy-laser': ['aoe'],
  'incubus': ['status-effect'],
  'inferno': ['aoe', 'status-effect'],
  'landslide': ['aoe', 'destroy-on-hit'],
  'laser-beam': ['aoe', 'status-effect'],
  'laser-cutter': ['aoe'],
  'leech': ['status-effect'],
  'lightning-bug': ['spawns-allies', 'aoe'],
  'lightning-rod': ['aoe', 'status-effect'],
  'lovestruck': ['status-effect', 'lifesteal'],
  'maggot': ['status-effect', 'spawns-baby-balls'],
  'magma': ['aoe', 'status-effect'],
  'mosquito-king': ['spawns-allies', 'lifesteal'],
  'mosquito-kingdom': ['spawns-allies', 'lifesteal'],
  'mosquito-swarm': ['destroy-on-hit', 'spawns-allies', 'lifesteal'],
  'nosferatu': ['spawns-allies'],
  'noxious': ['pass-through', 'status-effect'],
  'nuclear-bomb': ['aoe', 'destroy-on-hit', 'screen-clear', 'status-effect'],
  'offspring': ['clone'],
  'overgrowth': ['aoe', 'status-effect'],
  'petrify': ['status-effect', 'aoe'],
  'phantom': ['status-effect'],
  'radiation-beam': ['aoe', 'status-effect'],
  'reaper': ['screen-clear', 'lifesteal'],
  'sacrifice': ['status-effect'],
  'sandstorm': ['pass-through', 'aoe', 'status-effect'],
  'satan': ['aoe', 'status-effect'],
  'shotgun': ['spawns-baby-balls'],
  'sniper': ['pass-through', 'spawns-baby-balls'],
  'soul-sucker': ['pass-through', 'lifesteal', 'status-effect'],
  'spider-queen': ['spawns-baby-balls'],
  'steel': ['single-target', 'bounce-scaling'],
  'storm': ['aoe'],
  'succubus': ['status-effect', 'lifesteal'],
  'sun': ['screen-clear', 'aoe', 'status-effect'],
  'swamp': ['aoe', 'status-effect'],
  'time-bomb': ['aoe', 'status-effect'],
  'timestop': ['screen-clear', 'status-effect', 'destroy-on-hit'],
  'tumor': ['status-effect'],
  'vampire-lord': ['status-effect', 'lifesteal'],
  'venom': ['status-effect'],
  'virus': ['status-effect'],
  'voluptuous-egg-sac': ['destroy-on-hit', 'spawns-baby-balls'],
  'warp': ['ball-speed'],
  'wraith': ['pass-through', 'status-effect'],
  'x-ray': ['aoe', 'status-effect'],
  'zombie': ['spawns-allies', 'status-effect'],
};

const PASSIVE_TAGS = {
  // base passives
  'archers-effigy': ['spawns-allies'],
  'artificial-heart': [],
  'baby-rattle': ['spawns-baby-balls'],
  'bandage-roll': ['spawns-baby-balls', 'lifesteal'],
  'bottled-tornado': ['spawns-baby-balls'],
  'breastplate': [],
  'crown-of-thorns': ['aoe'],
  'cursed-elixir': ['spawns-allies', 'status-effect'],
  'deadeyes-amulet': ['crit'],
  'diamond-hilted-dagger': ['crit'],
  'dynamite': ['aoe'],
  'emerald-hilted-dagger': ['crit'],
  'ethereal-cloak': ['pass-through'],
  'everflowing-goblet': ['lifesteal'],
  'eye-of-the-beholder': [],
  'fleet-feet': ['ball-speed'],
  'frozen-spike': ['aoe', 'status-effect'],
  'gemspring': [],
  'ghostly-corset': ['pass-through'],
  'ghostly-shield': ['lifesteal'],
  'golden-bull': ['spawns-allies'],
  'hand-fan': ['status-effect'],
  'hand-mirror': [],
  'healers-effigy': ['spawns-allies', 'lifesteal'],
  'hourglass': ['bounce-scaling'],
  'iron-onesie': ['baby-ball-scaling'],
  'kiss-of-death': ['status-effect'],
  'lovers-quiver': ['lifesteal'],
  'magic-staff': ['aoe'],
  'magnet': [],
  'midnight-oil': ['status-effect'],
  'platinum-dumbbell': ['single-target'],
  'pressure-valve': ['aoe'],
  'protective-charm': [],
  'radiant-feather': ['ball-speed'],
  'reachers-spear': ['crit'],
  'rubber-headband': ['ball-speed', 'bounce-scaling'],
  'ruby-hilted-dagger': ['crit'],
  'sapphire-hilted-dagger': ['crit'],
  'shortbow': [],
  'silver-blindfold': ['crit'],
  'silver-bullet': ['single-target'],
  'slingshot': ['spawns-baby-balls'],
  'spiked-collar': ['single-target'],
  'stone-effigy': ['spawns-allies'],
  'sword-breaker': ['single-target'],
  'traitors-cowl': ['friendly-fire-risk', 'lifesteal'],
  'turret': ['spawns-baby-balls'],
  'upturned-hatchet': ['wall-bounce'],
  'vampiric-sword': ['lifesteal', 'self-damage'],
  'voodoo-doll': ['status-effect'],
  'wagon-wheel': ['wall-bounce'],
  'war-horn': ['baby-ball-scaling'],
  'wretched-onion': ['aoe'],
  // evolved passives
  'ardent-tire': ['ball-speed', 'bounce-scaling'],
  'argent-stopwatch': ['bounce-scaling'],
  'arrow-of-fate': ['lifesteal', 'spawns-baby-balls'],
  'cornucopia': ['spawns-baby-balls'],
  'deadeyes-cross': ['crit'],
  'deadeyes-impaler': ['crit'],
  'full-metal-rapier': ['baby-ball-scaling'],
  'gracious-impaler': ['crit'],
  'grotesque-artillery': ['spawns-baby-balls'],
  'inglorious-hammer': ['wall-bounce'],
  'odiferous-shell': [],
  'phantom-regalia': ['pass-through'],
  'remote-detonator': ['spawns-baby-balls', 'aoe'],
  'soul-reaver': ['lifesteal'],
  'tormenters-mask': [],
  'windweaver': ['spawns-baby-balls', 'ball-speed'],
  'wings-of-the-anointed': ['ball-speed'],
};

// ---- per-character verdict rules (fact base §4; editorial, not playtested) ----
const CHAR_VERDICTS = {
  'the-warrior': [],
  'the-itchy-finger': [
    { tag: 'spawns-baby-balls', verdict: 'green', note: 'More shots per second' },
    { tag: 'single-target', verdict: 'red', note: 'Scattered aim degrades aimed single-target play' },
  ],
  'the-repentant': [
    { tag: 'bounce-scaling', verdict: 'green', note: 'Balls gain +5% damage per bounce and return from the back wall' },
    { tag: 'destroy-on-hit', verdict: 'red', note: 'No bounces to scale' },
  ],
  'the-cohabitants': [
    { tag: 'aoe', verdict: 'green', note: 'Each ball is mirrored — double area coverage' },
    { tag: 'spawns-baby-balls', verdict: 'green', note: 'Mirrored copies double spawns' },
    { tag: 'spawns-allies', verdict: 'green', note: 'Mirrored copies double spawns' },
    { tag: 'single-target', verdict: 'red', note: 'Balls deal half damage' },
  ],
  'the-cogitator': [],
  'the-carouser': [],
  'the-embedded': [
    { tag: 'pass-through', verdict: 'green', note: 'Balls always pierce until they hit a wall' },
    { tag: 'status-effect', verdict: 'green', note: 'Piercing spreads status effects across the field' },
    { tag: 'wall-bounce', verdict: 'red', note: 'Balls never bounce off enemies on the way' },
  ],
  'the-shade': [
    { tag: 'crit', verdict: 'green', note: 'Base crit chance 10%; backstabs reward Assassin line' },
    { tag: 'single-target', verdict: 'green', note: 'Backstab synergy' },
  ],
  'the-shieldbearer': [
    { tag: 'destroy-on-hit', verdict: 'green', note: 'Shield bounces balls back — destroy-on-hit still gets recycled value' },
  ],
  'the-spendthrift': [
    { tag: 'aoe', verdict: 'green', note: 'Wide-arc volley covers the field' },
  ],
  'the-juggler': [
    { tag: 'aoe', verdict: 'green', note: 'Aimed landing rewards area damage' },
    { tag: 'bounce-scaling', verdict: 'red', note: 'No bouncing until landing' },
  ],
  'the-empty-nester': [
    { tag: 'single-target', verdict: 'green', note: 'Multiple instances of one special ball per shot' },
    { tag: 'aoe', verdict: 'green', note: 'Multi-shot of one special ball' },
    { tag: 'spawns-baby-balls', verdict: 'red', note: 'No baby balls' },
    { tag: 'baby-ball-scaling', verdict: 'red', note: 'No baby balls to scale off' },
  ],
  'the-flagellant': [
    { tag: 'spawns-baby-balls', verdict: 'green', note: 'Balls stay in play longer off the bottom bounce' },
  ],
  'the-makeshift-sisyphus': [
    { tag: 'aoe', verdict: 'green', note: 'AOE and status damage ×4' },
    { tag: 'status-effect', verdict: 'green', note: 'Status damage ×4' },
    { tag: 'single-target', verdict: 'red', note: 'No direct hit damage' },
    { tag: 'spawns-baby-balls', verdict: 'red', note: 'No baby balls' },
    { tag: 'baby-ball-scaling', verdict: 'red', note: 'No baby balls to scale off' },
  ],
  'the-physicist': [],
  'the-tactician': [],
  'the-radical': [],
  'the-falconer': [
    { tag: 'aoe', verdict: 'green', note: 'Two side lanes cover the field' },
  ],
  'the-tunneller': [
    { tag: 'aoe', verdict: 'green', note: 'Vertical wrap keeps balls on the field' },
  ],
  'the-tiptoer': [
    { tag: 'single-target', verdict: 'green', note: 'Stealth keeps you safe while picking targets' },
  ],
  'the-hoary-hoarder': [
    { tag: 'status-effect', verdict: 'green', note: 'Passive-heavy build' },
    { tag: 'crit', verdict: 'green', note: 'Passive-heavy build' },
    { tag: 'spawns-baby-balls', verdict: 'red', note: 'Only 2 ball slots — uncertain, needs playtesting' },
  ],
  'the-ballbearer': [
    { tag: 'single-target', verdict: 'green', note: 'Twice as many ball slots' },
    { tag: 'aoe', verdict: 'green', note: 'Twice as many ball slots' },
    { tag: '*passives', verdict: 'red', note: 'No passive slots — every passive is dead weight' },
  ],
  'the-false-messiah': [],
};

// ---- emit ----
const ts = (body) => body + '\n';

const tagsTs = ts(`// Synergy tag vocabulary — the site's own editorial model (see
// docs/research/game-mechanics.md §4). Characters carry verdict rules over
// these tags; indicators render from tag overlap.
export const TAGS: Record<string, string> = ${JSON.stringify(TAGS, null, 2)};
`);

const ballsTs = ts(`// Ball data from ballxpit.wiki.gg (2026-09-13, game v1.301) — effect text
// verbatim. recipes: OR-of-ANDs of component ids. depth: 0 = basic,
// 1 = evolved (level-2), 2 = tier-3. Tags are the site's editorial synergy
// model, not game data.
export interface Ball {
  id: string;
  name: string;
  depth: 0 | 1 | 2;
  effects: string;
  recipes: string[][];
  onHit: string;
  icon: string;
  tags: string[];
}

export const BALLS: Ball[] = ${JSON.stringify(
  parsed.balls.map((b) => ({
    id: slug(b.name),
    name: b.name,
    depth: b.depth,
    effects: b.effect,
    recipes: b.recipes,
    onHit: b.onhit,
    icon: `icons/balls/${slug(b.name)}.png`, // prefix with import.meta.env.BASE_URL at runtime
    tags: BALL_TAGS[slug(b.name)] ?? [],
  })), null, 2)};
`);

const passivesTs = ts(`// Passive data from ballxpit.wiki.gg (2026-09-13) — effect text verbatim.
// Same shape as Ball; own id namespace. Ball and passive graphs never
// cross-reference.
export interface Passive {
  id: string;
  name: string;
  depth: 0 | 1 | 2;
  effects: string;
  recipes: string[][];
  icon: string;
  tags: string[];
}

export const PASSIVES: Passive[] = ${JSON.stringify(
  parsed.passives.map((p) => ({
    id: slug(p.name),
    name: p.name,
    depth: p.depth,
    effects: p.effect,
    recipes: p.recipes,
    icon: `icons/passives/${slug(p.name)}.png`, // prefix with import.meta.env.BASE_URL at runtime
    tags: PASSIVE_TAGS[slug(p.name)] ?? [],
  })), null, 2)};
`);

const charactersTs = ts(`// Character data from ballxpit.wiki.gg (2026-09-13). Verdict rules are the
// site's editorial synergy model derived from quirk text — not playtested
// (flagged in docs/research/game-mechanics.md). Unlisted tags are neutral.
// The wildcard tag "*passives" matches every passive (The Ballbearer).
export interface VerdictRule {
  tag: string;
  verdict: 'red' | 'green';
  note?: string;
}

export interface Character {
  id: string;
  name: string;
  baseBallId: string | null;
  quirk: string;
  icon: string;
  sprite: string;
  verdicts: VerdictRule[];
}

export const CHARACTERS: Character[] = ${JSON.stringify(
  parsed.characters.map((c) => ({
    id: slug(c.name),
    name: c.name,
    baseBallId: c.baseBall === null ? null : slug(c.baseBall),
    quirk: c.quirk,
    icon: `icons/character-portraits/${slug(c.name)}.png`, // prefix with import.meta.env.BASE_URL at runtime
    sprite: `icons/character-sprites/${slug(c.name)}.png`,
    verdicts: CHAR_VERDICTS[slug(c.name)] ?? [],
  })), null, 2)};
`);

writeFileSync(new URL('../src/data/tags.ts', import.meta.url), tagsTs);
writeFileSync(new URL('../src/data/balls.ts', import.meta.url), ballsTs);
writeFileSync(new URL('../src/data/passives.ts', import.meta.url), passivesTs);
writeFileSync(new URL('../src/data/characters.ts', import.meta.url), charactersTs);

// ---- validation ----
const ballIds = new Set(parsed.balls.map((b) => slug(b.name)));
const pasIds = new Set(parsed.passives.map((p) => slug(p.name)));
let errs = 0;
for (const b of parsed.balls)
  for (const r of b.recipes)
    for (const c of r)
      if (!ballIds.has(c)) { console.error(`ball ${b.name}: unresolved component ${c}`); errs++; }
for (const p of parsed.passives)
  for (const r of p.recipes)
    for (const c of r)
      if (!pasIds.has(c)) { console.error(`passive ${p.name}: unresolved component ${c}`); errs++; }
const vocab = new Set(Object.keys(TAGS));
for (const [id, tags] of Object.entries(BALL_TAGS))
  for (const t of tags) if (!vocab.has(t)) { console.error(`ball ${id}: unknown tag ${t}`); errs++; }
for (const [id, tags] of Object.entries(PASSIVE_TAGS))
  for (const t of tags) if (!vocab.has(t)) { console.error(`passive ${id}: unknown tag ${t}`); errs++; }
for (const [id, rules] of Object.entries(CHAR_VERDICTS))
  for (const r of rules)
    if (!vocab.has(r.tag) && r.tag !== '*passives') { console.error(`character ${id}: unknown tag ${r.tag}`); errs++; }
for (const c of parsed.characters) {
  const id = slug(c.name);
  if (!(id in CHAR_VERDICTS)) { console.error(`character missing verdicts: ${id}`); errs++; }
  if (c.baseBall !== null && !ballIds.has(slug(c.baseBall))) { console.error(`character ${id}: unresolved base ball ${c.baseBall}`); errs++; }
}
// every entity must have a tag entry
for (const b of parsed.balls) if (!(slug(b.name) in BALL_TAGS)) { console.error(`ball missing tags: ${b.name}`); errs++; }
for (const p of parsed.passives) if (!(slug(p.name) in PASSIVE_TAGS)) { console.error(`passive missing tags: ${p.name}`); errs++; }

if (errs) { console.error(`${errs} error(s)`); process.exit(1); }
console.log('emitted tags.ts, balls.ts, passives.ts, characters.ts — all checks pass');
