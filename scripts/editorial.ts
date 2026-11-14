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
// Alphabetical, 30 entries. `direct-damage` was `single-target` before the
// Risen Ballbylon vocabulary review; `playfield-loop` (loops around the
// field) is distinct from `orbit` (circles the player/cursor).
export const TAGS: Record<string, string> = {
  'aim-direction': 'Effect depends on the direction the player is aiming',
  'aoe': 'Damages multiple enemies / area damage',
  'attach': 'Ball sticks to an enemy and deals damage over time until it dies',
  'baby-ball-scaling': 'Scales off baby-ball count',
  'backstab': 'Bonus damage/crit when hitting an enemy from behind or the flank',
  'ball-speed': 'Scales ball speed',
  'bounce-scaling': 'Scales with bounces',
  'clone': 'Spawns clones of the ball',
  'crit': 'Critical chance / damage',
  'destroy-on-hit': 'Ball is consumed on hit',
  'diagonal': 'Bounce angle is constrained to / rewarded for perfect diagonals',
  'direct-damage': 'Direct damage — focused single-hit damage, no area or status',
  'field': 'Leaves a persistent damaging zone or trail on the ground',
  'friendly-fire-risk': 'Can hurt player allies / ally mechanics',
  'fused-ball': 'Interacts with the fused/combined ball',
  'knock-up': 'Launches enemies into the air, letting balls pass under them',
  'lifesteal': 'Heals the player',
  'orbit': 'Ball orbits the player or aim cursor',
  'pass-through': 'Pierces enemies',
  'playfield-loop': 'Ball loops around the playfield; effects trigger each loop',
  'return-trajectory': 'Ball returns toward the player/cursor; bonuses apply on the return leg',
  'screen-clear': 'Full-screen effect',
  'self-damage': 'Costs player health',
  'shield': "Modifies or interacts with the player's shield",
  'spawns-allies': 'Spawns summons / friendly units',
  'spawns-baby-balls': 'Creates baby balls',
  'status-effect': 'Applies status effects (poison, burn, freeze, curse, …)',
  'status-scaling': 'Scales status-effect damage (amplifies statuses; does not apply them)',
  'teleport': 'Ball teleports/warps across the field',
  'wall-bounce': 'Interacts with walls',
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
  'dark': ['direct-damage', 'destroy-on-hit'],
  'earthquake': ['aoe'],
  'egg-sac': ['destroy-on-hit', 'spawns-baby-balls'],
  'flesh': ['ball-speed'],
  'freeze': ['status-effect'],
  'ghost': ['pass-through'],
  'iron': ['direct-damage'],
  'laser-horizontal': ['aoe'],
  'laser-vertical': ['aoe'],
  'light': ['status-effect'],
  'lightning': ['aoe'],
  'poison': ['status-effect'],
  'stone': ['direct-damage'],
  'time': ['destroy-on-hit', 'status-effect'],
  'vampire': ['lifesteal'],
  'wind': ['pass-through', 'status-effect'],
  'baby-ball': [],
  // evolved / tier-3 balls
  'armageddon': ['aoe', 'destroy-on-hit'],
  'assassin': ['direct-damage', 'pass-through', 'backstab'],
  'banished-flame': ['status-effect'],
  'banshee': ['status-effect'],
  'berserk': ['status-effect'],
  'black-hole': ['destroy-on-hit', 'screen-clear'],
  'blizzard': ['aoe', 'status-effect'],
  'bomb': ['aoe', 'destroy-on-hit'],
  'brimstone': ['aoe', 'status-effect'],
  'catapult': ['spawns-baby-balls'],
  'drill': ['pass-through', 'direct-damage'],
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
  'leech': ['status-effect', 'attach'],
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
  'steel': ['direct-damage', 'bounce-scaling'],
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
  'warp': ['ball-speed', 'teleport'],
  'wraith': ['pass-through', 'status-effect'],
  'x-ray': ['aoe', 'status-effect'],
  'zombie': ['spawns-allies', 'status-effect'],
  // Risen Ballbylon balls (S2 editorial review).
  'ash': ['pass-through', 'status-effect', 'field'],
  'beast': ['attach'],
  'bullet': ['pass-through', 'direct-damage'],
  'force': ['pass-through', 'direct-damage'],
  'fruit': ['destroy-on-hit', 'lifesteal'],
  'gale': ['aoe', 'knock-up'],
  'hedgehog': ['spawns-baby-balls', 'status-effect'],
  'ironwood': ['aoe'],
  'ivy': ['status-effect', 'aoe'],
  'kaiju': ['aoe', 'direct-damage'],
  'misfortune': ['destroy-on-hit', 'status-effect', 'aoe'],
  'mudslide': ['destroy-on-hit', 'aoe', 'status-effect', 'field'],
  'rot': ['destroy-on-hit', 'direct-damage'],
  'siren': ['pass-through', 'status-effect'],
  'stalagmite': ['aoe', 'knock-up'],
  'steam': ['pass-through', 'aoe', 'field'],
  'thunderbird': ['attach', 'aoe'],
  'tsunami': ['pass-through', 'aoe', 'destroy-on-hit'],
  'water': ['spawns-baby-balls', 'aoe'],
  'water-bug': ['spawns-baby-balls'],
  'waterfall': ['destroy-on-hit', 'aoe', 'field'],
  'werewolf': ['attach', 'lifesteal'],
  'wolfpack': ['attach', 'spawns-allies'],
  'wood': ['aoe'],
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
  'platinum-dumbbell': ['direct-damage'],
  'pressure-valve': ['aoe'],
  'protective-charm': ['shield'],
  'radiant-feather': ['ball-speed'],
  'reachers-spear': ['crit'],
  'rubber-headband': ['ball-speed', 'bounce-scaling'],
  'ruby-hilted-dagger': ['crit'],
  'sapphire-hilted-dagger': ['crit'],
  'shortbow': [],
  'silver-blindfold': ['crit'],
  'silver-bullet': ['direct-damage'],
  'slingshot': ['spawns-baby-balls'],
  'spiked-collar': ['direct-damage'],
  'stone-effigy': ['spawns-allies'],
  'sword-breaker': ['direct-damage'],
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
  // Risen Ballbylon passives (S2 editorial review).
  'ancient-ladle': ['fused-ball', 'clone'],
  'baby-armor': ['spawns-baby-balls'],
  'bent-spyglass': ['aim-direction'],
  'eyeless-spyglass': ['crit', 'aim-direction'],
  'blood-kunai': ['direct-damage'],
  'fractured-boulder': ['aoe', 'status-scaling'],
  'steel-bulwark': ['shield'],
  'charged-bow': ['aoe'],
  'charged-bracelet': ['aoe'],
  'cracked-cinderblock': ['spawns-baby-balls', 'wall-bounce'],
  'unkempt-cradle': ['spawns-baby-balls'],
  'cradle-of-filth': ['spawns-baby-balls'],
  'crystal-decanter': ['orbit'],
  'spiked-discipline': ['wall-bounce'],
  'eldritch-dagger': ['aoe', 'wall-bounce'],
  'eldritch-gauntlet': ['wall-bounce'],
  'goniometer': ['bounce-scaling', 'diagonal'],
  'hand-drill': ['playfield-loop'],
  'hand-me-downs': ['spawns-baby-balls'],
  'handheld-rupture': ['aoe', 'status-scaling', 'teleport'],
  'jugglers-club': ['aoe'],
  'jugglers-wheel': ['aoe'],
  'kris-knife': ['backstab'],
  'kunai': ['direct-damage'],
  'levitating-rock': ['aoe', 'status-scaling'],
  'liquid-flame': ['status-effect', 'orbit'],
  'lucky-coin': ['spawns-baby-balls'],
  'mystic-dipper': ['fused-ball', 'clone', 'aoe'],
  'peacemaker': ['pass-through', 'direct-damage'],
  'silver-revolver': ['pass-through', 'direct-damage'],
  'reachers-drill': ['crit', 'playfield-loop'],
  'refracted-echo': ['clone'],
  'refracting-glass': ['spawns-baby-balls'],
  'relentless-whip': ['spawns-baby-balls', 'wall-bounce'],
  'rusted-blade': ['status-effect'],
  'sands-of-time': ['ball-speed'],
  'shadow-blade': ['crit', 'backstab'],
  'spiked-shield': ['shield', 'aoe'],
  'teardrop-necklace': ['return-trajectory'],
  'teardrop-dagger': ['return-trajectory', 'ball-speed'],
  'test-tube': ['ball-speed'],
  'tilted-dagger': ['crit', 'backstab'],
  'vampires-kiss': ['status-effect', 'lifesteal'],
  'volatile-explosive': ['aoe'],
  'wrapped-explosive': ['aoe', 'wall-bounce'],
};

