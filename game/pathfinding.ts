import type { GameState, Position } from './gamestate'
import { isBlockedTile, getUnitAt } from './selectors'
import { isWithinBounds, positionKey } from './utils'

export interface PathNode {
  readonly position: Position
  readonly g: number // Cost from start
  readonly h: number // Heuristic to goal
  readonly f: number // Total cost (g + h)
  readonly parent: PathNode | null
}

export interface PathResult {
  readonly path: ReadonlyArray<Position>
  readonly canReach: boolean
  readonly distance: number
}

export function findPath(state: GameState, start: Position, goal: Position): PathResult {
  // If start and goal are the same, return empty path
  if (start.x === goal.x && start.y === goal.y) {
    return {
      path: [],
      canReach: true,
      distance: 0
    }
  }

  // Check if goal is within bounds and not blocked
  if (!isWithinBounds(goal, state.config.gridSize) || isBlockedTile(state, goal)) {
    return {
      path: [],
      canReach: false,
      distance: Infinity
    }
  }

  // Check if goal is occupied by another unit
  const goalUnit = getUnitAt(state, goal)
  if (goalUnit) {
    return {
      path: [],
      canReach: false,
      distance: Infinity
    }
  }

  const openSet = new Map<string, PathNode>()
  const closedSet = new Set<string>()
  
  // Initialize start node
  const startNode: PathNode = {
    position: { ...start },
    g: 0,
    h: manhattanHeuristic(start, goal),
    f: manhattanHeuristic(start, goal),
    parent: null
  }
  
  openSet.set(positionKey(start), startNode)

  // Directions: North, South, East, West (no diagonals)
  const directions: Position[] = [
    { x: 0, y: 1 },   // North
    { x: 0, y: -1 },  // South
    { x: 1, y: 0 },   // East
    { x: -1, y: 0 }   // West
  ]

  while (openSet.size > 0) {
    // Find node with lowest f score
    let current: PathNode | null = null
    let lowestF = Infinity
    
    for (const node of openSet.values()) {
      if (node.f < lowestF) {
        lowestF = node.f
        current = node
      }
    }

    if (!current) break

    // Remove current from open set and add to closed set
    openSet.delete(positionKey(current.position))
    closedSet.add(positionKey(current.position))

    // Check if we reached the goal
    if (current.position.x === goal.x && current.position.y === goal.y) {
      return reconstructPath(current)
    }

    // Explore neighbors
    for (const dir of directions) {
      const neighborPos: Position = {
        x: current.position.x + dir.x,
        y: current.position.y + dir.y
      }

      const neighborKey = positionKey(neighborPos)

      // Skip if already evaluated
      if (closedSet.has(neighborKey)) continue

      // Skip if out of bounds or blocked
      if (!isWithinBounds(neighborPos, state.config.gridSize) || isBlockedTile(state, neighborPos)) continue

      // Skip if occupied by another unit
      const neighborUnit = getUnitAt(state, neighborPos)
      if (neighborUnit) continue

      // Calculate tentative g score
      const tentativeG = current.g + 1 // Each step costs 1

      const existingNode = openSet.get(neighborKey)
      
      if (!existingNode || tentativeG < existingNode.g) {
        const neighborNode: PathNode = {
          position: neighborPos,
          g: tentativeG,
          h: manhattanHeuristic(neighborPos, goal),
          f: tentativeG + manhattanHeuristic(neighborPos, goal),
          parent: current
        }
        
        openSet.set(neighborKey, neighborNode)
      }
    }
  }

  // No path found
  return {
    path: [],
    canReach: false,
    distance: Infinity
  }
}

function manhattanHeuristic(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

function reconstructPath(node: PathNode): PathResult {
  const path: Position[] = []
  let current: PathNode | null = node
  
  while (current !== null) {
    path.unshift(current.position)
    current = current.parent
  }
  
  // Remove the starting position from the path
  if (path.length > 0) {
    path.shift()
  }
  
  return {
    path,
    canReach: true,
    distance: path.length
  }
}

export function canReachPosition(state: GameState, start: Position, goal: Position, maxDistance: number): boolean {
  const result = findPath(state, start, goal)
  return result.canReach && result.distance <= maxDistance
}

export function getShortestPathToPosition(state: GameState, start: Position, goal: Position, maxDistance: number): ReadonlyArray<Position> {
  const result = findPath(state, start, goal)
  if (result.canReach && result.distance <= maxDistance) {
    return result.path
  }
  return []
}