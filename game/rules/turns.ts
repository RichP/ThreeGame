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

  return {
    ...unit,
    statusEffects: {
      ...unit.statusEffects,
      armorUpTurns: Math.max(unit.statusEffects.armorUpTurns, ARMOR_UP_DURATION_TURNS),
    },
  }
}
