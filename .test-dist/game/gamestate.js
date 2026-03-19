"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateReachableTilesInState = exports.calculateReachableTiles = exports.hasLineOfSight = exports.getTargetingPreview = exports.getAttackableEnemies = exports.calculateAttackableTilesInState = exports.isCurrentPlayersUnit = exports.isBlockedTile = exports.hasUnitFinishedTurn = exports.hasAvailableActionsForCurrentPlayer = exports.getUnitById = exports.getUnitAt = exports.getActiveAbilityName = exports.getActiveAbilityId = exports.getActiveAbilityCooldownTurns = exports.getActiveAbilityAvailability = exports.canUseActiveAbility = exports.canUnitMove = exports.canUnitAttack = exports.createPhaseFSM = exports.Phase = exports.BRUISER_GUARD_DAMAGE_REDUCTION = exports.SNIPER_AIM_MOVE_PENALTY = exports.SNIPER_AIM_CRIT_BONUS = exports.SCOUT_DASH_BONUS_MOVEMENT = exports.COVER_MISS_BONUS = exports.ARMOR_UP_DAMAGE_REDUCTION = exports.ARMOR_UP_DURATION_TURNS = exports.POISON_DURATION_TURNS = exports.POISON_DAMAGE_PER_TURN = exports.CRIT_MULTIPLIER = exports.DAMAGE_VARIANCE_MAX = exports.DAMAGE_VARIANCE_MIN = exports.CRIT_CHANCE = exports.MISS_CHANCE = exports.UNIT_ARCHETYPES = exports.MAP_PRESET_LABELS = void 0;
exports.createInitialGameState = createInitialGameState;
exports.withPhase = withPhase;
exports.toPersistedGameState = toPersistedGameState;
exports.fromPersistedGameState = fromPersistedGameState;
exports.selectUnit = selectUnit;
exports.deselectUnit = deselectUnit;
exports.moveSelectedUnit = moveSelectedUnit;
exports.undoSelectedUnitMove = undoSelectedUnitMove;
exports.endTurn = endTurn;
exports.endMatch = endMatch;
exports.getCurrentSeries = getCurrentSeries;
exports.getSeriesHistory = getSeriesHistory;
exports.getQuickRematchOptions = getQuickRematchOptions;
exports.clearSeriesHistory = clearSeriesHistory;
exports.saveToSlot = saveToSlot;
exports.loadFromSlot = loadFromSlot;
exports.getAllSaveSlotSummaries = getAllSaveSlotSummaries;
exports.deleteSaveSlot = deleteSaveSlot;
exports.renameSaveSlot = renameSaveSlot;
exports.saveSlotExists = saveSlotExists;
exports.getUsedSaveSlotCount = getUsedSaveSlotCount;
exports.getAvailableSaveSlotIds = getAvailableSaveSlotIds;
exports.clearAllSaveSlots = clearAllSaveSlots;
exports.exportAllSaveSlots = exportAllSaveSlots;
exports.importSaveSlots = importSaveSlots;
exports.quickSave = quickSave;
exports.createReplay = createReplay;
exports.startReplayRecording = startReplayRecording;
exports.stopReplayRecording = stopReplayRecording;
exports.addReplayEvent = addReplayEvent;
exports.getAvailableReplays = getAvailableReplays;
exports.loadReplay = loadReplay;
exports.startReplayPlayback = startReplayPlayback;
exports.stopReplayPlayback = stopReplayPlayback;
exports.setReplayPlaybackSpeed = setReplayPlaybackSpeed;
exports.getCurrentReplay = getCurrentReplay;
exports.exportReplay = exportReplay;
exports.importReplay = importReplay;
exports.deleteReplay = deleteReplay;
exports.clearAllReplays = clearAllReplays;
exports.finishAttackSequence = finishAttackSequence;
exports.skipAttackForSelectedUnit = skipAttackForSelectedUnit;
exports.getWinner = getWinner;
exports.useActiveAbilityForSelectedUnit = useActiveAbilityForSelectedUnit;
exports.attackUnit = attackUnit;
exports.resolveAttack = resolveAttack;
const fsm_1 = require("./fsm");
const config_1 = require("./config");
const constants_1 = require("../constants");
const series_1 = require("./series");
const saveSlots_1 = require("./saveSlots");
const replay_1 = require("./replay");
var config_2 = require("./config");
Object.defineProperty(exports, "MAP_PRESET_LABELS", { enumerable: true, get: function () { return config_2.MAP_PRESET_LABELS; } });
Object.defineProperty(exports, "UNIT_ARCHETYPES", { enumerable: true, get: function () { return config_2.UNIT_ARCHETYPES; } });
Object.defineProperty(exports, "MISS_CHANCE", { enumerable: true, get: function () { return config_2.MISS_CHANCE; } });
Object.defineProperty(exports, "CRIT_CHANCE", { enumerable: true, get: function () { return config_2.CRIT_CHANCE; } });
Object.defineProperty(exports, "DAMAGE_VARIANCE_MIN", { enumerable: true, get: function () { return config_2.DAMAGE_VARIANCE_MIN; } });
Object.defineProperty(exports, "DAMAGE_VARIANCE_MAX", { enumerable: true, get: function () { return config_2.DAMAGE_VARIANCE_MAX; } });
Object.defineProperty(exports, "CRIT_MULTIPLIER", { enumerable: true, get: function () { return config_2.CRIT_MULTIPLIER; } });
Object.defineProperty(exports, "POISON_DAMAGE_PER_TURN", { enumerable: true, get: function () { return config_2.POISON_DAMAGE_PER_TURN; } });
Object.defineProperty(exports, "POISON_DURATION_TURNS", { enumerable: true, get: function () { return config_2.POISON_DURATION_TURNS; } });
Object.defineProperty(exports, "ARMOR_UP_DURATION_TURNS", { enumerable: true, get: function () { return config_2.ARMOR_UP_DURATION_TURNS; } });
Object.defineProperty(exports, "ARMOR_UP_DAMAGE_REDUCTION", { enumerable: true, get: function () { return config_2.ARMOR_UP_DAMAGE_REDUCTION; } });
Object.defineProperty(exports, "COVER_MISS_BONUS", { enumerable: true, get: function () { return config_2.COVER_MISS_BONUS; } });
Object.defineProperty(exports, "SCOUT_DASH_BONUS_MOVEMENT", { enumerable: true, get: function () { return config_2.SCOUT_DASH_BONUS_MOVEMENT; } });
Object.defineProperty(exports, "SNIPER_AIM_CRIT_BONUS", { enumerable: true, get: function () { return config_2.SNIPER_AIM_CRIT_BONUS; } });
Object.defineProperty(exports, "SNIPER_AIM_MOVE_PENALTY", { enumerable: true, get: function () { return config_2.SNIPER_AIM_MOVE_PENALTY; } });
Object.defineProperty(exports, "BRUISER_GUARD_DAMAGE_REDUCTION", { enumerable: true, get: function () { return config_2.BRUISER_GUARD_DAMAGE_REDUCTION; } });
const selectors_1 = require("./selectors");
const persistence_1 = require("./persistence");
const combat_1 = require("./rules/combat");
const movement_1 = require("./rules/movement");
const pathfinding_1 = require("./pathfinding");
const turns_1 = require("./rules/turns");
const utils_1 = require("./utils");
var Phase;
(function (Phase) {
    Phase["SELECT_UNIT"] = "SELECT_UNIT";
    Phase["MOVE_UNIT"] = "MOVE_UNIT";
    Phase["ATTACK"] = "ATTACK";
    Phase["END_TURN"] = "END_TURN";
})(Phase || (exports.Phase = Phase = {}));
const DEFAULT_GRID_SIZE = 8;
const DEFAULT_RANDOM_MAP_SEED = 1337;
const DEFAULT_BLOCKED_TILE_TARGET_COUNT = 8;
const BLOCKED_TILE_MAX_ATTEMPTS = 400;
const EVENT_LOG_LIMIT = 80;
const INITIAL_TURN = 1;
function createSeededRng(seed) {
    let state = seed >>> 0;
    return () => {
        state = (1664525 * state + 1013904223) >>> 0;
        return state / 0x100000000;
    };
}
function getSpawnPositionSet() {
    return new Set(config_1.UNIT_START_POSITIONS.map((position) => (0, utils_1.positionKey)(position)));
}
function sanitizeBlockedTilesAgainstSpawns(tiles) {
    const spawnSet = getSpawnPositionSet();
    return tiles.filter((tile) => !spawnSet.has((0, utils_1.positionKey)(tile))).map((tile) => ({ ...tile }));
}
function generateSeededBlockedTiles(gridSize, seed, reservedPositions, targetCount = DEFAULT_BLOCKED_TILE_TARGET_COUNT) {
    const rng = createSeededRng(seed);
    const reserved = new Set(reservedPositions.map((p) => (0, utils_1.positionKey)(p)));
    const blocked = new Set();
    const maxAttempts = BLOCKED_TILE_MAX_ATTEMPTS;
    let attempts = 0;
    while (blocked.size < targetCount && attempts < maxAttempts) {
        attempts++;
        const x = Math.floor(rng() * gridSize);
        const y = Math.floor(rng() * gridSize);
        const key = `${x},${y}`;
        if (reserved.has(key))
            continue;
        blocked.add(key);
    }
    return Array.from(blocked).map((key) => {
        const [x, y] = key.split(',').map(Number);
        return { x, y };
    });
}
function createGameConfig(mapPresetId, mapSeed) {
    const gridSize = DEFAULT_GRID_SIZE;
    if (mapPresetId === 'random-seeded') {
        const seed = mapSeed ?? DEFAULT_RANDOM_MAP_SEED;
        return {
            gridSize,
            mapPresetId,
            mapSeed: seed,
            blockedTiles: generateSeededBlockedTiles(gridSize, seed, config_1.UNIT_START_POSITIONS),
            terrain: {}, // No terrain for random maps yet
        };
    }
    return {
        gridSize,
        mapPresetId,
        blockedTiles: sanitizeBlockedTilesAgainstSpawns(config_1.FIXED_MAP_PRESETS[mapPresetId]),
        terrain: config_1.FIXED_TERRAIN_PRESETS[mapPresetId],
    };
}
const PHASE_TRANSITIONS = {
    [Phase.SELECT_UNIT]: [Phase.MOVE_UNIT, Phase.ATTACK, Phase.END_TURN],
    [Phase.MOVE_UNIT]: [Phase.SELECT_UNIT, Phase.ATTACK, Phase.END_TURN],
    [Phase.ATTACK]: [Phase.MOVE_UNIT, Phase.END_TURN, Phase.SELECT_UNIT],
    [Phase.END_TURN]: [Phase.SELECT_UNIT],
};
const createPhaseFSM = (initialState = Phase.SELECT_UNIT) => new fsm_1.FSM(initialState, PHASE_TRANSITIONS);
exports.createPhaseFSM = createPhaseFSM;
function createUnitFromArchetype(id, playerId, archetype, position) {
    const stats = config_1.UNIT_ARCHETYPES[archetype];
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
        abilityCooldownRemaining: 0,
        statusEffects: {
            armorUpTurns: 0,
            poisonTurns: 0,
            guardTurns: 0,
            aimTurns: 0,
            dashBonusMovement: 0,
        },
    };
}
function createInitialGameState(options = {}) {
    const mapPresetId = options.mapPresetId ?? 'crossroads';
    const mapSeed = options.mapSeed;
    const firstPlayer = options.firstPlayer ?? 'p1';
    const firstPlayerIndex = firstPlayer === 'p1' ? 0 : 1;
    // Start series if in series mode
    if (options.seriesMode) {
        const playerNames = options.playerNames || { p1: 'Player 1', p2: 'Player 2' };
        series_1.seriesManager.startSeries(mapPresetId, playerNames);
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
        phaseFSM: (0, exports.createPhaseFSM)(),
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
            perUnit: Object.fromEntries(units.map((unit) => [
                unit.id,
                {
                    kills: 0,
                    damageTaken: 0,
                    attacksLanded: 0,
                    turnsSurvived: 0,
                },
            ])),
        },
        eventLog: [],
        units,
    };
}
function appendEvents(state, events) {
    if (events.length === 0)
        return state.eventLog;
    return [...state.eventLog, ...events].slice(-EVENT_LOG_LIMIT);
}
var selectors_2 = require("./selectors");
Object.defineProperty(exports, "canUnitAttack", { enumerable: true, get: function () { return selectors_2.canUnitAttack; } });
Object.defineProperty(exports, "canUnitMove", { enumerable: true, get: function () { return selectors_2.canUnitMove; } });
Object.defineProperty(exports, "canUseActiveAbility", { enumerable: true, get: function () { return selectors_2.canUseActiveAbility; } });
Object.defineProperty(exports, "getActiveAbilityAvailability", { enumerable: true, get: function () { return selectors_2.getActiveAbilityAvailability; } });
Object.defineProperty(exports, "getActiveAbilityCooldownTurns", { enumerable: true, get: function () { return selectors_2.getActiveAbilityCooldownTurns; } });
Object.defineProperty(exports, "getActiveAbilityId", { enumerable: true, get: function () { return selectors_2.getActiveAbilityId; } });
Object.defineProperty(exports, "getActiveAbilityName", { enumerable: true, get: function () { return selectors_2.getActiveAbilityName; } });
Object.defineProperty(exports, "getUnitAt", { enumerable: true, get: function () { return selectors_2.getUnitAt; } });
Object.defineProperty(exports, "getUnitById", { enumerable: true, get: function () { return selectors_2.getUnitById; } });
Object.defineProperty(exports, "hasAvailableActionsForCurrentPlayer", { enumerable: true, get: function () { return selectors_2.hasAvailableActionsForCurrentPlayer; } });
Object.defineProperty(exports, "hasUnitFinishedTurn", { enumerable: true, get: function () { return selectors_2.hasUnitFinishedTurn; } });
Object.defineProperty(exports, "isBlockedTile", { enumerable: true, get: function () { return selectors_2.isBlockedTile; } });
Object.defineProperty(exports, "isCurrentPlayersUnit", { enumerable: true, get: function () { return selectors_2.isCurrentPlayersUnit; } });
var combat_2 = require("./rules/combat");
Object.defineProperty(exports, "calculateAttackableTilesInState", { enumerable: true, get: function () { return combat_2.calculateAttackableTilesInState; } });
Object.defineProperty(exports, "getAttackableEnemies", { enumerable: true, get: function () { return combat_2.getAttackableEnemies; } });
Object.defineProperty(exports, "getTargetingPreview", { enumerable: true, get: function () { return combat_2.getTargetingPreview; } });
Object.defineProperty(exports, "hasLineOfSight", { enumerable: true, get: function () { return combat_2.hasLineOfSight; } });
var movement_2 = require("./rules/movement");
Object.defineProperty(exports, "calculateReachableTiles", { enumerable: true, get: function () { return movement_2.calculateReachableTiles; } });
Object.defineProperty(exports, "calculateReachableTilesInState", { enumerable: true, get: function () { return movement_2.calculateReachableTilesInState; } });
function withPhase(state, phase) {
    if (state.phase === phase)
        return state;
    const fsm = state.phaseFSM.state === state.phase
        ? state.phaseFSM
        : (0, exports.createPhaseFSM)(state.phase);
    const canTransition = fsm.can(phase);
    if (!canTransition)
        return state;
    return {
        ...state,
        phaseFSM: (0, exports.createPhaseFSM)(phase),
        phase,
    };
}
function toPersistedGameState(state) {
    return (0, persistence_1.toPersistedGameState)(state);
}
function fromPersistedGameState(state) {
    return (0, persistence_1.fromPersistedGameState)(state, exports.createPhaseFSM);
}
function selectUnit(state, unitId) {
    const unit = (0, selectors_1.getUnitById)(state, unitId);
    if (!unit)
        return state;
    if ((0, selectors_1.hasUnitFinishedTurn)(unit)) {
        return withPhase({ ...state, selectedUnitId: null }, Phase.SELECT_UNIT);
    }
    const nextPhase = (0, selectors_1.canUnitMove)(unit) ? Phase.MOVE_UNIT : Phase.ATTACK;
    const selectedState = withPhase({ ...state, selectedUnitId: unitId }, nextPhase);
    return maybeAutoSkipNoTargetAttack(selectedState);
}
function deselectUnit(state) {
    return withPhase({ ...state, selectedUnitId: null }, Phase.SELECT_UNIT);
}
function moveSelectedUnit(state, newPos) {
    const { selectedUnitId } = state;
    if (!selectedUnitId)
        return state;
    const selectedUnit = (0, selectors_1.getUnitById)(state, selectedUnitId);
    if (!selectedUnit)
        return state;
    if (!(0, selectors_1.canUnitMove)(selectedUnit))
        return state;
    if ((0, selectors_1.isBlockedTile)(state, newPos))
        return state;
    // Use A* pathfinding to check if the position is reachable
    const effectiveMovement = (0, movement_1.getEffectiveMovement)(selectedUnit);
    const path = (0, pathfinding_1.getShortestPathToPosition)(state, selectedUnit.position, newPos, effectiveMovement);
    if (path.length === 0)
        return state;
    const occupiedUnit = (0, selectors_1.getUnitAt)(state, newPos);
    if (occupiedUnit && occupiedUnit.id !== selectedUnitId)
        return state;
    const units = state.units.map(u => u.id === selectedUnitId
        ? {
            ...u,
            position: { ...newPos },
            hasMoved: true,
            statusEffects: {
                ...u.statusEffects,
                dashBonusMovement: 0,
            },
        }
        : u);
    const moveEvent = {
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
function undoSelectedUnitMove(state, from) {
    const selectedUnit = (0, selectors_1.getUnitById)(state, state.selectedUnitId);
    if (!selectedUnit)
        return state;
    if (state.phase !== Phase.ATTACK)
        return state;
    const to = { ...selectedUnit.position };
    const units = state.units.map((unit) => unit.id === selectedUnit.id
        ? {
            ...unit,
            position: { ...from },
            hasMoved: false,
        }
        : unit);
    const undoEvent = {
        type: 'undo_move',
        timestamp: Date.now(),
        unitId: selectedUnit.id,
        from: { ...from },
        to,
    };
    return withPhase({ ...state, units, eventLog: appendEvents(state, [undoEvent]) }, Phase.MOVE_UNIT);
}
function endTurn(state) {
    const nextPlayer = state.currentPlayer === 'p1' ? 'p2' : 'p1';
    const nextPlayerIndex = state.currentPlayerIndex === 0 ? 1 : 0;
    const nextTurn = nextPlayerIndex === 0 ? state.turn + 1 : state.turn;
    const refreshedUnits = state.units.map((unit) => {
        if (unit.playerId !== nextPlayer)
            return unit;
        const ticked = (0, turns_1.applyTurnStartStatusTick)(unit);
        const buffed = (0, turns_1.applyTurnStartClassBuffs)(ticked);
        return {
            ...buffed,
            hasMoved: false,
            hasAttacked: false,
            hasUsedAbility: false,
            abilityCooldownRemaining: Math.max(0, (buffed.abilityCooldownRemaining ?? 0) - 1),
        };
    });
    // Apply poison terrain effects
    const unitsAfterTerrain = refreshedUnits.map((unit) => {
        const terrain = (0, selectors_1.getTerrainAt)({ config: state.config }, unit.position);
        if (terrain === 'poison' && unit.health > 0) {
            const newHealth = Math.max(0, unit.health - constants_1.CONSTANTS.COMBAT.POISON_DAMAGE_PER_TURN);
            const targetDied = newHealth <= 0 && unit.health > 0;
            if (targetDied) {
                // Unit dies from poison terrain
                return {
                    ...unit,
                    health: 0,
                };
            }
            return {
                ...unit,
                health: newHealth,
            };
        }
        return unit;
    });
    // (tech-debt) Removed dev console spam.
    const livingUnits = unitsAfterTerrain.filter((unit) => unit.health > 0);
    const previousLivingIds = new Set(state.units.filter((unit) => unit.health > 0).map((unit) => unit.id));
    const currentLivingIds = new Set(livingUnits.map((unit) => unit.id));
    const deathsFromTick = Array.from(previousLivingIds)
        .filter((id) => !currentLivingIds.has(id))
        .map((id) => ({
        type: 'death',
        timestamp: Date.now(),
        unitId: id,
        byPlayer: 'environment',
    }));
    const turnEndEvent = {
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
            }, { ...state.matchStats.perUnit }),
        },
        eventLog: appendEvents(state, [...deathsFromTick, turnEndEvent]),
        selectedUnitId: null
    };
    return withPhase(reset, Phase.SELECT_UNIT);
}
/**
 * End the current match and record it in the series
 */
