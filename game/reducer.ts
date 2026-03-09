/**
 * Game State Reducer
 * 
 * Implements explicit action reducer pattern for easier testing and persistence.
 * Provides predictable state transitions and better separation of concerns.
 */

import type { GameState, AttackResolution, GameEvent } from './gamestate'
import type { PlayerId, Position, UnitArchetype } from './config'
import {
    selectUnit,
    deselectUnit,
    moveSelectedUnit,
    undoSelectedUnitMove,
    endTurn,
    finishAttackSequence,
    skipAttackForSelectedUnit,
    useActiveAbilityForSelectedUnit,
    attackUnit,
    getWinner,
    createInitialGameState,
    endMatch,
    getCurrentSeries,
    getSeriesHistory,
    getQuickRematchOptions,
    clearSeriesHistory,
    saveToSlot,
    loadFromSlot,
    getAllSaveSlotSummaries,
    deleteSaveSlot,
    renameSaveSlot,
    saveSlotExists,
    getUsedSaveSlotCount,
    getAvailableSaveSlotIds,
    clearAllSaveSlots,
    exportAllSaveSlots,
    importSaveSlots,
    quickSave,
    createReplay,
    startReplayRecording,
    stopReplayRecording,
    addReplayEvent,
    getAvailableReplays,
    loadReplay,
    startReplayPlayback,
    stopReplayPlayback,
    setReplayPlaybackSpeed,
    getCurrentReplay,
    exportReplay,
    importReplay,
    deleteReplay,
    clearAllReplays,
} from './gamestate'
import { Phase } from './gamestate'
import { calculateAttackableTilesInState, getAttackableEnemies } from './rules/combat'
import { calculateReachableTilesInState } from './rules/movement'
import { canUnitAttack, canUnitMove, canUseActiveAbility, getUnitById, hasAvailableActionsForCurrentPlayer, isCurrentPlayersUnit } from './selectors'

// Action Types
export enum ActionType {
    // Core Game Actions
    SELECT_UNIT = 'SELECT_UNIT',
    DESELECT_UNIT = 'DESELECT_UNIT',
    MOVE_UNIT = 'MOVE_UNIT',
    UNDO_MOVE = 'UNDO_MOVE',
    ATTACK = 'ATTACK',
    SKIP_ATTACK = 'SKIP_ATTACK',
    USE_ABILITY = 'USE_ABILITY',
    END_TURN = 'END_TURN',
    FINISH_ATTACK_SEQUENCE = 'FINISH_ATTACK_SEQUENCE',
    
    // Series Actions
    START_SERIES = 'START_SERIES',
    RECORD_MATCH_END = 'RECORD_MATCH_END',
    GET_SERIES_HISTORY = 'GET_SERIES_HISTORY',
    GET_QUICK_REMATCH_OPTIONS = 'GET_QUICK_REMATCH_OPTIONS',
    CLEAR_SERIES_HISTORY = 'CLEAR_SERIES_HISTORY',
    
    // Save Actions
    SAVE_TO_SLOT = 'SAVE_TO_SLOT',
    LOAD_FROM_SLOT = 'LOAD_FROM_SLOT',
    DELETE_SAVE_SLOT = 'DELETE_SAVE_SLOT',
    RENAME_SAVE_SLOT = 'RENAME_SAVE_SLOT',
    QUICK_SAVE = 'QUICK_SAVE',
    EXPORT_ALL_SAVE_SLOTS = 'EXPORT_ALL_SAVE_SLOTS',
    IMPORT_SAVE_SLOTS = 'IMPORT_SAVE_SLOTS',
    
    // Replay Actions
    CREATE_REPLAY = 'CREATE_REPLAY',
    START_REPLAY_RECORDING = 'START_REPLAY_RECORDING',
    STOP_REPLAY_RECORDING = 'STOP_REPLAY_RECORDING',
    ADD_REPLAY_EVENT = 'ADD_REPLAY_EVENT',
    START_REPLAY_PLAYBACK = 'START_REPLAY_PLAYBACK',
    STOP_REPLAY_PLAYBACK = 'STOP_REPLAY_PLAYBACK',
    SET_REPLAY_PLAYBACK_SPEED = 'SET_REPLAY_PLAYBACK_SPEED',
    EXPORT_REPLAY = 'EXPORT_REPLAY',
    IMPORT_REPLAY = 'IMPORT_REPLAY',
    DELETE_REPLAY = 'DELETE_REPLAY',
    
