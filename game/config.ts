export type PlayerId = 'p1' | 'p2'
export type UnitArchetype = 'scout' | 'bruiser' | 'sniper'
export type MapPresetId = 'crossroads' | 'lanes' | 'fortress' | 'random-seeded'

import { BALANCE_CONFIG } from './balance'
import { CONSTANTS } from '../constants'

export interface UnitArchetypeStats {
  readonly archetype: UnitArchetype
  readonly displayName: string
  readonly maxHealth: number
  readonly movement: number
  readonly attack: number
  readonly range: number
}

export interface Position {
  x: number
  y: number
}

export const UNIT_ARCHETYPES: Record<UnitArchetype, UnitArchetypeStats> = {
  scout: {
    archetype: 'scout',
    displayName: 'Scout',
    maxHealth: BALANCE_CONFIG.archetypes.scout.hp * CONSTANTS.GAME_CONFIG.UNIT_HEALTH_SCALE,
    movement: BALANCE_CONFIG.archetypes.scout.move,
    attack: BALANCE_CONFIG.archetypes.scout.attack,
    range: BALANCE_CONFIG.archetypes.scout.range,
  },
  bruiser: {
    archetype: 'bruiser',
    displayName: 'Bruiser',
    maxHealth: BALANCE_CONFIG.archetypes.heavy.hp * CONSTANTS.GAME_CONFIG.UNIT_HEALTH_SCALE,
    movement: BALANCE_CONFIG.archetypes.heavy.move,
    attack: BALANCE_CONFIG.archetypes.heavy.attack,
    range: BALANCE_CONFIG.archetypes.heavy.range,
  },
  sniper: {
    archetype: 'sniper',
    displayName: 'Sniper',
    maxHealth: BALANCE_CONFIG.archetypes.soldier.hp * CONSTANTS.GAME_CONFIG.UNIT_HEALTH_SCALE,
    movement: BALANCE_CONFIG.archetypes.soldier.move,
    attack: BALANCE_CONFIG.archetypes.soldier.attack,
    range: BALANCE_CONFIG.archetypes.soldier.range,
  },
}

export const MAP_PRESET_LABELS: Record<MapPresetId, string> = {
  crossroads: 'Crossroads',
  lanes: 'Lanes',
  fortress: 'Fortress',
  'random-seeded': 'Random (Seeded)',
}

export const UNIT_START_POSITIONS: ReadonlyArray<Position> = [
  { x: 1, y: 1 },
  { x: 1, y: 3 },
  { x: 2, y: 2 },
  { x: 6, y: 6 },
  { x: 6, y: 4 },
  { x: 5, y: 5 },
]

export const FIXED_MAP_PRESETS: Record<Exclude<MapPresetId, 'random-seeded'>, ReadonlyArray<Position>> = {
  crossroads: [
    { x: 3, y: 3 },
    { x: 3, y: 4 },
    { x: 4, y: 3 },
    { x: 4, y: 4 },
  ],
  lanes: [
    { x: 2, y: 2 },
    { x: 2, y: 3 },
    { x: 2, y: 4 },
    { x: 5, y: 3 },
    { x: 5, y: 4 },
    { x: 5, y: 5 },
  ],
  fortress: [
    { x: 3, y: 2 },
    { x: 4, y: 2 },
    { x: 2, y: 3 },
    { x: 5, y: 3 },
    { x: 2, y: 4 },
    { x: 5, y: 4 },
    { x: 3, y: 5 },
    { x: 4, y: 5 },
  ],
}

// Combat system parameters from balance config
export const MISS_CHANCE = BALANCE_CONFIG.combat.minHitChance
export const CRIT_CHANCE = BALANCE_CONFIG.combat.baseCritChance
export const DAMAGE_VARIANCE_MIN = CONSTANTS.COMBAT.DAMAGE_VARIANCE_MIN
export const DAMAGE_VARIANCE_MAX = CONSTANTS.COMBAT.DAMAGE_VARIANCE_MAX
export const CRIT_MULTIPLIER = BALANCE_CONFIG.combat.critMultiplier
export const POISON_DAMAGE_PER_TURN = CONSTANTS.COMBAT.POISON_DAMAGE_PER_TURN
export const POISON_DURATION_TURNS = CONSTANTS.COMBAT.POISON_DURATION_TURNS
export const ARMOR_UP_DURATION_TURNS = CONSTANTS.COMBAT.ARMOR_UP_DURATION_TURNS
export const ARMOR_UP_DAMAGE_REDUCTION = BALANCE_CONFIG.combat.coverMitigation
export const COVER_MISS_BONUS = BALANCE_CONFIG.combat.coverMitigation * CONSTANTS.COMBAT.COVER_MISS_BONUS
export const SCOUT_DASH_BONUS_MOVEMENT = BALANCE_CONFIG.abilities.dash.rangeBonus
export const SNIPER_AIM_CRIT_BONUS = BALANCE_CONFIG.abilities.aim.critBonus
export const SNIPER_AIM_MOVE_PENALTY = BALANCE_CONFIG.abilities.aim.movePenalty
export const BRUISER_GUARD_DAMAGE_REDUCTION = BALANCE_CONFIG.abilities.guard.mitigation
