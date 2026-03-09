import {
  ARMOR_UP_DURATION_TURNS,
  POISON_DAMAGE_PER_TURN,
} from '../config'
import type { UnitData } from '../gamestate'

export function applyTurnStartStatusTick(unit: UnitData): UnitData {
  const nextPoisonTurns = Math.max(0, unit.statusEffects.poisonTurns - 1)
  const poisonDamage = unit.statusEffects.poisonTurns > 0 ? POISON_DAMAGE_PER_TURN : 0
  const nextHealth = Math.max(0, unit.health - poisonDamage)

  return {
    ...unit,
    health: nextHealth,
    statusEffects: {
      ...unit.statusEffects,
      poisonTurns: nextPoisonTurns,
      armorUpTurns: Math.max(0, unit.statusEffects.armorUpTurns - 1),
      guardTurns: Math.max(0, unit.statusEffects.guardTurns - 1),
      aimTurns: Math.max(0, unit.statusEffects.aimTurns - 1),
      dashBonusMovement: 0,
    },
  }
}

export function applyTurnStartClassBuffs(unit: UnitData): UnitData {
  if (unit.archetype !== 'bruiser') return unit

  // Only apply armor buff if the unit is on the current player's turn
  // This function is called during endTurn() for the NEXT player's units,
  // so we only want to apply the buff to units that will be acting next
  return {
    ...unit,
    statusEffects: {
      ...unit.statusEffects,
      armorUpTurns: Math.max(unit.statusEffects.armorUpTurns, ARMOR_UP_DURATION_TURNS),
    },
  }
}