    // System Actions
    CREATE_INITIAL_GAME = 'CREATE_INITIAL_GAME',
    RESET_GAME = 'RESET_GAME',
}

// Action Interfaces
export interface Action {
    type: ActionType;
    payload?: any;
    meta?: {
        timestamp?: number;
        playerId?: PlayerId;
        turn?: number;
    };
}

// Core Game Actions
export interface SelectUnitAction extends Action {
    type: ActionType.SELECT_UNIT;
    payload: {
        unitId: string;
    };
}

export interface MoveUnitAction extends Action {
    type: ActionType.MOVE_UNIT;
    payload: {
        position: Position;
    };
}

export interface AttackAction extends Action {
    type: ActionType.ATTACK;
    payload: {
        targetId: string;
    };
}

export interface UseAbilityAction extends Action {
    type: ActionType.USE_ABILITY;
}

export interface EndTurnAction extends Action {
    type: ActionType.END_TURN;
}

// Series Actions
export interface StartSeriesAction extends Action {
    type: ActionType.START_SERIES;
    payload: {
        mapPresetId: string;
        playerNames: { p1: string; p2: string };
    };
}

export interface RecordMatchEndAction extends Action {
    type: ActionType.RECORD_MATCH_END;
    payload: {
        matchNumber: number;
    };
}

// Save Actions
export interface SaveToSlotAction extends Action {
    type: ActionType.SAVE_TO_SLOT;
    payload: {
        slotId: string;
        customName?: string;
    };
}

export interface LoadFromSlotAction extends Action {
    type: ActionType.LOAD_FROM_SLOT;
    payload: {
        slotId: string;
    };
}

// Replay Actions
export interface CreateReplayAction extends Action {
    type: ActionType.CREATE_REPLAY;
    payload: {
        playerNames: { p1: string; p2: string };
    };
}

export interface AddReplayEventAction extends Action {
    type: ActionType.ADD_REPLAY_EVENT;
    payload: {
        event: any; // ReplayEvent type
    };
}

// System Actions
export interface CreateInitialGameAction extends Action {
    type: ActionType.CREATE_INITIAL_GAME;
    payload: {
        options?: any; // InitialGameOptions
    };
}

// Action Creators
export const actionCreators = {
    // Core Game Actions
    selectUnit: (unitId: string): SelectUnitAction => ({
        type: ActionType.SELECT_UNIT,
        payload: { unitId },
        meta: { timestamp: Date.now() }
    }),
    
    deselectUnit: (): Action => ({
        type: ActionType.DESELECT_UNIT,
        meta: { timestamp: Date.now() }
    }),
    
    moveUnit: (position: Position): MoveUnitAction => ({
        type: ActionType.MOVE_UNIT,
        payload: { position },
        meta: { timestamp: Date.now() }
    }),
    
    attack: (targetId: string): AttackAction => ({
        type: ActionType.ATTACK,
        payload: { targetId },
        meta: { timestamp: Date.now() }
    }),
    
    useAbility: (): UseAbilityAction => ({
        type: ActionType.USE_ABILITY,
        meta: { timestamp: Date.now() }
    }),
    
    endTurn: (): EndTurnAction => ({
        type: ActionType.END_TURN,
        meta: { timestamp: Date.now() }
    }),
    
    // Series Actions
    startSeries: (mapPresetId: string, playerNames: { p1: string; p2: string }): StartSeriesAction => ({
        type: ActionType.START_SERIES,
        payload: { mapPresetId, playerNames },
        meta: { timestamp: Date.now() }
    }),
    
    recordMatchEnd: (matchNumber: number): RecordMatchEndAction => ({
        type: ActionType.RECORD_MATCH_END,
        payload: { matchNumber },
        meta: { timestamp: Date.now() }
    }),
    
    // Save Actions
    saveToSlot: (slotId: string, customName?: string): SaveToSlotAction => ({
        type: ActionType.SAVE_TO_SLOT,
        payload: { slotId, customName },
        meta: { timestamp: Date.now() }
    }),
    
    loadFromSlot: (slotId: string): LoadFromSlotAction => ({
        type: ActionType.LOAD_FROM_SLOT,
        payload: { slotId },
        meta: { timestamp: Date.now() }
    }),
    
    // Replay Actions
    createReplay: (playerNames: { p1: string; p2: string }): CreateReplayAction => ({
        type: ActionType.CREATE_REPLAY,
        payload: { playerNames },
        meta: { timestamp: Date.now() }
    }),
    
    addReplayEvent: (event: any): AddReplayEventAction => ({
        type: ActionType.ADD_REPLAY_EVENT,
        payload: { event },
        meta: { timestamp: Date.now() }
    }),
    
    // System Actions
    createInitialGame: (options?: any): CreateInitialGameAction => ({
        type: ActionType.CREATE_INITIAL_GAME,
        payload: { options },
        meta: { timestamp: Date.now() }
    }),
};

