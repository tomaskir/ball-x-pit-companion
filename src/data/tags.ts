// Synergy tag vocabulary — the site's own editorial model (see
// docs/research/game-mechanics.md §4). Characters carry verdict rules over
// these tags; indicators render from tag overlap.
export const TAGS: Record<string, string> = {
  "aoe": "Damages multiple enemies / area damage",
  "single-target": "Pure single-hit damage, no area or status",
  "spawns-baby-balls": "Creates baby balls",
  "spawns-allies": "Spawns summons / friendly units",
  "status-effect": "Applies status effects (poison, burn, freeze, curse, …)",
  "pass-through": "Pierces enemies",
  "destroy-on-hit": "Ball is consumed on hit",
  "lifesteal": "Heals the player",
  "self-damage": "Costs player health",
  "ball-speed": "Scales ball speed",
  "bounce-scaling": "Scales with bounces",
  "crit": "Critical chance / damage",
  "wall-bounce": "Interacts with walls",
  "baby-ball-scaling": "Scales off baby-ball count",
  "screen-clear": "Full-screen effect",
  "clone": "Spawns clones of the ball",
  "friendly-fire-risk": "Can hurt player allies / ally mechanics"
};

