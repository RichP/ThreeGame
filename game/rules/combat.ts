import {
  ARMOR_UP_DAMAGE_REDUCTION,
  BRUISER_GUARD_DAMAGE_REDUCTION,
  COVER_MISS_BONUS,
  CRIT_CHANCE,
  CRIT_MULTIPLIER,
  DAMAGE_VARIANCE_MAX,
  DAMAGE_VARIANCE_MIN,
  MISS_CHANCE,
  SNIPER_AIM_CRIT_BONUS,
} from '../config'
import type { GameState, Position, TargetingPreview, UnitData } from '../gamestate'
import { canUnitAttack, isBlockedTile } from '../selectors'
import { clamp01, isWithinBounds, manhattanDistance } from '../utils'

export function isAdjacentToBlockedTile(state: GameState, position: Position): boolean {
  const adjacentPositions: Position[] = [
    { x: position.x + 1, y: position.y },
    { x: position.x - 1, y: position.y },
    { x: position.x, y: position.y + 1 },
    { x: position.x, y: position.y - 1 },
  ]

  return adjacentPositions.some(
    (adjacent) => isWithinBounds(adjacent, state.config.gridSize) && isBlockedTile(state, adjacent),
  )
}

export function getLineTiles(from: Position, to: Position): Position[] {
  const tiles: Position[] = []

  let x0 = from.x
  let y0 = from.y
  const x1 = to.x
  const y1 = to.y

  const dx = Math.abs(x1 - x0)
  const sx = x0 < x1 ? 1 : -1
  const dy = -Math.abs(y1 - y0)
  const sy = y0 < y1 ? 1 : -1
  let err = dx + dy

  while (true) {
    tiles.push({ x: x0, y: y0 })
    if (x0 === x1 && y0 === y1) break
    const e2 = 2 * err
    if (e2 >= dy) {
      err += dy
      x0 += sx
    }
    if (e2 <= dx) {
      err += dx
      y0 += sy
    }
  }

  return tiles
}

export function hasLineOfSight(state: GameState, from: Position, to: Position): boolean {
  const lineTiles = getLineTiles(from, to)

  if (lineTiles.length <= 2) return true

  for (let i = 1; i < lineTiles.length - 1; i++) {
    if (isBlockedTile(state, lineTiles[i])) return false
  }

  return true
}

export function getUnitAttackChances(state: GameState, attacker: UnitData, target: UnitData) {
  const coverBonus = isAdjacentToBlockedTile(state, target.position) ? COVER_MISS_BONUS : 0
  const critBonus = attacker.statusEffects.aimTurns > 0 ? SNIPER_AIM_CRIT_BONUS : 0
  const missChance = clamp01(MISS_CHANCE + coverBonus)
  const critChance = clamp01(CRIT_CHANCE + critBonus)
  const hitChance = clamp01(1 - missChance - critChance)

  return {
    missChance,
    hitChance,
    critChance,
    coverBonus,
  }
}

export function calculateAttackableTilesInState(state: GameState, unit: UnitData | undefined): ReadonlyArray<Position> {
  if (!unit) return []
  if (!canUnitAttack(unit)) return []

  const range = unit.range
  const tiles: Position[] = []

  for (let dx = -range; dx <= range; dx++) {
    for (let dy = -range; dy <= range; dy++) {
      const x = unit.position.x + dx
      const y = unit.position.y + dy
      const pos = { x, y }

      if (!isWithinBounds(pos, state.config.gridSize)) continue
      if (isBlockedTile(state, pos)) continue
      if (Math.abs(dx) + Math.abs(dy) <= range && (dx !== 0 || dy !== 0)) {
        if (hasLineOfSight(state, unit.position, pos)) {
          tiles.push(pos)
        }
      }
    }
  }

  return tiles
}

export function getAttackableEnemies(state: GameState, unit: UnitData | undefined): ReadonlyArray<UnitData> {
  if (!unit) return []
  const attackableTiles = calculateAttackableTilesInState(state, unit)
  const enemies = state.units.filter(
    (u) =>
      u.playerId !== unit.playerId &&
      attackableTiles.some((pos) => pos.x === u.position.x && pos.y === u.position.y),
  )
  return enemies
}

export function getTargetingPreview(
  state: GameState,
  attacker: UnitData | undefined,
  target: UnitData | undefined,
): TargetingPreview | null {
  if (!attacker || !target) return null
  if (attacker.playerId === target.playerId) return null
  if (!canUnitAttack(attacker)) return null
  if (manhattanDistance(attacker.position, target.position) > attacker.range) return null
  if (!hasLineOfSight(state, attacker.position, target.position)) return null

  const minDamage = Math.max(1, attacker.attack + DAMAGE_VARIANCE_MIN)
  const maxDamage = Math.max(1, attacker.attack + DAMAGE_VARIANCE_MAX)
  const minCritDamage = Math.max(1, Math.round(minDamage * CRIT_MULTIPLIER))
  const maxCritDamage = Math.max(1, Math.round(maxDamage * CRIT_MULTIPLIER))
  const chances = getUnitAttackChances(state, attacker, target)
  const armorReduction = target.statusEffects.armorUpTurns > 0 ? ARMOR_UP_DAMAGE_REDUCTION : 0
  const guardReduction = target.statusEffects.guardTurns > 0 ? BRUISER_GUARD_DAMAGE_REDUCTION : 0

  return {
    attackerId: attacker.id,
    targetId: target.id,
    missChance: chances.missChance,
    hitChance: chances.hitChance,
    critChance: chances.critChance,
    minDamage,
    maxDamage,
    minCritDamage,
    maxCritDamage,
    coverBonus: chances.coverBonus,
    effectiveCritChance: chances.critChance,
    breakdown: {
      baseAttack: attacker.attack,
      varianceRange: [DAMAGE_VARIANCE_MIN, DAMAGE_VARIANCE_MAX],
      critMultiplier: CRIT_MULTIPLIER,
      armorReduction,
      guardReduction,
    },
  }
}
