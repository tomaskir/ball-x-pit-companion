// Synergy tag vocabulary — the site's own editorial model (see
// docs/research/game-mechanics.md §4). Characters carry verdict rules over
// these tags; indicators render from tag overlap.
export const TAGS: Record<string, string> = {
  "aim-direction": "Effect depends on the direction the player is aiming",
  "aoe": "Damages multiple enemies / area damage",
  "attach": "Ball sticks to an enemy and deals damage over time until it dies",
  "baby-ball-scaling": "Scales off baby-ball count",
  "backstab": "Bonus damage/crit when hitting an enemy from behind or the flank",
  "ball-speed": "Scales ball speed",
  "bounce-scaling": "Scales with bounces",
  "clone": "Spawns clones of the ball",
  "crit": "Critical chance / damage",
  "destroy-on-hit": "Ball is consumed on hit",
  "diagonal": "Bounce angle is constrained to / rewarded for perfect diagonals",
  "direct-damage": "Direct damage — focused single-hit damage, no area or status",
  "field": "Leaves a persistent damaging zone or trail on the ground",
  "friendly-fire-risk": "Can hurt player allies / ally mechanics",
  "fused-ball": "Interacts with the fused/combined ball",
  "knock-up": "Launches enemies into the air, letting balls pass under them",
  "lifesteal": "Heals the player",
  "orbit": "Ball orbits the player or aim cursor",
  "pass-through": "Pierces enemies",
  "playfield-loop": "Ball loops around the playfield; effects trigger each loop",
  "return-trajectory": "Ball returns toward the player/cursor; bonuses apply on the return leg",
  "screen-clear": "Full-screen effect",
  "self-damage": "Costs player health",
  "shield": "Modifies or interacts with the player's shield",
  "spawns-allies": "Spawns summons / friendly units",
  "spawns-baby-balls": "Creates baby balls",
  "status-effect": "Applies status effects (poison, burn, freeze, curse, …)",
  "status-scaling": "Scales status-effect damage (amplifies statuses; does not apply them)",
  "teleport": "Ball teleports/warps across the field",
  "wall-bounce": "Interacts with walls"
};

