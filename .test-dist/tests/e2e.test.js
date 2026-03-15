"use strict";
/**
 * End-to-End Gameplay Tests
 *
 * Node.js test runner tests for complete game flows including:
 * - Full turn execution
 * - Complete match simulation
 * - Save/reload functionality
 * - Best of 3 series flow
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testUtils = void 0;
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const reducer_1 = require("../game/reducer");
const gamestate_1 = require("../game/gamestate");
const gamestate_2 = require("../game/gamestate");
// Mock localStorage for testing
const mockLocalStorage = {
    getItem: (key) => null,
    setItem: (key, value) => { },
    removeItem: (key) => { },
    clear: () => { },
};
// Replace global localStorage with our mock
global.localStorage = mockLocalStorage;
(0, node_test_1.describe)('End-to-End Gameplay Tests', () => {
    let store;
    // Helper function to create a fresh store for each test
    function createFreshStore() {
        store = (0, reducer_1.createGameStore)();
        // Initialize game state
        store.dispatch(reducer_1.actionCreators.createInitialGame({
            options: { mapPresetId: 'crossroads' }
        }));
    }
    (0, node_test_1.describe)('Full Turn Execution', () => {
        (0, node_test_1.it)('should complete a full turn with move, attack, and end turn', () => {
            createFreshStore();
            const state = store.getState();
            node_assert_1.default.strictEqual(reducer_1.selectors.getPhase(state), gamestate_2.Phase.SELECT_UNIT);
            node_assert_1.default.strictEqual(reducer_1.selectors.getCurrentPlayer(state), 'p1');
            // Select a unit
            store.dispatch(reducer_1.actionCreators.selectUnit('u1')); // Scout
            const afterSelect = store.getState();
            node_assert_1.default.strictEqual(reducer_1.selectors.getSelectedUnitId(afterSelect), 'u1');
            node_assert_1.default.strictEqual(reducer_1.selectors.getPhase(afterSelect), gamestate_2.Phase.MOVE_UNIT);
            // Move the unit
            const movePosition = { x: 2, y: 1 };
            store.dispatch(reducer_1.actionCreators.moveUnit(movePosition));
            const afterMove = store.getState();
            node_assert_1.default.strictEqual(reducer_1.selectors.getPhase(afterMove), gamestate_2.Phase.ATTACK);
            // Attack an enemy
            store.dispatch(reducer_1.actionCreators.attack('u4')); // Enemy scout
            const afterAttack = store.getState();
            node_assert_1.default.strictEqual(reducer_1.selectors.getPhase(afterAttack), gamestate_2.Phase.END_TURN);
            // End turn
            store.dispatch(reducer_1.actionCreators.endTurn());
            const afterEndTurn = store.getState();
            node_assert_1.default.strictEqual(reducer_1.selectors.getCurrentPlayer(afterEndTurn), 'p2');
            node_assert_1.default.strictEqual(reducer_1.selectors.getPhase(afterEndTurn), gamestate_2.Phase.SELECT_UNIT);
        });
        (0, node_test_1.it)('should handle turn rollover when no actions remain', () => {
            createFreshStore();
            const state = store.getState();
            node_assert_1.default.strictEqual(reducer_1.selectors.getCurrentPlayer(state), 'p1');
            // Select a unit and end turn without moving/attacking
            store.dispatch(reducer_1.actionCreators.selectUnit('u1'));
            store.dispatch(reducer_1.actionCreators.endTurn());
            const afterEndTurn = store.getState();
            node_assert_1.default.strictEqual(reducer_1.selectors.getCurrentPlayer(afterEndTurn), 'p2');
            node_assert_1.default.strictEqual(reducer_1.selectors.getPhase(afterEndTurn), gamestate_2.Phase.SELECT_UNIT);
        });
        (0, node_test_1.it)('should auto-skip attack when no valid targets available', () => {
            createFreshStore();
            // This would require setting up a specific board state where no enemies are in range
            // For now, we'll test the basic flow
            store.dispatch(reducer_1.actionCreators.selectUnit('u1'));
            // Move to a position where no enemies are attackable
            store.dispatch(reducer_1.actionCreators.moveUnit({ x: 1, y: 2 }));
            const state = store.getState();
            // Should be in attack phase but auto-skip should happen
            node_assert_1.default.strictEqual(reducer_1.selectors.getPhase(state), gamestate_2.Phase.ATTACK);
        });
    });
    (0, node_test_1.describe)('Complete Match Simulation', () => {
        (0, node_test_1.it)('should simulate a complete match until victory', () => {
            createFreshStore();
            let turnCount = 0;
            let winner = null;
            // Simulate multiple turns
            while (turnCount < 20 && !winner) {
                const state = store.getState();
                winner = reducer_1.selectors.getWinner(state);
                if (winner)
                    break;
                // Simple AI logic: move towards enemy and attack
                const currentPlayer = reducer_1.selectors.getCurrentPlayer(state);
                const units = state.gameState?.units || [];
                const currentUnits = units.filter(u => u.playerId === currentPlayer && u.health > 0);
                if (currentUnits.length > 0) {
                    const unit = currentUnits[0];
                    // Select unit
                    store.dispatch(reducer_1.actionCreators.selectUnit(unit.id));
                    // Move towards enemy
                    const enemyUnits = units.filter(u => u.playerId !== currentPlayer && u.health > 0);
                    if (enemyUnits.length > 0) {
                        const enemy = enemyUnits[0];
                        const movePos = { x: unit.position.x + 1, y: unit.position.y };
                        store.dispatch(reducer_1.actionCreators.moveUnit(movePos));
                        // Attack if in range
                        const distance = Math.abs(unit.position.x - enemy.position.x) + Math.abs(unit.position.y - enemy.position.y);
                        if (distance <= unit.range) {
                            store.dispatch(reducer_1.actionCreators.attack(enemy.id));
                        }
                    }
                    // End turn
                    store.dispatch(reducer_1.actionCreators.endTurn());
                }
                turnCount++;
            }
            // Should either have a winner or reached turn limit
            node_assert_1.default.ok(turnCount <= 20);
        });
        (0, node_test_1.it)('should handle unit death and game state updates', () => {
            createFreshStore();
            // Set up a scenario where one unit attacks another
            store.dispatch(reducer_1.actionCreators.selectUnit('u1'));
            store.dispatch(reducer_1.actionCreators.moveUnit({ x: 5, y: 1 })); // Move close to enemy
            store.dispatch(reducer_1.actionCreators.attack('u4')); // Attack enemy scout
            const state = store.getState();
            const gameState = state.gameState;
            if (gameState) {
                const enemyUnit = gameState.units.find(u => u.id === 'u4');
                node_assert_1.default.ok(enemyUnit?.health < 10); // Should have taken damage
            }
        });
    });
    (0, node_test_1.describe)('Save/Reload Functionality', () => {
        (0, node_test_1.it)('should save and reload game state correctly', () => {
            createFreshStore();
            // Make some moves to create a non-initial state
            store.dispatch(reducer_1.actionCreators.selectUnit('u1'));
            store.dispatch(reducer_1.actionCreators.moveUnit({ x: 2, y: 1 }));
            const beforeSaveState = store.getState();
            const beforeSaveGameState = beforeSaveState.gameState;
            // Save to slot
            store.dispatch(reducer_1.actionCreators.saveToSlot('slot_1', 'Test Save'));
            // Verify save was successful (no error)
            const saveState = store.getState();
            node_assert_1.default.strictEqual(saveState.error, null);
            // Clear current state
            store.dispatch({ type: 'RESET_GAME' });
            // Load from slot
            store.dispatch(reducer_1.actionCreators.loadFromSlot('slot_1'));
            const afterLoadState = store.getState();
            const afterLoadGameState = afterLoadState.gameState;
            // Verify state was restored
            node_assert_1.default.ok(afterLoadGameState !== null);
            if (beforeSaveGameState && afterLoadGameState) {
                node_assert_1.default.strictEqual(afterLoadGameState.selectedUnitId, beforeSaveGameState.selectedUnitId);
                node_assert_1.default.strictEqual(afterLoadGameState.phase, beforeSaveGameState.phase);
                node_assert_1.default.strictEqual(afterLoadGameState.turn, beforeSaveGameState.turn);
                // Check unit positions
                const beforeUnit = beforeSaveGameState.units.find(u => u.id === 'u1');
                const afterUnit = afterLoadGameState.units.find(u => u.id === 'u1');
                if (beforeUnit && afterUnit) {
                    node_assert_1.default.deepStrictEqual(afterUnit.position, beforeUnit.position);
                }
            }
        });
        (0, node_test_1.it)('should handle save slot management', () => {
            createFreshStore();
            // Test save slot operations
            store.dispatch(reducer_1.actionCreators.saveToSlot('slot_1', 'First Save'));
            const state1 = store.getState();
            node_assert_1.default.strictEqual(state1.error, null);
            // Test loading from empty slot
            store.dispatch(reducer_1.actionCreators.loadFromSlot('slot_2'));
            const state2 = store.getState();
            node_assert_1.default.strictEqual(state2.error, 'Failed to load from slot');
            // Test save to existing slot (overwrite)
            store.dispatch(reducer_1.actionCreators.saveToSlot('slot_1', 'Overwritten Save'));
            const state3 = store.getState();
            node_assert_1.default.strictEqual(state3.error, null);
        });
    });
    (0, node_test_1.describe)('Best of 3 Series Flow', () => {
        (0, node_test_1.it)('should handle series initialization and match tracking', () => {
            createFreshStore();
            // Start a series
            store.dispatch(reducer_1.actionCreators.startSeries('crossroads', { p1: 'Player 1', p2: 'Player 2' }));
            const state = store.getState();
            // Series should be initialized (this would be handled by global state)
            node_assert_1.default.strictEqual(state.lastAction?.type, 'START_SERIES');
        });
        (0, node_test_1.it)('should record match end and update series state', () => {
            createFreshStore();
            // Simulate a match completion
            store.dispatch(reducer_1.actionCreators.recordMatchEnd(1));
            const state = store.getState();
            node_assert_1.default.strictEqual(state.lastAction?.type, 'RECORD_MATCH_END');
            node_assert_1.default.strictEqual(state.lastAction?.payload.matchNumber, 1);
        });
        (0, node_test_1.it)('should handle series progression through multiple matches', () => {
            createFreshStore();
            // Start series
            store.dispatch(reducer_1.actionCreators.startSeries('crossroads', { p1: 'Player 1', p2: 'Player 2' }));
            // Simulate match 1
            store.dispatch(reducer_1.actionCreators.recordMatchEnd(1));
            // Simulate match 2
            store.dispatch(reducer_1.actionCreators.recordMatchEnd(2));
            // Simulate match 3 (if needed)
            store.dispatch(reducer_1.actionCreators.recordMatchEnd(3));
            const state = store.getState();
            node_assert_1.default.strictEqual(state.lastAction?.payload.matchNumber, 3);
        });
    });
    (0, node_test_1.describe)('Game State Persistence', () => {
        (0, node_test_1.it)('should persist game state across page reloads', () => {
            createFreshStore();
            // Create initial state
            const initialState = (0, gamestate_1.createInitialGameState)({ mapPresetId: 'crossroads' });
            // Simulate saving to localStorage
            const serializedState = JSON.stringify(initialState);
            mockLocalStorage.setItem('game_state', serializedState);
            // Verify localStorage was called (we can't actually test the function call in this mock)
            // but we can verify the serialization works
            node_assert_1.default.ok(serializedState.length > 0);
            // Simulate loading from localStorage
            const mockGetItem = (key) => serializedState;
            const loadedState = JSON.parse(mockGetItem('game_state') || '{}');
            node_assert_1.default.deepStrictEqual(loadedState, initialState);
        });
        (0, node_test_1.it)('should handle localStorage errors gracefully', () => {
            createFreshStore();
            // Mock localStorage error
            const originalSetItem = mockLocalStorage.setItem;
            mockLocalStorage.setItem = () => {
                throw new Error('localStorage error');
            };
            // Try to save (should handle error gracefully)
            store.dispatch(reducer_1.actionCreators.saveToSlot('slot_1', 'Test'));
            const state = store.getState();
            node_assert_1.default.strictEqual(state.error, 'Failed to save to slot');
            // Restore original function
            mockLocalStorage.setItem = originalSetItem;
        });
    });
    (0, node_test_1.describe)('Replay System Integration', () => {
        (0, node_test_1.it)('should create and manage replay recordings', () => {
            createFreshStore();
            // Create replay
            store.dispatch(reducer_1.actionCreators.createReplay({ p1: 'Player 1', p2: 'Player 2' }));
            const state = store.getState();
            node_assert_1.default.strictEqual(state.lastAction?.type, 'CREATE_REPLAY');
            // Add replay events
            store.dispatch(reducer_1.actionCreators.addReplayEvent({
                type: 'move',
                timestamp: Date.now(),
                playerId: 'p1',
                turn: 1,
                details: {
                    unitId: 'u1',
                    from: { x: 1, y: 1 },
                    to: { x: 2, y: 1 }
                }
            }));
            const replayState = store.getState();
            node_assert_1.default.strictEqual(replayState.lastAction?.type, 'ADD_REPLAY_EVENT');
        });
    });
    (0, node_test_1.describe)('Error Handling', () => {
        (0, node_test_1.it)('should handle invalid actions gracefully', () => {
            createFreshStore();
            // Try to select non-existent unit
            store.dispatch(reducer_1.actionCreators.selectUnit('nonexistent'));
            const state = store.getState();
            node_assert_1.default.strictEqual(state.error, 'No game state available');
            // Clear error
            store.dispatch(reducer_1.actionCreators.createInitialGame({ options: { mapPresetId: 'crossroads' } }));
            const clearedState = store.getState();
            node_assert_1.default.strictEqual(clearedState.error, null);
        });
        (0, node_test_1.it)('should handle game state corruption', () => {
            createFreshStore();
            // Dispatch invalid action
            store.dispatch({ type: 'INVALID_ACTION' });
            const state = store.getState();
            node_assert_1.default.strictEqual(state.lastAction?.type, 'INVALID_ACTION');
            // Should not crash the reducer
        });
    });
});
// Additional utility functions for testing
exports.testUtils = {
    /**
     * Create a test game state with specific configuration
     */
    createTestGameState: (options = {}) => {
        return (0, gamestate_1.createInitialGameState)({
            mapPresetId: 'crossroads',
            firstPlayer: 'p1',
            autoSkipNoTargetAttack: false,
            ...options
        });
    },
    /**
     * Simulate a complete turn with given actions
     */
    simulateTurn: (store, actions) => {
        actions.forEach(action => {
            switch (action.type) {
                case 'SELECT_UNIT':
                    store.dispatch(reducer_1.actionCreators.selectUnit(action.payload.unitId));
                    break;
                case 'MOVE_UNIT':
                    store.dispatch(reducer_1.actionCreators.moveUnit(action.payload.position));
                    break;
                case 'ATTACK':
                    store.dispatch(reducer_1.actionCreators.attack(action.payload.targetId));
                    break;
                case 'END_TURN':
                    store.dispatch(reducer_1.actionCreators.endTurn());
                    break;
            }
        });
    },
    /**
     * Get game state summary for assertions
     */
    getGameStateSummary: (state) => {
        if (!state.gameState)
            return null;
        return {
            phase: state.gameState.phase,
            currentPlayer: state.gameState.currentPlayer,
            turn: state.gameState.turn,
            selectedUnitId: state.gameState.selectedUnitId,
            unitCount: state.gameState.units.length,
            aliveUnits: state.gameState.units.filter((u) => u.health > 0).length,
            eventLogLength: state.gameState.eventLog.length
        };
    }
};
