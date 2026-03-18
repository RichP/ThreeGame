import { FSM } from "./fsm";
import {
    FIXED_MAP_PRESETS,
    UNIT_ARCHETYPES,
    UNIT_START_POSITIONS,
    type MapPresetId,
    type PlayerId,
    type Position,
    type UnitArchetype,
    type UnitArchetypeStats,
} from './config'
import { CONSTANTS } from '../constants'
import { seriesManager } from './series'
import { saveSlotManager } from './saveSlots'
import { replayManager, type ReplayEvent } from './replay'

export type { PlayerId, UnitArchetype, MapPresetId, Position, UnitArchetypeStats } from './config'
export {
    MAP_PRESET_LABELS,
    UNIT_ARCHETYPES,
    MISS_CHANCE,
    CRIT_CHANCE,
    DAMAGE_VARIANCE_MIN,
    DAMAGE_VARIANCE_MAX,
    CRIT_MULTIPLIER,
    POISON_DAMAGE_PER_TURN,
    POISON_DURATION_TURNS,
    ARMOR_UP_DURATION_TURNS,
    ARMOR_UP_DAMAGE_REDUCTION,
    COVER_MISS_BONUS,
    SCOUT_DASH_BONUS_MOVEMENT,
    SNIPER_AIM_CRIT_BONUS,
    SNIPER_AIM_MOVE_PENALTY,
    BRUISER_GUARD_DAMAGE_REDUCTION,
} from './config'
import {
    canUnitAttack,
    canUnitMove,
    canUseActiveAbility,
    getUnitAt,
    getUnitById,
    hasAvailableActionsForCurrentPlayer,
    hasUnitFinishedTurn,
    isBlockedTile,
    isCurrentPlayersUnit,
} from './selectors'
import {
    fromPersistedGameState as restorePersistedState,
    toPersistedGameState as stripPersistedState,
} from './persistence'
import type { PersistedGameState } from './persistence'
import {
    calculateAttackableTilesInState,
    getAttackableEnemies,
    getTargetingPreview,
    getUnitAttackChances,
    hasLineOfSight,
} from './rules/combat'
import {
    calculateReachableTiles,
    calculateReachableTilesInState,
    getEffectiveMovement,
} from './rules/movement'
import { findPath, getShortestPathToPosition } from './pathfinding'
import {
    applyTurnStartClassBuffs,
    applyTurnStartStatusTick,
} from './rules/turns'
import { isWithinBounds, manhattanDistance, positionKey, randomIntInRange } from './utils'
export type { PersistedGameState } from './persistence'


export interface UnitData {
    id: string;
    playerId: PlayerId;
    archetype: UnitArchetype;
    maxHealth: number;
    position: Position;
    health: number;
    movement: number;
    attack: number;
    range: number;
    hasMoved: boolean;
    hasAttacked: boolean;
    hasUsedAbility: boolean;
    statusEffects: UnitStatusEffects;
}

export interface UnitStatusEffects {
    readonly armorUpTurns: number;
    readonly poisonTurns: number;
    readonly guardTurns: number;
    readonly aimTurns: number;
    readonly dashBonusMovement: number;
}

export interface GameConfig {
    readonly gridSize: number;
    readonly mapPresetId: MapPresetId;
    readonly mapSeed?: number;
    readonly blockedTiles: ReadonlyArray<Position>;
}


export enum Phase {
    SELECT_UNIT = 'SELECT_UNIT',
    MOVE_UNIT = 'MOVE_UNIT',
    ATTACK = 'ATTACK',
    END_TURN = 'END_TURN',
}

export type AttackOutcome = 'miss' | 'hit' | 'crit';


export interface GameState {
    readonly config: GameConfig;
    readonly phaseFSM: FSM<Phase>;
    readonly phase: Phase;
    readonly autoSkipNoTargetAttack: boolean;
    readonly currentPlayer: PlayerId;
    readonly currentPlayerIndex: number;
    readonly turn: number;
    readonly selectedUnitId: string | null;
    readonly units: ReadonlyArray<UnitData>;
    readonly matchStats: MatchStats;
    readonly eventLog: ReadonlyArray<GameEvent>;
    readonly lastAction?: {
        type: 'attack';
        attackerId: string;
        targetId: string;
        damage: number;
        outcome: AttackOutcome;
        statusesApplied?: ReadonlyArray<string>;
        timestamp: number;
    };
}

export type GameEvent = MoveEvent | AttackEvent | DeathEvent | TurnEndEvent | UndoMoveEvent | MatchEndEvent;

