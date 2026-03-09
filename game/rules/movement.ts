import type { GameState, Position, UnitData } from '../gamestate'
import { SNIPER_AIM_MOVE_PENALTY } from '../config'
import { canUnitMove, getUnitAt, isBlockedTile } from '../selectors'
import { isWithinBounds, manhattanDistance, positionKey } from '../utils'

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

  const queue: Array<{ pos: Position; distance: number }> = [
    { pos: { ...unit.position }, distance: 0 },
  ]
  const visited = new Set<string>([positionKey(unit.position)])
  const reachable: Position[] = []

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current) break

    const { pos, distance } = current
    reachable.push(pos)

    if (distance >= getEffectiveMovement(unit)) continue

    const neighbors: Position[] = [
      { x: pos.x + 1, y: pos.y },
      { x: pos.x - 1, y: pos.y },
      { x: pos.x, y: pos.y + 1 },
      { x: pos.x, y: pos.y - 1 },
    ]

    for (const next of neighbors) {
      if (!isWithinBounds(next, state.config.gridSize)) continue
      if (visited.has(positionKey(next))) continue
      if (isBlockedTile(state, next)) continue

      const occupiedUnit = getUnitAt(state, next)
      if (occupiedUnit && occupiedUnit.id !== unit.id) continue

      visited.add(positionKey(next))
      queue.push({ pos: next, distance: distance + 1 })
    }
  }

  return reachable
}
