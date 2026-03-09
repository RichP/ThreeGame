import type { Position } from './config'

export function isWithinBounds(position: Position, gridSize: number): boolean {
  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.x < gridSize &&
    position.y < gridSize
  )
}

export function positionKey(position: Position): string {
  return `${position.x},${position.y}`
}

export function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function clamp01(value: number): number {
  return clamp(value, 0, 1)
}

export function randomIntInRange(min: number, max: number, rng: () => number = Math.random): number {
  return Math.floor(rng() * (max - min + 1)) + min
}