export interface MoveEvent {
    readonly type: 'move';
    readonly timestamp: number;
    readonly unitId: string;
    readonly from: Position;
    readonly to: Position;
}

export interface UndoMoveEvent {
    readonly type: 'undo_move';
    readonly timestamp: number;
    readonly unitId: string;
    readonly from: Position;
    readonly to: Position;
}

export interface AttackEvent {
    readonly type: 'attack';
    readonly timestamp: number;
    readonly attackerId: string;
    readonly targetId: string;
    readonly damage: number;
    readonly outcome: AttackOutcome;
    readonly statusesApplied?: ReadonlyArray<string>;
    readonly damageBreakdown?: {
        readonly baseAttack: number;
        readonly variance: number;
        readonly critMultiplier: number;
        readonly preMitigationDamage: number;
        readonly armorReduction: number;
        readonly guardReduction: number;
    };
}

export interface DeathEvent {
    readonly type: 'death';
    readonly timestamp: number;
    readonly unitId: string;
    readonly byPlayer: PlayerId | 'environment';
}

export interface TurnEndEvent {
    readonly type: 'turn_end';
    readonly timestamp: number;
    readonly nextPlayer: PlayerId;
    readonly turn: number;
}

export interface MatchEndEvent {
    readonly type: 'match_end';
    readonly timestamp: number;
    readonly matchNumber: number;
    readonly winner: 'p1' | 'p2' | 'draw' | null;
    readonly turnsPlayed: number;
}

export interface MatchStats {
    readonly turnsPlayed: number;
    readonly hits: number;
    readonly misses: number;
    readonly crits: number;
    readonly damageByPlayer: Record<PlayerId, number>;
    readonly perUnit: Record<string, {
        readonly kills: number;
        readonly damageTaken: number;
        readonly attacksLanded: number;
        readonly turnsSurvived: number;
    }>;
}

export interface AttackResolution {
    readonly nextState: GameState;
    readonly attackerId: string;
    readonly targetId: string;
    readonly damage: number;
    readonly outcome: AttackOutcome;
    readonly targetPosition: Position;
}

export interface TargetingPreview {
    readonly attackerId: string;
    readonly targetId: string;
    readonly missChance: number;
    readonly hitChance: number;
    readonly critChance: number;
    readonly minDamage: number;
    readonly maxDamage: number;
    readonly minCritDamage: number;
    readonly maxCritDamage: number;
    readonly coverBonus: number;
    readonly effectiveCritChance: number;
    readonly breakdown: {
        readonly baseAttack: number;
        readonly varianceRange: readonly [number, number];
        readonly critMultiplier: number;
        readonly armorReduction: number;
        readonly guardReduction: number;
    };
}


export interface InitialGameOptions {
    readonly mapPresetId?: MapPresetId;
    readonly mapSeed?: number;
    readonly firstPlayer?: PlayerId;
    readonly autoSkipNoTargetAttack?: boolean;
    readonly seriesMode?: boolean;
    readonly playerNames?: { p1: string; p2: string };
}

const DEFAULT_GRID_SIZE = 8
const DEFAULT_RANDOM_MAP_SEED = 1337
const DEFAULT_BLOCKED_TILE_TARGET_COUNT = 8
const BLOCKED_TILE_MAX_ATTEMPTS = 400
const EVENT_LOG_LIMIT = 80
const INITIAL_TURN = 1

function createSeededRng(seed: number): () => number {
    let state = seed >>> 0;
    return () => {
        state = (1664525 * state + 1013904223) >>> 0;
        return state / 0x100000000;
    };
}

function getSpawnPositionSet(): Set<string> {
    return new Set(UNIT_START_POSITIONS.map((position) => positionKey(position)));
}

function sanitizeBlockedTilesAgainstSpawns(tiles: ReadonlyArray<Position>): Position[] {
    const spawnSet = getSpawnPositionSet();
    return tiles.filter((tile) => !spawnSet.has(positionKey(tile))).map((tile) => ({ ...tile }));
}

