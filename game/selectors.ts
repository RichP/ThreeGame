import type { GameState, Position, UnitData } from './gamestate'
import { BALANCE_CONFIG } from './balance'
import type { TerrainType } from './config'

export type ActiveAbilityId = 'dash' | 'guard' | 'aim'

export interface AbilityAvailability {
  readonly abilityId: ActiveAbilityId
  readonly abilityName: string
  readonly cooldownTurns: number
  /** Remaining turns until ready (0 = ready). */
  readonly cooldownRemaining: number
  readonly canUse: boolean
  /** If not usable, a short reason suitable for tooltips/titles. */
  readonly reason?: string
}

export function getActiveAbilityId(unit: UnitData): ActiveAbilityId {
  switch (unit.archetype) {
    case 'scout':
      return 'dash'
    case 'bruiser':
      return 'guard'
    case 'sniper':
      return 'aim'
    default: {
      // Exhaustive safeguard; TS should prevent this.
      return 'dash'
    }
  }
}

export function getActiveAbilityName(unit: UnitData): string {
  const id = getActiveAbilityId(unit)
  switch (id) {
    case 'dash':
      return 'Dash'
    case 'guard':
      return 'Guard'
    case 'aim':
      return 'Aim'
  }
}

export function getActiveAbilityCooldownTurns(unit: UnitData): number {
  const id = getActiveAbilityId(unit)
  return BALANCE_CONFIG.abilities[id].cooldown
}

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

export function getTerrainAt(state: GameState, position: Position): TerrainType | null {
  const key = `${position.x},${position.y}`;
  return state.config.terrain[key] || null;
}

export function isCoverTerrain(state: GameState, position: Position): boolean {
  const terrain = getTerrainAt(state, position);
  return terrain === 'cover';
}

export function isHighGroundTerrain(state: GameState, position: Position): boolean {
  const terrain = getTerrainAt(state, position);
  return terrain === 'high_ground';
}

export function isPoisonTerrain(state: GameState, position: Position): boolean {
  const terrain = getTerrainAt(state, position);
  return terrain === 'poison';
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
  if (!unit) return false

  // Some abilities are intended to be used before movement to avoid confusion
  // (and because they modify movement budget).
  if (unit.archetype === 'scout' && unit.hasMoved) return false
  if (unit.archetype === 'sniper' && unit.hasMoved) return false

  const cooldownRemaining = unit.abilityCooldownRemaining ?? 0
  if (cooldownRemaining > 0) return false

  return !unit.hasUsedAbility
}

export function getActiveAbilityAvailability(unit: UnitData | undefined): AbilityAvailability | null {
  if (!unit) return null

  const abilityId = getActiveAbilityId(unit)
  const abilityName = getActiveAbilityName(unit)
  const cooldownTurns = getActiveAbilityCooldownTurns(unit)
  const cooldownRemaining = unit.abilityCooldownRemaining ?? 0

  if (unit.hasUsedAbility) {
    return {
      abilityId,
      abilityName,
      cooldownTurns,
      cooldownRemaining,
      canUse: false,
      reason: 'Already used this turn',
    }
  }

  if (unit.archetype === 'scout' && unit.hasMoved) {
    return {
      abilityId,
      abilityName,
      cooldownTurns,
      cooldownRemaining,
      canUse: false,
      reason: 'Use before moving',
    }
  }

  if (unit.archetype === 'sniper' && unit.hasMoved) {
    return {
      abilityId,
      abilityName,
      cooldownTurns,
      cooldownRemaining,
      canUse: false,
      reason: 'Use before moving',
    }
  }

  if (cooldownRemaining > 0) {
    return {
      abilityId,
      abilityName,
      cooldownTurns,
      cooldownRemaining,
      canUse: false,
      reason: `On cooldown (${cooldownRemaining} turn${cooldownRemaining === 1 ? '' : 's'} remaining)`,
    }
  }

  return {
    abilityId,
    abilityName,
    cooldownTurns,
    cooldownRemaining,
    canUse: true,
  }
}

export function hasUnitFinishedTurn(unit: UnitData | undefined): boolean {
  return !!unit && unit.hasMoved && unit.hasAttacked
}

export function hasAvailableActionsForCurrentPlayer(state: GameState): boolean {
  return state.units.some(
    (unit) => unit.playerId === state.currentPlayer && !hasUnitFinishedTurn(unit),
  )
}