// Reducer State Interface
export interface ReducerState {
    gameState: GameState | null;
    isLoading: boolean;
    error: string | null;
    lastAction: Action | null;
}

// Initial State
const initialState: ReducerState = {
    gameState: null,
    isLoading: false,
    error: null,
    lastAction: null,
};

// Helper function to create replay events
function createReplayEvent(action: Action, gameState: GameState): any | null {
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
            const selectedUnit = gameState.selectedUnitId ? getUnitById(gameState, gameState.selectedUnitId) : null;
            if (!selectedUnit) return null;
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
            const attacker = gameState.selectedUnitId ? getUnitById(gameState, gameState.selectedUnitId) : null;
            if (!attacker) return null;
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
            const unit = gameState.selectedUnitId ? getUnitById(gameState, gameState.selectedUnitId) : null;
            if (!unit) return null;
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
export function gameReducer(state: ReducerState = initialState, action: Action): ReducerState {
    try {
        switch (action.type) {
            // System Actions
            case ActionType.CREATE_INITIAL_GAME: {
                const gameState = createInitialGameState(action.payload.options);
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
                if (!state.gameState) return { ...state, error: 'No game state available' };
                
                const newState = selectUnit(state.gameState, action.payload.unitId);
                
                // Add replay event if recording
                if (getCurrentReplay()) {
                    const replayEvent = createReplayEvent(action, newState);
                    if (replayEvent) {
                        addReplayEvent(replayEvent);
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
                if (!state.gameState) return { ...state, error: 'No game state available' };
                
                const newState = deselectUnit(state.gameState);
                
                return {
                    ...state,
                    gameState: newState,
                    error: null,
                    lastAction: action,
                };
            }

            case ActionType.MOVE_UNIT: {
                if (!state.gameState) return { ...state, error: 'No game state available' };
                
                const newState = moveSelectedUnit(state.gameState, action.payload.position);
                
                // Add replay event if recording
                if (getCurrentReplay()) {
                    const replayEvent = createReplayEvent(action, state.gameState);
                    if (replayEvent) {
                        addReplayEvent(replayEvent);
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
                if (!state.gameState) return { ...state, error: 'No game state available' };
                
                const newState = attackUnit(state.gameState, action.payload.targetId);
                
                // Add replay event if recording
                if (getCurrentReplay()) {
                    const replayEvent = createReplayEvent(action, state.gameState);
                    if (replayEvent) {
                        addReplayEvent(replayEvent);
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
                if (!state.gameState) return { ...state, error: 'No game state available' };
                
                const newState = useActiveAbilityForSelectedUnit(state.gameState);
                
                // Add replay event if recording
                if (getCurrentReplay()) {
                    const replayEvent = createReplayEvent(action, state.gameState);
                    if (replayEvent) {
                        addReplayEvent(replayEvent);
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
                if (!state.gameState) return { ...state, error: 'No game state available' };
                
                const newState = endTurn(state.gameState);
                
                // Add replay event if recording
                if (getCurrentReplay()) {
                    const replayEvent = createReplayEvent(action, state.gameState);
                    if (replayEvent) {
                        addReplayEvent(replayEvent);
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
                if (!state.gameState) return { ...state, error: 'No game state available' };
                
                const newState = endMatch(state.gameState, action.payload.matchNumber);
                
                return {
                    ...state,
                    gameState: newState,
                    error: null,
                    lastAction: action,
                };
            }

            // Save Actions
            case ActionType.SAVE_TO_SLOT: {
                if (!state.gameState) return { ...state, error: 'No game state available' };
                
                const success = saveToSlot(
                    action.payload.slotId, 
                    state.gameState, 
                    action.payload.customName
                );
                
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
                const loadedState = loadFromSlot(action.payload.slotId);
                
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
                if (!state.gameState) return { ...state, error: 'No game state available' };
                
                const metadata = createReplay(state.gameState, action.payload.playerNames);
                startReplayRecording(metadata);
                
                return {
                    ...state,
                    error: null,
                    lastAction: action,
                };
            }

            case ActionType.ADD_REPLAY_EVENT: {
                addReplayEvent(action.payload.event);
                
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
    } catch (error) {
        console.error('Reducer error:', error);
        return {
            ...state,
            error: error instanceof Error ? error.message : 'Unknown error',
            lastAction: action,
        };
    }
}

// Selector Functions
export const selectors = {
    getGameState: (state: ReducerState): GameState | null => state.gameState,
    getIsLoading: (state: ReducerState): boolean => state.isLoading,
    getError: (state: ReducerState): string | null => state.error,
    getLastAction: (state: ReducerState): Action | null => state.lastAction,
    getSelectedUnitId: (state: ReducerState): string | null => 
        state.gameState?.selectedUnitId || null,
    getCurrentPlayer: (state: ReducerState): PlayerId | null => 
        state.gameState?.currentPlayer || null,
    getPhase: (state: ReducerState): Phase | null => 
        state.gameState?.phase || null,
    getAvailableActions: (state: ReducerState): string[] => {
        if (!state.gameState) return [];
        
        const actions: string[] = [];
        const selectedUnit = state.gameState.selectedUnitId 
            ? getUnitById(state.gameState, state.gameState.selectedUnitId) 
            : null;
        
        if (selectedUnit) {
            if (canUnitMove(selectedUnit)) actions.push('move');
            if (canUnitAttack(selectedUnit)) actions.push('attack');
            if (canUseActiveAbility(selectedUnit)) actions.push('ability');
        }
        
        if (hasAvailableActionsForCurrentPlayer(state.gameState)) {
            actions.push('end_turn');
        }
        
        return actions;
    },
    getAttackableEnemies: (state: ReducerState): readonly any[] => {
        if (!state.gameState) return [];
        
        const selectedUnit = state.gameState.selectedUnitId 
            ? getUnitById(state.gameState, state.gameState.selectedUnitId) 
            : null;
        
        return selectedUnit ? getAttackableEnemies(state.gameState, selectedUnit) : [];
    },
    getReachableTiles: (state: ReducerState): readonly Position[] => {
        if (!state.gameState) return [];
        
        const selectedUnit = state.gameState.selectedUnitId 
            ? getUnitById(state.gameState, state.gameState.selectedUnitId) 
            : null;
        
        return selectedUnit ? calculateReachableTilesInState(state.gameState, selectedUnit) : [];
    },
    getWinner: (state: ReducerState): PlayerId | null => {
        if (!state.gameState) return null;
        return getWinner(state.gameState);
    },
};

// Middleware for logging and debugging
export const loggerMiddleware = (store: any) => (next: any) => (action: Action) => {
    console.log('Dispatching action:', action);
    const result = next(action);
    console.log('Next state:', store.getState());
    return result;
};

// Utility function to create a reducer with middleware
export function createGameStore(initialStateOverride?: Partial<ReducerState>) {
    const store = {
        state: { ...initialState, ...initialStateOverride },
        dispatch: (action: Action) => {
            store.state = gameReducer(store.state, action);
            return action;
        },
        getState: () => store.state,
    };
    
    return store;
}

// Export types for use in other modules
// ReducerState is already exported as an interface above