function generateSeededBlockedTiles(
    gridSize: number,
    seed: number,
    reservedPositions: ReadonlyArray<Position>,
    targetCount = DEFAULT_BLOCKED_TILE_TARGET_COUNT,
): Position[] {
    const rng = createSeededRng(seed);
    const reserved = new Set(reservedPositions.map((p) => positionKey(p)));
    const blocked = new Set<string>();
    const maxAttempts = BLOCKED_TILE_MAX_ATTEMPTS;

    let attempts = 0;
    while (blocked.size < targetCount && attempts < maxAttempts) {
        attempts++;
        const x = Math.floor(rng() * gridSize);
        const y = Math.floor(rng() * gridSize);
        const key = `${x},${y}`;
        if (reserved.has(key)) continue;
        blocked.add(key);
    }

    return Array.from(blocked).map((key) => {
        const [x, y] = key.split(',').map(Number);
        return { x, y };
    });
}

function createGameConfig(
    mapPresetId: MapPresetId,
    mapSeed?: number,
): GameConfig {
    const gridSize = DEFAULT_GRID_SIZE;

    if (mapPresetId === 'random-seeded') {
        const seed = mapSeed ?? DEFAULT_RANDOM_MAP_SEED;
        return {
            gridSize,
            mapPresetId,
            mapSeed: seed,
            blockedTiles: generateSeededBlockedTiles(gridSize, seed, UNIT_START_POSITIONS),
        };
    }

    return {
        gridSize,
        mapPresetId,
        blockedTiles: sanitizeBlockedTilesAgainstSpawns(FIXED_MAP_PRESETS[mapPresetId]),
    };
}

const PHASE_TRANSITIONS: Record<Phase, ReadonlyArray<Phase>> = {
    [Phase.SELECT_UNIT]: [Phase.MOVE_UNIT, Phase.ATTACK, Phase.END_TURN],
    [Phase.MOVE_UNIT]: [Phase.SELECT_UNIT, Phase.ATTACK, Phase.END_TURN],
    [Phase.ATTACK]: [Phase.MOVE_UNIT, Phase.END_TURN, Phase.SELECT_UNIT],
    [Phase.END_TURN]: [Phase.SELECT_UNIT],
};

export const createPhaseFSM = (initialState: Phase = Phase.SELECT_UNIT) =>
    new FSM<Phase>(initialState, PHASE_TRANSITIONS);

function createUnitFromArchetype(
    id: string,
    playerId: PlayerId,
    archetype: UnitArchetype,
    position: Position
): UnitData {
    const stats = UNIT_ARCHETYPES[archetype];

    return {
        id,
        playerId,
        archetype,
        maxHealth: stats.maxHealth,
        position: { ...position },
        health: stats.maxHealth,
        movement: stats.movement,
        attack: stats.attack,
        range: stats.range,
        hasMoved: false,
        hasAttacked: false,
        hasUsedAbility: false,
        statusEffects: {
            armorUpTurns: 0,
            poisonTurns: 0,
            guardTurns: 0,
            aimTurns: 0,
            dashBonusMovement: 0,
        },
    };
}

export function createInitialGameState(options: InitialGameOptions = {}): GameState {
    const mapPresetId = options.mapPresetId ?? 'crossroads';
    const mapSeed = options.mapSeed;
    const firstPlayer = options.firstPlayer ?? 'p1';
    const firstPlayerIndex = firstPlayer === 'p1' ? 0 : 1;

    // Start series if in series mode
    if (options.seriesMode) {
        const playerNames = options.playerNames || { p1: 'Player 1', p2: 'Player 2' };
        seriesManager.startSeries(mapPresetId, playerNames);
    }

    const units = [
        createUnitFromArchetype('u1', 'p1', 'scout', { x: 1, y: 1 }),
        createUnitFromArchetype('u2', 'p1', 'bruiser', { x: 1, y: 3 }),
        createUnitFromArchetype('u3', 'p1', 'sniper', { x: 2, y: 2 }),
        createUnitFromArchetype('u4', 'p2', 'scout', { x: 6, y: 6 }),
        createUnitFromArchetype('u5', 'p2', 'bruiser', { x: 6, y: 4 }),
        createUnitFromArchetype('u6', 'p2', 'sniper', { x: 5, y: 5 }),
    ];

    return {
        config: createGameConfig(mapPresetId, mapSeed),
        phaseFSM: createPhaseFSM(),
        phase: Phase.SELECT_UNIT,
        autoSkipNoTargetAttack: options.autoSkipNoTargetAttack ?? false,
        currentPlayer: firstPlayer,
        currentPlayerIndex: firstPlayerIndex,
        turn: INITIAL_TURN,
        selectedUnitId: null,
        matchStats: {
            turnsPlayed: 0,
            hits: 0,
            misses: 0,
            crits: 0,
            damageByPlayer: {
                p1: 0,
                p2: 0,
            },
            perUnit: Object.fromEntries(
                units.map((unit) => [
                    unit.id,
                    {
                        kills: 0,
                        damageTaken: 0,
                        attacksLanded: 0,
                        turnsSurvived: 0,
                    },
                ])
            ),
        },
        eventLog: [],
        units,
    };
}

