import type { GameState, Position, UnitData } from '../gamestate'
import { SNIPER_AIM_MOVE_PENALTY } from '../config'
import { canUnitMove, getUnitAt, isBlockedTile } from '../selectors'
import { isWithinBounds, manhattanDistance, positionKey } from '../utils'
import { findPath } from '../pathfinding'

export function getEffectiveMovement(unit: UnitData): number {
  const aimPenalty = unit.statusEffects.aimTurns > 0 ? SNIPER_AIM_MOVE_PENALTY : 0
  return Math.max(1, unit.movement + unit.statusEffects.dashBonusMovement - aimPenalty)
}

export function calculateReachableTiles(unit: UnitData | undefined, gridSize: number): ReadonlyArray<Position> {
  if (!unit) return []
  const range = getEffectiveMovement(unit)
  const tiles: Position[] = []

  for (let dx = -range; dx <= range; dx++) {
    for (let dy = -range; dy <= range; dy++) {
      const x = unit.position.x + dx
      const y = unit.position.y + dy
      if (x < 0 || y < 0 || x >= gridSize || y >= gridSize) continue
      if (Math.abs(dx) + Math.abs(dy) <= range) {
        tiles.push({ x, y })
      }
    }
  }

  return tiles
}

export function calculateReachableTilesInState(state: GameState, unit: UnitData | undefined): ReadonlyArray<Position> {
  if (!unit) return []
  if (!canUnitMove(unit)) return []

  const effectiveMovement = getEffectiveMovement(unit)
  const reachable: Position[] = []

  // Check all positions within the movement range
  const range = effectiveMovement
  for (let dx = -range; dx <= range; dx++) {
    for (let dy = -range; dy <= range; dy++) {
      const x = unit.position.x + dx
      const y = unit.position.y + dy
      
      if (x < 0 || y < 0 || x >= state.config.gridSize || y >= state.config.gridSize) continue
      
      // Use A* to check if this position is reachable
      const result = findPath(state, unit.position, { x, y })
      
      if (result.canReach && result.distance <= effectiveMovement) {
        reachable.push({ x, y })
      }
    }
  }

  return reachable
}