// ---- per-character verdict rules (fact base §4; editorial, not playtested) ----
export const CHAR_VERDICTS: Record<string, VerdictRule[]> = {
  'the-warrior': [],
  'the-itchy-finger': [
    { tag: 'spawns-baby-balls', verdict: 'green', note: 'More shots per second' },
    { tag: 'direct-damage', verdict: 'red', note: 'Scattered aim degrades aimed single-target play' },
  ],
  'the-repentant': [
    { tag: 'bounce-scaling', verdict: 'green', note: 'Balls gain +5% damage per bounce and return from the back wall' },
    { tag: 'destroy-on-hit', verdict: 'red', note: 'No bounces to scale' },
  ],
  'the-cohabitants': [
    { tag: 'aoe', verdict: 'green', note: 'Each ball is mirrored — double area coverage' },
    { tag: 'spawns-baby-balls', verdict: 'green', note: 'Mirrored copies double spawns' },
    { tag: 'spawns-allies', verdict: 'green', note: 'Mirrored copies double spawns' },
    { tag: 'direct-damage', verdict: 'red', note: 'Balls deal half damage' },
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
    { tag: 'direct-damage', verdict: 'green', note: 'Backstab synergy' },
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
    { tag: 'direct-damage', verdict: 'green', note: 'Multiple instances of one special ball per shot' },
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
    { tag: 'direct-damage', verdict: 'red', note: 'No direct hit damage' },
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
    { tag: 'direct-damage', verdict: 'green', note: 'Stealth keeps you safe while picking targets' },
  ],
  'the-hoary-hoarder': [
    { tag: 'status-effect', verdict: 'green', note: 'Passive-heavy build' },
    { tag: 'crit', verdict: 'green', note: 'Passive-heavy build' },
    { tag: 'spawns-baby-balls', verdict: 'red', note: 'Only 2 ball slots — uncertain, needs playtesting' },
  ],
  'the-ballbearer': [
    { tag: 'direct-damage', verdict: 'green', note: 'Twice as many ball slots' },
    { tag: 'aoe', verdict: 'green', note: 'Twice as many ball slots' },
    { tag: '*passives', verdict: 'red', note: 'No passive slots — every passive is dead weight' },
  ],
  'the-false-messiah': [],
  // Risen Ballbylon characters (S2 editorial review).
  'the-conduit': [
    { tag: 'aoe', verdict: 'green', note: 'All ball AOE is centered on you, so area builds land reliably' },
    { tag: 'direct-damage', verdict: 'red', note: 'You must stand near targets for AOE; pure direct damage loses positioning value' },
  ],
  'the-potager': [
    { tag: 'fused-ball', verdict: 'green', note: 'Fusing every special ball into one stacks their effects' },
    { tag: 'spawns-baby-balls', verdict: 'red', note: 'Cannot fuse normally and has no baby balls' },
  ],
  'the-recollector': [
    { tag: 'return-trajectory', verdict: 'green', note: 'Return trajectory doubles hits on the same target' },
    { tag: 'pass-through', verdict: 'green', note: 'Balls pierce on the way out and back' },
  ],
  'the-right-hand-man': [
    { tag: 'wall-bounce', verdict: 'green', note: 'Right-wall hits deal double damage' },
    { tag: 'pass-through', verdict: 'green', note: 'Left-wall hits pierce, at half damage' },
  ],
  'the-scandalmonger': [
    { tag: 'orbit', verdict: 'green', note: 'Returning balls orbit the cursor, covering an area' },
  ],
  'the-scrupulous-scoundrel': [
    { tag: 'diagonal', verdict: 'green', note: 'Perfect-diagonal bounces are predictable and repeatable' },
    { tag: 'wall-bounce', verdict: 'green', note: 'Balls bounce off walls in perfect diagonals' },
  ],
  'the-sentinel': [
    { tag: 'aim-direction', verdict: 'green', note: 'Aim any direction, including behind you' },
  ],
  'the-wallbreaker': [
    { tag: 'teleport', verdict: 'green', note: 'First wall hit teleports the ball across the screen' },
    { tag: 'wall-bounce', verdict: 'green', note: 'First wall hit triggers the teleport' },
  ],
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