function appendEvents(state: GameState, events: ReadonlyArray<GameEvent>): ReadonlyArray<GameEvent> {
    if (events.length === 0) return state.eventLog;
    return [...state.eventLog, ...events].slice(-EVENT_LOG_LIMIT);
}

export {
    canUnitAttack,
    canUnitMove,
    canUseActiveAbility,
    getUnitAt,
    getUnitById,
    hasAvailableActionsForCurrentPlayer,
    hasUnitFinishedTurn,
    isBlockedTile,
    isCurrentPlayersUnit,
} from './selectors'
export {
    calculateAttackableTilesInState,
    getAttackableEnemies,
    getTargetingPreview,
    hasLineOfSight,
} from './rules/combat'
export {
    calculateReachableTiles,
    calculateReachableTilesInState,
} from './rules/movement'

export function withPhase(state: GameState, phase: Phase): GameState {
    if (state.phase === phase) return state;
    const fsm = state.phaseFSM.state === state.phase
        ? state.phaseFSM
        : createPhaseFSM(state.phase)
    const canTransition = fsm.can(phase)
    if (!canTransition) return state;

    return {
        ...state,
        phaseFSM: createPhaseFSM(phase),
        phase,
    };
}

export function toPersistedGameState(state: GameState): PersistedGameState {
    return stripPersistedState(state)
}

export function fromPersistedGameState(state: PersistedGameState): GameState {
    return restorePersistedState(state, createPhaseFSM)
}

export function selectUnit(state: GameState, unitId: string): GameState {
    const unit = getUnitById(state, unitId);
    if (!unit) return state;

    if (hasUnitFinishedTurn(unit)) {
        return withPhase({ ...state, selectedUnitId: null }, Phase.SELECT_UNIT);
    }

    const nextPhase = canUnitMove(unit) ? Phase.MOVE_UNIT : Phase.ATTACK;
    const selectedState = withPhase({ ...state, selectedUnitId: unitId }, nextPhase);
    return maybeAutoSkipNoTargetAttack(selectedState);
}

export function deselectUnit(state: GameState): GameState {
    return withPhase({...state, selectedUnitId: null }, Phase.SELECT_UNIT);
}

export function moveSelectedUnit(state: GameState, newPos: Position): GameState {
    const { selectedUnitId } = state;
    if (!selectedUnitId) return state;

    const selectedUnit = getUnitById(state, selectedUnitId);
    if (!selectedUnit) return state;
    if (!canUnitMove(selectedUnit)) return state;

    if (isBlockedTile(state, newPos)) return state;
    
    // Use A* pathfinding to check if the position is reachable
    const effectiveMovement = getEffectiveMovement(selectedUnit);
    const path = getShortestPathToPosition(state, selectedUnit.position, newPos, effectiveMovement);
    
    if (path.length === 0) return state;

    const occupiedUnit = getUnitAt(state, newPos);
    if (occupiedUnit && occupiedUnit.id !== selectedUnitId) return state;

    const units = state.units.map(u =>
        u.id === selectedUnitId
            ? {
                ...u,
                position: { ...newPos },
                hasMoved: true,
                statusEffects: {
                    ...u.statusEffects,
                    dashBonusMovement: 0,
                },
            }
            : u
    );

    const moveEvent: MoveEvent = {
        type: 'move',
        timestamp: Date.now(),
        unitId: selectedUnitId,
        from: { ...selectedUnit.position },
        to: { ...newPos },
    };

    // Keep the selectedUnitId so we know which unit can attack
    const withMovedUnit = { ...state, units, eventLog: appendEvents(state, [moveEvent]) };

    const movedState = withPhase(withMovedUnit, Phase.ATTACK);
    return maybeAutoSkipNoTargetAttack(movedState);
}

export function undoSelectedUnitMove(state: GameState, from: Position): GameState {
    const selectedUnit = getUnitById(state, state.selectedUnitId);
    if (!selectedUnit) return state;
    if (state.phase !== Phase.ATTACK) return state;

    const to = { ...selectedUnit.position };
    const units = state.units.map((unit) =>
        unit.id === selectedUnit.id
            ? {
                ...unit,
                position: { ...from },
                hasMoved: false,
            }
            : unit
    );

    const undoEvent: UndoMoveEvent = {
        type: 'undo_move',
        timestamp: Date.now(),
        unitId: selectedUnit.id,
        from: { ...from },
        to,
    };

    return withPhase({ ...state, units, eventLog: appendEvents(state, [undoEvent]) }, Phase.MOVE_UNIT);
}