function endMatch(state, matchNumber) {
    // Record match end in series manager
    const seriesSummary = series_1.seriesManager.recordMatchEnd(state, matchNumber);
    // Add match end event to log
    const matchEndEvent = {
        type: 'match_end',
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
function getCurrentSeries() {
    return series_1.seriesManager.getCurrentSeries();
}
/**
 * Get series history
 */
function getSeriesHistory(limit = 10) {
    return series_1.seriesManager.getSeriesHistory(limit);
}
/**
 * Get quick rematch options
 */
function getQuickRematchOptions() {
    return series_1.seriesManager.getQuickRematchOptions();
}
/**
 * Clear series history
 */
function clearSeriesHistory() {
    series_1.seriesManager.clearHistory();
}
/**
 * Save game state to a specific slot
 */
function saveToSlot(slotId, gameState, customName) {
    const persistedState = toPersistedGameState(gameState);
    return saveSlots_1.saveSlotManager.saveToSlot(slotId, persistedState, customName);
}
/**
 * Load game state from a specific slot
 */
function loadFromSlot(slotId) {
    const persistedState = saveSlots_1.saveSlotManager.loadFromSlot(slotId);
    if (!persistedState)
        return null;
    return fromPersistedGameState(persistedState);
}
/**
 * Get all save slot summaries
 */
function getAllSaveSlotSummaries() {
    return saveSlots_1.saveSlotManager.getAllSlotSummaries();
}
/**
 * Delete a save slot
 */
function deleteSaveSlot(slotId) {
    return saveSlots_1.saveSlotManager.deleteSlot(slotId);
}
/**
 * Rename a save slot
 */
function renameSaveSlot(slotId, newName) {
    return saveSlots_1.saveSlotManager.renameSlot(slotId, newName);
}
/**
 * Check if a save slot exists
 */
function saveSlotExists(slotId) {
    return saveSlots_1.saveSlotManager.slotExists(slotId);
}
/**
 * Get the number of used save slots
 */
function getUsedSaveSlotCount() {
    return saveSlots_1.saveSlotManager.getUsedSlotCount();
}
/**
 * Get available save slot IDs
 */
function getAvailableSaveSlotIds() {
    return saveSlots_1.saveSlotManager.getAvailableSlotIds();
}
/**
 * Clear all save slots
 */
function clearAllSaveSlots() {
    return saveSlots_1.saveSlotManager.clearAllSlots();
}
/**
 * Export all save slots
 */
function exportAllSaveSlots() {
    return saveSlots_1.saveSlotManager.exportAllSlots();
}
/**
 * Import save slots from backup
 */
function importSaveSlots(jsonString) {
    return saveSlots_1.saveSlotManager.importSlots(jsonString);
}
/**
 * Quick save to the first available slot
 */
function quickSave(gameState) {
    const persistedState = toPersistedGameState(gameState);
    return saveSlots_1.saveSlotManager.quickSave(persistedState);
}
/**
 * Create a new replay from game state
 */
function createReplay(gameState, playerNames) {
    return replay_1.replayManager.createReplay(gameState, playerNames);
}
/**
 * Start recording a replay
 */
function startReplayRecording(metadata) {
    replay_1.replayManager.startRecording(metadata);
}
/**
 * Stop recording a replay
 */
function stopReplayRecording() {
    return replay_1.replayManager.stopRecording();
}
/**
 * Add an event to the current replay
 */
function addReplayEvent(event) {
    replay_1.replayManager.addEvent(event);
}
/**
 * Get available replays
 */
function getAvailableReplays() {
    return replay_1.replayManager.getAvailableReplays();
}
/**
 * Load a replay for playback
 */
function loadReplay(matchId) {
    return replay_1.replayManager.loadReplay(matchId);
}
/**
 * Start replay playback
 */
function startReplayPlayback(replayState, onEvent) {
    replay_1.replayManager.startPlayback(replayState, onEvent);
}
/**
 * Stop replay playback
 */
function stopReplayPlayback() {
    replay_1.replayManager.stopPlayback();
}
/**
 * Set replay playback speed
 */
function setReplayPlaybackSpeed(speed) {
    replay_1.replayManager.setPlaybackSpeed(speed);
}
/**
 * Get current replay state
 */
function getCurrentReplay() {
    return replay_1.replayManager.getCurrentReplay();
}
/**
 * Export replay for sharing
 */
function exportReplay(matchId) {
    return replay_1.replayManager.exportReplay(matchId);
}
/**
 * Import replay from shared data
 */
function importReplay(jsonString) {
    return replay_1.replayManager.importReplay(jsonString);
}
/**
 * Delete a replay
 */
function deleteReplay(matchId) {
    return replay_1.replayManager.deleteReplay(matchId);
}
/**
 * Clear all replays
 */
function clearAllReplays() {
    return replay_1.replayManager.clearAllReplays();
}
function finishAttackSequence(state) {
    const livingUnits = state.units.filter((u) => u.health > 0);
    return withPhase({ ...state, units: livingUnits, selectedUnitId: null }, Phase.SELECT_UNIT);
}
function skipAttackForSelectedUnit(state) {
    const selectedUnit = (0, selectors_1.getUnitById)(state, state.selectedUnitId);
    if (!selectedUnit)
        return state;
    if (!(0, selectors_1.canUnitAttack)(selectedUnit))
        return withPhase({ ...state, selectedUnitId: null }, Phase.SELECT_UNIT);
    const units = state.units.map((unit) => unit.id === selectedUnit.id ? { ...unit, hasAttacked: true } : unit);
    return withPhase({ ...state, units, selectedUnitId: null }, Phase.SELECT_UNIT);
}
function maybeAutoSkipNoTargetAttack(state) {
    if (!state.autoSkipNoTargetAttack)
        return state;
    if (state.phase !== Phase.ATTACK)
        return state;
    const selectedUnit = (0, selectors_1.getUnitById)(state, state.selectedUnitId);
    if (!selectedUnit)
        return state;
    if (!(0, selectors_1.canUnitAttack)(selectedUnit))
        return state;
    const attackableEnemies = (0, combat_1.getAttackableEnemies)(state, selectedUnit);
    if (attackableEnemies.length > 0)
        return state;
    const postSkip = skipAttackForSelectedUnit(state);
    return (0, selectors_1.hasAvailableActionsForCurrentPlayer)(postSkip)
        ? postSkip
        : endTurn(postSkip);
}
function getWinner(state) {
    const p1Alive = state.units.some((u) => u.playerId === 'p1' && u.health > 0);
    const p2Alive = state.units.some((u) => u.playerId === 'p2' && u.health > 0);
    if (p1Alive && !p2Alive)
        return 'p1';
    if (p2Alive && !p1Alive)
        return 'p2';
    return null;
}
function useActiveAbilityForSelectedUnit(state) {
    const unit = (0, selectors_1.getUnitById)(state, state.selectedUnitId);
    if (!unit)
        return state;
    if (!(0, selectors_1.isCurrentPlayersUnit)(state, unit))
        return state;
    if (!(0, selectors_1.canUseActiveAbility)(unit))
        return state;
    const cooldownTurns = (0, selectors_1.getActiveAbilityCooldownTurns)(unit);
    const units = state.units.map((candidate) => {
        if (candidate.id !== unit.id)
            return candidate;
        if (candidate.archetype === 'scout') {
            if (candidate.hasMoved)
                return candidate;
            return {
                ...candidate,
                hasUsedAbility: true,
                abilityCooldownRemaining: cooldownTurns,
                statusEffects: {
                    ...candidate.statusEffects,
                    dashBonusMovement: constants_1.CONSTANTS.COMBAT.SCOUT_DASH_BONUS_MOVEMENT,
                },
            };
        }
        if (candidate.archetype === 'bruiser') {
            return {
                ...candidate,
                hasUsedAbility: true,
                abilityCooldownRemaining: cooldownTurns,
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
                abilityCooldownRemaining: cooldownTurns,
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
function attackUnit(state, targetId) {
    const resolution = resolveAttack(state, targetId);
    if (!resolution)
        return state;
    return withPhase(resolution.nextState, Phase.END_TURN);
}
function resolveAttack(state, targetId) {
    const { selectedUnitId } = state;
    if (!selectedUnitId)
        return null;
    const attacker = (0, selectors_1.getUnitById)(state, selectedUnitId);
    const target = (0, selectors_1.getUnitById)(state, targetId);
    if (!attacker || !target)
        return null;
    if (!(0, selectors_1.canUnitAttack)(attacker))
        return null;
    if ((0, utils_1.manhattanDistance)(attacker.position, target.position) > attacker.range)
        return null;
    if (!(0, combat_1.hasLineOfSight)(state, attacker.position, target.position))
        return null;
    const targetPosition = { ...target.position };
    // Calculate hit outcome
    const roll = Math.random();
    const chances = (0, combat_1.getUnitAttackChances)(state, attacker, target);
    let outcome = 'hit';
    if (roll < chances.missChance) {
        outcome = 'miss';
    }
    else if (roll > 1 - chances.critChance) {
        outcome = 'crit';
    }
    // Calculate damage: base attack + random variance, with crit bonus
    let damage = 0;
    let statusesApplied = [];
    let damageBreakdown = undefined;
    if (outcome !== 'miss') {
        const baseDamage = attacker.attack;
        const variance = (0, utils_1.randomIntInRange)(constants_1.CONSTANTS.COMBAT.DAMAGE_VARIANCE_MIN, constants_1.CONSTANTS.COMBAT.DAMAGE_VARIANCE_MAX);
        const rawDamage = Math.max(1, baseDamage + variance);
        const preMitigationDamage = outcome === 'crit' ? Math.round(rawDamage * constants_1.CONSTANTS.COMBAT.CRIT_MULTIPLIER) : rawDamage;
        const armorReduction = target.statusEffects.armorUpTurns > 0 ? constants_1.CONSTANTS.COMBAT.ARMOR_UP_DAMAGE_REDUCTION : 0;
        const guardReduction = target.statusEffects.guardTurns > 0 ? constants_1.CONSTANTS.COMBAT.BRUISER_GUARD_DAMAGE_REDUCTION : 0;
        damage = Math.max(1, preMitigationDamage - armorReduction - guardReduction);
        damageBreakdown = {
            baseAttack: baseDamage,
            variance,
            critMultiplier: outcome === 'crit' ? constants_1.CONSTANTS.COMBAT.CRIT_MULTIPLIER : 1,
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
            const shouldApplyPoison = outcome !== 'miss' &&
                attacker.archetype === 'sniper' &&
                u.health > 0;
            const newHealth = Math.max(0, u.health - damage);
            targetDied = newHealth <= 0 && u.health > 0;
            const nextPoisonTurns = shouldApplyPoison
                ? Math.max(u.statusEffects.poisonTurns, constants_1.CONSTANTS.COMBAT.POISON_DURATION_TURNS)
                : u.statusEffects.poisonTurns;
            if (shouldApplyPoison) {
                statusesApplied = [...statusesApplied, `Poisoned (${constants_1.CONSTANTS.COMBAT.POISON_DURATION_TURNS} turns)`];
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
    const attackEvent = {
        type: 'attack',
        timestamp: Date.now(),
        attackerId: selectedUnitId,
        targetId,
        damage,
        outcome,
        statusesApplied: statusesApplied.length > 0 ? statusesApplied : undefined,
        damageBreakdown,
    };
    const deathEvents = targetDied
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
