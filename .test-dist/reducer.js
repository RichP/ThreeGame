"use strict";
/**
 * Game State Reducer
 *
 * Implements explicit action reducer pattern for easier testing and persistence.
 * Provides predictable state transitions and better separation of concerns.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerMiddleware = exports.selectors = exports.actionCreators = exports.ActionType = void 0;
exports.gameReducer = gameReducer;
exports.createGameStore = createGameStore;
const gamestate_1 = require("./gamestate");
const combat_1 = require("./rules/combat");
const movement_1 = require("./rules/movement");
const selectors_1 = require("./selectors");
// Action Types
var ActionType;
(function (ActionType) {
    // Core Game Actions
    ActionType["SELECT_UNIT"] = "SELECT_UNIT";
    ActionType["DESELECT_UNIT"] = "DESELECT_UNIT";
    ActionType["MOVE_UNIT"] = "MOVE_UNIT";
    ActionType["UNDO_MOVE"] = "UNDO_MOVE";
    ActionType["ATTACK"] = "ATTACK";
    ActionType["SKIP_ATTACK"] = "SKIP_ATTACK";
    ActionType["USE_ABILITY"] = "USE_ABILITY";
    ActionType["END_TURN"] = "END_TURN";
    ActionType["FINISH_ATTACK_SEQUENCE"] = "FINISH_ATTACK_SEQUENCE";
    // Series Actions
    ActionType["START_SERIES"] = "START_SERIES";
    ActionType["RECORD_MATCH_END"] = "RECORD_MATCH_END";
    ActionType["GET_SERIES_HISTORY"] = "GET_SERIES_HISTORY";
    ActionType["GET_QUICK_REMATCH_OPTIONS"] = "GET_QUICK_REMATCH_OPTIONS";
    ActionType["CLEAR_SERIES_HISTORY"] = "CLEAR_SERIES_HISTORY";
    // Save Actions
    ActionType["SAVE_TO_SLOT"] = "SAVE_TO_SLOT";
    ActionType["LOAD_FROM_SLOT"] = "LOAD_FROM_SLOT";
    ActionType["DELETE_SAVE_SLOT"] = "DELETE_SAVE_SLOT";
    ActionType["RENAME_SAVE_SLOT"] = "RENAME_SAVE_SLOT";
    ActionType["QUICK_SAVE"] = "QUICK_SAVE";
    ActionType["EXPORT_ALL_SAVE_SLOTS"] = "EXPORT_ALL_SAVE_SLOTS";
    ActionType["IMPORT_SAVE_SLOTS"] = "IMPORT_SAVE_SLOTS";
    // Replay Actions
    ActionType["CREATE_REPLAY"] = "CREATE_REPLAY";
    ActionType["START_REPLAY_RECORDING"] = "START_REPLAY_RECORDING";
    ActionType["STOP_REPLAY_RECORDING"] = "STOP_REPLAY_RECORDING";
    ActionType["ADD_REPLAY_EVENT"] = "ADD_REPLAY_EVENT";
    ActionType["START_REPLAY_PLAYBACK"] = "START_REPLAY_PLAYBACK";
    ActionType["STOP_REPLAY_PLAYBACK"] = "STOP_REPLAY_PLAYBACK";
    ActionType["SET_REPLAY_PLAYBACK_SPEED"] = "SET_REPLAY_PLAYBACK_SPEED";
    ActionType["EXPORT_REPLAY"] = "EXPORT_REPLAY";
    ActionType["IMPORT_REPLAY"] = "IMPORT_REPLAY";
    ActionType["DELETE_REPLAY"] = "DELETE_REPLAY";
    // System Actions
    ActionType["CREATE_INITIAL_GAME"] = "CREATE_INITIAL_GAME";
    ActionType["RESET_GAME"] = "RESET_GAME";
})(ActionType || (exports.ActionType = ActionType = {}));
// Action Creators
exports.actionCreators = {
    // Core Game Actions
    selectUnit: (unitId) => ({
        type: ActionType.SELECT_UNIT,
        payload: { unitId },
        meta: { timestamp: Date.now() }
    }),
    deselectUnit: () => ({
        type: ActionType.DESELECT_UNIT,
        meta: { timestamp: Date.now() }
    }),
    moveUnit: (position) => ({
        type: ActionType.MOVE_UNIT,
        payload: { position },
        meta: { timestamp: Date.now() }
    }),
    attack: (targetId) => ({
        type: ActionType.ATTACK,
        payload: { targetId },
        meta: { timestamp: Date.now() }
    }),
    useAbility: () => ({
        type: ActionType.USE_ABILITY,
        meta: { timestamp: Date.now() }
    }),
    endTurn: () => ({
        type: ActionType.END_TURN,
        meta: { timestamp: Date.now() }
    }),
    // Series Actions
    startSeries: (mapPresetId, playerNames) => ({
        type: ActionType.START_SERIES,
        payload: { mapPresetId, playerNames },
        meta: { timestamp: Date.now() }
    }),
    recordMatchEnd: (matchNumber) => ({
        type: ActionType.RECORD_MATCH_END,
        payload: { matchNumber },
        meta: { timestamp: Date.now() }
    }),
    // Save Actions
    saveToSlot: (slotId, customName) => ({
        type: ActionType.SAVE_TO_SLOT,
        payload: { slotId, customName },
        meta: { timestamp: Date.now() }
    }),
    loadFromSlot: (slotId) => ({
        type: ActionType.LOAD_FROM_SLOT,
        payload: { slotId },
        meta: { timestamp: Date.now() }
    }),
    // Replay Actions
    createReplay: (playerNames) => ({
        type: ActionType.CREATE_REPLAY,
        payload: { playerNames },
        meta: { timestamp: Date.now() }
    }),
    addReplayEvent: (event) => ({
        type: ActionType.ADD_REPLAY_EVENT,
        payload: { event },
        meta: { timestamp: Date.now() }
    }),
    // System Actions
    createInitialGame: (options) => ({
        type: ActionType.CREATE_INITIAL_GAME,
        payload: { options },
        meta: { timestamp: Date.now() }
    }),
};
// Initial State
const initialState = {
    gameState: null,
    isLoading: false,
    error: null,
    lastAction: null,
};
// Helper function to create replay events
function createReplayEvent(action, gameState) {
    const currentPlayer = gameState.currentPlayer;
    const turn = gameState.turn;
    switch (action.type) {
        case ActionType.SELECT_UNIT:
            return {
                type: 'select_unit',
                timestamp: Date.now(),
                playerId: currentPlayer,
                turn,
                details: {
                    unitId: action.payload.unitId
                }
            };
        case ActionType.MOVE_UNIT:
            const selectedUnit = gameState.selectedUnitId ? (0, selectors_1.getUnitById)(gameState, gameState.selectedUnitId) : null;
            if (!selectedUnit)
                return null;
            return {
                type: 'move',
                timestamp: Date.now(),
                playerId: currentPlayer,
                turn,
                details: {
                    unitId: selectedUnit.id,
                    from: { ...selectedUnit.position },
                    to: action.payload.position
                }
            };
        case ActionType.ATTACK:
            const attacker = gameState.selectedUnitId ? (0, selectors_1.getUnitById)(gameState, gameState.selectedUnitId) : null;
            if (!attacker)
                return null;
            return {
                type: 'attack',
                timestamp: Date.now(),
                playerId: currentPlayer,
                turn,
                details: {
                    attackerId: attacker.id,
                    targetId: action.payload.targetId
                }
            };
        case ActionType.USE_ABILITY:
            const unit = gameState.selectedUnitId ? (0, selectors_1.getUnitById)(gameState, gameState.selectedUnitId) : null;
            if (!unit)
                return null;
            return {
                type: 'use_ability',
                timestamp: Date.now(),
                playerId: currentPlayer,
                turn,
                details: {
                    unitId: unit.id,
                    abilityType: unit.archetype === 'scout' ? 'dash' :
                        unit.archetype === 'bruiser' ? 'guard' : 'aim'
                }
            };
        case ActionType.END_TURN:
            return {
                type: 'end_turn',
                timestamp: Date.now(),
                playerId: currentPlayer,
                turn,
                details: {
                    nextPlayer: gameState.currentPlayer === 'p1' ? 'p2' : 'p1'
                }
            };
        default:
            return null;
    }
}
// Reducer Function
function gameReducer(state = initialState, action) {
    try {
        switch (action.type) {
            // System Actions
            case ActionType.CREATE_INITIAL_GAME: {
                const gameState = (0, gamestate_1.createInitialGameState)(action.payload.options);
                return {
                    ...state,
                    gameState,
                    isLoading: false,
                    error: null,
                    lastAction: action,
                };
            }
            case ActionType.RESET_GAME: {
                return {
                    ...initialState,
                    lastAction: action,
                };
            }
            // Core Game Actions
            case ActionType.SELECT_UNIT: {
                if (!state.gameState)
                    return { ...state, error: 'No game state available' };
                const newState = (0, gamestate_1.selectUnit)(state.gameState, action.payload.unitId);
                // Add replay event if recording
                if ((0, gamestate_1.getCurrentReplay)()) {
                    const replayEvent = createReplayEvent(action, newState);
                    if (replayEvent) {
                        (0, gamestate_1.addReplayEvent)(replayEvent);
                    }
                }
                return {
                    ...state,
                    gameState: newState,
                    error: null,
                    lastAction: action,
                };
            }
            case ActionType.DESELECT_UNIT: {
                if (!state.gameState)
                    return { ...state, error: 'No game state available' };
                const newState = (0, gamestate_1.deselectUnit)(state.gameState);
                return {
                    ...state,
                    gameState: newState,
                    error: null,
                    lastAction: action,
                };
            }
            case ActionType.MOVE_UNIT: {
                if (!state.gameState)
                    return { ...state, error: 'No game state available' };
                const newState = (0, gamestate_1.moveSelectedUnit)(state.gameState, action.payload.position);
                // Add replay event if recording
                if ((0, gamestate_1.getCurrentReplay)()) {
                    const replayEvent = createReplayEvent(action, state.gameState);
                    if (replayEvent) {
                        (0, gamestate_1.addReplayEvent)(replayEvent);
                    }
                }
                return {
                    ...state,
                    gameState: newState,
                    error: null,
                    lastAction: action,
                };
            }
            case ActionType.ATTACK: {
                if (!state.gameState)
                    return { ...state, error: 'No game state available' };
                const newState = (0, gamestate_1.attackUnit)(state.gameState, action.payload.targetId);
                // Add replay event if recording
                if ((0, gamestate_1.getCurrentReplay)()) {
                    const replayEvent = createReplayEvent(action, state.gameState);
                    if (replayEvent) {
                        (0, gamestate_1.addReplayEvent)(replayEvent);
                    }
                }
                return {
                    ...state,
                    gameState: newState,
                    error: null,
                    lastAction: action,
                };
            }
            case ActionType.USE_ABILITY: {
                if (!state.gameState)
                    return { ...state, error: 'No game state available' };
                const newState = (0, gamestate_1.useActiveAbilityForSelectedUnit)(state.gameState);
                // Add replay event if recording
                if ((0, gamestate_1.getCurrentReplay)()) {
                    const replayEvent = createReplayEvent(action, state.gameState);
                    if (replayEvent) {
                        (0, gamestate_1.addReplayEvent)(replayEvent);
                    }
                }
                return {
                    ...state,
                    gameState: newState,
                    error: null,
                    lastAction: action,
                };
            }
            case ActionType.END_TURN: {
                if (!state.gameState)
                    return { ...state, error: 'No game state available' };
                const newState = (0, gamestate_1.endTurn)(state.gameState);
                // Add replay event if recording
                if ((0, gamestate_1.getCurrentReplay)()) {
                    const replayEvent = createReplayEvent(action, state.gameState);
                    if (replayEvent) {
                        (0, gamestate_1.addReplayEvent)(replayEvent);
                    }
                }
                return {
                    ...state,
                    gameState: newState,
                    error: null,
                    lastAction: action,
                };
            }
            // Series Actions
            case ActionType.START_SERIES: {
                // This would need to be handled differently as it modifies global state
                // For now, we'll just return the current state
                return {
                    ...state,
                    lastAction: action,
                };
            }
            case ActionType.RECORD_MATCH_END: {
                if (!state.gameState)
                    return { ...state, error: 'No game state available' };
                const newState = (0, gamestate_1.endMatch)(state.gameState, action.payload.matchNumber);
                return {
                    ...state,
                    gameState: newState,
                    error: null,
                    lastAction: action,
                };
            }
            // Save Actions
            case ActionType.SAVE_TO_SLOT: {
                if (!state.gameState)
                    return { ...state, error: 'No game state available' };
                const success = (0, gamestate_1.saveToSlot)(action.payload.slotId, state.gameState, action.payload.customName);
                if (!success) {
                    return {
                        ...state,
                        error: 'Failed to save to slot',
                        lastAction: action,
                    };
                }
                return {
                    ...state,
                    error: null,
                    lastAction: action,
                };
            }
            case ActionType.LOAD_FROM_SLOT: {
                const loadedState = (0, gamestate_1.loadFromSlot)(action.payload.slotId);
                if (!loadedState) {
                    return {
                        ...state,
                        error: 'Failed to load from slot',
                        lastAction: action,
                    };
                }
                return {
                    ...state,
                    gameState: loadedState,
                    error: null,
                    lastAction: action,
                };
            }
            // Replay Actions
            case ActionType.CREATE_REPLAY: {
                if (!state.gameState)
                    return { ...state, error: 'No game state available' };
                const metadata = (0, gamestate_1.createReplay)(state.gameState, action.payload.playerNames);
                (0, gamestate_1.startReplayRecording)(metadata);
                return {
                    ...state,
                    error: null,
                    lastAction: action,
                };
            }
            case ActionType.ADD_REPLAY_EVENT: {
                (0, gamestate_1.addReplayEvent)(action.payload.event);
                return {
                    ...state,
                    error: null,
                    lastAction: action,
                };
            }
            default:
                return {
                    ...state,
                    lastAction: action,
                };
        }
    }
    catch (error) {
        console.error('Reducer error:', error);
        return {
            ...state,
            error: error instanceof Error ? error.message : 'Unknown error',
            lastAction: action,
        };
    }
}
// Selector Functions
exports.selectors = {
    getGameState: (state) => state.gameState,
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error,
    getLastAction: (state) => state.lastAction,
    getSelectedUnitId: (state) => state.gameState?.selectedUnitId || null,
    getCurrentPlayer: (state) => state.gameState?.currentPlayer || null,
    getPhase: (state) => state.gameState?.phase || null,
    getAvailableActions: (state) => {
        if (!state.gameState)
            return [];
        const actions = [];
        const selectedUnit = state.gameState.selectedUnitId
            ? (0, selectors_1.getUnitById)(state.gameState, state.gameState.selectedUnitId)
            : null;
        if (selectedUnit) {
            if ((0, selectors_1.canUnitMove)(selectedUnit))
                actions.push('move');
            if ((0, selectors_1.canUnitAttack)(selectedUnit))
                actions.push('attack');
            if ((0, selectors_1.canUseActiveAbility)(selectedUnit))
                actions.push('ability');
        }
        if ((0, selectors_1.hasAvailableActionsForCurrentPlayer)(state.gameState)) {
            actions.push('end_turn');
        }
        return actions;
    },
    getAttackableEnemies: (state) => {
        if (!state.gameState)
            return [];
        const selectedUnit = state.gameState.selectedUnitId
            ? (0, selectors_1.getUnitById)(state.gameState, state.gameState.selectedUnitId)
            : null;
        return selectedUnit ? (0, combat_1.getAttackableEnemies)(state.gameState, selectedUnit) : [];
    },
    getReachableTiles: (state) => {
        if (!state.gameState)
            return [];
        const selectedUnit = state.gameState.selectedUnitId
            ? (0, selectors_1.getUnitById)(state.gameState, state.gameState.selectedUnitId)
            : null;
        return selectedUnit ? (0, movement_1.calculateReachableTilesInState)(state.gameState, selectedUnit) : [];
    },
    getWinner: (state) => {
        if (!state.gameState)
            return null;
        return (0, gamestate_1.getWinner)(state.gameState);
    },
};
// Middleware for logging and debugging
const loggerMiddleware = (store) => (next) => (action) => {
    console.log('Dispatching action:', action);
    const result = next(action);
    console.log('Next state:', store.getState());
    return result;
};
exports.loggerMiddleware = loggerMiddleware;
// Utility function to create a reducer with middleware
function createGameStore(initialStateOverride) {
    const store = {
        state: { ...initialState, ...initialStateOverride },
        dispatch: (action) => {
            store.state = gameReducer(store.state, action);
            return action;
        },
        getState: () => store.state,
    };
    return store;
}
// Export types for use in other modules
// ReducerState is already exported as an interface above