export function endTurn(state: GameState): GameState {
    const nextPlayer: PlayerId = state.currentPlayer === 'p1' ? 'p2' : 'p1';
    const nextPlayerIndex = state.currentPlayerIndex === 0 ? 1 : 0;
    const nextTurn = nextPlayerIndex === 0 ? state.turn + 1 : state.turn;
    const refreshedUnits = state.units.map((unit) => {
        if (unit.playerId !== nextPlayer) return unit;

        const ticked = applyTurnStartStatusTick(unit);
        const buffed = applyTurnStartClassBuffs(ticked);
        return {
            ...buffed,
            hasMoved: false,
            hasAttacked: false,
            hasUsedAbility: false,
        };
    });

    // Debug logging to track unit states
    if (process.env.NODE_ENV === 'development') {
        console.log('End Turn - Unit States:', refreshedUnits.map(u => ({
            id: u.id,
            playerId: u.playerId,
            hasMoved: u.hasMoved,
            hasAttacked: u.hasAttacked,
            hasUsedAbility: u.hasUsedAbility
        })));
    }

    const livingUnits = refreshedUnits.filter((unit) => unit.health > 0);
    const previousLivingIds = new Set(state.units.filter((unit) => unit.health > 0).map((unit) => unit.id));
    const currentLivingIds = new Set(livingUnits.map((unit) => unit.id));
    const deathsFromTick: DeathEvent[] = Array.from(previousLivingIds)
        .filter((id) => !currentLivingIds.has(id))
        .map((id) => ({
            type: 'death',
            timestamp: Date.now(),
            unitId: id,
            byPlayer: 'environment' as const,
        }));
    const turnEndEvent: TurnEndEvent = {
        type: 'turn_end',
        timestamp: Date.now(),
        nextPlayer,
        turn: nextTurn,
    };

    const reset = { 
        ...state, 
        units: livingUnits,
        currentPlayer: nextPlayer,
        currentPlayerIndex: nextPlayerIndex,
        turn: nextTurn,
        matchStats: {
            ...state.matchStats,
            turnsPlayed: state.matchStats.turnsPlayed + 1,
            perUnit: livingUnits.reduce((acc, unit) => {
                const previous = state.matchStats.perUnit[unit.id] ?? {
                    kills: 0,
                    damageTaken: 0,
                    attacksLanded: 0,
                    turnsSurvived: 0,
                };
                acc[unit.id] = {
                    ...previous,
                    turnsSurvived: previous.turnsSurvived + 1,
                };
                return acc;
            }, { ...state.matchStats.perUnit } as MatchStats['perUnit']),
        },
        eventLog: appendEvents(state, [...deathsFromTick, turnEndEvent]),
        selectedUnitId: null 
    };
    return withPhase(reset, Phase.SELECT_UNIT);
}

/**
 * End the current match and record it in the series
 */
export function endMatch(state: GameState, matchNumber: number): GameState {
    // Record match end in series manager
    const seriesSummary = seriesManager.recordMatchEnd(state, matchNumber);
    
    // Add match end event to log
    const matchEndEvent = {
        type: 'match_end' as const,
        timestamp: Date.now(),
        matchNumber,
        winner: seriesSummary?.winner || null,
        turnsPlayed: state.matchStats.turnsPlayed,
    };

    return {
        ...state,
        eventLog: appendEvents(state, [matchEndEvent]),
    };
}

/**
 * Get current series information
 */
export function getCurrentSeries() {
    return seriesManager.getCurrentSeries();
}

/**
 * Get series history
 */
export function getSeriesHistory(limit = 10) {
    return seriesManager.getSeriesHistory(limit);
}

/**
 * Get quick rematch options
 */
export function getQuickRematchOptions() {
    return seriesManager.getQuickRematchOptions();
}

/**
 * Clear series history
 */
export function clearSeriesHistory() {
    seriesManager.clearHistory();
}

/**
 * Save game state to a specific slot
 */
export function saveToSlot(slotId: string, gameState: GameState, customName?: string): boolean {
    const persistedState = toPersistedGameState(gameState);
    return saveSlotManager.saveToSlot(slotId, persistedState, customName);
}

