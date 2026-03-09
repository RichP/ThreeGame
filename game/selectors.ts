import type { GameState, Position, UnitData } from './gamestate'

export function getUnitById(state: GameState, id: string | null): UnitData | undefined {
  if (!id) return undefined
  return state.units.find((unit) => unit.id === id)
}

export function getUnitAt(state: GameState, position: Position): UnitData | undefined {
  return state.units.find(
    (unit) => unit.position.x === position.x && unit.position.y === position.y,
  )
}

export function isBlockedTile(state: GameState, position: Position): boolean {
  return state.config.blockedTiles.some(
    (tile) => tile.x === position.x && tile.y === position.y,
  )
}

export function isCurrentPlayersUnit(state: GameState, unit?: UnitData): boolean {
  return !!unit && unit.playerId === state.currentPlayer
}

export function canUnitMove(unit: UnitData | undefined): boolean {
  return !!unit && !unit.hasMoved
}

export function canUnitAttack(unit: UnitData | undefined): boolean {
  return !!unit && !unit.hasAttacked
}

export function canUseActiveAbility(unit: UnitData | undefined): boolean {
  return !!unit && !unit.hasUsedAbility
}

export function hasUnitFinishedTurn(unit: UnitData | undefined): boolean {
  return !!unit && unit.hasMoved && unit.hasAttacked
}

export function hasAvailableActionsForCurrentPlayer(state: GameState): boolean {
  return state.units.some(
    (unit) => unit.playerId === state.currentPlayer && !hasUnitFinishedTurn(unit),
  )
}
