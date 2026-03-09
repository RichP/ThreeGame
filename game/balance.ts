/**
 * Balance Configuration
 * 
 * This file contains all game balance parameters and archetype stats.
 * Use this central location for tuning values based on playtesting feedback.
 * 
 * Guidelines:
 * - Keep values well-commented with reasoning
 * - Use consistent naming conventions
 * - Document expected ranges and trade-offs
 * - Consider impact on BO3 pacing and decision density
 */

// Base unit stats by archetype
export const ARCHETYPE_BASE_STATS = {
  // Fast, fragile units that excel at positioning and utility
  // Trade survivability for mobility and tactical options
  scout: {
    hp: 4,
    move: 3,
    attack: 2,
    range: 2,
    defense: 1,
    description: "Mobile skirmishers with utility abilities"
  },
  
  // Balanced units with moderate stats across the board
  // Good for learning core mechanics and flexible play
  soldier: {
    hp: 6,
    move: 2,
    attack: 3,
    range: 3,
    defense: 2,
    description: "Well-rounded frontline units"
  },
  
  // Heavy units with high damage and survivability
  // Slow but impactful when positioned correctly
  heavy: {
    hp: 8,
    move: 1,
    attack: 4,
    range: 2,
    defense: 3,
    description: "Tanky damage dealers"
  }
} as const;

// Ability configurations with balance notes
export const ABILITIES = {
  // Movement enhancement that enables flanking and positioning
  // Cooldown prevents spamming while allowing tactical repositioning
  dash: {
    cooldown: 2,
    rangeBonus: 2,
    description: "Move +2 tiles this turn. Enables aggressive plays and repositioning.",
    balanceNotes: "Cooldown prevents constant repositioning while allowing tactical flexibility"
  },
  
  // Defensive ability that reduces incoming damage
  // Mitigation value scales with unit role (higher for tanks)
  guard: {
    cooldown: 3,
    mitigation: 2,
    duration: 1,
    description: "Reduce incoming damage by 2 this turn.",
    balanceNotes: "Mitigation scales with unit role. Duration prevents stacking indefinitely"
  },
  
  // Offensive ability that increases critical hit chance
  // Trade-off: reduces movement to balance increased damage potential
  aim: {
    cooldown: 2,
    critBonus: 0.3,
    movePenalty: 1,
    description: "Increase crit chance by 30% this turn, but move -1.",
    balanceNotes: "Movement penalty balances increased damage output"
  },
  
  // Area denial ability that creates temporary cover
  // High cooldown reflects strategic impact on positioning
  smoke: {
    cooldown: 4,
    coverRadius: 2,
    duration: 2,
    description: "Create cover in 2-tile radius for 2 turns.",
    balanceNotes: "High cooldown balances area denial impact"
  }
} as const;

// Combat system parameters
export const COMBAT = {
  // Base critical hit chance before modifiers
  baseCritChance: 0.15,
  
  // Critical hit damage multiplier
  critMultiplier: 1.5,
  
  // Damage reduction per point of defense
  defenseReduction: 1,
  
  // Maximum damage reduction from defense (prevents complete immunity)
  maxDefenseReduction: 4,
  
  // Cover provides consistent damage mitigation
  coverMitigation: 1,
  
  // Line of sight blocking prevents attacks entirely
  losBlockChance: 1.0,
  
  // Range penalty for attacks beyond optimal distance
  rangePenalty: 0.1,
  
  // Minimum hit chance to prevent guaranteed misses
  minHitChance: 0.05
} as const;

// Turn and game flow parameters
export const GAME_FLOW = {
  // Maximum turns per match to maintain BO3 pacing
  maxTurnsPerMatch: 15,
  
  // Maximum turns per series to prevent excessively long games
  maxTurnsPerSeries: 45,
  
  // Score required to win a Best of 3 series
  seriesWinScore: 2,
  
  // Time limit per turn in milliseconds (optional feature)
  turnTimeLimit: 60000
} as const;

// Map and positioning parameters
export const MAP = {
  // Standard map size for balanced gameplay
  width: 10,
  height: 8,
  
  // Minimum distance between starting positions
  minStartDistance: 6,
  
  // Maximum number of cover tiles per map
  maxCoverTiles: 8,
  
  // Maximum number of blocking tiles per map
  maxBlockingTiles: 6
} as const;

// Progression and difficulty scaling
export const PROGRESSION = {
  // Experience points awarded for different actions
  xp: {
    kill: 100,
    assist: 50,
    objective: 75,
    survival: 25
  },
  
  // Level-up stat increases (percentage of base stats)
  levelUp: {
    hpIncrease: 0.2,
    attackIncrease: 0.15,
    defenseIncrease: 0.1
  }
} as const;

// Balance validation functions
export function validateBalanceConfig() {
  const errors: string[] = [];
  
  // Validate archetype stats are within reasonable ranges
  Object.entries(ARCHETYPE_BASE_STATS).forEach(([archetype, stats]) => {
    if (stats.hp < 3 || stats.hp > 12) {
      errors.push(`${archetype}: HP (${stats.hp}) outside reasonable range (3-12)`);
    }
    if (stats.move < 1 || stats.move > 4) {
      errors.push(`${archetype}: Move (${stats.move}) outside reasonable range (1-4)`);
    }
    if (stats.attack < 1 || stats.attack > 6) {
      errors.push(`${archetype}: Attack (${stats.attack}) outside reasonable range (1-6)`);
    }
    if (stats.range < 1 || stats.range > 4) {
      errors.push(`${archetype}: Range (${stats.range}) outside reasonable range (1-4)`);
    }
    if (stats.defense < 0 || stats.defense > 4) {
      errors.push(`${archetype}: Defense (${stats.defense}) outside reasonable range (0-4)`);
    }
  });
  
  // Validate ability cooldowns are reasonable
  Object.entries(ABILITIES).forEach(([ability, config]) => {
    if (config.cooldown < 1 || config.cooldown > 6) {
      errors.push(`${ability}: Cooldown (${config.cooldown}) outside reasonable range (1-6)`);
    }
  });
  
  // Validate combat parameters
  if (COMBAT.baseCritChance < 0 || COMBAT.baseCritChance > 0.5) {
    errors.push(`Base crit chance (${COMBAT.baseCritChance}) outside reasonable range (0-0.5)`);
  }
  
  if (COMBAT.minHitChance < 0 || COMBAT.minHitChance > 0.2) {
    errors.push(`Min hit chance (${COMBAT.minHitChance}) outside reasonable range (0-0.2)`);
  }
  
  return errors;
}

// Export all balance constants for use throughout the game
export const BALANCE_CONFIG = {
  archetypes: ARCHETYPE_BASE_STATS,
  abilities: ABILITIES,
  combat: COMBAT,
  gameFlow: GAME_FLOW,
  map: MAP,
  progression: PROGRESSION
} as const;