/**
 * Load game state from a specific slot
 */
export function loadFromSlot(slotId: string): GameState | null {
    const persistedState = saveSlotManager.loadFromSlot(slotId);
    if (!persistedState) return null;
    return fromPersistedGameState(persistedState);
}

/**
 * Get all save slot summaries
 */
export function getAllSaveSlotSummaries() {
    return saveSlotManager.getAllSlotSummaries();
}

/**
 * Delete a save slot
 */
export function deleteSaveSlot(slotId: string): boolean {
    return saveSlotManager.deleteSlot(slotId);
}

/**
 * Rename a save slot
 */
export function renameSaveSlot(slotId: string, newName: string): boolean {
    return saveSlotManager.renameSlot(slotId, newName);
}

/**
 * Check if a save slot exists
 */
export function saveSlotExists(slotId: string): boolean {
    return saveSlotManager.slotExists(slotId);
}

/**
 * Get the number of used save slots
 */
export function getUsedSaveSlotCount(): number {
    return saveSlotManager.getUsedSlotCount();
}

/**
 * Get available save slot IDs
 */
export function getAvailableSaveSlotIds(): string[] {
    return saveSlotManager.getAvailableSlotIds();
}

/**
 * Clear all save slots
 */
export function clearAllSaveSlots(): boolean {
    return saveSlotManager.clearAllSlots();
}

/**
 * Export all save slots
 */
export function exportAllSaveSlots(): string {
    return saveSlotManager.exportAllSlots();
}

/**
 * Import save slots from backup
 */
export function importSaveSlots(jsonString: string): boolean {
    return saveSlotManager.importSlots(jsonString);
}

/**
 * Quick save to the first available slot
 */
export function quickSave(gameState: GameState): string | null {
    const persistedState = toPersistedGameState(gameState);
    return saveSlotManager.quickSave(persistedState);
}

/**
 * Create a new replay from game state
 */
export function createReplay(gameState: GameState, playerNames: { p1: string; p2: string }) {
    return replayManager.createReplay(gameState, playerNames);
}

/**
 * Start recording a replay
 */
export function startReplayRecording(metadata: any) {
    replayManager.startRecording(metadata);
}

/**
 * Stop recording a replay
 */
export function stopReplayRecording() {
    return replayManager.stopRecording();
}

/**
 * Add an event to the current replay
 */
export function addReplayEvent(event: ReplayEvent) {
    replayManager.addEvent(event);
}

/**
 * Get available replays
 */
export function getAvailableReplays() {
    return replayManager.getAvailableReplays();
}

/**
 * Load a replay for playback
 */
export function loadReplay(matchId: string) {
    return replayManager.loadReplay(matchId);
}

/**
 * Start replay playback
 */
export function startReplayPlayback(replayState: any, onEvent: (event: ReplayEvent) => void) {
    replayManager.startPlayback(replayState, onEvent);
}

/**
 * Stop replay playback
 */
export function stopReplayPlayback() {
    replayManager.stopPlayback();
}

/**
 * Set replay playback speed
 */
export function setReplayPlaybackSpeed(speed: number) {
    replayManager.setPlaybackSpeed(speed);
}

/**
 * Get current replay state
 */
export function getCurrentReplay() {
    return replayManager.getCurrentReplay();
}

/**
 * Export replay for sharing
 */
export function exportReplay(matchId: string): string {
    return replayManager.exportReplay(matchId);
}

/**
 * Import replay from shared data
 */
export function importReplay(jsonString: string): boolean {
    return replayManager.importReplay(jsonString);
}

/**
 * Delete a replay
 */
export function deleteReplay(matchId: string): boolean {
    return replayManager.deleteReplay(matchId);
}

/**
 * Clear all replays
 */
export function clearAllReplays(): boolean {
    return replayManager.clearAllReplays();
}

export function finishAttackSequence(state: GameState): GameState {
    const livingUnits = state.units.filter((u) => u.health > 0);
    return withPhase({ ...state, units: livingUnits, selectedUnitId: null }, Phase.SELECT_UNIT);
}

export function skipAttackForSelectedUnit(state: GameState): GameState {
    const selectedUnit = getUnitById(state, state.selectedUnitId);
    if (!selectedUnit) return state;
    if (!canUnitAttack(selectedUnit)) return withPhase({ ...state, selectedUnitId: null }, Phase.SELECT_UNIT);

    const units = state.units.map((unit) =>
        unit.id === selectedUnit.id ? { ...unit, hasAttacked: true } : unit
    );

    return withPhase({ ...state, units, selectedUnitId: null }, Phase.SELECT_UNIT);
}

