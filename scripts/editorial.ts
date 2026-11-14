// The site's editorial synergy model — the one module where the tag
// vocabulary, per-entity tag assignments, and per-character verdict rules are
// set, plus validateEditorial, its one invariant list. These are content
// decisions, not game data (see docs/research/game-mechanics.md §4);
// emit-data.ts only serializes them.

export interface VerdictRule {
  tag: string;
  verdict: 'red' | 'green';
  note?: string;
}

export interface EditorialMaps {
  TAGS: Record<string, string>;
  BALL_TAGS: Record<string, string[]>;
  PASSIVE_TAGS: Record<string, string[]>;
  CHAR_VERDICTS: Record<string, VerdictRule[]>;
}

/** The wildcard verdict tag that matches every passive (The Ballbearer). */
export const WILDCARD = '*passives';

// ---- tag vocabulary (fact base §4) ----
export const TAGS: Record<string, string> = {
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
export const BALL_TAGS: Record<string, string[]> = {
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
  // Risen Ballbylon balls: placeholder coverage so the generated-data pipeline
  // can emit. The editorial tag model for these lands in its own pass; empty
  // arrays are a valid interim state (neutral synergy).
  'ash': [],
  'beast': [],
  'bullet': [],
  'force': [],
  'fruit': [],
  'gale': [],
  'hedgehog': [],
  'ironwood': [],
  'ivy': [],
  'kaiju': [],
  'misfortune': [],
  'mudslide': [],
  'rot': [],
  'siren': [],
  'stalagmite': [],
  'steam': [],
  'thunderbird': [],
  'tsunami': [],
  'water': [],
  'water-bug': [],
  'waterfall': [],
  'werewolf': [],
  'wolfpack': [],
  'wood': [],
};

export const PASSIVE_TAGS: Record<string, string[]> = {
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
  // Risen Ballbylon passives: placeholder coverage so the generated-data
  // pipeline can emit. The editorial tag model for these lands in its own
  // pass; empty arrays are a valid interim state (neutral synergy).
  'ancient-ladle': [],
  'bent-spyglass': [],
  'charged-bracelet': [],
  'cracked-cinderblock': [],
  'crystal-decanter': [],
  'eldritch-gauntlet': [],
  'fractured-boulder': [],
  'goniometer': [],
  'hand-drill': [],
  'hand-me-downs': [],
  'jugglers-club': [],
  'kris-knife': [],
  'kunai': [],
  'lucky-coin': [],
  'refracting-glass': [],
  'rusted-blade': [],
  'silver-revolver': [],
  'spiked-discipline': [],
  'steel-bulwark': [],
  'teardrop-necklace': [],
  'test-tube': [],
  'unkempt-cradle': [],
  'wrapped-explosive': [],
  'baby-armor': [],
  'blood-kunai': [],
  'charged-bow': [],
  'cradle-of-filth': [],
  'eldritch-dagger': [],
  'eyeless-spyglass': [],
  'handheld-rupture': [],
  'jugglers-wheel': [],
  'levitating-rock': [],
  'liquid-flame': [],
  'mystic-dipper': [],
  'peacemaker': [],
  'reachers-drill': [],
  'refracted-echo': [],
  'relentless-whip': [],
  'sands-of-time': [],
  'shadow-blade': [],
  'spiked-shield': [],
  'teardrop-dagger': [],
  'tilted-dagger': [],
  'vampires-kiss': [],
  'volatile-explosive': [],
};

// ---- per-character verdict rules (fact base §4; editorial, not playtested) ----
export const CHAR_VERDICTS: Record<string, VerdictRule[]> = {
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
  // Risen Ballbylon characters: placeholder coverage so the generated-data
  // pipeline can emit. The verdict model for these lands in its own pass;
  // empty arrays are a valid interim state (neutral synergy).
  'the-conduit': [],
  'the-potager': [],
  'the-recollector': [],
  'the-right-hand-man': [],
  'the-scandalmonger': [],
  'the-scrupulous-scoundrel': [],
  'the-sentinel': [],
  'the-wallbreaker': [],
};

export const EDITORIAL: EditorialMaps = { TAGS, BALL_TAGS, PASSIVE_TAGS, CHAR_VERDICTS };

/** The entity ids the editorial maps must cover, one namespace per map. */
export interface EditorialEntityIds {
  balls: Iterable<string>;
  passives: Iterable<string>;
  characters: Iterable<string>;
}

/**
 * The editorial model's one invariant list. Returns human-readable findings;
 * an empty array means the model is valid. The contract is bidirectional:
 * every entity has an entry, and every entry resolves to an entity. Shared by
 * validateGenerated (the emit CLI's path) and src/data.test.ts.
 */
export function validateEditorial(editorial: EditorialMaps, ids: EditorialEntityIds): string[] {
  const findings: string[] = [];
  const vocab = new Set(Object.keys(editorial.TAGS));
  const ballIds = new Set(ids.balls);
  const passiveIds = new Set(ids.passives);
  const charIds = new Set(ids.characters);

  const checkCoverage = (
    kind: 'ball' | 'passive' | 'character',
    entityIds: Set<string>,
    entries: Record<string, unknown>,
    missing: string,
  ): void => {
    for (const id of entityIds) if (!Object.hasOwn(entries, id)) findings.push(`${kind} missing ${missing}: ${id}`);
    for (const key of Object.keys(entries)) if (!entityIds.has(key)) findings.push(`${kind} ${missing} for unknown id: ${key}`);
  };

  checkCoverage('ball', ballIds, editorial.BALL_TAGS, 'tags');
  checkCoverage('passive', passiveIds, editorial.PASSIVE_TAGS, 'tags');
  checkCoverage('character', charIds, editorial.CHAR_VERDICTS, 'verdicts');

  // tag lists use the vocabulary; the wildcard is a verdict-only tag
  for (const [kind, entries] of [
    ['ball', editorial.BALL_TAGS],
    ['passive', editorial.PASSIVE_TAGS],
  ] as const) {
    for (const [id, tags] of Object.entries(entries)) {
      for (const tag of tags) {
        if (tag === WILDCARD) findings.push(`${kind} ${id}: wildcard ${WILDCARD} is only valid in character verdicts`);
        else if (!vocab.has(tag)) findings.push(`${kind} ${id}: unknown tag ${tag}`);
      }
    }
  }

  // verdict rules: vocabulary, valid verdict, a note, and no duplicate or
  // contradictory rule for the same tag; the wildcard is used at most once
  let wildcardUses = 0;
  for (const [id, rules] of Object.entries(editorial.CHAR_VERDICTS)) {
    const seen = new Map<string, VerdictRule['verdict']>();
    for (const rule of rules) {
      if (rule.tag === WILDCARD) wildcardUses++;
      else if (!vocab.has(rule.tag)) findings.push(`character ${id}: unknown tag ${rule.tag}`);
      if (rule.verdict !== 'red' && rule.verdict !== 'green') findings.push(`character ${id}: invalid verdict ${rule.verdict}`);
      if (!rule.note?.trim()) findings.push(`character ${id}: rule for tag ${rule.tag} has no note`);
      const previous = seen.get(rule.tag);
      if (previous === undefined) seen.set(rule.tag, rule.verdict);
      else if (previous !== rule.verdict) findings.push(`character ${id}: contradictory verdicts for tag ${rule.tag}`);
      else findings.push(`character ${id}: duplicate rule for tag ${rule.tag}`);
    }
  }
  if (wildcardUses > 1) findings.push(`wildcard ${WILDCARD} is used ${wildcardUses} times; it must be unique`);

  return [...new Set(findings)];
}