function maybeAutoSkipNoTargetAttack(state: GameState): GameState {
    if (!state.autoSkipNoTargetAttack) return state;
    if (state.phase !== Phase.ATTACK) return state;

    const selectedUnit = getUnitById(state, state.selectedUnitId);
    if (!selectedUnit) return state;
    if (!canUnitAttack(selectedUnit)) return state;

    const attackableEnemies = getAttackableEnemies(state, selectedUnit);
    if (attackableEnemies.length > 0) return state;

    const postSkip = skipAttackForSelectedUnit(state);
    return hasAvailableActionsForCurrentPlayer(postSkip)
        ? postSkip
        : endTurn(postSkip);
}

export function getWinner(state: GameState): PlayerId | null {
    const p1Alive = state.units.some((u) => u.playerId === 'p1' && u.health > 0);
    const p2Alive = state.units.some((u) => u.playerId === 'p2' && u.health > 0);

    if (p1Alive && !p2Alive) return 'p1';
    if (p2Alive && !p1Alive) return 'p2';
    return null;
}

export function useActiveAbilityForSelectedUnit(state: GameState): GameState {
    const unit = getUnitById(state, state.selectedUnitId);
    if (!unit) return state;
    if (!isCurrentPlayersUnit(state, unit)) return state;
    if (!canUseActiveAbility(unit)) return state;

    const units = state.units.map((candidate) => {
        if (candidate.id !== unit.id) return candidate;

        if (candidate.archetype === 'scout') {
            if (candidate.hasMoved) return candidate;
            return {
                ...candidate,
                hasUsedAbility: true,
                statusEffects: {
                    ...candidate.statusEffects,
                    dashBonusMovement: CONSTANTS.COMBAT.SCOUT_DASH_BONUS_MOVEMENT,
                },
            };
        }

        if (candidate.archetype === 'bruiser') {
            return {
                ...candidate,
                hasUsedAbility: true,
                statusEffects: {
                    ...candidate.statusEffects,
                    guardTurns: Math.max(candidate.statusEffects.guardTurns, 1),
                },
            };
        }

        if (candidate.archetype === 'sniper') {
            return {
                ...candidate,
                hasUsedAbility: true,
                statusEffects: {
                    ...candidate.statusEffects,
                    aimTurns: Math.max(candidate.statusEffects.aimTurns, 1),
                },
            };
        }

        return candidate;
    });

    return {
        ...state,
        units,
    };
}


export function attackUnit(state: GameState, targetId: string): GameState {
    const resolution = resolveAttack(state, targetId);
    if (!resolution) return state;

    return withPhase(resolution.nextState, Phase.END_TURN);
}

export function resolveAttack(state: GameState, targetId: string): AttackResolution | null {
    const { selectedUnitId } = state;
    if (!selectedUnitId) return null;

    const attacker = getUnitById(state, selectedUnitId);
    const target = getUnitById(state, targetId);

    if (!attacker || !target) return null;
    if (!canUnitAttack(attacker)) return null;
    if (manhattanDistance(attacker.position, target.position) > attacker.range) return null;
    if (!hasLineOfSight(state, attacker.position, target.position)) return null;

    const targetPosition = { ...target.position };

    // Calculate hit outcome
    const roll = Math.random();
    const chances = getUnitAttackChances(state, attacker, target);

    let outcome: AttackOutcome = 'hit';
    if (roll < chances.missChance) {
        outcome = 'miss';
    } else if (roll > 1 - chances.critChance) {
        outcome = 'crit';
    }

    // Calculate damage: base attack + random variance, with crit bonus
    let damage = 0;
    let statusesApplied: string[] = [];
    let damageBreakdown: AttackEvent['damageBreakdown'] = undefined;
    if (outcome !== 'miss') {
        const baseDamage = attacker.attack;
        const variance = randomIntInRange(CONSTANTS.COMBAT.DAMAGE_VARIANCE_MIN, CONSTANTS.COMBAT.DAMAGE_VARIANCE_MAX);
        const rawDamage = Math.max(1, baseDamage + variance);
        const preMitigationDamage = outcome === 'crit' ? Math.round(rawDamage * CONSTANTS.COMBAT.CRIT_MULTIPLIER) : rawDamage;
        const armorReduction = target.statusEffects.armorUpTurns > 0 ? CONSTANTS.COMBAT.ARMOR_UP_DAMAGE_REDUCTION : 0;
        const guardReduction = target.statusEffects.guardTurns > 0 ? CONSTANTS.COMBAT.BRUISER_GUARD_DAMAGE_REDUCTION : 0;
        damage = Math.max(1, preMitigationDamage - armorReduction - guardReduction);
        damageBreakdown = {
            baseAttack: baseDamage,
            variance,
            critMultiplier: outcome === 'crit' ? CONSTANTS.COMBAT.CRIT_MULTIPLIER : 1,
            preMitigationDamage,
            armorReduction,
            guardReduction,
        };

        if (armorReduction > 0) {
            statusesApplied = [...statusesApplied, `Armor Up reduced damage by ${armorReduction}`];
        }
        if (guardReduction > 0) {
            statusesApplied = [...statusesApplied, `Guard reduced damage by ${guardReduction}`];
        }
    }

    // Apply damage to target
    let targetDied = false;
    const units = state.units.map(u => {
        if (u.id === selectedUnitId) {
            return { ...u, hasAttacked: true };
        }
        if (u.id === targetId) {
            const shouldApplyPoison =
                outcome !== 'miss' &&
                attacker.archetype === 'sniper' &&
                u.health > 0;

            const newHealth = Math.max(0, u.health - damage);
            targetDied = newHealth <= 0 && u.health > 0;
            const nextPoisonTurns = shouldApplyPoison
                ? Math.max(u.statusEffects.poisonTurns, CONSTANTS.COMBAT.POISON_DURATION_TURNS)
                : u.statusEffects.poisonTurns;

            if (shouldApplyPoison) {
                statusesApplied = [...statusesApplied, `Poisoned (${CONSTANTS.COMBAT.POISON_DURATION_TURNS} turns)`];
            }

            return {
                ...u,
                health: newHealth,
                statusEffects: {
                    ...u.statusEffects,
                    poisonTurns: nextPoisonTurns,
                },
            };
        }
        return u;
    });

    const attackEvent: AttackEvent = {
        type: 'attack',
        timestamp: Date.now(),
        attackerId: selectedUnitId,
        targetId,
        damage,
        outcome,
        statusesApplied: statusesApplied.length > 0 ? statusesApplied : undefined,
        damageBreakdown,
    };
    const deathEvents: DeathEvent[] = targetDied
        ? [{
            type: 'death',
            timestamp: Date.now(),
            unitId: targetId,
            byPlayer: attacker.playerId,
        }]
        : [];

    return {
        nextState: {
        ...state,
        units, 
        matchStats: {
            ...state.matchStats,
            hits: state.matchStats.hits + (outcome === 'hit' ? 1 : 0),
            misses: state.matchStats.misses + (outcome === 'miss' ? 1 : 0),
            crits: state.matchStats.crits + (outcome === 'crit' ? 1 : 0),
            damageByPlayer: {
                ...state.matchStats.damageByPlayer,
                [attacker.playerId]: state.matchStats.damageByPlayer[attacker.playerId] + damage,
            },
            perUnit: {
                ...state.matchStats.perUnit,
                [targetId]: {
                    ...(state.matchStats.perUnit[targetId] ?? {
                        kills: 0,
                        damageTaken: 0,
                        attacksLanded: 0,
                        turnsSurvived: 0,
                    }),
                    damageTaken: (state.matchStats.perUnit[targetId]?.damageTaken ?? 0) + damage,
                },
                [attacker.id]: {
                    ...(state.matchStats.perUnit[attacker.id] ?? {
                        kills: 0,
                        damageTaken: 0,
                        attacksLanded: 0,
                        turnsSurvived: 0,
                    }),
                    kills: (state.matchStats.perUnit[attacker.id]?.kills ?? 0) + (targetDied ? 1 : 0),
                    attacksLanded: (state.matchStats.perUnit[attacker.id]?.attacksLanded ?? 0) + (outcome === 'miss' ? 0 : 1),
                },
            },
        },
        eventLog: appendEvents(state, [attackEvent, ...deathEvents]),
        selectedUnitId: null,
        lastAction: {
            type: 'attack',
            attackerId: selectedUnitId,
            targetId,
            damage,
            outcome,
            statusesApplied: statusesApplied.length > 0 ? statusesApplied : undefined,
            timestamp: Date.now()
        }
        },
        attackerId: selectedUnitId,
        targetId,
        damage,
        outcome,
        targetPosition,
    };
}